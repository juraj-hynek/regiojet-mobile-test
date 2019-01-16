// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet, Text, View } from 'react-native';
import React, { Fragment } from 'react';

import { cleanValidationObject, isFormValid } from '../components/form/helpers';
import { colors, theme } from '../style';
import { goTo } from '../navigation/actions';
import { login } from '../user/actions';
import { openForgottenPasswordModal } from '../modal/actions';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import ButtonLink from '../components/ButtonLink';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';
import TextLink from '../components/TextLink';

type Props = {
  credit: boolean,
  goTo: typeof goTo,
  intl: intlShape,
  isFetching: boolean,
  login: typeof login,
  openForgottenPasswordModal: typeof openForgottenPasswordModal,
};

type State = {
  formData: {
    accountCode?: string,
    password?: string,
  },
  validationResults: validation.ValidationResults<*>,
};

class Login extends React.Component<Props, State> {
  static defaultProps = {
    credit: false,
  };

  state = {
    formData: {},
    validationResults: {},
  };

  // eslint-disable-next-line react/sort-comp
  submitted: boolean = false;

  validate = () => {
    const { credit } = this.props;
    const { formData } = this.state;

    const validationResults = {
      accountCode: validation.required(formData.accountCode, !this.submitted),
      password: credit && validation.password(formData.password, !this.submitted),
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

  handleSubmit = async () => {
    const { credit, login } = this.props;
    const { formData } = this.state;

    this.submitted = true;

    const validationResults = this.validate();
    this.setState({ validationResults });

    if (!isFormValid(validationResults)) {
      return;
    }

    login(formData, credit);
  };

  handleForgottenPasswordPress = () => this.props.openForgottenPasswordModal();

  handleRegistrationPress = () => this.props.goTo('Registration');

  render() {
    const { credit, intl, isFetching } = this.props;
    const { formData, validationResults } = this.state;

    return (
      <View style={theme.container}>
        <Input
          disabled={isFetching}
          keyboardType="numeric"
          label={intl.formatMessage({
            id: credit ? 'input.ticketNumber' : 'input.ticketNumber.open',
          })}
          onBlur={this.handleBlur}
          onChange={accountCode => this.handleChange({ accountCode })}
          required
          style={credit ? styles.input : styles.marginBottom}
          value={formData.accountCode}
          validation={validationResults.accountCode}
        />
        {credit && (
          <Fragment>
            <Input
              disabled={isFetching}
              label={intl.formatMessage({ id: 'input.password' })}
              onBlur={this.handleBlur}
              onChange={password => this.handleChange({ password })}
              required
              secureTextEntry
              style={styles.input}
              value={formData.password}
              validation={validationResults.password}
            />
            <ButtonLink onPress={this.handleForgottenPasswordPress} style={styles.marginBottom}>
              <FormattedMessage id="login.forgotPassword" />
            </ButtonLink>
          </Fragment>
        )}
        <Button iconRight="chevronRight" loading={isFetching} onPress={this.handleSubmit}>
          <FormattedMessage id="login.submitButton" />
        </Button>

        {credit && (
          <View style={styles.textContainer}>
            <FormattedMessage
              id="login.register.question"
              style={[theme.paragraphBig, theme.semiBold]}
            />

            <Text style={theme.paragraph}>
              <TextLink onPress={this.handleRegistrationPress}>
                <FormattedMessage id="login.register.link" />
              </TextLink>{' '}
              <FormattedMessage id="login.register.text" />
            </Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 15,
  },

  marginBottom: {
    marginBottom: 20,
  },

  textContainer: {
    alignItems: 'center',
    borderColor: colors.greyShadow,
    borderTopWidth: 2,
    marginTop: 20,
    paddingTop: 20,
  },
});

export default connect(
  ({
    user: {
      login: { isFetching },
    },
  }) => ({ isFetching }),
  {
    goTo,
    login,
    openForgottenPasswordModal,
  },
)(injectIntl(Login));
