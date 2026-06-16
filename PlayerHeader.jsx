import React from 'react';
import { Coins, User } from 'lucide-react';

export default function PlayerHeader({ player }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Piloto</p>
          <p className="font-heading text-sm font-bold text-foreground">
            {player?.nome_usuario || 'Novato'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-muted/60 rounded-full px-4 py-2 border border-primary/20">
        <Coins className="w-4 h-4 text-primary" />
        <span className="font-heading text-sm font-bold text-primary">
          {(player?.moedas_acumuladas || 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}