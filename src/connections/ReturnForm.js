// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet, View } from 'react-native';
import moment from 'moment';
import React from 'react';

import { cleanValidationObject, isFormValid } from '../components/form/helpers';
import { setReturnDate } from '../connections/actions';
import { theme } from '../style';
import * as validation from '../components/form/validation';
import Button from '../components/Button';
import DatePicker from '../components/form/DatePicker';
import FormattedMessage from '../components/FormattedMessage';

type Props = {|
  handleSubmit: Function,
  intl: intlShape,
  isFetching: boolean,
  minDate: moment,
  returnDate: ?moment,
  setReturnDate: Function,
|};

type State = {|
  dateTo: ?moment,
  validationResults: validation.ValidationResults<*>,
|};

class ReturnForm extends React.PureComponent<Props, State> {
  // eslint-disable-next-line react/sort-comp
  submitted: boolean = false;

  state = {
    dateTo: this.props.returnDate,
    validationResults: {},
  };

  validate = dateTo => {
    const validationResults = {
      dateTo: validation.required(dateTo ? dateTo.toString() : '', !this.submitted),
    };

    return cleanValidationObject(validationResults);
  };

  handleChange = (dateTo: moment) => {
    const validationResults = this.validate(dateTo);
    this.setState({ dateTo, validationResults });
  };

  handleSubmit = () => {
    const { dateTo } = this.state;
    this.submitted = true;

    const validationResults = this.validate(dateTo);
    this.setState({ validationResults });

    if (!isFormValid(validationResults)) {
      return;
    }

    this.props.setReturnDate(dateTo);
    this.props.handleSubmit(dateTo, 'return');
  };

  render() {
    const { intl, isFetching, minDate } = this.props;
    const { dateTo, validationResults } = this.state;

    return (
      <View style={styles.container}>
        <FormattedMessage
          id="connections.returnDate.text"
          style={[theme.paragraph, styles.paragraph]}
        />
        <View style={styles.form}>
          <View style={styles.col}>
            <DatePicker
              disabled={isFetching}
              label={intl.formatMessage({ id: 'connections.returnDate.label' })}
              minDate={minDate}
              onChange={this.handleChange}
              required
              validation={validationResults.dateTo}
              value={dateTo}
            />
          </View>
          <View style={styles.col}>
            <Button
              disabled={isFetching}
              iconRight="chevronRight"
              onPress={this.handleSubmit}
              style={styles.button}
            >
              <FormattedMessage id="connections.search" />
            </Button>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  col: {
    flex: 1,
    paddingHorizontal: 5,
  },

  container: {
    alignItems: 'center',
    padding: 10,
    paddingTop: 20,
  },

  form: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },

  paragraph: {
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default injectIntl(
  connect(
    ({ connections }) => ({
      isFetching: connections.return.isFetching,
      returnDate: connections.returnDate,
    }),
    {
      setReturnDate,
    },
  )(ReturnForm),
);
