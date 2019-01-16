// @flow
import get from 'lodash/get';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from 'lodash/mapValues';

import type { ErrorResponse } from '../types';

export const getErrorResponse = (err: Object): ErrorResponse => ({
  errorFields: get(err, 'response.data.errorFields') || [],
  message: get(err, 'response.data.message') || err.message,
});

export const clearErrors = (state: Object, keys: Array<string> = ['error']): Object =>
  mapValues(state, (value, key) => {
    if (keys.includes(key)) return null;
    if (isPlainObject(value)) return clearErrors(value, keys);
    return value;
  });
