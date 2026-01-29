import { readdir, stat, lstat, readlink, symlink, rename, unlink, mkdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { homedir } from 'os';
import type { DotfileEntry, ScanResult } from '../types/index.js';

// Common dotfile patterns
const DOTFILE_PATTERNS = [
  /^\.[a-z]/i, // Files starting with .
  /rc$/, // Files ending in rc
  /config/i, // Files containing config
];

// Files/dirs that should be linked to ~/.config/
const CONFIG_DIR_FILES = new Set([
  'alacritty',
  'ghostty',
  'kitty',
  'nvim',
  'starship.toml',
  'wezterm',
]);

// Files that should be ignored
const IGNORE_PATTERNS = [
  /^\.git$/,
  /^\.github$/,
  /^\.DS_Store$/,
  /^node_modules$/,
  /^README/i,
  /^LICENSE/i,
  /^CLAUDE\.md$/i,
  /^install\.sh$/,
  /^setup\.sh$/,
  /^Makefile$/,
];

function shouldIgnore(name: string): boolean {
  return IGNORE_PATTERNS.some((pattern) => pattern.test(name));
}

function isDotfile(name: string): boolean {
  return DOTFILE_PATTERNS.some((pattern) => pattern.test(name));
}

function getTargetPath(name: string): string {
  const home = homedir();
  const baseName = name.startsWith('.') ? name : `.${name}`;

  // Check if it should go to ~/.config/
  const withoutDot = name.replace(/^\./, '');
  if (CONFIG_DIR_FILES.has(withoutDot)) {
    return join(home, '.config', withoutDot);
  }

  return join(home, baseName);
}

export async function scanDotfiles(dirPath: string): Promise<ScanResult> {
  const entries = await readdir(dirPath);
  const files: DotfileEntry[] = [];
  const conflicts: DotfileEntry[] = [];

  for (const entry of entries) {
    if (shouldIgnore(entry)) continue;

    const sourcePath = join(dirPath, entry);
    const entryStat = await stat(sourcePath);

    // Only process files and directories that look like dotfiles
    if (!isDotfile(entry) && !entryStat.isDirectory()) continue;

    const targetPath = getTargetPath(entry);
    let exists = false;
    let isSymlink = false;
    let hasConflict = false;

    try {
      const targetStat = await lstat(targetPath);
      exists = true;
      isSymlink = targetStat.isSymbolicLink();

      if (isSymlink) {
        const linkTarget = await readlink(targetPath);
        // Conflict if symlink points elsewhere
        hasConflict = linkTarget !== sourcePath;
      } else {
        // Real file exists = conflict
        hasConflict = true;
      }
    } catch {
      // Target doesn't exist, no conflict
    }

    const dotfile: DotfileEntry = {
      name: entry,
      sourcePath,
      targetPath,
      exists,
      isSymlink,
      hasConflict,
    };

    files.push(dotfile);
    if (hasConflict) {
      conflicts.push(dotfile);
    }
  }

  return { files, conflicts };
}

export async function backupFile(filePath: string): Promise<string> {
  const backupPath = `${filePath}.backup.${Date.now()}`;
  await rename(filePath, backupPath);
  return backupPath;
}

export async function createSymlink(source: string, target: string): Promise<void> {
  // Ensure parent directory exists
  await mkdir(dirname(target), { recursive: true });

  // Remove existing symlink if present
  try {
    const targetStat = await lstat(target);
    if (targetStat.isSymbolicLink()) {
      await unlink(target);
    }
  } catch {
    // Target doesn't exist, that's fine
  }

  await symlink(source, target);
}

export async function unlinkDotfile(targetPath: string): Promise<boolean> {
  try {
    const targetStat = await lstat(targetPath);
    if (targetStat.isSymbolicLink()) {
      await unlink(targetPath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
