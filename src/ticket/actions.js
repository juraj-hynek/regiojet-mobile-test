// @flow
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';

import { addGlobalError, addGlobalMessage } from '../messages/actions';
import { authenticate } from '../user/actions';
import { composeFreeSeatsData } from '../basket/helpers';
import { composeSelectedAddonsData } from '../reservation/helpers';
import { getCancelModalType } from './helpers';
import { getErrorResponse } from '../error/helpers';
import { goBack, replaceLast } from '../navigation/actions';
import { refreshTicketList } from '../tickets/actions';
import type { ActionDeps } from '../redux';
import type {
  ErrorResponse,
  RatingFormData,
  RouteAddon,
  RouteSeatsResponse,
  SectionPutRatingRequest,
  SelectedSeat,
  SuccessResponse,
  Ticket,
} from '../types';

type CancelPassengerAction =
  | { type: 'CANCEL_PASSENGER_PENDING' }
  | { type: 'CANCEL_PASSENGER_FULFILLED' }
  | {
      type: 'CANCEL_PASSENGER_REJECTED',
      payload: ErrorResponse,
    };

type CancelTicketAction =
  | { type: 'CANCEL_TICKET_PENDING' }
  | { type: 'CANCEL_TICKET_FULFILLED' }
  | {
      type: 'CANCEL_TICKET_REJECTED',
      payload: ErrorResponse,
    };

type EditPassengerAction =
  | { type: 'EDIT_PASSENGER_PENDING' }
  | { type: 'EDIT_PASSENGER_FULFILLED' }
  | {
      type: 'EDIT_PASSENGER_REJECTED',
      payload: ErrorResponse,
    };

type GetTicketAction =
  | { type: 'GET_TICKET_PENDING' }
  | { type: 'GET_TICKET_FULFILLED', payload: Ticket }
  | {
      type: 'GET_TICKET_REJECTED',
      payload: ErrorResponse,
    };

type GetTicketAddonsAction =
  | { type: 'GET_TICKET_ADDONS_PENDING' }
  | { type: 'GET_TICKET_ADDONS_FULFILLED', payload: Array<RouteAddon> }
  | {
      type: 'GET_TICKET_ADDONS_REJECTED',
      payload: ErrorResponse,
    };

type GetTicketFreeSeatsAction =
  | { type: 'GET_TICKET_FREE_SEATS_PENDING' }
  | { type: 'GET_TICKET_FREE_SEATS_FULFILLED', payload: Array<RouteSeatsResponse> }
  | {
      type: 'GET_TICKET_FREE_SEATS_REJECTED',
      payload: ErrorResponse,
    };

type GetTicketRatingFormAction =
  | { type: 'GET_TICKET_RATING_FORM_PENDING' }
  | { type: 'GET_TICKET_RATING_FORM_FULFILLED', payload: RatingFormData }
  | {
      type: 'GET_TICKET_RATING_FORM_REJECTED',
      payload: ErrorResponse,
    };

type RefreshTicketAction = { type: 'REFRESH_TICKET' };

type SaveTicketAddonsAction =
  | { type: 'SAVE_TICKET_ADDONS_PENDING' }
  | { type: 'SAVE_TICKET_ADDONS_FULFILLED' }
  | {
      type: 'SAVE_TICKET_ADDONS_REJECTED',
      payload: ErrorResponse,
    };

type SendTicketByEmailAction =
  | { type: 'SEND_TICKET_BY_EMAIL_PENDING' }
  | { type: 'SEND_TICKET_BY_EMAIL_FULFILLED' }
  | {
      type: 'SEND_TICKET_BY_EMAIL_REJECTED',
      payload: ErrorResponse,
    };

type SendTicketRatingFormAction =
  | { type: 'SEND_TICKET_RATING_FORM_PENDING' }
  | { type: 'SEND_TICKET_RATING_FORM_FULFILLED' }
  | {
      type: 'SEND_TICKET_RATING_FORM_REJECTED',
      payload: ErrorResponse,
    };

type UpdateTicketAddonAction =
  | { type: 'UPDATE_TICKET_ADDON_PENDING' }
  | {
      type: 'UPDATE_TICKET_ADDON_FULFILLED',
      payload: {
        updatedAddons: Array<RouteAddon>,
      },
    }
  | {
      type: 'UPDATE_TICKET_ADDON_REJECTED',
      payload: ErrorResponse,
    };

export type TicketAction =
  | CancelPassengerAction
  | CancelTicketAction
  | EditPassengerAction
  | GetTicketAction
  | GetTicketAddonsAction
  | GetTicketFreeSeatsAction
  | GetTicketRatingFormAction
  | RefreshTicketAction
  | SaveTicketAddonsAction
  | SendTicketByEmailAction
  | SendTicketRatingFormAction
  | UpdateTicketAddonAction;

export const getTicket = (ticketId: number, successCallback: Function = () => {}) => async ({
  dispatch,
  apiClient,
}: ActionDeps): Promise<GetTicketAction> => {
  try {
    dispatch(({ type: 'GET_TICKET_PENDING' }: GetTicketAction));
    const { data: ticket } = await apiClient.getAuth(`/tickets/${ticketId}`);
    successCallback(ticket);

    return {
      type: 'GET_TICKET_FULFILLED',
      payload: ticket,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'GET_TICKET_REJECTED',
      payload: errorResponse,
    };
  }
};

