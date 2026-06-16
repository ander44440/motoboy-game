import React from 'react';
import { Trophy, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

const medals = ['🥇', '🥈', '🥉'];

export default function RankingTable({ players, sortBy = 'distancia', currentUserId }) {
  const sorted = [...players].sort((a, b) => {
    if (sortBy === 'distancia') return (b.recorde_distancia || 0) - (a.recorde_distancia || 0);
    return (b.moedas_acumuladas || 0) - (a.moedas_acumuladas || 0);
  });

  return (
    <div className="space-y-2">
      {sorted.map((player, idx) => {
        const isMe = player.created_by === currentUserId;
        return (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
              idx === 0
                ? "bg-primary/15 border-primary/40 shadow-sm shadow-primary/10"
                : idx === 1
                ? "bg-muted/60 border-border"
                : idx === 2
                ? "bg-accent/5 border-accent/20"
                : "bg-card border-border",
              isMe && "ring-1 ring-primary/50"
            )}
          >
            <div className="w-8 text-center flex-shrink-0">
              {idx < 3 ? (
                <span className="text-lg">{medals[idx]}</span>
              ) : (
                <span className="font-heading text-xs text-muted-foreground font-bold">{idx + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-sm font-bold text-foreground truncate">
                {player.nome_usuario || 'Anônimo'}
                {isMe && <span className="ml-1 text-[10px] text-primary font-semibold">(você)</span>}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {sortBy === 'distancia' ? (
                <p className="font-heading text-sm font-bold text-foreground">
                  {(player.recorde_distancia || 0).toLocaleString()}
                  <span className="text-muted-foreground text-xs ml-1">m</span>
                </p>
              ) : (
                <p className="font-heading text-sm font-bold text-primary flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  {(player.moedas_acumuladas || 0).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        );
      })}
      {players.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum piloto ainda. Seja o primeiro!</p>
        </div>
      )}
    </div>
  );
}