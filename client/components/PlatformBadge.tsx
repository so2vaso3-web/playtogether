'use client';

import { Smartphone, Apple, Monitor, Globe } from 'lucide-react';

interface PlatformBadgeProps {
  platform: 'android' | 'ios' | 'emulator' | 'all';
  size?: 'sm' | 'md' | 'lg';
}

export default function PlatformBadge({ platform, size = 'md' }: PlatformBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1',
    md: 'text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5',
    lg: 'text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2',
  };

  const iconSize = {
    sm: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
    md: 'w-3 h-3 sm:w-4 sm:h-4',
    lg: 'w-4 h-4 sm:w-5 sm:h-5',
  };

  const platforms = {
    android: {
      icon: Smartphone,
      label: 'Android',
      color: 'bg-success/20 text-success border-success/40 shadow-lg shadow-success/20',
      iconColor: 'text-success',
    },
    ios: {
      icon: Apple,
      label: 'iOS',
      color: 'bg-gray-700/20 text-gray-300 border-gray-700/40 shadow-lg',
      iconColor: 'text-gray-300',
    },
    emulator: {
      icon: Monitor,
      label: 'Giả Lập',
      color: 'bg-info/20 text-info border-info/40 shadow-lg shadow-info/20',
      iconColor: 'text-info',
    },
    all: {
      icon: Globe,
      label: 'Tất Cả',
      color: 'bg-primary/20 text-primary border-primary/40 shadow-lg shadow-primary/20',
      iconColor: 'text-primary',
    },
  };

  const platformInfo = platforms[platform];
  const Icon = platformInfo.icon;

  return (
    <span className={`badge ${platformInfo.color} ${sizeClasses[size]} flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-shrink-0`}>
      <Icon className={`${iconSize[size]} flex-shrink-0`} />
      <span>{platformInfo.label}</span>
    </span>
  );
}

