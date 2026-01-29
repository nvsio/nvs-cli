import { Box, Text as InkText } from 'ink';
import { Text } from './Text.js';

const ASCII_LOGO = `
 ███╗   ██╗██╗   ██╗███████╗
 ████╗  ██║██║   ██║██╔════╝
 ██╔██╗ ██║██║   ██║███████╗
 ██║╚██╗██║╚██╗ ██╔╝╚════██║
 ██║ ╚████║ ╚████╔╝ ███████║
 ╚═╝  ╚═══╝  ╚═══╝  ╚══════╝
`.trim();

export function Logo() {
  return (
    <Box>
      <Text color="cerulean" bold>◈</Text>
      <Text color="aqua" bold> nvs</Text>
    </Box>
  );
}

export function LogoHeader() {
  const lines = ASCII_LOGO.split('\n');

  return (
    <Box flexDirection="column" marginBottom={1}>
      {lines.map((line, i) => {
        // Gradient from cerulean to aqua
        const ratio = i / (lines.length - 1);
        const color = ratio < 0.5 ? '#007BA7' : '#00FFFF';

        return (
          <InkText key={i} color={color} bold>
            {line}
          </InkText>
        );
      })}
    </Box>
  );
}
