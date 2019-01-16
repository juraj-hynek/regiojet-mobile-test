// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import get from 'lodash/get';
import React from 'react';

import { addBasketItem } from '../basket/actions';
import { colors, getShadow } from '../style';
import { getConnectionDetail } from './actions';
import { openBasketSurchargeModal, openBasketTariffModal } from '../modal/actions';
import ConnectionDetail from './ConnectionDetail';
import ConnectionHeader from './ConnectionHeader';
import type {
  ConnectionListType,
  ErrorResponse,
  PriceClass,
  Route,
  SimpleRoute,
  Style,
} from '../types';

type Props = {|
  addBasketItem: typeof addBasketItem,
  colSizes: Array<number>,
  error: ?ErrorResponse,
  getConnectionDetail: typeof getConnectionDetail,
  isAddingToBasket: boolean,
  isFetching: boolean,
  isFirst: boolean,
  isLast: boolean,
  openBasketSurchargeModal: typeof openBasketSurchargeModal,
  openBasketTariffModal: typeof openBasketTariffModal,
  route?: Route,
  rowSchedulePadding: Style,
  setRouteRef: Function,
  simpleRoute: SimpleRoute,
  tariffs: Array<string>,
  type: ConnectionListType,
|};

type State = {
  isDetailOpen: boolean,
};

class Connection extends React.PureComponent<Props, State> {
  // eslint-disable-next-line react/sort-comp
  refContainer = null;

  state = {
    isDetailOpen: false,
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.error && this.props.error) {
      this.hideDetail();
    }
  }

  fetchConnectionDetail(successCallback: Route => void = () => {}) {
    const { getConnectionDetail, route, simpleRoute, tariffs, type } = this.props;

    if (!route) {
      getConnectionDetail(
        simpleRoute.id,
        {
          fromStationId: simpleRoute.departureStationId,
          toStationId: simpleRoute.arrivalStationId,
          tariffs,
        },
        type,
        successCallback,
      );
    } else {
      successCallback(route);
    }
  }

  selectOnlyConnection = () => {
    const successCallback = (route: Route) => this.selectConnection(route, route.priceClasses[0]);
    this.fetchConnectionDetail(successCallback);
  };

  selectConnection = (route: Route, selectedPriceClass: PriceClass) => {
    const { addBasketItem, openBasketSurchargeModal, openBasketTariffModal } = this.props;
    const onDone = () => addBasketItem({ route, selectedPriceClass });
    const openSurchargeModal = () => openBasketSurchargeModal(route.surcharge, onDone);

    if (selectedPriceClass.tariffNotifications) {
      openBasketTariffModal(
        selectedPriceClass.tariffNotifications,
        route.surcharge ? openSurchargeModal : onDone,
      );
      return;
    }

    if (route.surcharge) {
      openSurchargeModal();
      return;
    }

    onDone();
  };

  toggleDetails = () => {
    this.setState(
      prevState => ({
        isDetailOpen: !prevState.isDetailOpen,
      }),
      () => {
        if (this.state.isDetailOpen) {
          this.fetchConnectionDetail();
        }
      },
    );
    if (this.refContainer) {
      this.props.setRouteRef(this.refContainer);
    }
  };

  hideDetail = () => {
    this.setState({ isDetailOpen: false });
    if (this.refContainer) {
      this.props.setRouteRef(this.refContainer);
    }
  };

  render() {
    const {
      colSizes,
      isAddingToBasket,
      isFetching,
      isFirst,
      isLast,
      route,
      rowSchedulePadding,
      simpleRoute,
    } = this.props;
    const { isDetailOpen } = this.state;
    const isSoldOut = !simpleRoute.bookable;

    return (
      <View
        ref={ref => {
          this.refContainer = ref;
        }}
        style={[
          styles.container,
          isDetailOpen && styles.containerDetailOpen,
          isFirst && styles.containerFirst,
          isLast && styles.containerLast,
          !isFirst && !isDetailOpen && styles.containerNotFirst,
          isSoldOut && styles.disabled,
        ]}
      >
        {isDetailOpen && <View style={styles.borderTop} />}
        <View style={[styles.containerInner, isDetailOpen && styles.containerInnerDetailOpen]}>
          {/* $FlowFixMe */}
          <ConnectionHeader
            colSizes={colSizes}
            isDetailOpen={isDetailOpen}
            isAddingToBasket={isAddingToBasket}
            isFetching={isFetching}
            onSelect={this.selectOnlyConnection}
            onToggleDetails={this.toggleDetails}
            rowSchedulePadding={rowSchedulePadding}
            simpleRoute={simpleRoute}
          />

          <ConnectionDetail
            isAddingToBasket={isAddingToBasket}
            isFetching={isFetching}
            isOpen={isDetailOpen}
            onSelect={this.selectConnection}
            route={route}
            style={styles.connectionDetail}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  borderTop: {
    backgroundColor: colors.yellow,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    height: 10,
  },

  connectionDetail: {
    paddingTop: 10,
  },

  container: {
    borderColor: colors.greyShadow,
    borderWidth: 1,
  },

  containerDetailOpen: {
    ...getShadow({ elevation: 1 }),
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 0,
    marginVertical: 10,
  },

  containerFirst: {
    marginTop: 0,
  },

  // inner cointainer with a backgroundColor is needed to prevent shadow
  // from passing down to child elements
  containerInner: {
    backgroundColor: colors.white,
    padding: 10,
  },

  containerInnerDetailOpen: {
    backgroundColor: colors.yellowShadow,
  },

  containerLast: {
    marginBottom: 0,
  },

  containerNotFirst: {
    marginTop: -1,
  },

  disabled: {
    opacity: 0.5,
  },
});

export default connect(
  ({ basket, connections }, { simpleRoute: { id }, type }) => ({
    error: get(connections, `${type}.details.${id}.error`),
    isAddingToBasket: get(basket, `isFetching.${id}`),
    isFetching: get(connections, `${type}.details.${id}.isFetching`),
    route: get(connections, `${type}.details.${id}.data`),
  }),
  {
    addBasketItem,
    getConnectionDetail,
    openBasketSurchargeModal,
    openBasketTariffModal,
  },
)(Connection);
