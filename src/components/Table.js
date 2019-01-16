// @flow
import { StyleSheet, Text, View } from 'react-native';
import React, { type Node } from 'react';

import { colors, theme } from '../style';
import Date from '../components/Date';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';
import TextLink from '../components/TextLink';
import type { Style } from '../types';

type Props = {
  children: Node,
  footer?: Node,
  headerMessageIds: Array<string>,
  style?: Style,
};

const Table = ({ children, footer, headerMessageIds, style }: Props) => {
  const labelStyles = [theme.paragraphSmall, theme.bold, styles.label];
  const valueStyles = [theme.paragraphSmall, styles.value];
  let index = 0;

  return (
    <View style={[styles.container, style]}>
      {React.Children.map(children, child => {
        if (!child) return null;

        const ChildElement = (
          <View style={styles.row}>
            <FormattedMessage id={headerMessageIds[index]} style={labelStyles} uppercase />
            {[Date, FormattedMessage, Price, Text, TextLink].includes(child.type)
              ? React.cloneElement(child, {
                  style: [valueStyles, child.props.style],
                })
              : child}
          </View>
        );
        index += 1;
        return ChildElement;
      })}
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: colors.greyShadow,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },

  footer: {
    marginVertical: 5,
  },

  label: {
    color: colors.grey,
    flex: 1,
    flexWrap: 'wrap',
    marginHorizontal: 5,
  },

  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: -5,
    marginVertical: 5,
  },

  value: {
    flex: 1,
    marginHorizontal: 5,
    textAlign: 'right',
  },
});

export default Table;
