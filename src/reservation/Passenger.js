// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { getPassengerValue, getValidationKey, isPassengerFieldRequired } from './helpers';
import { getTariffTranslation } from '../consts/helpers';
import { theme } from '../style';
import { updatePassenger } from '../basket/actions';
import * as validation from '../components/form/validation';
import Input from '../components/form/Input';
import ScrollableContext from '../components/ScrollableContext';
import type { PassengerField, PersonalDataType, RoutePassenger, Tariff } from '../types';

type Props = {|
  basketItemId: string,
  index: number,
  intl: intlShape,
  onBlur: Function,
  passengerValues: Array<RoutePassenger>,
  requiredFields: Array<PersonalDataType>,
  tariff: string,
  tariffs: Array<Tariff>,
  updatePassenger: typeof updatePassenger,
  validationResults: validation.ValidationResults<*>,
|};

class Passenger extends React.PureComponent<Props> {
  getValue(field: PassengerField) {
    const { index, passengerValues } = this.props;
    return getPassengerValue(passengerValues, field, index);
  }

  getValidationResult(field: PassengerField) {
    const { basketItemId, index, validationResults } = this.props;
    return validationResults[getValidationKey(field, basketItemId, index)];
  }

  isRequired(field: PassengerField) {
    const { requiredFields } = this.props;
    return isPassengerFieldRequired(requiredFields, field);
  }

  handleChange = (field: RoutePassenger) => {
    const { basketItemId, index, updatePassenger } = this.props;
    updatePassenger(basketItemId, index, field, true);
  };

  render() {
    const { index, intl, onBlur, tariff, tariffs } = this.props;

    return (
      <View style={styles.container}>
        <Text style={theme.h3}>{getTariffTranslation(tariff, tariffs)}</Text>

        <ScrollableContext>
          <Input
            label={intl.formatMessage({ id: 'input.name' })}
            onBlur={onBlur}
            onChange={firstName => this.handleChange({ firstName })}
            required={this.isRequired('firstName')}
            style={styles.row}
            value={this.getValue('firstName')}
            validation={this.getValidationResult('firstName')}
          />
          <Input
            label={intl.formatMessage({ id: 'input.surname' })}
            onBlur={onBlur}
            onChange={surname => this.handleChange({ surname })}
            required={this.isRequired('surname')}
            style={index === 0 && styles.row}
            value={this.getValue('surname')}
            validation={this.getValidationResult('surname')}
          />
        </ScrollableContext>

        {index === 0 && (
          <ScrollableContext>
            <Input
              keyboardType="email-address"
              label={intl.formatMessage({ id: 'input.email' })}
              onBlur={onBlur}
              onChange={email => this.handleChange({ email })}
              required={this.isRequired('email')}
              style={styles.row}
              value={this.getValue('email')}
              validation={this.getValidationResult('email')}
            />
            <Input
              keyboardType="phone-pad"
              label={intl.formatMessage({ id: 'input.phone' })}
              onBlur={onBlur}
              onChange={phone => this.handleChange({ phone })}
              required={this.isRequired('phone')}
              value={this.getValue('phone')}
              validation={this.getValidationResult('phone')}
            />
          </ScrollableContext>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },

  row: {
    marginBottom: 20,
  },
});

export default injectIntl(
  connect(({ consts: { tariffs } }) => ({ tariffs }), { updatePassenger })(Passenger),
);
