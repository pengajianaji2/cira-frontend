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
      <body className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Terjadi Kesalahan Sistem</h2>
          <p className="text-sm text-gray-500">
            {error.message || "Silakan muat ulang halaman."}
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm"
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
