// ============================================
// ИГРОВЫЕ КОНСТАНТЫ - "ЗЛОБНЫЕ ГАМАЮНЫ"
// ============================================

import type { Weapon, EnemyType, Dialog, Upgrade, PlayerStats } from './types';

// Размеры игры
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const TILE_SIZE = 32;

// Размеры карты
export const MAP_WIDTH = 1600;
export const MAP_HEIGHT = 1200;

// Настройки игрока
export const PLAYER_WIDTH = 28;
export const PLAYER_HEIGHT = 32;
export const PLAYER_BASE_SPEED = 3;
export const PLAYER_SPRINT_MULTIPLIER = 1.6;
export const PLAYER_MAX_STAMINA = 100;
export const PLAYER_STAMINA_DRAIN = 0.8;
export const PLAYER_STAMINA_REGEN = 0.3;

// Настройки врагов
export const ENEMY_WIDTH = 24;
export const ENEMY_HEIGHT = 28;

// Боевая система
export const ATTACK_DURATION = 300; // ms
export const INVULNERABILITY_TIME = 800; // ms
export const KNOCKBACK_FORCE = 8;
export const KNOCKBACK_DECAY = 0.85;

// Восстановление здоровья
export const BEER_HEAL_AMOUNT = 40;
export const BEER_MAX = 5;
export const BEER_COOLDOWN = 2000; // ms
export const BEER_DRINK_TIME = 1000; // ms

// Прогрессия
export const EXPERIENCE_PER_ENEMY: Record<EnemyType, number> = {
  normal: 10,
  fast: 15,
  heavy: 25,
  boss: 100,
};

export const EXPERIENCE_TO_LEVEL = (level: number) => Math.floor(50 * Math.pow(1.5, level - 1));

// Оружие
export const WEAPONS: Record<string, Weapon> = {
  bat: {
    type: 'bat',
    name: 'Бита',
    damage: 25,
    cooldown: 600,
    range: 50,
    knockback: 12,
    speed: 'normal',
  },
  crowbar: {
    type: 'crowbar',
    name: 'Ломик',
    damage: 15,
    cooldown: 350,
    range: 40,
    knockback: 6,
    speed: 'fast',
  },
};

// Характеристики врагов
export const ENEMY_STATS: Record<EnemyType, {
  health: number;
  damage: number;
  speed: number;
  attackRange: number;
  sightRange: number;
  attackCooldown: number;
}> = {
  normal: {
    health: 50,
    damage: 8,
    speed: 1.5,
    attackRange: 35,
    sightRange: 150,
    attackCooldown: 1200,
  },
  fast: {
    health: 30,
    damage: 5,
    speed: 3,
    attackRange: 30,
    sightRange: 180,
    attackCooldown: 800,
  },
  heavy: {
    health: 120,
    damage: 15,
    speed: 0.8,
    attackRange: 40,
    sightRange: 120,
    attackCooldown: 1800,
  },
  boss: {
    health: 300,
    damage: 25,
    speed: 1.2,
    attackRange: 50,
    sightRange: 200,
    attackCooldown: 1500,
  },
};

// Диалоги для групп врагов
export const GROUP_DIALOGS: Dialog[][] = [
  // Группа 1 - Первая встреча
  [
    {
      id: 'g1_start',
      speaker: 'Главарь',
      text: 'Эй, парень! Ты чё тут делаешь? Это наша территория!',
      options: [
        { id: 'g1_1', text: 'Разойтись по-хорошему', effect: 'retreat' },
        { id: 'g1_2', text: 'Мне нужен проход', effect: 'fight' },
        { id: 'g1_3', text: 'Проверим, кто сильнее', effect: 'intensify' },
      ],
    },
  ],
  // Группа 2
  [
    {
      id: 'g2_start',
      speaker: 'Гамаюн',
      text: 'Слышь, козлина! Ты на нашу turf зашёл. Сейчас мы тебя научим манерам!',
      options: [
        { id: 'g2_1', text: 'Я не ищу неприятностей', effect: 'fight' },
        { id: 'g2_2', text: 'Ваш главарь - трус!', effect: 'intensify' },
        { id: 'g2_3', text: 'Давай по-честному, один на один', effect: 'intimidate' },
      ],
    },
  ],
  // Группа 3
  [
    {
      id: 'g3_start',
      speaker: 'Авторитет',
      text: 'Хм, вижу ты уже потрёпан. Но это наши земли. Плати дань или проваливай!',
      options: [
        { id: 'g3_1', text: 'Денег нет, но есть бита', effect: 'fight' },
        { id: 'g3_2', text: 'Может договоримся?', effect: 'retreat' },
        { id: 'g3_3', text: 'Ты следующий на моём списке', effect: 'intensify' },
      ],
    },
  ],
  // Мини-босс
  [
    {
      id: 'boss_start',
      speaker: 'Босс Района',
      text: 'Так ты тот самый выскочка, который моих людей мочит? Ну всё, хана тебе!',
      options: [
        { id: 'boss_1', text: 'Твои люди сами напросились', effect: 'fight' },
        { id: 'boss_2', text: 'Давай закончим это по-быстрому', effect: 'fight' },
      ],
    },
  ],
];

