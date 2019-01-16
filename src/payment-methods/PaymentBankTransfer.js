// @flow
import { connect } from 'react-redux';
import { injectIntl, type intlShape } from 'react-intl';
import React from 'react';

import { theme } from '../style/index';
import HTMLView from '../components/HTMLView';

type Props = {
  accountCode: string,
  intl: intlShape,
};

// TODO because of react-intl... https://github.com/flowtype/flow-typed/issues/1529
// eslint-disable-next-line react/prefer-stateless-function
class PaymentBankTransfer extends React.Component<Props> {
  render() {
    const { accountCode, intl } = this.props;

    return (
      <HTMLView
        html={intl.formatMessage({ id: 'payments.bankTransfer.text' }, { accountCode })}
        style={theme.container}
      />
    );
  }
}

export default injectIntl(
  connect(({ user: { user } }) => ({ accountCode: user.accountCode }))(PaymentBankTransfer),
);
