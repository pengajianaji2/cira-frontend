"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="flex min-h-screen items-center justify-center bg-canvas p-4 text-foreground">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-lg space-y-4">
          <h2 className="text-xl font-bold text-foreground">Terjadi Kesalahan Sistem</h2>
          <p className="text-sm text-muted-foreground">Terjadi gangguan saat memuat halaman. Silakan coba lagi.</p>
          {error.digest && <p className="text-xs text-muted-foreground font-mono">Referensi: {error.digest}</p>}
          <button
            type="button"
            onClick={() => reset()}
            className="min-h-11 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground cursor-pointer"
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
