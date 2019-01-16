// @flow
import React from 'react';
import { View } from 'react-native';

import { isFormValid } from '../components/form/helpers';
import { theme } from '../style';
import * as validation from '../components/form/validation';
import FormattedMessage from '../components/FormattedMessage';
import CheckBox from '../components/form/CheckBox';
import type { Style } from '../types';

type Props = {
  style?: Style,
};

type State = {
  formData: {
    mojeid: boolean,
  },
  validationResults: validation.ValidationResults<*>,
};

class MojeID extends React.Component<Props, State> {
  state = {
    formData: {
      mojeid: false,
    },
    validationResults: {},
  };

  // eslint-disable-next-line react/sort-comp
  submitted: boolean = false;

  validate = () =>
    // const { formData } = this.state;
    // const validationResults = {};
    // return cleanValidationObject(validationResults);
    ({});

  handleChange = (value: Object) => {
    this.setState(prevState => {
      const formData = {
        ...prevState.formData,
        ...value,
      };
      return { formData };
    });
  };

  handleBlur = () => {
    // const validationResults = this.validate();
    // this.setState({ validationResults });
  };

  handleSubmit = () => {
    this.submitted = true;

    const validationResults = this.validate();
    this.setState({ validationResults });

    if (!isFormValid(validationResults)) {
      return false;
    }

    // TODO call API
    return true;
  };

  render() {
    const { style } = this.props;
    const { formData } = this.state;

    return (
      <View style={[theme.container, style]}>
        <FormattedMessage id="settings.mojeid.title" style={theme.h2} />
        <CheckBox checked={formData.mojeid} onPress={mojeid => this.handleChange({ mojeid })}>
          <FormattedMessage id="settings.mojeid.checkbox" />
        </CheckBox>
      </View>
    );
  }
}

export default MojeID;
