import {
  ROAD_HORIZON_Y,
  getRoadSlice,
  getRoadBoundaryPoint,
} from '../systems/projectionSystem';

function pseudoRandom(seed) {
  const value = Math.sin(seed * 999.91) * 43758.5453;
  return value - Math.floor(value);
}

function getRoadPathPoints(
  CANVAS_HEIGHT,
  avenueState
) {
  const points = [];
  const steps = 34;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    const y =
      ROAD_HORIZON_Y +
      (CANVAS_HEIGHT - ROAD_HORIZON_Y) * t;

    const slice = getRoadSlice(
      y,
      avenueState
    );

    points.push({
      left: slice.left,
      right: slice.right,
      y: slice.y,
    });
  }

  return points;
}

function fillRoadShape(ctx, points) {
  if (points.length === 0) return;

  ctx.beginPath();

  ctx.moveTo(points[0].left, points[0].y);

  for (let i = 0; i < points.length; i++) {
    ctx.lineTo(points[i].right, points[i].y);
  }

  for (let i = points.length - 1; i >= 0; i--) {
    ctx.lineTo(points[i].left, points[i].y);
  }

  ctx.closePath();
  ctx.fill();
}

function strokeRoadBoundary(
  ctx,
  boundaryIndex,
  CANVAS_HEIGHT,
  avenueState
) {
  const steps = 34;

  ctx.beginPath();

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    const y =
      ROAD_HORIZON_Y +
      (CANVAS_HEIGHT - ROAD_HORIZON_Y) * t;

    const point =
      getRoadBoundaryPoint(
        boundaryIndex,
        y,
        avenueState
      );

    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }

  ctx.stroke();
}

export function drawRoad(
  ctx,
  s,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LANE_COUNT
) {
  const avenueState = s.avenueState;

  const roadPoints = getRoadPathPoints(
    CANVAS_HEIGHT,
    avenueState
  );

  // Solo urbano escuro ao redor da pista
  const groundGradient = ctx.createLinearGradient(
    0,
    ROAD_HORIZON_Y,
    0,
    CANVAS_HEIGHT
  );

  groundGradient.addColorStop(0, 'rgba(15, 23, 42, 0.35)');
  groundGradient.addColorStop(1, 'rgba(15, 23, 42, 0.05)');

  ctx.fillStyle = groundGradient;
  ctx.fillRect(
    0,
    ROAD_HORIZON_Y,
    CANVAS_WIDTH,
    CANVAS_HEIGHT - ROAD_HORIZON_Y
  );

  // Asfalto principal
  ctx.fillStyle = '#171d2b';
  fillRoadShape(ctx, roadPoints);

  // Leve sombra central do asfalto
  const asphaltShade = ctx.createLinearGradient(
    0,
    ROAD_HORIZON_Y,
    0,
    CANVAS_HEIGHT
  );

  asphaltShade.addColorStop(0, 'rgba(255,255,255,0.02)');
  asphaltShade.addColorStop(1, 'rgba(0,0,0,0.18)');

  ctx.fillStyle = asphaltShade;
  fillRoadShape(ctx, roadPoints);

  // Textura estável do asfalto, sem Math.random no draw
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;

  const textureTravel =
    s.frameCount * s.speed * 0.45;

  for (let i = 0; i < 80; i++) {
    const rawY =
      ROAD_HORIZON_Y +
      (
        (i * 83 + textureTravel) %
        (CANVAS_HEIGHT - ROAD_HORIZON_Y)
      );

    const slice = getRoadSlice(
      rawY,
      avenueState
    );

    const x =
      slice.left +
      pseudoRandom(i + 17) *
        (slice.right - slice.left);

    ctx.beginPath();
    ctx.moveTo(x, slice.y);
    ctx.lineTo(
      x + 2 * slice.scale,
      slice.y + 2
    );
    ctx.stroke();
  }

  // Brilho discreto nas bordas
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.25)';
  ctx.lineWidth = 8;

  strokeRoadBoundary(
    ctx,
    0,
    CANVAS_HEIGHT,
    avenueState
  );

  strokeRoadBoundary(
    ctx,
    LANE_COUNT,
    CANVAS_HEIGHT,
    avenueState
  );

  // Bordas externas amarelas acompanhando a projeção real
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 4;

  strokeRoadBoundary(
    ctx,
    0,
    CANVAS_HEIGHT,
    avenueState
  );

  strokeRoadBoundary(
    ctx,
    LANE_COUNT,
    CANVAS_HEIGHT,
    avenueState
  );

  // Faixas internas acompanhando a mesma projeção da estrada
  ctx.strokeStyle = 'rgba(226,232,240,0.42)';
  ctx.lineWidth = 4;

  for (let i = 1; i < LANE_COUNT; i++) {
    s.roadLines.forEach((ly) => {
      if (ly < ROAD_HORIZON_Y) return;

      const t =
        (ly - ROAD_HORIZON_Y) /
        (CANVAS_HEIGHT - ROAD_HORIZON_Y);

      const dashLength =
        12 + t * 88;

      const y2 = Math.min(
        ly + dashLength,
        CANVAS_HEIGHT
      );

      const p1 =
        getRoadBoundaryPoint(
          i,
          ly,
          avenueState
        );

      const p2 =
        getRoadBoundaryPoint(
          i,
          y2,
          avenueState
        );

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });
  }
}