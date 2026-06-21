import {
  ROAD_HORIZON_Y,
  getRoadSlice,
  getRoadBoundaryPoint,
} from '../systems/projectionSystem';

import {
  AVENUE_SEGMENT_TYPES,
  getAvenueSegmentState,
} from '../systems/urbanSegmentSystem';

function pseudoRandom(seed) {
  const value = Math.sin(seed * 999.91) * 43758.5453;
  return value - Math.floor(value);
}

function smoothStep(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function getResolvedAvenueState(s) {
  const urbanDistance =
    typeof s.urbanDistance === 'number'
      ? s.urbanDistance
      : s.frameCount * s.speed;

  return getAvenueSegmentState(urbanDistance);
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

function getIntersectionBand(
  avenueState,
  CANVAS_HEIGHT
) {
  if (!avenueState) return null;

  const type = avenueState.type;
  const progress = smoothStep(
    avenueState.progress || 0
  );

  let centerRawY = null;
  let opacity = 1;

  if (
    type ===
    AVENUE_SEGMENT_TYPES.INTERSECTION_APPROACH
  ) {
    centerRawY =
      ROAD_HORIZON_Y +
      28 +
      progress * 135;

    opacity = 0.5 + progress * 0.35;
  }

  if (
    type ===
    AVENUE_SEGMENT_TYPES.INTERSECTION
  ) {
    centerRawY =
      ROAD_HORIZON_Y +
      155 +
      progress * 250;

    opacity = 0.95;
  }

  if (
    type ===
    AVENUE_SEGMENT_TYPES.INTERSECTION_EXIT
  ) {
    centerRawY =
      ROAD_HORIZON_Y +
      410 +
      progress * 260;

    opacity = 0.95 * (1 - progress);
  }

  if (centerRawY === null) return null;

  const centerSlice = getRoadSlice(
    centerRawY,
    avenueState
  );

  const bandSize =
    54 + centerSlice.t * 140;

  const topRawY = Math.max(
    ROAD_HORIZON_Y,
    centerRawY - bandSize / 2
  );

  const bottomRawY = Math.min(
    CANVAS_HEIGHT,
    centerRawY + bandSize / 2
  );

  if (bottomRawY <= ROAD_HORIZON_Y) return null;
  if (topRawY >= CANVAS_HEIGHT) return null;

  return {
    topRawY,
    bottomRawY,
    opacity,
  };
}

function drawIntersectionVisual(
  ctx,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  avenueState
) {
  const band = getIntersectionBand(
    avenueState,
    CANVAS_HEIGHT
  );

  if (!band) return;

  const topSlice = getRoadSlice(
    band.topRawY,
    avenueState
  );

  const bottomSlice = getRoadSlice(
    band.bottomRawY,
    avenueState
  );

  const topY = topSlice.y;
  const bottomY = Math.max(
    topY + 18,
    bottomSlice.y
  );

  const opacity = Math.max(0.82, band.opacity);

  ctx.save();

  // Rua transversal mais sólida
  ctx.fillStyle = `rgba(13, 18, 30, ${0.96 * opacity})`;

  ctx.beginPath();
  ctx.moveTo(-60, topY);
  ctx.lineTo(CANVAS_WIDTH + 60, topY);
  ctx.lineTo(CANVAS_WIDTH + 60, bottomY);
  ctx.lineTo(-60, bottomY);
  ctx.closePath();
  ctx.fill();

  // Variação de asfalto no cruzamento
  const crossStreetShade = ctx.createLinearGradient(
    0,
    topY,
    0,
    bottomY
  );

  crossStreetShade.addColorStop(
    0,
    `rgba(30, 41, 59, ${0.45 * opacity})`
  );

  crossStreetShade.addColorStop(
    0.5,
    `rgba(51, 65, 85, ${0.30 * opacity})`
  );

  crossStreetShade.addColorStop(
    1,
    `rgba(15, 23, 42, ${0.55 * opacity})`
  );

  ctx.fillStyle = crossStreetShade;

  ctx.beginPath();
  ctx.moveTo(-60, topY);
  ctx.lineTo(CANVAS_WIDTH + 60, topY);
  ctx.lineTo(CANVAS_WIDTH + 60, bottomY);
  ctx.lineTo(-60, bottomY);
  ctx.closePath();
  ctx.fill();

  // Sombra no encontro da rua transversal com a avenida
  ctx.fillStyle = `rgba(0,0,0,${0.24 * opacity})`;

  ctx.beginPath();
  ctx.moveTo(topSlice.left, topY);
  ctx.lineTo(topSlice.right, topY);
  ctx.lineTo(bottomSlice.right, bottomY);
  ctx.lineTo(bottomSlice.left, bottomY);
  ctx.closePath();
  ctx.fill();

  // Bordas da rua transversal
  ctx.strokeStyle = `rgba(203,213,225,${0.38 * opacity})`;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(-60, topY);
  ctx.lineTo(CANVAS_WIDTH + 60, topY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-60, bottomY);
  ctx.lineTo(CANVAS_WIDTH + 60, bottomY);
  ctx.stroke();

  // Linha tracejada da rua transversal
  const midY = (topY + bottomY) / 2;

  ctx.strokeStyle = `rgba(226,232,240,${0.36 * opacity})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([22, 20]);

  ctx.beginPath();
  ctx.moveTo(-60, midY);
  ctx.lineTo(CANVAS_WIDTH + 60, midY);
  ctx.stroke();

  ctx.setLineDash([]);

  // Linhas de parada na avenida principal
  ctx.strokeStyle = `rgba(241,245,249,${0.58 * opacity})`;
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(topSlice.left + 14, topY);
  ctx.lineTo(topSlice.right - 14, topY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bottomSlice.left + 14, bottomY);
  ctx.lineTo(bottomSlice.right - 14, bottomY);
  ctx.stroke();

  ctx.restore();
}

export function drawRoad(
  ctx,
  s,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LANE_COUNT
) {
  const avenueState = getResolvedAvenueState(s);

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

  // Textura estável do asfalto
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

  // Bordas externas amarelas
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

  // Faixas internas
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

  // Cruzamento visual simples
  drawIntersectionVisual(
    ctx,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    avenueState
  );
}