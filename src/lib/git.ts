import { simpleGit, type SimpleGit } from 'simple-git';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

export interface CloneProgress {
  stage: 'clone' | 'checkout';
  progress: number;
}

export function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  // Handle full URLs
  const urlMatch = input.match(/github\.com[/:]([\w-]+)\/([\w.-]+?)(\.git)?$/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // Handle shorthand: user/repo
  const shortMatch = input.match(/^([\w-]+)\/([\w.-]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }

  return null;
}

export function getRepoPath(owner: string, repo: string): string {
  return join(homedir(), '.nvs', 'repos', owner, repo);
}

export async function cloneRepo(
  owner: string,
  repo: string,
  onProgress?: (progress: CloneProgress) => void
): Promise<string> {
  const repoPath = getRepoPath(owner, repo);
  const repoUrl = `https://github.com/${owner}/${repo}.git`;

  // Create parent directory
  await mkdir(join(homedir(), '.nvs', 'repos', owner), { recursive: true });

  const git: SimpleGit = simpleGit();

  // Clone with progress
  await git.clone(repoUrl, repoPath, ['--progress']);

  return repoPath;
}

export async function pullRepo(repoPath: string): Promise<void> {
  const git = simpleGit(repoPath);
  await git.pull();
}

export async function getRepoStatus(repoPath: string): Promise<{ behind: number; ahead: number }> {
  const git = simpleGit(repoPath);

  try {
    await git.fetch();
    const status = await git.status();
    return {
      behind: status.behind,
      ahead: status.ahead,
    };
  } catch {
    return { behind: 0, ahead: 0 };
  }
}
