// @flow
import { Col, Row } from 'native-base';
import { connect } from 'react-redux';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import get from 'lodash/get';
import React from 'react';

import { colors, composeFontStyle, fontFamilies, getShadow, theme } from '../../style';
import { getServiceIconNameByType } from '../../vehicles/helpers';
import { openWebViewModal } from '../../modal/actions';
import Button from '../../components/Button';
import ConditionsHTML from '../../reservation/ConditionsHTML';
import FormattedMessage from '../../components/FormattedMessage';
import FreeSeatsCount from '../FreeSeatsCount';
import HTMLView from '../../components/HTMLView';
import Icon from '../../components/Icon';
import Price from '../../components/Price';
import TextLink from '../../components/TextLink';
import type { UserRole } from '../../types';

type Props = {|
  isAddingToBasket: boolean,
  onSelect: Function,
  openWebViewModal: typeof openWebViewModal,
  sectionClass: Object,
  userRole: UserRole,
|};

class ClassDetail extends React.Component<Props> {
  getPrice(): ?number {
    const { sectionClass, userRole } = this.props;
    return get(sectionClass, userRole === 'CREDIT' ? 'creditPrice' : 'price');
  }

  isSoldOut = (): boolean => this.props.sectionClass.bookable === false;

  handleImagePress = (webViewUrl: string) => {
    this.props.openWebViewModal(webViewUrl, 'connections.galleryModal.header');
  };

  renderButton() {
    const { isAddingToBasket, onSelect } = this.props;
    const price = this.getPrice();
    const isSoldOut = this.isSoldOut();

    if (!price && !isSoldOut) return null;

    return (
      <View style={[styles.button, isSoldOut && styles.disabled]}>
        <Button
          disabled={isSoldOut}
          loading={isAddingToBasket}
          onPress={onSelect}
          size="small"
          textCentered
        >
          {isSoldOut ? <FormattedMessage id="connections.soldOut" /> : <Price value={price} />}
        </Button>
      </View>
    );
  }

  renderTitle() {
    const { actionPrice, title, name, vehicleType } = this.props.sectionClass;
    const classTitle = title || name;
    const actionName = get(actionPrice, 'name');
    const actionUrl = get(actionPrice, 'url');

    return (
      <Text style={[theme.paragraph, styles.title]}>
        {(vehicleType !== 'BUS' || (vehicleType === 'BUS' && !actionName)) && `${classTitle} `}
        {actionName && actionUrl ? (
          <TextLink onPress={() => Linking.openURL(actionUrl)}>{actionName}</TextLink>
        ) : (
          actionName
        )}
      </Text>
    );
  }

  render() {
    const { sectionClass } = this.props;
    const imageUrl = sectionClass.support ? sectionClass.supportImageUrl : sectionClass.imageUrl;
    const isSoldOut = this.isSoldOut();
    const showActionIcon = get(sectionClass, 'actionPrice.showIcon');
    const actionDescription = get(sectionClass, 'actionPrice.description');

    return (
      <View style={[styles.container, isSoldOut && styles.disabled]}>
        <Row style={[styles.header, styles.marginBottom]}>
          {imageUrl && (
            <TouchableOpacity
              disabled={!sectionClass.galleryUrl}
              onPress={() => this.handleImagePress(sectionClass.galleryUrl)}
            >
              <Image source={{ uri: imageUrl }} style={styles.image} />
            </TouchableOpacity>
          )}
          <Col>
            <FreeSeatsCount count={sectionClass.freeSeatsCount} isSoldOut={isSoldOut} />
            <View style={[styles.titleContainer, styles.marginBottom]}>
              {this.renderTitle()}
              {showActionIcon && (
                <Icon
                  color={colors.yellow}
                  height={14}
                  name="sale"
                  style={styles.actionIcon}
                  width={14}
                />
              )}
            </View>
            <Row style={styles.services}>
              {sectionClass.services &&
                sectionClass.services.map(service => (
                  <Icon
                    height={14}
                    key={service}
                    name={getServiceIconNameByType(service)}
                    style={styles.serviceIcon}
                  />
                ))}
            </Row>
          </Col>
        </Row>
        <HTMLView html={sectionClass.description} />
        {actionDescription && (
          <Text style={[theme.paragraphSmall, styles.actionDescription]}>{actionDescription}</Text>
        )}
        {this.renderButton()}
        {sectionClass.conditions && (
          // $FlowFixMe
          <ConditionsHTML
            baseFontStyle={composeFontStyle(12)}
            conditions={sectionClass.conditions.descriptions}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  actionDescription: {
    backgroundColor: colors.greyWhite,
    borderRadius: 5,
    marginTop: 10,
    overflow: 'hidden',
    padding: 10,
  },

  actionIcon: {
    marginLeft: 5,
    marginTop: 7,
  },

  button: {
    marginVertical: 20,
  },

  container: {
    backgroundColor: colors.white,
    borderRadius: 2,
    marginVertical: 10,
    padding: 10,
    ...getShadow({ elevation: 1 }),
  },

  disabled: {
    opacity: 0.5,
  },

  header: {
    alignItems: 'center',
  },

  image: {
    borderRadius: 5,
    height: 100,
    marginRight: 10,
    width: 100,
  },

  marginBottom: {
    marginBottom: 10,
  },

  services: {
    flexWrap: 'wrap',
    marginBottom: -10,
  },

  serviceIcon: {
    marginBottom: 10,
    marginRight: 10,
  },

  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 20,
    lineHeight: 25,
  },

  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default connect(({ user: { role } }) => ({ userRole: role }), { openWebViewModal })(
  ClassDetail,
);
