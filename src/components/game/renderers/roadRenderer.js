export function drawRoad(
  ctx,
  s,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LANE_COUNT
) {
  const horizonY = 152;

  const roadBottomLeft = 40;
  const roadBottomRight = CANVAS_WIDTH - 40;

  // Mesmo ponto de fuga do projectionSystem
  const roadTopLeft = CANVAS_WIDTH * 0.462;
  const roadTopRight = CANVAS_WIDTH * 0.538;

  // Solo urbano escuro ao redor da pista
  const groundGradient = ctx.createLinearGradient(
    0,
    horizonY,
    0,
    CANVAS_HEIGHT
  );

  groundGradient.addColorStop(0, 'rgba(15, 23, 42, 0.35)');
  groundGradient.addColorStop(1, 'rgba(15, 23, 42, 0.05)');

  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, horizonY, CANVAS_WIDTH, CANVAS_HEIGHT - horizonY);

  // Asfalto principal
  ctx.fillStyle = '#171d2b';

  ctx.beginPath();
  ctx.moveTo(roadTopLeft, horizonY);
  ctx.lineTo(roadTopRight, horizonY);
  ctx.lineTo(roadBottomRight, CANVAS_HEIGHT);
  ctx.lineTo(roadBottomLeft, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Leve sombra central do asfalto
  const asphaltShade = ctx.createLinearGradient(
    0,
    horizonY,
    0,
    CANVAS_HEIGHT
  );

  asphaltShade.addColorStop(0, 'rgba(255,255,255,0.02)');
  asphaltShade.addColorStop(1, 'rgba(0,0,0,0.18)');

  ctx.fillStyle = asphaltShade;

  ctx.beginPath();
  ctx.moveTo(roadTopLeft, horizonY);
  ctx.lineTo(roadTopRight, horizonY);
  ctx.lineTo(roadBottomRight, CANVAS_HEIGHT);
  ctx.lineTo(roadBottomLeft, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Textura do asfalto dentro da pista
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;

  for (let i = 0; i < 90; i++) {
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

  // Bordas externas amarelas
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(roadTopLeft, horizonY);
  ctx.lineTo(roadBottomLeft, CANVAS_HEIGHT);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(roadTopRight, horizonY);
  ctx.lineTo(roadBottomRight, CANVAS_HEIGHT);
  ctx.stroke();

  // Brilho discreto nas bordas
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.25)';
  ctx.lineWidth = 8;

  ctx.beginPath();
  ctx.moveTo(roadTopLeft, horizonY);
  ctx.lineTo(roadBottomLeft, CANVAS_HEIGHT);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(roadTopRight, horizonY);
  ctx.lineTo(roadBottomRight, CANVAS_HEIGHT);
  ctx.stroke();

  // Faixas internas
  ctx.strokeStyle = 'rgba(226,232,240,0.42)';
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

      const size =
        9 + t * 72;

      ctx.beginPath();
      ctx.moveTo(x, ly);
      ctx.lineTo(x, ly + size);
      ctx.stroke();
    });
  }
}