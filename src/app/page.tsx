'use client';

import dynamic from 'next/dynamic';
import { Gamepad2 } from 'lucide-react';

// Динамический импорт игры без SSR
const Game = dynamic(
  () => import('@/game/Game').then(mod => mod.Game),
  { 
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="flex animate-pulse flex-col items-center gap-4">
          <Gamepad2 className="h-16 w-16 text-pink-500" />
          <p className="font-mono text-xl text-pink-500">
            Загрузка игры...
          </p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main 
      className="flex min-h-screen flex-col items-center justify-center bg-black"
      style={{
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* Игра */}
      <Game />
    </main>
  );
}
