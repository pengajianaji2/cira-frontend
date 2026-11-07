"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GitBranchIcon,
  LinkSquare02Icon,
  Copy01Icon,
  PlusSignIcon,
  Delete02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth";
import {
  useCreateRepositoryMutation,
  useDeleteRepositoryMutation,
  useRepositoriesQuery,
  useUpdateRepositoryMutation,
  useUpdateRepoTypeMutation,
} from "../queries/governance.queries";
import { ProjectRepoType, ProjectRepositoryLink } from "../types/governance.types";

interface ProjectRepositoriesCardProps {
  projectId: string;
}

export function ProjectRepositoriesCard({ projectId }: ProjectRepositoriesCardProps) {
  const { user } = useAuthStore();
  const { data, isLoading } = useRepositoriesQuery(projectId);

  const createRepoMutation = useCreateRepositoryMutation(projectId);
  const updateRepoMutation = useUpdateRepositoryMutation(projectId);
  const deleteRepoMutation = useDeleteRepositoryMutation(projectId);
  const updateRepoTypeMutation = useUpdateRepoTypeMutation(projectId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRepo, setEditingRepo] = useState<ProjectRepositoryLink | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const userRoles = (user?.roles || []).map((r) => r.toLowerCase());
  const canManage = userRoles.includes("owner") || userRoles.includes("developer");

  const repoType = data?.repoType || "monorepo";
  const repositories = data?.repositories || [];

  const handleOpenAddDialog = () => {
    setEditingRepo(null);
    setLabel("");
    setUrl("");
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (repo: ProjectRepositoryLink) => {
    setEditingRepo(repo);
    setLabel(repo.label);
    setUrl(repo.url);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;

    if (editingRepo) {
      updateRepoMutation.mutate(
        {
          repoId: editingRepo.id,
          payload: { label: label.trim(), url: url.trim() },
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
          },
        }
      );
    } else {
      createRepoMutation.mutate(
        {
          label: label.trim(),
          url: url.trim(),
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
          },
        }
      );
    }
  };

  const handleDelete = (repoId: string, repoLabel: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus tautan repositori "${repoLabel}"?`)) {
      deleteRepoMutation.mutate(repoId);
    }
  };

  const handleCopy = (repoUrl: string) => {
    navigator.clipboard.writeText(repoUrl);
    toast.success("URL Repositori Disalin ke Clipboard");
  };

  const handleToggleRepoType = (nextType: ProjectRepoType) => {
    if (!canManage || nextType === repoType) return;
    updateRepoTypeMutation.mutate(nextType);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
        {/* Header with Switcher & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={GitBranchIcon} className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Tautan Repositori Proyek
              </h2>
              <p className="text-xs text-muted-foreground">
                Arsitektur kode sumber ({repoType === "monorepo" ? "Monorepo" : "Repositori Terpisah"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Repo Type Toggle */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-full text-[11px] border border-border">
              <button
                type="button"
                onClick={() => handleToggleRepoType("monorepo")}
                disabled={!canManage || updateRepoTypeMutation.isPending}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  repoType === "monorepo"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                } ${!canManage ? "cursor-default" : "cursor-pointer"}`}
              >
                Monorepo
              </button>
              <button
                type="button"
                onClick={() => handleToggleRepoType("separate")}
                disabled={!canManage || updateRepoTypeMutation.isPending}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  repoType === "separate"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                } ${!canManage ? "cursor-default" : "cursor-pointer"}`}
              >
                Repo Terpisah
              </button>
            </div>

            {canManage && (
              <Button
                size="sm"
                onClick={handleOpenAddDialog}
                className="rounded-full text-xs h-8 px-3.5 font-medium shadow-xs"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5 mr-1" />
                Tambah Link
              </Button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Spinner className="size-5 text-primary" />
          </div>
        ) : repositories.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-border/80 rounded-2xl bg-muted/20">
            <HugeiconsIcon icon={GitBranchIcon} className="size-8 text-muted-foreground/60 mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-foreground">Belum Ada Tautan Repositori</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm mx-auto">
              {canManage
                ? "Tambahkan URL repositori GitHub, GitLab, atau Git server lokal untuk tim pengembang."
                : "Belum ada tautan repositori yang didaftarkan oleh tim pengembang."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="bg-muted/30 border border-border hover:border-border/80 transition-colors rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-background">
                      {repo.label}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground truncate font-mono text-[11px] hover:text-foreground select-all">
                    {repo.url}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(repo.url)}
                    className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                    title="Salin URL"
                  >
                    <HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
                  </Button>

                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-7 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    title="Buka Repositori"
                  >
                    <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" />
                  </a>

                  {canManage && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditDialog(repo)}
                        className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                        title="Edit Tautan"
                      >
                        <HugeiconsIcon icon={Edit02Icon} className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(repo.id, repo.label)}
                        className="size-7 rounded-full text-destructive hover:bg-destructive/10"
                        title="Hapus Tautan"
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                {editingRepo ? "Edit Tautan Repositori" : "Tambah Tautan Repositori"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Tautan repositori dengan label spesifik memudahkan tim navigasi kode sumber.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 my-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Label Repositori <span className="text-destructive">*</span>
                </label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Misal: Frontend, Backend API, Mobile iOS, Repository Utama"
                  required
                  className="text-xs rounded-xl h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  URL Repositori <span className="text-destructive">*</span>
                </label>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/organization/repository"
                  required
                  className="text-xs rounded-xl h-9 font-mono"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-full text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createRepoMutation.isPending || updateRepoMutation.isPending || !label.trim() || !url.trim()}
                className="rounded-full text-xs font-semibold shadow-xs"
              >
                {createRepoMutation.isPending || updateRepoMutation.isPending ? (
                  <Spinner className="size-3 mr-1" />
                ) : null}
                {editingRepo ? "Simpan Perubahan" : "Tambah Repositori"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
