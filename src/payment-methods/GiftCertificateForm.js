// @flow
import React, { Fragment } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';

import { cleanValidationObject, isFormValid, toggleFirstInvalid } from '../components/form/helpers';
import { theme } from '../style/index';
import { verifyGiftCertificate } from './actions';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';
import ScrollableContext from '../components/ScrollableContext';

type Props = {|
  certificateCode: ?string,
  email: string,
  intl: intlShape,
  isFetching: boolean,
  modal?: boolean,
  onSuccess: Function,
  verifyGiftCertificate: typeof verifyGiftCertificate,
|};

type State = {
  formData: {
    certificateCode: string,
    email: string,
  },
  validationResults: validation.ValidationResults<*>,
};

class GiftCertificateForm extends React.Component<Props, State> {
  state = {
    formData: {
      certificateCode: this.props.certificateCode || '',
      email: this.props.email,
    },
    validationResults: {},
  };

  submitted: boolean = false;

  validate = () => {
    const { formData } = this.state;
    const validationResults = {
      certificateCode: validation.required(formData.certificateCode, !this.submitted),
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

  handleSubmit = async () => {
    this.submitted = true;

    const validationResults = toggleFirstInvalid(this.validate());
    this.setState({ validationResults });

    if (!isFormValid(validationResults)) {
      return;
    }

    const { certificateCode } = this.state.formData;
    this.props.verifyGiftCertificate(certificateCode, this.handleSuccess);
  };

  handleSuccess = () => this.props.onSuccess(this.state.formData);

  render() {
    const { intl, isFetching, modal } = this.props;
    const { formData, validationResults } = this.state;

    return (
      <Fragment>
        <FormattedMessage style={[theme.paragraph, styles.text]} id="payments.giftCard.text" />
        <ScrollableContext>
          <Input
            disabled={isFetching}
            label={intl.formatMessage({
              id: 'payments.giftCard.input.giftCardNumber',
            })}
            onBlur={this.handleBlur}
            onChange={certificateCode => this.handleChange({ certificateCode })}
            required
            style={styles.row}
            validation={validationResults.certificateCode}
            value={formData.certificateCode}
          />
          <Input
            disabled={isFetching}
            keyboardType="email-address"
            label={intl.formatMessage({ id: 'payments.giftCard.input.email' })}
            onBlur={this.handleBlur}
            onChange={email => this.handleChange({ email })}
            required
            style={styles.row}
            validation={validationResults.email}
            value={formData.email}
          />
        </ScrollableContext>
        <Button
          iconRight={modal ? undefined : 'chevronRight'}
          loading={isFetching}
          onPress={this.handleSubmit}
        >
          <FormattedMessage id="payments.giftCard.button.getCredit" />
        </Button>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 20,
  },

  text: {
    marginBottom: 30,
  },
});

export default injectIntl(
  connect(
    ({
      paymentMethods: {
        giftCertificate: { isFetching },
      },
    }) => ({
      isFetching,
    }),
    {
      verifyGiftCertificate,
    },
  )(GiftCertificateForm),
);
