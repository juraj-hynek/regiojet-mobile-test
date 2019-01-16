// @flow
import { connect } from 'react-redux';
import { Linking, StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { colors, theme } from '../style';
import { linkStyles } from './MenuInternalLinks';
import Icon from '../components/Icon';
import menuAt from './menu/at';
import menuCs from './menu/cs';
import menuDe from './menu/de';
import menuEn from './menu/en';
import menuSk from './menu/sk';
import TouchableOpacity from '../components/TouchableOpacity';
import type { Locale, MenuItem } from '../types';

const menuItems = {
  at: menuAt,
  cs: menuCs,
  de: menuDe,
  en: menuEn,
  sk: menuSk,
};

type Props = {
  isOpen: boolean, // eslint-disable-line react/no-unused-prop-types
  // TODO shouldn't it be language? because of AT
  locale: Locale,
  onPress: Function,
};

type State = {
  submenuOpen: false | number,
};

class MenuExternalLinks extends React.PureComponent<Props, State> {
  static getDerivedStateFromProps(props: Props, state: State) {
    if (!props.isOpen && state.submenuOpen) {
      return { submenuOpen: false };
    }
    return null;
  }

  state = {
    submenuOpen: false,
  };

  handlePressItem(item: MenuItem, itemIndex: number) {
    if (!item.submenu) {
      this.handlePressExternal(item.href);
      return;
    }

    this.setState(prevState => ({
      submenuOpen: prevState.submenuOpen === itemIndex ? false : itemIndex,
    }));
  }

  handlePressExternal(href: string) {
    this.props.onPress(() => Linking.openURL(href));
  }

  render() {
    const { locale } = this.props;
    const { submenuOpen } = this.state;

    return (
      <View style={linkStyles.links}>
        {menuItems[locale].map((menuItem, index) => {
          const { href, label, submenu } = menuItem;
          const isSubmenuOpen = submenuOpen === index;

          return (
            <View key={href} style={[isSubmenuOpen && styles.submenu]}>
              <TouchableOpacity
                onPress={() => this.handlePressItem(menuItem, index)}
                style={linkStyles.link}
              >
                <Text style={[theme.paragraph, theme.semiBold]}>{label}</Text>
                {submenu && (
                  <Icon
                    height={24}
                    name={isSubmenuOpen ? 'chevronUp' : 'chevronDown'}
                    style={styles.linkIcon}
                    width={14}
                  />
                )}
              </TouchableOpacity>
              {isSubmenuOpen &&
                submenu.map(({ href, label }) => (
                  <TouchableOpacity
                    key={href}
                    onPress={() => this.handlePressExternal(href)}
                    style={styles.subLink}
                  >
                    <Text style={[theme.paragraph, linkStyles.subLinkText]}>{label}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  linkIcon: {
    marginLeft: 10,
  },

  subLink: {
    padding: 5,
  },

  submenu: {
    backgroundColor: colors.greyWhite,
    paddingBottom: 15,
  },
});

export default connect(({ localization: { locale } }) => ({ locale }), {})(MenuExternalLinks);
