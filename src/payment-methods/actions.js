// @flow
import { Linking } from 'react-native';
import get from 'lodash/get';

import { addGlobalError, addGlobalMessage } from '../messages/actions';
import { authenticate } from '../user/actions';
import { closeModal, openPaymentModal } from '../modal/actions';
import { getErrorResponse } from '../error/helpers';
import { goTo, replaceAll } from '../navigation/actions';
import { refreshTicket } from '../ticket/actions';
import { refreshTicketList } from '../tickets/actions';
import type { ActionDeps } from '../redux';
import type {
  ErrorResponse,
  GiftCertificateInfo,
  PaymentMethodFormField,
  PaymentMethod,
  Ticket,
} from '../types';

type AddCreditAction =
  | { type: 'ADD_CREDIT_PENDING' }
  | {
      type: 'ADD_CREDIT_FULFILLED',
    }
  | {
      type: 'ADD_CREDIT_REJECTED',
      payload: ErrorResponse,
    };

type AddCreditByGiftCertificateAction =
  | { type: 'ADD_CREDIT_BY_GIFT_CERTIFICATE_PENDING' }
  | {
      type: 'ADD_CREDIT_BY_GIFT_CERTIFICATE_FULFILLED',
    }
  | {
      type: 'ADD_CREDIT_BY_GIFT_CERTIFICATE_REJECTED',
      payload: ErrorResponse,
    };

type GetPaymentMethodFormFieldsAction =
  | { type: 'GET_METHOD_FORM_FIELDS_PENDING' }
  | {
      type: 'GET_METHOD_FORM_FIELDS_FULFILLED',
      fields: Array<PaymentMethodFormField>,
    }
  | {
      type: 'GET_METHOD_FORM_FIELDS_REJECTED',
      payload: ErrorResponse,
    };

type GetPaymentMethodsAction =
  | { type: 'GET_PAYMENT_METHODS_PENDING' }
  | {
      type: 'GET_PAYMENT_METHODS_FULFILLED',
      methods: Array<PaymentMethod>,
    }
  | {
      type: 'GET_PAYMENT_METHODS_REJECTED',
      payload: ErrorResponse,
    };

type InvokePaymentAction = { type: 'INVOKE_PAYMENT_FULFILLED' };

type PayAction =
  | { type: 'PAY_TICKETS_PENDING' }
  | {
      type: 'PAY_TICKETS_FULFILLED',
    }
  | {
      type: 'PAY_TICKETS_REJECTED',
      payload: ErrorResponse,
    };

export type PayByCreditAction =
  | { type: 'PAY_TICKETS_CREDIT_PENDING' }
  | {
      type: 'PAY_TICKETS_CREDIT_FULFILLED',
      remainingCredit: number,
    }
  | {
      type: 'PAY_TICKETS_CREDIT_REJECTED',
      payload: ErrorResponse,
    };

type RedirectAfterPaymentAction =
  | { type: 'REDIRECT_AFTER_PAYMENT_PENDING' }
  | { type: 'REDIRECT_AFTER_PAYMENT_FULFILLED' };

type VerifyGiftCertificateAction =
  | { type: 'VERIFY_GIFT_CERTIFICATE_PENDING' }
  | {
      type: 'VERIFY_GIFT_CERTIFICATE_FULFILLED',
      payload: GiftCertificateInfo,
    }
  | {
      type: 'VERIFY_GIFT_CERTIFICATE_REJECTED',
      payload: ErrorResponse,
    };

export type PaymentMethodsAction =
  | AddCreditAction
  | AddCreditByGiftCertificateAction
  | GetPaymentMethodFormFieldsAction
  | GetPaymentMethodsAction
  | InvokePaymentAction
  | PayAction
  | PayByCreditAction
  | RedirectAfterPaymentAction
  | VerifyGiftCertificateAction;

