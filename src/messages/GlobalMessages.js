// @flow
import { connect } from 'react-redux';
import { Platform, StyleSheet, View } from 'react-native';
import React from 'react';

import GlobalMessage from './GlobalMessage';
import type { GlobalMessage as TypeGlobalMessage } from '../types';
import { statusBarHeight } from '../style';

type Props = {
  messages: Array<TypeGlobalMessage>,
};

const GlobalMessages = ({ messages }: Props) => (
  <View style={styles.container}>
    {messages.map(message => <GlobalMessage key={message.id} message={message} />)}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    left: 0,
    position: 'absolute',
    right: 0,
    top: Platform.select({
      android: 0,
      ios: statusBarHeight - 3,
    }),
  },
});

export default connect(({ globalMessages }) => ({ messages: globalMessages }), {})(GlobalMessages);
