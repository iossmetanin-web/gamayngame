'use client';

import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './engine/GameEngine';
import { GAME_WIDTH, GAME_HEIGHT, KEYS, EXPERIENCE_TO_LEVEL } from './constants';
import { 
  drawPlayerGTA, 
  drawEnemyGTA, 
  drawMapGTA, 
  drawBeerItemGTA,
  drawHitEffectGTA,
  drawDamageNumberGTA,
  VICE_COLORS 
} from './utils/gtarenaer';
import type { PlayerInput } from './types';

// ============================================
// ИГРОВОЙ КОМПОНЕНТ (GTA VICE CITY STYLE)
// ============================================

interface GameCanvasProps {
  engine: GameEngine;
  onStateChange?: (state: string) => void;
}

export function GameCanvas({ engine, onStateChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [gameState, setGameState] = useState(engine.state);
  
  // Обработка ввода
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const input: Partial<PlayerInput> = {};
      
      if (KEYS.up.includes(e.code)) input.up = true;
      if (KEYS.down.includes(e.code)) input.down = true;
      if (KEYS.left.includes(e.code)) input.left = true;
      if (KEYS.right.includes(e.code)) input.right = true;
      if (KEYS.attack.includes(e.code)) input.attack = true;
      if (KEYS.sprint.includes(e.code)) input.sprint = true;
      if (KEYS.useBeer.includes(e.code)) input.useBeer = true;
      if (KEYS.interact.includes(e.code)) input.interact = true;
      
      Object.assign(engine.input, input);
      
      // Пауза
      if (KEYS.pause.includes(e.code)) {
        const newState = engine.pauseGame();
        setGameState(newState);
        onStateChange?.(newState);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const input: Partial<PlayerInput> = {};
      
      if (KEYS.up.includes(e.code)) input.up = false;
      if (KEYS.down.includes(e.code)) input.down = false;
      if (KEYS.left.includes(e.code)) input.left = false;
      if (KEYS.right.includes(e.code)) input.right = false;
      if (KEYS.attack.includes(e.code)) input.attack = false;
      if (KEYS.sprint.includes(e.code)) input.sprint = false;
      if (KEYS.useBeer.includes(e.code)) input.useBeer = false;
      if (KEYS.interact.includes(e.code)) input.interact = false;
      
      Object.assign(engine.input, input);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine, onStateChange]);
  
  // Игровой цикл
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const gameLoop = (timestamp: number) => {
      // Обновление игры
      if (engine.state === 'playing') {
        engine.update(timestamp);
      }
      
      // Рендеринг
      render(ctx, engine);
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [engine]);
  
  return (
    <canvas
      ref={canvasRef}
      width={GAME_WIDTH}
      height={GAME_HEIGHT}
      className="block"
      style={{ 
        maxWidth: '100%',
        height: 'auto',
        background: '#0a001a',
      }}
    />
  );
}

// ============================================
// РЕНДЕРИНГ (GTA VICE CITY STYLE)
// ============================================

