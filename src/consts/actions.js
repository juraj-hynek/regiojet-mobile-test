// @flow
import { addGlobalError } from '../messages/actions';
import { composeStationAndCityMaps, sortLocations } from '../search-routes/index';
import { getErrorResponse } from '../error/helpers';
import type { ActionDeps } from '../redux';
import type {
  CityMap,
  Country,
  ErrorResponse,
  Locale,
  SeatClass,
  StationMap,
  Tariff,
  Timetable,
  VehicleStandard,
} from '../types';

type GetConstsAction =
  | { type: 'GET_CONSTS_PENDING' }
  | {
      type: 'GET_CONSTS_FULFILLED',
      payload: {
        cities: CityMap,
        locations: Array<Country>,
        seatClasses: Array<SeatClass>,
        stations: StationMap,
        tariffs: Array<Tariff>,
        vehicleStandards: Array<VehicleStandard>,
      },
    }
  | {
      type: 'GET_CONSTS_REJECTED',
      payload: ErrorResponse,
    };

type GetTimetableAction =
  | { type: 'GET_TIMETABLE_PENDING' }
  | { type: 'GET_TIMETABLE_FULFILLED', payload: Timetable }
  | { type: 'GET_TIMETABLE_REJECTED', payload: ErrorResponse };

export type ConstsAction = GetConstsAction | GetTimetableAction;

export const getConsts = (locale: Locale) => async ({
  dispatch,
  apiClient,
}: ActionDeps): Promise<GetConstsAction> => {
  try {
    dispatch(({ type: 'GET_CONSTS_PENDING' }: GetConstsAction));
    const [
      { data: locations },
      { data: seatClasses },
      { data: tariffs },
      { data: vehicleStandards },
    ] = await Promise.all([
      apiClient.get('/consts/locations'),
      apiClient.get('/consts/seatClasses'),
      apiClient.get('/consts/tariffs'),
      apiClient.get('/consts/vehicleStandards'),
    ]);

    const sortedLocations = sortLocations(locations, locale);
    const { cities, stations } = composeStationAndCityMaps(sortedLocations);

    return {
      type: 'GET_CONSTS_FULFILLED',
      payload: {
        cities,
        locations: sortedLocations,
        seatClasses,
        stations,
        tariffs,
        vehicleStandards,
      },
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    return { type: 'GET_CONSTS_REJECTED', payload: errorResponse };
  }
};

export const getTimetable = (connectionId: number) => async ({
  dispatch,
  apiClient,
}: ActionDeps): Promise<GetTimetableAction> => {
  try {
    dispatch({ type: 'GET_TIMETABLE_PENDING' });
    const { data } = await apiClient.get(`/consts/timetables?connectionId=${connectionId}`);

    return { type: 'GET_TIMETABLE_FULFILLED', payload: data[0] };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return { type: 'GET_TIMETABLE_REJECTED', payload: errorResponse };
  }
};
