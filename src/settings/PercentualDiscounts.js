// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import { getUserPercentualDiscounts } from '../user/actions';
import FormattedMessage from '../components/FormattedMessage';
import LoaderSmall from '../components/LoaderSmall';
import type { PercentualDiscount as PercentualDiscountType, Style } from '../types';
import PercentualDiscount from './PercentualDiscount';

type Props = {|
  getUserPercentualDiscounts: typeof getUserPercentualDiscounts,
  isFetching: boolean,
  percentualDiscounts: Array<PercentualDiscountType>,
  style?: Style,
|};

class PercentualDiscounts extends React.PureComponent<Props> {
  componentDidMount() {
    this.props.getUserPercentualDiscounts();
  }

  render() {
    const { isFetching, percentualDiscounts, style } = this.props;

    return (
      <View style={[theme.container, style]}>
        <FormattedMessage id="settings.percentualDiscount.title" style={theme.h2} />

        {/* TODO retry button */}

        {isFetching && <LoaderSmall />}

        {!isFetching &&
          !percentualDiscounts.length && (
            <FormattedMessage id="settings.percentualDiscount.none" style={theme.paragraph} />
          )}

        {percentualDiscounts.map((discount, index) => (
          <PercentualDiscount
            discount={discount}
            key={discount.id}
            style={index !== 0 && styles.item}
          />
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    marginTop: 10,
  },
});

export default connect(
  ({
    user: {
      percentualDiscounts: { isFetching, list },
    },
  }) => ({
    isFetching,
    percentualDiscounts: list,
  }),
  {
    getUserPercentualDiscounts,
  },
)(PercentualDiscounts);
