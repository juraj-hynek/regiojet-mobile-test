// @flow
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import get from 'lodash/get';

import { colors } from '../style';
import Heading from '../components/Heading';
import Ticket from './Ticket';

type Props = {
  navigation: { state: { params: { ticketId: number } } },
};

const TicketScreen = ({ navigation }: Props) => {
  const ticketId = get(navigation, 'state.params.ticketId');

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
      <Heading messageId="header.title.ticket" />
      <Ticket id={ticketId} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },

  contentContainer: {
    alignItems: 'stretch',
  },
});

export default TicketScreen;
