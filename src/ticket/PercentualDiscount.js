// @flow
import { StyleSheet, Text } from 'react-native';
import React from 'react';

import { colors, theme } from '../style';
import Date from '../components/Date';
import FormattedMessage from '../components/FormattedMessage';
import Table from '../components/Table';
import type { PercentualDiscount as PercentualDiscountType, Style } from '../types';

type Props = {
  discount: PercentualDiscountType,
  style?: Style,
};

const PercentualDiscount = ({ discount, style }: Props) => {
  const headerMessageIds = [
    'ticket.percentualDiscount.percentage',
    'ticket.percentualDiscount.passengers',
  ];
  if (discount.fromLocation) {
    headerMessageIds.push('ticket.percentualDiscount.fromLocation');
  }
  if (discount.toLocation) {
    headerMessageIds.push('ticket.percentualDiscount.toLocation');
  }
  if (discount.dateFrom && discount.dateTo) {
    headerMessageIds.push('ticket.percentualDiscount.date');
  }
  headerMessageIds.push('ticket.percentualDiscount.status');

  return (
    <Table headerMessageIds={headerMessageIds} style={style}>
      <Text>{discount.percentage}</Text>
      <Text>{discount.passengers}</Text>
      {discount.fromLocation && <Text>{discount.fromLocation}</Text>}
      {discount.toLocation && <Text>{discount.toLocation}</Text>}
      {discount.dateFrom &&
        discount.dateTo && (
          <Text>
            <Date>{discount.dateFrom}</Date> - <Date>{discount.dateTo}</Date>
          </Text>
        )}
      <FormattedMessage
        id="ticket.percentualDiscount.applied"
        style={[theme.semiBold, styles.applied]}
      />
    </Table>
  );
};

const styles = StyleSheet.create({
  applied: {
    color: colors.green,
  },
});

export default PercentualDiscount;
