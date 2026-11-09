import {
  Calendar03Icon,
  Folder01Icon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

export interface NavigationItem {
  title: string;
  href: string;
  icon: typeof Folder01Icon;
  badge?: string;
  roles?: string[]; // filter role opsional
  permission?: string;
}

export const navigationConfig: NavigationItem[] = [
  {
    title: "Daftar Proyek",
    href: "/projects",
    icon: Folder01Icon,
  },
  {
    title: "Kalender Operasional",
    href: "/operations/calendar",
    icon: Calendar03Icon,
    permission: "operations.calendar.read",
  },
  {
    title: "Direktori Tim",
    href: "/directory",
    icon: UserGroupIcon,
    permission: "directory.read",
  },
  {
    title: "Profil Saya",
    href: "/profile",
    icon: UserIcon,
  },
  {
    title: "Kelola Akses",
    href: "/access-policies",
    icon: UserGroupIcon,
    roles: ["owner"],
    permission: "policies.manage",
  },
];
