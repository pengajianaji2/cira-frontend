"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Folder01Icon,
  ArrowRight01Icon,
  Coins01Icon,
  Call02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Project } from "../types/projects.types";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { TableSkeleton, EmptyState } from "@/shared/components";

interface ProjectTableProps {
  projects: Project[];
  isLoading?: boolean;
}

function formatRupiah(amount?: number): string {
  if (amount === undefined || amount === null || amount === 0) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProjectTable({ projects, isLoading }: ProjectTableProps) {
  if (isLoading) {
    return <TableSkeleton rows={4} cols={6} className="my-2" />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="Belum ada proyek di kategori ini"
        description="Tambahkan proyek baru untuk mulai mencatat pipeline, spesifikasi PRD, dan termin pembayaran tim Anda."
        action={<CreateProjectDialog />}
        className="my-2"
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium">
              <th className="py-3.5 px-4 font-medium">Nama Proyek</th>
              <th className="py-3.5 px-4 font-medium">Klien</th>
              <th className="py-3.5 px-4 font-medium">Kontak</th>
              <th className="py-3.5 px-4 font-medium">Status</th>
              <th className="py-3.5 px-4 font-medium">Nilai Kontrak</th>
              <th className="py-3.5 px-4 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="hover:bg-muted/20 transition-colors group"
              >
                <td className="py-4 px-4 font-semibold text-foreground">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={Folder01Icon} className="size-4" />
                    </div>
                    <div>
                      <Link
                        href={`/projects/${project.id}?tab=prd`}
                        className="hover:underline font-semibold text-foreground block"
                      >
                        {project.name}
                      </Link>
                      <span className="text-[11px] text-muted-foreground">
                        ID: {project.id}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={UserIcon} className="size-3.5 text-muted-foreground/70" />
                    <span>{project.clientName}</span>
                  </div>
                </td>

                <td className="py-4 px-4 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Call02Icon} className="size-3.5 text-muted-foreground/70" />
                    <span>{project.clientContact}</span>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <ProjectStatusBadge status={project.status} />
                </td>

                <td className="py-4 px-4 font-medium text-foreground">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Coins01Icon} className="size-3.5 text-muted-foreground/70" />
                    <span>{formatRupiah(project.contractValue)}</span>
                  </div>
                </td>

                <td className="py-4 px-4 text-right">
                  <Link href={`/projects/${project.id}?tab=prd`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs h-8 px-3.5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                    >
                      Buka Proyek
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="size-3.5 ml-1 transition-transform group-hover:translate-x-0.5"
                      />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={Folder01Icon} className="size-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                    {project.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {project.clientName}
                  </p>
                </div>
              </div>
              <ProjectStatusBadge status={project.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
              <div>
                <span className="text-[10px] block text-muted-foreground/70">Kontak:</span>
                <span className="font-medium text-foreground text-xs">{project.clientContact}</span>
              </div>
              <div>
                <span className="text-[10px] block text-muted-foreground/70">Nilai Kontrak:</span>
                <span className="font-semibold text-foreground text-xs">
                  {formatRupiah(project.contractValue)}
                </span>
              </div>
            </div>

            <Link href={`/projects/${project.id}?tab=prd`} className="block pt-1">
              <Button
                variant="outline"
                className="w-full rounded-full text-xs h-9 justify-center"
              >
                Buka Proyek
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
