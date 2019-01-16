// @flow
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, theme } from '../../style';
import TouchableOpacity from '../TouchableOpacity';
import type { Style } from '../../types';

type Props = {
  disabled?: boolean,
  min: ?number,
  max: ?number,
  onChange: Function,
  style?: Style,
  value: number,
};

class NumberPicker extends React.Component<Props> {
  static defaultProps = {
    min: null,
    max: null,
  };

  handleAdd = () => this.props.onChange(this.props.value + 1);

  handleSubtract = () => this.props.onChange(this.props.value - 1);

  render() {
    const { disabled, min, max, style, value } = this.props;
    const buttonTextStyles = [theme.paragraph, theme.bold, styles.buttonText];
    const disabledSubtract = disabled || min === value;
    const disabledAdd = disabled || max === value;

    return (
      <View style={[styles.container, disabled && styles.disabled, style]}>
        <TouchableOpacity
          disabled={disabledSubtract}
          onPress={this.handleSubtract}
          style={styles.buttonContainer}
        >
          <View style={[styles.button, disabledSubtract && styles.buttonDisabled]}>
            <Text style={buttonTextStyles}>-</Text>
          </View>
        </TouchableOpacity>
        <Text style={[theme.paragraph, styles.value]}>{value}</Text>
        <TouchableOpacity
          disabled={disabledAdd}
          onPress={this.handleAdd}
          style={styles.buttonContainer}
        >
          <View style={[styles.button, styles.buttonAdd, disabledAdd && styles.buttonDisabled]}>
            <Text style={buttonTextStyles}>+</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderColor: colors.grey,
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: 'row',
  },

  disabled: {
    backgroundColor: colors.greyLayer,
  },

  buttonContainer: {
    height: 50,
    marginHorizontal: -1,
    marginVertical: -1,
    width: 50,
  },

  button: {
    alignItems: 'center',
    backgroundColor: colors.grey,
    borderRadius: 5,
    justifyContent: 'center',
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  buttonAdd: {
    backgroundColor: colors.red,
  },

  buttonText: {
    color: colors.white,
    fontSize: 26,
    lineHeight: 50,
  },

  value: {
    lineHeight: 50,
    marginHorizontal: 1,
    marginVertical: -1,
    minWidth: 80,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
});

export default NumberPicker;
