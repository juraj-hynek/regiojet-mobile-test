// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet, View } from 'react-native';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import pick from 'lodash/pick';
import React, { Fragment } from 'react';

import {
  cleanValidationObject,
  createServerValidationResults,
  isFormValid,
  toggleFirstInvalid,
} from '../components/form/helpers';
import { colors, theme } from '../style';
import { register } from '../user/actions';
import { replaceAll } from '../navigation/actions';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import CheckBox from '../components/form/CheckBox';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';
import RegistrationCompany from './RegistrationCompany';
import RegistrationSettings from './RegistrationSettings';
import TermsAndConditions from '../components/TermsAndConditions';
import type { Currency, ErrorResponse, User } from '../types';
import ScrollableContext from '../components/ScrollableContext';

type Props = {|
  currency: Currency,
  error: ?ErrorResponse,
  intl: intlShape,
  isFetching: boolean,
  modal: boolean,
  onCancel: Function,
  replaceAll: typeof replaceAll,
  register: Function,
  shouldRedirect: boolean,
  user: ?User,
|};

type State = {
  formData: {
    firstName?: string,
    surname?: string,
    email?: string,
    phoneNumber?: string,
    companyInformation: boolean,
    company: {
      companyName?: string,
      address?: string,
      registrationNumber?: string,
      vatNumber?: string,
    },
    password?: string,
    defaultTariff: string,
    currency: string,
    notifications?: Object,
    agreeWithTerms: boolean,
  },
  validationResults: validation.ValidationResults<*>,
};

class Registration extends React.Component<Props, State> {
  static defaultProps = {
    shouldRedirect: true,
  };

  static prefillUser(user: ?User) {
    const userData = pick(user, ['firstName', 'surname', 'email', 'phoneNumber']);
    return omitBy(userData, isNil);
  }

  state = {
    formData: {
      firstName: '',
      surname: '',
      email: '',
      phoneNumber: '',
      companyInformation: false,
      company: {},
      password: '',
      defaultTariff: 'REGULAR',
      currency: this.props.currency,
      notifications: {
        newsletter: true,
        reservationChange: true,
      },
      agreeWithTerms: false,
      ...Registration.prefillUser(this.props.user),
    },
    validationResults: {},
  };

  // eslint-disable-next-line react/sort-comp
  submitted: boolean = false;

  componentWillReceiveProps(nextProps) {
    if (this.props.error === nextProps.error || !nextProps.error) {
      return;
    }

    const validationResults = createServerValidationResults(nextProps.error);
    this.setState(prevState => ({
      validationResults: toggleFirstInvalid({
        ...prevState.validationResults,
        ...validationResults,
      }),
    }));
  }

  validate = () => {
    const { formData } = this.state;
    const companyValidation =
      (formData.companyInformation && {
        'company.companyName': validation.shortText(formData.company.companyName, !this.submitted),
        'company.address': validation.shortText(formData.company.address, !this.submitted),
        'company.registrationNumber': validation.shortText(
          formData.company.registrationNumber,
          !this.submitted,
        ),
      }) ||
      {};

    const validationResults = {
      firstName: validation.required(formData.firstName, !this.submitted),
      surname: validation.required(formData.surname, !this.submitted),
      email: validation.email(formData.email, !this.submitted),
      ...companyValidation,
      password: validation.password(formData.password, !this.submitted),
      agreeWithTerms: validation.requiredAgree(formData.agreeWithTerms, !this.submitted),
    };

    return cleanValidationObject(validationResults);
  };

  isOpenTicket = () => {
    const { user } = this.props;
    return user && !user.creditPrice;
  };

  composePayload = () =>
    this.isOpenTicket()
      ? omit(this.state.formData, ['company', 'companyInformation', 'currency', 'defaultTariff'])
      : this.state.formData;

  handleChange = (value: Object, callback: Function = () => {}) => {
    this.setState(prevState => {
      const formData = {
        ...prevState.formData,
        ...value,
      };
      return { formData };
    }, callback);
  };

  handleChangeCompany = (value: Object) => {
    this.setState(prevState => {
      const formData = {
        ...prevState.formData,
        company: {
          ...prevState.formData.company,
          ...value,
        },
      };
      return { formData };
    });
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

    const { register } = this.props;
    register(this.composePayload(), this.isOpenTicket(), this.onSuccess);
  };

  onSuccess = async () => {
    const { modal, onCancel } = this.props;
    if (modal) {
      onCancel();
    }
    await this.navigateOnSuccess();
  };

  async navigateOnSuccess() {
    const { shouldRedirect } = this.props;
    if (!shouldRedirect) return;
    await this.props.replaceAll('AddCredit');
  }

