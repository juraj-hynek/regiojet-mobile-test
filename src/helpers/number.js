// @flow
import type { Currency } from '../types';

const DECIMAL_PLACES: { [currency: Currency]: number } = {
  CZK: 0,
  EUR: 1,
};

export const roundByCurrency = (number: number, currency: Currency) => {
  const decimalPlaces = DECIMAL_PLACES[currency];
  return Number(`${Math.round(Number(`${number}e${decimalPlaces}`))}e-${decimalPlaces}`);
};
