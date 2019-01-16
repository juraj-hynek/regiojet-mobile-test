// @flow
import get from 'lodash/get';
import moment from 'moment';

import { addGlobalError, addGlobalMessage } from '../messages/actions';
import { authenticate } from '../user/actions';
import { composeRouteData } from '../basket/helpers';
import { composePassengerData, composeSelectedAddonsData } from '../reservation/helpers';
import { composePageViewPayload, composePurchasePayload } from '../analytics';
import { getErrorResponse } from '../error/helpers';
import { payTicketsByCredit, redirectAfterPayment } from '../payment-methods/actions';
import { removeAllBasketItems } from '../basket/actions';
import { replaceAll } from '../navigation/actions';
import gtmPush from '../analytics/gtmPush';
import type { ActionDeps } from '../redux';
import type { BasketItem, Discount, ErrorResponse, Ticket, TicketListType } from '../types';

const TICKETS_PER_PAGE = 10;

type CreateTicketsAction = { type: 'CREATE_TICKETS_FULFILLED' };

type CreateTicketsAndPayByCreditAction = { type: 'CREATE_TICKETS_AND_PAY_BY_CREDIT_FULFILLED' };

type CreateTicketsRegisteredAction =
  | { type: 'CREATE_TICKETS_REGISTERED_PENDING' }
  | {
      type: 'CREATE_TICKETS_REGISTERED_FULFILLED',
      payload: Array<Ticket>,
    }
  | {
      type: 'CREATE_TICKETS_REGISTERED_REJECTED',
      payload: ErrorResponse,
    };

type CreateTicketsUnregisteredAction =
  | { type: 'CREATE_TICKETS_UNREGISTERED_PENDING' }
  | {
      type: 'CREATE_TICKETS_UNREGISTERED_FULFILLED',
      payload: Array<Ticket>,
    }
  | {
      type: 'CREATE_TICKETS_UNREGISTERED_REJECTED',
      payload: ErrorResponse,
    };

type GetTicketsAction =
  | { type: 'GET_TICKETS_PENDING' | 'GET_TICKETS_MORE_PENDING', listType: TicketListType }
  | {
      type: 'GET_TICKETS_FULFILLED' | 'GET_TICKETS_MORE_FULFILLED',
      listType: TicketListType,
      payload: {
        tickets: Array<Ticket>,
        total: number,
      },
    }
  | {
      type: 'GET_TICKETS_REJECTED' | 'GET_TICKETS_MORE_REJECTED',
      listType: TicketListType,
      payload: ErrorResponse,
    };

type RefreshTicketListAction = { type: 'REFRESH_TICKET_LIST' };

type RemoveTicketListErrorAction = {
  type: 'REMOVE_TICKET_LIST_ERROR_ACTION',
  listType: TicketListType,
};

export type TicketsAction =
  | CreateTicketsAction
  | CreateTicketsAndPayByCreditAction
  | CreateTicketsRegisteredAction
  | CreateTicketsUnregisteredAction
  | GetTicketsAction
  | RefreshTicketListAction
  | RemoveTicketListErrorAction;

const composeTicketData = (basketItem: BasketItem, percentualDiscounts: Array<Discount>) => {
  const basketItemCodeDiscount = get(basketItem, 'codeDiscount.code');
  const basketItemPercentualDiscountIds = percentualDiscounts
    .filter(discount => get(discount, 'applied.basketItemId') === basketItem.shortid)
    .map(discount => discount.id);

  const ticketData = {
    route: composeRouteData(basketItem),
    passengers: composePassengerData(basketItem),
    selectedAddons: composeSelectedAddonsData(basketItem.addons),
    codeDiscount: basketItemCodeDiscount,
    percentualDiscountIds: basketItemPercentualDiscountIds,
  };

  return ticketData;
};

const composeCreateTicketsData = (getState: Function) => {
  const {
    basket: { items, percentualDiscounts },
  } = getState();

  if (!items.length) {
    // TODO handle errors
    throw new Error('Basket is empty.');
  }

  return items.map(basketItem => composeTicketData(basketItem, percentualDiscounts));
};

const dispatchTicketErrors = (errorResponse: ErrorResponse, dispatch: Function): void => {
  const ticketErrorRegexp = /^ticketRequests.[0-9]+$/;
  const filteredFields = errorResponse.errorFields.filter(errorField =>
    ticketErrorRegexp.test(errorField.key),
  );

  if (!filteredFields.length) {
    dispatch(addGlobalError(errorResponse));
    return;
  }

  filteredFields.forEach(errorField => {
    dispatch(addGlobalMessage({ text: errorField.value, type: 'error' }));
  });
};

