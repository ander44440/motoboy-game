const VEHICLE_SPECS = {
  compact: {
    w: 38,
    h: 66,
  },
  sedan: {
    w: 42,
    h: 100,
  },
  suv: {
    w: 58,
    h: 90,
  },
  van: {
    w: 62,
    h: 112,
  },
  pickup: {
    w: 58,
    h: 106,
  },
};

function roundedPath(ctx, x, y, w, h, r) {
  ctx.beginPath();

  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
    return;
  }

  const radius = Math.min(r, w / 2, h / 2);

  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function fillRoundedRect(ctx, x, y, w, h, r) {
  roundedPath(ctx, x, y, w, h, r);
  ctx.fill();
}

function strokeRoundedRect(ctx, x, y, w, h, r) {
  roundedPath(ctx, x, y, w, h, r);
  ctx.stroke();
}

function drawShadow(ctx, w, h) {
  ctx.fillStyle = 'rgba(0,0,0,0.42)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.32, w * 0.7, 13, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawOutline(ctx, color) {
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fill();
}

function drawWheels(ctx, w, h, size = 'normal') {
  const wheelW = size === 'large' ? 7 : 5;
  const wheelH = size === 'large' ? 20 : 16;

  ctx.fillStyle = '#111827';

  ctx.fillRect(-w / 2 - wheelW + 2, -h / 2 + 18, wheelW, wheelH);
  ctx.fillRect(w / 2 - 2, -h / 2 + 18, wheelW, wheelH);

  ctx.fillRect(-w / 2 - wheelW + 2, h / 2 - 18 - wheelH, wheelW, wheelH);
  ctx.fillRect(w / 2 - 2, h / 2 - 18 - wheelH, wheelW, wheelH);

  ctx.fillStyle = '#374151';

  ctx.fillRect(-w / 2 - wheelW + 3, -h / 2 + 23, wheelW - 2, wheelH - 9);
  ctx.fillRect(w / 2 - 1, -h / 2 + 23, wheelW - 2, wheelH - 9);

  ctx.fillRect(-w / 2 - wheelW + 3, h / 2 - 13 - wheelH, wheelW - 2, wheelH - 9);
  ctx.fillRect(w / 2 - 1, h / 2 - 13 - wheelH, wheelW - 2, wheelH - 9);
}

function drawFrontLights(ctx, w, h, type = 'normal') {
  ctx.fillStyle = 'rgba(255, 247, 178, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-w / 2 + 11, -h / 2 + 7, 8, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(w / 2 - 11, -h / 2 + 7, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff7b2';

  if (type === 'wide') {
    fillRoundedRect(ctx, -w / 2 + 7, -h / 2 + 4, 13, 6, 2);
    fillRoundedRect(ctx, w / 2 - 20, -h / 2 + 4, 13, 6, 2);
  } else {
    fillRoundedRect(ctx, -w / 2 + 8, -h / 2 + 4, 10, 5, 2);
    fillRoundedRect(ctx, w / 2 - 18, -h / 2 + 4, 10, 5, 2);
  }

  ctx.fillStyle = '#1f2937';
  fillRoundedRect(ctx, -10, -h / 2 + 5, 20, 4, 2);
}

function drawRearLights(ctx, w, h) {
  ctx.fillStyle = '#ef4444';
  fillRoundedRect(ctx, -w / 2 + 7, h / 2 - 10, 10, 6, 2);
  fillRoundedRect(ctx, w / 2 - 17, h / 2 - 10, 10, 6, 2);
}

function drawCenterReflection(ctx, w, h) {
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  fillRoundedRect(ctx, -w / 2 + 6, -h / 2 + 10, 4, h - 20, 3);

  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  fillRoundedRect(ctx, w / 2 - 10, -h / 2 + 12, 4, h - 24, 3);
}

