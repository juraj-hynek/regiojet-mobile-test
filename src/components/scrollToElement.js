// @flow
import { Dimensions, findNodeHandle } from 'react-native';

const OFFSET_TOP = 50;
const OFFSET_RIGHT = -5;
const MODAL_OFFSET_TOP = 25;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;

type configType = {
  isModal?: boolean,
  containerHeight?: number,
  scrollVertical?: boolean,
};

const defaultConfing = {
  isModal: false,
  containerHeight: null,
  scrollVertical: true,
};

const getOffset = (isModal: boolean): number =>
  isModal ? OFFSET_TOP + MODAL_OFFSET_TOP : OFFSET_TOP;

const canScrollTop = (containerHeight?: ?number, elementHeight: number, windowOffsetY: number) =>
  windowOffsetY < 0 ||
  (!containerHeight && windowOffsetY > 0 && windowOffsetY < elementHeight + OFFSET_TOP);

const canScrollDown = (contentOffsetY: number, containerHeight?: ?number) => {
  if (!containerHeight) return false;
  return containerHeight - contentOffsetY - WINDOW_HEIGHT > 0;
};

const canScrollLeft = (windowOffsetX: number): boolean => windowOffsetX < 0;

const canScrollRight = (windowOffsetX, elementWidth): boolean =>
  windowOffsetX > WINDOW_WIDTH - elementWidth;

const verticalScroll = (
  containerRef: Object,
  contentOffsetY: number,
  windowOffsetY: number,
  elementHeight: number,
  isModal: boolean,
  containerHeight?: ?number,
): void => {
  if (
    canScrollTop(containerHeight, elementHeight, windowOffsetY) ||
    canScrollDown(contentOffsetY, containerHeight)
  ) {
    containerRef.scrollTo({
      y: contentOffsetY - getOffset(isModal),
      animated: true,
    });
  }
};

const horizontalScroll = (
  containerRef: Object,
  contentOffsetX: number,
  windowOffsetX: number,
  elementWidth: number,
): void => {
  if (canScrollLeft(windowOffsetX)) {
    containerRef.scrollTo({
      x: contentOffsetX,
      animated: true,
    });
  } else if (canScrollRight(windowOffsetX, elementWidth)) {
    containerRef.scrollTo({
      x: contentOffsetX - WINDOW_WIDTH + elementWidth + OFFSET_RIGHT,
      animated: true,
    });
  }
};

const init = (config: configType) => ({ ...defaultConfing, ...config });

export const scrollToElement = (containerRef: ?Object, config?: configType = {}): Function => (
  elementRef: ?Object,
): void => {
  if (!containerRef || !elementRef) return;
  const { isModal, containerHeight, scrollVertical } = init(config);

  elementRef.measureLayout(
    findNodeHandle(containerRef),
    (contentOffsetX, contentOffsetY, elementWidth, elementHeight) =>
      // $FlowFixMe
      elementRef.measureInWindow(
        (windowOffsetX, windowOffsetY) =>
          scrollVertical
            ? verticalScroll(
                // $FlowFixMe
                containerRef,
                contentOffsetY,
                windowOffsetY,
                elementHeight,
                isModal,
                containerHeight,
              )
            : // $FlowFixMe
              horizontalScroll(containerRef, contentOffsetX, windowOffsetX, elementWidth),
      ),
  );
};
