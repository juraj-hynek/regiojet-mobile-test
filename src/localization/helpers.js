// @flow
import DeviceInfo from 'react-native-device-info';
import type { Currency, Language, Locale } from '../types';

export const AVAILABLE_CURRENCIES = {
  CZK: true,
  EUR: true,
};

export const AVAILABLE_LOCALES = {
  cs: true,
  sk: true,
  en: true,
  de: true,
  at: true,
};

export const AVAILABLE_LANGUAGES = {
  cs: true,
  sk: true,
  en: true,
  de: true,
};

const LANGUAGES_MAP: { [Locale]: Language } = {
  cs: 'cs',
  sk: 'sk',
  en: 'en',
  de: 'de',
  at: 'de',
};

export const DEFAULT_CURRENCY: Currency = 'EUR';
export const DEFAULT_LOCALE: Locale = 'en';

export const getDefaultLocale = (): Locale => {
  const deviceLocale = DeviceInfo.getDeviceLocale().substring(0, 2);

  if (deviceLocale && AVAILABLE_LOCALES[deviceLocale]) {
    // $FlowFixMe
    return deviceLocale;
  }

  return DEFAULT_LOCALE;
};

export const getLanguageByLocale = (locale: Locale): Language => LANGUAGES_MAP[locale];
