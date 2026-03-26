'use client';

import { useState, useCallback, useEffect } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { playSound } from '../utils/sounds';
import type { Player, Upgrade } from '../types';

// ============================================
// МЕНЮ ПРОКАЧКИ
// ============================================

interface UpgradeMenuProps {
  player: Player;
  upgrades: Upgrade[];
  onUpgrade: (upgradeId: string) => void;
  upgradePoints: number;
}

export function UpgradeMenu({ player, upgrades, onUpgrade, upgradePoints }: UpgradeMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Обработка клавиатуры
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (upgradePoints <= 0) return;
    
    const availableUpgrades = upgrades.filter(u => u.currentLevel < u.maxLevel);
    
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : availableUpgrades.length - 1));
      playSound('select', 0.2);
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      setSelectedIndex(prev => (prev < availableUpgrades.length - 1 ? prev + 1 : 0));
      playSound('select', 0.2);
    } else if (e.code === 'Enter' || e.code === 'Space') {
      const upgrade = availableUpgrades[selectedIndex];
      if (upgrade && upgrade.currentLevel < upgrade.maxLevel) {
        onUpgrade(upgrade.id);
      }
    }
  }, [upgrades, selectedIndex, onUpgrade, upgradePoints]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  const availableUpgrades = upgrades.filter(u => u.currentLevel < u.maxLevel);
  
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
          width: Math.min(450, GAME_WIDTH - 40),
        }}
      >
        {/* Заголовок */}
        <div className="mb-4 text-center">
          <h2 
            className="text-2xl font-bold"
            style={{
              fontFamily: 'monospace',
              color: '#ffaa22',
              textShadow: '2px 2px 0 #000',
            }}
          >
            УРОВЕНЬ {player.level}!
          </h2>
          <p 
            className="mt-2"
            style={{
              fontFamily: 'monospace',
              color: '#ffffff',
            }}
          >
            Очки улучшения: {upgradePoints}
          </p>
        </div>
        
        {/* Список улучшений */}
        <div className="space-y-2">
          {upgrades.map((upgrade, index) => {
            const isAvailable = upgrade.currentLevel < upgrade.maxLevel;
            const isSelected = availableUpgrades.indexOf(upgrade) === selectedIndex && isAvailable;
            
            return (
              <button
                key={upgrade.id}
                onClick={() => {
                  if (isAvailable && upgradePoints > 0) {
                    onUpgrade(upgrade.id);
                  }
                }}
                className="w-full rounded p-3 text-left transition-all duration-100"
                style={{
                  backgroundColor: isSelected ? '#332222' : '#222222',
                  border: isSelected ? '2px solid #aa2222' : '2px solid #333333',
                  opacity: isAvailable ? 1 : 0.4,
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={() => isAvailable && setSelectedIndex(availableUpgrades.indexOf(upgrade))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{upgrade.icon}</span>
                    <div>
                      <p 
                        className="font-bold"
                        style={{
                          fontFamily: 'monospace',
                          color: '#ffffff',
                        }}
                      >
                        {upgrade.name}
                      </p>
                      <p 
                        className="text-sm opacity-60"
                        style={{
                          fontFamily: 'monospace',
                          color: '#aaaaaa',
                        }}
                      >
                        {upgrade.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p 
                      className="font-bold"
                      style={{
                        fontFamily: 'monospace',
                        color: '#ffaa22',
                      }}
                    >
                      {upgrade.currentLevel}/{upgrade.maxLevel}
                    </p>
                    {/* Полоска прогресса */}
                    <div 
                      className="mt-1 h-2 w-16 rounded"
                      style={{ backgroundColor: '#333333' }}
                    >
                      <div 
                        className="h-full rounded"
                        style={{
                          backgroundColor: '#aa2222',
                          width: `${(upgrade.currentLevel / upgrade.maxLevel) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Подсказка */}
        {upgradePoints > 0 && (
          <p 
            className="mt-4 text-center text-sm opacity-60"
            style={{ fontFamily: 'monospace', color: '#888888' }}
          >
            ↑↓ Выбрать • ENTER Улучшить
          </p>
        )}
        
        {/* Статы игрока */}
        <div 
          className="mt-4 rounded p-3"
          style={{ backgroundColor: '#111111' }}
        >
          <h3 
            className="mb-2 text-sm font-bold opacity-60"
            style={{ fontFamily: 'monospace', color: '#888888' }}
          >
            ТЕКУЩИЕ ХАРАКТЕРИСТИКИ
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm" style={{ fontFamily: 'monospace' }}>
            <div style={{ color: '#ff6666' }}>❤️ HP: {player.stats.maxHealth}</div>
            <div style={{ color: '#ffaa66' }}>⚔️ Урон: {player.stats.damage}</div>
            <div style={{ color: '#66aaff' }}>⚡ Скорость: {player.stats.attackSpeed.toFixed(1)}x</div>
            <div style={{ color: '#66ff66' }}>👟 Ход: {player.stats.moveSpeed.toFixed(1)}</div>
            <div style={{ color: '#ffaa44' }}>🍺 Пиво: +{player.stats.beerHeal}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradeMenu;
