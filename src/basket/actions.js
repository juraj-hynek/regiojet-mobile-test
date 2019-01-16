// @flow
import get from 'lodash/get';
import shortid from 'shortid';

import { addGlobalError, addGlobalMessage } from '../messages/actions';
import {
  composeFreeSeatsData,
  composeRouteData,
  computeDiscountedTicketPrice,
} from '../basket/helpers';
import { composeSelectedAddonsData } from '../reservation/helpers';
import { getErrorResponse } from '../error/helpers';
import { composeBasketActionPayload } from '../analytics';
import gtmPush from '../analytics/gtmPush';
import type { ActionDeps } from '../redux';
import type {
  BasketItem,
  BasketItemSimple,
  Discount,
  ErrorResponse,
  RouteAddon,
  RoutePassenger,
  RoutePassengerChanges,
  Seat,
  SelectedSeat,
  VerifiedDiscountResponse,
} from '../types';

type AddBasketItemAction =
  | {
      type: 'ADD_BASKET_ITEM_PENDING',
      routeId: string,
    }
  | {
      type: 'ADD_BASKET_ITEM_FULFILLED',
      payload: { basketItem: BasketItem },
      routeId: string,
    }
  | {
      type: 'ADD_BASKET_ITEM_REJECTED',
      payload: ErrorResponse,
      routeId: string,
    };

type GetPercentualDiscountsAction =
  | {
      type: 'GET_PERCENTUAL_DISCOUNTS_PENDING',
    }
  | {
      type: 'GET_PERCENTUAL_DISCOUNTS_FULFILLED',
      payload: {
        percentualDiscounts: Array<Discount>,
      },
    }
  | {
      type: 'GET_PERCENTUAL_DISCOUNTS_REJECTED',
      payload: ErrorResponse,
    };

type MarkSpecialSeatsAction = {
  type: 'MARK_SPECIAL_SEATS',
  basketItemId: string,
  sectionId: number,
  specialSeats: Array<Seat>,
};

type PrefillPassengersAction = {
  type: 'PREFILL_PASSENGERS',
  changes: RoutePassengerChanges,
};

type RemoveAllBasketItemsAction = {
  type: 'REMOVE_ALL_BASKET_ITEMS',
};

type RemoveBasketItemAction = {
  type: 'REMOVE_BASKET_ITEM',
  basketItemId: string,
};

type RemoveCodeDiscountAction = {
  type: 'REMOVE_CODE_DISCOUNT',
  payload: { basketItemId: string },
};

type RemovePercentualDiscountAction = {
  type: 'REMOVE_PERCENTUAL_DISCOUNT',
  payload: { basketItemId: string, discountId: number, ticketPrice: number },
};

type SelectSeatAction = {
  type: 'SELECT_SEAT',
  basketItemId: string,
  seat: SelectedSeat,
};

type UpdateAddonAction =
  | { type: 'UPDATE_ADDON_PENDING' }
  | {
      type: 'UPDATE_ADDON_FULFILLED',
      payload: {
        basketItemId: string,
        updatedAddons: Array<RouteAddon>,
      },
    }
  | {
      type: 'UPDATE_ADDON_REJECTED',
      payload: ErrorResponse,
    };

type UpdatePassengerAction = {
  type: 'UPDATE_PASSENGER',
  basketItemId: string,
  fields: RoutePassenger,
  passengerIndex: number,
  setTouched: boolean,
};

type VerifyCodeDiscountAction =
  | { type: 'VERIFY_CODE_DISCOUNT_PENDING' }
  | {
      type: 'VERIFY_CODE_DISCOUNT_FULFILLED',
      payload: {
        basketItemId: string,
        code: string,
        verifiedDiscount: VerifiedDiscountResponse,
      },
    }
  | {
      type: 'VERIFY_CODE_DISCOUNT_REJECTED',
      payload: ErrorResponse,
    };

type VerifyPercentualDiscountAction =
  | { type: 'VERIFY_PERCENTUAL_DISCOUNT_PENDING' }
  | {
      type: 'VERIFY_PERCENTUAL_DISCOUNT_FULFILLED',
      payload: {
        basketItemId: string,
        discountId: number,
        ticketPrice: number,
        verifiedDiscount: VerifiedDiscountResponse,
      },
    }
  | {
      type: 'VERIFY_PERCENTUAL_DISCOUNT_REJECTED',
      payload: ErrorResponse,
    };

export type BasketAction =
  | AddBasketItemAction
  | GetPercentualDiscountsAction
  | MarkSpecialSeatsAction
  | PrefillPassengersAction
  | RemoveAllBasketItemsAction
  | RemoveBasketItemAction
  | RemoveCodeDiscountAction
  | RemovePercentualDiscountAction
  | SelectSeatAction
  | UpdateAddonAction
  | UpdatePassengerAction
  | VerifyCodeDiscountAction
  | VerifyPercentualDiscountAction;

