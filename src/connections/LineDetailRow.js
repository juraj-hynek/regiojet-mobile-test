// @flow
import { StyleSheet, Text, View } from 'react-native';
import get from 'lodash/get';
import React from 'react';

import { colors, theme } from '../style';
import { timeFormat } from '../localization/localeData';
import Date from '../components/Date';
import type { DetailStation } from '../types';

type Props = {
  station: DetailStation,
};

const LineDetailRow = ({
  station: { isActive, isLast, isLastActive, showCircle, station, timetableStation },
}: Props) => (
  <View style={styles.row}>
    <View style={gridStyles.line}>
      {showCircle && <View style={[styles.circle, isActive && styles.circleActive]} />}
      {!isLast && (
        <View style={styles.lineContainer}>
          <View style={[styles.line, isActive && !isLastActive && styles.lineActive]} />
          {!showCircle && (
            <Text
              style={[
                theme.paragraphSmall,
                theme.bold,
                styles.lineText,
                isActive && styles.lineTextActive,
              ]}
            >
              -
            </Text>
          )}
        </View>
      )}
    </View>
    <View style={gridStyles.station}>
      <Text
        style={[
          theme.paragraphSmall,
          showCircle && theme.bold,
          !isLast && styles.stationText,
          !isActive && styles.stationTextInactive,
        ]}
      >
        {get(station, 'fullname')}
        {timetableStation.platform && ` (${timetableStation.platform})`}
      </Text>
    </View>
    <View style={gridStyles.time}>
      {timetableStation.arrival ? (
        <Date format={timeFormat} style={theme.paragraphSmall}>
          {`1970-01-01 ${timetableStation.arrival}`}
        </Date>
      ) : null}
    </View>
    <View style={gridStyles.time}>
      {timetableStation.departure ? (
        <Date format={timeFormat} style={theme.paragraphSmall}>
          {`1970-01-01 ${timetableStation.departure}`}
        </Date>
      ) : null}
    </View>
  </View>
);

export const gridStyles = StyleSheet.create({
  line: {
    marginBottom: -4,
    marginLeft: -4.5,
    width: 21.5,
  },

  station: {
    flex: 3,
  },

  time: {
    flex: 1,
    marginLeft: 10,
  },
});

const styles = StyleSheet.create({
  circle: {
    borderColor: colors.grey,
    borderRadius: 7,
    borderWidth: 3,
    height: 13,
    marginTop: 4,
    width: 13,
  },

  circleActive: {
    borderColor: colors.yellow,
  },

  line: {
    backgroundColor: colors.grey,
    marginLeft: 5,
    width: 3,
  },

  lineActive: {
    backgroundColor: colors.yellow,
  },

  lineContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  lineText: {
    color: colors.grey,
    marginLeft: -1,
  },

  lineTextActive: {
    color: colors.yellow,
  },

  row: {
    flexDirection: 'row',
  },

  stationText: {
    marginBottom: 5,
  },

  stationTextInactive: {
    color: colors.grey,
  },
});

export default LineDetailRow;
