// @flow
import {
  NavigationActions,
  StackActions,
  type NavigationAction as TypeNavigationAction,
  type NavigationRoute,
} from 'react-navigation';

import { navigatorConfig, type ScreenName } from './Navigator';
import type { ActionDeps } from '../redux';
import type { UserRole } from '../types';

export { navigateByBrowser } from './actions-browser';

export type NavigationAction =
  | TypeNavigationAction
  | { type: 'NAVIGATION_GO_BACK_TO_FULFILLED' }
  | { type: 'NAVIGATION_REMOVE_FORBIDDEN_HISTORY', userRole: UserRole }
  | { type: 'NAVIGATION_REMOVE_INNER' }
  | { type: 'NAVIGATION_REPLACE_ALL', payload: TypeNavigationAction }
  | { type: 'NAVIGATION_SCREEN_WILL_BLUR', screenDisplayName: string }
  | { type: 'NAVIGATION_SCREEN_WILL_FOCUS', screenDisplayName: string };

const addAllowedRolesParam = (routeName: ScreenName, userRole: UserRole, params?: Object) => ({
  ...params,
  allowedRoles: navigatorConfig[routeName].allowedRoles,
  userRole,
});

const navigate = (getState: Function, routeName: ScreenName, params?: Object) => {
  const {
    user: { role },
  } = getState();
  return NavigationActions.navigate({
    key: routeName,
    routeName,
    params: addAllowedRolesParam(routeName, role, params),
  });
};

const isInHistory = (routes: Array<NavigationRoute>, routeName: ScreenName) => {
  const index = routes.findIndex(route => route.key === routeName);
  return index > -1;
};

/**
 * Add a new screen on top of the stack or go back to it if it was already on stack
 */
export const goTo = (routeName: ScreenName, params?: Object) => ({
  getState,
}: ActionDeps): NavigationAction => navigate(getState, routeName, params);

/**
 * Go one step back in navigation
 */
export const goBack = (): NavigationAction => NavigationActions.back();

/**
 * Go back to any screen in stack with fallback to first screen
 */
export const goBackTo = (routeName: ScreenName, params?: Object) => ({
  dispatch,
  getState,
}: ActionDeps): NavigationAction => {
  const {
    navigation: { routes },
  } = getState();
  const route = routes.find(route => route.key === routeName) || routes[0];
  // $FlowFixMe
  dispatch(goTo(route.routeName, params));
  return { type: 'NAVIGATION_GO_BACK_TO_FULFILLED' };
};

/**
 * Replace top screen with new screen
 */
export const replaceLast = (routeName: ScreenName, params?: Object) => ({
  dispatch,
  getState,
}: ActionDeps): NavigationAction => {
  const {
    navigation: { routes },
    user: { role },
  } = getState();

  if (isInHistory(routes, routeName)) {
    return dispatch(goTo(routeName, params));
  }

  const { key } = routes[routes.length - 1];
  return StackActions.replace({
    key,
    newKey: routeName,
    routeName,
    params: addAllowedRolesParam(routeName, role, params),
  });
};

/**
 * Replace all screens but initial screen with new screen
 */
export const replaceAll = (routeName: ScreenName, params?: Object) => ({
  getState,
}: ActionDeps): NavigationAction => ({
  type: 'NAVIGATION_REPLACE_ALL',
  payload: navigate(getState, routeName, params),
});

export const removeInner = (): NavigationAction => ({
  type: 'NAVIGATION_REMOVE_INNER',
});

export const removeForbiddenHistory = (userRole: UserRole): NavigationAction => ({
  type: 'NAVIGATION_REMOVE_FORBIDDEN_HISTORY',
  userRole,
});

export const screenWillBlur = (screenDisplayName: string): NavigationAction => ({
  type: 'NAVIGATION_SCREEN_WILL_BLUR',
  screenDisplayName,
});

export const screenWillFocus = (screenDisplayName: string): NavigationAction => ({
  type: 'NAVIGATION_SCREEN_WILL_FOCUS',
  screenDisplayName,
});
