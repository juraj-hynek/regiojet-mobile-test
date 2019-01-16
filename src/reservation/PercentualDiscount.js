// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text } from 'react-native';
import React from 'react';

import { colors, theme } from '../style';
import { removePercentualDiscount, verifyPercentualDiscount } from '../basket/actions';
import Button from '../components/Button';
import Date from '../components/Date';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';
import Table from '../components/Table';
import type { BasketItem, Discount, Style } from '../types';

type Props = {
  basketItem: BasketItem,
  discount: Discount,
  isFetching: boolean,
  removePercentualDiscount: typeof removePercentualDiscount,
  style?: Style,
  verifyPercentualDiscount: typeof verifyPercentualDiscount,
};

class PercentualDiscount extends React.PureComponent<Props> {
  handleRemove = () => {
    const { basketItem, discount, removePercentualDiscount } = this.props;
    removePercentualDiscount(discount.id, basketItem);
  };

  handleSubmit = () => {
    const { basketItem, discount, verifyPercentualDiscount } = this.props;
    verifyPercentualDiscount(discount.id, basketItem);
  };

  render() {
    const { discount, isFetching, style } = this.props;
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
    if (discount.applied) {
      headerMessageIds.splice(1, 0, 'reservation.percentualDiscount.amount');
      headerMessageIds.push('reservation.percentualDiscount.status');
    }

    return (
      <Table
        footer={
          discount.applied ? (
            <Button onPress={this.handleRemove} secondary style={styles.submit}>
              <FormattedMessage id="reservation.percentualDiscount.remove" />
            </Button>
          ) : (
            <Button
              loading={isFetching}
              onPress={this.handleSubmit}
              secondary
              style={styles.submit}
            >
              <FormattedMessage id="reservation.percentualDiscount.submit" />
            </Button>
          )
        }
        headerMessageIds={headerMessageIds}
        style={style}
      >
        <Text>{discount.percentage}</Text>
        {discount.applied ? (
          <Price currency={discount.applied.currency} value={discount.applied.amount} />
        ) : null}
        <Text>{discount.passengers}</Text>
        {discount.fromLocation && <Text>{discount.fromLocation}</Text>}
        {discount.toLocation && <Text>{discount.toLocation}</Text>}
        {discount.dateFrom &&
          discount.dateTo && (
            <Text>
              <Date>{discount.dateFrom}</Date> - <Date>{discount.dateTo}</Date>
            </Text>
          )}
        {discount.applied ? (
          <FormattedMessage
            id="reservation.percentualDiscount.applied"
            style={[theme.semiBold, styles.applied]}
          />
        ) : null}
      </Table>
    );
  }
}

const styles = StyleSheet.create({
  applied: {
    color: colors.green,
  },

  submit: {
    marginTop: 10,
  },
});

export default connect(
  ({ basket: { isVerifyingPercentualDiscount } }) => ({
    isFetching: isVerifyingPercentualDiscount,
  }),
  { removePercentualDiscount, verifyPercentualDiscount },
)(PercentualDiscount);
