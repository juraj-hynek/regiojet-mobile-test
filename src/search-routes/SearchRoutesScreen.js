// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet, Text, View } from 'react-native';
import get from 'lodash/get';
import moment from 'moment';
import React from 'react';
import Slider from 'react-native-slider';
import throttle from 'lodash/throttle';

import { cleanValidationObject, isFormValid, toggleFirstInvalid } from '../components/form/helpers';
import { colors, fontFamilies, getShadow, theme } from '../style';
import { goTo } from '../navigation/actions';
import { scrollToElement } from '../components/scrollToElement';
import { setReturnDate } from '../connections/actions';
import { storeLastSearch } from './index';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import DatePicker from '../components/form/DatePicker';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';
import Input from '../components/form/Input';
import LayoutScrollable from '../components/LayoutScrollable';
import PickersArray from '../components/form/PickersArray';
import TouchableOpacity from '../components/TouchableOpacity';
import type { LastSearch, ListStation, Tariff } from '../types';

const defaultTariff = 'REGULAR';

export type SearchRoutesFormData = {
  outboundDate: ?moment,
  stationFrom: ?ListStation,
  stationTo: ?ListStation,
  tariffs: Array<string>,
};

type TariffOption = { key: string, value: string };

type Props = {|
  defaultTariffKey: string, // eslint-disable-line react/no-unused-prop-types
  goTo: typeof goTo,
  intl: intlShape,
  // eslint-disable-next-line react/no-unused-prop-types
  navigation: { state: { params: { formData: SearchRoutesFormData } } },
  returnDate: ?moment,
  setReturnDate: Function,
  tariffList: Array<Tariff>,
|};

type State = {
  formData: SearchRoutesFormData,
  lastDefaultTariffKey: ?string,
  lastNavFormData: ?SearchRoutesFormData,
  validationResults: validation.ValidationResults<*>,
};

class SearchRoutesScreen extends React.Component<Props, State> {
  static SLIDER_CONF = {
    minimumValue: 1,
    maximumValue: 6,
    step: 1,
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    const { defaultTariffKey } = props;
    const { formData, lastDefaultTariffKey, lastNavFormData } = state;

    // new form data came in navigation params => use them to prefill the form
    const newFormData = get(props, 'navigation.state.params.formData');
    if (newFormData && newFormData !== lastNavFormData) {
      return { formData: { ...formData, ...newFormData }, lastNavFormData: newFormData };
    }

    // user logged in, logged out or changed his tariff in settings
    // => use new value for first person picker
    if (defaultTariffKey !== lastDefaultTariffKey) {
      const tariffs = SearchRoutesScreen.changeTariffKey(formData.tariffs, 0, defaultTariffKey);
      return {
        formData: { ...formData, tariffs },
        lastDefaultTariffKey: defaultTariffKey,
      };
    }

    return null;
  }

  static changeTariffKey(
    tariffs: Array<string>,
    index: number,
    selectedKey: string,
  ): Array<string> {
    return [...tariffs.slice(0, index), selectedKey, ...tariffs.slice(index + 1)];
  }

  // eslint-disable-next-line react/sort-comp
  submitted: boolean = false;
  refScroll = null;

  state = {
    formData: {
      outboundDate: moment(),
      stationFrom: null,
      stationTo: null,
      tariffs: [defaultTariff],
    },
    lastDefaultTariffKey: null,
    lastNavFormData: null,
    validationResults: {},
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    // apply validations on prefilled fields (outboundDate)
    if (this.state.lastNavFormData !== prevState.lastNavFormData) {
      this.handleBlur();
    }
  }

  validate = () => {
    const {
      formData: { outboundDate, stationFrom, stationTo },
    } = this.state;

    const validationResults = {
      outboundDate: validation.required(
        outboundDate ? outboundDate.toString() : '',
        !this.submitted,
      ),
      stationFrom: validation.required(stationFrom ? stationFrom.name : '', !this.submitted),
      stationTo: validation.required(stationTo ? stationTo.name : '', !this.submitted),
    };

    return cleanValidationObject(validationResults);
  };

  handleChange = (value: Object, callback) => {
    this.setState(
      prevState => {
        const formData = {
          ...prevState.formData,
          ...value,
        };
        return { formData };
      },
      () => {
        // automatically adjust "returnDate" so that it's not before "outboundDate"
        const { returnDate } = this.props;
        const {
          formData: { outboundDate },
        } = this.state;

        if (outboundDate && returnDate && returnDate.isBefore(outboundDate)) {
          this.props.setReturnDate(moment(outboundDate));
        }

        callback();
      },
    );
  };

