// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { cleanValidationObject, isFormValid } from '../components/form/helpers';
import { sendTicketByEmail } from './actions';
import { theme } from '../style';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';

type Props = {
  email: ?string,
  intl: intlShape,
  isFetching: boolean,
  onDone: Function,
  sendTicketByEmail: typeof sendTicketByEmail,
  ticketId: number,
};

type State = {
  formData: {
    email: string,
  },
  validationResults: validation.ValidationResults<*>,
};

class SendByEmailModal extends React.PureComponent<Props, State> {
  state = {
    formData: {
      email: this.props.email || '',
    },
    validationResults: {},
  };

  // eslint-disable-next-line react/sort-comp
  submitted: boolean = false;

  validate = () => {
    const { formData } = this.state;
    const validationResults = {
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

    const validationResults = this.validate();
    this.setState({ validationResults });

    if (!isFormValid(validationResults)) {
      return;
    }

    this.props.sendTicketByEmail(this.props.ticketId, this.state.formData.email, this.props.onDone);
  };

  render() {
    const { intl, isFetching } = this.props;
    const { formData, validationResults } = this.state;

    return (
      <View style={theme.containerModal}>
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

        <Button
          loading={isFetching}
          onPress={this.handleSubmit}
          style={[styles.row, styles.marginTop]}
        >
          <FormattedMessage id="ticket.sendModal.button.submit" />
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
    ({
      ticket: {
        sendByEmail: { isFetching },
      },
      user: {
        user: { email },
      },
    }) => ({
      email,
      isFetching,
    }),
    {
      sendTicketByEmail,
    },
  )(SendByEmailModal),
);
