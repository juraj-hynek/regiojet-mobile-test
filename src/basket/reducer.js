// @flow
import flow from 'lodash/fp/flow';
import get from 'lodash/get';
import merge from 'lodash/fp/merge';
import moment from 'moment';
import omit from 'lodash/omit';
import set from 'lodash/fp/set';
import update from 'lodash/fp/update';

import { recalculatePercentualDiscounts } from '../reservation/helpers';
import type { BasketAction } from './actions';
import type { BasketItem, Discount, ErrorResponse } from '../types';
import type { PersistRehydrateAction } from '../redux';

export type BasketState = {
  +error: ?ErrorResponse,
  +isFetching: { [routeId: string]: boolean },
  +isUpdatingAddons: boolean,
  +isVerifyingCodeDiscount: boolean,
  +isVerifyingPercentualDiscount: boolean,
  +items: Array<BasketItem>,
  +lastChange: moment,
  +percentualDiscounts: Array<Discount>,
};

const INITIAL_STATE = {
  error: null,
  isFetching: {},
  isUpdatingAddons: false,
  isVerifyingCodeDiscount: false,
  isVerifyingPercentualDiscount: false,
  items: [],
  lastChange: moment(),
  percentualDiscounts: [],
};

const findBasketItemIndex = (state: BasketState, basketItemId: string): number =>
  state.items.findIndex(item => item.shortid === basketItemId);

const findSectionIndex = (state: BasketState, basketItemIndex: number, sectionId: number): number =>
  state.items[basketItemIndex].seats.findIndex(section => section.sectionId === sectionId);

