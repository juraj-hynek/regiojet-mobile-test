// @flow
import { connect } from 'react-redux';
import { Linking, StyleSheet, View } from 'react-native';
import React, { Fragment } from 'react';
import SplashScreen from 'react-native-splash-screen';

import { authenticate } from './user/actions';
import { addGlobalMessage } from './messages/actions';
import { colors } from './style';
import { getConsts } from './consts/actions';
import { getTranslations } from './localization/actions';
import { navigateByBrowser, removeForbiddenHistory } from './navigation/actions';
import { removeAllBasketItems } from './basket/actions';
import apiClient from './services/ApiClient';
import AppNavigator from './navigation/index';
import BasketWatcher from './basket/BasketWatcher';
import ErrorWithRetry from './components/ErrorWithRetry';
import Loader from './components/Loader';
import type { Currency, ErrorResponse, Locale, UserRole } from './types';
import withRetry from './error/withRetry';

type Props = {|
  addGlobalMessage: typeof addGlobalMessage,
  authenticate: typeof authenticate,
  currency: Currency,
  error: ?ErrorResponse,
  getConsts: typeof getConsts,
  getTranslations: typeof getTranslations,
  isBasketEmpty: boolean,
  isFetching: boolean,
  locale: Locale,
  navigateByBrowser: typeof navigateByBrowser,
  onRetry: Function,
  postponeHistoryRemoval: boolean,
  removeAllBasketItems: typeof removeAllBasketItems,
  removeForbiddenHistory: typeof removeForbiddenHistory,
  userRole: UserRole,
|};

type State = {
  loading: boolean,
};

class App extends React.Component<Props, State> {
  state = {
    loading: true,
  };

  async componentDidMount() {
    const { currency, getConsts, getTranslations, locale, navigateByBrowser } = this.props;

    SplashScreen.hide();

    // redirect to Initial link after application start
    Linking.getInitialURL().then(url => {
      if (url) {
        navigateByBrowser(url);
      }
    });

    Linking.addEventListener('url', this.handleOpenURL);

    apiClient.setCurrency(currency);
    apiClient.setLocale(locale);
    await Promise.all([getConsts(locale), getTranslations(locale), this.authenticate()]);

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ loading: false });
  }

  componentWillReceiveProps(nextProps) {
    const {
      addGlobalMessage,
      currency,
      getConsts,
      getTranslations,
      isBasketEmpty,
      locale,
      postponeHistoryRemoval,
      removeAllBasketItems,
      removeForbiddenHistory,
      userRole,
    } = this.props;

    if (nextProps.locale !== locale) {
      apiClient.setLocale(nextProps.locale);
      getConsts(nextProps.locale);
      getTranslations(nextProps.locale);
    }

    if (nextProps.currency !== currency) {
      apiClient.setCurrency(nextProps.currency);
    }
    if (nextProps.currency !== currency && !isBasketEmpty) {
      removeAllBasketItems();
      addGlobalMessage({ messageId: 'basket.nuked', type: 'warning' });
    }

    if (
      !nextProps.postponeHistoryRemoval &&
      (userRole !== nextProps.userRole || postponeHistoryRemoval)
    ) {
      removeForbiddenHistory(nextProps.userRole);
    }
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL);
  }

  handleOpenURL = event => {
    if (event.url) {
      this.props.navigateByBrowser(event.url);
    }
  };

  async authenticate() {
    const token = await apiClient.loadAccessToken();
    if (token) {
      this.props.authenticate();
    }
  }

  render() {
    const { error, isFetching, onRetry } = this.props;

    if (this.state.loading || isFetching) {
      return <Loader />;
    }

    if (error) {
      return (
        <View style={styles.error}>
          <ErrorWithRetry error={error} onRetry={onRetry} />
        </View>
      );
    }

    return (
      <Fragment>
        {/* $FlowFixMe */}
        <BasketWatcher />
        {/* $FlowFixMe */}
        <AppNavigator />
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  error: {
    alignItems: 'center',
    backgroundColor: colors.yellow,
    flex: 1,
    justifyContent: 'center',
  },
});

export default withRetry(
  connect(
    ({ consts, basket, localization, user: { postponeHistoryRemoval, role } }) => ({
      currency: localization.currency,
      error: consts.error || localization.error,
      isBasketEmpty: basket.items.length === 0,
      isFetching: consts.isFetching || localization.isFetching,
      locale: localization.locale,
      postponeHistoryRemoval,
      userRole: role,
    }),
    {
      addGlobalMessage,
      authenticate,
      getConsts,
      getTranslations,
      navigateByBrowser,
      removeAllBasketItems,
      removeForbiddenHistory,
    },
  )(App),
);
