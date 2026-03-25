// ============================================
// GTA VICE CITY STYLE RENDERER
// ============================================

import { COLORS } from '../constants';
import type { Player, Enemy, EnemyType } from '../types';

// ============================================
// ЦВЕТА В СТИЛЕ VICE CITY
// ============================================

export const VICE_COLORS = {
  // Неоновые цвета 80-х
  neonPink: '#ff1493',
  neonBlue: '#00d4ff',
  neonPurple: '#9d00ff',
  neonOrange: '#ff6b00',
  neonGreen: '#39ff14',
  neonYellow: '#ffef00',
  
  // Цвета города
  asphalt: '#1a1a2e',
  asphaltLight: '#2d2d44',
  roadLine: '#ffef00',
  sidewalk: '#4a4a6a',
  
  // Трава и пляж
  grass: '#228b22',
  grassLight: '#32cd32',
  sand: '#f4d03f',
  water: '#006994',
  
  // Здания
  building1: '#ff6b9d',  // Розовый
  building2: '#6bb3ff',  // Голубой
  building3: '#b36bff',  // Фиолетовый
  building4: '#ffb36b',  // Оранжевый
  
  // Игрок
  playerSkin: '#e8b89d',
  playerHair: '#4a3728',
  playerShirt: '#ffffff',
  playerPants: '#4169e1',
  playerBandana: '#dc143c',
  
  // Тени
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowSoft: 'rgba(0, 0, 0, 0.2)',
};

// ============================================
// РИСОВАНИЕ ИГРОКА (GTA STYLE)
// ============================================

