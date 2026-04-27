import { Link as RouterLink } from 'react-router-dom';
import { Fragment } from 'react';

export type Crumb = { label: string; to?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="font-mono text-xs text-text-muted">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={i}>
            {item.to && !isLast ? (
              <RouterLink
                to={item.to}
                className="hover:text-text-primary transition-colors"
              >
                {item.label}
              </RouterLink>
            ) : (
              <span className={isLast ? 'text-text-secondary' : ''}>{item.label}</span>
            )}
            {!isLast && <span className="mx-2">/</span>}
          </Fragment>
        );
      })}
    </nav>
  );
}
