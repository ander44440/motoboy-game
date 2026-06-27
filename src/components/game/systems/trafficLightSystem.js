export const TRAFFIC_LIGHT_STATES = {
  GREEN: 'green',
  YELLOW: 'yellow',
  RED: 'red',
};

const GREEN_DURATION = 120;
const YELLOW_DURATION = 50;

// Vermelho anterior era 90 frames.
// +300 frames ≈ +5 segundos em 60 FPS.
const RED_DURATION = 390;

const TOTAL_CYCLE =
  GREEN_DURATION + YELLOW_DURATION + RED_DURATION;

export function getTrafficLightState(frameCount) {
  const cycle = frameCount % TOTAL_CYCLE;

  if (cycle < GREEN_DURATION) {
    return {
      color: TRAFFIC_LIGHT_STATES.GREEN,
      label: 'verde',
      shouldStop: false,
      shouldSlowDown: false,
      cycle,
    };
  }

  if (cycle < GREEN_DURATION + YELLOW_DURATION) {
    return {
      color: TRAFFIC_LIGHT_STATES.YELLOW,
      label: 'amarelo',
      shouldStop: false,
      shouldSlowDown: true,
      cycle,
    };
  }

  return {
    color: TRAFFIC_LIGHT_STATES.RED,
    label: 'vermelho',
    shouldStop: true,
    shouldSlowDown: false,
    cycle,
  };
}