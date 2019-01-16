// @flow
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { goTo } from '../../navigation/actions';
import { theme } from '../../style';
import Button from '../../components/Button';
import ButtonLink from '../../components/ButtonLink';
import FormattedMessage from '../../components/FormattedMessage';

type Props = {|
  goTo: typeof goTo,
  hasMore: boolean,
  isFetching: boolean,
  onMorePress: Function,
|};

const TicketListFooter = ({ goTo, hasMore, isFetching, onMorePress }: Props) => (
  <View style={[theme.container, styles.footer]}>
    {hasMore && (
      <ButtonLink
        iconLeft="chevronDown"
        loading={isFetching}
        onPress={onMorePress}
        style={styles.marginBottom}
      >
        <FormattedMessage id="tickets.button.next" />
      </ButtonLink>
    )}

    <Button iconLeft="invoice" onPress={() => goTo('Payments')} secondary size="small">
      <FormattedMessage id="tickets.button.paymentHistory.mobile" />
    </Button>
  </View>
);

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: 30,
  },

  footer: {
    paddingTop: 0,
  },
});

export default connect(null, { goTo })(TicketListFooter);