export const composeAddonsQuery = (basketItemSimple: BasketItemSimple | BasketItem) => ({
  tariffs: basketItemSimple.selectedPriceClass.tariffs,
  routeSections: basketItemSimple.route.sections.map(
    ({ arrivalStationId, departureStationId, id }) => ({
      arrivalStationId,
      departureStationId,
      sectionId: id,
    }),
  ),
});

const fetchRouteAddons = async (apiClient, basketItemSimple: BasketItemSimple) => {
  const { data: addons } = await apiClient.post('/addons', composeAddonsQuery(basketItemSimple));
  return addons.map(addon => ({
    ...addon,
    id: addon.addonId,
    checked: false,
    count: 1,
    originalCount: 0,
  }));
};

const fetchRoutePassengersData = async (apiClient, basketItemSimple: BasketItemSimple) => {
  const {
    route: { id, sections },
    selectedPriceClass,
  } = basketItemSimple;
  const query = {
    priceSource: selectedPriceClass.priceSource,
    seatClass: selectedPriceClass.seatClassKey,
    sections: sections.map(section => ({
      fromStationId: section.departureStationId,
      sectionId: section.id,
      toStationId: section.arrivalStationId,
    })),
    tariffs: selectedPriceClass.tariffs,
  };

  const { data: passengersData } = await apiClient.post(`/routes/${id}/passengersData`, query);
  return passengersData;
};

const fetchRouteSeats = async (apiClient, basketItemSimple: BasketItemSimple) => {
  const {
    route: { id, sections },
    selectedPriceClass,
  } = basketItemSimple;
  const query = composeFreeSeatsData(
    selectedPriceClass.seatClassKey,
    sections,
    selectedPriceClass.tariffs,
  );
  const { data: seats } = await apiClient.post(`/routes/${id}/freeSeats`, query);
  return seats;
};

export const addBasketItem = (basketItemSimple: BasketItemSimple) => async ({
  dispatch,
  apiClient,
  getState,
}: ActionDeps): Promise<AddBasketItemAction> => {
  const routeId = basketItemSimple.route.id;

  try {
    dispatch(({ type: 'ADD_BASKET_ITEM_PENDING', routeId }: AddBasketItemAction));
    const [addons, passengersData, seats] = await Promise.all([
      fetchRouteAddons(apiClient, basketItemSimple),
      fetchRoutePassengersData(apiClient, basketItemSimple),
      fetchRouteSeats(apiClient, basketItemSimple),
    ]);

    const basketItem = {
      ...basketItemSimple,
      addons,
      passengers: [],
      passengersData,
      passengerTouched: {},
      seats,
      shortid: shortid.generate(),
    };

    const {
      localization: { currency },
      user: { user },
    } = getState();
    const showCreditPrice = get(user, 'creditPrice');
    const payload = composeBasketActionPayload('add', basketItem, currency, showCreditPrice);
    gtmPush(payload);

    return {
      type: 'ADD_BASKET_ITEM_FULFILLED',
      payload: { basketItem },
      routeId,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'ADD_BASKET_ITEM_REJECTED',
      payload: errorResponse,
      routeId,
    };
  }
};

export const markSpecialSeats = (
  basketItemId: string,
  sectionId: number,
  specialSeats: Array<Seat>,
): MarkSpecialSeatsAction => ({
  type: 'MARK_SPECIAL_SEATS',
  basketItemId,
  sectionId,
  specialSeats,
});

export const removeAllBasketItems = (): RemoveAllBasketItemsAction => ({
  type: 'REMOVE_ALL_BASKET_ITEMS',
});

export const removeBasketItem = (basketItem: BasketItem) => ({
  getState,
}: ActionDeps): RemoveBasketItemAction => {
  const {
    localization: { currency },
    user: { user },
  } = getState();
  const showCreditPrice = get(user, 'creditPrice');

  const payload = composeBasketActionPayload('remove', basketItem, currency, showCreditPrice);
  gtmPush(payload);

  return {
    type: 'REMOVE_BASKET_ITEM',
    basketItemId: basketItem.shortid,
  };
};

export const selectSeat = (basketItemId: string, seat: SelectedSeat): SelectSeatAction => ({
  type: 'SELECT_SEAT',
  basketItemId,
  seat,
});

