import { Folder01Icon, UserGroupIcon, UserIcon } from "@hugeicons/core-free-icons";

export interface NavigationItem {
  title: string;
  href: string;
  icon: typeof Folder01Icon;
  badge?: string;
  roles?: string[]; // filter role opsional
}

export const navigationConfig: NavigationItem[] = [
  {
    title: "Daftar Proyek",
    href: "/projects",
    icon: Folder01Icon,
  },
  {
    title: "Direktori Tim",
    href: "/directory",
    icon: UserGroupIcon,
  },
  {
    title: "Profil Saya",
    href: "/profile",
    icon: UserIcon,
  },
];
