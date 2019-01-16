// @flow
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';

import {
  cleanValidationObject,
  createServerValidationResults,
  isFormValid,
  toggleFirstInvalid,
} from '../components/form/helpers';
import { changePassword } from '../user/actions';
import { theme } from '../style';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';
import ScrollableContext from '../components/ScrollableContext';
import type { ErrorResponse, Style } from '../types';

type Props = {
  error: ?ErrorResponse,
  changePassword: typeof changePassword,
  intl: intlShape,
  isFetching: boolean,
  style?: Style,
};

type State = {
  formData: {
    oldPassword?: string,
    newPassword?: string,
  },
  validationResults: validation.ValidationResults<*>,
};

class ChangePassword extends React.Component<Props, State> {
  state = {
    formData: {},
    validationResults: {},
  };

  // eslint-disable-next-line react/sort-comp
  submitted: boolean = false;

  componentWillReceiveProps(nextProps) {
    // set field error messages
    if (nextProps.error) {
      const validationResults = createServerValidationResults(nextProps.error);
      this.setState(prevState => ({
        validationResults: toggleFirstInvalid({
          ...prevState.validationResults,
          ...validationResults,
        }),
      }));

      return;
    }

    // update was successful, reset form
    if (this.props.isFetching && !nextProps.isFetching) {
      this.setState({ formData: {} });
      this.submitted = false;
    }
  }

  validate = () => {
    const { formData } = this.state;
    const validationResults = {
      oldPassword: validation.password(formData.oldPassword, !this.submitted),
      newPassword: validation.password(formData.newPassword, !this.submitted),
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

    const { changePassword } = this.props;
    const { formData } = this.state;

    changePassword(formData);
  };

  render() {
    const { intl, isFetching, style } = this.props;
    const { formData, validationResults } = this.state;

    return (
      <View style={[theme.container, style]}>
        <FormattedMessage id="settings.password.title" style={theme.h2} />
        <ScrollableContext>
          <Input
            disabled={isFetching}
            label={intl.formatMessage({ id: 'settings.password.old' })}
            onBlur={this.handleBlur}
            onChange={oldPassword => this.handleChange({ oldPassword })}
            required
            secureTextEntry
            style={styles.row}
            value={formData.oldPassword}
            validation={validationResults.oldPassword}
          />
          <Input
            disabled={isFetching}
            label={intl.formatMessage({ id: 'settings.password.new' })}
            onBlur={this.handleBlur}
            onChange={newPassword => this.handleChange({ newPassword })}
            required
            secureTextEntry
            style={styles.row}
            value={formData.newPassword}
            validation={validationResults.newPassword}
          />
        </ScrollableContext>

        <Button loading={isFetching} onPress={this.handleSubmit} style={styles.marginTop}>
          <FormattedMessage id="settings.password.button" />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 20,
  },

  marginTop: {
    marginTop: 10,
  },
});

export default injectIntl(
  connect(
    ({ user }) => ({
      error: user.changePassword.error,
      isFetching: user.changePassword.isFetching,
    }),
    { changePassword },
  )(ChangePassword),
);
