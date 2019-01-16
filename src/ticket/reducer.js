// @flow
import flow from 'lodash/fp/flow';
import set from 'lodash/fp/set';

import type {
  ErrorResponse,
  RatingFormData,
  RouteAddon,
  RouteSeatsResponse,
  Ticket,
} from '../types';
import type { ModalAction } from '../modal/actions';
import type { TicketAction } from './actions';

type AddonsState = {
  +data: Array<RouteAddon>,
  +error: ?ErrorResponse,
  +isFetching: boolean,
};

type FreeSeatsState = {
  +data: Array<RouteSeatsResponse>,
  +error: ?ErrorResponse,
  +isFetching: boolean,
};

export type RatingFormState = {
  +data: Array<RatingFormData>,
  +error: ?ErrorResponse,
  +isFetching: boolean,
};

export type TicketItemState = {
  +data: ?Ticket,
  +error: ?ErrorResponse,
  +isFetching: boolean,
  +needsRefetch: boolean,
};

type ErrorFetchingState = {
  +error: ?ErrorResponse,
  +isFetching: boolean,
};

type FetchingState = {
  +isFetching: boolean,
};

export type RatingFormSendState = FetchingState;

export type TicketState = {
  +addons: AddonsState,
  +addonsEdit: FetchingState,
  +cancel: FetchingState,
  +freeSeats: FreeSeatsState,
  +passengerCancel: FetchingState,
  +passengerEdit: ErrorFetchingState,
  +ratingForm: RatingFormState,
  +ratingFormSend: RatingFormSendState,
  +sendByEmail: FetchingState,
  +ticket: TicketItemState,
};

const INITIAL_STATE = {
  addons: {
    data: [],
    error: null,
    isFetching: false,
  },
  addonsEdit: {
    isFetching: false,
  },
  cancel: {
    isFetching: false,
  },
  freeSeats: {
    data: [],
    error: null,
    isFetching: false,
  },
  passengerCancel: {
    isFetching: false,
  },
  passengerEdit: {
    error: null,
    isFetching: false,
  },
  ratingForm: {
    data: [],
    error: null,
    isFetching: false,
  },
  ratingFormSend: {
    isFetching: false,
  },
  sendByEmail: {
    isFetching: false,
  },
  ticket: {
    data: null,
    error: null,
    isFetching: false,
    needsRefetch: false,
  },
};

export default (state: TicketState = INITIAL_STATE, action: TicketAction | ModalAction) => {
  switch (action.type) {
    case 'GET_TICKET_RATING_FORM_PENDING':
      return {
        ...state,
        ratingForm: {
          ...INITIAL_STATE.ratingForm,
          isFetching: true,
        },
      };
    case 'GET_TICKET_RATING_FORM_REJECTED':
      return {
        ...state,
        ratingForm: {
          ...state.ratingForm,
          error: action.payload,
          isFetching: false,
        },
      };
    case 'GET_TICKET_RATING_FORM_FULFILLED':
      return {
        ...state,
        ratingForm: {
          ...state.ratingForm,
          data: action.payload,
          isFetching: false,
        },
      };

    case 'GET_TICKET_ADDONS_PENDING':
      return {
        ...state,
        addons: {
          ...INITIAL_STATE.addons,
          isFetching: true,
        },
      };
    case 'GET_TICKET_ADDONS_REJECTED':
      return {
        ...state,
        addons: {
          ...state.addons,
          error: action.payload,
          isFetching: false,
        },
      };
    case 'GET_TICKET_ADDONS_FULFILLED':
      return {
        ...state,
        addons: {
          ...state.addons,
          data: action.payload,
          isFetching: false,
        },
      };

    case 'GET_TICKET_PENDING':
      return {
        ...state,
        ticket: {
          ...INITIAL_STATE.ticket,
          isFetching: true,
        },
      };
    case 'GET_TICKET_REJECTED':
      return {
        ...state,
        ticket: {
          ...state.ticket,
          error: action.payload,
          isFetching: false,
        },
      };
    case 'GET_TICKET_FULFILLED':
      return {
        ...state,
        ticket: {
          ...state.ticket,
          data: action.payload,
          isFetching: false,
        },
      };

    case 'SAVE_TICKET_ADDONS_PENDING':
    case 'UPDATE_TICKET_ADDON_PENDING':
      return set('addonsEdit.isFetching', true, state);
    case 'SAVE_TICKET_ADDONS_REJECTED':
    case 'SAVE_TICKET_ADDONS_FULFILLED':
    case 'UPDATE_TICKET_ADDON_REJECTED':
      return set('addonsEdit.isFetching', false, state);

    case 'SEND_TICKET_RATING_FORM_PENDING':
      return set('ratingFormSend.isFetching', true, state);
    case 'SEND_TICKET_RATING_FORM_REJECTED':
      return set('ratingFormSend.isFetching', false, state);
    case 'SEND_TICKET_RATING_FORM_FULFILLED':
      return flow(set('ratingFormSend.isFetching', false), set('ticket.needsRefetch', true))(state);

    case 'SEND_TICKET_BY_EMAIL_PENDING':
      return set('sendByEmail.isFetching', true, state);
    case 'SEND_TICKET_BY_EMAIL_REJECTED':
    case 'SEND_TICKET_BY_EMAIL_FULFILLED':
      return set('sendByEmail.isFetching', false, state);

    case 'REFRESH_TICKET':
      return set('ticket.needsRefetch', true, state);

    case 'UPDATE_TICKET_ADDON_FULFILLED':
      return flow(
        set('addons.data', action.payload.updatedAddons),
        set('addonsEdit.isFetching', false),
      )(state);

    case 'CANCEL_TICKET_PENDING':
      return set('cancel.isFetching', true, state);
    case 'CANCEL_TICKET_REJECTED':
    case 'CANCEL_TICKET_FULFILLED':
      return set('cancel.isFetching', false, state);

    case 'CANCEL_PASSENGER_PENDING':
      return set('passengerCancel.isFetching', true, state);
    case 'CANCEL_PASSENGER_REJECTED':
    case 'CANCEL_PASSENGER_FULFILLED':
      return set('passengerCancel.isFetching', false, state);

    case 'EDIT_PASSENGER_PENDING':
      return set('passengerEdit', { error: null, isFetching: true }, state);
    case 'EDIT_PASSENGER_REJECTED':
      return set('passengerEdit', { error: action.payload, isFetching: false }, state);
    case 'EDIT_PASSENGER_FULFILLED':
      return set('passengerEdit.isFetching', false, state);

    case 'GET_TICKET_FREE_SEATS_PENDING':
      return {
        ...state,
        freeSeats: {
          ...INITIAL_STATE.freeSeats,
          isFetching: true,
        },
      };
    case 'GET_TICKET_FREE_SEATS_REJECTED':
      return {
        ...state,
        freeSeats: {
          ...state.freeSeats,
          error: action.payload,
          isFetching: false,
        },
      };
    case 'GET_TICKET_FREE_SEATS_FULFILLED':
      return {
        ...state,
        freeSeats: {
          ...state.freeSeats,
          data: action.payload,
          isFetching: false,
        },
      };

    case 'CLOSE_MODAL':
      return { ...state, freeSeats: INITIAL_STATE.freeSeats };

    default:
      return state;
  }
};
