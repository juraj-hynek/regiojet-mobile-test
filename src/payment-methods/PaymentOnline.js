// @flow
import { View } from 'react-native';
import React from 'react';

import { convertToFloat } from '../helpers/text';
import { theme } from '../style/index';
import PaymentOnlineForm from './PaymentOnlineForm';
import PaymentOnlineSubmit from './PaymentOnlineSubmit';
import type { PaymentMethod } from '../types';

type Props = {|
  creditAddAmount?: number,
  modal?: boolean,
  ticketIds?: Array<number>,
|};

type State = {
  selectedAmount: ?number,
  selectedMethod: ?PaymentMethod,
};

class PaymentOnline extends React.Component<Props, State> {
  state = {
    selectedAmount: null,
    selectedMethod: null,
  };

  resetMethod = () => {
    this.setState({ selectedMethod: null });
  };

  handleAmountSelect = (selectedAmount: string) => {
    this.setState({ selectedAmount: convertToFloat(selectedAmount) });
  };

  handleMethodSelect = (selectedMethod: PaymentMethod) => {
    this.setState({ selectedMethod });
  };

  render() {
    const { creditAddAmount, modal, ticketIds } = this.props;
    const { selectedAmount, selectedMethod } = this.state;

    return (
      <View style={theme.container}>
        {selectedMethod ? (
          <PaymentOnlineSubmit
            creditAddAmount={selectedAmount || creditAddAmount}
            modal={modal}
            paymentMethodCode={selectedMethod.paymentMethodCode}
            resetMethod={this.resetMethod}
            ticketIds={ticketIds}
          />
        ) : (
          // $FlowFixMe
          <PaymentOnlineForm
            isPayment={!!ticketIds}
            onAmountSelect={this.handleAmountSelect}
            onMethodSelect={this.handleMethodSelect}
          />
        )}
      </View>
    );
  }
}

export default PaymentOnline;
