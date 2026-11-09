import test from "node:test";
import assert from "node:assert/strict";
import type * as AvatarCropModule from "../src/features/auth/utils/avatar-crop";

const {
  AVATAR_MAX_DATA_URL_LENGTH,
  AVATAR_MAX_FILE_BYTES,
  AVATAR_MAX_ZOOM,
  AVATAR_MIN_ZOOM,
  AVATAR_OUTPUT_SIZE,
  computeSquareCropFrame,
  renderCroppedSquareDataUrl,
  validateAvatarFile,
} = (await import(
  new URL("../src/features/auth/utils/avatar-crop.ts", import.meta.url).href
)) as typeof AvatarCropModule;

// ==========================================
// AC-1: Validasi File, Frame Potong 1:1, & Ekspor Kanvas
// ==========================================

test("AC-1: validateAvatarFile menerima PNG/JPG/WebP <= 2 MB dan menolak format atau ukuran tak valid", () => {
  assert.equal(validateAvatarFile({ type: "image/png", size: 1024 }), null);
  assert.equal(validateAvatarFile({ type: "image/jpeg", size: AVATAR_MAX_FILE_BYTES }), null);
  assert.equal(validateAvatarFile({ type: "image/webp", size: 512_000 }), null);

  const invalidMime = validateAvatarFile({ type: "image/svg+xml", size: 1024 });
  assert.match(invalidMime ?? "", /PNG, JPG, atau WebP/i);

  const gifMime = validateAvatarFile({ type: "image/gif", size: 1024 });
  assert.match(gifMime ?? "", /PNG, JPG, atau WebP/i);

  const emptyFile = validateAvatarFile({ type: "image/png", size: 0 });
  assert.match(emptyFile ?? "", /kosong/i);

  const oversized = validateAvatarFile({
    type: "image/jpeg",
    size: AVATAR_MAX_FILE_BYTES + 1,
  });
  assert.match(oversized ?? "", /2 MB/i);
});

test("AC-1: computeSquareCropFrame menjaga rasio potong 1:1 untuk gambar landscape, portrait, dan persegi dengan clamp batas", () => {
  // Gambar landscape 1600x900 pada viewport 272x272 zoom 1x
  const landscapeCentered = computeSquareCropFrame({
    naturalWidth: 1600,
    naturalHeight: 900,
    viewportSize: 272,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });
  assert.equal(landscapeCentered.sourceSize, 900);
  assert.equal(landscapeCentered.sourceX, 350);
  assert.equal(landscapeCentered.sourceY, 0);
  assert.equal(landscapeCentered.renderedHeight, 272);
  assert.ok(landscapeCentered.renderedWidth > 272);

  // Offset pan melebihi tepi tetap ter-clamp di dalam gambar asli
  const landscapePannedPastRight = computeSquareCropFrame({
    naturalWidth: 1600,
    naturalHeight: 900,
    viewportSize: 272,
    zoom: 1,
    offsetX: -10_000,
    offsetY: 10_000,
  });
  assert.ok(landscapePannedPastRight.sourceX <= 1600 - landscapePannedPastRight.sourceSize + 1e-6);
  assert.equal(landscapePannedPastRight.offsetX, -landscapePannedPastRight.maxOffsetX);
  assert.equal(landscapePannedPastRight.offsetY, 0);

  // Gambar portrait 900x1600 dengan zoom > 1
  const portraitZoomed = computeSquareCropFrame({
    naturalWidth: 900,
    naturalHeight: 1600,
    viewportSize: 272,
    zoom: 2,
    offsetX: 50,
    offsetY: 500,
  });
  assert.equal(portraitZoomed.zoom, 2);
  assert.equal(portraitZoomed.sourceSize, 450);
  assert.ok(portraitZoomed.sourceX >= 0 && portraitZoomed.sourceX <= 900 - 450);
  assert.ok(portraitZoomed.sourceY >= 0 && portraitZoomed.sourceY <= 1600 - 450);

  // Gambar sudah 1:1 tetap bisa dipotong bersih tanpa pergeseran liar saat zoom 1x
  const squareAtMinZoom = computeSquareCropFrame({
    naturalWidth: 800,
    naturalHeight: 800,
    viewportSize: 272,
    zoom: 0.5, // di-clamp ke 1
    offsetX: 120,
    offsetY: -80,
  });
  assert.equal(squareAtMinZoom.zoom, AVATAR_MIN_ZOOM);
  assert.equal(squareAtMinZoom.maxOffsetX, 0);
  assert.equal(squareAtMinZoom.maxOffsetY, 0);
  assert.equal(squareAtMinZoom.sourceSize, 800);
  assert.equal(squareAtMinZoom.sourceX, 0);
  assert.equal(squareAtMinZoom.sourceY, 0);

  // Zoom melewati batas max di-clamp ke AVATAR_MAX_ZOOM
  const overZoomed = computeSquareCropFrame({
    naturalWidth: 800,
    naturalHeight: 800,
    viewportSize: 272,
    zoom: 99,
    offsetX: 0,
    offsetY: 0,
  });
  assert.equal(overZoomed.zoom, AVATAR_MAX_ZOOM);

  assert.throws(
    () =>
      computeSquareCropFrame({
        naturalWidth: 0,
        naturalHeight: 800,
        viewportSize: 272,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      }),
    /Dimensi gambar/,
  );
});

