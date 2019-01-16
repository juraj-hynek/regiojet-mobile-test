// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import compact from 'lodash/compact';
import get from 'lodash/get';
import MapView, { Marker, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import React, { Fragment } from 'react';

import { colors, composeFontStyle, theme } from '../style';
import { composeMapRegion, composeMapRouteChunks } from './helpers';
import { getConfig } from '../services/config';
import { getTimetable } from '../consts/actions';
import Direction from '../components/Direction';
import FormattedMessage from '../components/FormattedMessage';
import LineDetailRow, { gridStyles } from './LineDetailRow';
import LoaderSmall from '../components/LoaderSmall';
import type { DetailStation, Section, StationMap, Timetable } from '../types';

const GOOGLE_MAP_API_KEY = getConfig('GOOGLE_MAP_API_KEY');

type Props = {
  getTimetable: typeof getTimetable,
  isFetching: boolean,
  routeSection: Section,
  stations: StationMap,
  timetable: Timetable,
};

class LineDetailModal extends React.PureComponent<Props> {
  componentDidMount() {
    this.props.getTimetable(this.props.routeSection.line.id);
  }

  composeDetailStations(): Array<DetailStation> {
    const { routeSection, stations, timetable } = this.props;
    let activeFlag = false;

    return timetable.stations.map((timetableStation, index) => {
      const isFirst = index === 0;
      const isLast = index === timetable.stations.length - 1;
      const isFirstActive = timetableStation.stationId === routeSection.departureStationId;
      const isLastActive = timetableStation.stationId === routeSection.arrivalStationId;

      if (isFirstActive) activeFlag = true;
      if (isLastActive) activeFlag = false;

      const showCircle = isFirst || isLast || isFirstActive || isLastActive;
      const isActive = isFirstActive || isLastActive || activeFlag;

      return {
        isActive,
        isLastActive,
        isLast,
        showCircle,
        station: get(stations, timetableStation.stationId),
        timetableStation,
      };
    });
  }

  render() {
    const { isFetching, routeSection, timetable } = this.props;

    if (isFetching) {
      return <LoaderSmall />;
    }

    if (!timetable) {
      return null;
    }

    const timetableHeadingStyles = [styles.timetableHeading, theme.bold];
    const detailStations = this.composeDetailStations();
    const stations = compact(detailStations.map(detailStation => detailStation.station));
    const mapRegion = composeMapRegion(stations);
    const mapRouteChunks = composeMapRouteChunks(stations);

    return (
      <View style={[theme.containerModal, styles.container]}>
        <Direction
          from={
            <Text>
              <FormattedMessage id="connections.detailModal.line" />: {routeSection.line.from}
            </Text>
          }
          textStyle={theme.bold}
          to={`${routeSection.line.to}${
            routeSection.line.code ? ` (${routeSection.line.code})` : ''
          }`}
        />

        <View style={styles.timetable}>
          <View style={styles.timetableHeadings}>
            <View style={gridStyles.line} />
            <View style={gridStyles.station}>
              <FormattedMessage
                id="connections.detailModal.station"
                style={timetableHeadingStyles}
                uppercase
              />
            </View>
            <View style={gridStyles.time}>
              <FormattedMessage
                id="connections.detailModal.arrival"
                style={timetableHeadingStyles}
                uppercase
              />
            </View>
            <View style={gridStyles.time}>
              <FormattedMessage
                id="connections.detailModal.departure"
                style={timetableHeadingStyles}
                uppercase
              />
            </View>
          </View>

          {detailStations.map(detailStation => (
            <LineDetailRow key={detailStation.timetableStation.stationId} station={detailStation} />
          ))}
        </View>

        <MapView region={mapRegion} style={styles.map}>
          {/* Directions API can't work with trains properly
            => just connect stations with a polyline */}
          {routeSection.vehicleType === 'TRAIN' ? (
            <Polyline
              coordinates={stations.map(({ latitude, longitude }) => ({ latitude, longitude }))}
              strokeWidth={3}
              strokeColor={colors.blue}
            />
          ) : (
            <Fragment>
              {mapRouteChunks.map((mapRouteChunk, index) => (
                <MapViewDirections
                  apikey={GOOGLE_MAP_API_KEY}
                  destination={mapRouteChunk.destination}
                  key={index} // eslint-disable-line react/no-array-index-key
                  origin={mapRouteChunk.origin}
                  strokeColor={colors.blue}
                  strokeWidth={3}
                  waypoints={mapRouteChunk.waypoints}
                />
              ))}
            </Fragment>
          )}
          {stations.map(station => (
            <Marker
              coordinate={{ latitude: station.latitude, longitude: station.longitude }}
              key={station.id}
              title={station.fullname}
            />
          ))}
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },

  map: {
    height: 240,
    marginHorizontal: -10,
  },

  timetable: {
    marginVertical: 20,
  },

  timetableHeading: {
    ...composeFontStyle(12),
    color: colors.grey,
  },

  timetableHeadings: {
    flexDirection: 'row',
    marginBottom: 10,
  },
});

export default connect(
  ({
    consts: {
      stations,
      timetable: { isFetching, data },
    },
  }) => ({
    isFetching,
    stations,
    timetable: data,
  }),
  {
    getTimetable,
  },
)(LineDetailModal);
