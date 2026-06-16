import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';

export default function RecordCard({ recorde }) {
  return (
    <div className="mx-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-secondary/10 border border-primary/20 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-primary" />
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Seu Recorde</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="font-heading text-4xl font-black text-foreground leading-none">
          {(recorde || 0).toLocaleString()}
        </span>
        <span className="text-muted-foreground text-sm mb-1">metros</span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-secondary text-xs">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>Continue correndo para bater seu recorde!</span>
      </div>
    </div>
  );
}