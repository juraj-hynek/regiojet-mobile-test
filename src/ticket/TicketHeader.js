// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import React, { Fragment } from 'react';

import { openCancelModal, openSendTicketByEmailModal } from '../modal/actions';
import { theme } from '../style';
import ButtonMini from '../components/ButtonMini';
import FormattedMessage from '../components/FormattedMessage';
import TicketButtons from './TicketButtons';
import TicketState from './TicketState';
import type { Ticket as TicketType } from '../types';

type Props = {
  accountCode: string,
  forPayment?: boolean,
  openCancelModal: typeof openCancelModal,
  openSendTicketByEmailModal: typeof openSendTicketByEmailModal,
  ticket: TicketType,
};

class TicketHeader extends React.PureComponent<Props> {
  handleSendToMail = () => this.props.openSendTicketByEmailModal(this.props.ticket.id);

  handleCancel = () => this.props.openCancelModal(this.props.ticket);

  render() {
    const { accountCode, forPayment, ticket } = this.props;
    const {
      customerActions,
      passengersInfo: { passengers },
      state,
    } = ticket;
    // TODO add 'rebook' when rebook is implemented
    const hasButton = ['sentToMail', 'cancel', 'storno'].some(action => customerActions[action]);

    return (
      <View style={theme.container}>
        <FormattedMessage style={theme.h1} id="ticket.reservation" textAfter={` ${accountCode}`} />

        {forPayment && (
          <TicketButtons
            actions={ticket.customerActions}
            style={styles.marginBottom}
            ticket={ticket}
            unpaidAmount={ticket.unpaid}
          />
        )}

        {!forPayment && (
          <Fragment>
            <TicketState state={state} style={styles.ticketState} />
            <FormattedMessage
              id="ticket.header.passengers"
              style={[theme.paragraphBig, styles.marginBottom]}
              values={{ passengers: passengers.length }}
            />
          </Fragment>
        )}

        {hasButton && (
          <View style={styles.buttons}>
            {/* TODO create actions for all buttons */}
            {customerActions.sentToMail && (
              <ButtonMini icon="email" onPress={this.handleSendToMail} style={styles.button}>
                <FormattedMessage id="ticket.buttons.email" />
              </ButtonMini>
            )}
            {customerActions.cancel && (
              <ButtonMini icon="cancel" onPress={this.handleCancel} style={styles.button}>
                <FormattedMessage id="ticket.buttons.cancel" />
              </ButtonMini>
            )}
            {customerActions.storno && (
              <ButtonMini icon="cancel" onPress={this.handleCancel} style={styles.button}>
                <FormattedMessage id="ticket.buttons.storno" />
              </ButtonMini>
            )}
            {/* TODO uncomment when rebook is implemented
            {customerActions.rebook && (
              <ButtonMini icon="refresh" onPress={() => {}} style={styles.button}>
                <FormattedMessage id="ticket.buttons.rebook" />
              </ButtonMini>
            )} */}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  ticketState: {
    marginHorizontal: -10,
    marginBottom: 10,
  },

  marginBottom: {
    marginBottom: 30,
  },

  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  button: {
    width: '33%',
  },
});

export default connect(
  ({
    user: {
      user: { accountCode },
    },
  }) => ({ accountCode }),
  {
    openCancelModal,
    openSendTicketByEmailModal,
  },
)(TicketHeader);
