// @flow
import { injectIntl, type intlShape } from 'react-intl';
import { StyleSheet } from 'react-native';
import React from 'react';
import RNModalSelector from 'react-native-modal-selector';

import { colors, fontFamilies, statusBarHeight, touchableActiveOpacity } from '../../style';

type Props = {
  children: Node,
  intl: intlShape,
};

class ModalSelector extends React.PureComponent<Props> {
  render() {
    return (
      <RNModalSelector
        cancelStyle={styles.cancel}
        cancelText={this.props.intl.formatMessage({ id: 'picker.cancel' })}
        cancelTextStyle={styles.cancelText}
        optionContainerStyle={styles.optionContainer}
        optionStyle={styles.option}
        optionTextStyle={styles.optionText}
        overlayStyle={styles.overlay}
        touchableActiveOpacity={touchableActiveOpacity}
        {...this.props}
      >
        {this.props.children}
      </RNModalSelector>
    );
  }
}

const styles = StyleSheet.create({
  cancel: {
    backgroundColor: colors.white,
    padding: 12,
  },

  cancelText: {
    fontFamily: fontFamilies.base,
  },

  option: {
    borderBottomColor: colors.greyShadow,
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },

  optionContainer: {
    backgroundColor: colors.white,
    padding: 0,
  },

  optionText: {
    color: colors.black,
    fontFamily: fontFamilies.base,
  },

  overlay: {
    padding: 10,
    paddingTop: 10 + statusBarHeight,
  },
});

export default injectIntl(ModalSelector);
