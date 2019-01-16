// @flow
import React, { Fragment, type Node } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { colors, fontFamilies, theme } from '../style';
import { getSeatClass, getVehicleStandard } from '../consts/helpers';
import { getServiceIconNameByType } from '../vehicles/helpers';
import { getVehicleSvg } from '../vehicles/actions';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';
import LoaderSmall from '../components/LoaderSmall';
import SeatSelection from './SeatSelection';
import type {
  ErrorResponse,
  ReservationVehicle,
  Seat,
  SeatClass,
  SelectedSeat,
  VehicleStandard,
  VehicleSvg,
} from '../types';

type Props = {
  error: ?ErrorResponse,
  getVehicleSvg: typeof getVehicleSvg,
  isFetching: boolean,
  onSeatSelect: Function,
  onSpecialSeats?: Function,
  picker?: Node,
  reservationVehicle: ReservationVehicle,
  seatClasses: Array<SeatClass>,
  sectionId: number,
  vehicleStandards: Array<VehicleStandard>,
  vehicleSvg: VehicleSvg,
};

type State = {
  viewWidth: number,
};

class Vehicle extends React.PureComponent<Props, State> {
  static MAX_SVG_WIDTH = 400;

  static isSpecialSeat(seat: Seat) {
    return seat.seatConstraint || seat.seatNotes.length > 0;
  }

  state = {
    viewWidth: 1,
  };

  componentDidMount() {
    const {
      getVehicleSvg,
      onSpecialSeats,
      reservationVehicle: { vehicle },
    } = this.props;

    getVehicleSvg(vehicle);

    if (onSpecialSeats) {
      const specialSeats = this.getNotShownSpecialSeats();
      if (specialSeats.length > 0) {
        this.openSpecialSeatsModal(specialSeats);
      }
    }
  }

  getNotShownSpecialSeats(): Array<Seat> {
    const {
      reservationVehicle: { selectedSeats, vehicle },
    } = this.props;
    const modalNotShownSeatIds = selectedSeats
      .filter(selectedSeat => !selectedSeat.specialSeatsModalShown)
      .map(selectedSeat => selectedSeat.seatIndex);

    return vehicle.freeSeats.filter(
      freeSeat => Vehicle.isSpecialSeat(freeSeat) && modalNotShownSeatIds.includes(freeSeat.index),
    );
  }

  openSpecialSeatsModal(specialSeats: Array<Seat>) {
    const {
      onSpecialSeats,
      reservationVehicle: { vehicle },
      sectionId,
    } = this.props;
    if (onSpecialSeats) {
      onSpecialSeats(specialSeats, sectionId, vehicle);
    }
  }

  composeVehicleName() {
    const {
      reservationVehicle: { vehicle },
      seatClasses,
      vehicleStandards,
    } = this.props;

    // for bus, display vehicle standard, e.g. Fun & Relax
    if (vehicle.type === 'BUS') {
      const vehicleStandard = getVehicleStandard(vehicleStandards, vehicle.vehicleStandardKey);
      return vehicleStandard ? vehicleStandard.name : vehicle.vehicleStandardKey;
    }

    // for train, display all seat classes available in vehicle, e.g. RELAX/BUSINESS
    return vehicle.seatClasses
      .map(seatClassKey => {
        const seatClass = getSeatClass(seatClasses, seatClassKey);
        return seatClass ? seatClass.title : seatClassKey;
      })
      .join('/');
  }

  computeSvgSize() {
    const {
      vehicleSvg: { width, height },
    } = this.props;
    const { viewWidth } = this.state;

    const widthRatio = width / Math.min(Vehicle.MAX_SVG_WIDTH, viewWidth);
    const svgWidth = width / widthRatio;
    const svgHeight = height / widthRatio;

    return { svgWidth, svgHeight };
  }

  handleSeatSelect = (selectedSeat: SelectedSeat) => {
    const {
      onSeatSelect,
      onSpecialSeats,
      reservationVehicle: { vehicle },
    } = this.props;
    onSeatSelect(selectedSeat);

    if (onSpecialSeats) {
      const specialSeat = vehicle.freeSeats.find(
        freeSeat => freeSeat.index === selectedSeat.seatIndex && Vehicle.isSpecialSeat(freeSeat),
      );
      if (specialSeat) {
        this.openSpecialSeatsModal([specialSeat]);
      }
    }
  };

  measureViewWidth = event => {
    this.setState({ viewWidth: event.nativeEvent.layout.width });
  };

  render() {
    const {
      error,
      isFetching,
      picker,
      reservationVehicle: { freeSeatsNumbers, selectedSeats, vehicle },
      sectionId,
      vehicleSvg,
    } = this.props;

    if (isFetching) {
      return <LoaderSmall />;
    }

    if (error) {
      return (
        <Fragment>
          {picker}
          {/* TODO retry button */}
        </Fragment>
      );
    }

    const { svgWidth, svgHeight } = this.computeSvgSize();
    const vehicleName = this.composeVehicleName();

    return (
      <View onLayout={this.measureViewWidth}>
        <FormattedMessage
          id={`reservation.vehicleName.${vehicle.type.toLowerCase()}`}
          style={[theme.h2, styles.text]}
          textAfter={` ${vehicleName}`}
        />
        <View style={styles.icons}>
          {vehicle.services.map(service => (
            <Icon
              height={15}
              key={service}
              name={getServiceIconNameByType(service)}
              style={styles.icon}
              width={15}
            />
          ))}
        </View>
        {picker}

        {vehicle.type === 'TRAIN' && (
          <View style={styles.direction}>
            <Icon color={colors.yellow} name="arrowUpBold" style={styles.directionIcon} width={7} />
            <FormattedMessage id="reservation.direction" style={[theme.paragraph, theme.bold]} />
          </View>
        )}

        <SeatSelection
          freeSeatsNumbers={freeSeatsNumbers}
          onSelect={this.handleSeatSelect}
          sectionId={sectionId}
          selectedSeats={selectedSeats}
          style={[
            styles.seatSelection,
            {
              width: svgWidth,
              height: svgHeight,
            },
          ]}
          svgData={vehicleSvg.svg}
          vehicle={vehicle}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fontFamilies.base,
    marginBottom: 10,
    marginTop: 15,
    textAlign: 'center',
  },

  icons: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 7,
    marginHorizontal: -7,
    marginTop: -3,
  },

  icon: {
    marginHorizontal: 7,
    marginVertical: 3,
  },

  direction: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },

  directionIcon: {
    marginRight: 10,
  },

  seatSelection: {
    alignSelf: 'center',
  },
});

export default connect(
  (
    { consts, vehicles },
    {
      reservationVehicle: {
        vehicle: { vehicleId },
      },
    },
  ) => {
    const currentVehicle = vehicles[vehicleId];

    return {
      error: currentVehicle ? currentVehicle.error : null,
      isFetching: !currentVehicle || currentVehicle.isFetching,
      seatClasses: consts.seatClasses,
      vehicleStandards: consts.vehicleStandards,
      vehicleSvg: currentVehicle ? currentVehicle.data : null,
    };
  },
  { getVehicleSvg },
)(Vehicle);
