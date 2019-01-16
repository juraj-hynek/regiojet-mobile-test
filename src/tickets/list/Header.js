// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import React, { Fragment } from 'react';

import { computeMinutesFromTimePeriod } from '../../helpers/time';
import { invokePayment } from '../../payment-methods/actions';
import { theme } from '../../style';
import Button from '../../components/Button';
import FormattedMessage from '../../components/FormattedMessage';
import Heading from '../../components/Heading';
import Price from '../../components/Price';
import Tabs from '../../components/Tabs';
import type { TicketListState } from '../reducer';

type Props = {
  Heading: Heading,
  invokePayment: typeof invokePayment,
  isPaying: boolean,
  onPress?: Function,
  selectedIndex?: number,
  ticketsUnpaid: TicketListState,
};

const computeUnpaidAmount = (tickets: TicketListState): number =>
  tickets.list.reduce((amount, ticket) => amount + ticket.unpaid, 0);

const getEarliestExpiration = (tickets: TicketListState): ?number => {
  const ticketsWithExpiration = tickets.list.filter(ticket => ticket.expirateAt);

  if (!ticketsWithExpiration.length) {
    return null;
  }

  const expirationsInMinutes = ticketsWithExpiration.map(ticket =>
    computeMinutesFromTimePeriod(ticket.expirateAt),
  );
  return Math.min(...expirationsInMinutes);
};

const TicketListHeader = ({
  Heading,
  invokePayment,
  isPaying,
  onPress,
  selectedIndex,
  ticketsUnpaid,
}: Props) => {
  const { error, isFetching, list } = ticketsUnpaid;
  const hasTickets = !error && !isFetching && list.length > 0;

  const unpaidAmount = computeUnpaidAmount(ticketsUnpaid);
  const earliestExpiration = getEarliestExpiration(ticketsUnpaid);
  const isInOldTickets = onPress && selectedIndex === 1;

  return (
    <Fragment>
      {Heading}

      {onPress ? (
        <Tabs
          headers={[
            <FormattedMessage
              id="tickets.tabHeader.newTickets"
              style={[theme.paragraphSmall, theme.bold]}
            />,
            <FormattedMessage
              id="tickets.tabHeader.oldTickets"
              style={[theme.paragraphSmall, theme.bold]}
            />,
          ]}
          onPress={onPress}
          raised
          selectedIndex={selectedIndex}
          style={styles.tabs}
        />
      ) : (
        <View style={styles.marginBottom} />
      )}

      {hasTickets &&
        unpaidAmount > 0 &&
        !isInOldTickets && (
          <View style={styles.ticketsUnpaidContainer}>
            {earliestExpiration !== null && (
              <FormattedMessage
                id="tickets.expiration"
                style={[theme.paragraph, styles.ticketsUnpaid]}
                values={{
                  status: <FormattedMessage id="tickets.expiration.status" style={theme.bold} />,
                  minutes: earliestExpiration,
                }}
              />
            )}
            <Button iconRight="chevronRight" loading={isPaying} onPress={() => invokePayment(list)}>
              <FormattedMessage id="tickets.button.payAll" textAfter=" " />
              <Price value={unpaidAmount} />
            </Button>
          </View>
        )}
    </Fragment>
  );
};

const styles = StyleSheet.create({
  tabs: {
    marginTop: 20,
    marginBottom: 30,
  },

  marginBottom: {
    marginBottom: 30,
  },

  ticketsUnpaidContainer: {
    marginBottom: 20,
    marginHorizontal: 10,
  },

  ticketsUnpaid: {
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default connect(
  ({ paymentMethods: { payTicket } }) => ({ isPaying: payTicket.isFetching }),
  {
    invokePayment,
  },
)(TicketListHeader);
