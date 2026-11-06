"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
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

  const handleDelete = (assetId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus aset desain ini?")) {
      deleteMutation.mutate(assetId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <AssetDropzone projectId={project.id} />

      {/* Gallery Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground tracking-tight">
            Galeri Aset Proyek
          </h3>
          <Badge variant="secondary" className="text-xs px-2 py-0 rounded-full">
            {assets.length} file
          </Badge>
        </div>
      </div>

      {/* Grid or Empty / Loading State */}
      {isLoading ? (
        <div className="min-h-[240px] flex flex-col items-center justify-center gap-2">
          <Spinner className="size-6 text-primary" />
          <p className="text-xs text-muted-foreground">Memuat galeri aset...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-10 text-center max-w-md mx-auto my-6">
          <div className="size-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
            <HugeiconsIcon icon={Image01Icon} className="size-6" />
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
              onDelete={handleDelete}
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
    </div>
  );
}
