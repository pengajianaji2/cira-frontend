# Project Configuration & Conventions — Frontend (`cira-pm-frontend`)

Dokumen ini mendefinisikan konfigurasi teknis, gaya koding, arsitektur, dan alur pengerjaan khusus untuk repositori **Frontend (`pm-web`)** di `./frontend`.

---

## 1. Tech Stack & Environment
- **Project Structure**: Standalone Next.js App di `./frontend`
- **Language & Runtime**: TypeScript 5+ (Node.js 20+)
- **Framework**: Next.js 16.4.5 (App Router, React 19)
- **UI & Styling**: Tailwind CSS v4, shadcn/ui (`radix-maia` style), Radix UI, Base UI
- **Icons**: Hugeicons (`@hugeicons/react`, `@hugeicons/core-free-icons`)
- **Server State & Caching**: TanStack React Query v5 (`@tanstack/react-query`)
- **Client & UI State**: Zustand v5
- **Table & Data View**: TanStack Table v9 (`@tanstack/react-table`)
- **HTTP Client**: Axios singleton (`withCredentials: true`) di `src/shared/lib/api-client.ts`
- **Form & Validation**: React Hook Form (`react-hook-form`), Zod (`zod: ^4.6.7`), `@hookform/resolvers`
- **Notifications**: Sonner (`sonner`)
- **PDF & Document**: `@react-pdf/renderer`, `react-to-print`
- **Package Manager & Commands**:
  - Install dependencies: `npm install <package>` (dieksekusi manusia)
  - Jalankan dev server: `npm run dev`
  - Linting: `npm run lint`
  - Build produksi: `npm run build`

---

## 2. Struktur Direktori Baku (5-Layer Feature Module)
```text
frontend/src/
├── app/                  # Next.js App Router (thin pages & route handlers)
│   ├── (auth)/           # Route group autentikasi (login, activate)
│   ├── (dashboard)/      # Route group dashboard (projects, directory, profile)
│   ├── providers/        # QueryClientProvider, ThemeProvider, Toaster
│   ├── globals.css       # CSS Variables & Tailwind theme
│   └── layout.tsx        # Root layout
├── components/
│   └── ui/               # shadcn/ui components (radix-maia)
├── features/             # Modul fitur terisolasi (5 lapisan)
│   └── <fitur>/
│       ├── api/          # HTTP request functions (Axios)
│       ├── queries/      # TanStack Query custom hooks
│       ├── components/   # Komponen UI spesifik fitur
│       ├── types/        # TypeScript types & interfaces
│       └── index.ts      # Public API fitur (satu-satunya pintu keluar)
├── layouts/
│   ├── navigation.config.ts  # Config-driven menu & navigation
│   └── DashboardLayout/  # Dashboard shell layout
├── shared/               # Reusable code across features
│   ├── components/       # Shared UI components
│   ├── hooks/            # Shared React hooks
│   ├── lib/              # Axios instance, query client
│   ├── types/            # Envelope responses, pagination, shared types
│   └── utils/            # Shared pure utility functions
└── hooks/                # Global hooks (use-mobile, etc.)
```

---

## 3. Gaya Koding & Aturan Arsitektur
1. **Public API Enforced**: Halaman `app/` atau modul luar hanya boleh mengimpor dari `features/<fitur>/index.ts`. Dilarang mengimpor file internal antar fitur.
2. **Thin Pages**: Halaman `page.tsx` hanya bertindak sebagai shell tipis yang mengimpor komponen dari `features/`.
3. **Strict Typing**: Hindari penggunaan tipe `any`. Gunakan interface/types yang didefinisikan di `features/<fitur>/types/`.
4. **Config-Driven Navigation**: Perubahan menu/navigasi dilakukan melalui konfigurasi di `layouts/navigation.config.ts` dengan dukungan filter role (`roles?: string[]`).
5. **Styling & Icon**: Gunakan utilitas Tailwind `cn()` dan `@hugeicons/react`.

---

## 4. Konvensi Commit & Git
- **Base Branch**: `main`
- **Branch per User Story**: `feat/us-<N>-<slug>`
- **Format Commit**: Conventional Commits (`feat:`, `fix:`, `style:`, `refactor:`, `test:`, `chore:`)
- **Eksekusi**: Commit dan push selalu dijalankan oleh manusia di terminal folder `frontend/`.
