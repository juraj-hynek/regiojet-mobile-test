// @flow

import { connect } from 'react-redux';
import { injectIntl, type IntlShape } from 'react-intl';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { AVAILABLE_CURRENCIES, AVAILABLE_LOCALES } from '../localization/helpers';
import { changeCurrency, changeLocale } from '../localization/actions';
import { colors, theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import Picker from '../components/form/Picker';
import type { Currency, Locale } from '../types';

type Props = {
  changeCurrency: typeof changeCurrency,
  changeLocale: typeof changeLocale,
  currency: Currency,
  currencyDisabled: boolean,
  intl: IntlShape,
  languageDisabled: boolean,
  locale: Locale,
};

type CurrencyOption = { label: string, value: Currency };
type LanguageOption = { label: string, value: Locale };

class LanguageAndCurrency extends React.PureComponent<Props> {
  composeCurrencyOptions = (): Array<CurrencyOption> =>
    Object.keys(AVAILABLE_CURRENCIES).map(currency => ({
      label: this.props.intl.formatMessage({ id: `currency.${currency}` }),
      value: currency,
    }));

  composeLanguageOptions = (): Array<LanguageOption> =>
    Object.keys(AVAILABLE_LOCALES).map(locale => ({
      label: this.props.intl.formatMessage({ id: `language.${locale}` }),
      value: locale,
    }));

  handleCurrencyChange = (option: CurrencyOption) => this.props.changeCurrency(option.value);

  handleLanguageChange = (option: LanguageOption) => this.props.changeLocale(option.value);

  render() {
    const { currency, currencyDisabled, intl, languageDisabled, locale } = this.props;

    return (
      <View style={theme.container}>
        <FormattedMessage id="settings.languageAndCurrency.title" style={theme.h2} />
        <View style={styles.row}>
          <Picker
            disabled={languageDisabled}
            label={intl.formatMessage({ id: 'settings.languageAndCurrency.language' })}
            onChange={this.handleLanguageChange}
            options={this.composeLanguageOptions()}
            value={locale}
          />
          {languageDisabled && (
            <FormattedMessage
              id="settings.languageAndCurrency.languageDisabled"
              style={[theme.paragraphSmall, styles.disabledMessage]}
            />
          )}
        </View>
        <Picker
          disabled={currencyDisabled}
          label={intl.formatMessage({ id: 'settings.languageAndCurrency.currency' })}
          onChange={this.handleCurrencyChange}
          options={this.composeCurrencyOptions()}
          value={currency}
        />
        {currencyDisabled && (
          <FormattedMessage
            id="settings.languageAndCurrency.currencyDisabled"
            style={[theme.paragraphSmall, styles.disabledMessage]}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  disabledMessage: {
    color: colors.grey,
    marginTop: 5,
  },

  row: {
    marginBottom: 20,
  },
});

export default injectIntl(
  connect(
    ({ basket, localization: { currency, locale }, user: { role } }) => {
      const isBasketEmpty = basket.items.length === 0;
      return {
        currency,
        currencyDisabled: !isBasketEmpty || role !== 'ANONYMOUS',
        languageDisabled: !isBasketEmpty,
        locale,
      };
    },
    { changeCurrency, changeLocale },
  )(LanguageAndCurrency),
);
