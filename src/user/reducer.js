// @flow
import set from 'lodash/fp/set';

import type { ErrorResponse, PercentualDiscount, User, UserRole } from '../types';
import type { ChangeInfoFormName, UserAction } from './actions';
import type { PaymentMethodsAction } from '../payment-methods/actions';

type UserAPICallState = {
  +error: ?ErrorResponse,
  +isFetching: boolean,
};

type ChangeInfoState = { [keys: ChangeInfoFormName]: UserAPICallState };

type PercentualDiscountsState = UserAPICallState & {
  list: Array<PercentualDiscount>,
};

export type UserState = {
  +changeInfo: ChangeInfoState,
  +changePassword: UserAPICallState,
  +login: UserAPICallState,
  +percentualDiscounts: PercentualDiscountsState,
  +postponeHistoryRemoval: boolean,
  +registration: UserAPICallState,
  +role: UserRole,
  +user: ?User,
};

const API_CALL_INITIAL_STATE = {
  error: null,
  isFetching: false,
};

const INITIAL_STATE = {
  changeInfo: {
    CreditTicket: API_CALL_INITIAL_STATE,
    PersonalSettings: API_CALL_INITIAL_STATE,
    SendingEmails: API_CALL_INITIAL_STATE,
  },
  changePassword: API_CALL_INITIAL_STATE,
  login: API_CALL_INITIAL_STATE,
  percentualDiscounts: {
    ...API_CALL_INITIAL_STATE,
    list: [],
  },
  postponeHistoryRemoval: false,
  registration: API_CALL_INITIAL_STATE,
  role: 'ANONYMOUS',
  user: null,
};

const reducer = (state: UserState = INITIAL_STATE, action: UserAction | PaymentMethodsAction) => {
  switch (action.type) {
    case 'AUTHENTICATE_FULFILLED':
      return {
        ...state,
        role: action.payload.creditPrice ? 'CREDIT' : 'OPEN',
        user: action.payload,
      };

    case 'CHANGE_INFO_PENDING':
      return set(`changeInfo.${action.formName}`, { error: null, isFetching: true }, state);
    case 'CHANGE_INFO_FULFILLED':
      return set(`changeInfo.${action.formName}`, API_CALL_INITIAL_STATE, state);
    case 'CHANGE_INFO_REJECTED':
      return set(
        `changeInfo.${action.formName}`,
        { error: action.payload, isFetching: false },
        state,
      );

    case 'CHANGE_PASSWORD_PENDING':
      return {
        ...state,
        changePassword: { error: null, isFetching: true },
      };
    case 'CHANGE_PASSWORD_FULFILLED':
      return {
        ...state,
        changePassword: { error: null, isFetching: false },
      };
    case 'CHANGE_PASSWORD_REJECTED':
      return {
        ...state,
        changePassword: { error: action.payload, isFetching: false },
      };

    case 'LOGIN_PENDING':
      return {
        ...state,
        login: { error: null, isFetching: true },
      };
    case 'LOGIN_FULFILLED':
      return {
        ...state,
        login: { error: null, isFetching: false },
      };
    case 'LOGIN_REJECTED':
      return {
        ...state,
        login: { error: action.payload, isFetching: false },
      };

    case 'REGISTRATION_PENDING':
      return {
        ...state,
        registration: { error: null, isFetching: true },
      };
    case 'REGISTRATION_REJECTED':
      return {
        ...state,
        registration: { error: action.payload, isFetching: false },
      };
    case 'REGISTRATION_FULFILLED':
      return {
        ...state,
        registration: { error: null, isFetching: false },
      };

    case 'LOGOUT_FULFILLED':
      return { ...state, role: 'ANONYMOUS', user: undefined };

    case 'PAY_TICKETS_CREDIT_FULFILLED':
      return {
        ...state,
        user: {
          ...state.user,
          credit: action.remainingCredit,
        },
      };

    case 'GET_USER_PERCENTUAL_DISCOUNT_PENDING':
      return {
        ...state,
        percentualDiscounts: { error: null, isFetching: true, list: [] },
      };
    case 'GET_USER_PERCENTUAL_DISCOUNT_REJECTED':
      return {
        ...state,
        percentualDiscounts: { error: action.payload, isFetching: false, list: [] },
      };
    case 'GET_USER_PERCENTUAL_DISCOUNT_FULFILLED':
      return {
        ...state,
        percentualDiscounts: {
          error: null,
          isFetching: false,
          list: action.payload,
        },
      };

    case 'SET_POSTPONE_HISTORY_REMOVAL':
      return { ...state, postponeHistoryRemoval: action.postpone };

    default:
      return state;
  }
};

export default reducer;
