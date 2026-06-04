import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { writePrivateFile } from "../core/files/private-file.js";
import { logger } from "../observability/log.js";
import { isSqliteStorageEnabled, readConfigJson, writeConfigJson } from "../storage/sqlite.js";
import { getConfigPath, getMasterKeyPath, getSecretsPath } from "./paths.js";
import type { BuiltInProviderId, Config, ProviderConfig } from "./schema.js";
import { OAUTH_PROVIDER_IDS, PROVIDER_DEFAULTS, PROVIDER_IDS } from "./schema.js";
import { extractSecretsToStore, hydrateSecretsFromStore } from "./secrets/config-splitter.js";
import { EncryptedFileSecretStore } from "./secrets/encrypted-file-store.js";
import { EncryptedSqliteSecretStore } from "./secrets/encrypted-sqlite-store.js";
import { resolveMasterKey } from "./secrets/master-key.js";
import type { SecretStore } from "./secrets/store.js";
import { SECRET_KEYS } from "./secrets/store.js";
import { normalizeConfig } from "./validation.js";

export {
  getConfigDir,
  getConfigPath,
  getCurrentSessionPath,
  getLogPath,
  getMasterKeyPath,
  getPidPath,
  getProviderLogoDir,
  getSecretsPath,
  getSessionArchivePath,
} from "./paths.js";

let cachedSecretStore: SecretStore | null = null;

export function getSecretStore(): SecretStore {
  if (cachedSecretStore) return cachedSecretStore;
  const { key } = resolveMasterKey(getMasterKeyPath());
  cachedSecretStore = isSqliteStorageEnabled()
    ? new EncryptedSqliteSecretStore(key)
    : new EncryptedFileSecretStore(getSecretsPath(), key);
  return cachedSecretStore;
}

function buildDefaultProviderConfig(id: BuiltInProviderId): ProviderConfig {
  const isOAuth = OAUTH_PROVIDER_IDS.has(id);
  return {
    enabled: false,
    apiKey: "",
    authType: isOAuth ? "oauth" : "api_key",
    oauth: isOAuth ? {} : undefined,
    baseUrl: PROVIDER_DEFAULTS[id]?.baseUrl,
    rateLimit: 0,
    rateWindow: 0,
    maxConcurrency: 0,
  };
}

function buildDefaultProviders(): Record<string, ProviderConfig> {
  return PROVIDER_IDS.reduce(
    (providers, id) => {
      providers[id] = buildDefaultProviderConfig(id);
      return providers;
    },
    {} as Record<string, ProviderConfig>,
  );
}

export function buildDefaultConfig(): Config {
  return {
    server: {
      proxyPort: readPortEnv("CCPG_PROXY_PORT", 49250),
      panelPort: readPortEnv("CCPG_PANEL_PORT", 6767),
      authToken: process.env.CCPG_AUTH_TOKEN || `sk_${randomBytes(16).toString("hex")}`,
    },
    providers: buildDefaultProviders(),
    routing: {
      default: { enabled: false, providerId: "", model: "" },
      opus: { enabled: false, providerId: "", model: "" },
      sonnet: { enabled: false, providerId: "", model: "" },
      haiku: { enabled: false, providerId: "", model: "" },
    },
    thinking: {
      enabled: true,
      opus: null,
      sonnet: null,
      haiku: null,
    },
    webTools: {
      enabled: true,
      allowPrivateNetworks: false,
    },
    proxy: {
      enabled: false,
      url: "",
    },
    tokenSavers: {
      rtkEnabled: false,
      cavemanEnabled: false,
      cavemanLevel: "lite",
    },
    activeProvider: "nvidia_nim",
    modelMode: "single",
    activeModelFallbackSlug: null,
    modelFallbacks: [],
    panelSettings: {
      favoriteProviders: [],
      favoritesTipDismissed: false,
    },
  };
}

