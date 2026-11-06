"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, Mail01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { profileSchema, ProfileInput } from "../types/auth.types";
import { useAuthStore } from "../store/auth.store";
import { useUpdateProfileMutation } from "../queries/auth.queries";

export function ProfileForm() {
  const { user } = useAuthStore();
  const updateMutation = useUpdateProfileMutation();

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
    <Card className="rounded-2xl border-border">
      <CardHeader>
        <CardTitle className="text-lg">Informasi Akun</CardTitle>
        <CardDescription>
          Data diri dan peran Anda di dalam tim Cira PM.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-border">
          <div className="size-16 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xl">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base">
              {user?.name || "Pengguna"}
            </h3>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
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
            <label className="text-xs font-medium text-foreground block">
              Nama Lengkap
            </label>
            <div className="relative">
              <Input
                placeholder="Nama Anda"
                className="rounded-xl pl-4 pr-10 h-10"
                disabled={updateMutation.isPending}
                {...register("name")}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <HugeiconsIcon icon={UserIcon} className="size-4" />
              </div>
            </div>
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              Alamat Email
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="nama@cira.id"
                className="rounded-xl pl-4 pr-10 h-10"
                disabled={updateMutation.isPending}
                {...register("email")}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <HugeiconsIcon icon={Mail01Icon} className="size-4" />
              </div>
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
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
  );
}
