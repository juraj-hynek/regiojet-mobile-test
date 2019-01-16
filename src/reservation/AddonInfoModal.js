// @flow
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { colors, theme } from '../style';
import Button from '../components/Button';
import ConditionsHTML from './ConditionsHTML';
import FormattedMessage from '../components/FormattedMessage';
import HTMLView from '../components/HTMLView';
import Price from '../components/Price';
import type { RouteAddon } from '../types';

type Props = {
  addon: RouteAddon,
  onDone: Function,
  showBackButton?: boolean,
};

class AddonInfoModal extends React.PureComponent<Props> {
  render() {
    const { addon, onDone, showBackButton } = this.props;

    return (
      <View style={[theme.containerModal, styles.container]}>
        <FormattedMessage
          id="additionalServices.modal.subitle"
          style={[theme.paragraph, theme.bold, styles.subtitle, styles.row]}
        />
        <HTMLView html={addon.description} style={styles.row} />
        <View style={styles.row}>
          {/* $FlowFixMe */}
          <ConditionsHTML conditions={addon.conditions.descriptions} />
        </View>
        <Text style={[theme.paragraph, styles.price]}>
          <FormattedMessage id="additionalServices.modal.price" textAfter=": " />
          {addon.price === 0 ? (
            <FormattedMessage id="additionalServices.free" style={theme.bold} />
          ) : (
            <Price style={theme.bold} value={addon.price} />
          )}
        </Text>

        {showBackButton && (
          <Button onPress={onDone} secondary style={styles.marginTop}>
            <FormattedMessage id="additionalServices.modal.button.back" />
          </Button>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: -10,
  },

  row: {
    marginBottom: 30,
  },

  marginTop: {
    marginTop: 10,
  },

  subtitle: {
    color: colors.grey,
  },

  price: {
    textAlign: 'center',
  },
});

export default AddonInfoModal;
