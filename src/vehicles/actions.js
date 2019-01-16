// @flow
import axios from 'axios';

import { addGlobalError } from '../messages/actions';
import { getErrorResponse } from '../error/helpers';
import type { ActionDeps } from '../redux';
import type { ErrorResponse, Vehicle, VehicleSvg } from '../types';

type GetVehicleSvgAction =
  | {
      type: 'GET_VEHICLE_SVG_PENDING',
      vehicleId: number,
    }
  | {
      type: 'GET_VEHICLE_SVG_FULFILLED',
      payload: VehicleSvg,
      vehicleId: number,
    }
  | {
      type: 'GET_VEHICLE_SVG_REJECTED',
      message: ErrorResponse,
      vehicleId: number,
    };

export type VehicleAction = GetVehicleSvgAction;

const SVG_SIZE_REGEXP = new RegExp('<svg[^>]+width="([0-9.]+)px"[^>]+height="([0-9.]+)px"[^>]*>');

export const getVehicleSvg = (vehicle: Vehicle) => async ({
  dispatch,
}: ActionDeps): Promise<GetVehicleSvgAction> => {
  const { layoutURL, vehicleId } = vehicle;

  try {
    dispatch(({ type: 'GET_VEHICLE_SVG_PENDING', vehicleId }: GetVehicleSvgAction));
    const { data: svg } = await axios.get(layoutURL);
    const [, width, height] = svg.match(SVG_SIZE_REGEXP);

    return {
      type: 'GET_VEHICLE_SVG_FULFILLED',
      payload: {
        height: parseFloat(height),
        svg,
        width: parseFloat(width),
      },
      vehicleId,
    };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return {
      type: 'GET_VEHICLE_SVG_REJECTED',
      message: errorResponse,
      vehicleId,
    };
  }
};
