import {
  ROAD_HORIZON_Y,
  getRoadSlice,
  getRoadBoundaryPoint,
} from '../systems/projectionSystem';

import {
  AVENUE_SEGMENT_TYPES,
  getAvenueSegmentState,
} from '../systems/urbanSegmentSystem';

import { getTrafficLightState } from '../systems/trafficLightSystem';

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

function getRoadPathPoints(CANVAS_HEIGHT, avenueState) {
  const points = [];
  const steps = 34;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    const y =
      ROAD_HORIZON_Y +
      (CANVAS_HEIGHT - ROAD_HORIZON_Y) * t;

    const slice = getRoadSlice(y, avenueState);

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

    const point = getRoadBoundaryPoint(
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

function getIntersectionBand(avenueState, CANVAS_HEIGHT) {
  if (!avenueState) return null;

  const type = avenueState.type;

  const isIntersectionSegment =
    type === AVENUE_SEGMENT_TYPES.INTERSECTION_APPROACH ||
    type === AVENUE_SEGMENT_TYPES.INTERSECTION ||
    type === AVENUE_SEGMENT_TYPES.INTERSECTION_EXIT;

  if (!isIntersectionSegment) return null;

  let phase = 0;

  if (type === AVENUE_SEGMENT_TYPES.INTERSECTION_APPROACH) {
    phase = avenueState.progress * 0.34;
  } else if (type === AVENUE_SEGMENT_TYPES.INTERSECTION) {
    phase = 0.34 + avenueState.progress * 0.32;
  } else {
    phase = 0.66 + avenueState.progress * 0.34;
  }

  phase = smoothStep(phase);

  const centerRawY =
  ROAD_HORIZON_Y +
  44 +
  phase * (CANVAS_HEIGHT - ROAD_HORIZON_Y + 150);

  const centerSlice = getRoadSlice(
    centerRawY,
    avenueState
  );

  const bandSize = 26 + centerSlice.t * 46;

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

  const opacity =
    0.58 + (1 - Math.abs(phase - 0.5) * 2) * 0.22;

  return {
    topRawY,
    bottomRawY,
    opacity,
  };
}

export function getStopLineInfo(
  avenueState,
  CANVAS_HEIGHT,
  side = 'near'
) {
  const band = getIntersectionBand(
    avenueState,
    CANVAS_HEIGHT
  );

  if (!band) return null;

  const referenceRawY =
    side === 'near'
      ? band.bottomRawY
      : band.topRawY;

  const referenceSlice = getRoadSlice(
    referenceRawY,
    avenueState
  );

  const setback = 10 + referenceSlice.t * 18;

  const rawY =
    side === 'near'
      ? Math.min(
          CANVAS_HEIGHT - 10,
          band.bottomRawY + setback
        )
      : Math.max(
          ROAD_HORIZON_Y + 10,
          band.topRawY - setback
        );

  const slice = getRoadSlice(
    rawY,
    avenueState
  );

  if (slice.y < ROAD_HORIZON_Y + 8) return null;
  if (slice.y > CANVAS_HEIGHT - 6) return null;

  return {
    rawY,
    slice,
    opacity: band.opacity,
    side,
  };
}

function drawStopLine(
  ctx,
  CANVAS_HEIGHT,
  avenueState,
  side,
  opacityMultiplier = 1
) {
  const stopLine = getStopLineInfo(
    avenueState,
    CANVAS_HEIGHT,
    side
  );

  if (!stopLine) return;

  const slice = stopLine.slice;
  const opacity = Math.max(
    0,
    Math.min(
      1,
      stopLine.opacity * opacityMultiplier
    )
  );

  if (opacity <= 0.02) return;

  const inset = 13 + slice.t * 14;
  const y = slice.y;
  const left = slice.left + inset;
  const right = slice.right - inset;

  const width = right - left;
  if (width <= 20) return;

  const thickness = 3.5 + slice.t * 5.5;

  ctx.save();

  ctx.lineCap = 'round';

  ctx.strokeStyle = `rgba(0,0,0,${0.30 * opacity})`;
  ctx.lineWidth = thickness + 4;

  ctx.beginPath();
  ctx.moveTo(left, y + 2);
  ctx.lineTo(right, y + 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(248,250,252,${0.96 * opacity})`;
  ctx.lineWidth = thickness;

  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(right, y);
  ctx.stroke();

  ctx.strokeStyle = `rgba(23,29,43,${0.20 * opacity})`;
  ctx.lineWidth = Math.max(1, thickness * 0.32);

  for (let i = 0; i < 5; i++) {
    const x =
      left +
      width * (0.18 + i * 0.16);

    ctx.beginPath();
    ctx.moveTo(x - 4 * slice.scale, y);
    ctx.lineTo(x + 5 * slice.scale, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCrosswalk(
  ctx,
  CANVAS_HEIGHT,
  avenueState,
  side,
  opacityMultiplier = 1
) {
  const band = getIntersectionBand(
    avenueState,
    CANVAS_HEIGHT
  );

  if (!band) return;

  const stopLine = getStopLineInfo(
    avenueState,
    CANVAS_HEIGHT,
    side
  );

  if (!stopLine) return;

  let topRawY;
  let bottomRawY;

  if (side === 'near') {
    topRawY = band.bottomRawY + 6;
    bottomRawY = stopLine.rawY - 12;
  } else {
    topRawY = stopLine.rawY + 12;
    bottomRawY = band.topRawY - 6;
  }

  if (bottomRawY <= topRawY + 6) return;

  const opacity = Math.max(
    0,
    Math.min(
      1,
      stopLine.opacity * opacityMultiplier
    )
  );

  if (opacity <= 0.02) return;

  const topSlice = getRoadSlice(
    topRawY,
    avenueState
  );

  const bottomSlice = getRoadSlice(
    bottomRawY,
    avenueState
  );

  if (topSlice.y < ROAD_HORIZON_Y + 6) return;
  if (bottomSlice.y > CANVAS_HEIGHT - 6) return;

  const stripeCount = side === 'near' ? 6 : 5;

  const topInset = 18 + topSlice.t * 16;
  const bottomInset = 18 + bottomSlice.t * 16;

  const topLeft = topSlice.left + topInset;
  const topRight = topSlice.right - topInset;

  const bottomLeft = bottomSlice.left + bottomInset;
  const bottomRight = bottomSlice.right - bottomInset;

  const gap = 0.055;
  const stripeWidth = 0.065;

  ctx.save();

  for (let i = 0; i < stripeCount; i++) {
    const center =
      0.18 +
      i * ((0.64) / Math.max(1, stripeCount - 1));

    const a = center - stripeWidth / 2;
    const b = center + stripeWidth / 2;

    if (a < gap || b > 1 - gap) continue;

    const x1Top =
      topLeft + (topRight - topLeft) * a;
    const x2Top =
      topLeft + (topRight - topLeft) * b;

    const x1Bottom =
      bottomLeft + (bottomRight - bottomLeft) * a;
    const x2Bottom =
      bottomLeft + (bottomRight - bottomLeft) * b;

    // Sombra leve da tinta
    ctx.fillStyle = `rgba(0,0,0,${0.18 * opacity})`;

    ctx.beginPath();
    ctx.moveTo(x1Top, topSlice.y + 2);
    ctx.lineTo(x2Top, topSlice.y + 2);
    ctx.lineTo(x2Bottom, bottomSlice.y + 2);
    ctx.lineTo(x1Bottom, bottomSlice.y + 2);
    ctx.closePath();
    ctx.fill();

    // Faixa branca vertical da travessia
    ctx.fillStyle = `rgba(248,250,252,${0.78 * opacity})`;

    ctx.beginPath();
    ctx.moveTo(x1Top, topSlice.y);
    ctx.lineTo(x2Top, topSlice.y);
    ctx.lineTo(x2Bottom, bottomSlice.y);
    ctx.lineTo(x1Bottom, bottomSlice.y);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function getTrafficLightColor(frameCount) {
  return getTrafficLightState(frameCount).color;
}

function drawTrafficLightHead(ctx, activeColor) {
  ctx.fillStyle = '#111827';
  ctx.fillRect(-9, -48, 18, 44);

  ctx.strokeStyle = 'rgba(203,213,225,0.32)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-9, -48, 18, 44);

  const lights = [
    {
      color: 'red',
      y: -40,
      fill: '#dc2626',
      glow: 'rgba(248,113,113,0.32)',
    },
    {
      color: 'yellow',
      y: -26,
      fill: '#facc15',
      glow: 'rgba(250,204,21,0.28)',
    },
    {
      color: 'green',
      y: -12,
      fill: '#22c55e',
      glow: 'rgba(34,197,94,0.30)',
    },
  ];

  lights.forEach((light) => {
    const isActive = activeColor === light.color;

    if (isActive) {
      ctx.fillStyle = light.glow;
      ctx.beginPath();
      ctx.arc(0, light.y, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = isActive
      ? light.fill
      : 'rgba(30,41,59,0.95)';

    ctx.beginPath();
    ctx.arc(0, light.y, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function drawTrafficLightVisual(
  ctx,
  s,
  CANVAS_HEIGHT,
  avenueState
) {
  const band = getIntersectionBand(
    avenueState,
    CANVAS_HEIGHT
  );

  if (!band) return;

  const anchorRawY = Math.max(
    ROAD_HORIZON_Y + 30,
    band.topRawY - 12
  );

  const slice = getRoadSlice(
    anchorRawY,
    avenueState
  );

  if (slice.y < ROAD_HORIZON_Y + 10) return;

  const activeColor = getTrafficLightColor(s.frameCount);

  const opacity = Math.max(
    0.35,
    Math.min(1, band.opacity)
  );

  const scale = 0.42 + slice.t * 0.78;

  const x =
    slice.right +
    24 +
    slice.t * 22;

  const y =
    slice.y +
    18 * scale;

  ctx.save();

  ctx.globalAlpha = opacity;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 17, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#64748b';
  ctx.fillRect(-2, -58, 4, 68);

  ctx.fillRect(-2, -58, -24, 4);

  ctx.save();
  ctx.translate(-27, -49);
  drawTrafficLightHead(ctx, activeColor);
  ctx.restore();

  ctx.fillStyle = 'rgba(15,23,42,0.92)';
  ctx.fillRect(-5, -63, 8, 8);

  ctx.restore();
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

  ctx.fillStyle = `rgba(13, 18, 30, ${0.96 * opacity})`;

  ctx.beginPath();
  ctx.moveTo(-60, topY);
  ctx.lineTo(CANVAS_WIDTH + 60, topY);
  ctx.lineTo(CANVAS_WIDTH + 60, bottomY);
  ctx.lineTo(-60, bottomY);
  ctx.closePath();
  ctx.fill();

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

  ctx.fillStyle = `rgba(0,0,0,${0.24 * opacity})`;

  ctx.beginPath();
  ctx.moveTo(topSlice.left, topY);
  ctx.lineTo(topSlice.right, topY);
  ctx.lineTo(bottomSlice.right, bottomY);
  ctx.lineTo(bottomSlice.left, bottomY);
  ctx.closePath();
  ctx.fill();

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

  const midY = (topY + bottomY) / 2;

  ctx.strokeStyle = `rgba(226,232,240,${0.36 * opacity})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([22, 20]);

  ctx.beginPath();
  ctx.moveTo(-60, midY);
  ctx.lineTo(CANVAS_WIDTH + 60, midY);
  ctx.stroke();

  ctx.setLineDash([]);

  drawCrosswalk(
  ctx,
  CANVAS_HEIGHT,
  avenueState,
  'near',
  opacity * 0.72
);

drawStopLine(
  ctx,
  CANVAS_HEIGHT,
  avenueState,
  'near',
  opacity * 0.82
);

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

  ctx.fillStyle = '#171d2b';
  fillRoadShape(ctx, roadPoints);

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

  ctx.strokeStyle = 'rgba(226,232,240,0.42)';
  ctx.lineWidth = 4;

  for (let i = 1; i < LANE_COUNT; i++) {
    s.roadLines.forEach((ly) => {
      if (ly < ROAD_HORIZON_Y) return;

      const t =
        (ly - ROAD_HORIZON_Y) /
        (CANVAS_HEIGHT - ROAD_HORIZON_Y);

      const dashLength = 12 + t * 88;

      const y2 = Math.min(
        ly + dashLength,
        CANVAS_HEIGHT
      );

      const p1 = getRoadBoundaryPoint(
        i,
        ly,
        avenueState
      );

      const p2 = getRoadBoundaryPoint(
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

  drawIntersectionVisual(
    ctx,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    avenueState
  );

  drawTrafficLightVisual(
    ctx,
    s,
    CANVAS_HEIGHT,
    avenueState
  );
}