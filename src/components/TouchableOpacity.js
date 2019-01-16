// @flow

/**
 * Replacement of TouchableOpacity from react-native with default activeOpacity from style
 */
import { Keyboard, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import React from 'react';

import { touchableActiveOpacity } from '../style';

type Props = {
  keepKeyboard?: boolean,
  onPress: Function,
};

class TouchableOpacity extends React.PureComponent<Props> {
  handlePress = (event: SyntheticEvent<any>) => {
    if (!this.props.keepKeyboard) {
      Keyboard.dismiss();
    }
    this.props.onPress(event);
  };

  render() {
    return (
      <RNTouchableOpacity
        activeOpacity={touchableActiveOpacity}
        {...this.props}
        onPress={this.handlePress}
      />
    );
  }
}

export default TouchableOpacity;
