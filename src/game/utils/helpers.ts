// ============================================
// ИГРОВЫЕ УТИЛИТЫ - "ЗЛОБНЫЕ ГАМАЮНЫ"
// ============================================

import type { Vector2, Rectangle, Entity, Direction } from '../types';

// Генерация уникального ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Расстояние между двумя точками
export function distance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Расстояние по прямой (без sqrt)
export function distanceSquared(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

// Нормализация вектора
export function normalize(v: Vector2): Vector2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

// Длина вектора
export function length(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

// Сложение векторов
export function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

// Вычитание векторов
export function subtract(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

// Умножение вектора на скаляр
export function multiply(v: Vector2, scalar: number): Vector2 {
  return { x: v.x * scalar, y: v.y * scalar };
}

// Проверка столкновения двух прямоугольников
export function rectIntersect(a: Rectangle, b: Rectangle): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Проверка столкновения двух сущностей
export function entitiesCollide(a: Entity, b: Entity): boolean {
  return rectIntersect(
    { x: a.position.x, y: a.position.y, width: a.width, height: a.height },
    { x: b.position.x, y: b.position.y, width: b.width, height: b.height }
  );
}

// Проверка, находится ли точка внутри прямоугольника
export function pointInRect(point: Vector2, rect: Rectangle): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// Ограничение значения в диапазоне
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Линейная интерполяция
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Плавное затухание
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

// Получение направления от точки к точке
export function getDirection(from: Vector2, to: Vector2): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}

// Получение вектора направления
export function getDirectionVector(direction: Direction): Vector2 {
  switch (direction) {
    case 'up': return { x: 0, y: -1 };
    case 'down': return { x: 0, y: 1 };
    case 'left': return { x: -1, y: 0 };
    case 'right': return { x: 1, y: 0 };
  }
}

// Случайное число в диапазоне
export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Случайное целое в диапазоне
export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

// Случайный выбор из массива
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Перемешивание массива
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Ограничение позиции в пределах карты
export function clampToMap(pos: Vector2, width: number, height: number): Vector2 {
  return {
    x: clamp(pos.x, 0, 1600 - width),
    y: clamp(pos.y, 0, 1200 - height),
  };
}

// Угол между двумя точками
export function angle(from: Vector2, to: Vector2): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

// Вектор из угла
export function vectorFromAngle(angle: number, length: number = 1): Vector2 {
  return {
    x: Math.cos(angle) * length,
    y: Math.sin(angle) * length,
  };
}

// Форматирование времени
export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Глубокое копирование
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Задержка (Promise)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Проверка шанса (процент)
export function chance(percentage: number): boolean {
  return Math.random() * 100 < percentage;
}
