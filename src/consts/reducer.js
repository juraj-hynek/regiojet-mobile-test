// @flow
import set from 'lodash/fp/set';

import type {
  CityMap,
  Country,
  ErrorResponse,
  SeatClass,
  StationMap,
  Tariff,
  Timetable,
  VehicleStandard,
} from '../types';
import type { ConstsAction } from './actions';

export type ConstsState = {
  +cities: CityMap,
  +error: ?ErrorResponse,
  +isFetching: boolean,
  +locations: Array<Country>,
  +seatClasses: Array<SeatClass>,
  +stations: StationMap,
  +tariffs: Array<Tariff>,
  +timetable: {
    +data: ?Timetable,
    +isFetching: boolean,
  },
  +vehicleStandards: Array<VehicleStandard>,
};

const INITIAL_STATE = {
  cities: {},
  isFetching: false,
  error: null,
  locations: [],
  seatClasses: [],
  stations: {},
  tariffs: [],
  timetable: {
    data: null,
    isFetching: false,
  },
  vehicleStandards: [],
};

const reducer = (state: ConstsState = INITIAL_STATE, action: ConstsAction) => {
  switch (action.type) {
    case 'GET_CONSTS_PENDING':
      return { ...state, error: null, isFetching: true };
    case 'GET_CONSTS_REJECTED':
      return { ...state, error: action.payload, isFetching: false };
    case 'GET_CONSTS_FULFILLED': {
      const {
        cities,
        locations,
        seatClasses,
        stations,
        tariffs,
        vehicleStandards,
      } = action.payload;

      return {
        ...state,
        cities,
        isFetching: false,
        locations,
        seatClasses,
        stations,
        tariffs,
        vehicleStandards,
      };
    }

    case 'GET_TIMETABLE_PENDING':
      return { ...state, timetable: { data: null, isFetching: true } };
    case 'GET_TIMETABLE_REJECTED':
      return set('timetable.isFetching', false, state);
    case 'GET_TIMETABLE_FULFILLED':
      return { ...state, timetable: { data: action.payload, isFetching: false } };

    default:
      return state;
  }
};

export default reducer;
