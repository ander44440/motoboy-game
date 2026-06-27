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

import {
  drawRoad,
  getStopLineInfo,
} from './renderers/roadRenderer';

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
const GAME_SPEED = 3.25;

// Controle manual da moto.
const MIN_GAME_SPEED = 0;
const MAX_GAME_SPEED = 8.25;
const ACCELERATION_FORCE = 0.16;
const BRAKE_FORCE = 0.16;
const CRUISE_RETURN_FORCE = 0.045;
const TRAFFIC_BASE_SPEED = GAME_SPEED * 0.88;

// Quanto a velocidade da moto influencia a posição aparente dos carros.
// Quanto maior esse número, mais a moto "alcança" os carros.
const VEHICLE_MOTO_INFLUENCE = 0.7;

// A moto pode estar rápida, mas a cidade não precisa avançar
// no mesmo ritmo. Isso evita cruzamentos passando rápido demais.
const URBAN_FLOW_MULTIPLIER = 0.65;

// Veículos no mesmo sentido da moto.
// Eles nascem mais próximos da moto e seguem de baixo para cima.
const VEHICLE_SPAWN_SCREEN_Y = CANVAS_HEIGHT - 12;
const VEHICLE_DESPAWN_SCREEN_Y = 118;
const VEHICLE_SPAWN_Y = getRoadSourceYForScreenY(VEHICLE_SPAWN_SCREEN_Y);
const VEHICLE_DESPAWN_Y = getRoadSourceYForScreenY(VEHICLE_DESPAWN_SCREEN_Y);
const VEHICLE_BOTTOM_DESPAWN_Y = VEHICLE_SPAWN_Y + 55;
const VEHICLE_SPAWN_GAP = 120;

// Tráfego à frente nasce somente no topo/horizonte.
// Não pode aparecer no meio da pista.
const FORWARD_TRAFFIC_CHECK_INTERVAL = 20;
const FORWARD_TRAFFIC_HORIZON_SCREEN_Y = VEHICLE_DESPAWN_SCREEN_Y + 8;
const FORWARD_TRAFFIC_HORIZON_GAP = 85;

// Coletáveis usam projeção. Por isso a remoção precisa olhar
// o Y visual projetado, não apenas o Y lógico.
const COLLECTIBLE_DESPAWN_SCREEN_Y = CANVAS_HEIGHT - 35;

