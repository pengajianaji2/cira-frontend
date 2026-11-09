"use client";

import React, { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import {
  useProjectListingQuery,
  ProjectFilterTabs,
  ProjectTable,
  CreateProjectDialog,
  FilterStatus,
} from "@/features/projects";
import { useGlobalState } from "@/shared/components/state/GlobalStateProvider";

export default function ProjectsPage() {
  const { filterStatus, setFilterStatus, searchQuery, setSearchQuery } = useGlobalState();
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const pageSize = 25;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => setPage(1), [filterStatus, debouncedSearch]);

  const listingQuery = useProjectListingQuery({
    status: filterStatus === "all" ? undefined : filterStatus,
    search: debouncedSearch || undefined,
    page,
    limit: pageSize,
  });
  const projects = listingQuery.data?.items ?? [];
  const counts = {
    all: Object.values(listingQuery.data?.counts ?? {}).reduce((sum, count) => sum + (count ?? 0), 0),
    lead: listingQuery.data?.counts.lead ?? 0,
    active: listingQuery.data?.counts.active ?? 0,
    completed: listingQuery.data?.counts.completed ?? 0,
    cancelled: listingQuery.data?.counts.cancelled ?? 0,
  };

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

      <div className="max-w-md">
        <label htmlFor="project-search" className="sr-only">Cari nama proyek atau klien</label>
        <Input id="project-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari proyek atau klien…" autoComplete="off" />
      </div>

      {/* Filter Tabs Bar */}
      <div className="space-y-4">
        <ProjectFilterTabs
          currentFilter={filterStatus as FilterStatus}
          onFilterChange={(s) => setFilterStatus(s)}
          projects={projects}
          counts={counts}
        />

        {/* Projects List / Table */}
        {listingQuery.isError ? (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
            <p className="font-medium">Daftar proyek belum dapat dimuat.</p>
            <p className="mt-1 text-muted-foreground">{listingQuery.error.message}</p>
            <button type="button" onClick={() => void listingQuery.refetch()} className="mt-3 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted">
              Coba lagi
            </button>
          </div>
        ) : (
          <ProjectTable projects={projects} isLoading={listingQuery.isPending} />
        )}
        {listingQuery.data && listingQuery.data.totalPages > 1 && (
          <nav aria-label="Paginasi proyek" className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              Halaman {listingQuery.data.page} dari {listingQuery.data.totalPages} · {listingQuery.data.total} proyek
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1 || listingQuery.isFetching} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">Sebelumnya</button>
              <button type="button" disabled={page >= listingQuery.data.totalPages || listingQuery.isFetching} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">Selanjutnya</button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
