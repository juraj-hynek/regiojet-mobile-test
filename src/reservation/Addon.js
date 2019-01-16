// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import SvgUri from 'react-native-svg-uri';

import { colors, theme } from '../style';
import { openAddonInfoModal } from '../modal/actions';
import FormattedMessage from '../components/FormattedMessage';
import CheckBox from '../components/form/CheckBox';
import NumberPicker from '../components/form/NumberPicker';
import Price from '../components/Price';
import TextLink from '../components/TextLink';
import type { RouteAddon, Style } from '../types';

type Props = {
  addon: RouteAddon,
  disabled?: boolean,
  onAboutClose?: Function,
  onChange?: Function,
  openAddonInfoModal: typeof openAddonInfoModal,
  style?: Style,
};

class Addon extends React.PureComponent<Props> {
  handleCheck = () => {
    const { addon, onChange } = this.props;
    if (onChange) {
      onChange(addon.id, addon.count, !addon.checked);
    }
  };

  handleChange = (count: number) => {
    const { addon, onChange } = this.props;
    if (onChange) {
      onChange(addon.id, count, addon.checked);
    }
  };

  handleAboutPress = () => {
    const { addon, onAboutClose, openAddonInfoModal } = this.props;
    openAddonInfoModal(addon, onAboutClose, !!onAboutClose);
  };

  renderPrice() {
    const {
      addon: { count, price },
      onChange,
    } = this.props;

    return (
      <Text style={[theme.paragraph, theme.bold, styles.textRight]}>
        {!onChange && count > 1 && `${count}× `}
        {price === 0 ? <FormattedMessage id="additionalServices.free" /> : <Price value={price} />}
      </Text>
    );
  }

  renderIconAndName() {
    const { addon } = this.props;
    const isValidSVG = addon.iconUrl.substring(addon.iconUrl.length - 4) === '.svg';

    return [
      isValidSVG && (
        <View key="0" style={[styles.icon, styles.marginRight]}>
          <SvgUri fill={colors.yellow} height={24} source={{ uri: addon.iconUrl }} width={24} />
        </View>
      ),
      <Text key="1" style={[theme.paragraph, styles.flex]}>
        {addon.name}
      </Text>,
    ];
  }

  render() {
    const { addon, disabled, onChange, style } = this.props;
    const showNumberPicker = addon.checked && (!addon.maxCount || addon.maxCount > 1);

    return (
      <View style={[styles.container, style]}>
        <View style={styles.row}>
          {onChange ? (
            <CheckBox
              checked={addon.checked}
              disabled={disabled || addon.originalCount > 0}
              labelStyle={styles.checkBoxLabel}
              onPress={this.handleCheck}
              style={[styles.flexBig, styles.marginRight]}
            >
              {this.renderIconAndName()}
            </CheckBox>
          ) : (
            <View style={[styles.iconAndName, styles.flexBig, styles.marginRight]}>
              {this.renderIconAndName()}
            </View>
          )}
          <View style={styles.flex}>
            <TextLink onPress={this.handleAboutPress} style={[theme.paragraph, styles.textRight]}>
              <FormattedMessage id="additionalServices.aboutService" />
            </TextLink>
            {!showNumberPicker && this.renderPrice()}
          </View>
        </View>
        {showNumberPicker && (
          <View style={styles.row}>
            <NumberPicker
              disabled={disabled}
              min={addon.originalCount || 1}
              max={addon.maxCount}
              onChange={this.handleChange}
              style={styles.marginRight}
              value={addon.count}
            />
            {this.renderPrice()}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderColor: colors.greyShadow,
    borderWidth: 1,
    paddingHorizontal: 10,
  },

  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },

  flex: {
    flex: 1,
  },

  flexBig: {
    flex: 3,
  },

  checkBoxLabel: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  icon: {
    height: 24,
    width: 24,
  },

  marginRight: {
    marginRight: 10,
  },

  textRight: {
    textAlign: 'right',
  },

  iconAndName: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default connect(null, { openAddonInfoModal })(Addon);
