// ============================================
// ЗВУКИ ДЛЯ ЗАСТАВКИ
// ============================================

// Флаг, что пользователь взаимодействовал со страницей
let userInteracted = false;

// Инициализация аудио контекста после первого клика
export function initAudioAfterInteraction() {
  if (!userInteracted) {
    userInteracted = true;
    // Пробуем разблокировать аудио контекст
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    ctx.close();
  }
}

// Проверка, можно ли играть звуки
export function canPlaySound(): boolean {
  return userInteracted;
}

// Создание звукового эффекта
function createOscillator(
  ctx: AudioContext,
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume: number = 0.3
) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  return { oscillator, gainNode };
}

// Звук "Whoosh" - появление персонажа
export function playWhoosh(volume: number = 0.4) {
  if (!userInteracted) return;
  
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const { oscillator } = createOscillator(ctx, 150, 'sine', 0.3, volume);
  
  oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
  oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
  
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.3);
}

// Звук удара рукой
export function playPunch(volume: number = 0.3) {
  if (!userInteracted) return;
  
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  
  // Низкий удар
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(120, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
  gain1.gain.setValueAtTime(volume, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start();
  osc1.stop(ctx.currentTime + 0.15);
  
  // Шлепок
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(800, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
  gain2.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start();
  osc2.stop(ctx.currentTime + 0.08);
}

// Звук удара ногой
export function playKick(volume: number = 0.35) {
  if (!userInteracted) return;
  
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  
  // Более глубокий удар
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

// Звук "Ха!" - крик при ударе
export function playHa(volume: number = 0.25) {
  if (!userInteracted) return;
  
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  
  // Форманта "А"
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(700, ctx.currentTime);
  osc1.frequency.setValueAtTime(650, ctx.currentTime + 0.05);
  osc1.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
  gain1.gain.setValueAtTime(volume, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start();
  osc1.stop(ctx.currentTime + 0.15);
  
  // Форманта "Х"
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start();
}

// Звук приземления
export function playLand(volume: number = 0.4) {
  if (!userInteracted) return;
  
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

// Звук выбора (клик по кнопке)
export function playSelect(volume: number = 0.5) {
  if (!userInteracted) return;
  
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.setValueAtTime(880, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

// Случайный звук удара
export function playRandomHit(volume: number = 0.3) {
  const sounds = [
    () => playPunch(volume),
    () => playKick(volume),
    () => { playPunch(volume * 0.8); playHa(volume * 0.6); },
    () => { playKick(volume * 0.8); playHa(volume * 0.5); },
  ];
  const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
  randomSound();
}
