import { http } from "../../shared/api/http.js";
import type { SettingsConfig, ServerConfig, WebToolsConfig } from "./types.js";

export const settingsService = {
  get: () => http.get<SettingsConfig>("/config"),
  save: (server: Partial<ServerConfig>, webTools: WebToolsConfig) =>
    http.put<unknown>("/config", { server, webTools }),
};
