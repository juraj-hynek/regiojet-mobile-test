// @flow
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';

import { changeInfo } from '../user/actions';
import { theme } from '../style';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Picker from '../components/form/Picker';
import type { Style, Tariff, User } from '../types';

type Props = {
  changeInfo: typeof changeInfo,
  intl: intlShape,
  isFetching: boolean,
  style?: Style,
  tariffs: Array<Tariff>,
  user: User,
};

type State = {
  formData: {
    defaultTariffKey: string,
  },
};

class CreditTicket extends React.Component<Props, State> {
  static getFormData = user => ({ defaultTariffKey: user.defaultTariffKey });

  state = {
    formData: CreditTicket.getFormData(this.props.user),
  };

  componentWillReceiveProps(nextProps) {
    // user was updated, reset form
    if (this.props.user !== nextProps.user) {
      this.setState({ formData: CreditTicket.getFormData(nextProps.user) });
    }
  }

  handleChange = (value: Object) => {
    this.setState(prevState => {
      const formData = {
        ...prevState.formData,
        ...value,
      };
      return { formData };
    });
  };

  handleSubmit = () => {
    const { changeInfo } = this.props;
    const { formData } = this.state;

    changeInfo('CreditTicket', formData);
  };

  render() {
    const { intl, isFetching, style, tariffs } = this.props;
    const { formData } = this.state;

    return (
      <View style={[theme.container, style]}>
        <FormattedMessage id="settings.credit.title" style={theme.h2} />
        <Picker
          disabled={isFetching}
          label={intl.formatMessage({ id: 'settings.credit.tariff' })}
          onChange={tariff => this.handleChange({ defaultTariffKey: tariff.key })}
          optionLabelKey="value"
          options={tariffs}
          optionValueKey="key"
          style={styles.row}
          value={formData.defaultTariffKey}
        />

        <Button loading={isFetching} onPress={this.handleSubmit} style={styles.marginTop}>
          <FormattedMessage id="settings.credit.button" />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 20,
  },

  marginTop: {
    marginTop: 10,
  },
});

export default injectIntl(
  connect(
    ({ consts: { tariffs }, user }) => ({
      isFetching: user.changeInfo.CreditTicket.isFetching,
      tariffs,
      user: user.user,
    }),
    { changeInfo },
  )(CreditTicket),
);
