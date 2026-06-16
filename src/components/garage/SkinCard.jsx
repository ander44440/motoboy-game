import React from 'react';
import { Button } from '@/components/ui/button';
import { Coins, Check, Bike, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SkinCard({ skin, isOwned, isEquipped, canAfford, onBuy, onEquip, isBuying, isEquipping }) {
  return (
    <div className={cn(
      "rounded-2xl border p-4 transition-all duration-200",
      isEquipped 
        ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/10" 
        : "bg-card border-border hover:border-muted-foreground/30"
    )}>
      {/* Moto Image */}
      <div className="relative aspect-[4/3] rounded-xl bg-muted/40 mb-3 flex items-center justify-center overflow-hidden">
        {skin.imagem_url ? (
          <img src={skin.imagem_url} alt={skin.nome} className="w-full h-full object-contain p-2" />
        ) : (
          <Bike className="w-16 h-16 text-muted-foreground/30" />
        )}
        {isEquipped && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-heading font-bold uppercase px-2 py-1 rounded-full">
            Equipada
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="font-heading text-sm font-bold text-foreground">{skin.nome}</h3>
      {skin.velocidade_bonus > 0 && (
        <p className="text-[10px] text-secondary uppercase tracking-wider mt-0.5">
          +{skin.velocidade_bonus}% velocidade
        </p>
      )}

      {/* Action */}
      <div className="mt-3">
        {isEquipped ? (
          <div className="flex items-center justify-center gap-1.5 text-primary text-xs font-semibold py-2">
            <Check className="w-4 h-4" />
            Em uso
          </div>
        ) : isOwned ? (
          <Button
            onClick={() => onEquip(skin.id)}
            disabled={isEquipping}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-heading font-bold uppercase text-xs"
            size="sm"
          >
            {isEquipping
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : 'Equipar'
            }
          </Button>
        ) : (
          <Button
            onClick={() => onBuy(skin)}
            disabled={!canAfford || isBuying}
            className={cn(
              "w-full font-heading font-bold uppercase text-xs",
              canAfford
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            )}
            size="sm"
          >
            {isBuying
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <><Coins className="w-3.5 h-3.5 mr-1.5" />{skin.preco_moedas?.toLocaleString()}</>
            }
          </Button>
        )}
      </div>
    </div>
  );
}