import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Alert, Platform } from 'react-native';
import CustomText from './CustomText';

interface AdvancedSTTButtonProps {
  onResult: (text: string) => void;
  disabled?: boolean;
  style?: any;
}

export default function AdvancedSTTButton({ onResult, disabled = false, style }: AdvancedSTTButtonProps) {
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
      recognition.interimResults = true; // 중간 결과도 받기
      recognition.lang = 'ko-KR'; // 한국어 설정
      recognition.maxAlternatives = 1;
      
      let finalTranscript = '';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // 중간 결과가 있으면 실시간으로 표시
        if (interimTranscript) {
          onResult(finalTranscript + interimTranscript);
        }
        
        // 최종 결과가 있으면 처리
        if (finalTranscript) {
          onResult(finalTranscript);
          setIsListening(false);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = '음성을 인식할 수 없습니다.';
        switch (event.error) {
          case 'no-speech':
            errorMessage = '음성이 감지되지 않았습니다. 다시 말씀해주세요.';
            break;
          case 'audio-capture':
            errorMessage = '마이크에 접근할 수 없습니다. 마이크 권한을 확인해주세요.';
            break;
          case 'not-allowed':
            errorMessage = '마이크 권한이 허용되지 않았습니다. 브라우저 설정을 확인해주세요.';
            break;
          case 'network':
            errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
            break;
          default:
            errorMessage = `음성 인식 오류: ${event.error}`;
        }
        
        Alert.alert('음성 인식 오류', errorMessage);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      try {
        recognition.start();
      } catch (error) {
        console.error('Recognition start error:', error);
        setIsListening(false);
        Alert.alert('음성 인식 오류', '음성 인식을 시작할 수 없습니다.');
      }
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
