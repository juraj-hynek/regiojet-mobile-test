// @flow
import React from 'react';

import Heading from '../components/Heading';
import LayoutScrollable from '../components/LayoutScrollable';
import Rating from './Rating';

type Props = {
  navigation: { state: { params: { ticketId: number } } },
};

const TicketRatingScreen = ({
  navigation: {
    state: {
      params: { ticketId },
    },
  },
}: Props) => (
  <LayoutScrollable>
    <Heading messageId="header.title.review" />
    <Rating ticketId={ticketId} />
  </LayoutScrollable>
);

export default TicketRatingScreen;
