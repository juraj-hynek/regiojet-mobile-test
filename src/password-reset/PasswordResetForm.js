// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet } from 'react-native';
import React, { Fragment } from 'react';

import {
  cleanValidationObject,
  createServerValidationResults,
  isFormValid,
  toggleFirstInvalid,
} from '../components/form/helpers';
import { resetPassword } from './actions';
import { theme } from '../style';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';
import ScrollableContext from '../components/ScrollableContext';
import type { ErrorResponse } from '../types';

type Props = {
  error: ?ErrorResponse,
  intl: intlShape,
  isFetching: boolean,
  resetPassword: typeof resetPassword,
  token: string,
};

type State = {
  formData: { password: string },
  validationResults: validation.ValidationResults<*>,
};

class PasswordResetForm extends React.PureComponent<Props, State> {
  state = {
    formData: { password: '' },
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
      password: validation.password(formData.password, !this.submitted),
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

    const { resetPassword, token } = this.props;
    const { formData } = this.state;
    resetPassword(formData.password, token);
  };

  render() {
    const { intl, isFetching } = this.props;
    const { formData, validationResults } = this.state;

    return (
      <Fragment>
        <FormattedMessage id="passwordReset.newPassword" style={theme.h2} />
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

        <Button
          iconRight="chevronRight"
          loading={isFetching}
          onPress={this.handleSubmit}
          style={[styles.row, styles.marginTop]}
        >
          <FormattedMessage id="passwordReset.changePassword" />
        </Button>
      </Fragment>
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
    ({
      passwordReset: {
        resetPassword: { error, isFetching },
        validateToken: { token },
      },
    }) => ({
      error,
      isFetching,
      token,
    }),
    {
      resetPassword,
    },
  )(PasswordResetForm),
);
