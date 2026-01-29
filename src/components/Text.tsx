import { Text as InkText } from 'ink';
import { colors, type ColorName } from '../theme/colors.js';

interface TextProps {
  children: React.ReactNode;
  color?: ColorName;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
}

export function Text({ children, color, bold, dim, italic }: TextProps) {
  const hexColor = color ? colors[color] : undefined;

  return (
    <InkText color={hexColor} bold={bold} dimColor={dim} italic={italic}>
      {children}
    </InkText>
  );
}

// Convenience components for common patterns
export function Primary({ children }: { children: React.ReactNode }) {
  return <Text color="primary">{children}</Text>;
}

export function Accent({ children }: { children: React.ReactNode }) {
  return <Text color="accent">{children}</Text>;
}

export function Success({ children }: { children: React.ReactNode }) {
  return <Text color="success">{children}</Text>;
}

export function Warning({ children }: { children: React.ReactNode }) {
  return <Text color="warning">{children}</Text>;
}

export function Error({ children }: { children: React.ReactNode }) {
  return <Text color="error">{children}</Text>;
}

export function Dim({ children }: { children: React.ReactNode }) {
  return <Text color="dim">{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text color="muted">{children}</Text>;
}
