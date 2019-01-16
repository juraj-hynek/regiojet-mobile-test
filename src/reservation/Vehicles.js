// @flow
import React from 'react';
import { StyleSheet } from 'react-native';
import { injectIntl, type intlShape } from 'react-intl';

import Picker from '../components/form/Picker';
import type { ReservationSection } from '../types';
import Vehicle from './Vehicle';

type Props = {
  intl: intlShape,
  onSeatSelect: Function,
  onSpecialSeats?: Function,
  reservationSection: ReservationSection,
};

type State = {
  selectedVehicleIndex: number,
};

class Vehicles extends React.PureComponent<Props, State> {
  state = {
    selectedVehicleIndex: this.getPreselectedVehicleIndex(),
  };

  getPreselectedVehicleIndex() {
    const {
      reservationSection: { vehicles },
    } = this.props;
    return Math.max(0, vehicles.findIndex(vehicle => vehicle.selectedSeats.length > 0));
  }

  handlePickerChange = (option: Object) => {
    this.setState({ selectedVehicleIndex: option.value });
  };

  renderPicker() {
    const {
      intl,
      reservationSection: { vehicles },
    } = this.props;
    const { selectedVehicleIndex } = this.state;

    if (vehicles.length < 2) {
      return null;
    }

    const options = vehicles.map(({ freeSeatsNumbers, vehicle }, index) => ({
      value: index,
      label: `${vehicle.vehicleNumber} (${freeSeatsNumbers.length})`,
    }));

    return (
      <Picker
        label={intl.formatMessage({ id: 'reservation.vehicleNumber' })}
        onChange={this.handlePickerChange}
        options={options}
        style={styles.picker}
        value={selectedVehicleIndex}
      />
    );
  }

  render() {
    const {
      onSeatSelect,
      onSpecialSeats,
      reservationSection: { section, vehicles },
    } = this.props;
    const { selectedVehicleIndex } = this.state;

    const selectedVehicle = vehicles[selectedVehicleIndex];

    return (
      <Vehicle
        key={`${section.id}-${selectedVehicleIndex}`}
        onSeatSelect={onSeatSelect}
        onSpecialSeats={onSpecialSeats}
        picker={this.renderPicker()}
        reservationVehicle={selectedVehicle}
        sectionId={section.id}
      />
    );
  }
}

const styles = StyleSheet.create({
  picker: {
    marginVertical: 20,
  },
});

export default injectIntl(Vehicles);
