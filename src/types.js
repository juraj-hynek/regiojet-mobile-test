// @flow

// TODO use to use proper style types: https://stackoverflow.com/a/49799497
import type { DangerouslyImpreciseStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import {
  AVAILABLE_CURRENCIES,
  AVAILABLE_LANGUAGES,
  AVAILABLE_LOCALES,
} from './localization/helpers';
import { ticketStateMessageIds } from './tickets/TicketState';
import type { IconType } from './components/Icon';
import type { WarningType } from './components/Warning';

export type VehicleType = 'BUS' | 'TRAIN';

export type BasketItemSimple = {
  route: Route,
  selectedPriceClass: PriceClass,
};

export type BasketItem = BasketItemSimple & {
  addons: Array<RouteAddon>,
  codeDiscount?: RouteCodeDiscount,
  passengers: Array<RoutePassenger>,
  passengersData: PassengersDataResponse,
  passengerTouched: PassengerTouched,
  seats: Array<RouteSeatsResponse>,
  shortid: string,
};

export type PaymentMethodFormField = {
  fieldName: string,
  fieldType: string,
};

export type PaymentMethod = {
  paymentMethodCode: string,
  active: boolean,
  description: string,
};

export type ContactForm = {
  title: string,
  customerName: string,
  customerEmail: string,
  message: string,
};

export type TransactionMethod =
  | 'ACCOUNT'
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'GIFT_CERTIFICATE'
  | 'CREDIT_CARD'
  | 'ONLINE_PAYMENT';

export type Transaction = {
  paymentId: number,
  ticketId?: number,
  description?: string,
  amount: number,
  currency: Currency,
  method: TransactionMethod,
  dateTransaction: string,
  isReceiptAvailable: boolean,
  isInvoiceAvailable: boolean,
};

export type CancelCharge = {
  message?: string,
  amount: number,
  currency?: Currency,
  percent?: number,
};

export type PriceConditionsDescriptions = {
  cancel?: string,
  expiration?: string,
  rebook?: string,
};

export type PriceConditions = {
  code: string,
  descriptions: PriceConditionsDescriptions,
  refundToOriginalSourcePossible: boolean,
  cancelCharge?: number,
  cancelCharges?: CancelCharge,
};

export type PriceConditionsDescriptionsType = $Keys<PriceConditionsDescriptions>;

export type ActionPrice = {
  code: string,
  name: string,
  url: string,
  description: ?string,
  showIcon: boolean,
};

export type TariffNotifications = {
  title: string,
  description: string,
  content: Array<string>,
};

export type PriceClass = {
  seatClassKey: string,
  conditions: PriceConditions,
  services: Array<IconType>,
  freeSeatsCount: number,
  price: number,
  creditPrice: number,
  priceSource: string,
  customerNotifications: Array<string>,
  actionPrice: ActionPrice,
  tariffs: Array<string>,
  tariffNotifications: TariffNotifications,
  bookable: boolean,
};

// TODO refactor to use proper style types: https://stackoverflow.com/a/49799497
export type Style = DangerouslyImpreciseStyleProp;

export type SimpleRoutesSearchData = {
  fromStationId: number,
  toStationId: number,
  tariffs?: Array<string>,
};

export type RoutesSearchMove = 'BACKWARD' | 'FORWARD';

export type RoutesSearchData = {|
  fromLocationId: number,
  fromLocationType: LocationType,
  toLocationId: number,
  toLocationType: LocationType,
  departureDate?: string,
  tariffs?: Array<string>,
  move?: RoutesSearchMove,
|};

export type SeatClass = {
  key: string,
  title: string,
  description: string,
  imageUrl: ?string,
  galleryUrl?: ?string,
};

export type Tariff = {
  key: string,
  value: string,
};

export type VehicleStandard = {
  key: string,
  name: string,
  description: string,
  imageUrl: string,
  supportImageUrl: string,
  galleryUrl?: ?string,
};

export type Line = {
  code: string,
  from: string,
  id: number,
  to: string,
};

export type SelectedSeat = {
  sectionId: number,
  vehicleNumber: number,
  seatIndex: number,
  // custom attribute, does not come from API
  specialSeatsModalShown?: boolean,
};

export type Seat = {
  index: number,
  seatClass: string,
  seatConstraint: string,
  seatNotes: Array<string>,
};

export type Vehicle = {
  vehicleId: number,
  code: string,
  layoutURL: string,
  type: VehicleType,
  vehicleStandardKey: string,
  services: Array<string>,
  vehicleNumber: number,
  seatClasses: Array<string>,
  notifications: string,
  freeSeats: Array<Seat>,
};

export type FreeSeatsNumbers = Array<number>;

export type ReservationVehicle = {
  selectedSeats: Array<SelectedSeat>,
  vehicle: Vehicle,
  freeSeatsNumbers: FreeSeatsNumbers,
};

export type ReservationSection = {
  section: Section,
  vehicles: Array<ReservationVehicle>,
};

export type ReservationMode = 'reservation' | 'cancel' | 'storno';

export type VehicleSvg = {
  height: number,
  svg: string,
  width: number,
};

export type Section = {
  id: number,
  vehicleStandardKey: string,
  support: boolean,
  supportCode: string,
  vehicleType: VehicleType,
  fixedSeatReservation: boolean,
  line: Line,
  departureStationId: number,
  departureStationName: string,
  departureCityId: number,
  departureCityName: string,
  departureTime: string,
  departurePlatform: ?string,
  arrivalStationId: number,
  arrivalStationName: string,
  arrivalCityId: number,
  arrivalCityName: string,
  arrivalTime: string,
  arrivalPlatform: string,
  freeSeatsCount: number,
  notices: Array<string>,
};

export type RouteSeatsResponse = {
  sectionId: number,
  fixedSeatReservation: boolean,
  vehicles: Array<Vehicle>,
  selectedSeats: Array<SelectedSeat>,
};

export type Surcharge = {
  price: number,
  notification: string,
};

export type TransferType = 'NONE' | 'WALKING' | 'PUBLIC_TRANSPORT';

export type Transfer = {
  fromStationId: number,
  toStationId: number,
  type: TransferType,
  calculatedTransferTime: TimePeriod,
  determinedTransferTime: TimePeriod,
  description: string,
};

export type TransfersInfo = {
  info: string,
  transfers: Array<Transfer>,
};

export type Route = {
  id: string,
  departureStationId: number,
  departureStationName: string,
  departureCityId: number,
  departureCityName: string,
  departureTime: string,
  arrivalStationId: number,
  arrivalStationName: string,
  arrivalCityId: number,
  arrivalCityName: string,
  arrivalTime: string,
  freeSeatsCount: number,
  priceFrom: ?number,
  priceTo: number,
  creditPriceFrom: ?number,
  creditPriceTo: number,
  vehicleTypes: Array<VehicleType>,
  priceClasses: Array<PriceClass>,
  surcharge: Surcharge,
  sections: Array<Section>,
  notices: boolean,
  transfersInfo: ?TransfersInfo,
  nationalTrip: boolean,
  bookable: boolean,
};

export type SimpleRoute = {
  id: string,
  departureStationId: number,
  departureTime: string,
  arrivalStationId: number,
  arrivalTime: string,
  vehicleTypes: Array<VehicleType>,
  transfersCount: number,
  freeSeatsCount: number,
  priceFrom: number,
  priceTo: number,
  creditPriceFrom: number,
  creditPriceTo: number,
  pricesCount: number,
  actionPrice: boolean,
  surcharge: boolean,
  notices: boolean,
  support: boolean,
  nationalTrip: boolean,
  bookable: boolean,
};

export type BannerBubble = {
  id: number,
  text: ?string,
  url: string,
  imageUrl: string,
};

export type TextBubble = {
  id: number,
  text: string,
};

export type SimpleSearchResult = {
  outboundRoutes: Array<SimpleRoute>,
  outboundRoutesMessage: string,
  bannerBubbles: Array<BannerBubble>,
  textBubbles: Array<TextBubble>,
};

export type ConnectionListType = 'outbound' | 'return';

export type Currency = $Keys<typeof AVAILABLE_CURRENCIES>;
export type Locale = $Keys<typeof AVAILABLE_LOCALES>;
export type Language = $Keys<typeof AVAILABLE_LANGUAGES>;

export type CustomerAction =
  | 'showDetail'
  | 'pay'
  | 'payRemaining'
  | 'evaluate'
  | 'cancel'
  | 'storno'
  | 'rebook'
  | 'editPassengers'
  | 'additionalServices'
  | 'sentToMail'
  | 'printTicket'
  | 'printInvoice';

export type CustomerActions = { [CustomerAction]: boolean };

export type Passenger = {
  id: number,
  firstName: string,
  surname: string,
  phone: string,
  email: string,
  dateOfBirth: string,
  tariff: string,
  amount: number,
  moneyBack: number,
};

export type TicketState = $Keys<typeof ticketStateMessageIds>;

export type TicketSection = {
  section: Section,
  fixedSeatReservation: boolean,
  selectedSeats: Array<SelectedSeat>,
};

export type TimePeriod = {
  days: number,
  hours: number,
  minutes: number,
};

export type PersonalDataType =
  | 'FIRST_NAME'
  | 'SURNAME'
  | 'BIRTHDAY'
  | 'EMAIL'
  | 'PHONE'
  | 'ZIP_CODE'
  | 'PERSONAL_NUMBER'
  | 'STREET'
  | 'HOUSE_NUMBER'
  | 'CITY';

export type PassengersInfo = {
  passengers: Array<Passenger>,
  firstPassengerData: Array<PersonalDataType>,
  otherPassengersData: Array<PersonalDataType>,
  changeCharge: number,
};

export type Ticket = {
  id: number,
  routeId: string,
  price: number,
  unpaid: number,
  currency: Currency,
  state: TicketState,
  seatClassKey: string,
  conditions: PriceConditions,
  expirationDate: string,
  expirateAt: TimePeriod,
  customerNotifications: Array<string>,
  customerActions: CustomerActions,
  outboundRouteSections: Array<TicketSection>,
  returnRouteSections: Array<TicketSection>,
  outboundAddons: Array<RouteAddon>,
  returnAddons: Array<RouteAddon>,
  paymentId: number,
  bills: Array<TicketBill>,
  usedCodeDiscount: CodeDiscount,
  usedPercentualDiscounts: Array<PercentualDiscount>,
  transfersInfo: ?TransfersInfo,
  surcharge: number,
  cancelChargeSum: number,
  cancelMoneyBackSum: number,
  passengersInfo: PassengersInfo,
};

export type TicketBill = {
  amount: number,
  currency: Currency,
  label: string,
};

export type Notifications = {
  newsletter: boolean,
  reservationChange: boolean,
  routeRatingSurvey: boolean,
};

export type Company = {
  companyName: string,
  address: string,
  registrationNumber: string,
  vatNumber?: string,
};

export type User = {
  id: number,
  accountCode: string,
  firstName: ?string,
  surname: ?string,
  phoneNumber: string,
  restrictPhoneNumbers: boolean,
  email: string,
  mojeid: string,
  credit: number,
  creditPrice: boolean,
  currency: Currency,
  defaultTariffKey: string,
  notifications: Notifications,
  companyInformation: boolean,
  company: ?Company,
};

export type UserRole = 'ANONYMOUS' | 'CREDIT' | 'OPEN';

export type MessageField = {
  key: string,
  value: string,
};

export type ErrorResponse = {
  message: string,
  errorFields: Array<MessageField>,
};

export type SuccessResponse = {
  message: string,
  messageFields: Array<MessageField>,
};

export type FormAnswer = {
  text: string,
  answerId: number,
};

export type FormQuestionType = 'MULTI_COMBO' | 'TEXT' | 'RADIO_BUTTON' | 'CHECKBOX' | 'HEADER';

export type FormQuestion = {
  questionId?: number,
  type: FormQuestionType,
  text: string,
  watermark?: string,
  options?: Array<FormAnswer>,
};

export type RatingAnsweredFormField = {
  questionId: number,
  answerId?: number,
  text?: string,
};

export type RatingAnsweredFormData = {
  fields: Array<RatingAnsweredFormField>,
};

export type RatingFormData = {
  sectionId: number,
  answers: RatingAnsweredFormData,
  fields: Array<FormQuestion>,
};

export type SectionPutRatingRequest = {
  sectionId: number,
  form: RatingAnsweredFormData,
};

// custom types (not from API)
export type RatingFormAnswers = { [questionId: number]: Array<FormAnswer> };
export type RatingFormSection = {
  sectionId: number,
  answers: RatingFormAnswers,
};

export type GiftCertificateInfo = {
  certificateCode: string,
  amount: number,
  currency: Currency,
  creationDate: string,
  expirationDate: string,
  state: 'VALID',
};

export type OrderedAddon = {
  id: number,
  name: string,
  description: string,
  iconUrl: string,
  infoUrl?: string,
  infoUrlLabel?: string,
  price: number,
  currency: Currency,
  maxCount?: number,
  conditions: PriceConditions,
};

export type AvailableAddon = $Diff<OrderedAddon, { id: number }> & {
  addonId: number,
};

export type RouteAddon = OrderedAddon & {
  checked: boolean,
  count: number,
  originalCount: number,
};
export type RoutePassenger = {
  firstName?: string,
  surname?: string,
  email?: string,
  phone?: string,
};
export type PassengerField = $Keys<RoutePassenger>;
export type RoutePassengerChanges = { [basketItemId: string]: RoutePassenger };
export type PassengerTouched = { [field: PassengerField]: boolean };

export type GlobalMessage =
  | {|
      createdTimestamp: number,
      id: string,
      text: string,
      type: WarningType,
    |}
  | {|
      createdTimestamp: number,
      id: string,
      messageId: string,
      type: WarningType,
      values?: Object,
    |};

export type ModalId =
  | 'ADDON_INFO'
  | 'ADDONS_EDIT'
  | 'BASKET_SURCHARGE'
  | 'BASKET_TARIFF'
  | 'CANCEL'
  | 'CONTACT_FORM'
  | 'FORGOTTEN_PASSWORD'
  | 'LINE_DETAIL'
  | 'PASSENGER_CANCEL'
  | 'PASSENGER_EDIT'
  | 'PASSENGER_EDIT_CONFIRMATION'
  | 'PAYMENT'
  | 'WEBVIEW'
  | 'PRICE_COLLAPSE'
  | 'SEND_TICKET_BY_EMAIL'
  | 'SIMPLE_REGISTRATION'
  | 'SPECIAL_SEATS'
  | 'TRANSFER_INFO';

export type Station = {
  id: number,
  name: string,
  fullname: string,
  aliases: Array<string>,
  significance: number,
  longitude: number,
  latitude: number,
  imageUrl?: string,
  // custom attributes, do not come from API
  cityId: number,
};

export type City = {
  id: number,
  name: string,
  aliases: Array<string>,
  stations: Array<Station>,
  // custom attributes, do not come from API
  hasMultipleStations: boolean,
  countryCode: string,
};

export type Country = {
  country: string,
  code: string,
  cities: Array<City>,
};

export type LocationType = 'CITY' | 'STATION';

export type ListStation = {
  cityId: number,
  countryCode: string,
  id: number,
  isTopLevel: boolean,
  name: string,
  type: LocationType,
};

export type CityMap = { [id: string]: City };
export type StationMap = { [id: string]: Station };

export type LastSearch = {
  stationFrom: ListStation,
  stationTo: ListStation,
};

export type VerifiedDiscountResponse = {
  amount: number,
  currency: Currency,
  discountedTicketPrice: number,
};

export type DiscountState = 'VALID' | 'USED' | 'EXPIRED';

export type Discount = {
  id: number,
  percentage: number,
  passengers: number,
  fromLocation?: string,
  toLocation?: string,
  dateFrom?: string,
  dateTo?: string,
  state: DiscountState,
  ticketId?: number,
  // custom attribute, does not come from API
  applied?: {
    basketItemId: string,
  } & VerifiedDiscountResponse,
};

export type RouteCodeDiscount = {
  code: string,
} & VerifiedDiscountResponse;

export type CodeDiscount = {
  id: number,
  code: string,
  discount: number,
};

export type DepartureRange = {
  minDeparture: string,
  maxDeparture: string,
};

export type PercentualDiscount = {
  id: number,
  percentage: number,
  amount: number,
  passengers: number,
  fromLocation?: string,
  toLocation?: string,
  dateFrom?: string,
  dateTo?: string,
  state: DiscountState,
  ticketId?: number,
};

export type TimetableStation = {
  stationId: number,
  departure?: string,
  arrival?: string,
  platform?: string,
};

export type Timetable = {
  connectionId: number,
  fromCityName: string,
  toCityName: string,
  stations: Array<TimetableStation>,
};

export type DetailStation = {
  isActive: boolean,
  isLastActive: boolean,
  isLast: boolean,
  showCircle: boolean,
  station?: Station,
  timetableStation: TimetableStation,
};

export type MapRouteChunk = {
  destination: Station,
  origin: Station,
  waypoints: Array<Station>,
};

export type SubmenuItem = {
  label: string,
  href: string,
};

export type MenuItem = {
  label: string,
  href: string,
  submenu: false | Array<SubmenuItem>,
};

export type PassengersDataResponse = {
  firstPassengerData: Array<PersonalDataType>,
  otherPassengersData: Array<PersonalDataType>,
};

export type TicketListType = 'new' | 'old' | 'unpaid';
