// @flow

/*
!!! READ !!!
- before using new icons, run `yarn svg` to optimize all SVG files in assets/icons folder,
  without it, some icons might not work
- SVGs with linearGradient color don't work (see https://github.com/vault-development/react-native-svg-uri/issues/96), you have to manually create the SVG
  in React (see icons/MojeID.js)
- SVG files are loaded as raw string using `babel-plugin-inline-import`
- there is one caveat to this (see https://github.com/quadric/babel-plugin-inline-import#caveats) - if you change a file that's already
  imported, you will see no change
  => you need to change something in THIS file (e.g. add a new line, add a comment...)
     and save it to see changed imports
*/

import React from 'react';
import { StyleSheet } from 'react-native';
import SvgUri from 'react-native-svg-uri';

import { colors } from '../style/index';
import type { Style } from '../types';

import airCondition from '../../assets/icons/AirCondition.svg';
import arrowRight from '../../assets/icons/ArrowRight.svg';
import arrowUpBold from '../../assets/icons/ArrowUpBold.svg';
import bed from '../../assets/icons/Bed.svg';
import bedWomen from '../../assets/icons/BedWomen.svg';
import bike from '../../assets/icons/Bike.svg';
import burger from '../../assets/icons/Burger.svg';
import bus from '../../assets/icons/Bus.svg';
import calendar from '../../assets/icons/Calendar.svg';
import cancel from '../../assets/icons/Cancel.svg';
import cart from '../../assets/icons/Cart.svg';
import check from '../../assets/icons/Check.svg';
import checkBold from '../../assets/icons/CheckBold.svg';
import chevronDown from '../../assets/icons/ChevronDown.svg';
import chevronLeft from '../../assets/icons/ChevronLeft.svg';
import chevronRight from '../../assets/icons/ChevronRight.svg';
import chevronUp from '../../assets/icons/ChevronUp.svg';
import cross from '../../assets/icons/Cross.svg';
import crossCircle from '../../assets/icons/CrossCircle.svg';
import crossLight from '../../assets/icons/CrossLight.svg';
import drinksCold from '../../assets/icons/DrinksCold.svg';
import drinksHot from '../../assets/icons/DrinksHot.svg';
import edit from '../../assets/icons/Edit.svg';
import email from '../../assets/icons/Email.svg';
import emailAt from '../../assets/icons/EmailAt.svg';
import filter from '../../assets/icons/Filter.svg';
import food from '../../assets/icons/Food.svg';
import freeSeats from '../../assets/icons/FreeSeats.svg';
import funPortal from '../../assets/icons/FunPortal.svg';
import gopayPaypal from '../../assets/icons/GopayPaypal.svg';
import gopaySporopay from '../../assets/icons/GopaySporopay.svg';
import gopayTatrapay from '../../assets/icons/GopayTatrapay.svg';
import gopayVub from '../../assets/icons/GopayVub.svg';
import gpeOnlineCard from '../../assets/icons/GpeOnlineCard.svg';
import headphones from '../../assets/icons/Headphones.svg';
import infoBubble from '../../assets/icons/InfoBubble.svg';
import invoice from '../../assets/icons/Invoice.svg';
import kids from '../../assets/icons/Kids.svg';
import logo from '../../assets/icons/Logo.svg';
import lowCost from '../../assets/icons/LowCost.svg';
import maestro from '../../assets/icons/Maestro.svg';
import mapPin from '../../assets/icons/MapPin.svg';
import masterCard from '../../assets/icons/MasterCard.svg';
import newspaper from '../../assets/icons/Newspaper.svg';
import payuCsasServis24 from '../../assets/icons/PayuCsasServis24.svg';
import payuCsob from '../../assets/icons/PayuCsob.svg';
import payuEra from '../../assets/icons/PayuEra.svg';
import payuFio from '../../assets/icons/PayuFio.svg';
import payuGiropay from '../../assets/icons/PayuGiropay.svg';
import payuInstantTr from '../../assets/icons/PayuInstantTr.svg';
import payuKb from '../../assets/icons/PayuKb.svg';
import payuMbankMpenize from '../../assets/icons/PayuMbankMpenize.svg';
import payuRaiffeisen from '../../assets/icons/PayuRaiffeisen.svg';
import payuSepa from '../../assets/icons/PayuSepa.svg';
import payuSofort from '../../assets/icons/PayuSofort.svg';
import payuSberbank from '../../assets/icons/PayuSberbank.svg';
import plug from '../../assets/icons/Plug.svg';
import plus from '../../assets/icons/Plus.svg';
import plusInverse from '../../assets/icons/PlusInverse.svg';
import power from '../../assets/icons/Power.svg';
import refresh from '../../assets/icons/Refresh.svg';
import sale from '../../assets/icons/Sale.svg';
import search from '../../assets/icons/Search.svg';
import seat from '../../assets/icons/Seat.svg';
import silence from '../../assets/icons/Silence.svg';
import steward from '../../assets/icons/Steward.svg';
import supercash from '../../assets/icons/Supercash.svg';
import switchIcon from '../../assets/icons/Switch.svg';
import tatrapay from '../../assets/icons/Tatrapay.svg';
import thumbsUp from '../../assets/icons/ThumbsUp.svg';
import touchScreen from '../../assets/icons/TouchScreen.svg';
import touchScreenNo from '../../assets/icons/TouchScreenNo.svg';
import train from '../../assets/icons/Train.svg';
import transfer from '../../assets/icons/Transfer.svg';
import user from '../../assets/icons/User.svg';
import visa from '../../assets/icons/Visa.svg';
import visaElectron from '../../assets/icons/VisaElectron.svg';
import wagon from '../../assets/icons/Wagon.svg';
import warning from '../../assets/icons/Warning.svg';
import warningFull from '../../assets/icons/WarningFull.svg';
import wheelChair from '../../assets/icons/WheelChair.svg';
import wifi from '../../assets/icons/Wifi.svg';
import wifiNo from '../../assets/icons/WifiNo.svg';

