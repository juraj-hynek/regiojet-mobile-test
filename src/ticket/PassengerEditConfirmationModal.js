// @flow
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';

type Props = {
  amount: number,
  onCancel: Function,
};

const PassengerEditConfirmationModal = ({ amount, onCancel }: Props) => (
  <View style={theme.containerModal}>
    <FormattedMessage
      id="ticket.passengerConfirmationModal.text"
      style={[theme.paragraph, styles.marginBottom]}
      values={{ amount: <Price style={theme.bold} value={amount} /> }}
    />
    <Button onPress={onCancel}>
      <FormattedMessage id="ticket.passengerConfirmationModal.button.understand" />
    </Button>
  </View>
);

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: 30,
  },
});

export default PassengerEditConfirmationModal;
