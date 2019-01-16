// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text } from 'react-native';
import get from 'lodash/get';
import React, { Fragment } from 'react';

import { colors, theme } from '../style';
import { scrollToElement } from '../components/scrollToElement';
import { ScrollViewContext } from '../components/ScrollViewContext';
import ChangePassword from './ChangePassword';
import CreditTicket from './CreditTicket';
import FormattedMessage from '../components/FormattedMessage';
import Heading from '../components/Heading';
import LanguageAndCurrency from './LanguageAndCurrency';
import LayoutScrollable from '../components/LayoutScrollable';
import PercentualDiscounts from './PercentualDiscounts';
import PersonalSettings from './PersonalSettings';
import SendingEmails from './SendingEmails';
import type { UserRole } from '../types';

type Props = {
  accountCode: ?string,
  role: UserRole,
};

let refScroll = null;

const SettingsScreen = ({ accountCode, role }: Props) => (
  <LayoutScrollable
    scrollViewRef={ref => {
      refScroll = ref;
    }}
  >
    <Heading messageId="header.title.settings">
      {accountCode && (
        <Text style={[styles.ticketNumber, theme.paragraphSmall, styles.white]}>
          <FormattedMessage id="settings.ticketNumber" textAfter=": " />
          <Text style={theme.semiBold}>{accountCode}</Text>
        </Text>
      )}
    </Heading>
    <LanguageAndCurrency />
    {role === 'CREDIT' && (
      <Fragment>
        <ScrollViewContext.Provider value={{ scrollToElement: scrollToElement(refScroll) }}>
          <PersonalSettings style={styles.border} />
          <ChangePassword style={styles.border} />
          {/* TODO uncomment when registration with mojeID is implemented
          <MojeID style={styles.border} /> */}
          <SendingEmails style={styles.border} />
          <CreditTicket style={styles.border} />
          <PercentualDiscounts style={styles.border} />
        </ScrollViewContext.Provider>
      </Fragment>
    )}
  </LayoutScrollable>
);

const styles = StyleSheet.create({
  border: {
    borderTopColor: colors.greyLayer,
    borderTopWidth: 10,
  },

  ticketNumber: {
    marginTop: 10,
    flexDirection: 'row',
  },

  white: {
    color: colors.white,
  },
});

export default connect(({ user: { role, user } }) => ({
  accountCode: get(user, 'accountCode'),
  role,
}))(SettingsScreen);
