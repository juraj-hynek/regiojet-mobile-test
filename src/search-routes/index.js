// @flow
import { AsyncStorage } from 'react-native';
import cloneDeep from 'lodash/cloneDeep';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import uniqWith from 'lodash/uniqWith';

import { anyWordBeginsWith, comparatorLocale, removeDiacritics } from './helpers';
import type {
  City,
  CityMap,
  Country,
  LastSearch,
  ListStation,
  Locale,
  Station,
  StationMap,
} from '../types';

const filterStation = (station: Station, query: string): boolean =>
  removeDiacritics(station.fullname)
    .toLowerCase()
    .indexOf(query) !== -1 ||
  removeDiacritics(station.aliases.toString())
    .toLowerCase()
    .indexOf(query) !== -1;

const filterCity = (city: City, query: string): boolean => {
  // eslint-disable-next-line no-param-reassign
  city.hasMultipleStations = city.stations.length > 1;

  if (
    removeDiacritics(city.name)
      .toLowerCase()
      .indexOf(query) !== -1 ||
    removeDiacritics(city.aliases.toString())
      .toLowerCase()
      .indexOf(query) !== -1
  ) {
    return true;
  }

  // eslint-disable-next-line no-param-reassign
  city.stations = city.stations.filter(station => filterStation(station, query));
  return city.stations.length > 0;
};

const filterCountry = (country: Country, query: string): boolean => {
  if (
    removeDiacritics(country.country)
      .toLowerCase()
      .indexOf(query) !== -1
  ) {
    return true;
  }

  // eslint-disable-next-line no-param-reassign
  country.cities = country.cities.filter(city => filterCity(city, query));
  return country.cities.length > 0;
};

/**
 * Map results to a one-dimensional array
 * Best matches are moved to the beginning
 */
const createStationList = (countries: Array<Country>, query: string): Array<ListStation> => {
  const bestMatches = [];
  const otherMatches = [];

  countries.forEach(country => {
    country.cities.forEach(city => {
      const newStations = [];

      const displayCity = !city.hasMultipleStations || city.stations.length > 1;

      newStations.push({
        cityId: city.id,
        countryCode: country.code,
        id: displayCity ? city.id : city.stations[0].id,
        isTopLevel: true,
        name: displayCity ? city.name : city.stations[0].fullname,
        type: displayCity ? 'CITY' : 'STATION',
      });

      if (city.stations.length > 1) {
        city.stations.forEach(station => {
          newStations.push({
            cityId: city.id,
            countryCode: country.code,
            id: station.id,
            isTopLevel: false,
            name: station.fullname,
            type: 'STATION',
          });
        });
      }

      if (anyWordBeginsWith(city.name, query)) {
        bestMatches.push(...newStations);
      } else {
        otherMatches.push(...newStations);
      }
    });
  });

  return [...bestMatches, ...otherMatches];
};

export const filterLocations = (locations: Array<Country>, query: string): Array<ListStation> => {
  // filtering alters original array, we need to clone it
  const clonedLocations = cloneDeep(locations);
  const normalizedQuery = removeDiacritics(query).toLowerCase();
  // filter the original array
  const filteredResults = clonedLocations.filter(country =>
    filterCountry(country, normalizedQuery),
  );
  // map to a simple one-dimensional array, move best matches to the beginning
  return createStationList(filteredResults, normalizedQuery);
};

export const getListStationById = (
  cities: CityMap,
  stations: StationMap,
  id: number,
): ?ListStation => {
  const station = get(stations, id, {});
  const city = get(cities, station.cityId);

  if (!city) {
    return undefined;
  }

  return {
    cityId: station.cityId,
    countryCode: city.countryCode,
    id: station.id,
    isTopLevel: false,
    name: station.fullname,
    type: 'STATION',
  };
};

const getAllCities = (locations: Array<Country>): Array<City> =>
  flatten(
    locations.map(location =>
      location.cities.map(city => ({ ...city, countryCode: location.code })),
    ),
  );

const getAllStations = (cities: Array<City>): Array<Station> =>
  flatten(cities.map(city => city.stations.map(station => ({ ...station, cityId: city.id }))));

export const composeStationAndCityMaps = (
  locations: Array<Country>,
): { cities: CityMap, stations: StationMap } => {
  const cities = getAllCities(locations);
  const stations = getAllStations(cities);

  return {
    cities: keyBy(cities, 'id'),
    stations: keyBy(stations, 'id'),
  };
};

/**
 * Locations come from API in random order, they need to be sorted
 * - countries
 *     1) according to priority defined in getCountryCodePriority
 *        e.g. for Czech language, Czech and Slovak locations are first
 *     2) alphabetically by country name
 * - cities - alphabetically by city name
 * - stations
 *     1) according to "significance" attribute returned from API (higher significance is first)
 *     2) alphabetically by station name
 */
export const sortLocations = (locations: Array<Country>, locale: Locale): Array<Country> =>
  sortCountries(locations, locale).map(country => ({
    ...country,
    cities: sortCities(country.cities, locale).map(city => ({
      ...city,
      stations: sortStations(city.stations, locale),
    })),
  }));

const getCountryCodePriority = (countryCode: string, locale: Locale) => {
  const priority = {
    at: { AT: 1 },
    cs: { CZ: 2, SK: 1 },
    de: { DE: 1 },
    en: { UK: 1 },
    pl: { PL: 1 },
    sk: { SK: 2, CZ: 1 },
  };

  return priority[locale][countryCode] || 0;
};

const sortCountries = (countries: Array<Country>, locale: Locale): Array<Country> =>
  countries.sort(
    (a, b) =>
      getCountryCodePriority(b.code, locale) - getCountryCodePriority(a.code, locale) ||
      comparatorLocale(locale)(a.country, b.country),
  );

const sortCities = (cities: Array<City>, locale: Locale): Array<City> =>
  cities.sort((a, b) => comparatorLocale(locale)(a.name, b.name));

const sortStations = (stations, locale: Locale) =>
  stations.sort(
    (a, b) => b.significance - a.significance || comparatorLocale(locale)(a.name, b.name),
  );

const LAST_SEARCHES_KEY = 'lastSearches';

export const getLastSearches = async (): Promise<Array<LastSearch>> =>
  JSON.parse(await AsyncStorage.getItem(LAST_SEARCHES_KEY)) || [];

const lastSearchComparator = (a, b) =>
  a.stationFrom.id === b.stationFrom.id && a.stationTo.id === b.stationTo.id;

export const storeLastSearch = async ({ stationFrom, stationTo }: LastSearch) => {
  let lastSearches: Array<LastSearch> = await getLastSearches();
  lastSearches.unshift({ stationFrom, stationTo });
  lastSearches = uniqWith(lastSearches, lastSearchComparator);
  lastSearches = lastSearches.slice(0, 3);

  return AsyncStorage.setItem(LAST_SEARCHES_KEY, JSON.stringify(lastSearches));
};
