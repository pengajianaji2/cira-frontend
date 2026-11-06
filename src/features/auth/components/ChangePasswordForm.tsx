"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LockPasswordIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  changePasswordSchema,
  ChangePasswordInput,
} from "../types/auth.types";
import { useChangePasswordMutation } from "../queries/auth.queries";

export function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const changePasswordMutation = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ChangePasswordInput) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  return (
    <Card className="rounded-2xl border-border">
      <CardHeader>
        <CardTitle className="text-lg">Keamanan & Password</CardTitle>
        <CardDescription>
          Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Password Saat Ini */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              Password Saat Ini
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••"
                className="rounded-xl pl-4 pr-10 h-10"
                disabled={changePasswordMutation.isPending || isSubmitting}
                {...register("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                tabIndex={-1}
              >
                <HugeiconsIcon
                  icon={showCurrent ? ViewOffSlashIcon : ViewIcon}
                  className="size-4"
                />
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* Password Baru */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              Password Baru
            </label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                className="rounded-xl pl-4 pr-10 h-10"
                disabled={changePasswordMutation.isPending || isSubmitting}
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                tabIndex={-1}
              >
                <HugeiconsIcon
                  icon={showNew ? ViewOffSlashIcon : ViewIcon}
                  className="size-4"
                />
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Konfirmasi Password Baru */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground block">
              Ulangi Password Baru
            </label>
            <div className="relative">
              <Input
                type="password"
                placeholder="••••••••"
                className="rounded-xl pl-4 pr-10 h-10"
                disabled={changePasswordMutation.isPending || isSubmitting}
                {...register("confirmPassword")}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <HugeiconsIcon icon={LockPasswordIcon} className="size-4" />
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending || isSubmitting}
              className="rounded-full px-6 h-10 text-xs font-medium"
            >
              {changePasswordMutation.isPending ? "Menyimpan..." : "Ganti Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
