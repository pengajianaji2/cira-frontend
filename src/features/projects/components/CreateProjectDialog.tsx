"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Folder01Icon,
  UserIcon,
  Call02Icon,
  Coins01Icon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  createProjectSchema,
  CreateProjectInput,
} from "../types/projects.types";
import { useCreateProjectMutation } from "../queries/projects.queries";

interface CreateProjectDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: (projectId: string) => void;
}

export function CreateProjectDialog({
  trigger,
  onSuccess,
}: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateProjectMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      clientName: "",
      clientContact: "",
      contractValue: undefined,
    },
  });

  const onSubmit = async (data: CreateProjectInput) => {
    try {
      const created = await createMutation.mutateAsync(data);
      reset();
      setOpen(false);
      onSuccess?.(created.id);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-full h-10 px-4 text-xs font-medium shadow-xs">
            <HugeiconsIcon icon={Add01Icon} className="size-4 mr-1.5" />
            Buat Proyek Baru
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
        <DialogHeader>
          <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
            <HugeiconsIcon icon={Folder01Icon} className="size-5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Buat Proyek Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Daftarkan proyek baru ke pipeline tim. Status awal otomatis disetel sebagai{" "}
            <span className="font-semibold text-foreground">Lead</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nama Proyek */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium">
              Nama Proyek <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                placeholder="misal: Sistem Point of Sale Multi-Cabang"
                className="rounded-full pl-3 pr-9 h-10 text-xs"
                {...register("name")}
              />
              <HugeiconsIcon
                icon={Folder01Icon}
                className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Nama Klien */}
          <div className="space-y-1.5">
            <Label htmlFor="clientName" className="text-xs font-medium">
              Nama Klien / Perusahaan <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="clientName"
                placeholder="misal: PT Berkah Ritel Sejahtera"
                className="rounded-full pl-3 pr-9 h-10 text-xs"
                {...register("clientName")}
              />
              <HugeiconsIcon
                icon={UserIcon}
                className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
            {errors.clientName && (
              <p className="text-[11px] text-destructive">
                {errors.clientName.message}
              </p>
            )}
          </div>

          {/* Kontak Klien */}
          <div className="space-y-1.5">
            <Label htmlFor="clientContact" className="text-xs font-medium">
              Nomor Kontak / WhatsApp Klien <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="clientContact"
                placeholder="misal: 0812-3456-7890"
                className="rounded-full pl-3 pr-9 h-10 text-xs"
                {...register("clientContact")}
              />
              <HugeiconsIcon
                icon={Call02Icon}
                className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
            {errors.clientContact && (
              <p className="text-[11px] text-destructive">
                {errors.clientContact.message}
              </p>
            )}
          </div>

          {/* Nilai Kontrak */}
          <div className="space-y-1.5">
            <Label htmlFor="contractValue" className="text-xs font-medium">
              Estimasi Nilai Kontrak (Rp, Opsional)
            </Label>
            <div className="relative">
              <Input
                id="contractValue"
                type="number"
                placeholder="misal: 45000000"
                className="rounded-full pl-3 pr-9 h-10 text-xs"
                {...register("contractValue", {
                  setValueAs: (v) => (v === "" || isNaN(Number(v)) ? undefined : Number(v)),
                })}
              />
              <HugeiconsIcon
                icon={Coins01Icon}
                className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
            {errors.contractValue && (
              <p className="text-[11px] text-destructive">
                {errors.contractValue.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-full text-xs h-10 px-4"
              disabled={createMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="rounded-full text-xs h-10 px-5 font-medium"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Spinner className="size-3.5 mr-1.5" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Proyek"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
