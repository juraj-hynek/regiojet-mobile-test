// @flow
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import Insurance from './Insurance';
import Icon from '../components/Icon';
import type { Style } from '../types';

type Props = {
  disabled?: boolean,
  onInsuranceChange?: Function,
  // TODO we don't know how API response will look like
  routeInsurances: Array<Object>,
  style?: Style,
};

const Insurances = ({ disabled, onInsuranceChange, routeInsurances, style }: Props) => {
  if (!routeInsurances.length) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
        <FormattedMessage id="insurance.title" style={[theme.h2, styles.title]} />
        <Icon height={23} name="logo" width={130} />
      </View>

      <FormattedMessage id="insurance.offerAllianz" style={[theme.paragraph, styles.row]} />

      {routeInsurances.map((insurance, index) => (
        <Insurance
          disabled={disabled}
          insurance={insurance}
          key={`${insurance.id}${index}`} // eslint-disable-line react/no-array-index-key
          onChange={onInsuranceChange}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },

  row: {
    marginBottom: 20,
  },

  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  title: {
    marginBottom: 0,
    marginRight: 10,
  },
});

export default Insurances;
