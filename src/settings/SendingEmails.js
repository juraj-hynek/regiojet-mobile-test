// @flow
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { changeInfo } from '../user/actions';
import { theme } from '../style';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import CheckBox from '../components/form/CheckBox';
import type { Notifications, Style, User } from '../types';

type Props = {
  changeInfo: typeof changeInfo,
  isFetching: boolean,
  style?: Style,
  user: User,
};

type State = {
  formData: Notifications,
};

class SendingEmails extends React.Component<Props, State> {
  static getFormData = user => user.notifications;

  state = {
    formData: SendingEmails.getFormData(this.props.user),
  };

  componentWillReceiveProps(nextProps) {
    // user was updated, reset form
    if (this.props.user !== nextProps.user) {
      this.setState({ formData: SendingEmails.getFormData(nextProps.user) });
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

    changeInfo('SendingEmails', { notifications: formData });
  };

  render() {
    const { isFetching, style } = this.props;
    const { formData } = this.state;

    return (
      <View style={[theme.container, style]}>
        <FormattedMessage id="settings.email.title" style={theme.h2} />
        <FormattedMessage id="settings.email.subtitle" style={[theme.paragraph, styles.row]} />

        <CheckBox
          disabled={isFetching}
          checked={formData.newsletter}
          onPress={newsletter => this.handleChange({ newsletter })}
          style={styles.row}
        >
          <FormattedMessage id="settings.email.info" />
        </CheckBox>
        <CheckBox
          disabled={isFetching}
          checked={formData.reservationChange}
          onPress={reservationChange => this.handleChange({ reservationChange })}
          style={styles.row}
        >
          <FormattedMessage id="settings.email.news" />
        </CheckBox>
        <CheckBox
          disabled={isFetching}
          checked={formData.routeRatingSurvey}
          onPress={routeRatingSurvey => this.handleChange({ routeRatingSurvey })}
          style={styles.row}
        >
          <FormattedMessage id="settings.email.evaluation" />
        </CheckBox>

        <Button loading={isFetching} onPress={this.handleSubmit} style={styles.marginTop}>
          <FormattedMessage id="settings.email.button" />
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

export default connect(
  ({ user }) => ({
    isFetching: user.changeInfo.SendingEmails.isFetching,
    user: user.user,
  }),
  { changeInfo },
)(SendingEmails);
