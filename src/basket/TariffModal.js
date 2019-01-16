// @flow
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import type { TariffNotifications } from '../types';

type Props = {
  onCancel: Function,
  tariffNotifications: TariffNotifications,
};

const TariffModal = ({ onCancel, tariffNotifications }: Props) => (
  <View style={theme.containerModal}>
    <Text style={theme.paragraph}>{tariffNotifications.description}</Text>
    <Text style={[theme.paragraph, theme.bold, styles.tariffs]}>
      {tariffNotifications.content.join('\n')}
    </Text>
    <Button onPress={onCancel}>
      <FormattedMessage id="basket.confirmationModal.button.understand" />
    </Button>
  </View>
);

const styles = StyleSheet.create({
  tariffs: {
    marginBottom: 30,
    marginTop: 20,
  },
});

export default TariffModal;
