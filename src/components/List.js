// @flow
import { Platform, StyleSheet, Text, View } from 'react-native';
import React, { type Node } from 'react';

import { colors, theme } from '../style';
import Direction from './Direction';
import type { Style } from '../types';

type Props = {
  children: Node,
  style?: Style,
};

const List = ({ children, style }: Props) => (
  <View style={style}>
    <View style={styles.container}>
      {React.Children.map(
        children,
        child =>
          child && (
            <View style={styles.li}>
              <Text style={[theme.paragraph, styles.bullet]}>•</Text>
              {[Direction, View].indexOf(child.type) !== -1 ? (
                React.cloneElement(child, { style: [styles.content, child.props.style] })
              ) : (
                <Text style={[theme.paragraph, styles.content]}>{child}</Text>
              )}
            </View>
          ),
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: -5,
  },

  li: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginVertical: 5,
  },

  bullet: {
    color: colors.yellow,
    marginHorizontal: 10,
    ...Platform.select({
      ios: {
        transform: [
          {
            translateY: -2,
          },
        ],
      },
    }),
  },

  content: {
    flex: 1,
  },
});

export default List;
