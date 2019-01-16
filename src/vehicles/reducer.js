// @flow
import type { ErrorResponse, VehicleSvg } from '../types';
import type { VehicleAction } from './actions';

export type VehiclesState = {
  [vehicleId: number]: {
    +data: ?VehicleSvg,
    +error: ?ErrorResponse,
    +isFetching: boolean,
  },
};

const INITIAL_STATE = {};

const reducer = (state: VehiclesState = INITIAL_STATE, action: VehicleAction) => {
  switch (action.type) {
    case 'GET_VEHICLE_SVG_PENDING':
      return {
        ...state,
        [action.vehicleId]: { data: null, error: null, isFetching: true },
      };
    case 'GET_VEHICLE_SVG_REJECTED':
      return {
        ...state,
        [action.vehicleId]: { data: null, error: action.message, isFetching: false },
      };
    case 'GET_VEHICLE_SVG_FULFILLED':
      return {
        ...state,
        [action.vehicleId]: { data: action.payload, error: null, isFetching: false },
      };
    default:
      return state;
  }
};

export default reducer;
