import React, {
  useRef,
  useEffect,
  useCallback,
} from 'react';

import {
  projectRoadPoint,
  projectLaneCenterAtScreenY,
  getRoadSourceYForScreenY,
} from './systems/projectionSystem';

import { getTrafficLightState } from './systems/trafficLightSystem';

import {
  AVENUE_SEGMENT_TYPES,
  getAvenueSegmentState,
} from './systems/urbanSegmentSystem';

import { generateBuildings } from './systems/buildingSystem';

import { drawPlayer } from './renderers/playerRenderer';

import { drawStar, drawCoin } from './renderers/collectibleRenderer';

import { drawVehicle } from './renderers/vehicleRenderer';

import { drawBackground } from './renderers/backgroundRenderer';

import { drawScenery } from './renderers/sceneryRenderer';

import { drawRoad } from './renderers/roadRenderer';

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

const RESERVED_LEFT_LANE = 0;

// Velocidade urbana ajustada.
// 3 ficou legível, mas lento demais.
// 4 era rápido demais para ler o semáforo.
// 2.75 devolve energia sem perder controle.
// Velocidade de cruzeiro aprovada.
const GAME_SPEED = 2.75;

// Controle manual da moto.
// Sem apertar nada, a moto volta para a velocidade de cruzeiro.
// W acelera acima do cruzeiro.
// S freia até parar.
const MIN_GAME_SPEED = 0;
const MAX_GAME_SPEED = 3.75;
const ACCELERATION_FORCE = 0.045;
const BRAKE_FORCE = 0.095;
const CRUISE_RETURN_FORCE = 0.025;
const TRAFFIC_BASE_SPEED = GAME_SPEED * 0.92;

// A moto pode estar rápida, mas a cidade não precisa avançar
// no mesmo ritmo. Isso evita cruzamentos passando rápido demais.
const URBAN_FLOW_MULTIPLIER = 0.52;

// Remove veículos logo antes de grudarem na base visual.
const VEHICLE_DESPAWN_Y = CANVAS_HEIGHT - 8;

// Coletáveis usam projeção. Por isso a remoção precisa olhar
// o Y visual projetado, não apenas o Y lógico.
const COLLECTIBLE_DESPAWN_SCREEN_Y = CANVAS_HEIGHT - 35;

// A fila só precisa existir antes/na região útil do jogo.
// Depois disso, o objeto deve sair naturalmente.
const QUEUE_CONTROL_LIMIT_Y = CANVAS_HEIGHT - 180;

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

