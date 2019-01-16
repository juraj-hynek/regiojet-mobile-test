// @flow
import 'intl';
import 'intl/locale-data/jsonp/cs';
import 'intl/locale-data/jsonp/de';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/pl';
import 'intl/locale-data/jsonp/sk';

import 'moment/locale/cs';
import 'moment/locale/de';
import 'moment/locale/pl';
import 'moment/locale/sk';

import { addLocaleData as addLocaleDataIntl } from 'react-intl';
import { LocaleConfig } from 'react-native-calendars';
import cs from 'react-intl/locale-data/cs';
import de from 'react-intl/locale-data/de';
import en from 'react-intl/locale-data/en';
import moment from 'moment';
import pl from 'react-intl/locale-data/pl';
import sk from 'react-intl/locale-data/sk';

import { capitalizeFirst } from '../helpers/text';
import { getLanguageByLocale } from './helpers';
import type { Locale } from '../types';

export const dateFormat: string = 'l';
export const timeFormat: string = 'LT';

const prepareCalendarLocale = (locale: Locale) => {
  const language = getLanguageByLocale(locale);
  const localeData = moment.localeData(language);

  LocaleConfig.locales[locale] = {
    // $FlowFixMe
    monthNames: localeData.months().map(capitalizeFirst),
    // $FlowFixMe
    monthNamesShort: localeData.monthsShort().map(capitalizeFirst),
    // $FlowFixMe
    dayNames: localeData.weekdays().map(capitalizeFirst),
    // $FlowFixMe
    dayNamesShort: localeData.weekdaysShort().map(capitalizeFirst),
  };
};

export const addLocaleData = () => {
  addLocaleDataIntl([...cs, ...de, ...en, ...pl, ...sk]);

  moment.updateLocale('sk', {
    longDateFormat: {
      [dateFormat]: 'D. M. YYYY',
    },
  });

  moment.updateLocale('pl', {
    longDateFormat: {
      [dateFormat]: 'DD.MM.YYYY',
    },
  });

  ['cs', 'de', 'en', 'sk'].forEach(prepareCalendarLocale);
};
