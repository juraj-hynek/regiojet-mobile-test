// @flow
import { connect } from 'react-redux';
import { ScrollView, StyleSheet, View } from 'react-native';
import moment from 'moment';
import React, { Fragment } from 'react';

import { colors, theme } from '../style';
import { getConnections } from './actions';
import { scrollToElement } from '../components/scrollToElement';
import ConnectionsList from './ConnectionsList';
import Direction from '../components/Direction';
import FloatingBasket from '../basket/FloatingBasket';
import FormattedMessage from '../components/FormattedMessage';
import Heading from '../components/Heading';
import HeadingProgressTab from '../components/HeadingProgressTab';
import HeadingTariffs from './HeadingTariffs';
import InfoBubbles from './InfoBubbles';
import ReturnForm from './ReturnForm';
import Tabs from '../components/Tabs';
import type {
  BannerBubble,
  City,
  ConnectionListType,
  Currency,
  ListStation,
  RoutesSearchData,
  RoutesSearchMove,
  TextBubble,
} from '../types';

type Props = {
  bannerBubbles: Array<BannerBubble>,
  cityFrom: ?City,
  cityTo: ?City,
  currency: Currency,
  getConnections: typeof getConnections,
  navigation: {
    state: {
      params: {
        outboundDate: moment,
        showReturnForm: boolean,
        stationTo: ListStation,
        stationFrom: ListStation,
        tariffs: Array<string>,
      },
    },
  },
  returnDate: ?moment,
  textBubbles: Array<TextBubble>,
};

class ConnectionsScreen extends React.Component<Props> {
  // eslint-disable-next-line react/sort-comp
  refScroll = null;
  refChild = null;

  componentDidMount() {
    this.getConnectionsAll();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.currency !== prevProps.currency) {
      this.getConnectionsAll();
    }
  }

  getConnectionsAll() {
    this.getConnectionsByType('outbound');
    if (this.props.returnDate) {
      this.getConnectionsByType('return');
    }
  }

  fetchConnections = (
    departureDate: moment,
    listType: ConnectionListType,
    move?: RoutesSearchMove,
  ) => {
    const { getConnections, navigation } = this.props;
    const { stationFrom, stationTo, tariffs } = navigation.state.params;

    const from = listType === 'outbound' ? stationFrom : stationTo;
    const to = listType === 'outbound' ? stationTo : stationFrom;

    const payload: RoutesSearchData = {
      departureDate: departureDate.format('YYYY-MM-DD'),
      fromLocationId: from.id,
      fromLocationType: from.type,
      tariffs,
      toLocationId: to.id,
      toLocationType: to.type,
    };

    getConnections(payload, listType, move);
  };

  getConnectionsByType = (listType: ConnectionListType, move?: RoutesSearchMove) => {
    const { navigation, returnDate } = this.props;
    const { outboundDate } = navigation.state.params;

    if (listType === 'return') {
      if (!returnDate) {
        throw new Error(
          `getConnectionsByType('return', ${move || 'undefined'}) called without returnDate`,
        );
      }
      return this.fetchConnections(returnDate, listType, move);
    }
    return this.fetchConnections(outboundDate, listType, move);
  };

  handleContentSizeChange = (width: number, height: number) => {
    if (this.refChild && height && this.refScroll) {
      scrollToElement(this.refScroll, { containerHeight: height })(this.refChild);
      this.refChild = null;
    }
  };

  setScrollViewRef = ref => {
    this.refScroll = ref;
  };

  setRouteRef = refChild => {
    this.refChild = refChild;
  };

  renderDirection(reverse: boolean = false) {
    const { cityFrom, cityTo } = this.props;
    if (!cityFrom || !cityTo) return null;

    return (
      <Direction
        from={reverse ? cityTo.name : cityFrom.name}
        style={styles.direction}
        textStyle={theme.bold}
        to={reverse ? cityFrom.name : cityTo.name}
      />
    );
  }

  render() {
    const { bannerBubbles, navigation, returnDate, textBubbles } = this.props;
    const { outboundDate, showReturnForm, tariffs } = navigation.state.params;
    const today = moment();

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          onContentSizeChange={this.handleContentSizeChange}
          ref={this.setScrollViewRef}
          style={styles.content}
        >
          <Heading messageId="header.title.connectionSelect">
            <HeadingProgressTab step={1} steps={3} />
            {/* $FlowFixMe */}
            <HeadingTariffs tariffs={tariffs} />
          </Heading>
          <InfoBubbles bannerBubbles={bannerBubbles} textBubbles={textBubbles} />
          <Tabs
            headers={[
              <FormattedMessage
                id="connections.there"
                style={[theme.paragraphSmall, theme.semiBold]}
                uppercase
              />,
              <FormattedMessage
                id="connections.back"
                style={[theme.paragraphSmall, theme.semiBold]}
                uppercase
              />,
            ]}
            style={styles.tabs}
          >
            <Fragment>
              {this.renderDirection()}
              <ConnectionsList
                handleMove={this.getConnectionsByType}
                isToday={today.isSame(outboundDate, 'day')}
                setRouteRef={this.setRouteRef}
                tariffs={tariffs}
                type="outbound"
              />
            </Fragment>
            <Fragment>
              {this.renderDirection(true)}
              {!showReturnForm && (
                <ReturnForm handleSubmit={this.fetchConnections} minDate={outboundDate} />
              )}
              <ConnectionsList
                handleMove={this.getConnectionsByType}
                isToday={!!(returnDate && today.isSame(returnDate, 'day'))}
                setRouteRef={this.setRouteRef}
                tariffs={tariffs}
                type="return"
              />
            </Fragment>
          </Tabs>
        </ScrollView>
        <FloatingBasket />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    backgroundColor: colors.white,
  },

  contentContainer: {
    paddingBottom: 30,
  },

  direction: {
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },

  tabs: {
    marginTop: 20,
  },
});

export default connect(
  (
    {
      connections: { bannerBubbles, returnDate, textBubbles },
      consts: { cities },
      localization: { currency },
    },
    {
      navigation: {
        state: { params },
      },
    },
  ) => {
    const cityFrom = cities[params.stationFrom.cityId];
    const cityTo = cities[params.stationTo.cityId];

    return {
      bannerBubbles,
      cityFrom,
      cityTo,
      currency,
      returnDate,
      textBubbles,
    };
  },
  { getConnections },
)(ConnectionsScreen);
