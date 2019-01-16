// @flow
import { connect } from 'react-redux';
import { ScrollView, StyleSheet, View } from 'react-native';
import React from 'react';

import { colors, theme } from '../style/index';
import { getPayments } from '../payments/actions';
import ButtonLink from '../components/ButtonLink';
import Filters, { type FiltersState } from './Filters';
import FormattedMessage from '../components/FormattedMessage';
import Heading from '../components/Heading';
import Icon from '../components/Icon';
import LoaderSmall from '../components/LoaderSmall';
import PaymentItem from './PaymentItem';
import Price from '../components/Price';
import TouchableOpacity from '../components/TouchableOpacity';
import type { ErrorResponse, Transaction, User } from '../types';

type Props = {|
  error: ?ErrorResponse,
  getPayments: Function,
  isFetching?: boolean,
  isFetchingMore?: boolean,
  payments: Array<Transaction>,
  total: number,
  user: User,
|};

type State = {
  filters: FiltersState,
  showFilters: boolean,
};

class PaymentListScreen extends React.Component<Props, State> {
  state = {
    filters: {
      dateFrom: undefined,
      dateTo: undefined,
      showCredit: true,
      showDirect: true,
    },
    showFilters: false,
  };

  componentDidMount() {
    this.getPayments();
  }

  getPayments = (more: boolean = false) => {
    const {
      filters: { dateFrom, dateTo, showCredit, showDirect },
    } = this.state;

    this.setState({ showFilters: false }, () => {
      this.props.getPayments(
        {
          dateFrom: dateFrom ? dateFrom.toDate() : undefined,
          dateTo: dateTo ? dateTo.toDate() : undefined,
          type: [showCredit && 'CREDIT', showDirect && 'DIRECT'].filter(type => type),
        },
        more,
      );
    });
  };

  handleLoadMore = () => this.getPayments(true);

  handleFilter = (filters: FiltersState) => {
    this.setState({ filters }, this.getPayments);
  };

  toggleShowFilters = () => {
    this.setState(prevState => ({ showFilters: !prevState.showFilters }));
  };

  renderPayments() {
    const { error, isFetching, payments } = this.props;

    if (isFetching) {
      return <LoaderSmall />;
    }

    if (error) {
      return <View>{/* TODO retry button */}</View>;
    }

    if (!payments.length) {
      return <FormattedMessage id="payments.empty" style={theme.paragraph} />;
    }

    return payments.map(payment => <PaymentItem key={payment.paymentId} payment={payment} />);
  }

  render() {
    const { isFetchingMore, payments, total, user } = this.props;
    const { filters, showFilters } = this.state;
    const hasMore = total > payments.length;

    if (user.isFetching) {
      return <LoaderSmall />;
    }

    return (
      <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
        <Heading messageId="header.title.payments">
          <View style={styles.currentCreditContainer}>
            <FormattedMessage
              id="payments.userCredit"
              style={[theme.paragraphSmall, styles.white]}
              textAfter=": "
            />
            <Price
              style={[theme.paragraphSmall, theme.semiBold, styles.white]}
              value={user.credit}
            />
          </View>
        </Heading>

        <TouchableOpacity
          onPress={this.toggleShowFilters}
          style={[styles.filterButton, showFilters && styles.filterButtonOpen]}
        >
          <View style={styles.filterIconWithText}>
            <Icon
              color={colors.black}
              height={24}
              name="filter"
              style={styles.filterIcon}
              width={18}
            />
            <FormattedMessage id="payments.filter" style={[theme.paragraph, theme.semiBold]} />
          </View>
          <Icon
            color={colors.red}
            height={24}
            name={showFilters ? 'chevronUp' : 'chevronDown'}
            width={15}
          />
        </TouchableOpacity>
        {showFilters && (
          <Filters
            defaultFilters={filters}
            onSubmit={this.handleFilter}
            showPaymentTypes={user.creditPrice}
          />
        )}
        <View style={[theme.container, styles.container]}>
          {this.renderPayments()}

          {hasMore && (
            <ButtonLink
              iconLeft="chevronDown"
              loading={isFetchingMore}
              onPress={this.handleLoadMore}
              style={styles.marginTop}
            >
              <FormattedMessage id="payments.action.loadMore" />
            </ButtonLink>
          )}
        </View>
      </ScrollView>
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

  currentCreditContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },

  white: {
    color: colors.white,
  },

  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.greyShadow,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 20,
  },

  filterButtonOpen: {
    borderTopColor: colors.yellow,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderTopWidth: 10,
    marginTop: -9,
  },

  filterIcon: {
    marginRight: 10,
  },

  filterIconWithText: {
    flexDirection: 'row',
  },

  marginTop: {
    marginTop: 20,
  },
});

export default connect(
  ({ payments, user }) => ({
    error: payments.error,
    isFetching: payments.isFetching,
    isFetchingMore: payments.isFetchingMore,
    payments: payments.list,
    total: payments.total,
    user: user.user,
  }),
  {
    getPayments,
  },
)(PaymentListScreen);
