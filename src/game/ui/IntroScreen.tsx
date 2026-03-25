'use client';

import { useEffect, useState, useCallback } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { VICE_COLORS } from '../utils/gtarenaer';
import { playSound } from '../utils/sounds';

// ============================================
// ЗАСТАВКА В СТИЛЕ GTA VICE CITY
// ============================================

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  const [phase, setPhase] = useState(0);
  const [titleVisible, setTitleVisible] = useState(false);
  const [titleChars, setTitleChars] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  
  const title = 'ЗЛОБНЫЕ ГАМАЮНЫ';
  
  // Анимация появления
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 300);
    const timer2 = setTimeout(() => setPhase(2), 1200);
    
    // Глитч-эффект
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 100);
    }, 3000);
    
    // Заголовок по буквам
    const timer3 = setTimeout(() => {
      setTitleVisible(true);
      let charIndex = 0;
      const charInterval = setInterval(() => {
        charIndex++;
        setTitleChars(charIndex);
        playSound('select', 0.05);
        if (charIndex >= title.length) {
          clearInterval(charInterval);
          setTimeout(() => setShowButton(true), 400);
        }
      }, 80);
    }, 2000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(glitchInterval);
    };
  }, []);
  
  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        if (showButton) {
          playSound('select', 0.5);
          onStart();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showButton, onStart]);
  
  return (
    <div 
      className="relative overflow-hidden"
      style={{ 
        width: GAME_WIDTH, 
        height: GAME_HEIGHT, 
        maxWidth: '100%',
        background: `linear-gradient(180deg, 
          #0a001a 0%, 
          #1a0033 30%, 
          #2a0044 60%, 
          #1a0033 100%)`,
      }}
    >
      {/* Горизонт (как в Vice City) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `linear-gradient(180deg, 
            transparent 0%,
            rgba(255, 100, 150, 0.1) 50%,
            rgba(255, 100, 150, 0.2) 100%)`,
        }}
      />
      
      {/* Сетка (стиль 80-х) */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, rgba(255, 0, 150, 0.03) 1px, transparent 1px),
            linear-gradient(rgba(255, 0, 150, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          perspective: '500px',
          transform: 'rotateX(60deg)',
          transformOrigin: 'bottom',
          opacity: 0.5,
        }}
      />
      
      {/* Неоновые силуэты города */}
      {phase >= 1 && (
        <div className="absolute bottom-20 left-0 right-0">
          <CitySilhouette />
        </div>
      )}
      
      {/* Эффект солнца */}
      <div 
        className="absolute"
        style={{
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '100px',
          background: `
            radial-gradient(ellipse at center bottom, 
              rgba(255, 200, 100, 0.8) 0%, 
              rgba(255, 100, 150, 0.4) 40%, 
              transparent 70%)`,
        }}
      />
      
      {/* Горизонтальные полосы (как в Vice City) */}
      <div 
        className="absolute bottom-[15%] left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${VICE_COLORS.neonPink} 20%, 
            ${VICE_COLORS.neonPink} 80%, 
            transparent 100%)`,
          boxShadow: `0 0 20px ${VICE_COLORS.neonPink}`,
        }}
      />
      <div 
        className="absolute bottom-[14%] left-0 right-0 h-0.5"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${VICE_COLORS.neonBlue} 20%, 
            ${VICE_COLORS.neonBlue} 80%, 
            transparent 100%)`,
          boxShadow: `0 0 15px ${VICE_COLORS.neonBlue}`,
        }}
      />
      
      {/* Заголовок */}
      {titleVisible && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pt-20">
          <h1 
            className="text-5xl md:text-6xl font-bold text-center px-4 tracking-widest"
            style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              color: glitchActive ? VICE_COLORS.neonBlue : VICE_COLORS.neonPink,
              textShadow: glitchActive 
                ? `3px 3px 0 ${VICE_COLORS.neonBlue}, -3px -3px 0 ${VICE_COLORS.neonYellow}, 0 0 40px ${VICE_COLORS.neonPink}`
                : `3px 3px 0 #000, 0 0 40px ${VICE_COLORS.neonPink}, 0 0 80px ${VICE_COLORS.neonPink}`,
              letterSpacing: '8px',
              transform: glitchActive ? 'translateX(3px)' : 'none',
              transition: 'transform 0.1s',
            }}
          >
            {title.split('').map((char, i) => (
              <span 
                key={i}
                className={`inline-block ${i < titleChars ? '' : 'opacity-0'}`}
                style={{ 
                  animationDelay: `${i * 0.08}s`,
                  transform: i < titleChars && glitchActive 
                    ? `translateY(${Math.random() * 4 - 2}px)` 
                    : 'none',
                }}
              >
                {char}
              </span>
            ))}
          </h1>
          
          {/* Подзаголовок */}
          <p 
            className="mt-6 text-lg md:text-xl tracking-[0.3em] uppercase"
            style={{
              fontFamily: 'Arial, sans-serif',
              color: VICE_COLORS.neonYellow,
              textShadow: `0 0 10px ${VICE_COLORS.neonYellow}`,
            }}
          >
            Vice City Beat&apos;em Up
          </p>
          
          {/* Год */}
          <p 
            className="mt-2 text-sm tracking-[0.5em]"
            style={{
              fontFamily: 'monospace',
              color: '#888888',
            }}
          >
            1986
          </p>
        </div>
      )}
      
      {/* Кнопка старта */}
      {showButton && (
        <div className="absolute bottom-28 left-0 right-0 z-40 flex justify-center">
          <button
            onClick={() => {
              playSound('select', 0.5);
              onStart();
            }}
            className="px-10 py-4 font-bold text-xl uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              background: `linear-gradient(180deg, 
                ${VICE_COLORS.neonPink} 0%, 
                #aa1155 100%)`,
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              boxShadow: `
                0 4px 0 #660022,
                0 0 30px ${VICE_COLORS.neonPink},
                inset 0 1px 0 rgba(255,255,255,0.3)
              `,
              textShadow: '2px 2px 0 #000',
            }}
          >
            Начать игру
          </button>
        </div>
      )}
      
      {/* Подсказка */}
      {showButton && (
        <p 
          className="absolute bottom-12 left-0 right-0 z-40 text-center text-sm"
          style={{ 
            fontFamily: 'monospace', 
            color: '#666666',
          }}
        >
          Нажмите ENTER или ПРОБЕЛ
        </p>
      )}
      
      {/* Scanlines эффект */}
      <div 
        className="pointer-events-none absolute inset-0 z-50"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
        }}
      />
      
      {/* Vignette */}
      <div 
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </div>
  );
}

