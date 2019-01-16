// @flow
import isObject from 'lodash/isObject';
import pickBy from 'lodash/pickBy';
import transform from 'lodash/transform';

import { colors } from '../../style';
import type { ErrorResponse } from '../../types';
import type { IconType } from '../Icon';
import type { ValidationResult, ValidationResults } from './validation';
import * as validation from './validation';

export const cleanValidationObject = (obj: Object): Object => pickBy(obj, isObject);

export const isFormValid = (validationResults: Object): boolean =>
  !Object.values(validationResults).some((res: any) => isFieldInvalid(res));

/**
 * Field was validated and is valid
 * Fields has 3 states - not validated, validated && valid, validated && invalid
 */
export const isFieldValid = (validation?: ?ValidationResult) =>
  !!validation && validation.type === 'valid';

export const isFieldInvalid = (validation: ?ValidationResult) =>
  !!validation && validation.type !== 'valid';

export const isFieldFilled = (validation: ?ValidationResult) =>
  !!validation && validation.type !== 'required';

export const getInvalidFieldsCount = (validationResults: ValidationResults<*>): number =>
  // $FlowFixMe flow understands value in reduce’s callbackFn as a mixed type
  Object.values(validationResults).reduce((count, field) => count + isFieldInvalid(field), 0);

export const getIconName = (
  validation: ?ValidationResult,
  iconName: ?IconType,
  canDelete: boolean = false,
) => {
  if (canDelete) {
    return 'crossCircle';
  }
  if (isFieldInvalid(validation)) {
    return 'crossLight';
  }
  if (isFieldValid(validation)) {
    return 'check';
  }

  return iconName;
};

export const getIconColor = (validation: ?ValidationResult, canDelete: boolean = false) => {
  if (canDelete) {
    return '';
  }
  if (isFieldInvalid(validation)) {
    return colors.red;
  }
  if (isFieldValid(validation)) {
    return colors.green;
  }

  return colors.yellowDark;
};

export function createServerValidationResults(error: ?ErrorResponse) {
  if (!error) {
    return {};
  }

  return error.errorFields.reduce(
    (validationResults, errorField) => ({
      ...validationResults,
      [errorField.key]: { type: 'serverError', message: errorField.value },
    }),
    {},
  );
}

export const toggleFirstInvalid = (
  validationResults: validation.ValidationResults<*>,
): validation.ValidationResults<*> => {
  let isFirstInvalidFound = false;
  return transform(
    validationResults,
    (newValidationResults, value, key) => {
      const isFirstInvalid = isFieldInvalid(value) && !isFirstInvalidFound;
      if (isFirstInvalid) {
        isFirstInvalidFound = true;
      }
      // eslint-disable-next-line no-param-reassign
      newValidationResults[key] = { ...value, isFirstInvalid };
    },
    {},
  );
};
