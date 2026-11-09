"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ViewIcon,
  Download04Icon,
  Delete02Icon,
  SparklesIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DesignAsset, formatBytes } from "../types/assets.types";

interface AssetCardProps {
  asset: DesignAsset;
  onPreview: (asset: DesignAsset) => void;
  onDelete: (id: string) => void;
}

export function AssetCard({ asset, onPreview, onDelete }: AssetCardProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = asset.dataUrl;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-foreground/20 transition-all flex flex-col">
      {/* Thumbnail Container */}
      <div
        onClick={() => onPreview(asset)}
        className="relative aspect-video w-full bg-muted/40 cursor-pointer overflow-hidden flex items-center justify-center border-b border-border/60"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.dataUrl}
          alt={asset.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Hover / Focus Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="rounded-full text-xs h-8 px-3.5 bg-white/90 text-slate-900 hover:bg-white shadow-md font-semibold cursor-pointer"
            aria-label={`Pratinjau aset "${asset.name}"`}
            onClick={(e) => {
              e.stopPropagation();
              onPreview(asset);
            }}
          >
            <HugeiconsIcon icon={ViewIcon} className="size-3.5 mr-1" aria-hidden="true" />
            Pratinjau
          </Button>
        </div>

        {/* Compression Badge */}
        {asset.compressionRatio > 0 && (
          <div className="absolute top-2.5 right-2.5">
            <Badge className="bg-emerald-600/90 hover:bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-xs flex items-center gap-1">
              <HugeiconsIcon icon={SparklesIcon} className="size-2.5" aria-hidden="true" />
              Hemat {asset.compressionRatio}%
            </Badge>
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-foreground">
            <button
              type="button"
              className="w-full text-left truncate cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              title={asset.name}
              onClick={() => onPreview(asset)}
            >
              {asset.name}
            </button>
          </h4>

          {/* Size Comparison */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5">
            <span className="line-through text-muted-foreground/70">
              {formatBytes(asset.originalSize)}
            </span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 text-muted-foreground" aria-hidden="true" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatBytes(asset.compressedSize)}
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border/60 text-xs">
          <span className="text-[10px] text-muted-foreground">
            {new Date(asset.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleDownload}
              className="text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              aria-label={`Unduh aset "${asset.name}"`}
              title="Unduh aset"
            >
              <HugeiconsIcon icon={Download04Icon} className="size-3.5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(asset.id);
              }}
              className="text-muted-foreground hover:text-destructive rounded-lg cursor-pointer"
              aria-label={`Hapus aset "${asset.name}"`}
              title="Hapus aset"
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
