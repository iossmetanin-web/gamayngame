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
          <Gamepad2 className="h-16 w-16 text-red-500" />
          <p className="font-mono text-xl text-red-500">
            Загрузка игры...
          </p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      {/* Игра */}
      <Game />
      
      {/* Подпись */}
      <div className="mt-4 text-center">
        <p 
          className="font-mono text-sm text-gray-600"
          style={{ fontFamily: 'monospace' }}
        >
          Злобные Гамаюны © 2024
        </p>
      </div>
    </main>
  );
}
