"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileEditIcon,
  ViewIcon,
  FloppyDiskIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
import { Project, DEFAULT_PRD_TEMPLATE } from "../types/projects.types";
import { useUpdateProjectPrdMutation } from "../queries/projects.queries";
import { PrdExportButton } from "./PrdExportButton";
import { PrdVersionDrawer } from "./PrdVersionDrawer";

interface PrdEditorSplitPaneProps {
  project: Project;
}

export function PrdEditorSplitPane({ project }: PrdEditorSplitPaneProps) {
  const [content, setContent] = useState(
    project.prdContent || DEFAULT_PRD_TEMPLATE(project.name, project.clientName)
  );
  const [activeMobileView, setActiveMobileView] = useState<"editor" | "preview">("editor");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const updatePrdMutation = useUpdateProjectPrdMutation();

  const isDirty = content !== project.prdContent;

  const handleSave = () => {
    updatePrdMutation.mutate({
      id: project.id,
      prdContent: content,
    });
  };

  const handleConfirmResetTemplate = () => {
    setContent(DEFAULT_PRD_TEMPLATE(project.name, project.clientName));
    setIsResetDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          {/* Mobile switcher */}
          <div className="flex md:hidden items-center bg-muted/60 p-1 rounded-full text-xs">
            <button
              type="button"
              onClick={() => setActiveMobileView("editor")}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeMobileView === "editor"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileView("preview")}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeMobileView === "preview"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Live Preview
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <HugeiconsIcon icon={FileEditIcon} className="size-4 text-primary" aria-hidden="true" />
              Editor PRD Markdown Terstruktur
            </span>
            <span aria-hidden="true">•</span>
            <span>Snapshot GZIP</span>
            {isDirty && (
              <span className="text-[11px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                Ada perubahan belum disimpan
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons (US-2) */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsResetDialogOpen(true)}
            className="rounded-full text-xs h-9 px-3 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Reset ke template bawaan"
          >
            <HugeiconsIcon icon={RefreshIcon} className="size-3.5 mr-1" aria-hidden="true" />
            Reset Template
          </Button>

          <PrdVersionDrawer
            projectId={project.id}
            currentContent={content}
            onRestore={(restoredContent) => setContent(restoredContent)}
          />

          <PrdExportButton project={{ ...project, prdContent: content }} />

          <Button
            type="button"
            onClick={handleSave}
            disabled={updatePrdMutation.isPending || !isDirty}
            className="rounded-full text-xs h-9 px-4 font-medium shadow-xs"
          >
            {updatePrdMutation.isPending ? (
              <>
                <Spinner className="size-3.5 mr-1.5" />
                Menyimpan...
              </>
            ) : (
              <>
                <HugeiconsIcon icon={FloppyDiskIcon} className="size-4 mr-1.5" aria-hidden="true" />
                Simpan Versi PRD
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Split-Pane Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch min-h-[580px]">
        {/* Sisi Kiri: Markdown Editor Textarea */}
        <div
          className={`bg-card border border-border rounded-2xl flex flex-col shadow-xs overflow-hidden ${
            activeMobileView === "editor" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium flex items-center gap-1.5">
              <HugeiconsIcon icon={FileEditIcon} className="size-3.5 text-primary" aria-hidden="true" />
              Source Markdown
            </span>
            <span className="text-[11px]">Format Markdown didukung</span>
          </div>
          <div className="p-3 flex-1 flex flex-col">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              aria-label="Editor Source Markdown PRD"
              placeholder="Tuliskan spesifikasi PRD proyek di sini menggunakan format Markdown..."
              className="w-full flex-1 p-3 font-mono text-xs text-foreground bg-transparent resize-none focus:outline-none leading-relaxed placeholder:text-muted-foreground/50 rounded-xl"
              style={{ minHeight: "520px" }}
            />
          </div>
        </div>

        {/* Sisi Kanan: Live Markdown Preview */}
        <div
          className={`bg-card border border-border rounded-2xl flex flex-col shadow-xs overflow-hidden ${
            activeMobileView === "preview" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium flex items-center gap-1.5">
              <HugeiconsIcon icon={ViewIcon} className="size-3.5 text-emerald-500" aria-hidden="true" />
              Live Document Preview
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              Pratinjau Dokumen Klien
            </span>
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[580px] bg-background/50">
            <div className="prose prose-sm max-w-none text-xs leading-relaxed space-y-3">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-3 mt-1">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-1 mt-4 mb-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xs font-semibold text-foreground mt-3 mb-1">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-xs text-muted-foreground leading-relaxed my-2">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground my-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 space-y-1 text-xs text-muted-foreground my-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary pl-3 py-1 italic text-muted-foreground bg-primary/5 rounded-r my-2 text-xs">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono text-primary border border-border/50">
                      {children}
                    </code>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* AlertDialog Konfirmasi Reset Template PRD */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Atur Ulang Dokumen PRD?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Isi editor saat ini akan diganti dengan template PRD bawaan proyek. Perubahan belum memengaruhi riwayat tersimpan sebelum Anda menekan Simpan Versi PRD.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full text-xs h-9">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmResetTemplate}
              className="rounded-full text-xs h-9 font-semibold"
            >
              Ya, Reset Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
