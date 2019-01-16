// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import React, { Fragment } from 'react';
import values from 'lodash/values';

import { cancelPassenger, getTicketFreeSeats } from './actions';
import { getCancelModalType } from './helpers';
import { styles as cancelModalStyles } from './CancelModal';
import { theme } from '../style';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import LoaderSmall from '../components/LoaderSmall';
import Price from '../components/Price';
import Radio from '../components/form/Radio';
import Sections from '../reservation/Sections';
import type {
  ErrorResponse,
  Passenger,
  ReservationSection,
  RouteSeatsResponse,
  SelectedSeat,
  Ticket,
  Vehicle,
} from '../types';

type Step = 'SEAT_SELECTION' | 'RETURN_OPTIONS' | 'CONFIRMATION';

type Props = {|
  cancelPassenger: typeof cancelPassenger,
  error: ?ErrorResponse,
  freeSeats: Array<RouteSeatsResponse>,
  getTicketFreeSeats: typeof getTicketFreeSeats,
  isFetching: boolean,
  isSubmitting: boolean,
  onDone: Function,
  passenger: Passenger,
  ticket: Ticket,
|};

type State = {
  cancelledSeats: { [sectionId: number]: SelectedSeat },
  formData: {
    refundToOriginalSource: boolean,
  },
  step: Step,
};

class PassengerCancelModal extends React.PureComponent<Props, State> {
  static isInVehicle(vehicle: Vehicle, seat: SelectedSeat) {
    return seat.vehicleNumber === vehicle.vehicleNumber;
  }

  state = {
    cancelledSeats: this.prefillSelectedSeats(),
    formData: {
      refundToOriginalSource: false,
    },
    step: 'SEAT_SELECTION',
  };

  componentDidMount() {
    this.props.getTicketFreeSeats(this.props.ticket);
  }

  // automatically select first seat in every section
  prefillSelectedSeats() {
    return this.props.ticket.outboundRouteSections.reduce(
      (result, { fixedSeatReservation, section, selectedSeats }) => {
        if (!fixedSeatReservation) {
          return result;
        }
        return { ...result, [section.id]: selectedSeats[0] };
      },
      {},
    );
  }

  composeReservationSections(): Array<ReservationSection> {
    const { freeSeats } = this.props;

    return this.props.ticket.outboundRouteSections.map(
      ({ fixedSeatReservation, section, selectedSeats }, index) => {
        if (!fixedSeatReservation) {
          return { section, vehicles: [] };
        }

        return {
          section,
          vehicles: freeSeats[index].vehicles.map(vehicle => {
            const userSelectedSeats = selectedSeats.filter(selectedSeat =>
              PassengerCancelModal.isInVehicle(vehicle, selectedSeat),
            );
            const sectionSelectedSeat = this.state.cancelledSeats[section.id];

            return {
              selectedSeats: PassengerCancelModal.isInVehicle(vehicle, sectionSelectedSeat)
                ? [sectionSelectedSeat]
                : [],
              vehicle,
              freeSeatsNumbers: userSelectedSeats.map(selectedSeat => selectedSeat.seatIndex),
            };
          }),
        };
      },
    );
  }

  composeTranslation(partialMessageId: string, ignoreType: boolean = false) {
    if (ignoreType) {
      return `ticket.passengerCancelModal.${partialMessageId}`;
    }
    const type = getCancelModalType(this.props.ticket);
    return `ticket.passengerCancelModal.${type}.${partialMessageId}`;
  }

  handleChange = (value: Object) => {
    this.setState(prevState => {
      const formData = {
        ...prevState.formData,
        ...value,
      };
      return { formData };
    });
  };

  handleGoBackConfirmation = () => {
    const step = this.props.ticket.conditions.refundToOriginalSourcePossible
      ? 'RETURN_OPTIONS'
      : 'SEAT_SELECTION';
    this.setState({ step });
  };

  handleGoBackReturnOptions = () => {
    this.setState({ step: 'SEAT_SELECTION' });
  };

  handleSeatSelect = (selectedSeat: SelectedSeat) => {
    this.setState(prevState => ({
      cancelledSeats: { ...prevState.cancelledSeats, [selectedSeat.sectionId]: selectedSeat },
    }));
  };

  handleSubmitReturnOptions = () => {
    this.setState({ step: 'CONFIRMATION' });
  };

  handleSubmitSeatSelect = () => {
    const step = this.props.ticket.conditions.refundToOriginalSourcePossible
      ? 'RETURN_OPTIONS'
      : 'CONFIRMATION';
    this.setState({ step });
  };

  handleSubmit = () => {
    const { cancelPassenger, onDone, passenger, ticket } = this.props;
    const { cancelledSeats, formData } = this.state;

    cancelPassenger(
      ticket,
      passenger.id,
      values(cancelledSeats),
      formData.refundToOriginalSource,
      onDone,
    );
  };

