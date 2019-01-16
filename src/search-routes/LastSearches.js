// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import compact from 'lodash/compact';
import flow from 'lodash/fp/flow';
import get from 'lodash/get';
import head from 'lodash/head';
import React, { type Element } from 'react';
import set from 'lodash/fp/set';

import { colors, theme } from '../style';
import { styles as screenStyles } from './SearchStationScreen';
import Direction from '../components/Direction';
import FormattedMessage from '../components/FormattedMessage';
import TouchableOpacity from '../components/TouchableOpacity';
import type { Country, LastSearch } from '../types';

type Props = {
  handleItemPress: Function,
  lastSearches: Array<LastSearch>,
  locations: Array<Country>,
  searchQuery: string,
};

class LastSearches extends React.PureComponent<Props> {
  // Need to get item names from locations to respect current locale
  // (Locale might have been changed since the latest lastSearches update)
  getItemName(place: Object): string {
    const { name } = place;
    const location = this.props.locations.find(location => location.code === place.countryCode);
    if (!location) return name;

    if (place.type === 'CITY') {
      return get(location.cities.find(({ id }) => id === place.id), 'name', name);
    }

    if (place.type === 'STATION') {
      const station = head(
        compact(location.cities.map(city => city.stations.find(({ id }) => id === place.id))),
      );
      return get(station, 'fullname', name);
    }

    return name;
  }

  handleItemPress = (item: Object) => {
    const localeItem = flow(
      set('stationFrom.name', this.getItemName(item.stationFrom)),
      set('stationTo.name', this.getItemName(item.stationTo)),
    )(item);

    this.props.handleItemPress(localeItem);
  };

  renderItem = (item: Object): Element => (
    <TouchableOpacity
      key={`${item.stationFrom.id}-${item.stationTo.id}`}
      onPress={() => this.handleItemPress(item)}
      style={[screenStyles.item, styles.item]}
    >
      <Direction
        from={this.getItemName(item.stationFrom)}
        textStyle={theme.paragraphSmall}
        to={this.getItemName(item.stationTo)}
      />
    </TouchableOpacity>
  );

  render() {
    const { lastSearches, searchQuery } = this.props;
    if (searchQuery.length || !lastSearches.length) return null;

    return (
      <View style={styles.container}>
        <View style={styles.headingContainer}>
          <FormattedMessage
            id="searchRoutes.lastSearch"
            style={[theme.paragraphSmall, theme.bold, styles.heading]}
          />
        </View>
        {lastSearches.map(this.renderItem)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  container: {
    borderBottomColor: colors.greyShadow,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 10,
  },

  headingContainer: {
    borderBottomColor: colors.yellow,
    borderBottomWidth: 1,
    marginBottom: 7,
    marginHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 1,
  },

  heading: {
    color: colors.yellow,
  },
});

export default connect(({ consts: { locations } }) => ({ locations }))(LastSearches);
