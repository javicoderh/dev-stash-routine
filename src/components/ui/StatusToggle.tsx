import { clsx } from 'clsx';
import { useState, type MouseEvent } from 'react';
import type { ItemStatus } from '@/types/firestore';

type Props = {
  status: ItemStatus;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  disabled?: boolean;
};

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
} as const;

export function StatusToggle({
  status,
  onToggle,
  size = 'md',
  label,
  disabled,
}: Props) {
  const [pressed, setPressed] = useState(false);
  const isRead = status === 'read';

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    onToggle();
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isRead}
      aria-label={label ?? (isRead ? 'Marcar como pendiente' : 'Marcar como leído')}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={handleClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center rounded-full',
        'border-2 transition-all duration-200 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        isRead
          ? 'bg-status-read border-status-read'
          : 'bg-transparent border-status-pending hover:border-text-secondary',
        pressed && 'scale-90',
        !pressed && 'hover:scale-110',
      )}
    >
      {isRead && (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="w-3 h-3 text-white"
          aria-hidden="true"
        >
          <path
            d="M4 10.5L8 14.5L16 6.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
