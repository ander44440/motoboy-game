import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MobileControls({ onLeft, onRight }) {
  return (
    <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-between px-6 pointer-events-none md:hidden">
      <button
        onTouchStart={(e) => { e.preventDefault(); onLeft(); }}
        onClick={onLeft}
        className="pointer-events-auto w-16 h-16 rounded-full bg-card/60 backdrop-blur-sm border border-border flex items-center justify-center active:bg-primary/20 transition-colors"
      >
        <ChevronLeft className="w-8 h-8 text-foreground" />
      </button>
      <button
        onTouchStart={(e) => { e.preventDefault(); onRight(); }}
        onClick={onRight}
        className="pointer-events-auto w-16 h-16 rounded-full bg-card/60 backdrop-blur-sm border border-border flex items-center justify-center active:bg-primary/20 transition-colors"
      >
        <ChevronRight className="w-8 h-8 text-foreground" />
      </button>
    </div>
  );
}