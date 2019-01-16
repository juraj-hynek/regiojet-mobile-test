// @flow
import get from 'lodash/get';
import pick from 'lodash/pick';

import { addGlobalMessage, addGlobalError } from '../messages/actions';
import { getErrorResponse } from '../error/helpers';
import { goTo, removeInner } from '../navigation/actions';
import type { ActionDeps } from '../redux';
import type { ErrorResponse, PercentualDiscount, User } from '../types';

type AuthenticateAction =
  | {
      type: 'AUTHENTICATE_PENDING',
    }
  | {
      type: 'AUTHENTICATE_FULFILLED',
      payload: User,
    }
  | {
      type: 'AUTHENTICATE_REJECTED',
      payload: ErrorResponse,
    };

export type ChangeInfoFormName = 'CreditTicket' | 'PersonalSettings' | 'SendingEmails';

type ChangeInfoAction =
  | {
      type: 'CHANGE_INFO_PENDING',
      formName: ChangeInfoFormName,
    }
  | {
      type: 'CHANGE_INFO_FULFILLED',
      formName: ChangeInfoFormName,
    }
  | {
      type: 'CHANGE_INFO_REJECTED',
      formName: ChangeInfoFormName,
      payload: ErrorResponse,
    };

type ChangePasswordAction =
  | {
      type: 'CHANGE_PASSWORD_PENDING',
    }
  | {
      type: 'CHANGE_PASSWORD_FULFILLED',
    }
  | {
      type: 'CHANGE_PASSWORD_REJECTED',
      payload: ErrorResponse,
    };

type LoginAction =
  | {
      type: 'LOGIN_PENDING',
    }
  | {
      type: 'LOGIN_FULFILLED',
    }
  | {
      type: 'LOGIN_REJECTED',
      payload: ErrorResponse,
    };

type LogoutAction =
  | {
      type: 'LOGOUT_PENDING',
    }
  | {
      type: 'LOGOUT_FULFILLED',
    }
  | {
      type: 'LOGOUT_REJECTED',
      payload: ErrorResponse,
    };

type RegistrationAction =
  | {
      type: 'REGISTRATION_PENDING',
    }
  | {
      type: 'REGISTRATION_FULFILLED',
    }
  | {
      type: 'REGISTRATION_REJECTED',
      payload: ErrorResponse,
    };

type GetUserPercentualDiscountsAction =
  | {
      type: 'GET_USER_PERCENTUAL_DISCOUNT_PENDING',
    }
  | {
      type: 'GET_USER_PERCENTUAL_DISCOUNT_FULFILLED',
      payload: Array<PercentualDiscount>,
    }
  | {
      type: 'GET_USER_PERCENTUAL_DISCOUNT_REJECTED',
      payload: ErrorResponse,
    };

type SetPostponeHistoryRemovalAction = { type: 'SET_POSTPONE_HISTORY_REMOVAL', postpone: boolean };

export type UserAction =
  | AuthenticateAction
  | ChangeInfoAction
  | ChangePasswordAction
  | LoginAction
  | LogoutAction
  | RegistrationAction
  | GetUserPercentualDiscountsAction
  | SetPostponeHistoryRemovalAction;

export const authenticate = () => async ({
  dispatch,
  apiClient,
}: ActionDeps => Promise<AuthenticateAction>) => {
  try {
    dispatch(({ type: 'AUTHENTICATE_PENDING' }: AuthenticateAction));
    const { data: user } = await apiClient.getAuth('/users/authenticate');

    return {
      type: 'AUTHENTICATE_FULFILLED',
      payload: user,
    };
  } catch (err) {
    return {
      type: 'AUTHENTICATE_REJECTED',
      payload: getErrorResponse(err),
    };
  }
};

