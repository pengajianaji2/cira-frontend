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

  const handleRemoveMember = (userId: string) => {
    if (confirm("Apakah Anda yakin ingin mengeluarkan anggota ini dari roster voting?")) {
      removeMemberMutation.mutate(userId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full text-xs h-8 px-3 text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={UserGroupIcon} className="size-3.5 mr-1.5" />
            Roster Voting ({roster?.length || 0})
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={UserCheck01Icon} className="size-5 text-primary" />
            Roster Hak Suara & Persetujuan Status
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
              <SelectTrigger className="w-full sm:flex-1 text-xs rounded-xl h-9">
                <SelectValue placeholder={availableUsers.length === 0 ? "Semua anggota sudah di roster" : "Pilih personil tim..."} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="text-xs">
                    {u.name} ({u.roles[0]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-28 text-xs rounded-xl h-9">
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
                <HugeiconsIcon icon={UserAdd01Icon} className="size-3.5 mr-1" />
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
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="size-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
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
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={removeMemberMutation.isPending}
                      className="size-7 rounded-full text-destructive hover:bg-destructive/10"
                      title="Hapus dari roster"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
