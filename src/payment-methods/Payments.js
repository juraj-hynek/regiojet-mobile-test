// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { colors, getShadow, theme } from '../style';
import { getPaymentMethods } from '../payment-methods/actions';
import { getTabMethods, paymentMethodMessageIds } from '../payment-methods/helpers';
import FormattedMessage from '../components/FormattedMessage';
import LoaderSmall from '../components/LoaderSmall';
import PaymentBankTransfer from './PaymentBankTransfer';
import PaymentCash from './PaymentCash';
import PaymentGiftCertificate from './PaymentGiftCertificate';
import PaymentOnline from './PaymentOnline';
import Tabs from '../components/Tabs';
import type { ErrorResponse, PaymentMethod, Style } from '../types';

type Props = {|
  creditAddAmount?: number,
  error: ?ErrorResponse,
  getPaymentMethods: typeof getPaymentMethods,
  isFetching?: boolean,
  methods: Array<PaymentMethod>,
  modal?: boolean,
  style?: Style,
  ticketIds?: Array<number>,
|};

class Payments extends React.Component<Props> {
  // eslint-disable-next-line react/sort-comp
  TabComponents = {
    ONLINE: (
      <PaymentOnline
        creditAddAmount={this.props.creditAddAmount}
        modal={this.props.modal}
        ticketIds={this.props.ticketIds}
      />
    ),
    CASH: <PaymentCash />,
    GIFT_CERTIFICATE: <PaymentGiftCertificate modal={this.props.modal} />,
    TRANSFER: <PaymentBankTransfer />,
  };

  componentDidMount() {
    this.props.getPaymentMethods(this.props.ticketIds);
  }

  renderTabMethod(method: string, noTabs: boolean = false) {
    return (
      <View
        key={method}
        style={[!this.props.ticketIds && styles.tabShadow, noTabs && styles.noTabs]}
      >
        {this.TabComponents[method]}
      </View>
    );
  }

  render() {
    const { error, isFetching, methods, style } = this.props;

    if (isFetching) {
      return (
        <View style={style}>
          <LoaderSmall />
        </View>
      );
    }

    if (error) {
      return <View style={[styles.marginHorizontal, style]}>{/* TODO retry button */}</View>;
    }

    const tabMethods = getTabMethods(methods);

    return (
      <View style={style}>
        <FormattedMessage
          style={[theme.h2, styles.marginHorizontal]}
          id="payments.online.selectPaymentHeader"
        />
        {tabMethods.length === 1 && (
          <View collapsable={false} style={styles.bottomShadowContainer}>
            {this.renderTabMethod(tabMethods[0], true)}
          </View>
        )}
        {tabMethods.length > 1 && (
          <Tabs
            headers={tabMethods.map(method => (
              <FormattedMessage
                id={`payments.tabHeader.${paymentMethodMessageIds[method]}`}
                style={[theme.paragraphSmall, theme.bold, styles.tabText]}
              />
            ))}
            raised
            style={styles.bottomShadowContainer}
          >
            {tabMethods.map(method => this.renderTabMethod(method))}
          </Tabs>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  bottomShadowContainer: {
    // without this hack, bottom shadow is not displayed
    marginBottom: -10,
    paddingBottom: 10,
  },

  marginHorizontal: {
    marginHorizontal: 10,
  },

  noTabs: {
    marginTop: -30,
  },

  tabShadow: {
    backgroundColor: colors.white,
    ...getShadow({ elevation: 5 }),
  },

  tabText: {
    textAlign: 'center',
  },
});

export default connect(
  ({ user, paymentMethods: { paymentMethods } }) => ({
    credit: user.user.credit,
    isFetching: paymentMethods.isFetching,
    error: paymentMethods.error,
    methods: paymentMethods.methods,
  }),
  { getPaymentMethods },
)(Payments);
