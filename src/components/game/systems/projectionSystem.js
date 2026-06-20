import {
  LANE_COUNT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../constants/gameConstants';

import { getAvenueCurveFactorAtY } from './urbanSegmentSystem';

// Horizonte da estrada rebaixado.
// Antes: 152
// Agora: 176
// Objetivo: dar sensação de câmera mais alta,
// como se víssemos a avenida de cima.
export const ROAD_HORIZON_Y = 186;

const ROAD_BOTTOM_LEFT = 40;
const ROAD_BOTTOM_RIGHT = CANVAS_WIDTH - 40;

// Ponto de fuga estreito: avenida longa/infinita
const ROAD_TOP_LEFT = CANVAS_WIDTH * 0.462;
const ROAD_TOP_RIGHT = CANVAS_WIDTH * 0.538;

export function getRoadRawT(y) {
  return Math.max(
    0,
    Math.min(
      1,
      (y - ROAD_HORIZON_Y) /
        (CANVAS_HEIGHT - ROAD_HORIZON_Y)
    )
  );
}

export function getRoadPerspective(y) {
  const t = getRoadRawT(y);

  return Math.pow(t, 2.2);
}

export function getRoadCurveOffset(
  y,
  avenueState = null
) {
  const t = getRoadRawT(y);

  const curveStrength = 16;

  const curveFactor = getAvenueCurveFactorAtY(
    avenueState,
    y
  );

  return (
    curveFactor *
    Math.sin(t * Math.PI) *
    Math.pow(1 - t, 0.45) *
    curveStrength
  );
}

export function getRoadSlice(
  y,
  avenueState = null
) {
  const perspective = getRoadPerspective(y);

  const curveOffset = getRoadCurveOffset(
    y,
    avenueState
  );

  const left =
    ROAD_TOP_LEFT +
    (ROAD_BOTTOM_LEFT - ROAD_TOP_LEFT) *
      perspective +
    curveOffset;

  const right =
    ROAD_TOP_RIGHT +
    (ROAD_BOTTOM_RIGHT - ROAD_TOP_RIGHT) *
      perspective +
    curveOffset;

  const projectedY =
    ROAD_HORIZON_Y +
    (CANVAS_HEIGHT - ROAD_HORIZON_Y) *
      perspective;

  const scale =
    0.08 +
    perspective * 1.25;

  return {
    left,
    right,
    y: projectedY,
    scale,
    perspective,
    t: getRoadRawT(y),
  };
}

export function getRoadBoundaryPoint(
  boundaryIndex,
  y,
  avenueState = null
) {
  const slice = getRoadSlice(
    y,
    avenueState
  );

  const laneWidth =
    (slice.right - slice.left) /
    LANE_COUNT;

  return {
    x: slice.left + laneWidth * boundaryIndex,
    y: slice.y,
    scale: slice.scale,
  };
}

export function projectRoadPoint(
  lanePosition,
  y,
  avenueState = null
) {
  const slice = getRoadSlice(
    y,
    avenueState
  );

  const laneWidth =
    (slice.right - slice.left) /
    LANE_COUNT;

  const x =
    slice.left +
    laneWidth * lanePosition +
    laneWidth / 2;

  return {
    x,
    y: slice.y,
    scale: slice.scale,
  };
}

export function getRoadSourceYForScreenY(screenY) {
  const normalized = Math.max(
    0,
    Math.min(
      1,
      (screenY - ROAD_HORIZON_Y) /
        (CANVAS_HEIGHT - ROAD_HORIZON_Y)
    )
  );

  const rawT = Math.pow(
    normalized,
    1 / 2.2
  );

  return (
    ROAD_HORIZON_Y +
    (CANVAS_HEIGHT - ROAD_HORIZON_Y) *
      rawT
  );
}

export function projectLaneCenterAtScreenY(
  lanePosition,
  screenY,
  avenueState = null
) {
  const sourceY =
    getRoadSourceYForScreenY(screenY);

  const point = projectRoadPoint(
    lanePosition,
    sourceY,
    avenueState
  );

  return {
    x: point.x,
    y: screenY,
    scale: point.scale,
    sourceY,
  };
}