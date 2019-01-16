// @flow
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import PassengerInfo from './PassengerInfo';
import type { Ticket } from '../types';

type Props = {|
  ticket: Ticket,
|};

const PassengersInfo = ({ ticket }: Props) => {
  const { customerActions, passengersInfo } = ticket;
  const isLastPassenger = passengersInfo.passengers.length === 1;
  const canCancel = !isLastPassenger && ticket.state === 'UNPAID' && customerActions.cancel;
  const canStorno = !isLastPassenger && ticket.state === 'VALID' && customerActions.storno;
  const canEdit = customerActions.editPassengers;

  return (
    <View style={styles.container}>
      <FormattedMessage id="ticket.passengerInfo.heading" style={theme.h2} />

      <View style={styles.passengers}>
        {passengersInfo.passengers.map((passenger, index) => (
          <PassengerInfo
            canCancel={canCancel}
            canEdit={canEdit}
            canStorno={canStorno}
            changeCharge={passengersInfo.changeCharge}
            key={passenger.id}
            passenger={passenger}
            requiredFields={
              index === 0 ? passengersInfo.firstPassengerData : passengersInfo.otherPassengersData
            }
            style={styles.passenger}
            ticket={ticket}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },

  passenger: {
    marginVertical: 5,
  },

  passengers: {
    marginVertical: -5,
  },
});

export default PassengersInfo;
