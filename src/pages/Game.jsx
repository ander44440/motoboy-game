import { skinsData } from '@/data/skins';

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import GameCanvas from '@/components/game/GameCanvas';
import GameHUD from '@/components/game/GameHUD';
import GameOverModal from '@/components/game/GameOverModal';
import MobileControls from '@/components/game/MobileControls';
import MusicControl from '@/components/game/MusicControl';

import { Link } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  startSurfMusic,
  stopSurfMusic,
  setSurfMusicVolume,
} from '@/lib/surfMusic';

const PLAYER_STORAGE_KEY = 'motoboy-player';

const defaultPlayer = {
  nome_usuario: 'Jogador',
  moedas_acumuladas: 0,
  motos_possuidas: [1],
  moto_atual_id: 1,
  recorde_distancia: 0,
};

export default function Game() {
  const [gameState, setGameState] = useState('idle');
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [finalDistance, setFinalDistance] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [motoColor, setMotoColor] = useState('#22c55e');

  const playerRef = useRef(defaultPlayer);

  // refs para scale wrapper
  const wrapperRef = useRef(null);

  useEffect(() => {
    let savedPlayer = localStorage.getItem(PLAYER_STORAGE_KEY);

    if (!savedPlayer) {
      localStorage.setItem(
        PLAYER_STORAGE_KEY,
        JSON.stringify(defaultPlayer)
      );
      savedPlayer = JSON.stringify(defaultPlayer);
    }

    const playerData = JSON.parse(savedPlayer);
    playerRef.current = playerData;

    const motoAtual = skinsData.find(
      (skin) => skin.id === playerData.moto_atual_id
    );

    if (motoAtual?.cor) {
      setMotoColor(motoAtual.cor);
    }
  }, []);

  const handleScoreUpdate = useCallback((dist, coinCount) => {
    setDistance(dist);
    setCoins(coinCount);
  }, []);

  const handleGameOver = useCallback((dist, coinCount) => {
    setFinalDistance(dist);
    setFinalCoins(coinCount);
    setGameState('over');

    const savedPlayer = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!savedPlayer) return;

    const player = JSON.parse(savedPlayer);
    const currentRecord = player.recorde_distancia || 0;

    const newRecord = dist > currentRecord;
    setIsNewRecord(newRecord);

    const updatedPlayer = {
      ...player,
      moedas_acumuladas:
        (player.moedas_acumuladas || 0) + coinCount,
      recorde_distancia: newRecord ? dist : currentRecord,
    };

    localStorage.setItem(
      PLAYER_STORAGE_KEY,
      JSON.stringify(updatedPlayer)
    );

    playerRef.current = updatedPlayer;
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      startSurfMusic(isMuted ? 0 : 0.45);
    } else {
      stopSurfMusic();
    }

    return () => stopSurfMusic();
  }, [gameState, isMuted]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSurfMusicVolume(next ? 0 : 0.45);
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const dispatchKey = (key) => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key })
    );
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">

      {/* BOTÃO VOLTAR */}
      <div className="absolute top-4 left-4 z-50">
        <Link to="/" onClick={() => stopSurfMusic()}>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* MÚSICA */}
      {(gameState === 'playing' || gameState === 'over') && (
        <MusicControl
          isMuted={isMuted}
          onToggle={handleToggleMute}
        />
      )}

      {/* TELA INICIAL */}
      {gameState === 'idle' && (
        <div className="text-center z-30">
          <h1 className="font-heading text-4xl font-black text-foreground mb-2">
            MOTOBOY
          </h1>

          <p className="font-heading text-lg text-primary tracking-widest mb-8">
            CORRE SP
          </p>

          <Button
            onClick={() => setGameState('playing')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-black text-lg uppercase px-8 py-6"
          >
            <Play className="w-5 h-5 mr-2" />
            JOGAR
          </Button>

          <p className="text-muted-foreground text-xs mt-4">
            Use ← → ou deslize para mudar de faixa
          </p>
        </div>
      )}

      {/* 🎯 GAME COM SCALE WRAPPER REAL */}
      {(gameState === 'playing' || gameState === 'over') && (
        <div className="w-full h-screen flex items-center justify-center bg-black">

          {/* SCALE WRAPPER */}
          <div
            ref={wrapperRef}
            className="relative"
            style={{
              width: '900px',
              height: '700px',
              transform: 'scale(min(1, 100vw / 900, 100vh / 600))',
              transformOrigin: 'center',
            }}
          >

            <GameHUD distance={distance} coins={coins} />

            <GameCanvas
              onScoreUpdate={handleScoreUpdate}
              onGameOver={handleGameOver}
              gameState={gameState}
              motoColor={motoColor}
            />

            {gameState === 'playing' && (
              <MobileControls
                onLeft={() => dispatchKey('ArrowLeft')}
                onRight={() => dispatchKey('ArrowRight')}
              />
            )}

            {gameState === 'over' && (
              <GameOverModal
                distance={finalDistance}
                coins={finalCoins}
                isNewRecord={isNewRecord}
                onRestart={handleRestart}
              />
            )}

          </div>
        </div>
      )}
    </div>
  );
}