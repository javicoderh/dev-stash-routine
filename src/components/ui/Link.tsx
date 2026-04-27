import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom';
import { clsx } from 'clsx';

type ExternalProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  external: true;
  children: ReactNode;
};

type InternalProps = RouterLinkProps & {
  external?: false;
  children: ReactNode;
};

type Props = ExternalProps | InternalProps;

export function Link(props: Props) {
  const baseClasses =
    'text-accent-link underline underline-offset-4 decoration-accent-link/40 ' +
    'hover:decoration-accent-link transition-colors';

  if (props.external) {
    const { external: _ignored, className, children, ...rest } = props;
    void _ignored;
    return (
      <a
        {...rest}
        className={clsx(baseClasses, className)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  const { className, children, ...rest } = props;
  return (
    <RouterLink {...rest} className={clsx(baseClasses, className)}>
      {children}
    </RouterLink>
  );
}
