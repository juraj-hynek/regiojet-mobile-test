// @flow
import { StyleSheet, View } from 'react-native';
import React, { type Element } from 'react';

import { colors, theme } from '../style';
import HTMLView from './HTMLView';
import Icon, { type IconType } from './Icon';
import type { Style } from '../types';

const colorMap = {
  error: { back: colors.redShadow, fore: colors.redDark },
  info: { back: colors.yellowShadow, fore: colors.yellowDark },
  success: { back: colors.greenLight, fore: colors.green },
  warning: { back: colors.blueShadow, fore: colors.blueDark },
};

export type WarningType = $Keys<typeof colorMap>;

type Props = {
  children: Element<any>,
  closable?: boolean,
  icon?: IconType,
  style?: Style,
  type: WarningType,
};

const Warning = ({ children, closable, icon, style, type }: Props) => {
  const backColor = colorMap[type].back;
  const foreColor = colorMap[type].fore;
  const defaultIcon = type === 'success' ? 'check' : 'warningFull';
  const iconName = icon || defaultIcon;
  const textStyles = [theme.paragraph, theme.semiBold, { color: foreColor }];

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.row,
          {
            backgroundColor: backColor,
            borderColor: foreColor,
          },
        ]}
      >
        {closable && (
          <Icon
            color={foreColor}
            height={10}
            name="crossLight"
            style={styles.iconClose}
            width={10}
          />
        )}
        <Icon color={foreColor} height={33} name={iconName} style={styles.icon} width={38} />
        {React.cloneElement(
          children,
          children.type === HTMLView
            ? { baseFontStyle: textStyles, style: styles.content }
            : { style: [...textStyles, styles.content] },
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // there must be a container with white background so that RGBA colors look like in styleguide
  container: {
    backgroundColor: colors.white,
    borderRadius: 3,
  },

  content: {
    flexShrink: 1,
  },

  row: {
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
  },

  icon: {
    marginRight: 20,
  },

  iconClose: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});

export default Warning;
