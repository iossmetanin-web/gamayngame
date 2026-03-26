'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlayerInput } from '../types';

// ============================================
// МОБИЛЬНОЕ УПРАВЛЕНИЕ
// ============================================

interface MobileControlsProps {
  onInputChange: (input: Partial<PlayerInput>) => void;
  onPause: () => void;
}

export function MobileControls({ onInputChange, onPause }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  // Джойстик - начало касания
  const handleJoystickStart = useCallback((e: React.TouchEvent | React.PointerEvent) => {
    e.preventDefault();
    const touch = 'touches' in e ? e.touches[0] : e;
    touchIdRef.current = touch.identifier;
    setJoystickActive(true);
  }, []);

  // Джойстик - движение
  const handleJoystickMove = useCallback((e: TouchEvent | PointerEvent) => {
    if (!joystickActive || !joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
      if (!touch) return;
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    // Ограничение радиуса джойстика
    const maxRadius = 50;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setJoystickPos({ x: dx, y: dy });

    // Определяем направление
    const threshold = 15;
    const input: Partial<PlayerInput> = {};

    if (dx < -threshold) input.left = true;
    else if (dx > threshold) input.right = true;

    if (dy < -threshold) input.up = true;
    else if (dy > threshold) input.down = true;

    onInputChange({
      left: input.left || false,
      right: input.right || false,
      up: input.up || false,
      down: input.down || false,
    });
  }, [joystickActive, onInputChange]);

  // Джойстик - конец касания
  const handleJoystickEnd = useCallback(() => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    touchIdRef.current = null;
    onInputChange({
      left: false,
      right: false,
      up: false,
      down: false,
    });
  }, [onInputChange]);

  // Глобальные события для джойстика
  useEffect(() => {
    if (joystickActive) {
      window.addEventListener('touchmove', handleJoystickMove, { passive: false });
      window.addEventListener('touchend', handleJoystickEnd);
      window.addEventListener('pointermove', handleJoystickMove);
      window.addEventListener('pointerup', handleJoystickEnd);
    }

    return () => {
      window.removeEventListener('touchmove', handleJoystickMove);
      window.removeEventListener('touchend', handleJoystickEnd);
      window.removeEventListener('pointermove', handleJoystickMove);
      window.removeEventListener('pointerup', handleJoystickEnd);
    };
  }, [joystickActive, handleJoystickMove, handleJoystickEnd]);

  // Кнопка атаки
  const handleAttackStart = useCallback(() => {
    onInputChange({ attack: true });
  }, [onInputChange]);

  const handleAttackEnd = useCallback(() => {
    onInputChange({ attack: false });
  }, [onInputChange]);

  // Кнопка использования пива
  const handleBeerStart = useCallback(() => {
    onInputChange({ useBeer: true });
  }, [onInputChange]);

  const handleBeerEnd = useCallback(() => {
    onInputChange({ useBeer: false });
  }, [onInputChange]);

  // Кнопка бега (sprint)
  const handleSprintStart = useCallback(() => {
    onInputChange({ sprint: true });
  }, [onInputChange]);

  const handleSprintEnd = useCallback(() => {
    onInputChange({ sprint: false });
  }, [onInputChange]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50"
      style={{ touchAction: 'none' }}
    >
      {/* Левая часть - Джойстик */}
      <div
        className="absolute bottom-8 left-8 pointer-events-auto"
        style={{ touchAction: 'none' }}
      >
        {/* База джойстика */}
        <div
          ref={joystickRef}
          className="relative rounded-full"
          style={{
            width: 120,
            height: 120,
            background: 'radial-gradient(circle, rgba(255,20,147,0.2) 0%, rgba(255,20,147,0.1) 100%)',
            border: '3px solid rgba(255,20,147,0.6)',
            boxShadow: '0 0 20px rgba(255,20,147,0.4), inset 0 0 30px rgba(0,0,0,0.3)',
          }}
          onTouchStart={handleJoystickStart}
          onPointerDown={handleJoystickStart}
        >
          {/* Ручка джойстика */}
          <div
            ref={knobRef}
            className="absolute rounded-full"
            style={{
              width: 50,
              height: 50,
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
              background: joystickActive
                ? 'radial-gradient(circle, #ff1493 0%, #aa0d5c 100%)'
                : 'radial-gradient(circle, #ff1493 0%, #ff1493 100%)',
              border: '2px solid rgba(255,255,255,0.5)',
              boxShadow: '0 0 15px rgba(255,20,147,0.8), inset 0 2px 4px rgba(255,255,255,0.3)',
              transition: joystickActive ? 'none' : 'transform 0.15s ease-out',
            }}
          />

          {/* Индикаторы направления */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute top-2 text-pink-400 opacity-40 text-lg">▲</div>
            <div className="absolute bottom-2 text-pink-400 opacity-40 text-lg">▼</div>
            <div className="absolute left-2 text-pink-400 opacity-40 text-lg">◀</div>
            <div className="absolute right-2 text-pink-400 opacity-40 text-lg">▶</div>
          </div>
        </div>
      </div>

      {/* Правая часть - Кнопки действий */}
      <div
        className="absolute bottom-8 right-8 flex flex-col items-end gap-3 pointer-events-auto"
        style={{ touchAction: 'none' }}
      >
        {/* Кнопка БЕГ */}
        <button
          className="flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{
            width: 60,
            height: 60,
            background: 'linear-gradient(180deg, #4488ff 0%, #2266dd 100%)',
            border: '3px solid rgba(255,255,255,0.4)',
            boxShadow: '0 4px 0 #1144aa, 0 0 20px rgba(68,136,255,0.5)',
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }}
          onTouchStart={handleSprintStart}
          onTouchEnd={handleSprintEnd}
          onPointerDown={handleSprintStart}
          onPointerUp={handleSprintEnd}
          onPointerLeave={handleSprintEnd}
        >
          БЕГ
        </button>

        {/* Кнопка ПИВО */}
        <button
          className="flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{
            width: 70,
            height: 70,
            background: 'linear-gradient(180deg, #ffaa22 0%, #dd8800 100%)',
            border: '3px solid rgba(255,255,255,0.4)',
            boxShadow: '0 4px 0 #aa6600, 0 0 20px rgba(255,170,34,0.5)',
            fontSize: '24px',
          }}
          onTouchStart={handleBeerStart}
          onTouchEnd={handleBeerEnd}
          onPointerDown={handleBeerStart}
          onPointerUp={handleBeerEnd}
          onPointerLeave={handleBeerEnd}
        >
          🍺
        </button>

        {/* Кнопка УДАР */}
        <button
          className="flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{
            width: 90,
            height: 90,
            background: 'linear-gradient(180deg, #ff1493 0%, #cc1177 100%)',
            border: '4px solid rgba(255,255,255,0.5)',
            boxShadow: '0 6px 0 #880055, 0 0 30px rgba(255,20,147,0.6)',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 3px rgba(0,0,0,0.5)',
          }}
          onTouchStart={handleAttackStart}
          onTouchEnd={handleAttackEnd}
          onPointerDown={handleAttackStart}
          onPointerUp={handleAttackEnd}
          onPointerLeave={handleAttackEnd}
        >
          УДАР
        </button>
      </div>

      {/* Кнопка ПАУЗА */}
      <button
        className="absolute top-4 right-4 flex items-center justify-center rounded-lg pointer-events-auto"
        style={{
          width: 50,
          height: 50,
          background: 'rgba(0,0,0,0.6)',
          border: '2px solid rgba(255,255,255,0.3)',
          fontSize: '20px',
        }}
        onClick={onPause}
      >
        ⏸
      </button>
    </div>
  );
}

// ============================================
// ХУК ДЛЯ ОПРЕДЕЛЕНИЯ МОБИЛЬНОГО УСТРОЙСТВА
// ============================================

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth < 768
        || ('ontouchstart' in window);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export default MobileControls;
