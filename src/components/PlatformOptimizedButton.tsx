'use client';

import { forwardRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface PlatformOptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hapticStyle?: 'light' | 'medium' | 'heavy';
  children: React.ReactNode;
}

const PlatformOptimizedButton = forwardRef<HTMLButtonElement, PlatformOptimizedButtonProps>(
  ({ hapticStyle = 'light', onClick, onTouchStart, children, ...props }, ref) => {
    
    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      // Add haptic feedback on native platforms
      if (Capacitor.isNativePlatform()) {
        try {
          const style = hapticStyle === 'light' ? ImpactStyle.Light 
                      : hapticStyle === 'medium' ? ImpactStyle.Medium 
                      : ImpactStyle.Heavy;
          await Haptics.impact({ style });
        } catch (error) {
          // Haptics not available, continue
        }
      }
      
      // Call original onClick handler
      if (onClick) {
        onClick(event);
      }
    };

    const handleTouchStart = async (event: React.TouchEvent<HTMLButtonElement>) => {
      // Additional touch start haptic feedback for native platforms
      if (Capacitor.isNativePlatform()) {
        try {
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch (error) {
          // Haptics not available, continue
        }
      }
      
      // Call original onTouchStart handler
      if (onTouchStart) {
        onTouchStart(event);
      }
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        {...props}
        style={{
          ...props.style,
          // Ensure minimum touch target size on mobile
          minHeight: Capacitor.isNativePlatform() ? '44px' : props.style?.minHeight,
          minWidth: Capacitor.isNativePlatform() ? '44px' : props.style?.minWidth,
        }}
      >
        {children}
      </button>
    );
  }
);

PlatformOptimizedButton.displayName = 'PlatformOptimizedButton';

export default PlatformOptimizedButton; 