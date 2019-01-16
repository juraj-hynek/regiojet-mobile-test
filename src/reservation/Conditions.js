// @flow
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import ConditionsHTML from './ConditionsHTML';
import FormattedMessage from '../components/FormattedMessage';
import type { PriceConditions, PriceConditionsDescriptionsType } from '../types';

type Props = {
  conditions: PriceConditions,
  disabledTypes: Array<PriceConditionsDescriptionsType>,
};

const Conditions = ({ conditions, disabledTypes }: Props) => (
  <View style={styles.container}>
    <FormattedMessage id="conditions.title" style={theme.h2} />
    {/* $FlowFixMe */}
    <ConditionsHTML conditions={conditions.descriptions} disabledTypes={disabledTypes} />
  </View>
);

Conditions.defaultProps = {
  disabledTypes: [],
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },
});

export default Conditions;
