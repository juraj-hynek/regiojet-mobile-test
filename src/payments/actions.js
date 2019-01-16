// @flow
import { addGlobalError } from '../messages/actions';
import { getErrorResponse } from '../error/helpers';
import type { ActionDeps } from '../redux';
import type { ErrorResponse, Transaction } from '../types';

export type PaymentsAction =
  | { type: 'GET_PAYMENTS_PENDING' }
  | { type: 'GET_PAYMENTS_MORE_PENDING' }
  | {
      type: 'GET_PAYMENTS_FULFILLED' | 'GET_PAYMENTS_MORE_FULFILLED',
      payload: {
        payments: Array<Transaction>,
        total: number,
      },
    }
  | {
      type: 'GET_PAYMENTS_REJECTED' | 'GET_PAYMENTS_MORE_REJECTED',
      payload: ErrorResponse,
    };

export const getPayments = (query: Object, more: boolean = false) => async ({
  dispatch,
  apiClient,
  getState,
}: ActionDeps => Promise<PaymentsAction>) => {
  try {
    let offset = 0;
    if (more) {
      const paymentList = getState().payments.list;
      offset = paymentList.length;
    }
    const params = { ...query, offset };

    dispatch({ type: more ? 'GET_PAYMENTS_MORE_PENDING' : 'GET_PAYMENTS_PENDING' });
    const { data: payments, headers } = await apiClient.getAuth('/payments', { params });

    return {
      type: more ? 'GET_PAYMENTS_MORE_FULFILLED' : 'GET_PAYMENTS_FULFILLED',
      payload: {
        payments,
        total: headers['x-pagination-total'] || 0,
      },
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: more ? 'GET_PAYMENTS_MORE_REJECTED' : 'GET_PAYMENTS_REJECTED',
      payload: errorResponse,
    };
  }
};
