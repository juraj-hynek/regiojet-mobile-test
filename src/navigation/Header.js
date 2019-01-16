// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { colors, getHitSlop, getShadow, statusBarHeight, theme } from '../style';
import { goBack, goTo } from './actions';
import BasketItemsCount from '../basket/BasketItemsCount';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';
import TouchableOpacity from '../components/TouchableOpacity';

type Props = {
  basketItemsCount: number,
  goBack: typeof goBack,
  goTo: typeof goTo,
  onMenuPress: Function,
  showBackButton: boolean,
};

class Header extends React.PureComponent<Props> {
  handleBackPress = () => this.props.goBack();

  handleBasketPress = () => this.props.goTo('Basket');

  handleLogoPress = () => this.props.goTo('SearchRoutes');

  render() {
    const { basketItemsCount, onMenuPress, showBackButton } = this.props;
    // because QA will surely try
    const basketItemsText = basketItemsCount > 99 ? '99+' : basketItemsCount;
    const showBasketButton = basketItemsCount > 0;

    return (
      <View style={styles.container}>
        <View style={styles.columnLeft}>
          {showBackButton && (
            <TouchableOpacity
              hitSlop={getHitSlop()}
              onPress={this.handleBackPress}
              style={styles.back}
            >
              <Icon height={16} name="chevronLeft" width={10} />
              <FormattedMessage
                id="header.button.back"
                style={[theme.paragraphSmall, theme.semiBold, styles.backText]}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.columnMiddle}>
          <TouchableOpacity hitSlop={getHitSlop()} onPress={this.handleLogoPress}>
            <Icon height={16} name="logo" width={100} />
          </TouchableOpacity>
        </View>
        <View style={styles.columnRight}>
          {showBasketButton && (
            <TouchableOpacity
              hitSlop={getHitSlop()}
              onPress={this.handleBasketPress}
              style={styles.basketContainer}
            >
              <Icon height={16} name="cart" width={18} />
              <BasketItemsCount count={basketItemsText} small style={styles.basketItemsCount} />
            </TouchableOpacity>
          )}
          <TouchableOpacity hitSlop={getHitSlop()} onPress={onMenuPress}>
            <Icon height={16} name="burger" width={25} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  back: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  backText: {
    lineHeight: 16,
    marginLeft: 5,
  },

  basketContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginRight: 20,
  },

  basketItemsCount: {
    borderColor: colors.white,
    borderWidth: 1,
    marginLeft: -5,
    zIndex: 1,
  },

  columnLeft: {
    flex: 1,
  },

  columnMiddle: {
    alignItems: 'center',
    flex: 1,
  },

  columnRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  container: {
    ...getShadow({ elevation: 2 }),
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.yellow,
    borderBottomWidth: 2,
    flexDirection: 'row',
    paddingBottom: 15,
    paddingHorizontal: 10,
    paddingTop: 15 + statusBarHeight,
  },
});

export default connect(
  ({ basket, navigation }) => ({
    basketItemsCount: basket.items.length,
    showBackButton: navigation.index !== 0,
  }),
  { goBack, goTo },
)(Header);
