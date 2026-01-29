import { useState, useEffect } from 'react';
import { Box, useApp } from 'ink';
import {
  LogoHeader,
  Text,
  Select,
  Input,
  Confirm,
  Spinner,
  FileList,
  Success,
  Dim,
} from '../components/index.js';
import {
  detectExistingDotfiles,
  loadConfig,
  setDotfilesDir,
  scanDotfiles,
  createSymlink,
  backupFile,
  addLink,
} from '../lib/index.js';
import type { DotfileEntry } from '../types/index.js';

type Step =
  | 'detecting'
  | 'choose-source'
  | 'input-path'
  | 'input-github'
  | 'scanning'
  | 'preview'
  | 'linking'
  | 'done';

interface InitCommandProps {
  path?: string;
}

export function InitCommand({ path }: InitCommandProps) {
  const { exit } = useApp();
  const [step, setStep] = useState<Step>(path ? 'scanning' : 'detecting');
  const [dotfilesPath, setDotfilesPath] = useState(path || '');
  const [detectedPath, setDetectedPath] = useState<string | null>(null);
  const [files, setFiles] = useState<DotfileEntry[]>([]);
  const [linkedCount, setLinkedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Detect existing dotfiles on mount
  useEffect(() => {
    if (step === 'detecting') {
      detectExistingDotfiles().then((detected) => {
        setDetectedPath(detected);
        setStep('choose-source');
      });
    }
  }, [step]);

  // Scan dotfiles when path is set
  useEffect(() => {
    if (step === 'scanning' && dotfilesPath) {
      scanDotfiles(dotfilesPath)
        .then(({ files }) => {
          setFiles(files);
          setStep('preview');
        })
        .catch((err) => {
          setError(`Failed to scan: ${err.message}`);
          setStep('choose-source');
        });
    }
  }, [step, dotfilesPath]);

  const handleSourceChoice = (choice: string) => {
    if (choice === 'existing' && detectedPath) {
      setDotfilesPath(detectedPath);
      setStep('scanning');
    } else if (choice === 'custom') {
      setStep('input-path');
    } else if (choice === 'github') {
      setStep('input-github');
    }
  };

  const handlePathInput = (path: string) => {
    const expandedPath = path.replace(/^~/, process.env.HOME || '');
    setDotfilesPath(expandedPath);
    setStep('scanning');
  };

  const handleConfirmLink = async (confirmed: boolean) => {
    if (!confirmed) {
      exit();
      return;
    }

    setStep('linking');
    let count = 0;

    for (const file of files) {
      try {
        if (file.hasConflict && file.exists) {
          await backupFile(file.targetPath);
        }
        await createSymlink(file.sourcePath, file.targetPath);
        await addLink({
          source: file.sourcePath,
          target: file.targetPath,
          type: 'symlink',
        });
        count++;
        setLinkedCount(count);
      } catch (err) {
        // Continue on error
      }
    }

    await setDotfilesDir(dotfilesPath);
    setStep('done');
  };

  return (
    <Box flexDirection="column" padding={1}>
      <LogoHeader />

      {step === 'detecting' && (
        <Spinner label="Detecting dotfiles..." />
      )}

      {step === 'choose-source' && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color="white">Welcome! Let's set up your dotfiles.</Text>
          </Box>

          {error && (
            <Box marginBottom={1}>
              <Text color="error">{error}</Text>
            </Box>
          )}

          <Select
            label="Where are your dotfiles?"
            options={[
              ...(detectedPath
                ? [{ label: `Use existing ${detectedPath.replace(process.env.HOME || '', '~')}`, value: 'existing' }]
                : []),
              { label: 'Enter custom path', value: 'custom' },
              { label: 'Clone from GitHub', value: 'github' },
            ]}
            onSelect={handleSourceChoice}
          />
        </Box>
      )}

      {step === 'input-path' && (
        <Input
          label="Enter path to your dotfiles directory:"
          placeholder="~/dotfiles"
          onSubmit={handlePathInput}
        />
      )}

      {step === 'input-github' && (
        <Input
          label="Enter GitHub repo (user/repo or full URL):"
          placeholder="nvs/dotfiles"
          onSubmit={(input) => {
            // For now, just use the add command logic
            const expandedPath = `${process.env.HOME}/.nvs/repos/${input.replace('https://github.com/', '').replace('.git', '')}`;
            setDotfilesPath(expandedPath);
            setStep('scanning');
          }}
        />
      )}

      {step === 'scanning' && (
        <Spinner label={`Scanning ${dotfilesPath.replace(process.env.HOME || '', '~')}...`} />
      )}

      {step === 'preview' && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color="white">Found {files.length} config files:</Text>
          </Box>

          <Box marginBottom={1}>
            <FileList files={files} />
          </Box>

          {files.some((f) => f.hasConflict) && (
            <Box marginBottom={1}>
              <Text color="warning">
                ⚠ Files with conflicts will be backed up before linking.
              </Text>
            </Box>
          )}

          <Confirm
            label={`Link ${files.length} files?`}
            onConfirm={handleConfirmLink}
          />
        </Box>
      )}

      {step === 'linking' && (
        <Box flexDirection="column">
          <Spinner label={`Linking files... (${linkedCount}/${files.length})`} />
        </Box>
      )}

      {step === 'done' && (
        <Box flexDirection="column">
          <Box>
            <Success>✓ Linked {linkedCount} files successfully!</Success>
          </Box>
          <Box marginTop={1}>
            <Dim>Run `nvs status` to see your linked dotfiles.</Dim>
          </Box>
        </Box>
      )}
    </Box>
  );
}
