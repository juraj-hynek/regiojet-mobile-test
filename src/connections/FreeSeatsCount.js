// @flow
import { Row } from 'native-base';
import { StyleSheet } from 'react-native';
import React from 'react';

import { colors, theme } from '../style';
import FormattedNumber from '../components/FormattedNumber';
import Icon from '../components/Icon';
import type { Style } from '../types';

type Props = {
  count: number,
  isSoldOut: boolean,
  style?: Style,
};

export default ({ count, isSoldOut, style }: Props) => (
  <Row style={[styles.container, style]}>
    <Icon
      color={isSoldOut ? colors.black : colors.green}
      height={14}
      name="user"
      style={styles.icon}
      width={14}
    />
    <FormattedNumber
      style={[theme.paragraph, theme.bold, !isSoldOut && styles.green]}
      value={count}
    />
  </Row>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  green: {
    color: colors.green,
  },
  icon: {
    marginRight: 5,
  },
});
