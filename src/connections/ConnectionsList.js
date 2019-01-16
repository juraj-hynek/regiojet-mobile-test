// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import moment from 'moment';
import React from 'react';

import { addGlobalMessage } from '../messages/actions';
import { dateFormat } from '../localization/localeData';
import { removeConnectionsMessage } from './actions';
import { theme } from '../style';
import ButtonLink from '../components/ButtonLink';
import Connection from './Connection';
import Date from '../components/Date';
import FormattedMessage from '../components/FormattedMessage';
import HeaderDay from './HeaderDay';
import LoaderSmall from '../components/LoaderSmall';
import type { ConnectionListType, Locale, SimpleRoute } from '../types';

type Props = {|
  addGlobalMessage: typeof addGlobalMessage,
  canMoveBackward: boolean,
  canMoveForward: boolean,
  handleMove: Function,
  isFetching: boolean,
  isFetchingMove: boolean,
  isToday?: boolean, // eslint-disable-line react/no-unused-prop-types
  locale: Locale,
  message: ?string,
  removeConnectionsMessage: typeof removeConnectionsMessage,
  setRouteRef: Function,
  simpleRoutes: ?Array<SimpleRoute>,
  tariffs: Array<string>,
  type: ConnectionListType,
|};

class ConnectionsList extends React.PureComponent<Props> {
  static COL_SIZES = [10, 5, 5];
  static COL_SIZES_WIDE = [10, 4, 5];

  componentDidMount() {
    this.showMessage();
  }

  componentDidUpdate() {
    this.showMessage();
  }

  showMessage() {
    const { addGlobalMessage, message, removeConnectionsMessage, type } = this.props;
    if (message) {
      addGlobalMessage({ text: message, type: 'warning' });
      removeConnectionsMessage(type);
    }
  }

  handleMoveBackward = () => this.props.handleMove(this.props.type, 'BACKWARD');

  handleMoveForward = () => this.props.handleMove(this.props.type, 'FORWARD');

  render() {
    const {
      canMoveBackward,
      canMoveForward,
      isFetching,
      isFetchingMove,
      locale,
      setRouteRef,
      simpleRoutes,
      tariffs,
      type,
    } = this.props;

    if (isFetching) {
      return <LoaderSmall />;
    }

    if (!simpleRoutes || !simpleRoutes.length) return null;

    const simpleRoutesByDepartureDays = groupBy(simpleRoutes, ({ departureTime }) =>
      moment.parseZone(departureTime).format('YYYY-MM-DD'),
    );

    // English time format produces way larger output than others
    // Layout tweaks are necessary to fit all the content
    const wideLayout = locale === 'en';
    const colSizes = wideLayout ? ConnectionsList.COL_SIZES_WIDE : ConnectionsList.COL_SIZES;
    const rowSchedulePadding = wideLayout ? styles.rowSchedulePaddingEn : styles.rowSchedulePadding;

    return (
      <View style={styles.container}>
        {canMoveBackward && (
          <ButtonLink
            iconRight="chevronUp"
            loading={isFetchingMove}
            onPress={this.handleMoveBackward}
            style={styles.move}
          >
            <FormattedMessage id="connections.button.previous" />
          </ButtonLink>
        )}

        {map(simpleRoutesByDepartureDays, (simpleRoutes, date) => (
          <View key={date}>
            <Date
              capitalizeFirst
              format={`dddd ${dateFormat}`}
              style={[theme.h3, styles.headerDate]}
            >
              {date}
            </Date>
            <HeaderDay colSizes={colSizes} rowSchedulePadding={rowSchedulePadding} />
            {simpleRoutes.map((route, index) => (
              <Connection
                colSizes={colSizes}
                isFirst={index === 0}
                isLast={index === simpleRoutes.length - 1}
                key={route.id}
                rowSchedulePadding={rowSchedulePadding}
                setRouteRef={setRouteRef}
                simpleRoute={route}
                tariffs={tariffs}
                type={type}
              />
            ))}
          </View>
        ))}

        {canMoveForward && (
          <ButtonLink
            iconRight="chevronDown"
            loading={isFetchingMove}
            onPress={this.handleMoveForward}
            style={styles.move}
          >
            <FormattedMessage id="connections.button.next" />
          </ButtonLink>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
  },

  headerDate: {
    marginTop: 20,
    marginHorizontal: 5,
  },

  move: {
    marginTop: 20,
  },

  rowSchedulePadding: {
    paddingRight: '25%',
  },

  rowSchedulePaddingEn: {
    paddingRight: '8%',
  },
});

export default connect(
  ({ connections, localization: { locale } }, { isToday, type }) => {
    const {
      canMoveBackward,
      canMoveForward,
      data,
      isFetching,
      isFetchingMove,
      message,
    } = connections[type];
    return {
      canMoveBackward: !isToday && canMoveBackward,
      canMoveForward,
      isFetching,
      isFetchingMove,
      locale,
      message,
      simpleRoutes: data,
    };
  },
  {
    addGlobalMessage,
    removeConnectionsMessage,
  },
)(ConnectionsList);
