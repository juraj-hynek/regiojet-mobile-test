// @flow
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, theme } from '../style';
import { type Style } from '../types';

type Props = {
  count: number | string,
  small?: boolean,
  style?: Style,
};

const BasketItemsCount = ({ count, small, style }: Props) => {
  if (count === 0) {
    return null;
  }

  const styles = createStyles(!!small);

  return (
    <View style={[styles.container, style]}>
      <Text style={[theme.paragraphSmall, theme.bold, styles.count]}>{count}</Text>
    </View>
  );
};

const createStyles = (small: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: colors.green,
      borderRadius: 10,
      height: small ? 15 : 20,
      justifyContent: 'center',
      minWidth: small ? 15 : 20,
      paddingHorizontal: small ? 3 : 5,
    },

    count: {
      color: colors.white,
      fontSize: small ? 9 : 14,
      lineHeight: small ? 12 : 16,
    },
  });

export default BasketItemsCount;
