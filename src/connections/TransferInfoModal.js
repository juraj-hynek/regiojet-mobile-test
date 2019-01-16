// @flow
import { connect } from 'react-redux';
import { Dimensions, Linking, StyleSheet, Text, View } from 'react-native';
import get from 'lodash/get';
import Image from 'react-native-scalable-image';
import React, { Fragment } from 'react';

import { composeNavigatorUrl } from './helpers';
import { theme } from '../style';
import Direction from '../components/Direction';
import FormattedMessage from '../components/FormattedMessage';
import List from '../components/List';
import TextLink from '../components/TextLink';
import TransferBox from './TransferBox';
import type { Section, StationMap, Transfer } from '../types';

type Props = {|
  info: ?string,
  nextSection: Section,
  previousSection: Section,
  stations: StationMap,
  transfer: Transfer,
|};

class TransferInfoModal extends React.PureComponent<Props> {
  static IMAGE_MAX_WIDTH = Dimensions.get('window').width - 20;

  handleNavigation = () => {
    const { stations, transfer } = this.props;
    const arrivalStation = get(stations, transfer.fromStationId);
    const departureStation = get(stations, transfer.toStationId);

    const url = composeNavigatorUrl(arrivalStation, departureStation, transfer.type);
    Linking.openURL(url);
  };

  render() {
    const { info, nextSection, previousSection, stations, transfer } = this.props;
    const { departurePlatform, line } = nextSection;

    const arrivalStationImageUrl = get(stations, `${transfer.fromStationId}.imageUrl`);
    const departureStationImageUrl =
      transfer.type !== 'NONE' && get(stations, `${transfer.toStationId}.imageUrl`);

    return (
      <Fragment>
        <TransferBox
          nextSection={nextSection}
          previousSection={previousSection}
          style={styles.marginBottom}
          transfer={transfer}
        />

        <View style={styles.info}>
          <List style={styles.list}>
            {departurePlatform && (
              <Text>
                <FormattedMessage id="connections.transferInfoModal.platform" />:{' '}
                <Text style={theme.bold}>{departurePlatform}</Text>
              </Text>
            )}
            <Direction
              from={
                <Text>
                  <FormattedMessage id="connections.transferInfoModal.line" />:{' '}
                  <Text style={theme.bold}>{line.from}</Text>
                </Text>
              }
              to={
                <Text>
                  <Text style={theme.bold}>{line.to}</Text> {line.code && ` (${line.code})`}
                </Text>
              }
            />
            {info && <Text>{info}</Text>}
          </List>

          <FormattedMessage id="connections.transferInfoModal.subHeader" style={theme.h3} />
          {transfer.description && (
            <Text style={[theme.paragraph, styles.marginBottom]}>{transfer.description}</Text>
          )}

          <TextLink onPress={this.handleNavigation} style={[theme.paragraph, styles.marginBottom]}>
            <FormattedMessage id="connections.transferInfoModal.goToMaps" />
          </TextLink>

          {arrivalStationImageUrl && (
            <Image
              style={styles.image}
              source={{ uri: arrivalStationImageUrl }}
              width={TransferInfoModal.IMAGE_MAX_WIDTH}
            />
          )}
          {departureStationImageUrl && (
            <Image
              style={styles.image}
              source={{ uri: departureStationImageUrl }}
              width={TransferInfoModal.IMAGE_MAX_WIDTH}
            />
          )}
        </View>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    marginVertical: 10,
  },

  info: {
    padding: 10,
  },

  list: {
    marginBottom: 30,
  },

  marginBottom: {
    marginBottom: 10,
  },
});

export default connect(({ consts: { stations } }) => ({ stations }))(TransferInfoModal);
