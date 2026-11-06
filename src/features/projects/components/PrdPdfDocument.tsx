import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Project } from "../types/projects.types";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1e293b",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#0f172a",
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },
  logoText: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#16a34a",
  },
  metaBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaCol: {
    width: "48%",
  },
  metaItem: {
    marginBottom: 4,
    flexDirection: "row",
  },
  metaLabel: {
    width: 80,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
  },
  metaValue: {
    flex: 1,
    fontSize: 9,
    color: "#0f172a",
  },
  contentSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  paragraph: {
    marginBottom: 6,
    textAlign: "justify",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#94a3b8",
  },
});

interface PrdPdfDocumentProps {
  project: Project;
}

export function PrdPdfDocument({ project }: PrdPdfDocumentProps) {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Simple parser to separate paragraphs/sections from markdown text
  const cleanLines = project.prdContent
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <Document title={`PRD - ${project.name}`} author="Cira Project Management">
      <Page size="A4" style={styles.page}>
        {/* Header Dokumen */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Product Requirements Document</Text>
            <Text style={styles.headerSubtitle}>Spesifikasi Teknis & Lingkup Pekerjaan Resmi</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.logoText}>CIRA PM</Text>
            <Text style={styles.headerSubtitle}>Dokumen Terverifikasi</Text>
          </View>
        </View>

        {/* Metadata Proyek */}
        <View style={styles.metaBox}>
          <View style={styles.metaCol}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Nama Proyek:</Text>
              <Text style={styles.metaValue}>{project.name}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Klien:</Text>
              <Text style={styles.metaValue}>{project.clientName}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Kontak Klien:</Text>
              <Text style={styles.metaValue}>{project.clientContact}</Text>
            </View>
          </View>

          <View style={styles.metaCol}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>ID Dokumen:</Text>
              <Text style={styles.metaValue}>{project.id}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Status Pipeline:</Text>
              <Text style={styles.metaValue}>{project.status.toUpperCase()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Tanggal Terbit:</Text>
              <Text style={styles.metaValue}>{currentDate}</Text>
            </View>
          </View>
        </View>

        {/* Konten Dokumen PRD */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Isi Dokumen Spesifikasi</Text>
          {cleanLines.map((line, idx) => {
            const isHeading = line.startsWith("#");
            const headingText = line.replace(/^#+\s*/, "");
            if (isHeading) {
              return (
                <Text
                  key={idx}
                  style={{
                    fontFamily: "Helvetica-Bold",
                    fontSize: line.startsWith("## ") ? 11 : 10,
                    color: "#0f172a",
                    marginTop: 8,
                    marginBottom: 4,
                  }}
                >
                  {headingText}
                </Text>
              );
            }
            return (
              <Text key={idx} style={styles.paragraph}>
                {line.replace(/\*\*/g, "")}
              </Text>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Cira Project Management — Rahasia & Terbatas</Text>
          <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
