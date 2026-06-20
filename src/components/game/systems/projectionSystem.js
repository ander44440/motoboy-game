import {
  LANE_COUNT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../constants/gameConstants';

export function getRoadCurveOffset(y) {
  const horizonY = 152;

  const t = Math.max(
    0,
    Math.min(
      1,
      (y - horizonY) / (CANVAS_HEIGHT - horizonY)
    )
  );

  // Curva leve:
  // zero no horizonte, aparece no meio da pista,
  // e volta quase a zero perto da moto.
  const curveStrength = 16;

  return (
    Math.sin(t * Math.PI) *
    Math.pow(1 - t, 0.45) *
    curveStrength
  );
}

export function projectRoadPoint(lanePosition, y) {
  const horizonY = 152;

  const roadBottomLeft = 40;
  const roadBottomRight = CANVAS_WIDTH - 40;

  // Ponto de fuga estreito: avenida longa/infinita
  const roadTopLeft = CANVAS_WIDTH * 0.462;
  const roadTopRight = CANVAS_WIDTH * 0.538;

  const t = Math.max(
    0,
    Math.min(
      1,
      (y - horizonY) /
        (CANVAS_HEIGHT - horizonY)
    )
  );

  const perspective =
    Math.pow(t, 2.2);

  const curveOffset = getRoadCurveOffset(y);

  const left =
    roadTopLeft +
    (roadBottomLeft - roadTopLeft) *
      perspective +
    curveOffset;

  const right =
    roadTopRight +
    (roadBottomRight - roadTopRight) *
      perspective +
    curveOffset;

  const laneWidth =
    (right - left) /
    LANE_COUNT;

  const x =
    left +
    laneWidth * lanePosition +
    laneWidth / 2;

  const projectedY =
    horizonY +
    (CANVAS_HEIGHT - horizonY) *
      perspective;

  const scale =
    0.08 +
    perspective * 1.25;

  return {
    x,
    y: projectedY,
    scale,
  };
}