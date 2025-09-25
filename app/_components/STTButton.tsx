import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Alert, Platform } from 'react-native';
import CustomText from './CustomText';

interface STTButtonProps {
  onResult: (text: string) => void;
  disabled?: boolean;
  style?: any;
}

export default function STTButton({ onResult, disabled = false, style }: STTButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // 웹 환경에서 Speech Recognition API 지원 확인
    if (Platform.OS === 'web') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    } else {
      // 모바일 환경에서는 기본적으로 지원하지 않는다고 가정
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    if (Platform.OS === 'web' && isSupported) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ko-KR'; // 한국어 설정
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        Alert.alert('음성 인식 오류', '음성을 인식할 수 없습니다. 다시 시도해주세요.');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      Alert.alert(
        '음성 인식 지원 안함', 
        '현재 환경에서는 음성 인식이 지원되지 않습니다. 텍스트로 입력해주세요.'
      );
    }
  };

  const stopListening = () => {
    if (Platform.OS === 'web') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        // 브라우저에서 자동으로 중지됨
        setIsListening(false);
      }
    }
  };

  if (!isSupported && Platform.OS !== 'web') {
    return null; // 모바일에서는 STT 버튼을 표시하지 않음
  }

  return (
    <Pressable
      style={[
        styles.button,
        isListening && styles.listeningButton,
        disabled && styles.disabledButton,
        style
      ]}
      onPress={isListening ? stopListening : startListening}
      disabled={disabled || !isSupported}
      android_ripple={{ color: '#e5e7eb' }}
    >
      <CustomText style={[
        styles.buttonText,
        isListening && styles.listeningText,
        disabled && styles.disabledText
      ]}>
        {isListening ? '🎤 듣는 중...' : '🎤 음성 입력'}
      </CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  listeningButton: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
  },
  listeningText: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#9e9e9e',
  },
});
