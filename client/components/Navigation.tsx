'use client';

import { useScrollDirection } from '@/hooks/useScrollDirection';

interface NavigationProps {
  children: React.ReactNode;
  className?: string;
}

export default function Navigation({ children, className = '' }: NavigationProps) {
  const { scrollDirection, isAtTop } = useScrollDirection();

  return (
    <nav className={`relative z-50 glass border-b border-dark-border sticky top-0 transition-transform duration-300 ease-in-out ${
      isAtTop || scrollDirection === 'up' ? 'translate-y-0' : '-translate-y-full'
    } ${className}`}>
      {children}
    </nav>
  );
}




