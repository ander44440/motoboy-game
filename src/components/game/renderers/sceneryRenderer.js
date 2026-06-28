import {
  ROAD_HORIZON_Y,
  getRoadSlice,
} from '../systems/projectionSystem';

function getSidewalkWidth(t) {
  return 16 + t * 58;
}

function drawUrbanSidewalks(
  ctx,
  CANVAS_HEIGHT,
  avenueState
) {
  const steps = 28;

  const leftInner = [];
  const leftOuter = [];
  const rightInner = [];
  const rightOuter = [];

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;

    const rawY =
      ROAD_HORIZON_Y +
      (CANVAS_HEIGHT - ROAD_HORIZON_Y) *
        progress;

    const slice = getRoadSlice(
      rawY,
      avenueState
    );

    const width = getSidewalkWidth(slice.t);

    leftInner.push({
      x: slice.left - 4,
      y: slice.y,
    });

    leftOuter.push({
      x: slice.left - width,
      y: slice.y,
    });

    rightInner.push({
      x: slice.right + 4,
      y: slice.y,
    });

    rightOuter.push({
      x: slice.right + width,
      y: slice.y,
    });
  }

  // Calçada esquerda
  ctx.fillStyle = 'rgba(45, 64, 82, 0.75)';
  ctx.beginPath();

  ctx.moveTo(leftInner[0].x, leftInner[0].y);

  leftInner.forEach((point) => {
    ctx.lineTo(point.x, point.y);
  });

  for (let i = leftOuter.length - 1; i >= 0; i--) {
    ctx.lineTo(leftOuter[i].x, leftOuter[i].y);
  }

  ctx.closePath();
  ctx.fill();

  // Calçada direita
  ctx.beginPath();

  ctx.moveTo(rightInner[0].x, rightInner[0].y);

  rightInner.forEach((point) => {
    ctx.lineTo(point.x, point.y);
  });

  for (let i = rightOuter.length - 1; i >= 0; i--) {
    ctx.lineTo(rightOuter[i].x, rightOuter[i].y);
  }

  ctx.closePath();
  ctx.fill();

  // Meio-fio esquerdo
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.28)';
  ctx.lineWidth = 2;

  ctx.beginPath();

  leftInner.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.stroke();

  // Meio-fio direito
  ctx.beginPath();

  rightInner.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.stroke();

  // Divisões discretas das calçadas
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  ctx.lineWidth = 1;

  for (
    let rawY = ROAD_HORIZON_Y + 80;
    rawY < CANVAS_HEIGHT;
    rawY += 95
  ) {
    const slice = getRoadSlice(
      rawY,
      avenueState
    );

    const next = getRoadSlice(
      rawY + 34,
      avenueState
    );

    const width = getSidewalkWidth(slice.t);
    const nextWidth = getSidewalkWidth(next.t);

    ctx.beginPath();
    ctx.moveTo(slice.left - 12, slice.y);
    ctx.lineTo(
      next.left - nextWidth + 10,
      next.y
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(slice.right + 12, slice.y);
    ctx.lineTo(
      next.right + nextWidth - 10,
      next.y
    );
    ctx.stroke();
  }
}

function drawStreetLight(ctx) {
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-3, -52, 6, 74);

  ctx.fillRect(0, -52, 18, 4);

  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.ellipse(21, -50, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(250, 204, 21, 0.18)';
  ctx.beginPath();
  ctx.arc(21, -50, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawTrafficSign(ctx, index) {
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-2, -34, 4, 56);

  const colors = ['#2563eb', '#16a34a', '#dc2626'];
  ctx.fillStyle = colors[index % colors.length];

  ctx.fillRect(-22, -58, 44, 24);

  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-22, -58, 44, 24);

  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillRect(-14, -49, 28, 3);
  ctx.fillRect(-10, -42, 20, 3);
}

