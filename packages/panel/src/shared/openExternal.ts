import { invoke } from "@tauri-apps/api/core";

export function openExternal(url: string): void {
  void invoke("open_url", { url });
}
