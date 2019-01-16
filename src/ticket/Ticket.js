// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import React, { Fragment } from 'react';

import { computeMinutesFromTimePeriod } from '../helpers/time';
import { getTicket } from './actions';
import { isTicketStateValid } from '../tickets/TicketState';
import { theme } from '../style';
import Addons from '../reservation/Addons';
import Bills from './Bills';
import CodeDiscount from './CodeDiscount';
import Conditions from '../reservation/Conditions';
import ConnectionInfo from '../connections/details/ConnectionInfo';
import CustomerNotifications from '../reservation/CustomerNotifications';
import FormattedMessage from '../components/FormattedMessage';
import LoaderSmall from '../components/LoaderSmall';
import PassengersInfo from './PassengersInfo';
import PercentualDiscounts from './PercentualDiscounts';
import TicketButtons from './TicketButtons';
import TicketHeader from './TicketHeader';
import type { ErrorResponse, Ticket as TicketType } from '../types';

type Props = {|
  error: ?ErrorResponse,
  forPayment?: boolean,
  getTicket: Function,
  id: number,
  isFetching: boolean,
  needsRefetch: boolean,
  ticket: TicketType,
|};

class Ticket extends React.Component<Props> {
  componentDidMount() {
    this.props.getTicket(this.props.id);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!this.props.needsRefetch && nextProps.needsRefetch) {
      this.props.getTicket(this.props.id);
    }
  }

  composeGroupedAddons() {
    const groupedAddons: Array<any> = Object.values(
      groupBy(this.props.ticket.outboundAddons, addon => addon.id),
    );
    return groupedAddons.map(group => ({ ...group[0], count: group.length }));
  }

  composeRouteSections() {
    return this.props.ticket.outboundRouteSections.map(section => section.section);
  }

  composeSelectedSeats() {
    return this.props.ticket.outboundRouteSections.map(section => section.selectedSeats);
  }

  render() {
    const { error, forPayment, isFetching, ticket } = this.props;

    if (isFetching) {
      return (
        <View style={theme.container}>
          <LoaderSmall />
        </View>
      );
    }

    if (error) {
      return <View style={theme.container}>{/* TODO retry button */}</View>;
    }

    if (!ticket) {
      return null;
    }

    const showSeatsAndTariffs = isTicketStateValid(ticket.state);
    const disabledConditionTypes =
      ticket.customerActions.pay && ticket.state === 'UNPAID' ? [] : ['expiration'];
    const expiration = computeMinutesFromTimePeriod(ticket.expirateAt);
    const groupedAddons = this.composeGroupedAddons();
    const showAddons = ticket.customerActions.additionalServices || groupedAddons.length > 0;

    return (
      <Fragment>
        {expiration > 0 && (
          <FormattedMessage
            id="ticket.message.thankYou"
            style={[theme.container, theme.paragraph, styles.thankYouNote]}
            values={{
              status: <FormattedMessage id="ticket.message.thankYou.status" style={theme.bold} />,
              minutes: expiration,
            }}
          />
        )}

        <TicketHeader forPayment={forPayment} ticket={ticket} />

        <View style={styles.container}>
          <FormattedMessage id="reservation.connectionInformation" style={theme.h2} />
          <ConnectionInfo
            seatClassKey={ticket.seatClassKey}
            sections={this.composeRouteSections()}
            selectedSeats={this.composeSelectedSeats()}
            showDate
            showSeatsAndTariffs={showSeatsAndTariffs}
            transfersInfo={ticket.transfersInfo}
          />
        </View>
        <CustomerNotifications notifications={ticket.customerNotifications} />
        <Conditions conditions={ticket.conditions} disabledTypes={disabledConditionTypes} />
        {showAddons && (
          <Addons
            routeAddons={groupedAddons}
            showEditButton={ticket.customerActions.additionalServices}
          />
        )}
        <PassengersInfo ticket={ticket} />
        {ticket.usedCodeDiscount && <CodeDiscount discount={ticket.usedCodeDiscount} />}
        {get(ticket, 'usedPercentualDiscounts.length') > 0 && (
          <PercentualDiscounts discounts={ticket.usedPercentualDiscounts} />
        )}
        <Bills bills={ticket.bills} />

        <TicketButtons
          actions={ticket.customerActions}
          style={styles.container}
          ticket={ticket}
          unpaidAmount={ticket.unpaid}
        />
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },

  thankYouNote: {
    paddingBottom: 0,
    textAlign: 'center',
  },
});

export default connect(
  ({
    ticket: {
      ticket: { data, error, isFetching, needsRefetch },
    },
  }) => ({
    error,
    isFetching,
    needsRefetch,
    ticket: data,
  }),
  { getTicket },
)(Ticket);
