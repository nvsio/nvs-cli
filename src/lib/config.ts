import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import type { Config, RepoInfo, DotfileConfig } from '../types/index.js';

const CONFIG_DIR = join(homedir(), '.nvs');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: Config = {
  dotfilesDir: join(homedir(), 'dotfiles'),
  repos: [],
  links: [],
};

export async function ensureConfigDir(): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await mkdir(join(CONFIG_DIR, 'repos'), { recursive: true });
}

export async function loadConfig(): Promise<Config> {
  try {
    const data = await readFile(CONFIG_FILE, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await ensureConfigDir();
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function addRepo(repo: RepoInfo): Promise<void> {
  const config = await loadConfig();
  const exists = config.repos.some(
    (r) => r.owner === repo.owner && r.name === repo.name
  );
  if (!exists) {
    config.repos.push(repo);
    await saveConfig(config);
  }
}

export async function addLink(link: DotfileConfig): Promise<void> {
  const config = await loadConfig();
  const exists = config.links.some((l) => l.target === link.target);
  if (!exists) {
    config.links.push(link);
    await saveConfig(config);
  }
}

export async function setDotfilesDir(dir: string): Promise<void> {
  const config = await loadConfig();
  config.dotfilesDir = dir;
  await saveConfig(config);
}

export async function detectExistingDotfiles(): Promise<string | null> {
  const commonPaths = [
    join(homedir(), 'dotfiles'),
    join(homedir(), '.dotfiles'),
    join(homedir(), 'code', 'dotfiles'),
    join(homedir(), 'Code', 'dotfiles'),
  ];

  for (const path of commonPaths) {
    try {
      await access(path);
      return path;
    } catch {
      // Path doesn't exist
    }
  }

  return null;
}