  render() {
    const { error, freeSeats, isFetching, isSubmitting, passenger, ticket } = this.props;
    const { formData, step } = this.state;

    if (isFetching) {
      return <LoaderSmall />;
    }

    if (error || !freeSeats.length) {
      return <View>{/* TODO retry button */}</View>;
    }

    const reservationSections = this.composeReservationSections();
    const reservationFee = passenger.amount - passenger.moneyBack;
    const feePercentage = Math.round(reservationFee / passenger.amount * 100);
    const isPaid = ticket.state === 'VALID';
    const mode = getCancelModalType(this.props.ticket);

    return (
      <View style={theme.containerModal}>
        {step === 'SEAT_SELECTION' && (
          <Fragment>
            <FormattedMessage
              id={this.composeTranslation('seatSelection', true)}
              style={theme.h3}
            />

            <Sections
              mode={mode}
              onSeatSelect={this.handleSeatSelect}
              reservationSections={reservationSections}
              style={styles.sections}
            />

            <Button onPress={this.handleSubmitSeatSelect} style={cancelModalStyles.button}>
              <FormattedMessage id={this.composeTranslation('button.storno')} />
            </Button>
          </Fragment>
        )}

        {step === 'RETURN_OPTIONS' && (
          <Fragment>
            <FormattedMessage
              id={this.composeTranslation('returnCreditDescription', true)}
              style={[theme.paragraph, theme.bold]}
            />
            <Radio
              onPress={refundToOriginalSource => this.handleChange({ refundToOriginalSource })}
              selected={formData.refundToOriginalSource === false}
              style={cancelModalStyles.marginTop}
              value={false}
            >
              <FormattedMessage id={this.composeTranslation('returnCreditRadio', true)} />
            </Radio>
            <Radio
              onPress={refundToOriginalSource => this.handleChange({ refundToOriginalSource })}
              selected={formData.refundToOriginalSource === true}
              style={cancelModalStyles.marginTop}
              value
            >
              <FormattedMessage id={this.composeTranslation('returnBankAccountRadio', true)} />
            </Radio>

            <Button onPress={this.handleSubmitReturnOptions} style={cancelModalStyles.button}>
              <FormattedMessage id={this.composeTranslation('button.storno')} />
            </Button>
            <Button
              onPress={this.handleGoBackReturnOptions}
              secondary
              style={cancelModalStyles.marginTop}
            >
              <FormattedMessage id={this.composeTranslation('button.back', true)} />
            </Button>
          </Fragment>
        )}

        {step === 'CONFIRMATION' && (
          <Fragment>
            {isPaid &&
              reservationFee > 0 && (
                <View style={cancelModalStyles.fee}>
                  <FormattedMessage id={this.composeTranslation('fee')} style={theme.paragraph} />
                  <Price
                    currency={ticket.currency}
                    style={[theme.paragraph, theme.semiBold, styles.feeText]}
                    value={reservationFee}
                  />
                  <Text style={[theme.paragraph, theme.semiBold]}>({feePercentage}%)</Text>
                </View>
              )}

            <FormattedMessage
              id={this.composeTranslation('confirmation')}
              style={[theme.paragraph, theme.bold]}
            />

            {isPaid && (
              <FormattedMessage
                id={this.composeTranslation(
                  `return.${formData.refundToOriginalSource ? 'original' : 'credit'}`,
                )}
                style={theme.paragraph}
                values={{
                  amount: (
                    <Price
                      currency={ticket.currency}
                      style={theme.bold}
                      value={passenger.moneyBack}
                    />
                  ),
                }}
              />
            )}

            <Button
              loading={isSubmitting}
              onPress={this.handleSubmit}
              style={cancelModalStyles.button}
            >
              <FormattedMessage
                id={
                  !isPaid || formData.refundToOriginalSource
                    ? this.composeTranslation('button.storno')
                    : this.composeTranslation('button.stornoCredit', true)
                }
              />
            </Button>
            <Button
              disabled={isSubmitting}
              onPress={this.handleGoBackConfirmation}
              secondary
              style={cancelModalStyles.marginTop}
            >
              <FormattedMessage id={this.composeTranslation('button.back', true)} />
            </Button>
          </Fragment>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  feeText: {
    marginHorizontal: 10,
  },

  sections: {
    marginHorizontal: -10,
  },
});

export default connect(
  ({
    ticket: {
      freeSeats: { data, error, isFetching },
      passengerCancel,
    },
  }) => ({
    error,
    freeSeats: data,
    isFetching,
    isSubmitting: passengerCancel.isFetching,
  }),
  { cancelPassenger, getTicketFreeSeats },
)(PassengerCancelModal);