export const getTicketRatingForm = (ticketId: number) => async ({
  dispatch,
  apiClient,
}: ActionDeps): Promise<GetTicketRatingFormAction> => {
  try {
    dispatch(({ type: 'GET_TICKET_RATING_FORM_PENDING' }: GetTicketRatingFormAction));
    const { data: form } = await apiClient.getAuth(`/tickets/${ticketId}/rating`);

    return {
      type: 'GET_TICKET_RATING_FORM_FULFILLED',
      payload: form,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'GET_TICKET_RATING_FORM_REJECTED',
      payload: errorResponse,
    };
  }
};

export const sendTicketRatingForm = (
  ticketId: number,
  forms: Array<SectionPutRatingRequest>,
) => async ({ dispatch, apiClient }: ActionDeps): Promise<SendTicketRatingFormAction> => {
  try {
    dispatch(({ type: 'SEND_TICKET_RATING_FORM_PENDING' }: SendTicketRatingFormAction));
    await apiClient.putAuth(`/tickets/${ticketId}/rating`, { forms });
    await dispatch(goBack());
    dispatch(addGlobalMessage({ messageId: 'review.message.success', type: 'success' }));

    return { type: 'SEND_TICKET_RATING_FORM_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'SEND_TICKET_RATING_FORM_REJECTED',
      payload: errorResponse,
    };
  }
};

export const sendTicketByEmail = (
  ticketId: number,
  email: string,
  successCallback: Function = () => {},
) => async ({ dispatch, apiClient }: ActionDeps): Promise<SendTicketByEmailAction> => {
  try {
    dispatch(({ type: 'SEND_TICKET_BY_EMAIL_PENDING' }: SendTicketByEmailAction));
    await apiClient.postAuth(`/tickets/${ticketId}/sendByEmail`, { email });
    successCallback();
    dispatch(addGlobalMessage({ messageId: 'ticket.email.successfullySent', type: 'success' }));

    return { type: 'SEND_TICKET_BY_EMAIL_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'SEND_TICKET_BY_EMAIL_REJECTED',
      payload: errorResponse,
    };
  }
};

export const refreshTicket = (): RefreshTicketAction => ({ type: 'REFRESH_TICKET' });

const composeTicketAddonsQuery = (ticket: Ticket) => ({
  tariffs: ticket.passengersInfo.passengers.map(passenger => passenger.tariff),
  routeSections: ticket.outboundRouteSections.map(
    ({ section: { arrivalStationId, departureStationId, id } }) => ({
      arrivalStationId,
      departureStationId,
      sectionId: id,
    }),
  ),
  ticketId: ticket.id,
});

export const getTicketAddons = (ticket: Ticket) => async ({
  dispatch,
  apiClient,
}: ActionDeps => Promise<GetTicketAddonsAction>) => {
  try {
    dispatch({ type: 'GET_TICKET_ADDONS_PENDING' });
    const query = composeTicketAddonsQuery(ticket);
    const { data: addons } = await apiClient.post('/addons', query);

    const groupedExistingAddons = groupBy(ticket.outboundAddons, addon => addon.id);
    const addonsWithCheckedAndCount = addons.map(addon => {
      const originalCount = (groupedExistingAddons[addon.addonId] || []).length;
      return {
        ...addon,
        id: addon.addonId,
        checked: originalCount > 0,
        count: originalCount || 1,
        originalCount,
      };
    });

    return {
      type: 'GET_TICKET_ADDONS_FULFILLED',
      payload: addonsWithCheckedAndCount,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'GET_TICKET_ADDONS_REJECTED',
      payload: errorResponse,
    };
  }
};

