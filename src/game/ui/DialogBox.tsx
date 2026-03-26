'use client';

import { useEffect, useState, useCallback } from 'react';
import { GAME_WIDTH } from '../constants';
import { playSound } from '../utils/sounds';
import type { Dialog } from '../types';

// ============================================
// ДИАЛОГОВОЕ ОКНО
// ============================================

interface DialogBoxProps {
  dialog: Dialog;
  onOptionSelect: (optionId: string) => void;
}

export function DialogBox({ dialog, onOptionSelect }: DialogBoxProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const fullText = dialog.text;
  const displayText = fullText.substring(0, textIndex);
  
  // Сброс при смене диалога
  useEffect(() => {
    // Используем функциональное обновление чтобы избежать setState в effect
    let charIndex = 0;
    let isTyping = true;
    
    const typeInterval = setInterval(() => {
      if (charIndex <= fullText.length) {
        setTextIndex(charIndex);
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setShowOptions(true);
        isTyping = false;
      }
    }, 30);
    
    return () => {
      clearInterval(typeInterval);
    };
  }, [fullText, dialog.id]);
  
  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showOptions || !dialog.options) return;
      
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : dialog.options!.length - 1));
        playSound('select', 0.2);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        setSelectedIndex(prev => (prev < dialog.options!.length - 1 ? prev + 1 : 0));
        playSound('select', 0.2);
      } else if (e.code === 'Enter' || e.code === 'Space') {
        const option = dialog.options![selectedIndex];
        playSound('select', 0.5);
        onOptionSelect(option.id);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showOptions, dialog.options, selectedIndex, onOptionSelect]);
  
  return (
    <div 
      className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
      style={{ width: Math.min(600, GAME_WIDTH - 40) }}
    >
      {/* Фон */}
      <div 
        className="rounded-lg p-1"
        style={{
          backgroundColor: '#1a1a1a',
          border: '4px solid #444444',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Имя говорящего */}
        <div 
          className="px-4 py-2 font-bold"
          style={{
            backgroundColor: '#aa2222',
            color: '#ffffff',
            fontFamily: 'monospace',
            borderBottom: '2px solid #444444',
          }}
        >
          {dialog.speaker}
        </div>
        
        {/* Текст */}
        <div 
          className="px-4 py-4"
          style={{
            backgroundColor: '#222222',
            minHeight: '80px',
          }}
        >
          <p 
            className="text-lg leading-relaxed"
            style={{
              fontFamily: 'monospace',
              color: '#ffffff',
            }}
          >
            {displayText}
            {textIndex < fullText.length && (
              <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-white" />
            )}
          </p>
        </div>
        
        {/* Варианты ответов */}
        {showOptions && dialog.options && (
          <div 
            className="border-t-2 border-gray-700 p-2"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            {dialog.options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => {
                  playSound('select', 0.5);
                  onOptionSelect(option.id);
                }}
                className="mb-1 w-full rounded px-4 py-2 text-left transition-all duration-100"
                style={{
                  fontFamily: 'monospace',
                  backgroundColor: index === selectedIndex ? '#aa2222' : '#333333',
                  color: '#ffffff',
                  border: index === selectedIndex ? '2px solid #ff4444' : '2px solid transparent',
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="mr-2 opacity-60">
                  {index + 1}.
                </span>
                {option.text}
              </button>
            ))}
            
            {/* Подсказка */}
            <p 
              className="mt-2 text-center text-sm opacity-50"
              style={{ fontFamily: 'monospace', color: '#888888' }}
            >
              ↑↓ Выбрать • ENTER Подтвердить
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DialogBox;
