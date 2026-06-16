import React from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function GameOverModal({ distance, coins, isNewRecord, onRestart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 15 }}
        className="bg-card border border-border rounded-3xl p-6 mx-4 w-full max-w-sm text-center"
      >
        <h2 className="font-heading text-2xl font-black text-foreground uppercase mb-1">
          Game Over
        </h2>
        <p className="text-muted-foreground text-xs mb-6">Mais sorte na próxima, piloto!</p>

        {isNewRecord && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl py-2 px-4 mb-4 inline-flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="font-heading text-xs font-bold text-primary uppercase">Novo Recorde!</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Distância</p>
            <p className="font-heading text-xl font-black text-foreground">{distance.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">metros</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Moedas</p>
            <p className="font-heading text-xl font-black text-primary">{coins}</p>
            <p className="text-[10px] text-muted-foreground">coletadas</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={onRestart}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold uppercase"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Jogar Novamente
          </Button>
          <Link to="/" className="block">
            <Button variant="outline" className="w-full font-heading font-bold uppercase text-xs">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Lobby
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}