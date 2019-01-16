// @flow
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { colors, fontFamilies } from '../../style';
import * as validation from './validation';
import FormattedMessage from '../FormattedMessage';

type Props = {
  error: ?validation.ValidationResult,
};

const getValidationResultMessage = (error: Object) => {
  const messages: Object = {
    alreadyExists: {
      defaultMessage: 'Already exists.',
      id: 'validation.alreadyExists',
    },
    differentPassword: {
      defaultMessage: 'Passwords must be same.',
      id: 'validation.differentPassword',
    },
    email: {
      defaultMessage: 'Email address is not valid.',
      id: 'validation.email',
    },
    number: {
      defaultMessage: 'Number is not valid.',
      id: 'validation.number',
    },
    maxLength: {
      defaultMessage: '{maxLength} characters maximum.',
      id: 'validation.maxLength',
      values: { maxLength: error.maxLength },
    },
    minLength: {
      defaultMessage: '{minLength} characters minimum.',
      id: 'validation.minLength',
      values: { minLength: error.minLength },
    },
    minNumber: {
      defaultMessage: 'Number must be larger than {minNumber}.',
      id: 'validation.minNumber',
      values: { minNumber: error.minNumber },
    },
    required: {
      defaultMessage: 'Please fill out this field.',
      id: 'validation.required',
    },
    requiredAgree: {
      defaultMessage: 'Please think about it.',
      id: 'validation.requiredAgree',
    },
    wrongPassword: {
      defaultMessage: 'The password you have entered is invalid.',
      id: 'validation.wrongPassword',
    },
  };

  return messages[error.type];
};

const ValidationError = ({ error }: Props) => {
  if (!error) {
    return null;
  }

  if (error.type === 'serverError') {
    return <Text style={styles.message}>{error.message}</Text>;
  }

  const messageData = getValidationResultMessage(error);
  return messageData ? <FormattedMessage style={styles.message} {...messageData} /> : null;
};

const styles = StyleSheet.create({
  message: {
    color: colors.red,
    marginLeft: 10,
    fontFamily: fontFamilies.base,
    marginTop: 5,
  },
});

export default ValidationError;
