import { Platform } from 'react-native';

export const fontFamily = {
  regular: 'Quicksand-Regular',
  medium: 'Quicksand-Medium',
  semibold: 'Quicksand-SemiBold',
  bold: 'Quicksand-Bold',
  light: 'Quicksand-Light',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const;

export const lineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const textVariants = {
  h1Bold: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
  },
  h3Bold: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
  },
  baseBold: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
  baseSemibold: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
  },
  baseRegular: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
  },
  paragraphBold: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  paragraphSemibold: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  paragraphMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  bodyRegular: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  smallBold: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
  },
} as const;
