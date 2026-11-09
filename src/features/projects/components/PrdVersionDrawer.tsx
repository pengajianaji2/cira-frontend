"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  RotateLeft01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { governanceApi } from "../api/governance.api";
import {
  usePrdVersionsQuery,
  useRestorePrdVersionMutation,
} from "../queries/governance.queries";
import { PrdVersion } from "../types/governance.types";

interface PrdVersionDrawerProps {
  projectId: string;
  currentContent?: string;
  onRestore?: (newContent: string) => void;
  trigger?: React.ReactNode;
}

export function PrdVersionDrawer({
  projectId,
  onRestore,
  trigger,
}: PrdVersionDrawerProps) {
  const [open, setOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [versionIdToRestore, setVersionIdToRestore] = useState<string | null>(null);

  const { data: versions, isLoading } = usePrdVersionsQuery(projectId);
  const restoreMutation = useRestorePrdVersionMutation(projectId);

  const handleSelectVersion = async (version: PrdVersion) => {
    setSelectedVersionId(version.id);
    setIsLoadingDetail(true);
    try {
      const res = await governanceApi.getPrdVersionById(projectId, version.id);
      setPreviewContent(res.data.content || "");
    } catch {
      setPreviewContent("Gagal memuat pratinjau konten versi ini.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleConfirmRestore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!versionIdToRestore) return;
    restoreMutation.mutate(versionIdToRestore, {
      onSuccess: (data) => {
        if (data.content && onRestore) {
          onRestore(data.content);
        }
        setVersionIdToRestore(null);
        setOpen(false);
      },
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {trigger || (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full text-xs h-9 px-3.5 border-border hover:bg-muted/60"
            >
              <HugeiconsIcon icon={Clock01Icon} className="size-3.5 mr-1.5 text-primary" aria-hidden="true" />
              Riwayat Versi ({versions?.length || 0})
            </Button>
          )}
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 flex flex-col h-full bg-background border-l border-border"
        >
          <SheetHeader className="p-6 border-b border-border bg-card">
            <SheetTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Clock01Icon} className="size-5 text-primary" aria-hidden="true" />
              Riwayat Versi Dokumen PRD (GZIP)
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Snapshot berkas terkompresi GZIP append-only. Memulihkan versi lama akan membuat versi baru di urutan teratas tanpa menimpa histori sebelumnya.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Version List Sidebar */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border overflow-y-auto p-4 space-y-2 bg-muted/15 shrink-0">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Daftar Versi
              </span>

              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <Spinner className="size-5 text-primary" />
                </div>
              ) : !versions || versions.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Belum ada versi tersimpan.
                </div>
              ) : (
                versions.map((ver, idx) => {
                  const isSelected = selectedVersionId === ver.id;
                  const isLatest = idx === 0;

                  return (
                    <button
                      key={ver.id}
                      type="button"
                      onClick={() => handleSelectVersion(ver)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 border-primary shadow-xs"
                          : "bg-card border-border hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1">
                          Versi #{ver.versionNumber}
                        </span>
                        {isLatest && (
                          <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-[9px] px-1.5 py-0 rounded-full font-semibold">
                            Terbaru
                          </Badge>
                        )}
                      </div>

                      <div className="text-[11px] text-muted-foreground truncate">
                        {ver.description || `Snapshot Versi #${ver.versionNumber}`}
                      </div>

                      <div className="text-[10px] text-muted-foreground/80 mt-1.5 flex items-center justify-between">
                        <span>{ver.charCount} karakter</span>
                        <span>
                          {new Date(ver.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Version Preview Pane */}
            <div className="flex-1 flex flex-col overflow-hidden bg-background">
              {selectedVersionId && previewContent !== null ? (
                <>
                  <div className="p-4 border-b border-border bg-card/60 flex items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="font-semibold text-foreground">
                        Pratinjau Snapshot
                      </span>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setVersionIdToRestore(selectedVersionId)}
                      disabled={restoreMutation.isPending}
                      className="rounded-full text-xs h-8 px-3 font-semibold shadow-xs cursor-pointer"
                    >
                      {restoreMutation.isPending ? (
                        <Spinner className="size-3 mr-1" />
                      ) : (
                        <HugeiconsIcon icon={RotateLeft01Icon} className="size-3.5 mr-1" aria-hidden="true" />
                      )}
                      Pulihkan Versi Ini (Restore)
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 text-xs prose prose-sm max-w-none">
                    {isLoadingDetail ? (
                      <div className="py-12 flex justify-center">
                        <Spinner className="size-6 text-primary" />
                      </div>
                    ) : (
                      <ReactMarkdown>{previewContent}</ReactMarkdown>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <HugeiconsIcon icon={ViewIcon} className="size-8 text-muted-foreground/40 mb-2" aria-hidden="true" />
                  <p className="text-xs font-medium text-foreground">Pilih Versi di Samping</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                    Klik salah satu snapshot pada daftar untuk memeriksa pratinjau isi dokumen dan memulihkannya.
                  </p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* AlertDialog Konfirmasi Restore Versi PRD */}
      <AlertDialog
        open={Boolean(versionIdToRestore)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !restoreMutation.isPending) {
            setVersionIdToRestore(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Pulihkan Versi PRD Ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Konten dari versi ini akan disimpan sebagai versi terbaru di urutan teratas tanpa menimpa histori versi lama.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={restoreMutation.isPending}
              className="rounded-full text-xs h-9"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={restoreMutation.isPending}
              onClick={handleConfirmRestore}
              className="rounded-full text-xs h-9 font-semibold"
            >
              {restoreMutation.isPending && <Spinner className="size-3.5 mr-1.5" />}
              Ya, Pulihkan Versi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
