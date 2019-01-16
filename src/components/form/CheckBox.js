// @flow
import React, { type Node } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, theme } from '../../style';
import { isFieldInvalid } from './helpers';
import FormattedMessage from '../FormattedMessage';
import Icon from '../Icon';
import TermsAndConditions from '../TermsAndConditions';
import TouchableOpacity from '../TouchableOpacity';
import type { Style } from '../../types';
import type { ValidationResult as ValidationResultType } from './validation';
import ValidationError from './ValidationError';

type Props = {
  disabled?: boolean,
  checked?: boolean,
  children: Node,
  labelStyle?: Style,
  onPress: Function,
  scrollToElement: Function,
  style?: Style,
  validation?: ?ValidationResultType,
};

class CheckBox extends React.Component<Props> {
  static defaultProps = {
    scrollToElement: () => {},
  };

  componentWillReceiveProps(nextProps: Props) {
    const { scrollToElement, validation } = nextProps;
    const prevValidation = this.props.validation;
    if (
      validation &&
      validation.isFirstInvalid &&
      this.refContainer &&
      prevValidation !== validation
    ) {
      scrollToElement(this.refContainer);
    }
  }

  onPress = () => this.props.onPress(!this.props.checked);

  refContainer = null;
  renderChildren() {
    const { children, disabled } = this.props;

    /* eslint-disable indent */
    return React.Children.map(
      children,
      child =>
        child && [FormattedMessage, TermsAndConditions, Text].includes(child.type)
          ? React.cloneElement(child, {
              style: [theme.paragraph, child.props.style, disabled && styles.textDisabled],
            })
          : child,
    );
    /* eslint-enable indent */
  }

  render() {
    const { disabled, checked, labelStyle, style, validation } = this.props;
    const isInvalid = isFieldInvalid(validation);

    return (
      <View
        collapsable={false}
        ref={ref => {
          this.refContainer = ref;
        }}
        style={style}
      >
        <TouchableOpacity disabled={disabled} onPress={this.onPress} style={styles.container}>
          <View
            style={[
              styles.checkBox,
              checked && styles.checkBoxChecked,
              checked && disabled && styles.checkBoxDisabled,
            ]}
          >
            {checked && <Icon name="checkBold" width={18} />}
          </View>
          <View style={[styles.labelContainer, labelStyle]}>{this.renderChildren()}</View>
        </TouchableOpacity>
        {isInvalid && <ValidationError error={validation} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  checkBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.grey,
    borderRadius: 5,
    borderWidth: 1,
    height: 25,
    justifyContent: 'center',
    marginRight: 10,
    width: 25,
  },

  checkBoxChecked: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },

  checkBoxDisabled: {
    backgroundColor: colors.grey,
    borderColor: colors.grey,
  },

  labelContainer: {
    flex: 1,
  },

  textDisabled: {
    color: colors.grey,
  },
});

export default CheckBox;