const inputRef = useRef({
  accelerate: false,
  brake: false,
});

  const getCurrentAvenueState = useCallback((s) => {
    const urbanDistance =
      typeof s.urbanDistance === 'number'
        ? s.urbanDistance
        : s.frameCount * s.speed;

    return getAvenueSegmentState(urbanDistance);
  }, []);

  const isTrafficLightZoneActive = useCallback((avenueState) => {
    if (!avenueState) return false;

    return (
      avenueState.type === AVENUE_SEGMENT_TYPES.INTERSECTION_APPROACH ||
      avenueState.type === AVENUE_SEGMENT_TYPES.INTERSECTION
    );
  }, []);

  const getVehicleQueueSpeedLimit = useCallback((s, vehicle) => {
    if (vehicle.type !== 'car') return Infinity;

    if (vehicle.y > QUEUE_CONTROL_LIMIT_Y) {
      return Infinity;
    }

    const minimumGap = 60;
    const slowGap = 98;

    let nearestGap = Infinity;

    for (const other of s.obstacles) {
      if (other === vehicle) continue;
      if (other.type !== 'car') continue;
      if (other.lane !== vehicle.lane) continue;

      if (other.y > QUEUE_CONTROL_LIMIT_Y) continue;

      const gap = other.y - vehicle.y;

      if (gap > 0 && gap < nearestGap) {
        nearestGap = gap;
      }
    }

    if (nearestGap === Infinity) {
      return Infinity;
    }

    if (nearestGap <= minimumGap) {
      return 0;
    }

    if (nearestGap < slowGap) {
      return Math.max(0, (nearestGap - minimumGap) * 0.09);
    }

    return Infinity;
  }, []);

  const getVehicleSpeedForTrafficLight = useCallback(
    (s, vehicle) => {
      const baseVehicleSpeed = TRAFFIC_BASE_SPEED;

      const trafficLightState =
        s.trafficLightState ||
        getTrafficLightState(s.frameCount);

      const avenueState = getCurrentAvenueState(s);

      if (!isTrafficLightZoneActive(avenueState)) {
        return baseVehicleSpeed;
      }

      const stopLineSourceY = getRoadSourceYForScreenY(356);

      const stopBuffer = 18;
      const redSlowDistance = 150;
      const yellowSlowDistance = 120;

      const distanceToStopLine = stopLineSourceY - vehicle.y;

      // Se já passou da linha, segue.
      // Isso evita carro travado no meio do cruzamento.
      if (distanceToStopLine <= 0) {
        return baseVehicleSpeed;
      }

      if (trafficLightState.shouldStop) {
        // Vermelho: para antes da faixa.
        if (distanceToStopLine <= stopBuffer) {
          return 0;
        }

        // Vermelho: aproxima reduzindo sem ultrapassar a linha.
        if (distanceToStopLine < redSlowDistance) {
          const approachSpeed =
            distanceToStopLine < 64
              ? baseVehicleSpeed * 0.24
              : baseVehicleSpeed * 0.48;

          const safeSpeed = Math.max(
            0,
            distanceToStopLine - stopBuffer
          );

          return Math.min(approachSpeed, safeSpeed);
        }
      }

      if (trafficLightState.shouldSlowDown) {
        // Amarelo: reduz, mas não trava.
        if (
          distanceToStopLine > stopBuffer &&
          distanceToStopLine < yellowSlowDistance
        ) {
          return baseVehicleSpeed * 0.74;
        }
      }

      return baseVehicleSpeed;
    },
    [
      getCurrentAvenueState,
      isTrafficLightZoneActive,
    ]
  );

  const getLaneX = useCallback((lane) => {
    const motoScreenY = CANVAS_HEIGHT - 220;

    return projectLaneCenterAtScreenY(
      lane,
      motoScreenY
    ).x;
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
      speed: GAME_SPEED,
      frameCount: 0,
      urbanDistance: 0,
      trafficLightState: getTrafficLightState(0),
      gameOver: false,
      buildings: generateBuildings(),

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
  const handleKeyDown = (e) => {
    const key = e.key.toLowerCase();

    if (
      key === 'arrowleft' ||
      key === 'arrowright' ||
      key === 'a' ||
      key === 'd' ||
      key === 'w' ||
      key === 's'
    ) {
      e.preventDefault();
      resumeAudioContext();
    }

    if ((key === 'arrowleft' || key === 'a') && !e.repeat) {
      handleInput('left');
    }

    if ((key === 'arrowright' || key === 'd') && !e.repeat) {
      handleInput('right');
    }

    if (key === 'w') {
      inputRef.current.accelerate = true;
    }

    if (key === 's') {
      inputRef.current.brake = true;
    }
  };

  const handleKeyUp = (e) => {
    const key = e.key.toLowerCase();

    if (key === 'w') {
      inputRef.current.accelerate = false;
    }

    if (key === 's') {
      inputRef.current.brake = false;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
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
      '#ef4444',
      '#2563eb',
      '#f59e0b',
      '#e5e7eb',
      '#6b7280',
      '#111827',
      '#16a34a',
      '#7c3aed',
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

const input = inputRef.current;

if (input.brake) {
  s.speed = Math.max(
    MIN_GAME_SPEED,
    s.speed - BRAKE_FORCE
  );
} else if (input.accelerate) {
  s.speed = Math.min(
    MAX_GAME_SPEED,
    s.speed + ACCELERATION_FORCE
  );
} else if (s.speed < GAME_SPEED) {
  s.speed = Math.min(
    GAME_SPEED,
    s.speed + CRUISE_RETURN_FORCE
  );
} else if (s.speed > GAME_SPEED) {
  s.speed = Math.max(
    GAME_SPEED,
    s.speed - CRUISE_RETURN_FORCE
  );
}

s.urbanDistance += s.speed * URBAN_FLOW_MULTIPLIER;
      s.score = Math.floor(s.frameCount / 4);
      s.trafficLightState = getTrafficLightState(s.frameCount);

      s.motoX += (s.targetX - s.motoX) * 0.15;

      s.roadLines = s.roadLines.map((y) => {
        y += s.speed * 1.5;

        if (y > CANVAS_HEIGHT) {
          y -= CANVAS_HEIGHT + 100;
        }

        return y;
      });

      if (s.frameCount >= s.nextVehicleSpawnFrame) {
        const availableLanes = [];

        for (let lane = 0; lane < LANE_COUNT; lane++) {
          if (lane === RESERVED_LEFT_LANE) continue;

          const hasRecentCar = s.obstacles.some(
          (o) => o.lane === lane && o.y < 240
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
            lanesWithoutLast.length > 0
              ? lanesWithoutLast
              : availableLanes;

          const lane =
            lanePool[Math.floor(Math.random() * lanePool.length)];

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

          s.nextVehicleSpawnFrame =
          s.frameCount + 24 + Math.floor(Math.random() * 14);
        } else {
          s.nextVehicleSpawnFrame = s.frameCount + 8;
        }
      }

      // Moedas podem aparecer também na faixa esquerda.
      if (s.frameCount % 42 === 0) {
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

      // Estrelas podem aparecer também na faixa esquerda.
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

      s.obstacles = s.obstacles.filter((o) => {
        let vehicleSpeed =
          o.type === 'car'
            ? getVehicleSpeedForTrafficLight(s, o)
            : s.speed;

        if (o.type === 'car') {
          vehicleSpeed = Math.min(
            vehicleSpeed,
            getVehicleQueueSpeedLimit(s, o)
          );
        }

        o.y += vehicleSpeed;

        return o.y < VEHICLE_DESPAWN_Y;
      });

      s.coins = s.coins.filter((c) => {
        c.y += s.speed;

        const projected = projectRoadPoint(c.lane, c.y);

        return projected.y < COLLECTIBLE_DESPAWN_SCREEN_Y;
      });

      s.stars = s.stars.filter((star) => {
        star.y += s.speed;

        const projected = projectRoadPoint(star.lane, star.y);

        return projected.y < COLLECTIBLE_DESPAWN_SCREEN_Y;
      });

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

      for (const obs of s.obstacles) {
        const projected = projectRoadPoint(obs.lane, obs.y);

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
    getVehicleSpeedForTrafficLight,
    getVehicleQueueSpeedLimit,
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