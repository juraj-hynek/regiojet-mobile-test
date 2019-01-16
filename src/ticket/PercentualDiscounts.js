// @flow
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import PercentualDiscount from './PercentualDiscount';
import type { PercentualDiscount as PercentualDiscountType } from '../types';

type Props = {
  discounts: Array<PercentualDiscountType>,
};

const PercentualDiscounts = ({ discounts }: Props) => (
  <View style={styles.container}>
    <FormattedMessage id="ticket.percentualDiscount.title" style={theme.h2} />
    <FormattedMessage
      id="ticket.percentualDiscount.description"
      style={[theme.paragraph, styles.description]}
    />

    <View style={styles.discounts}>
      {discounts.map(discount => (
        <PercentualDiscount discount={discount} key={discount.id} style={styles.discount} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },

  description: {
    marginBottom: 20,
  },

  discount: {
    marginVertical: 5,
  },

  discounts: {
    marginVertical: -5,
  },
});

export default PercentualDiscounts;
