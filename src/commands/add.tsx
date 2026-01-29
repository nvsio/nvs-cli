import { useState, useEffect } from 'react';
import { Box, useApp } from 'ink';
import {
  LogoHeader,
  Text,
  Select,
  Confirm,
  Spinner,
  FileList,
  Success,
  Error,
  Dim,
} from '../components/index.js';
import {
  parseGitHubUrl,
  cloneRepo,
  getRepoPath,
  scanDotfiles,
  createSymlink,
  backupFile,
  addRepo,
  addLink,
} from '../lib/index.js';
import type { DotfileEntry, ConflictResolution } from '../types/index.js';
import { access } from 'fs/promises';

type Step =
  | 'parsing'
  | 'cloning'
  | 'scanning'
  | 'preview'
  | 'resolve-conflict'
  | 'linking'
  | 'done'
  | 'error';

interface AddCommandProps {
  repo: string;
}

export function AddCommand({ repo }: AddCommandProps) {
  const { exit } = useApp();
  const [step, setStep] = useState<Step>('parsing');
  const [owner, setOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [repoPath, setRepoPath] = useState('');
  const [files, setFiles] = useState<DotfileEntry[]>([]);
  const [conflicts, setConflicts] = useState<DotfileEntry[]>([]);
  const [currentConflict, setCurrentConflict] = useState(0);
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map());
  const [linkedCount, setLinkedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Parse GitHub URL
  useEffect(() => {
    if (step === 'parsing') {
      const parsed = parseGitHubUrl(repo);
      if (!parsed) {
        setError(`Invalid GitHub URL or shorthand: ${repo}`);
        setStep('error');
        return;
      }

      setOwner(parsed.owner);
      setRepoName(parsed.repo);

      // Check if already cloned
      const localPath = getRepoPath(parsed.owner, parsed.repo);
      access(localPath)
        .then(() => {
          // Already exists
          setRepoPath(localPath);
          setStep('scanning');
        })
        .catch(() => {
          // Need to clone
          setStep('cloning');
        });
    }
  }, [step, repo]);

  // Clone repo
  useEffect(() => {
    if (step === 'cloning' && owner && repoName) {
      cloneRepo(owner, repoName)
        .then((path) => {
          setRepoPath(path);

          // Save repo to config
          addRepo({
            owner,
            name: repoName,
            url: `https://github.com/${owner}/${repoName}`,
            localPath: path,
          });

          setStep('scanning');
        })
        .catch((err) => {
          setError(`Failed to clone: ${err.message}`);
          setStep('error');
        });
    }
  }, [step, owner, repoName]);

  // Scan for dotfiles
  useEffect(() => {
    if (step === 'scanning' && repoPath) {
      scanDotfiles(repoPath)
        .then((result) => {
          setFiles(result.files);
          setConflicts(result.conflicts);

          if (result.conflicts.length > 0) {
            setStep('resolve-conflict');
          } else {
            setStep('preview');
          }
        })
        .catch((err) => {
          setError(`Failed to scan: ${err.message}`);
          setStep('error');
        });
    }
  }, [step, repoPath]);

  const handleConflictResolution = (resolution: ConflictResolution) => {
    const conflict = conflicts[currentConflict];
    setResolutions((prev) => new Map(prev).set(conflict.name, resolution));

    if (currentConflict < conflicts.length - 1) {
      setCurrentConflict((prev) => prev + 1);
    } else {
      setStep('preview');
    }
  };

  const handleConfirmLink = async (confirmed: boolean) => {
    if (!confirmed) {
      exit();
      return;
    }

    setStep('linking');
    let count = 0;

    for (const file of files) {
      const resolution = resolutions.get(file.name);

      if (resolution === 'skip') {
        continue;
      }

      try {
        if (file.hasConflict && file.exists && resolution !== 'skip') {
          if (resolution === 'backup' || !resolution) {
            await backupFile(file.targetPath);
          }
        }

        if (resolution !== 'skip') {
          await createSymlink(file.sourcePath, file.targetPath);
          await addLink({
            source: file.sourcePath,
            target: file.targetPath,
            type: 'symlink',
          });
          count++;
        }

        setLinkedCount(count);
      } catch (err) {
        // Continue on error
      }
    }

    setStep('done');
  };

  const conflictFile = conflicts[currentConflict];

  return (
    <Box flexDirection="column" padding={1}>
      <LogoHeader />

      {step === 'parsing' && (
        <Spinner label={`Parsing ${repo}...`} />
      )}

      {step === 'cloning' && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color="white">
              Adding dotfiles from github.com/{owner}/{repoName}...
            </Text>
          </Box>
          <Spinner label="Cloning repository" />
        </Box>
      )}

      {step === 'scanning' && (
        <Spinner label="Scanning for dotfiles..." />
      )}

      {step === 'resolve-conflict' && conflictFile && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color="white">
              Found {files.length} config files with {conflicts.length} conflicts.
            </Text>
          </Box>

          <Box marginBottom={1}>
            <FileList files={files} />
          </Box>

          <Select
            label={`${conflictFile.name} already exists. What should we do?`}
            options={[
              { label: 'Backup and replace', value: 'backup' as ConflictResolution },
              { label: 'Skip', value: 'skip' as ConflictResolution },
              { label: 'Overwrite', value: 'overwrite' as ConflictResolution },
            ]}
            onSelect={handleConflictResolution}
          />

          <Box marginTop={1}>
            <Dim>
              Conflict {currentConflict + 1} of {conflicts.length}
            </Dim>
          </Box>
        </Box>
      )}

      {step === 'preview' && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color="white">Found {files.length} config files:</Text>
          </Box>

          <Box marginBottom={1}>
            <FileList files={files} />
          </Box>

          {conflicts.length > 0 && (
            <Box marginBottom={1}>
              <Dim>
                {resolutions.size} conflicts resolved
              </Dim>
            </Box>
          )}

          <Confirm
            label={`Link ${files.length - Array.from(resolutions.values()).filter(r => r === 'skip').length} files?`}
            onConfirm={handleConfirmLink}
          />
        </Box>
      )}

      {step === 'linking' && (
        <Spinner label={`Linking files... (${linkedCount}/${files.length})`} />
      )}

      {step === 'done' && (
        <Box flexDirection="column">
          <Box>
            <Success>✓ Linked {linkedCount} files from {owner}/{repoName}</Success>
          </Box>
          <Box marginTop={1}>
            <Dim>Run `nvs status` to see your linked dotfiles.</Dim>
          </Box>
        </Box>
      )}

      {step === 'error' && error && (
        <Box flexDirection="column">
          <Error>Error: {error}</Error>
          <Box marginTop={1}>
            <Dim>Check the repository URL and try again.</Dim>
          </Box>
        </Box>
      )}
    </Box>
  );
}
