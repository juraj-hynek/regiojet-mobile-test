// @flow
import { connect } from 'react-redux';
import { ScrollView, StyleSheet, View } from 'react-native';
import React from 'react';

import { colors, theme } from '../style';
import { getTickets } from './actions';
import { openPaymentModal } from '../modal/actions';
import FormattedMessage from '../components/FormattedMessage';
import Heading from '../components/Heading';
import HeadingProgressTab from '../components/HeadingProgressTab';
import ListHeader from './list/Header';
import LoaderSmall from '../components/LoaderSmall';
import Ticket from '../ticket/Ticket';
import TicketList from './TicketList';
import type { TicketListState } from './reducer';
import Warning from '../components/Warning';

type Props = {|
  getTickets: typeof getTickets,
  openPaymentModal: typeof openPaymentModal,
  showPaymentModal: boolean,
  tickets: TicketListState,
|};

class TicketPaymentScreen extends React.Component<Props> {
  static renderInScrollView(ScreenHeading, Content) {
    return (
      <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
        {ScreenHeading}
        {Content}
      </ScrollView>
    );
  }

  // eslint-disable-next-line react/sort-comp
  modalShown = false;

  componentDidMount() {
    this.props.getTickets('unpaid');
  }

  componentDidUpdate(prevProps: Props) {
    const { openPaymentModal, showPaymentModal, tickets } = this.props;

    if (
      !this.modalShown &&
      showPaymentModal &&
      prevProps.tickets.list.length === 0 &&
      tickets.list.length > 0
    ) {
      openPaymentModal(tickets.list);
      this.modalShown = true;
    }
  }

  render() {
    const { tickets } = this.props;
    const { error, isFetching, list } = tickets;

    const ScreenHeading = (
      <Heading messageId="header.title.payment">
        <HeadingProgressTab step={3} steps={3} />
      </Heading>
    );

    if (isFetching) {
      const Content = (
        <View style={theme.container}>
          <LoaderSmall />
        </View>
      );
      return TicketPaymentScreen.renderInScrollView(ScreenHeading, Content);
    }

    if (error) {
      const Content = <View>{/* TODO retry button */}</View>;
      return TicketPaymentScreen.renderInScrollView(ScreenHeading, Content);
    }

    if (list.length === 0) {
      const Content = (
        <View style={theme.container}>
          <Warning type="warning">
            <FormattedMessage id="summary.noTickets" />
          </Warning>
        </View>
      );
      return TicketPaymentScreen.renderInScrollView(ScreenHeading, Content);
    }

    if (list.length === 1) {
      return TicketPaymentScreen.renderInScrollView(
        ScreenHeading,
        <Ticket forPayment id={list[0].id} />,
      );
    }

    const Header = <ListHeader Heading={ScreenHeading} ticketsUnpaid={tickets} />;
    return (
      <View style={styles.container}>
        <TicketList Header={Header} listType="unpaid" tickets={tickets} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },

  contentContainer: {
    alignItems: 'stretch',
  },
});

export default connect(
  ({ tickets: { unpaid }, user: { user } }) => ({
    showPaymentModal: user.credit > 0,
    tickets: unpaid,
  }),
  {
    getTickets,
    openPaymentModal,
  },
)(TicketPaymentScreen);
