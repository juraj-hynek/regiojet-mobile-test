// @flow
import { connect } from 'react-redux';
import { Row } from 'native-base';
import { StyleSheet, Text, View } from 'react-native';
import groupBy from 'lodash/groupBy';
import React, { Fragment } from 'react';
import uniq from 'lodash/uniq';

import { colors, theme } from '../style';
import { getVehicleIconNameByType } from '../helpers/routes';
import { goTo } from '../navigation/actions';
import { timeFormat } from '../localization/localeData';
import Date from '../components/Date';
import Direction from '../components/Direction';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';
import SeatBadge from '../reservation/SeatBadge';
import TicketButtons from './TicketButtons';
import TicketState, { isTicketStateValid } from './TicketState';
import TouchableOpacity from '../components/TouchableOpacity';
import type { SelectedSeat, Style, Ticket as TicketType, TicketSection } from '../types';

type Props = {
  goTo: typeof goTo,
  style?: Style,
  ticket: TicketType,
};

export const groupSelectedSeatsByVehicle = (selectedSeats: Array<SelectedSeat>) => {
  const selectedSeatsByVehicle = groupBy(selectedSeats, 'vehicleNumber');

  return Object.keys(selectedSeatsByVehicle).reduce(
    (sortedSeatsByVehicle, vehicleNumber) => ({
      ...sortedSeatsByVehicle,
      [vehicleNumber]: selectedSeatsByVehicle[vehicleNumber]
        .map(seat => seat.seatIndex)
        .sort((a, b) => a - b),
    }),
    {},
  );
};

const getVehicleTypes = (sections: Array<TicketSection>) =>
  uniq(sections.map(section => section.section.vehicleType));

const composeSeatBadge = (selectedSeats: Array<SelectedSeat>) => {
  const selectedSeatsByVehicle = groupSelectedSeatsByVehicle(selectedSeats);
  const [vehicle] = Object.keys(selectedSeatsByVehicle);

  const seats = selectedSeatsByVehicle[vehicle];
  return { vehicle, seats };
};

const renderSeats = (ticket: TicketType) => {
  if (!isTicketStateValid(ticket.state)) {
    return null;
  }

  const sections = ticket.outboundRouteSections;
  const passengerCount = ticket.passengersInfo.passengers.length;
  const { fixedSeatReservation, selectedSeats } = sections[0];

  if (!fixedSeatReservation) {
    const otherSeatsCount = passengerCount * (sections.length - 1);

    return (
      <Text style={[theme.paragraphSmall, theme.semiBold]}>
        <FormattedMessage id="tickets.detail.noFixedSeat" />
        {otherSeatsCount > 0 && <Text> +{otherSeatsCount}</Text>}
      </Text>
    );
  }

  if (!selectedSeats || !selectedSeats.length) {
    return null;
  }

  const seatBadge = composeSeatBadge(selectedSeats);
  const totalSeatsCount = passengerCount * sections.length;
  const otherSeatsCount = totalSeatsCount - seatBadge.seats.length;

  return (
    <Fragment>
      <SeatBadge
        seatNumbers={seatBadge.seats}
        vehicleNumber={
          sections[0].section.vehicleType === 'TRAIN' ? parseInt(seatBadge.vehicle, 10) : undefined
        }
      />
      {otherSeatsCount > 0 && (
        <Text style={[theme.paragraphSmall, theme.semiBold]}> +{otherSeatsCount}</Text>
      )}
    </Fragment>
  );
};

const Ticket = ({ goTo, style, ticket }: Props) => {
  const sections = ticket.outboundRouteSections;
  const vehicleTypes = getVehicleTypes(sections);

  const transferStyle = [theme.paragraphSmall, styles.transfer];
  const transferCount = sections.length - 1;

  return (
    <TouchableOpacity
      disabled={!ticket.customerActions.showDetail}
      onPress={() => goTo('Ticket', { ticketId: ticket.id })}
      style={[styles.container, style]}
    >
      <Row style={styles.row}>
        <View style={styles.marginRight}>
          <Row style={styles.iconContainer}>
            {vehicleTypes.map(vehicleType => (
              <Icon
                height={21}
                key={vehicleType}
                name={getVehicleIconNameByType(vehicleType)}
                style={styles.iconMargin}
                width={25}
              />
            ))}
          </Row>
        </View>
        <Direction
          ellipsis
          from={sections[0].section.departureCityName}
          textStyle={theme.paragraphSmall}
          to={sections[sections.length - 1].section.arrivalCityName}
        />
      </Row>

      {transferCount > 0 && (
        <Row style={styles.row}>
          <FormattedMessage id="tickets.detail.transfer" style={transferStyle} textAfter=": " />
          <Text style={transferStyle}>{sections[0].section.arrivalCityName}</Text>
          {transferCount > 1 && <Text style={transferStyle}> +{transferCount - 1}</Text>}
        </Row>
      )}

      <Row style={[styles.row, styles.rowCentered]}>{renderSeats(ticket)}</Row>

      <FormattedMessage
        id="tickets.detail.departure"
        style={[theme.paragraphSmall, styles.row]}
        values={{
          time: (
            <Date format={timeFormat} ignoreTimeZone>
              {sections[0].section.departureTime}
            </Date>
          ),
        }}
      />

      <Row style={[styles.row, styles.rowCentered, styles.buttons]}>
        <TicketState style={styles.marginRight} ticket={ticket} />
        <TicketButtons actions={ticket.customerActions} ticket={ticket} />
      </Row>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttons: {
    justifyContent: 'space-between',
  },

  container: {
    borderColor: colors.greyShadowHexa,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },

  iconContainer: {
    marginHorizontal: -2.5,
  },

  iconMargin: {
    marginHorizontal: 2.5,
  },

  marginRight: {
    marginRight: 10,
  },

  row: {
    marginVertical: 5,
  },

  rowCentered: {
    alignItems: 'center',
  },

  transfer: {
    color: colors.grey,
  },
});

export default connect(null, { goTo })(Ticket);
