// @flow
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import React from 'react';

import { colors, fontFamilies, theme } from '../../style';
import { isFieldInvalid, isFieldValid, getIconColor, getIconName } from './helpers';
import FloatingLabel from './FloatingLabel';
import FormattedMessage from '../FormattedMessage';
import Icon from '../Icon';
import TouchableOpacity from '../TouchableOpacity';
import type { IconType } from '../Icon';
import type { Style } from '../../types';
import type { ValidationResult as ValidationResultType } from './validation';
import ValidationError from './ValidationError';

type Props = {
  allowKeyboard: boolean,
  disabled?: boolean,
  iconName?: IconType,
  label: string,
  leftLabel?: boolean,
  iconText?: string,
  keyboardType?: string,
  numberOfLines: number,
  onBlur: Function,
  onDelete?: Function,
  onFocus: Function,
  onChange: Function,
  optionalColor: string,
  required?: boolean,
  scrollToElement: Function,
  secureTextEntry?: boolean,
  style?: Style,
  validation?: ?ValidationResultType,
  value?: string | number,
};

type State = {
  isFocused: boolean,
  isPasswordHidden: boolean,
};

class Input extends React.Component<Props, State> {
  static defaultProps = {
    allowKeyboard: true,
    numberOfLines: 1,
    onBlur: () => {},
    onChange: () => {},
    onFocus: () => {},
    optionalColor: colors.grey,
    scrollToElement: () => {},
  };

