"use client";

import React, { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon, ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useProjectQuery,
  ProjectDetailHeader,
  StatusApprovalBanner,
  ProjectRepositoriesCard,
} from "@/features/projects";
import { TabContentSkeleton } from "@/shared/components/state/ComponentSkeleton";
import { useGlobalState } from "@/shared/components/state/GlobalStateProvider";

// Code-split chunks using next/dynamic for all tabs
const PrdEditorSplitPane = dynamic(
  () => import("@/features/projects").then((mod) => mod.PrdEditorSplitPane),
  {
    loading: () => <TabContentSkeleton tab="prd" />,
  }
);

const TaskChecklistBoard = dynamic(
  () => import("@/features/tasks").then((mod) => mod.TaskChecklistBoard),
  {
    loading: () => <TabContentSkeleton tab="tasks" />,
  }
);

const SprintsTabContent = dynamic(
  () => import("@/features/sprints").then((mod) => mod.SprintsTabContent),
  {
    loading: () => <TabContentSkeleton tab="sprints" />,
  }
);

const FinanceTabContent = dynamic(
  () => import("@/features/finance").then((mod) => mod.FinanceTabContent),
  {
    loading: () => <TabContentSkeleton tab="finance" />,
  }
);

const AssetGallery = dynamic(
  () => import("@/features/assets").then((mod) => mod.AssetGallery),
  {
    loading: () => <TabContentSkeleton tab="assets" />,
  }
);

const ActivityTabContent = dynamic(
  () => import("@/features/activity").then((mod) => mod.ActivityTabContent),
  {
    loading: () => <TabContentSkeleton tab="activity" />,
  }
);

function ProjectDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const tab = searchParams?.get("tab") || "prd";

  const { markTabLoaded, setActiveTab } = useGlobalState();
  const { data: project, isLoading, isError, error } = useProjectQuery(id);

  // Sync active tab and loaded tracking to global state
  useEffect(() => {
    if (id && tab) {
      setActiveTab(id, tab);
      markTabLoaded(id, tab);
    }
  }, [id, tab, setActiveTab, markTabLoaded]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Spinner className="size-6 text-primary" />
        <p className="text-xs text-muted-foreground">Memuat data proyek...</p>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="bg-card border border-border rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
        <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <HugeiconsIcon icon={Folder01Icon} className="size-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Proyek Tidak Ditemukan</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-6">
          {error?.message || "Proyek dengan ID tersebut tidak terdaftar di dalam sistem."}
        </p>
        <Button asChild variant="outline" className="rounded-full text-xs h-9 px-4">
          <Link href="/projects">
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-3.5 mr-1.5" aria-hidden="true" />
            Kembali ke Daftar Proyek
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ProjectDetailHeader project={project} activeTab={tab} />

      {/* Banner Persetujuan Status (US-2: Tampil dinamis jika ada permohonan status pending) */}
      <StatusApprovalBanner projectId={project.id} currentStatus={project.status} />

      {/* Tautan Repositori Berlabel & Switcher Monorepo (US-2) */}
      <ProjectRepositoriesCard projectId={project.id} />

      {tab === "prd" && <PrdEditorSplitPane project={project} />}
      {tab === "tasks" && <TaskChecklistBoard project={project} />}
      {tab === "sprints" && <SprintsTabContent project={project} />}
      {tab === "finance" && <FinanceTabContent project={project} />}
      {tab === "assets" && <AssetGallery project={project} />}
      {tab === "activity" && <ActivityTabContent project={project} />}
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
          <Spinner className="size-6 text-primary" />
          <p className="text-xs text-muted-foreground">Menyiapkan halaman...</p>
        </div>
      }
    >
      <ProjectDetailContent />
    </Suspense>
  );
}
