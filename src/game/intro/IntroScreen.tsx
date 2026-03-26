'use client';

import { useEffect, useState, useCallback } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { initAudioAfterInteraction, playSelect, playRandomHit } from './sounds';

// ============================================
// ЗАСТАВКА ИГРЫ
// ============================================

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  const [showButton, setShowButton] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);

  // Правильное название с пробелом
  const TITLE = 'ЗЛОБНЫЕ ГАМАЮНЫ';

  // Инициализация
  useEffect(() => {
    // Показываем заголовок
    setTimeout(() => setTitleVisible(true), 300);
    setTimeout(() => setShowButton(true), 800);

    // Глитч-эффект
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 100);
    }, 4000);

    // Периодические звуки кунг-фу
    const kungFuInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        playRandomHit(0.15);
      }
    }, 2500);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(kungFuInterval);
    };
  }, []);

  // Обработка клика по кнопке
  const handleButtonClick = useCallback(() => {
    initAudioAfterInteraction();
    playSelect(0.6);
    setButtonPressed(true);
    setTimeout(() => {
      onStart();
    }, 150);
  }, [onStart]);

  // Первый клик для активации звука
  const handleFirstClick = useCallback(() => {
    initAudioAfterInteraction();
  }, []);

  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        if (showButton) {
          e.preventDefault();
          handleButtonClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showButton, handleButtonClick]);

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100dvh',
        background: `linear-gradient(180deg,
          #0a0015 0%,
          #150030 40%,
          #250050 70%,
          #1a0040 100%)`,
        touchAction: 'manipulation',
      }}
      onClick={handleFirstClick}
    >
      {/* Сетка (ретро стиль) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(90deg, rgba(255, 0, 150, 0.05) 1px, transparent 1px),
            linear-gradient(rgba(255, 0, 150, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.6,
        }}
      />

      {/* Горизонт с градиентом */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: `linear-gradient(180deg,
            transparent 0%,
            rgba(255, 50, 150, 0.1) 40%,
            rgba(255, 50, 150, 0.2) 100%)`,
        }}
      />

      {/* Неоновые линии горизонта */}
      <div
        className="absolute bottom-[30%] left-0 right-0 h-1 pointer-events-none"
        style={{
          background: `linear-gradient(90deg,
            transparent 0%,
            #ff1493 30%,
            #ff1493 70%,
            transparent 100%)`,
          boxShadow: '0 0 30px #ff1493, 0 0 60px #ff1493',
        }}
      />
      <div
        className="absolute bottom-[29%] left-0 right-0 h-0.5 pointer-events-none"
        style={{
          background: `linear-gradient(90deg,
            transparent 0%,
            #00d4ff 30%,
            #00d4ff 70%,
            transparent 100%)`,
          boxShadow: '0 0 20px #00d4ff',
        }}
      />

      {/* Силуэт города */}
      <div className="absolute bottom-[30%] left-0 right-0 pointer-events-none">
        <CitySilhouette />
      </div>

      {/* Заголовок */}
      {titleVisible && (
        <div className="absolute top-[20%] left-0 right-0 z-20 text-center pointer-events-none">
          <h1
            className="text-5xl md:text-6xl font-black tracking-wider"
            style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              color: glitchActive ? '#00d4ff' : '#ff1493',
              textShadow: glitchActive
                ? `4px 4px 0 #000, 0 0 40px #00d4ff, 0 0 80px #00d4ff`
                : `4px 4px 0 #000, 0 0 40px #ff1493, 0 0 80px #ff1493`,
              transform: glitchActive ? 'translateX(2px) skewX(-2deg)' : 'none',
              transition: 'transform 0.05s',
              letterSpacing: '4px',
            }}
          >
            {TITLE.split('').map((char, i) => (
              <span
                key={i}
                className="inline-block"
                style={{
                  animationDelay: `${i * 0.03}s`,
                  transform: glitchActive && i % 3 === 0
                    ? `translateY(${Math.random() * 4 - 2}px)`
                    : 'none',
                }}
              >
                {char}
              </span>
            ))}
          </h1>
        </div>
      )}

      {/* Кнопка "Начать игру" */}
      {showButton && (
        <div className="absolute bottom-[15%] left-0 right-0 z-30 flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick();
            }}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => {
              setButtonHover(false);
              setButtonPressed(false);
            }}
            onMouseDown={() => setButtonPressed(true)}
            onMouseUp={() => setButtonPressed(false)}
            className="px-10 py-4 font-black text-xl uppercase tracking-widest transition-all duration-150"
            style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              background: `linear-gradient(180deg,
                ${buttonPressed ? '#aa1155' : '#ff1493'} 0%,
                ${buttonPressed ? '#660022' : '#aa1155'} 100%)`,
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              boxShadow: buttonHover
                ? `0 6px 0 #660022, 0 0 50px #ff1493, 0 0 100px #ff1493, inset 0 1px 0 rgba(255,255,255,0.4)`
                : `0 4px 0 #660022, 0 0 30px #ff1493, inset 0 1px 0 rgba(255,255,255,0.3)`,
              textShadow: '2px 2px 0 #000',
              transform: buttonPressed ? 'translateY(3px)' : 'translateY(0)',
              animation: !buttonHover ? 'pulse 2s ease-in-out infinite' : 'none',
            }}
          >
            НАЧАТЬ ИГРУ
          </button>
        </div>
      )}

      {/* Подсказка */}
      {showButton && (
        <p
          className="absolute bottom-[6%] left-0 right-0 z-30 text-center text-sm pointer-events-none"
          style={{
            fontFamily: 'monospace',
            color: '#666666',
          }}
        >
          Нажмите ENTER или ПРОБЕЛ
        </p>
      )}

      {/* CRT эффект сканлайнов */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
        }}
      />

      {/* Виньетка */}
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Стили для анимации пульсации */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}

