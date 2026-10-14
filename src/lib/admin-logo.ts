import { createElement } from 'react';

/**
 * Logo mark shown in the Keystatic admin sidebar (a flame above a triangle burekas).
 * Written with createElement because keystatic.config.ts is a .ts file (no JSX).
 * Colors are fixed here on purpose: the admin doesn't load our Tailwind theme.
 * Same drawing as src/components/LogoMark.astro and public/favicon.svg.
 */
export function AdminLogoMark() {
  const path = (d: string, props: Record<string, string | number>) => createElement('path', { d, ...props });
  return createElement(
    'svg',
    { viewBox: '0 0 64 64', width: 22, height: 22, fill: 'none', 'aria-hidden': true },
    path('M32 2.5c1.1 4 6.6 6.4 6.6 12.6a6.6 6.6 0 0 1-13.2 0c0-3.4 2.2-5.2 3.3-7 .5 1.7 1.4 2.6 2.4 2.9C31.7 10.2 30.6 6.2 32 2.5z', { fill: '#ae3207' }),
    path('M8 58 32 26l24 32z', { fill: '#e9a23b', stroke: '#2a170f', strokeWidth: 3.2, strokeLinejoin: 'round' }),
    path('M15 53.2h34', { stroke: '#5f3b00', strokeWidth: 2.2, strokeLinecap: 'round', strokeDasharray: '1.2 4.2' }),
  );
}
