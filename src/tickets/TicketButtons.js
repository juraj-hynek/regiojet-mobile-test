// @flow
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { goTo } from '../navigation/actions';
import { invokePayment } from '../payment-methods/actions';
import { openCancelModal } from '../modal/actions';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import type { CustomerActions, Ticket } from '../types';

type Props = {|
  actions: CustomerActions,
  goTo: typeof goTo,
  invokePayment: typeof invokePayment,
  isPaying: boolean,
  openCancelModal: typeof openCancelModal,
  ticket: Ticket,
|};

class TicketButtons extends React.PureComponent<Props> {
  handleEvaluate = () => this.props.goTo('TicketRating', { ticketId: this.props.ticket.id });

  handlePay = () => this.props.invokePayment([this.props.ticket]);

  handleStorno = () => this.props.openCancelModal(this.props.ticket);

  render() {
    const { actions, isPaying } = this.props;
    const hasButton = ['pay', 'payRemaining', 'storno', 'evaluate'].some(action => actions[action]);

    if (!hasButton) {
      return null;
    }

    return (
      <View style={styles.container}>
        {(actions.pay || actions.payRemaining) && (
          <Button loading={isPaying} onPress={this.handlePay} size="small" style={styles.button}>
            <FormattedMessage
              id={actions.pay ? 'ticket.buttons.pay' : 'ticket.buttons.payRemaining'}
            />
          </Button>
        )}
        {actions.storno &&
          !actions.payRemaining && (
            <Button onPress={this.handleStorno} secondary size="small" style={styles.button}>
              <FormattedMessage id="ticket.buttons.storno" />
            </Button>
          )}
        {actions.evaluate && (
          <Button
            iconLeft="thumbsUp"
            onPress={this.handleEvaluate}
            size="small"
            style={styles.button}
            type="informational"
          >
            <FormattedMessage id="ticket.buttons.review" />
          </Button>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 5,
  },

  container: {
    marginVertical: -5,
    width: 158,
  },
});

export default connect(
  ({ paymentMethods: { payTicket } }) => ({ isPaying: payTicket.isFetching }),
  { goTo, invokePayment, openCancelModal },
)(TicketButtons);
