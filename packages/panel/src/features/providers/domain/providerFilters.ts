import type { ProviderInfo } from "./types.js";

export type ProviderStatusFilter = "all" | "active" | "inactive";

export interface ProviderFilters {
  searchTerm: string;
  status: ProviderStatusFilter;
}

export function getProviderStatusOptions(
  t: (key: string, replacements?: Record<string, string>) => string,
): Array<{ label: string; value: ProviderStatusFilter }> {
  return [
    { label: t("status.all"), value: "all" },
    { label: t("status.enabled"), value: "active" },
    { label: t("status.disabled"), value: "inactive" },
  ];
}

export function filterProviders(
  providers: ProviderInfo[],
  filters: ProviderFilters,
): ProviderInfo[] {
  const query = filters.searchTerm.trim().toLowerCase();

  return providers.filter((provider) => {
    if (query && !provider.label.toLowerCase().includes(query)) {
      return false;
    }

    return matchesStatusFilter(provider, filters.status);
  });
}

function matchesStatusFilter(provider: ProviderInfo, status: ProviderStatusFilter): boolean {
  if (status === "active") return provider.enabled;
  if (status === "inactive") return !provider.enabled;
  return true;
}
