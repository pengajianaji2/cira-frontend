"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, Mail01Icon, Camera01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserAvatar } from "@/shared/components";
import { profileSchema, ProfileInput } from "../types/auth.types";
import { useAuthStore } from "../store/auth.store";
import { useUpdateProfileMutation, useUploadAvatarMutation } from "../queries/auth.queries";
import { validateAvatarFile } from "../utils/avatar-crop";
import { AvatarCropDialog } from "./AvatarCropDialog";

export function ProfileForm() {
  const { user } = useAuthStore();
  const updateMutation = useUpdateProfileMutation();
  const avatarMutation = useUploadAvatarMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleFileSelected = (file?: File) => {
    if (!file) return;
    const validationError = validateAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      toast.error(validationError);
      return;
    }

    setAvatarError(null);
    setSelectedFile(file);
    setCropDialogOpen(true);
  };

  const handleConfirmCrop = async (dataUrl: string) => {
    await avatarMutation.mutateAsync(dataUrl);
    setCropDialogOpen(false);
    setSelectedFile(null);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const onSubmit = (data: ProfileInput) => {
    updateMutation.mutate(data);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "ops":
        return "secondary";
      case "dev":
        return "outline";
      case "designer":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="text-lg">Informasi Akun</CardTitle>
          <CardDescription>
            Data diri dan peran Anda di dalam tim Cira PM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* User Card Header */}
          <div className="flex items-start gap-4 pb-6 mb-6 border-b border-border">
            <input
              ref={fileInputRef}
              id="profile-avatar-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={avatarMutation.isPending}
              onChange={(event) => {
                handleFileSelected(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarMutation.isPending}
              aria-label="Ubah dan potong foto profil 1 banding 1"
              className="relative group shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <UserAvatar
                name={user?.name}
                avatarUrl={user?.avatarUrl}
                size="xl"
                decorative
                className="size-16 border-border"
              />
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -bottom-0.5 size-6 rounded-full bg-card border border-border text-foreground shadow-xs flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
              >
                <HugeiconsIcon icon={Camera01Icon} className="size-3.5" />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground text-base truncate">
                {user?.name || "Pengguna"}
              </h3>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarMutation.isPending}
                aria-describedby={avatarError ? "profile-avatar-error" : undefined}
                className="mt-1.5 min-h-11 inline-flex items-center gap-1.5 text-left text-xs font-medium text-accent-foreground hover:text-foreground underline-offset-4 hover:underline cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2 rounded-xs"
              >
                {avatarMutation.isPending
                  ? "Mengunggah foto..."
                  : "Ubah foto profil (PNG, JPG, WebP maks. 2 MB)"}
              </button>

              {avatarError && (
                <p
                  id="profile-avatar-error"
                  role="alert"
                  className="text-xs font-medium text-status-danger-text mt-1"
                >
                  {avatarError}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 mt-2">
                {user?.roles?.map((role) => (
                  <Badge
                    key={role}
                    variant={getRoleBadgeVariant(role)}
                    className="capitalize text-[11px] rounded-full px-2.5 py-0.5"
                  >
                    {role}
                  </Badge>
                )) || (
                  <Badge variant="secondary" className="text-[11px] rounded-full">
                    Anggota Tim
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Form Edit Profile */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="profile-name-input"
                className="text-xs font-medium text-foreground block"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <Input
                  id="profile-name-input"
                  placeholder="Nama Anda"
                  className="rounded-xl pl-4 pr-10 h-10"
                  disabled={updateMutation.isPending}
                  {...register("name")}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <HugeiconsIcon icon={UserIcon} className="size-4" aria-hidden="true" />
                </div>
              </div>
              {errors.name && (
                <p className="text-xs text-status-danger-text">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="profile-email-input"
                className="text-xs font-medium text-foreground block"
              >
                Alamat Email
              </label>
              <div className="relative">
                <Input
                  id="profile-email-input"
                  type="email"
                  placeholder="nama@cira.id"
                  className="rounded-xl pl-4 pr-10 h-10"
                  disabled={updateMutation.isPending}
                  {...register("email")}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <HugeiconsIcon icon={Mail01Icon} className="size-4" aria-hidden="true" />
                </div>
              </div>
              {errors.email && (
                <p className="text-xs text-status-danger-text">{errors.email.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={!isDirty || updateMutation.isPending}
                className="rounded-full px-6 h-10 text-xs font-medium"
              >
                {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AvatarCropDialog
        open={cropDialogOpen}
        file={selectedFile}
        isSubmitting={avatarMutation.isPending}
        onOpenChange={(nextOpen) => {
          setCropDialogOpen(nextOpen);
          if (!nextOpen) {
            setSelectedFile(null);
          }
        }}
        onConfirm={handleConfirmCrop}
      />
    </>
  );
}
