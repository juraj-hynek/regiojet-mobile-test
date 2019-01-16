// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import get from 'lodash/get';
import React from 'react';

import { colors, theme } from '../style';
import {
  computeAddonsPrice,
  computeTicketCodeDiscount,
  computeTicketPercentualDiscount,
  computeTicketPrice,
  computeTicketSurchargePrice,
  computeTicketTotalPrice,
} from '../basket/helpers';
import { getAddonsDescription } from './helpers';
import { getTariffCountsLabel } from '../connections/helpers';
import FormattedMessage from '../components/FormattedMessage';
import List from '../components/List';
import Price from '../components/Price';
import type { BasketItem, Discount, Tariff } from '../types';

type Props = {|
  basketItem: BasketItem,
  isCredit: boolean,
  percentualDiscounts: Array<Discount>,
  tariffs: Array<Tariff>,
|};

const PriceCollapse = ({ basketItem, percentualDiscounts, tariffs, isCredit }: Props) => {
  const ticketPrice = computeTicketPrice(basketItem, isCredit);
  const surchargePrice = computeTicketSurchargePrice(basketItem);
  const addonsPrice = computeAddonsPrice(basketItem.addons);
  const codeDiscountPrice = computeTicketCodeDiscount(basketItem, isCredit);
  const percentualDiscountsPrice = computeTicketPercentualDiscount(basketItem, percentualDiscounts);
  // we can't check addonsPrice > 0 because some addons are free
  const hasAddons = basketItem.addons.filter(addon => addon.checked).length > 0;
  const totalPrice = computeTicketTotalPrice(basketItem, percentualDiscounts, isCredit);

  return (
    <View style={styles.container}>
      <FormattedMessage id="reservation.price" style={theme.h2} />

      <List>
        <Text>
          <FormattedMessage id="reservation.price.ticket" />:{' '}
          <Price style={theme.bold} value={ticketPrice} />
          {' ('}
          {getTariffCountsLabel(basketItem.selectedPriceClass.tariffs, tariffs)})
        </Text>
        {codeDiscountPrice > 0 && (
          <Text>
            <FormattedMessage id="reservation.price.codeDiscount" />:{' '}
            <Price style={theme.bold} value={-codeDiscountPrice} />
          </Text>
        )}
        {percentualDiscountsPrice > 0 && (
          <Text>
            <FormattedMessage id="reservation.price.percentualDiscount" />:{' '}
            <Price style={theme.bold} value={-percentualDiscountsPrice} />
          </Text>
        )}
        {surchargePrice > 0 && (
          <Text>
            <FormattedMessage id="reservation.price.surcharge" />:{' '}
            <Price style={theme.bold} value={surchargePrice} />
          </Text>
        )}
        {hasAddons && (
          <Text>
            <FormattedMessage id="reservation.price.additionalServices" />:{' '}
            <Price style={theme.bold} value={addonsPrice} /> ({getAddonsDescription(
              basketItem.addons,
            )})
          </Text>
        )}
      </List>

      <View style={styles.total}>
        <Text style={theme.paragraph}>
          <FormattedMessage id="reservation.price.total" />:{' '}
          <Price style={theme.bold} value={totalPrice} />
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },

  total: {
    borderTopColor: colors.yellow,
    borderTopWidth: 1,
    marginLeft: 25,
    marginTop: 15,
    paddingTop: 15,
  },
});

export default connect(
  ({ consts: { tariffs }, user: { user } }) => ({
    isCredit: get(user, 'creditPrice'),
    tariffs,
  }),
  {},
)(PriceCollapse);
