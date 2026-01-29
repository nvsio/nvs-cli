import { useState } from 'react';
import { Box, useInput } from 'ink';
import { Text } from './Text.js';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  hint?: string;
}

interface SelectProps<T = string> {
  options: SelectOption<T>[];
  onSelect: (value: T) => void;
  label?: string;
}

export function Select<T = string>({ options, onSelect, label }: SelectProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      onSelect(options[selectedIndex].value);
    }
  });

  return (
    <Box flexDirection="column">
      {label && (
        <Box marginBottom={1}>
          <Text color="muted">? </Text>
          <Text color="white">{label}</Text>
        </Box>
      )}
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Box key={index}>
            {isSelected ? (
              <Text color="cerulean">  › </Text>
            ) : (
              <Text color="dim">    </Text>
            )}
            <Text color={isSelected ? 'aqua' : 'white'}>{option.label}</Text>
            {option.hint && (
              <Text color="dim"> {option.hint}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
