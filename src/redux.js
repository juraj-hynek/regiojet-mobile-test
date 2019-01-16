// @flow
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import type { NavigationState } from 'react-navigation';
import pick from 'lodash/pick';

import apiClient from './services/ApiClient';
import basket, { type BasketState } from './basket/reducer';
import connections, { type ConnectionsState } from './connections/reducer';
import consts, { type ConstsState } from './consts/reducer';
import contact, { type ContactState } from './contact/reducer';
import general, { type GeneralState } from './general/reducer';
import globalMessages, { type GlobalMessagesState } from './messages/reducer';
import localization, { type LocalizationState } from './localization/reducer';
import modal, { type ModalState } from './modal/reducer';
import navigation from './navigation/reducer';
import passwordReset, { type PasswordResetState } from './password-reset/reducer';
import paymentMethods, { type PaymentMethodsState } from './payment-methods/reducer';
import payments, { type PaymentsState } from './payments/reducer';
import ticket, { type TicketState } from './ticket/reducer';
import tickets, { type TicketsState } from './tickets/reducer';
import user, { type UserState } from './user/reducer';
import vehicles, { type VehiclesState } from './vehicles/reducer';

const createDiMiddleware = deps => ({ dispatch, getState }) => next => async action =>
  next(typeof action === 'function' ? await action({ ...deps, dispatch, getState }) : action);

const middlewares = [
  createReactNavigationReduxMiddleware('root', state => state.navigation),
  createDiMiddleware({ apiClient }),
  thunk,
];

const enhancer = composeWithDevTools(applyMiddleware(...middlewares));

const resetStateOnLogoutReducer = reducer => (state: AppState, action: ActionDeps) => {
  if (action.type !== 'LOGOUT_FULFILLED') {
    return reducer(state, action);
  }

  const keepAfterLogout: Array<Reducer> = [
    'basket',
    'connections',
    'consts',
    'general',
    'localization',
    'navigation',
    'vehicles',
  ];
  const stateAfterLogout = pick(state, keepAfterLogout);
  return reducer(stateAfterLogout, action);
};

const reducers = {
  basket,
  connections,
  consts,
  contact,
  general,
  globalMessages,
  localization,
  modal,
  navigation,
  passwordReset,
  paymentMethods,
  payments,
  ticket,
  tickets,
  user,
  vehicles,
};

const combinedReducers: Function = combineReducers(reducers);
const rootReducer = resetStateOnLogoutReducer(combinedReducers);

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['basket', 'localization'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export type AppState = {
  basket: BasketState,
  connections: ConnectionsState,
  consts: ConstsState,
  contact: ContactState,
  general: GeneralState,
  globalMessages: GlobalMessagesState,
  localization: LocalizationState,
  modal: ModalState,
  navigation: NavigationState,
  passwordReset: PasswordResetState,
  paymentMethods: PaymentMethodsState,
  payments: PaymentsState,
  ticket: TicketState,
  tickets: TicketsState,
  user: UserState,
  vehicles: VehiclesState,
};

type Reducer = $Keys<AppState>;

export type ActionDeps = {
  apiClient: typeof apiClient,
  dispatch: Object => Object,
  getState: () => AppState,
};

export type PersistRehydrateAction = {
  type: 'persist/REHYDRATE',
  payload: {
    basket: BasketState,
    localization: LocalizationState,
    _persist: {
      version: number,
      rehydrated: boolean,
    },
  },
  key: 'root',
};

export default () => {
  const store = createStore(persistedReducer, {}, enhancer);
  const persistor = persistStore(store);

  return { store, persistor };
};
