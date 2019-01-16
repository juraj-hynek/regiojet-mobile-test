// @flow
import { Platform } from 'react-native';
import compact from 'lodash/compact';
import get from 'lodash/get';
import last from 'lodash/last';
import md5 from 'md5';
import moment from 'moment';
import shortid from 'shortid';
import uniq from 'lodash/uniq';

import { computeTicketPrice } from '../basket/helpers';
import type {
  BasketItem,
  ConnectionListType,
  Currency,
  RoutesSearchData,
  SimpleRoute,
  SimpleSearchResult,
  Ticket,
  VehicleType,
} from '../types';

export type PageType = 'Search' | 'Search-back' | 'Basket' | 'Reservation' | 'Confirm';

type CheckoutOption = 'Basket' | 'Reservation';

type ProductCategory = VehicleType | 'BUS+TRAIN';

type Impression = {
  name: string,
  category: ProductCategory,
};

type Product = {
  name: string,
  id: string,
  price: number,
  category: ProductCategory,
  variant: string,
  quantity: number,
  dimension1: string,
};

export type PageViewPayload = {
  event: 'pageview',
  pageType: PageType,
  appType: 'ios' | 'android',
  affiliate: '',
  logId: boolean,
};

type ConnectionsPayload = {
  from: string,
  to: string,
  fromType: string,
  toType: string,
  tariffs: Array<string>,
  passengerCount: number,
  departureDate: string,
  departureDateDiff: number,
  ecommerce: {
    impressions: Array<Impression>,
  },
};

type CheckoutPayload = {
  event: 'checkout',
  ecommerce: {
    currencyCode: Currency,
    checkout: {
      actionField: {
        option: CheckoutOption,
        step: number,
      },
      products: Array<Product>,
    },
  },
};

type PurchasePayload = {
  event: 'purchase',
  ecommerce: {
    currencyCode: Currency,
    purchase: {
      actionField: {
        id: string,
        affiliation: '',
        revenue: number,
      },
      products: Array<Product>,
    },
  },
};

const DATE_FORMAT = 'YYYY-MM-DD';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:MM';

const getVehicleCategory = (vehicleTypes: Array<VehicleType>): ProductCategory => {
  const uniqVehicleTypes = uniq(vehicleTypes);
  return uniqVehicleTypes.length === 1 ? uniqVehicleTypes[0] : 'BUS+TRAIN';
};

const composeProductFromBasketItem = (
  basketItem: BasketItem,
  showCreditPrice: boolean,
): Product => ({
  name: `${basketItem.route.departureStationId}-${basketItem.route.arrivalStationId}`,
  id: basketItem.shortid,
  price: computeTicketPrice(basketItem, showCreditPrice),
  category: getVehicleCategory(basketItem.route.vehicleTypes),
  variant: basketItem.selectedPriceClass.seatClassKey,
  quantity: basketItem.selectedPriceClass.tariffs.length,
  dimension1: moment(basketItem.route.departureTime).format(DATETIME_FORMAT),
});

const composeProductFromTicket = (ticket: Ticket): Product => {
  const {
    id,
    outboundRouteSections,
    passengersInfo: { passengers },
    price,
    seatClassKey,
  } = ticket;
  const stationFromId = outboundRouteSections[0].section.departureStationId;
  const stationToId = last(outboundRouteSections).section.arrivalStationId;
  const vehicleTypes: Array<VehicleType> = outboundRouteSections.map(
    ({ section }) => section.vehicleType,
  );

  return {
    name: `${stationFromId}-${stationToId}`,
    id: `${id}`,
    price,
    category: getVehicleCategory(vehicleTypes),
    variant: seatClassKey,
    quantity: passengers.length,
    dimension1: moment(outboundRouteSections[0].section.departureTime).format(DATETIME_FORMAT),
  };
};

const composeProductsFromBasketItems = (
  basketItems: Array<BasketItem>,
  showCreditPrice: boolean,
): Array<Product> =>
  basketItems.map(basketItem => composeProductFromBasketItem(basketItem, showCreditPrice));

export const composeProductsFromTickets = (tickets: Array<Ticket>): Array<Product> =>
  tickets.map(composeProductFromTicket);

export const composeBasketActionPayload = (
  type: 'add' | 'remove',
  basketItem: BasketItem,
  currency: Currency,
  showCreditPrice: boolean,
) => ({
  event: type === 'add' ? 'addToCart' : 'removeFromCart',
  ecommerce: {
    currencyCode: currency,
    [type]: {
      products: [composeProductFromBasketItem(basketItem, showCreditPrice)],
    },
  },
});

export const composePageViewPayload = (
  pageType: PageType,
  isLoggedIn: boolean,
  payload?: Object,
): PageViewPayload => ({
  event: 'pageview',
  pageType,
  appType: Platform.OS,
  affiliate: '',
  logId: isLoggedIn,
  ...payload,
});

const composeImpression = (
  simpleRoutes: Array<SimpleRoute>,
  vehicleType: VehicleType,
): ?Impression => {
  const item = simpleRoutes.find(({ vehicleTypes }) => vehicleTypes.includes(vehicleType));
  if (!item) return null;
  return {
    name: `${item.departureStationId}-${item.arrivalStationId}`,
    category: getVehicleCategory(item.vehicleTypes),
  };
};

const composeImpressions = (simpleRoutes: Array<SimpleRoute>): Array<Impression> => {
  const bus = composeImpression(simpleRoutes, 'BUS');
  const train = composeImpression(simpleRoutes, 'TRAIN');
  return compact([bus, train]);
};

export const composeConnectionsPayload = (
  type: ConnectionListType,
  data: RoutesSearchData,
  result: SimpleSearchResult,
  isLoggedIn: boolean,
): PageViewPayload => {
  const connectionsPayload: ConnectionsPayload = {
    from: `${data.fromLocationId}`,
    to: `${data.toLocationId}`,
    fromType: data.fromLocationType,
    toType: data.toLocationType,
    tariffs: data.tariffs || [],
    passengerCount: get(data, 'tariffs.length', 1),
    departureDate: moment(data.departureDate).format(DATE_FORMAT),
    departureDateDiff: moment(data.departureDate).diff(moment().startOf('day'), 'days'),
    ecommerce: {
      impressions: composeImpressions(result.outboundRoutes),
    },
  };

  const pageType = type === 'outbound' ? 'Search' : 'Search-back';
  return composePageViewPayload(pageType, isLoggedIn, connectionsPayload);
};

export const composeCheckoutPayload = (
  option: CheckoutOption,
  basketItems: Array<BasketItem>,
  currency: Currency,
  showCreditPrice: boolean,
): CheckoutPayload => {
  const steps: Array<CheckoutOption> = ['Basket', 'Reservation'];
  return {
    event: 'checkout',
    ecommerce: {
      currencyCode: currency,
      checkout: {
        actionField: {
          option,
          step: steps.indexOf(option) + 1,
        },
        products: composeProductsFromBasketItems(basketItems, showCreditPrice),
      },
    },
  };
};

const createOrderId = (tickets: Array<Ticket>): string => {
  const ticketIds = tickets.map(ticket => ticket.id).join();
  return md5(`${ticketIds}${shortid.generate()}`);
};

export const composePurchasePayload = (tickets: Array<Ticket>): PurchasePayload => ({
  event: 'purchase',
  ecommerce: {
    currencyCode: get(tickets, '[0].currency'),
    purchase: {
      actionField: {
        id: createOrderId(tickets),
        affiliation: '',
        revenue: tickets.reduce((total, { price }) => total + price, 0),
      },
      products: composeProductsFromTickets(tickets),
    },
  },
});
