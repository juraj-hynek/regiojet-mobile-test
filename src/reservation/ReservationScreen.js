// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import get from 'lodash/get';
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import pickBy from 'lodash/pickBy';
import transform from 'lodash/transform';

import { addGlobalMessage } from '../messages/actions';
import {
  cleanValidationObject,
  createServerValidationResults,
  getInvalidFieldsCount,
  isFormValid,
  toggleFirstInvalid,
} from '../components/form/helpers';
import { composeCheckoutPayload, composePageViewPayload } from '../analytics';
import { computeTotalPrice } from '../basket/helpers';
import { createTickets, createTicketsAndPayByCredit } from '../tickets/actions';
import { getPercentualDiscounts, prefillPassengers } from '../basket/actions';
import {
  getPassengerValue,
  getPrefillChanges,
  getValidationKey,
  isPassengerFieldRequired,
} from './helpers';
import { goTo } from '../navigation/actions';
import { scrollToElement } from '../components/scrollToElement';
import { ScrollViewContext } from '../components/ScrollViewContext';
import { theme } from '../style';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import gtmPush from '../analytics/gtmPush';
import Heading from '../components/Heading';
import HeadingProgressTab from '../components/HeadingProgressTab';
import LayoutScrollable from '../components/LayoutScrollable';
import Summary from './Summary';
import TabContent from './TabContent';
import TabHeader from './TabHeader';
import Tabs from '../components/Tabs';
import type { BasketItem, Currency, ErrorResponse, PassengerField, User } from '../types';
import Warning from '../components/Warning';

type Props = {
  addGlobalMessage: typeof addGlobalMessage,
  basketItems: Array<BasketItem>,
  createTickets: typeof createTickets,
  createTicketsAndPayByCredit: typeof createTicketsAndPayByCredit,
  currency: Currency,
  discount: number,
  errorSubmit: ?ErrorResponse, // eslint-disable-line react/no-unused-prop-types
  getPercentualDiscounts: typeof getPercentualDiscounts,
  prefillPassengers: typeof prefillPassengers,
  goTo: typeof goTo,
  isLoggedIn: boolean,
  isSubmitting: boolean,
  payableByCredit: boolean,
  payableByCreditCharge: boolean,
  showCreditPrice: boolean,
  totalPrice: number,
  user: User,
};

type State = {
  formData: {
    conditionsChecked: boolean,
  },
  lastError: ?ErrorResponse,
  validationResults: validation.ValidationResults<*>,
};

class ReservationScreen extends React.PureComponent<Props, State> {
  static transformServerValidationResults(
    basketItems: Array<BasketItem>,
    validationResults: validation.ValidationResults<*>,
  ): validation.ValidationResults<*> {
    // Example: ticketRequests.0.passengers.0.firstName > HkSm0dMxm_0_firstName
    return transform(validationResults, (result, error, key) => {
      const [, basketItemIndex, , passengerIndex, field] = key.split('.');
      const { shortid } = basketItems[basketItemIndex];
      const fieldKey = getValidationKey(field, shortid, passengerIndex);

      result[fieldKey] = error; // eslint-disable-line no-param-reassign
    });
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.errorSubmit && state.lastError !== props.errorSubmit) {
      const validationResults = ReservationScreen.transformServerValidationResults(
        props.basketItems,
        createServerValidationResults(props.errorSubmit),
      );

      return {
        lastError: props.errorSubmit,
        validationResults: toggleFirstInvalid({
          ...state.validationResults,
          ...validationResults,
        }),
      };
    }

