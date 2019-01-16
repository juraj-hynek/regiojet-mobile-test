// @flow
import isEmail from 'validator/lib/isEmail';

import { convertToFloat, isFloat } from '../../helpers/text';

type AlreadyExists = { type: 'alreadyExists', isFirstInvalid?: boolean };
type DifferentPassword = { type: 'differentPassword', isFirstInvalid?: boolean };
type Email = { type: 'email', isFirstInvalid?: boolean };
type MaxLength = { type: 'maxLength', maxLength: number, isFirstInvalid?: boolean };
type MinLength = { type: 'minLength', minLength: number, isFirstInvalid?: boolean };
type MinNumber = { type: 'minNumber', minNumber: number, isFirstInvalid?: boolean };
type Number = { type: 'number', isFirstInvalid?: boolean };
type Required = { type: 'required', isFirstInvalid?: boolean };
type RequiredAgree = { type: 'requiredAgree', isFirstInvalid?: boolean };
type ServerError = { type: 'serverError', message: string, isFirstInvalid?: boolean };
type Valid = { type: 'valid', isFirstInvalid?: boolean };
type WrongPassword = { type: 'wrongPassword', isFirstInvalid?: boolean };

export type ValidationResult =
  | AlreadyExists
  | DifferentPassword
  | Email
  | MaxLength
  | MinLength
  | MinNumber
  | Number
  | Required
  | RequiredAgree
  | ServerError
  | Valid
  | WrongPassword;

export type ValidationResults<T> = {
  [key: $Keys<T>]: ?ValidationResult,
};

export type Validator<T> = (value?: T, optional?: boolean, match?: string) => ?ValidationResult;
type MinNumberValidator<T> = (value: T, optional?: boolean, minNumber: number) => ?ValidationResult;

export const required: Validator<string> = (value = '', optional) => {
  if (value.length === 0) return optional ? null : { type: 'required' };
  return { type: 'valid' };
};

export const requiredNumber: Validator<number> = (value, optional) => {
  if (typeof value === 'undefined' || value === null) return optional ? null : { type: 'required' };
  return { type: 'valid' };
};

export const requiredAgree: Validator<boolean> = (value, optional) => {
  if (optional) return null;
  if (!value) return { type: 'requiredAgree' };
  return { type: 'valid' };
};

export const shortText: Validator<string> = (value = '', optional) => {
  if (value.length === 0) return optional ? null : { type: 'required' };
  if (value.length < 3) return { type: 'minLength', minLength: 3 };
  if (value.length > 140) return { type: 'maxLength', maxLength: 140 };
  return { type: 'valid' };
};

export const email: Validator<string> = (value = '', optional) => {
  if (value.length === 0) return optional ? null : { type: 'required' };
  if (!isEmail(value)) return { type: 'email' };
  return { type: 'valid' };
};

export const number: Validator<string> = (value = '', optional) => {
  if (value.length === 0) return optional ? null : { type: 'required' };
  if (!/^\d+$/.test(value)) return { type: 'number' };
  return { type: 'valid' };
};

export const password: Validator<string> = (value = '', optional) => {
  if (value.length === 0) return optional ? null : { type: 'required' };
  if (value.length < 5) return { type: 'minLength', minLength: 5 };
  if (value.length > 1024) return { type: 'maxLength', maxLength: 1024 };
  return { type: 'valid' };
};

export const confirmPassword: Validator<string> = (value = '', optional, match) => {
  if (value.length === 0) return optional ? null : { type: 'required' };
  if (value.length < 6) return { type: 'minLength', minLength: 6 };
  if (value.length > 1024) return { type: 'maxLength', maxLength: 1024 };
  if (value !== match) return { type: 'differentPassword' };
  return { type: 'valid' };
};

export const minNumber: MinNumberValidator<string> = (value = '', optional, minNumber = 0) => {
  if (value.length === 0) return optional ? null : { type: 'required' };
  if (!isFloat(value)) return { type: 'number' };
  if (convertToFloat(value) <= minNumber) return { type: 'minNumber', minNumber };
  return { type: 'valid' };
};
