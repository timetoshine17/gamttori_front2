import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet } from 'react-native';
import { expoTextToSpeech, stopExpoTTS } from '../../src/_lib/expoTTS';
import CustomText from './CustomText';

interface TTSButtonProps {
  text: string;
  onPlay?: () => void;
  onStop?: () => void;
  disabled?: boolean;
}

export default function TTSButton({ text, onPlay, onStop, disabled = false }: TTSButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isPlaying) {
      // 재생 중이면 정지
      setIsPlaying(false);
      stopExpoTTS();
      onStop?.();
      return;
    }

    try {
      setIsLoading(true);
      setIsPlaying(true);
      onPlay?.();

      // Expo TTS로 음성 재생
      await expoTextToSpeech(text);
      
      // 재생 완료 후 상태 초기화
      setIsPlaying(false);
      setIsLoading(false);

    } catch (error) {
      console.error('무료 TTS 재생 오류:', error);
      setIsPlaying(false);
      setIsLoading(false);
      
      // 사용자에게 친화적인 오류 메시지 표시
      const errorMessage = error instanceof Error ? error.message : '음성 재생에 실패했습니다.';
      Alert.alert('음성 재생 오류', errorMessage);
    }
  };

  return (
    <Pressable
      style={[
        styles.button,
        isPlaying && styles.playing,
        disabled && styles.disabled
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading}
      hitSlop={8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#4b5563" />
      ) : (
        <CustomText style={styles.icon}>
          {isPlaying ? '🔇' : '🔊'}
        </CustomText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  playing: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 18,
  },
});