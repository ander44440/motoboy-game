export function drawBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT) {
  // Background
  const skyGradient = ctx.createLinearGradient(
    0,
    0,
    0,
    CANVAS_HEIGHT
  );

  skyGradient.addColorStop(0, '#1e3a5f');
  skyGradient.addColorStop(0.4, '#2b4c7e');
  skyGradient.addColorStop(1, '#0a0e17');

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Névoa atmosférica
  const fogGradient = ctx.createLinearGradient(
    0,
    0,
    0,
    220
  );

  fogGradient.addColorStop(
    0,
    'rgba(180,220,255,0.18)'
  );

  fogGradient.addColorStop(
    1,
    'rgba(180,220,255,0)'
  );

  ctx.fillStyle = fogGradient;
  ctx.fillRect(
    0,
    0,
    CANVAS_WIDTH,
    220
  );

  // Horizonte urbano
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(
    0,
    60,
    CANVAS_WIDTH,
    50
  );

  // Silhueta de prédios
  ctx.fillStyle = '#111827';

  for (let i = 0; i < 12; i++) {
    const w = 40 + (i % 3) * 20;
    const h = 20 + (i % 4) * 15;

    ctx.fillRect(
      i * 80,
      110 - h,
      w,
      h
    );
  }

  // Brilho urbano distante
  for (let i = 0; i < 25; i++) {
    ctx.fillStyle =
      'rgba(255,220,120,0.25)';

    ctx.beginPath();

    ctx.arc(
      50 + i * 35,
      95 + Math.sin(i) * 8,
      1.5,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }
}