'use client';
import { useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { clsx } from 'clsx';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  success?: boolean;
}

export function OtpInput({ value, onChange, length = 6, error, success }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    const newValue = value.split('');
    newValue[index] = val.slice(-1);
    const updatedValue = newValue.join('').slice(0, length);
    onChange(updatedValue);

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    onChange(pastedData.padEnd(length, '').slice(0, length));
    if (pastedData.length > 0) {
      inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-between">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={clsx(
            "w-12 h-14 text-center text-xl font-semibold bg-surface-900/50 border rounded-xl outline-none transition-all duration-200 text-white focus:ring-2",
            {
              "border-surface-600 focus:border-primary-500 focus:ring-primary-500/50": !error && !success,
              "border-accent-500 focus:ring-accent-500/50 animate-[shake_0.5s_ease-in-out]": error,
              "border-green-500 focus:ring-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]": success,
            }
          )}
        />
      ))}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `}</style>
    </div>
  );
}
