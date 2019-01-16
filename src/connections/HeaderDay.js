// @flow
import { Col, Grid, Row } from 'native-base';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { colors, fontFamilies } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import type { Style } from '../types';

type Props = {
  colSizes: Array<number>,
  rowSchedulePadding: Style,
};

const HeaderDay = ({ colSizes, rowSchedulePadding }: Props) => (
  <View style={styles.container}>
    <Grid>
      <Col size={colSizes[0]} style={styles.colFirst}>
        <Row style={[styles.rowSchedule, rowSchedulePadding]}>
          <FormattedMessage style={styles.text} id="connections.departure" uppercase />
          <FormattedMessage style={styles.text} id="connections.arrival" uppercase />
        </Row>
      </Col>
      <Col size={colSizes[1]}>
        <FormattedMessage style={styles.text} id="connections.transfer" uppercase />
      </Col>
      <Col size={colSizes[2]}>
        <Row style={styles.rowLast}>
          <FormattedMessage style={styles.text} id="connections.placesCount" uppercase />
        </Row>
      </Col>
    </Grid>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  text: {
    color: colors.grey,
    fontSize: 12,
    fontFamily: fontFamilies.bold,
    lineHeight: 15,
  },
  colFirst: {
    justifyContent: 'space-between',
  },
  rowLast: {
    justifyContent: 'flex-end',
    paddingRight: 25,
  },
  rowSchedule: {
    justifyContent: 'space-between',
  },
});

export default HeaderDay;
