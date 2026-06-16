export function generateSceneryObjects() {
  return Array.from({ length: 12 }, (_, i) => {
    const type = i % 3;

    let velocity = 0.8;
    if (type === 0) velocity = 1.4;
    if (type === 1) velocity = 1.1;
    if (type === 2) velocity = 0.7;

    return {
      side: i % 2 === 0 ? -0.9 : 2.9,
      type,
      velocity,
      y: -250 + i * 180,
    };
  });
}

export function updateSceneryObjects(
  sceneryObjects,
  speed,
  CANVAS_HEIGHT
) {
  sceneryObjects.forEach((obj) => {
    obj.y += speed * obj.velocity;

    if (obj.y > CANVAS_HEIGHT + 250) {
      obj.y = -250;
    }
  });
}