function drawCompact(ctx, color) {
  const { w, h } = VEHICLE_SPECS.compact;

  drawWheels(ctx, w, h, 'normal');

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.quadraticCurveTo(w / 2, -h / 2 + 5, w / 2, -h / 2 + 18);
  ctx.lineTo(w / 2 - 3, h / 2 - 12);
  ctx.quadraticCurveTo(w / 2 - 6, h / 2, 0, h / 2);
  ctx.quadraticCurveTo(-w / 2 + 6, h / 2, -w / 2 + 3, h / 2 - 12);
  ctx.lineTo(-w / 2, -h / 2 + 18);
  ctx.quadraticCurveTo(-w / 2, -h / 2 + 5, 0, -h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
  ctx.lineWidth = 2;
  ctx.stroke();

  drawCenterReflection(ctx, w, h);

  ctx.fillStyle = 'rgba(191, 219, 254, 0.95)';
  fillRoundedRect(ctx, -12, -22, 24, 15, 6);
  fillRoundedRect(ctx, -12, 6, 24, 14, 6);

  ctx.fillStyle = 'rgba(15,23,42,0.22)';
  ctx.fillRect(-1, -21, 2, 41);

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 7, -3);
  ctx.lineTo(w / 2 - 7, -3);
  ctx.stroke();

  drawFrontLights(ctx, w, h);
  drawRearLights(ctx, w, h);
}

function drawSedan(ctx, color) {
  const { w, h } = VEHICLE_SPECS.sedan;

  drawWheels(ctx, w, h, 'normal');

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 7, -h / 2);
  ctx.lineTo(w / 2 - 7, -h / 2);
  ctx.quadraticCurveTo(w / 2, -h / 2 + 5, w / 2, -h / 2 + 15);
  ctx.lineTo(w / 2 - 2, h / 2 - 15);
  ctx.quadraticCurveTo(w / 2 - 4, h / 2, w / 2 - 11, h / 2);
  ctx.lineTo(-w / 2 + 11, h / 2);
  ctx.quadraticCurveTo(-w / 2 + 4, h / 2, -w / 2 + 2, h / 2 - 15);
  ctx.lineTo(-w / 2, -h / 2 + 15);
  ctx.quadraticCurveTo(-w / 2, -h / 2 + 5, -w / 2 + 7, -h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
  ctx.lineWidth = 2;
  ctx.stroke();

  drawCenterReflection(ctx, w, h);

  // Capô longo
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(-w / 2 + 8, -34);
  ctx.lineTo(w / 2 - 8, -34);
  ctx.moveTo(-w / 2 + 7, 31);
  ctx.lineTo(w / 2 - 7, 31);
  ctx.stroke();

  // Cabine mais central e alongada
  ctx.fillStyle = 'rgba(191, 219, 254, 0.95)';
  fillRoundedRect(ctx, -14, -24, 28, 17, 4);
  fillRoundedRect(ctx, -15, -3, 30, 17, 4);
  fillRoundedRect(ctx, -13, 18, 26, 13, 4);

  ctx.fillStyle = 'rgba(15,23,42,0.2)';
  ctx.fillRect(-1, -23, 2, 54);

  drawFrontLights(ctx, w, h);
  drawRearLights(ctx, w, h);
}

function drawSUV(ctx, color) {
  const { w, h } = VEHICLE_SPECS.suv;

  drawWheels(ctx, w, h, 'large');

  ctx.fillStyle = color;
  fillRoundedRect(ctx, -w / 2, -h / 2, w, h, 9);

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.lineWidth = 2;
  strokeRoundedRect(ctx, -w / 2, -h / 2, w, h, 9);

  drawCenterReflection(ctx, w, h);

  // Para-lamas largos
  ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
  fillRoundedRect(ctx, -w / 2 + 4, -h / 2 + 12, 7, h - 24, 4);
  fillRoundedRect(ctx, w / 2 - 11, -h / 2 + 12, 7, h - 24, 4);

  // Teto largo
  ctx.fillStyle = 'rgba(191, 219, 254, 0.95)';
  fillRoundedRect(ctx, -19, -27, 38, 18, 4);
  fillRoundedRect(ctx, -20, 3, 40, 22, 4);

  ctx.fillStyle = 'rgba(15,23,42,0.22)';
  ctx.fillRect(-1, -26, 2, 51);

  // Rack de teto
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-19, -34);
  ctx.lineTo(-19, 31);
  ctx.moveTo(19, -34);
  ctx.lineTo(19, 31);
  ctx.stroke();

  drawFrontLights(ctx, w, h, 'wide');
  drawRearLights(ctx, w, h);
}

