'use client';

import { useState, useEffect } from 'react';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Capacitor } from '@capacitor/core';

interface MobileAudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob, fileName: string) => void;
  className?: string;
}

export default function MobileAudioRecorder({ onAudioRecorded, className = '' }: MobileAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [canRecord, setCanRecord] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    checkCapabilities();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const checkCapabilities = async () => {
    if (!Capacitor.isNativePlatform()) {
      // Fallback to web audio recording for web platform
      setCanRecord(true);
      setHasPermission(true);
      return;
    }

    try {
      const deviceCanRecord = await VoiceRecorder.canDeviceVoiceRecord();
      setCanRecord(deviceCanRecord.value);

      if (deviceCanRecord.value) {
        const permission = await VoiceRecorder.hasAudioRecordingPermission();
        setHasPermission(permission.value);
      }
    } catch (error) {
      console.error('Error checking recording capabilities:', error);
    }
  };

  const requestPermission = async () => {
    if (!Capacitor.isNativePlatform()) return true;

    try {
      const permission = await VoiceRecorder.requestAudioRecordingPermission();
      setHasPermission(permission.value);
      return permission.value;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await VoiceRecorder.startRecording();
      } else {
        // Web fallback - implement MediaRecorder
        await startWebRecording();
      }
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const recording = await VoiceRecorder.stopRecording();
        
        // Convert base64 to Blob
        if (!recording.value.recordDataBase64) {
          throw new Error('No audio data received from recording');
        }
        const audioBlob = await base64ToBlob(recording.value.recordDataBase64, recording.value.mimeType);
        const fileName = `recording_${Date.now()}.${getFileExtension(recording.value.mimeType)}`;
        
        onAudioRecorded(audioBlob, fileName);
      } else {
        await stopWebRecording();
      }
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
    }
  };

  // Web recording fallback
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startWebRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const fileName = `recording_${Date.now()}.webm`;
        onAudioRecorded(audioBlob, fileName);
        stream.getTracks().forEach(track => track.stop());
      };

      setAudioChunks(chunks);
      setMediaRecorder(recorder);
      recorder.start();
    } catch (error) {
      console.error('Error starting web recording:', error);
      throw error;
    }
  };

  const stopWebRecording = async () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const base64ToBlob = async (base64: string, mimeType: string): Promise<Blob> => {
    const response = await fetch(`data:${mimeType};base64,${base64}`);
    return response.blob();
  };

  const getFileExtension = (mimeType: string): string => {
    const extensions: { [key: string]: string } = {
      'audio/aac': 'aac',
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/wav': 'wav',
      'audio/mpeg': 'mp3'
    };
    return extensions[mimeType] || 'audio';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!canRecord) {
    return (
      <div className={`${className} p-4 bg-gray-100 rounded-lg text-center`}>
        <p className="text-gray-600">Audio recording is not supported on this device.</p>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-4`}>
      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center justify-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-700 font-medium">Recording: {formatTime(recordingTime)}</span>
        </div>
      )}

      {/* Record Button */}
      <div className="flex justify-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!canRecord}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center text-white font-medium transition-all duration-200
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 transform scale-110' 
              : 'bg-gray-900 hover:bg-gray-800 hover:scale-105'
            }
            ${!canRecord ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            active:scale-95
          `}
        >
          {isRecording ? (
            <div className="w-6 h-6 bg-white rounded-sm"></div>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {!hasPermission 
            ? 'Tap to grant microphone permission and start recording'
            : isRecording 
            ? 'Tap the stop button to finish recording'
            : 'Tap the microphone to start recording'
          }
        </p>
      </div>

      {/* Capacitor Platform Info */}
      {Capacitor.isNativePlatform() && (
        <div className="text-xs text-gray-400 text-center">
          Running on {Capacitor.getPlatform()} with native audio recording
        </div>
      )}
    </div>
  );
} 