const createTicketsRegistered = (successCallback: Function = () => {}) => async ({
  dispatch,
  apiClient,
  getState,
}: ActionDeps): Promise<CreateTicketsRegisteredAction> => {
  try {
    dispatch({ type: 'CREATE_TICKETS_REGISTERED_PENDING' });

    const requestData = composeCreateTicketsData(getState);
    const { data } = await apiClient.postAuth('/tickets/create/registered', requestData);
    await successCallback(data.tickets);

    return {
      type: 'CREATE_TICKETS_REGISTERED_FULFILLED',
      payload: data.tickets,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatchTicketErrors(errorResponse, dispatch);
    return { type: 'CREATE_TICKETS_REGISTERED_REJECTED', payload: errorResponse };
  }
};

const createTicketsUnregistered = (successCallback: Function = () => {}) => async ({
  dispatch,
  apiClient,
  getState,
}: ActionDeps): Promise<CreateTicketsUnregisteredAction> => {
  try {
    dispatch({ type: 'CREATE_TICKETS_UNREGISTERED_PENDING' });

    const requestData = {
      agreeWithTerms: true,
      ticketRequests: composeCreateTicketsData(getState),
    };

    const { data } = await apiClient.postSecure('/tickets/create/unregistered', requestData);

    if (!data.token) {
      throw new Error('API did not return token');
    }

    await apiClient.setAccessToken(data.token);
    await dispatch(authenticate());
    await successCallback(data.tickets);

    return {
      type: 'CREATE_TICKETS_UNREGISTERED_FULFILLED',
      payload: data.tickets,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatchTicketErrors(errorResponse, dispatch);
    return { type: 'CREATE_TICKETS_UNREGISTERED_REJECTED', payload: errorResponse };
  }
};

const pushPageView = (isLoggedIn: boolean) =>
  gtmPush(composePageViewPayload('Confirm', isLoggedIn));

const getLoggedInState = (getState: Function): boolean => !!get(getState(), 'user.user');

const pushEcommerce = (tickets: Array<Ticket>) => gtmPush(composePurchasePayload(tickets));

export const createTickets = () => async ({
  dispatch,
  getState,
}: ActionDeps): Promise<CreateTicketsAction> => {
  const isLoggedIn = getLoggedInState(getState);

  const successCallback = async (tickets: Array<Ticket>) => {
    await dispatch(replaceAll('TicketPayment'));
    pushPageView(isLoggedIn);
    pushEcommerce(tickets);
    setTimeout(() => {
      dispatch(removeAllBasketItems());
    }, 500);
  };

  await dispatch(
    isLoggedIn
      ? createTicketsRegistered(successCallback)
      : createTicketsUnregistered(successCallback),
  );
  return { type: 'CREATE_TICKETS_FULFILLED' };
};

export const createTicketsAndPayByCredit = () => async ({
  dispatch,
  getState,
}: ActionDeps): Promise<CreateTicketsAndPayByCreditAction> => {
  const isLoggedIn = getLoggedInState(getState);

  const successCallback = async tickets => {
    const ticketIds = tickets.map(({ id }) => id);
    const { type } = await dispatch(payTicketsByCredit(ticketIds));
    const success = type === 'PAY_TICKETS_CREDIT_FULFILLED';
    await dispatch(redirectAfterPayment(ticketIds, success));
    pushPageView(isLoggedIn);
    pushEcommerce(tickets);
    setTimeout(() => {
      dispatch(removeAllBasketItems());
    }, 500);
  };

  await dispatch(createTicketsRegistered(successCallback));
  return { type: 'CREATE_TICKETS_AND_PAY_BY_CREDIT_FULFILLED' };
};

const composeGetTicketsQuery = (listType: TicketListType): Object => {
  const today = moment().toDate();

  switch (listType) {
    case 'new':
      return {
        departureFrom: today,
        sortDirection: 'ASC',
      };
    case 'old':
      return {
        departureTo: today,
      };
    case 'unpaid':
      return {
        sortDirection: 'ASC',
      };
    default:
      throw new Error(`Unexpected ticket list type "${listType}"`);
  }
};

export const getTickets = (listType: TicketListType, more: boolean = false) => async ({
  dispatch,
  apiClient,
  getState,
}: ActionDeps): Promise<GetTicketsAction> => {
  try {
    dispatch(
      ({
        type: more ? 'GET_TICKETS_MORE_PENDING' : 'GET_TICKETS_PENDING',
        listType,
      }: GetTicketsAction),
    );

    let url = '/tickets/unpaid';
    let query = composeGetTicketsQuery(listType);

    if (listType !== 'unpaid') {
      let offset = 0;

      if (more) {
        const ticketList = getState().tickets[listType].list;
        offset = ticketList.length;
      }

      url = '/tickets';
      query = { ...query, limit: TICKETS_PER_PAGE, offset };
    }

    // $FlowFixMe
    const { data: tickets, headers } = await apiClient.getAuth(url, { params: query });

    // $FlowFixMe
    return {
      type: more ? 'GET_TICKETS_MORE_FULFILLED' : 'GET_TICKETS_FULFILLED',
      listType,
      payload: {
        tickets,
        total: headers['x-pagination-total'] || 0,
      },
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    // TicketList.js takes care of firing general globalError for 'new' and 'old' listTypes
    if (more || listType === 'unpaid') {
      dispatch(addGlobalError(errorResponse));
    }
    return {
      type: more ? 'GET_TICKETS_MORE_REJECTED' : 'GET_TICKETS_REJECTED',
      listType,
      payload: errorResponse,
    };
  }
};

export const refreshTicketList = (): RefreshTicketListAction => ({ type: 'REFRESH_TICKET_LIST' });

export const removeTicketListError = (listType: TicketListType): RemoveTicketListErrorAction => ({
  type: 'REMOVE_TICKET_LIST_ERROR_ACTION',
  listType,
});
