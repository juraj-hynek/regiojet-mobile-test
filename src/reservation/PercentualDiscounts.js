// @flow
import { StyleSheet, View } from 'react-native';
import React, { Fragment } from 'react';

import { theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import PercentualDiscount from './PercentualDiscount';
import Price from '../components/Price';
import type { BasketItem, Discount } from '../types';
import Warning from '../components/Warning';

type Props = {
  addingDisabled: boolean,
  basketItem: BasketItem,
  disabled: boolean,
  discounts: Array<Discount>,
  scrollToElement: Function,
};

class PercentualDiscounts extends React.PureComponent<Props> {
  static defaultProps = {
    scrollToElement: () => {},
  };

  // eslint-disable-next-line react/sort-comp
  refContainer = null;

  componentDidUpdate(prevProps: Props) {
    if (this.props.addingDisabled && !prevProps.addingDisabled) {
      this.props.scrollToElement(this.refContainer);
    }
  }

  updateRefContainer = (ref: ?Object) => {
    this.refContainer = ref;
  };

  render() {
    const { addingDisabled, basketItem, disabled, discounts } = this.props;
    const zeroPrice = <Price value={0} />;

    return (
      <View collapsable={false} ref={this.updateRefContainer} style={styles.container}>
        <FormattedMessage id="reservation.percentualDiscount.title" style={theme.h2} />
        <FormattedMessage
          id="reservation.percentualDiscount.description"
          style={[theme.paragraph, styles.marginBottom]}
        />
        {disabled ? (
          <Warning type="warning">
            <FormattedMessage
              id="reservation.percentualDiscount.zeroPrice"
              values={{ price: zeroPrice }}
            />
          </Warning>
        ) : (
          <Fragment>
            {addingDisabled && (
              <Warning style={styles.marginBottom} type="warning">
                <FormattedMessage
                  id="reservation.percentualDiscount.zeroPricePercentual"
                  values={{ price: zeroPrice }}
                />
              </Warning>
            )}
            <View style={styles.discounts}>
              {discounts.map(discount => (
                <PercentualDiscount
                  basketItem={basketItem}
                  discount={discount}
                  key={discount.id}
                  style={styles.discount}
                />
              ))}
            </View>
          </Fragment>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },

  discount: {
    marginVertical: 5,
  },

  discounts: {
    marginVertical: -5,
  },

  marginBottom: {
    marginBottom: 20,
  },
});

export default PercentualDiscounts;
