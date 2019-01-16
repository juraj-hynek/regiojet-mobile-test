// @flow
import { StyleSheet, View } from 'react-native';
import Day from 'react-native-calendars/src/calendar/day/basic';
import moment from 'moment';
import React from 'react';

import { colors } from '../../style';

export type CalendarDate = {
  dateString: string,
  day: number,
  month: number,
  timestamp: number,
  year: number,
};

type Props = {
  date: CalendarDate,
};

const CalendarDay = (props: Props) => {
  const { date } = props;
  const dayOfWeek = moment(date.timestamp).day();
  const isWeekend = [0, 6].indexOf(dayOfWeek) !== -1;

  return (
    <View
      style={[styles.container, { backgroundColor: isWeekend ? colors.greyLayer : colors.white }]}
    >
      <Day {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CalendarDay;
