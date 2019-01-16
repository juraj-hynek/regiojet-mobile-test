// @flow
import { Animated, BackHandler, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { reduxifyNavigator } from 'react-navigation-redux-helpers';
import React, { Fragment } from 'react';
import SideMenu from 'react-native-side-menu';
import type { NavigationState } from 'react-navigation';

import { colors, MENU_WIDTH } from '../style';
import { goBack } from './actions';
import GlobalMessages from '../messages/GlobalMessages';
import Header from './Header';
import Menu from './Menu';
import Modal from '../modal/Modal';
import Navigator from './Navigator';
import withLocale from '../localization/withLocale';

type Props = {
  dispatch: Function,
  goBack: typeof goBack,
  intl: intlShape,
  menuGesturesDisabled: boolean,
  navigation: NavigationState,
};

type State = {
  isMenuOpen: boolean,
};

const NavigatorWithRedux = reduxifyNavigator(Navigator, 'root');

class AppNavigator extends React.Component<Props, State> {
  // eslint-disable-next-line react/sort-comp
  overlayOpacity = new Animated.Value(0);

  static menuAnimationFunction = (prop, value) =>
    Animated.spring(prop, {
      toValue: value,
      bounciness: 0,
    });

  state = {
    isMenuOpen: false,
  };

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleHardwareBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleHardwareBackPress);
  }

  handleHardwareBackPress = () => {
    if (this.state.isMenuOpen) {
      this.closeMenu();
      return true;
    }

    const {
      goBack,
      navigation: { index },
    } = this.props;

    if (index === 0) {
      return false;
    }

    goBack();
    return true;
  };

  closeMenu = () => this.handleMenuChange(false);

  openMenu = () => this.handleMenuChange(true);

  handleMenuChange = (isMenuOpen: boolean) => this.setState({ isMenuOpen });

  handleMenuSliding = percentage => this.overlayOpacity.setValue(percentage);

  render() {
    const { dispatch, navigation, intl, menuGesturesDisabled } = this.props;
    const { isMenuOpen } = this.state;

    return (
      <Fragment>
        <SideMenu
          animationFunction={AppNavigator.menuAnimationFunction}
          bounceBackOnOverdraw={false}
          isOpen={isMenuOpen}
          // $FlowFixMe
          menu={<Menu isOpen={isMenuOpen} onClose={this.closeMenu} />}
          menuPosition="right"
          onChange={this.handleMenuChange}
          onSliding={this.handleMenuSliding}
          openMenuOffset={MENU_WIDTH}
          disableGestures={menuGesturesDisabled}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.overlay,
              {
                opacity: this.overlayOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.25],
                }),
              },
            ]}
          />
          {/* $FlowFixMe */}
          <Header onMenuPress={this.openMenu} />
          <NavigatorWithRedux dispatch={dispatch} state={navigation} screenProps={{ intl }} />
          {/* $FlowFixMe */}
          <Modal />
        </SideMenu>
        {/* $FlowFixMe */}
        <GlobalMessages />
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: colors.blue,
    bottom: 0,
    elevation: 10,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
});

export default withLocale(
  connect(
    ({ general: { menuGesturesDisabled }, navigation }) => ({
      menuGesturesDisabled,
      navigation,
    }),
    (dispatch: Function) => ({
      goBack: () => dispatch(goBack()),
      dispatch,
    }),
  )(injectIntl(AppNavigator)),
);
