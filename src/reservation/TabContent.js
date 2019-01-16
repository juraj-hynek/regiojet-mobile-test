// @flow
import React, { Fragment } from 'react';
import { StyleSheet } from 'react-native';
import get from 'lodash/get';
import { connect } from 'react-redux';

import {
  computeTicketCodeDiscount,
  computeTicketPercentualDiscount,
  computeTicketPrice,
} from '../basket/helpers';
import { markSpecialSeats, selectSeat, updateAddon } from '../basket/actions';
import { openSpecialSeatsModal } from '../modal/actions';
import { theme } from '../style';
import * as validation from '../components/form/validation';
import Addons from './Addons';
import CodeDiscount from './CodeDiscount';
import Conditions from './Conditions';
import ConnectionInfo from './ConnectionInfo';
import Contact from './Contact';
import CustomerNotifications from './CustomerNotifications';
import FormattedMessage from '../components/FormattedMessage';
import Passengers from './Passengers';
import PercentualDiscounts from './PercentualDiscounts';
import PriceCollapse from './PriceCollapse';
import ScrollableContext from '../components/ScrollableContext';
import Sections from './Sections';
import type {
  BasketItem,
  Discount,
  ReservationSection,
  Seat,
  SelectedSeat,
  Vehicle,
} from '../types';

type Props = {|
  basketItem: BasketItem,
  codeDiscountValue: number,
  isUpdatingAddons: boolean,
  markSpecialSeats: typeof markSpecialSeats,
  onBlur: Function,
  openSpecialSeatsModal: typeof openSpecialSeatsModal,
  percentualDiscounts: Array<Discount>,
  percentualDiscountValue: number,
  selectSeat: typeof selectSeat,
  ticketPrice: number,
  updateAddon: typeof updateAddon,
  validationResults: validation.ValidationResults<*>,
|};

class TabContent extends React.PureComponent<Props> {
  composeReservationSections(): Array<ReservationSection> {
    const { route, seats } = this.props.basketItem;

    return route.sections.map((section, index) => ({
      section,
      vehicles: seats[index].vehicles.map(vehicle => ({
        selectedSeats: seats[index].selectedSeats.filter(
          selectedSeat => selectedSeat.vehicleNumber === vehicle.vehicleNumber,
        ),
        vehicle,
        freeSeatsNumbers: vehicle.freeSeats.map(freeSeat => freeSeat.index),
      })),
    }));
  }

  handleAddonChange = (addonId, count, checked) => {
    const { basketItem, updateAddon } = this.props;
    updateAddon(basketItem, addonId, count, checked);
  };

  handleSeatSelect = (selectedSeat: SelectedSeat) =>
    this.props.selectSeat(this.props.basketItem.shortid, selectedSeat);

  openSpecialSeatsModal = (specialSeats: Array<Seat>, sectionId: number, vehicle: Vehicle) => {
    const { basketItem, markSpecialSeats, openSpecialSeatsModal } = this.props;

    const onCancel = () => markSpecialSeats(basketItem.shortid, sectionId, specialSeats);

    openSpecialSeatsModal(
      specialSeats,
      vehicle.type === 'TRAIN' ? vehicle.vehicleNumber : undefined,
      onCancel,
    );
  };

  render() {
    const {
      basketItem,
      codeDiscountValue,
      isUpdatingAddons,
      onBlur,
      percentualDiscounts,
      percentualDiscountValue,
      ticketPrice,
      validationResults,
    } = this.props;

    const { addons, passengers, passengersData, route, selectedPriceClass, shortid } = basketItem;
    const reservationSections = this.composeReservationSections();

    const routePercentualDiscounts = percentualDiscounts.filter(
      discount =>
        discount.state === 'VALID' &&
        (!discount.applied || discount.applied.basketItemId === shortid),
    );
    const displayedPercentualDiscounts =
      ticketPrice - codeDiscountValue - percentualDiscountValue <= 0
        ? routePercentualDiscounts.filter(discount => discount.applied)
        : routePercentualDiscounts;

    return (
      <Fragment>
        <FormattedMessage id="reservation.seatSelection" style={[theme.h1, styles.heading]} />
        <Sections
          onSeatSelect={this.handleSeatSelect}
          onSpecialSeats={this.openSpecialSeatsModal}
          reservationSections={reservationSections}
          style={styles.sections}
        />
        <CustomerNotifications
          notifications={get(basketItem, 'selectedPriceClass.customerNotifications')}
        />
        <ConnectionInfo sections={route.sections} transfersInfo={route.transfersInfo} />
        <Conditions conditions={get(basketItem, 'selectedPriceClass.conditions')} />
        {addons.length > 0 && (
          <Addons
            disabled={isUpdatingAddons}
            onAddonChange={this.handleAddonChange}
            routeAddons={addons}
          />
        )}
        {/* TODO uncomment when insurance is implemented
        <Insurances
          disabled={false}
          onInsuranceChange={() => {}}
          routeInsurances={[
            {
              checked: true,
              iconUrl: 'https://dpl-qa-ybus-restapi.sa.cz/v2/resources/addon/dopl_kolo.svg',
              id: '1',
              name: 'Pojištění stornovacích poplatků',
              price: 666,
              types: [
                { value: '0', label: 'Pojištění s návratem do 5 dnů' },
                { value: '1', label: 'Pojištění bez návratu' },
              ],
            },
            {
              checked: false,
              iconUrl: 'https://dpl-qa-ybus-restapi.sa.cz/v2/resources/addon/dopl_lyze.svg',
              id: '2',
              name: 'Pojištění kapybary',
              price: 123,
              types: [],
            },
          ]}
        /> */}
        {/* $FlowFixMe */}
        <PriceCollapse basketItem={basketItem} percentualDiscounts={percentualDiscounts} />
        {passengersData.firstPassengerData.length > 0 ? (
          <Passengers
            basketItemId={shortid}
            onBlur={onBlur}
            passengersData={passengersData}
            passengerValues={passengers}
            tariffs={selectedPriceClass.tariffs}
            validationResults={validationResults}
          />
        ) : (
          <Contact
            basketItemId={shortid}
            onBlur={onBlur}
            passengerValues={passengers}
            validationResults={validationResults}
          />
        )}
        <CodeDiscount
          basketItem={basketItem}
          codeDiscountValue={codeDiscountValue}
          ticketPrice={ticketPrice}
        />
        {routePercentualDiscounts.length > 0 && (
          <ScrollableContext>
            <PercentualDiscounts
              addingDisabled={displayedPercentualDiscounts.length < routePercentualDiscounts.length}
              basketItem={basketItem}
              disabled={ticketPrice - codeDiscountValue <= 0}
              discounts={displayedPercentualDiscounts}
            />
          </ScrollableContext>
        )}
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  heading: {
    marginHorizontal: 10,
    marginTop: 20,
  },

  sections: {
    marginBottom: 50,
  },
});

export default connect(
  ({ basket: { isUpdatingAddons, percentualDiscounts }, user: { role } }, { basketItem }) => {
    const isCredit = role === 'CREDIT';
    return {
      codeDiscountValue: computeTicketCodeDiscount(basketItem, isCredit),
      isUpdatingAddons,
      percentualDiscounts,
      percentualDiscountValue: computeTicketPercentualDiscount(basketItem, percentualDiscounts),
      ticketPrice: computeTicketPrice(basketItem, isCredit),
    };
  },
  { markSpecialSeats, openSpecialSeatsModal, selectSeat, updateAddon },
)(TabContent);
