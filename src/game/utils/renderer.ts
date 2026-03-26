// ============================================
// ПИКСЕЛЬНЫЙ РЕНДЕРЕР - "ЗЛОБНЫЕ ГАМАЮНЫ"
// ============================================

import { COLORS } from '../constants';
import type { Player, Enemy, Direction, CharacterState, EnemyType } from '../types';

// Рисование пикселя (увеличенного)
export function drawPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 2,
  color: string = '#ffffff'
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
}

// Рисование линии пикселями
export function drawPixelLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size: number = 2,
  color: string = '#ffffff'
) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? size : -size;
  const sy = y1 < y2 ? size : -size;
  let err = dx - dy;

  let x = x1;
  let y = y1;

  while (true) {
    drawPixel(ctx, x, y, size, color);
    if (Math.abs(x - x2) < size && Math.abs(y - y2) < size) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

// Рисование прямоугольника пикселями
export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  size: number = 2,
  color: string = '#ffffff',
  fill: boolean = false
) {
  ctx.fillStyle = color;
  if (fill) {
    for (let py = y; py < y + height; py += size) {
      for (let px = x; px < x + width; px += size) {
        drawPixel(ctx, px, py, size, color);
      }
    }
  } else {
    // Только контур
    for (let px = x; px < x + width; px += size) {
      drawPixel(ctx, px, y, size, color);
      drawPixel(ctx, px, y + height - size, size, color);
    }
    for (let py = y; py < y + height; py += size) {
      drawPixel(ctx, x, py, size, color);
      drawPixel(ctx, x + width - size, py, size, color);
    }
  }
}

// ============================================
// РИСОВАНИЕ ИГРОКА
// ============================================

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  scale: number = 2
) {
  const px = 2; // Размер пикселя
  const x = Math.floor(player.position.x);
  const y = Math.floor(player.position.y);
  const w = 28;
  const h = 32;

  ctx.save();

  // Отражение по горизонтали если смотрит влево
  if (player.direction === 'left') {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.translate(-x, -y);
  }

  // Анимация атаки
  let armOffset = 0;
  let batAngle = 0;
  if (player.state === 'attacking') {
    armOffset = -4;
    batAngle = -30;
  }

  // Анимация питья
  const drinkingOffset = player.state === 'drinking' ? Math.sin(Date.now() / 100) * 2 : 0;

  // Тень
  drawPixelRect(ctx, x + 4, y + h - 4, 20, 4, px, 'rgba(0,0,0,0.3)', true);

  // Ноги (штаны)
  const legOffset = player.state === 'walking' ? Math.sin(Date.now() / 80) * 3 : 0;
  drawPixelRect(ctx, x + 6, y + 20 + legOffset, 6, 10, px, COLORS.playerPants, true);
  drawPixelRect(ctx, x + 16, y + 20 - legOffset, 6, 10, px, COLORS.playerPants, true);

  // Тело (голый торс)
  drawPixelRect(ctx, x + 6, y + 10, 16, 12, px, COLORS.playerSkin, true);

  // Голова
  drawPixelRect(ctx, x + 8, y, 12, 12, px, COLORS.playerSkin, true);

  // Повязка на голове
  drawPixelRect(ctx, x + 6, y + 2, 16, 4, px, COLORS.playerBandana, true);
  // Хвостик повязки
  drawPixelRect(ctx, x + 4, y + 4, 4, 6, px, COLORS.playerBandana, true);

  // Глаза
  drawPixel(ctx, x + 12, y + 6, px, '#000000');
  drawPixel(ctx, x + 16, y + 6, px, '#000000');

  // Рука с битой
  const armX = x + 20 + armOffset;
  const armY = y + 14 + drinkingOffset;
  drawPixelRect(ctx, armX, armY, 6, 8, px, COLORS.playerSkin, true);

  // Бита
  if (player.weapon.type === 'bat') {
    ctx.save();
    ctx.translate(armX + 6, armY + 4);
    ctx.rotate((batAngle * Math.PI) / 180);
    
    // Ручка биты
    drawPixelRect(ctx, 0, -2, 20, 6, px, '#5a3a1a', true);
    // Утолщение биты
    drawPixelRect(ctx, 16, -4, 10, 10, px, '#6a4a2a', true);
    // Блики на бите
    drawPixel(ctx, 18, -2, px, '#8a6a4a');
    drawPixel(ctx, 22, 0, px, '#8a6a4a');
    
    ctx.restore();
  } else {
    // Ломик
    ctx.save();
    ctx.translate(armX + 6, armY + 4);
    ctx.rotate((batAngle * Math.PI) / 180);
    
    // Ломик
    drawPixelRect(ctx, 0, 0, 24, 3, px, '#555555', true);
    // Загнутый конец
    drawPixelRect(ctx, 22, -2, 4, 4, px, '#555555', true);
    
    ctx.restore();
  }

  // Эффект уязвимости (мигание)
  if (player.isInvulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
    ctx.globalAlpha = 0.5;
    drawPixelRect(ctx, x, y, w, h, px, '#ffffff', true);
    ctx.globalAlpha = 1;
  }

  // Эффект питья пива
  if (player.state === 'drinking') {
    // Бутылка
    const bottleX = x + 10;
    const bottleY = y + 4 + drinkingOffset;
    drawPixelRect(ctx, bottleX, bottleY, 4, 12, px, '#aa8844', true);
    drawPixelRect(ctx, bottleX + 1, bottleY - 3, 2, 4, px, '#444444', true);
  }

  ctx.restore();
}

