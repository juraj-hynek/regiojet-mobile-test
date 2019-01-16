// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { addCredit, getPaymentFormFields, payTickets } from './actions';
import {
  cleanValidationObject,
  createServerValidationResults,
  isFormValid,
  toggleFirstInvalid,
} from '../components/form/helpers';
import { colors, theme } from '../style';
import { paymentIcons } from './helpers';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';
import Input from '../components/form/Input';
import LoaderSmall from '../components/LoaderSmall';
import type { Currency, ErrorResponse, PaymentMethodFormField, User } from '../types';
import ScrollableContext from '../components/ScrollableContext';

type Props = {|
  addCredit: typeof addCredit,
  creditAddAmount?: number,
  currency: Currency,
  error: ?ErrorResponse,
  errorSubmit: ?ErrorResponse,
  fields: Array<PaymentMethodFormField>,
  getPaymentFormFields: typeof getPaymentFormFields,
  isFetchingMethods: boolean,
  isFetchingSubmit: boolean,
  modal?: boolean,
  paymentMethodCode: string,
  payTickets: typeof payTickets,
  resetMethod: Function,
  ticketIds: Array<number>,
  user: User,
|};

type State = {
  formData: Array<Object>,
  validationResults: validation.ValidationResults<*>,
};

const MAP_FIELD_TO_USER = {
  FIRST_NAME: 'firstName',
  SURNAME: 'surname',
  EMAIL: 'email',
};

const MAP_FIELD_TO_KEYBOARD_TYPE = {
  EMAIL: 'email-address',
};

class PaymentOnlineSubmit extends React.Component<Props, State> {
  static defaultProps = {
    ticketIds: [],
  };

  static composeValidationResultKey(fieldName: string): string {
    return `formFields.fieldType.${fieldName}`;
  }

  state = {
    formData: [],
    validationResults: {},
  };

  // eslint-disable-next-line react/sort-comp
  submitted: boolean = false;

  componentDidMount() {
    this.props.getPaymentFormFields(this.props.ticketIds, this.props.paymentMethodCode);
  }

  componentWillReceiveProps(nextProps) {
    const { errorSubmit, fields } = nextProps;
    if (this.props.fields !== fields) {
      const formData = fields.map(({ fieldType, fieldName }) => ({
        keyboardType: MAP_FIELD_TO_KEYBOARD_TYPE[fieldType],
        label: fieldName,
        name: fieldType,
        value: this.props.user[MAP_FIELD_TO_USER[fieldType]] || '',
      }));

      this.setState({ formData });
    }

    if (this.props.errorSubmit !== errorSubmit && errorSubmit) {
      const validationResults = createServerValidationResults(errorSubmit);
      this.setState(prevState => ({
        validationResults: toggleFirstInvalid({
          ...prevState.validationResults,
          ...validationResults,
        }),
      }));
    }
  }

  validate = () => {
    const { formData } = this.state;
    const validationResults = {};

    formData.forEach(({ name, value }) => {
      const validator = name === 'EMAIL' ? validation.email : validation.required;
      validationResults[PaymentOnlineSubmit.composeValidationResultKey(name)] = validator(
        value,
        !this.submitted,
      );
    });

    return cleanValidationObject(validationResults);
  };

  handleSubmit = async () => {
    const {
      addCredit,
      creditAddAmount,
      currency,
      paymentMethodCode,
      payTickets,
      ticketIds,
    } = this.props;
    this.submitted = true;

    const validationResults = toggleFirstInvalid(this.validate());
    this.setState({ validationResults });
    if (!isFormValid(validationResults)) {
      return;
    }

    const data = {
      correlationId: this.composeCorrelationId(),
      formFields: this.parseFormFieldsForApi(),
      paymentMethodCode,
    };

    if (creditAddAmount) {
      addCredit({
        ...data,
        amount: creditAddAmount,
        currency,
      });
    } else {
      payTickets({
        ...data,
        tickets: ticketIds,
      });
    }
  };

  composeCorrelationId = () => {
    const { creditAddAmount, ticketIds, user } = this.props;

    if (user.creditPrice && !ticketIds.length) {
      return 'mobile&screen=payments';
    }

    const needsPayment = (!!creditAddAmount).toString();
    return ticketIds.length > 1
      ? `mobile&screen=tickets&needsPayment=${needsPayment}`
      : `mobile&screen=ticket&ticketId=${ticketIds[0]}&needsPayment=${needsPayment}`;
  };

  parseFormFieldsForApi = () =>
    this.state.formData.map(formField => ({
      fieldType: formField.name,
      fieldValue: formField.value,
    }));

  handleChange = (index: number, value: string | Object) => {
    this.setState(prevState => {
      const formData = [...prevState.formData];
      formData[index].value = value;
      return { formData };
    });
  };

  handleBlur = () => {
    const validationResults = this.validate();
    this.setState({ validationResults });
  };

  render() {
    const {
      error,
      isFetchingMethods,
      isFetchingSubmit,
      modal,
      paymentMethodCode,
      resetMethod,
    } = this.props;
    const { formData, validationResults } = this.state;

    return (
      <View>
        <View style={styles.selectedMethod}>
          <Text style={[theme.paragraph, styles.selectedMethodText]}>
            <FormattedMessage id="payments.summary.selectedMethod" textAfter=" " />
            <FormattedMessage id={`payments.method.${paymentMethodCode}`} style={theme.bold} />
          </Text>
          <Icon height={30} fitToContent name={paymentIcons[paymentMethodCode]} width={80} />
        </View>
        <FormattedMessage style={theme.h3} id="payments.summary.header.additionalData" />
        {formData.map((field, i) => (
          <View key={field.name}>
            <ScrollableContext>
              <Input
                disabled={isFetchingSubmit}
                keyboardType={field.keyboardType}
                label={field.label}
                onBlur={this.handleBlur}
                onChange={value => this.handleChange(i, value)}
                onRevalidate={this.handleBlur}
                required
                style={styles.row}
                validation={
                  validationResults &&
                  validationResults[PaymentOnlineSubmit.composeValidationResultKey(field.name)]
                }
                value={field.value}
              />
            </ScrollableContext>
          </View>
        ))}

        {isFetchingMethods && <LoaderSmall />}

        {error && <View>{/* TODO retry button */}</View>}

        {formData.length > 0 && (
          <Button
            iconRight={modal ? undefined : 'chevronRight'}
            loading={isFetchingSubmit}
            onPress={this.handleSubmit}
            style={styles.button}
          >
            <FormattedMessage id="payments.summary.button.continue" />
          </Button>
        )}

        <Button
          iconLeft={modal ? undefined : 'chevronLeft'}
          onPress={resetMethod}
          secondary
          style={styles.button}
        >
          <FormattedMessage id="payments.summary.button.back" />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  selectedMethod: {
    alignItems: 'center',
    backgroundColor: colors.greyLayer,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginHorizontal: -10,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },

  selectedMethodText: {
    flexShrink: 1,
    marginRight: 10,
  },

  button: {
    marginTop: 20,
  },

  row: {
    marginBottom: 20,
  },
});

export default connect(
  ({
    localization: { currency },
    paymentMethods: { addCredit, paymentMethodsForm, payTicket },
    user: { user },
  }) => ({
    currency,
    error: paymentMethodsForm.error,
    errorSubmit: addCredit.error || payTicket.error,
    fields: paymentMethodsForm.fields,
    isFetchingMethods: paymentMethodsForm.isFetching,
    isFetchingSubmit: addCredit.isFetching || payTicket.isFetching,
    user,
  }),
  { addCredit, getPaymentFormFields, payTickets },
)(PaymentOnlineSubmit);
