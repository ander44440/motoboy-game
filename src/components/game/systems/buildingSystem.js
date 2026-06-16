import { CANVAS_WIDTH }
from '../constants/gameConstants';

export function generateBuildings() {
  const buildings = [];

  for (let i = 0; i < 12; i++) {
    buildings.push({
      x:
        Math.random() > 0.5
          ? -30 - Math.random() * 40
          : CANVAS_WIDTH + Math.random() * 40,

      y: i * 70 - 100,

      w: 25 + Math.random() * 50,

      h: 40 + Math.random() * 140,

      color: `hsl(
        220,
        ${10 + Math.random() * 10}%,
        ${8 + Math.random() * 8}%
      )`,

      windows:
        Math.floor(
          2 + Math.random() * 6
        ),
    });
  }

  return buildings;
}