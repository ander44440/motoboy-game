import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function StartButton() {
  return (
    <div className="flex justify-center my-8 px-5">
      <Link
        to="/jogo"
        className="group relative w-full max-w-xs"
      >
        <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl group-hover:bg-primary/50 transition-all duration-300" />
        <div className="relative flex items-center justify-center gap-3 bg-primary text-primary-foreground font-heading font-black text-lg uppercase tracking-wider py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150 shadow-lg shadow-primary/25">
          <Zap className="w-6 h-6" />
          DAR A MARCHA
          <Zap className="w-6 h-6" />
        </div>
      </Link>
    </div>
  );
}