// @flow
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';

import { colors, theme } from '../style';
import { getTariffCountsLabel } from './helpers';
import type { Tariff } from '../types';

type Props = {
  tariffs: Array<string>,
  tariffsList: Array<Tariff>,
};

const HeadingTariffs = ({ tariffs, tariffsList }: Props) => (
  <View style={styles.headerContainer}>
    <Text style={[theme.paragraphSmall, styles.text, styles.tariffsText]}>
      ({getTariffCountsLabel(tariffs, tariffsList)})
    </Text>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  tariffsText: {
    marginTop: 5,
  },

  text: {
    color: colors.white,
    flexWrap: 'wrap',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

export default connect(
  ({ consts }) => ({
    tariffsList: consts.tariffs,
  }),
  {},
)(HeadingTariffs);
