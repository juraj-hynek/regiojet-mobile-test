// @flow
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import Login from './Login';
import LayoutScrollable from '../components/LayoutScrollable';
import Tabs from '../components/Tabs';

const LoginScreen = () => (
  <LayoutScrollable contentContainerStyle={styles.container}>
    <Tabs
      headers={[
        <View style={styles.center}>
          <FormattedMessage id="login.creditTicket" style={[theme.paragraphSmall, theme.bold]} />
          <FormattedMessage id="login.creditTicket.subtitle" style={theme.paragraphSmall} />
        </View>,
        <FormattedMessage id="login.openTicket" style={[theme.paragraphSmall, theme.bold]} />,
      ]}
    >
      <Login credit />
      <Login />
    </Tabs>
  </LayoutScrollable>
);

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },

  center: {
    alignItems: 'center',
  },
});

export default LoginScreen;
