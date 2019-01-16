// @flow
import { Col, Grid, Row } from 'native-base';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { colors, theme } from '../style';
import { computeTicketTotalPrice } from './helpers';
import { timeFormat } from '../localization/localeData';
import { getVehicleIconNameByType } from '../helpers/routes';
import { removeBasketItem } from './actions';
import Date from '../components/Date';
import Direction from '../components/Direction';
import Icon from '../components/Icon';
import Price from '../components/Price';
import TouchableOpacity from '../components/TouchableOpacity';
import type { BasketItem as BasketItemType, Discount } from '../types';

type Props = {|
  basketItem: BasketItemType,
  percentualDiscounts: Array<Discount>,
  removeBasketItem: Function,
  showCreditPrice: boolean,
|};

class BasketItem extends React.Component<Props> {
  handleButtonPress = () => {
    const { basketItem, removeBasketItem } = this.props;
    removeBasketItem(basketItem);
  };

  render() {
    const { basketItem, percentualDiscounts, showCreditPrice } = this.props;
    const { route } = basketItem;

    return (
      <Grid style={styles.container}>
        <Row style={styles.row}>
          <Col>
            <Row>
              <View style={styles.marginRight}>
                <Row style={styles.iconContainer}>
                  {route.vehicleTypes.map(vehicleType => (
                    <Icon
                      height={21}
                      key={vehicleType}
                      name={getVehicleIconNameByType(vehicleType)}
                      style={styles.icon}
                      width={25}
                    />
                  ))}
                </Row>
              </View>
              <Direction
                ellipsis
                from={route.departureCityName}
                textStyle={[theme.paragraphSmall, theme.semiBold]}
                to={route.arrivalCityName}
              />
            </Row>
          </Col>
          <TouchableOpacity onPress={this.handleButtonPress} style={styles.button}>
            <Icon color={colors.red} height={16} name="crossLight" width={16} />
          </TouchableOpacity>
        </Row>
        <Row style={styles.row}>
          <Col>
            <Row>
              <Date ignoreTimeZone style={[theme.paragraphSmall, styles.marginRight]}>
                {route.departureTime}
              </Date>
              <Date
                format={timeFormat}
                ignoreTimeZone
                style={[theme.paragraphSmall, theme.semiBold]}
              >
                {route.departureTime}
              </Date>
            </Row>
          </Col>
          <Price
            style={[theme.paragraphSmall, theme.semiBold]}
            value={computeTicketTotalPrice(basketItem, percentualDiscounts, showCreditPrice)}
          />
        </Row>
      </Grid>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    paddingBottom: 10,
    margin: -15,
    marginBottom: -10,
    marginLeft: 0,
  },

  container: {
    borderColor: colors.greyShadow,
    borderRadius: 5,
    borderWidth: 1,
    padding: 10,
  },

  row: {
    alignItems: 'center',
    paddingVertical: 5,
  },

  icon: {
    marginHorizontal: 2.5,
  },

  iconContainer: {
    marginHorizontal: -2.5,
  },

  marginRight: {
    marginRight: 10,
  },
});

export default connect(({ basket: { percentualDiscounts } }) => ({ percentualDiscounts }), {
  removeBasketItem,
})(BasketItem);
