// @flow
import { StyleSheet, Text, View } from 'react-native';
import React, { type Node } from 'react';

import { theme } from '../style';
import Icon from '../components/Icon';
import RowEllipsis from '../components/RowEllipsis';
import type { Style } from '../types';

type Props = {
  ellipsis?: boolean,
  from: Node,
  spacing: number,
  style?: Style,
  textStyle?: Style,
  to: Node,
};

const Direction = ({ ellipsis, from, spacing, style, textStyle, to }: Props) => {
  const textStyles = [theme.paragraph, textStyle];
  const spacingStyle = { marginRight: spacing };
  const flattenedTextStyle: any = StyleSheet.flatten(textStyles);
  const Wrapper = ellipsis ? RowEllipsis : View;
  const wrapperStyle = ellipsis ? style : [styles.container, style];

  return (
    <Wrapper style={wrapperStyle}>
      <Text style={[spacingStyle, textStyles]}>{from}</Text>
      <Icon
        height={flattenedTextStyle.lineHeight}
        name="arrowRight"
        style={spacingStyle}
        width={10}
      />
      <Text style={textStyles}>{to}</Text>
    </Wrapper>
  );
};

Direction.defaultProps = {
  spacing: 5,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default Direction;
