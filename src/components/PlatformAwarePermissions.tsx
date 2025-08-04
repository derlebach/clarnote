'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';

interface PermissionState {
  microphone: 'granted' | 'denied' | 'prompt' | 'unknown';
  camera: 'granted' | 'denied' | 'prompt' | 'unknown';
}

interface PlatformAwarePermissionsProps {
  onPermissionChange?: (permissions: PermissionState) => void;
}

export default function PlatformAwarePermissions({ 
  onPermissionChange 
}: PlatformAwarePermissionsProps) {
  const [permissions, setPermissions] = useState<PermissionState>({
    microphone: 'unknown',
    camera: 'unknown'
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const newPermissions: PermissionState = {
      microphone: 'unknown',
      camera: 'unknown'
    };

    if (Capacitor.isNativePlatform()) {
      // Native platform permission checks
      try {
        const micPermission = await VoiceRecorder.hasAudioRecordingPermission();
        newPermissions.microphone = micPermission.value ? 'granted' : 'denied';
      } catch (error) {
        newPermissions.microphone = 'unknown';
      }

      // Camera permissions would go here if needed
      // newPermissions.camera = await checkNativeCameraPermission();

    } else {
      // Web platform permission checks
      if (navigator.permissions) {
        try {
          const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          newPermissions.microphone = micPermission.state as any;
          
          micPermission.onchange = () => {
            setPermissions(prev => ({
              ...prev,
              microphone: micPermission.state as any
            }));
          };
        } catch (error) {
          // Permission API not supported, check through getUserMedia
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            newPermissions.microphone = 'granted';
          } catch (error) {
            newPermissions.microphone = 'denied';
          }
        }
      }
    }

    setPermissions(newPermissions);
    if (onPermissionChange) {
      onPermissionChange(newPermissions);
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await VoiceRecorder.requestAudioRecordingPermission();
        const granted = result.value;
        
        setPermissions(prev => ({
          ...prev,
          microphone: granted ? 'granted' : 'denied'
        }));
        
        return granted;
      } catch (error) {
        console.error('Error requesting native microphone permission:', error);
        return false;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        setPermissions(prev => ({
          ...prev,
          microphone: 'granted'
        }));
        
        return true;
      } catch (error) {
        setPermissions(prev => ({
          ...prev,
          microphone: 'denied'
        }));
        return false;
      }
    }
  };

  return {
    permissions,
    requestMicrophonePermission,
    checkPermissions
  };
} 