import { http } from "../../shared/api/http.js";
import type {
  GatewayStatus,
  InstallResponse,
  LaunchCommands,
  ShellName,
  ShellSetup,
  StatsResponse,
} from "./types.js";

export const dashboardService = {
  getStatus: () => http.get<GatewayStatus>("/status"),
  getStats: () => http.get<StatsResponse>("/stats"),
  getLaunchCommands: () => http.get<LaunchCommands>("/launch-commands"),
  getShellSetup: () => http.get<ShellSetup>("/shell-setup"),
  installShellSetup: (shells: ShellName[]) =>
    http.post<InstallResponse>("/shell-setup/install", { shells }),
};
