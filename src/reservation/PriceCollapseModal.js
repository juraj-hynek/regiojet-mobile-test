// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import get from 'lodash/get';
import React, { Fragment } from 'react';

import { colors, theme } from '../style';
import {
  computeAddonsPrice,
  computeTicketCodeDiscount,
  computeTicketPercentualDiscount,
  computeTicketPrice,
  computeTicketSurchargePrice,
  computeTotalPrice,
} from '../basket/helpers';
import { getAddonsDescription } from './helpers';
import { getTariffCountsLabel } from '../connections/helpers';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';
import type { BasketItem, Discount, Tariff } from '../types';

type Props = {|
  basketItems: Array<BasketItem>,
  isCredit: boolean,
  onCancel: Function,
  percentualDiscounts: Array<Discount>,
  tariffs: Array<Tariff>,
|};

class PriceCollapseModal extends React.PureComponent<Props> {
  static renderTicketItem(
    messageId: string,
    price: number,
    description?: string,
    isFirst?: boolean,
  ) {
    return (
      <View style={[styles.item, isFirst && styles.itemFirst]}>
        <View style={styles.label}>
          <FormattedMessage
            id={`reservation.priceCollapseModal.${messageId}`}
            style={theme.paragraph}
          />
          {description && <Text style={[theme.paragraph, styles.grey]}>{description}</Text>}
        </View>
        <Price style={[theme.paragraph, theme.semiBold, styles.price]} value={price} />
      </View>
    );
  }

  componentDidUpdate() {
    // close modal when basket items are removed
    if (this.props.basketItems.length === 0) {
      this.props.onCancel();
    }
  }

  renderBasketItem(basketItem: BasketItem, isFirst?: boolean) {
    const { isCredit, percentualDiscounts, tariffs } = this.props;

    const ticketPrice = computeTicketPrice(basketItem, isCredit);
    const ticketDescription = getTariffCountsLabel(basketItem.selectedPriceClass.tariffs, tariffs);
    const surchargePrice = computeTicketSurchargePrice(basketItem);
    const addonsPrice = computeAddonsPrice(basketItem.addons);
    const addonsDescription = getAddonsDescription(basketItem.addons);
    const codeDiscountPrice = computeTicketCodeDiscount(basketItem, isCredit);
    const percentualDiscountsPrice = computeTicketPercentualDiscount(
      basketItem,
      percentualDiscounts,
    );
    // we can't check addonsPrice > 0 because some addons are free
    const hasAddons = basketItem.addons.filter(addon => addon.checked).length > 0;

    return (
      <Fragment>
        {PriceCollapseModal.renderTicketItem('ticket', ticketPrice, ticketDescription, isFirst)}
        {codeDiscountPrice > 0 &&
          PriceCollapseModal.renderTicketItem('codeDiscount', -codeDiscountPrice)}
        {percentualDiscountsPrice > 0 &&
          PriceCollapseModal.renderTicketItem('percentualDiscount', -percentualDiscountsPrice)}
        {surchargePrice > 0 && PriceCollapseModal.renderTicketItem('surcharge', surchargePrice)}
        {hasAddons &&
          PriceCollapseModal.renderTicketItem('additionalServices', addonsPrice, addonsDescription)}
      </Fragment>
    );
  }

  render() {
    const { basketItems, isCredit, percentualDiscounts } = this.props;
    const totalPrice = computeTotalPrice(basketItems, percentualDiscounts, isCredit);

    return (
      <View style={[theme.container, styles.container]}>
        {basketItems.map((basketItem, index) => (
          <Fragment key={basketItem.shortid}>
            {this.renderBasketItem(basketItem, index === 0)}
          </Fragment>
        ))}

        <View style={[styles.item, styles.itemTotal]}>
          <FormattedMessage
            id="reservation.priceCollapseModal.total"
            style={[theme.paragraph, theme.bold, styles.label]}
            uppercase
          />
          <Price style={[theme.paragraph, theme.bold, styles.price]} value={totalPrice} />
        </View>
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  container: {
    marginVertical: -15,
    paddingTop: 0,
  },

  grey: {
    color: colors.grey,
  },

  item: {
    alignItems: 'center',
    borderTopColor: colors.greyShadowHexa,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingVertical: 15,
  },

  itemFirst: {
    borderTopWidth: 0,
  },

  itemTotal: {
    borderTopColor: colors.yellow,
  },

  label: {
    flex: 3,
  },

  price: {
    flex: 1,
    marginLeft: 10,
    textAlign: 'right',
  },
});

export default connect(
  ({ basket: { items, percentualDiscounts }, consts: { tariffs }, user: { user } }) => ({
    basketItems: items,
    isCredit: get(user, 'creditPrice'),
    percentualDiscounts,
    tariffs,
  }),
  {},
)(PriceCollapseModal);
