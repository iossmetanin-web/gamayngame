// ============================================
// ИГРОВОЙ ДВИЖОК - "ЗЛОБНЫЕ ГАМАЮНЫ"
// ============================================
// v2.0

import type { 
  Player, 
  Enemy, 
  EnemyGroup, 
  GameState, 
  PlayerInput, 
  Camera,
  Item,
  Dialog,
  PlayerStats,
  Upgrade
} from '../types';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  MAP_WIDTH, 
  MAP_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  ENEMY_WIDTH,
  ENEMY_HEIGHT,
  PLAYER_BASE_SPEED,
  PLAYER_SPRINT_MULTIPLIER,
  PLAYER_MAX_STAMINA,
  PLAYER_STAMINA_DRAIN,
  PLAYER_STAMINA_REGEN,
  WEAPONS,
  ENEMY_STATS,
  EXPERIENCE_PER_ENEMY,
  EXPERIENCE_TO_LEVEL,
  BEER_MAX,
  BEER_COOLDOWN,
  BEER_DRINK_TIME,
  GROUP_DIALOGS,
  UPGRADES,
  BASE_PLAYER_STATS
} from '../constants';
import { 
  generateId, 
  distance, 
  normalize, 
  add, 
  multiply, 
  clamp, 
  clampToMap,
  getDirection,
  randomRange,
  randomInt,
  chance
} from '../utils/helpers';
import { playSound } from '../utils/sounds';

// ============================================
// КЛАСС ИГРОВОГО ДВИЖКА
// ============================================

export class GameEngine {
  // Состояние
  state: GameState = 'intro';
  lastTime: number = 0;
  deltaTime: number = 0;
  
  // Игрок
  player: Player;
  
  // Враги
  enemyGroups: EnemyGroup[] = [];
  activeEnemies: Enemy[] = [];
  
  // Предметы
  items: Item[] = [];
  
  // Камера
  camera: Camera = {
    position: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    shake: 0,
    shakeDecay: 0.9,
  };
  
  // Ввод
  input: PlayerInput = {
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
    sprint: false,
    useBeer: false,
    interact: false,
  };
  
  // Диалог
  currentDialog: Dialog | null = null;
  currentGroupId: number = 0;
  dialogIndex: number = 0;
  
  // Прогрессия
  upgrades: Upgrade[] = [];
  pendingUpgradePoints: number = 0;
  
  // Эффекты
  hitEffects: { x: number; y: number; progress: number }[] = [];
  damageNumbers: { x: number; y: number; value: number; isHeal: boolean; life: number }[] = [];
  
  // Время в игре
  gameTime: number = 0;
  
  constructor() {
    this.player = this.createPlayer();
    this.upgrades = JSON.parse(JSON.stringify(UPGRADES));
    this.initializeEnemyGroups();
    this.initializeItems();
  }
  
  // ============================================
  // ИНИЦИАЛИЗАЦИЯ
  // ============================================
  
  createPlayer(): Player {
    return {
      id: 'player',
      position: { x: 100, y: 300 },
      velocity: { x: 0, y: 0 },
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      health: BASE_PLAYER_STATS.maxHealth,
      maxHealth: BASE_PLAYER_STATS.maxHealth,
      state: 'idle',
      direction: 'right',
      isInvulnerable: false,
      invulnerableTimer: 0,
      weapon: WEAPONS.bat,
      attackCooldown: 0,
      beerCount: 3,
      maxBeer: BEER_MAX,
      beerCooldown: 0,
      isDrinkingBeer: false,
      drinkingTimer: 0,
      experience: 0,
      level: 1,
      upgradePoints: 0,
      stats: { ...BASE_PLAYER_STATS },
      isSprinting: false,
      stamina: PLAYER_MAX_STAMINA,
      maxStamina: PLAYER_MAX_STAMINA,
    };
  }
  
