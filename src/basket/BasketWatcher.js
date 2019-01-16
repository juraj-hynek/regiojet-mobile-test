// @flow
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { removeAllBasketItems } from './actions';

type Props = {
  basketItems: Array<Object>,
  lastChange: moment,
  removeAllBasketItems: Function,
};

class BasketWatcher extends React.Component<Props> {
  static MINUTES_IN_BASKET = 20;
  static WATCH_INTERVAL = 60000;

  // eslint-disable-next-line react/sort-comp
  expirationInterval;

  componentDidMount() {
    if (this.props.basketItems.length) {
      this.startInterval();
      this.checkBasketExpiration();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    // new items added to empty basket => start interval
    if (nextProps.basketItems.length && !this.props.basketItems.length) {
      this.startInterval();
    }
    // all items removed from basket => stop interval
    if (!nextProps.basketItems.length && this.props.basketItems.length) {
      this.stopInterval();
    }
  }

  componentWillUnmount() {
    this.stopInterval();
  }

  checkBasketExpiration = () => {
    const { lastChange, removeAllBasketItems } = this.props;

    if (
      moment()
        .subtract(BasketWatcher.MINUTES_IN_BASKET, 'minutes')
        .isAfter(lastChange)
    ) {
      removeAllBasketItems();
    }
  };

  startInterval() {
    this.expirationInterval = setInterval(this.checkBasketExpiration, BasketWatcher.WATCH_INTERVAL);
  }

  stopInterval() {
    if (this.expirationInterval) {
      clearInterval(this.expirationInterval);
    }
  }

  render() {
    return null;
  }
}

export default connect(
  ({ basket }) => ({
    basketItems: basket.items,
    lastChange: basket.lastChange,
  }),
  {
    removeAllBasketItems,
  },
)(BasketWatcher);