function drawVan(ctx, color) {
  const { w, h } = VEHICLE_SPECS.van;

  drawWheels(ctx, w, h, 'large');

  ctx.fillStyle = color;
  fillRoundedRect(ctx, -w / 2, -h / 2, w, h, 7);

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.lineWidth = 2;
  strokeRoundedRect(ctx, -w / 2, -h / 2, w, h, 7);

  drawCenterReflection(ctx, w, h);

  // Frente curta e corpo retangular comprido
  ctx.fillStyle = 'rgba(191, 219, 254, 0.95)';
  fillRoundedRect(ctx, -22, -45, 44, 18, 4);

  ctx.fillStyle = 'rgba(219, 234, 254, 0.95)';
  fillRoundedRect(ctx, -23, -18, 20, 18, 3);
  fillRoundedRect(ctx, 3, -18, 20, 18, 3);
  fillRoundedRect(ctx, -23, 7, 20, 18, 3);
  fillRoundedRect(ctx, 3, 7, 20, 18, 3);
  fillRoundedRect(ctx, -23, 32, 20, 15, 3);
  fillRoundedRect(ctx, 3, 32, 20, 15, 3);

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.32)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(0, h / 2 - 8);
  ctx.moveTo(-w / 2 + 8, 28);
  ctx.lineTo(w / 2 - 8, 28);
  ctx.stroke();

  // Laterais mais quadradas
  ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
  fillRoundedRect(ctx, -w / 2 + 5, -h / 2 + 10, 6, h - 20, 3);
  fillRoundedRect(ctx, w / 2 - 11, -h / 2 + 10, 6, h - 20, 3);

  drawFrontLights(ctx, w, h, 'wide');
  drawRearLights(ctx, w, h);
}

function drawPickup(ctx, color) {
  const { w, h } = VEHICLE_SPECS.pickup;

  drawWheels(ctx, w, h, 'large');

  // Corpo externo
  ctx.fillStyle = color;
  fillRoundedRect(ctx, -w / 2, -h / 2, w, h, 8);

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.lineWidth = 2;
  strokeRoundedRect(ctx, -w / 2, -h / 2, w, h, 8);

  drawCenterReflection(ctx, w, h);

  // Cabine dianteira
  ctx.fillStyle = 'rgba(191, 219, 254, 0.96)';
  fillRoundedRect(ctx, -18, -38, 36, 17, 4);
  fillRoundedRect(ctx, -17, -15, 34, 17, 4);

  ctx.fillStyle = 'rgba(15,23,42,0.22)';
  ctx.fillRect(-1, -38, 2, 40);

  // Separação real da caçamba
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 5, 9);
  ctx.lineTo(w / 2 - 5, 9);
  ctx.stroke();

  // Caçamba aberta
  ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
  fillRoundedRect(ctx, -21, 16, 42, 31, 5);

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-15, 25);
  ctx.lineTo(15, 25);
  ctx.moveTo(-15, 36);
  ctx.lineTo(15, 36);
  ctx.stroke();

  // Bordas da caçamba
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
  ctx.lineWidth = 2;
  strokeRoundedRect(ctx, -21, 16, 42, 31, 5);

  drawFrontLights(ctx, w, h, 'wide');
  drawRearLights(ctx, w, h);
}

export function drawVehicle(ctx, obs) {
  if (obs.type !== 'car') return;

  const model = obs.vehicleModel || 'compact';
  const color = obs.color || '#3b82f6';
  const spec = VEHICLE_SPECS[model] || VEHICLE_SPECS.compact;

  ctx.save();

  drawShadow(ctx, spec.w, spec.h);

  // Carros da contramão:
  // o veículo é virado verticalmente para os faróis ficarem voltados para a moto.
  if (obs.direction === 'toward') {
    ctx.scale(1, -1);
  }

  if (model === 'sedan') {
    drawSedan(ctx, color);
  } else if (model === 'suv') {
    drawSUV(ctx, color);
  } else if (model === 'van') {
    drawVan(ctx, color);
  } else if (model === 'pickup') {
    drawPickup(ctx, color);
  } else {
    drawCompact(ctx, color);
  }

  ctx.restore();
}