test("AC-1: renderCroppedSquareDataUrl mengekspor hasil 1:1 dalam batas payload dan melakukan fallback kompresi", (t) => {
  const originalDocument = (globalThis as { document?: unknown }).document;
  t.after(() => {
    if (originalDocument === undefined) {
      delete (globalThis as { document?: unknown }).document;
    } else {
      (globalThis as { document?: unknown }).document = originalDocument;
    }
  });

  const drawCalls: number[][] = [];
  const canvasDimensions: Array<{ width: number; height: number }> = [];

  (globalThis as { document: unknown }).document = {
    createElement(tag: string) {
      assert.equal(tag, "canvas");
      const canvas = {
        width: 0,
        height: 0,
        getContext(kind: string) {
          assert.equal(kind, "2d");
          return {
            imageSmoothingEnabled: false,
            imageSmoothingQuality: "low",
            drawImage(...args: unknown[]) {
              drawCalls.push(args.slice(1).map(Number));
              canvasDimensions.push({ width: canvas.width, height: canvas.height });
            },
          };
        },
        toDataURL(mimeType: string) {
          if (canvas.width === AVATAR_OUTPUT_SIZE && mimeType === "image/webp") {
            // Simulasikan ukuran WebP 512px kebesaran agar memicu fallback
            return `data:image/webp;base64,${"A".repeat(AVATAR_MAX_DATA_URL_LENGTH + 100)}`;
          }
          return `data:${mimeType};base64,aGVsbG8=`;
        },
      };
      return canvas;
    },
  };

  const fakeImage = {
    naturalWidth: 1600,
    naturalHeight: 900,
  } as HTMLImageElement;

  const result = renderCroppedSquareDataUrl({
    image: fakeImage,
    viewportSize: 272,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });

  assert.equal(result, "data:image/jpeg;base64,aGVsbG8=");
  assert.deepEqual(canvasDimensions[0], {
    width: AVATAR_OUTPUT_SIZE,
    height: AVATAR_OUTPUT_SIZE,
  });
  // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) => sw === sh && dw === dh (1:1)
  const [sx, sy, sw, sh, dx, dy, dw, dh] = drawCalls[0];
  assert.equal(sx, 350);
  assert.equal(sy, 0);
  assert.equal(sw, 900);
  assert.equal(sh, 900);
  assert.equal(dx, 0);
  assert.equal(dy, 0);
  assert.equal(dw, AVATAR_OUTPUT_SIZE);
  assert.equal(dh, AVATAR_OUTPUT_SIZE);
});
