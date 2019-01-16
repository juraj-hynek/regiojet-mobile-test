// @flow
import { connect } from 'react-redux';
import { injectIntl, type IntlShape } from 'react-intl';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { getPassengerValue, getValidationKey } from './helpers';
import { goTo } from '../navigation/actions';
import { openSimpleRegistrationModal } from '../modal/actions';
import { theme } from '../style';
import { updatePassenger } from '../basket/actions';
import * as validation from '../components/form/validation';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';
import Input from '../components/form/Input';
import TextLink from '../components/TextLink';
import ScrollableContext from '../components/ScrollableContext';
import type { PassengerField, RoutePassenger } from '../types';

type Props = {|
  basketItemId: string,
  goTo: typeof goTo,
  intl: IntlShape,
  isLoggedIn: boolean,
  onBlur: Function,
  openSimpleRegistrationModal: typeof openSimpleRegistrationModal,
  passengerValues: Array<RoutePassenger>,
  updatePassenger: typeof updatePassenger,
  validationResults: validation.ValidationResults<*>,
|};

class Contact extends React.PureComponent<Props> {
  getValue(field: PassengerField) {
    const { passengerValues } = this.props;
    return getPassengerValue(passengerValues, field);
  }

  handleChange = (field: RoutePassenger) => {
    const { basketItemId, updatePassenger } = this.props;
    updatePassenger(basketItemId, 0, field, true);
  };

  handlePressLogin = () => this.props.goTo('Login');

  handlePressRegistration = () => this.props.openSimpleRegistrationModal(false);

  render() {
    const { basketItemId, intl, isLoggedIn, onBlur, validationResults } = this.props;

    return (
      <View style={styles.container}>
        <FormattedMessage id="reservation.contact.title" style={theme.h2} />
        <ScrollableContext>
          <Input
            keyboardType="email-address"
            label={intl.formatMessage({ id: 'reservation.contact.email' })}
            onBlur={onBlur}
            onChange={email => this.handleChange({ email })}
            required
            style={styles.row}
            validation={validationResults[getValidationKey('email', basketItemId)]}
            value={this.getValue('email')}
          />
          <Input
            keyboardType="phone-pad"
            label={intl.formatMessage({ id: 'reservation.contact.phone' })}
            onBlur={onBlur}
            onChange={phone => this.handleChange({ phone })}
            validation={validationResults[getValidationKey('phone', basketItemId)]}
            value={this.getValue('phone')}
          />
        </ScrollableContext>
        {!isLoggedIn && (
          <View style={styles.userContainer}>
            <Icon height={16} name="user" style={styles.icon} width={16} />
            <Text style={[theme.paragraphSmall, styles.userTextContainer]}>
              <FormattedMessage id="reservation.contact.creditTicket" />{' '}
              <TextLink onPress={this.handlePressLogin}>
                <FormattedMessage id="reservation.loginDesktop" />
              </TextLink>{' '}
              <FormattedMessage id="reservation.orDesktop" />{' '}
              <TextLink onPress={this.handlePressRegistration}>
                <FormattedMessage id="reservation.registerDesktop" />
              </TextLink>
            </Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },

  icon: {
    marginLeft: 3,
    marginRight: 10,
  },

  row: {
    marginBottom: 20,
  },

  userContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 20,
  },

  userTextContainer: {
    flex: 1,
  },
});

export default injectIntl(
  connect(({ user: { user } }) => ({ isLoggedIn: !!user }), {
    goTo,
    openSimpleRegistrationModal,
    updatePassenger,
  })(Contact),
);
