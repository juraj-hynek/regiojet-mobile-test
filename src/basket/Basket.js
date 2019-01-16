// @flow
import { connect } from 'react-redux';
import { Row } from 'native-base';
import { StyleSheet, View } from 'react-native';
import get from 'lodash/get';
import React, { Fragment } from 'react';

import { composeCheckoutPayload, composePageViewPayload } from '../analytics';
import { computeTotalPrice } from './helpers';
import { goTo } from '../navigation/actions';
import { theme } from '../style';
import BasketItem from './BasketItem';
import BasketItemsCount from './BasketItemsCount';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import gtmPush from '../analytics/gtmPush';
import Price from '../components/Price';
import type { BasketItem as BasketItemType, Currency, Discount } from '../types';
import Warning from '../components/Warning';

type Props = {|
  basketItems: Array<BasketItemType>,
  currency: Currency,
  goTo: typeof goTo,
  isLoggedIn: boolean,
  percentualDiscounts: Array<Discount>,
  showCreditPrice: boolean,
|};

class Basket extends React.PureComponent<Props> {
  componentDidMount() {
    this.pushAnalytics();
  }

  async pushAnalytics() {
    const { basketItems, currency, isLoggedIn, showCreditPrice } = this.props;
    await gtmPush(composePageViewPayload('Basket', isLoggedIn));
    gtmPush(composeCheckoutPayload('Basket', basketItems, currency, showCreditPrice));
  }

  render() {
    const { basketItems, goTo, percentualDiscounts, showCreditPrice } = this.props;
    const totalPrice = computeTotalPrice(basketItems, percentualDiscounts, showCreditPrice);

    return (
      <View>
        {basketItems.length === 0 ? (
          <Warning type="warning">
            <FormattedMessage id="basket.empty" />
          </Warning>
        ) : (
          <Fragment>
            <Row style={styles.headerContainer}>
              <FormattedMessage id="basket.header" style={[theme.paragraph, theme.bold]} />
              <BasketItemsCount count={basketItems.length} style={styles.basketItemsCount} />
            </Row>
            {basketItems.map(basketItem => (
              <View key={basketItem.shortid} style={styles.basketItem}>
                <BasketItem basketItem={basketItem} showCreditPrice={showCreditPrice} />
              </View>
            ))}
            <Row style={styles.priceContainer}>
              <FormattedMessage id="basket.totalPrice" style={theme.paragraph} textAfter=": " />
              <Price style={[theme.paragraph, theme.bold]} value={totalPrice} />
            </Row>
            <Button onPress={() => goTo('Reservation')} style={styles.button}>
              <FormattedMessage id="basket.button.chooseSeat" />
            </Button>
          </Fragment>
        )}
        <Button onPress={() => goTo('SearchRoutes')} style={styles.button} type="redLink">
          <FormattedMessage id="basket.button.goToSearch" />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },

  basketItemsCount: {
    marginLeft: 5,
  },

  basketItem: {
    marginBottom: 10,
  },

  priceContainer: {
    marginBottom: 10,
  },

  button: {
    marginTop: 20,
  },
});

export default connect(
  ({ basket: { items, percentualDiscounts }, localization: { currency }, user: { user } }) => ({
    basketItems: items,
    currency,
    isLoggedIn: !!user,
    percentualDiscounts,
    showCreditPrice: get(user, 'creditPrice'),
  }),
  { goTo },
)(Basket);
