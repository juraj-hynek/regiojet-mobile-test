// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import React, { Fragment } from 'react';

import { cancelTicket } from './actions';
import { colors, theme } from '../style';
import { composeSearchRoutesParamsFromTicket, getCancelModalType } from './helpers';
import { goTo } from '../navigation/actions';
import { setReturnDate } from '../connections/actions';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';
import Radio from '../components/form/Radio';
import type { CityMap, StationMap, Ticket } from '../types';

type Step = 'RETURN_OPTIONS' | 'CONFIRMATION' | 'SUCCESS';

type Props = {|
  cancelTicket: typeof cancelTicket,
  cities: CityMap,
  goTo: typeof goTo,
  isFetching: boolean,
  onDone: Function,
  setReturnDate: typeof setReturnDate,
  stations: StationMap,
  ticket: Ticket,
|};

type State = {
  formData: {
    refundToOriginalSource: boolean,
  },
  step: Step,
};

class CancelModal extends React.PureComponent<Props, State> {
  state = {
    formData: {
      refundToOriginalSource: false,
    },
    step: this.props.ticket.conditions.refundToOriginalSourcePossible
      ? 'RETURN_OPTIONS'
      : 'CONFIRMATION',
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

  handleSubmitReturnOptions = () => {
    this.setState({ step: 'CONFIRMATION' });
  };

  handleSubmit = () => {
    const { cancelTicket, ticket } = this.props;
    const { formData } = this.state;

    const onSucces = () => this.setState({ step: 'SUCCESS' });
    cancelTicket(ticket, formData.refundToOriginalSource, onSucces);
  };

  handleGoToNewReservation = () => {
    const { cities, goTo, onDone, setReturnDate, stations, ticket } = this.props;

    const formData = composeSearchRoutesParamsFromTicket(cities, stations, ticket);
    setReturnDate();
    goTo('SearchRoutes', { formData });
    onDone();
  };

  render() {
    const { isFetching, onDone, ticket } = this.props;
    const { formData, step } = this.state;

    const type = getCancelModalType(ticket);

    return (
      <View style={theme.containerModal}>
        {step === 'RETURN_OPTIONS' && (
          <Fragment>
            <FormattedMessage
              id="ticket.stornoModal.returnCreditDescription"
              style={[theme.paragraph, theme.bold]}
            />
            <Radio
              onPress={refundToOriginalSource => this.handleChange({ refundToOriginalSource })}
              selected={formData.refundToOriginalSource === false}
              style={styles.marginTop}
              value={false}
            >
              <FormattedMessage id="ticket.stornoModal.returnCreditRadio" />
            </Radio>
            <Radio
              onPress={refundToOriginalSource => this.handleChange({ refundToOriginalSource })}
              selected={formData.refundToOriginalSource === true}
              style={styles.marginTop}
              value
            >
              <FormattedMessage id="ticket.stornoModal.returnBankAccountRadio" />
            </Radio>

            <Button onPress={this.handleSubmitReturnOptions} style={styles.button}>
              <FormattedMessage id={`ticket.stornoModal.${type}.buttonStorno`} />
            </Button>
            <Button onPress={onDone} secondary style={styles.marginTop}>
              <FormattedMessage id={`ticket.stornoModal.${type}.buttonNoStorno`} />
            </Button>
          </Fragment>
        )}

        {step === 'CONFIRMATION' && (
          <Fragment>
            {ticket.cancelChargeSum > 0 && (
              <View style={styles.fee}>
                <FormattedMessage
                  id={`ticket.stornoModal.${type}.fee`}
                  style={[theme.paragraph, styles.feeText]}
                />
                <Price
                  currency={ticket.currency}
                  style={[theme.paragraph, theme.semiBold]}
                  value={ticket.cancelChargeSum}
                />
              </View>
            )}

            <FormattedMessage
              id={`ticket.stornoModal.${type}.question`}
              style={[theme.paragraph, theme.bold]}
            />
            {type !== 'cancel' && (
              <FormattedMessage
                id={`ticket.stornoModal.return.${
                  formData.refundToOriginalSource ? 'original' : 'credit'
                }`}
                style={theme.paragraph}
                values={{
                  amount: (
                    <Price
                      currency={ticket.currency}
                      style={theme.bold}
                      value={ticket.cancelMoneyBackSum}
                    />
                  ),
                }}
              />
            )}

            <Button loading={isFetching} onPress={this.handleSubmit} style={styles.button}>
              <FormattedMessage id={`ticket.stornoModal.${type}.buttonConfirm`} />
            </Button>
            <Button disabled={isFetching} onPress={onDone} secondary style={styles.marginTop}>
              <FormattedMessage id={`ticket.stornoModal.${type}.buttonNoStorno`} />
            </Button>
          </Fragment>
        )}

        {step === 'SUCCESS' && (
          <Fragment>
            <FormattedMessage id="ticket.stornoModal.goToReservation" style={theme.paragraph} />

            <Button onPress={this.handleGoToNewReservation} style={styles.button}>
              <FormattedMessage id="ticket.stornoModal.buttonConfirm" />
            </Button>
            <Button onPress={onDone} secondary style={styles.marginTop}>
              <FormattedMessage id="ticket.stornoModal.buttonNoReservation" />
            </Button>
          </Fragment>
        )}
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  button: {
    marginTop: 30,
  },

  fee: {
    borderBottomColor: colors.greyShadow,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 15,
  },

  feeText: {
    marginRight: 10,
  },

  marginTop: {
    marginTop: 20,
  },
});

export default connect(
  ({
    consts: { cities, stations },
    ticket: {
      cancel: { isFetching },
    },
  }) => ({ cities, isFetching, stations }),
  {
    cancelTicket,
    goTo,
    setReturnDate,
  },
)(CancelModal);
