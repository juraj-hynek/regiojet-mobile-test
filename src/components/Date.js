// @flow
import { Text } from 'react-native';
import moment from 'moment';
import React from 'react';

import { capitalizeFirst } from '../helpers/text';
import { dateFormat } from '../localization/localeData';
import type { Style } from '../types';

type Props = {
  capitalizeFirst?: boolean,
  children: Date | string | number,
  format: string,
  ignoreTimeZone?: boolean,
  style?: Style,
};

const Date = ({
  capitalizeFirst: shouldCapitalizeFirst,
  children,
  format,
  ignoreTimeZone,
  style,
}: Props) => {
  // $FlowFixMe property parseZone is missing in moment$Moment they say, but it works
  const parsedDate = ignoreTimeZone ? moment(children).parseZone() : moment(children);
  let formattedDate = parsedDate.format(format);
  if (shouldCapitalizeFirst) {
    formattedDate = capitalizeFirst(formattedDate);
  }

  return <Text style={style}>{formattedDate}</Text>;
};

Date.defaultProps = {
  format: dateFormat,
};

export default Date;
