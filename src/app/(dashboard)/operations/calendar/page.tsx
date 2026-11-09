import React, { Suspense } from "react";
import { Metadata } from "next";
import { CardSkeleton } from "@/shared/components";
import { OperationalCalendarWorkspace } from "@/features/operations";

export const metadata: Metadata = {
  title: "Kalender Operasional - Cira PM",
  description:
    "Kalender operasional teragregasi untuk Sprint, Termin Ready, Invoice Jatuh Tempo, dan Agenda Manual (WIB).",
};

export default function OperationalCalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto space-y-5">
          <CardSkeleton lines={3} />
          <CardSkeleton lines={8} hasHeader={false} />
        </div>
      }
    >
      <OperationalCalendarWorkspace />
    </Suspense>
  );
}
