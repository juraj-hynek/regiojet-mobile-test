// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import Heading from '../components/Heading';
import LayoutScrollable from '../components/LayoutScrollable';
import Payments from '../payment-methods/Payments';
import Price from '../components/Price';
import { colors, theme } from '../style';
import { goTo } from '../navigation/actions';
import { scrollToElement } from '../components/scrollToElement';
import { ScrollViewContext } from '../components/ScrollViewContext';

type Props = {
  credit: number,
  goTo: typeof goTo,
};

class AddCreditScreen extends React.PureComponent<Props> {
  handlePress = () => this.props.goTo('Payments');
  refScroll = null;
  render() {
    const { credit } = this.props;

    return (
      <LayoutScrollable
        scrollViewRef={ref => {
          this.refScroll = ref;
        }}
      >
        <Heading messageId="header.title.credit">
          <View style={styles.currentCredit}>
            <FormattedMessage
              id="payments.userCredit"
              style={[theme.paragraphSmall, styles.white]}
              textAfter=": "
            />
            <Price style={[theme.paragraphSmall, theme.semiBold, styles.white]} value={credit} />
          </View>
        </Heading>
        <ScrollViewContext.Provider value={{ scrollToElement: scrollToElement(this.refScroll) }}>
          <Payments style={styles.payments} />
        </ScrollViewContext.Provider>
        <View style={theme.container}>
          <Button onPress={this.handlePress} secondary>
            <FormattedMessage id="tickets.button.paymentHistory.mobile" />
          </Button>
        </View>
      </LayoutScrollable>
    );
  }
}
const styles = StyleSheet.create({
  currentCredit: {
    marginTop: 10,
    flexDirection: 'row',
  },

  white: {
    color: colors.white,
  },

  payments: {
    marginBottom: 20,
    marginTop: 30,
  },
});

export default connect(({ user }) => ({ credit: user.user.credit }), { goTo })(AddCreditScreen);
