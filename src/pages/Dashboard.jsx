import { skinsData } from '@/data/skins';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import PlayerHeader from '@/components/dashboard/PlayerHeader';
import RecordCard from '@/components/dashboard/RecordCard';
import StartButton from '@/components/dashboard/StartButton';
import QuickStats from '@/components/dashboard/QuickStats';

import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [player, setPlayer] = useState({
    nome_usuario: 'Jogador',
    moedas_acumuladas: 0,
    recorde_distancia: 0,
    motos_possuidas: [],
    moto_atual_id: null,
  });

  const { data: races = [], isLoading } = useQuery({
    queryKey: ['my-races'],
    queryFn: async () => {
      return [];
    },
  });

 

  useEffect(() => {
    const savedPlayer = localStorage.getItem('motoboy-player');

    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer));
    }
  }, []);

  const motoNome =
  skinsData.find(
    (s) => s.id === player?.moto_atual_id
  )?.nome || 'Moto Inicial';
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PlayerHeader player={player} />

      <div className="px-5 py-6 text-center">
        <h1 className="font-heading text-3xl font-black text-foreground leading-tight">
          MOTOBOY
        </h1>

        <p className="font-heading text-lg text-primary tracking-widest">
          CORRE SP
        </p>

        <p className="text-muted-foreground text-xs mt-2">
          Desvie dos carros, colete moedas e bata seu recorde!
        </p>
      </div>

      <RecordCard recorde={player?.recorde_distancia} />

      <StartButton />

      <QuickStats
        totalCorridas={races.length}
        motoNome={motoNome}
      />
    </div>
  );
}