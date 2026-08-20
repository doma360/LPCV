import { env } from "@/config/env.js";
import { LocalStorageProvider } from "./local.js";
import type { StorageProvider } from "./types.js";

export type { StorageProvider } from "./types.js";

export function getStorageProvider(): StorageProvider {
  switch (env.STORAGE_PROVIDER) {
    case "local":
    default:
      return new LocalStorageProvider();
  }
}
