// @flow
import type { SeatClass, Tariff, VehicleStandard } from '../types';

export const getSeatClass = (seatClasses: Array<SeatClass>, key: string): ?SeatClass =>
  seatClasses.find(seatClass => seatClass.key === key);

export const getTariffTranslation = (key: string, tariffs: Array<Tariff>): string => {
  const tariff = tariffs.find(tariff => tariff.key === key);
  return tariff ? tariff.value : '';
};

export const getVehicleStandard = (
  vehicleStandards: Array<VehicleStandard>,
  key: string,
): ?VehicleStandard => vehicleStandards.find(vehicleStandard => vehicleStandard.key === key);