  state = {
    isFocused: false,
    isPasswordHidden: true,
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

  onChangeText = (value: string) => {
    this.props.onChange(value);
  };

  onBlur = (event: SyntheticEvent<any>) => {
    this.props.onBlur(event);
    this.setState({ isFocused: false });
  };

  onFocus = (event: SyntheticEvent<any>) => {
    this.props.onFocus(event);
    this.setState({ isFocused: true });
  };

  refContainer = null;

  togglePassword = () => {
    this.setState(prevState => ({ isPasswordHidden: !prevState.isPasswordHidden }));
  };

  shouldDisplayIconText = (isValid: boolean) => {
    const { iconText } = this.props;
    return iconText && !isValid;
  };

  composeIconName = () => {
    const { iconName } = this.props;
    const defaultIcon = this.props.keyboardType === 'email-address' ? 'emailAt' : undefined;
    return iconName || defaultIcon;
  };

  renderIcon(iconName: IconType) {
    if (!iconName) {
      return null;
    }

    return (
      <Icon
        color={getIconColor(this.props.validation, !!(this.props.onDelete && this.props.value))}
        name={iconName}
        style={styles.icon}
      />
    );
  }

  render() {
    const {
      allowKeyboard,
      disabled,
      iconText,
      keyboardType,
      label,
      numberOfLines,
      style,
      leftLabel,
      onChange,
      onDelete,
      optionalColor,
      required,
      scrollToElement,
      secureTextEntry,
      validation,
      value,
      ...otherProps
    } = this.props;
    const { isFocused, isPasswordHidden } = this.state;
    const iconName = this.composeIconName();
    const isInvalid = isFieldInvalid(validation);
    const isValid = isFieldValid(validation);
    const iconNameAfterValidation = getIconName(validation, iconName, !!(onDelete && value));
    const inputValue = value ? `${value}` : '';
    // eslint-disable-next-line no-mixed-operators
    const inputContainerHeight = numberOfLines * 21 + 29;
    // without this random number, input on Android overflows and block scrollview from scrolling
    // https://stackoverflow.com/questions/39745442/scrollview-cant-scroll-when-focus-textinput-react-native
    const inputHeight = inputContainerHeight + 5;

    return (
      <View
        collapsable={false}
        ref={ref => {
          this.refContainer = ref;
        }}
        style={[styles.wrapper, style]}
      >
        {!required && (
          <FormattedMessage
            id="input.optional"
            style={[styles.optional, { color: optionalColor }]}
          />
        )}
        <View
          style={[
            styles.inputContainer,
            { height: inputContainerHeight },
            isInvalid && styles.error,
            disabled && styles.inputContainerDisabled,
          ]}
        >
          {leftLabel ? (
            <Text style={styles.label}>{label}</Text>
          ) : (
            <FloatingLabel focused={isFocused} label={label} value={inputValue} />
          )}
          <View pointerEvents={allowKeyboard ? null : 'none'} style={styles.inputWrapper}>
            <TextInput
              autoCapitalize={
                secureTextEntry || keyboardType === 'email-address' ? 'none' : 'sentences'
              }
              {...otherProps}
              style={[
                styles.input,
                { height: inputHeight },
                leftLabel ? styles.leftLabelInput : styles.floatingLabelInput,
              ]}
              editable={!disabled}
              keyboardType={keyboardType}
              multiline={numberOfLines > 1}
              onBlur={this.onBlur}
              onFocus={this.onFocus}
              onChangeText={this.onChangeText}
              underlineColorAndroid="transparent"
              secureTextEntry={secureTextEntry && isPasswordHidden}
              textAlignVertical={leftLabel ? 'center' : 'top'}
              value={inputValue}
            />
          </View>
          {!secureTextEntry &&
            !disabled &&
            iconNameAfterValidation &&
            (onDelete && value ? (
              <TouchableOpacity onPress={onDelete} style={styles.clickArea}>
                {this.renderIcon(iconNameAfterValidation)}
              </TouchableOpacity>
            ) : (
              !this.shouldDisplayIconText(isValid) && this.renderIcon(iconNameAfterValidation)
            ))}

          {this.shouldDisplayIconText(isValid) && (
            <Text style={[theme.paragraph, styles.iconText, styles.clickArea]}>{iconText}</Text>
          )}
          {secureTextEntry &&
            !disabled && (
              <TouchableOpacity keepKeyboard onPress={this.togglePassword} style={styles.clickArea}>
                <FormattedMessage
                  id={isPasswordHidden ? 'input.password.show' : 'input.password.hide'}
                  style={styles.showPassword}
                  uppercase
                />
              </TouchableOpacity>
            )}
        </View>
        {isInvalid && <ValidationError error={validation} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },

  optional: {
    fontFamily: fontFamilies.base,
    fontSize: 13,
    // Match the iOS rendered height so that multiple inputs in one row aren’t misaligned
    height: 16.5,
    lineHeight: 13,
    marginBottom: 5,
    textAlign: 'right',
    textAlignVertical: 'center',
  },

  inputContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.grey,
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingHorizontal: 10,
  },

  inputContainerDisabled: {
    backgroundColor: colors.greyLayer,
  },

  label: {
    fontSize: 16,
    color: colors.grey,
    fontFamily: fontFamilies.semiBold,
    minWidth: 70,
  },

  inputWrapper: {
    flex: 1,
  },

  input: {
    color: colors.black,
    fontSize: 16,
    fontFamily: fontFamilies.base,
    padding: 0,
    // FIXME anyone who will be able to fix this hack
    // gets a bounty of 5 beers from vojtech@bulant.cz
    ...Platform.select({
      android: {
        paddingTop: 1,
      },
      ios: {
        paddingTop: 2.5,
      },
    }),
  },

  floatingLabelInput: {
    paddingTop: 25,
    paddingBottom: 7,
  },

  leftLabelInput: {
    marginLeft: 15,
  },

  icon: {
    marginLeft: 10,
  },

  error: {
    borderColor: colors.red,
  },

  iconText: {
    color: colors.yellow,
    fontFamily: fontFamilies.semiBold,
  },

  clickArea: {
    marginHorizontal: -15,
    marginLeft: 0,
    marginVertical: -15,
    padding: 15,
    paddingLeft: 0,
  },

  showPassword: {
    color: colors.red,
    fontFamily: fontFamilies.base,
    fontSize: 13,
  },
});

export default Input;
