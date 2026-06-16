import React from 'react';
import { Coins, Gauge } from 'lucide-react';

export default function GameHUD({ distance, coins }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between items-start pointer-events-none">
      <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-secondary" />
          <span className="font-heading text-sm font-bold text-foreground">{distance.toLocaleString()}m</span>
        </div>
      </div>
      <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-primary" />
          <span className="font-heading text-sm font-bold text-primary">{coins}</span>
        </div>
      </div>
    </div>
  );
}