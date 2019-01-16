// @flow
import { View } from 'react-native';
import React from 'react';

import ConnectionInfo from './details/ConnectionInfo';
import LoaderSmall from '../components/LoaderSmall';
import RouteSections from './details/RouteSections';
import type { PriceClass, Route, Style } from '../types';

type Props = {|
  isAddingToBasket: boolean,
  isFetching: boolean,
  isOpen: boolean,
  onSelect: (Route, PriceClass) => void,
  route?: Route,
  style?: Style,
|};

class ConnectionDetail extends React.PureComponent<Props> {
  handleSelect = (priceClass: PriceClass) => {
    const { onSelect, route } = this.props;
    if (route) {
      onSelect(route, priceClass);
    }
  };

  render() {
    const { isAddingToBasket, isFetching, isOpen, route, style } = this.props;

    if (!isOpen) {
      return null;
    }

    if (isFetching) {
      return <LoaderSmall />;
    }

    if (!route) {
      return null;
    }

    const { priceClasses, sections } = route;

    return (
      <View style={style}>
        <ConnectionInfo sections={sections} transfersInfo={route.transfersInfo} />
        {/* $FlowFixMe */}
        <RouteSections
          isAddingToBasket={isAddingToBasket}
          onSelect={this.handleSelect}
          priceClasses={priceClasses}
          sections={sections}
        />
      </View>
    );
  }
}

export default ConnectionDetail;
