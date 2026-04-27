import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type Props = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  uppercase?: boolean;
};

export function MonoLabel({ children, uppercase = true, className, ...rest }: Props) {
  return (
    <span
      className={clsx(
        'font-mono text-xs tracking-wider text-text-muted',
        uppercase && 'uppercase',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
