// @flow
import React, { type Element } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, theme } from '../style';
import Icon, { type IconType } from './Icon';
import TouchableOpacity from './TouchableOpacity';
import type { Style } from '../types';

type Props = {
  centered: boolean,
  children: Element<any>,
  iconLeft?: IconType,
  iconRight?: IconType,
  loading?: boolean,
  onPress: Function,
  smallIcon?: boolean,
  smallText?: boolean,
  style?: Style,
};

const ButtonLink = ({
  centered,
  children,
  iconLeft,
  iconRight,
  loading,
  onPress,
  smallIcon,
  smallText,
  style,
}: Props) => {
  const iconSize = smallIcon ? 16 : 18;

  return (
    <TouchableOpacity disabled={loading} onPress={onPress} style={style}>
      {loading && (
        <ActivityIndicator color={colors.red} size="small" style={styles.activityIndicator} />
      )}

      <View
        style={[styles.container, centered && styles.containerCentered, loading && styles.loading]}
      >
        {iconLeft && (
          <Icon
            color={colors.red}
            height={iconSize}
            name={iconLeft}
            style={styles.marginHorizontal}
            width={iconSize}
          />
        )}
        {React.cloneElement(children, {
          style: [
            smallText ? theme.paragraphSmall : theme.paragraph,
            styles.text,
            centered && styles.textCentered,
            styles.marginHorizontal,
          ],
        })}
        {iconRight && (
          <Icon
            color={colors.red}
            height={iconSize}
            name={iconRight}
            style={styles.marginHorizontal}
            width={iconSize}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

ButtonLink.defaultProps = {
  centered: true,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },

  containerCentered: {
    justifyContent: 'center',
  },

  text: {
    color: colors.red,
  },

  textCentered: {
    textAlign: 'center',
  },

  activityIndicator: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -9.5 }],
  },

  loading: {
    opacity: 0,
  },

  marginHorizontal: {
    marginHorizontal: 5,
  },
});

export default ButtonLink;
