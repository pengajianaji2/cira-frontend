"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { downloadPrivateFile, openPrivateFileInNewTab } from "../lib/file-downloader";

interface UseFileDownloadOptions {
  downloadErrorMessage?: string;
  viewErrorMessage?: string;
}

/**
 * Hook terpusat untuk mengunduh dan melihat berkas privat berautentikasi (Clean Code / DRY).
 * Mengisolasi state progres, pemanggilan download/preview, serta penanganan notifikasi kegagalan.
 */
export function useFileDownload(options: UseFileDownloadOptions = {}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const download = useCallback(
    async (fileUrl: string | null | undefined, fileName: string, id: string = "default") => {
      if (downloadingId) return;
      setDownloadingId(id);
      try {
        await downloadPrivateFile(fileUrl, fileName);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : (options.downloadErrorMessage ?? "Gagal mengunduh berkas.");
        toast.error(message);
      } finally {
        setDownloadingId(null);
      }
    },
    [downloadingId, options.downloadErrorMessage]
  );

  const view = useCallback(
    async (fileUrl: string | null | undefined, id: string = "default") => {
      if (viewingId) return;
      setViewingId(id);
      try {
        await openPrivateFileInNewTab(fileUrl);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : (options.viewErrorMessage ?? "Gagal membuka berkas.");
        toast.error(message);
      } finally {
        setViewingId(null);
      }
    },
    [viewingId, options.viewErrorMessage]
  );

  return {
    download,
    view,
    isDownloading: Boolean(downloadingId),
    isViewing: Boolean(viewingId),
    downloadingId,
    viewingId,
  };
}
