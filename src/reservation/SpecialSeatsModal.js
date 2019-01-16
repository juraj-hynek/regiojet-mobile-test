// @flow
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import List from '../components/List';
import SeatBadge from './SeatBadge';
import type { Seat } from '../types';

type Props = {
  onCancel: Function,
  seats: Array<Seat>,
  vehicleNumber?: number,
};

class SpecialSeatsModal extends React.PureComponent<Props> {
  render() {
    const { onCancel, seats, vehicleNumber } = this.props;

    return (
      <View style={theme.containerModal}>
        {seats.map(seat => (
          <View key={seat.index} style={styles.row}>
            <SeatBadge
              seatNumbers={[seat.index]}
              style={styles.seatBadge}
              vehicleNumber={vehicleNumber}
            />
            <FormattedMessage
              id="reservation.specialSeatsModal.text.mobile"
              style={theme.paragraph}
            />

            <List style={styles.list}>
              {seat.seatConstraint && <Text>{seat.seatConstraint}</Text>}
              {/* eslint-disable-next-line react/no-array-index-key */}
              {seat.seatNotes.map((seatNote, index) => <Text key={index}>{seatNote}</Text>)}
            </List>
          </View>
        ))}

        <Button onPress={onCancel}>
          <FormattedMessage id="ticket.passengerConfirmationModal.button.understand" />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  list: {
    marginTop: 20,
  },

  row: {
    marginBottom: 30,
  },

  seatBadge: {
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
});

export default SpecialSeatsModal;
