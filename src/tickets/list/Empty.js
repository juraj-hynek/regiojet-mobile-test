// @flow
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '../../style';
import FormattedMessage from '../../components/FormattedMessage';
import LoaderSmall from '../../components/LoaderSmall';
import type { ErrorResponse } from '../../types';
import Warning from '../../components/Warning';

type Props = {
  error: ?ErrorResponse,
  isFetching: boolean,
  ticketCount: number,
};

const TicketListEmpty = ({ error, isFetching, ticketCount }: Props) => {
  if (!error && !isFetching && ticketCount) {
    return null;
  }

  return (
    <View style={[theme.container, styles.container]}>
      {isFetching && <LoaderSmall />}

      {error && <View>{/* TODO retry button */}</View>}

      {!error &&
        !isFetching &&
        !ticketCount && (
          <Warning type="warning">
            <FormattedMessage id="tickets.noTickets" />
          </Warning>
        )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
  },
});

export default TicketListEmpty;
