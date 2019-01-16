// @flow
import { Platform } from 'react-native';
import chunk from 'lodash/chunk';
import drop from 'lodash/drop';
import uniqBy from 'lodash/uniqBy';
import url from 'url';

import { getSeatClass, getVehicleStandard } from '../consts/helpers';
import type {
  PriceClass,
  MapRouteChunk,
  SeatClass,
  Section,
  Station,
  Tariff,
  TransferType,
  VehicleStandard,
} from '../types';

const GOOGLE_DIRECTIONS_WAYPOINT_LIMIT = 23;

export const getUniquePriceClasses = (priceClasses: Array<PriceClass>): Array<PriceClass> =>
  uniqBy(priceClasses, 'seatClassKey');

export const getUniquePriceClassesCount = (priceClasses: Array<PriceClass>): number =>
  getUniquePriceClasses(priceClasses).length;

export const getPriceClassesBySeatClass = (
  priceClasses: Array<PriceClass>,
  seatClassKey: string,
): Array<PriceClass> => priceClasses.filter(priceClass => priceClass.seatClassKey === seatClassKey);

export const getTariffCountsLabel = (tariffs: Array<string>, tariffList: Array<Tariff>): string => {
  const tariffCounts = tariffs.reduce(
    (tariffCounts, tariff) => ({
      ...tariffCounts,
      [tariff]: (tariffCounts[tariff] || 0) + 1,
    }),
    {},
  );
  const tariffCountsLabels = Object.keys(tariffCounts).map(tariffKey => {
    const result = tariffList.find(tariff => tariff.key === tariffKey);
    return result ? `${tariffCounts[tariffKey]}× ${result.value}` : '';
  });

  return tariffCountsLabels.join(', ');
};

export const composeMapRegion = (stations: Array<Station>) => {
  const latitudes = stations.map(station => station.latitude);
  const longitudes = stations.map(station => station.longitude);

  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const height = maxLatitude - minLatitude;

  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const width = maxLongitude - minLongitude;

  return {
    // small shift down because of marker height
    latitude: minLatitude + height / 2 + height * 0.08,
    longitude: minLongitude + width / 2,
    // make delta bigger so that map has some padding
    latitudeDelta: height * 1.35,
    longitudeDelta: width * 1.2,
  };
};

const getDestinationStationForChunk = (stations: Array<Station>, chunkIndex: number): Station => {
  const stationIndex = Math.min(
    stations.length - 1,
    (chunkIndex + 1) * (GOOGLE_DIRECTIONS_WAYPOINT_LIMIT + 1),
  );
  return stations[stationIndex];
};

export const composeMapRouteChunks = (stations: Array<Station>): Array<MapRouteChunk> => {
  const routeChunks = chunk(stations, GOOGLE_DIRECTIONS_WAYPOINT_LIMIT + 1);

  return routeChunks.map((routeChunk, index) => ({
    destination: getDestinationStationForChunk(stations, index),
    origin: routeChunk[0],
    waypoints: drop(routeChunk),
  }));
};

const composeNavigatorUrlApple = (
  arrivalStation: Station,
  departureStation: Station,
  transferType: TransferType,
): string => {
  const TRAVEL_MODES: { [type: TransferType]: 'w' | 'r' } = {
    WALKING: 'w',
    PUBLIC_TRANSPORT: 'r',
  };
  let parsedUrl;

  if (transferType === 'NONE') {
    parsedUrl = url.parse('https://maps.apple.com/');
    parsedUrl.query = {
      ll: `${departureStation.latitude},${departureStation.longitude}`,
      q: departureStation.name,
    };
  } else {
    parsedUrl = url.parse('https://maps.apple.com/');
    parsedUrl.query = {
      saddr: `${arrivalStation.latitude},${arrivalStation.longitude}`,
      daddr: `${departureStation.latitude},${departureStation.longitude}`,
      dirflg: TRAVEL_MODES[transferType],
    };
  }

  return parsedUrl;
};

const composeNavigatorUrlGoogle = (
  arrivalStation: Station,
  departureStation: Station,
  transferType: TransferType,
): string => {
  const TRAVEL_MODES: { [type: TransferType]: 'walking' | 'transit' } = {
    WALKING: 'walking',
    PUBLIC_TRANSPORT: 'transit',
  };
  let parsedUrl;

  if (transferType === 'NONE') {
    parsedUrl = url.parse('https://www.google.com/maps/search/');
    parsedUrl.query = {
      api: 1,
      query: `${departureStation.latitude},${departureStation.longitude}`,
    };
  } else {
    parsedUrl = url.parse('https://www.google.com/maps/dir/');
    parsedUrl.query = {
      api: 1,
      origin: `${arrivalStation.latitude},${arrivalStation.longitude}`,
      destination: `${departureStation.latitude},${departureStation.longitude}`,
      travelmode: TRAVEL_MODES[transferType],
      dir_action: 'navigate',
    };
  }

  return parsedUrl;
};

export const composeNavigatorUrl = (
  arrivalStation: Station,
  departureStation: Station,
  transferType: TransferType,
): string => {
  const parsedUrl =
    Platform.OS === 'ios'
      ? composeNavigatorUrlApple(arrivalStation, departureStation, transferType)
      : composeNavigatorUrlGoogle(arrivalStation, departureStation, transferType);

  return url.format(parsedUrl);
};

export const getSectionClassInfo = (
  section: Section,
  seatClassKey: string,
  seatClasses: Array<SeatClass>,
  vehicleStandards: Array<VehicleStandard>,
): ?SeatClass | ?VehicleStandard => {
  const seatClass = getSeatClass(seatClasses, seatClassKey);
  const vehicleStandard = getVehicleStandard(vehicleStandards, section.vehicleStandardKey);

  return section.vehicleType === 'BUS' || seatClassKey === 'NO'
    ? vehicleStandard || seatClass
    : seatClass || vehicleStandard;
};
