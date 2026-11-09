export interface RolePermissionItem {
  roles?: string[];
  permission?: string;
}

export interface DashboardUserShape {
  name?: string | null;
  roles?: string[] | null;
  avatarUrl?: string | null;
}

export interface DashboardUserSummary {
  displayName: string;
  primaryRole: string;
  avatarUrl: string | null;
}

/**
 * Filter navigation items based on the signed-in user's roles and effective permissions.
 */
export function filterNavigationItems<T extends RolePermissionItem>(
  items: readonly T[],
  userRoles: readonly string[] | null | undefined,
  permissions: readonly string[] | null | undefined,
): T[] {
  const normalizedRoles = (userRoles ?? [])
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean);
  const permissionSet = new Set((permissions ?? []).filter(Boolean));

  return items.filter((item) => {
    const roleAllowed =
      !item.roles?.length ||
      item.roles.some((requiredRole) => normalizedRoles.includes(requiredRole.trim().toLowerCase()));
    const permissionAllowed = !item.permission || permissionSet.has(item.permission);
    return roleAllowed && permissionAllowed;
  });
}

/**
 * Determine whether a navigation item matches the active route pathname (exact or descendant path).
 */
export function isNavigationHrefActive(pathname: string, href: string): boolean {
  if (!pathname || !href) return false;
  if (pathname === href) return true;

  const normalizedHref = href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
  return pathname.startsWith(`${normalizedHref}/`);
}

/**
 * Normalize user identity fields for the sidebar footer account card.
 */
export function getDashboardUserSummary(
  user?: DashboardUserShape | null,
): DashboardUserSummary {
  const displayName = user?.name?.trim() || "Anggota Tim";
  const primaryRole =
    user?.roles?.find((role) => role.trim().length > 0)?.trim() || "Anggota";
  const avatarUrl = user?.avatarUrl?.trim() ? user.avatarUrl.trim() : null;

  return {
    displayName,
    primaryRole,
    avatarUrl,
  };
}
