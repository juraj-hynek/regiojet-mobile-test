// @flow
import React, { Element } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Style } from '../types';
import { colors, theme } from '../style';

type Props = {
  children: Element<any>,
  style?: Style,
};

const Badge = ({ children, style }: Props) => (
  <View style={[styles.container, style]}>
    {React.cloneElement(children, {
      style: [theme.paragraph, theme.bold, styles.text],
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.green,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  text: {
    color: colors.white,
  },
});

export default Badge;
