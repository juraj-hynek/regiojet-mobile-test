// @flow
import { Keyboard } from 'react-native';
import React from 'react';

import Input from './Input';
import ModalSelector from './ModalSelector';
import type { Style } from '../../types';

type Props = {
  disabled?: boolean,
  label: string,
  onChange: Function,
  optionLabelKey: string,
  options: Array<Object>,
  optionValueKey: string,
  style?: Style,
  value: string | number,
};

class Picker extends React.Component<Props> {
  static defaultProps = {
    optionLabelKey: 'label',
    optionValueKey: 'value',
  };

  handleChange = (option: Object) => this.props.onChange(option.originalOption);

  render() {
    const { disabled, label, optionLabelKey, options, optionValueKey, style, value } = this.props;

    const optionsWithKeys = options.map(option => ({
      key: option[optionValueKey],
      label: option[optionLabelKey],
      value: option[optionValueKey],
      originalOption: option,
    }));
    const selectedOption = optionsWithKeys.find(option => option.value === value);
    const inputValue = selectedOption ? `${selectedOption.label}` : '';

    return (
      <ModalSelector
        data={optionsWithKeys}
        disabled={disabled}
        onChange={this.handleChange}
        onModalOpen={Keyboard.dismiss}
        style={style}
      >
        <Input
          disabled={disabled}
          iconName="chevronDown"
          label={label}
          required
          value={inputValue}
        />
      </ModalSelector>
    );
  }
}

export default Picker;
