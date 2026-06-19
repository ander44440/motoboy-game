import { CANVAS_WIDTH } from '../constants/gameConstants';

function getRoadEdgesAtY(y, CANVAS_HEIGHT) {
  const horizonY = 152;

  const roadBottomLeft = 40;
  const roadBottomRight = CANVAS_WIDTH - 40;

  const roadTopLeft = CANVAS_WIDTH * 0.462;
  const roadTopRight = CANVAS_WIDTH * 0.538;

  const t = Math.max(
    0,
    Math.min(
      1,
      (y - horizonY) /
        (CANVAS_HEIGHT - horizonY)
    )
  );

  const left =
    roadTopLeft +
    (roadBottomLeft - roadTopLeft) * t;

  const right =
    roadTopRight +
    (roadBottomRight - roadTopRight) * t;

  return { left, right, t };
}

function drawUrbanSidewalks(ctx, CANVAS_HEIGHT) {
  const horizonY = 152;

  const top = getRoadEdgesAtY(horizonY, CANVAS_HEIGHT);
  const bottom = getRoadEdgesAtY(CANVAS_HEIGHT, CANVAS_HEIGHT);

  // Calçada esquerda
  ctx.fillStyle = 'rgba(45, 64, 82, 0.75)';
  ctx.beginPath();
  ctx.moveTo(top.left - 16, horizonY);
  ctx.lineTo(top.left - 3, horizonY);
  ctx.lineTo(bottom.left - 7, CANVAS_HEIGHT);
  ctx.lineTo(bottom.left - 70, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Calçada direita
  ctx.beginPath();
  ctx.moveTo(top.right + 3, horizonY);
  ctx.lineTo(top.right + 16, horizonY);
  ctx.lineTo(bottom.right + 70, CANVAS_HEIGHT);
  ctx.lineTo(bottom.right + 7, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Meio-fio interno esquerdo
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.28)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(top.left - 8, horizonY);
  ctx.lineTo(bottom.left - 18, CANVAS_HEIGHT);
  ctx.stroke();

  // Meio-fio interno direito
  ctx.beginPath();
  ctx.moveTo(top.right + 8, horizonY);
  ctx.lineTo(bottom.right + 18, CANVAS_HEIGHT);
  ctx.stroke();

  // Divisões discretas das calçadas
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  ctx.lineWidth = 1;

  for (let y = horizonY + 60; y < CANVAS_HEIGHT; y += 90) {
    const edge = getRoadEdgesAtY(y, CANVAS_HEIGHT);
    const next = getRoadEdgesAtY(y + 28, CANVAS_HEIGHT);

    ctx.beginPath();
    ctx.moveTo(edge.left - 18, y);
    ctx.lineTo(next.left - 42, y + 28);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(edge.right + 18, y);
    ctx.lineTo(next.right + 42, y + 28);
    ctx.stroke();
  }
}

function drawStreetLight(ctx) {
  // Poste
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-3, -52, 6, 74);

  // Braço
  ctx.fillRect(0, -52, 18, 4);

  // Luminária
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.ellipse(21, -50, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brilho
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
  // Base
  ctx.fillStyle = '#334155';
  ctx.fillRect(-24, 10, 48, 5);

  // Estrutura
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-20, -42, 4, 52);
  ctx.fillRect(16, -42, 4, 52);
  ctx.fillRect(-24, -46, 48, 5);

  // Cobertura
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-28, -55, 56, 10);

  // Painel
  ctx.fillStyle = 'rgba(96, 165, 250, 0.35)';
  ctx.fillRect(-14, -36, 28, 34);

  // Banco
  ctx.fillStyle = '#475569';
  ctx.fillRect(-16, -2, 32, 5);
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

function drawSideBuildings(
  ctx,
  s,
  projectRoadPoint,
  CANVAS_HEIGHT
) {
  const buildings = Array.isArray(s.buildings)
    ? s.buildings
    : [];

  for (let i = 0; i < buildings.length; i++) {
    const side = i % 2 === 0 ? -1.35 : 3.35;

    const cycleSize = CANVAS_HEIGHT + 760;

    const y =
      (
        (s.frameCount * s.speed * 0.16) +
        i * 340
      ) % cycleSize;

    const building = projectRoadPoint(side, y);
    const buildingData = buildings[i];

    if (!buildingData) continue;

    ctx.save();

    ctx.translate(
      building.x,
      building.y
    );

    ctx.scale(
      building.scale * 2.15,
      building.scale * 2.15
    );

    const w = buildingData.width;
    const h = buildingData.height;

    // Sombra/base
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(
      -w / 2 - 4,
      -h + 6,
      w + 8,
      h
    );

    // Corpo
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(
      -w / 2,
      -h,
      w,
      h
    );

    // Lateral escura
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(
      w / 2 - 8,
      -h,
      8,
      h
    );

    // Topo
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(
      -w / 2,
      -h - 5,
      w,
      5
    );

    // Janelas
    if (Array.isArray(buildingData.windows)) {
      buildingData.windows.forEach((window) => {
        if (!window.lit) return;

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(
          -w / 2 + 8 + window.col * 15,
          -h + 10 + window.row * 18,
          5,
          8
        );
      });
    }

    ctx.restore();
  }
}

export function drawScenery(
  ctx,
  s,
  projectRoadPoint,
  CANVAS_HEIGHT
) {
  drawUrbanSidewalks(ctx, CANVAS_HEIGHT);

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

    const offset =
      (
        (s.frameCount * s.speed * velocity) +
        i * 165
      ) % cycleSize - 220;

    const obj = projectRoadPoint(side, offset);

    if (obj.y < 135) continue;

    ctx.save();

    ctx.translate(obj.x, obj.y);
    ctx.scale(obj.scale, obj.scale);

    drawSideObject(ctx, type, i);

    ctx.restore();
  }

  drawSideBuildings(
    ctx,
    s,
    projectRoadPoint,
    CANVAS_HEIGHT
  );
}