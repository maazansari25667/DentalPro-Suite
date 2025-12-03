/**
 * Webphone dialer component with numeric keypad
 * Supports number input, suggestions, and DTMF during calls
 */

"use client";

import { useState, useRef, useEffect } from 'react';
import { Phone, Delete } from 'lucide-react';
import Button from '@/components/ui/button/Button';

interface DialerProps {
  value: string;
  onChange: (value: string) => void;
  onDial: (number: string) => void;
  disabled?: boolean;
  showKeypad?: boolean;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
}

const KEYPAD_LAYOUT = [
  [
    { key: '1', display: '1', sub: '' },
    { key: '2', display: '2', sub: 'ABC' },
    { key: '3', display: '3', sub: 'DEF' },
  ],
  [
    { key: '4', display: '4', sub: 'GHI' },
    { key: '5', display: '5', sub: 'JKL' },
    { key: '6', display: '6', sub: 'MNO' },
  ],
  [
    { key: '7', display: '7', sub: 'PQRS' },
    { key: '8', display: '8', sub: 'TUV' },
    { key: '9', display: '9', sub: 'WXYZ' },
  ],
  [
    { key: '*', display: '*', sub: '' },
    { key: '0', display: '0', sub: '+' },
    { key: '#', display: '#', sub: '' },
  ],
];

function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function Dialer({
  value,
  onChange,
  onDial,
  disabled = false,
  showKeypad = true,
  placeholder = "Enter phone number",
  className,
  size = 'md',
  autoFocus = false,
}: DialerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeypadPress = (key: string) => {
    if (disabled) return;

    const newValue = value + key;
    onChange(newValue);

    // Play DTMF tone (in real implementation)
    playDTMFTone(key);
  };

  const handleBackspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    // Filter to only allow valid phone number characters
    const filtered = e.target.value.replace(/[^0-9+\-\(\)\s]/g, '');
    onChange(filtered);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    // Handle keyboard input for DTMF
    const key = e.key;
    if (/^[0-9*#]$/.test(key)) {
      e.preventDefault();
      handleKeypadPress(key);
    } else if (key === 'Backspace') {
      if (value.length === 0) {
        e.preventDefault();
      }
    } else if (key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onDial(value.trim());
      }
    }
  };

  const handleDial = () => {
    if (disabled || !value.trim()) return;
    onDial(value.trim());
  };

  const playDTMFTone = (key: string) => {
    // In a real implementation, this would play DTMF tones
    console.log(`Playing DTMF tone for: ${key}`);
  };

  const formatPhoneNumber = (number: string): string => {
    // Basic US phone number formatting
    const cleaned = number.replace(/\D/g, '');
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 text-xs';
      case 'lg':
        return 'h-12 w-12 text-lg';
      default:
        return 'h-10 w-10 text-sm';
    }
  };

  const inputSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-8 text-sm';
      case 'lg':
        return 'h-12 text-xl';
      default:
        return 'h-10 text-lg';
    }
  };

  const getValidButtonSize = (): 'sm' | 'md' | undefined => {
    return size === 'lg' ? 'md' : size === 'sm' ? 'sm' : 'md';
  };

  return (
    <div className={cn("w-full max-w-xs mx-auto", className)}>
      {/* Number Input */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            "text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            inputSizeClass()
          )}
          autoComplete="tel"
        />
        
        {value && !disabled && (
          <button
            onClick={handleBackspace}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Delete className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Dial Button */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={handleDial}
          disabled={disabled || !value.trim()}
          className="flex-1 bg-green-600 text-white hover:bg-green-700"
          size={getValidButtonSize()}
        >
          <Phone className={cn("mr-2", size === 'sm' ? "h-3 w-3" : "h-4 w-4")} />
          Call
        </Button>
        
        {value && (
          <Button
            variant="outline"
            onClick={handleBackspace}
            disabled={disabled}
            size={getValidButtonSize()}
            className="px-3"
          >
            <Delete className={cn(size === 'sm' ? "h-3 w-3" : "h-4 w-4")} />
          </Button>
        )}
      </div>

      {/* Numeric Keypad */}
      {showKeypad && (
        <div className="grid grid-cols-3 gap-2">
          {KEYPAD_LAYOUT.flat().map((button) => (
            <Button
              key={button.key}
              variant="outline"
              className={cn(
                "flex flex-col items-center justify-center p-2",
                getButtonSize(),
                "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              )}
              onClick={() => handleKeypadPress(button.key)}
              disabled={disabled}
              aria-label={`Dial ${button.display}${button.sub ? ` (${button.sub})` : ''}`}
            >
              <span className="font-semibold">{button.display}</span>
              {button.sub && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">
                  {button.sub}
                </span>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Formatted Display (if focused and has value) */}
      {isFocused && value && (
        <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          {formatPhoneNumber(value)}
        </div>
      )}
    </div>
  );
}