export const payTicketsByCredit = (ticketIds: Array<number>) => async ({
  dispatch,
  apiClient,
}: ActionDeps): Promise<PayByCreditAction> => {
  try {
    dispatch(({ type: 'PAY_TICKETS_CREDIT_PENDING' }: PayByCreditAction));
    const { data } = await apiClient.postAuth('/payments/credit/charge', { ticketIds });

    return {
      type: 'PAY_TICKETS_CREDIT_FULFILLED',
      remainingCredit: data.amount,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return { type: 'PAY_TICKETS_CREDIT_REJECTED', payload: errorResponse };
  }
};

export const redirectAfterPayment = (
  ticketIds: Array<number>,
  paymentSucceeded: boolean = true,
  shouldCloseModal: boolean = false,
) => async ({ dispatch }: ActionDeps): Promise<RedirectAfterPaymentAction> => {
  dispatch({ type: 'REDIRECT_AFTER_PAYMENT_PENDING' });

  if (shouldCloseModal) dispatch(closeModal());

  let message = null;
  if (ticketIds.length === 1) {
    if (paymentSucceeded) {
      dispatch(refreshTicket());
    } else {
      message = { messageId: 'ticket.pay.messageFail', type: 'error' };
    }
    await dispatch(replaceAll('Ticket', { ticketId: ticketIds[0] }));
  } else {
    message = paymentSucceeded
      ? { messageId: 'tickets.pay.messageSuccess', type: 'success' }
      : { messageId: 'tickets.pay.messageFail', type: 'error' };
    dispatch(refreshTicketList());
    await dispatch(replaceAll('Tickets'));
  }

  if (message) dispatch(addGlobalMessage(message));

  return { type: 'REDIRECT_AFTER_PAYMENT_FULFILLED' };
};

export const payTickets = (paymentData: Object) => async ({
  dispatch,
  apiClient,
}: ActionDeps): Promise<PayAction> => {
  try {
    dispatch(({ type: 'PAY_TICKETS_PENDING' }: PayAction));

    const { data } = await apiClient.postAuth('/payments/pay', paymentData);
    if (data.payRedirectUrl) {
      Linking.openURL(data.payRedirectUrl);
    }

    return { type: 'PAY_TICKETS_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return { type: 'PAY_TICKETS_REJECTED', payload: errorResponse };
  }
};

export const invokePayment = (tickets: Array<Ticket>) => async ({
  dispatch,
  getState,
}: ActionDeps): Promise<InvokePaymentAction> => {
  const user = get(getState(), 'user.user');
  const { credit } = user;
  const ticketPrice = tickets.reduce((total, ticket) => total + ticket.unpaid, 0);

  // user with not enough credit => open modal to pay / recharge credit and pay
  if (ticketPrice > credit) {
    dispatch(openPaymentModal(tickets));
    return { type: 'INVOKE_PAYMENT_FULFILLED' };
  }

  // user with enough credit => pay immediately from credit
  const ticketIds = tickets.map(({ id }) => id);
  const { type } = await dispatch(payTicketsByCredit(ticketIds));
  const success = type === 'PAY_TICKETS_CREDIT_FULFILLED';
  dispatch(redirectAfterPayment(ticketIds, success));
  return { type: 'INVOKE_PAYMENT_FULFILLED' };
};

export const getPaymentMethods = (ticketIds?: Array<number>) => async ({
  dispatch,
  apiClient,
}: ActionDeps => Promise<GetPaymentMethodsAction>) => {
  try {
    dispatch({ type: 'GET_PAYMENT_METHODS_PENDING' });
    const { data } = await apiClient.postAuth('/payments/methods', { ticketIds });

    return {
      type: 'GET_PAYMENT_METHODS_FULFILLED',
      methods: data,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return { type: 'GET_PAYMENT_METHODS_REJECTED', payload: errorResponse };
  }
};

export const getPaymentFormFields = (
  ticketIds: Array<number> = [],
  paymentMethodCode: string,
) => async ({ dispatch, apiClient }: ActionDeps => Promise<GetPaymentMethodFormFieldsAction>) => {
  try {
    dispatch({ type: 'GET_METHOD_FORM_FIELDS_PENDING' });
    const { data } = await apiClient.postAuth('/payments/form', {
      tickets: ticketIds,
      paymentMethodCode,
    });

    return {
      type: 'GET_METHOD_FORM_FIELDS_FULFILLED',
      fields: data,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return { type: 'GET_METHOD_FORM_FIELDS_REJECTED', payload: errorResponse };
  }
};

export const addCredit = (creditData: Object) => async ({
  dispatch,
  apiClient,
}: ActionDeps => Promise<AddCreditAction>) => {
  try {
    dispatch({ type: 'ADD_CREDIT_PENDING' });

    const { data } = await apiClient.postAuth('/payments/credit/add', creditData);
    if (data.payRedirectUrl) {
      Linking.openURL(data.payRedirectUrl);
    }

    return { type: 'ADD_CREDIT_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return { type: 'ADD_CREDIT_REJECTED', payload: errorResponse };
  }
};

export const verifyGiftCertificate = (
  certificateCode: string,
  successCallback: Function = () => {},
) => async ({ dispatch, apiClient }: ActionDeps => Promise<VerifyGiftCertificateAction>) => {
  try {
    dispatch(({ type: 'VERIFY_GIFT_CERTIFICATE_PENDING' }: VerifyGiftCertificateAction));
    const { data: certificateInfo } = await apiClient.postAuth(
      '/payments/credit/giftCertificate/verify',
      {
        certificateCode,
      },
    );

    successCallback();

    return {
      type: 'VERIFY_GIFT_CERTIFICATE_FULFILLED',
      payload: certificateInfo,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return { type: 'VERIFY_GIFT_CERTIFICATE_REJECTED', payload: errorResponse };
  }
};

export const addCreditByGiftCertificate = (
  certificate: string,
  email: string,
  successCallback: Function = () => {},
) => async ({ dispatch, apiClient }: ActionDeps => Promise<AddCreditByGiftCertificateAction>) => {
  try {
    dispatch(
      ({ type: 'ADD_CREDIT_BY_GIFT_CERTIFICATE_PENDING' }: AddCreditByGiftCertificateAction),
    );
    await apiClient.postAuth('/payments/credit/giftCertificate/add', { certificate, email });
    dispatch(authenticate());
    await dispatch(goTo('Payments'));
    dispatch(addGlobalMessage({ messageId: 'credit.add.messageSuccess', type: 'success' }));

    successCallback();

    return { type: 'ADD_CREDIT_BY_GIFT_CERTIFICATE_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return { type: 'ADD_CREDIT_BY_GIFT_CERTIFICATE_REJECTED', payload: errorResponse };
  }
};
