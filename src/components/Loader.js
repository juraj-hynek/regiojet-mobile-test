// @flow
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React from 'react';

import { colors } from '../style';
import Icon from './Icon';

const Loader = () => (
  <View style={styles.loader}>
    <Icon height={50} name="logo" style={styles.icon} width={284} />
    <ActivityIndicator size="large" color={colors.red} />
  </View>
);

const styles = StyleSheet.create({
  icon: {
    marginBottom: 40,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.yellow,
  },
});

export default Loader;
