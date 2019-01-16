// @flow
import { Dimensions, Image, Linking, StyleSheet, View } from 'react-native';
import React from 'react';

import { theme } from '../style';
import HTMLView from '../components/HTMLView';
import TouchableOpacity from '../components/TouchableOpacity';
import Warning from '../components/Warning';
import type { BannerBubble, TextBubble } from '../types';

type Props = {|
  bannerBubbles: Array<BannerBubble>,
  textBubbles: Array<TextBubble>,
|};

const WINDOW_WIDTH = Dimensions.get('window').width;

class InfoBubbles extends React.PureComponent<Props> {
  // display width - layout horizontal padding - warning padding - warning icon width and margin
  static BANNER_BUBBLE_CONTENT_WIDTH = WINDOW_WIDTH - 20 - 40 - 58;
  // display width - layout horizontal padding - text bubble image width and margin
  static TEXT_BUBBLE_CONTENT_WIDTH = WINDOW_WIDTH - 20 - 85;

  handlePressBanner = () => {
    const { bannerBubbles } = this.props;
    Linking.openURL(bannerBubbles[0].url);
  };

  render() {
    const { bannerBubbles, textBubbles } = this.props;

    if (!bannerBubbles.length && !textBubbles.length) {
      return null;
    }
    const bannerBubble = bannerBubbles[0];

    return (
      <View style={theme.container}>
        {textBubbles.length > 0 && (
          <View
            style={[
              styles.textBubbles,
              bannerBubble && bannerBubble.text && styles.textBubblesBottom,
            ]}
          >
            {textBubbles.map(textBubble => (
              <Warning key={textBubble.id} style={styles.textBubble} type="warning">
                <HTMLView
                  html={textBubble.text}
                  imagesMaxWidth={InfoBubbles.BANNER_BUBBLE_CONTENT_WIDTH}
                />
              </Warning>
            ))}
          </View>
        )}
        {bannerBubble &&
          bannerBubble.text && (
            <TouchableOpacity
              disabled={!bannerBubble.url}
              onPress={this.handlePressBanner}
              style={styles.bannerBubble}
            >
              <Image style={styles.bannerImage} source={{ uri: bannerBubble.imageUrl }} />
              <View style={styles.htmlView}>
                <HTMLView
                  html={bannerBubble.text}
                  imagesMaxWidth={InfoBubbles.TEXT_BUBBLE_CONTENT_WIDTH}
                />
              </View>
            </TouchableOpacity>
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bannerBubble: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  bannerImage: {
    borderRadius: 75 / 2,
    height: 75,
    marginRight: 10,
    width: 75,
  },

  textBubble: {
    marginVertical: 5,
  },

  textBubbles: {
    marginVertical: -5,
  },

  htmlView: {
    flex: 1,
    flexWrap: 'wrap',
  },

  textBubblesBottom: {
    marginBottom: 50 - 5,
  },
});

export default InfoBubbles;
