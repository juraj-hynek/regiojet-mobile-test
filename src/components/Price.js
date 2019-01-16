// @flow
import { connect } from 'react-redux';
import React from 'react';

import FormattedNumber from './FormattedNumber';
import type { Currency, Style } from '../types';

type Props = {
  currency?: Currency,
  style?: Style,
  userCurrency: Currency,
  value: any,
};

const Price = ({ currency, style, userCurrency, value }: Props) => (
  <FormattedNumber
    currency={currency || userCurrency}
    style={style}
    type="currency"
    value={value}
  />
);

export default connect(({ localization: { currency } }) => ({ userCurrency: currency }), {})(Price);
