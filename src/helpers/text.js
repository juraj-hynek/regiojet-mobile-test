// @flow
import validatorIsFloat from 'validator/lib/isFloat';

export const capitalizeFirst = (text: string) => text.charAt(0).toUpperCase() + text.substr(1);

export const convertToFloat = (text: string) => parseFloat(text.replace(',', '.'));

export const isFloat = (text: string) => validatorIsFloat(text.replace(',', '.'));
