// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import React, { Fragment } from 'react';

import { colors, composeFontStyle, theme } from '../style';
import { composeUserName } from '../user/helpers';
import { goTo } from './actions';
import { logout } from '../user/actions';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import RowEllipsis from '../components/RowEllipsis';
import type { User } from '../types';

type Props = {
  goTo: typeof goTo,
  logout: typeof logout,
  onPress: Function,
  user?: User,
};

class MenuUser extends React.PureComponent<Props> {
  handlePressLogin = () => this.props.onPress(() => this.props.goTo('Login'));

  handlePressLogout = () => this.props.onPress(() => this.props.logout());

  handlePressRegistration = () => this.props.onPress(() => this.props.goTo('Registration'));

  render() {
    const { user } = this.props;

    return (
      <View style={styles.container}>
        {user ? (
          <Fragment>
            <RowEllipsis innerStyle={styles.userName} style={styles.flex}>
              <Text style={[theme.paragraph, theme.bold, composeFontStyle(12)]}>
                {user.creditPrice ? (
                  composeUserName(user)
                ) : (
                  <Text>
                    <FormattedMessage id="header.user.openTicket" /> {user.accountCode}
                  </Text>
                )}
              </Text>
            </RowEllipsis>
            <Button
              onPress={this.handlePressLogout}
              secondary
              size="xs"
              style={[styles.flex, styles.buttonLogout]}
              type="informational"
            >
              <FormattedMessage id="header.user.button.logout" />
            </Button>
          </Fragment>
        ) : (
          <Fragment>
            <Button
              onPress={this.handlePressRegistration}
              secondary
              size="xs"
              style={styles.flex}
              type="informational"
            >
              <FormattedMessage id="header.button.register" />
            </Button>
            <Button
              onPress={this.handlePressLogin}
              size="xs"
              style={styles.flex}
              type="informational"
            >
              <FormattedMessage id="header.button.login" />
            </Button>
          </Fragment>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonLogout: {
    flex: 0,
  },

  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 20,
    paddingHorizontal: 5,
  },

  flex: {
    flex: 1,
    marginHorizontal: 5,
  },

  userName: {
    backgroundColor: colors.greyLayer,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

export default connect(({ user: { user } }) => ({ user }), {
  goTo,
  logout,
})(MenuUser);
