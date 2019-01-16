// @flow
import React, { type Node } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, theme } from '../../style';
import TouchableOpacity from '../TouchableOpacity';
import type { Style } from '../../types';

type Props = {
  disabled?: boolean,
  children: Node,
  onPress: Function,
  selected: boolean,
  style?: Style,
  value: any,
};

class Radio extends React.Component<Props> {
  onPress = () => this.props.onPress(this.props.value);

  render() {
    const { disabled, children, selected, style } = this.props;

    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={this.onPress}
        style={[styles.container, style]}
      >
        <View
          style={[
            styles.radio,
            selected && styles.radioSelected,
            selected && disabled && styles.radioDisabled,
          ]}
        >
          {selected && <View style={styles.radioInner} />}
        </View>
        <View style={styles.textContainer}>
          <Text style={[theme.paragraph, disabled && styles.textDisabled]}>{children}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  radio: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.grey,
    borderRadius: 13,
    borderWidth: 1,
    height: 25,
    justifyContent: 'center',
    marginRight: 10,
    width: 25,
  },

  radioSelected: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },

  radioDisabled: {
    backgroundColor: colors.grey,
    borderColor: colors.grey,
  },

  radioInner: {
    backgroundColor: colors.white,
    borderRadius: 5,
    height: 10,
    width: 10,
  },

  textContainer: {
    flex: 1,
  },

  textDisabled: {
    color: colors.grey,
  },
});

export default Radio;
