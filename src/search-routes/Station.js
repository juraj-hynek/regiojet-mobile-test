// @flow
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { styles as screenStyles } from './SearchStationScreen';
import { theme } from '../style';
import getImage from '../helpers/flags';
import TouchableOpacity from '../components/TouchableOpacity';

type Props = {
  item: Object,
  handlePress: Function,
};

class Station extends React.PureComponent<Props> {
  handlePress = () => this.props.handlePress(this.props.item);

  render() {
    const { item } = this.props;
    return (
      <TouchableOpacity onPress={this.handlePress} style={[screenStyles.item, styles.container]}>
        <Text style={[theme.paragraphSmall, styles.text, item.isTopLevel && theme.semiBold]}>
          {item.name}
        </Text>
        <View style={styles.flag}>
          <Image source={getImage(item.countryCode)} />
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  flag: {
    flex: 0,
    marginLeft: 10,
  },

  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  text: {
    flex: 1,
  },
});

export default Station;
