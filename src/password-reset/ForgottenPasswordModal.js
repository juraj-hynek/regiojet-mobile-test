// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { cleanValidationObject, isFormValid, toggleFirstInvalid } from '../components/form/helpers';
import { colors, theme } from '../style';
import { requestPasswordReset } from './actions';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';
import ScrollableContext from '../components/ScrollableContext';

type Props = {
  intl: intlShape,
  isFetching: boolean,
  onDone: Function,
  requestPasswordReset: typeof requestPasswordReset,
};

type State = {
  formData: {
    accountCode: string,
    email: string,
  },
  validationResults: validation.ValidationResults<*>,
};

class ForgottenPasswordModal extends React.PureComponent<Props, State> {
  state = {
    formData: {
      accountCode: '',
      email: '',
    },
    validationResults: {},
  };

  // eslint-disable-next-line react/sort-comp
  submitted: boolean = false;

  validate = () => {
    const { formData } = this.state;
    const validationResults = {
      accountCode: validation.required(formData.accountCode, !this.submitted),
      email: validation.email(formData.email, !this.submitted),
    };

    return cleanValidationObject(validationResults);
  };

  handleChange = (value: Object) => {
    this.setState(prevState => {
      const formData = {
        ...prevState.formData,
        ...value,
      };
      return { formData };
    });
  };

  handleBlur = () => {
    const validationResults = this.validate();
    this.setState({ validationResults });
  };

  handleSubmit = () => {
    this.submitted = true;

    const validationResults = toggleFirstInvalid(this.validate());
    this.setState({ validationResults });

    if (!isFormValid(validationResults)) {
      return;
    }

    this.props.requestPasswordReset(this.state.formData, this.props.onDone);
  };

  render() {
    const { intl, isFetching } = this.props;
    const { formData, validationResults } = this.state;

    return (
      <View style={theme.containerModal}>
        <ScrollableContext>
          <Input
            disabled={isFetching}
            keyboardType="numeric"
            label={intl.formatMessage({ id: 'input.ticketNumber' })}
            onBlur={this.handleBlur}
            onChange={accountCode => this.handleChange({ accountCode })}
            required
            value={formData.accountCode}
            validation={validationResults.accountCode}
          />
        </ScrollableContext>
        <FormattedMessage
          id="passwordReset.forgottenPassword.accountCodeNote"
          style={[theme.paragraphSmall, styles.row, styles.note]}
        />
        <ScrollableContext>
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
        </ScrollableContext>
        <Button
          loading={isFetching}
          onPress={this.handleSubmit}
          style={[styles.row, styles.marginTop]}
        >
          <FormattedMessage id="passwordReset.forgottenPassword.continue" />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  note: {
    color: colors.grey,
    marginTop: 5,
  },

  row: {
    marginBottom: 20,
  },

  marginTop: {
    marginTop: 10,
  },
});

export default injectIntl(
  connect(
    ({
      passwordReset: {
        requestPasswordReset: { isFetching },
      },
    }) => ({
      isFetching,
    }),
    {
      requestPasswordReset,
    },
  )(ForgottenPasswordModal),
);
