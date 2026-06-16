import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Trophy, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Lobby' },
  { path: '/garagem', icon: Wrench, label: 'Garagem' },
  { path: '/ranking', icon: Trophy, label: 'Ranking' },
];

export default function GameLayout() {
  const location = useLocation();
  const isGamePage = location.pathname === '/jogo';

  if (isGamePage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_hsl(48,100%,50%)]")} />
                <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}