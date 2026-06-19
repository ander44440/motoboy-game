import { projectRoadPoint } from './systems/projectionSystem';
import { generateBuildings } from './systems/buildingSystem';
import { drawPlayer } from './renderers/playerRenderer';

import { drawStar, drawCoin } from './renderers/collectibleRenderer';

import { drawVehicle } from './renderers/vehicleRenderer';

import { drawBackground } from './renderers/backgroundRenderer';

import { drawScenery } from './renderers/sceneryRenderer';

import { drawRoad } from './renderers/roadRenderer';

import React, { useRef, useEffect, useCallback } from 'react';

import {
  playCoinSound,
  playStarSound,
  playGameOverSound,
  playLaneChangeSound,
  resumeAudioContext,
} from '@/lib/soundEffects';

import {
  LANE_COUNT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  STAR_TIERS,
} from './constants/gameConstants';

export default function GameCanvas({
  onScoreUpdate,
  onGameOver,
  gameState,
  motoColor,
}) {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const stateRef = useRef(null);
  const touchStartRef = useRef(null);

  const getLaneX = useCallback((lane) => {
    const roadBottomLeft = 40;
    const roadBottomRight = CANVAS_WIDTH - 40;
    const laneWidth = (roadBottomRight - roadBottomLeft) / LANE_COUNT;

    return roadBottomLeft + laneWidth * lane + laneWidth / 2;
  }, []);

  const initState = useCallback(() => {
    return {
      lane: 1,
      targetX: getLaneX(1),
      motoX: getLaneX(1),
      motoY: CANVAS_HEIGHT - 220,
      obstacles: [],
      coins: [],
      stars: [],
      roadLines: [0, 100, 200, 300, 400, 500, 600, 700],
      score: 0,
      coinsCollected: 0,
      speed: 4,
      frameCount: 0,
      gameOver: false,
      buildings: generateBuildings(),

      // Controle do tráfego urbano
      nextVehicleSpawnFrame: 42,
      lastVehicleLane: null,
      vehicleSpawnCount: 0,
    };
  }, [getLaneX]);

  const handleInput = useCallback(
    (direction) => {
      const s = stateRef.current;
      if (!s || s.gameOver) return;

      if (direction === 'left' && s.lane > 0) {
        s.lane--;
        s.targetX = getLaneX(s.lane);
        playLaneChangeSound();
      } else if (direction === 'right' && s.lane < LANE_COUNT - 1) {
        s.lane++;
        s.targetX = getLaneX(s.lane);
        playLaneChangeSound();
      }
    },
    [getLaneX]
  );

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') handleInput('left');
      else if (e.key === 'ArrowRight') handleInput('right');
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleInput]);

  const handleTouchStart = useCallback((e) => {
    resumeAudioContext();
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (touchStartRef.current === null) return;

      const diff = e.changedTouches[0].clientX - touchStartRef.current;

      if (Math.abs(diff) > 30) {
        handleInput(diff < 0 ? 'left' : 'right');
      }

      touchStartRef.current = null;
    },
    [handleInput]
  );

  const drawGame = useCallback((ctx, s, color) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawRoad(ctx, s, CANVAS_WIDTH, CANVAS_HEIGHT, LANE_COUNT);

    const drawObstacle = (obs) => {
      const projected = projectRoadPoint(obs.lane, obs.y);

      ctx.save();
      ctx.translate(projected.x, projected.y);
      ctx.scale(projected.scale, projected.scale);

      drawVehicle(ctx, obs);

      ctx.restore();
    };

    const drawCoinProjected = (coin) => {
      const projected = projectRoadPoint(coin.lane, coin.y);

      ctx.save();
      ctx.translate(projected.x, projected.y);
      ctx.scale(projected.scale, projected.scale);

      drawCoin(ctx);

      ctx.restore();
    };

    const drawBonusStar = (star) => {
      const projected = projectRoadPoint(star.lane, star.y);

      ctx.save();
      ctx.translate(projected.x, projected.y);
      ctx.scale(projected.scale, projected.scale);

      drawStar(ctx, 0, 0, star.tier, s.frameCount * 0.1);

      ctx.restore();
    };

    drawScenery(ctx, s, projectRoadPoint, CANVAS_HEIGHT);

    // Prédios laterais
    for (let i = 0; i < 8; i++) {
      const side = i % 2 === 0 ? -1.6 : 3.6;

      const y =
        ((s.frameCount * s.speed * 0.18) + i * 280) %
        (CANVAS_HEIGHT + 500);

      const building = projectRoadPoint(side, y);

      ctx.save();

      ctx.translate(building.x, building.y);

      ctx.scale(building.scale * 1.8, building.scale * 1.8);

      const w = 50 + (i % 3) * 20;
      const h = 100 + (i % 4) * 40;

      ctx.fillStyle = '#1f2937';

      ctx.fillRect(-w / 2, -h, w, h);

      // Janelas
      ctx.fillStyle = '#fef08a';

      for (let row = 0; row < h / 20; row++) {
        for (let col = 0; col < w / 15; col++) {
          if (Math.random() > 0.4) {
            ctx.fillRect(
              -w / 2 + 8 + col * 15,
              -h + 10 + row * 18,
              5,
              8
            );
          }
        }
      }

      ctx.restore();
    }

    const renderItems = [
      ...s.obstacles.map((item) => ({
        type: 'obstacle',
        item,
        y: item.y,
      })),
      ...s.coins.map((item) => ({
        type: 'coin',
        item,
        y: item.y,
      })),
      ...s.stars.map((item) => ({
        type: 'star',
        item,
        y: item.y,
      })),
    ].sort((a, b) => a.y - b.y);

    renderItems.forEach((entry) => {
      if (entry.type === 'obstacle') drawObstacle(entry.item);
      if (entry.type === 'coin') drawCoinProjected(entry.item);
      if (entry.type === 'star') drawBonusStar(entry.item);
    });

    // Moto
    drawPlayer(ctx, s.motoX, s.motoY, s.targetX, color || '#22c55e');
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    resumeAudioContext();

    stateRef.current = initState();
    const s = stateRef.current;

    const vehicleColors = [
      '#ef4444', // vermelho urbano
      '#2563eb', // azul
      '#f59e0b', // amarelo/ocre
      '#e5e7eb', // prata claro
      '#6b7280', // cinza
      '#111827', // preto
      '#16a34a', // verde escuro
      '#7c3aed', // roxo discreto
    ];

    const vehicleModels = [
      'compact',
      'sedan',
      'suv',
      'pickup',
      'compact',
      'sedan',
      'van',
      'suv',
    ];

    const chooseVehicleColor = () => {
      return vehicleColors[
        Math.floor(Math.random() * vehicleColors.length)
      ];
    };

    const chooseVehicleModel = () => {
      const index = s.vehicleSpawnCount % vehicleModels.length;
      return vehicleModels[index];
    };

    const loop = () => {
      if (s.gameOver) return;

      s.frameCount++;
      s.speed = 4;
      s.score = Math.floor(s.frameCount / 4);

      // Transição suave entre faixas
      s.motoX += (s.targetX - s.motoX) * 0.15;

      // Linhas da estrada
      s.roadLines = s.roadLines.map((y) => {
        y += s.speed * 1.35;

        if (y > CANVAS_HEIGHT) {
          y -= CANVAS_HEIGHT + 100;
        }

        return y;
      });

      // Spawn de tráfego urbano
      if (s.frameCount >= s.nextVehicleSpawnFrame) {
        const availableLanes = [];

        for (let lane = 0; lane < LANE_COUNT; lane++) {
          const hasRecentCar = s.obstacles.some(
            (o) => o.lane === lane && o.y < 280
          );

          if (!hasRecentCar) {
            availableLanes.push(lane);
          }
        }

        if (availableLanes.length > 0) {
          const lanesWithoutLast = availableLanes.filter(
            (lane) => lane !== s.lastVehicleLane
          );

          const lanePool =
            lanesWithoutLast.length > 0 ? lanesWithoutLast : availableLanes;

          const lane =
            lanePool[Math.floor(Math.random() * lanePool.length)];

          // Faixas 0 e 1 = mesmo sentido
          // Faixas 2 e 3 = sentido contrário visual
          const direction = lane < 2 ? 'away' : 'toward';

          s.obstacles.push({
            x: getLaneX(lane),
            y: 0,
            lane,
            direction,
            type: 'car',
            vehicleModel: chooseVehicleModel(),
            color: chooseVehicleColor(),
          });

          s.lastVehicleLane = lane;
          s.vehicleSpawnCount++;

          // Tráfego mais presente, sem virar parede de carros.
          s.nextVehicleSpawnFrame =
            s.frameCount + 38 + Math.floor(Math.random() * 18);
        } else {
          // Se todas as faixas estiverem ocupadas perto do horizonte,
          // tenta novamente logo depois sem forçar spawn injusto.
          s.nextVehicleSpawnFrame = s.frameCount + 12;
        }
      }

      // Spawn de moedas
      if (s.frameCount % 45 === 0) {
        const lane = Math.floor(Math.random() * LANE_COUNT);

        const blocked = s.obstacles.some(
          (o) => o.lane === lane && o.y < 160
        );

        if (!blocked) {
          s.coins.push({
            x: getLaneX(lane),
            y: 0,
            lane,
          });
        }
      }

      // Spawn de estrelas
      if (s.frameCount % 300 === 0) {
        const lane = Math.floor(Math.random() * LANE_COUNT);

        const blocked = s.obstacles.some(
          (o) => o.lane === lane && o.y < 160
        );

        if (!blocked) {
          const tier =
            Math.random() < 0.5 ? 0 : Math.random() < 0.7 ? 1 : 2;

          s.stars.push({
            x: getLaneX(lane),
            y: 0,
            lane,
            tier,
          });
        }
      }

      // Movimento dos obstáculos
      s.obstacles = s.obstacles.filter((o) => {
        o.y += s.speed;
        return o.y < CANVAS_HEIGHT + 100;
      });

      // Movimento das moedas
      s.coins = s.coins.filter((c) => {
        c.y += s.speed;
        return c.y < CANVAS_HEIGHT + 50;
      });

      // Movimento das estrelas
      s.stars = s.stars.filter((star) => {
        star.y += s.speed;
        return star.y < CANVAS_HEIGHT + 50;
      });

      // Coleta de moedas
      s.coins = s.coins.filter((c) => {
        const projected = projectRoadPoint(c.lane, c.y);

        if (
          Math.abs(projected.x - s.motoX) < 30 * projected.scale &&
          Math.abs(projected.y - s.motoY) < 40 * projected.scale
        ) {
          s.coinsCollected++;
          playCoinSound();
          return false;
        }

        return true;
      });

      // Coleta de estrelas
      s.stars = s.stars.filter((star) => {
        const projected = projectRoadPoint(star.lane, star.y);

        if (
          Math.abs(projected.x - s.motoX) < 32 * projected.scale &&
          Math.abs(projected.y - s.motoY) < 40 * projected.scale
        ) {
          const bonus = STAR_TIERS[star.tier].value;
          s.coinsCollected += bonus;
          playStarSound(star.tier);
          return false;
        }

        return true;
      });

      // Colisão
      for (const obs of s.obstacles) {
        const projected = projectRoadPoint(obs.lane, obs.y);

        // Mantido propositalmente justo:
        // o desenho ficou mais rico, mas a área de colisão não foi aumentada.
        const hitW =
          obs.type === 'car'
            ? 35 * projected.scale
            : 20 * projected.scale;

        const hitH =
          obs.type === 'car'
            ? 45 * projected.scale
            : 25 * projected.scale;

        if (
          Math.abs(projected.x - s.motoX) < hitW &&
          Math.abs(projected.y - s.motoY) < hitH
        ) {
          s.gameOver = true;
          playGameOverSound();
          onGameOver(s.score, s.coinsCollected);
          return;
        }
      }

      onScoreUpdate(s.score, s.coinsCollected);
      drawGame(ctx, s, motoColor);

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [
    gameState,
    initState,
    getLaneX,
    drawGame,
    onScoreUpdate,
    onGameOver,
    motoColor,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  );
}