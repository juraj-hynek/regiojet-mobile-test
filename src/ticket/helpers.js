// @flow
import last from 'lodash/last';
import moment from 'moment';
import omit from 'lodash/omit';
import toPairs from 'lodash/toPairs';

import { getListStationById } from '../search-routes';
import type {
  CityMap,
  FormQuestion,
  RatingAnsweredFormField,
  RatingFormData,
  RatingFormAnswers,
  RatingFormSection,
  SectionPutRatingRequest,
  StationMap,
  Ticket,
} from '../types';
import type { SearchRoutesFormData } from '../search-routes/SearchRoutesScreen';

/**
 * Prepare default answers
 * For now, it only prepares empty Arrays for all questions
 */
const prepareDefaultAnswers = (fields: Array<FormQuestion>) =>
  fields.reduce((answers, field) => {
    const { options, questionId, type } = field;
    if (!questionId) {
      return answers;
    }

    if (['CHECKBOX', 'RADIO_BUTTON'].includes(type) && options) {
      return { ...answers, [questionId]: [options[0]] };
    }

    return { ...answers, [questionId]: [] };
  }, {});

/**
 * Group answers so we can work with them easily
 * [
 *   { questionId: 1, answerId: 11, text: 'text 1'},
 *   { questionId: 1, answerId: 12, text: 'text 2'}
 * ]
 * =>
 * { 1: [{ answerId: 11, text: 'text 1' }, { answerId: 12, text: 'text 2'}] }
 */
const groupSectionAnswers = (ratingForm: RatingFormData): RatingFormAnswers => {
  const defaultAnswers = prepareDefaultAnswers(ratingForm.fields);

  const serverAnswers = ratingForm.answers.fields.reduce((answers, field) => {
    const answer = answers[field.questionId] || [];
    return {
      ...answers,
      [field.questionId]: [...answer, omit(field, 'questionId')],
    };
  }, {});

  return { ...defaultAnswers, ...serverAnswers };
};

export const groupServerAnswers = (sections: Array<RatingFormData>): Array<RatingFormSection> =>
  sections.map(section => ({
    sectionId: section.sectionId,
    answers: groupSectionAnswers(section),
  }));

/**
 * Convert back to format accepted by server
 */
const ungroupSectionAnswers = (answers: RatingFormAnswers): Array<RatingAnsweredFormField> =>
  toPairs(answers).reduce((ungroupedAnswers, [questionId, questionAnswers]) => {
    const answersWithQuestionId = questionAnswers.map(questionAnswer => ({
      ...questionAnswer,
      questionId,
    }));
    return [...ungroupedAnswers, ...answersWithQuestionId];
  }, []);

export const ungroupAnswers = (
  sectionAnswers: Array<RatingFormSection>,
): Array<SectionPutRatingRequest> =>
  sectionAnswers.map(section => ({
    sectionId: section.sectionId,
    form: {
      fields: ungroupSectionAnswers(section.answers),
    },
  }));

export const composeSearchRoutesParamsFromTicket = (
  cities: CityMap,
  stations: StationMap,
  ticket: Ticket,
): SearchRoutesFormData => {
  const firstSection = ticket.outboundRouteSections[0].section;
  const lastSection = last(ticket.outboundRouteSections).section;

  return {
    outboundDate: moment(),
    stationFrom: getListStationById(cities, stations, firstSection.departureStationId),
    stationTo: getListStationById(cities, stations, lastSection.arrivalStationId),
    tariffs: ticket.passengersInfo.passengers.map(passenger => passenger.tariff),
  };
};

export const getCancelModalType = (ticket: Ticket): 'cancel' | 'storno' =>
  ticket.customerActions.storno ? 'storno' : 'cancel';
