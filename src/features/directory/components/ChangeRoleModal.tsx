"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DirectoryUser } from "../types/directory.types";
import { useUpdateRoleMutation } from "../queries/directory.queries";

interface ChangeRoleModalProps {
  user: DirectoryUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeRoleModal({
  user,
  open,
  onOpenChange,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>("developer");
  const updateRoleMutation = useUpdateRoleMutation();

  React.useEffect(() => {
    if (user) {
      if (user.roles.includes("operasional")) {
        setSelectedRole("operasional");
      } else if (user.roles.includes("owner") && user.roles.includes("developer")) {
        setSelectedRole("owner_dev");
      } else if (user.roles.includes("owner")) {
        setSelectedRole("owner");
      } else {
        setSelectedRole("developer");
      }
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetRoles: string[] = ["developer"];
    if (user.isPrimaryOwner) {
      targetRoles = selectedRole === "owner_dev" ? ["owner", "developer"] : ["owner"];
    } else {
      targetRoles = selectedRole === "operasional" ? ["operasional"] : ["developer"];
    }

    updateRoleMutation.mutate(
      { userId: user.id, roles: targetRoles },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-neutral-900">
            Ubah Role Anggota Tim
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Perbarui kewenangan akses untuk <span className="font-semibold text-neutral-800">{user.name}</span> ({user.email}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {user.isPrimaryOwner ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-700 block">
                Pilihan Role Owner Utama:
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 text-xs cursor-pointer hover:bg-neutral-50">
                  <input
                    type="radio"
                    name="ownerRole"
                    value="owner"
                    checked={selectedRole === "owner"}
                    onChange={() => setSelectedRole("owner")}
                    className="accent-primary"
                  />
                  <div>
                    <span className="font-semibold block">Owner Utama Saja</span>
                    <span className="text-[10px] text-muted-foreground">
                      Akses manajemen akun, roster, dan verifikasi keuangan.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 text-xs cursor-pointer hover:bg-neutral-50">
                  <input
                    type="radio"
                    name="ownerRole"
                    value="owner_dev"
                    checked={selectedRole === "owner_dev"}
                    onChange={() => setSelectedRole("owner_dev")}
                    className="accent-primary"
                  />
                  <div>
                    <span className="font-semibold block">Owner + Developer</span>
                    <span className="text-[10px] text-muted-foreground">
                      Kombinasi penuh akses Owner dan eksekusi teknis sprint/task.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-700 block">
                Pilih Role Baru:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <label
                  className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedRole === "developer"
                      ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary/20"
                      : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Developer</span>
                    <input
                      type="radio"
                      name="memberRole"
                      value="developer"
                      checked={selectedRole === "developer"}
                      onChange={() => setSelectedRole("developer")}
                      className="accent-primary"
                    />
                  </div>
                  <span className="text-[10px] font-normal text-muted-foreground mt-1">
                    Pekerjaan teknis, sprint, dan PRD.
                  </span>
                </label>

                <label
                  className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedRole === "operasional"
                      ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary/20"
                      : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Operasional</span>
                    <input
                      type="radio"
                      name="memberRole"
                      value="operasional"
                      checked={selectedRole === "operasional"}
                      onChange={() => setSelectedRole("operasional")}
                      className="accent-primary"
                    />
                  </div>
                  <span className="text-[10px] font-normal text-muted-foreground mt-1">
                    Administrasi, invoice, dan kontrak.
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={updateRoleMutation.isPending}
              className="rounded-xl text-xs font-semibold shadow-xs"
            >
              {updateRoleMutation.isPending ? "Menyimpan..." : "Simpan Perubahan Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
