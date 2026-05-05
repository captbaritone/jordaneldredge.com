import { join } from "path";
import { homedir } from "os";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { parse, stringify } from "smol-toml";

const CONFIG_DIR = join(homedir(), ".config", "je-cli");
const CONFIG_FILE = join(CONFIG_DIR, "config.toml");

export interface Config {
  auth?: {
    token?: string;
  };
  server?: {
    url?: string;
  };
}

function ensureConfigDir() {
  mkdirSync(CONFIG_DIR, { recursive: true });
}

export function loadConfig(): Config {
  try {
    const raw = readFileSync(CONFIG_FILE, "utf-8");
    return parse(raw) as Config;
  } catch {
    return {};
  }
}

export function saveConfig(config: Config) {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, stringify(config as any), { mode: 0o600 });
}

export function getToken(): string | null {
  return loadConfig().auth?.token ?? null;
}

export function setToken(token: string) {
  const config = loadConfig();
  config.auth = { ...config.auth, token };
  saveConfig(config);
}

export function getBaseUrl(): string {
  return (
    process.env.JE_API_URL ??
    loadConfig().server?.url ??
    "https://jordaneldredge.com"
  );
}
