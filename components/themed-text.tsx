import { StyleSheet, Text, type TextProps } from 'react-native';

import { Typography } from '@/constants/typography';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
      allowFontScaling={false}
      maxFontSizeMultiplier={Typography.maxFontSizeMultiplier}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Typography.defaultFontSize,
    lineHeight: Typography.defaultLineHeight,
    flexShrink: 1,
  },
  defaultSemiBold: {
    fontSize: Typography.semiBoldFontSize,
    lineHeight: Typography.semiBoldLineHeight,
    flexShrink: 1,
    fontWeight: '600',
  },
  title: {
    fontSize: Typography.titleFontSize,
    fontWeight: 'bold',
    lineHeight: Typography.titleLineHeight,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: Typography.subtitleFontSize,
    lineHeight: Typography.subtitleLineHeight,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  link: {
    lineHeight: Typography.linkLineHeight,
    fontSize: Typography.linkFontSize,
    flexShrink: 1,
    textDecorationLine: 'underline',
  },
});
