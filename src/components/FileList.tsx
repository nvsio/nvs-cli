import { Box } from 'ink';
import { Text } from './Text.js';
import type { DotfileEntry } from '../types/index.js';

interface FileListProps {
  files: DotfileEntry[];
  selected?: Set<string>;
}

export function FileList({ files, selected }: FileListProps) {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="#007BA7" paddingX={1}>
      {files.map((file) => {
        const isSelected = selected?.has(file.name) ?? true;
        const icon = isSelected ? '✓' : ' ';
        const iconColor = isSelected ? 'success' : 'dim';

        return (
          <Box key={file.name} gap={1}>
            <Text color={iconColor}>{icon}</Text>
            <Text color={isSelected ? 'white' : 'dim'}>{file.name.padEnd(18)}</Text>
            <Text color="dim">→</Text>
            <Text color={file.hasConflict ? 'warning' : 'muted'}>
              {file.targetPath.replace(process.env.HOME || '', '~')}
              {file.hasConflict && ' (conflict!)'}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
