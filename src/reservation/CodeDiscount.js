// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet, Text, View } from 'react-native';
import React, { Fragment } from 'react';

import { cleanValidationObject, isFormValid, toggleFirstInvalid } from '../components/form/helpers';
import { colors, theme } from '../style';
import { removeCodeDiscount, verifyCodeDiscount } from '../basket/actions';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';
import Price from '../components/Price';
import ScrollableContext from '../components/ScrollableContext';
import Table from '../components/Table';
import * as validation from '../components/form/validation';
import type { BasketItem } from '../types';

type Props = {|
  basketItem: BasketItem,
  codeDiscountValue: number,
  intl: intlShape,
  isFetching: boolean,
  removeCodeDiscount: typeof removeCodeDiscount,
  ticketPrice: number,
  verifyCodeDiscount: typeof verifyCodeDiscount,
|};

type State = {
  formData: { code: string },
  validationResults: validation.ValidationResults<*>,
};

class CodeDiscount extends React.PureComponent<Props, State> {
  state = {
    formData: { code: '' },
    validationResults: {},
  };

  // eslint-disable-next-line react/sort-comp
  submitted: boolean = false;

  validate = () => {
    const { formData } = this.state;

    const validationResults = {
      code: validation.required(formData.code, !this.submitted),
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

  handleSubmit = () => {
    this.submitted = true;
    const validationResults = toggleFirstInvalid(this.validate());
    this.setState({ validationResults });

    if (!isFormValid(validationResults)) {
      return;
    }

    const { basketItem, verifyCodeDiscount } = this.props;
    verifyCodeDiscount(this.state.formData.code, basketItem);
  };

  handleRemove = () => {
    const { basketItem, removeCodeDiscount } = this.props;
    removeCodeDiscount(basketItem.shortid);
  };

  render() {
    const { basketItem, codeDiscountValue, intl, isFetching, ticketPrice } = this.props;
    const { formData, validationResults } = this.state;
    const discount = basketItem.codeDiscount;

    return (
      <View style={styles.container}>
        <FormattedMessage id="reservation.discount.title" style={theme.h2} />

        {discount ? (
          <Table
            footer={
              <Button onPress={this.handleRemove} secondary style={styles.remove}>
                <FormattedMessage id="reservation.discount.remove" />
              </Button>
            }
            headerMessageIds={[
              'reservation.discount.code',
              'reservation.discount.amount',
              'reservation.discount.priceBefore',
              'reservation.discount.priceAfter',
              'reservation.discount.status',
            ]}
          >
            <Text>{discount.code}</Text>
            <Price currency={discount.currency} value={discount.amount} />
            <Price currency={discount.currency} value={ticketPrice} />
            <Price currency={discount.currency} value={ticketPrice - codeDiscountValue} />
            <FormattedMessage
              id="reservation.discount.applied"
              style={[theme.semiBold, styles.applied]}
            />
          </Table>
        ) : (
          <Fragment>
            <FormattedMessage
              id="reservation.discount.description"
              style={[theme.paragraph, styles.row]}
            />
            <ScrollableContext>
              <Input
                disabled={isFetching}
                label={intl.formatMessage({ id: 'reservation.discount.code' })}
                onBlur={this.validate}
                onChange={code => this.handleChange({ code })}
                required
                style={styles.row}
                value={formData.code}
                validation={validationResults.code}
              />
            </ScrollableContext>
            <Button loading={isFetching} onPress={this.handleSubmit} secondary>
              <FormattedMessage id="reservation.discount.submit" />
            </Button>
          </Fragment>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  applied: {
    color: colors.green,
  },

  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },

  remove: {
    marginTop: 10,
  },

  row: {
    marginBottom: 20,
  },
});

export default injectIntl(
  connect(({ basket: { isVerifyingCodeDiscount } }) => ({ isFetching: isVerifyingCodeDiscount }), {
    removeCodeDiscount,
    verifyCodeDiscount,
  })(CodeDiscount),
);