function render(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  // Очистка с градиентом Vice City
  const bgGradient = ctx.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
  bgGradient.addColorStop(0, '#0a001a');
  bgGradient.addColorStop(0.5, '#1a0033');
  bgGradient.addColorStop(1, '#0a001a');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  
  // Применение камеры
  ctx.save();
  
  // Тряска камеры
  if (engine.camera.shake > 0) {
    const shakeX = (Math.random() - 0.5) * engine.camera.shake * 2;
    const shakeY = (Math.random() - 0.5) * engine.camera.shake * 2;
    ctx.translate(shakeX, shakeY);
  }
  
  ctx.translate(-engine.camera.position.x, -engine.camera.position.y);
  
  // Карта в стиле Vice City
  drawMapGTA(ctx, engine.camera.position.x, engine.camera.position.y, GAME_WIDTH, GAME_HEIGHT);
  
  // Предметы
  engine.items.forEach(item => {
    if (item.isCollected) return;
    drawBeerItemGTA(ctx, item.position.x, item.position.y);
  });
  
  // Враги
  engine.activeEnemies.forEach(enemy => {
    if (enemy.state !== 'dead') {
      drawEnemyGTA(ctx, enemy);
    }
  });
  
  // Игрок
  if (engine.player.state !== 'dead') {
    drawPlayerGTA(ctx, engine.player);
  }
  
  // Эффекты ударов
  engine.hitEffects.forEach(effect => {
    drawHitEffectGTA(ctx, effect.x, effect.y, effect.progress);
  });
  
  // Числа урона
  engine.damageNumbers.forEach(num => {
    ctx.globalAlpha = num.life;
    drawDamageNumberGTA(ctx, num.x, num.y, num.value, num.isHeal);
    ctx.globalAlpha = 1;
  });
  
  ctx.restore();
  
  // UI
  renderUI(ctx, engine);
  
  // Vice City vignette effect
  const vignette = ctx.createRadialGradient(
    GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_HEIGHT / 2,
    GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH
  );
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

// ============================================
// UI (VICE CITY STYLE)
// ============================================

function renderUI(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const padding = 15;
  
  // Фон для UI (полупрозрачный)
  ctx.fillStyle = 'rgba(10, 0, 26, 0.9)';
  ctx.beginPath();
  ctx.roundRect(padding - 5, padding - 5, 220, 105, 8);
  ctx.fill();
  
  // Неоновая рамка
  ctx.strokeStyle = VICE_COLORS.neonPink;
  ctx.lineWidth = 2;
  ctx.shadowColor = VICE_COLORS.neonPink;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.roundRect(padding - 5, padding - 5, 220, 105, 8);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Здоровье
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.roundRect(padding, padding, 200, 22, 4);
  ctx.fill();
  
  const healthWidth = (engine.player.health / engine.player.maxHealth) * 196;
  const healthGradient = ctx.createLinearGradient(padding + 2, 0, padding + healthWidth, 0);
  healthGradient.addColorStop(0, '#22cc44');
  healthGradient.addColorStop(1, '#44ff66');
  ctx.fillStyle = healthGradient;
  ctx.beginPath();
  ctx.roundRect(padding + 2, padding + 2, healthWidth, 18, 3);
  ctx.fill();
  
  // Текст здоровья
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(
    `HP: ${Math.ceil(engine.player.health)} / ${engine.player.maxHealth}`,
    padding + 100,
    padding + 16
  );
  
  // Стамина
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.roundRect(padding, padding + 27, 200, 12, 3);
  ctx.fill();
  
  const staminaWidth = (engine.player.stamina / engine.player.maxStamina) * 196;
  const staminaGradient = ctx.createLinearGradient(padding + 2, 0, padding + staminaWidth, 0);
  staminaGradient.addColorStop(0, '#4488ff');
  staminaGradient.addColorStop(1, '#66aaff');
  ctx.fillStyle = staminaGradient;
  ctx.beginPath();
  ctx.roundRect(padding + 2, padding + 29, staminaWidth, 8, 2);
  ctx.fill();
  
  // Опыт
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.roundRect(padding, padding + 42, 200, 12, 3);
  ctx.fill();
  
  const expForLevel = EXPERIENCE_TO_LEVEL(engine.player.level);
  const expWidth = (engine.player.experience / expForLevel) * 196;
  const expGradient = ctx.createLinearGradient(padding + 2, 0, padding + expWidth, 0);
  expGradient.addColorStop(0, '#ffaa22');
  expGradient.addColorStop(1, '#ffcc44');
  ctx.fillStyle = expGradient;
  ctx.beginPath();
  ctx.roundRect(padding + 2, padding + 44, expWidth, 8, 2);
  ctx.fill();
  
  // Уровень
  ctx.fillStyle = VICE_COLORS.neonYellow;
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'left';
  ctx.shadowColor = VICE_COLORS.neonYellow;
  ctx.shadowBlur = 5;
  ctx.fillText(`LVL ${engine.player.level}`, padding, padding + 75);
  ctx.shadowBlur = 0;
  
  // Пиво
  ctx.textAlign = 'right';
  ctx.fillStyle = VICE_COLORS.neonPink;
  ctx.shadowColor = VICE_COLORS.neonPink;
  ctx.shadowBlur = 5;
  ctx.fillText(`🍺 x${engine.player.beerCount}`, padding + 200, padding + 75);
  ctx.shadowBlur = 0;
  
  // Оружие
  ctx.textAlign = 'left';
  ctx.font = '11px Arial';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText(`⚔ ${engine.player.weapon.name}`, padding, padding + 92);
  
  // Мини-карта
  drawMinimapGTA(ctx, engine);
  
  // Подсказки управления
  ctx.fillStyle = 'rgba(10, 0, 26, 0.9)';
  ctx.beginPath();
  ctx.roundRect(GAME_WIDTH - 165, GAME_HEIGHT - 78, 155, 68, 8);
  ctx.fill();
  ctx.strokeStyle = VICE_COLORS.neonBlue;
  ctx.lineWidth = 1;
  ctx.shadowColor = VICE_COLORS.neonBlue;
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.roundRect(GAME_WIDTH - 165, GAME_HEIGHT - 78, 155, 68, 8);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = '#888888';
  ctx.font = '10px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('WASD - движение', GAME_WIDTH - 155, GAME_HEIGHT - 60);
  ctx.fillText('ПРОБЕЛ - атака', GAME_WIDTH - 155, GAME_HEIGHT - 46);
  ctx.fillText('SHIFT - бег', GAME_WIDTH - 155, GAME_HEIGHT - 32);
  ctx.fillText('E - Жигулёвское', GAME_WIDTH - 155, GAME_HEIGHT - 18);
}

function drawMinimapGTA(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const mapSize = 90;
  const mapX = GAME_WIDTH - mapSize - 15;
  const mapY = 15;
  const scaleX = mapSize / 1600;
  const scaleY = mapSize / 1200;
  
  // Фон карты
  ctx.fillStyle = 'rgba(10, 0, 26, 0.95)';
  ctx.beginPath();
  ctx.roundRect(mapX - 5, mapY - 5, mapSize + 10, mapSize + 10, 8);
  ctx.fill();
  
  // Неоновая рамка
  ctx.strokeStyle = VICE_COLORS.neonPurple;
  ctx.lineWidth = 2;
  ctx.shadowColor = VICE_COLORS.neonPurple;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.roundRect(mapX - 5, mapY - 5, mapSize + 10, mapSize + 10, 8);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Сетка карты
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < mapSize; i += 18) {
    ctx.beginPath();
    ctx.moveTo(mapX + i, mapY);
    ctx.lineTo(mapX + i, mapY + mapSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mapX, mapY + i);
    ctx.lineTo(mapX + mapSize, mapY + i);
    ctx.stroke();
  }
  
  // Группы врагов
  engine.enemyGroups.forEach(group => {
    const gx = mapX + group.position.x * scaleX;
    const gy = mapY + group.position.y * scaleY;
    
    if (group.isDefeated) {
      ctx.fillStyle = '#444444';
    } else {
      ctx.fillStyle = group.id === 4 ? VICE_COLORS.neonPurple : VICE_COLORS.neonOrange;
      ctx.shadowColor = ctx.fillStyle as string;
      ctx.shadowBlur = 5;
    }
    ctx.beginPath();
    ctx.arc(gx, gy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
  
  // Игрок (мигающая точка)
  const px = mapX + engine.player.position.x * scaleX;
  const py = mapY + engine.player.position.y * scaleY;
  
  const pulse = Math.sin(Date.now() / 200) * 0.3 + 1;
  ctx.fillStyle = VICE_COLORS.neonGreen;
  ctx.shadowColor = VICE_COLORS.neonGreen;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(px, py, 4 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Направление игрока
  ctx.strokeStyle = VICE_COLORS.neonGreen;
  ctx.lineWidth = 2;
  let dirX = 0, dirY = 0;
  switch (engine.player.direction) {
    case 'up': dirY = -8; break;
    case 'down': dirY = 8; break;
    case 'left': dirX = -8; break;
    case 'right': dirX = 8; break;
  }
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + dirX, py + dirY);
  ctx.stroke();
}
