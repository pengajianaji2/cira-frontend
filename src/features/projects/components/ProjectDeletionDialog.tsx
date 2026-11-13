"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { apiClient } from "@/shared/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

type Result = { state: string; remaining: number; counts: Record<string, number> | null };
export function ProjectDeletionDialog({ project }: { project: { id: string; name: string; _count?: Record<string, number> } }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(false);
  if (!user?.roles?.includes("owner")) return null;
  const submit = async () => {
    if (!password) return;
    setBusy(true);
    try {
      const response = retry
        ? await apiClient.post<{ data: Result }>(`/projects/${project.id}/deletion/retry`, { password })
        : await apiClient.delete<{ data: Result }>(`/projects/${project.id}`, { data: { password } });
      const result = response.data.data;
      if (result.state === "COMPLETED") { toast.success("Proyek dan file terkait berhasil dihapus."); setOpen(false); router.replace("/projects"); return; }
      setRetry(true); setPassword("");
      toast.error(`Penghapusan belum selesai. ${result.remaining} file menunggu cleanup. Masukkan password Owner untuk melanjutkan.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Penghapusan gagal."); }
    finally { setBusy(false); }
  };
  const count = project._count || {};
  const dataSummary = [
    `${count.tasks ?? 0} task`, `${count.sprints ?? 0} sprint`, `${count.payments ?? 0} pembayaran`,
    `${count.paymentTerms ?? 0} termin`, `${count.assets ?? 0} aset`, `${count.prdVersions ?? 0} versi PRD`,
    `${count.storedFiles ?? 0} file privat`,
  ].join(", ");
  return <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) { setRetry(false); setPassword(""); } }}>
    <DialogTrigger asChild><Button type="button" variant="destructive" size="sm">Hapus proyek</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader><DialogTitle>{retry ? "Lanjutkan penghapusan proyek?" : "Hapus proyek secara permanen?"}</DialogTitle><DialogDescription>Proyek <strong>{project.name}</strong> beserta data operasional dan lampirannya ({dataSummary}) akan dihapus. Tautan repo eksternal tidak ikut dihapus. Tindakan ini tidak dapat dibatalkan.</DialogDescription></DialogHeader>
      <label className="grid gap-2 text-sm">Password Owner<Input type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter")void submit();}} /></label>
      <DialogFooter><Button type="button" variant="outline" onClick={()=>setOpen(false)} disabled={busy}>Batal</Button><Button type="button" variant="destructive" onClick={()=>void submit()} disabled={busy||!password}>{busy?"Memproses…":retry?"Lanjutkan cleanup":"Hapus proyek"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
