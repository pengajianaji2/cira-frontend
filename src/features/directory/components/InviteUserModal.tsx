"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Copy01Icon,
  Mail01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useInviteMutation } from "../queries/directory.queries";
import { toast } from "sonner";

export function InviteUserModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"developer" | "operasional">("developer");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteMutation = useInviteMutation();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEmail("");
      setRole("developer");
      setGeneratedLink(null);
      setCopied(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Alamat email calon anggota wajib diisi.");
      return;
    }

    inviteMutation.mutate(
      { email, role },
      {
        onSuccess: (res) => {
          const token = res.data.invitation.token;
          const origin = typeof window !== "undefined" ? window.location.origin : "";
          const link = `${origin}/activate?token=${token}`;
          setGeneratedLink(link);
        },
      }
    );
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Tautan aktivasi disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-xl text-xs gap-2 font-medium shadow-xs">
          <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
          <span>Undang Anggota</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-neutral-900">
            Undang Anggota Tim Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Kirimkan tautan aktivasi akun sekali pakai yang berlaku selama 24 jam.
          </DialogDescription>
        </DialogHeader>

        {generatedLink ? (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-emerald-800">
                Undangan Berhasil Diterbitkan!
              </p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Tautan aktivasi untuk <span className="font-semibold">{email}</span> (Role: {role}) telah siap. Salin dan kirimkan tautan ini kepada calon anggota:
              </p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full text-[11px] font-mono bg-white px-2.5 py-1.5 rounded-lg border border-emerald-300 text-neutral-800 focus:outline-hidden"
                />
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="rounded-lg shrink-0 gap-1 text-xs"
                >
                  <HugeiconsIcon
                    icon={copied ? Tick02Icon : Copy01Icon}
                    className="size-3.5"
                  />
                  <span>{copied ? "Disalin" : "Salin"}</span>
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="w-full rounded-xl text-xs"
            >
              Tutup
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700 block">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <HugeiconsIcon icon={Mail01Icon} className="size-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="rekan@perusahaan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700 block">
                Pilih Role Anggota <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <label
                  className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    role === "developer"
                      ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary/20"
                      : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Developer</span>
                    <input
                      type="radio"
                      name="role"
                      value="developer"
                      checked={role === "developer"}
                      onChange={() => setRole("developer")}
                      className="accent-primary"
                    />
                  </div>
                  <span className="text-[10px] font-normal text-muted-foreground mt-1">
                    Sprint, task Kanban, PRD, dan link repo.
                  </span>
                </label>

                <label
                  className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    role === "operasional"
                      ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary/20"
                      : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Operasional</span>
                    <input
                      type="radio"
                      name="role"
                      value="operasional"
                      checked={role === "operasional"}
                      onChange={() => setRole("operasional")}
                      className="accent-primary"
                    />
                  </div>
                  <span className="text-[10px] font-normal text-muted-foreground mt-1">
                    Kontrak, termin, invoice, dan administrasi.
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={inviteMutation.isPending}
                className="rounded-xl text-xs font-semibold shadow-xs"
              >
                {inviteMutation.isPending ? "Menerbitkan..." : "Terbitkan Undangan (24 Jam)"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