  initializeEnemyGroups() {
    // Группа 1 - начальная зона
    this.enemyGroups.push({
      id: 1,
      position: { x: 300, y: 250 },
      enemies: this.createEnemyGroup(1, { x: 300, y: 250 }, 'normal', 3),
      isDefeated: false,
      wasApproached: false,
      dialogShown: false,
    });
    
    // Группа 2 - средняя зона
    this.enemyGroups.push({
      id: 2,
      position: { x: 700, y: 400 },
      enemies: this.createEnemyGroup(2, { x: 700, y: 400 }, 'mixed', 4),
      isDefeated: false,
      wasApproached: false,
      dialogShown: false,
    });
    
    // Группа 3 - дальняя зона
    this.enemyGroups.push({
      id: 3,
      position: { x: 1100, y: 300 },
      enemies: this.createEnemyGroup(3, { x: 1100, y: 300 }, 'heavy', 3),
      isDefeated: false,
      wasApproached: false,
      dialogShown: false,
    });
    
    // Мини-босс
    this.enemyGroups.push({
      id: 4,
      position: { x: 1400, y: 600 },
      enemies: [this.createEnemy('boss', { x: 1400, y: 600 }, 4)],
      isDefeated: false,
      wasApproached: false,
      dialogShown: false,
    });
  }
  
  createEnemyGroup(groupId: number, center: { x: number; y: number }, type: 'normal' | 'mixed' | 'heavy', count: number): Enemy[] {
    const enemies: Enemy[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 40 + Math.random() * 30;
      const pos = {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
      };
      
      let enemyType: 'normal' | 'fast' | 'heavy';
      if (type === 'normal') {
        enemyType = 'normal';
      } else if (type === 'heavy') {
        enemyType = chance(50) ? 'heavy' : 'normal';
      } else {
        // mixed
        const types: ('normal' | 'fast' | 'heavy')[] = ['normal', 'fast', 'heavy'];
        enemyType = types[randomInt(0, 2)];
      }
      
      enemies.push(this.createEnemy(enemyType, pos, groupId));
    }
    
    return enemies;
  }
  
  createEnemy(type: 'normal' | 'fast' | 'heavy' | 'boss', position: { x: number; y: number }, group: number): Enemy {
    const stats = ENEMY_STATS[type];
    
    let width = ENEMY_WIDTH;
    let height = ENEMY_HEIGHT;
    
    if (type === 'fast') {
      width = 20;
      height = 24;
    } else if (type === 'heavy') {
      width = 32;
      height = 36;
    } else if (type === 'boss') {
      width = 40;
      height = 44;
    }
    
    return {
      id: generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      width,
      height,
      health: stats.health,
      maxHealth: stats.health,
      state: 'idle',
      direction: 'left',
      isInvulnerable: false,
      invulnerableTimer: 0,
      type,
      damage: stats.damage,
      moveSpeed: stats.speed,
      attackRange: stats.attackRange,
      sightRange: stats.sightRange,
      attackCooldown: stats.attackCooldown,
      currentAttackCooldown: 0,
      group,
      isAggro: false,
      droppedBeer: false,
    };
  }
  
  initializeItems() {
    // Несколько бутылок пива на карте
    const beerPositions = [
      { x: 200, y: 500 },
      { x: 600, y: 200 },
      { x: 1000, y: 450 },
      { x: 1300, y: 150 },
    ];
    
    beerPositions.forEach((pos, i) => {
      this.items.push({
        id: `beer-${i}`,
        type: 'beer',
        position: pos,
        isCollected: false,
      });
    });
  }
  
  // ============================================
  // ОБНОВЛЕНИЕ ИГРЫ
  // ============================================
  
  update(timestamp: number) {
    if (this.state !== 'playing') return;
    
    // Delta time
    this.deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;
    this.gameTime += this.deltaTime * 1000;
    
    // Обновление игрока
    this.updatePlayer();
    
    // Обновление врагов
    this.updateEnemies();
    
    // Обновление камеры
    this.updateCamera();
    
    // Обновление эффектов
    this.updateEffects();
    
    // Проверка столкновений с предметами
    this.checkItemCollisions();
    
    // Проверка столкновений с группами врагов
    this.checkGroupCollisions();
    
    // Проверка победы
    this.checkVictory();
  }
  
  updatePlayer() {
    // Обновление таймеров
    if (this.player.attackCooldown > 0) {
      this.player.attackCooldown -= this.deltaTime * 1000;
    }
    
    if (this.player.beerCooldown > 0) {
      this.player.beerCooldown -= this.deltaTime * 1000;
    }
    
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= this.deltaTime * 1000;
      if (this.player.invulnerableTimer <= 0) {
        this.player.isInvulnerable = false;
      }
    }
    
    // Питьё пива
    if (this.player.isDrinkingBeer) {
      this.player.drinkingTimer -= this.deltaTime * 1000;
      if (this.player.drinkingTimer <= 0) {
        this.finishDrinking();
      }
      return; // Блокируем движение во время питья
    }
    
