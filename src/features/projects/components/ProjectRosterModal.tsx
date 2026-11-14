"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  UserAdd01Icon,
  Delete02Icon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "@/shared/components";
import { useDirectoryQuery } from "@/features/directory";
import {
  useAddRosterMemberMutation,
  useProjectRosterQuery,
  useRemoveRosterMemberMutation,
} from "../queries/governance.queries";

interface ProjectRosterModalProps {
  projectId: string;
  trigger?: React.ReactNode;
}

export function ProjectRosterModal({ projectId, trigger }: ProjectRosterModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("member");
  const [memberToRemove, setMemberToRemove] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  const { data: roster, isLoading: isRosterLoading } = useProjectRosterQuery(projectId);
  const { data: directory, isLoading: isDirectoryLoading } = useDirectoryQuery();

  const addMemberMutation = useAddRosterMemberMutation(projectId);
  const removeMemberMutation = useRemoveRosterMemberMutation(projectId);

  // Filter user yang belum ada di roster
  const existingUserIds = new Set((roster || []).map((m) => m.userId));
  const availableUsers = (directory || []).filter(
    (u) => u.isActive && !existingUserIds.has(u.id)
  );

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    addMemberMutation.mutate(
      {
        userId: selectedUserId,
        roleInProject: selectedRole,
      },
      {
        onSuccess: () => {
          setSelectedUserId("");
          setSelectedRole("member");
        },
      }
    );
  };

  const handleConfirmRemoveMember = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!memberToRemove) return;
    removeMemberMutation.mutate(memberToRemove.userId, {
      onSuccess: () => {
        setMemberToRemove(null);
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full text-xs h-8 px-3 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <HugeiconsIcon icon={UserGroupIcon} className="size-3.5 mr-1.5" aria-hidden="true" />
              Roster Voting ({roster?.length || 0})
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={UserCheck01Icon} className="size-5 text-accent-foreground" aria-hidden="true" />
              Roster Hak Suara &amp; Persetujuan Status
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Anggota yang terdaftar dalam roster ini wajib memberikan suara persetujuan 100% untuk setiap perubahan status proyek.
            </DialogDescription>
          </DialogHeader>

          {/* Add Member Form */}
          <form onSubmit={handleAddMember} className="my-3 p-3 bg-muted/40 rounded-2xl border border-border space-y-3">
            <span className="text-xs font-semibold text-foreground block">
              Tambah Anggota ke Roster
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                disabled={isDirectoryLoading || availableUsers.length === 0}
              >
                <SelectTrigger
                  aria-label="Pilih personil tim untuk roster"
                  className="w-full sm:flex-1 text-xs rounded-xl h-9"
                >
                  <SelectValue placeholder={availableUsers.length === 0 ? "Semua anggota sudah di roster" : "Pilih personil tim..."} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {availableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="text-xs">
                      <span className="block min-w-0 max-w-full truncate" title={`${u.name} (${u.roles[0]})`}>
                        {u.name} ({u.roles[0]})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger
                  aria-label="Pilih peran anggota di proyek"
                  className="w-full sm:w-28 text-xs rounded-xl h-9"
                >
                  <SelectValue placeholder="Peran" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="lead" className="text-xs">Project Lead</SelectItem>
                  <SelectItem value="developer" className="text-xs">Developer</SelectItem>
                  <SelectItem value="operasional" className="text-xs">Operasional</SelectItem>
                  <SelectItem value="member" className="text-xs">Anggota</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="submit"
                size="sm"
                disabled={!selectedUserId || addMemberMutation.isPending}
                className="w-full sm:w-auto rounded-full text-xs h-9 px-3.5 shrink-0"
              >
                {addMemberMutation.isPending ? (
                  <Spinner className="size-3 mr-1" />
                ) : (
                  <HugeiconsIcon icon={UserAdd01Icon} className="size-3.5 mr-1" aria-hidden="true" />
                )}
                Tambah
              </Button>
            </div>
          </form>

          {/* Current Roster List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            <span className="text-xs font-semibold text-foreground block">
              Anggota Roster Aktif ({roster?.length || 0})
            </span>

            {isRosterLoading ? (
              <div className="py-6 flex justify-center">
                <Spinner className="size-5 text-primary" />
              </div>
            ) : !roster || roster.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground bg-card border border-border rounded-xl">
                Belum ada anggota roster terdaftar. Tambahkan anggota di atas.
              </div>
            ) : (
              <div className="space-y-2">
                {roster.map((member) => (
                  <div
                    key={member.id}
                    className="bg-card border border-border rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <UserAvatar
                        name={member.user.name}
                        avatarUrl={member.user.avatarUrl}
                        size="sm"
                        className="size-7"
                        decorative
                      />
                      <div className="min-w-0 flex-1 truncate">
                        <div className="font-semibold text-foreground truncate">
                          {member.user.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {member.user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px] capitalize px-2 py-0.5 rounded-full">
                        {member.roleInProject || member.user.roles[0]}
                      </Badge>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setMemberToRemove({
                            userId: member.userId,
                            name: member.user.name,
                          })
                        }
                        disabled={removeMemberMutation.isPending}
                        className="size-7 rounded-full text-destructive hover:bg-destructive/10 cursor-pointer"
                        aria-label={`Hapus ${member.user.name} dari roster`}
                        title="Hapus dari roster"
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="size-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Konfirmasi Hapus Anggota Roster */}
      <AlertDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !removeMemberMutation.isPending) {
            setMemberToRemove(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Keluarkan Anggota dari Roster?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin mengeluarkan <strong>{memberToRemove?.name}</strong> dari roster voting persetujuan status proyek?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={removeMemberMutation.isPending}
              className="rounded-full text-xs h-9"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={removeMemberMutation.isPending}
              onClick={handleConfirmRemoveMember}
              className="rounded-full text-xs h-9 font-semibold"
            >
              {removeMemberMutation.isPending && <Spinner className="size-3.5 mr-1.5" />}
              Ya, Keluarkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
