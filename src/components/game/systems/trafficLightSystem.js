export const TRAFFIC_LIGHT_STATES = {
  GREEN: 'green',
  YELLOW: 'yellow',
  RED: 'red',
};

export function getTrafficLightState(frameCount) {
  const cycle = frameCount % 260;

  if (cycle < 120) {
    return {
      color: TRAFFIC_LIGHT_STATES.GREEN,
      label: 'verde',
      shouldStop: false,
      shouldSlowDown: false,
      cycle,
    };
  }

  if (cycle < 170) {
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