import { useEffect, useMemo, useState } from "react";
import { dashboardService } from "../dashboardService.js";
import type { LaunchCommands, LaunchItem } from "../types.js";

export function useLaunchCommands() {
  const [launch, setLaunch] = useState<LaunchCommands | null>(null);

  useEffect(() => {
    dashboardService.getLaunchCommands().then(setLaunch).catch(() => {});
  }, []);

  const items: LaunchItem[] = useMemo(() => {
    if (!launch) return [];
    return [
      { id: "all", label: "All providers", badge: "--all", cmd: launch.all },
      ...launch.perProvider.map((p) => ({
        id: p.id,
        label: p.label,
        badge: `--${p.id.replace(/_/g, "")}`,
        cmd: p.cli,
      })),
    ];
  }, [launch]);

  return { launch, items };
}
