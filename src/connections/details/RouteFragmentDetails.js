// @flow
import { connect } from 'react-redux';
import { Row } from 'native-base';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import React from 'react';

import { colors, theme } from '../../style';
import { openLineDetailModal, openWebViewModal } from '../../modal/actions';
import Direction from '../../components/Direction';
import FormattedMessage from '../../components/FormattedMessage';
import FormattedNumber from '../../components/FormattedNumber';
import SeatBadge from '../../reservation/SeatBadge';
import TextLink from '../../components/TextLink';
import type { Section } from '../../types';

type Props = {
  galleryUrl?: ?string,
  openLineDetailModal: typeof openLineDetailModal,
  openWebViewModal: typeof openWebViewModal,
  section: Section,
  selectedSeatsByVehicle: ?Object,
  tariff: ?string,
};

class RouteFragmentDetails extends React.PureComponent<Props> {
  handlePressConnectionDetail = () => this.props.openLineDetailModal(this.props.section);

  handlePressTariffInfo = () => {
    const { galleryUrl } = this.props;
    if (galleryUrl) {
      this.props.openWebViewModal(galleryUrl, 'connections.galleryModal.header');
    }
  };

  render() {
    const { galleryUrl, section, selectedSeatsByVehicle, tariff } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.triangle}>
          <View style={styles.triangleStroke} />
          <View style={styles.triangleFill} />
        </View>
        <View style={styles.content}>
          {section.departurePlatform && (
            <Text style={[theme.paragraphSmall, styles.row]}>
              <FormattedMessage id="connections.platform" />: {section.departurePlatform}
            </Text>
          )}

          {selectedSeatsByVehicle &&
            Object.keys(selectedSeatsByVehicle).length > 0 && (
              <Row style={styles.row}>
                <View style={styles.selectedSeatBadgeContainer}>
                  {Object.keys(selectedSeatsByVehicle).map(vehicleNumber => (
                    <SeatBadge
                      key={vehicleNumber}
                      seatNumbers={selectedSeatsByVehicle[vehicleNumber]}
                      style={styles.selectedSeatBadge}
                      vehicleNumber={
                        section.vehicleType === 'TRAIN' ? parseInt(vehicleNumber, 10) : undefined
                      }
                    />
                  ))}
                </View>
              </Row>
            )}

          {tariff && (
            <Text style={[theme.paragraphSmall, styles.row]}>
              <FormattedMessage id="connections.info.tariff" />:{' '}
              {galleryUrl ? (
                <TextLink onPress={this.handlePressTariffInfo}>{tariff}</TextLink>
              ) : (
                <Text>{tariff}</Text>
              )}
            </Text>
          )}

          {section.freeSeatsCount !== null && (
            <Text style={[theme.paragraphSmall, styles.row]}>
              <FormattedMessage id="connections.freeSeats" />:{' '}
              <FormattedNumber value={section.freeSeatsCount} />
            </Text>
          )}

          <Row style={[styles.row, styles.rowCentered]}>
            <FormattedMessage id="connections.line" style={theme.paragraphSmall} textAfter=": " />
            <TouchableOpacity
              onPress={this.handlePressConnectionDetail}
              style={styles.directionContainer}
            >
              <Direction
                from={section.line.from}
                textStyle={[theme.paragraphSmall, styles.link]}
                to={`${section.line.to}${section.line.code ? ` (${section.line.code})` : ''}`}
              />
            </TouchableOpacity>
          </Row>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    marginTop: -5,
    minWidth: 250,
    width: '80%',
  },

  content: {
    backgroundColor: colors.white,
    borderColor: colors.greyShadow,
    borderRadius: 2,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  directionContainer: {
    flex: 1,
  },

  link: {
    color: colors.red,
  },

  row: {
    marginVertical: 5,
  },

  rowCentered: {
    alignItems: 'center',
  },

  selectedSeatBadge: {
    margin: 5,
  },

  selectedSeatBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -5,
  },

  triangle: {
    marginBottom: -1,
    zIndex: 1,
  },

  triangleFill: {
    alignSelf: 'center',
    borderBottomColor: colors.white,
    borderBottomWidth: 5,
    borderLeftColor: colors.transparent,
    borderLeftWidth: 4,
    borderRightColor: colors.transparent,
    borderRightWidth: 4,
    height: 0,
    width: 0,
  },

  triangleStroke: {
    alignSelf: 'center',
    borderBottomColor: colors.greyShadowHexa,
    borderBottomWidth: 6,
    borderLeftColor: colors.transparent,
    borderLeftWidth: 5,
    borderRightColor: colors.transparent,
    borderRightWidth: 5,
    height: 0,
    marginBottom: -5,
    width: 0,
  },
});

export default connect(null, { openLineDetailModal, openWebViewModal })(RouteFragmentDetails);
