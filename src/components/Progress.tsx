import { Box } from 'ink';
import { Text } from './Text.js';

interface ProgressProps {
  value: number;
  total: number;
  width?: number;
}

export function Progress({ value, total, width = 30 }: ProgressProps) {
  const percentage = Math.min(value / total, 1);
  const filled = Math.round(percentage * width);
  const empty = width - filled;

  return (
    <Box>
      <Text color="cerulean">[</Text>
      <Text color="aqua">{'█'.repeat(filled)}</Text>
      <Text color="dim">{'░'.repeat(empty)}</Text>
      <Text color="cerulean">]</Text>
      <Text color="dim"> {value}/{total}</Text>
    </Box>
  );
}
