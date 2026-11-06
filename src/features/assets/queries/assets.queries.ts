import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { assetsApi } from "../api/assets.api";
import { DesignAsset } from "../types/assets.types";

export const assetsKeys = {
  all: ["assets"] as const,
  lists: () => [...assetsKeys.all, "list"] as const,
  list: (projectId: string) => [...assetsKeys.lists(), projectId] as const,
};

export function useAssetsQuery(projectId: string) {
  return useQuery({
    queryKey: assetsKeys.list(projectId),
    queryFn: async () => {
      const res = await assetsApi.getAssets(projectId);
      return res.data;
    },
    enabled: !!projectId,
  });
}

export function useUploadAssetMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      const res = await assetsApi.compressAndUpload(projectId, file, onProgress);
      return res.data;
    },
    onSuccess: (newAsset: DesignAsset) => {
      toast.success(
        `Gambar "${newAsset.name}" berhasil dikompresi (${newAsset.compressionRatio}% hemat) dan diunggah!`
      );
      queryClient.invalidateQueries({ queryKey: assetsKeys.list(projectId) });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal mengunggah gambar aset");
    },
  });
}

export function useDeleteAssetMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string) => {
      await assetsApi.deleteAsset(assetId);
      return assetId;
    },
    onSuccess: () => {
      toast.success("Aset berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: assetsKeys.list(projectId) });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal menghapus aset");
    },
  });
}
