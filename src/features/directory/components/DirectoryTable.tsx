"use client";

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InstagramIcon,
  MoreHorizontalIcon,
  Search01Icon,
  UserGroupIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { useAuthStore } from "@/features/auth";
import { useMyPermissionsQuery } from "@/features/auth/queries/auth.queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DirectoryUser } from "../types/directory.types";
import {
  useDirectoryQuery,
  useUpdateStatusMutation,
} from "../queries/directory.queries";
import { InviteUserModal } from "./InviteUserModal";
import { ChangeRoleModal } from "./ChangeRoleModal";

export function DirectoryTable() {
  const { user: currentUser } = useAuthStore();
  const { data: permissions = [] } = useMyPermissionsQuery();
  const isOwner = currentUser?.roles?.includes("owner") && permissions.includes("users.manage");
  const canInvite = currentUser?.roles?.includes("owner") && permissions.includes("users.invite");

  const { data: users = [], isLoading, isError, refetch } = useDirectoryQuery();
  const updateStatusMutation = useUpdateStatusMutation();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedUserForRole, setSelectedUserForRole] = useState<DirectoryUser | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.whatsapp && u.whatsapp.includes(search)) ||
        (u.instagram && u.instagram.toLowerCase().includes(search.toLowerCase()));

      const matchRole =
        roleFilter === "all" ||
        u.roles.some((r) => r.toLowerCase() === roleFilter.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.isActive) ||
        (statusFilter === "inactive" && !u.isActive);

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const activeCount = useMemo(() => users.filter((u) => u.isActive).length, [users]);
  const inactiveCount = useMemo(() => users.filter((u) => !u.isActive).length, [users]);

  const handleToggleStatus = (u: DirectoryUser) => {
    if (u.isPrimaryOwner) return;
    updateStatusMutation.mutate({
      userId: u.id,
      isActive: !u.isActive,
    });
  };

  const openChangeRole = (u: DirectoryUser) => {
    setSelectedUserForRole(u);
    setRoleModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header direktori */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Direktori Anggota Tim
            </h1>
            <Badge variant="outline" className="text-[11px] rounded-md font-mono">
              {activeCount} Aktif{inactiveCount > 0 ? ` • ${inactiveCount} Nonaktif` : ""}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar seluruh personil tim, kontak resmi, dan pembagian peran produk.
          </p>
        </div>

        {/* Tombol Undang Anggota hanya tampil untuk role Owner */}
        {canInvite && (
          <div className="shrink-0">
            <InviteUserModal />
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <HugeiconsIcon icon={Search01Icon} className="size-3.5" />
          </span>
          <input
            type="text"
            placeholder="Cari nama, email, WhatsApp, atau Instagram..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 focus:outline-hidden"
          >
            <option value="all">Semua Role</option>
            <option value="owner">Owner</option>
            <option value="developer">Developer</option>
            <option value="operasional">Operasional</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 focus:outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Saja</option>
            <option value="inactive">Nonaktif Saja</option>
          </select>
        </div>
      </div>

      {/* Tabel Data Anggota */}
      <div className="border border-neutral-200/80 rounded-2xl bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8 text-center space-y-2">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Memuat data direktori tim...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-red-600 font-medium">Gagal memuat direktori tim.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="text-xs rounded-xl">
              Coba Lagi
            </Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <HugeiconsIcon icon={UserGroupIcon} className="size-8 text-neutral-300 mx-auto" />
            <p className="text-xs font-semibold text-neutral-700">Tidak ada anggota yang ditemukan</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Cobalah mengubah kata kunci pencarian atau reset filter role/status di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-neutral-600 font-semibold text-[11px]">
                  <th className="py-3 px-4">Nama & Akun</th>
                  <th className="py-3 px-4">Kontak Resmi</th>
                  <th className="py-3 px-4">Role Produk</th>
                  <th className="py-3 px-4">Status Akun</th>
                  {isOwner && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.map((u) => {
                  const initial = u.name.charAt(0).toUpperCase();
                  const cleanWA = u.whatsapp?.replace(/[^0-9]/g, "");

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        !u.isActive ? "bg-neutral-50/40 opacity-75" : ""
                      }`}
                    >
                      {/* Nama & Akun */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-neutral-100 border border-neutral-200/80 flex items-center justify-center font-bold text-neutral-700 text-xs shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-neutral-900 leading-tight">
                                {u.name}
                              </span>
                              {u.isPrimaryOwner && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] py-0 px-1 bg-amber-100 text-amber-800 border-amber-200/60 font-semibold"
                                >
                                  Owner Utama
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground block font-mono">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kontak Resmi */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {u.whatsapp ? (
                            <a
                              href={`https://wa.me/${cleanWA}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-mono border border-emerald-200/60 transition-colors"
                              title="Buka Chat WhatsApp"
                            >
                              <HugeiconsIcon icon={WhatsappIcon} className="size-3" />
                              <span>{u.whatsapp}</span>
                            </a>
                          ) : (
                            <span className="text-[11px] text-neutral-400 italic">Belum diisi</span>
                          )}

                          {u.instagram && (
                            <a
                              href={`https://instagram.com/${u.instagram}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-[11px] font-mono border border-purple-200/60 transition-colors"
                              title="Buka Profil Instagram"
                            >
                              <HugeiconsIcon icon={InstagramIcon} className="size-3" />
                              <span>@{u.instagram}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Role Produk */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => {
                            const isOwnerRole = r.toLowerCase() === "owner";
                            const isDevRole = r.toLowerCase() === "developer" || r.toLowerCase() === "dev";
                            const isOpsRole = r.toLowerCase() === "operasional" || r.toLowerCase() === "ops";

                            const badgeClass = isOwnerRole
                              ? "bg-neutral-900 text-white"
                              : isDevRole
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : isOpsRole
                              ? "bg-purple-100 text-purple-800 border-purple-200"
                              : "bg-neutral-100 text-neutral-700";

                            return (
                              <Badge
                                key={r}
                                className={`text-[10px] capitalize font-medium py-0 px-1.5 ${badgeClass}`}
                              >
                                {r}
                              </Badge>
                            );
                          })}
                        </div>
                      </td>

                      {/* Status Akun */}
                      <td className="py-3 px-4">
                        {u.isActive ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[10px] font-medium py-0 px-1.5">
                            ● Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-neutral-500 text-[10px] font-medium py-0 px-1.5">
                            ○ Nonaktif
                          </Badge>
                        )}
                      </td>

                      {/* Aksi Khusus Owner */}
                      {isOwner && (
                        <td className="py-3 px-4 text-right">
                          {u.isPrimaryOwner ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openChangeRole(u)}
                              className="h-7 text-[11px] px-2 rounded-lg"
                            >
                              Ubah Role
                            </Button>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 rounded-lg text-neutral-500 hover:text-neutral-900"
                                >
                                  <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 text-xs rounded-xl">
                                <DropdownMenuItem onClick={() => openChangeRole(u)}>
                                  Ubah Role Anggota
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleToggleStatus(u)}
                                  className={u.isActive ? "text-red-600" : "text-emerald-600"}
                                >
                                  {u.isActive ? "Nonaktifkan Akun" : "Aktifkan Kembali Akun"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog Ganti Role */}
      <ChangeRoleModal
        user={selectedUserForRole}
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
      />
    </div>
  );
}
