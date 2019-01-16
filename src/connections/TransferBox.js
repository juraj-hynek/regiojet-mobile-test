// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import Dash from 'react-native-dash';
import React from 'react';

import { colors, theme } from '../style';
import { getVehicleIconNameByType } from '../helpers/routes';
import { timeFormat } from '../localization/localeData';
import Date from '../components/Date';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';
import type { Locale, Section, Style, Transfer, VehicleType } from '../types';

type Props = {|
  locale: Locale,
  nextSection: Section,
  previousSection: Section,
  style?: Style,
  transfer: Transfer,
|};

class TransferBox extends React.PureComponent<Props> {
  static renderIconRow(vehicleType: VehicleType, colTimeStyles: Object) {
    return (
      <View style={styles.row}>
        <View style={colTimeStyles} />
        <View style={styles.colShapes}>
          <Icon height={24} name={getVehicleIconNameByType(vehicleType)} width={25} />
        </View>
        <View style={styles.colText} />
      </View>
    );
  }

  static renderStationRow(
    time: string,
    cityName: string,
    stationName: string,
    colTimeStyles: Object,
  ) {
    return (
      <View style={styles.row}>
        <View style={colTimeStyles}>
          <Date format={timeFormat} ignoreTimeZone style={theme.paragraph}>
            {time}
          </Date>
        </View>
        <View style={styles.colShapes}>
          <View style={styles.circle} />
        </View>
        <View style={styles.colText}>
          <Text style={theme.paragraph}>
            {cityName}, <Text style={theme.bold}>{stationName}</Text>
          </Text>
        </View>
      </View>
    );
  }

  composeColTimeStyles() {
    return {
      alignItems: 'flex-end',
      width: this.props.locale === 'en' ? 65 : 40,
    };
  }

  render() {
    const { nextSection, previousSection, style, transfer } = this.props;
    const colTimeStyles = this.composeColTimeStyles();

    return (
      <View style={[theme.container, styles.container, style]}>
        {TransferBox.renderIconRow(previousSection.vehicleType, colTimeStyles)}
        {TransferBox.renderStationRow(
          previousSection.arrivalTime,
          previousSection.arrivalCityName,
          previousSection.arrivalStationName,
          colTimeStyles,
        )}

        <View style={styles.row}>
          <View style={colTimeStyles} />
          <View style={[styles.colShapes, styles.colDash]}>
            <Dash dashColor={colors.greyShadow} dashThickness={3} style={styles.dash} />
          </View>
          <View style={[styles.colText, styles.colTextTransfer]}>
            <FormattedMessage
              id="connections.transferInfoModal.calculatedTransferTime"
              style={[theme.paragraphSmall, styles.time]}
              values={{
                timePeriod: (
                  <FormattedMessage
                    id="connections.info.timePeriod"
                    style={theme.bold}
                    values={transfer.calculatedTransferTime}
                  />
                ),
              }}
            />
            {transfer.type !== 'NONE' && (
              <FormattedMessage
                id="connections.transferInfoModal.determinedTransferTime"
                style={[theme.paragraphSmall, styles.time]}
                values={{
                  timePeriod: (
                    <FormattedMessage
                      id="connections.info.timePeriod"
                      style={theme.bold}
                      values={transfer.determinedTransferTime}
                    />
                  ),
                }}
              />
            )}
          </View>
        </View>

        {TransferBox.renderStationRow(
          nextSection.departureTime,
          nextSection.departureCityName,
          nextSection.departureStationName,
          colTimeStyles,
        )}
        {TransferBox.renderIconRow(nextSection.vehicleType, colTimeStyles)}
      </View>
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

  colDash: {
    alignItems: 'stretch',
    flexDirection: 'row',
    marginVertical: -5.5,
  },

  colShapes: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 25,
  },

  colText: {
    flex: 1,
  },

  colTextTransfer: {
    paddingVertical: 20,
  },

  container: {
    backgroundColor: colors.greyWhite,
  },

  dash: {
    flexDirection: 'column',
  },

  row: {
    flexDirection: 'row',
  },

  time: {
    color: colors.grey,
  },
});

export default connect(({ localization: { locale } }) => ({ locale }))(TransferBox);
