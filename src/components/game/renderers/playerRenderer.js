export function drawPlayer(
  ctx,
  motoX,
  motoY,
  targetX,
  motoColor
) {
  const motoTilt =
    (targetX - motoX) * 0.0008;

  ctx.save();

  ctx.translate(
    motoX,
    motoY
  );

  ctx.rotate(motoTilt);

  ctx.scale(
    1.20,
    1.20
  );

  const bikeX = 0;
  const bikeY = 0;

  // sombra
  ctx.fillStyle =
    'rgba(0,0,0,0.35)';

  ctx.beginPath();

  ctx.ellipse(
    bikeX,
    bikeY + 28,
    24,
    10,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // roda traseira
  ctx.fillStyle = '#111';

  ctx.beginPath();

  ctx.ellipse(
    bikeX,
    bikeY + 24,
    12,
    16,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // paralama
  ctx.fillStyle = '#444';

  ctx.beginPath();

  ctx.roundRect(
    bikeX - 10,
    bikeY + 6,
    20,
    14,
    6
  );

  ctx.fill();

  // lanterna
  ctx.fillStyle = '#ff3030';

  ctx.beginPath();

  ctx.roundRect(
    bikeX - 5,
    bikeY + 10,
    10,
    6,
    2
  );

  ctx.fill();

  // banco
  ctx.fillStyle = '#222';

  ctx.beginPath();

  ctx.roundRect(
    bikeX - 10,
    bikeY - 6,
    20,
    18,
    5
  );

  ctx.fill();

  // tanque
  ctx.fillStyle = motoColor;

  ctx.beginPath();

  ctx.roundRect(
    bikeX - 14,
    bikeY - 24,
    28,
    24,
    8
  );

  ctx.fill();

  // detalhe central
  ctx.fillStyle =
    'rgba(255,255,255,0.15)';

  ctx.fillRect(
    bikeX - 2,
    bikeY - 22,
    4,
    20
  );

  // guidão esquerdo
  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 3;

  ctx.beginPath();

  ctx.moveTo(
    bikeX - 8,
    bikeY - 20
  );

  ctx.lineTo(
    bikeX - 18,
    bikeY - 28
  );

  ctx.stroke();

  // guidão direito

  ctx.beginPath();

  ctx.moveTo(
    bikeX + 8,
    bikeY - 20
  );

  ctx.lineTo(
    bikeX + 18,
    bikeY - 28
  );

  ctx.stroke();

  // retrovisor esquerdo

  ctx.fillStyle = '#999';

  ctx.beginPath();

  ctx.arc(
    bikeX - 18,
    bikeY - 30,
    3,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // retrovisor direito

  ctx.beginPath();

  ctx.arc(
    bikeX + 18,
    bikeY - 30,
    3,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // frente

  ctx.fillStyle = '#ddd';

  ctx.beginPath();

  ctx.roundRect(
    bikeX - 6,
    bikeY - 34,
    12,
    10,
    3
  );

  ctx.fill();

  ctx.restore();
}