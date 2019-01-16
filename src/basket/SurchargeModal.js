// @flow
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import type { Surcharge } from '../types';

type Props = {
  onCancel: Function,
  onDone: Function,
  surcharge: Surcharge,
};

const SurchargeModal = ({ onCancel, onDone, surcharge }: Props) => (
  <View style={theme.containerModal}>
    <Text style={[theme.paragraph, styles.marginBottom]}>{surcharge.notification}</Text>
    <Button onPress={onDone} style={styles.button}>
      <FormattedMessage id="basket.confirmationModal.button.yes" />
    </Button>
    <Button onPress={onCancel} secondary>
      <FormattedMessage id="basket.confirmationModal.button.no" />
    </Button>
  </View>
);

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: 30,
  },

  button: {
    marginBottom: 20,
  },
});

export default SurchargeModal;
