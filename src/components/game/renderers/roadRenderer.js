export function drawRoad(
  ctx,
  s,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LANE_COUNT
) {
  const horizonY = 155;

  const roadBottomLeft = 40;
  const roadBottomRight = CANVAS_WIDTH - 40;

  // topo mais estreito
  const roadTopLeft = CANVAS_WIDTH * 0.465;
  const roadTopRight = CANVAS_WIDTH * 0.535;

  // Asfalto
  ctx.fillStyle = '#1a1f2e';

  ctx.beginPath();
  ctx.moveTo(roadTopLeft, horizonY);
  ctx.lineTo(roadTopRight, horizonY);
  ctx.lineTo(roadBottomRight, CANVAS_HEIGHT);
  ctx.lineTo(roadBottomLeft, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Textura do asfalto dentro da pista
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;

  for (let i = 0; i < 80; i++) {
    const rawT = Math.random();

    const y =
      horizonY +
      rawT * (CANVAS_HEIGHT - horizonY);

    const left =
      roadTopLeft +
      (roadBottomLeft - roadTopLeft) * rawT;

    const right =
      roadTopRight +
      (roadBottomRight - roadTopRight) * rawT;

    const x =
      left +
      Math.random() * (right - left);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 2, y + 2);
    ctx.stroke();
  }

  // Bordas
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(roadTopLeft, horizonY);
  ctx.lineTo(roadBottomLeft, CANVAS_HEIGHT);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(roadTopRight, horizonY);
  ctx.lineTo(roadBottomRight, CANVAS_HEIGHT);
  ctx.stroke();

  // Faixas
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 4;

  for (let i = 1; i < LANE_COUNT; i++) {
    const topX =
      roadTopLeft +
      ((roadTopRight - roadTopLeft) / LANE_COUNT) * i;

    const bottomX =
      roadBottomLeft +
      ((roadBottomRight - roadBottomLeft) / LANE_COUNT) * i;

    s.roadLines.forEach((ly) => {
      if (ly < horizonY) return;

      const t =
        (ly - horizonY) /
        (CANVAS_HEIGHT - horizonY);

      const x =
        topX +
        (bottomX - topX) * t;

      const size = 10 + t * 70;

      ctx.beginPath();
      ctx.moveTo(x, ly);
      ctx.lineTo(x, ly + size);
      ctx.stroke();
    });
  }
}