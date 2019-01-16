// @flow
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '../style';
import type { Style } from '../types';

type Props = {
  style?: Style,
};

const LoaderSmall = ({ style }: Props) => (
  <View style={[styles.loader, style]}>
    <ActivityIndicator size="large" color={colors.red} />
  </View>
);

const styles = StyleSheet.create({
  loader: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});

export default LoaderSmall;
