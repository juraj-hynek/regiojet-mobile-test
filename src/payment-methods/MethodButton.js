// @flow
import { StyleSheet } from 'react-native';
import React from 'react';

import { colors } from '../style/index';
import { paymentIcons } from './helpers';
import Icon from '../components/Icon';
import TouchableOpacity from '../components/TouchableOpacity';
import type { PaymentMethod } from '../types';

type Props = {
  big: boolean,
  method: PaymentMethod,
  onPress: Function,
};

class MethodButton extends React.PureComponent<Props> {
  static defaultProps = {
    big: false,
  };

  handlePress = () => this.props.onPress(this.props.method);

  render() {
    const { big, method } = this.props;
    // prettier-ignore
    const buttonWidth = big ? (90 * 2) + 10 : 90;
    const iconWidth = buttonWidth - 20;

    return (
      <TouchableOpacity
        disabled={!method.active}
        onPress={this.handlePress}
        style={[styles.button, { width: buttonWidth }]}
      >
        <Icon
          disabled={!method.active}
          height={35}
          name={paymentIcons[method.paymentMethodCode]}
          width={iconWidth}
        />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderColor: colors.greyShadow,
    borderWidth: 1,
    height: 65,
    justifyContent: 'center',
    margin: 5,
  },
});

export default MethodButton;
