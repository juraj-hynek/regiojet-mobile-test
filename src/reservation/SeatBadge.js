// @flow
import React, { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, composeFontStyle, fontFamilies } from '../style';
import Icon, { type IconType } from '../components/Icon';
import type { Style } from '../types';

type Props = {
  additionalIcon?: IconType,
  seatNumbers: Array<number>,
  style?: Style,
  vehicleNumber?: number,
};

const SeatBadge = ({ additionalIcon, seatNumbers, style, vehicleNumber }: Props) => {
  const numberStyles = [composeFontStyle(12, fontFamilies.bold)];

  return (
    <View style={[styles.container, style]}>
      {vehicleNumber && (
        <Fragment>
          <Icon height={13} name="wagon" style={styles.marginRight} width={30} />
          <Text style={[...numberStyles, styles.vehicleNumber]}>{vehicleNumber}</Text>
        </Fragment>
      )}
      <Icon height={13} name="seat" style={styles.marginRight} width={11} />
      <Text style={numberStyles}>{seatNumbers.join(', ')}</Text>
      {additionalIcon && (
        <View style={styles.additionalIcon}>
          <Icon name={additionalIcon} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.yellow,
    borderRadius: 20,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  marginRight: {
    marginRight: 5,
  },

  vehicleNumber: {
    marginRight: 10,
  },

  additionalIcon: {
    backgroundColor: colors.white,
    borderBottomRightRadius: 20,
    borderColor: colors.yellow,
    borderTopRightRadius: 20,
    borderWidth: 1,
    marginLeft: 10,
    marginRight: -10,
    marginVertical: -8,
    padding: 10,
  },
});

export default SeatBadge;
