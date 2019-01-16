// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { theme, getHitSlop } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';
import TouchableOpacity from '../components/TouchableOpacity';
import type { Style } from '../types';

type Props = {
  closeModal: Function,
  style?: Style,
  title: string,
  titleId: string,
};

const Header = ({ closeModal, style, title, titleId }: Props) => {
  const titleStyle = [theme.h2, theme.bold, styles.title];

  return (
    <View style={[styles.container, style]}>
      {titleId ? (
        <FormattedMessage id={titleId} style={titleStyle} />
      ) : (
        <Text style={titleStyle}>{title}</Text>
      )}
      <TouchableOpacity hitSlop={getHitSlop()} onPress={closeModal}>
        <Icon height={39} name="crossLight" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingLeft: 10,
  },
  title: {
    flexShrink: 1,
    marginBottom: 0,
    marginRight: 20,
  },
});

export default connect(({ modal }) => ({ modal }), {})(Header);
