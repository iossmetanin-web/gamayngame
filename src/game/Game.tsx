'use client';

// v4.0 - Новая заставка с дракой
import { useState, useEffect, useCallback } from 'react';
import { GameEngine } from './engine/GameEngine';
import { GameCanvas } from './GameCanvas';
import { IntroScreen } from './intro/IntroScreen';
import { DialogBox } from './ui/DialogBox';
import { UpgradeMenu } from './ui/UpgradeMenu';
import { GameOverScreen, VictoryScreen, PauseMenu } from './ui/GameOverlay';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

// ============================================
// ГЛАВНЫЙ КОМПОНЕНТ ИГРЫ
// ============================================

export function Game() {
  // Инициализируем движок в состоянии
  const [engine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState(engine.state);
  const [currentDialog, setCurrentDialog] = useState(engine.currentDialog);
  const [player, setPlayer] = useState(() => ({ ...engine.player }));
  const [upgrades, setUpgrades] = useState(() => engine.upgrades.map(u => ({ ...u })));
  
  // Синхронизация состояния
  useEffect(() => {
    const interval = setInterval(() => {
      if (engine.state !== gameState) {
        setGameState(engine.state);
      }
      if (engine.currentDialog !== currentDialog) {
        setCurrentDialog(engine.currentDialog);
      }
      // Обновляем данные игрока для UI
      setPlayer({ ...engine.player });
      setUpgrades(engine.upgrades.map(u => ({ ...u })));
    }, 100);
    
    return () => clearInterval(interval);
  }, [engine, gameState, currentDialog]);
  
  // Обработчики
  const handleStart = useCallback(() => {
    const newState = engine.startGame();
    setGameState(newState);
  }, [engine]);
  
  const handleRestart = useCallback(() => {
    engine.restart();
    setGameState(engine.state);
    setCurrentDialog(null);
    setPlayer({ ...engine.player });
    setUpgrades(engine.upgrades.map(u => ({ ...u })));
  }, [engine]);
  
  const handleResume = useCallback(() => {
    const newState = engine.resumeGame();
    setGameState(newState);
  }, [engine]);
  
  const handleDialogOption = useCallback((optionId: string) => {
    engine.selectDialogOption(optionId);
    setGameState(engine.state);
    setCurrentDialog(null);
  }, [engine]);
  
  const handleUpgrade = useCallback((upgradeId: string) => {
    engine.applyUpgrade(upgradeId);
    setGameState(engine.state);
    setPlayer({ ...engine.player });
    setUpgrades(engine.upgrades.map(u => ({ ...u })));
  }, [engine]);
  
  const handleStateChange = useCallback((state: string) => {
    setGameState(state);
  }, []);
  
  // Подсчёт побеждённых врагов
  const getStats = useCallback(() => {
    const defeatedEnemies = engine.enemyGroups.reduce((total, group) => {
      return total + group.enemies.filter(e => e.state === 'dead').length;
    }, 0);
    
    return {
      level: engine.player.level,
      enemiesDefeated: defeatedEnemies,
      gameTime: engine.gameTime,
    };
  }, [engine]);
  
  return (
    <div 
      className="relative mx-auto"
      style={{ 
        width: GAME_WIDTH, 
        maxWidth: '100%',
        aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}`,
      }}
    >
      {/* Основной канвас игры */}
      {gameState !== 'intro' && (
        <GameCanvas 
          engine={engine} 
          onStateChange={handleStateChange}
        />
      )}
      
      {/* Заставка */}
      {gameState === 'intro' && (
        <IntroScreen onStart={handleStart} />
      )}
      
      {/* Диалог */}
      {gameState === 'dialog' && currentDialog && (
        <DialogBox 
          dialog={currentDialog}
          onOptionSelect={handleDialogOption}
        />
      )}
      
      {/* Меню прокачки */}
      {gameState === 'upgrade' && (
        <UpgradeMenu
          player={player}
          upgrades={upgrades}
          onUpgrade={handleUpgrade}
          upgradePoints={player.upgradePoints}
        />
      )}
      
      {/* Пауза */}
      {gameState === 'paused' && (
        <PauseMenu 
          onResume={handleResume}
          onRestart={handleRestart}
        />
      )}
      
      {/* Game Over */}
      {gameState === 'gameover' && (
        <GameOverScreen 
          onRestart={handleRestart}
          stats={getStats()}
        />
      )}
      
      {/* Победа */}
      {gameState === 'victory' && (
        <VictoryScreen 
          onRestart={handleRestart}
          stats={getStats()}
        />
      )}
    </div>
  );
}

export default Game;
