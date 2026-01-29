import InkSpinner from 'ink-spinner';
import { Box } from 'ink';
import { Text } from './Text.js';
import { colors } from '../theme/colors.js';

interface SpinnerProps {
  label?: string;
}

export function Spinner({ label }: SpinnerProps) {
  return (
    <Box>
      <Text color="cerulean">
        <InkSpinner type="dots" />
      </Text>
      {label && (
        <Text color="cerulean"> {label}</Text>
      )}
    </Box>
  );
}
