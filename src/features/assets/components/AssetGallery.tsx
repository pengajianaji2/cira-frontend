"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
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
import { useAssetsQuery, useDeleteAssetMutation } from "../queries/assets.queries";
import { DesignAsset } from "../types/assets.types";
import { AssetDropzone } from "./AssetDropzone";
import { AssetCard } from "./AssetCard";
import { AssetPreviewModal } from "./AssetPreviewModal";

interface AssetGalleryProps {
  project: {
    id: string;
    name: string;
  };
}

export function AssetGallery({ project }: AssetGalleryProps) {
  const { data: assets = [], isLoading } = useAssetsQuery(project.id);
  const deleteMutation = useDeleteAssetMutation(project.id);

  const [previewAsset, setPreviewAsset] = useState<DesignAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<DesignAsset | null>(null);

  const handleRequestDelete = (assetId: string) => {
    const target = assets.find((a) => a.id === assetId) || null;
    setAssetToDelete(target);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!assetToDelete) return;
    deleteMutation.mutate(assetToDelete.id, {
      onSuccess: () => {
        setAssetToDelete(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <AssetDropzone projectId={project.id} />

      {/* Gallery Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-canvas-foreground tracking-tight">
            Galeri Aset Proyek
          </h3>
          <Badge variant="outline" className="bg-card text-foreground border-border text-xs px-2 py-0 rounded-full">
            {assets.length} file
          </Badge>
        </div>
      </div>

      {/* Grid or Empty / Loading State */}
      {isLoading ? (
        <div className="min-h-[240px] flex flex-col items-center justify-center gap-2">
          <Spinner className="size-6 text-primary" />
          <p className="text-xs text-canvas-muted">Memuat galeri aset...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-10 text-center max-w-md mx-auto my-6">
          <div className="size-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
            <HugeiconsIcon icon={Image01Icon} className="size-6" aria-hidden="true" />
          </div>
          <h4 className="text-sm font-bold text-foreground">
            Belum Ada Aset Diunggah
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Unggah file desain mock, wireframe, atau banner revisi menggunakan dropzone di atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onPreview={setPreviewAsset}
              onDelete={handleRequestDelete}
            />
          ))}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      <AssetPreviewModal
        asset={previewAsset}
        isOpen={!!previewAsset}
        onClose={() => setPreviewAsset(null)}
      />

      {/* AlertDialog Konfirmasi Hapus Aset */}
      <AlertDialog
        open={Boolean(assetToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setAssetToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Hapus Aset Desain?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus aset &ldquo;{assetToDelete?.name}&rdquo;? Berkas tidak dapat dipulihkan setelah dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="rounded-full text-xs h-9"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
              className="rounded-full text-xs h-9 font-semibold"
            >
              {deleteMutation.isPending && <Spinner className="size-3.5 mr-1.5" />}
              Ya, Hapus Aset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
