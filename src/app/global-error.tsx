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
      <body className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-foreground">Terjadi Kesalahan Sistem</h2>
          <p className="text-sm text-gray-500">Terjadi gangguan saat memuat halaman. Silakan coba lagi.</p>
          {error.digest && <p className="text-xs text-gray-400 font-mono">Referensi: {error.digest}</p>}
          <button
            type="button"
            onClick={() => reset()}
            className="min-h-11 rounded-lg bg-black px-4 py-2 text-sm text-white cursor-pointer"
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
