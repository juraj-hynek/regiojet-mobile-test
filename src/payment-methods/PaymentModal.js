// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import React, { Fragment } from 'react';

import { colors, theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import Payments from '../payment-methods/Payments';
import Price from '../components/Price';
import type { Ticket, User } from '../types';
import PriceCollapse from './PriceCollapse';

type Props = {
  tickets: Array<Ticket>,
  user: User,
};

const getCreditAddAmount = (tickets: Array<Ticket>, user: User) =>
  tickets.reduce((totalAmount, ticket) => totalAmount + ticket.unpaid, -user.credit);

const PaymentModal = ({ tickets, user }: Props) => {
  const hasCredit = user.credit > 0;
  const ticketIds = tickets.map(ticket => ticket.id);
  const creditAddAmount = hasCredit ? getCreditAddAmount(tickets, user) : undefined;

  return (
    <Fragment>
      {hasCredit ? (
        <View style={styles.remainingCredit}>
          <Text style={[theme.paragraph, theme.bold]}>
            <FormattedMessage id="payments.modal.summary.remainingCredit" textAfter=" " />
            <Price value={user.credit} />
          </Text>
          <FormattedMessage
            id="payments.modal.summary.amountToPay"
            style={theme.paragraph}
            values={{ amount: <Price value={creditAddAmount} /> }}
          />
        </View>
      ) : (
        <PriceCollapse tickets={tickets} />
      )}

      <Payments creditAddAmount={creditAddAmount} modal ticketIds={ticketIds} />
    </Fragment>
  );
};

const styles = StyleSheet.create({
  remainingCredit: {
    backgroundColor: colors.greyLayer,
    marginBottom: 30,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
});

export default connect(({ user: { user } }) => ({ user }), {})(PaymentModal);
