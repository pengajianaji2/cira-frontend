"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  if (!user?.roles.includes("owner")) return <p className="p-8 text-sm text-muted-foreground">Halaman ini hanya tersedia untuk owner.</p>;
  if (query.isLoading) return <p className="p-8 text-sm text-muted-foreground">Memuat policy akses…</p>;
  if (query.isError || !query.data) return <p role="alert" className="p-8 text-sm text-destructive">Policy tidak dapat dimuat. Pastikan migrasi database sudah dijalankan.</p>;

  const updatePermission = (policy: Policy, permission: string, checked: boolean) => {
    const permissions = checked ? [...new Set([...policy.permissions, permission])] : policy.permissions.filter((item) => item !== permission);
    if (policy.role === "owner" && !permissions.includes("policies.manage")) {
      toast.error("Akses pengelolaan policy wajib tetap aktif untuk owner."); return;
    }
    mutation.mutate({ role: policy.role, permissions });
  };
  const groups = [...new Set(query.data.permissions.map((item) => item.group))];

  return <div className="mx-auto max-w-5xl space-y-6 p-6">
    <div><h1 className="text-2xl font-bold">Policy Akses</h1><p className="mt-1 text-sm text-muted-foreground">Owner dapat mengatur capability setiap role. Perubahan diterapkan langsung pada API.</p></div>
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Permission pengelolaan policy untuk owner dikunci agar akses administratif tidak hilang dan owner tidak terkunci dari pengaturan akses.</div>
    {query.data.policies.map((policy) => <Card key={policy.role}>
      <CardHeader><CardTitle className="capitalize">{policy.role}</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {groups.map((group) => <section key={group}><h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group}</h2><div className="divide-y rounded-lg border">{query.data!.permissions.filter((item) => item.group === group).map((item) => {
          const locked = policy.role === "owner" && item.key === "policies.manage";
          return <label key={item.key} className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm"><span>{item.label}</span><input aria-label={`${policy.role}: ${item.label}`} type="checkbox" checked={policy.permissions.includes(item.key)} disabled={locked || mutation.isPending} onChange={(event) => updatePermission(policy, item.key, event.target.checked)} className="size-4 accent-primary" /></label>;
        })}</div></section>)}
      </CardContent>
    </Card>)}
    <p className="text-xs text-muted-foreground">Jika pengguna memiliki lebih dari satu role, aksesnya adalah gabungan capability dari role-role tersebut.</p>
    <Card><CardHeader><CardTitle>Riwayat perubahan policy</CardTitle></CardHeader><CardContent className="space-y-3">{historyQuery.data?.length ? historyQuery.data.map((item) => <div key={item.id} className="border-b pb-3 text-sm last:border-0"><p className="font-medium">{item.role} · {new Date(item.createdAt).toLocaleString("id-ID")}</p><p className="text-xs text-muted-foreground">Diubah oleh {item.actorEmail}</p>{item.addedPermissions.length > 0 && <p className="mt-1 text-xs text-emerald-700">Ditambahkan: {item.addedPermissions.join(", ")}</p>}{item.removedPermissions.length > 0 && <p className="mt-1 text-xs text-amber-700">Dicabut: {item.removedPermissions.join(", ")}</p>}</div>) : <p className="text-sm text-muted-foreground">Belum ada perubahan policy.</p>}</CardContent></Card>
    <Button variant="outline" onClick={() => void query.refetch()} disabled={mutation.isPending}>Muat ulang policy</Button>
  </div>;
}
