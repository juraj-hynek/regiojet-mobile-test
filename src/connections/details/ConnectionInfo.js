// @flow
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import get from 'lodash/get';

import { colors, theme } from '../../style';
import { dateFormat } from '../../localization/localeData';
import { getSectionClassInfo } from '../helpers';
import { groupSelectedSeatsByVehicle } from '../../tickets/Ticket';
import Date from '../../components/Date';
import RouteFragment from './RouteFragment';
import RouteFragmentDetails from './RouteFragmentDetails';
import type {
  SeatClass,
  Section,
  SelectedSeat,
  Style,
  TransfersInfo,
  VehicleStandard,
} from '../../types';

type Props = {|
  seatClassKey?: ?string,
  seatClasses: Array<SeatClass>,
  sections: Array<Section>,
  selectedSeats?: Array<Array<SelectedSeat>>,
  showDate?: boolean,
  showSeatsAndTariffs?: boolean,
  style?: Style,
  transfersInfo: ?TransfersInfo,
  vehicleStandards: Array<VehicleStandard>,
|};

const ConnectionInfo = ({
  seatClassKey,
  seatClasses,
  sections,
  selectedSeats,
  showDate,
  showSeatsAndTariffs,
  style,
  transfersInfo,
  vehicleStandards,
}: Props) => (
  <View style={[styles.container, style]}>
    {showDate && (
      <Date
        capitalizeFirst
        format={`dddd ${dateFormat}`}
        ignoreTimeZone
        style={[theme.paragraph, theme.bold, styles.date]}
      >
        {sections[0].departureTime}
      </Date>
    )}

    {sections.map((section, index) => {
      const isFirst = index === 0;
      const previousSection = isFirst ? null : sections[index - 1];
      const classInfo =
        seatClassKey && getSectionClassInfo(section, seatClassKey, seatClasses, vehicleStandards);
      const tariff = get(classInfo, 'name') || get(classInfo, 'title');
      const selectedSeatsInSection = selectedSeats && selectedSeats[index];
      const galleryUrl = classInfo && classInfo.galleryUrl ? classInfo.galleryUrl : null;
      const selectedSeatsByVehicle =
        selectedSeatsInSection && groupSelectedSeatsByVehicle(selectedSeatsInSection);
      const transfer = isFirst ? null : get(transfersInfo, `transfers[${index - 1}]`);

      return (
        <View key={section.id}>
          <RouteFragment
            isFirst={isFirst}
            isLast={index === sections.length - 1}
            previousSection={previousSection}
            section={section}
            transfer={transfer}
            transferInfo={transfersInfo && transfersInfo.info}
          />
          <RouteFragmentDetails
            galleryUrl={galleryUrl}
            section={section}
            selectedSeatsByVehicle={showSeatsAndTariffs ? selectedSeatsByVehicle : null}
            tariff={showSeatsAndTariffs ? tariff : null}
          />
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.greyWhite,
    paddingBottom: 20,
    paddingHorizontal: 10,
    marginHorizontal: -10,
  },

  date: {
    marginTop: 20,
  },
});

export default connect(
  ({ consts: { seatClasses, vehicleStandards } }) => ({
    seatClasses,
    vehicleStandards,
  }),
  {},
)(ConnectionInfo);
