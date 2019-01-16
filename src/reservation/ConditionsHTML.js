// @flow
import { injectIntl, type IntlShape } from 'react-intl';
import { StyleSheet } from 'react-native';
import React from 'react';

import HTMLView from '../components/HTMLView';
import type { PriceConditionsDescriptions, PriceConditionsDescriptionsType, Style } from '../types';

type Props = {
  baseFontStyle?: Style,
  conditions: PriceConditionsDescriptions,
  disabledTypes: Array<PriceConditionsDescriptionsType>,
  intl: IntlShape,
};

// TODO add 'rebook' when rebook is implemented
const ALLOWED_TYPES: Array<PriceConditionsDescriptionsType> = ['cancel', 'expiration'];

const composeConditionsHTML = (
  conditions: PriceConditionsDescriptions,
  disabledTypes: Array<PriceConditionsDescriptionsType>,
  intl: IntlShape,
) =>
  `<ul>
    ${Object.entries(conditions)
      .filter(([type]) => ALLOWED_TYPES.includes(type) && !disabledTypes.includes(type))
      .map(
        ([type, condition: string]) =>
          // $FlowFixMe
          `<li>${intl.formatMessage({ id: `connections.conditions.${type}` })}: ${condition}</li>`,
      )
      .join('')}
  </ul>`;

const ConditionsHTML = ({ baseFontStyle, conditions, disabledTypes, intl }: Props) => (
  <HTMLView
    baseFontStyle={baseFontStyle}
    html={composeConditionsHTML(conditions, disabledTypes, intl)}
    style={styles.conditions}
  />
);

ConditionsHTML.defaultProps = {
  disabledTypes: [],
};

const styles = StyleSheet.create({
  conditions: {
    marginBottom: -10,
  },
});

export default injectIntl(ConditionsHTML);
