import React from "react";
import { DashboardShell } from "@/layouts/DashboardLayout/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
