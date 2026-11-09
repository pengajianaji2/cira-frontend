"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  CropIcon,
  MinusSignIcon,
  RotateLeft01Icon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import {
  AVATAR_MAX_ZOOM,
  AVATAR_MIN_ZOOM,
  computeSquareCropFrame,
  renderCroppedSquareDataUrl,
} from "../utils/avatar-crop";

const VIEWPORT_SIZE = 272;
const ZOOM_STEP = 0.15;
const KEYBOARD_PAN_STEP = 12;

/** Properti dialog pemotongan foto profil 1:1 sebelum diunggah ke server. */
interface AvatarCropDialogProps {
  open: boolean;
  file: File | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (dataUrl: string) => Promise<void> | void;
}

/**
 * Dialog interaktif pemotongan foto profil rasio 1:1 dengan dukungan geser pointer/sentuh,
 * tombol panah keyboard, dan pengaturan zoom sebelum mengirim hasil ke backend.
 */
export function AvatarCropDialog({
  open,
  file,
  isSubmitting = false,
  onOpenChange,
  onConfirm,
}: AvatarCropDialogProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(AVATAR_MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [cropError, setCropError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !file) {
      setObjectUrl(null);
      setNaturalSize(null);
      setZoom(AVATAR_MIN_ZOOM);
      setOffset({ x: 0, y: 0 });
      setCropError(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    setNaturalSize(null);
    setZoom(AVATAR_MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
    setCropError(null);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file, open]);

  const frame = useMemo(() => {
    if (!naturalSize) return null;
    return computeSquareCropFrame({
      naturalWidth: naturalSize.width,
      naturalHeight: naturalSize.height,
      viewportSize: VIEWPORT_SIZE,
      zoom,
      offsetX: offset.x,
      offsetY: offset.y,
    });
  }, [naturalSize, zoom, offset.x, offset.y]);

  const busy = isSubmitting || isExporting;

  const updateOffsetClamped = (nextX: number, nextY: number, nextZoom = zoom) => {
    if (!naturalSize) return;
    const nextFrame = computeSquareCropFrame({
      naturalWidth: naturalSize.width,
      naturalHeight: naturalSize.height,
      viewportSize: VIEWPORT_SIZE,
      zoom: nextZoom,
      offsetX: nextX,
      offsetY: nextY,
    });
    setOffset({ x: nextFrame.offsetX, y: nextFrame.offsetY });
  };

  const handleZoomChange = (nextZoom: number) => {
    const clampedZoom = Math.min(AVATAR_MAX_ZOOM, Math.max(AVATAR_MIN_ZOOM, nextZoom));
    setZoom(clampedZoom);
    updateOffsetClamped(offset.x, offset.y, clampedZoom);
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.naturalWidth <= 0 || img.naturalHeight <= 0) {
      setCropError("Gambar tidak memiliki dimensi yang valid.");
      return;
    }
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setZoom(AVATAR_MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
    setCropError(null);
  };

  const handleImageError = () => {
    setNaturalSize(null);
    setCropError("Gagal memuat pratinjau gambar. Silakan pilih file foto lain.");
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!frame || busy) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: frame.offsetX,
      originY: frame.offsetY,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    updateOffsetClamped(drag.originX + dx, drag.originY + dy);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleStageKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!frame || busy) return;
    const step = event.shiftKey ? KEYBOARD_PAN_STEP * 2 : KEYBOARD_PAN_STEP;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        updateOffsetClamped(frame.offsetX - step, frame.offsetY);
        break;
      case "ArrowRight":
        event.preventDefault();
        updateOffsetClamped(frame.offsetX + step, frame.offsetY);
        break;
      case "ArrowUp":
        event.preventDefault();
        updateOffsetClamped(frame.offsetX, frame.offsetY - step);
        break;
      case "ArrowDown":
        event.preventDefault();
        updateOffsetClamped(frame.offsetX, frame.offsetY + step);
        break;
      case "+":
      case "=":
        event.preventDefault();
        handleZoomChange(zoom + ZOOM_STEP);
        break;
      case "-":
        event.preventDefault();
        handleZoomChange(zoom - ZOOM_STEP);
        break;
    }
  };

  const handleReset = () => {
    setZoom(AVATAR_MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirm = async () => {
    if (!imageRef.current || !naturalSize || busy) return;
    setCropError(null);
    setIsExporting(true);
    try {
      const dataUrl = renderCroppedSquareDataUrl({
        image: imageRef.current,
        viewportSize: VIEWPORT_SIZE,
        zoom,
        offsetX: frame?.offsetX ?? offset.x,
        offsetY: frame?.offsetY ?? offset.y,
      });
      await onConfirm(dataUrl);
    } catch (error) {
      setCropError(
        error instanceof Error
          ? error.message
          : "Gagal memproses potongan foto 1:1.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && busy) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton={!busy}
        className="sm:max-w-md rounded-3xl p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <HugeiconsIcon
              icon={CropIcon}
              className="size-5 text-accent-foreground"
              aria-hidden="true"
            />
            Atur Potongan Foto Profil (1:1)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Geser posisi gambar dan atur pembesaran agar wajah berada tepat di tengah bingkai persegi 1:1.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Interactive 1:1 Crop Stage */}
          <div className="space-y-2">
            <div
              role="group"
              aria-roledescription="kanvas geser gambar 2D"
              aria-label="Kanvas pemotong foto profil rasio 1 banding 1"
              aria-describedby="avatar-crop-instructions"
              tabIndex={0}
              onKeyDown={handleStageKeyDown}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
              className="relative mx-auto overflow-hidden rounded-2xl border border-border bg-muted select-none touch-none cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2"
            >
              {objectUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- Sumber blob URL interaktif untuk pemotongan kanvas 1:1
                <img
                  ref={imageRef}
                  src={objectUrl}
                  alt="Pratinjau foto profil sebelum dipotong"
                  draggable={false}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={
                    frame
                      ? {
                          width: `${frame.renderedWidth}px`,
                          height: `${frame.renderedHeight}px`,
                          transform: `translate3d(${frame.imageLeft}px, ${frame.imageTop}px, 0)`,
                        }
                      : undefined
                  }
                  className="absolute top-0 left-0 max-w-none max-h-none pointer-events-none select-none"
                />
              )}

              {!naturalSize && !cropError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner className="size-6 text-foreground" />
                </div>
              )}

              {/* Circular 1:1 guide mask matching avatar rendering */}
              <div
                aria-hidden="true"
                style={{
                  boxShadow:
                    "0 0 0 9999px color-mix(in oklch, var(--foreground) 45%, transparent)",
                }}
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-card/95"
              />
            </div>

            <p
              id="avatar-crop-instructions"
              className="text-[11px] text-muted-foreground text-center"
            >
              Seret gambar dengan mouse, sentuh, atau gunakan tombol panah keyboard untuk memposisikan foto.
            </p>
          </div>

          {/* Zoom Controls */}
          <div className="space-y-2 rounded-2xl bg-muted/40 border border-border p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span
                id="avatar-zoom-label"
                className="text-xs font-medium text-foreground"
              >
                Pembesaran ({zoom.toFixed(2)}x)
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={!naturalSize || busy}
                className="min-h-11 h-11 px-3.5 text-xs rounded-full text-foreground"
              >
                <HugeiconsIcon icon={RotateLeft01Icon} className="size-3.5 mr-1" aria-hidden="true" />
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Perkecil zoom foto"
                onClick={() => handleZoomChange(zoom - ZOOM_STEP)}
                disabled={!naturalSize || busy || zoom <= AVATAR_MIN_ZOOM}
                className="size-11 rounded-full shrink-0"
              >
                <HugeiconsIcon icon={MinusSignIcon} className="size-4" aria-hidden="true" />
              </Button>

              <Slider
                aria-labelledby="avatar-zoom-label"
                min={AVATAR_MIN_ZOOM}
                max={AVATAR_MAX_ZOOM}
                step={0.05}
                value={[zoom]}
                disabled={!naturalSize || busy}
                onValueChange={(values) => {
                  if (values[0] !== undefined) {
                    handleZoomChange(values[0]);
                  }
                }}
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Perbesar zoom foto"
                onClick={() => handleZoomChange(zoom + ZOOM_STEP)}
                disabled={!naturalSize || busy || zoom >= AVATAR_MAX_ZOOM}
                className="size-11 rounded-full shrink-0"
              >
                <HugeiconsIcon icon={Add01Icon} className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {cropError && (
            <p
              role="alert"
              className="text-xs font-medium text-status-danger-text bg-status-danger-surface border border-status-danger-border rounded-xl px-3 py-2"
            >
              {cropError}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="rounded-full h-11 px-5 text-xs"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!naturalSize || busy}
            className="rounded-full h-11 px-5 text-xs font-semibold"
          >
            {busy && <Spinner aria-hidden="true" className="size-3.5 mr-1.5" />}
            {busy ? "Menyimpan..." : "Simpan Foto 1:1"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
