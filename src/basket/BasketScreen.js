// @flow
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, theme } from '../style';
import Basket from './Basket';
import Heading from '../components/Heading';

const BasketScreen = () => (
  <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
    <Heading messageId="basket.title" />

    <View style={theme.container}>
      <Basket />
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },

  contentContainer: {
    alignItems: 'stretch',
  },
});

export default BasketScreen;
