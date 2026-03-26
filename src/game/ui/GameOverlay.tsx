'use client';

import { useEffect, useCallback } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { playSound } from '../utils/sounds';

// ============================================
// GAME OVER ЭКРАН
// ============================================

interface GameOverScreenProps {
  onRestart: () => void;
  stats?: {
    level: number;
    enemiesDefeated: number;
    gameTime: number;
  };
}

export function GameOverScreen({ onRestart, stats }: GameOverScreenProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      playSound('select', 0.5);
      onRestart();
    }
  }, [onRestart]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
      }}
    >
      <div className="text-center">
        {/* Заголовок */}
        <h1 
          className="text-5xl font-bold md:text-6xl"
          style={{
            fontFamily: 'monospace',
            color: '#aa2222',
            textShadow: '0 0 20px #ff0000, 4px 4px 0 #000',
          }}
        >
          GAME OVER
        </h1>
        
        {/* Подзаголовок */}
        <p 
          className="mt-4 text-xl"
          style={{
            fontFamily: 'monospace',
            color: '#888888',
          }}
        >
          Ты стал жертвой гамаюнов...
        </p>
        
        {/* Статистика */}
        {stats && (
          <div 
            className="mt-8 rounded-lg p-4"
            style={{
              backgroundColor: 'rgba(50, 30, 30, 0.8)',
              border: '2px solid #aa2222',
            }}
          >
            <div className="space-y-2" style={{ fontFamily: 'monospace' }}>
              <p style={{ color: '#ffaa22' }}>Уровень: {stats.level}</p>
              <p style={{ color: '#ff6644' }}>Врагов побеждено: {stats.enemiesDefeated}</p>
              <p style={{ color: '#66aaff' }}>Время: {formatTime(stats.gameTime)}</p>
            </div>
          </div>
        )}
        
        {/* Кнопка */}
        <button
          onClick={() => {
            playSound('select', 0.5);
            onRestart();
          }}
          className="mt-8 px-8 py-3 font-bold text-lg uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            fontFamily: 'monospace',
            backgroundColor: '#aa2222',
            color: '#ffffff',
            border: '4px solid #441111',
            boxShadow: '0 4px 0 #330000',
          }}
        >
          НАЧАТЬ ЗАНОВО
        </button>
        
        <p 
          className="mt-4 text-sm opacity-50"
          style={{ fontFamily: 'monospace', color: '#666666' }}
        >
          Нажмите ENTER или ПРОБЕЛ
        </p>
      </div>
    </div>
  );
}

// ============================================
// VICTORY ЭКРАН
// ============================================

interface VictoryScreenProps {
  onRestart: () => void;
  stats?: {
    level: number;
    enemiesDefeated: number;
    gameTime: number;
  };
}

export function VictoryScreen({ onRestart, stats }: VictoryScreenProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      playSound('select', 0.5);
      onRestart();
    }
  }, [onRestart]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 20, 0, 0.9)',
      }}
    >
      <div className="text-center">
        {/* Заголовок */}
        <h1 
          className="text-5xl font-bold md:text-6xl"
          style={{
            fontFamily: 'monospace',
            color: '#22aa44',
            textShadow: '0 0 20px #00ff00, 4px 4px 0 #000',
          }}
        >
          ПОБЕДА!
        </h1>
        
        {/* Подзаголовок */}
        <p 
          className="mt-4 text-xl"
          style={{
            fontFamily: 'monospace',
            color: '#88aa88',
          }}
        >
          Все гамаюны повержены!
          <br />
          Район теперь под твоим контролем!
        </p>
        
        {/* Статистика */}
        {stats && (
          <div 
            className="mx-auto mt-8 max-w-sm rounded-lg p-4"
            style={{
              backgroundColor: 'rgba(20, 50, 20, 0.8)',
              border: '2px solid #22aa44',
            }}
          >
            <div className="space-y-2" style={{ fontFamily: 'monospace' }}>
              <p style={{ color: '#ffaa22' }}>Финальный уровень: {stats.level}</p>
              <p style={{ color: '#ff6644' }}>Врагов побеждено: {stats.enemiesDefeated}</p>
              <p style={{ color: '#66aaff' }}>Время: {formatTime(stats.gameTime)}</p>
            </div>
          </div>
        )}
        
        {/* Кнопка */}
        <button
          onClick={() => {
            playSound('select', 0.5);
            onRestart();
          }}
          className="mt-8 px-8 py-3 font-bold text-lg uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            fontFamily: 'monospace',
            backgroundColor: '#22aa44',
            color: '#ffffff',
            border: '4px solid #115522',
            boxShadow: '0 4px 0 #003300',
          }}
        >
          ИГРАТЬ ЕЩЁ
        </button>
        
        <p 
          className="mt-4 text-sm opacity-50"
          style={{ fontFamily: 'monospace', color: '#666666' }}
        >
          Нажмите ENTER или ПРОБЕЛ
        </p>
      </div>
    </div>
  );
}

// ============================================
// PAUSE MENU
// ============================================

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
}

export function PauseMenu({ onResume, onRestart }: PauseMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const options = ['Продолжить', 'Начать заново'];
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
      playSound('select', 0.2);
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      setSelectedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
      playSound('select', 0.2);
    } else if (e.code === 'Enter' || e.code === 'Space') {
      playSound('select', 0.5);
      if (selectedIndex === 0) {
        onResume();
      } else {
        onRestart();
      }
    } else if (e.code === 'Escape') {
      onResume();
    }
  }, [selectedIndex, onResume, onRestart]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
    >
      <div 
        className="rounded-lg p-6"
        style={{
          backgroundColor: '#1a1a1a',
          border: '4px solid #444444',
        }}
      >
        <h2 
          className="mb-6 text-center text-3xl font-bold"
          style={{
            fontFamily: 'monospace',
            color: '#ffffff',
            textShadow: '2px 2px 0 #000',
          }}
        >
          ПАУЗА
        </h2>
        
        <div className="space-y-2">
          {options.map((option, index) => (
            <button
              key={option}
              onClick={() => {
                playSound('select', 0.5);
                if (index === 0) {
                  onResume();
                } else {
                  onRestart();
                }
              }}
              className="w-full rounded px-8 py-3 text-left transition-all duration-100"
              style={{
                fontFamily: 'monospace',
                backgroundColor: index === selectedIndex ? '#aa2222' : '#333333',
                color: '#ffffff',
                border: index === selectedIndex ? '2px solid #ff4444' : '2px solid transparent',
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {option}
            </button>
          ))}
        </div>
        
        <p 
          className="mt-4 text-center text-sm opacity-50"
          style={{ fontFamily: 'monospace', color: '#888888' }}
        >
          ESC - продолжить
        </p>
      </div>
    </div>
  );
}

// ============================================
// УТИЛИТЫ
// ============================================

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
