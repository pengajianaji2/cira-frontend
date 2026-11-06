"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download04Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Project } from "../types/projects.types";
import { PrdPdfDocument } from "./PrdPdfDocument";

interface PrdExportButtonProps {
  project: Project;
}

export function PrdExportButton({ project }: PrdExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(<PrdPdfDocument project={project} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = project.name
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase()
        .replace(/-+/g, "-");
      link.href = url;
      link.download = `PRD-${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Dokumen PDF Berhasil Diekspor", {
        description: `File PRD-${safeName}.pdf berhasil diunduh.`,
      });
    } catch (err: unknown) {
      console.error("Gagal export PDF:", err);
      toast.error("Gagal mengekspor dokumen PDF", {
        description: "Terjadi gangguan saat merender dokumen resmi.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className="rounded-full text-xs h-9 px-4 font-medium shadow-xs"
    >
      {isExporting ? (
        <>
          <Spinner className="size-3.5 mr-1.5" />
          Membuat PDF...
        </>
      ) : (
        <>
          <HugeiconsIcon
            icon={Download04Icon}
            className="size-4 mr-1.5 text-primary"
          />
          Ekspor PDF
        </>
      )}
    </Button>
  );
}
