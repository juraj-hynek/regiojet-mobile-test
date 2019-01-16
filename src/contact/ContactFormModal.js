// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { View, StyleSheet } from 'react-native';
import get from 'lodash/get';
import React from 'react';

import {
  cleanValidationObject,
  createServerValidationResults,
  isFormValid,
  toggleFirstInvalid,
} from '../components/form/helpers';
import { composeFullName } from '../user/helpers';
import { sendContactForm } from './action';
import { theme } from '../style';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';
import ScrollableContext from '../components/ScrollableContext';
import type { ErrorResponse, User } from '../types';

type State = {
  formData: {
    title: string,
    customerName: string,
    customerEmail: string,
    message: string,
  },
  validationResults: validation.ValidationResults<*>,
};

type Props = {
  error: ?ErrorResponse,
  intl: intlShape,
  isFetching: boolean,
  onDone: Function,
  sendContactForm: typeof sendContactForm,
  user: ?User,
};

class ContactFormModal extends React.Component<Props, State> {
  static getFormData = (user: ?User) => ({
    customerEmail: get(user, 'email', ''),
    customerName: composeFullName(get(user, 'firstName'), get(user, 'surname')),
    message: '',
    title: '',
  });

  state = {
    formData: ContactFormModal.getFormData(this.props.user),
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

    const validationResults = {
      title: validation.shortText(formData.title, !this.submitted),
      customerName: validation.shortText(formData.customerName, !this.submitted),
      customerEmail: validation.email(formData.customerEmail, !this.submitted),
      message: validation.required(formData.message, !this.submitted),
    };

    return cleanValidationObject(validationResults);
  };

  handleBlur = () => {
    const validationResults = this.validate();
    this.setState({ validationResults });
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

  handleSubmit = () => {
    this.submitted = true;
    const validationResults = toggleFirstInvalid(this.validate());
    const { formData } = this.state;

    this.setState({ validationResults });
    if (!isFormValid(validationResults)) {
      return;
    }

    this.props.sendContactForm(formData, this.props.onDone);
  };

  render() {
    const { intl, isFetching } = this.props;
    const { formData, validationResults } = this.state;

    return (
      <View style={theme.containerModal}>
        <ScrollableContext>
          <Input
            label={intl.formatMessage({ id: 'input.title' })}
            onBlur={this.handleBlur}
            onChange={title => this.handleChange({ title })}
            required
            style={styles.row}
            validation={validationResults.title}
            value={formData.title}
          />
          <Input
            label={intl.formatMessage({ id: 'input.name' })}
            onBlur={this.handleBlur}
            onChange={customerName => this.handleChange({ customerName })}
            required
            style={styles.row}
            validation={validationResults.customerName}
            value={formData.customerName}
          />
          <Input
            keyboardType="email-address"
            label={intl.formatMessage({ id: 'input.email' })}
            onBlur={this.handleBlur}
            onChange={customerEmail => this.handleChange({ customerEmail })}
            required
            style={styles.row}
            validation={validationResults.customerEmail}
            value={formData.customerEmail}
          />
          <Input
            label={intl.formatMessage({ id: 'input.message' })}
            numberOfLines={5}
            onBlur={this.handleBlur}
            onChange={message => this.handleChange({ message })}
            required
            style={styles.row}
            validation={validationResults.message}
            value={formData.message}
          />
        </ScrollableContext>
        <Button
          loading={isFetching}
          onPress={this.handleSubmit}
          style={[styles.row, styles.marginTop]}
        >
          <FormattedMessage id="contactForm.button.submit" />
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
});

export default injectIntl(
  connect(
    ({ contact, user: { user } }) => ({
      error: contact.error,
      isFetching: contact.isFetching,
      user,
    }),
    {
      sendContactForm,
    },
  )(ContactFormModal),
);
