// @flow
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import Date from '../components/Date';
import Direction from '../components/Direction';
import type { Route } from '../types';

type Props = {|
  route: Route,
|};

const TabHeader = ({ route }: Props) => (
  <View style={styles.container}>
    <Date ignoreTimeZone style={theme.paragraphSmall}>
      {route.departureTime}
    </Date>
    <Direction
      from={route.departureCityName}
      textStyle={[theme.paragraphSmall, theme.bold]}
      to={route.arrivalCityName}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: -5,
  },
});

export default TabHeader;
