// @flow
import React, { type Element } from 'react';
import { StyleSheet } from 'react-native';

import { colors, fontFamilies } from '../style';
import Icon, { type IconType } from './Icon';
import TouchableOpacity from './TouchableOpacity';
import type { Style } from '../types';

type Props = {
  children: Element<any>,
  icon: IconType,
  onPress: Function,
  style?: Style,
};

const ButtonMini = ({ children, icon, onPress, style }: Props) => (
  <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
    <Icon color={colors.red} height={22} name={icon} style={styles.icon} width={22} />
    {React.cloneElement(children, { style: styles.text })}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },

  icon: {
    marginBottom: 5,
  },

  text: {
    color: colors.red,
    fontFamily: fontFamilies.base,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
  },
});

export default ButtonMini;
