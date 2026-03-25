// ============================================
// АНИМАЦИЯ ПЕРСОНАЖЕЙ ДЛЯ ЗАСТАВКИ
// ============================================

import { playWhoosh, playLand, playRandomHit } from './sounds';

// ============================================
// ТИПЫ
// ============================================

interface Vector2 {
  x: number;
  y: number;
}

interface Fighter {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  velocityY: number;
  velocityX: number;
  scale: number;
  facingRight: boolean;
  state: 'falling' | 'landing' | 'idle' | 'punch' | 'kick' | 'hurt' | 'block';
  animationFrame: number;
  animationTimer: number;
  health: number;
  color: string;
  accentColor: string;
  landed: boolean;
  attackCooldown: number;
  hurtTimer: number;
  flashTimer: number;
}

interface Effect {
  x: number;
  y: number;
  type: 'hit' | 'land' | 'flash';
  timer: number;
  maxTimer: number;
}

// ============================================
// КОНСТАНТЫ
// ============================================

const GRAVITY = 0.5;
const GROUND_Y = 280;
const FIGHTER_WIDTH = 50;
const FIGHTER_HEIGHT = 70;

// ============================================
// КЛАСС АНИМАТОРА
// ============================================

export class IntroAnimator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number = 0;
  private fighter1: Fighter;
  private fighter2: Fighter;
  private effects: Effect[] = [];
  private screenShake: number = 0;
  private phase: 'waiting' | 'falling' | 'fighting' = 'waiting';
  private started: boolean = false;
  private onHit: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Персонаж 1 (красный - игрок)
    this.fighter1 = this.createFighter(
      100, -100, // Начинается за экраном сверху
      150, GROUND_Y, // Целевая позиция
      false, // Не смотрит вправо
      '#dc143c', // Красный
      '#ff6b6b'
    );
    
    // Персонаж 2 (синий - враг)
    this.fighter2 = this.createFighter(
      400, -150, // Начинается за экраном сверху
      350, GROUND_Y, // Целевая позиция
      true, // Смотрит вправо
      '#4169e1', // Синий
      '#6ba3ff'
    );
  }

  private createFighter(
    startX: number, startY: number,
    targetX: number, targetY: number,
    facingRight: boolean,
    color: string,
    accentColor: string
  ): Fighter {
    return {
      x: startX,
      y: startY,
      targetX,
      targetY,
      velocityY: 0,
      velocityX: 0,
      scale: 1,
      facingRight,
      state: 'falling',
      animationFrame: 0,
      animationTimer: 0,
      health: 100,
      color,
      accentColor,
      landed: false,
      attackCooldown: 0,
      hurtTimer: 0,
      flashTimer: 0,
    };
  }

  // Запуск анимации после первого клика
  start(onHit: () => void) {
    if (this.started) return;
    this.started = true;
    this.onHit = onHit;
    this.phase = 'falling';
    
    // Начальные скорости для падения
    this.fighter1.velocityY = 2;
    this.fighter1.velocityX = 3;
    this.fighter2.velocityY = 3;
    this.fighter2.velocityX = -3;
    
    // Звук появления
    playWhoosh(0.5);
    setTimeout(() => playWhoosh(0.5), 150);
    
    this.animate();
  }

  // Основной цикл анимации
  private animate = () => {
    this.update();
    this.render();
    this.animationId = requestAnimationFrame(this.animate);
  };

  private update() {
    // Обновление эффектов
    this.effects = this.effects.filter(e => {
      e.timer -= 16;
      return e.timer > 0;
    });

    // Затухание тряски экрана
    this.screenShake *= 0.9;

    if (this.phase === 'falling') {
      this.updateFalling();
    } else if (this.phase === 'fighting') {
      this.updateFighting();
    }
  }

  private updateFalling() {
    // Падение персонажа 1
    if (!this.fighter1.landed) {
      this.fighter1.velocityY += GRAVITY;
      this.fighter1.x += this.fighter1.velocityX;
      this.fighter1.y += this.fighter1.velocityY;
      
      if (this.fighter1.y >= this.fighter1.targetY) {
        this.fighter1.y = this.fighter1.targetY;
        this.fighter1.landed = true;
        this.fighter1.state = 'landing';
        this.addEffect(this.fighter1.x, this.fighter1.y + 20, 'land');
        playLand(0.5);
        this.screenShake = 5;
      }
    }

    // Падение персонажа 2
    if (!this.fighter2.landed) {
      this.fighter2.velocityY += GRAVITY;
      this.fighter2.x += this.fighter2.velocityX;
      this.fighter2.y += this.fighter2.velocityY;
      
      if (this.fighter2.y >= this.fighter2.targetY) {
        this.fighter2.y = this.fighter2.targetY;
        this.fighter2.landed = true;
        this.fighter2.state = 'landing';
        this.addEffect(this.fighter2.x, this.fighter2.y + 20, 'land');
        playLand(0.5);
        this.screenShake = 5;
      }
    }

    // Переход к фазе боя
    if (this.fighter1.landed && this.fighter2.landed) {
      setTimeout(() => {
        this.phase = 'fighting';
        this.fighter1.state = 'idle';
        this.fighter2.state = 'idle';
      }, 300);
    }
  }

  private updateFighting() {
    // Обновление кулдаунов
    if (this.fighter1.attackCooldown > 0) this.fighter1.attackCooldown -= 16;
    if (this.fighter2.attackCooldown > 0) this.fighter2.attackCooldown -= 16;
    if (this.fighter1.hurtTimer > 0) this.fighter1.hurtTimer -= 16;
    if (this.fighter2.hurtTimer > 0) this.fighter2.hurtTimer -= 16;
    if (this.fighter1.flashTimer > 0) this.fighter1.flashTimer -= 16;
    if (this.fighter2.flashTimer > 0) this.fighter2.flashTimer -= 16;

    // Анимация таймеры
    this.fighter1.animationTimer += 16;
    this.fighter2.animationTimer += 16;

    // Случайные атаки
    if (this.fighter1.attackCooldown <= 0 && this.fighter1.hurtTimer <= 0) {
      if (Math.random() < 0.02) {
        this.attack(this.fighter1, this.fighter2);
      }
    }

    if (this.fighter2.attackCooldown <= 0 && this.fighter2.hurtTimer <= 0) {
      if (Math.random() < 0.025) {
        this.attack(this.fighter2, this.fighter1);
      }
    }

    // Возврат к idle после атаки
    if (this.fighter1.animationTimer > 200) {
      this.fighter1.state = 'idle';
    }
    if (this.fighter2.animationTimer > 200) {
      this.fighter2.state = 'idle';
    }

    // Плавное движение к целям
    this.fighter1.x += (this.fighter1.targetX - this.fighter1.x) * 0.02;
    this.fighter2.x += (this.fighter2.targetX - this.fighter2.x) * 0.02;
  }

  private attack(attacker: Fighter, defender: Fighter) {
    const isKick = Math.random() < 0.3;
    attacker.state = isKick ? 'kick' : 'punch';
    attacker.animationTimer = 0;
    attacker.attackCooldown = 500 + Math.random() * 500;

    // Проверка попадания
    const distance = Math.abs(attacker.x - defender.x);
    if (distance < 80) {
      // Попадание!
      defender.hurtTimer = 200;
      defender.flashTimer = 150;
      defender.state = 'hurt';
      
      // Отталкивание
      const pushDirection = defender.x > attacker.x ? 1 : -1;
      defender.x += pushDirection * 15;
      
      // Эффекты
      this.addEffect(defender.x, defender.y - 30, 'hit');
      this.screenShake = 8;
      
      // Звук
      playRandomHit(0.4);
      this.onHit?.();
    }
  }

  private addEffect(x: number, y: number, type: 'hit' | 'land' | 'flash') {
    this.effects.push({
      x,
      y,
      type,
      timer: type === 'land' ? 200 : 150,
      maxTimer: type === 'land' ? 200 : 150,
    });
  }

  // ============================================
  // РЕНДЕРИНГ
  // ============================================

  private render() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;

    ctx.save();

    // Тряска экрана
    if (this.screenShake > 0.5) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Отрисовка эффектов (под персонажами)
    this.renderEffects(ctx);

    // Отрисовка персонажей
    if (this.fighter1.y < height + 100) {
      this.renderFighter(ctx, this.fighter1);
    }
    if (this.fighter2.y < height + 100) {
      this.renderFighter(ctx, this.fighter2);
    }

    ctx.restore();
  }

  private renderEffects(ctx: CanvasRenderingContext2D) {
    this.effects.forEach(effect => {
      const progress = 1 - effect.timer / effect.maxTimer;
      
      if (effect.type === 'hit') {
        // Звезда удара
        ctx.save();
        ctx.globalAlpha = 1 - progress;
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 20;
        
        const size = 20 + progress * 30;
        this.drawStar(ctx, effect.x, effect.y, 8, size, size * 0.5);
        ctx.restore();
      }
      
      if (effect.type === 'land') {
        // Пыль при приземлении
        ctx.save();
        ctx.globalAlpha = 0.5 * (1 - progress);
        ctx.fillStyle = '#888888';
        
        const radius = 30 + progress * 20;
        ctx.beginPath();
        ctx.ellipse(effect.x, effect.y + 10, radius, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, points: number, outerR: number, innerR: number) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  private renderFighter(ctx: CanvasRenderingContext2D, fighter: Fighter) {
    const x = fighter.x;
    const y = fighter.y;
    const time = Date.now() / 100;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Разворот в зависимости от направления
    if (!fighter.facingRight) {
      ctx.scale(-1, 1);
    }

    // Мигание при получении урона
    if (fighter.flashTimer > 0 && Math.floor(fighter.flashTimer / 50) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Тень под персонажем
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 35, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Анимация в зависимости от состояния
    const animOffset = Math.sin(time * 2) * 2;
    
    // ===== НОГИ =====
    let legOffset = 0;
    let legSpread = 0;
    
    if (fighter.state === 'kick') {
      legSpread = 30;
      legOffset = 15;
    } else if (fighter.state === 'hurt') {
      legOffset = -5;
    } else {
      legOffset = animOffset;
    }

    // Левая нога
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(-8, 10);
    ctx.lineTo(-10 - legOffset, 35);
    ctx.lineTo(-4 - legOffset, 35);
    ctx.lineTo(-4, 10);
    ctx.fill();

    // Правая нога (или удар)
    ctx.beginPath();
    if (fighter.state === 'kick') {
      ctx.moveTo(8, 10);
      ctx.lineTo(30 + legSpread, 20);
      ctx.lineTo(25 + legSpread, 25);
      ctx.lineTo(5, 15);
    } else {
      ctx.moveTo(4, 10);
      ctx.lineTo(6 + legOffset, 35);
      ctx.lineTo(12 + legOffset, 35);
      ctx.lineTo(8, 10);
    }
    ctx.fill();

    // ===== ТЕЛО =====
    ctx.fillStyle = fighter.color;
    ctx.beginPath();
    ctx.moveTo(-15, 5);
    ctx.quadraticCurveTo(-18, -10, -12, -25);
    ctx.lineTo(12, -25);
    ctx.quadraticCurveTo(18, -10, 15, 5);
    ctx.lineTo(-15, 5);
    ctx.fill();

    // Полоска на рубашке
    ctx.fillStyle = fighter.accentColor;
    ctx.fillRect(-3, -22, 6, 20);

    // ===== РУКИ =====
    let armAngle = 0;
    let armExtend = 0;
    
    if (fighter.state === 'punch') {
      armAngle = -30;
      armExtend = 20;
    } else if (fighter.state === 'kick') {
      armAngle = 20;
    } else if (fighter.state === 'hurt') {
      armAngle = 45;
    } else {
      armAngle = Math.sin(time) * 10;
    }

    // Левая рука
    ctx.save();
    ctx.translate(-15, -15);
    ctx.rotate((armAngle * Math.PI) / 180);
    ctx.fillStyle = fighter.color;
    ctx.fillRect(-3, 0, 8, 18);
    // Кисть
    ctx.fillStyle = '#e8b89d';
    ctx.beginPath();
    ctx.arc(1, 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Правая рука (атакующая)
    ctx.save();
    ctx.translate(15, -15);
    ctx.rotate((-armAngle * Math.PI) / 180);
    ctx.fillStyle = fighter.color;
    ctx.fillRect(-5, 0, 8, 18 + armExtend);
    // Кисть / кулак
    ctx.fillStyle = '#e8b89d';
    if (fighter.state === 'punch') {
      ctx.beginPath();
      ctx.arc(-1, 25 + armExtend, 6, 0, Math.PI * 2);
      ctx.fill();
      // Перчатка
      ctx.fillStyle = fighter.color;
      ctx.beginPath();
      ctx.arc(-1, 25 + armExtend, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(-1, 20, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ===== ГОЛОВА =====
    const headBob = fighter.state === 'hurt' ? -3 : animOffset * 0.5;
    
    ctx.fillStyle = '#e8b89d';
    ctx.beginPath();
    ctx.ellipse(0, -35 + headBob, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Волосы
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.ellipse(0, -42 + headBob, 11, 8, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Повязка для игрока (красный)
    if (fighter.color === '#dc143c') {
      ctx.strokeStyle = '#dc143c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-14, -37 + headBob);
      ctx.lineTo(14, -37 + headBob);
      ctx.stroke();
      
      // Хвостик
      ctx.beginPath();
      ctx.moveTo(-12, -37 + headBob);
      ctx.lineTo(-18, -30 + headBob);
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Глаза
    const eyeY = -36 + headBob;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-5, eyeY, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, eyeY, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Зрачки
    const lookDir = fighter.state === 'hurt' ? -1 : 1;
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(-5 + lookDir, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5 + lookDir, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Выражение лица
    if (fighter.state === 'hurt') {
      // Гримаса боли
      ctx.strokeStyle = '#8b5a3c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -28 + headBob, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else if (fighter.state === 'punch' || fighter.state === 'kick') {
      // Открытый рот (крик)
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(0, -28 + headBob, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Обычный рот
      ctx.strokeStyle = '#8b5a3c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-3, -30 + headBob);
      ctx.lineTo(3, -30 + headBob);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Остановка анимации
  stop() {
    cancelAnimationFrame(this.animationId);
  }
}