import mojeID from './icons/MojeID';
import payuGeMoneyBank from './icons/PayuGeMoneyBank';
import payuUnicredit from './icons/PayuUnicredit';

const iconsSvg = {
  airCondition,
  arrowRight,
  arrowUpBold,
  bed,
  bedWomen,
  bike,
  burger,
  bus,
  calendar,
  cancel,
  cart,
  check,
  checkBold,
  chevronDown,
  chevronLeft,
  chevronRight,
  chevronUp,
  cross,
  crossCircle,
  crossLight,
  drinksCold,
  drinksHot,
  edit,
  email,
  emailAt,
  filter,
  food,
  freeSeats,
  funPortal,
  gopayPaypal,
  gopaySporopay,
  gopayTatrapay,
  gopayVub,
  gpeOnlineCard,
  headphones,
  infoBubble,
  invoice,
  kids,
  logo,
  lowCost,
  maestro,
  mapPin,
  masterCard,
  newspaper,
  payuCsasServis24,
  payuCsob,
  payuEra,
  payuFio,
  payuGeMoneyBank,
  payuGiropay,
  payuInstantTr,
  payuKb,
  payuMbankMpenize,
  payuRaiffeisen,
  payuSepa,
  payuSofort,
  payuSberbank,
  plug,
  plus,
  plusInverse,
  power,
  refresh,
  sale,
  search,
  seat,
  silence,
  steward,
  supercash,
  switch: switchIcon,
  tatrapay,
  thumbsUp,
  touchScreen,
  touchScreenNo,
  train,
  transfer,
  user,
  visa,
  visaElectron,
  wagon,
  warning,
  warningFull,
  wheelChair,
  wifi,
  wifiNo,
};

const iconsReact = {
  mojeID,
  payuGeMoneyBank,
  payuUnicredit,
};

type Icons = {
  ...$Shape<typeof iconsSvg>,
  ...$Shape<typeof iconsReact>,
};

export type IconType = $Keys<Icons>;

type Props = {
  color?: string,
  disabled?: boolean,
  fitToContent?: boolean,
  name: IconType,
  width: number,
  height: number,
  style?: Style,
};

const VIEW_BOX_REGEX = /<svg[^>]+viewBox="[0-9]+ [0-9]+ ([0-9]+) ([0-9]+)/;

export const computeDimensionsFromViewbox = (
  viewBoxWidth: number,
  viewBoxHeight: number,
  desiredWidth: number,
  desiredHeight: number,
) => {
  const ratio = Math.min(desiredWidth / viewBoxWidth, desiredHeight / viewBoxHeight);

  return {
    width: viewBoxWidth * ratio,
    height: viewBoxHeight * ratio,
  };
};

export const composeContainerStyle = (width: number, height: number, style?: Style) =>
  StyleSheet.flatten([
    {
      width,
      height,
    },
    styles.container,
    style,
  ]);

const Icon = ({ color, disabled, fitToContent, name, height, style, width }: Props) => {
  const IconReact = (iconsReact: Object)[name];

  if (IconReact) {
    return (
      <IconReact
        disabled={disabled}
        fitToContent={fitToContent}
        height={height}
        style={style}
        width={width}
      />
    );
  }

  let dimensions = { width, height };
  const svgXmlData = (iconsSvg: Object)[name];

  if (fitToContent) {
    const matches = svgXmlData ? svgXmlData.match(VIEW_BOX_REGEX) : null;
    if (matches) {
      const [, viewBoxWidth, viewBoxHeight] = matches;
      dimensions = computeDimensionsFromViewbox(viewBoxWidth, viewBoxHeight, width, height);
    }
  }

  return (
    <SvgUri
      fill={disabled ? colors.greyShadow : color}
      height={dimensions.height}
      style={composeContainerStyle(dimensions.width, dimensions.height, style)}
      svgXmlData={svgXmlData}
      width={dimensions.width}
    />
  );
};

Icon.defaultProps = {
  width: 20,
  height: 20,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Icon;
