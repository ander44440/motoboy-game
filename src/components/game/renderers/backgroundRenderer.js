function pseudoRandom(seed) {
  const value =
    Math.sin(seed * 127.1 + 311.7) * 43758.5453123;

  return value - Math.floor(value);
}

function drawNightSky(
  ctx,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  horizonY
) {
  const skyGradient = ctx.createLinearGradient(
    0,
    0,
    0,
    CANVAS_HEIGHT
  );

  skyGradient.addColorStop(0, '#0b1220');
  skyGradient.addColorStop(0.28, '#13233f');
  skyGradient.addColorStop(0.58, '#18345a');
  skyGradient.addColorStop(0.82, '#102746');
  skyGradient.addColorStop(1, '#0c1a31');

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // brilho urbano distante
  const glow = ctx.createRadialGradient(
    CANVAS_WIDTH * 0.5,
    horizonY - 8,
    10,
    CANVAS_WIDTH * 0.5,
    horizonY - 8,
    CANVAS_WIDTH * 0.58
  );

  glow.addColorStop(0, 'rgba(255, 191, 94, 0.18)');
  glow.addColorStop(0.35, 'rgba(255, 191, 94, 0.10)');
  glow.addColorStop(0.7, 'rgba(96, 165, 250, 0.06)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_WIDTH, horizonY + 90);
}

function drawClouds(
  ctx,
  CANVAS_WIDTH,
  horizonY
) {
  ctx.fillStyle = 'rgba(148, 163, 184, 0.10)';

  const clouds = [
    {
      x: CANVAS_WIDTH * 0.08,
      y: horizonY * 0.44,
      w: 64,
      h: 18,
    },
    {
      x: CANVAS_WIDTH * 0.33,
      y: horizonY * 0.40,
      w: 92,
      h: 22,
    },
    {
      x: CANVAS_WIDTH * 0.22,
      y: horizonY * 0.64,
      w: 110,
      h: 18,
    },
  ];

  clouds.forEach((cloud) => {
    ctx.beginPath();
    ctx.ellipse(
      cloud.x,
      cloud.y,
      cloud.w,
      cloud.h,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}

function drawSkyline(
  ctx,
  CANVAS_WIDTH,
  horizonY
) {
  const skylineBaseY = horizonY + 18;

  // base escura baixa para fechar o horizonte
  const baseBand = ctx.createLinearGradient(
    0,
    skylineBaseY - 12,
    0,
    skylineBaseY + 42
  );

  baseBand.addColorStop(0, 'rgba(8, 15, 28, 0.55)');
  baseBand.addColorStop(1, 'rgba(8, 15, 28, 0.92)');

  ctx.fillStyle = baseBand;
  ctx.fillRect(
    0,
    skylineBaseY - 2,
    CANVAS_WIDTH,
    52
  );

  let x = -6;
  let index = 0;

  while (x < CANVAS_WIDTH + 12) {
    const width =
      18 + Math.floor(pseudoRandom(index + 0.1) * 28);

    const centerX = x + width / 2;
    const centerBias =
      1 -
      Math.min(
        1,
        Math.abs(centerX - CANVAS_WIDTH / 2) /
          (CANVAS_WIDTH / 2)
      );

    const height =
      18 +
      centerBias * 26 +
      Math.floor(
        pseudoRandom(index + 0.8) * 34
      );

    const bodyTop = skylineBaseY - height;

    const bodyColors = [
      '#0f172a',
      '#111827',
      '#162033',
      '#1b263b',
    ];

    const bodyColor =
      bodyColors[
        Math.floor(
          pseudoRandom(index + 1.3) *
            bodyColors.length
        )
      ];

    // corpo
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x, bodyTop, width, height);

    // lateral escura
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(
      x + width - 5,
      bodyTop,
      5,
      height
    );

    // topo
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(x, bodyTop, width, 2);

    // janelas
    const cols = Math.max(
      1,
      Math.floor((width - 8) / 8)
    );
    const rows = Math.max(
      1,
      Math.floor((height - 10) / 10)
    );

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const litChance = pseudoRandom(
          index * 100 + row * 13 + col * 7
        );

        if (litChance > 0.58) {
          const warm =
            litChance > 0.82
              ? '#fde68a'
              : '#fef3c7';

          ctx.fillStyle = warm;
          ctx.fillRect(
            x + 5 + col * 8,
            bodyTop + 6 + row * 10,
            3,
            5
          );
        }
      }
    }

    // detalhe de cobertura
    const roofType = Math.floor(
      pseudoRandom(index + 2.2) * 4
    );

    ctx.fillStyle = '#0b1220';

    if (roofType === 0) {
      ctx.fillRect(
        x + width * 0.25,
        bodyTop - 4,
        width * 0.5,
        4
      );
    }

    if (roofType === 1) {
      ctx.fillRect(
        x + width * 0.5 - 1,
        bodyTop - 8,
        2,
        8
      );
    }

    if (roofType === 2) {
      ctx.fillRect(
        x + width * 0.2,
        bodyTop - 3,
        width * 0.6,
        3
      );
      ctx.fillRect(
        x + width * 0.5 - 1,
        bodyTop - 8,
        2,
        5
      );
    }

    if (roofType === 3 && width > 26) {
      ctx.fillStyle = '#172234';
      ctx.fillRect(
        x + width * 0.58,
        bodyTop - 7,
        8,
        7
      );
    }

    x += width - 1;
    index++;
  }
}

function drawAtmosphericFog(
  ctx,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  horizonY
) {
  // névoa urbana sobre skyline
  const fog = ctx.createLinearGradient(
    0,
    horizonY - 8,
    0,
    horizonY + 115
  );

  fog.addColorStop(0, 'rgba(180, 210, 255, 0.10)');
  fog.addColorStop(0.38, 'rgba(180, 210, 255, 0.06)');
  fog.addColorStop(1, 'rgba(180, 210, 255, 0)');

  ctx.fillStyle = fog;
  ctx.fillRect(
    0,
    horizonY - 8,
    CANVAS_WIDTH,
    130
  );

  // faixa suave de horizonte
  const horizonGlow = ctx.createLinearGradient(
    0,
    horizonY - 1,
    0,
    horizonY + 24
  );

  horizonGlow.addColorStop(0, 'rgba(148, 163, 184, 0.10)');
  horizonGlow.addColorStop(1, 'rgba(148, 163, 184, 0)');

  ctx.fillStyle = horizonGlow;
  ctx.fillRect(
    0,
    horizonY - 2,
    CANVAS_WIDTH,
    26
  );

  // vinheta discreta inferior
  const lowerFade = ctx.createLinearGradient(
    0,
    horizonY + 30,
    0,
    CANVAS_HEIGHT
  );

  lowerFade.addColorStop(0, 'rgba(8,15,28,0)');
  lowerFade.addColorStop(1, 'rgba(8,15,28,0.14)');

  ctx.fillStyle = lowerFade;
  ctx.fillRect(
    0,
    horizonY + 30,
    CANVAS_WIDTH,
    CANVAS_HEIGHT - horizonY - 30
  );
}

export function drawBackground(
  ctx,
  CANVAS_WIDTH,
  CANVAS_HEIGHT
) {
  const horizonY = 152;

  drawNightSky(
    ctx,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    horizonY
  );

  drawClouds(
    ctx,
    CANVAS_WIDTH,
    horizonY
  );

  drawSkyline(
    ctx,
    CANVAS_WIDTH,
    horizonY
  );

  drawAtmosphericFog(
    ctx,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    horizonY
  );
}