  handleBlur = () => {
    const validationResults = this.validate();
    this.setState({ validationResults });
  };

  /**
   * Do on blur validation right after change
   * Useful for special inputs like Datepicker or locations
   */
  handleChangeAndBlur = value => {
    this.handleChange(value, this.handleBlur);
  };

  handleSubmit = () => {
    this.submitted = true;

    const validationResults = toggleFirstInvalid(this.validate());
    this.setState({ validationResults });

    if (!isFormValid(validationResults)) {
      return;
    }

    const formData: LastSearch = (this.state.formData: any);
    storeLastSearch(formData);
    this.props.goTo('Connections', {
      ...this.state.formData,
      showReturnForm: !!this.props.returnDate,
    });
  };

  // params must be composed only once so that functions are equal in multiple calls
  // see "isEqual(action.params, lastRoute.params)" in navigation/reducer
  searchStationFromParams = {
    inputTitle: this.props.intl.formatMessage({ id: 'searchRoutes.from' }),
    onLastSearchSelect: lastSearch => this.handleChangeAndBlur(lastSearch),
    onStationSelect: selectedStation => this.handleChangeAndBlur({ stationFrom: selectedStation }),
  };

  searchStationToParams = {
    inputTitle: this.props.intl.formatMessage({ id: 'searchRoutes.to' }),
    onStationSelect: selectedStation => this.handleChangeAndBlur({ stationTo: selectedStation }),
  };

  handleClickFrom = () => this.props.goTo('SearchStation', this.searchStationFromParams);

  handleClickTo = () => this.props.goTo('SearchStation', this.searchStationToParams);

  handleStationSwitch = () => {
    const { stationFrom, stationTo } = this.state.formData;
    this.handleChangeAndBlur({ stationFrom: stationTo, stationTo: stationFrom });
  };

  handleChangePicker = (selectedOption: TariffOption, index: number) => {
    this.setState(({ formData }) => {
      const tariffs = SearchRoutesScreen.changeTariffKey(
        formData.tariffs,
        index,
        selectedOption.key,
      );
      return { formData: { ...formData, tariffs } };
    });
  };

  handleSlider = numberOfPassengers => {
    this.setState(prevState => {
      const { tariffs } = prevState.formData;

      if (numberOfPassengers === tariffs.length) {
        return {};
      }

      let newTariffs;
      if (numberOfPassengers > tariffs.length) {
        // add pickers
        const toAdd = numberOfPassengers - tariffs.length;
        const tariffsToAdd = Array.from(new Array(toAdd), () => defaultTariff);
        newTariffs = [...tariffs, ...tariffsToAdd];
      } else {
        // remove pickers
        newTariffs = [...tariffs.slice(0, numberOfPassengers)];
      }

      return {
        formData: {
          ...prevState.formData,
          tariffs: newTariffs,
        },
      };
    });
  };

  handleSliderThrottled = throttle(this.handleSlider, 100);

  render() {
    const { intl, returnDate, setReturnDate, tariffList } = this.props;
    const { formData, validationResults } = this.state;

    const sliderLabels = Array.from(
      new Array(SearchRoutesScreen.SLIDER_CONF.maximumValue),
      (x, index) => index + SearchRoutesScreen.SLIDER_CONF.minimumValue,
    );

    const scrollToInputFunction = scrollToElement(this.refScroll);
    const today = moment();

    return (
      <LayoutScrollable
        scrollViewRef={ref => {
          this.refScroll = ref;
        }}
        style={styles.layout}
      >
        <View style={theme.container}>
          <FormattedMessage
            id="searchRoutes.stations"
            style={[styles.title, styles.titleFirst]}
            textAfter=":"
            uppercase
          />
          <View style={styles.stationsContainer}>
            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={this.handleClickFrom} style={styles.inputFrom}>
                <Input
                  allowKeyboard={false}
                  iconName="burger"
                  label={intl.formatMessage({ id: 'searchRoutes.from' })}
                  leftLabel
                  required
                  scrollToElement={scrollToInputFunction}
                  validation={validationResults.stationFrom}
                  value={formData.stationFrom ? formData.stationFrom.name : ''}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.handleClickTo}>
                <Input
                  allowKeyboard={false}
                  iconName="burger"
                  label={intl.formatMessage({ id: 'searchRoutes.to' })}
                  leftLabel
                  required
                  scrollToElement={scrollToInputFunction}
                  validation={validationResults.stationTo}
                  value={formData.stationTo ? formData.stationTo.name : ''}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.btnSwitch} onPress={this.handleStationSwitch}>
              <Icon
                name="switch"
                color={colors.yellowSoft}
                width={25}
                height={90}
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </TouchableOpacity>
          </View>

