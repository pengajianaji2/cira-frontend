"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockKeyIcon, Shield01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CalendarAccessDenied() {
  return (
    <section
      aria-labelledby="calendar-access-denied-title"
      className="py-8 md:py-14 flex items-center justify-center"
    >
      <Card className="max-w-lg w-full rounded-3xl border-destructive/25 bg-card shadow-xs">
        <CardContent className="p-6 md:p-8 text-center space-y-4">
          <div className="mx-auto size-14 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center">
            <HugeiconsIcon icon={LockKeyIcon} className="size-7" aria-hidden="true" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[11px] font-semibold">
              <HugeiconsIcon icon={Shield01Icon} className="size-3.5" aria-hidden="true" />
              <span>403 · Akses Ditolak</span>
            </div>
            <h1
              id="calendar-access-denied-title"
              className="text-lg md:text-xl font-bold text-foreground tracking-tight"
            >
              Kalender Operasional Khusus Owner &amp; Operasional
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Peran Anda saat ini tidak memiliki izin{" "}
              <code className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-muted text-foreground">
                operations.calendar.read
              </code>{" "}
              untuk membuka kalender global lintas proyek dan data penagihan. Silakan kembali ke
              daftar proyek yang ditugaskan di roster Anda.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <Button asChild size="sm" className="rounded-full px-5 h-9 text-xs font-semibold">
              <Link href="/projects">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5 mr-1.5" aria-hidden="true" />
                Kembali ke Daftar Proyek
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
