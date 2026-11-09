export const AVATAR_ACCEPTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const AVATAR_MAX_FILE_BYTES = 2 * 1024 * 1024;
export const AVATAR_OUTPUT_SIZE = 512;
export const AVATAR_MAX_DATA_URL_LENGTH = 2_600_000;
export const AVATAR_MIN_ZOOM = 1;
export const AVATAR_MAX_ZOOM = 3;

/** Parameter masukan untuk menghitung koordinat viewport dan area potong persegi 1:1. */
export interface SquareCropInput {
  naturalWidth: number;
  naturalHeight: number;
  viewportSize: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

/** Hasil perhitungan skala, batas offset, dan koordinat sumber untuk crop persegi 1:1. */
export interface SquareCropFrame {
  zoom: number;
  baseScale: number;
  effectiveScale: number;
  renderedWidth: number;
  renderedHeight: number;
  maxOffsetX: number;
  maxOffsetY: number;
  offsetX: number;
  offsetY: number;
  imageLeft: number;
  imageTop: number;
  sourceX: number;
  sourceY: number;
  sourceSize: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Memvalidasi tipe MIME (PNG/JPG/WebP) dan ukuran file avatar (maksimal 2 MB); mengembalikan `null` bila valid. */
export function validateAvatarFile(file: {
  type: string;
  size: number;
}): string | null {
  if (
    !AVATAR_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof AVATAR_ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return "Format foto harus PNG, JPG, atau WebP.";
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    return "File foto kosong atau tidak dapat dibaca.";
  }

  if (file.size > AVATAR_MAX_FILE_BYTES) {
    return "Ukuran file foto maksimal 2 MB.";
  }

  return null;
}

/**
 * Menghitung skala render, rentang pan valid, serta koordinat persegi sumber 1:1 (`sourceX`, `sourceY`, `sourceSize`).
 *
 * @throws {Error} Bila dimensi gambar atau viewport tidak positif.
 */
export function computeSquareCropFrame({
  naturalWidth,
  naturalHeight,
  viewportSize,
  zoom,
  offsetX,
  offsetY,
}: SquareCropInput): SquareCropFrame {
  if (naturalWidth <= 0 || naturalHeight <= 0 || viewportSize <= 0) {
    throw new Error("Dimensi gambar atau viewport crop tidak valid.");
  }

  const minNatural = Math.min(naturalWidth, naturalHeight);
  const clampedZoom = clamp(zoom, AVATAR_MIN_ZOOM, AVATAR_MAX_ZOOM);
  const baseScale = viewportSize / minNatural;
  const effectiveScale = baseScale * clampedZoom;

  const renderedWidth = (naturalWidth * viewportSize * clampedZoom) / minNatural;
  const renderedHeight = (naturalHeight * viewportSize * clampedZoom) / minNatural;

  const maxOffsetX = Math.max(0, (renderedWidth - viewportSize) / 2);
  const maxOffsetY = Math.max(0, (renderedHeight - viewportSize) / 2);

  const clampedOffsetX = clamp(offsetX, -maxOffsetX, maxOffsetX);
  const clampedOffsetY = clamp(offsetY, -maxOffsetY, maxOffsetY);

  const imageLeft = (viewportSize - renderedWidth) / 2 + clampedOffsetX;
  const imageTop = (viewportSize - renderedHeight) / 2 + clampedOffsetY;

  const sourceSize = Math.min(minNatural, minNatural / clampedZoom);
  const maxSourceX = Math.max(0, naturalWidth - sourceSize);
  const maxSourceY = Math.max(0, naturalHeight - sourceSize);

  const sourceX = clamp(-imageLeft / effectiveScale, 0, maxSourceX);
  const sourceY = clamp(-imageTop / effectiveScale, 0, maxSourceY);

  return {
    zoom: clampedZoom,
    baseScale,
    effectiveScale,
    renderedWidth,
    renderedHeight,
    maxOffsetX,
    maxOffsetY,
    offsetX: clampedOffsetX,
    offsetY: clampedOffsetY,
    imageLeft,
    imageTop,
    sourceX,
    sourceY,
    sourceSize,
  };
}

/**
 * Merender area potongan 1:1 ke kanvas HTML5 lalu mengekspor data URL WebP/JPEG terkompresi di bawah batas server.
 *
 * @throws {Error} Bila konteks kanvas 2D tidak tersedia atau ukuran data URL masih melebihi batas.
 */
export function renderCroppedSquareDataUrl({
  image,
  viewportSize,
  zoom,
  offsetX,
  offsetY,
  outputSize = AVATAR_OUTPUT_SIZE,
}: {
  image: HTMLImageElement;
  viewportSize: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  outputSize?: number;
}): string {
  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;

  const frame = computeSquareCropFrame({
    naturalWidth,
    naturalHeight,
    viewportSize,
    zoom,
    offsetX,
    offsetY,
  });

  const dimensionCandidates = [outputSize, 384, 256];
  const qualityCandidates = [0.9, 0.8, 0.7, 0.6];

  for (const targetSize of dimensionCandidates) {
    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Browser tidak mendukung pemrosesan kanvas gambar.");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      frame.sourceX,
      frame.sourceY,
      frame.sourceSize,
      frame.sourceSize,
      0,
      0,
      targetSize,
      targetSize,
    );

    for (const mimeType of ["image/webp", "image/jpeg"] as const) {
      for (const quality of qualityCandidates) {
        const dataUrl = canvas.toDataURL(mimeType, quality);
        if (
          /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(dataUrl) &&
          dataUrl.length <= AVATAR_MAX_DATA_URL_LENGTH
        ) {
          return dataUrl;
        }
      }
    }
  }

  throw new Error("Ukuran hasil potongan foto masih melebihi batas server. Gunakan file lain yang lebih ringkas.");
}
