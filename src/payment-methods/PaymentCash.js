// @flow
import React from 'react';
import { injectIntl, type intlShape } from 'react-intl';

import { theme } from '../style/index';
import HTMLView from '../components/HTMLView';

type Props = {
  intl: intlShape,
};

// TODO because of react-intl... https://github.com/flowtype/flow-typed/issues/1529
// eslint-disable-next-line react/prefer-stateless-function
class PaymentCash extends React.Component<Props> {
  render() {
    return (
      <HTMLView
        html={this.props.intl.formatMessage({ id: 'payments.cash.text' })}
        style={theme.container}
      />
    );
  }
}

export default injectIntl(PaymentCash);
