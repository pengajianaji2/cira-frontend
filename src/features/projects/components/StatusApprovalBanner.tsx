"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckmarkBadge01Icon,
  Cancel01Icon,
  Time02Icon,
  UserCheck01Icon,
  CrownIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "@/shared/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore, useMyPermissionsQuery } from "@/features/auth";
import {
  useActiveStatusRequestQuery,
  useOwnerFinalDecisionMutation,
  useProjectRosterQuery,
  useSubmitVoteMutation,
} from "../queries/governance.queries";
import { ProjectStatus } from "../types/projects.types";

interface StatusApprovalBannerProps {
  projectId: string;
  currentStatus: ProjectStatus;
}

const statusDisplayLabels: Record<string, string> = {
  lead: "Lead",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusApprovalBanner({
  projectId,
  currentStatus,
}: StatusApprovalBannerProps) {
  const { user } = useAuthStore();
  const { data: permissions = [] } = useMyPermissionsQuery();
  const { data: request, isLoading: isRequestLoading } = useActiveStatusRequestQuery(projectId);
  const { data: roster, isLoading: isRosterLoading } = useProjectRosterQuery(projectId);

  const submitVoteMutation = useSubmitVoteMutation(projectId);
  const ownerDecisionMutation = useOwnerFinalDecisionMutation(projectId);

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [overrideDecision, setOverrideDecision] = useState<"approve" | "reject">("approve");
  const [overrideReason, setOverrideReason] = useState("");

  if (isRequestLoading || isRosterLoading || !request) {
    return null;
  }

  const userRoles = (user?.roles || []).map((r) => r.toLowerCase());
  const isOwner = userRoles.includes("owner") && permissions.includes("projects.status.change");
  const isRosterMember = (roster || []).some((m) => m.userId === user?.id);
  const myVote = request.votes?.find((v) => v.userId === user?.id);
  const hasVoted = Boolean(myVote);

  const totalRoster = roster?.length || 1;
  const votes = request.votes || [];
  const approveCount = votes.filter((v) => v.vote === "approve").length;
  const rejectCount = votes.filter((v) => v.vote === "reject").length;
  const hasReject = rejectCount > 0;
  const progressPercent = Math.min(100, Math.round((approveCount / totalRoster) * 100));

  const handleApproveVote = () => {
    submitVoteMutation.mutate({
      reqId: request.id,
      payload: { vote: "approve" },
    });
  };

  const handleConfirmReject = () => {
    submitVoteMutation.mutate(
      {
        reqId: request.id,
        payload: { vote: "reject", reason: rejectReason },
      },
      {
        onSuccess: () => {
          setIsRejectDialogOpen(false);
          setRejectReason("");
        },
      }
    );
  };

  const handleConfirmOwnerDecision = () => {
    ownerDecisionMutation.mutate(
      {
        reqId: request.id,
        payload: { decision: overrideDecision, reason: overrideReason },
      },
      {
        onSuccess: () => {
          setIsOverrideDialogOpen(false);
          setOverrideReason("");
        },
      }
    );
  };

  return (
    <>
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 shadow-xs space-y-5">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                <HugeiconsIcon icon={Alert02Icon} className="size-3.5 mr-1 inline" aria-hidden="true" />
                Permohonan Perubahan Status Pending
              </Badge>
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <span className="capitalize px-2 py-0.5 rounded-md bg-muted text-muted-foreground line-through">
                  {statusDisplayLabels[currentStatus] || currentStatus}
                </span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="capitalize px-2 py-0.5 rounded-md bg-accent text-accent-foreground font-bold">
                  {statusDisplayLabels[request.targetStatus] || request.targetStatus}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Diajukan oleh <span className="font-semibold text-foreground">{request.requestedBy.name}</span>{" "}
              <span aria-hidden="true">•</span>{" "}
              {new Date(request.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Quick consensus badge */}
          <div className="text-right shrink-0">
            <div className="text-xs font-semibold text-foreground">
              Konsensus Roster: {approveCount} / {totalRoster} ({progressPercent}%)
            </div>
            <div
              role="progressbar"
              aria-label="Konsensus persetujuan roster"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              className="w-36 h-2 bg-muted rounded-full mt-1.5 overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  hasReject ? "bg-destructive" : progressPercent === 100 ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Reason Box */}
        <div className="bg-background/80 border border-border/80 rounded-2xl p-3.5 text-xs">
          <span className="font-semibold text-muted-foreground block mb-1">Alasan Pengajuan:</span>
          <p className="text-foreground italic">&ldquo;{request.reason}&rdquo;</p>
        </div>

        {/* Roster Voting Status Grid */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-foreground block">
            Daftar Suara Roster Proyek (Wajib 100% Setuju):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {(roster || []).map((member) => {
              const memberVote = votes.find((v) => v.userId === member.userId);
              return (
                <div
                  key={member.id}
                  className="bg-card/70 border border-border rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <UserAvatar
                      name={member.user.name}
                      avatarUrl={member.user.avatarUrl}
                      size="sm"
                      decorative
                    />
                    <div className="truncate">
                      <div className="font-semibold truncate text-foreground">{member.user.name}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">
                        {member.roleInProject || member.user.roles[0]}
                      </div>
                    </div>
                  </div>

                  {memberVote?.vote === "approve" ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full shrink-0">
                      <HugeiconsIcon icon={CheckmarkBadge01Icon} className="size-3 mr-1 inline" aria-hidden="true" />
                      Setuju
                    </Badge>
                  ) : memberVote?.vote === "reject" ? (
                    <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] px-2 py-0.5 rounded-full shrink-0" title={memberVote.reason || "Menolak"}>
                      <HugeiconsIcon icon={Cancel01Icon} className="size-3 mr-1 inline" aria-hidden="true" />
                      Menolak
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-[10px] px-2 py-0.5 rounded-full shrink-0">
                      <HugeiconsIcon icon={Time02Icon} className="size-3 mr-1 inline" aria-hidden="true" />
                      Menunggu
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Voting Actions for Roster Member */}
        {isRosterMember && !hasVoted && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <HugeiconsIcon icon={UserCheck01Icon} className="size-4 text-accent-foreground" aria-hidden="true" />
                Anda terdaftar di Roster Proyek ini.
              </span>
              <p className="text-muted-foreground mt-0.5">
                Berikan suara Anda untuk menyetujui atau menolak perubahan status ke &quot;{statusDisplayLabels[request.targetStatus] || request.targetStatus}&quot;.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsRejectDialogOpen(true)}
                disabled={submitVoteMutation.isPending}
                className="rounded-full text-xs h-8 px-3 border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5 mr-1" aria-hidden="true" />
                Tolak
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApproveVote}
                disabled={submitVoteMutation.isPending}
                className="rounded-full text-xs h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
              >
                {submitVoteMutation.isPending ? (
                  <Spinner className="size-3 mr-1" />
                ) : (
                  <HugeiconsIcon icon={CheckmarkBadge01Icon} className="size-3.5 mr-1" aria-hidden="true" />
                )}
                Setujui Permohonan
              </Button>
            </div>
          </div>
        )}

        {/* Already Voted Badge Pill */}
        {hasVoted && myVote && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} className="size-4 text-accent-foreground" aria-hidden="true" />
            <span>
              Anda telah memberikan suara:{" "}
              <strong className={myVote.vote === "approve" ? "text-emerald-600" : "text-destructive"}>
                {myVote.vote === "approve" ? "SETUJU" : "MENOLAK"}
              </strong>
              {myVote.reason && ` ("${myVote.reason}")`}.
            </span>
          </div>
        )}

        {/* Rejection Alert & Owner Final Decision (AC-F2-2) */}
        {hasReject && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                <HugeiconsIcon icon={Alert02Icon} className="size-4" aria-hidden="true" />
                Terdapat Penolakan Pada Voting Roster
              </div>
              <p className="text-xs text-muted-foreground">
                Konsensus 100% terhambat karena terdapat anggota yang menolak. Permohonan membutuhkan arbitrase keputusan akhir oleh Owner.
              </p>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setOverrideDecision("reject");
                    setIsOverrideDialogOpen(true);
                  }}
                  disabled={ownerDecisionMutation.isPending}
                  className="rounded-full text-xs h-8 px-3 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3.5 mr-1" aria-hidden="true" />
                  Batalkan Pengajuan
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setOverrideDecision("approve");
                    setIsOverrideDialogOpen(true);
                  }}
                  disabled={ownerDecisionMutation.isPending}
                  className="rounded-full text-xs h-8 px-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
                >
                  <HugeiconsIcon icon={CrownIcon} className="size-3.5 mr-1" aria-hidden="true" />
                  Putusan Final: Setujui (Override)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog Alasan Penolakan Suara */}
      <Dialog
        open={isRejectDialogOpen}
        onOpenChange={(open) => {
          if (!open && submitVoteMutation.isPending) return;
          setIsRejectDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Konfirmasi Penolakan Suara
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Berikan alasan penolakan perubahan status ke &quot;{statusDisplayLabels[request.targetStatus] || request.targetStatus}&quot;. Alasan akan tercatat pada sistem.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 my-2">
            <label
              htmlFor="reject-reason-textarea"
              className="text-xs font-semibold text-foreground block"
            >
              Alasan Penolakan (Opsional)
            </label>
            <Textarea
              id="reject-reason-textarea"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Modul pengujian belum selesai, atau menunggu approval klien..."
              rows={3}
              disabled={submitVoteMutation.isPending}
              className="text-xs rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={submitVoteMutation.isPending}
              className="rounded-full text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmReject}
              disabled={submitVoteMutation.isPending}
              className="rounded-full text-xs font-semibold"
            >
              {submitVoteMutation.isPending ? <Spinner className="size-3 mr-1" /> : null}
              Kirim Penolakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Putusan Final Owner */}
      <Dialog
        open={isOverrideDialogOpen}
        onOpenChange={(open) => {
          if (!open && ownerDecisionMutation.isPending) return;
          setIsOverrideDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={CrownIcon} className="size-5 text-amber-500" aria-hidden="true" />
              Arbitrase Final Owner ({overrideDecision === "approve" ? "Setujui Proyek" : "Tolak Pengajuan"})
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Sebagai Owner, keputusan akhir Anda bersifat mengikat dan langsung menyelesaikan permohonan status ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 my-2">
            <label
              htmlFor="override-reason-textarea"
              className="text-xs font-semibold text-foreground block"
            >
              Catatan Putusan Arbitrase (Opsional)
            </label>
            <Textarea
              id="override-reason-textarea"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Tuliskan pertimbangan bisnis atas keputusan arbitrase ini..."
              rows={3}
              disabled={ownerDecisionMutation.isPending}
              className="text-xs rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOverrideDialogOpen(false)}
              disabled={ownerDecisionMutation.isPending}
              className="rounded-full text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant={overrideDecision === "approve" ? "default" : "destructive"}
              size="sm"
              onClick={handleConfirmOwnerDecision}
              disabled={ownerDecisionMutation.isPending}
              className="rounded-full text-xs font-semibold"
            >
              {ownerDecisionMutation.isPending ? <Spinner className="size-3 mr-1" /> : null}
              Eksekusi Putusan Final
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
