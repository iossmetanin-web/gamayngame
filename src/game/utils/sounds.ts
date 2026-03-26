// ============================================
// ЗВУКОВАЯ СИСТЕМА - "ЗЛОБНЫЕ ГАМАЮНЫ"
// ============================================

import type { SoundType } from '../types';

// Звуковой контекст
let audioContext: AudioContext | null = null;

// Инициализация аудио контекста
export function initAudio(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// Создание осциллятора
function createOscillator(
  ctx: AudioContext,
  type: OscillatorType,
  frequency: number,
  duration: number,
  volume: number = 0.3
): { oscillator: OscillatorNode; gainNode: GainNode } {
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

// Звук удара
function playHitSound(ctx: AudioContext, volume: number) {
  // Низкочастотный удар
  const { oscillator: osc1 } = createOscillator(ctx, 'square', 80, 0.1, volume * 0.5);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.1);

  // Высокочастотный щелчок
  const { oscillator: osc2 } = createOscillator(ctx, 'sawtooth', 200, 0.05, volume * 0.3);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + 0.05);

  // Шум
  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(ctx.currentTime);
}

// Звук получения урона
function playHurtSound(ctx: AudioContext, volume: number) {
  const { oscillator } = createOscillator(ctx, 'sawtooth', 150, 0.2, volume * 0.4);
  oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.2);
}

// Звук использования пива
function playBeerSound(ctx: AudioContext, volume: number) {
  // Звук открывания
  const { oscillator: osc1 } = createOscillator(ctx, 'sine', 800, 0.05, volume * 0.3);
  osc1.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.05);

  // Звук наливания/питья
  const { oscillator: osc2 } = createOscillator(ctx, 'triangle', 300, 0.3, volume * 0.2);
  osc2.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3);
  osc2.start(ctx.currentTime + 0.1);
  osc2.stop(ctx.currentTime + 0.4);
}

// Звук подбора предмета
function playPickupSound(ctx: AudioContext, volume: number) {
  const { oscillator } = createOscillator(ctx, 'sine', 400, 0.15, volume * 0.3);
  oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
  oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.15);
}

// Звук шагов
function playStepSound(ctx: AudioContext, volume: number) {
  const { oscillator } = createOscillator(ctx, 'square', 60, 0.05, volume * 0.15);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.05);
}

// Звук победы
function playVictorySound(ctx: AudioContext, volume: number) {
  const notes = [262, 330, 392, 523]; // C E G C
  notes.forEach((freq, i) => {
    const { oscillator } = createOscillator(ctx, 'square', freq, 0.3, volume * 0.25);
    oscillator.start(ctx.currentTime + i * 0.15);
    oscillator.stop(ctx.currentTime + i * 0.15 + 0.3);
  });
}

// Звук смерти
function playDeathSound(ctx: AudioContext, volume: number) {
  const { oscillator } = createOscillator(ctx, 'sawtooth', 300, 0.5, volume * 0.4);
  oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.5);
}

// Звук выбора в меню
function playSelectSound(ctx: AudioContext, volume: number) {
  const { oscillator } = createOscillator(ctx, 'sine', 500, 0.1, volume * 0.25);
  oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.1);
}

// Главная функция воспроизведения звука
export function playSound(type: SoundType, volume: number = 0.5) {
  try {
    const ctx = initAudio();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    switch (type) {
      case 'hit':
        playHitSound(ctx, volume);
        break;
      case 'hurt':
        playHurtSound(ctx, volume);
        break;
      case 'beer':
        playBeerSound(ctx, volume);
        break;
      case 'pickup':
        playPickupSound(ctx, volume);
        break;
      case 'step':
        playStepSound(ctx, volume);
        break;
      case 'victory':
        playVictorySound(ctx, volume);
        break;
      case 'death':
        playDeathSound(ctx, volume);
        break;
      case 'select':
        playSelectSound(ctx, volume);
        break;
    }
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

// Фоновая музыка (простая генерация)
let musicInterval: ReturnType<typeof setInterval> | null = null;

export function startBackgroundMusic(volume: number = 0.1) {
  if (musicInterval) return;

  const ctx = initAudio();
  const bassPattern = [1, 0, 0, 1, 0, 1, 0, 0];
  const drumPattern = [1, 0, 1, 0, 1, 0, 1, 0];
  let step = 0;

  musicInterval = setInterval(() => {
    if (ctx.state === 'suspended') return;

    // Бас
    if (bassPattern[step]) {
      const { oscillator } = createOscillator(ctx, 'triangle', 55, 0.2, volume * 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    }

    // Барабан
    if (drumPattern[step]) {
      const { oscillator } = createOscillator(ctx, 'square', 40, 0.05, volume * 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    }

    step = (step + 1) % bassPattern.length;
  }, 180);
}

export function stopBackgroundMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}
