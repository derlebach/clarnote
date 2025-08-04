'use client';

import { useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface EnhancedFileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  capture?: string;
  children: React.ReactNode;
  className?: string;
}

export default function EnhancedFileUpload({
  onFileSelect,
  accept = "audio/*,video/mp4",
  capture,
  children,
  className = ""
}: EnhancedFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isNativePlatform] = useState(() => {
    return typeof window !== 'undefined' && Capacitor.isNativePlatform();
  });

  const handleClick = async () => {
    // Add haptic feedback on native platforms
    if (isNativePlatform) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (error) {
        // Haptics not available, continue
      }
    }

    // For audio files on native platforms, show native picker options
    if (isNativePlatform && accept.includes('audio')) {
      try {
        await showNativeAudioPicker();
      } catch (error) {
        // Fall back to standard file picker
        fileInputRef.current?.click();
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const showNativeAudioPicker = async () => {
    // On native platforms, we could show action sheet for audio options
    // For now, fall back to standard file picker
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className={className}>
      <div onClick={handleClick} style={{ cursor: 'pointer' }}>
        {children}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
                 capture={isNativePlatform ? true : undefined}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
} 