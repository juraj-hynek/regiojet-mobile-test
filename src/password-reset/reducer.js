// @flow
import set from 'lodash/fp/set';

import type { ErrorResponse } from '../types';
import type { PasswordResetAction } from './actions';

export type PasswordResetState = {
  +requestPasswordReset: {
    +isFetching: boolean,
  },
  +resetPassword: {
    +error: ?ErrorResponse,
    +isFetching: boolean,
  },
  +validateToken: {
    +error: ?ErrorResponse,
    +isFetching: boolean,
    +token: ?string,
  },
};

const INITIAL_STATE = {
  requestPasswordReset: {
    isFetching: false,
  },
  resetPassword: {
    error: null,
    isFetching: false,
  },
  validateToken: {
    error: null,
    isFetching: false,
    token: null,
  },
};

const reducer = (state: PasswordResetState = INITIAL_STATE, action: PasswordResetAction) => {
  switch (action.type) {
    case 'REQUEST_PASSWORD_RESET_PENDING':
      return set('requestPasswordReset.isFetching', true, state);
    case 'REQUEST_PASSWORD_RESET_FULFILLED':
    case 'REQUEST_PASSWORD_RESET_REJECTED':
      return set('requestPasswordReset.isFetching', false, state);

    case 'RESET_PASSWORD_PENDING':
      return { ...state, resetPassword: { error: null, isFetching: true } };
    case 'RESET_PASSWORD_REJECTED':
      return { ...state, resetPassword: { error: action.payload, isFetching: false } };
    case 'RESET_PASSWORD_FULFILLED':
      return set('resetPassword.isFetching', false, state);

    case 'VALIDATE_PASSWORD_RESET_TOKEN_PENDING':
      return { ...state, validateToken: { ...INITIAL_STATE.validateToken, isFetching: true } };
    case 'VALIDATE_PASSWORD_RESET_TOKEN_REJECTED':
      return {
        ...state,
        validateToken: { ...state.validateToken, error: action.payload, isFetching: false },
      };
    case 'VALIDATE_PASSWORD_RESET_TOKEN_FULFILLED':
      return {
        ...state,
        validateToken: { ...state.validateToken, isFetching: false, token: action.token },
      };

    default:
      return state;
  }
};

export default reducer;
