"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, Shield01Icon } from "@hugeicons/core-free-icons";
import { apiClient } from "@/shared/lib/api-client";
import { PageHeaderCard } from "@/shared/components";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MY_PERMISSIONS_QUERY_KEY } from "@/features/auth/queries/auth.queries";

type Permission = { key: string; label: string; group: string };
type Policy = { role: string; permissions: string[] };
type PolicyChange = { id: string; role: string; actorEmail: string; addedPermissions: string[]; removedPermissions: string[]; createdAt: string };

export default function AccessPoliciesPage() {
  const user = useAuthStore((state) => state.user);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["policies"],
    queryFn: async () => (await apiClient.get<{ data: { policies: Policy[]; permissions: Permission[] } }>("/policies")).data.data,
    enabled: user?.roles.includes("owner") === true,
  });
  const mutation = useMutation({
    mutationFn: async ({ role, permissions }: Policy) => (await apiClient.put(`/policies/${role}`, { permissions })).data,
    onSuccess: () => { void client.invalidateQueries({ queryKey: ["policies"] }); void client.invalidateQueries({ queryKey: MY_PERMISSIONS_QUERY_KEY }); void client.invalidateQueries({ queryKey: ["policies", "history"] }); toast.success("Policy akses disimpan."); },
    onError: (error: Error) => toast.error(error.message),
  });
  const historyQuery = useQuery({
    queryKey: ["policies", "history"],
    queryFn: async () => (await apiClient.get<{ data: { history: PolicyChange[] } }>("/policies/history")).data.data.history,
    enabled: user?.roles.includes("owner") === true,
  });

  const headerCard = (
    <PageHeaderCard
      icon={Shield01Icon}
      title="Policy Akses"
      description="Owner dapat mengatur capability setiap role. Perubahan diterapkan langsung pada API."
    />
  );

  if (!user?.roles.includes("owner")) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        {headerCard}
        <Card className="rounded-3xl border border-border bg-card shadow-xs ring-0">
          <CardContent className="px-6">
            <p role="status" className="text-sm text-muted-foreground">
              Halaman ini hanya tersedia untuk owner.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        {headerCard}
        <Card className="rounded-3xl border border-border bg-card shadow-xs ring-0">
          <CardContent className="px-6">
            <div role="status" className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <div
                className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent shrink-0"
                aria-hidden="true"
              />
              <span>Memuat policy akses…</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        {headerCard}
        <div
          role="alert"
          className="rounded-3xl border border-destructive/30 bg-card p-6 text-sm shadow-xs space-y-3"
        >
          <p className="font-medium text-destructive">
            Policy tidak dapat dimuat. Pastikan migrasi database sudah dijalankan.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void query.refetch()}
            className="min-h-11 sm:min-h-9 rounded-xl"
          >
            Muat ulang policy
          </Button>
        </div>
      </div>
    );
  }

  const updatePermission = (policy: Policy, permission: string, checked: boolean) => {
    const permissions = checked
      ? [...new Set([...policy.permissions, permission])]
      : policy.permissions.filter((item) => item !== permission);
    if (policy.role === "owner" && !permissions.includes("policies.manage")) {
      toast.error("Akses pengelolaan policy wajib tetap aktif untuk owner.");
      return;
    }
    mutation.mutate({ role: policy.role, permissions });
  };
  const groups = [...new Set(query.data.permissions.map((item) => item.group))];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {headerCard}

      <Card className="rounded-3xl border border-border bg-card shadow-xs ring-0 py-4 sm:py-5">
        <CardContent className="px-4 sm:px-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex items-start gap-3">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="size-5 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="leading-relaxed">
              Permission pengelolaan policy untuk owner dikunci agar akses administratif tidak
              hilang dan owner tidak terkunci dari pengaturan akses.
            </p>
          </div>
        </CardContent>
      </Card>

      {query.data.policies.map((policy) => (
        <Card
          key={policy.role}
          className="rounded-3xl border border-border bg-card shadow-xs ring-0"
        >
          <CardHeader>
            <CardTitle>
              <h2 className="text-base font-semibold capitalize text-foreground">
                {policy.role}
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {groups.map((group, groupIndex) => {
              const headingId = `policy-group-${policy.role}-${groupIndex}`;
              return (
                <section key={group} aria-labelledby={headingId}>
                  <h3
                    id={headingId}
                    className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {group}
                  </h3>
                  <div className="divide-y rounded-lg border">
                    {query.data!.permissions
                      .filter((item) => item.group === group)
                      .map((item) => {
                        const locked = policy.role === "owner" && item.key === "policies.manage";
                        const checkboxId = `policy-${policy.role}-${item.key}`;
                        return (
                          <label
                            key={item.key}
                            htmlFor={checkboxId}
                            className="flex items-center justify-between gap-4 px-3.5 py-3 min-h-11 text-sm cursor-pointer hover:bg-muted/40 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            <span>{item.label}</span>
                            <input
                              id={checkboxId}
                              aria-label={`${policy.role}: ${item.label}`}
                              type="checkbox"
                              checked={policy.permissions.includes(item.key)}
                              disabled={locked || mutation.isPending}
                              onChange={(event) =>
                                updatePermission(policy, item.key, event.target.checked)
                              }
                              className="size-4 shrink-0 rounded accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                            />
                          </label>
                        );
                      })}
                  </div>
                </section>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <Card className="rounded-3xl border border-border bg-card shadow-xs ring-0">
        <CardHeader>
          <CardTitle>
            <h2 className="text-base font-semibold text-foreground">
              Riwayat perubahan policy
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Jika pengguna memiliki lebih dari satu role, aksesnya adalah gabungan capability dari
            role-role tersebut.
          </p>

          {historyQuery.data?.length ? (
            <ul className="divide-y">
              {historyQuery.data.map((item) => (
                <li key={item.id} className="py-3 first:pt-0 last:pb-0 text-sm">
                  <p className="font-medium capitalize">
                    {item.role} · {new Date(item.createdAt).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Diubah oleh {item.actorEmail}
                  </p>
                  {item.addedPermissions.length > 0 && (
                    <p className="mt-1 text-xs text-emerald-700">
                      Ditambahkan: {item.addedPermissions.join(", ")}
                    </p>
                  )}
                  {item.removedPermissions.length > 0 && (
                    <p className="mt-1 text-xs text-amber-700">
                      Dicabut: {item.removedPermissions.join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada perubahan policy.</p>
          )}
        </CardContent>
        <CardFooter className="border-t border-border/70 justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 sm:min-h-9 rounded-xl"
            onClick={() => void query.refetch()}
            disabled={mutation.isPending}
          >
            Muat ulang policy
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