// ============================================
// СИЛУЭТ ГОРОДА
// ============================================

function CitySilhouette() {
  return (
    <svg 
      viewBox="0 0 800 150" 
      className="w-full h-auto"
      preserveAspectRatio="xMidYMax slice"
    >
      {/* Здания силуэты */}
      <defs>
        <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a2a" />
          <stop offset="100%" stopColor="#0a0a15" />
        </linearGradient>
      </defs>
      
      {/* Ряд зданий */}
      <rect x="0" y="60" width="40" height="90" fill="url(#buildingGrad)" />
      <rect x="45" y="40" width="30" height="110" fill="url(#buildingGrad)" />
      <rect x="80" y="70" width="50" height="80" fill="url(#buildingGrad)" />
      <rect x="135" y="30" width="35" height="120" fill="url(#buildingGrad)" />
      <rect x="175" y="50" width="45" height="100" fill="url(#buildingGrad)" />
      <rect x="225" y="20" width="60" height="130" fill="url(#buildingGrad)" />
      <rect x="290" y="55" width="40" height="95" fill="url(#buildingGrad)" />
      <rect x="335" y="35" width="55" height="115" fill="url(#buildingGrad)" />
      <rect x="395" y="60" width="30" height="90" fill="url(#buildingGrad)" />
      <rect x="430" y="25" width="50" height="125" fill="url(#buildingGrad)" />
      <rect x="485" y="45" width="35" height="105" fill="url(#buildingGrad)" />
      <rect x="525" y="65" width="45" height="85" fill="url(#buildingGrad)" />
      <rect x="575" y="40" width="60" height="110" fill="url(#buildingGrad)" />
      <rect x="640" y="55" width="40" height="95" fill="url(#buildingGrad)" />
      <rect x="685" y="30" width="55" height="120" fill="url(#buildingGrad)" />
      <rect x="745" y="50" width="55" height="100" fill="url(#buildingGrad)" />
      
      {/* Неоновые огни на зданиях */}
      <rect x="235" y="35" width="40" height="3" fill={VICE_COLORS.neonPink} opacity="0.8" />
      <rect x="435" y="40" width="40" height="3" fill={VICE_COLORS.neonBlue} opacity="0.8" />
      <rect x="580" y="50" width="50" height="3" fill={VICE_COLORS.neonYellow} opacity="0.8" />
      <rect x="690" y="40" width="45" height="3" fill={VICE_COLORS.neonPink} opacity="0.8" />
      
      {/* Мерцающие окна */}
      {[...Array(20)].map((_, i) => (
        <rect 
          key={i}
          x={50 + (i * 37) % 700}
          y={70 + (i * 23) % 50}
          width="4"
          height="4"
          fill={Math.random() > 0.5 ? VICE_COLORS.neonYellow : VICE_COLORS.neonBlue}
          opacity={0.3 + Math.random() * 0.4}
        />
      ))}
    </svg>
  );
}

export default IntroScreen;