// ============================================
// СИЛУЭТ ГОРОДА
// ============================================

function CitySilhouette() {
  const colors = {
    neonPink: '#ff1493',
    neonBlue: '#00d4ff',
    neonYellow: '#ffef00',
    neonPurple: '#9d00ff',
  };

  return (
    <svg
      viewBox="0 0 800 100"
      className="w-full h-auto"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="cityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a2a" />
          <stop offset="100%" stopColor="#0a0a15" />
        </linearGradient>
      </defs>

      {/* Здания */}
      <rect x="0" y="40" width="35" height="60" fill="url(#cityGrad)" />
      <rect x="40" y="25" width="25" height="75" fill="url(#cityGrad)" />
      <rect x="70" y="45" width="40" height="55" fill="url(#cityGrad)" />
      <rect x="115" y="20" width="30" height="80" fill="url(#cityGrad)" />
      <rect x="150" y="35" width="35" height="65" fill="url(#cityGrad)" />
      <rect x="190" y="15" width="45" height="85" fill="url(#cityGrad)" />
      <rect x="240" y="40" width="30" height="60" fill="url(#cityGrad)" />
      <rect x="275" y="25" width="40" height="75" fill="url(#cityGrad)" />
      <rect x="320" y="45" width="25" height="55" fill="url(#cityGrad)" />
      <rect x="350" y="20" width="40" height="80" fill="url(#cityGrad)" />
      <rect x="395" y="35" width="30" height="65" fill="url(#cityGrad)" />
      <rect x="430" y="30" width="35" height="70" fill="url(#cityGrad)" />
      <rect x="470" y="45" width="40" height="55" fill="url(#cityGrad)" />
      <rect x="515" y="20" width="35" height="80" fill="url(#cityGrad)" />
      <rect x="555" y="35" width="30" height="65" fill="url(#cityGrad)" />
      <rect x="590" y="25" width="40" height="75" fill="url(#cityGrad)" />
      <rect x="635" y="40" width="35" height="60" fill="url(#cityGrad)" />
      <rect x="675" y="20" width="45" height="80" fill="url(#cityGrad)" />
      <rect x="725" y="35" width="40" height="65" fill="url(#cityGrad)" />
      <rect x="770" y="30" width="30" height="70" fill="url(#cityGrad)" />

      {/* Неоновые полосы на зданиях */}
      <rect x="195" y="18" width="35" height="2" fill={colors.neonPink} opacity="0.8" />
      <rect x="355" y="22" width="30" height="2" fill={colors.neonBlue} opacity="0.8" />
      <rect x="520" y="22" width="25" height="2" fill={colors.neonYellow} opacity="0.8" />
      <rect x="680" y="22" width="35" height="2" fill={colors.neonPurple} opacity="0.8" />

      {/* Окна */}
      {[...Array(25)].map((_, i) => (
        <rect
          key={i}
          x={20 + (i * 31) % 750}
          y={50 + (i * 17) % 35}
          width="3"
          height="3"
          fill={i % 3 === 0 ? colors.neonYellow : colors.neonBlue}
          opacity={0.4 + (i % 5) * 0.1}
        />
      ))}
    </svg>
  );
}

export default IntroScreen;
