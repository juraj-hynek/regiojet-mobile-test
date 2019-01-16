// @flow
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';
import Table from '../components/Table';
import type { TicketBill } from '../types';

type Props = {
  bills: Array<TicketBill>,
};

const Bills = ({ bills }: Props) => (
  <View style={styles.container}>
    <FormattedMessage id="ticket.bills.heading" style={theme.h2} />

    <View style={styles.bills}>
      {bills.map((bill, index) => (
        <Table
          headerMessageIds={['ticket.bills.tableHeader.label', 'ticket.bills.tableHeader.amount']}
          key={index} // eslint-disable-line react/no-array-index-key
          style={styles.bill}
        >
          <Text>{bill.label}</Text>
          <Price currency={bill.currency} value={bill.amount} />
        </Table>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },

  bills: {
    marginVertical: -5,
  },

  bill: {
    marginVertical: 5,
  },
});

export default Bills;
