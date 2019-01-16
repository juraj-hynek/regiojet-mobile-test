// @flow
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { colors, composeFontStyle, theme } from '../style';
import { computeMinutesFromTimePeriod } from '../helpers/time';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';
import type { Style, Ticket, TicketState as TicketStateType } from '../types';

export const ticketStateMessageIds = {
  CANCELED: 'canceled',
  DELETED: 'deleted',
  EXPIRED: 'expired',
  TO_BE_EXPIRED: 'toBeExpired',
  UNPAID: 'unpaid',
  USED: 'used',
  VALID: 'valid',
};

export const getTicketStateMessageId = (state: string) => ticketStateMessageIds[state] || 'unknown';

export const isTicketStateValid = (state: TicketStateType) =>
  !['TO_BE_EXPIRED', 'EXPIRED', 'CANCELED', 'DELETED'].includes(state);

const ticketStateColors = {
  TO_BE_EXPIRED: colors.yellow,
  UNPAID: colors.red,
  USED: colors.green,
  VALID: colors.green,
};

const getTicketStateColor = (state: string) => ticketStateColors[state] || colors.grey;

type Props = {
  style?: Style,
  ticket: Ticket,
};

const TicketState = ({ style, ticket }: Props) => {
  const messageId = `tickets.status.${getTicketStateMessageId(ticket.state)}`;
  const color = getTicketStateColor(ticket.state);
  const expiration = computeMinutesFromTimePeriod(ticket.expirateAt);

  return (
    <View style={style}>
      <Text style={[theme.paragraphSmall, theme.semiBold, { color }]}>
        <FormattedMessage id={messageId} />{' '}
        {ticket.state === 'UNPAID' && <Price value={ticket.unpaid} />}
      </Text>
      {ticket.state === 'UNPAID' &&
        expiration > 0 && (
          <FormattedMessage
            id="tickets.detail.expirateAt"
            style={[theme.paragraphSmall, styles.expiration]}
            values={{ minutes: expiration }}
          />
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  expiration: {
    ...composeFontStyle(12),
    color: colors.grey,
  },
});

export default TicketState;