    // Движение
    this.handleMovement();
    
    // Атака
    if (this.input.attack && this.player.attackCooldown <= 0 && this.player.state !== 'attacking') {
      this.performAttack();
    }
    
    // Использование пива
    if (this.input.useBeer && this.player.beerCooldown <= 0 && this.player.beerCount > 0) {
      this.startDrinking();
    }
  }
  
  handleMovement() {
    let dx = 0;
    let dy = 0;
    
    if (this.input.up) dy -= 1;
    if (this.input.down) dy += 1;
    if (this.input.left) dx -= 1;
    if (this.input.right) dx += 1;
    
    // Нормализация диагонального движения
    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }
    
    // Спринт
    let speed = this.player.stats.moveSpeed;
    if (this.input.sprint && this.player.stamina > 0 && (dx !== 0 || dy !== 0)) {
      speed *= PLAYER_SPRINT_MULTIPLIER;
      this.player.stamina = Math.max(0, this.player.stamina - PLAYER_STAMINA_DRAIN);
      this.player.isSprinting = true;
    } else {
      // Восстановление стамины
      this.player.stamina = Math.min(PLAYER_MAX_STAMINA, this.player.stamina + PLAYER_STAMINA_REGEN);
      this.player.isSprinting = false;
    }
    
    // Применение скорости
    this.player.velocity.x = dx * speed;
    this.player.velocity.y = dy * speed;
    
    // Обновление позиции
    const newPos = add(this.player.position, this.player.velocity);
    this.player.position = clampToMap(newPos, this.player.width, this.player.height);
    
    // Обновление направления
    if (dx !== 0 || dy !== 0) {
      this.player.state = 'walking';
      this.player.direction = getDirection({ x: 0, y: 0 }, { x: dx, y: dy });
    } else {
      this.player.state = 'idle';
    }
  }
  
  performAttack() {
    this.player.state = 'attacking';
    this.player.attackCooldown = this.player.weapon.cooldown / this.player.stats.attackSpeed;
    
    // Определение зоны атаки
    const attackRange = this.player.weapon.range;
    const playerCenter = {
      x: this.player.position.x + this.player.width / 2,
      y: this.player.position.y + this.player.height / 2,
    };
    
    // Вектор направления атаки
    const dirVector = this.getDirectionVector(this.player.direction);
    
    // Точка удара
    const hitPoint = add(playerCenter, multiply(dirVector, attackRange * 0.5));
    
    // Проверка попадания по врагам
    this.activeEnemies.forEach(enemy => {
      if (enemy.state === 'dead') return;
      
      const enemyCenter = {
        x: enemy.position.x + enemy.width / 2,
        y: enemy.position.y + enemy.height / 2,
      };
      
      const dist = distance(hitPoint, enemyCenter);
      
      if (dist < attackRange) {
        this.hitEnemy(enemy, hitPoint);
      }
    });
    
    // Эффект удара
    this.addHitEffect(hitPoint);
    this.camera.shake = 5;
    
    playSound('hit', 0.6);
  }
  
  hitEnemy(enemy: Enemy, hitPoint: { x: number; y: number }) {
    // Урон
    const damage = this.player.stats.damage + this.player.weapon.damage;
    enemy.health -= damage;
    enemy.isInvulnerable = true;
    enemy.invulnerableTimer = 200;
    enemy.state = 'hurt';
    
    // Отталкивание
    const knockbackDir = normalize(subtract(
      { x: enemy.position.x + enemy.width / 2, y: enemy.position.y + enemy.height / 2 },
      hitPoint
    ));
    enemy.velocity = multiply(knockbackDir, this.player.weapon.knockback);
    
    // Эффект урона
    this.addDamageNumber(enemy.position.x + enemy.width / 2, enemy.position.y, damage, false);
    
    // Проверка смерти
    if (enemy.health <= 0) {
      this.killEnemy(enemy);
    }
  }
  
  killEnemy(enemy: Enemy) {
    enemy.state = 'dead';
    enemy.health = 0;
    
    // Опыт
    const exp = EXPERIENCE_PER_ENEMY[enemy.type];
    this.addExperience(exp);
    
    // Шанс дропа пива
    if (!enemy.droppedBeer && chance(30)) {
      this.items.push({
        id: generateId(),
        type: 'beer',
        position: { ...enemy.position },
        isCollected: false,
      });
      enemy.droppedBeer = true;
    }
    
    // Проверка уничтожения группы
    const group = this.enemyGroups.find(g => g.id === enemy.group);
    if (group) {
      const allDead = group.enemies.every(e => e.state === 'dead');
      if (allDead) {
        group.isDefeated = true;
        this.camera.shake = 10;
        playSound('victory', 0.5);
      }
    }
  }
  
  startDrinking() {
    if (this.player.beerCount <= 0 || this.player.isDrinkingBeer) return;
    
    this.player.isDrinkingBeer = true;
    this.player.drinkingTimer = BEER_DRINK_TIME;
    this.player.state = 'drinking';
    this.player.beerCount--;
    
    playSound('beer', 0.5);
  }
  
  finishDrinking() {
    this.player.isDrinkingBeer = false;
    const healAmount = this.player.stats.beerHeal;
    this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
    this.player.beerCooldown = BEER_COOLDOWN;
    
    this.addDamageNumber(
      this.player.position.x + this.player.width / 2,
      this.player.position.y,
      healAmount,
      true
    );
    
    this.player.state = 'idle';
  }
  
  // ============================================
  // ОБНОВЛЕНИЕ ВРАГОВ
  // ============================================
  
  updateEnemies() {
    this.activeEnemies.forEach(enemy => {
      if (enemy.state === 'dead') return;
      
      // Обновление таймеров
      if (enemy.invulnerableTimer > 0) {
        enemy.invulnerableTimer -= this.deltaTime * 1000;
        if (enemy.invulnerableTimer <= 0) {
          enemy.isInvulnerable = false;
        }
      }
      
      if (enemy.currentAttackCooldown > 0) {
        enemy.currentAttackCooldown -= this.deltaTime * 1000;
      }
      
      // Восстановление состояния
      if (enemy.state === 'hurt' && enemy.invulnerableTimer <= 0) {
        enemy.state = 'idle';
      }
      
      // ИИ врага
      this.updateEnemyAI(enemy);
      
      // Применение скорости и затухание
      enemy.position = add(enemy.position, enemy.velocity);
      enemy.velocity = multiply(enemy.velocity, 0.85);
      
      // Ограничение позиции
      enemy.position = clampToMap(enemy.position, enemy.width, enemy.height);
    });
  }
  
  updateEnemyAI(enemy: Enemy) {
    const playerCenter = {
      x: this.player.position.x + this.player.width / 2,
      y: this.player.position.y + this.player.height / 2,
    };
    
    const enemyCenter = {
      x: enemy.position.x + enemy.width / 2,
      y: enemy.position.y + enemy.height / 2,
    };
    
    const distToPlayer = distance(enemyCenter, playerCenter);
    
    // Проверка агрессии
    if (distToPlayer < enemy.sightRange) {
      enemy.isAggro = true;
    }
    
    if (!enemy.isAggro) return;
    
    // Движение к игроку
    if (distToPlayer > enemy.attackRange) {
      const dir = normalize(subtract(playerCenter, enemyCenter));
      enemy.velocity = add(enemy.velocity, multiply(dir, enemy.moveSpeed * 0.3));
      enemy.state = 'walking';
      enemy.direction = getDirection(enemyCenter, playerCenter);
    } else {
      // Атака
      enemy.state = 'idle';
      if (enemy.currentAttackCooldown <= 0) {
        this.enemyAttack(enemy);
      }
    }
  }
  
  enemyAttack(enemy: Enemy) {
    if (this.player.isInvulnerable) return;
    
    enemy.currentAttackCooldown = enemy.attackCooldown;
    
    const playerCenter = {
      x: this.player.position.x + this.player.width / 2,
      y: this.player.position.y + this.player.height / 2,
    };
    
    const enemyCenter = {
      x: enemy.position.x + enemy.width / 2,
      y: enemy.position.y + enemy.height / 2,
    };
    
    const dist = distance(enemyCenter, playerCenter);
    
    if (dist < enemy.attackRange + 20) {
      this.playerTakeDamage(enemy.damage);
      
      // Отталкивание игрока
      const knockbackDir = normalize(subtract(playerCenter, enemyCenter));
      this.player.velocity = multiply(knockbackDir, 8);
    }
  }
  
  playerTakeDamage(damage: number) {
    if (this.player.isInvulnerable) return;
    
    this.player.health -= damage;
    this.player.isInvulnerable = true;
    this.player.invulnerableTimer = 800;
    this.player.state = 'hurt';
    
    this.camera.shake = 8;
    this.addDamageNumber(
      this.player.position.x + this.player.width / 2,
      this.player.position.y,
      damage,
      false
    );
    
    playSound('hurt', 0.6);
    
    if (this.player.health <= 0) {
      this.gameOver();
    }
  }
  
  // ============================================
  // КАМЕРА
  // ============================================
  
  updateCamera() {
    // Следование за игроком
    this.camera.target = {
      x: this.player.position.x - GAME_WIDTH / 2 + this.player.width / 2,
      y: this.player.position.y - GAME_HEIGHT / 2 + this.player.height / 2,
    };
    
    // Плавное движение
    this.camera.position.x += (this.camera.target.x - this.camera.position.x) * 0.1;
    this.camera.position.y += (this.camera.target.y - this.camera.position.y) * 0.1;
    
    // Ограничение камеры
    this.camera.position.x = clamp(this.camera.position.x, 0, MAP_WIDTH - GAME_WIDTH);
    this.camera.position.y = clamp(this.camera.position.y, 0, MAP_HEIGHT - GAME_HEIGHT);
    
    // Затухание тряски
    this.camera.shake *= this.camera.shakeDecay;
    if (this.camera.shake < 0.1) this.camera.shake = 0;
  }
  
  // ============================================
  // ДИАЛОГИ
  // ============================================
  
  checkGroupCollisions() {
    this.enemyGroups.forEach(group => {
      if (group.isDefeated || group.wasApproached) return;
      
      const dist = distance(this.player.position, group.position);
      
      if (dist < 100 && !group.dialogShown) {
        this.startDialog(group);
      }
    });
  }
  
  startDialog(group: EnemyGroup) {
    group.wasApproached = true;
    group.dialogShown = true;
    this.currentGroupId = group.id;
    this.dialogIndex = 0;
    
    // Активация врагов
    group.enemies.forEach(enemy => {
      this.activeEnemies.push(enemy);
      enemy.isAggro = true;
    });
    
    // Получение диалога для группы
    const dialogGroup = GROUP_DIALOGS[Math.min(group.id - 1, GROUP_DIALOGS.length - 1)];
    this.currentDialog = dialogGroup[0];
    this.state = 'dialog';
  }
  
  selectDialogOption(optionId: string) {
    const option = this.currentDialog?.options?.find(o => o.id === optionId);
    if (!option) return;
    
    playSound('select', 0.5);
    
    // Применение эффекта выбора
    this.applyDialogEffect(option.effect);
    
    this.currentDialog = null;
    this.state = 'playing';
  }
  
  applyDialogEffect(effect: 'fight' | 'retreat' | 'intensify' | 'intimidate') {
    const group = this.enemyGroups.find(g => g.id === this.currentGroupId);
    if (!group) return;
    
    switch (effect) {
      case 'fight':
        // Обычный бой
        break;
        
      case 'retreat':
        // Некоторые враги уходят
        const retreatCount = Math.floor(group.enemies.length * 0.4);
        for (let i = 0; i < retreatCount; i++) {
          const aliveEnemy = group.enemies.find(e => e.state !== 'dead');
          if (aliveEnemy) {
            aliveEnemy.state = 'dead';
            this.activeEnemies = this.activeEnemies.filter(e => e.id !== aliveEnemy.id);
          }
        }
        break;
        
      case 'intensify':
        // Враги становятся сильнее
        group.enemies.forEach(enemy => {
          if (enemy.state !== 'dead') {
            enemy.damage *= 1.5;
            enemy.moveSpeed *= 1.3;
          }
        });
        break;
        
      case 'intimidate':
        // Один враг убегает
        const scaredEnemy = group.enemies.find(e => e.state !== 'dead');
        if (scaredEnemy) {
          scaredEnemy.state = 'dead';
          this.activeEnemies = this.activeEnemies.filter(e => e.id !== scaredEnemy.id);
        }
        break;
    }
  }
  
  // ============================================
  // ПРЕДМЕТЫ
  // ============================================
  
  checkItemCollisions() {
    this.items.forEach(item => {
      if (item.isCollected) return;
      
      const dist = distance(
        this.player.position,
        item.position
      );
      
      if (dist < 30) {
        this.collectItem(item);
      }
    });
  }
  
  collectItem(item: Item) {
    item.isCollected = true;
    
    if (item.type === 'beer') {
      if (this.player.beerCount < this.player.maxBeer) {
        this.player.beerCount++;
        playSound('pickup', 0.5);
        this.addDamageNumber(item.position.x, item.position.y, 1, true);
      }
    }
  }
  
  // ============================================
  // ПРОГРЕССИЯ
  // ============================================
  
  addExperience(amount: number) {
    this.player.experience += amount;
    
    while (this.player.experience >= EXPERIENCE_TO_LEVEL(this.player.level)) {
      this.player.experience -= EXPERIENCE_TO_LEVEL(this.player.level);
      this.player.level++;
      this.player.upgradePoints++;
      this.pendingUpgradePoints++;
      
      // Показать меню прокачки
      this.state = 'upgrade';
    }
  }
  
  applyUpgrade(upgradeId: string) {
    const upgrade = this.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || this.player.upgradePoints <= 0) return;
    if (upgrade.currentLevel >= upgrade.maxLevel) return;
    
    upgrade.currentLevel++;
    this.player.upgradePoints--;
    this.player.stats = upgrade.effect(this.player.stats, upgrade.currentLevel);
    
    // Обновление здоровья если увеличивали
    if (upgradeId === 'health') {
      this.player.maxHealth = this.player.stats.maxHealth;
      this.player.health = Math.min(this.player.health + 20, this.player.maxHealth);
    }
    
    playSound('pickup', 0.5);
    
    if (this.player.upgradePoints <= 0) {
      this.state = 'playing';
    }
  }
  
  // ============================================
  // ЭФФЕКТЫ
  // ============================================
  
  addHitEffect(position: { x: number; y: number }) {
    this.hitEffects.push({
      x: position.x,
      y: position.y,
      progress: 0,
    });
  }
  
  addDamageNumber(x: number, y: number, value: number, isHeal: boolean) {
    this.damageNumbers.push({
      x,
      y,
      value,
      isHeal,
      life: 1,
    });
  }
  
  updateEffects() {
    // Обновление эффектов удара
    this.hitEffects = this.hitEffects.filter(effect => {
      effect.progress += this.deltaTime * 3;
      return effect.progress < 1;
    });
    
    // Обновление чисел урона
    this.damageNumbers = this.damageNumbers.filter(num => {
      num.y -= 30 * this.deltaTime;
      num.life -= this.deltaTime * 1.5;
      return num.life > 0;
    });
  }
  
  // ============================================
  // СОСТОЯНИЯ ИГРЫ
  // ============================================
  
  startGame() {
    this.state = 'playing';
    this.lastTime = performance.now();
    playSound('select', 0.5);
    return this.state;
  }
  
  pauseGame() {
    if (this.state === 'playing') {
      this.state = 'paused';
    } else if (this.state === 'paused') {
      this.state = 'playing';
    }
    return this.state;
  }
  
  resumeGame() {
    this.state = 'playing';
    return this.state;
  }
  
  gameOver() {
    this.player.state = 'dead';
    this.state = 'gameover';
    playSound('death', 0.6);
  }
  
  checkVictory() {
    const allDefeated = this.enemyGroups.every(g => g.isDefeated);
    if (allDefeated) {
      this.state = 'victory';
      playSound('victory', 0.7);
    }
  }
  
  restart() {
    this.player = this.createPlayer();
    this.enemyGroups = [];
    this.activeEnemies = [];
    this.items = [];
    this.upgrades = JSON.parse(JSON.stringify(UPGRADES));
    this.currentDialog = null;
    this.gameTime = 0;
    this.hitEffects = [];
    this.damageNumbers = [];
    this.camera = {
      position: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      shake: 0,
      shakeDecay: 0.9,
    };
    
    this.initializeEnemyGroups();
    this.initializeItems();
    this.state = 'intro';
  }
  
  // ============================================
  // УТИЛИТЫ
  // ============================================
  
  getDirectionVector(direction: string): { x: number; y: number } {
    switch (direction) {
      case 'up': return { x: 0, y: -1 };
      case 'down': return { x: 0, y: 1 };
      case 'left': return { x: -1, y: 0 };
      case 'right': return { x: 1, y: 0 };
      default: return { x: 1, y: 0 };
    }
  }
}

// Утилиты для векторов
function subtract(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: a.x - b.x, y: a.y - b.y };
}
