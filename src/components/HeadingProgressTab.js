// @flow
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../style';

type Props = {
  step: number,
  steps: number,
};

const HeadingProgressTab = ({ step, steps }: Props) => (
  <View style={styles.content}>
    {[...Array(steps)].map((val, index) => {
      const currentStep = index + 1;
      return (
        // eslint-disable-next-line react/no-array-index-key
        <View key={index} style={styles.progressBarWrapper}>
          <View style={[styles.point, step > index && styles.pointActive]} />
          {currentStep < steps && <View style={styles.line} />}
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },

  progressBarWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  line: {
    backgroundColor: colors.white,
    height: 3,
    width: 42,
  },

  point: {
    backgroundColor: colors.whiteShadow,
    borderColor: colors.white,
    borderRadius: 15,
    borderWidth: 3,
    height: 15,
    width: 15,
  },

  pointActive: {
    backgroundColor: colors.white,
  },
});
export default HeadingProgressTab;
