import {
  COIN_SIZE,
  STAR_SIZE,
  STAR_TIERS,
} from '../constants/gameConstants';

export function drawStar(ctx, x, y, tier, pulse) {
  const t = STAR_TIERS[tier];
  const radius = STAR_SIZE / 2 + Math.sin(pulse) * 2;

  ctx.shadowColor = t.glow;
  ctx.shadowBlur = 18;

  ctx.fillStyle = t.color;
  ctx.beginPath();

  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const angleIn = angle + (2 * Math.PI) / 10;

    if (i === 0) {
      ctx.moveTo(
        x + radius * Math.cos(angle),
        y + radius * Math.sin(angle)
      );
    } else {
      ctx.lineTo(
        x + radius * Math.cos(angle),
        y + radius * Math.sin(angle)
      );
    }

    ctx.lineTo(
      x + radius * 0.45 * Math.cos(angleIn),
      y + radius * 0.45 * Math.sin(angleIn)
    );
  }

  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px Orbitron';
  ctx.textAlign = 'center';
  ctx.fillText(t.label, x, y + 4);
}

export function drawCoin(ctx) {
  ctx.fillStyle = '#ffcc00';
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.arc(0, 0, COIN_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = '#b38f00';
  ctx.font = 'bold 10px Orbitron';
  ctx.textAlign = 'center';
  ctx.fillText('$', 0, 4);
}