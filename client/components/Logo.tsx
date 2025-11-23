'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12',
  md: 'w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16',
  lg: 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20',
};

const textSizeClasses = {
  sm: 'text-base sm:text-lg lg:text-xl',
  md: 'text-lg sm:text-xl lg:text-2xl',
  lg: 'text-xl sm:text-2xl lg:text-3xl',
};

export default function Logo({ size = 'sm', showText = true, className = '' }: LogoProps) {
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    
    // Listen for settings updates
    const handleSettingsUpdate = (event: any) => {
      console.log('[Logo] Settings update event received', event);
      // Force reload settings immediately
      fetchSettings();
    };
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      // Add cache busting to ensure fresh data
      const response = await axios.get(`/api/settings?t=${Date.now()}`);
      console.log('[Logo] Settings loaded:', response.data);
      setSiteSettings(response.data);
    } catch (error) {
      console.error('[Logo] Error loading settings:', error);
      setSiteSettings({
        logoUrl: '',
        siteName: 'PlayTogether Hack',
        siteDescription: 'Premium Gaming Tools',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-1.5 sm:gap-2 md:gap-3 ${className}`}>
        <div className={`relative flex-shrink-0`}>
          <div className="absolute inset-0 bg-primary rounded-lg blur opacity-50"></div>
          <div className={`relative icon-container bg-gradient-to-br from-primary to-secondary rounded-lg ${sizeClasses[size]}`}>
            <Sparkles className={`${sizeClasses[size]} text-white icon-glow-primary icon-float p-1 sm:p-1.5 md:p-2`} />
          </div>
        </div>
        {showText && (
          <div className="hidden sm:block">
            <h1 className={`${textSizeClasses[size]} font-bold gradient-text leading-tight`}>PlayTogether Hack</h1>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 leading-tight">Premium Gaming Tools</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 md:gap-3 ${className}`}>
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-primary rounded-lg blur opacity-50"></div>
        <div className={`relative icon-container bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center overflow-hidden ${sizeClasses[size]}`}>
          {siteSettings?.logoUrl ? (
            <img 
              src={siteSettings.logoUrl} 
              alt="Logo" 
              className="w-full h-full object-cover rounded-md"
              style={{ display: 'block' }}
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          {!siteSettings?.logoUrl && (
            <Sparkles className={`${sizeClasses[size]} text-white icon-glow-primary icon-float p-1 sm:p-1.5 md:p-2`} />
          )}
        </div>
      </div>
      {showText && (
        <div className="hidden sm:block">
          <h1 className={`${textSizeClasses[size]} font-bold gradient-text leading-tight`}>
            {siteSettings?.siteName || 'PlayTogether Hack'}
          </h1>
          <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 leading-tight">
            {siteSettings?.siteDescription || 'Premium Gaming Tools'}
          </p>
        </div>
      )}
    </div>
  );
}

