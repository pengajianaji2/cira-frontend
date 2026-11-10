"use client";

import React, { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { useMyPermissionsQuery } from "@/features/auth";
import {
  useProjectListingQuery,
  ProjectFilterTabs,
  ProjectTable,
  CreateProjectDialog,
  FilterStatus,
} from "@/features/projects";
import { PageHeaderCard } from "@/shared/components";
import { useGlobalState } from "@/shared/components/state/GlobalStateProvider";

export default function ProjectsPage() {
  const { data: permissions = [] } = useMyPermissionsQuery();
  const canCreateProject = permissions.includes("projects.create");
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
      <PageHeaderCard
        icon={Folder01Icon}
        title="Daftar Pipeline Proyek"
        description={
          <>
            Kelola tahapan proyek dari negosiasi awal (
            <span className="font-medium text-foreground">Lead</span>), pengerjaan (
            <span className="font-medium text-foreground">Active</span>), hingga serah terima selesai.
          </>
        }
        action={canCreateProject ? <CreateProjectDialog /> : undefined}
      />

      <section
        aria-labelledby="projects-content-heading"
        className="bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-xs space-y-5"
      >
        <h2 id="projects-content-heading" className="sr-only">
          Pencarian, filter status, dan daftar proyek
        </h2>

        <search className="space-y-3 border-b border-border/70 pb-4">
          <div className="relative max-w-md">
            <label htmlFor="project-search" className="sr-only">
              Cari nama proyek atau klien
            </label>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <HugeiconsIcon icon={Search01Icon} className="size-4" aria-hidden="true" />
            </span>
            <Input
              id="project-search"
              name="search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari proyek atau klien…"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="pl-9 min-h-11 sm:min-h-10 rounded-xl text-base md:text-sm"
            />
          </div>

          <ProjectFilterTabs
            currentFilter={filterStatus as FilterStatus}
            onFilterChange={(s) => setFilterStatus(s)}
            projects={projects}
            counts={counts}
          />
        </search>

        {/* Projects List / Table & Error State */}
        <div className="space-y-4">
          {listingQuery.isError ? (
            <div
              role="alert"
              className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm"
            >
              <p className="font-medium">
                Daftar proyek belum dapat dimuat.
              </p>
              <p className="mt-1 text-muted-foreground">{listingQuery.error.message}</p>
              <button
                type="button"
                onClick={() => void listingQuery.refetch()}
                className="mt-3 inline-flex items-center justify-center rounded-xl border px-4 min-h-11 sm:min-h-9 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Coba lagi
              </button>
            </div>
          ) : (
            <ProjectTable projects={projects} isLoading={listingQuery.isPending} />
          )}

          {listingQuery.data && listingQuery.data.totalPages > 1 && (
            <nav
              aria-label="Paginasi proyek"
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-border/70"
            >
              <p className="text-xs text-muted-foreground" aria-live="polite">
                Halaman {listingQuery.data.page} dari {listingQuery.data.totalPages} ·{" "}
                {listingQuery.data.total} proyek
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || listingQuery.isFetching}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="inline-flex items-center justify-center rounded-xl border px-4 min-h-11 sm:min-h-9 text-xs font-medium hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={page >= listingQuery.data.totalPages || listingQuery.isFetching}
                  onClick={() => setPage((value) => value + 1)}
                  className="inline-flex items-center justify-center rounded-xl border px-4 min-h-11 sm:min-h-9 text-xs font-medium hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Selanjutnya
                </button>
              </div>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
