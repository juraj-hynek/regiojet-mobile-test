// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import React, { Fragment } from 'react';

import {
  getPriceClassesBySeatClass,
  getUniquePriceClasses,
  getUniquePriceClassesCount,
} from '../helpers';
import { getSeatClass, getVehicleStandard } from '../../consts/helpers';
import { theme } from '../../style';
import ClassDetail from './ClassDetail';
import Direction from '../../components/Direction';
import FormattedMessage from '../../components/FormattedMessage';
import type { PriceClass, SeatClass, Section, VehicleStandard, VehicleType } from '../../types';

type Props = {|
  isAddingToBasket: boolean,
  onSelect: Function,
  priceClasses: Array<PriceClass>,
  seatClasses: Array<SeatClass>,
  sections: Array<Section>,
  vehicleStandards: Array<VehicleStandard>,
|};

class RouteSections extends React.Component<Props> {
  sectionsContainTrain(): boolean {
    const { priceClasses, sections } = this.props;
    const containsTrain = sections.some(({ vehicleType }) => vehicleType === 'TRAIN');
    // Train with just one priceClass doesn’t act as a train ¯\_(ツ)_/¯
    const multiplePriceClasses = getUniquePriceClassesCount(priceClasses) > 1;
    return containsTrain && multiplePriceClasses;
  }

  composeSectionClass(
    vehicleType: VehicleType,
    section: Section,
    priceClass?: PriceClass,
    isLast?: boolean,
  ): Object {
    const { priceClasses, seatClasses, vehicleStandards } = this.props;
    const commonProps = {
      ...getVehicleStandard(vehicleStandards, section.vehicleStandardKey),
      freeSeatsCount: section.freeSeatsCount,
      support: section.support,
      vehicleType,
    };

    if (vehicleType === 'BUS') {
      return {
        ...priceClass,
        ...commonProps,
      };
    }
    if (vehicleType === 'TRAIN' && priceClass) {
      return priceClass.seatClassKey !== 'NO'
        ? {
            ...priceClass,
            ...getSeatClass(seatClasses, priceClass.seatClassKey),
            vehicleType,
          }
        : {
            ...(isLast ? priceClasses[0] : {}),
            ...commonProps,
          };
    }

    throw new Error('Invalid VehicleType or missing priceClass for VehicleType of TRAIN');
  }

  render() {
    const { isAddingToBasket, onSelect, priceClasses, sections } = this.props;
    return (
      <View style={styles.container}>
        {sections.map((section, index) => {
          const isLast = index === sections.length - 1;

          return (
            <Fragment key={section.id}>
              <View style={styles.header}>
                <FormattedMessage
                  id="connections.section.header"
                  style={[theme.paragraphSmall, styles.title]}
                />
                <Direction
                  from={section.departureCityName}
                  textStyle={theme.semiBold}
                  to={section.arrivalCityName}
                />
              </View>

              {section.vehicleType === 'BUS' &&
                (isLast && !this.sectionsContainTrain() ? (
                  priceClasses.map(priceClass => (
                    // $FlowFixMe
                    <ClassDetail
                      isAddingToBasket={isAddingToBasket}
                      key={priceClass.priceSource}
                      onSelect={() => onSelect(priceClass)}
                      sectionClass={this.composeSectionClass('BUS', section, priceClass, isLast)}
                    />
                  ))
                ) : (
                  // $FlowFixMe
                  <ClassDetail
                    isAddingToBasket={isAddingToBasket}
                    onSelect={() => onSelect(priceClasses[0])}
                    sectionClass={this.composeSectionClass('BUS', section)}
                  />
                ))}

              {section.vehicleType === 'TRAIN' &&
                getUniquePriceClasses(priceClasses).map(uniquePriceClass =>
                  getPriceClassesBySeatClass(priceClasses, uniquePriceClass.seatClassKey).map(
                    priceClass => (
                      // $FlowFixMe
                      <ClassDetail
                        isAddingToBasket={isAddingToBasket}
                        key={`${priceClass.seatClassKey}${priceClass.priceSource}`}
                        onSelect={() => onSelect(priceClass)}
                        sectionClass={this.composeSectionClass(
                          'TRAIN',
                          section,
                          priceClass,
                          isLast,
                        )}
                      />
                    ),
                  ),
                )}
            </Fragment>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },

  header: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },

  title: {
    marginRight: 6,
  },
});

type MappedProps = {
  seatClasses: Array<SeatClass>,
  vehicleStandards: Array<VehicleStandard>,
};

export default connect(
  ({ consts: { seatClasses, vehicleStandards } }): MappedProps => ({
    seatClasses,
    vehicleStandards,
  }),
  {},
)(RouteSections);
