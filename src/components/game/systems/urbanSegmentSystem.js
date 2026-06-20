export const AVENUE_SEGMENT_TYPES = {
  STRAIGHT: 'straight',
  CURVE_LEFT: 'curve_left',
  CURVE_RIGHT: 'curve_right',
  INTERSECTION_APPROACH: 'intersection_approach',
  INTERSECTION: 'intersection',
  INTERSECTION_EXIT: 'intersection_exit',
};

const AVENUE_SEQUENCE = [
  {
    type: AVENUE_SEGMENT_TYPES.CURVE_RIGHT,
    length: 1400,
    curve: 1,
  },
  {
    type: AVENUE_SEGMENT_TYPES.STRAIGHT,
    length: 900,
    curve: 0,
  },
  {
    type: AVENUE_SEGMENT_TYPES.CURVE_LEFT,
    length: 1300,
    curve: -1,
  },
  {
    type: AVENUE_SEGMENT_TYPES.STRAIGHT,
    length: 900,
    curve: 0,
  },
  {
    type: AVENUE_SEGMENT_TYPES.INTERSECTION_APPROACH,
    length: 650,
    curve: 0,
  },
  {
    type: AVENUE_SEGMENT_TYPES.INTERSECTION,
    length: 360,
    curve: 0,
  },
  {
    type: AVENUE_SEGMENT_TYPES.INTERSECTION_EXIT,
    length: 650,
    curve: 0,
  },
];

const AVENUE_CYCLE_LENGTH = AVENUE_SEQUENCE.reduce(
  (total, segment) => total + segment.length,
  0
);

function positiveModulo(value, max) {
  return ((value % max) + max) % max;
}

function smoothStep(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function getSegmentAtDistance(distance) {
  const cycleDistance = positiveModulo(
    distance,
    AVENUE_CYCLE_LENGTH
  );

  let cursor = 0;

  for (let i = 0; i < AVENUE_SEQUENCE.length; i++) {
    const segment = AVENUE_SEQUENCE[i];
    const start = cursor;
    const end = cursor + segment.length;

    if (cycleDistance >= start && cycleDistance < end) {
      const localDistance = cycleDistance - start;
      const progress = localDistance / segment.length;
      const next =
        AVENUE_SEQUENCE[(i + 1) % AVENUE_SEQUENCE.length];

      return {
        ...segment,
        index: i,
        start,
        end,
        localDistance,
        progress,
        nextType: next.type,
      };
    }

    cursor = end;
  }

  const fallback = AVENUE_SEQUENCE[0];

  return {
    ...fallback,
    index: 0,
    start: 0,
    end: fallback.length,
    localDistance: 0,
    progress: 0,
    nextType: AVENUE_SEQUENCE[1].type,
  };
}

export function getAvenueSegmentState(distance) {
  const currentSegment = getSegmentAtDistance(distance);
  const segmentAhead = getSegmentAtDistance(distance + 620);

  const isIntersectionNear =
    segmentAhead.type ===
      AVENUE_SEGMENT_TYPES.INTERSECTION_APPROACH ||
    segmentAhead.type === AVENUE_SEGMENT_TYPES.INTERSECTION;

  return {
    distance,
    cycleLength: AVENUE_CYCLE_LENGTH,
    currentSegment,
    segmentAhead,
    type: currentSegment.type,
    progress: currentSegment.progress,
    nextType: currentSegment.nextType,
    isIntersectionNear,
  };
}

export function getCurveFactorForSegment(segment) {
  if (!segment || !segment.curve) return 0;

  const rampIn = smoothStep(segment.progress / 0.28);
  const rampOut =
    1 - smoothStep((segment.progress - 0.72) / 0.28);

  return segment.curve * rampIn * rampOut;
}

export function getAvenueCurveFactorAtY(
  avenueState,
  y
) {
  // Sem estado urbano, mantém a curva antiga como padrão.
  if (!avenueState) return 1;

  const segment = getSegmentAtDistance(
    avenueState.distance + y
  );

  return getCurveFactorForSegment(segment);
}