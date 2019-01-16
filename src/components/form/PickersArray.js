// @flow
import React from 'react';
import { View } from 'react-native';

import Picker from './Picker';
import type { Style } from '../../types';

type Props = {
  label: string,
  optionLabelKey: string,
  options: Array<Object>,
  optionValueKey: string,
  onChange: Function,
  style?: Style,
  values: Array<string>,
};

const PickersArray = ({
  label,
  optionLabelKey,
  options,
  optionValueKey,
  onChange,
  style,
  values,
}: Props) => (
  <View style={[styles.container, style]}>
    {values.map((value, index) => (
      <View
        key={index} // eslint-disable-line react/no-array-index-key
        style={styles.pickerContainer}
      >
        <Picker
          label={label}
          onChange={selectedOption => onChange(selectedOption, index)}
          optionLabelKey={optionLabelKey}
          options={options}
          optionValueKey={optionValueKey}
          style={styles.picker}
          value={value}
        />
      </View>
    ))}
  </View>
);

PickersArray.defaultProps = {
  optionLabelKey: 'label',
  optionValueKey: 'value',
};

const styles = {
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },

  pickerContainer: {
    width: '50%',
    paddingHorizontal: 5,
  },

  picker: {
    marginTop: 10,
  },
};

export default PickersArray;
