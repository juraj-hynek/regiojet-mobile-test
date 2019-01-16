// @flow
import React from 'react';
import { StyleSheet } from 'react-native';

import { colors, theme } from '../style';
import FormattedMessage from './FormattedMessage';
import Icon from './Icon';
import TouchableOpacity from './TouchableOpacity';
import type { Style } from '../types';

type Props = {
  onPress: Function,
  style?: Style,
};

const MojeID = ({ onPress, style }: Props) => (
  <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
    <FormattedMessage
      id="settings.mojeid.login"
      style={[theme.paragraph, theme.bold, styles.text]}
    />
    <Icon height={21} name="mojeID" width={27} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 5,
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 5,
    paddingVertical: 5,
  },

  // eslint-disable-next-line react-native/no-color-literals
  text: {
    color: colors.white,
    borderRightColor: '#333',
    borderRightWidth: 1,
    lineHeight: 30,
    marginRight: 5,
    paddingRight: 5,
  },
});

export default MojeID;
