// @flow
import moment from 'moment';
import set from 'lodash/fp/set';
import update from 'lodash/fp/update';

import type { BannerBubble, ErrorResponse, Route, SimpleRoute, TextBubble } from '../types';
import type { ConnectionsAction } from './actions';

export type HeadersState = {
  from: ?string,
  to: ?string,
};

type ConnectionListState = {
  +canMoveBackward: boolean,
  +canMoveForward: boolean,
  +data: Array<SimpleRoute>,
  +details: {
    [routeId: string]: {
      +data: ?Route,
      +error: ?ErrorResponse,
      +isFetching: boolean,
    },
  },
  +error: ?ErrorResponse,
  +headers: HeadersState,
  +isFetching: boolean,
  +isFetchingMove: boolean,
  +message: ?string,
};

export type ConnectionsState = {
  +bannerBubbles: Array<BannerBubble>,
  +outbound: ConnectionListState,
  +return: ConnectionListState,
  +returnDate: ?moment,
  +textBubbles: Array<TextBubble>,
};

const INITIAL_CONNECTION_LIST_STATE = {
  canMoveBackward: true,
  canMoveForward: true,
  data: [],
  details: {},
  error: null,
  headers: {
    from: null,
    to: null,
  },
  isFetching: false,
  isFetchingMove: false,
  message: null,
};

const INITIAL_STATE = {
  bannerBubbles: [],
  outbound: INITIAL_CONNECTION_LIST_STATE,
  return: INITIAL_CONNECTION_LIST_STATE,
  returnDate: undefined,
  textBubbles: [],
};

export default (state: ConnectionsState = INITIAL_STATE, action: ConnectionsAction) => {
  switch (action.type) {
    case 'GET_CONNECTION_DETAIL_PENDING': {
      const { listType, payload } = action;

      return set(
        `${listType}.details.${payload.routeId}`,
        { error: null, isFetching: true, data: null },
        state,
      );
    }
    case 'GET_CONNECTION_DETAIL_REJECTED': {
      const { listType, payload } = action;

      return update(
        `${listType}.details.${payload.routeId}`,
        details => ({ ...details, error: payload.error, isFetching: false }),
        state,
      );
    }
    case 'GET_CONNECTION_DETAIL_FULFILLED': {
      const { listType, payload } = action;

      return update(
        `${listType}.details.${payload.routeId}`,
        details => ({ ...details, data: payload.route, isFetching: false }),
        state,
      );
    }

    case 'GET_CONNECTIONS_PENDING': {
      const { listType, move } = action;

      if (move) {
        return set(`${listType}.isFetchingMove`, true, state);
      }
      return {
        ...state,
        [listType]: { ...INITIAL_STATE[listType], details: {}, isFetching: true },
        bannerBubbles: listType === 'outbound' ? [] : state.bannerBubbles,
        textBubbles: listType === 'outbound' ? [] : state.textBubbles,
      };
    }
    case 'GET_CONNECTIONS_REJECTED': {
      const { listType, move, payload } = action;

      if (move) {
        return set(`${listType}.isFetchingMove`, false, state);
      }
      return update(
        listType,
        list => ({ ...list, error: payload.error, isFetching: false }),
        state,
      );
    }
    case 'GET_CONNECTIONS_FULFILLED': {
      const {
        listType,
        move,
        payload: { headers, result },
      } = action;
      const {
        bannerBubbles,
        outboundRoutes: newConnections,
        outboundRoutesMessage,
        textBubbles,
      } = result;

      const newState =
        listType === 'outbound'
          ? {
              ...state,
              bannerBubbles,
              textBubbles,
            }
          : state;

      if (move) {
        return update(
          listType,
          list => {
            const canMoveBackward =
              move === 'BACKWARD' ? newConnections.length > 0 : list.canMoveBackward;
            const canMoveForward =
              move === 'FORWARD' ? newConnections.length > 0 : list.canMoveForward;

            return {
              ...list,
              canMoveBackward,
              canMoveForward,
              data:
                move === 'BACKWARD'
                  ? [...newConnections, ...list.data]
                  : [...list.data, ...newConnections],
              headers:
                move === 'BACKWARD'
                  ? { ...list.headers, from: headers.from }
                  : { ...list.headers, to: headers.to },
              isFetchingMove: false,
              message: outboundRoutesMessage,
            };
          },
          newState,
        );
      }

      return update(
        listType,
        list => ({
          ...list,
          data: newConnections,
          headers,
          isFetching: false,
          message: outboundRoutesMessage,
        }),
        newState,
      );
    }

    case 'SET_CONNECTIONS_RETURN_DATE': {
      const { date } = action;
      const clearReturnResults = !date || (state.returnDate && !state.returnDate.isSame(date));

      return {
        ...state,
        returnDate: action.date,
        return: clearReturnResults ? INITIAL_STATE.return : state.return,
      };
    }

    case 'REMOVE_CONNECTIONS_MESSAGE_ACTION':
      return set(`${action.listType}.message`, null, state);

    default:
      return state;
  }
};
