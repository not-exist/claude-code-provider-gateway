import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { getConfigDir, getCurrentSessionPath, getSessionArchivePath } from "../../config/paths.js";
import { appendPrivateFile, writePrivateFile } from "../../core/files/private-file.js";
import {
  archiveSessionToSqlite,
  clearArchivedSessionsFromSqlite,
  currentSessionsExist,
  deleteArchivedSessionFromSqlite,
  isSqliteStorageEnabled,
  listArchivedSessionsFromSqlite,
  readCurrentSessionsFromSqlite,
  removeCurrentSessionsFromSqlite,
  writeCurrentSessionsToSqlite,
} from "../../storage/sqlite.js";
import { normalizeSessionTotals } from "./stats.js";
import type { SessionRecord } from "./types.js";

const MAX_SESSIONS = 200;
const MAX_ARCHIVE_READ_BYTES = 10 * 1024 * 1024;
const MAX_REQUEST_LOG_ENTRIES = 200;
const MAX_TEXT_CHARS = 20_000;
const MAX_PREVIEW_BODY_CHARS = 50_000;

export function ensureSessionDir(): void {
  if (isSqliteStorageEnabled()) return;
  const dir = getConfigDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function currentSessionExists(): boolean {
  if (isSqliteStorageEnabled()) return currentSessionsExist();
  return existsSync(getCurrentSessionPath());
}

export function readCurrentSession(): SessionRecord {
  if (isSqliteStorageEnabled()) return readCurrentSessionsFromSqlite()[0];
  return JSON.parse(readFileSync(getCurrentSessionPath(), "utf-8")) as SessionRecord;
}

export function readCurrentSessions(): SessionRecord[] {
  if (isSqliteStorageEnabled()) return readCurrentSessionsFromSqlite();
  const parsed = JSON.parse(readFileSync(getCurrentSessionPath(), "utf-8")) as
    | SessionRecord
    | SessionRecord[];
  return Array.isArray(parsed) ? parsed : [parsed];
}

export function writeCurrentSession(session: SessionRecord): void {
  writePrivateFile(getCurrentSessionPath(), JSON.stringify(compactSessionForStorage(session)));
}

export function writeCurrentSessions(sessions: SessionRecord[]): void {
  if (isSqliteStorageEnabled()) {
    writeCurrentSessionsToSqlite(sessions.map(compactSessionForStorage));
    return;
  }
  writePrivateFile(getCurrentSessionPath(), JSON.stringify(sessions.map(compactSessionForStorage)));
}

export function removeCurrentSession(): void {
  if (isSqliteStorageEnabled()) {
    removeCurrentSessionsFromSqlite();
    return;
  }
  try {
    unlinkSync(getCurrentSessionPath());
  } catch {}
}

export function archiveSession(session: SessionRecord): void {
  if (isSqliteStorageEnabled()) {
    archiveSessionToSqlite(compactSessionForStorage(session));
    return;
  }
  ensureSessionDir();
  appendPrivateFile(
    getSessionArchivePath(),
    `${JSON.stringify(compactSessionForStorage(session))}\n`,
  );
  trimArchivedSessions();
}

export function clearArchivedSessions(): void {
  if (isSqliteStorageEnabled()) {
    clearArchivedSessionsFromSqlite();
    return;
  }
  ensureSessionDir();
  writePrivateFile(getSessionArchivePath(), "");
}

export function deleteArchivedSession(id: string): boolean {
  if (isSqliteStorageEnabled()) return deleteArchivedSessionFromSqlite(id);
  const path = getSessionArchivePath();
  if (!existsSync(path)) return false;
  try {
    const lines = readFileSync(path, "utf-8").split("\n").filter(Boolean);
    const filtered = lines.filter((line) => {
      try {
        return (JSON.parse(line) as SessionRecord).id !== id;
      } catch {
        return true;
      }
    });
    if (filtered.length === lines.length) return false;
    writePrivateFile(path, filtered.length ? `${filtered.join("\n")}\n` : "");
    return true;
  } catch {
    return false;
  }
}

export function listArchivedSessions(): SessionRecord[] {
  if (isSqliteStorageEnabled()) return listArchivedSessionsFromSqlite();
  const path = getSessionArchivePath();
  if (!existsSync(path)) return [];
  try {
    const raw = readArchiveTail(path);
    const seen = new Set<string>();
    return raw
      .split("\n")
      .filter(Boolean)
      .map(parseArchivedLine)
      .filter((s): s is SessionRecord => s !== null)
      .reverse()
      .filter((s) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
  } catch {
    return [];
  }
}

function trimArchivedSessions(): void {
  try {
    const path = getSessionArchivePath();
    const { size } = statSync(path);
    const tail = readArchiveTail(path);
    if (!tail && size > MAX_ARCHIVE_READ_BYTES) return;
    const lines = tail.split("\n").filter(Boolean);
    if (lines.length > MAX_SESSIONS) {
      writePrivateFile(path, `${lines.slice(-MAX_SESSIONS).join("\n")}\n`);
    } else if (size > MAX_ARCHIVE_READ_BYTES) {
      writePrivateFile(path, lines.length ? `${lines.join("\n")}\n` : "");
    }
  } catch {}
}

function readArchiveTail(path: string): string {
  const { size } = statSync(path);
  if (size <= MAX_ARCHIVE_READ_BYTES) return readFileSync(path, "utf-8");

  const fd = openSync(path, "r");
  try {
    const length = Math.min(size, MAX_ARCHIVE_READ_BYTES);
    const buffer = Buffer.alloc(length);
    readSync(fd, buffer, 0, length, size - length);
    const raw = buffer.toString("utf-8");
    const firstNewline = raw.indexOf("\n");
    return firstNewline === -1 ? "" : raw.slice(firstNewline + 1);
  } finally {
    closeSync(fd);
  }
}

function compactSessionForStorage(session: SessionRecord): SessionRecord {
  return {
    ...session,
    requestLog: session.requestLog.slice(-MAX_REQUEST_LOG_ENTRIES).map((entry) => ({
      ...entry,
      prompt: truncateText(entry.prompt, MAX_TEXT_CHARS),
      response: truncateText(entry.response, MAX_TEXT_CHARS),
      requestPreview: entry.requestPreview
        ? {
            ...entry.requestPreview,
            body: truncateJsonValue(entry.requestPreview.body, MAX_PREVIEW_BODY_CHARS),
          }
        : undefined,
    })),
  };
}

function truncateText(value: string | undefined, maxChars: number): string | undefined {
  if (typeof value !== "string" || value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}\n[truncated ${value.length - maxChars} chars]`;
}

function truncateJsonValue(value: unknown, maxChars: number): unknown {
  const encoded = JSON.stringify(value);
  if (!encoded || encoded.length <= maxChars) return value;
  return `[truncated request preview body: ${encoded.length} chars]`;
}

function parseArchivedLine(line: string): SessionRecord | null {
  try {
    return normalizeSessionTotals(JSON.parse(line) as SessionRecord);
  } catch {
    return null;
  }
}
