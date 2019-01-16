// @flow
import type { IconType } from '../components/Icon';
import type { PaymentMethod } from '../types';

const allowedNonOnlineMethods = ['CASH', 'GIFT_CERTIFICATE', 'TRANSFER'];
const nonOnlineMethods = [...allowedNonOnlineMethods, 'ACCOUNT', 'DEPOSIT'];

export const paymentIcons: { [key: string]: IconType } = {
  GOPAY_CSOB_SK: 'payuCsob',
  GOPAY_PAYPAL: 'gopayPaypal',
  GOPAY_SPOROPAY: 'gopaySporopay',
  GOPAY_TATRAPAY: 'gopayTatrapay',
  GOPAY_UNICREDIT_SK: 'payuUnicredit',
  GOPAY_VUB: 'gopayVub',
  GPE_ONLINE_CARD: 'gpeOnlineCard',
  MAESTRO: 'maestro',
  MASTER_CARD: 'masterCard',
  PAYU_CSAS_SERVIS24: 'payuCsasServis24',
  PAYU_CSOB: 'payuCsob',
  PAYU_ERA: 'payuEra',
  PAYU_FIO: 'payuFio',
  PAYU_GE_MONEY_BANK: 'payuGeMoneyBank',
  PAYU_GIROPAY: 'payuGiropay',
  PAYU_INSTANT_TR: 'payuInstantTr',
  PAYU_KB: 'payuKb',
  PAYU_MBANK_MPENIZE: 'payuMbankMpenize',
  PAYU_RAIFFEISEN: 'payuRaiffeisen',
  PAYU_SBERBANK: 'payuSberbank',
  PAYU_SEPA: 'payuSepa',
  PAYU_SOFORT: 'payuSofort',
  PAYU_UNICREDIT: 'payuUnicredit',
  SUPERCASH: 'supercash',
  TATRAPAY: 'tatrapay',
  VISA: 'visa',
  VISA_ELECTRON: 'visaElectron',
};

export const paymentMethodMessageIds: { [key: string]: string } = {
  ONLINE: 'online',
  CASH: 'cash',
  GIFT_CERTIFICATE: 'giftCard',
  TRANSFER: 'bankTransfer',
};

export const filterOnlineMethods = (paymentMethods: Array<PaymentMethod>): Array<PaymentMethod> =>
  paymentMethods.filter(method => !nonOnlineMethods.includes(method.paymentMethodCode));

const isMethodVisible = (paymentMethods: Array<PaymentMethod>, type: string) =>
  paymentMethods.some(method => method.paymentMethodCode === type && method.active);

export const getTabMethods = (paymentMethods: Array<PaymentMethod>) => [
  'ONLINE',
  ...allowedNonOnlineMethods.filter(methodType => isMethodVisible(paymentMethods, methodType)),
];
