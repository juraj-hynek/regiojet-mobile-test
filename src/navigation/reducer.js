// @flow
import { Keyboard } from 'react-native';
import {
  NavigationActions,
  StackActions,
  type NavigationAction as TypeNavigationAction,
  type NavigationState,
  type NavigationRoute,
} from 'react-navigation';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

import Navigator from './Navigator';
import type { NavigationAction } from './actions';
import type { UserRole } from '../types';

// $FlowFixMe
const initialState: NavigationState = Navigator.router.getStateForAction(NavigationActions.init());

const replaceStateWithRoutes = (state: NavigationState, routes: Array<NavigationRoute>) => ({
  ...state,
  index: routes.length - 1,
  routes,
});

const removeForbiddenHistory = (state: NavigationState, userRole: UserRole): NavigationState => {
  const routes = state.routes.filter(route => {
    const allowedRoles = get(route, 'params.allowedRoles');
    return !allowedRoles || allowedRoles.includes(userRole);
  });

  return replaceStateWithRoutes(state, routes);
};

const removeInnerHistory = (state: NavigationState): NavigationState => {
  const lastRouteIndex = state.routes.length - 1;

  if (lastRouteIndex < 2) {
    return state;
  }
  return replaceStateWithRoutes(state, [state.routes[0], state.routes[lastRouteIndex]]);
};

const replaceAll = (state: NavigationState, action: TypeNavigationAction): NavigationState => {
  const goHomeAction = StackActions.popToTop({});
  const newState = Navigator.router.getStateForAction(goHomeAction, state);
  return Navigator.router.getStateForAction(action, newState) || state;
};

const processOtherNavigationAction = (state: NavigationState, action: Object): NavigationState => {
  const { routes } = state;
  const lastRoute = routes[routes.length - 1];

  // prevent going to forbidden screens
  const allowedRoles = get(action, 'params.allowedRoles');
  const userRole = get(action, 'params.userRole');
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return state;
  }

  // prevent unwanted redirects (e.g. two fast taps on navigation button)
  if (action.routeName === lastRoute.routeName && isEqual(action.params, lastRoute.params)) {
    return state;
  }

  const stateForAction = Navigator.router.getStateForAction(action, state) || state;

  // Do not use Navigation/COMPLETE_TRANSITION for Keyboard control
  // because it fires after componentDidMount methods in next screen
  if (action.type === 'Navigation/BACK' || action.type === 'Navigation/NAVIGATE') {
    Keyboard.dismiss();
  }

  return stateForAction;
};

export default (
  state: NavigationState = initialState,
  action: NavigationAction,
): NavigationState => {
  switch (action.type) {
    case 'NAVIGATION_REMOVE_FORBIDDEN_HISTORY':
      return removeForbiddenHistory(state, action.userRole);

    case 'NAVIGATION_REMOVE_INNER':
      return removeInnerHistory(state);

    case 'NAVIGATION_REPLACE_ALL':
      return replaceAll(state, action.payload);

    default: {
      return processOtherNavigationAction(state, action);
    }
  }
};