const RED_LIGHT_WARNING_DURATION = 36;
const RED_LIGHT_MIN_SPEED_TO_WARN = 0.9;

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

  const isVehicleStopZoneActive = useCallback((avenueState) => {
  if (!avenueState) return false;

  // Carros só devem parar quando estão chegando no cruzamento.
  // Dentro do cruzamento, ou depois dele, eles não devem parar
  // "do lado da moto" por causa do semáforo.
  return (
    avenueState.type === AVENUE_SEGMENT_TYPES.INTERSECTION_APPROACH &&
    avenueState.progress > 0.58
  );
}, []);

  const getVehicleQueueSpeedLimit = useCallback((s, vehicle) => {
    if (vehicle.type !== 'car') return Infinity;

    const minimumGap = 60;
    const slowGap = 98;

    let nearestGap = Infinity;

    for (const other of s.obstacles) {
      if (other === vehicle) continue;
      if (other.type !== 'car') continue;
      if (other.lane !== vehicle.lane) continue;

      // Como os carros sobem, o carro da frente tem Y menor.
      const gap = vehicle.y - other.y;

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

    const stopLine = getStopLineInfo(
      avenueState,
      CANVAS_HEIGHT,
      'near'
    );

    // Se a linha visual de parada não está válida/visível,
    // o carro não deve parar em ponto inventado.
    if (!stopLine) {
      return baseVehicleSpeed;
    }

    // Usa o mesmo Y lógico que o roadRenderer usa para desenhar
    // a linha branca de parada.
    const stopLineSourceY = stopLine.rawY;

    const stopBuffer = 18;
    const redSlowDistance = 150;
    const yellowSlowDistance = 120;

    const distanceToStopLine = vehicle.y - stopLineSourceY;

    // Se já passou da linha, segue.
    // Isso evita carro travado no cruzamento.
    if (distanceToStopLine <= 0) {
      return baseVehicleSpeed;
    }

    if (trafficLightState.shouldStop) {
      // Vermelho: para antes da linha visual real.
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
      redLightWarningUntil: 0,
      redLightViolationLock: false,
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
        key === 'arrowup' ||
        key === 'arrowdown' ||
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

      if (key === 'w' || key === 'arrowup') {
        inputRef.current.accelerate = true;
      }

      if (key === 's' || key === 'arrowdown') {
        inputRef.current.brake = true;
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();

      if (key === 'w' || key === 'arrowup') {
        inputRef.current.accelerate = false;
      }

      if (key === 's' || key === 'arrowdown') {
        inputRef.current.brake = false;
      }
    };

    const handleWindowBlur = () => {
      inputRef.current.accelerate = false;
      inputRef.current.brake = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
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

  const drawRedLightWarning = useCallback((ctx, s) => {
    if (!s.redLightWarningUntil) return;
    if (s.frameCount > s.redLightWarningUntil) return;

    const remaining =
      s.redLightWarningUntil - s.frameCount;

    const fade = Math.max(
      0,
      Math.min(
        1,
        remaining / RED_LIGHT_WARNING_DURATION
      )
    );

    const alpha = 0.22 + fade * 0.58;

    ctx.save();

    const boxWidth = 138;
    const boxHeight = 28;
    const x = CANVAS_WIDTH - boxWidth - 18;
    const y = 68;

    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.fillRect(x, y, boxWidth, boxHeight);

    ctx.strokeStyle = 'rgba(248, 113, 113, 0.72)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    ctx.fillStyle = '#fecaca';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(
      'SINAL VERMELHO',
      x + boxWidth / 2,
      y + 11
    );

    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(254, 226, 226, 0.78)';

    ctx.fillText(
      'freie antes da faixa',
      x + boxWidth / 2,
      y + 22
    );

    ctx.restore();
  }, []);

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

  }, [drawRedLightWarning]);

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

    const spawnForwardTrafficIfNeeded = () => {
  if (s.frameCount % FORWARD_TRAFFIC_CHECK_INTERVAL !== 0) return;

  const screenY = FORWARD_TRAFFIC_HORIZON_SCREEN_Y;

  const availableLanes = [];

  for (let lane = 0; lane < LANE_COUNT; lane++) {
    if (lane === RESERVED_LEFT_LANE) continue;

    const blocked = s.obstacles.some((o) => {
      if (o.type !== 'car') return false;
      if (o.lane !== lane) return false;

      const projected = projectRoadPoint(o.lane, o.y);

// Marca quando o carro já ficou realmente à frente da moto.
// Não remove carro que acabou de nascer na base.
if (projected.y < s.motoY - 75) {
  o.hasBeenAheadOfMoto = true;
}

// Se o carro já esteve à frente e depois voltou para trás,
// significa que a moto o ultrapassou. Ele deve sair da cena.
const wasOvertakenByMoto =
  o.hasBeenAheadOfMoto &&
  projected.y > s.motoY + 65;

if (wasOvertakenByMoto) {
  return false;
}

return (
  projected.y > VEHICLE_DESPAWN_SCREEN_Y &&
  o.y < VEHICLE_BOTTOM_DESPAWN_Y
);
    });

    if (!blocked) {
      availableLanes.push(lane);
    }
  }

  if (availableLanes.length === 0) return;

  const lane =
    availableLanes[
      Math.floor(Math.random() * availableLanes.length)
    ];

  s.obstacles.push({
    x: getLaneX(lane),
    y: getRoadSourceYForScreenY(screenY),
    lane,
    direction: 'away',
    type: 'car',
    vehicleModel: chooseVehicleModel(),
    color: chooseVehicleColor(),
  });

  s.vehicleSpawnCount++;
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

      const avenueState = getCurrentAvenueState(s);
      const isRedLightZone =
        avenueState &&
        (
          (
            avenueState.type === AVENUE_SEGMENT_TYPES.INTERSECTION_APPROACH &&
            avenueState.progress > 0.68
          ) ||
          (
            avenueState.type === AVENUE_SEGMENT_TYPES.INTERSECTION &&
            avenueState.progress < 0.42
          )
        );

      if (
        s.trafficLightState.shouldStop &&
        isRedLightZone &&
        s.speed > RED_LIGHT_MIN_SPEED_TO_WARN &&
        !s.redLightViolationLock
      ) {
        s.redLightWarningUntil =
          s.frameCount + RED_LIGHT_WARNING_DURATION;

        s.redLightViolationLock = true;
      }

      if (
        !s.trafficLightState.shouldStop ||
        !isTrafficLightZoneActive(avenueState)
      ) {
        s.redLightViolationLock = false;
      }

      s.motoX += (s.targetX - s.motoX) * 0.15;

      spawnForwardTrafficIfNeeded();

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
            (o) =>
              o.lane === lane &&
              Math.abs(o.y - VEHICLE_SPAWN_Y) < VEHICLE_SPAWN_GAP
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

          // Todos os veículos seguem no mesmo sentido da moto.
          const direction = 'away';

          s.obstacles.push({
            x: getLaneX(lane),
            y: VEHICLE_SPAWN_Y,
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

  let lockedAtRedLight = false;

  if (o.type === 'car' && s.trafficLightState.shouldStop) {
    const avenueStateForStop = getCurrentAvenueState(s);

    const stopLine = getStopLineInfo(
      avenueStateForStop,
      CANVAS_HEIGHT,
      'near'
    );

    if (stopLine) {
      const stopBuffer = 18;
      const redSlowDistance = 150;
      const distanceToStopLine = o.y - stopLine.rawY;

      const isBeforeStopLine = distanceToStopLine > 0;
      const isNearStopLine = distanceToStopLine < redSlowDistance;

      if (isBeforeStopLine && isNearStopLine) {
        const nextY = o.y - vehicleSpeed;

        o.y = Math.max(
          stopLine.rawY + stopBuffer,
          nextY
        );

        lockedAtRedLight = true;
      }
    }
  }

  if (!lockedAtRedLight) {
    // Movimento relativo normal:
    // moto parada -> carro sobe;
    // moto acelerando -> carro sobe mais devagar;
    // moto muito rápida -> carro pode parecer descer.
    const relativeVehicleSpeed =
      vehicleSpeed - s.speed * VEHICLE_MOTO_INFLUENCE;

    o.y -= relativeVehicleSpeed;
  }

  const projected = projectRoadPoint(o.lane, o.y);

  return (
    projected.y > VEHICLE_DESPAWN_SCREEN_Y &&
    o.y < VEHICLE_BOTTOM_DESPAWN_Y
  );
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