// Апгрейды
export const UPGRADES: Upgrade[] = [
  {
    id: 'damage',
    name: 'Урон',
    description: 'Увеличивает урон от атак',
    icon: '⚔️',
    maxLevel: 10,
    currentLevel: 0,
    cost: 1,
    effect: (stats: PlayerStats, level: number) => ({
      ...stats,
      damage: stats.damage + level * 5,
    }),
  },
  {
    id: 'attack_speed',
    name: 'Скорость атаки',
    description: 'Уменьшает задержку между атаками',
    icon: '⚡',
    maxLevel: 8,
    currentLevel: 0,
    cost: 1,
    effect: (stats: PlayerStats, level: number) => ({
      ...stats,
      attackSpeed: stats.attackSpeed + level * 0.1,
    }),
  },
  {
    id: 'health',
    name: 'Здоровье',
    description: 'Увеличивает максимальное здоровье',
    icon: '❤️',
    maxLevel: 10,
    currentLevel: 0,
    cost: 1,
    effect: (stats: PlayerStats, level: number) => ({
      ...stats,
      maxHealth: stats.maxHealth + level * 20,
    }),
  },
  {
    id: 'speed',
    name: 'Скорость',
    description: 'Увеличивает скорость передвижения',
    icon: '👟',
    maxLevel: 5,
    currentLevel: 0,
    cost: 1,
    effect: (stats: PlayerStats, level: number) => ({
      ...stats,
      moveSpeed: stats.moveSpeed + level * 0.3,
    }),
  },
  {
    id: 'beer_heal',
    name: 'Жигулёвское+',
    description: 'Увеличивает восстановление от пива',
    icon: '🍺',
    maxLevel: 5,
    currentLevel: 0,
    cost: 1,
    effect: (stats: PlayerStats, level: number) => ({
      ...stats,
      beerHeal: stats.beerHeal + level * 10,
    }),
  },
];

// Базовые статы игрока
export const BASE_PLAYER_STATS: PlayerStats = {
  damage: 25,
  attackSpeed: 1,
  maxHealth: 100,
  moveSpeed: PLAYER_BASE_SPEED,
  beerHeal: BEER_HEAL_AMOUNT,
};

// Цвета
export const COLORS = {
  // Игрок
  playerSkin: '#e8b89d',
  playerBandana: '#cc2222',
  playerPants: '#334455',
  playerBat: '#8B4513',
  
  // Враги
  enemyNormal: '#556677',
  enemyFast: '#668866',
  enemyHeavy: '#664433',
  enemyBoss: '#883322',
  
  // UI
  healthBar: '#22cc44',
  healthBarBg: '#333333',
  healthBarBorder: '#111111',
  staminaBar: '#44aacc',
  expBar: '#ccaa22',
  
  // Карта
  ground: '#3a3a3a',
  groundLine: '#444444',
  wall: '#555555',
  
  // Эффекты
  hit: '#ffff00',
  damage: '#ff4444',
  heal: '#44ff44',
};

// Клавиши управления
export const KEYS = {
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  attack: ['Space'],
  sprint: ['ShiftLeft', 'ShiftRight'],
  useBeer: ['KeyE', 'KeyQ'],
  interact: ['KeyF', 'Enter'],
  pause: ['Escape'],
};