// ============================================
// РИСОВАНИЕ ВРАГА
// ============================================

export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  scale: number = 2
) {
  const px = 2;
  const x = Math.floor(enemy.position.x);
  const y = Math.floor(enemy.position.y);
  
  // Размеры зависят от типа
  let w = 24;
  let h = 28;
  let color = COLORS.enemyNormal;
  
  switch (enemy.type) {
    case 'normal':
      w = 24;
      h = 28;
      color = COLORS.enemyNormal;
      break;
    case 'fast':
      w = 20;
      h = 24;
      color = COLORS.enemyFast;
      break;
    case 'heavy':
      w = 32;
      h = 36;
      color = COLORS.enemyHeavy;
      break;
    case 'boss':
      w = 40;
      h = 44;
      color = COLORS.enemyBoss;
      break;
  }

  ctx.save();

  // Отражение
  if (enemy.direction === 'left') {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.translate(-x, -y);
  }

  // Тень
  drawPixelRect(ctx, x + 2, y + h - 4, w - 4, 4, px, 'rgba(0,0,0,0.3)', true);

  // Анимация ходьбы
  const legOffset = enemy.state === 'walking' ? Math.sin(Date.now() / 100) * 2 : 0;
  const isHurt = enemy.state === 'hurt';
  const isDead = enemy.state === 'dead';

  // Цвет при получении урона
  const bodyColor = isHurt ? '#ffffff' : color;

  // Ноги
  if (!isDead) {
    drawPixelRect(ctx, x + 4, y + h - 10 + legOffset, 6, 10, px, '#333333', true);
    drawPixelRect(ctx, x + w - 10, y + h - 10 - legOffset, 6, 10, px, '#333333', true);
  }

  // Тело
  if (!isDead) {
    drawPixelRect(ctx, x + 2, y + 10, w - 4, h - 20, px, bodyColor, true);
  } else {
    // Падшее тело
    drawPixelRect(ctx, x, y + h - 10, w, 8, px, bodyColor, true);
  }

  // Голова
  if (!isDead) {
    drawPixelRect(ctx, x + 4, y, w - 8, 12, px, bodyColor, true);
    
    // Глаза
    const eyeColor = enemy.isAggro ? '#ff0000' : '#ffffff';
    drawPixel(ctx, x + 8, y + 4, px, eyeColor);
    drawPixel(ctx, x + w - 10, y + 4, px, eyeColor);
    
    // Злые брови для агрессивных
    if (enemy.isAggro) {
      drawPixelRect(ctx, x + 6, y + 2, 4, 2, px, '#000000', true);
      drawPixelRect(ctx, x + w - 12, y + 2, 4, 2, px, '#000000', true);
    }

    // Особые черты для босса
    if (enemy.type === 'boss') {
      // Шрам
      drawPixelLine(ctx, x + 10, y + 6, x + 14, y + 10, px, '#aa2222');
      // Цепь на шее
      drawPixelRect(ctx, x + 8, y + 10, w - 16, 2, px, '#888888', true);
    }
  }

  // Эффект уязвимости
  if (enemy.isInvulnerable && Math.floor(Date.now() / 80) % 2 === 0) {
    ctx.globalAlpha = 0.5;
    drawPixelRect(ctx, x, y, w, h, px, '#ffffff', true);
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  // Полоса здоровья (для босса)
  if (enemy.type === 'boss' && !isDead) {
    const barWidth = 40;
    const barHeight = 4;
    const barX = x + (w - barWidth) / 2;
    const barY = y - 10;
    const healthPercent = enemy.health / enemy.maxHealth;

    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = '#cc2222';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    ctx.strokeStyle = '#111111';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
}

// ============================================
// РИСОВАНИЕ КАРТЫ
// ============================================

export function drawMap(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  cameraY: number,
  width: number,
  height: number
) {
  const px = 2;
  
  // Фон - асфальт
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, 0, width, height);

  // Сетка асфальта
  ctx.strokeStyle = COLORS.groundLine;
  ctx.lineWidth = 1;
  
  const gridSize = 64;
  const offsetX = -cameraX % gridSize;
  const offsetY = -cameraY % gridSize;

  for (let x = offsetX; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = offsetY; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Декорации
  // Мусорки
  drawDumpster(ctx, 100 - cameraX, 150 - cameraY);
  drawDumpster(ctx, 500 - cameraX, 300 - cameraY);
  drawDumpster(ctx, 900 - cameraX, 200 - cameraY);
  drawDumpster(ctx, 1200 - cameraX, 500 - cameraY);

  // Стены зданий
  drawWall(ctx, 50 - cameraX, 50 - cameraY, 200, 20);
  drawWall(ctx, 350 - cameraX, 100 - cameraY, 150, 20);
  drawWall(ctx, 700 - cameraX, 50 - cameraY, 300, 20);
  drawWall(ctx, 1100 - cameraX, 100 - cameraY, 200, 20);
  drawWall(ctx, 1400 - cameraX, 200 - cameraY, 150, 20);

  // Машины
  drawCar(ctx, 200 - cameraX, 400 - cameraY, '#442233');
  drawCar(ctx, 800 - cameraX, 350 - cameraY, '#334455');
  drawCar(ctx, 1300 - cameraX, 600 - cameraY, '#554433');
}

function drawDumpster(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const px = 2;
  // Корпус
  drawPixelRect(ctx, x, y, 40, 30, px, '#2a4a2a', true);
  // Крышка
  drawPixelRect(ctx, x - 2, y - 4, 44, 6, px, '#3a5a3a', true);
  // Колёсики
  drawPixelRect(ctx, x + 4, y + 28, 8, 6, px, '#222222', true);
  drawPixelRect(ctx, x + 28, y + 28, 8, 6, px, '#222222', true);
}

function drawWall(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const px = 2;
  drawPixelRect(ctx, x, y, w, h, px, COLORS.wall, true);
  // Кирпичный узор
  for (let bx = x + 8; bx < x + w - 8; bx += 16) {
    for (let by = y; by < y + h; by += 8) {
      const offset = (Math.floor((by - y) / 8) % 2) * 8;
      drawPixel(ctx, bx + offset, by, px, '#444444');
    }
  }
}

function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const px = 2;
  // Корпус
  drawPixelRect(ctx, x, y + 10, 60, 24, px, color, true);
  // Крыша
  drawPixelRect(ctx, x + 10, y, 40, 14, px, color, true);
  // Окна
  drawPixelRect(ctx, x + 14, y + 2, 14, 10, px, '#88aacc', true);
  drawPixelRect(ctx, x + 32, y + 2, 14, 10, px, '#88aacc', true);
  // Колёса
  drawPixelRect(ctx, x + 6, y + 32, 12, 8, px, '#111111', true);
  drawPixelRect(ctx, x + 42, y + 32, 12, 8, px, '#111111', true);
}

// ============================================
// РИСОВАНИЕ ЭФФЕКТОВ
// ============================================

export function drawHitEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number // 0-1
) {
  const size = 20 + progress * 30;
  const alpha = 1 - progress;
  
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = COLORS.hit;
  
  // Звёзды удара
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const px = x + Math.cos(angle) * size * 0.5;
    const py = y + Math.sin(angle) * size * 0.5;
    
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

export function drawDamageNumber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  damage: number,
  isHeal: boolean = false
) {
  const color = isHeal ? COLORS.heal : COLORS.damage;
  const text = isHeal ? `+${damage}` : `-${damage}`;
  
  ctx.save();
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// CRT эффект
export function applyCRTEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Сканирующие линии
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  for (let y = 0; y < height; y += 3) {
    ctx.fillRect(0, y, width, 1);
  }

  // Виньетка
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, height / 3,
    width / 2, height / 2, height
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// Эффект тряски камеры
export function shakeCamera(ctx: CanvasRenderingContext2D, intensity: number): { x: number; y: number } {
  if (intensity <= 0) return { x: 0, y: 0 };
  
  return {
    x: (Math.random() - 0.5) * intensity * 2,
    y: (Math.random() - 0.5) * intensity * 2,
  };
}