export function loadConfig(): Config {
  const rawConfig = readStoredConfig();
  const store = getSecretStore();

  if (!rawConfig) {
    const fresh = buildDefaultConfig();
    saveConfig(fresh);
    return fresh;
  }

  try {
    const parsed = JSON.parse(rawConfig) as Partial<Config>;
    const defaults = buildDefaultConfig();
    const merged = applyRuntimeEnvOverrides(
      normalizeConfig(deepMerge(defaults, parsed) as Config, defaults),
    );
    const hasStoredAuthToken = store.get(SECRET_KEYS.serverAuthToken) !== null;

    // One-shot migration: legacy JSON has secrets inline → move them into the store.
    if (parsedJsonStillHasSecrets(parsed)) {
      extractSecretsToStore(merged, store);
      writeStoredConfig(JSON.stringify(merged, null, 2));
    }

    hydrateSecretsFromStore(merged, store);

    const decryptErrorKeys = store.getDecryptErrorKeys();
    if (decryptErrorKeys.length > 0) {
      // Master key changed (reinstall / keychain reset). The stored ciphertext
      // is unrecoverable — clear it so future saves write fresh entries.
      logger.warn(
        "config",
        `${decryptErrorKeys.length} secret(s) could not be decrypted; master key may have changed after reinstall. Clearing affected entries.`,
      );
      for (const key of decryptErrorKeys) {
        store.delete(key);
      }
      // Disable providers whose credentials are now gone so the UI gives a
      // clear signal (disabled) rather than silently failing with an empty key.
      for (const id of Object.keys(merged.providers)) {
        const provider = merged.providers[id];
        if (!provider?.enabled) continue;
        const hasApiKey = !!provider.apiKey;
        const hasOAuth = !!(
          provider.oauth?.accessToken ||
          provider.oauth?.refreshToken ||
          provider.oauth?.copilotToken
        );
        if (!hasApiKey && !hasOAuth) {
          provider.enabled = false;
        }
      }
      saveConfig(merged);
    } else if (!hasStoredAuthToken) {
      saveConfig(merged);
    }

    return merged;
  } catch {
    return buildDefaultConfig();
  }
}

export function saveConfig(config: Config): void {
  // Splitter mutates the clone, leaving the caller's object intact with its
  // secrets still populated for in-process use.
  const onDisk = structuredClone(config);
  extractSecretsToStore(onDisk, getSecretStore());
  writeStoredConfig(JSON.stringify(onDisk, null, 2));
}

export function isFirstRun(): boolean {
  return readStoredConfig() === null;
}

function readStoredConfig(): string | null {
  if (isSqliteStorageEnabled()) return readConfigJson();
  const path = getConfigPath();
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf-8");
}

function writeStoredConfig(value: string): void {
  if (isSqliteStorageEnabled()) {
    writeConfigJson(value);
    return;
  }
  writePrivateFile(getConfigPath(), value);
}

function readPortEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const port = Number.parseInt(value, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) return fallback;
  return port;
}

function applyRuntimeEnvOverrides(config: Config): Config {
  config.server.proxyPort = readPortEnv("CCPG_PROXY_PORT", config.server.proxyPort);
  config.server.panelPort = readPortEnv("CCPG_PANEL_PORT", config.server.panelPort);
  if (process.env.CCPG_AUTH_TOKEN) config.server.authToken = process.env.CCPG_AUTH_TOKEN;
  return config;
}

function parsedJsonStillHasSecrets(config: Partial<Config>): boolean {
  if (config.server?.authToken) return true;
  const providers = config.providers ?? {};
  for (const provider of Object.values(providers) as Partial<ProviderConfig>[]) {
    if (!provider) continue;
    if (provider.apiKey) return true;
    if (provider.oauth?.accessToken || provider.oauth?.refreshToken || provider.oauth?.copilotToken)
      return true;
  }
  return false;
}

// Simple deep merge: values from `override` win, but missing keys fall back to `base`
function deepMerge(base: unknown, override: unknown): unknown {
  if (override === null || override === undefined) return base;
  if (typeof base !== "object" || typeof override !== "object") return override;
  if (Array.isArray(base) || Array.isArray(override)) return override;

  const result = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override as Record<string, unknown>)) {
    const overrideVal = (override as Record<string, unknown>)[key];
    const baseVal = (base as Record<string, unknown>)[key];
    result[key] = deepMerge(baseVal, overrideVal);
  }
  return result;
}
