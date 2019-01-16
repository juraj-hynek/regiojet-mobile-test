// @flow
import type {
  ErrorResponse,
  GiftCertificateInfo,
  PaymentMethodFormField,
  PaymentMethod,
} from '../types';
import type { PaymentMethodsAction } from './actions';

export type PostState = {
  +error: ?ErrorResponse,
  +isFetching: boolean,
};

type GetMethodsFormState = {
  +error: ?ErrorResponse,
  +isFetching: boolean,
  +fields: Array<PaymentMethodFormField>,
};

type GetMethodsState = {
  +error: ?ErrorResponse,
  +isFetching: boolean,
  +methods: Array<PaymentMethod>,
};

type GiftCertificateState = {
  +error: ?ErrorResponse,
  +isFetching: boolean,
  +certificate: ?GiftCertificateInfo,
};

export type PaymentMethodsState = {
  +addCredit: PostState,
  +giftCertificate: GiftCertificateState,
  +payTicket: PostState,
  +paymentMethodsForm: GetMethodsFormState,
  +paymentMethods: GetMethodsState,
};

const INITIAL_GIFT_CERTIFICATE_STATE = {
  error: null,
  isFetching: false,
  certificate: null,
};

const INITIAL_METHODS_STATE = {
  error: null,
  isFetching: false,
  methods: [],
};

const INITIAL_METHODS_FORM_STATE = {
  error: null,
  isFetching: false,
  fields: [],
};

const INITIAL_POST_STATE = {
  error: null,
  isFetching: false,
};

const INITIAL_STATE = {
  addCredit: INITIAL_POST_STATE,
  giftCertificate: INITIAL_GIFT_CERTIFICATE_STATE,
  payTicket: INITIAL_POST_STATE,
  paymentMethods: INITIAL_METHODS_STATE,
  paymentMethodsForm: INITIAL_METHODS_FORM_STATE,
};

const reducer = (state: PaymentMethodsState = INITIAL_STATE, action: PaymentMethodsAction) => {
  switch (action.type) {
    case 'PAY_TICKETS_PENDING':
    case 'PAY_TICKETS_CREDIT_PENDING':
      return { ...state, payTicket: { error: null, isFetching: true } };
    case 'PAY_TICKETS_REJECTED':
    case 'PAY_TICKETS_CREDIT_REJECTED':
      return { ...state, payTicket: { error: action.payload, isFetching: false } };
    case 'PAY_TICKETS_FULFILLED':
    case 'PAY_TICKETS_CREDIT_FULFILLED':
      return { ...state, payTicket: { ...state.payTicket, isFetching: false } };
    case 'ADD_CREDIT_PENDING':
      return { ...state, addCredit: { error: null, isFetching: true } };
    case 'ADD_CREDIT_REJECTED':
      return { ...state, addCredit: { error: action.payload, isFetching: false } };
    case 'ADD_CREDIT_FULFILLED':
      return { ...state, addCredit: { ...state.addCredit, isFetching: false } };
    case 'GET_PAYMENT_METHODS_FULFILLED':
      return {
        ...state,
        paymentMethods: { ...state.paymentMethods, methods: action.methods, isFetching: false },
      };
    case 'GET_PAYMENT_METHODS_REJECTED':
      return {
        ...state,
        paymentMethods: { ...state.paymentMethods, error: action.payload, isFetching: false },
      };
    case 'GET_PAYMENT_METHODS_PENDING':
      return {
        ...state,
        paymentMethods: { ...state.paymentMethods, error: null, isFetching: true },
      };
    case 'GET_METHOD_FORM_FIELDS_FULFILLED':
      return {
        ...state,
        paymentMethodsForm: {
          ...state.paymentMethodsForm,
          fields: action.fields,
          isFetching: false,
        },
      };
    case 'GET_METHOD_FORM_FIELDS_REJECTED':
      return {
        ...state,
        paymentMethodsForm: {
          ...state.paymentMethodsForm,
          error: action.payload,
          isFetching: false,
        },
      };
    case 'GET_METHOD_FORM_FIELDS_PENDING':
      return {
        ...state,
        paymentMethodsForm: { ...state.paymentMethodsForm, error: null, isFetching: true },
      };

    case 'VERIFY_GIFT_CERTIFICATE_PENDING':
      return { ...state, giftCertificate: { certificate: null, error: null, isFetching: true } };
    case 'VERIFY_GIFT_CERTIFICATE_REJECTED':
      return {
        ...state,
        giftCertificate: { certificate: null, error: action.payload, isFetching: false },
      };
    case 'VERIFY_GIFT_CERTIFICATE_FULFILLED':
      return {
        ...state,
        giftCertificate: {
          ...state.giftCertificate,
          certificate: action.payload,
          isFetching: false,
        },
      };

    case 'ADD_CREDIT_BY_GIFT_CERTIFICATE_PENDING':
      return {
        ...state,
        giftCertificate: { ...state.giftCertificate, error: null, isFetching: true },
      };
    case 'ADD_CREDIT_BY_GIFT_CERTIFICATE_REJECTED':
      return {
        ...state,
        giftCertificate: { ...state.giftCertificate, error: action.payload, isFetching: false },
      };
    case 'ADD_CREDIT_BY_GIFT_CERTIFICATE_FULFILLED':
      return {
        ...state,
        giftCertificate: { certificate: null, isFetching: false },
      };

    default: {
      return state;
    }
  }
};

export default reducer;
