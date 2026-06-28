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

  skyGradient.addColorStop(0, '#070d1a');
  skyGradient.addColorStop(0.24, '#0f1d35');
  skyGradient.addColorStop(0.48, '#173158');
  skyGradient.addColorStop(0.72, '#102846');
  skyGradient.addColorStop(1, '#091426');

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Brilho urbano distante, como luz da cidade refletindo no céu.
  const glow = ctx.createRadialGradient(
    CANVAS_WIDTH * 0.5,
    horizonY - 4,
    8,
    CANVAS_WIDTH * 0.5,
    horizonY - 4,
    CANVAS_WIDTH * 0.66
  );

    glow.addColorStop(0, 'rgba(255, 190, 104, 0.14)');
  glow.addColorStop(0.32, 'rgba(255, 190, 104, 0.075)');
  glow.addColorStop(0.62, 'rgba(96, 165, 250, 0.045)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_WIDTH, horizonY + 110);
}

function drawClouds(
  ctx,
  CANVAS_WIDTH,
  horizonY
) {
  const clouds = [
    {
      x: CANVAS_WIDTH * 0.08,
      y: horizonY * 0.42,
      w: 64,
      h: 16,
      alpha: 0.08,
    },
    {
      x: CANVAS_WIDTH * 0.36,
      y: horizonY * 0.36,
      w: 92,
      h: 20,
      alpha: 0.075,
    },
    {
      x: CANVAS_WIDTH * 0.23,
      y: horizonY * 0.62,
      w: 116,
      h: 18,
      alpha: 0.065,
    },
    {
      x: CANVAS_WIDTH * 0.74,
      y: horizonY * 0.52,
      w: 96,
      h: 17,
      alpha: 0.06,
    },
  ];

  clouds.forEach((cloud) => {
    ctx.fillStyle = `rgba(148, 163, 184, ${cloud.alpha})`;

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

function drawBuildingWindows(
  ctx,
  x,
  top,
  width,
  height,
  seed,
  alpha
) {
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
        seed * 1000 + row * 31 + col * 17
      );

      if (litChance < 0.78) continue;

      const isWarm = litChance > 0.78;

      ctx.fillStyle = isWarm
        ? `rgba(253, 230, 138, ${alpha})`
        : `rgba(191, 219, 254, ${alpha * 0.48})`;

      ctx.fillRect(
        x + 5 + col * 8,
        top + 7 + row * 10,
        3,
        5
      );
    }
  }
}

function drawBuildingRoof(
  ctx,
  x,
  top,
  width,
  seed,
  color
) {
  const roofType = Math.floor(
    pseudoRandom(seed + 9.4) * 5
  );

  ctx.fillStyle = color;

  if (roofType === 0) {
    ctx.fillRect(
      x + width * 0.22,
      top - 4,
      width * 0.56,
      4
    );
  }

  if (roofType === 1) {
    ctx.fillRect(
      x + width * 0.5 - 1,
      top - 9,
      2,
      9
    );
  }

  if (roofType === 2) {
    ctx.fillRect(
      x + width * 0.16,
      top - 3,
      width * 0.68,
      3
    );

    ctx.fillRect(
      x + width * 0.5 - 1,
      top - 8,
      2,
      5
    );
  }

  if (roofType === 3 && width > 24) {
    ctx.fillRect(
      x + width * 0.56,
      top - 7,
      8,
      7
    );
  }

  if (roofType === 4 && width > 28) {
    ctx.beginPath();
    ctx.moveTo(x + width * 0.2, top);
    ctx.lineTo(x + width * 0.5, top - 7);
    ctx.lineTo(x + width * 0.8, top);
    ctx.closePath();
    ctx.fill();
  }
}

function drawSkylineLayer(
  ctx,
  CANVAS_WIDTH,
  baseY,
  options
) {
  const {
    seedOffset,
    startX,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    colorSet,
    windowAlpha,
    bodyAlpha,
    sideShadowAlpha,
    roofColor,
    gap,
    centerBoost,
  } = options;

  let x = startX;
  let index = 0;

  while (x < CANVAS_WIDTH + maxWidth) {
    const seed = index + seedOffset;

    const width =
      minWidth +
      Math.floor(
        pseudoRandom(seed + 0.2) *
          (maxWidth - minWidth)
      );

    const centerX = x + width / 2;

    const centerBias =
      1 -
      Math.min(
        1,
        Math.abs(centerX - CANVAS_WIDTH / 2) /
          (CANVAS_WIDTH / 2)
      );

    const height =
      minHeight +
      Math.floor(
        pseudoRandom(seed + 0.8) *
          (maxHeight - minHeight)
      ) +
      centerBias * centerBoost;

    const top = baseY - height;

    const color =
      colorSet[
        Math.floor(
          pseudoRandom(seed + 1.7) *
            colorSet.length
        )
      ];

    ctx.globalAlpha = bodyAlpha;
    ctx.fillStyle = color;
    ctx.fillRect(
      x,
      top,
      width,
      height
    );

    // Sombra lateral para dar volume.
    ctx.globalAlpha = sideShadowAlpha;
    ctx.fillStyle = '#000000';
    ctx.fillRect(
      x + width - Math.max(4, width * 0.16),
      top,
      Math.max(4, width * 0.16),
      height
    );

    // Linha de topo discreta.
    ctx.globalAlpha = bodyAlpha * 0.65;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(
      x,
      top,
      width,
      2
    );

    ctx.globalAlpha = 1;

    drawBuildingWindows(
      ctx,
      x,
      top,
      width,
      height,
      seed,
      windowAlpha
    );

    drawBuildingRoof(
      ctx,
      x,
      top,
      width,
      seed,
      roofColor
    );

    x += width + gap;
    index++;
  }

  ctx.globalAlpha = 1;
}

