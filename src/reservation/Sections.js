// @flow
import React, { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, theme } from '../style';
import { getVehicleIconNameByType } from '../helpers/routes';
import Direction from '../components/Direction';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';
import SeatBadge from './SeatBadge';
import Select, { type Option } from '../components/form/Select';
import type { ReservationMode, ReservationSection, SelectedSeat, Style } from '../types';
import Vehicles from './Vehicles';
import Warning from '../components/Warning';

type Props = {|
  mode: ReservationMode,
  onSeatSelect: Function,
  onSpecialSeats?: Function,
  reservationSections: Array<ReservationSection>,
  style?: Style,
|};

type State = {
  selectedIndex: number,
};

class Sections extends React.Component<Props, State> {
  static defaultProps = {
    mode: 'reservation',
  };

  static composeSeatBadgeNumbers(selectedSeats: Array<SelectedSeat>) {
    return selectedSeats.map(selectedSeat => selectedSeat.seatIndex).sort((a, b) => a - b);
  }

  state = {
    selectedIndex: 0,
  };

  composeSelectOptions(): Array<Option> {
    const { reservationSections } = this.props;
    const { selectedIndex } = this.state;

    return reservationSections
      .map(reservationSections => reservationSections.section)
      .reduce((options, section, index) => {
        if (index === selectedIndex) {
          return options;
        }

        return [
          ...options,
          {
            element: (
              <Direction
                from={section.departureCityName}
                textStyle={[theme.paragraphSmall, styles.sectionOption]}
                to={section.arrivalCityName}
              />
            ),
            value: index,
          },
        ];
      }, []);
  }

  handleSelectChange = (selectedIndex: number) => {
    this.setState({ selectedIndex });
  };

  render() {
    const { mode, onSeatSelect, onSpecialSeats, reservationSections, style } = this.props;
    const { selectedIndex } = this.state;

    const options = this.composeSelectOptions();
    const selectedSection = reservationSections[selectedIndex];
    const { section, vehicles } = selectedSection;
    const selectedVehicles = vehicles.filter(
      sectionVehicle => sectionVehicle.selectedSeats.length > 0,
    );
    const selectedSeatsCount = selectedVehicles.reduce(
      (count, vehicle) => count + vehicle.selectedSeats.length,
      0,
    );

    return (
      <View style={style}>
        <View style={styles.icon}>
          <Icon height={21} name={getVehicleIconNameByType(section.vehicleType)} width={25} />
        </View>
        <Direction
          from={section.departureCityName}
          style={styles.direction}
          textStyle={[theme.paragraphSmall, theme.bold]}
          to={section.arrivalCityName}
        />

        <View style={styles.container}>
          {reservationSections.length > 1 && (
            <Select onChange={this.handleSelectChange} options={options} style={styles.row}>
              <FormattedMessage id="reservation.button.selectSection" />
            </Select>
          )}

          {vehicles.length > 0 ? (
            <Fragment>
              <View style={styles.selectedSeatContainer}>
                <Text style={[theme.paragraph, styles.selectedSeatsText]}>
                  {mode === 'reservation' ? (
                    <FormattedMessage
                      id={
                        selectedSeatsCount > 1
                          ? 'reservation.selectedSeats'
                          : 'reservation.selectedSeat'
                      }
                    />
                  ) : (
                    <FormattedMessage id={`ticket.passengerCancelModal.${mode}.selectedSeat`} />
                  )}
                </Text>
                <View style={styles.selectedSeatBadgeContainer}>
                  {selectedVehicles.map(({ selectedSeats, vehicle }) => (
                    <SeatBadge
                      key={vehicle.vehicleNumber}
                      seatNumbers={Sections.composeSeatBadgeNumbers(selectedSeats)}
                      style={styles.selectedSeatBadge}
                      vehicleNumber={
                        vehicle.type === 'TRAIN' ? parseInt(vehicle.vehicleNumber, 10) : undefined
                      }
                    />
                  ))}
                </View>
              </View>
              <Vehicles
                key={section.id}
                onSeatSelect={onSeatSelect}
                onSpecialSeats={onSpecialSeats}
                reservationSection={selectedSection}
              />
            </Fragment>
          ) : (
            <Warning icon="seat" style={styles.noFixedSeat} type="warning">
              <FormattedMessage
                id={
                  mode === 'reservation'
                    ? 'ticket.noFixedSeatReservation'
                    : `ticket.passengerCancelModal.${mode}.noFixedSeatReservation`
                }
              />
            </Warning>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 30,
  },

  row: {
    marginBottom: 20,
  },

  direction: {
    backgroundColor: colors.yellow,
    marginTop: -14,
    padding: 10,
  },

  icon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.yellow,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 10,
    paddingVertical: 6.5,
    width: 70,
    zIndex: 1,
  },

  sectionOption: {
    lineHeight: 20,
  },

  selectedSeatContainer: {
    alignItems: 'center',
    borderBottomColor: colors.greyShadow,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -10,
    paddingBottom: 20,
  },

  selectedSeatBadgeContainer: {
    flexShrink: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 10 - 2.5,
    marginVertical: -2.5,
  },

  selectedSeatBadge: {
    margin: 2.5,
  },

  selectedSeatsText: {
    marginHorizontal: 10,
  },

  noFixedSeat: {
    marginTop: 20,
  },
});

export default Sections;
