// @flow
import get from 'lodash/get';
import moment from 'moment';

import { addGlobalError } from '../messages/actions';
import { composeConnectionsPayload } from '../analytics';
import { getErrorResponse } from '../error/helpers';
import gtmPush from '../analytics/gtmPush';
import type { ActionDeps } from '../redux';
import type {
  ConnectionListType,
  ErrorResponse,
  Route,
  RoutesSearchData,
  RoutesSearchMove,
  SimpleRoutesSearchData,
  SimpleSearchResult,
} from '../types';
import type { HeadersState } from './reducer';

type GetConnectionDetailAction =
  | {
      type: 'GET_CONNECTION_DETAIL_PENDING',
      listType: ConnectionListType,
      payload: { routeId: string },
    }
  | {
      type: 'GET_CONNECTION_DETAIL_FULFILLED',
      listType: ConnectionListType,
      payload: {
        route: Route,
        routeId: string,
      },
    }
  | {
      type: 'GET_CONNECTION_DETAIL_REJECTED',
      listType: ConnectionListType,
      payload: {
        error: ErrorResponse,
        routeId: string,
      },
    };

type GetConnectionsAction =
  | {
      type: 'GET_CONNECTIONS_PENDING',
      listType: ConnectionListType,
      move?: RoutesSearchMove,
    }
  | {
      type: 'GET_CONNECTIONS_FULFILLED',
      listType: ConnectionListType,
      move?: RoutesSearchMove,
      payload: {
        result: SimpleSearchResult,
        headers: HeadersState,
      },
    }
  | {
      type: 'GET_CONNECTIONS_REJECTED',
      listType: ConnectionListType,
      move?: RoutesSearchMove,
      payload: {
        error: ErrorResponse,
      },
    };

type SetReturnDateAction = {
  type: 'SET_CONNECTIONS_RETURN_DATE',
  date?: moment,
};

type RemoveConnectionsMessageAction = {
  type: 'REMOVE_CONNECTIONS_MESSAGE_ACTION',
  listType: ConnectionListType,
};

export type ConnectionsAction =
  | GetConnectionDetailAction
  | GetConnectionsAction
  | SetReturnDateAction
  | RemoveConnectionsMessageAction;

export const getConnectionDetail = (
  routeId: string,
  data: SimpleRoutesSearchData,
  listType: ConnectionListType,
  successCallback: Function = () => {},
) => async ({ dispatch, apiClient }: ActionDeps): Promise<GetConnectionDetailAction> => {
  try {
    dispatch(
      ({
        type: 'GET_CONNECTION_DETAIL_PENDING',
        listType,
        payload: { routeId },
      }: GetConnectionDetailAction),
    );
    const { data: route } = await apiClient.get(`/routes/${routeId}/simple`, { params: data });
    successCallback(route);

    return {
      type: 'GET_CONNECTION_DETAIL_FULFILLED',
      listType,
      payload: { route, routeId },
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'GET_CONNECTION_DETAIL_REJECTED',
      listType,
      payload: { error: errorResponse, routeId },
    };
  }
};

const composeConnectionsHeaders = (
  getState: Function,
  listType: ConnectionListType,
  move?: RoutesSearchMove,
) => {
  if (!move) {
    return {};
  }

  const {
    connections: {
      [listType]: { headers },
    },
  } = getState();

  return {
    'X-Used-DepartureFromDateTime': headers.from,
    'X-Used-DepartureToDateTime': headers.to,
  };
};

export const getConnections = (
  data: RoutesSearchData,
  listType: ConnectionListType,
  move?: RoutesSearchMove,
) => async ({ dispatch, apiClient, getState }: ActionDeps): Promise<GetConnectionsAction> => {
  try {
    const isLoggedIn = !!get(getState(), 'user.user');
    const headers = composeConnectionsHeaders(getState, listType, move);
    dispatch(({ type: 'GET_CONNECTIONS_PENDING', listType, move }: GetConnectionsAction));

    // $FlowFixMe
    const { data: result, headers: resHeaders } = await apiClient.get('/routes/search/simple', {
      headers,
      params: { ...data, move },
    });

    if (!move) {
      gtmPush(composeConnectionsPayload(listType, data, result, isLoggedIn));
    }

    return {
      type: 'GET_CONNECTIONS_FULFILLED',
      listType,
      move,
      payload: {
        headers: {
          from: resHeaders['x-used-departurefromdatetime'] || null,
          to: resHeaders['x-used-departuretodatetime'] || null,
        },
        result,
      },
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return { type: 'GET_CONNECTIONS_REJECTED', listType, move, payload: { error: errorResponse } };
  }
};

export const setReturnDate = (date?: moment): SetReturnDateAction => ({
  type: 'SET_CONNECTIONS_RETURN_DATE',
  date,
});

export const removeConnectionsMessage = (
  listType: ConnectionListType,
): RemoveConnectionsMessageAction => ({
  type: 'REMOVE_CONNECTIONS_MESSAGE_ACTION',
  listType,
});
