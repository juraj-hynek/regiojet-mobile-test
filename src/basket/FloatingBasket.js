// @flow
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { goTo } from '../navigation/actions';
import BasketItemsCount from './BasketItemsCount';
import Button from '../components/Button';
import { colors, getShadow, theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';
import TouchableOpacity from '../components/TouchableOpacity';

type Props = {
  basketItemsCount: number,
  goTo: typeof goTo,
};

const FloatingBasket = ({ basketItemsCount, goTo }: Props) => {
  if (basketItemsCount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => goTo('Basket')} style={styles.headerContainer}>
        <Icon height={14} name="search" style={styles.icon} width={14} />
        <FormattedMessage id="basket.header" style={[theme.paragraph, theme.bold]} />
        <BasketItemsCount count={basketItemsCount} style={styles.basketItemsCount} />
      </TouchableOpacity>
      <Button iconRight="chevronRight" onPress={() => goTo('Reservation')} size="small">
        <FormattedMessage id="basket.button.chooseSeat" />
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...getShadow({ elevation: 7 }),
    backgroundColor: colors.white,
    padding: 10,
  },

  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },

  icon: {
    marginRight: 5,
  },

  basketItemsCount: {
    marginLeft: 5,
  },
});

export default connect(
  ({ basket }) => ({
    basketItemsCount: basket.items.length,
  }),
  {
    goTo,
  },
)(FloatingBasket);
