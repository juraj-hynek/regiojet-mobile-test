// @flow
import { StyleSheet, Text } from 'react-native';
import React from 'react';

import { colors } from '../style';
import Icon from './Icon';
import TouchableOpacity from './TouchableOpacity';
import type { ErrorResponse } from '../types';
import Warning from './Warning';

type Props = {|
  error: ?ErrorResponse,
  onRetry: Function,
|};

const ErrorWithRetry = ({ error, onRetry }: Props) => {
  if (!error) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onRetry} style={styles.container}>
      <Warning type="error">
        <Text>{error.message}</Text>
      </Warning>
      <Icon color={colors.red} height={40} name="refresh" style={styles.icon} width={40} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  icon: {
    margin: 20,
  },
});

export default ErrorWithRetry;
