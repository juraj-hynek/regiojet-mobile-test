// @flow
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React, { type Node } from 'react';

import { colors, fontFamilies } from '../style';
import { type Style } from '../types';
import Icon, { type IconType } from './Icon';
import TouchableOpacity from './TouchableOpacity';

type Size = 'normal' | 'small' | 'xs';
type Type = 'conversional' | 'informational' | 'lightLink' | 'redLink';

type Props = {|
  children: Node,
  disabled?: boolean,
  iconLeft?: IconType,
  iconRight?: IconType,
  loading?: boolean,
  onPress: Function,
  secondary: boolean,
  size: Size,
  style?: Style,
  textCentered?: boolean,
  type: Type,
|};

class Button extends React.PureComponent<Props> {
  static defaultProps = {
    secondary: false,
    size: 'normal',
    type: 'conversional',
  };

  static getIconSize(size: Size) {
    if (size === 'normal') {
      return 24;
    }
    return size === 'small' ? 16 : 14;
  }

  render() {
    const {
      children,
      disabled,
      iconLeft,
      iconRight,
      loading,
      onPress,
      secondary,
      size,
      style,
      textCentered,
      type,
    } = this.props;
    const styles = createStyles(type, size, secondary);
    const textColor = (StyleSheet.flatten(styles.text) || {}).color || colors.black;
    const iconSize = Button.getIconSize(size);

    return (
      <TouchableOpacity
        disabled={disabled || loading}
        onPress={onPress}
        style={[styles.container, style]}
      >
        <View
          style={[
            styles.innerContainer,
            textCentered &&
              !iconLeft &&
              !iconRight &&
              !loading &&
              styles.innerContainerTextCentered,
            disabled && styles.disabled,
          ]}
        >
          {loading && (
            <ActivityIndicator
              animating
              color={textColor}
              size={size === 'normal' ? 'large' : 'small'}
              style={styles.activityIndicator}
            />
          )}
          {(iconLeft || textCentered) && (
            <View style={[styles.icon, loading && styles.loading]}>
              {iconLeft && (
                <Icon color={textColor} height={iconSize} name={iconLeft} width={iconSize} />
              )}
            </View>
          )}
          <View style={styles.textContainer}>
            {React.Children.map(children, child =>
              React.cloneElement(child, {
                style: [styles.text, loading && styles.loading, child.props.style],
              }),
            )}
          </View>
          {iconRight && (
            <View style={[styles.icon, loading && styles.loading]}>
              <Icon color={textColor} height={iconSize} name={iconRight} width={iconSize} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
}

const createStyles = (type: Type, size: Size, secondary: boolean) => {
  const buttonType = `${secondary ? 'secondary' : 'primary'}_${type}`;

  return StyleSheet.create({
    activityIndicator: {
      position: 'absolute',
      left: '50%',
      transform: [{ translateX: size === 'normal' ? -12 : -9.5 }],
    },

    container: {
      backgroundColor: colors.transparent,
      borderRadius: 5,
      borderWidth: 1,
      ...{
        normal: {
          paddingVertical: 15,
          paddingHorizontal: 25,
        },
        small: {
          paddingHorizontal: 15,
          paddingVertical: 9,
        },
        xs: {
          paddingHorizontal: 10,
        },
      }[size],
      ...{
        primary_conversional: {
          backgroundColor: colors.red,
          borderColor: colors.red,
        },
        secondary_conversional: {
          borderColor: colors.red,
        },
        primary_informational: {
          backgroundColor: colors.yellowDark,
          borderColor: colors.yellowDark,
        },
        secondary_informational: {
          borderColor: colors.yellowDark,
        },
        primary_lightLink: {
          backgroundColor: colors.white,
          borderColor: colors.white,
        },
        secondary_lightLink: {},
        primary_redLink: {
          backgroundColor: colors.greyWhite,
          borderColor: colors.whiteShadow,
        },
        secondary_redLink: {},
      }[buttonType],
    },

    disabled: {
      opacity: 0.4,
    },

    icon: {
      width: 20,
    },

    innerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    innerContainerTextCentered: {
      justifyContent: 'center',
    },

    loading: {
      opacity: 0,
    },

    text: {
      fontFamily: fontFamilies.bold,
      textAlign: 'center',
      ...{
        normal: { fontSize: 18 },
        small: {
          fontSize: 15,
          lineHeight: 20,
        },
        xs: {
          fontSize: 12,
          lineHeight: 18,
        },
      }[size],
      color: {
        primary_conversional: colors.white,
        secondary_conversional: colors.red,
        primary_informational: colors.black,
        secondary_informational: colors.black,
        primary_lightLink: colors.black,
        secondary_lightLink: colors.white,
        primary_redLink: colors.red,
        secondary_redLink: colors.white,
      }[buttonType],
    },

    textContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      flexGrow: 1,
      flexShrink: 1,
      flexWrap: 'wrap',
      justifyContent: 'center',
      ...{
        normal: { paddingHorizontal: 5 },
        small: { paddingHorizontal: 3 },
        xs: { paddingHorizontal: 3 },
      }[size],
    },
  });
};

export default Button;
