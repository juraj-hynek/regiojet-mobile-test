// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet, View } from 'react-native';
import get from 'lodash/get';
import React from 'react';

import {
  cleanValidationObject,
  createServerValidationResults,
  isFormValid,
  toggleFirstInvalid,
} from '../components/form/helpers';
import { changeInfo } from '../user/actions';
import { colors, theme } from '../style';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import CheckBox from '../components/form/CheckBox';
import Input from '../components/form/Input';
import RegistrationCompany from '../registration/RegistrationCompany';
import ScrollableContext from '../components/ScrollableContext';
import type { Company, ErrorResponse, Style, User } from '../types';

type Props = {
  error: ?ErrorResponse,
  changeInfo: typeof changeInfo,
  intl: intlShape,
  isFetching: boolean,
  style?: Style,
  user: User,
};

type State = {
  formData: {
    phoneNumber?: string,
    restrictPhoneNumbers: boolean,
    companyInformation: boolean,
    company: Company,
  },
  validationResults: validation.ValidationResults<*>,
};

class PersonalSettings extends React.Component<Props, State> {
  static getFormData = user => ({
    phoneNumber: user.phoneNumber || '',
    restrictPhoneNumbers: user.restrictPhoneNumbers,
    companyInformation: user.companyInformation,
    company: user.company || {
      companyName: '',
      address: '',
      registrationNumber: '',
      vatNumber: '',
    },
  });

  state = {
    formData: PersonalSettings.getFormData(this.props.user),
    validationResults: {},
  };

  // eslint-disable-next-line react/sort-comp
  submitted: boolean = false;

  componentWillReceiveProps(nextProps) {
    // set field error messages
    if (this.props.error !== nextProps.error && nextProps.error) {
      const validationResults = createServerValidationResults(nextProps.error);
      this.setState(prevState => ({
        validationResults: toggleFirstInvalid({
          ...prevState.validationResults,
          ...validationResults,
        }),
      }));

      return;
    }

    // user was updated, reset form
    if (this.props.user !== nextProps.user) {
      this.setState({ formData: PersonalSettings.getFormData(nextProps.user) });
      this.submitted = false;
    }
  }

  validate = () => {
    const { formData } = this.state;

    if (!formData.companyInformation) {
      return {};
    }

    const validationResults = {
      'company.companyName': validation.shortText(formData.company.companyName, !this.submitted),
      'company.address': validation.shortText(formData.company.address, !this.submitted),
      'company.registrationNumber': validation.shortText(
        formData.company.registrationNumber,
        !this.submitted,
      ),
    };

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

    const { changeInfo } = this.props;
    const { formData } = this.state;

    changeInfo('PersonalSettings', formData);
  };

  render() {
    const { intl, isFetching, style, user } = this.props;
    const { formData, validationResults } = this.state;

    return (
      <View style={[theme.container, style]}>
        <FormattedMessage id="settings.personal.title" style={theme.h2} />
        {/* TODO uncomment when registration with mojeID is implemented
        <View style={[styles.row, styles.mojeIDContainer]}>
          <FormattedMessage id="settings.personal.mojeId" style={theme.paragraph} />
          <MojeID onPress={() => {}} style={styles.mojeID} />
        </View> */}
        <Input
          disabled
          label={intl.formatMessage({ id: 'input.name' })}
          required
          style={styles.row}
          value={get(user, 'firstName', '')}
        />
        <Input
          disabled
          label={intl.formatMessage({ id: 'input.surname' })}
          required
          style={styles.row}
          value={get(user, 'surname', '')}
        />
        <Input
          disabled
          label={intl.formatMessage({ id: 'input.email' })}
          required
          style={styles.row}
          value={user.email}
        />
        <ScrollableContext>
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
        {formData.phoneNumber !== '' && (
          <CheckBox
            disabled={isFetching}
            checked={formData.restrictPhoneNumbers}
            onPress={restrictPhoneNumbers => this.handleChange({ restrictPhoneNumbers })}
            style={styles.row}
          >
            <FormattedMessage id="settings.personal.sms" />
          </CheckBox>
        )}
        <FormattedMessage
          id="settings.personal.note"
          style={[styles.row, theme.paragraphSmall, styles.note]}
        />

        <CheckBox
          disabled={isFetching}
          checked={formData.companyInformation}
          onPress={companyInformation => this.handleChangeAndBlur({ companyInformation })}
          style={[styles.row, styles.marginTop]}
        >
          <FormattedMessage id="settings.company.isCompany" />
        </CheckBox>
        {formData.companyInformation && (
          <RegistrationCompany
            disabled={isFetching}
            formData={formData.company}
            onBlur={this.handleBlur}
            onChange={this.handleChangeCompany}
            validationResults={validationResults}
          />
        )}

        <Button loading={isFetching} onPress={this.handleSubmit} style={styles.marginTop}>
          <FormattedMessage id="settings.personal.button" />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
    ({ user }) => ({
      error: user.changeInfo.PersonalSettings.error,
      isFetching: user.changeInfo.PersonalSettings.isFetching,
      user: user.user,
    }),
    { changeInfo },
  )(PersonalSettings),
);
