// @flow
import React, { type Node } from 'react';
import { StyleSheet, ImageBackground, View } from 'react-native';

import progressWrapBg from '../images/header/progressWrapBg.jpg';
import FormattedMessage from '../components/FormattedMessage';
import { colors, fontFamilies } from '../style';
import type { Style } from '../types';

type Props = {
  children?: Node,
  style?: Style,
  messageId: string,
};

const Heading = ({ children, messageId, style }: Props) => (
  <View style={[styles.container, style]}>
    <ImageBackground style={styles.backgroundImage} source={progressWrapBg}>
      <FormattedMessage id={messageId} style={styles.textHeader} uppercase />
      {children}
    </ImageBackground>
  </View>
);

const styles = StyleSheet.create({
  backgroundImage: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 10,
    flex: 1,
  },

  container: {
    alignItems: 'stretch',
  },

  textHeader: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: fontFamilies.bold,
    color: colors.white,
  },
});

export default Heading;
