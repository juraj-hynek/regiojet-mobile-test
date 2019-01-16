// @flow
import React, { Fragment, type Element } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { colors, fontFamilies, getShadow, theme } from '../style';
import { filterLocations, getLastSearches } from './index';
import { goBack } from '../navigation/actions';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';
import LastSearches from './LastSearches';
import LayoutScrollable from '../components/LayoutScrollable';
import Station from './Station';
import type { Country, LastSearch, ListStation } from '../types';

type Props = {|
  goBack: typeof goBack,
  navigation: {
    state: {
      params: { onStationSelect: Function, inputTitle: string, onLastSearchSelect?: Function },
    },
  },
  originalLocations: Array<Country>,
|};

type State = {
  filteredStations: Array<ListStation>,
  lastSearches: Array<LastSearch>,
  searchQuery: string,
};

class SearchStationScreen extends React.PureComponent<Props, State> {
  // eslint-disable-next-line react/sort-comp
  refList = null;

  state = {
    filteredStations: [],
    lastSearches: [],
    searchQuery: '',
  };

  componentDidMount() {
    const {
      navigation: {
        state: {
          params: { onLastSearchSelect },
        },
      },
    } = this.props;

    if (onLastSearchSelect) {
      getLastSearches().then(lastSearches => {
        this.setState({ lastSearches });
      });
    }

    if (this.props.originalLocations.length) {
      this.initStationList(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.originalLocations.length && nextProps.originalLocations.length) {
      this.initStationList(nextProps);
    }
  }

  /**
   * We need to call filterLocations with empty query to get the whole
   * formatted list at the beginning
   */
  initStationList(props) {
    this.setState({ filteredStations: filterLocations(props.originalLocations, '') });
  }

  handleChange = (searchQuery: string) => {
    const { originalLocations } = this.props;
    this.setState({
      searchQuery,
      filteredStations: filterLocations(originalLocations, searchQuery),
    });

    // scroll list to top
    if (this.refList) {
      this.refList.scrollToOffset({ offset: 0 });
    }
  };

  handlePress = (station: Object) => {
    const {
      goBack,
      navigation: { state },
    } = this.props;
    state.params.onStationSelect(station);
    goBack();
  };

  handleLastSearchPress = (lastSearch: Object) => {
    const {
      goBack,
      navigation: { state },
    } = this.props;
    if (state.params.onLastSearchSelect) {
      state.params.onLastSearchSelect(lastSearch);
      goBack();
    }
  };

  keyExtractor = ({ id }): string => id.toString();

  renderEmptyMessage = (): Element => (
    <View style={styles.errorContainer}>
      <FormattedMessage id="searchRoutes.noResults" style={styles.errorText} />
    </View>
  );

  // eslint-disable-next-line react/no-unused-prop-types
  renderItem = ({ item, index }: { item: Object, index: number }): Element =>
    index === 0 ? (
      <Fragment>
        <LastSearches
          handleItemPress={this.handleLastSearchPress}
          itemStyle={styles.item}
          lastSearches={this.state.lastSearches}
          searchQuery={this.state.searchQuery}
        />
        <Station item={item} handlePress={this.handlePress} style={styles.item} />
      </Fragment>
    ) : (
      <Station item={item} handlePress={this.handlePress} style={styles.item} />
    );

  renderSeparator = (): Element => <View style={styles.separator} />;

  render() {
    const {
      navigation: {
        state: {
          params: { inputTitle },
        },
      },
    } = this.props;
    const { filteredStations, searchQuery } = this.state;

    return (
      <LayoutScrollable contentContainerStyle={[theme.container, styles.container]}>
        <Input
          autoFocus
          label={inputTitle}
          leftLabel
          onChange={this.handleChange}
          required
          style={styles.input}
          value={searchQuery}
        />
        <View style={styles.listContainer}>
          {/*
            Do not use ListHeaderComponent to render the header
            It has significant performance issues
          */}
          <FlatList
            data={filteredStations}
            initialNumToRender={20}
            ItemSeparatorComponent={this.renderSeparator}
            keyboardShouldPersistTaps="always"
            keyExtractor={this.keyExtractor}
            ListEmptyComponent={this.renderEmptyMessage}
            ref={ref => {
              this.refList = ref;
            }}
            renderItem={this.renderItem}
            style={[theme.borderWithRadius, styles.list]}
          />
        </View>
      </LayoutScrollable>
    );
  }
}

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.yellow,
    paddingBottom: 10,
    paddingTop: 15,
  },

  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  errorText: {
    color: colors.black,
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 15,
  },

  input: {
    flex: 0,
  },

  item: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },

  list: {
    ...getShadow({ elevation: 3 }),
    flexGrow: 0,
  },

  listContainer: {
    flex: 1,
  },

  separator: {
    backgroundColor: colors.greyShadow,
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});

export default connect(
  ({ consts: { locations } }) => ({
    originalLocations: locations,
  }),
  { goBack },
)(SearchStationScreen);
