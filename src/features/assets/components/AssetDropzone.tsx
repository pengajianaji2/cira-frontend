"use client";

import React, { useState, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Upload04Icon,
  SparklesIcon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadAssetMutation } from "../queries/assets.queries";

interface AssetDropzoneProps {
  projectId: string;
}

export function AssetDropzone({ projectId }: AssetDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<number | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadAssetMutation(projectId);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        alert(`File "${file.name}" bukan gambar. Hanya file PNG, JPG, JPEG, dan WebP yang didukung.`);
        continue;
      }

      setActiveFileName(file.name);
      setCompressionProgress(10);

      try {
        await uploadMutation.mutateAsync({
          file,
          onProgress: (p) => {
            // p biasanya bernilai 0..100
            setCompressionProgress(Math.min(95, Math.round(p)));
          },
        });
      } finally {
        setCompressionProgress(null);
        setActiveFileName("");
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer select-none ${
          isDragOver
            ? "border-primary bg-accent scale-[1.005]"
            : "border-border hover:border-primary/60 bg-card shadow-xs"
        } ${uploadMutation.isPending ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
          <div className="size-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shadow-xs">
            {uploadMutation.isPending ? (
              <HugeiconsIcon icon={SparklesIcon} className="size-7 animate-spin" />
            ) : (
              <HugeiconsIcon icon={Upload04Icon} className="size-7" />
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight">
              {uploadMutation.isPending
                ? "Mengompresi & Mengunggah Aset..."
                : "Tarik & Lepas File Desain di Sini"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              atau klik untuk jelajah dari komputer (PNG, JPG, WebP)
            </p>
          </div>

          {/* AC-9 Info Kompresi Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border text-[11px] text-muted-foreground">
            <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-primary" />
            <span>
              Auto-Kompresi Browser: file otomatis dioptimalkan ke ukuran &lt; 2 MB
            </span>
          </div>

          {/* Progress Bar saat kompresi & upload berlangsung */}
          {uploadMutation.isPending && (
            <div className="w-full space-y-2 mt-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between text-xs text-foreground font-medium">
                <span className="truncate max-w-[200px]">{activeFileName}</span>
                <span>{compressionProgress ?? 40}%</span>
              </div>
              <Progress value={compressionProgress ?? 40} className="h-2 rounded-full" />
              <p className="text-[11px] text-muted-foreground italic">
                Sedang memproses kompresi gambar tanpa mengurangi ketajaman...
              </p>
            </div>
          )}

          {!uploadMutation.isPending && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 rounded-full text-xs h-8 px-4 border-border font-medium"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <HugeiconsIcon icon={Image01Icon} className="size-3.5 mr-1.5" />
              Pilih Gambar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
