// @flow

import type { ErrorResponse, Transaction } from '../types';
import type { PaymentsAction } from './actions';

export type PaymentsState = {
  +error: ?ErrorResponse,
  +errorMore: ?ErrorResponse,
  +isFetching: boolean,
  +isFetchingMore: boolean,
  +list: Array<Transaction>,
  +total: number,
};

const INITIAL_STATE = {
  error: null,
  errorMore: null,
  isFetching: false,
  isFetchingMore: false,
  list: [],
  total: 0,
};

const reducer = (state: PaymentsState = INITIAL_STATE, action: PaymentsAction) => {
  switch (action.type) {
    case 'GET_PAYMENTS_FULFILLED':
      return {
        ...state,
        isFetching: false,
        list: action.payload.payments,
        total: action.payload.total,
      };
    case 'GET_PAYMENTS_MORE_FULFILLED':
      return {
        ...state,
        isFetchingMore: false,
        list: [...state.list, ...action.payload.payments],
        total: action.payload.total,
      };
    case 'GET_PAYMENTS_REJECTED':
      return {
        ...state,
        error: action.payload,
        isFetching: false,
      };
    case 'GET_PAYMENTS_MORE_REJECTED':
      return {
        ...state,
        errorMore: action.payload,
        isFetchingMore: false,
      };
    case 'GET_PAYMENTS_PENDING':
      return {
        ...state,
        error: null,
        isFetching: true,
        total: 0,
      };
    case 'GET_PAYMENTS_MORE_PENDING':
      return {
        ...state,
        errorMore: null,
        isFetchingMore: true,
      };
    default: {
      return state;
    }
  }
};

export default reducer;
