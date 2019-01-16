// @flow
import { getDefaultLocale } from './helpers';
import type { Currency, ErrorResponse, Locale } from '../types';
import type { LocalizationAction } from './actions';
import type { UserAction } from '../user/actions';

export type LocalizationState = {
  +currency: Currency,
  +error: ?ErrorResponse,
  +isFetching: boolean,
  +locale: Locale,
  +translations: Object,
};

const locale = getDefaultLocale();

const INITIAL_STATE = {
  currency: locale === 'cs' ? 'CZK' : 'EUR',
  error: null,
  isFetching: false,
  locale,
  translations: {},
};

export default (
  state: LocalizationState = INITIAL_STATE,
  action: LocalizationAction | UserAction,
) => {
  switch (action.type) {
    case 'GET_TRANSLATIONS_PENDING':
      return { ...state, error: null, isFetching: true };
    case 'GET_TRANSLATIONS_REJECTED':
      return { ...state, error: action.payload, isFetching: false };
    case 'GET_TRANSLATIONS_FULFILLED':
      return { ...state, isFetching: false, translations: action.payload };
    case 'AUTHENTICATE_FULFILLED':
      return { ...state, currency: action.payload.currency };
    case 'CHANGE_CURRENCY':
      return { ...state, currency: action.currency };
    case 'CHANGE_LOCALE':
      return { ...state, locale: action.locale };
    default:
      return state;
  }
};
