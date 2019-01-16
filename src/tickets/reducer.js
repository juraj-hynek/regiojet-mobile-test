// @flow
import set from 'lodash/fp/set';
import type { NavigationAction } from 'react-navigation';

import type { ErrorResponse, Ticket } from '../types';
import type { TicketAction } from '../ticket/actions';
import type { TicketsAction } from './actions';
import { clearErrors } from '../error/helpers';

export type TicketListState = {
  +error: ?ErrorResponse,
  +errorMore: ?ErrorResponse,
  +globalError: ?ErrorResponse,
  +isFetching: boolean,
  +isFetchingMore: boolean,
  +list: Array<Ticket>,
  +total: number,
};

export type TicketsState = {
  +create: {
    +error: ?ErrorResponse,
    +isFetching: boolean,
  },
  +needsRefetch: boolean,
  +new: TicketListState,
  +old: TicketListState,
  +unpaid: TicketListState,
};

const INITIAL_LIST_STATE = {
  error: null,
  errorMore: null,
  globalError: null,
  isFetching: false,
  isFetchingMore: false,
  list: [],
  total: 0,
};

const INITIAL_ACTION_STATE = {
  error: null,
  isFetching: false,
};

const INITIAL_STATE = {
  create: INITIAL_ACTION_STATE,
  needsRefetch: false,
  new: INITIAL_LIST_STATE,
  old: INITIAL_LIST_STATE,
  unpaid: INITIAL_LIST_STATE,
};

const reducer = (
  state: TicketsState = INITIAL_STATE,
  action: TicketAction | TicketsAction | NavigationAction,
) => {
  if (action.type === 'Navigation/NAVIGATE' && action.routeName === 'Reservation') {
    return clearErrors(state, ['error', 'errorMore']);
  }

  switch (action.type) {
    case 'CREATE_TICKETS_REGISTERED_PENDING':
    case 'CREATE_TICKETS_UNREGISTERED_PENDING':
      return {
        ...state,
        create: { ...INITIAL_ACTION_STATE, isFetching: true },
      };
    case 'CREATE_TICKETS_REGISTERED_REJECTED':
    case 'CREATE_TICKETS_UNREGISTERED_REJECTED':
      return {
        ...state,
        create: { error: action.payload, isFetching: false },
      };
    case 'CREATE_TICKETS_REGISTERED_FULFILLED':
    case 'CREATE_TICKETS_UNREGISTERED_FULFILLED':
      return {
        ...state,
        create: { ...state.create, isFetching: false },
      };

    case 'GET_TICKETS_PENDING': {
      const { listType } = action;
      return {
        ...state,
        needsRefetch: false,
        [listType]: { ...INITIAL_LIST_STATE, isFetching: true },
      };
    }
    case 'GET_TICKETS_MORE_PENDING': {
      const { listType } = action;
      return {
        ...state,
        [listType]: { ...state[listType], errorMore: null, isFetchingMore: true },
      };
    }
    case 'GET_TICKETS_REJECTED': {
      const { listType } = action;
      return {
        ...state,
        [listType]: {
          ...state[listType],
          error: action.payload,
          globalError: action.payload,
          isFetching: false,
        },
      };
    }
    case 'GET_TICKETS_MORE_REJECTED': {
      const { listType } = action;
      return {
        ...state,
        [listType]: {
          ...state[listType],
          errorMore: action.payload,
          isFetchingMore: false,
        },
      };
    }
    case 'GET_TICKETS_FULFILLED': {
      const {
        listType,
        payload: { tickets, total },
      } = action;
      return {
        ...state,
        [listType]: { ...state[listType], isFetching: false, list: tickets, total },
      };
    }
    case 'GET_TICKETS_MORE_FULFILLED': {
      const {
        listType,
        payload: { tickets, total },
      } = action;
      return {
        ...state,
        [listType]: {
          ...state[listType],
          isFetchingMore: false,
          list: [...state[listType].list, ...tickets],
          total,
        },
      };
    }

    case 'REFRESH_TICKET_LIST':
    case 'SEND_TICKET_RATING_FORM_FULFILLED':
      return { ...state, needsRefetch: true };

    case 'Navigation/NAVIGATE': {
      // TicketPaymentScreen needs to fetch new "unpaid" tickets
      // having old "unpaid" tickets in state leads to unexpected behaviour
      if (action.routeName !== 'TicketPayment') {
        return state;
      }
      return { ...state, unpaid: INITIAL_LIST_STATE };
    }

    case 'REMOVE_TICKET_LIST_ERROR_ACTION':
      return set(`${action.listType}.globalError`, null, state);

    default: {
      return state;
    }
  }
};

export default reducer;
