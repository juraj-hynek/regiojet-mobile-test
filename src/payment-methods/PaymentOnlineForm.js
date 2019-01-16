// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet, View } from 'react-native';
import React, { Fragment } from 'react';

import { cleanValidationObject, isFormValid, toggleFirstInvalid } from '../components/form/helpers';
import { filterOnlineMethods } from './helpers';
import { theme } from '../style/index';
import * as validation from '../components/form/validation';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';
import MethodButton from './MethodButton';
import type { Currency, PaymentMethod } from '../types';
import ScrollableContext from '../components/ScrollableContext';

type Props = {
  currency: Currency,
  intl: intlShape,
  isPayment: boolean,
  methods: Array<PaymentMethod>,
  onAmountSelect: Function,
  onMethodSelect: Function,
};

type State = {
  amount: string,
  validationResults: validation.ValidationResults<*>,
};

const DEFAULT_CREDIT_AMOUNT = {
  CZK: '300',
  EUR: '10',
};

class PaymentOnlineForm extends React.Component<Props, State> {
  state = {
    amount: DEFAULT_CREDIT_AMOUNT[this.props.currency] || '',
    validationResults: {},
  };

  validate = () => {
    const validationResults = {
      amount: validation.minNumber(this.state.amount, false, 0),
    };
    return cleanValidationObject(validationResults);
  };

  handleBlur = () => {
    const validationResults = this.validate();
    this.setState({ validationResults });
  };

  handleChange = amount => {
    this.setState({ amount });
  };

  handleSubmit = method => {
    if (this.props.isPayment) {
      this.props.onMethodSelect(method);
      return;
    }

    const validationResults = toggleFirstInvalid(this.validate());
    this.setState({ validationResults });

    if (!isFormValid(validationResults)) {
      return;
    }

    this.props.onAmountSelect(this.state.amount);
    this.props.onMethodSelect(method);
  };

  render() {
    const { currency, intl, isPayment, methods } = this.props;
    const { amount, validationResults } = this.state;

    return (
      <View>
        {!isPayment && (
          <Fragment>
            <FormattedMessage style={theme.h3} id="payments.online.amountHeader" />
            <ScrollableContext>
              <Input
                iconText={intl.formatMessage({ id: `currency.${currency}` })}
                keyboardType="numeric"
                label={intl.formatMessage({
                  id: 'payments.online.input.amount',
                })}
                onBlur={this.handleBlur}
                onChange={amount => this.handleChange(amount)}
                required
                style={styles.input}
                value={amount}
                validation={validationResults.amount}
              />
            </ScrollableContext>
          </Fragment>
        )}
        <View style={styles.paymentContainer}>
          {filterOnlineMethods(methods).map(method => (
            <MethodButton
              key={method.paymentMethodCode}
              big={method.paymentMethodCode === 'GPE_ONLINE_CARD'}
              method={method}
              onPress={this.handleSubmit}
            />
          ))}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 30,
  },

  paymentContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -5,
  },
});

export default injectIntl(
  connect(
    ({ localization: { currency }, paymentMethods }) => ({
      currency,
      methods: paymentMethods.paymentMethods.methods,
    }),
    {},
  )(PaymentOnlineForm),
);
