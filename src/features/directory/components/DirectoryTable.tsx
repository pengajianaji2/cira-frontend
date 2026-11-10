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
import { useAuthStore, useMyPermissionsQuery } from "@/features/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar, PageHeaderCard } from "@/shared/components";
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
    <div className="space-y-6">
      <PageHeaderCard
        icon={UserGroupIcon}
        title="Direktori Anggota Tim"
        badge={
          <Badge
            variant="outline"
            className="bg-muted text-foreground border-border text-[11px] rounded-md font-mono"
          >
            {activeCount} Aktif{inactiveCount > 0 ? ` • ${inactiveCount} Nonaktif` : ""}
          </Badge>
        }
        description="Daftar seluruh personil tim, kontak resmi, dan pembagian peran produk."
        action={canInvite ? <InviteUserModal /> : undefined}
      />

      {/* Kartu Konten Direktori: Filter Bar & Tabel Data Anggota */}
      <section
        aria-labelledby="directory-content-heading"
        className="bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-xs space-y-4"
      >
        <h2 id="directory-content-heading" className="sr-only">
          Pencarian, filter peran, dan daftar anggota tim
        </h2>

        <search className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 border-b border-border/70 pb-4">
          <div className="relative flex-1">
            <label htmlFor="directory-search" className="sr-only">
              Cari anggota berdasarkan nama, email, WhatsApp, atau Instagram
            </label>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} className="size-4" aria-hidden="true" />
            </span>
            <Input
              id="directory-search"
              name="search"
              type="search"
              aria-label="Cari anggota berdasarkan nama, email, WhatsApp, atau Instagram"
              placeholder="Cari nama, email, WhatsApp, atau Instagram..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full pl-9 pr-3 min-h-11 sm:min-h-9 rounded-xl border border-input-border bg-background text-foreground text-base sm:text-xs"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0">
            <div>
              <label htmlFor="directory-role-filter" className="sr-only">
                Filter berdasarkan role
              </label>
              <select
                id="directory-role-filter"
                aria-label="Filter berdasarkan role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-auto text-sm sm:text-xs px-3 min-h-11 sm:min-h-9 rounded-xl border border-input-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">Semua Role</option>
                <option value="owner">Owner</option>
                <option value="developer">Developer</option>
                <option value="operasional">Operasional</option>
              </select>
            </div>

            <div>
              <label htmlFor="directory-status-filter" className="sr-only">
                Filter berdasarkan status akun
              </label>
              <select
                id="directory-status-filter"
                aria-label="Filter berdasarkan status akun"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto text-sm sm:text-xs px-3 min-h-11 sm:min-h-9 rounded-xl border border-input-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif Saja</option>
                <option value="inactive">Nonaktif Saja</option>
              </select>
            </div>
          </div>
        </search>

        {/* Tabel Data Anggota */}
        <div className="border border-border rounded-2xl bg-card overflow-hidden">
          {isLoading ? (
            <div role="status" className="p-8 text-center space-y-2 bg-background/50">
              <div
                className="size-6 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mx-auto"
                aria-hidden="true"
              />
              <p className="text-xs text-muted-foreground">Memuat data direktori tim...</p>
            </div>
          ) : isError ? (
            <div
              role="alert"
              className="p-8 text-center space-y-3 bg-status-danger-surface text-foreground"
            >
              <p className="text-xs text-status-danger-text font-medium">
                Gagal memuat direktori tim.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="min-h-11 sm:min-h-9 text-xs rounded-xl bg-card"
              >
                Coba Lagi
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center space-y-2 bg-background/50">
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="size-8 text-muted-foreground mx-auto"
                aria-hidden="true"
              />
              <p className="text-xs font-semibold text-foreground">
                Tidak ada anggota yang ditemukan
              </p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                Cobalah mengubah kata kunci pencarian atau reset filter role/status di atas.
              </p>
            </div>
          ) : (
            <div
              tabIndex={0}
              role="region"
              aria-labelledby="directory-content-heading"
              className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <table className="w-full text-left text-xs border-collapse">
                <caption className="sr-only">
                  Daftar anggota tim, kontak resmi, role produk, dan status akun
                </caption>
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-[11px]">
                    <th scope="col" className="py-3 px-4">Nama &amp; Akun</th>
                    <th scope="col" className="py-3 px-4">Kontak Resmi</th>
                    <th scope="col" className="py-3 px-4">Role Produk</th>
                    <th scope="col" className="py-3 px-4">Status Akun</th>
                    {isOwner && <th scope="col" className="py-3 px-4 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => {
                    const cleanWA = u.whatsapp?.replace(/[^0-9]/g, "");

                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-muted/25 transition-colors ${
                          !u.isActive ? "bg-muted/40" : ""
                        }`}
                      >
                        {/* Nama & Akun */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={u.name}
                              avatarUrl={u.avatarUrl}
                              size="md"
                              decorative
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground leading-tight">
                                  {u.name}
                                </span>
                                {u.isPrimaryOwner && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[9px] py-0 px-1.5 bg-status-warning-surface text-status-warning-text border border-status-warning-border font-semibold"
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
                          <div className="flex flex-wrap items-center gap-2">
                            {u.whatsapp ? (
                              <a
                                href={`https://wa.me/${cleanWA}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-status-success-surface text-status-success-text hover:opacity-90 text-[11px] font-mono border border-status-success-border transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                title="Buka Chat WhatsApp"
                              >
                                <HugeiconsIcon icon={WhatsappIcon} className="size-3" aria-hidden="true" />
                                <span>{u.whatsapp}</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-muted-foreground italic">Belum diisi</span>
                            )}

                            {u.instagram && (
                              <a
                                href={`https://instagram.com/${u.instagram}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-status-info-surface text-status-info-text hover:opacity-90 text-[11px] font-mono border border-status-info-border transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                title="Buka Profil Instagram"
                              >
                                <HugeiconsIcon icon={InstagramIcon} className="size-3" aria-hidden="true" />
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
                                ? "bg-secondary text-secondary-foreground border-secondary"
                                : isDevRole
                                ? "bg-status-info-surface text-status-info-text border-status-info-border"
                                : isOpsRole
                                ? "bg-accent text-accent-foreground border-border"
                                : "bg-muted text-foreground border-border";

                              return (
                                <Badge
                                  key={r}
                                  className={`text-[10px] capitalize font-medium py-0 px-1.5 border ${badgeClass}`}
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
                            <Badge className="bg-status-success-surface text-status-success-text border border-status-success-border text-[10px] font-medium py-0 px-1.5">
                              ● Aktif
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-border text-[10px] font-medium py-0 px-1.5">
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
                                className="min-h-11 sm:min-h-8 text-[11px] px-2.5 rounded-lg"
                              >
                                Ubah Role
                              </Button>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Aksi untuk ${u.name}`}
                                    className="size-11 sm:size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                                  >
                                    <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" aria-hidden="true" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 text-xs rounded-xl">
                                  <DropdownMenuItem onClick={() => openChangeRole(u)}>
                                    Ubah Role Anggota
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleToggleStatus(u)}
                                    className={u.isActive ? "text-status-danger-text" : "text-status-success-text"}
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
      </section>

      {/* Modal Dialog Ganti Role */}
      <ChangeRoleModal
        user={selectedUserForRole}
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
      />
    </div>
  );
}
