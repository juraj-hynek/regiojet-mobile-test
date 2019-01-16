// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { openAddonsEditModal } from '../modal/actions';
import { theme } from '../style';
import Addon from './Addon';
import ButtonLink from '../components/ButtonLink';
import FormattedMessage from '../components/FormattedMessage';
import type { RouteAddon, Style } from '../types';

type Props = {
  disabled?: boolean,
  onAboutClose?: Function,
  onAddonChange?: Function,
  openAddonsEditModal: typeof openAddonsEditModal,
  routeAddons: Array<RouteAddon>,
  showEditButton?: boolean,
  style?: Style,
};

const Addons = ({
  disabled,
  onAboutClose,
  onAddonChange,
  openAddonsEditModal,
  routeAddons,
  showEditButton,
  style,
}: Props) => {
  const hasAddons = routeAddons.length > 0;

  return (
    <View style={[styles.container, style]}>
      {!showEditButton && <FormattedMessage id="additionalServices.title" style={theme.h2} />}

      {showEditButton && (
        <View style={styles.titleWithEditContainer}>
          <FormattedMessage
            id="additionalServices.title"
            style={[theme.h2, styles.titleWithEdit]}
          />
          <ButtonLink
            iconLeft="edit"
            onPress={() => openAddonsEditModal()}
            smallIcon
            style={styles.editButton}
          >
            <FormattedMessage
              id={hasAddons ? 'additionalServices.editButton' : 'additionalServices.addButton'}
            />
          </ButtonLink>
        </View>
      )}

      {!hasAddons ? (
        <FormattedMessage id="additionalServices.none" style={theme.paragraph} />
      ) : (
        <View style={styles.addons}>
          {routeAddons.map((addon, index) => (
            <Addon
              addon={addon}
              disabled={disabled}
              key={`${addon.id}${index}`} // eslint-disable-line react/no-array-index-key
              onAboutClose={onAboutClose}
              onChange={onAddonChange}
              style={styles.addon}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  addon: {
    marginVertical: 5,
  },

  addons: {
    marginVertical: -5,
  },

  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },

  titleWithEditContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  titleWithEdit: {
    flexShrink: 1,
    marginBottom: 0,
    marginRight: 10,
  },

  editButton: {
    flexShrink: 2,
  },
});

export default connect(null, { openAddonsEditModal })(Addons);