export function drawPlayerGTA(
  ctx: CanvasRenderingContext2D,
  player: Player
) {
  const x = player.position.x + player.width / 2;
  const y = player.position.y + player.height / 2;
  const size = 18; // Радиус персонажа
  
  ctx.save();
  
  // Тень
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.8, size * 0.9, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = VICE_COLORS.shadow;
  ctx.fill();
  
  // Поворот в направлении движения
  let angle = 0;
  switch (player.direction) {
    case 'up': angle = 0; break;
    case 'right': angle = Math.PI / 2; break;
    case 'down': angle = Math.PI; break;
    case 'left': angle = -Math.PI / 2; break;
  }
  
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  // Тело (круг)
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fillStyle = VICE_COLORS.playerShirt;
  ctx.fill();
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Голова
  ctx.beginPath();
  ctx.arc(0, -size * 0.5, size * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = VICE_COLORS.playerSkin;
  ctx.fill();
  ctx.strokeStyle = '#d4a088';
  ctx.stroke();
  
  // Волосы
  ctx.beginPath();
  ctx.arc(0, -size * 0.6, size * 0.45, Math.PI, Math.PI * 2);
  ctx.fillStyle = VICE_COLORS.playerHair;
  ctx.fill();
  
  // Повязка (красная)
  ctx.beginPath();
  ctx.arc(0, -size * 0.5, size * 0.52, Math.PI * 0.8, Math.PI * 2.2);
  ctx.strokeStyle = VICE_COLORS.playerBandana;
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Бита в руке
  if (player.state === 'attacking') {
    // Анимация замаха
    ctx.save();
    ctx.rotate(-Math.PI / 4);
    
    // Рука
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.lineTo(size * 1.5, -size * 0.3);
    ctx.strokeStyle = VICE_COLORS.playerSkin;
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Бита
    ctx.beginPath();
    ctx.moveTo(size * 1.3, -size * 0.2);
    ctx.lineTo(size * 2.5, -size * 0.5);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Утолщение биты
    ctx.beginPath();
    ctx.arc(size * 2.5, -size * 0.5, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#A0522D';
    ctx.fill();
    
    ctx.restore();
  } else {
    // Бита на плече или в руке
    ctx.beginPath();
    ctx.moveTo(size * 0.3, -size * 0.3);
    ctx.lineTo(size * 1.5, -size * 0.8);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  
  // Эффект питья
  if (player.state === 'drinking') {
    ctx.beginPath();
    ctx.arc(size * 0.2, -size * 0.7, 5, 0, Math.PI * 2);
    ctx.fillStyle = VICE_COLORS.neonYellow;
    ctx.fill();
    ctx.strokeStyle = '#aa8800';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  ctx.restore();
  
  // Эффект мигания при уязвимости
  if (player.isInvulnerable && Math.floor(Date.now() / 80) % 2 === 0) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, size + 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }
  
  // Неоновое свечение вокруг игрока
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(x, y, size + 8, 0, Math.PI * 2);
  ctx.strokeStyle = VICE_COLORS.neonBlue;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

// ============================================
// РИСОВАНИЕ ВРАГА (GTA STYLE)
// ============================================

export function drawEnemyGTA(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy
) {
  const x = enemy.position.x + enemy.width / 2;
  const y = enemy.position.y + enemy.height / 2;
  
  // Размеры по типу
  let size = 15;
  let bodyColor = '#556677';
  let pantsColor = '#334455';
  let accentColor = VICE_COLORS.neonPink;
  
  switch (enemy.type) {
    case 'normal':
      size = 15;
      bodyColor = '#556677';
      pantsColor = '#334455';
      accentColor = VICE_COLORS.neonPink;
      break;
    case 'fast':
      size = 12;
      bodyColor = '#447755';
      pantsColor = '#335544';
      accentColor = VICE_COLORS.neonGreen;
      break;
    case 'heavy':
      size = 20;
      bodyColor = '#665544';
      pantsColor = '#443322';
      accentColor = VICE_COLORS.neonOrange;
      break;
    case 'boss':
      size = 25;
      bodyColor = '#882233';
      pantsColor = '#441122';
      accentColor = VICE_COLORS.neonPurple;
      break;
  }
  
  ctx.save();
  
  // Тень
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.8, size * 0.9, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = VICE_COLORS.shadow;
  ctx.fill();
  
  // Поворот к игроку
  let angle = 0;
  switch (enemy.direction) {
    case 'up': angle = 0; break;
    case 'right': angle = Math.PI / 2; break;
    case 'down': angle = Math.PI; break;
    case 'left': angle = -Math.PI / 2; break;
  }
  
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  // Тело
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fillStyle = bodyColor;
  ctx.fill();
  ctx.strokeStyle = pantsColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Голова
  ctx.beginPath();
  ctx.arc(0, -size * 0.5, size * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = VICE_COLORS.playerSkin;
  ctx.fill();
  
  // Волосы/шапка
  ctx.beginPath();
  ctx.arc(0, -size * 0.55, size * 0.4, Math.PI, Math.PI * 2);
  ctx.fillStyle = enemy.type === 'boss' ? '#1a1a1a' : '#333333';
  ctx.fill();
  
  // Глаза (красные если агрессивен)
  if (enemy.isAggro) {
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(-size * 0.15, -size * 0.55, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.15, -size * 0.55, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Особые черты босса
  if (enemy.type === 'boss') {
    // Цепь
    ctx.beginPath();
    ctx.arc(0, -size * 0.1, size * 0.8, Math.PI * 0.3, Math.PI * 0.7);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Шрам
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.7);
    ctx.lineTo(size * 0.1, -size * 0.5);
    ctx.strokeStyle = '#aa2222';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  ctx.restore();
  
  // Эффект мигания при уроне
  if (enemy.isInvulnerable && Math.floor(Date.now() / 60) % 2 === 0) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(x, y, size + 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }
  
  // Неоновое свечение
  ctx.save();
  ctx.globalAlpha = enemy.isAggro ? 0.3 : 0.15;
  ctx.beginPath();
  ctx.arc(x, y, size + 5, 0, Math.PI * 2);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  
  // HP бар для босса
  if (enemy.type === 'boss' && enemy.state !== 'dead') {
    const barWidth = 50;
    const barHeight = 6;
    const barX = x - barWidth / 2;
    const barY = y - size - 15;
    const healthPercent = enemy.health / enemy.maxHealth;
    
    // Фон
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
    
    // Здоровье
    ctx.fillStyle = healthPercent > 0.5 ? '#22cc44' : healthPercent > 0.25 ? '#ccaa22' : '#cc2222';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Рамка
    ctx.strokeStyle = VICE_COLORS.neonPurple;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
}

// ============================================
// КАРТА В СТИЛЕ VICE CITY
// ============================================

export function drawMapGTA(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  cameraY: number,
  width: number,
  height: number
) {
  // Фон - асфальт с градиентом
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(0.5, '#2d2d44');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Сетка улиц
  ctx.strokeStyle = VICE_COLORS.asphaltLight;
  ctx.lineWidth = 1;
  
  const gridSize = 100;
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
  
  // Дороги
  drawRoad(ctx, 150 - cameraX, 0, 80, 1200);
  drawRoad(ctx, 0, 200 - cameraY, 1600, 80);
  drawRoad(ctx, 600 - cameraX, 0, 60, 1200);
  drawRoad(ctx, 0, 500 - cameraY, 1600, 60);
  drawRoad(ctx, 1000 - cameraX, 0, 70, 1200);
  drawRoad(ctx, 0, 800 - cameraY, 1600, 70);
  
  // Здания
  drawBuilding(ctx, 50 - cameraX, 50 - cameraY, 80, 120, VICE_COLORS.building1);
  drawBuilding(ctx, 250 - cameraX, 80 - cameraY, 100, 100, VICE_COLORS.building2);
  drawBuilding(ctx, 400 - cameraX, 40 - cameraY, 120, 130, VICE_COLORS.building3);
  drawBuilding(ctx, 700 - cameraX, 60 - cameraY, 90, 110, VICE_COLORS.building4);
  drawBuilding(ctx, 900 - cameraX, 30 - cameraY, 80, 140, VICE_COLORS.building1);
  drawBuilding(ctx, 1100 - cameraX, 70 - cameraY, 110, 100, VICE_COLORS.building2);
  drawBuilding(ctx, 1300 - cameraX, 50 - cameraY, 100, 120, VICE_COLORS.building3);
  
  // Здания снизу
  drawBuilding(ctx, 60 - cameraX, 850 - cameraY, 100, 100, VICE_COLORS.building2);
  drawBuilding(ctx, 300 - cameraX, 900 - cameraY, 80, 80, VICE_COLORS.building4);
  drawBuilding(ctx, 500 - cameraX, 870 - cameraY, 90, 110, VICE_COLORS.building1);
  drawBuilding(ctx, 750 - cameraX, 850 - cameraY, 120, 90, VICE_COLORS.building3);
  drawBuilding(ctx, 1000 - cameraX, 880 - cameraY, 100, 100, VICE_COLORS.building2);
  drawBuilding(ctx, 1250 - cameraX, 850 - cameraY, 80, 120, VICE_COLORS.building4);
  
  // Пальмы
  drawPalmTree(ctx, 180 - cameraX, 320 - cameraY);
  drawPalmTree(ctx, 450 - cameraX, 180 - cameraY);
  drawPalmTree(ctx, 750 - cameraX, 350 - cameraY);
  drawPalmTree(ctx, 1050 - cameraX, 250 - cameraY);
  drawPalmTree(ctx, 1350 - cameraX, 400 - cameraY);
  drawPalmTree(ctx, 200 - cameraX, 750 - cameraY);
  drawPalmTree(ctx, 550 - cameraX, 700 - cameraY);
  drawPalmTree(ctx, 900 - cameraX, 750 - cameraY);
  drawPalmTree(ctx, 1200 - cameraX, 650 - cameraY);
  
  // Машины
  drawCar(ctx, 350 - cameraX, 450 - cameraY, '#cc2244');
  drawCar(ctx, 800 - cameraX, 550 - cameraY, '#2244cc');
  drawCar(ctx, 1150 - cameraX, 350 - cameraY, '#44cc22');
  drawCar(ctx, 450 - cameraX, 700 - cameraY, '#ccaa22');
  
  // Неоновые вывески
  drawNeonSign(ctx, 100 - cameraX, 100 - cameraY, 'BAR', VICE_COLORS.neonPink);
  drawNeonSign(ctx, 500 - cameraX, 70 - cameraY, 'CLUB', VICE_COLORS.neonBlue);
  drawNeonSign(ctx, 900 - cameraX, 60 - cameraY, 'HOTEL', VICE_COLORS.neonPurple);
  drawNeonSign(ctx, 1200 - cameraX, 90 - cameraY, 'SHOP', VICE_COLORS.neonOrange);
  
  // Эффект свечения (vice city vibe)
  ctx.save();
  ctx.globalAlpha = 0.03;
  const glow = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
  glow.addColorStop(0, VICE_COLORS.neonPink);
  glow.addColorStop(0.5, VICE_COLORS.neonBlue);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawRoad(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Основа дороги
  ctx.fillStyle = '#2a2a3a';
  ctx.fillRect(x, y, w, h);
  
  // Разметка
  ctx.strokeStyle = VICE_COLORS.roadLine;
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 15]);
  
  if (w > h) {
    // Горизонтальная дорога
    ctx.beginPath();
    ctx.moveTo(x, y + h/2);
    ctx.lineTo(x + w, y + h/2);
    ctx.stroke();
  } else {
    // Вертикальная дорога
    ctx.beginPath();
    ctx.moveTo(x + w/2, y);
    ctx.lineTo(x + w/2, y + h);
    ctx.stroke();
  }
  
  ctx.setLineDash([]);
}

function drawBuilding(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  // Тень
  ctx.fillStyle = VICE_COLORS.shadow;
  ctx.fillRect(x + 5, y + 5, w, h);
  
  // Основное здание
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  
  // Окна
  const windowSize = 8;
  const windowGap = 12;
  
  for (let wx = x + 8; wx < x + w - 8; wx += windowGap) {
    for (let wy = y + 8; wy < y + h - 8; wy += windowGap) {
      // Случайное свечение окон
      const isLit = Math.random() > 0.3;
      ctx.fillStyle = isLit ? 'rgba(255, 255, 200, 0.8)' : 'rgba(100, 100, 150, 0.5)';
      ctx.fillRect(wx, wy, windowSize, windowSize);
    }
  }
  
  // Рамка здания
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  
  // Неоновая полоса сверху
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, 3);
  ctx.restore();
}

function drawPalmTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Тень
  ctx.beginPath();
  ctx.ellipse(x + 15, y + 40, 15, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = VICE_COLORS.shadow;
  ctx.fill();
  
  // Ствол
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 40);
  ctx.lineTo(x + 5, y);
  ctx.lineTo(x + 25, y);
  ctx.lineTo(x + 20, y + 40);
  ctx.fillStyle = '#8B4513';
  ctx.fill();
  
  // Листья
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + 15, y);
    const endX = x + 15 + Math.cos(angle) * 35;
    const endY = y + Math.sin(angle) * 15;
    ctx.quadraticCurveTo(
      x + 15 + Math.cos(angle) * 25,
      y - 15 + Math.sin(angle) * 10,
      endX,
      endY
    );
    ctx.strokeStyle = '#228b22';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
}

function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  // Тень
  ctx.fillStyle = VICE_COLORS.shadow;
  ctx.fillRect(x + 3, y + 18, 50, 15);
  
  // Корпус
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 5, 50, 18);
  
  // Крыша
  ctx.fillRect(x + 8, y, 34, 10);
  
  // Окна
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(x + 10, y + 2, 12, 6);
  ctx.fillRect(x + 26, y + 2, 12, 6);
  
  // Колёса
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(x + 10, y + 23, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 40, y + 23, 5, 0, Math.PI * 2);
  ctx.fill();
  
  // Блик
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(x + 2, y + 6, 46, 3);
}

function drawNeonSign(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string) {
  ctx.save();
  
  // Свечение
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  
  // Фон таблички
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x - 5, y - 15, text.length * 12 + 10, 20);
  
  // Текст
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  
  ctx.restore();
}

// ============================================
// ПРЕДМЕТЫ
// ============================================

export function drawBeerItemGTA(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const time = Date.now() / 300;
  const pulse = Math.sin(time) * 0.2 + 1;
  
  // Свечение
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(x + 4, y + 8, 20 * pulse, 0, Math.PI * 2);
  ctx.fillStyle = VICE_COLORS.neonYellow;
  ctx.fill();
  ctx.restore();
  
  // Тень
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 18, 6, 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = VICE_COLORS.shadow;
  ctx.fill();
  
  // Бутылка
  ctx.fillStyle = '#aa8844';
  ctx.beginPath();
  ctx.moveTo(x, y + 16);
  ctx.lineTo(x + 2, y + 4);
  ctx.lineTo(x + 2, y);
  ctx.lineTo(x + 6, y);
  ctx.lineTo(x + 6, y + 4);
  ctx.lineTo(x + 8, y + 16);
  ctx.closePath();
  ctx.fill();
  
  // Этикетка
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(x + 1, y + 6, 6, 4);
  
  // Горлышко
  ctx.fillStyle = '#444444';
  ctx.fillRect(x + 3, y - 2, 2, 4);
  
  // Блик
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(x + 2, y + 5, 2, 8);
}

// ============================================
// ЭФФЕКТЫ
// ============================================

export function drawHitEffectGTA(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) {
  const size = 30 + progress * 40;
  const alpha = 1 - progress;
  
  ctx.save();
  ctx.globalAlpha = alpha;
  
  // Звезда удара
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const r = i % 2 === 0 ? size : size * 0.5;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fillStyle = VICE_COLORS.neonYellow;
  ctx.fill();
  
  // Вспышка
  ctx.beginPath();
  ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  
  ctx.restore();
}

export function drawDamageNumberGTA(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  damage: number,
  isHeal: boolean
) {
  const color = isHeal ? VICE_COLORS.neonGreen : VICE_COLORS.neonPink;
  const text = isHeal ? `+${damage}` : `-${damage}`;
  
  ctx.save();
  
  // Свечение
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  
  ctx.restore();
}
