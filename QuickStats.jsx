import React from 'react';
import { Bike, Clock, Coins } from 'lucide-react';

export default function QuickStats({ totalCorridas, motoNome }) {
  const stats = [
    { icon: Bike, label: 'Moto Atual', value: motoNome || 'CG 160' },
    { icon: Clock, label: 'Corridas', value: totalCorridas || 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-5 mt-5">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
          </div>
          <p className="font-heading text-sm font-bold text-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}