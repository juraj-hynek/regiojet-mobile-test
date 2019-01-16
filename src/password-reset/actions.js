// @flow
import { addGlobalMessage, addGlobalError } from '../messages/actions';
import { getErrorResponse } from '../error/helpers';
import { replaceLast } from '../navigation/actions';
import type { ActionDeps } from '../redux';
import type { ErrorResponse } from '../types';

type RequestPasswordResetAction =
  | { type: 'REQUEST_PASSWORD_RESET_PENDING' }
  | { type: 'REQUEST_PASSWORD_RESET_FULFILLED' }
  | { type: 'REQUEST_PASSWORD_RESET_REJECTED' };

type ResetPasswordAction =
  | { type: 'RESET_PASSWORD_PENDING' }
  | { type: 'RESET_PASSWORD_FULFILLED' }
  | { type: 'RESET_PASSWORD_REJECTED', payload: ErrorResponse };

type ValidatePasswordResetTokenAction =
  | { type: 'VALIDATE_PASSWORD_RESET_TOKEN_PENDING' }
  | { type: 'VALIDATE_PASSWORD_RESET_TOKEN_FULFILLED', token: string }
  | { type: 'VALIDATE_PASSWORD_RESET_TOKEN_REJECTED', payload: ErrorResponse };

export type PasswordResetAction =
  | RequestPasswordResetAction
  | ResetPasswordAction
  | ValidatePasswordResetTokenAction;

export const requestPasswordReset = (data: Object, successCallback: Function = () => {}) => async ({
  dispatch,
  apiClient,
}: ActionDeps): Promise<RequestPasswordResetAction> => {
  try {
    dispatch(({ type: 'REQUEST_PASSWORD_RESET_PENDING' }: RequestPasswordResetAction));
    const payload = { ...data, correlationId: 'mobile' };
    const {
      data: { message },
    } = await apiClient.post('/users/forgottenPassword', payload);
    successCallback();
    dispatch(addGlobalMessage({ text: message, type: 'success' }));

    return { type: 'REQUEST_PASSWORD_RESET_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return { type: 'REQUEST_PASSWORD_RESET_REJECTED' };
  }
};

export const validatePasswordResetToken = (token: string) => async ({
  dispatch,
  apiClient,
}: ActionDeps): Promise<ValidatePasswordResetTokenAction> => {
  try {
    dispatch(({ type: 'VALIDATE_PASSWORD_RESET_TOKEN_PENDING' }: ValidatePasswordResetTokenAction));
    await apiClient.setAccessToken(token);
    await apiClient.getAuth('/users/resetPassword/verify');
    await apiClient.deleteAccessToken();

    return { type: 'VALIDATE_PASSWORD_RESET_TOKEN_FULFILLED', token };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    return { type: 'VALIDATE_PASSWORD_RESET_TOKEN_REJECTED', payload: errorResponse };
  }
};

export const resetPassword = (newPassword: string, token: string) => async ({
  dispatch,
  apiClient,
}: ActionDeps): Promise<ResetPasswordAction> => {
  try {
    dispatch(({ type: 'RESET_PASSWORD_PENDING' }: ResetPasswordAction));
    await apiClient.setAccessToken(token);
    const {
      data: { message },
    } = await apiClient.postAuth('/users/resetPassword', { newPassword });
    await apiClient.deleteAccessToken();
    await dispatch(replaceLast('Login'));
    dispatch(addGlobalMessage({ text: message, type: 'success' }));

    return { type: 'RESET_PASSWORD_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return { type: 'RESET_PASSWORD_REJECTED', payload: errorResponse };
  }
};
