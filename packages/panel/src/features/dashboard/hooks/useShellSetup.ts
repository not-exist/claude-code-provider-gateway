import { useEffect, useState } from "react";
import { dashboardService } from "../dashboardService.js";
import type { ShellSetup } from "../types.js";

export function useShellSetup() {
  const [setup, setSetup] = useState<ShellSetup | null>(null);

  useEffect(() => {
    dashboardService
      .getShellSetup()
      .then(setSetup)
      .catch(() => {});
  }, []);

  const refresh = () => {
    dashboardService
      .getShellSetup()
      .then(setSetup)
      .catch(() => {});
  };

  return { setup, refresh };
}
