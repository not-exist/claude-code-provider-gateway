import { http } from "../../shared/api/http.js";
import type { SessionsResponse, StatsResponse } from "./types.js";

export const historyService = {
  list: () => http.get<SessionsResponse>("/sessions"),
  stats: () => http.get<StatsResponse>("/stats"),
  clearArchive: () => http.delete<SessionsResponse>("/sessions"),
};