export const updateTicketAddon = (
  ticket: Ticket,
  addons: Array<RouteAddon>,
  addonId: string,
  count: number,
  checked: boolean,
) => async ({ dispatch, apiClient }: ActionDeps): Promise<UpdateTicketAddonAction> => {
  try {
    dispatch(({ type: 'UPDATE_TICKET_ADDON_PENDING' }: UpdateTicketAddonAction));

    const addonIndex = addons.findIndex(addon => addon.id === addonId);
    const updatedAddons = [
      ...addons.slice(0, addonIndex),
      { ...addons[addonIndex], checked, count },
      ...addons.slice(addonIndex + 1),
    ];

    const selectedAddons = composeSelectedAddonsData(updatedAddons);
    const query = composeTicketAddonsQuery(ticket);
    await apiClient.post('/addons/verify', { ...query, selectedAddons });

    return {
      type: 'UPDATE_TICKET_ADDON_FULFILLED',
      payload: {
        updatedAddons,
      },
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    const message = get(errorResponse, 'errorFields[0].value', errorResponse.message);
    dispatch(addGlobalMessage({ text: message, type: 'error' }));
    return {
      type: 'UPDATE_TICKET_ADDON_REJECTED',
      payload: errorResponse,
    };
  }
};

export const saveTicketAddons = (
  ticketId: number,
  addons: Array<RouteAddon>,
  successCallback: Function = () => {},
) => async ({ dispatch, apiClient }: ActionDeps): Promise<SaveTicketAddonsAction> => {
  try {
    dispatch({ type: 'SAVE_TICKET_ADDONS_PENDING' });

    const addedAddons = addons
      .map(addon => ({ ...addon, count: addon.count - addon.originalCount }))
      .filter(addon => addon.checked && addon.count > 0);

    if (addedAddons.length > 0) {
      const selectedAddons = composeSelectedAddonsData(addedAddons);
      await apiClient.putAuth(`/addons?ticketId=${ticketId}`, { selectedAddons });

      successCallback();
      dispatch(refreshTicket());
      dispatch(refreshTicketList());
    } else {
      successCallback();
    }

    return { type: 'SAVE_TICKET_ADDONS_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'SAVE_TICKET_ADDONS_REJECTED',
      payload: errorResponse,
    };
  }
};

export const cancelTicket = (
  ticket: Ticket,
  refundToOriginalSource: boolean,
  successCallback: Function = () => {},
) => async ({ dispatch, apiClient }: ActionDeps): Promise<CancelTicketAction> => {
  try {
    dispatch({ type: 'CANCEL_TICKET_PENDING' });

    const response = await apiClient.putAuth(`/tickets/${ticket.id}/cancel`, {
      refundToOriginalSource,
      controlHash: ticket.conditions.code,
    });
    const successResponse: SuccessResponse = response.data;

    // money is returned to credit => user must be refreshed
    if (!refundToOriginalSource) {
      dispatch(authenticate());
    }
    dispatch(refreshTicketList());
    await dispatch(replaceLast('Tickets'));

    successResponse.messageFields.forEach(({ key, value }) => {
      dispatch(
        addGlobalMessage({
          messageId: `ticket.stornoModal.messages.${key}`,
          type: 'warning',
          values: { response: value },
        }),
      );
    });
    dispatch(addGlobalMessage({ text: successResponse.message, type: 'success' }));

    successCallback();

    return { type: 'CANCEL_TICKET_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'CANCEL_TICKET_REJECTED',
      payload: errorResponse,
    };
  }
};

export const editPassenger = (
  ticketId: number,
  passengerId: number,
  data: Object,
  successCallback: Function = () => {},
) => async ({ dispatch, apiClient }: ActionDeps): Promise<EditPassengerAction> => {
  try {
    dispatch({ type: 'EDIT_PASSENGER_PENDING' });
    await apiClient.putAuth(`/tickets/${ticketId}/passengers/${passengerId}`, data);

    dispatch(refreshTicketList());
    dispatch(refreshTicket());
    successCallback();
    dispatch(addGlobalMessage({ messageId: 'ticket.passengerModal.success', type: 'success' }));

    return { type: 'EDIT_PASSENGER_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'EDIT_PASSENGER_REJECTED',
      payload: errorResponse,
    };
  }
};

export const getTicketFreeSeats = (ticket: Ticket) => async ({
  dispatch,
  apiClient,
}: ActionDeps): Promise<GetTicketFreeSeatsAction> => {
  try {
    dispatch({ type: 'GET_TICKET_FREE_SEATS_PENDING' });
    const { outboundRouteSections, passengersInfo, routeId, seatClassKey } = ticket;
    const query = composeFreeSeatsData(
      seatClassKey,
      outboundRouteSections.map(ticketSection => ticketSection.section),
      passengersInfo.passengers.map(passenger => passenger.tariff),
    );
    const { data: seats } = await apiClient.post(`/routes/${routeId}/freeSeats`, query);
    // $FlowFixMe seats are expected to be an Array but Flow thinks data is Object
    return { type: 'GET_TICKET_FREE_SEATS_FULFILLED', payload: seats };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'GET_TICKET_FREE_SEATS_REJECTED',
      payload: errorResponse,
    };
  }
};

export const cancelPassenger = (
  ticket: Ticket,
  passengerId: number,
  seats: Array<SelectedSeat>,
  refundToOriginalSource: boolean,
  successCallback: Function = () => {},
) => async ({ dispatch, apiClient }: ActionDeps): Promise<CancelPassengerAction> => {
  try {
    dispatch({ type: 'CANCEL_PASSENGER_PENDING' });
    await apiClient.deleteAuth(`/tickets/${ticket.id}/passengers/${passengerId}`, {
      refundToOriginalSource,
      seats,
    });

    // money is returned to credit => user must be refreshed
    if (!refundToOriginalSource) {
      dispatch(authenticate());
    }
    dispatch(refreshTicketList());
    dispatch(refreshTicket());
    successCallback();
    dispatch(
      addGlobalMessage({
        messageId: `ticket.passengerCancelModal.${getCancelModalType(ticket)}.success`,
        type: 'success',
      }),
    );

    return { type: 'CANCEL_PASSENGER_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'CANCEL_PASSENGER_REJECTED',
      payload: errorResponse,
    };
  }
};
