"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download04Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DesignAsset, formatBytes } from "../types/assets.types";

interface AssetPreviewModalProps {
  asset: DesignAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssetPreviewModal({
  asset,
  isOpen,
  onClose,
}: AssetPreviewModalProps) {
  if (!asset) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = asset.dataUrl;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border-border bg-card">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/80 flex flex-row items-center justify-between gap-4">
          <div className="space-y-1 pr-6">
            <DialogTitle className="text-sm sm:text-base font-bold text-foreground truncate max-w-md">
              {asset.name}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Ukuran Asli: {formatBytes(asset.originalSize)}</span>
              <span>•</span>
              <span className="text-status-success-text font-semibold">
                Ukuran Kompresi: {formatBytes(asset.compressedSize)}
              </span>
              {asset.compressionRatio > 0 && (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] px-2 py-0 rounded-full"
                >
                  <HugeiconsIcon icon={SparklesIcon} className="size-2.5 mr-1" />
                  Hemat {asset.compressionRatio}%
                </Badge>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="rounded-full text-xs h-8 px-3 shrink-0"
          >
            <HugeiconsIcon icon={Download04Icon} className="size-3.5 mr-1.5" />
            Unduh
          </Button>
        </DialogHeader>

        {/* Image Preview Container */}
        <div className="bg-muted/30 p-4 sm:p-8 flex items-center justify-center max-h-[70vh] overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.dataUrl}
            alt={asset.name}
            className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-md border border-border/40"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
