// @flow
import React, { Fragment } from 'react';
import { StyleSheet } from 'react-native';
import { injectIntl, type intlShape } from 'react-intl';

import * as validation from '../components/form/validation';
import FormattedMessage from '../components/FormattedMessage';
import Input from '../components/form/Input';
import ScrollableContext from '../components/ScrollableContext';
import { theme } from '../style';

type Props = {
  disabled?: boolean,
  formData: Object,
  intl: intlShape,
  onBlur: () => void,
  onChange: (value: Object) => void,
  validationResults: validation.ValidationResults<*>,
};

// because of react-intl... hopefully a fix is on the way https://github.com/flowtype/flow-typed/issues/1529
// eslint-disable-next-line react/prefer-stateless-function
class RegistrationCompany extends React.Component<Props> {
  render() {
    const { disabled, formData, intl, onBlur, onChange, validationResults } = this.props;

    return (
      <Fragment>
        <FormattedMessage
          id="registration.title.firmInformation"
          style={[theme.h2, styles.section]}
        />
        <ScrollableContext>
          <Input
            disabled={disabled}
            label={intl.formatMessage({ id: 'input.companyName' })}
            onBlur={onBlur}
            onChange={companyName => onChange({ companyName })}
            required
            style={styles.row}
            validation={validationResults['company.companyName']}
            value={formData.companyName}
          />
          <Input
            disabled={disabled}
            label={intl.formatMessage({ id: 'input.companyAddress' })}
            onBlur={onBlur}
            onChange={address => onChange({ address })}
            required
            style={styles.row}
            validation={validationResults['company.address']}
            value={formData.address}
          />
          <Input
            disabled={disabled}
            label={intl.formatMessage({ id: 'input.companyIN' })}
            onBlur={onBlur}
            onChange={registrationNumber => onChange({ registrationNumber })}
            required
            style={styles.row}
            validation={validationResults['company.registrationNumber']}
            value={formData.registrationNumber}
          />
          <Input
            disabled={disabled}
            label={intl.formatMessage({ id: 'input.companyTIN' })}
            onBlur={onBlur}
            onChange={vatNumber => onChange({ vatNumber })}
            style={styles.row}
            validation={validationResults['company.vatNumber']}
            value={formData.vatNumber}
          />
        </ScrollableContext>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  section: {
    marginTop: 10,
  },

  row: {
    marginBottom: 20,
  },
});

export default injectIntl(RegistrationCompany);
