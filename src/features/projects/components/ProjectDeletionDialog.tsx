"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  useDeleteProjectMutation,
  useRetryProjectDeletionMutation,
} from "../queries/projects.queries";
import { Project } from "../types/projects.types";

interface ProjectDeletionDialogProps {
  project: Pick<Project, "id" | "name" | "_count">;
}

export function ProjectDeletionDialog({ project }: ProjectDeletionDialogProps) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isRetry, setIsRetry] = useState(false);

  const deleteMutation = useDeleteProjectMutation();
  const retryMutation = useRetryProjectDeletionMutation();

  const isBusy = deleteMutation.isPending || retryMutation.isPending;

  if (!user?.roles?.includes("owner")) {
    return null;
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isBusy) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setIsRetry(false);
      setPassword("");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password.trim() || isBusy) return;

    try {
      const result = isRetry
        ? await retryMutation.mutateAsync({ id: project.id, password })
        : await deleteMutation.mutateAsync({ id: project.id, password });

      if (result.state === "COMPLETED") {
        toast.success("Proyek dan seluruh data terkait berhasil dihapus.");
        setOpen(false);
        router.replace("/projects");
        return;
      }

      setIsRetry(true);
      setPassword("");
      toast.error(
        `Penghapusan belum tuntas. Terdapat ${result.remaining} file menunggu pembersihan. Masukkan password Owner untuk melanjutkan.`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memproses penghapusan proyek."
      );
    }
  };

  const count = project._count || {};
  const dataSummary = [
    `${count.tasks ?? 0} task`,
    `${count.sprints ?? 0} sprint`,
    `${count.payments ?? 0} pembayaran`,
    `${count.paymentTerms ?? 0} termin`,
    `${count.assets ?? 0} aset`,
    `${count.prdVersions ?? 0} versi PRD`,
    `${count.storedFiles ?? 0} file privat`,
  ].join(", ");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="rounded-xl text-xs h-9 px-3 gap-1.5"
        >
          <HugeiconsIcon icon={Delete02Icon} className="size-3.5" aria-hidden="true" />
          Hapus Proyek
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-1">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-5" aria-hidden="true" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              {isRetry ? "Lanjutkan Pembersihan Proyek?" : "Hapus Proyek Secara Permanen?"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Proyek <strong className="text-foreground">{project.name}</strong> beserta seluruh data
              operasional dan lampirannya ({dataSummary}) akan dihapus secara permanen. Tautan repo
              eksternal tidak ikut dihapus. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5 pt-1">
            <Label htmlFor="owner-delete-password" className="text-xs font-medium text-foreground">
              Konfirmasi Password Akun Owner <span className="text-destructive">*</span>
            </Label>
            <Input
              id="owner-delete-password"
              type="password"
              autoComplete="current-password"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isBusy}
              className="rounded-xl text-base md:text-sm h-10"
              autoFocus
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isBusy}
              className="rounded-xl text-xs h-10 px-4"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isBusy || !password.trim()}
              className="rounded-xl text-xs h-10 px-4 font-semibold"
            >
              {isBusy ? (
                <>
                  <Spinner className="size-3.5 mr-1.5" />
                  Memproses...
                </>
              ) : isRetry ? (
                "Lanjutkan Cleanup"
              ) : (
                "Hapus Proyek Permanen"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
