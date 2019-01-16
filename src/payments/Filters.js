// @flow
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet, View } from 'react-native';
import moment from 'moment';
import React from 'react';

import { colors, getShadow, theme } from '../style/index';
import Button from '../components/Button';
import CheckBox from '../components/form/CheckBox';
import DatePicker from '../components/form/DatePicker';
import FormattedMessage from '../components/FormattedMessage';

type Props = {
  defaultFilters: FiltersState,
  intl: intlShape,
  onSubmit: Function,
  showPaymentTypes: boolean,
};

export type FiltersState = {
  dateFrom?: moment,
  dateTo?: moment,
  showCredit: boolean,
  showDirect: boolean,
};

const today = moment();

class Filters extends React.PureComponent<Props, FiltersState> {
  state = this.props.defaultFilters;

  handleChange = (value: Object) => {
    this.setState(value);
  };

  handleSubmit = () => {
    this.props.onSubmit(this.state);
  };

  render() {
    const { intl, showPaymentTypes } = this.props;
    const { dateFrom, dateTo, showCredit, showDirect } = this.state;

    return (
      <View style={[theme.container, styles.container]}>
        <View style={styles.dates}>
          <FormattedMessage
            id="payments.filter.dateRange"
            style={[theme.paragraph, theme.bold, styles.marginBottom]}
            textAfter=": "
            uppercase
          />
          <View style={styles.datePickers}>
            <DatePicker
              label={intl.formatMessage({ id: 'datepicker.from' })}
              maxDate={dateTo || today}
              onChange={dateFrom => this.handleChange({ dateFrom })}
              style={styles.column}
              value={dateFrom}
            />
            <DatePicker
              label={intl.formatMessage({ id: 'datepicker.to' })}
              minDate={dateFrom}
              maxDate={today}
              onChange={dateTo => this.handleChange({ dateTo })}
              style={styles.column}
              value={dateTo}
            />
          </View>
        </View>
        {showPaymentTypes && (
          <View style={styles.marginBottom}>
            <FormattedMessage
              id="payments.filter.transactionType"
              style={[theme.paragraph, theme.bold, styles.marginBottom]}
              textAfter=": "
              uppercase
            />
            <CheckBox
              checked={showDirect}
              onPress={showDirect => this.handleChange({ showDirect })}
              style={styles.checkbox}
            >
              <FormattedMessage id="payments.transactionType.directPayment" />
            </CheckBox>
            <CheckBox
              checked={showCredit}
              onPress={showCredit => this.handleChange({ showCredit })}
              style={styles.checkbox}
            >
              <FormattedMessage id="payments.transactionType.creditPayment" />
            </CheckBox>
          </View>
        )}
        <Button onPress={this.handleSubmit} secondary>
          <FormattedMessage id="payments.action.filter" />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...getShadow({ elevation: 1 }),
    backgroundColor: colors.greyWhite,
  },

  marginBottom: {
    marginBottom: 10,
  },

  dates: {
    marginBottom: 30,
  },

  datePickers: {
    flexDirection: 'row',
    marginHorizontal: -5,
    marginTop: -18,
  },

  column: {
    flex: 1,
    marginHorizontal: 5,
  },

  checkbox: {
    flex: 1,
    marginBottom: 20,
  },
});

export default injectIntl(Filters);
