// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text } from 'react-native';
import React from 'react';

import { colors } from '../style';
import { goTo } from '../navigation/actions';
import Date from '../components/Date';
import FormattedMessage from '../components/FormattedMessage';
import Table from '../components/Table';
import TouchableOpacity from '../components/TouchableOpacity';
import type { PercentualDiscount as PercentualDiscountType, Style } from '../types';

type Props = {
  discount: PercentualDiscountType,
  goTo: typeof goTo,
  style?: Style,
};

const PercentualDiscount = ({ discount, goTo, style }: Props) => {
  const headerMessageIds = [
    'reservation.percentualDiscount.percentage',
    'reservation.percentualDiscount.passengers',
  ];
  if (discount.fromLocation) {
    headerMessageIds.push('reservation.percentualDiscount.fromLocation');
  }
  if (discount.toLocation) {
    headerMessageIds.push('reservation.percentualDiscount.toLocation');
  }
  if (discount.dateFrom && discount.dateTo) {
    headerMessageIds.push('reservation.percentualDiscount.date');
  }
  headerMessageIds.push('reservation.percentualDiscount.status');

  return (
    <TouchableOpacity
      disabled={!discount.ticketId}
      onPress={() => goTo('Ticket', { ticketId: discount.ticketId })}
      style={style}
    >
      <Table headerMessageIds={headerMessageIds}>
        <Text>{discount.percentage}</Text>
        <Text>{discount.passengers}</Text>
        {discount.fromLocation && <Text>{discount.fromLocation}</Text>}
        {discount.toLocation && <Text>{discount.toLocation}</Text>}
        {discount.dateFrom &&
          discount.dateTo && (
            <Text>
              <Date>{discount.dateFrom}</Date> – <Date>{discount.dateTo}</Date>
            </Text>
          )}
        <FormattedMessage
          id={`settings.percentualDiscount.${discount.state.toLowerCase()}`}
          style={discount.state === 'VALID' ? styles.green : styles.red}
        />
      </Table>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  green: {
    color: colors.green,
  },

  red: {
    color: colors.red,
  },
});

export default connect(null, { goTo })(PercentualDiscount);
