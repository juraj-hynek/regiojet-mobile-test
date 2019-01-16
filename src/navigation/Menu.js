// @flow
import { ScrollView, StyleSheet, View } from 'react-native';
import React from 'react';

import { colors, statusBarHeight } from '../style';
import Icon from '../components/Icon';
import MenuExternalLinks from './MenuExternalLinks';
import MenuInternalLinks from './MenuInternalLinks';
import TouchableOpacity from '../components/TouchableOpacity';

type Props = {
  isOpen: boolean, // eslint-disable-line react/no-unused-prop-types
  onClose: Function,
};

class Menu extends React.PureComponent<Props> {
  handlePress = (onPress: Function) => {
    this.props.onClose();
    onPress();
  };

  render() {
    const { isOpen, onClose } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollContainer}>
          <TouchableOpacity onPress={onClose} style={styles.close}>
            <Icon name="crossLight" />
          </TouchableOpacity>
          {/* $FlowFixMe */}
          <MenuInternalLinks onPress={this.handlePress} />
          <View style={styles.separator} />
          {/* $FlowFixMe */}
          <MenuExternalLinks isOpen={isOpen} onPress={this.handlePress} />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  close: {
    alignSelf: 'flex-end',
    marginBottom: -30,
    paddingHorizontal: 10,
    paddingVertical: 15,
    zIndex: 1,
  },

  container: {
    backgroundColor: colors.white,
    borderLeftColor: colors.yellow,
    borderLeftWidth: 2,
    flex: 1,
  },

  scrollContainer: {
    marginTop: statusBarHeight,
  },

  separator: {
    borderTopColor: colors.greyShadow,
    borderTopWidth: 1,
    marginHorizontal: 10,
  },
});

export default Menu;
