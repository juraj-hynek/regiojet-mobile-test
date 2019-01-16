// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { colors, theme } from '../style';
import { goTo, replaceAll } from './actions';
import { navigatorConfig, type ScreenName } from './Navigator';
import { openContactFormModal, openSimpleRegistrationModal } from '../modal/actions';
import FormattedMessage from '../components/FormattedMessage';
import MenuUser from './MenuUser';
import Price from '../components/Price';
import TouchableOpacity from '../components/TouchableOpacity';
import type { User, UserRole } from '../types';

type Props = {
  goTo: typeof goTo,
  onPress: Function,
  openContactFormModal: typeof openContactFormModal,
  openSimpleRegistrationModal: typeof openSimpleRegistrationModal,
  replaceAll: typeof replaceAll,
  user?: User,
  userRole: UserRole,
};

class MenuInternalLinks extends React.PureComponent<Props> {
  isAllowed = (name: ScreenName) =>
    !navigatorConfig[name].allowedRoles ||
    navigatorConfig[name].allowedRoles.includes(this.props.userRole);

  handlePressCredit = () => {
    const action =
      this.props.userRole === 'CREDIT'
        ? () => this.props.replaceAll('AddCredit')
        : () => this.props.openSimpleRegistrationModal();
    this.props.onPress(action);
  };

  handlePressContact = () => this.props.onPress(() => this.props.openContactFormModal());

  handlePressPayments = () => this.props.onPress(() => this.props.replaceAll('Payments'));

  handlePressReservation = () => this.props.onPress(() => this.props.goTo('SearchRoutes'));

  handlePressSettings = () => this.props.onPress(() => this.props.goTo('Settings'));

  handlePressTickets = () => this.props.onPress(() => this.props.replaceAll('Tickets'));

  render() {
    const { user, userRole } = this.props;
    const textStyle = [theme.paragraph, theme.semiBold, linkStyles.subLinkText];

    return (
      <View style={linkStyles.links}>
        {this.isAllowed('Tickets') && (
          <TouchableOpacity onPress={this.handlePressTickets} style={linkStyles.link}>
            <FormattedMessage id="header.title.tickets" style={textStyle} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={this.handlePressReservation} style={linkStyles.link}>
          <FormattedMessage id="header.user.link.reservation" style={textStyle} />
        </TouchableOpacity>
        {userRole !== 'ANONYMOUS' && (
          <TouchableOpacity onPress={this.handlePressCredit} style={linkStyles.link}>
            <Text style={[theme.paragraph, theme.semiBold]}>
              <FormattedMessage id="header.title.credit" style={linkStyles.subLinkText} />
              {user && (
                <Text>
                  {' '}
                  | <Price currency={user.currency} value={user.credit} />
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        )}
        {this.isAllowed('Payments') && (
          <TouchableOpacity onPress={this.handlePressPayments} style={linkStyles.link}>
            <FormattedMessage id="header.title.payments" style={textStyle} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={this.handlePressContact} style={linkStyles.link}>
          <FormattedMessage id="header.link.contactDirector" style={textStyle} />
        </TouchableOpacity>
        {this.isAllowed('Settings') && (
          <TouchableOpacity onPress={this.handlePressSettings} style={linkStyles.link}>
            <FormattedMessage id="header.title.settings" style={textStyle} />
          </TouchableOpacity>
        )}

        {/* $FlowFixMe */}
        <MenuUser onPress={this.props.onPress} />
      </View>
    );
  }
}

export const linkStyles = StyleSheet.create({
  link: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },

  links: {
    paddingVertical: 20,
  },

  subLinkText: {
    color: colors.red,
    textAlign: 'center',
  },
});

export default connect(({ user: { role, user } }) => ({ user, userRole: role }), {
  goTo,
  openContactFormModal,
  openSimpleRegistrationModal,
  replaceAll,
})(MenuInternalLinks);
