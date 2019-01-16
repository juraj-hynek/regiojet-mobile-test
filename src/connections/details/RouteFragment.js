// @flow
import { Col, Grid, Row } from 'native-base';
import { connect } from 'react-redux';
import { Text, View, StyleSheet } from 'react-native';
import Dash from 'react-native-dash';
import React from 'react';

import { colors, theme } from '../../style';
import { getVehicleIconNameByType } from '../../helpers/routes';
import { openTransferInfoModal } from '../../modal/actions';
import { timeFormat } from '../../localization/localeData';
import Date from '../../components/Date';
import FormattedMessage from '../../components/FormattedMessage';
import Icon from '../../components/Icon';
import TextLink from '../../components/TextLink';
import type { Section, Style, Transfer } from '../../types';

type Props = {|
  isFirst: boolean,
  isLast: boolean,
  openTransferInfoModal: typeof openTransferInfoModal,
  previousSection: ?Section,
  section: Section,
  transfer: ?Transfer,
  transferInfo: ?string,
|};

class RouteFragment extends React.PureComponent<Props> {
  static renderDash(style?: Style) {
    return <Dash dashColor={colors.greyShadow} dashThickness={3} style={[styles.dash, style]} />;
  }

  handlePressTransferInfo = () => {
    const { openTransferInfoModal, previousSection, section, transfer, transferInfo } = this.props;
    if (previousSection && transfer) {
      openTransferInfoModal(transfer, transferInfo, previousSection, section);
    }
  };

  renderTransferInfo() {
    const { previousSection, transfer } = this.props;

    if (!previousSection || !transfer) {
      return null;
    }

    return (
      <View style={styles.transferTime}>
        <FormattedMessage
          id="connections.info.transferWaiting"
          style={[theme.paragraphSmall, styles.transferTimeText]}
          values={{
            timePeriod: (
              <FormattedMessage
                id="connections.info.timePeriod"
                values={transfer.calculatedTransferTime}
              />
            ),
          }}
        />
        <TextLink onPress={this.handlePressTransferInfo} style={theme.paragraphSmall}>
          <FormattedMessage id="connections.info.transferInfo" />
        </TextLink>
      </View>
    );
  }

  render() {
    const {
      isFirst,
      isLast,
      section: {
        arrivalCityName,
        arrivalStationName,
        arrivalTime,
        departureCityName,
        departureStationName,
        departureTime,
        vehicleType,
      },
    } = this.props;

    return (
      <Grid style={styles.container}>
        <Row>
          <Col size={2} />
          <Col size={3} />
          <Col
            size={2}
            style={[styles.colShapes, styles.colDashTop, !isFirst && styles.dashOffsetTop]}
          >
            {!isFirst && RouteFragment.renderDash(styles.dashTop)}
          </Col>
          <Col size={15}>{this.renderTransferInfo()}</Col>
        </Row>
        <Row>
          <Col size={2} style={styles.colVehicle}>
            <Icon height={21} name={getVehicleIconNameByType(vehicleType)} width={25} />
          </Col>
          <Col size={3} style={styles.colTime}>
            <Date format={timeFormat} ignoreTimeZone style={[theme.paragraph, styles.textRight]}>
              {departureTime}
            </Date>
            <Date format={timeFormat} ignoreTimeZone style={[theme.paragraph, styles.textRight]}>
              {arrivalTime}
            </Date>
          </Col>
          <Col size={2} style={[styles.colShapes, !isLast && styles.dashOffsetBottom]}>
            <View style={[styles.circle, styles.circleTop]} />
            <View style={styles.line} />
            <View style={[styles.circle, styles.circleBottom]} />
            {!isLast && RouteFragment.renderDash(styles.dashBottom)}
          </Col>
          <Col size={15} style={styles.colPlaces}>
            <Text style={theme.paragraph}>
              <Text>{departureCityName}, </Text>
              <Text style={theme.semiBold}>{departureStationName}</Text>
            </Text>
            <Text style={theme.paragraph}>
              <Text>{arrivalCityName}, </Text>
              <Text style={theme.semiBold}>{arrivalStationName}</Text>
            </Text>
          </Col>
        </Row>
      </Grid>
    );
  }
}

const styles = StyleSheet.create({
  circle: {
    borderColor: colors.yellow,
    borderRadius: 7,
    borderWidth: 3,
    height: 13,
    width: 13,
  },

  circleBottom: {
    marginBottom: 2,
  },

  circleTop: {
    marginTop: 4,
  },

  colDashTop: {
    marginBottom: -4,
  },

  colPlaces: {
    justifyContent: 'space-between',
  },

  colShapes: {
    alignItems: 'center',
  },

  colTime: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  colVehicle: {
    justifyContent: 'center',
  },

  container: {
    paddingVertical: 20,
  },

  dash: {
    flexDirection: 'column',
  },

  dashBottom: {
    height: 20,
  },

  dashTop: {
    height: '100%',
  },

  dashOffsetBottom: {
    marginBottom: -20,
  },

  dashOffsetTop: {
    marginTop: -20,
  },

  line: {
    backgroundColor: colors.yellow,
    flex: 1,
    marginVertical: -1,
    minHeight: 40,
    width: 3,
  },

  textRight: {
    textAlign: 'right',
  },

  transferTime: {
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  transferTimeText: {
    color: colors.grey,
  },
});

export default connect(null, { openTransferInfoModal })(RouteFragment);