  render() {
    const { intl, isFetching, modal } = this.props;
    const { formData, validationResults } = this.state;

    return (
      <View style={modal ? theme.containerModal : [theme.container, styles.container]}>
        {!modal && (
          <Fragment>
            <FormattedMessage id="registration.title.contactInformation" style={theme.h2} />
            {/* TODO uncomment when registration with mojeID is implemented
            <View style={[styles.row, styles.mojeIDContainer]}>
              <FormattedMessage id="settings.personal.mojeId" style={theme.paragraph} />
              <MojeID onPress={() => {}} style={styles.mojeID} />
            </View> */}
          </Fragment>
        )}
        <ScrollableContext>
          <Input
            disabled={isFetching}
            label={intl.formatMessage({ id: 'input.name' })}
            onBlur={this.handleBlur}
            onChange={firstName => this.handleChange({ firstName })}
            required
            style={styles.row}
            value={formData.firstName}
            validation={validationResults.firstName}
          />
          <Input
            disabled={isFetching}
            label={intl.formatMessage({ id: 'input.surname' })}
            onBlur={this.handleBlur}
            onChange={surname => this.handleChange({ surname })}
            required
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
            required
            style={styles.row}
            value={formData.email}
            validation={validationResults.email}
          />
          <Input
            disabled={isFetching}
            keyboardType="phone-pad"
            label={intl.formatMessage({ id: 'input.phone' })}
            onBlur={this.handleBlur}
            onChange={phoneNumber => this.handleChange({ phoneNumber })}
            style={styles.row}
            value={formData.phoneNumber}
            validation={validationResults.phoneNumber}
          />
        </ScrollableContext>
        {!modal && (
          <FormattedMessage
            id="registration.note.name"
            style={[styles.row, theme.paragraphSmall, styles.note]}
          />
        )}

        {!modal && (
          <CheckBox
            disabled={isFetching}
            checked={formData.companyInformation}
            onPress={companyInformation => this.handleChangeAndBlur({ companyInformation })}
            style={[styles.row, styles.marginTop]}
          >
            <FormattedMessage id="registration.checkbox.firm" />
          </CheckBox>
        )}
        {formData.companyInformation && (
          <RegistrationCompany
            disabled={isFetching}
            formData={formData.company}
            onBlur={this.handleBlur}
            onChange={this.handleChangeCompany}
            validationResults={validationResults}
          />
        )}

        {!modal && (
          <FormattedMessage id="registration.title.password" style={[theme.h2, styles.section]} />
        )}
        <ScrollableContext>
          <Input
            disabled={isFetching}
            label={intl.formatMessage({ id: 'input.password' })}
            onBlur={this.handleBlur}
            onChange={password => this.handleChange({ password })}
            required
            secureTextEntry
            style={styles.row}
            value={formData.password}
            validation={validationResults.password}
          />
        </ScrollableContext>
        {!modal && (
          <RegistrationSettings
            disabled={isFetching}
            formData={formData}
            onChange={this.handleChange}
          />
        )}

        <CheckBox
          disabled={isFetching}
          checked={get(formData, 'notifications.newsletter')}
          onPress={newsletter =>
            this.handleChange({
              notifications: { ...formData.notifications, newsletter },
            })
          }
          style={[styles.row, modal ? styles.marginTop : styles.section]}
        >
          <FormattedMessage id="registration.checkbox.informationEmails" />
        </CheckBox>
        <CheckBox
          disabled={isFetching}
          checked={get(formData, 'notifications.reservationChange')}
          onPress={reservationChange =>
            this.handleChange({
              notifications: { ...formData.notifications, reservationChange },
            })
          }
          style={styles.row}
        >
          <FormattedMessage id="registration.checkbox.trafficChanges" />
        </CheckBox>
        <ScrollableContext>
          <CheckBox
            disabled={isFetching}
            checked={formData.agreeWithTerms}
            onPress={agreeWithTerms => this.handleChangeAndBlur({ agreeWithTerms })}
            style={styles.row}
            validation={validationResults.agreeWithTerms}
          >
            <TermsAndConditions />
          </CheckBox>
        </ScrollableContext>
        <Button
          onPress={this.handleSubmit}
          iconRight={modal ? undefined : 'chevronRight'}
          loading={isFetching}
          style={styles.marginTop}
        >
          <FormattedMessage id="registration.button.register" />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 50,
  },

  section: {
    marginTop: 30,
  },

  row: {
    marginBottom: 20,
  },

  note: {
    color: colors.grey,
  },

  marginTop: {
    marginTop: 10,
  },

  /* TODO uncomment when registration with mojeID is implemented
  mojeIDContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  mojeID: {
    marginLeft: 10,
  }, */
});

export default injectIntl(
  connect(
    ({
      localization: { currency },
      user: {
        registration: { isFetching, error },
        user,
      },
    }) => ({
      currency,
      isFetching,
      error,
      user,
    }),
    {
      register,
      replaceAll,
    },
  )(Registration),
);
