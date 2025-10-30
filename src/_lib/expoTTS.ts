// src/_lib/expoTTS.ts
import * as Speech from 'expo-speech';

// Expo Speech를 사용한 안정적인 무료 TTS
export const EXPO_TTS_CONFIG = {
  // 음성 설정
  language: 'ko-KR',           // 한국어
  pitch: 1.0,                  // 음조 (0.5 ~ 2.0)
  rate: 0.8,                   // 속도 (0.1 ~ 0.9)
  volume: 1.0,                 // 볼륨 (0.0 ~ 1.0)
  quality: Speech.VoiceQuality.Enhanced, // 음질
};

// Expo Speech TTS 함수
export async function expoTextToSpeech(text: string): Promise<void> {
  try {
    console.log('Expo TTS 재생 시작:', text.substring(0, 50) + '...');
    
    // 이전 재생 중지
    Speech.stop();
    
    // TTS 옵션 설정
    const options: Speech.SpeechOptions = {
      language: EXPO_TTS_CONFIG.language,
      pitch: EXPO_TTS_CONFIG.pitch,
      rate: EXPO_TTS_CONFIG.rate,
      volume: EXPO_TTS_CONFIG.volume,
      onStart: () => {
        console.log('TTS 재생 시작');
      },
      onDone: () => {
        console.log('TTS 재생 완료');
      },
      onError: (error) => {
        console.error('TTS 재생 오류:', error);
        throw new Error(`음성 재생 오류: ${error}`);
      },
    };

    // 음성 재생
    await Speech.speak(text, options);
    
  } catch (error) {
    console.error('Expo TTS 오류:', error);
    throw new Error(`음성 재생에 실패했습니다: ${error}`);
  }
}

// TTS 정지 함수
export function stopExpoTTS(): void {
  try {
    Speech.stop();
  } catch (error) {
    console.error('Expo TTS 정지 오류:', error);
  }
}

// TTS 재생 상태 확인
export async function isExpoTTSSpeaking(): Promise<boolean> {
  try {
    return await Speech.isSpeakingAsync();
  } catch (error) {
    console.error('Expo TTS 상태 확인 오류:', error);
    return false;
  }
}

// 사용 가능한 음성 목록 가져오기
export async function getAvailableVoices(): Promise<Speech.Voice[]> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    console.log('사용 가능한 음성:', voices);
    return voices;
  } catch (error) {
    console.error('음성 목록 가져오기 오류:', error);
    return [];
  }
}