export const login = (data: Object, credit: boolean) => async ({
  dispatch,
  apiClient,
}: ActionDeps => Promise<LoginAction>) => {
  try {
    dispatch(({ type: 'LOGIN_PENDING' }: LoginAction));

    const {
      data: { token },
    } = credit
      ? await apiClient.post('/users/login/registeredAccount', data)
      : await apiClient.postSecure('/users/login/unregisteredAccount', data);

    await apiClient.setAccessToken(token);
    await dispatch(authenticate());

    return { type: 'LOGIN_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));

    return {
      type: 'LOGIN_REJECTED',
      payload: errorResponse,
    };
  }
};

export const logout = () => async ({
  apiClient,
  dispatch,
  getState,
}: ActionDeps => Promise<LogoutAction>) => {
  try {
    dispatch(({ type: 'LOGOUT_PENDING' }: LogoutAction));

    apiClient.postAuth('/users/logout');
    apiClient.deleteAccessToken();

    const { navigation } = getState();
    const currentRoute = navigation.routes[navigation.index];
    const allowedRoles = get(currentRoute, 'params.allowedRoles');
    const isAllowed = !allowedRoles || allowedRoles.includes('ANONYMOUS');
    dispatch(isAllowed ? removeInner() : goTo('SearchRoutes'));

    return { type: 'LOGOUT_FULFILLED' };
  } catch (err) {
    return { type: 'LOGOUT_REJECTED', payload: getErrorResponse(err) };
  }
};

export const register = (
  data: Object,
  fromOpenTicket?: boolean,
  successCallback: Function = () => {},
) => async ({ dispatch, apiClient }: ActionDeps => Promise<RegistrationAction>) => {
  try {
    dispatch(({ type: 'REGISTRATION_PENDING' }: RegistrationAction));
    dispatch(setPostponeHistoryRemoval(true));
    const {
      data: { token },
    } = fromOpenTicket
      ? await apiClient.postAuth('/users/signup/registeredAccount/simple', data)
      : await apiClient.postSecure('/users/signup/registeredAccount', data);

    await apiClient.setAccessToken(token);
    await dispatch(authenticate());

    await successCallback();
    dispatch(setPostponeHistoryRemoval(false));

    return {
      type: 'REGISTRATION_FULFILLED',
    };
  } catch (err) {
    dispatch(setPostponeHistoryRemoval(false));

    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));

    return {
      type: 'REGISTRATION_REJECTED',
      payload: errorResponse,
    };
  }
};

type UserInfoKeys = Array<$Keys<User>>;

export const changeInfo = (formName: ChangeInfoFormName, data: Object) => async ({
  dispatch,
  apiClient,
  getState,
}: ActionDeps => Promise<ChangeInfoAction>) => {
  try {
    dispatch(({ type: 'CHANGE_INFO_PENDING', formName }: ChangeInfoAction));

    const user = get(getState(), 'user.user');
    const combinedUserData = { ...user, ...data };
    const payload = pick(
      combinedUserData,
      ([
        'phoneNumber',
        'restrictPhoneNumbers',
        'companyInformation',
        'company',
        'defaultTariffKey',
        'notifications',
      ]: UserInfoKeys),
    );
    payload.restrictPhoneNumbers = payload.phoneNumber !== '' && payload.restrictPhoneNumbers;
    payload.company = payload.companyInformation ? payload.company : {};

    const {
      data: { message },
    } = await apiClient.putAuth('/users/settings/changeUserInformation', payload);
    await dispatch(authenticate());
    dispatch(addGlobalMessage({ text: message, type: 'success' }));

    return {
      type: 'CHANGE_INFO_FULFILLED',
      formName,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));

    return {
      type: 'CHANGE_INFO_REJECTED',
      formName,
      payload: errorResponse,
    };
  }
};

export const changePassword = (data: Object) => async ({
  dispatch,
  apiClient,
}: ActionDeps => Promise<ChangePasswordAction>) => {
  try {
    dispatch(({ type: 'CHANGE_PASSWORD_PENDING' }: ChangePasswordAction));
    const {
      data: { message },
    } = await apiClient.putAuth('/users/settings/changePassword', data);
    dispatch(addGlobalMessage({ text: message, type: 'success' }));

    return {
      type: 'CHANGE_PASSWORD_FULFILLED',
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));

    return {
      type: 'CHANGE_PASSWORD_REJECTED',
      payload: errorResponse,
    };
  }
};

export const getUserPercentualDiscounts = () => async ({
  dispatch,
  apiClient,
}: ActionDeps => Promise<GetUserPercentualDiscountsAction>) => {
  try {
    dispatch({ type: 'GET_USER_PERCENTUAL_DISCOUNT_PENDING' });

    const { data } = await apiClient.getAuth('/discounts/percentual');
    return {
      type: 'GET_USER_PERCENTUAL_DISCOUNT_FULFILLED',
      payload: data,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));

    return {
      type: 'GET_USER_PERCENTUAL_DISCOUNT_REJECTED',
      payload: errorResponse,
    };
  }
};

export const setPostponeHistoryRemoval = (postpone: boolean): SetPostponeHistoryRemovalAction => ({
  type: 'SET_POSTPONE_HISTORY_REMOVAL',
  postpone,
});
