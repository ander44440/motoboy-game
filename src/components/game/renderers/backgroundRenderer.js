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

  // Linha escura baixa no horizonte
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.fillRect(0, 142, CANVAS_WIDTH, 10);

  // Névoa baixa entre céu e estrada
  const horizonFog = ctx.createLinearGradient(0, 108, 0, 182);
  horizonFog.addColorStop(0, 'rgba(148, 163, 184, 0)');
  horizonFog.addColorStop(0.5, 'rgba(148, 163, 184, 0.13)');
  horizonFog.addColorStop(1, 'rgba(148, 163, 184, 0)');

  ctx.fillStyle = horizonFog;
  ctx.fillRect(0, 105, CANVAS_WIDTH, 85);
}