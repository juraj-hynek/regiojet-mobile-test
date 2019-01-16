// @flow
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import * as validation from '../components/form/validation';
import FormattedMessage from '../components/FormattedMessage';
import Passenger from './Passenger';
import type { PassengersDataResponse, RoutePassenger } from '../types';

type Props = {|
  basketItemId: string,
  onBlur: Function,
  passengersData: PassengersDataResponse,
  passengerValues: Array<RoutePassenger>,
  tariffs: Array<string>,
  validationResults: validation.ValidationResults<*>,
|};

const Passengers = ({
  basketItemId,
  onBlur,
  passengersData,
  passengerValues,
  tariffs,
  validationResults,
}: Props) => (
  <View style={styles.container}>
    <FormattedMessage id="reservation.passengerData.title" style={theme.h2} />
    <FormattedMessage id="reservation.passengerData.description" style={theme.paragraph} />

    {tariffs.map((tariff, index) => (
      <Passenger
        basketItemId={basketItemId}
        index={index}
        key={index} // eslint-disable-line react/no-array-index-key
        onBlur={onBlur}
        passengerValues={passengerValues}
        requiredFields={
          index === 0 ? passengersData.firstPassengerData : passengersData.otherPassengersData
        }
        tariff={tariff}
        validationResults={validationResults}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },
});

export default Passengers;
