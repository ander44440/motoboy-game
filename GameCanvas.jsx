import React, { useRef, useEffect, useCallback } from 'react';
import { playCoinSound, playStarSound, playGameOverSound, playLaneChangeSound, resumeAudioContext } from '@/lib/soundEffects';

const LANE_COUNT = 3;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;
const MOTO_WIDTH = 40;
const MOTO_HEIGHT = 70;
const OBSTACLE_WIDTH = 45;
const OBSTACLE_HEIGHT = 45;
const COIN_SIZE = 20;
const STAR_SIZE = 26;

// Star tiers: value in coins
const STAR_TIERS = [
  { value: 200, color: '#60a5fa', glow: '#3b82f6', label: '200' },
  { value: 400, color: '#f59e0b', glow: '#fbbf24', label: '400' },
  { value: 600, color: '#a855f7', glow: '#c084fc', label: '600' },
];

export default function GameCanvas({ onScoreUpdate, onGameOver, gameState, motoColor }) {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const stateRef = useRef(null);
  const touchStartRef = useRef(null);

  const getLaneX = useCallback((lane) => {
    const laneWidth = CANVAS_WIDTH / LANE_COUNT;
    return laneWidth * lane + laneWidth / 2;
  }, []);

  const initState = useCallback(() => {
    return {
      lane: 1,
      targetX: getLaneX(1),
      motoX: getLaneX(1),
      motoY: CANVAS_HEIGHT - 120,
      obstacles: [],
      coins: [],
      stars: [],
      roadLines: [0, 100, 200, 300, 400, 500, 600],
      score: 0,
      coinsCollected: 0,
      speed: 4,
      frameCount: 0,
      gameOver: false,
      buildings: generateBuildings(),
    };
  }, [getLaneX]);

  function generateBuildings() {
    const buildings = [];
    for (let i = 0; i < 12; i++) {
      buildings.push({
        x: Math.random() > 0.5 ? -30 - Math.random() * 40 : CANVAS_WIDTH + Math.random() * 40,
        y: i * 70 - 100,
        w: 25 + Math.random() * 30,
        h: 40 + Math.random() * 60,
        color: `hsl(220, ${10 + Math.random() * 10}%, ${8 + Math.random() * 8}%)`,
        windows: Math.floor(2 + Math.random() * 3),
      });
    }
    return buildings;
  }

  const handleInput = useCallback((direction) => {
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
  }, [getLaneX]);

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

  const handleTouchEnd = useCallback((e) => {
    if (touchStartRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartRef.current;
    if (Math.abs(diff) > 30) {
      handleInput(diff < 0 ? 'left' : 'right');
    }
    touchStartRef.current = null;
  }, [handleInput]);

  const drawStar = useCallback((ctx, x, y, tier, pulse) => {
    const t = STAR_TIERS[tier];
    const radius = STAR_SIZE / 2 + Math.sin(pulse) * 2;
    // Glow
    ctx.shadowColor = t.glow;
    ctx.shadowBlur = 18;
    // Draw 5-point star
    ctx.fillStyle = t.color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const angleIn = angle + (2 * Math.PI) / 10;
      if (i === 0) ctx.moveTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
      else ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
      ctx.lineTo(x + (radius * 0.45) * Math.cos(angleIn), y + (radius * 0.45) * Math.sin(angleIn));
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // Value label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(t.label, x, y + 4);
  }, []);

  const drawGame = useCallback((ctx, s, color) => {
    // Background
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Buildings
    s.buildings.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = 'rgba(255,200,50,0.15)';
      for (let wy = 0; wy < b.windows; wy++) {
        for (let wx = 0; wx < 2; wx++) {
          ctx.fillRect(b.x + 4 + wx * 12, b.y + 5 + wy * 14, 6, 8);
        }
      }
    });

    // Road surface
    const roadLeft = 30;
    const roadRight = CANVAS_WIDTH - 30;
    ctx.fillStyle = '#1a1f2e';
    ctx.fillRect(roadLeft, 0, roadRight - roadLeft, CANVAS_HEIGHT);

    // Road edges
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(roadLeft, 0); ctx.lineTo(roadLeft, CANVAS_HEIGHT); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(roadRight, 0); ctx.lineTo(roadRight, CANVAS_HEIGHT); ctx.stroke();

    // Lane dividers
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    for (let i = 1; i < LANE_COUNT; i++) {
      const lx = roadLeft + (roadRight - roadLeft) / LANE_COUNT * i;
      s.roadLines.forEach(ly => {
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + 20); ctx.stroke();
      });
    }
    ctx.setLineDash([]);

    // Stars
    s.stars.forEach(star => {
      drawStar(ctx, star.x, star.y, star.tier, s.frameCount * 0.1);
    });

    // Coins
    s.coins.forEach(coin => {
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, COIN_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#b38f00';
      ctx.font = 'bold 10px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('$', coin.x, coin.y + 4);
    });

    // Obstacles
    s.obstacles.forEach(obs => {
      if (obs.type === 'car') {
        ctx.fillStyle = obs.color;
        const carW = OBSTACLE_WIDTH;
        const carH = OBSTACLE_HEIGHT + 20;
        ctx.beginPath();
        ctx.roundRect(obs.x - carW / 2, obs.y - carH / 2, carW, carH, 6);
        ctx.fill();
        ctx.fillStyle = 'rgba(100,180,255,0.3)';
        ctx.fillRect(obs.x - carW / 2 + 5, obs.y - carH / 2 + 5, carW - 10, 12);
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(obs.x - carW / 2 + 2, obs.y + carH / 2 - 6, 8, 4);
        ctx.fillRect(obs.x + carW / 2 - 10, obs.y + carH / 2 - 6, 8, 4);
      } else {
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y - 20);
        ctx.lineTo(obs.x - 12, obs.y + 10);
        ctx.lineTo(obs.x + 12, obs.y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(obs.x - 8, obs.y - 5, 16, 4);
      }
    });

    // Moto
    const mx = s.motoX;
    const my = s.motoY;
    const motoCol = color || '#22c55e';
    ctx.fillStyle = motoCol;
    ctx.shadowColor = motoCol;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(mx - MOTO_WIDTH / 2, my - MOTO_HEIGHT / 2, MOTO_WIDTH, MOTO_HEIGHT, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(mx, my - MOTO_HEIGHT / 2 + 14, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(mx, my - MOTO_HEIGHT / 2, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#333';
    ctx.fillRect(mx - MOTO_WIDTH / 2 - 3, my - MOTO_HEIGHT / 2 + 5, 5, 15);
    ctx.fillRect(mx + MOTO_WIDTH / 2 - 2, my - MOTO_HEIGHT / 2 + 5, 5, 15);
    ctx.fillRect(mx - MOTO_WIDTH / 2 - 3, my + MOTO_HEIGHT / 2 - 20, 5, 15);
    ctx.fillRect(mx + MOTO_WIDTH / 2 - 2, my + MOTO_HEIGHT / 2 - 20, 5, 15);

  }, [drawStar]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    resumeAudioContext();

    stateRef.current = initState();
    const s = stateRef.current;
    const carColors = ['#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#ffffff', '#6b7280'];

    const loop = () => {
      if (s.gameOver) return;

      s.frameCount++;
      s.speed = Math.min(14, 4 + Math.floor(s.frameCount / 200) * 0.5);
      s.score = Math.floor(s.frameCount / 4);

      // Smooth lane transition
      s.motoX += (s.targetX - s.motoX) * 0.15;

      // Road lines
      s.roadLines = s.roadLines.map(y => {
        y += s.speed;
        if (y > CANVAS_HEIGHT) y -= CANVAS_HEIGHT + 100;
        return y;
      });

      // Buildings
      s.buildings.forEach(b => {
        b.y += s.speed * 0.3;
        if (b.y > CANVAS_HEIGHT + 100) { b.y = -100; b.h = 40 + Math.random() * 60; }
      });

      // Spawn obstacles
      if (s.frameCount % Math.max(30, 60 - Math.floor(s.speed * 2)) === 0) {
        const lane = Math.floor(Math.random() * LANE_COUNT);
        s.obstacles.push({
          x: getLaneX(lane), y: -60, lane,
          type: Math.random() > 0.3 ? 'car' : 'cone',
          color: carColors[Math.floor(Math.random() * carColors.length)],
        });
      }

      // Spawn regular coins
      if (s.frameCount % 45 === 0) {
        const lane = Math.floor(Math.random() * LANE_COUNT);
        const blocked = s.obstacles.some(o => o.lane === lane && o.y < 50);
        if (!blocked) s.coins.push({ x: getLaneX(lane), y: -20, lane });
      }

      // Spawn stars (rare, ~every 300 frames)
      if (s.frameCount % 300 === 0) {
        const lane = Math.floor(Math.random() * LANE_COUNT);
        const tier = Math.random() < 0.5 ? 0 : Math.random() < 0.7 ? 1 : 2; // 50% 200, 35% 400, 15% 600
        s.stars.push({ x: getLaneX(lane), y: -30, lane, tier });
      }

      // Move obstacles
      s.obstacles = s.obstacles.filter(o => { o.y += s.speed; return o.y < CANVAS_HEIGHT + 100; });

      // Move coins
      s.coins = s.coins.filter(c => { c.y += s.speed; return c.y < CANVAS_HEIGHT + 50; });

      // Move stars
      s.stars = s.stars.filter(star => { star.y += s.speed; return star.y < CANVAS_HEIGHT + 50; });

      // Collect coins
      s.coins = s.coins.filter(c => {
        if (Math.abs(c.x - s.motoX) < 30 && Math.abs(c.y - s.motoY) < 40) {
          s.coinsCollected++;
          playCoinSound();
          return false;
        }
        return true;
      });

      // Collect stars
      s.stars = s.stars.filter(star => {
        if (Math.abs(star.x - s.motoX) < 32 && Math.abs(star.y - s.motoY) < 40) {
          const bonus = STAR_TIERS[star.tier].value;
          s.coinsCollected += bonus;
          playStarSound(star.tier);
          return false;
        }
        return true;
      });

      // Collision detection
      for (const obs of s.obstacles) {
        const hitW = obs.type === 'car' ? 35 : 20;
        const hitH = obs.type === 'car' ? 45 : 25;
        if (Math.abs(obs.x - s.motoX) < hitW && Math.abs(obs.y - s.motoY) < hitH) {
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
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState, initState, getLaneX, drawGame, onScoreUpdate, onGameOver, motoColor]);

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