function drawHorizonBase(
  ctx,
  CANVAS_WIDTH,
  horizonY
) {
  const baseY = horizonY + 26;

  const baseBand = ctx.createLinearGradient(
    0,
    horizonY - 10,
    0,
    baseY + 64
  );

  baseBand.addColorStop(0, 'rgba(8, 15, 28, 0.34)');
  baseBand.addColorStop(0.42, 'rgba(8, 15, 28, 0.82)');
  baseBand.addColorStop(1, 'rgba(8, 15, 28, 0.98)');

  ctx.fillStyle = baseBand;
  ctx.fillRect(
    0,
    horizonY - 4,
    CANVAS_WIDTH,
    96
  );
}

function drawSmallCityLights(
  ctx,
  CANVAS_WIDTH,
  horizonY
) {
    for (let i = 0; i < 22; i++) {
    const x =
      pseudoRandom(i + 60.2) * CANVAS_WIDTH;

    const y =
      horizonY +
      8 +
      pseudoRandom(i + 61.8) * 42;

    const size =
      1 +
      pseudoRandom(i + 62.4) * 2;

        const alpha =
      0.08 +
      pseudoRandom(i + 63.7) * 0.16;

    ctx.fillStyle =
      pseudoRandom(i + 64.4) > 0.5
        ? `rgba(253, 230, 138, ${alpha})`
        : `rgba(147, 197, 253, ${alpha * 0.8})`;

    ctx.fillRect(
      x,
      y,
      size,
      size
    );
  }
}

function drawSkyline(
  ctx,
  CANVAS_WIDTH,
  horizonY
) {
  drawHorizonBase(
    ctx,
    CANVAS_WIDTH,
    horizonY
  );

  // Camada distante: mais azulada, mais baixa e mais apagada.
  drawSkylineLayer(
    ctx,
    CANVAS_WIDTH,
    horizonY + 36,
    {
      seedOffset: 100,
      startX: -24,
      minWidth: 16,
      maxWidth: 34,
      minHeight: 18,
      maxHeight: 46,
      colorSet: [
        '#0b1324',
        '#0d1a2e',
        '#10213a',
        '#12243f',
      ],
      windowAlpha: 0.18,
      bodyAlpha: 0.72,
      sideShadowAlpha: 0.18,
      roofColor: '#08111f',
      gap: -1,
      centerBoost: 10,
    }
  );

  // Camada principal: fecha o horizonte e dá presença de cidade.
  drawSkylineLayer(
    ctx,
    CANVAS_WIDTH,
    horizonY + 48,
    {
      seedOffset: 200,
      startX: -8,
      minWidth: 20,
      maxWidth: 48,
      minHeight: 36,
      maxHeight: 86,
      colorSet: [
        '#0f172a',
        '#111827',
        '#172033',
        '#1b263b',
        '#111c2f',
      ],
      windowAlpha: 0.28,
      bodyAlpha: 0.9,
      sideShadowAlpha: 0.24,
      roofColor: '#07101f',
      gap: -2,
      centerBoost: 22,
    }
  );

  // Camada baixa: massa urbana na base, como bairros/prédios menores.
  drawSkylineLayer(
    ctx,
    CANVAS_WIDTH,
    horizonY + 62,
    {
      seedOffset: 300,
      startX: -18,
      minWidth: 24,
      maxWidth: 58,
      minHeight: 18,
      maxHeight: 44,
      colorSet: [
        '#0a1220',
        '#0d1728',
        '#101827',
        '#111827',
      ],
      windowAlpha: 0.12,
      bodyAlpha: 0.88,
      sideShadowAlpha: 0.16,
      roofColor: '#070d18',
      gap: -3,
      centerBoost: 8,
    }
  );

  drawSmallCityLights(
    ctx,
    CANVAS_WIDTH,
    horizonY
  );
}

function drawAtmosphericFog(
  ctx,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  horizonY
) {
  // Névoa urbana sobre skyline.
  const fog = ctx.createLinearGradient(
    0,
    horizonY - 14,
    0,
    horizonY + 126
  );

    fog.addColorStop(0, 'rgba(191, 219, 254, 0.085)');
  fog.addColorStop(0.38, 'rgba(191, 219, 254, 0.052)');
  fog.addColorStop(0.72, 'rgba(15, 23, 42, 0.04)');
  fog.addColorStop(1, 'rgba(15, 23, 42, 0)');

  ctx.fillStyle = fog;
  ctx.fillRect(
    0,
    horizonY - 16,
    CANVAS_WIDTH,
    142
  );

  // Brilho fino na linha do horizonte.
  const horizonGlow = ctx.createLinearGradient(
    0,
    horizonY - 2,
    0,
    horizonY + 30
  );

    horizonGlow.addColorStop(0, 'rgba(253, 230, 138, 0.055)');
  horizonGlow.addColorStop(0.44, 'rgba(147, 197, 253, 0.04)');
  horizonGlow.addColorStop(1, 'rgba(147, 197, 253, 0)');

  ctx.fillStyle = horizonGlow;
  ctx.fillRect(
    0,
    horizonY - 3,
    CANVAS_WIDTH,
    34
  );

  // Vinheta inferior leve para unir céu/cidade/pista.
  const lowerFade = ctx.createLinearGradient(
    0,
    horizonY + 36,
    0,
    CANVAS_HEIGHT
  );

  lowerFade.addColorStop(0, 'rgba(8, 15, 28, 0)');
  lowerFade.addColorStop(1, 'rgba(8, 15, 28, 0.16)');

  ctx.fillStyle = lowerFade;
  ctx.fillRect(
    0,
    horizonY + 36,
    CANVAS_WIDTH,
    CANVAS_HEIGHT - horizonY - 36
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