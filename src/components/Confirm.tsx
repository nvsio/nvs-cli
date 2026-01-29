import { useState } from 'react';
import { Box, useInput } from 'ink';
import { Text } from './Text.js';

interface ConfirmProps {
  label: string;
  defaultValue?: boolean;
  onConfirm: (confirmed: boolean) => void;
}

export function Confirm({ label, defaultValue = true, onConfirm }: ConfirmProps) {
  const [selected, setSelected] = useState(defaultValue);

  useInput((input, key) => {
    if (key.leftArrow || key.rightArrow) {
      setSelected((prev) => !prev);
    } else if (input === 'y' || input === 'Y') {
      onConfirm(true);
    } else if (input === 'n' || input === 'N') {
      onConfirm(false);
    } else if (key.return) {
      onConfirm(selected);
    }
  });

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="muted">? </Text>
        <Text color="white">{label}</Text>
      </Box>
      <Box marginTop={1} gap={2}>
        <Box>
          {selected ? (
            <Text color="cerulean">› </Text>
          ) : (
            <Text color="dim">  </Text>
          )}
          <Text color={selected ? 'aqua' : 'dim'}>Yes</Text>
        </Box>
        <Box>
          {!selected ? (
            <Text color="cerulean">› </Text>
          ) : (
            <Text color="dim">  </Text>
          )}
          <Text color={!selected ? 'aqua' : 'dim'}>No</Text>
        </Box>
      </Box>
    </Box>
  );
}
