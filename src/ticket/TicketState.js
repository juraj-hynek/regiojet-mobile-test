// @flow
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { colors, theme } from '../style';
import { getTicketStateMessageId } from '../tickets/TicketState';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';
import Triangle from '../components/Triangle';
import type { Style, TicketState as TicketStateType } from '../types';

type Props = {
  state: TicketStateType,
  style?: Style,
};

const ticketStateColors = {
  TO_BE_EXPIRED: colors.yellow,
  UNPAID: colors.yellow,
  USED: colors.green,
  VALID: colors.green,
};

const getTicketStateColor = (state: string) => ticketStateColors[state] || colors.grey;

const getIconName = (state: string) =>
  Object.keys(ticketStateColors).includes(state) ? 'check' : 'crossLight';

const TRIANGLE_WIDTH = 20;

const TicketState = ({ state, style }: Props) => {
  const messageId = `ticket.status.${getTicketStateMessageId(state)}`;
  const iconName = getIconName(state);
  const backgroundColor = getTicketStateColor(state);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.stateContainer, { backgroundColor }]}>
        <Icon color={colors.white} name={iconName} width={30} />
        <FormattedMessage id={messageId} style={[theme.h3, theme.bold, styles.state]} />
      </View>
      <Triangle
        color={backgroundColor}
        height={43}
        type="leftTop"
        width={TRIANGLE_WIDTH}
        style={styles.triangle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    overflow: 'hidden',
    paddingRight: TRIANGLE_WIDTH,
  },

  stateContainer: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    paddingLeft: 30,
    paddingRight: 20,
    paddingVertical: 5,
  },

  state: {
    color: colors.white,
    marginBottom: 0,
    marginLeft: 10,
  },

  triangle: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default TicketState;
