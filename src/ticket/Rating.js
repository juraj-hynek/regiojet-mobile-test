// @flow
import React, { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import last from 'lodash/last';
import set from 'lodash/fp/set';

import { colors, theme } from '../style';
import { dateFormat, timeFormat } from '../localization/localeData';
import { getTicket, getTicketRatingForm, sendTicketRatingForm } from './actions';
import { groupServerAnswers, ungroupAnswers } from './helpers';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Date from '../components/Date';
import Direction from '../components/Direction';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';
import LoaderSmall from '../components/LoaderSmall';
import RatingQuestion from './RatingQuestion';
import type { FormAnswer, RatingFormSection, Ticket, TicketSection } from '../types';
import type { RatingFormState, RatingFormSendState, TicketItemState } from './reducer';

type Props = {
  getTicket: typeof getTicket,
  getTicketRatingForm: typeof getTicketRatingForm,
  ratingForm: RatingFormState,
  ratingFormSend: RatingFormSendState,
  sendTicketRatingForm: typeof sendTicketRatingForm,
  ticket: TicketItemState,
  ticketId: number,
};

type State = {
  sections: Array<RatingFormSection>,
};

class Rating extends React.Component<Props, State> {
  static getTicketSection(ticket: Ticket, sectionId: number): ?TicketSection {
    return ticket.outboundRouteSections.find(routeSection => routeSection.section.id === sectionId);
  }

  state = {
    sections: this.props.ratingForm.data ? groupServerAnswers(this.props.ratingForm.data) : [],
  };

  componentDidMount() {
    this.props.getTicket(this.props.ticketId);
    this.props.getTicketRatingForm(this.props.ticketId);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ratingForm.data && nextProps.ratingForm.data !== this.props.ratingForm.data) {
      const sections = groupServerAnswers(nextProps.ratingForm.data);
      this.setState({ sections });
    }
  }

  handleChange = (sectionIndex: number, questionId: number, values: Array<FormAnswer>) => {
    this.setState(prevState => {
      const { sections } = set(
        `sections[${sectionIndex}].answers.${questionId}`,
        values,
        prevState,
      );
      return { sections };
    });
  };

  handleChangeMultiCombo = (
    sectionIndex: number,
    questionId: number,
    selectedAnswer: FormAnswer,
    checked: boolean,
  ) => {
    const answersWithoutSelected = this.state.sections[sectionIndex].answers[questionId].filter(
      answer => answer.answerId !== selectedAnswer.answerId,
    );

    const answers = checked ? [...answersWithoutSelected, selectedAnswer] : answersWithoutSelected;
    this.handleChange(sectionIndex, questionId, answers);
  };

  handleSubmit = () => {
    this.props.sendTicketRatingForm(this.props.ticketId, ungroupAnswers(this.state.sections));
  };

  render() {
    const { ratingForm, ratingFormSend, ticket } = this.props;

    if (ratingForm.error || ticket.error) {
      return <View style={theme.container}>{/* TODO retry button */}</View>;
    }

    if (ratingForm.isFetching || ticket.isFetching) {
      return (
        <View style={theme.container}>
          <LoaderSmall />
        </View>
      );
    }

    if (!ratingForm.data || !ticket.data) {
      return null;
    }

    const ticketData = ticket.data;
    const firstSection = ticketData.outboundRouteSections[0].section;
    const lastSection = last(ticketData.outboundRouteSections).section;
    const hasMoreSections = ticketData.outboundRouteSections.length > 1;

    return (
      <Fragment>
        <Badge style={[styles.row, styles.badge]}>
          <FormattedMessage id="review.header.timeBadge" />
        </Badge>
        <View style={styles.header}>
          <Text style={[theme.paragraph, theme.semiBold, styles.row]}>
            {firstSection.departureCityName}
          </Text>
          <Icon name="arrowUpBold" height={9} style={styles.icon} />
          <Text style={[theme.paragraph, theme.semiBold, styles.row]}>
            {lastSection.arrivalCityName}
          </Text>
          <Date
            format={`${dateFormat} ${timeFormat}`}
            ignoreTimeZone
            style={[theme.paragraphSmall, styles.row]}
          >
            {firstSection.departureTime}
          </Date>
        </View>

        {ratingForm.data && (
          <View style={theme.container}>
            <View style={styles.sections}>
              {ratingForm.data.map((section, sectionIndex) => {
                const ticketSection =
                  hasMoreSections && Rating.getTicketSection(ticketData, section.sectionId);

                return (
                  <View key={section.sectionId} style={styles.section}>
                    {ticketSection && (
                      <Direction
                        from={ticketSection.section.departureCityName}
                        style={styles.sectionHeading}
                        textStyle={[theme.h2, styles.sectionHeadingText]}
                        to={ticketSection.section.arrivalCityName}
                      />
                    )}

                    {section.fields.map(field => {
                      const answers =
                        typeof field.questionId !== 'undefined'
                          ? this.state.sections[sectionIndex].answers[field.questionId]
                          : [];

                      return (
                        <RatingQuestion
                          key={field.questionId || field.text}
                          answers={answers}
                          disabled={ratingFormSend.isFetching}
                          onChange={this.handleChange}
                          onChangeMultiCombo={this.handleChangeMultiCombo}
                          question={field}
                          sectionIndex={sectionIndex}
                        />
                      );
                    })}
                  </View>
                );
              })}
            </View>

            <Button
              loading={ratingFormSend.isFetching}
              onPress={this.handleSubmit}
              style={styles.button}
            >
              <FormattedMessage id="review.button.submit" />
            </Button>
          </View>
        )}
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: -15,
    zIndex: 1,
  },

  button: {
    marginBottom: 20,
    marginTop: 15,
  },

  header: {
    alignItems: 'center',
    backgroundColor: colors.greyWhite,
    paddingBottom: 10,
    paddingHorizontal: 10,
    paddingTop: 20,
  },

  icon: {
    transform: [{ rotate: '180deg' }],
  },

  row: {
    marginVertical: 5,
  },

  section: {
    marginVertical: 7.5,
  },

  sectionHeading: {
    marginBottom: 20,
  },

  sectionHeadingText: {
    marginBottom: 0,
  },

  sections: {
    marginVertical: -7.5,
  },
});

export default connect(
  ({ ticket: { ratingForm, ratingFormSend, ticket } }) => ({
    ratingForm,
    ratingFormSend,
    ticket,
  }),
  {
    getTicket,
    getTicketRatingForm,
    sendTicketRatingForm,
  },
)(Rating);
