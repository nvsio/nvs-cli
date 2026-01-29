import { useState } from 'react';
import { Box, useInput } from 'ink';
import { Text } from './Text.js';

interface InputProps {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  onSubmit: (value: string) => void;
}

export function Input({ label, placeholder, defaultValue = '', onSubmit }: InputProps) {
  const [value, setValue] = useState(defaultValue);
  const [cursorOffset, setCursorOffset] = useState(defaultValue.length);

  useInput((input, key) => {
    if (key.return) {
      onSubmit(value);
      return;
    }

    if (key.backspace || key.delete) {
      if (cursorOffset > 0) {
        setValue((prev) => prev.slice(0, cursorOffset - 1) + prev.slice(cursorOffset));
        setCursorOffset((prev) => prev - 1);
      }
      return;
    }

    if (key.leftArrow) {
      setCursorOffset((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.rightArrow) {
      setCursorOffset((prev) => Math.min(value.length, prev + 1));
      return;
    }

    if (!key.ctrl && !key.meta && input) {
      setValue((prev) => prev.slice(0, cursorOffset) + input + prev.slice(cursorOffset));
      setCursorOffset((prev) => prev + input.length);
    }
  });

  const displayValue = value || placeholder || '';
  const showPlaceholder = !value && placeholder;

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="muted">? </Text>
        <Text color="white">{label}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="cerulean">  › </Text>
        <Text color={showPlaceholder ? 'dim' : 'aqua'}>
          {displayValue.slice(0, cursorOffset)}
        </Text>
        <Text color="aqua" inverse>
          {displayValue[cursorOffset] || ' '}
        </Text>
        <Text color={showPlaceholder ? 'dim' : 'aqua'}>
          {displayValue.slice(cursorOffset + 1)}
        </Text>
      </Box>
    </Box>
  );
}