          <FormattedMessage id="searchRoutes.date" style={styles.title} textAfter=":" uppercase />
          <View style={[styles.row, styles.dateContainer]}>
            <DatePicker
              label={intl.formatMessage({ id: 'searchRoutes.there' })}
              minDate={today}
              onChange={outboundDate => this.handleChangeAndBlur({ outboundDate })}
              required
              scrollToElement={scrollToInputFunction}
              style={[styles.column, styles.outboundDate]}
              validation={validationResults.outboundDate}
              value={formData.outboundDate}
            />
            <DatePicker
              label={intl.formatMessage({ id: 'searchRoutes.back' })}
              minDate={formData.outboundDate || today}
              onChange={setReturnDate}
              optionalColor={colors.greyDark}
              scrollToElement={scrollToInputFunction}
              style={styles.column}
              value={returnDate}
            />
          </View>

          <FormattedMessage
            id="searchRoutes.passengers"
            style={styles.title}
            textAfter=":"
            uppercase
          />
          <Slider
            maximumTrackTintColor={colors.greyShadow}
            maximumValue={SearchRoutesScreen.SLIDER_CONF.maximumValue}
            minimumTrackTintColor={colors.black}
            minimumValue={SearchRoutesScreen.SLIDER_CONF.minimumValue}
            onValueChange={this.handleSliderThrottled}
            step={SearchRoutesScreen.SLIDER_CONF.step}
            style={styles.slider}
            thumbStyle={styles.sliderThumb}
            trackStyle={styles.sliderTrack}
            value={formData.tariffs.length}
          />
          <View style={styles.sliderLabelContainer}>
            {sliderLabels.map(sliderLabel => (
              <TouchableOpacity
                key={sliderLabel}
                onPress={() => this.handleSlider(sliderLabel)}
                style={styles.sliderLabel}
              >
                <Text style={theme.paragraph}>{sliderLabel}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <PickersArray
            label={intl.formatMessage({ id: 'searchRoutes.passengers' })}
            optionLabelKey="value"
            options={tariffList}
            optionValueKey="key"
            onChange={this.handleChangePicker}
            values={formData.tariffs}
          />
          <Button
            textCentered
            onPress={this.handleSubmit}
            iconRight="chevronRight"
            style={styles.btnSearch}
          >
            <FormattedMessage id="searchRoutes.button.searchRoutes" />
          </Button>
        </View>
      </LayoutScrollable>
    );
  }
}

const styles = StyleSheet.create({
  btnSearch: {
    marginTop: 30,
  },

  btnSwitch: {
    marginRight: -10,
    marginVertical: -10,
    padding: 10,
  },

  column: {
    flex: 1,
    marginHorizontal: 5,
  },

  dateContainer: {
    marginTop: -18,
  },

  inputContainer: {
    flex: 1,
  },

  inputFrom: {
    marginBottom: 10,
  },

  layout: {
    backgroundColor: colors.yellow,
  },

  outboundDate: {
    marginTop: 21.5,
  },

  row: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: -5,
    marginBottom: 10,
  },

  slider: {
    marginHorizontal: 20, // need to add some margin for IOS
    flex: 1,
  },

  sliderLabel: {
    alignItems: 'center',
    paddingBottom: 10,
    width: 38,
  },

  sliderLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
  },

  sliderThumb: {
    ...getShadow({ elevation: 3 }),
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.greyLayer,
    height: 28,
    width: 28,
  },

  sliderTrack: {
    height: 2,
  },

  stationsContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    marginBottom: 10,
  },

  title: {
    alignSelf: 'flex-start',
    color: colors.greyDark,
    fontFamily: fontFamilies.bold,
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 10,
    marginTop: 20,
  },

  titleFirst: {
    marginTop: 0,
  },
});

export default injectIntl(
  connect(
    ({ connections, consts, user }) => ({
      defaultTariffKey: get(user, 'user.defaultTariffKey', defaultTariff),
      returnDate: connections.returnDate,
      tariffList: consts.tariffs,
    }),
    {
      goTo,
      setReturnDate,
    },
  )(SearchRoutesScreen),
);