export const updateAddon = (
  basketItem: BasketItem,
  addonId: string,
  count: number,
  checked: boolean,
) => async ({ dispatch, apiClient }: ActionDeps): Promise<UpdateAddonAction> => {
  try {
    dispatch(({ type: 'UPDATE_ADDON_PENDING' }: UpdateAddonAction));

    const { addons } = basketItem;
    const addonIndex = addons.findIndex(addon => addon.id === addonId);
    const updatedAddons = [
      ...addons.slice(0, addonIndex),
      { ...addons[addonIndex], checked, count },
      ...addons.slice(addonIndex + 1),
    ];

    const selectedAddons = composeSelectedAddonsData(updatedAddons);
    const query = composeAddonsQuery(basketItem);
    await apiClient.post('/addons/verify', { ...query, selectedAddons });

    return {
      type: 'UPDATE_ADDON_FULFILLED',
      payload: {
        basketItemId: basketItem.shortid,
        updatedAddons,
      },
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    const message = get(errorResponse, 'errorFields[0].value', errorResponse.message);
    dispatch(addGlobalMessage({ text: message, type: 'error' }));
    return {
      type: 'UPDATE_ADDON_REJECTED',
      payload: errorResponse,
    };
  }
};

export const getPercentualDiscounts = () => async ({
  dispatch,
  apiClient,
  getState,
}: ActionDeps): Promise<GetPercentualDiscountsAction> => {
  try {
    dispatch(({ type: 'GET_PERCENTUAL_DISCOUNTS_PENDING' }: GetPercentualDiscountsAction));

    const {
      user: { role },
    } = getState();
    let percentualDiscounts = [];
    if (role !== 'ANONYMOUS') {
      const { data } = await apiClient.getAuth('/discounts/percentual');
      percentualDiscounts = data;
    }

    // $FlowFixMe
    return {
      type: 'GET_PERCENTUAL_DISCOUNTS_FULFILLED',
      payload: { percentualDiscounts },
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'GET_PERCENTUAL_DISCOUNTS_REJECTED',
      payload: errorResponse,
    };
  }
};

export const composeVerifyDiscountData = (getState: Function, basketItem: BasketItem) => {
  const {
    user: { role, user },
  } = getState();
  const userEmail = get(user, 'email');

  return {
    ticketPrice: computeDiscountedTicketPrice(basketItem, role === 'CREDIT'),
    route: composeRouteData(basketItem),
    passengers: basketItem.selectedPriceClass.tariffs.map(tariff => ({
      email: userEmail,
      tariff,
    })),
  };
};

export const verifyPercentualDiscount = (discountId: number, basketItem: BasketItem) => async ({
  dispatch,
  apiClient,
  getState,
}: ActionDeps): Promise<VerifyPercentualDiscountAction> => {
  try {
    dispatch(({ type: 'VERIFY_PERCENTUAL_DISCOUNT_PENDING' }: VerifyPercentualDiscountAction));

    const payload = composeVerifyDiscountData(getState, basketItem);
    const { data: verifiedDiscount } = await apiClient.postAuth(
      `/discounts/percentual/${discountId}/verify`,
      payload,
    );

    return {
      type: 'VERIFY_PERCENTUAL_DISCOUNT_FULFILLED',
      payload: {
        basketItemId: basketItem.shortid,
        discountId,
        ticketPrice: payload.ticketPrice,
        verifiedDiscount,
      },
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'VERIFY_PERCENTUAL_DISCOUNT_REJECTED',
      payload: errorResponse,
    };
  }
};

export const removePercentualDiscount = (discountId: number, basketItem: BasketItem) => async ({
  getState,
}: ActionDeps): Promise<RemovePercentualDiscountAction> => {
  const {
    user: { role },
  } = getState();
  const ticketPrice = computeDiscountedTicketPrice(basketItem, role === 'CREDIT');

  return {
    type: 'REMOVE_PERCENTUAL_DISCOUNT',
    payload: { basketItemId: basketItem.shortid, discountId, ticketPrice },
  };
};

export const verifyCodeDiscount = (code: string, basketItem: BasketItem) => async ({
  dispatch,
  apiClient,
  getState,
}: ActionDeps): Promise<VerifyCodeDiscountAction> => {
  try {
    dispatch(({ type: 'VERIFY_CODE_DISCOUNT_PENDING' }: VerifyCodeDiscountAction));

    const payload = composeVerifyDiscountData(getState, basketItem);
    const { data: verifiedDiscount } = await apiClient.post(
      `/discounts/code/${code}/verify`,
      payload,
    );

    return {
      type: 'VERIFY_CODE_DISCOUNT_FULFILLED',
      payload: {
        basketItemId: basketItem.shortid,
        code,
        verifiedDiscount,
      },
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'VERIFY_CODE_DISCOUNT_REJECTED',
      payload: errorResponse,
    };
  }
};

export const removeCodeDiscount = (basketItemId: string): RemoveCodeDiscountAction => ({
  type: 'REMOVE_CODE_DISCOUNT',
  payload: { basketItemId },
});

export const prefillPassengers = (changes: RoutePassengerChanges): PrefillPassengersAction => ({
  type: 'PREFILL_PASSENGERS',
  changes,
});

export const updatePassenger = (
  basketItemId: string,
  passengerIndex: number,
  fields: RoutePassenger,
  setTouched: boolean,
): UpdatePassengerAction => ({
  type: 'UPDATE_PASSENGER',
  basketItemId,
  fields,
  passengerIndex,
  setTouched,
});
