// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { Linking, StyleSheet, Text, View } from 'react-native';
import moment from 'moment';
import React from 'react';

import {
  cleanValidationObject,
  createServerValidationResults,
  isFormValid,
  toggleFirstInvalid,
} from '../components/form/helpers';
import { editPassenger } from './actions';
import { theme } from '../style';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import DatePicker from '../components/form/DatePicker';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';
import Picker from '../components/form/Picker';
import ScrollableContext from '../components/ScrollableContext';
import TextLink from '../components/TextLink';
import type { ErrorResponse, Passenger, PersonalDataType, Tariff } from '../types';
import Warning from '../components/Warning';

type Props = {|
  editPassenger: typeof editPassenger,
  error: ?ErrorResponse, // eslint-disable-line react/no-unused-prop-types
  intl: intlShape,
  isFetching: boolean,
  onDone: Function,
  passenger: Passenger,
  requiredFields: Array<PersonalDataType>,
  tariffs: Array<Tariff>,
  ticketId: number,
|};

type FormData = {
  firstName: string,
  surname: string,
  email: string,
  phone: string,
  tariff: string,
  dateOfBirth?: moment,
};

type FormElement = $Keys<FormData>;

type State = {
  formData: FormData,
  lastError: ?ErrorResponse,
  validationResults: validation.ValidationResults<*>,
};

