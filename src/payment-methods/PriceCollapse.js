// @flow
import { Text, View } from 'react-native';
import get from 'lodash/get';
import React from 'react';

import { styles } from '../reservation/PriceCollapseModal';
import { theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';
import type { Ticket, TicketBill } from '../types';

type Props = {|
  tickets: Array<Ticket>,
|};

class PriceCollapse extends React.PureComponent<Props> {
  static renderTicketBill(bill: TicketBill, key: string, isFirst?: boolean) {
    return (
      <View key={key} style={[styles.item, isFirst && styles.itemFirst]}>
        <Text style={[styles.label, theme.paragraph]}>{bill.label}</Text>
        <Price
          currency={bill.currency}
          style={[theme.paragraph, theme.semiBold, styles.price]}
          value={bill.amount}
        />
      </View>
    );
  }

  static renderRemainingAmountBill(ticket: Ticket, isFirst?: boolean) {
    return (
      <View key={ticket.id} style={[styles.item, isFirst && styles.itemFirst]}>
        <FormattedMessage
          id="payments.modal.remainingAmountBill"
          style={[styles.label, theme.paragraph]}
        />
        <Price
          currency={ticket.currency}
          style={[theme.paragraph, theme.semiBold, styles.price]}
          value={ticket.unpaid}
        />
      </View>
    );
  }

  render() {
    const { tickets } = this.props;
    const currency = get(tickets, '[0].currency');
    const totalUnpaidPrice = tickets.reduce((total, ticket) => total + ticket.unpaid, 0);

    return (
      <View style={[theme.container, styles.container]}>
        {tickets.map((ticket, ticketIndex) => {
          /* user already paid some of the bills => display just "Remaining amount" message instead
          of all bills
          in a better world, API would add a flag "paid: boolean" to bills and we could
          filter them instead */
          if (ticket.price !== ticket.unpaid) {
            return PriceCollapse.renderRemainingAmountBill(ticket, ticketIndex === 0);
          }

          return ticket.bills.map((bill, billIndex) =>
            PriceCollapse.renderTicketBill(
              bill,
              `${ticket.id}${billIndex}`,
              ticketIndex === 0 && billIndex === 0,
            ),
          );
        })}
        <View style={[styles.item, styles.itemTotal]}>
          <FormattedMessage
            id="reservation.priceCollapseModal.total"
            style={[theme.paragraph, theme.bold, styles.label]}
            uppercase
          />
          <Price
            currency={currency}
            style={[theme.paragraph, theme.bold, styles.price]}
            value={totalUnpaidPrice}
          />
        </View>
      </View>
    );
  }
}

export default PriceCollapse;
