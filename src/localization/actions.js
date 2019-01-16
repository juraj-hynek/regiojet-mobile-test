// @flow
import axios from 'axios';

import { getErrorResponse } from '../error/helpers';
import type { ActionDeps } from '../redux';
import type { Currency, ErrorResponse, Locale } from '../types';

type GetTranslationsAction =
  | {
      type: 'GET_TRANSLATIONS_PENDING',
    }
  | {
      type: 'GET_TRANSLATIONS_FULFILLED',
      payload: Object,
    }
  | {
      type: 'GET_TRANSLATIONS_REJECTED',
      payload: ErrorResponse,
    };

type ChangeCurrencyAction = {
  type: 'CHANGE_CURRENCY',
  currency: Currency,
};

type ChangeLocaleAction = {
  type: 'CHANGE_LOCALE',
  locale: Locale,
};

export type LocalizationAction = ChangeCurrencyAction | ChangeLocaleAction | GetTranslationsAction;

export const getTranslations = (language: Locale) => async ({
  dispatch,
  apiClient,
}: ActionDeps): Promise<GetTranslationsAction> => {
  try {
    dispatch(({ type: 'GET_TRANSLATIONS_PENDING' }: GetTranslationsAction));

    // eslint-disable-next-line no-undef
    const { data: translations } = __DEV__
      ? await axios.get(`https://regiojet-api.herokuapp.com/translations/${language}`)
      : await apiClient.get(`/consts/translations/${language}`);

    return {
      type: 'GET_TRANSLATIONS_FULFILLED',
      payload: translations,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    return { type: 'GET_TRANSLATIONS_REJECTED', payload: errorResponse };
  }
};

export const changeCurrency = (currency: Currency) => ({
  type: 'CHANGE_CURRENCY',
  currency,
});

export const changeLocale = (locale: Locale) => ({
  type: 'CHANGE_LOCALE',
  locale,
});