export default (
  state: BasketState = INITIAL_STATE,
  action: BasketAction | PersistRehydrateAction,
) => {
  switch (action.type) {
    case 'persist/REHYDRATE': {
      if (!action.payload || !action.payload.basket) {
        return state;
      }
      const { items, lastChange, percentualDiscounts } = action.payload.basket;
      return { ...INITIAL_STATE, items, lastChange, percentualDiscounts };
    }

    case 'ADD_BASKET_ITEM_PENDING':
      return { ...state, error: null, isFetching: { ...state.isFetching, [action.routeId]: true } };
    case 'ADD_BASKET_ITEM_REJECTED': {
      const { payload, routeId } = action;
      return {
        ...state,
        error: payload,
        isFetching: { ...state.isFetching, [routeId]: false },
      };
    }
    case 'ADD_BASKET_ITEM_FULFILLED': {
      const { payload, routeId } = action;
      return {
        ...state,
        isFetching: { ...state.isFetching, [routeId]: false },
        items: [payload.basketItem, ...state.items],
        lastChange: moment(),
      };
    }

    case 'MARK_SPECIAL_SEATS': {
      const { basketItemId, sectionId, specialSeats } = action;
      const basketItemIndex = findBasketItemIndex(state, basketItemId);
      const sectionIndex = findSectionIndex(state, basketItemIndex, sectionId);

      return update(
        `items[${basketItemIndex}].seats[${sectionIndex}].selectedSeats`,
        selectedSeats =>
          selectedSeats.map(selectedSeat => {
            const specialSeatsModalShown =
              selectedSeat.specialSeatsModalShown ||
              specialSeats.some(specialSeat => specialSeat.index === selectedSeat.seatIndex);
            return { ...selectedSeat, specialSeatsModalShown };
          }),
        state,
      );
    }

    case 'REMOVE_ALL_BASKET_ITEMS':
      return INITIAL_STATE;

    case 'REMOVE_BASKET_ITEM': {
      const { basketItemId } = action;

      const updatedDiscounts = state.percentualDiscounts.map(discount => {
        if (!discount.applied || discount.applied.basketItemId !== basketItemId) {
          return discount;
        }
        return omit(discount, 'applied');
      });

      return {
        ...state,
        items: state.items.filter(item => item.shortid !== basketItemId),
        percentualDiscounts: updatedDiscounts,
      };
    }

    case 'SELECT_SEAT': {
      const { basketItemId, seat } = action;
      const basketItemIndex = findBasketItemIndex(state, basketItemId);
      const sectionIndex = findSectionIndex(state, basketItemIndex, seat.sectionId);

      return update(
        `items[${basketItemIndex}].seats[${sectionIndex}].selectedSeats`,
        selectedSeats => [...selectedSeats.splice(1), seat],
        state,
      );
    }

    case 'UPDATE_ADDON_PENDING':
      return { ...state, isUpdatingAddons: true };
    case 'UPDATE_ADDON_REJECTED':
      return { ...state, isUpdatingAddons: false };
    case 'UPDATE_ADDON_FULFILLED': {
      const { basketItemId, updatedAddons } = action.payload;
      const basketItemIndex = findBasketItemIndex(state, basketItemId);

      return flow(
        set(`items[${basketItemIndex}].addons`, updatedAddons),
        set('isUpdatingAddons', false),
      )(state);
    }

    case 'GET_PERCENTUAL_DISCOUNTS_FULFILLED': {
      const { percentualDiscounts } = action.payload;
      const oldPercentualDiscounts = state.percentualDiscounts.map(percentualDiscount =>
        omit(percentualDiscount, 'applied'),
      );

      // there was no change => keep what user selected
      if (JSON.stringify(percentualDiscounts) === JSON.stringify(oldPercentualDiscounts)) {
        return state;
      }
      return { ...state, percentualDiscounts };
    }

    case 'VERIFY_PERCENTUAL_DISCOUNT_PENDING':
      return { ...state, isVerifyingPercentualDiscount: true };
    case 'VERIFY_PERCENTUAL_DISCOUNT_REJECTED':
      return { ...state, isVerifyingPercentualDiscount: false };
    case 'VERIFY_PERCENTUAL_DISCOUNT_FULFILLED': {
      const { basketItemId, discountId, ticketPrice, verifiedDiscount } = action.payload;
      const discountIndex = state.percentualDiscounts.findIndex(
        discount => discount.id === discountId,
      );

      const newState = flow(
        set(`percentualDiscounts[${discountIndex}].applied`, { basketItemId, ...verifiedDiscount }),
        set('isVerifyingPercentualDiscount', false),
      )(state);
      const percentualDiscounts = recalculatePercentualDiscounts(
        ticketPrice,
        newState.percentualDiscounts,
        basketItemId,
      );

      return { ...newState, percentualDiscounts };
    }

    case 'REMOVE_PERCENTUAL_DISCOUNT': {
      const { basketItemId, discountId, ticketPrice } = action.payload;
      const discountIndex = state.percentualDiscounts.findIndex(
        discount => discount.id === discountId,
      );

      const newState = set(`percentualDiscounts[${discountIndex}].applied`, undefined, state);
      const percentualDiscounts = recalculatePercentualDiscounts(
        ticketPrice,
        newState.percentualDiscounts,
        basketItemId,
      );

      return { ...newState, percentualDiscounts };
    }

    case 'VERIFY_CODE_DISCOUNT_PENDING':
      return { ...state, isVerifyingCodeDiscount: true };
    case 'VERIFY_CODE_DISCOUNT_REJECTED':
      return { ...state, isVerifyingCodeDiscount: false };
    case 'VERIFY_CODE_DISCOUNT_FULFILLED': {
      const { basketItemId, code, verifiedDiscount } = action.payload;
      const basketItemIndex = findBasketItemIndex(state, basketItemId);
      const percentualDiscounts = recalculatePercentualDiscounts(
        verifiedDiscount.discountedTicketPrice,
        state.percentualDiscounts,
        basketItemId,
      );

      return flow(
        set(`items[${basketItemIndex}].codeDiscount`, { ...verifiedDiscount, code }),
        set('isVerifyingCodeDiscount', false),
        set('percentualDiscounts', percentualDiscounts),
      )(state);
    }

    case 'REMOVE_CODE_DISCOUNT': {
      const { basketItemId } = action.payload;
      const basketItemIndex = findBasketItemIndex(state, basketItemId);
      const { codeDiscount } = state.items[basketItemIndex];

      // to keep Flow happy, although we know codeDiscount is present when we are removing it
      if (!codeDiscount) {
        return state;
      }

      const ticketPriceWithoutDiscount = codeDiscount.discountedTicketPrice + codeDiscount.amount;
      const percentualDiscounts = recalculatePercentualDiscounts(
        ticketPriceWithoutDiscount,
        state.percentualDiscounts,
        basketItemId,
      );

      return flow(
        set(`items[${basketItemIndex}].codeDiscount`, undefined),
        set('percentualDiscounts', percentualDiscounts),
      )(state);
    }

    case 'PREFILL_PASSENGERS': {
      const { changes } = action;

      return {
        ...state,
        items: state.items.map(item => {
          const itemChanges = changes[item.shortid];
          const passengers = [
            merge(get(item, 'passengers[0]', []), itemChanges),
            ...item.passengers.slice(1),
          ];
          return { ...item, passengers };
        }),
      };
    }

    case 'UPDATE_PASSENGER': {
      const { basketItemId, fields, passengerIndex, setTouched } = action;
      const basketItemIndex = findBasketItemIndex(state, basketItemId);

      const newState = update(
        `items[${basketItemIndex}].passengers[${passengerIndex}]`,
        passenger => ({ ...passenger, ...fields }),
        state,
      );
      if (setTouched && passengerIndex === 0) {
        const field = get(Object.keys(fields), '[0]');
        return set(`items[${basketItemIndex}].passengerTouched.${field}`, true, newState);
      }
      return newState;
    }

    default:
      return state;
  }
};
