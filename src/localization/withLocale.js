// @flow
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { LocaleConfig } from 'react-native-calendars';
import { Text } from 'react-native';
import moment from 'moment';
import React, { type ComponentType } from 'react';

import { addLocaleData } from './localeData';
import { getDisplayName } from '../helpers/react';
import { getLanguageByLocale } from './helpers';
import type { Locale } from '../types';

addLocaleData();

type Props = {
  locale: Locale,
  translations: Object,
};

export default (Component: ComponentType<any>) => {
  const WithLocale = (props: Props) => {
    const { locale, translations } = props;
    const language = getLanguageByLocale(locale);

    moment.locale(language);
    LocaleConfig.defaultLocale = language;

    return (
      <IntlProvider key={locale} locale={language} messages={translations} textComponent={Text}>
        <Component {...props} />
      </IntlProvider>
    );
  };

  WithLocale.displayName = `WithLocale(${getDisplayName(Component)})`;

  return connect(
    ({ localization: { locale, translations } }) => ({
      locale,
      translations,
    }),
    {},
  )(WithLocale);
};
