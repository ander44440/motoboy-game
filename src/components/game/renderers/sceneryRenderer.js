export function drawScenery(
  ctx,
  s,
  projectRoadPoint,
  CANVAS_HEIGHT
) {
  // Cenário urbano básico
  for (let i = 0; i < 12; i++) {
    const side = i % 2 === 0 ? -0.9 : 2.9;
    const type = i % 3;

    let velocity = 0.8;
    if (type === 0) velocity = 1.4;
    if (type === 1) velocity = 1.1;
    if (type === 2) velocity = 0.7;

    const offset =
      ((s.frameCount * s.speed * velocity) + i * 140) %
      (CANVAS_HEIGHT + 300);

    const obj = projectRoadPoint(side, offset);

    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.scale(obj.scale, obj.scale);

    // Poste
    if (type === 0) {
      ctx.fillStyle = '#777';
      ctx.fillRect(-3, -40, 6, 80);

      ctx.fillStyle = '#ffe082';
      ctx.beginPath();
      ctx.arc(0, -42, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Placa
    else if (type === 1) {
      ctx.fillStyle = '#666';
      ctx.fillRect(-2, -25, 4, 50);

      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-22, -50, 44, 24);
    }

    // Árvore
    else {
      ctx.fillStyle = '#6b4f2d';
      ctx.fillRect(-4, -20, 8, 25);

      ctx.fillStyle = '#16a34a';

      ctx.beginPath();
      ctx.arc(0, -32, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-10, -24, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(10, -24, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Prédios laterais
  for (let i = 0; i < s.buildings.length; i++) {
    const side = i % 2 === 0 ? -1.6 : 3.6;

    const y =
      (
        (s.frameCount * s.speed * 0.18) +
        i * 280
      ) % (CANVAS_HEIGHT + 500);

    const building = projectRoadPoint(side, y);

    ctx.save();

    ctx.translate(
      building.x,
      building.y
    );

    ctx.scale(
      building.scale * 1.8,
      building.scale * 1.8
    );

    const buildingData = s.buildings[i];

const w = buildingData.width;
const h = buildingData.height;

    ctx.fillStyle = '#1f2937';

    ctx.fillRect(
      -w / 2,
      -h,
      w,
      h
    );

    // Janelas
    ctx.fillStyle = '#fef08a';

    

    ctx.restore();
  }
}