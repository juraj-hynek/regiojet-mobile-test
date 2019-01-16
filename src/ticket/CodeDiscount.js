// @flow
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { colors, theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';
import Table from '../components/Table';
import type { CodeDiscount as CodeDiscountType } from '../types';

type Props = {
  discount: CodeDiscountType,
};

const CodeDiscount = ({ discount }: Props) => (
  <View style={styles.container}>
    <FormattedMessage id="ticket.discount.title" style={theme.h2} />

    <Table
      headerMessageIds={[
        'ticket.discount.code',
        'ticket.discount.amount',
        'ticket.discount.status',
      ]}
    >
      <Text>{discount.code}</Text>
      <Price value={discount.discount} />
      <FormattedMessage id="ticket.discount.applied" style={[theme.semiBold, styles.applied]} />
    </Table>
  </View>
);

const styles = StyleSheet.create({
  applied: {
    color: colors.green,
  },

  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },
});

export default CodeDiscount;
