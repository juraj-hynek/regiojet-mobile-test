// @flow
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import RouteConnectionInfo from '../connections/details/ConnectionInfo';
import type { Section, TransfersInfo } from '../types';

type Props = {
  sections: Array<Section>,
  transfersInfo: ?TransfersInfo,
};

const ConnectionInfo = ({ sections, transfersInfo }: Props) => (
  <View style={styles.container}>
    <FormattedMessage id="reservation.connectionInformation" style={theme.h2} />
    <RouteConnectionInfo sections={sections} showDate transfersInfo={transfersInfo} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },
});

export default ConnectionInfo;
