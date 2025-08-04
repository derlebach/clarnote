'use client';

import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface PlatformAwareNavigationProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  replace?: boolean;
  onClick?: () => void;
}

export default function PlatformAwareNavigation({
  href,
  children,
  className = "",
  replace = false,
  onClick
}: PlatformAwareNavigationProps) {
  const router = useRouter();

  const handleNavigation = async () => {
    // Add haptic feedback on native platforms
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (error) {
        // Haptics not available, continue
      }
    }

    // Call custom onClick handler if provided
    if (onClick) {
      onClick();
    }

    // Navigate using router
    if (replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
  };

  return (
    <div 
      onClick={handleNavigation}
      className={className}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNavigation();
        }
      }}
    >
      {children}
    </div>
  );
} 