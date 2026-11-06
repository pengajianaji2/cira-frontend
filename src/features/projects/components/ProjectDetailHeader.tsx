"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  Folder01Icon,
  UserIcon,
  Call02Icon,
  Coins01Icon,
} from "@hugeicons/core-free-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Project, ProjectStatus } from "../types/projects.types";
import { useUpdateProjectStatusMutation } from "../queries/projects.queries";

interface ProjectDetailHeaderProps {
  project: Project;
  activeTab?: string;
}

function formatRupiah(amount?: number): string {
  if (!amount) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProjectDetailHeader({
  project,
  activeTab = "prd",
}: ProjectDetailHeaderProps) {
  const updateStatusMutation = useUpdateProjectStatusMutation();

  const handleStatusChange = (val: string) => {
    updateStatusMutation.mutate({
      id: project.id,
      status: val as ProjectStatus,
    });
  };

  const navTabs: { id: string; label: string; available: boolean; badge?: string }[] = [
    { id: "prd", label: "PRD & Spesifikasi", available: true },
    { id: "tasks", label: "Task Board", available: true },
    { id: "finance", label: "Keuangan & Termin", available: true },
    { id: "assets", label: "Aset Desain", available: true },
    { id: "activity", label: "Riwayat Aktivitas", available: true },
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumb & Back Link */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/projects"
          className="hover:text-foreground inline-flex items-center gap-1 transition-colors font-medium"
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} className="size-3.5" />
          Daftar Proyek
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold truncate max-w-[240px]">
          {project.name}
        </span>
      </div>

      {/* Main Info Card */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Folder01Icon} className="size-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                {project.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1 text-foreground/80 font-medium">
                  <HugeiconsIcon icon={UserIcon} className="size-3.5" />
                  {project.clientName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={Call02Icon} className="size-3.5" />
                  {project.clientContact}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <HugeiconsIcon icon={Coins01Icon} className="size-3.5 text-primary" />
                  {formatRupiah(project.contractValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Switcher */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-muted/30 p-2 rounded-2xl border border-border/60">
          <span className="text-xs font-medium text-muted-foreground pl-1">
            Status:
          </span>
          <Select
            value={project.status}
            onValueChange={handleStatusChange}
            disabled={updateStatusMutation.isPending}
          >
            <SelectTrigger className="w-[140px] rounded-full text-xs h-8">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="lead" className="text-xs">
                Lead
              </SelectItem>
              <SelectItem value="active" className="text-xs">
                Active
              </SelectItem>
              <SelectItem value="completed" className="text-xs">
                Completed
              </SelectItem>
              <SelectItem value="cancelled" className="text-xs">
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-b border-border flex items-center gap-2 overflow-x-auto no-scrollbar">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          if (!tab.available) {
            return (
              <div
                key={tab.id}
                className="py-2.5 px-3.5 text-xs text-muted-foreground/60 flex items-center gap-1.5 cursor-not-allowed select-none whitespace-nowrap"
                title="Akan tersedia pada fase selanjutnya"
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 rounded-full font-normal opacity-70"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </div>
            );
          }
          return (
            <Link
              key={tab.id}
              href={`/projects/${project.id}?tab=${tab.id}`}
              className={`py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
