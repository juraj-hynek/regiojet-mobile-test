// @flow
import { Platform, WebView } from 'react-native';
import React from 'react';

import { colors } from '../style';
import type { SelectedSeat, Style, Vehicle } from '../types';

type Props = {|
  freeSeatsNumbers: Array<number>,
  onSelect: Function,
  sectionId: number,
  selectedSeats: Array<SelectedSeat>,
  style?: Style,
  svgData: string,
  vehicle: Vehicle,
|};

/**
 * Get seat classes for available and selected seats
 * @return Object like { 1: 'available', 2: 'selected', ..., x: 'available' }
 */
const getSeatClasses = (selectedSeats: Array<SelectedSeat>, freeSeatsNumbers: Array<number>) => {
  const seatClasses = freeSeatsNumbers.reduce(
    (classes, freeSeatNumber) => ({
      ...classes,
      [freeSeatNumber]: 'available',
    }),
    {},
  );

  return selectedSeats.reduce(
    (classes, selectedSeat) => ({
      ...classes,
      [selectedSeat.seatIndex]: 'selected',
    }),
    seatClasses,
  );
};

class SeatSelection extends React.Component<Props> {
  static webViewJS = `
    function handleSeatClick(seatElement) {
      window.postMessage(seatElement.getAttribute('id').substring(1));
    }

    function delegateClick(event)  {
      var seatElement = event.target.closest('g');
      if (!seatElement) return;
      handleSeatClick(seatElement);
    }

    var seatsNumberingElement = document.getElementById('seats-numbering');
    seatsNumberingElement.addEventListener('click', delegateClick);

    var seatElements = document.querySelectorAll('g#seats-numbering > g');

    document.addEventListener('message', function(data) {
      var seatClasses = JSON.parse(data.data).seatClasses;

      for (var i = 0; i < seatElements.length; i++) {
        var seatNumber = seatElements[i].getAttribute('id').substring(1);
        seatElements[i].setAttribute('class', seatClasses[seatNumber]);
      }
    });
  `;

  static composeWebViewHTML(svgData: string) {
    return `
      <!DOCTYPE html>\n
      <html>
        <head>
          <style type="text/css">
            @font-face {
              font-family: 'SourceSansPro-Regular';
              src: url('file:///android_asset/fonts/SourceSansPro-Regular.ttf') format('truetype');
            }

            html, body {
              height: 100%;
              margin: 0;
              overflow: hidden;
              width: 100%;
            }

            svg {
              height: 100%;
              width: 100%;
            }

            g > circle {
              fill: ${colors.greyShadowHexa};
            }

            g > text {
              fill: ${colors.grey};
            }

            g.available circle {
              fill: ${colors.yellow};
            }

            g.available text {
              fill: ${colors.black};
            }

            g.selected > circle {
              fill: ${colors.green};
            }

            g.selected > text {
              fill: ${colors.white};
            }
          </style>
        </head>
        <body>
          ${svgData || ''}
        </body>
      </html>
    `;
  }

  // eslint-disable-next-line react/sort-comp
  refWebView = null;

  componentDidUpdate(prevProps: Props) {
    if (prevProps.selectedSeats !== this.props.selectedSeats) {
      this.colorSeats(this.props.selectedSeats);
    }
  }

  handleMessage = (event: Object) => {
    const { data } = event.nativeEvent;
    const seatIndex = parseInt(data, 10);
    const {
      freeSeatsNumbers,
      onSelect,
      sectionId,
      selectedSeats,
      vehicle: { vehicleNumber },
    } = this.props;

    const seatClasses = getSeatClasses(selectedSeats, freeSeatsNumbers);
    if (seatClasses[seatIndex] !== 'available') {
      return;
    }

    const selectedSeat = {
      seatIndex,
      sectionId,
      vehicleNumber,
    };

    onSelect(selectedSeat);
  };

  colorSeats(selectedSeats: Array<SelectedSeat>) {
    const { freeSeatsNumbers } = this.props;
    const seatClasses = getSeatClasses(selectedSeats, freeSeatsNumbers);

    if (this.refWebView) {
      this.refWebView.postMessage(JSON.stringify({ seatClasses }));
    }
  }

  render() {
    const { selectedSeats, style, svgData } = this.props;

    return (
      <WebView
        injectedJavaScript={SeatSelection.webViewJS}
        onMessage={this.handleMessage}
        onLoad={() => this.colorSeats(selectedSeats)}
        ref={ref => {
          this.refWebView = ref;
        }}
        scrollEnabled={false}
        source={{
          html: SeatSelection.composeWebViewHTML(svgData),
          ...Platform.select({
            android: {
              // necessary for custom fonts to work
              baseUrl: '',
            },
          }),
        }}
        style={style}
      />
    );
  }
}

export default SeatSelection;
