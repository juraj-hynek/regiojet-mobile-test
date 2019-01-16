// @flow
import { Col, Grid, Row } from 'native-base';
import { connect } from 'react-redux';
import { StyleSheet, Text } from 'react-native';
import React, { Fragment } from 'react';

import { colors, theme } from '../style';
import { getVehicleIconNameByType } from '../helpers/routes';
import { timeFormat } from '../localization/localeData';
import Button from '../components/Button';
import Date from '../components/Date';
import Direction from '../components/Direction';
import FormattedMessage from '../components/FormattedMessage';
import FreeSeatsCount from './FreeSeatsCount';
import Icon from '../components/Icon';
import Price from '../components/Price';
import TouchableOpacity from '../components/TouchableOpacity';
import type { SimpleRoute, Style, UserRole } from '../types';

type Props = {|
  colSizes: Array<number>,
  isDetailOpen: boolean,
  isAddingToBasket: boolean,
  isFetching: boolean,
  onSelect: Function,
  onToggleDetails: Function,
  rowSchedulePadding: Style,
  simpleRoute: SimpleRoute,
  userRole: UserRole,
|};

type ButtonType = 'soldOut' | 'priceOne' | 'priceMultiple';

class ConnectionHeader extends React.PureComponent<Props> {
  getButtonType(): ButtonType {
    const { simpleRoute } = this.props;
    const { bookable, pricesCount } = simpleRoute;

    if (!bookable) {
      return 'soldOut';
    }
    return pricesCount === 1 ? 'priceOne' : 'priceMultiple';
  }

  getPrice(): ?number {
    const {
      simpleRoute: { creditPriceFrom, priceFrom },
      userRole,
    } = this.props;
    return userRole === 'CREDIT' ? creditPriceFrom : priceFrom;
  }

  render() {
    const {
      colSizes,
      isDetailOpen,
      isFetching,
      onSelect,
      onToggleDetails,
      rowSchedulePadding,
      simpleRoute,
    } = this.props;
    const { arrivalTime, departureTime, freeSeatsCount, pricesCount, transfersCount } = simpleRoute;

    const buttonType = this.getButtonType();
    const isSoldOut = buttonType === 'soldOut';
    const price = this.getPrice();
    const isAddingToBasket = this.props.isAddingToBasket || (isFetching && !isDetailOpen);

    return (
      <Fragment>
        <Grid style={styles.gridFirst}>
          <Col size={colSizes[0]}>
            <Direction
              from={
                <Date format={timeFormat} ignoreTimeZone>
                  {departureTime}
                </Date>
              }
              spacing={0}
              style={[styles.alignCenter, styles.rowSchedule, rowSchedulePadding]}
              textStyle={theme.bold}
              to={
                <Date format={timeFormat} ignoreTimeZone>
                  {arrivalTime}
                </Date>
              }
            />
          </Col>
          <Col size={colSizes[1]}>
            <Row style={styles.alignCenter}>
              <Icon height={14} name="transfer" style={styles.iconMargin} width={16} />
              <Text style={[theme.paragraph, theme.bold]}>{transfersCount}</Text>
            </Row>
          </Col>
          <Col size={colSizes[2]}>
            <FreeSeatsCount
              count={freeSeatsCount}
              isSoldOut={isSoldOut}
              style={styles.freeSeatsCount}
            />
          </Col>
        </Grid>
        <Grid>
          <Col size={4}>
            <Row style={styles.alignCenter}>
              {simpleRoute.vehicleTypes.map(type => (
                <Icon
                  height={21}
                  key={type}
                  name={getVehicleIconNameByType(type)}
                  style={styles.iconMargin}
                  width={25}
                />
              ))}
            </Row>
          </Col>
          <Col size={1} style={styles.justifyCenter}>
            {simpleRoute.actionPrice && (
              <Icon color={colors.yellow} height={14} name="sale" width={14} />
            )}
          </Col>
          <Col size={5}>
            <Row style={[styles.rowButtons, styles.alignCenter]}>
              {simpleRoute.surcharge && (
                <TouchableOpacity onPress={() => {}} style={styles.touchableIcon}>
                  <Icon height={14} name="warningFull" width={15} />
                </TouchableOpacity>
              )}
              {simpleRoute.notices && (
                // TODO render just one warning icon
                // onclick open modal with more information
                <TouchableOpacity onPress={() => {}} style={styles.touchableIcon}>
                  <Icon height={14} name="warning" width={15} />
                </TouchableOpacity>
              )}
              {simpleRoute.support && (
                <TouchableOpacity onPress={() => {}} style={styles.touchableIcon}>
                  <Icon height={14} name="plusInverse" width={15} />
                </TouchableOpacity>
              )}
              <Button
                disabled={isSoldOut || (isFetching && !isAddingToBasket)}
                loading={isAddingToBasket}
                onPress={pricesCount === 1 ? onSelect : onToggleDetails}
                secondary={isDetailOpen}
                size="small"
                style={styles.button}
              >
                {
                  {
                    soldOut: <FormattedMessage id="connections.soldOut" />,
                    priceOne: <Price value={price} />,
                    priceMultiple: [
                      <FormattedMessage
                        id="connections.priceFrom"
                        key="1"
                        style={theme.light}
                        textAfter=" "
                      />,
                      <Price key="2" value={price} />,
                    ],
                  }[buttonType]
                }
              </Button>
              <TouchableOpacity
                disabled={isSoldOut}
                onPress={onToggleDetails}
                style={styles.arrowIconButton}
              >
                <Icon
                  height={9}
                  name={isDetailOpen ? 'chevronUp' : 'chevronDown'}
                  color={colors.red}
                  width={15}
                />
              </TouchableOpacity>
            </Row>
          </Col>
        </Grid>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: 'center',
  },

  arrowIconButton: {
    marginRight: -10,
    paddingHorizontal: 10,
    paddingVertical: 13,
  },

  button: {
    marginLeft: 5,
  },

  freeSeatsCount: {
    justifyContent: 'flex-end',
    paddingRight: 25,
  },

  gridFirst: {
    marginBottom: 10,
  },

  iconMargin: {
    marginRight: 5,
  },

  justifyCenter: {
    justifyContent: 'center',
  },

  touchableIcon: {
    padding: 5,
  },

  rowButtons: {
    justifyContent: 'flex-end',
  },

  rowSchedule: {
    justifyContent: 'space-between',
  },
});

export default connect(({ user: { role } }) => ({ userRole: role }), {})(ConnectionHeader);
