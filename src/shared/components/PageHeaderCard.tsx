import React from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

/** Properti komponen `PageHeaderCard` untuk kartu header workspace seragam. */
export interface PageHeaderCardProps {
  /** Ikon SVG Hugeicons yang ditampilkan dalam wadah aksen lembut di sisi kiri. */
  icon: IconSvgElement;
  /** Judul utama halaman (`<h1>`). */
  title: string;
  /** Keterangan singkat mengenai fungsi halaman. */
  description: React.ReactNode;
  /** Lencana ringkas opsional di samping judul (misalnya jumlah anggota aktif). */
  badge?: React.ReactNode;
  /** Tombol aksi utama opsional di sisi kanan header (tanpa kontrol filter/pencarian). */
  action?: React.ReactNode;
  /** ID opsional untuk elemen heading utama `<h1>`. */
  titleId?: string;
  /** Kelas utilitas tambahan untuk penyesuaian layout wadah. */
  className?: string;
}

/**
 * Kartu header workspace bersama yang seragam di bagian atas setiap menu utama dashboard:
 * hanya memuat ikon, judul, lencana ringkas opsional, keterangan singkat, dan tombol aksi utama opsional.
 */
export function PageHeaderCard({
  icon,
  title,
  description,
  badge,
  action,
  titleId,
  className,
}: PageHeaderCardProps) {
  return (
    <header
      data-slot="page-header-card"
      className={cn(
        "bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        className,
      )}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <div className="size-10 md:size-11 rounded-2xl bg-accent border border-border/80 text-accent-foreground flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={icon} className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1
              id={titleId}
              className="text-xl md:text-2xl font-bold tracking-tight text-foreground text-balance"
            >
              {title}
            </h1>
            {badge ? <div className="shrink-0">{badge}</div> : null}
          </div>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-relaxed max-w-2xl text-pretty">
            {description}
          </p>
        </div>
      </div>

      {action ? (
        <div className="shrink-0 flex items-center gap-2 empty:hidden">
          {action}
        </div>
      ) : null}
    </header>
  );
}
