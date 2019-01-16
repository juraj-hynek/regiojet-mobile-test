// @flow
import { createStackNavigator } from 'react-navigation';
import mapValues from 'lodash/mapValues';
import type { ComponentType } from 'react';

import AddCreditScreen from '../payment-methods/AddCreditScreen';
import BasketScreen from '../basket/BasketScreen';
import ConnectionsScreen from '../connections/ConnectionsScreen';
import LoginScreen from '../login/LoginScreen';
import PasswordResetScreen from '../password-reset/PasswordResetScreen';
import PaymentsScreen from '../payments/PaymentsScreen';
import RegistrationScreen from '../registration/RegistrationScreen';
import ReservationScreen from '../reservation/ReservationScreen';
import SearchRoutesScreen from '../search-routes/SearchRoutesScreen';
import SearchStationScreen from '../search-routes/SearchStationScreen';
import SettingsScreen from '../settings/SettingsScreen';
import TicketPaymentScreen from '../tickets/TicketPaymentScreen';
import TicketRatingScreen from '../ticket/TicketRatingScreen';
import TicketScreen from '../ticket/TicketScreen';
import TicketsScreen from '../tickets/TicketsScreen';
import type { UserRole } from '../types';
import WithRoleScreen from '../login/withRoleScreen';
import WithNavigationEventsScreen from './withNavigationEventsScreen';

const navigatorConfigFlow = {
  AddCredit: {
    allowedRoles: ['CREDIT'],
    screen: AddCreditScreen,
  },
  Basket: {
    screen: BasketScreen,
  },
  Connections: {
    screen: ConnectionsScreen,
  },
  Login: {
    allowedRoles: ['ANONYMOUS'],
    screen: LoginScreen,
  },
  PasswordReset: {
    allowedRoles: ['ANONYMOUS'],
    screen: PasswordResetScreen,
  },
  Payments: {
    allowedRoles: ['CREDIT', 'OPEN'],
    screen: PaymentsScreen,
  },
  Registration: {
    allowedRoles: ['ANONYMOUS'],
    screen: RegistrationScreen,
  },
  Reservation: {
    screen: ReservationScreen,
  },
  SearchRoutes: {
    screen: SearchRoutesScreen,
  },
  SearchStation: {
    screen: SearchStationScreen,
  },
  Settings: {
    screen: SettingsScreen,
  },
  Ticket: {
    allowedRoles: ['CREDIT', 'OPEN'],
    screen: TicketScreen,
  },
  TicketPayment: {
    allowedRoles: ['CREDIT', 'OPEN'],
    screen: TicketPaymentScreen,
  },
  TicketRating: {
    allowedRoles: ['CREDIT', 'OPEN'],
    screen: TicketRatingScreen,
  },
  Tickets: {
    allowedRoles: ['CREDIT', 'OPEN'],
    screen: TicketsScreen,
  },
};

export type ScreenName = $Keys<typeof navigatorConfigFlow>;

export const navigatorConfig: {
  [ScreenName]: {| allowedRoles?: Array<UserRole>, screen: ComponentType<any> |},
} = navigatorConfigFlow;

/**
 * Wrap screens from config with WithRoleScreen HOC if "allowedRoles" is set,
 * and with WithNavigationEventsScreen
 *
 * { screen: SomeScreen, allowedRoles: ['CREDIT'] }
 * =>
 * { screen: withNavigationEventsScreen(withRoleScreen(SomeScreen, ['CREDIT'])) }
 */
const generateConfigWithRole = config =>
  mapValues(config, ({ screen, allowedRoles }) => {
    const withRoleScreen = allowedRoles ? WithRoleScreen(screen, allowedRoles) : screen;
    return { screen: WithNavigationEventsScreen(withRoleScreen) };
  });

export default createStackNavigator(generateConfigWithRole(navigatorConfig), {
  cardStyle: {
    backgroundColor: 'transparent',
  },
  initialRouteKey: 'SearchRoutes',
  initialRouteName: 'SearchRoutes',
  navigationOptions: {
    header: null,
  },
  transitionConfig: () => ({
    transitionSpec: {
      useNativeDriver: true,
    },
  }),
});
