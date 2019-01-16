// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { colors } from '../style';
import { getTickets } from './actions';
import Heading from '../components/Heading';
import ListFooter from './list/Footer';
import ListHeader from './list/Header';
import TicketList from './TicketList';
import type { TicketListState } from './reducer';

type Props = {
  getTickets: Function,
  needsRefetch: boolean,
  ticketsNew: TicketListState,
  ticketsOld: TicketListState,
  ticketsUnpaid: TicketListState,
};

type State = {
  selectedIndex: number,
};

class TicketsScreen extends React.Component<Props, State> {
  state = {
    selectedIndex: 0,
  };

  componentDidMount() {
    this.fetchTickets(0);
    this.fetchTickets(1);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!this.props.needsRefetch && nextProps.needsRefetch) {
      this.fetchTickets(this.state.selectedIndex);
    }
  }

  getSelectedTabTickets() {
    return this.state.selectedIndex === 0 ? this.props.ticketsNew : this.props.ticketsOld;
  }

  getSelectedTabListType() {
    return this.state.selectedIndex === 0 ? 'new' : 'old';
  }

  fetchTickets(selectedIndex: number) {
    if (selectedIndex === 0) {
      this.props.getTickets('new');
      this.props.getTickets('unpaid');
    } else {
      this.props.getTickets('old');
    }
  }

  handleMorePress = () => {
    const ticketType = this.state.selectedIndex === 0 ? 'new' : 'old';
    this.props.getTickets(ticketType, true);
  };

  handleTabPress = selectedIndex => {
    this.setState({ selectedIndex });
  };

  render() {
    const tickets = this.getSelectedTabTickets();
    const { isFetchingMore, list, total } = tickets;
    const { ticketsUnpaid } = this.props;
    const { selectedIndex } = this.state;

    const hasMore = total > list.length;

    const Footer = (
      <ListFooter
        hasMore={hasMore}
        isFetching={isFetchingMore}
        onMorePress={this.handleMorePress}
      />
    );
    const Header = (
      <ListHeader
        Heading={<Heading messageId="header.title.tickets" />}
        onPress={this.handleTabPress}
        selectedIndex={selectedIndex}
        ticketsUnpaid={ticketsUnpaid}
      />
    );

    return (
      <View style={styles.container}>
        <TicketList
          Footer={Footer}
          Header={Header}
          listType={this.getSelectedTabListType()}
          tickets={tickets}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    alignItems: 'stretch',
    flex: 1,
  },
});

export default connect(
  ({ tickets: { needsRefetch, new: ticketsNew, old: ticketsOld, unpaid: ticketsUnpaid } }) => ({
    needsRefetch,
    ticketsNew,
    ticketsOld,
    ticketsUnpaid,
  }),
  {
    getTickets,
  },
)(TicketsScreen);
