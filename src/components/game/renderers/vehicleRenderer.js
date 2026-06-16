export function drawVehicle(ctx, obs) {
  if (obs.type === 'car') {
    const carW = 45;
    const carH = 80;

    // Carros da contramão
    if (obs.direction === 'toward') {
      ctx.scale(-1, 1);
    }

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 24, carW * 0.5, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corpo principal
    ctx.fillStyle = obs.color || '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(-carW / 2, -carH / 2, carW, carH, 12);
    ctx.fill();

    // Teto
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.roundRect(-16, -18, 32, 34, 8);
    ctx.fill();

    // Para-brisa dianteiro
    ctx.fillStyle = '#9fd4ff';
    ctx.beginPath();
    ctx.roundRect(-13, -16, 26, 11, 4);
    ctx.fill();

    // Vidro traseiro
    ctx.beginPath();
    ctx.roundRect(-13, 5, 26, 11, 4);
    ctx.fill();

    // Faixa lateral de brilho
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(-carW / 2 + 4, -carH / 2 + 8, 3, carH - 16);

    // Faróis
    ctx.fillStyle = '#fff7b2';
    ctx.fillRect(-15, -carH / 2 + 3, 8, 4);
    ctx.fillRect(7, -carH / 2 + 3, 8, 4);

    // Lanternas
    ctx.fillStyle = '#ff3b30';
    ctx.fillRect(-15, carH / 2 - 7, 8, 4);
    ctx.fillRect(7, carH / 2 - 7, 8, 4);

    // Para-choque dianteiro
    ctx.fillStyle = '#444';
    ctx.fillRect(-12, -carH / 2, 24, 2);

    // Para-choque traseiro
    ctx.fillRect(-12, carH / 2 - 2, 24, 2);

    // Rodas esquerdas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-carW / 2 - 2, -22, 4, 14);
    ctx.fillRect(-carW / 2 - 2, 8, 4, 14);

    // Rodas direitas
    ctx.fillRect(carW / 2 - 2, -22, 4, 14);
    ctx.fillRect(carW / 2 - 2, 8, 4, 14);
  } else {
    // Cone
    ctx.fillStyle = '#ff6b00';

    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(-16, 18);
    ctx.lineTo(16, 18);
    ctx.closePath();
    ctx.fill();

    // Faixa branca
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -2, 16, 5);

    // Base
    ctx.fillStyle = '#444';
    ctx.fillRect(-18, 18, 36, 5);
  }
}