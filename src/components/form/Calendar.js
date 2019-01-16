// @flow
import { Calendar as RNCalendar } from 'react-native-calendars';
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import moment from 'moment';
import React from 'react';

import { capitalizeFirst } from '../../helpers/text';
import { colors, theme } from '../../style';
import CalendarDay, { type CalendarDate } from './CalendarDay';
import Icon from '../Icon';
import ModalSelector from './ModalSelector';
import TouchableOpacity from '../TouchableOpacity';

type Option = { key: number, label: string, value: number };

type Props = {
  isOpen: boolean,
  minDate?: moment,
  maxDate?: moment,
  onClose: Function,
  onSelect: Function,
  value?: ?moment,
};

type State = {
  currentDate: moment,
  monthSelectorVisible: boolean,
  yearSelectorVisible: boolean,
};

class Calendar extends React.PureComponent<Props, State> {
  static YEAR_FROM = 1900;
  static YEAR_TO = 2100;

  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.value !== state.currentDate) {
      return { currentDate: Calendar.getSelectedDate(props) };
    }
    return null;
  }

  static getSelectedDate(props: Props) {
    const { minDate, maxDate, value } = props;
    const selectedDate = value || moment();

    if (minDate && selectedDate.isBefore(minDate)) {
      return minDate;
    }
    if (maxDate && selectedDate.isAfter(maxDate)) {
      return maxDate;
    }
    return selectedDate;
  }

  static prepareYearList(minDate?: moment, maxDate?: moment): Array<Option> {
    const yearFrom = minDate ? minDate.year() : Calendar.YEAR_FROM;
    const yearTo = maxDate ? maxDate.year() : Calendar.YEAR_TO;

    return [...Array(yearTo - yearFrom + 1)].map((undefinedValue, index) => {
      const year = index + yearFrom;
      return { key: year, label: `${year}`, value: year };
    });
  }

  state = {
    currentDate: Calendar.getSelectedDate(this.props),
    monthSelectorVisible: false,
    yearSelectorVisible: false,
  };

  handleClose = () => this.props.onClose();

  handleDayPress = (date: CalendarDate) => this.props.onSelect(moment(date.timestamp));

  handleMonthClose = () => this.setState({ monthSelectorVisible: false });

  handleMonthSelect = (option: Option) =>
    this.setState(prevState => ({
      currentDate: moment(prevState.currentDate).month(option.value),
    }));

  handleYearClose = () => this.setState({ yearSelectorVisible: false });

  handleYearOpen = () => this.setState({ yearSelectorVisible: true });

  handleYearSelect = (option: Option) =>
    this.setState(prevState => {
      const newDate = moment(prevState.currentDate).year(option.value);

      // keep month in bounds of minDate and maxDate
      // e.g. minDate is Jun 10, 2018 user switched year from Jan 2019 to Jan 2018
      // => we need to push them to Jun
      const minMonth = this.findFirstAvailableMonth(newDate);
      const maxMonth = this.findLastAvailableMonth(newDate);
      newDate.month(Math.min(Math.max(newDate.month(), minMonth), maxMonth));

      return {
        monthSelectorVisible: true,
        currentDate: newDate,
      };
    });

  canGoLeft() {
    const { minDate } = this.props;
    const { currentDate } = this.state;
    return !minDate || minDate.isBefore(currentDate, 'month');
  }

  canGoRight() {
    const { maxDate } = this.props;
    const { currentDate } = this.state;
    return !maxDate || maxDate.isAfter(currentDate, 'month');
  }

  handlePressLeft = () => {
    if (this.canGoLeft()) {
      this.setState(prevState => ({
        currentDate: moment(prevState.currentDate).subtract(1, 'month'),
      }));
    }
  };

  handlePressRight = () => {
    if (this.canGoRight()) {
      this.setState(prevState => ({
        currentDate: moment(prevState.currentDate).add(1, 'month'),
      }));
    }
  };

  findFirstAvailableMonth(date: moment) {
    const { minDate } = this.props;
    return minDate && minDate.isSame(date, 'year') ? minDate.month() : 0;
  }

  findLastAvailableMonth(date: moment) {
    const { maxDate } = this.props;
    return maxDate && maxDate.isSame(date, 'year') ? maxDate.month() : 11;
  }

  prepareMonthList(): Array<Option> {
    const { currentDate } = this.state;
    const minMonth = this.findFirstAvailableMonth(currentDate);
    const maxMonth = this.findLastAvailableMonth(currentDate);

    return moment
      .months()
      .map((month, index) => ({ key: index, label: capitalizeFirst(month), value: index }))
      .filter(option => option.key >= minMonth && option.key <= maxMonth);
  }

  renderArrow = (direction: 'left' | 'right') => {
    const showArrow = direction === 'left' ? this.canGoLeft() : this.canGoRight();
    return (
      // $FlowFixMe
      showArrow && <Icon height={27} name={`chevron${capitalizeFirst(direction)}`} width={12} />
    );
  };

  render() {
    const { isOpen, maxDate, minDate } = this.props;
    const { currentDate, monthSelectorVisible, yearSelectorVisible } = this.state;
    const selectedDate = Calendar.getSelectedDate(this.props);

    return (
      <Modal animationType="slide" onRequestClose={this.handleClose} transparent visible={isOpen}>
        <TouchableWithoutFeedback onPress={this.handleClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={styles.calendarContainer}>
          <RNCalendar
            {...this.props}
            current={currentDate.format('YYYY-MM-DD')}
            dayComponent={CalendarDay}
            firstDay={moment.localeData().firstDayOfWeek()}
            hideExtraDays
            maxDate={maxDate && maxDate.format('YYYY-MM-DD')}
            minDate={minDate && minDate.format('YYYY-MM-DD')}
            markedDates={{ [selectedDate.format('YYYY-MM-DD')]: { selected: true } }}
            onDayPress={this.handleDayPress}
            onPressArrowLeft={this.handlePressLeft}
            onPressArrowRight={this.handlePressRight}
            renderArrow={this.renderArrow}
            style={styles.calendar}
            theme={{
              'stylesheet.calendar.main': calendarThemeMain,
              'stylesheet.calendar.header': calendarThemeHeader,
              'stylesheet.day.basic': calendarThemeDay,
            }}
          />

          <TouchableOpacity onPress={this.handleYearOpen} style={styles.yearSelect} />
        </View>

        <ModalSelector
          data={Calendar.prepareYearList(minDate, maxDate)}
          onChange={this.handleYearSelect}
          onModalClose={this.handleYearClose}
          visible={yearSelectorVisible}
        >
          <View />
        </ModalSelector>
        <ModalSelector
          data={this.prepareMonthList()}
          onChange={this.handleMonthSelect}
          onModalClose={this.handleMonthClose}
          visible={monthSelectorVisible}
        >
          <View />
        </ModalSelector>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  calendar: {
    borderRadius: 5,
    overflow: 'hidden',
  },

  calendarContainer: {
    alignSelf: 'center',
    margin: 10,
    marginTop: '25%',
    width: 310,
  },

  overlay: {
    backgroundColor: colors.greyShadowDark,
    height: '100%',
    position: 'absolute',
    width: '100%',
  },

  yearSelect: {
    height: 47,
    left: 40,
    position: 'absolute',
    right: 40,
  },
});

const calendarThemeMain = {
  container: {
    backgroundColor: colors.yellowSoft,
  },

  dayContainer: {
    flex: 1,
  },

  week: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
};

const calendarThemeHeader = {
  arrow: {
    padding: 10,
  },

  dayHeader: {
    ...StyleSheet.flatten(theme.paragraphBig),
    ...StyleSheet.flatten(theme.semiBold),
    flex: 1,
    paddingVertical: 10,
    textAlign: 'center',
  },

  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  monthText: {
    ...StyleSheet.flatten(theme.paragraphBig),
    ...StyleSheet.flatten(theme.bold),
    padding: 10,
  },

  week: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
};

const calendarThemeDay = {
  base: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 10,
  },

  disabledText: {
    color: colors.greyShadow,
  },

  selected: {
    backgroundColor: colors.yellow,
    borderRadius: 4,
  },

  selectedText: {
    ...StyleSheet.flatten(theme.bold),
  },

  text: {
    ...StyleSheet.flatten(theme.paragraphBig),
    ...StyleSheet.flatten(theme.semiBold),
  },

  todayText: {
    color: colors.red,
  },
};

export default Calendar;
