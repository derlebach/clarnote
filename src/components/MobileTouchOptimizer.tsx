'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface MobileTouchOptimizerProps {
  children: React.ReactNode;
}

export default function MobileTouchOptimizer({ children }: MobileTouchOptimizerProps) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Optimize touch interactions for mobile
    const optimizeTouch = () => {
      // Add touch optimization CSS
      const style = document.createElement('style');
      style.innerHTML = `
        /* Mobile touch optimizations */
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Allow text selection for inputs and content areas */
        input, textarea, [contenteditable="true"], .selectable-text {
          -webkit-user-select: text;
          -khtml-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        
        /* Improve button touch targets */
        button, [role="button"], .clickable {
          min-height: 44px;
          min-width: 44px;
          position: relative;
        }
        
        /* Add touch feedback */
        button:active, [role="button"]:active, .clickable:active {
          transform: scale(0.95);
          transition: transform 0.1s ease;
        }
        
        /* Optimize scroll performance */
        .scroll-container {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        /* Prevent zooming on input focus */
        input, select, textarea {
          font-size: 16px !important;
        }
      `;
      document.head.appendChild(style);
    };

    optimizeTouch();

    // Add haptic feedback to buttons
    const addHapticFeedback = () => {
      const buttons = document.querySelectorAll('button, [role="button"], .clickable');
      
      buttons.forEach(button => {
        button.addEventListener('touchstart', async () => {
          try {
            await Haptics.impact({ style: ImpactStyle.Light });
          } catch (error) {
            // Haptics not available, fail silently
          }
        });
      });
    };

    // Add haptic feedback after a brief delay to ensure DOM is ready
    setTimeout(addHapticFeedback, 100);

    // Prevent double-tap zoom on buttons
    const preventDoubleTopZoom = () => {
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, false);
    };

    preventDoubleTopZoom();

    // Improve file input handling on mobile
    const optimizeFileInputs = () => {
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        // Add capture attribute for mobile camera/microphone access
        if (input.getAttribute('accept')?.includes('audio')) {
          input.setAttribute('capture', 'microphone');
        }
        if (input.getAttribute('accept')?.includes('video')) {
          input.setAttribute('capture', 'camera');
        }
        if (input.getAttribute('accept')?.includes('image')) {
          input.setAttribute('capture', 'camera');
        }
      });
    };

    optimizeFileInputs();

  }, []);

  return <>{children}</>;
} 