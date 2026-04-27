import { useTheme } from '@react-navigation/native';

import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { dark, colors } = useTheme();

  if (dark && props.dark) return props.dark;
  if (!dark && props.light) return props.light;

  const fromTheme = colors[colorName as keyof typeof colors];
  if (typeof fromTheme === 'string') return fromTheme;

  return Colors[dark ? 'dark' : 'light'][colorName];
}
