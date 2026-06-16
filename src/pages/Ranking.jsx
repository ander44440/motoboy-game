import React from 'react';
import { useQuery } from '@tanstack/react-query';

import RankingTable from '@/components/ranking/RankingTable';

import { Trophy, Loader2 } from 'lucide-react';

export default function Ranking() {
  const { data: ranking = [], isLoading } = useQuery({
    queryKey: ['ranking'],
    queryFn: async () => {
      return [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-primary" />

          <h1 className="font-heading text-xl font-black uppercase">
            Ranking
          </h1>
        </div>

        <p className="text-muted-foreground text-sm">
          Os melhores motoboys da cidade
        </p>
      </div>

      <RankingTable players={ranking} />

      {ranking.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />

          <p className="text-muted-foreground text-sm">
            Nenhum ranking disponível ainda.
          </p>
        </div>
      )}
    </div>
  );
}