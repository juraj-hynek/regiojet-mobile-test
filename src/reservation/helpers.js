// @flow
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';

import { roundByCurrency } from '../helpers/number';
import type {
  BasketItem,
  Discount,
  PassengerField,
  PassengerTouched,
  PersonalDataType,
  RouteAddon,
  RoutePassenger,
  RoutePassengerChanges,
  User,
} from '../types';

export const getAddonsDescription = (addons: Array<RouteAddon>) =>
  addons
    .filter(addon => addon.checked)
    .map(addon => `${addon.count}× ${addon.name}`)
    .join(', ');

export const composeSelectedAddonsData = (addons: Array<RouteAddon>) =>
  addons.filter(addon => addon.checked).map(addon => ({
    ...pick(addon, ['addonId', 'count', 'price', 'currency']),
    conditionsHash: get(addon, 'conditions.code'),
  }));

export const composePassengerData = (basketItem: BasketItem) =>
  basketItem.selectedPriceClass.tariffs.map((tariff, index) => ({
    ...basketItem.passengers[index],
    tariff,
  }));

export const recalculatePercentualDiscounts = (
  ticketPrice: number,
  percentualDiscounts: Array<Discount>,
  basketItemId: string,
) => {
  let discountedTicketPrice = ticketPrice;

  return percentualDiscounts.map(discount => {
    if (!discount.applied || discount.applied.basketItemId !== basketItemId) {
      return discount;
    }

    // be careful, 3.5 / 100 * 50 !== 3.5 * 50 / 100 in JS!
    const discountAmount = discountedTicketPrice * discount.percentage / 100;
    const newDiscountedPrice = roundByCurrency(
      discountedTicketPrice - discountAmount,
      discount.applied.currency,
    );
    const roundDiscountAmount = discountedTicketPrice - newDiscountedPrice;
    discountedTicketPrice -= roundDiscountAmount;
    const applied =
      roundDiscountAmount > 0
        ? { ...discount.applied, amount: roundDiscountAmount, discountedTicketPrice }
        : undefined;

    return { ...discount, applied };
  });
};

export const getValidationKey = (
  field: PassengerField,
  basketItemId: string,
  index?: number = 0,
): string => `${basketItemId}_${index}_${field}`;

export const getPassengerValue = (
  passengerValues: Array<RoutePassenger>,
  field: PassengerField,
  index?: number = 0,
): string => get(passengerValues[index], field);

const PASSENGER_REQUIRED_FIELDS_MAP: { [field: PassengerField]: PersonalDataType } = {
  firstName: 'FIRST_NAME',
  surname: 'SURNAME',
  email: 'EMAIL',
  phone: 'PHONE',
};

export const isPassengerFieldRequired = (
  requiredFields: Array<PersonalDataType>,
  field: PassengerField,
) => requiredFields.includes(PASSENGER_REQUIRED_FIELDS_MAP[field]);

const PREFILL_CONTACT_FIELDS: Array<PassengerField> = ['email', 'phone'];
const PREFILL_PASSENGER_FIELDS: Array<PassengerField> = ['firstName', 'surname', 'email', 'phone'];

const getDefaultPassenger = (user: ?User): ?RoutePassenger => {
  const firstName = get(user, 'firstName') || '';
  const surname = get(user, 'surname') || '';
  const email = get(user, 'email') || '';
  const phone = get(user, 'phoneNumber') || '';

  if (!firstName && !surname && !email && !phone) return null;
  return { firstName, surname, email, phone };
};

export const getPrefillChanges = (
  basketItems: Array<BasketItem>,
  user: ?User,
): RoutePassengerChanges => {
  const defaultPassenger = getDefaultPassenger(user);

  return basketItems.reduce((changes, { passengersData, passengerTouched, shortid }) => {
    const prefillFields =
      passengersData.firstPassengerData.length > 0
        ? PREFILL_PASSENGER_FIELDS
        : PREFILL_CONTACT_FIELDS;

    const newValue = getPrefillPassengerChanges(
      shortid,
      passengerTouched,
      defaultPassenger,
      prefillFields,
    );
    return !isEmpty(newValue) ? { ...changes, [shortid]: newValue } : changes;
  }, {});
};

const getPrefillPassengerChanges = (
  basketItemId: string,
  passengerTouched: PassengerTouched,
  defaultPassenger: ?RoutePassenger,
  prefillFields: Array<PassengerField>,
): RoutePassenger =>
  prefillFields.reduce((changes, field) => {
    const fieldTouched = !!get(passengerTouched, field);
    const defaultValue = get(defaultPassenger, field, '');

    return !fieldTouched ? { ...changes, [field]: defaultValue } : changes;
  }, {});
