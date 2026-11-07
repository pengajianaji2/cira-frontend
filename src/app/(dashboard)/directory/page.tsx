import React from "react";
import { Metadata } from "next";
import { DirectoryTable } from "@/features/directory";

export const metadata: Metadata = {
  title: "Direktori Tim - Cira PM",
  description: "Daftar personil tim, kontak resmi, dan pembagian hak akses produk Cira PM",
};

export default function DirectoryPage() {
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <DirectoryTable />
    </div>
  );
}
