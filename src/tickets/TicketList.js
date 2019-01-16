// @flow
import { connect } from 'react-redux';
import { SectionList, StyleSheet, View } from 'react-native';
import groupBy from 'lodash/groupBy';
import moment from 'moment';
import React, { type Element } from 'react';

import { addGlobalError } from '../messages/actions';
import { colors, theme } from '../style';
import { dateFormat } from '../localization/localeData';
import { removeTicketListError } from './actions';
import Badge from '../components/Badge';
import Date from '../components/Date';
import FormattedMessage from '../components/FormattedMessage';
import ListEmpty from './list/Empty';
import ListFooter from './list/Footer';
import ListHeader from './list/Header';
import Ticket from './Ticket';
import type { Ticket as TicketType, TicketListType } from '../types';
import type { TicketListState } from './reducer';

type Props = {|
  addGlobalError: typeof addGlobalError,
  Footer?: Element<typeof ListFooter>,
  Header: Element<typeof ListHeader>,
  listType: TicketListType,
  removeTicketListError: typeof removeTicketListError,
  tickets: TicketListState,
|};

class TicketList extends React.Component<Props> {
  componentDidMount() {
    this.showError();
  }

  componentDidUpdate() {
    this.showError();
  }

  groupTicketsByDay() {
    const groupedTickets = groupBy(this.props.tickets.list, ticket =>
      moment.parseZone(ticket.outboundRouteSections[0].section.departureTime).format('YYYY-MM-DD'),
    );

    return Object.keys(groupedTickets).map(departureDate => {
      const lastTicketIndex = groupedTickets[departureDate].length - 1;

      return {
        departureDate,
        data: groupedTickets[departureDate].map((ticket, index) => ({
          ...ticket,
          isLast: lastTicketIndex === index,
        })),
      };
    });
  }

  showError() {
    const { addGlobalError, listType, removeTicketListError, tickets } = this.props;
    const { globalError } = tickets;

    if (globalError) {
      addGlobalError(globalError);
      removeTicketListError(listType);
    }
  }

  ticketKeyExtractor = (item: TicketType) => item.id.toString();

  render() {
    const { Footer, Header, tickets } = this.props;
    const { error, isFetching, list } = tickets;

    const hasTickets = !error && !isFetching && list.length > 0;
    const isToday = date => date === moment.parseZone().format('YYYY-MM-DD');

    const groupedTickets = hasTickets ? this.groupTicketsByDay() : [];

    return (
      <SectionList
        keyExtractor={this.ticketKeyExtractor}
        ListEmptyComponent={
          <ListEmpty error={error} isFetching={isFetching} ticketCount={list.length} />
        }
        ListFooterComponent={Footer}
        ListHeaderComponent={Header}
        renderItem={({ item }) => (
          <View style={[styles.ticket, item.isLast && styles.ticketLast]}>
            <Ticket ticket={item} />
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.headerDate}>
            <Date capitalizeFirst format={`dddd ${dateFormat}`} style={[theme.h3, styles.h3]}>
              {section.departureDate}
            </Date>
            {isToday(section.departureDate) && (
              <Badge style={styles.today}>
                <FormattedMessage id="tickets.today" />
              </Badge>
            )}
          </View>
        )}
        sections={groupedTickets}
        stickySectionHeadersEnabled
      />
    );
  }
}

const styles = StyleSheet.create({
  headerDate: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    padding: 10,
  },

  h3: {
    marginBottom: 0,
  },

  today: {
    marginLeft: 10,
  },

  ticket: {
    marginHorizontal: 10,
    marginVertical: 5,
  },

  ticketLast: {
    marginBottom: 30,
  },
});

export default connect(null, { addGlobalError, removeTicketListError })(TicketList);
