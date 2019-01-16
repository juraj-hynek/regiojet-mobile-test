// @flow
import type { ContactFormAction } from './action';
import type { ErrorResponse } from '../types';

export type ContactState = {
  +error: ?ErrorResponse,
  +isFetching: boolean,
};

const INITIAL_STATE = {
  error: null,
  isFetching: false,
};

const reducer = (state: ContactState = INITIAL_STATE, action: ContactFormAction) => {
  switch (action.type) {
    case 'SEND_CONTACT_FORM_PENDING':
      return { ...state, isFetching: true };
    case 'SEND_CONTACT_FORM_REJECTED':
      return { error: action.payload, isFetching: false };
    case 'SEND_CONTACT_FORM_FULFILLED':
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default reducer;
