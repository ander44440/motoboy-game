export function drawRoad(
  ctx,
  s,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LANE_COUNT
) {
  const roadBottomLeft = 40;
  const roadBottomRight = CANVAS_WIDTH - 40;

  const roadTopLeft = CANVAS_WIDTH * 0.35;
  const roadTopRight = CANVAS_WIDTH * 0.65;

  // Asfalto
  ctx.fillStyle = '#1a1f2e';

  ctx.beginPath();
  ctx.moveTo(roadTopLeft, 0);
  ctx.lineTo(roadTopRight, 0);
  ctx.lineTo(roadBottomRight, CANVAS_HEIGHT);
  ctx.lineTo(roadBottomLeft, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Textura do asfalto
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;

  for (let i = 0; i < 80; i++) {
    const x =
      roadBottomLeft +
      Math.random() * (roadBottomRight - roadBottomLeft);

    const y = Math.random() * CANVAS_HEIGHT;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 2, y + 2);
    ctx.stroke();
  }

  // Bordas
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(roadTopLeft, 0);
  ctx.lineTo(roadBottomLeft, CANVAS_HEIGHT);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(roadTopRight, 0);
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
      const t = ly / CANVAS_HEIGHT;

      const x =
        topX +
        (bottomX - topX) * t;

      const size = 15 + t * 65;

      ctx.beginPath();
      ctx.moveTo(x, ly);
      ctx.lineTo(x, ly + size);
      ctx.stroke();
    });
  }
}