// @flow
import { connect } from 'react-redux';
import { injectIntl, type IntlShape } from 'react-intl';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import SvgUri from 'react-native-svg-uri';

import { colors, theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import CheckBox from '../components/form/CheckBox';
import List from '../components/List';
import Picker from '../components/form/Picker';
import Price from '../components/Price';
import TextLink from '../components/TextLink';
import type { Style } from '../types';

type Props = {
  disabled?: boolean,
  // TODO we don't know how API response will look like
  insurance: Object,
  intl: IntlShape,
  onChange?: Function,
};

class Insurance extends React.PureComponent<Props> {
  handleCheck = () => {
    // TODO
  };

  handleAboutPress = () => {
    // TODO
  };

  handleTermsPress = () => {
    // TODO
  };

  renderPrice(style: Style) {
    const {
      insurance: { price, types },
    } = this.props;

    if (types.length > 1) {
      return (
        <Text style={style}>
          <FormattedMessage id="insurance.priceFrom" /> <Price value={price} />
        </Text>
      );
    }

    return <Price style={style} value={price} />;
  }

  renderIconAndName() {
    const { insurance } = this.props;
    const isValidSVG = insurance.iconUrl.substring(insurance.iconUrl.length - 4) === '.svg';

    return [
      isValidSVG && (
        <SvgUri
          fill={colors.yellow}
          height={24}
          key="0"
          source={{ uri: insurance.iconUrl }}
          style={StyleSheet.flatten([{ height: 24, width: 24 }, styles.marginRight])}
          width={24}
        />
      ),
      <Text key="1" style={[theme.paragraph, styles.flex]}>
        {insurance.name}
      </Text>,
    ];
  }

  render() {
    const { disabled, insurance, intl, onChange } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {onChange ? (
            <CheckBox
              checked={insurance.checked}
              disabled={disabled}
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
              <FormattedMessage id="insurance.aboutInsurance" />
            </TextLink>
            {this.renderPrice([theme.paragraph, theme.bold, styles.textRight])}
          </View>
        </View>
        {insurance.checked &&
          insurance.types.length > 1 && (
            <View style={styles.detail}>
              <Picker
                disabled={disabled}
                label={intl.formatMessage({ id: 'insurance.type' })}
                onChange={() => {
                  /* TODO */
                }}
                options={insurance.types}
                style={styles.row}
                value={insurance.types[0].value}
              />
              {this.renderPrice([theme.paragraph, theme.bold, styles.rowSmall])}
              <Text style={[theme.paragraph, styles.rowSmall]}>Pojištění pokrývá:</Text>
              <List style={styles.rowSmall}>
                {'léčební výlohy'}
                {'úraz'}
                {'hmotnou odpovědnost'}
                {'zavazadla'}
                {'doplňkové asistenční služby'}
              </List>
              <CheckBox checked={false} onPress={this.handleTermsPress} style={styles.terms}>
                <FormattedMessage
                  id="insurance.agreeWithTerms"
                  values={{
                    link: (
                      <TextLink
                        onPress={() => {
                          /* TODO */
                        }}
                      >
                        <FormattedMessage id="insurance.agreeWithTerms.link" />
                      </TextLink>
                    ),
                  }}
                />
              </CheckBox>
            </View>
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  checkBoxLabel: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  container: {
    borderColor: colors.greyShadow,
    borderWidth: 1,
    marginVertical: 5,
  },

  detail: {
    borderTopColor: colors.greyShadow,
    borderTopWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },

  flex: {
    flex: 1,
  },

  flexBig: {
    flex: 3,
  },

  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },

  iconAndName: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  marginRight: {
    marginRight: 10,
  },

  row: {
    marginBottom: 20,
  },

  rowSmall: {
    marginBottom: 10,
  },

  terms: {
    marginTop: 10,
  },

  textRight: {
    textAlign: 'right',
  },
});

export default injectIntl(connect(null, {})(Insurance));
