// @flow
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { goTo } from '../navigation/actions';
import { invokePayment } from '../payment-methods/actions';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';
import type { CustomerActions, Style, Ticket } from '../types';

type Props = {|
  actions: CustomerActions,
  goTo: typeof goTo,
  invokePayment: typeof invokePayment,
  isPaying: boolean,
  style?: Style,
  ticket: Ticket,
  unpaidAmount: number,
|};

class TicketButtons extends React.PureComponent<Props> {
  handleEvaluate = () => this.props.goTo('TicketRating', { ticketId: this.props.ticket.id });

  handlePay = () => this.props.invokePayment([this.props.ticket]);

  render() {
    const { actions, isPaying, style, unpaidAmount } = this.props;
    const hasButton = ['pay', 'payRemaining', 'evaluate'].some(action => actions[action]);

    if (!hasButton) {
      return null;
    }

    return (
      <View style={style}>
        <View style={styles.container}>
          {(actions.pay || actions.payRemaining) && (
            <Button
              iconRight="chevronRight"
              loading={isPaying}
              onPress={this.handlePay}
              style={styles.button}
            >
              <FormattedMessage
                id={actions.pay ? 'ticket.buttons.pay' : 'ticket.buttons.payRemaining'}
                textAfter=" "
              />
              <Price value={unpaidAmount} />
            </Button>
          )}
          {actions.evaluate && (
            <Button
              iconLeft="thumbsUp"
              onPress={this.handleEvaluate}
              style={styles.button}
              type="informational"
            >
              <FormattedMessage id="ticket.buttons.review" />
            </Button>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginVertical: -5,
  },

  button: {
    marginVertical: 5,
  },
});

export default connect(
  ({ paymentMethods: { payTicket } }) => ({ isPaying: payTicket.isFetching }),
  {
    goTo,
    invokePayment,
  },
)(TicketButtons);
