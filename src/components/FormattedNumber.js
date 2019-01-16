// @flow

/**
 * This is a replacement of FormattedNumber from react-intl
 * It allows passing custom styling to the Text component
 */
import React from 'react';
import { Text } from 'react-native';
import { FormattedNumber as RIFormattedNumber } from 'react-intl';

import type { Style } from '../types';

type Props = {
  style?: Style,
  type?: 'decimal' | 'currency' | 'percent',
  value: any,
};

const FormattedNumber = ({ style, type, value, ...otherProps }: Props) => (
  <RIFormattedNumber minimumFractionDigits={0} style={type} value={value} {...otherProps}>
    {number => <Text style={style}>{number}</Text>}
  </RIFormattedNumber>
);

export default FormattedNumber;
