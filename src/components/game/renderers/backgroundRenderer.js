export function drawBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT) {
  // Céu urbano noturno
  const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGradient.addColorStop(0, '#172033');
  skyGradient.addColorStop(0.45, '#223b55');
  skyGradient.addColorStop(1, '#1e3a5f');

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Brilho urbano no horizonte
  const cityGlow = ctx.createLinearGradient(0, 40, 0, 170);
  cityGlow.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
  cityGlow.addColorStop(0.45, 'rgba(59, 130, 246, 0.10)');
  cityGlow.addColorStop(1, 'rgba(30, 58, 95, 0)');

  ctx.fillStyle = cityGlow;
  ctx.fillRect(0, 35, CANVAS_WIDTH, 150);

  // Nuvens urbanas / poluição luminosa
  ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';

  ctx.beginPath();
  ctx.ellipse(70, 72, 75, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(315, 68, 95, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(220, 102, 120, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base urbana distante
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.fillRect(0, 120, CANVAS_WIDTH, 12);

  // Prédios da esquerda — referência principal
  const leftBuildings = [
    { x: -8, w: 34, h: 72 },
    { x: 20, w: 40, h: 94 },
    { x: 54, w: 32, h: 82 },
    { x: 82, w: 42, h: 108 },
    { x: 118, w: 34, h: 74 },
    { x: 148, w: 34, h: 88 },
  ];

  // Prédios da direita — espelhados a partir da esquerda
  const rightBuildings = leftBuildings.map((b) => ({
    x: CANVAS_WIDTH - b.x - b.w,
    w: b.w,
    h: b.h,
  }));

  const drawBuilding = (b, index, baseY) => {
    ctx.fillStyle = '#111827';

    ctx.fillRect(
      b.x,
      baseY - b.h,
      b.w,
      b.h
    );

    // Antena
    if (b.h > 100) {
      ctx.fillStyle = '#374151';
      ctx.fillRect(
        b.x + b.w / 2,
        baseY - b.h - 16,
        2,
        16
      );
    }

    // Janelas
    ctx.fillStyle = 'rgba(254, 240, 138, 0.82)';

    for (let row = 0; row < Math.floor(b.h / 16); row++) {
      for (let col = 0; col < Math.floor(b.w / 12); col++) {
        const lit =
          (row + col + index) % 4 !== 0;

        if (lit) {
          ctx.fillRect(
            b.x + 5 + col * 12,
            baseY - b.h + 8 + row * 16,
            3,
            6
          );
        }
      }
    }
  };

  // Desenha prédios dos dois lados com a mesma referência visual
  leftBuildings.forEach((b, index) => {
    drawBuilding(b, index, 128);
  });

  rightBuildings.forEach((b, index) => {
    drawBuilding(b, index + 10, 128);
  });

  // Camada distante extra, também espelhada
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';

  const smallLeftBuildings = [
    { x: 8, w: 26, h: 38 },
    { x: 38, w: 30, h: 50 },
    { x: 72, w: 24, h: 44 },
    { x: 106, w: 28, h: 56 },
  ];

  const smallRightBuildings = smallLeftBuildings.map((b) => ({
    x: CANVAS_WIDTH - b.x - b.w,
    w: b.w,
    h: b.h,
  }));

  smallLeftBuildings.forEach((b) => {
    const baseY = 118;
    ctx.fillRect(b.x, baseY - b.h, b.w, b.h);
  });

  smallRightBuildings.forEach((b) => {
    const baseY = 118;
    ctx.fillRect(b.x, baseY - b.h, b.w, b.h);
  });

  // Névoa entre cidade e estrada
  const horizonFog = ctx.createLinearGradient(0, 105, 0, 185);
  horizonFog.addColorStop(0, 'rgba(148, 163, 184, 0)');
  horizonFog.addColorStop(0.55, 'rgba(148, 163, 184, 0.12)');
  horizonFog.addColorStop(1, 'rgba(148, 163, 184, 0)');

  ctx.fillStyle = horizonFog;
  ctx.fillRect(0, 100, CANVAS_WIDTH, 90);
}