// ============================================
// ИГРОВЫЕ ТИПЫ - "ЗЛОБНЫЕ ГАМАЮНЫ"
// ============================================

// Позиция и размеры
export interface Vector2 {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Направления
export type Direction = 'up' | 'down' | 'left' | 'right';

// Типы оружия
export type WeaponType = 'bat' | 'crowbar';

export interface Weapon {
  type: WeaponType;
  name: string;
  damage: number;
  cooldown: number;
  range: number;
  knockback: number;
  speed: 'fast' | 'normal' | 'slow';
}

// Типы врагов
export type EnemyType = 'normal' | 'fast' | 'heavy' | 'boss';

// Состояния персонажа
export type CharacterState = 'idle' | 'walking' | 'attacking' | 'hurt' | 'dead' | 'drinking';

// Базовый интерфейс для всех сущностей
export interface Entity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  state: CharacterState;
  direction: Direction;
  isInvulnerable: boolean;
  invulnerableTimer: number;
}

// Игрок
export interface Player extends Entity {
  weapon: Weapon;
  attackCooldown: number;
  beerCount: number;
  maxBeer: number;
  beerCooldown: number;
  isDrinkingBeer: boolean;
  drinkingTimer: number;
  experience: number;
  level: number;
  upgradePoints: number;
  stats: PlayerStats;
  isSprinting: boolean;
  stamina: number;
  maxStamina: number;
}

// Характеристики игрока
export interface PlayerStats {
  damage: number;
  attackSpeed: number;
  maxHealth: number;
  moveSpeed: number;
  beerHeal: number;
}

// Враг
export interface Enemy extends Entity {
  type: EnemyType;
  damage: number;
  moveSpeed: number;
  attackRange: number;
  sightRange: number;
  attackCooldown: number;
  currentAttackCooldown: number;
  group: number;
  isAggro: boolean;
  droppedBeer: boolean;
}

// Группа врагов
export interface EnemyGroup {
  id: number;
  position: Vector2;
  enemies: Enemy[];
  isDefeated: boolean;
  wasApproached: boolean;
  dialogShown: boolean;
}

// Диалог
export interface DialogOption {
  id: string;
  text: string;
  effect: 'fight' | 'retreat' | 'intensify' | 'intimidate';
}

export interface Dialog {
  id: string;
  speaker: string;
  text: string;
  options?: DialogOption[];
  nextDialogId?: string;
}

// Предметы на карте
export interface Item {
  id: string;
  type: 'beer' | 'health';
  position: Vector2;
  isCollected: boolean;
}

// Игровое состояние
export type GameState = 'intro' | 'playing' | 'dialog' | 'upgrade' | 'paused' | 'gameover' | 'victory';

// Ввод игрока
export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
  sprint: boolean;
  useBeer: boolean;
  interact: boolean;
}

// Апгрейды
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  currentLevel: number;
  cost: number;
  effect: (stats: PlayerStats, level: number) => PlayerStats;
}

// Зона карты
export interface MapZone {
  id: string;
  name: string;
  bounds: Rectangle;
  enemyGroups: EnemyGroup[];
  items: Item[];
}

// Звуки
export type SoundType = 'hit' | 'hurt' | 'beer' | 'pickup' | 'step' | 'victory' | 'death' | 'select';

// События игры
export type GameEvent = 
  | { type: 'player_attack' }
  | { type: 'enemy_hit'; enemyId: string; damage: number }
  | { type: 'player_hit'; damage: number }
  | { type: 'enemy_death'; enemyId: string }
  | { type: 'player_death' }
  | { type: 'beer_used' }
  | { type: 'item_collected'; itemType: 'beer' }
  | { type: 'level_up'; newLevel: number }
  | { type: 'group_defeated'; groupId: number }
  | { type: 'dialog_start'; groupId: number }
  | { type: 'dialog_end'; choice: string };

// Камера
export interface Camera {
  position: Vector2;
  target: Vector2;
  shake: number;
  shakeDecay: number;
}

// Настройки игры
export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  showMinimap: boolean;
  showFPS: boolean;
}

// Сохранение
export interface SaveData {
  playerStats: PlayerStats;
  playerLevel: number;
  playerExperience: number;
  beerCount: number;
  defeatedGroups: number[];
  currentZone: string;
}
