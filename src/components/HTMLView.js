// @flow
import { Linking, StyleSheet, Text, View } from 'react-native';
import first from 'lodash/first';
import get from 'lodash/get';
import HTML from 'react-native-render-html';
import last from 'lodash/last';
import React from 'react';
import without from 'lodash/without';

import { colors, fontFamilies, theme } from '../style';
import type { Style } from '../types';

type Props = {|
  baseFontStyle?: Style,
  html: string,
  imagesMaxWidth?: number,
  style?: Style,
|};

class HTMLView extends React.PureComponent<Props> {
  static REGEXP_NEW_LINE = /\s*(\r?\n)+\s*/g;
  static REGEXP_LINE_BREAK = /\s*<br ?\/?>\s*/g;

  static addStyle(RNElement: Object, style: string) {
    const prevStyles = without(get(RNElement, 'attribs.style', '').split(';'), '');
    // eslint-disable-next-line no-param-reassign
    RNElement.attribs.style = [...prevStyles, style].join(';');
    return RNElement;
  }

  static addStyleFromAttribute(node: Object, htmlAttributeName: string, cssAttributeName: string) {
    const attributeValue = get(node, `attribs.${htmlAttributeName}`);
    if (attributeValue) {
      return HTMLView.addStyle(node, `${cssAttributeName}: ${attributeValue};`);
    }
    return node;
  }

  static alterNode = (node: Object): Object => {
    if (node.name === 'font') {
      return HTMLView.addStyleFromAttribute(node, 'color', 'color');
    }

    if (node.name === 'p') {
      return HTMLView.addStyleFromAttribute(node, 'align', 'text-align');
    }

    return node;
  };

  static handleLinkPress = (event: SyntheticEvent<any>, href: string) => Linking.openURL(href);

  static handleParsed = (dom: Array<string>, RNElements: Array<Object>) => {
    // remove default margins from first and last paragraphs and lists
    const firstElement = first(RNElements);
    const lastElement = last(RNElements);

    if (firstElement.tagName === 'p') {
      HTMLView.addStyle(firstElement, 'margin-top: 0');
    }
    if (['p', 'ul'].indexOf(lastElement.tagName) !== -1) {
      HTMLView.addStyle(lastElement, 'margin-bottom: 0');
    }

    return RNElements;
  };

  static sanitizeHtml = (html: string): string =>
    html.replace(HTMLView.REGEXP_NEW_LINE, ' ').replace(HTMLView.REGEXP_LINE_BREAK, '<br />');

  listsPrefixesRenderers = {
    ul: () => <Text style={[theme.paragraph, this.props.baseFontStyle, styles.bullet]}>•</Text>,
  };

  render() {
    const { baseFontStyle, html, imagesMaxWidth, style } = this.props;
    const flattenedBaseFontStyle: any = StyleSheet.flatten([theme.paragraph, baseFontStyle]);
    const tagsStyles = createTagsStyles(flattenedBaseFontStyle.color);

    return (
      <View style={style}>
        <HTML
          alterNode={HTMLView.alterNode}
          baseFontStyle={flattenedBaseFontStyle}
          html={HTMLView.sanitizeHtml(html)}
          imagesMaxWidth={imagesMaxWidth}
          listsPrefixesRenderers={this.listsPrefixesRenderers}
          onLinkPress={HTMLView.handleLinkPress}
          onParsed={HTMLView.handleParsed}
          tagsStyles={tagsStyles}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bullet: {
    color: colors.yellow,
    marginHorizontal: 10,
  },
});

const createTagsStyles = (baseColor: string) => ({
  a: {
    color: colors.red,
    textDecorationLine: 'none',
  },
  b: {
    fontFamily: fontFamilies.semiBold,
  },
  h1: StyleSheet.flatten([theme.h1, { color: baseColor }]),
  h2: StyleSheet.flatten([theme.h2, { color: baseColor }]),
  h3: StyleSheet.flatten([theme.h3, { color: baseColor }]),
  i: {
    fontFamily: fontFamilies.italic,
  },
  ul: {
    paddingLeft: 0,
  },
});

export default HTMLView;
