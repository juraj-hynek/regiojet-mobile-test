// @flow
import { type IconType } from '../components/Icon';
import { type VehicleType } from '../types';

export const getVehicleIconNameByType = (type: VehicleType): IconType => {
  const map: { [key: VehicleType]: IconType } = {
    BUS: 'bus',
    TRAIN: 'train',
  };
  return map[type];
};
