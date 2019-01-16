// @flow
import { connect } from 'react-redux';
import { View } from 'react-native';
import moment from 'moment';
import React from 'react';

import { closeCalendar, openCalendar } from './actions';
import { dateFormat } from '../../localization/localeData';
import Calendar from './Calendar';
import Input from './Input';
import TouchableOpacity from '../TouchableOpacity';
import type { Style } from '../../types';
import type { ValidationResult as ValidationResultType } from './validation';

type Props = {
  closeCalendar: typeof closeCalendar,
  disabled?: boolean,
  label: string,
  maxDate?: moment,
  minDate?: moment,
  onChange?: Function,
  openCalendar: typeof openCalendar,
  optionalColor?: string,
  required?: boolean,
  style?: Style,
  validation?: ?ValidationResultType,
  value?: ?moment,
};

type State = {
  isOpen: boolean,
};

class DatePicker extends React.PureComponent<Props, State> {
  state = {
    isOpen: false,
  };

  showCalendar = () => this.setState({ isOpen: true }, this.props.openCalendar);

  hideCalendar = () => this.setState({ isOpen: false }, this.props.closeCalendar);

  handleDatePicked = (date: moment) => {
    const { onChange } = this.props;
    this.hideCalendar();

    if (onChange) {
      onChange(date);
    }
  };

  handleDateDelete = () => {
    const { onChange } = this.props;

    if (onChange) {
      onChange();
    }
  };

  formatDate() {
    const { value } = this.props;
    return value ? value.format(dateFormat) : '';
  }

  render() {
    const {
      disabled,
      label,
      maxDate,
      minDate,
      optionalColor,
      required,
      style,
      validation,
      value,
    } = this.props;
    const { isOpen } = this.state;

    return (
      <View style={style}>
        <TouchableOpacity disabled={disabled} onPress={this.showCalendar}>
          <Input
            allowKeyboard={false}
            disabled={disabled}
            iconName="calendar"
            label={label}
            onDelete={this.handleDateDelete}
            optionalColor={optionalColor}
            required={required}
            validation={validation}
            value={this.formatDate()}
          />
        </TouchableOpacity>
        <Calendar
          isOpen={isOpen}
          minDate={minDate}
          maxDate={maxDate}
          onClose={this.hideCalendar}
          onSelect={this.handleDatePicked}
          value={value}
        />
      </View>
    );
  }
}

export default connect(null, { closeCalendar, openCalendar })(DatePicker);
