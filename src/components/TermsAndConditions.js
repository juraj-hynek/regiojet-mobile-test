// @flow
import { connect } from 'react-redux';
import { Linking } from 'react-native';
import React from 'react';

import FormattedMessage from '../components/FormattedMessage';
import TextLink from '../components/TextLink';
import type { Locale, Style } from '../types';

type LocaleLinks = { [locale: Locale]: string };

type Props = {|
  locale: Locale,
  style?: Style,
|};

class TermsAndConditions extends React.PureComponent<Props> {
  static COMPANY_LINKS: LocaleLinks = {
    cs: 'https://www.regiojet.cz/dokumenty/prepravni-rad/',
    sk: 'https://www.regiojet.sk/dokumenty/prepravny-poriadok/',
    en: 'https://www.regiojet.com/documents/transport-rules-and-conditions/',
    de: 'https://www.regiojet.de/dokumenten/beforderungsbedingungen/',
    at: 'https://www.regiojet.de/dokumenten/beforderungsbedingungen/',
  };

  static DATA_PROCESSING_LINKS: LocaleLinks = {
    cs: 'https://www.regiojet.cz/privacy-policy.html',
    sk: 'https://www.regiojet.sk/privacy-policy.html',
    en: 'https://www.regiojet.com/privacy-policy.html',
    de: 'https://www.regiojet.de/privacy-policy.html',
    at: 'https://www.regiojet.de/privacy-policy.html',
  };

  handleCompanyLinkPress = () =>
    Linking.openURL(TermsAndConditions.COMPANY_LINKS[this.props.locale]);

  handleDataProcessingLinkPress = () =>
    Linking.openURL(TermsAndConditions.DATA_PROCESSING_LINKS[this.props.locale]);

  render() {
    return (
      <FormattedMessage
        id="termsAndConditions.agreeWithTransportationConditions"
        style={this.props.style}
        values={{
          studentAgencyCompanyLink: (
            <TextLink onPress={this.handleCompanyLinkPress}>
              <FormattedMessage id="termsAndConditions.studentAgencyCompanyLink" />
            </TextLink>
          ),
          personalDataProcessingLink: (
            <TextLink onPress={this.handleDataProcessingLinkPress}>
              <FormattedMessage id="termsAndConditions.personalDataProcessingLink" />
            </TextLink>
          ),
        }}
      />
    );
  }
}

export default connect(({ localization: { locale } }) => ({ locale }))(TermsAndConditions);
