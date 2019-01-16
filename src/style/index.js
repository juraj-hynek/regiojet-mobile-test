// @flow
import { Platform, StyleSheet } from 'react-native';

export const HEADER_HEIGHT = 48;
export const MENU_WIDTH = 290;
export const STATUS_BAR_HEIGHT_IOS = 20;

export const colors = {
  transparent: 'transparent',

  black: '#1b1b1b',

  grey: '#999999',
  greyDark: '#404040',
  greyShadow: 'rgba(27, 27, 27, 0.2)',
  greyShadowHexa: '#d1d1d1',
  greyShadowDark: 'rgba(27, 27, 27, 0.5)',
  greyLayer: '#eeeeee',
  greyWhite: '#f9f9f9',

  yellow: '#f0ab00',
  yellowDark: '#e6aa13',
  yellowSoft: '#ffdb7e',
  yellowShadow: 'rgba(251, 191, 31, 0.3)',

  green: '#009d09',
  greenLight: '#e1f1e2',

  red: '#e00046',
  redDark: '#cb002c',
  redShadow: 'rgba(237, 24, 70, 0.2)',

  blue: '#0c9af8',
  blueDark: '#0061A1',
  blueShadow: 'rgba(12, 154, 248, 0.25)',

  white: '#ffffff',
  whiteShadow: 'rgba(255, 255, 255, 0.25)',
};

// base RGB values equal to colors.red
export const getRedWithAlpha = (alpha: number) => `rgba(224, 0, 70, ${alpha})`;

export const fontFamilies = {
  light: 'SourceSansPro-Light',
  base: 'SourceSansPro-Regular',
  semiBold: 'SourceSansPro-SemiBold',
  bold: 'SourceSansPro-Bold',
  italic: 'SourceSansPro-It',
};

export const composeFontStyle = (fontSize: number, fontFamily: string = fontFamilies.base) => ({
  color: colors.black,
  fontFamily,
  fontSize,
  lineHeight: fontSize * 1.5,
});

export const theme = StyleSheet.create({
  borderWithRadius: {
    backgroundColor: colors.white,
    borderRadius: 5,
    borderColor: colors.greyShadow,
    borderWidth: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 30,
  },

  containerModal: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 30,
  },

  h1: {
    ...composeFontStyle(28, fontFamilies.bold),
    marginBottom: 20,
  },

  h2: {
    ...composeFontStyle(26, fontFamilies.semiBold),
    marginBottom: 20,
  },

  h3: {
    ...composeFontStyle(22, fontFamilies.semiBold),
    marginBottom: 20,
  },

  paragraphBig: {
    ...composeFontStyle(18),
  },

  paragraph: {
    ...composeFontStyle(16),
  },

  paragraphSmall: {
    ...composeFontStyle(14),
  },

  semiBold: {
    fontFamily: fontFamilies.semiBold,
  },

  bold: {
    fontFamily: fontFamilies.bold,
  },

  light: {
    fontFamily: fontFamilies.light,
  },
});

export const statusBarHeight = Platform.select({
  android: 0,
  ios: STATUS_BAR_HEIGHT_IOS,
});

export const getHitSlop = (offset: number = 10) => ({
  bottom: offset,
  top: offset,
  left: offset,
  right: offset,
});

export const getShadow = ({
  elevation,
  shadowColor = colors.black,
}: {
  elevation: number,
  shadowColor?: string,
}): Object =>
  Platform.select({
    android: {
      elevation,
    },
    ios: {
      shadowColor,
      // prettier-ignore
      shadowOpacity: (0.0015 * elevation) + 0.18,
      shadowRadius: 0.54 * elevation,
      shadowOffset: {
        height: 0.6 * elevation,
      },
    },
  });

// iOS works best with padding behavior and needs extra offset for header
// Android works best out of the box
export const getKeyboardPlatformProps = (headerOffset: boolean = true): Object =>
  Platform.select({
    ios: {
      behavior: 'padding',
      keyboardVerticalOffset: headerOffset ? HEADER_HEIGHT + STATUS_BAR_HEIGHT_IOS : 0,
    },
  });

export const touchableActiveOpacity = 0.5;
