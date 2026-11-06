"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon } from "@hugeicons/core-free-icons";
import {
  useProjectsQuery,
  ProjectFilterTabs,
  ProjectTable,
  CreateProjectDialog,
  FilterStatus,
} from "@/features/projects";
import { useGlobalState } from "@/shared/components/state/GlobalStateProvider";

export default function ProjectsPage() {
  const { filterStatus, setFilterStatus, searchQuery } = useGlobalState();

  // Fetch all projects for badge counts
  const { data: allProjects = [], isLoading: isLoadingAll } = useProjectsQuery("all");

  // Filtered projects by status and search query from global state
  const filteredProjects = allProjects.filter((p) => {
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Banner */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pipeline Workspace
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <HugeiconsIcon icon={Folder01Icon} className="size-7 text-primary" />
            Daftar Pipeline Proyek
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl">
            Kelola tahapan proyek dari negosiasi awal (<span className="text-foreground font-medium">Lead</span>), pengerjaan (<span className="text-foreground font-medium">Active</span>), hingga serah terima selesai.
          </p>
        </div>

        <div className="shrink-0">
          <CreateProjectDialog />
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="space-y-4">
        <ProjectFilterTabs
          currentFilter={filterStatus as FilterStatus}
          onFilterChange={(s) => setFilterStatus(s)}
          projects={allProjects}
        />

        {/* Projects List / Table */}
        <ProjectTable
          projects={filteredProjects}
          isLoading={isLoadingAll}
        />
      </div>
    </div>
  );
}
