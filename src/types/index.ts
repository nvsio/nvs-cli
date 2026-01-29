export interface DotfileConfig {
  source: string;
  target: string;
  type: 'symlink' | 'copy';
}

export interface RepoInfo {
  owner: string;
  name: string;
  url: string;
  localPath: string;
}

export interface DotfileEntry {
  name: string;
  sourcePath: string;
  targetPath: string;
  exists: boolean;
  isSymlink: boolean;
  hasConflict: boolean;
}

export interface Config {
  dotfilesDir: string;
  repos: RepoInfo[];
  links: DotfileConfig[];
}

export type ConflictResolution = 'backup' | 'merge' | 'skip' | 'overwrite';

export interface ScanResult {
  files: DotfileEntry[];
  conflicts: DotfileEntry[];
}
