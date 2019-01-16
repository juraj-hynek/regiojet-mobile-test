// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text } from 'react-native';
import React from 'react';

import { dateFormat, timeFormat } from '../localization/localeData';
import { goTo } from '../navigation/actions';
import { theme } from '../style';
import Date from '../components/Date';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';
import Table from '../components/Table';
import TextLink from '../components/TextLink';
import type { Transaction } from '../types';

type Props = {
  goTo: typeof goTo,
  payment: Transaction,
};

class PaymentItem extends React.PureComponent<Props> {
  handlePress = () => this.props.goTo('Ticket', { ticketId: this.props.payment.ticketId });

  render() {
    const { payment } = this.props;

    return (
      <Table
        headerMessageIds={[
          'payments.tableHeader.description',
          'payments.tableHeader.amount',
          'payments.tableHeader.method',
          'payments.tableHeader.dateTransaction',
        ]}
        style={styles.container}
      >
        {payment.ticketId ? (
          <TextLink onPress={this.handlePress}>{payment.description}</TextLink>
        ) : (
          <Text>{payment.description}</Text>
        )}
        <Price currency={payment.currency} style={theme.bold} value={payment.amount} />
        <FormattedMessage id={`payments.transactionMethods.${payment.method}`} />
        <Date format={`${dateFormat} ${timeFormat}`}>{payment.dateTransaction}</Date>
      </Table>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
});

export default connect(null, { goTo })(PaymentItem);