class PassengerEditModal extends React.PureComponent<Props, State> {
  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.error && state.lastError !== props.error) {
      const validationResults = createServerValidationResults(props.error);
      return {
        lastError: props.error,
        validationResults: toggleFirstInvalid({
          ...state.validationResults,
          ...validationResults,
        }),
      };
    }
    return null;
  }

  static REQUIRED_FIELDS_MAP: { [name: FormElement]: PersonalDataType } = {
    firstName: 'FIRST_NAME',
    surname: 'SURNAME',
    email: 'EMAIL',
    phone: 'PHONE',
    dateOfBirth: 'BIRTHDAY',
  };

  state = {
    formData: {
      firstName: this.props.passenger.firstName || '',
      surname: this.props.passenger.surname || '',
      email: this.props.passenger.email || '',
      phone: this.props.passenger.phone || '',
      tariff: this.props.passenger.tariff || 'REGULAR',
      dateOfBirth: this.props.passenger.dateOfBirth
        ? moment(this.props.passenger.dateOfBirth)
        : undefined,
    },
    lastError: null,
    validationResults: {},
  };

  // eslint-disable-next-line react/sort-comp
  submitted: boolean = false;

  isRequired(name: FormElement) {
    const { requiredFields } = this.props;
    return requiredFields.includes(PassengerEditModal.REQUIRED_FIELDS_MAP[name]);
  }

  validate = () => {
    const { formData } = this.state;
    const validationResults = {};

    if (this.isRequired('firstName')) {
      validationResults.firstName = validation.required(formData.firstName, !this.submitted);
    }
    if (this.isRequired('surname')) {
      validationResults.surname = validation.required(formData.surname, !this.submitted);
    }
    if (this.isRequired('email')) {
      validationResults.email = validation.email(formData.email, !this.submitted);
    }
    if (this.isRequired('phone')) {
      validationResults.phone = validation.required(formData.phone, !this.submitted);
    }
    if (this.isRequired('dateOfBirth')) {
      validationResults.dateOfBirth = validation.required(
        formData.dateOfBirth ? formData.dateOfBirth.toString() : '',
        !this.submitted,
      );
    }

    return cleanValidationObject(validationResults);
  };

  handleChange = (value: Object, callback: Function = () => {}) => {
    this.setState(prevState => {
      const formData = {
        ...prevState.formData,
        ...value,
      };
      return { formData };
    }, callback);
  };

  handleBlur = () => {
    const validationResults = this.validate();
    this.setState({ validationResults });
  };

  handleChangeAndBlur = (value: Object) => {
    this.handleChange(value, this.handleBlur);
  };

  handleSubmit = () => {
    this.submitted = true;

    const validationResults = toggleFirstInvalid(this.validate());
    this.setState({ validationResults });

    if (!isFormValid(validationResults)) {
      return;
    }

    const { editPassenger, onDone, passenger, ticketId } = this.props;
    const { formData } = this.state;
    editPassenger(
      ticketId,
      passenger.id,
      {
        ...formData,
        dateOfBirth: formData.dateOfBirth && formData.dateOfBirth.format('YYYY-MM-DD'),
      },
      onDone,
    );
  };

  handlePressConditions = () => {
    const url = this.props.intl.formatMessage({ id: 'ticket.passengerModal.info.conditionsUrl' });
    Linking.openURL(url);
  };

  render() {
    const { intl, isFetching, onDone, tariffs } = this.props;
    const { formData, validationResults } = this.state;
    const today = moment();

    return (
      <View style={theme.containerModal}>
        <ScrollableContext>
          <Input
            disabled={isFetching}
            label={intl.formatMessage({ id: 'input.name' })}
            onBlur={this.handleBlur}
            onChange={firstName => this.handleChange({ firstName })}
            required={this.isRequired('firstName')}
            style={styles.row}
            value={formData.firstName}
            validation={validationResults.firstName}
          />
          <Input
            disabled={isFetching}
            label={intl.formatMessage({ id: 'input.surname' })}
            onBlur={this.handleBlur}
            onChange={surname => this.handleChange({ surname })}
            required={this.isRequired('surname')}
            style={styles.row}
            value={formData.surname}
            validation={validationResults.surname}
          />
          <Input
            disabled={isFetching}
            keyboardType="email-address"
            label={intl.formatMessage({ id: 'input.email' })}
            onBlur={this.handleBlur}
            onChange={email => this.handleChange({ email })}
            required={this.isRequired('email')}
            style={styles.row}
            value={formData.email}
            validation={validationResults.email}
          />
          <Input
            disabled={isFetching}
            keyboardType="phone-pad"
            label={intl.formatMessage({ id: 'input.phone' })}
            onBlur={this.handleBlur}
            onChange={phone => this.handleChange({ phone })}
            required={this.isRequired('phone')}
            style={styles.row}
            value={formData.phone}
            validation={validationResults.phone}
          />
          <Picker
            disabled
            label={intl.formatMessage({ id: 'ticket.passengerModal.passenger' })}
            onChange={tariff => this.handleChange({ tariff: tariff.key })}
            optionLabelKey="value"
            options={tariffs}
            optionValueKey="key"
            style={styles.row}
            value={formData.tariff}
          />
          <DatePicker
            disabled={isFetching}
            label={intl.formatMessage({ id: 'ticket.passengerModal.dateOfBirth' })}
            maxDate={today}
            onChange={dateOfBirth => this.handleChangeAndBlur({ dateOfBirth })}
            required={this.isRequired('dateOfBirth')}
            style={styles.row}
            validation={validationResults.dateOfBirth}
            value={formData.dateOfBirth}
          />
        </ScrollableContext>

        <FormattedMessage
          id="ticket.passengerModal.info"
          style={[styles.row, theme.paragraphSmall]}
          values={{
            conditions: (
              <TextLink onPress={this.handlePressConditions}>
                <FormattedMessage id="ticket.passengerModal.info.conditions" />
              </TextLink>
            ),
          }}
        />

        {/* TODO display based on some attribute when API is ready; display correct text */}
        {false && (
          <Warning style={[styles.row, styles.warning]} type="info">
            <Text>Cestovní pojištění zůstane na jméno původního cestujícího!</Text>
          </Warning>
        )}

        <Button
          loading={isFetching}
          onPress={this.handleSubmit}
          style={[styles.row, styles.marginTop]}
        >
          <FormattedMessage id="ticket.passengerModal.save" />
        </Button>
        <Button disabled={isFetching} onPress={onDone} secondary>
          <FormattedMessage id="ticket.passengerModal.cancel" />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  marginTop: {
    marginTop: 10,
  },

  row: {
    marginBottom: 20,
  },

  warning: {
    marginTop: 20,
  },
});

export default injectIntl(
  connect(
    ({
      consts: { tariffs },
      ticket: {
        passengerEdit: { error, isFetching },
      },
    }) => ({ error, isFetching, tariffs }),
    {
      editPassenger,
    },
  )(PassengerEditModal),
);
