import { Folder01Icon, UserIcon } from "@hugeicons/core-free-icons";

export interface NavigationItem {
  title: string;
  href: string;
  icon: typeof Folder01Icon;
  badge?: string;
  roles?: string[]; // optional role filter
}

export const navigationConfig: NavigationItem[] = [
  {
    title: "Daftar Proyek",
    href: "/projects",
    icon: Folder01Icon,
  },
  {
    title: "Profil Saya",
    href: "/profile",
    icon: UserIcon,
  },
];
