// @flow
import get from 'lodash/get';
import omit from 'lodash/omit';
import type { BasketItem, Discount, RouteAddon, Section } from '../types';

export const computeTicketPrice = (basketItem: BasketItem, isCredit: boolean): number =>
  isCredit ? basketItem.selectedPriceClass.creditPrice : basketItem.selectedPriceClass.price;

export const computeDiscountedTicketPrice = (basketItem: BasketItem, isCredit: boolean): number => {
  const codeDiscount = computeTicketCodeDiscount(basketItem, isCredit);
  return computeTicketPrice(basketItem, isCredit) - codeDiscount;
};

export const computeTicketSurchargePrice = (basketItem: BasketItem): number =>
  get(basketItem, 'route.surcharge.price', 0);

const computeAddonPrice = (addon: RouteAddon): number => {
  const count = addon.checked ? addon.count : 0;
  return count * addon.price;
};

export const computeAddonsPrice = (addons: Array<RouteAddon>): number =>
  addons.reduce((finalPrice, addon) => finalPrice + computeAddonPrice(addon), 0);

export const computeTicketCodeDiscount = (basketItem: BasketItem, isCredit: boolean): number => {
  const ticketPrice = computeTicketPrice(basketItem, isCredit);
  return Math.min(ticketPrice, get(basketItem, 'codeDiscount.amount', 0));
};

export const computeTicketPercentualDiscount = (
  basketItem: BasketItem,
  discounts: Array<Discount>,
): number =>
  discounts
    .filter(discount => discount.applied && discount.applied.basketItemId === basketItem.shortid)
    // $FlowFixMe c'mon flow, discount.applied must be defined, it's just been filtered
    .reduce((finalDiscount, discount) => finalDiscount + discount.applied.amount, 0);

export const computeTicketTotalPrice = (
  basketItem: BasketItem,
  percentualDiscounts: Array<Discount>,
  isCredit: boolean,
): number =>
  computeTicketPrice(basketItem, isCredit) +
  computeTicketSurchargePrice(basketItem) +
  computeAddonsPrice(basketItem.addons) -
  computeTicketCodeDiscount(basketItem, isCredit) -
  computeTicketPercentualDiscount(basketItem, percentualDiscounts);

export const computeTotalPrice = (
  basketItems: Array<BasketItem>,
  percentualDiscounts: Array<Discount>,
  isCredit: boolean,
) =>
  basketItems.reduce(
    (total, basketItem) =>
      computeTicketTotalPrice(basketItem, percentualDiscounts, isCredit) + total,
    0,
  );

export const composeRouteData = (basketItem: BasketItem) => ({
  routeId: basketItem.route.id,
  seatClass: basketItem.selectedPriceClass.seatClassKey,
  priceSource: basketItem.selectedPriceClass.priceSource,
  actionPrice: basketItem.selectedPriceClass.actionPrice,
  sections: basketItem.route.sections.map((section, sectionIndex) => ({
    section: {
      fromStationId: section.departureStationId,
      sectionId: section.id,
      toStationId: section.arrivalStationId,
    },
    selectedSeats: basketItem.seats[sectionIndex].selectedSeats.map(selectedSeat =>
      omit(selectedSeat, 'specialSeatsModalShown'),
    ),
  })),
});

export const composeFreeSeatsData = (
  seatClassKey: string,
  sections: Array<Section>,
  tariffs: Array<string>,
) => ({
  seatClass: seatClassKey,
  sections: sections.map(section => ({
    fromStationId: section.departureStationId,
    sectionId: section.id,
    toStationId: section.arrivalStationId,
  })),
  tariffs,
});