function drawUrbanTree(ctx) {
  ctx.fillStyle = '#6b4f2d';
  ctx.fillRect(-4, -24, 8, 34);

  ctx.fillStyle = '#15803d';

  ctx.beginPath();
  ctx.arc(0, -38, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-12, -29, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(12, -29, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.arc(-5, -44, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawBusStop(ctx) {
  ctx.fillStyle = '#334155';
  ctx.fillRect(-24, 10, 48, 5);

  ctx.fillStyle = '#64748b';
  ctx.fillRect(-20, -42, 4, 52);
  ctx.fillRect(16, -42, 4, 52);
  ctx.fillRect(-24, -46, 48, 5);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-28, -55, 56, 10);

  ctx.fillStyle = 'rgba(96, 165, 250, 0.35)';
  ctx.fillRect(-14, -36, 28, 34);

  ctx.fillStyle = '#475569';
  ctx.fillRect(-16, -2, 32, 5);
}

function drawSideFacade(ctx, side, index) {
  const isLeft = side === 'left';

  // Prédios laterais maiores, não objetos pequenos.
  const width = 72 + (index % 3) * 18;
  const height = 150 + (index % 4) * 34;

  const x = isLeft ? -width : 0;

  // O prédio nasce da calçada e cresce para cima.
  const y = -height;

  const colors = [
    '#0f172a',
    '#111827',
    '#172033',
    '#1e293b',
  ];

  ctx.fillStyle = colors[index % colors.length];
  ctx.fillRect(x, y, width, height);

  // Sombra lateral para dar volume.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';

  if (isLeft) {
    ctx.fillRect(x + width - 12, y, 12, height);
  } else {
    ctx.fillRect(x, y, 12, height);
  }

  // Térreo escuro, como comércio fechado/garagem.
  ctx.fillStyle = '#070d18';
  ctx.fillRect(x + 8, -26, width - 16, 26);

  ctx.fillStyle = 'rgba(253, 230, 138, 0.16)';
  ctx.fillRect(x + 14, -18, width - 28, 4);

  // Janelas discretas.
  const cols = Math.max(2, Math.floor(width / 18));
  const rows = Math.max(3, Math.floor((height - 42) / 22));

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const shouldLight =
        (row * 2 + col + index) % 5 === 0;

      ctx.fillStyle = shouldLight
        ? 'rgba(253, 230, 138, 0.24)'
        : 'rgba(148, 163, 184, 0.10)';

      ctx.fillRect(
        x + 12 + col * 18,
        y + 14 + row * 22,
        6,
        9
      );
    }
  }

  // Topo do prédio.
  ctx.fillStyle = '#060b14';
  ctx.fillRect(x - 3, y - 6, width + 6, 6);
}

function drawSideFacades(
  ctx,
  s,
  CANVAS_HEIGHT
   ) 
   {
      const cycleSize = CANVAS_HEIGHT + 760;

     const sceneryTravel =
      typeof s.urbanDistance === 'number'
      ? s.urbanDistance * 1.45
      : s.frameCount * s.speed;

      for (let i = 0; i < 10; i++) {
    const isLeftSide = i % 2 === 0;

    const offset =
      (
        sceneryTravel +
        i * 185
      ) % cycleSize - 260;

    const roadSlice = getRoadSlice(
      offset,
      s.avenueState
    );

    if (roadSlice.y < 150) continue;
    if (roadSlice.y > CANVAS_HEIGHT + 90) continue;

    const sidewalkWidth = getSidewalkWidth(
      roadSlice.t
    );

        const facadeOffset =
      sidewalkWidth * 1.85 + 18;

    const objX = isLeftSide
      ? roadSlice.left - facadeOffset
      : roadSlice.right + facadeOffset;

    ctx.save();

        ctx.translate(objX, roadSlice.y + 18);
    ctx.scale(roadSlice.scale, roadSlice.scale);

    drawSideFacade(
      ctx,
      isLeftSide ? 'left' : 'right',
      i
    );

    ctx.restore();
  }
}

function drawSideObject(ctx, type, index) {
  if (type === 0) {
    drawStreetLight(ctx);
    return;
  }

  if (type === 1) {
    drawTrafficSign(ctx, index);
    return;
  }

  if (type === 2) {
    drawUrbanTree(ctx);
    return;
  }

  drawBusStop(ctx);
}

export function drawScenery(
  ctx,
  s,
  projectRoadPoint,
  CANVAS_HEIGHT
) {
    drawUrbanSidewalks(
    ctx,
    CANVAS_HEIGHT,
    s.avenueState
  );

  // Fachadas e prédios baixos atrás dos objetos laterais.
  drawSideFacades(
    ctx,
    s,
    CANVAS_HEIGHT
  );

  // Objetos urbanos laterais
  for (let i = 0; i < 16; i++) {
    const side = i % 2 === 0 ? -1.05 : 3.05;
    const type = i % 4;

    let velocity = 0.85;

    if (type === 0) velocity = 1.25;
    if (type === 1) velocity = 1.05;
    if (type === 2) velocity = 0.78;
    if (type === 3) velocity = 0.65;

    const cycleSize = CANVAS_HEIGHT + 640;

const sceneryTravel =
  typeof s.urbanDistance === 'number'
    ? s.urbanDistance * 1.9
    : s.frameCount * s.speed;

const offset =
  (
    sceneryTravel * velocity +
    i * 165
  ) % cycleSize - 220;

    const roadSlice = getRoadSlice(
  offset,
  s.avenueState
);

if (roadSlice.y < 135) continue;

const sidewalkWidth = getSidewalkWidth(
  roadSlice.t
);

const sidewalkOffset =
  sidewalkWidth * 0.62;

const isLeftSide = i % 2 === 0;

const objX = isLeftSide
  ? roadSlice.left - sidewalkOffset
  : roadSlice.right + sidewalkOffset;

ctx.save();

ctx.translate(objX, roadSlice.y);
ctx.scale(roadSlice.scale, roadSlice.scale);

drawSideObject(ctx, type, i);

ctx.restore();

  // Prédios laterais temporariamente desativados.
  // Vamos recriar a cidade inteira depois, em um pacote único.
}
}