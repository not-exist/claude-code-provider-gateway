import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import {
  deleteSecretEntry,
  listSecretKeys,
  readSecretEntry,
  writeSecretEntry,
} from "../../storage/sqlite.js";
import type { SecretStore } from "./store.js";

interface EncryptedEntry {
  nonce: string;
  ciphertext: string;
  tag: string;
}

const ALGORITHM = "aes-256-gcm";
const NONCE_BYTES = 12;

export class EncryptedSqliteSecretStore implements SecretStore {
  private decryptErrors: Set<string> = new Set();

  constructor(private readonly masterKey: Buffer) {
    if (masterKey.length !== 32) {
      throw new Error(`Master key must be 32 bytes (got ${masterKey.length})`);
    }
  }

  get(key: string): string | null {
    const raw = readSecretEntry(key);
    if (!raw) return null;
    try {
      return this.decrypt(JSON.parse(raw) as EncryptedEntry);
    } catch {
      this.decryptErrors.add(key);
      return null;
    }
  }

  getDecryptErrorKeys(): string[] {
    return [...this.decryptErrors];
  }

  set(key: string, value: string): void {
    if (value === "" || value == null) {
      this.delete(key);
      return;
    }
    writeSecretEntry(key, JSON.stringify(this.encrypt(value)));
  }

  delete(key: string): void {
    deleteSecretEntry(key);
  }

  keys(): string[] {
    return listSecretKeys();
  }

  private encrypt(plaintext: string): EncryptedEntry {
    const nonce = randomBytes(NONCE_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.masterKey, nonce);
    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      nonce: nonce.toString("hex"),
      ciphertext: ciphertext.toString("hex"),
      tag: tag.toString("hex"),
    };
  }

  private decrypt(entry: EncryptedEntry): string {
    const nonce = Buffer.from(entry.nonce, "hex");
    const ciphertext = Buffer.from(entry.ciphertext, "hex");
    const tag = Buffer.from(entry.tag, "hex");
    const decipher = createDecipheriv(ALGORITHM, this.masterKey, nonce);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString("utf-8");
  }
}
