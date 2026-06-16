import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function MusicControl({ isMuted, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-card/70 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-card transition-colors"
      title={isMuted ? 'Ligar música' : 'Desligar música'}
    >
      {isMuted
        ? <VolumeX className="w-4 h-4 text-muted-foreground" />
        : <Volume2 className="w-4 h-4 text-primary" />
      }
    </button>
  );
}