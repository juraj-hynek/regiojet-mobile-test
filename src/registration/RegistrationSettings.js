// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet } from 'react-native';
import React, { Fragment } from 'react';

import { AVAILABLE_CURRENCIES } from '../localization/helpers';
import { theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import Picker from '../components/form/Picker';
import type { Currency, Tariff } from '../types';

type Props = {
  disabled?: boolean,
  formData: Object,
  intl: intlShape,
  onChange: (value: Object) => void,
  tariffs: Array<Tariff>,
};

type CurrencyOption = { label: string, value: Currency };

class RegistrationSettings extends React.Component<Props> {
  composeOptions = (): Array<CurrencyOption> =>
    Object.keys(AVAILABLE_CURRENCIES).map(currency => ({
      label: this.props.intl.formatMessage({ id: `currency.${currency}` }),
      value: currency,
    }));

  render() {
    const { disabled, formData, intl, onChange, tariffs } = this.props;

    return (
      <Fragment>
        <FormattedMessage id="registration.title.settings" style={[theme.h2, styles.section]} />
        <Picker
          disabled={disabled}
          label={intl.formatMessage({ id: 'settings.credit.tariff' })}
          onChange={tariff => onChange({ defaultTariff: tariff.key })}
          optionLabelKey="value"
          options={tariffs}
          optionValueKey="key"
          style={styles.row}
          value={formData.defaultTariff}
        />
        <Picker
          disabled={disabled}
          label={intl.formatMessage({ id: 'input.currency' })}
          onChange={currency => onChange({ currency: currency.value })}
          options={this.composeOptions()}
          style={styles.row}
          value={formData.currency}
        />
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  section: {
    marginTop: 30,
  },

  row: {
    marginBottom: 20,
  },
});

export default injectIntl(
  connect(
    ({ consts: { tariffs } }) => ({
      tariffs,
    }),
    {},
  )(RegistrationSettings),
);