    return null;
  }

  // eslint-disable-next-line react/sort-comp
  refTabs = null;
  shouldValidate: boolean = false;
  submitted: boolean = false;
  tabSelectedIndex = 0;

  state = {
    formData: {
      conditionsChecked: false,
    },
    lastError: null,
    validationResults: {},
  };

  componentDidMount() {
    const { getPercentualDiscounts } = this.props;
    getPercentualDiscounts();
    this.prefillDefaultPassengers();
    this.pushAnalytics();
  }

  componentDidUpdate(prevProps: Props) {
    const { basketItems, getPercentualDiscounts, isSubmitting, user } = this.props;
    const userChanged = user !== prevProps.user && !isSubmitting;

    if (this.shouldValidate) {
      this.handleBlur();
      this.shouldValidate = false;
    }

    if (basketItems.length !== prevProps.basketItems.length || userChanged) {
      this.prefillDefaultPassengers();
      this.shouldValidate = true;
    }

    if (userChanged) {
      getPercentualDiscounts();
    }
  }

  async pushAnalytics() {
    const { basketItems, currency, isLoggedIn, showCreditPrice } = this.props;
    await gtmPush(composePageViewPayload('Reservation', isLoggedIn));
    gtmPush(composeCheckoutPayload('Reservation', basketItems, currency, showCreditPrice));
  }

  prefillDefaultPassengers() {
    const { basketItems, prefillPassengers, user } = this.props;
    const changes = getPrefillChanges(basketItems, user);

    if (!isEmpty(changes)) {
      prefillPassengers(changes);
    }
  }

  getPassengersValidationsResults(): validation.ValidationResults<*> {
    const { basketItems } = this.props;

    return transform(
      basketItems,
      (result, basketItem) => {
        const { shortid: basketItemId, passengers, passengersData } = basketItem;
        const { firstPassengerData, otherPassengersData } = passengersData;

        /* eslint-disable no-param-reassign */
        if (firstPassengerData.length > 0) {
          // passengers
          basketItem.selectedPriceClass.tariffs.forEach((tariff, index) => {
            const requiredFields = index === 0 ? firstPassengerData : otherPassengersData;

            const addValidation = (field: PassengerField, validator: validation.Validator<*>) => {
              const fieldKey = getValidationKey(field, basketItemId, index);
              result[fieldKey] = validator(
                getPassengerValue(passengers, field, index),
                !this.submitted || !isPassengerFieldRequired(requiredFields, field),
              );
            };

            addValidation('firstName', validation.required);
            addValidation('surname', validation.required);
            addValidation('email', validation.email);
            addValidation('phone', validation.required);
          });
        } else {
          // contacts
          const emailKey = getValidationKey('email', basketItemId);
          const phoneKey = getValidationKey('phone', basketItemId);

          result[emailKey] = validation.email(
            getPassengerValue(passengers, 'email'),
            !this.submitted,
          );
          result[phoneKey] = validation.required(getPassengerValue(passengers, 'phone'), true);
        }
        /* eslint-enable no-param-reassign */
      },
      {},
    );
  }

  getTabValidationResults = (
    validationResults: validation.ValidationResults<*>,
    basketItemId: string,
  ): validation.ValidationResults<*> =>
    pickBy(validationResults, (value, key) => key.includes(basketItemId));

  getTabErrorCount = (validationResults: validation.ValidationResults<*>): Array<number> =>
    this.props.basketItems.map(({ shortid }) => {
      const results = this.getTabValidationResults(validationResults, shortid);
      return getInvalidFieldsCount(results);
    });

  validate = () => {
    const {
      formData: { conditionsChecked },
    } = this.state;
    // $FlowFixMe
    const validationResults = {
      ...this.getPassengersValidationsResults(),
      conditionsChecked: validation.requiredAgree(conditionsChecked, !this.submitted),
    };

    return cleanValidationObject(validationResults);
  };

  updateRefTabs = (ref: ?Object) => {
    this.refTabs = ref;
  };

  setTabSelectedIndex = selectedIndex => {
    this.tabSelectedIndex = selectedIndex;
  };

  scrollToTop = (validationResults: validation.ValidationResults<*>) => {
    const errors = this.getTabErrorCount(validationResults);

    if (
      errors.length > 0 &&
      !errors[this.tabSelectedIndex] &&
      errors.some((error, index) => index !== this.tabSelectedIndex && error > 0)
    ) {
      scrollToElement(this.refScroll)(this.refTabs);
    }
  };

  toggleFirstInvalidPerTab = (
    validationResults: validation.ValidationResults<*>,
  ): validation.ValidationResults<*> =>
    this.props.basketItems.reduce(
      (validationResults, { shortid }) => ({
        ...validationResults,
        ...toggleFirstInvalid(this.getTabValidationResults(validationResults, shortid)),
      }),
      validationResults,
    );

  handleConditionsPress = conditionsChecked =>
    this.setState(prevState => {
      const formData = {
        ...prevState.formData,
        conditionsChecked,
      };
      return { formData };
    }, this.handleBlur);

  handleBlur = () => {
    const validationResults = this.validate();
    this.setState({ validationResults });
  };

  handleSubmit = () => {
    this.submitted = true;

    const validationResults = this.toggleFirstInvalidPerTab(this.validate());
    this.scrollToTop(validationResults);
    this.setState({ validationResults });

    if (!isFormValid(validationResults)) {
      this.props.addGlobalMessage({
        messageId: 'validation.generalError',
        type: 'error',
      });
      return;
    }

    if (this.props.payableByCredit) {
      this.props.createTicketsAndPayByCredit();
    } else {
      this.props.createTickets();
    }
  };

  handleGoToSearch = () => this.props.goTo('SearchRoutes');

  refScroll = null;

  updateRefScroll = (ref: ?Object) => {
    this.refScroll = ref;
  };

  render() {
    const {
      basketItems,
      discount,
      isLoggedIn,
      isSubmitting,
      payableByCredit,
      payableByCreditCharge,
      showCreditPrice,
      totalPrice,
    } = this.props;
    const { formData, validationResults } = this.state;

    return (
      <LayoutScrollable scrollViewRef={this.updateRefScroll}>
        <Heading messageId={'header.title.seatSelect'}>
          <HeadingProgressTab step={2} steps={3} />
        </Heading>

        {basketItems.length === 0 && (
          <View style={theme.container}>
            <Warning type="warning">
              <FormattedMessage id="reservation.basket.empty" />
            </Warning>

            <Button onPress={this.handleGoToSearch} style={styles.marginTop} type="redLink">
              <FormattedMessage id="basket.button.goToSearch" />
            </Button>
          </View>
        )}

        {basketItems.length > 0 && (
          <View style={styles.marginTop}>
            <ScrollViewContext.Provider
              value={{ scrollToElement: scrollToElement(this.refScroll) }}
            >
              <Tabs
                errors={this.getTabErrorCount(validationResults)}
                headers={basketItems.map(({ route, shortid }) => (
                  <TabHeader key={shortid} route={route} />
                ))}
                onPress={this.setTabSelectedIndex}
                raised
                updateRefTabs={this.updateRefTabs}
              >
                {basketItems.map(basketItem => (
                  <TabContent
                    basketItem={basketItem}
                    key={basketItem.shortid}
                    onBlur={this.handleBlur}
                    validationResults={validationResults}
                  />
                ))}
              </Tabs>
              <Summary
                basketItems={basketItems}
                conditionsChecked={formData.conditionsChecked}
                discount={discount}
                handleConditionsPress={this.handleConditionsPress}
                handleSubmit={this.handleSubmit}
                isFetching={isSubmitting}
                isLoggedIn={isLoggedIn}
                payableByCredit={payableByCredit}
                payableByCreditCharge={payableByCreditCharge}
                showCreditPrice={showCreditPrice}
                totalPrice={totalPrice}
                validationResults={validationResults}
              />
            </ScrollViewContext.Provider>
          </View>
        )}
      </LayoutScrollable>
    );
  }
}

const styles = StyleSheet.create({
  marginTop: {
    marginTop: 20,
  },
});

export default connect(
  ({
    basket: { items, percentualDiscounts },
    localization: { currency },
    paymentMethods,
    tickets,
    user: { user },
  }) => {
    const showCreditPrice = get(user, 'creditPrice');
    const remainingCredit = get(user, 'credit');

    const price = computeTotalPrice(items, percentualDiscounts, false);
    const creditPrice = computeTotalPrice(items, percentualDiscounts, true);
    const totalPrice = showCreditPrice ? creditPrice : price;
    const discount = price - creditPrice;
    const payableByCredit = remainingCredit >= totalPrice;
    const payableByCreditCharge = remainingCredit > 0;

    return {
      basketItems: items,
      currency,
      discount,
      errorSubmit: tickets.create.error,
      isLoggedIn: !!user,
      isSubmitting: tickets.create.isFetching || paymentMethods.payTicket.isFetching,
      payableByCredit,
      payableByCreditCharge,
      showCreditPrice,
      totalPrice,
      user,
    };
  },
  {
    addGlobalMessage,
    createTickets,
    createTicketsAndPayByCredit,
    getPercentualDiscounts,
    goTo,
    prefillPassengers,
  },
)(ReservationScreen);
