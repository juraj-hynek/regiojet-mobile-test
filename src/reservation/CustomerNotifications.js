// @flow
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, theme } from '../style';
import FormattedMessage from '../components/FormattedMessage';
import HTMLView from '../components/HTMLView';
import Icon from '../components/Icon';

type Props = {
  notifications: Array<string>,
};

const CustomerNotifications = ({ notifications }: Props) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FormattedMessage id="customerNotifications.title" style={theme.h2} />

      <View style={styles.notificationsContainer}>
        <View style={styles.notifications}>
          {notifications.map((notification, index) => (
            <View
              key={index} // eslint-disable-line react/no-array-index-key
              style={[styles.notification, index !== 0 && styles.notificationNotFirst]}
            >
              <Icon
                color={colors.blue}
                height={20}
                name="infoBubble"
                style={styles.icon}
                width={30}
              />
              <HTMLView
                baseFontStyle={styles.text}
                html={notification}
                style={styles.textContainer}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    paddingHorizontal: 10,
  },

  // there must be a container with white background so that RGBA colors look like in styleguide
  notificationsContainer: {
    backgroundColor: colors.white,
    borderRadius: 3,
  },

  notifications: {
    backgroundColor: colors.blueShadow,
    borderColor: colors.blue,
    borderRadius: 3,
    borderWidth: 1,
    paddingHorizontal: 10,
  },

  notification: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
  },

  notificationNotFirst: {
    borderTopColor: colors.blue,
    borderTopWidth: 1,
  },

  icon: {
    marginRight: 10,
  },

  textContainer: {
    flexShrink: 1,
  },

  text: {
    color: colors.blueDark,
  },
});

export default CustomerNotifications;
