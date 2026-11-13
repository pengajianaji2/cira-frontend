"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/shared/lib/api-client";
import { uploadPrivateFile, resolvePrivateFileUrl } from "@/shared/lib/private-file-upload";
import { useMyPermissionsQuery } from "@/features/auth";
import { ProjectRepositoriesCard } from "./ProjectRepositoriesCard";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type Version = { id: string; versionNumber: number; description?: string | null; createdAt: string; fileName: string; sizeBytes: number; url: string };
export function ProjectDocumentsTab({ projectId }: { projectId: string }) {
  const [busy, setBusy] = useState(false);
  const [description, setDescription] = useState("");
  const { data: permissions = [] } = useMyPermissionsQuery();
  const { data: versions = [], refetch } = useQuery({
    queryKey: ["projects", projectId, "prd-versions"],
    queryFn: async () => (await apiClient.get<{ data: Version[] }>(`/projects/${projectId}/prd/versions`)).data.data,
  });
  const upload = async (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Pilih file PDF."); return; }
    setBusy(true);
    try {
      const session = await uploadPrivateFile(file, { category: "PRD", projectId, description: description.trim() || undefined });
      await apiClient.post(`/projects/${projectId}/prd/versions`, { uploadSessionId: session.sessionId });
      await refetch(); setDescription(""); toast.success("Versi PRD disimpan secara privat.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Upload gagal."); }
    finally { setBusy(false); }
  };
  return <div className="space-y-5">
    <ProjectRepositoriesCard projectId={projectId} />
    <section className="rounded-2xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Dokumen PRD</h2><p className="text-sm text-muted-foreground">File PDF privat dengan riwayat versi immutable.</p></div>
        {permissions.includes("prd.write") && <div className="flex flex-col sm:flex-row gap-2"><Input value={description} onChange={(e)=>setDescription(e.target.value)} maxLength={500} placeholder="Catatan versi (opsional)" disabled={busy} aria-label="Catatan versi PRD"/><label className="cursor-pointer shrink-0"><input className="sr-only" type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(e)=>{void upload(e.target.files?.[0]);e.currentTarget.value="";}}/><span className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">{busy?"Mengunggah…":"Unggah PDF"}</span></label></div>}
      </div>
      {versions.length===0 ? <p className="text-sm text-muted-foreground">Belum ada versi PRD.</p> : <ol className="divide-y">{versions.map((v,index)=><li key={v.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-medium">Versi {v.versionNumber}{index===0?" · Terbaru":""} · {v.fileName}</p>{v.description&&<p className="text-sm text-muted-foreground">{v.description}</p>}<p className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString("id-ID")} · {(v.sizeBytes/1024/1024).toFixed(1)} MB</p></div><div className="flex gap-3"><a className="text-sm text-primary underline" href={resolvePrivateFileUrl(v.url)} target="_blank" rel="noreferrer">Lihat PDF</a><a className="text-sm text-primary underline" href={`${resolvePrivateFileUrl(v.url)}?mode=download`}>Unduh</a></div></li>)}</ol>}
    </section>
  </div>;
}
