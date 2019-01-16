// @flow
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../style';
import CheckBox from '../components/form/CheckBox';
import Input from '../components/form/Input';
import Radio from '../components/form/Radio';
import type { FormAnswer, FormQuestion } from '../types';

type Props = {
  answers: Array<FormAnswer>,
  disabled: boolean,
  onChange: Function,
  onChangeMultiCombo: Function,
  question: FormQuestion,
  sectionIndex: number,
};

const RatingQuestion = ({
  answers,
  disabled,
  onChange,
  onChangeMultiCombo,
  question,
  sectionIndex,
}: Props) => {
  switch (question.type) {
    case 'HEADER':
      return <Text style={theme.h3}>{question.text}</Text>;
    case 'MULTI_COMBO':
      return (
        <View style={styles.formGroup}>
          <Text style={[theme.paragraph, theme.semiBold, styles.formText]}>{question.text}</Text>
          {question.options &&
            question.options.map(option => (
              <CheckBox
                key={option.answerId}
                checked={answers.some(answer => answer.answerId === option.answerId)}
                disabled={disabled}
                onPress={checked =>
                  // $FlowFixMe
                  onChangeMultiCombo(sectionIndex, question.questionId, option, checked)
                }
                style={styles.formElement}
              >
                <Text>{option.text}</Text>
              </CheckBox>
            ))}
        </View>
      );
    case 'CHECKBOX':
    case 'RADIO_BUTTON':
      return (
        <View style={styles.formGroup}>
          <Text style={[theme.paragraph, theme.semiBold, styles.formText]}>{question.text}</Text>
          {question.options &&
            question.options.map(option => (
              <Radio
                key={option.answerId}
                disabled={disabled}
                // $FlowFixMe
                onPress={value => onChange(sectionIndex, question.questionId, [value])}
                selected={answers.length > 0 && answers[0].answerId === option.answerId}
                style={styles.formElement}
                value={option}
              >
                <Text>{option.text}</Text>
              </Radio>
            ))}
        </View>
      );
    case 'TEXT':
      return (
        <View style={styles.formGroup}>
          <Text style={[theme.paragraph, theme.semiBold, styles.formText]}>{question.text}</Text>
          <Input
            disabled={disabled}
            label={question.watermark || ''}
            numberOfLines={5}
            // $FlowFixMe
            onChange={text => onChange(sectionIndex, question.questionId, [{ text }])}
            style={styles.formElement}
            value={answers.length && answers[0].text}
          />
        </View>
      );
    default:
      throw new Error(`Unsupported question type ${question.type}`);
  }
};

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 15,
  },

  formText: {
    marginBottom: 20,
  },

  formElement: {
    marginBottom: 15,
  },
});

export default RatingQuestion;
