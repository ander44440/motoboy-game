export function drawBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT) {
  // Céu urbano noturno
  const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGradient.addColorStop(0, '#121a2b');
  skyGradient.addColorStop(0.45, '#203852');
  skyGradient.addColorStop(1, '#1e3a5f');

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Brilho urbano no horizonte
  const cityGlow = ctx.createLinearGradient(0, 35, 0, 175);
  cityGlow.addColorStop(0, 'rgba(245, 158, 11, 0.13)');
  cityGlow.addColorStop(0.45, 'rgba(59, 130, 246, 0.10)');
  cityGlow.addColorStop(1, 'rgba(30, 58, 95, 0)');

  ctx.fillStyle = cityGlow;
  ctx.fillRect(0, 30, CANVAS_WIDTH, 160);

  // Nuvens / poluição luminosa
  ctx.fillStyle = 'rgba(148, 163, 184, 0.13)';

  ctx.beginPath();
  ctx.ellipse(70, 72, 80, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(295, 68, 105, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(205, 104, 125, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Linha escura da cidade distante
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.fillRect(0, 120, CANVAS_WIDTH, 12);

  const drawBuilding = (b, index, baseY, alpha = 1) => {
    ctx.fillStyle = `rgba(17, 24, 39, ${alpha})`;

    ctx.fillRect(
      b.x,
      baseY - b.h,
      b.w,
      b.h
    );

    // Antena
    if (b.h > 100) {
      ctx.fillStyle = `rgba(55, 65, 81, ${alpha})`;
      ctx.fillRect(
        b.x + b.w / 2,
        baseY - b.h - 15,
        2,
        15
      );
    }

    // Janelas
    ctx.fillStyle = `rgba(254, 240, 138, ${0.78 * alpha})`;

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

  // Camada distante à esquerda
  const farLeft = [
    { x: -6, w: 30, h: 48 },
    { x: 22, w: 34, h: 58 },
    { x: 54, w: 28, h: 44 },
    { x: 80, w: 36, h: 64 },
    { x: 114, w: 30, h: 52 },
  ];

  // Camada distante à direita, equilibrada com a esquerda
  const farRight = farLeft.map((b) => ({
    x: CANVAS_WIDTH - b.x - b.w,
    w: b.w,
    h: b.h,
  }));

  farLeft.forEach((b, index) => {
    drawBuilding(b, index, 118, 0.62);
  });

  farRight.forEach((b, index) => {
    drawBuilding(b, index + 20, 118, 0.62);
  });

  // Skyline principal à esquerda
  const leftCity = [
    { x: -8, w: 34, h: 82 },
    { x: 20, w: 40, h: 104 },
    { x: 54, w: 32, h: 92 },
    { x: 82, w: 42, h: 118 },
    { x: 118, w: 34, h: 84 },
    { x: 148, w: 34, h: 98 },
  ];

  // Skyline principal à direita espelhado da esquerda
  const rightCity = leftCity.map((b) => ({
    x: CANVAS_WIDTH - b.x - b.w,
    w: b.w,
    h: b.h,
  }));

  leftCity.forEach((b, index) => {
    drawBuilding(b, index, 130, 1);
  });

  rightCity.forEach((b, index) => {
    drawBuilding(b, index + 30, 130, 1);
  });

  // Prédios médios próximos à abertura da estrada
  // Mantém a cidade "abraçando" a avenida sem tampar a pista
  const nearRoadRight = [
    { x: 238, w: 24, h: 64 },
    { x: 266, w: 30, h: 86 },
    { x: 302, w: 28, h: 72 },
    { x: 334, w: 34, h: 98 },
  ];

  const nearRoadLeft = [
    { x: 130, w: 26, h: 62 },
    { x: 100, w: 28, h: 84 },
  ];

  nearRoadLeft.forEach((b, index) => {
    drawBuilding(b, index + 50, 150, 0.82);
  });

  nearRoadRight.forEach((b, index) => {
    drawBuilding(b, index + 60, 150, 0.88);
  });

  // Névoa baixa entre cidade e estrada
  const horizonFog = ctx.createLinearGradient(0, 108, 0, 182);
  horizonFog.addColorStop(0, 'rgba(148, 163, 184, 0)');
  horizonFog.addColorStop(0.5, 'rgba(148, 163, 184, 0.15)');
  horizonFog.addColorStop(1, 'rgba(148, 163, 184, 0)');

  ctx.fillStyle = horizonFog;
  ctx.fillRect(0, 105, CANVAS_WIDTH, 85);
}