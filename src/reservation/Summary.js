// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import React, { Fragment } from 'react';

import { colors, theme } from '../style';
import { goBackTo, goTo } from '../navigation/actions';
import { openPriceCollapseModal, openSimpleRegistrationModal } from '../modal/actions';
import Button from '../components/Button';
import CheckBox from '../components/form/CheckBox';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';
import ScrollableContext from '../components/ScrollableContext';
import TermsAndConditions from '../components/TermsAndConditions';
import TextLink from '../components/TextLink';
import * as validation from '../components/form/validation';

type Props = {
  conditionsChecked: boolean,
  discount: number,
  goBackTo: typeof goBackTo,
  goTo: typeof goTo,
  handleConditionsPress: Function,
  handleSubmit: Function,
  isFetching: boolean,
  isLoggedIn: boolean,
  openPriceCollapseModal: typeof openPriceCollapseModal,
  openSimpleRegistrationModal: typeof openSimpleRegistrationModal,
  payableByCredit: boolean,
  payableByCreditCharge: boolean,
  showCreditPrice: boolean,
  totalPrice: number,
  validationResults: validation.ValidationResults<*>,
};

class Summary extends React.PureComponent<Props> {
  getSubmitButtonMessageId() {
    const { payableByCredit, payableByCreditCharge } = this.props;

    if (payableByCredit) {
      return 'reserveAndPayFromCredit';
    }
    return payableByCreditCharge ? 'addCreditAndPay' : 'reserve';
  }

  handleBackPress = () => this.props.goBackTo('Connections');

  handleLoginPress = () => this.props.goTo('Login');

  handlePriceCollapsePress = () => this.props.openPriceCollapseModal();

  handleRegistrationPress = () => this.props.openSimpleRegistrationModal(false);

  render() {
    const {
      conditionsChecked,
      discount,
      handleConditionsPress,
      handleSubmit,
      isFetching,
      isLoggedIn,
      showCreditPrice,
      totalPrice,
      validationResults,
    } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <FormattedMessage id="reservation.totalPrice" style={theme.h2} textAfter=": " />
          <Price style={theme.h2} value={totalPrice} />
        </View>
        <Text style={[theme.paragraph, styles.subheading]}>
          <FormattedMessage id="reservation.allTickets" />{' '}
          <TextLink onPress={this.handlePriceCollapsePress}>
            (<FormattedMessage id="reservation.priceCollapse" />)
          </TextLink>
        </Text>
        {discount > 0 &&
          !showCreditPrice && (
            <View style={styles.discountContainer}>
              <View style={[styles.row, styles.discountTitle]}>
                <FormattedMessage
                  id="reservation.lowerPrice"
                  style={[theme.paragraph, theme.bold]}
                  textAfter=" "
                />
                <Price style={[theme.paragraph, theme.bold]} value={discount} />
                <Text style={[theme.paragraph, theme.bold]}>?</Text>
              </View>
              {!isLoggedIn && (
                <Fragment>
                  <Button
                    onPress={this.handleLoginPress}
                    secondary
                    size="small"
                    style={styles.button}
                    type="informational"
                  >
                    <FormattedMessage id="reservation.login" />
                  </Button>
                  <FormattedMessage id="reservation.or" style={[theme.paragraph, styles.or]} />
                </Fragment>
              )}
              <Button
                onPress={this.handleRegistrationPress}
                secondary
                size="small"
                style={styles.button}
                type="informational"
              >
                <FormattedMessage id="reservation.register" />
              </Button>
            </View>
          )}
        <View style={styles.conditionsContainer}>
          <ScrollableContext>
            <CheckBox
              checked={conditionsChecked}
              onPress={handleConditionsPress}
              validation={validationResults.conditionsChecked}
            >
              <TermsAndConditions />
            </CheckBox>
          </ScrollableContext>
        </View>
        <Button
          iconRight="chevronRight"
          loading={isFetching}
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          <FormattedMessage id={`reservation.button.${this.getSubmitButtonMessageId()}`} />
        </Button>
        <Button iconLeft="chevronLeft" onPress={this.handleBackPress} type="redLink">
          <FormattedMessage id="reservation.back" />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
  },

  conditionsContainer: {
    marginBottom: 30,
  },

  container: {
    backgroundColor: colors.yellowSoft,
    paddingHorizontal: 10,
    paddingTop: 30,
    paddingBottom: 50,
  },

  discountContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    marginBottom: 30,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },

  discountTitle: {
    marginBottom: 20,
  },

  or: {
    marginVertical: 10,
  },

  row: {
    flexDirection: 'row',
  },

  subheading: {
    marginBottom: 30,
  },

  submitButton: {
    marginBottom: 20,
  },
});

export default connect(null, {
  goBackTo,
  goTo,
  openPriceCollapseModal,
  openSimpleRegistrationModal,
})(Summary);
