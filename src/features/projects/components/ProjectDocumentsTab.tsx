"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File02Icon,
  Upload04Icon,
  Download04Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useMyPermissionsQuery } from "@/features/auth";
import {
  uploadPrivateFile,
  resolvePrivateFileUrl,
} from "@/shared/lib/private-file-upload";
import {
  usePrdVersionsQuery,
  useCreatePrdVersionMutation,
} from "../queries/projects.queries";
import { ProjectRepositoriesCard } from "./ProjectRepositoriesCard";

interface ProjectDocumentsTabProps {
  projectId: string;
}

export function ProjectDocumentsTab({ projectId }: ProjectDocumentsTabProps) {
  const [busy, setBusy] = useState(false);
  const [description, setDescription] = useState("");

  const { data: permissions = [] } = useMyPermissionsQuery();
  const canWritePrd = permissions.includes("prd.write");

  const { data: versions = [], isLoading } = usePrdVersionsQuery(projectId);
  const createPrdMutation = useCreatePrdVersionMutation(projectId);

  const handleFileUpload = async (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Format berkas harus berupa file PDF.");
      return;
    }

    setBusy(true);
    try {
      const session = await uploadPrivateFile(file, {
        category: "PRD",
        projectId,
        description: description.trim() || undefined,
      });

      await createPrdMutation.mutateAsync(session.sessionId);
      setDescription("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah dokumen PRD.");
    } finally {
      setBusy(false);
    }
  };

  const isUploading = busy || createPrdMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Kartu Repositori Proyek */}
      <ProjectRepositoriesCard projectId={projectId} />

      {/* Bagian Dokumen PRD */}
      <section
        aria-labelledby="prd-documents-heading"
        className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <h2 id="prd-documents-heading" className="text-base font-bold text-foreground">
              Dokumen Spesifikasi Produk (PRD)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              File PDF privat dengan riwayat versi permanen (*immutable versioning*).
            </p>
          </div>

          {canWritePrd && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Catatan versi (opsional)"
                disabled={isUploading}
                aria-label="Catatan versi PRD"
                className="rounded-xl text-base md:text-sm h-10 w-full sm:w-64"
              />
              <label className="shrink-0 inline-flex">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={isUploading}
                  onChange={(e) => {
                    void handleFileUpload(e.target.files?.[0]);
                    e.currentTarget.value = "";
                  }}
                  className="sr-only"
                />
                <Button
                  type="button"
                  asChild
                  disabled={isUploading}
                  className="rounded-xl text-xs h-10 px-4 font-semibold cursor-pointer w-full sm:w-auto"
                >
                  <span>
                    {isUploading ? (
                      <>
                        <Spinner className="size-3.5 mr-1.5" />
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={Upload04Icon} className="size-4 mr-1.5" aria-hidden="true" />
                        Unggah Versi PDF
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>

        {/* Daftar Versi PRD */}
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <Spinner className="size-5 text-primary" />
            <p className="text-xs text-muted-foreground">Memuat daftar dokumen...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="py-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border/80">
            <div className="size-10 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-2">
              <HugeiconsIcon icon={File02Icon} className="size-5" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold text-foreground">Belum ada versi dokumen PRD</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Unggah berkas PDF untuk mengunci kontrak spesifikasi proyek.
            </p>
          </div>
        ) : (
          <ol className="divide-y divide-border/60">
            {versions.map((version, index) => {
              const isLatest = index === 0;
              const formattedDate = new Date(version.createdAt).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Jakarta",
              });
              const sizeMb = (version.sizeBytes / (1024 * 1024)).toFixed(1);

              return (
                <li
                  key={version.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        Versi {version.versionNumber}
                      </span>
                      {isLatest && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        >
                          Terbaru
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground font-mono">
                        · {version.fileName}
                      </span>
                    </div>

                    {version.description && (
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {version.description}
                      </p>
                    )}

                    <p className="text-[11px] text-muted-foreground">
                      {formattedDate} WIB · {sizeMb} MB
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 pt-1 sm:pt-0">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs h-9 px-3 gap-1.5 text-foreground hover:text-accent-foreground"
                    >
                      <a
                        href={resolvePrivateFileUrl(version.url)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <HugeiconsIcon icon={ViewIcon} className="size-3.5" aria-hidden="true" />
                        Lihat PDF
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs h-9 px-3 gap-1.5 text-foreground hover:text-accent-foreground"
                    >
                      <a
                        href={`${resolvePrivateFileUrl(version.url)}?mode=download`}
                        download={version.fileName}
                      >
                        <HugeiconsIcon icon={Download04Icon} className="size-3.5" aria-hidden="true" />
                        Unduh
                      </a>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
