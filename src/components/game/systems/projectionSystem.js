import {
  LANE_COUNT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../constants/gameConstants';

export function projectRoadPoint(lanePosition, y) {
  const horizonY = 155;

  const roadBottomLeft = 40;
  const roadBottomRight = CANVAS_WIDTH - 40;

  // topo mais estreito para sensação de estrada longa
  const roadTopLeft = CANVAS_WIDTH * 0.465;
  const roadTopRight = CANVAS_WIDTH * 0.535;

  const t = Math.max(
    0,
    Math.min(
      1,
      (y - horizonY) /
        (CANVAS_HEIGHT - horizonY)
    )
  );

  const perspective = Math.pow(t, 2.2);

  const left =
    roadTopLeft +
    (roadBottomLeft - roadTopLeft) *
      perspective;

  const right =
    roadTopRight +
    (roadBottomRight - roadTopRight) *
      perspective;

  const laneWidth =
    (right - left) / LANE_COUNT;

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