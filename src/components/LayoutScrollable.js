// @flow
import { KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native';
import React, { type Node } from 'react';

import { colors, getKeyboardPlatformProps } from '../style';
import type { Style } from '../types';

type Props = {
  children: Node,
  contentContainerStyle?: Style,
  isModal?: boolean,
  scrollViewRef?: Function,
  scrollViewStyle?: Style,
  style?: Style,
};

const LayoutScrollable = ({
  children,
  contentContainerStyle,
  isModal,
  scrollViewRef,
  scrollViewStyle,
  style,
  ...otherProps
}: Props) => (
  <KeyboardAvoidingView {...getKeyboardPlatformProps(!isModal)} style={[styles.container, style]}>
    <ScrollView
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      ref={scrollViewRef}
      style={scrollViewStyle}
      {...otherProps}
    >
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },

  contentContainer: {
    alignItems: 'stretch',
  },
});

export default LayoutScrollable;
