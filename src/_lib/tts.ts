// src/_lib/tts.ts
import { Platform } from 'react-native';

// TTS API 설정
export const TTS_CONFIG = {
  // 사용할 TTS 서비스 선택
  PROVIDER: 'openai' as 'openai' | 'elevenlabs' | 'google' | 'azure',
  
  // API 키 (환경변수에서 가져오거나 직접 설정)
  API_KEY: process.env.EXPO_PUBLIC_TTS_API_KEY || '',
  
  // 음성 설정
  VOICE_SETTINGS: {
    openai: {
      model: 'tts-1',
      voice: 'alloy', // alloy, echo, fable, onyx, nova, shimmer
      speed: 1.0,
    },
    elevenlabs: {
      voice_id: 'pNInz6obpgDQGcFmaJgB', // Adam voice
      stability: 0.5,
      similarity_boost: 0.5,
    },
    google: {
      languageCode: 'ko-KR',
      ssmlGender: 'NEUTRAL',
      name: 'ko-KR-Wavenet-A',
    },
    azure: {
      language: 'ko-KR',
      voice: 'ko-KR-SunHiNeural',
      style: 'friendly',
    },
  },
};

// OpenAI TTS API 호출
async function callOpenAITTS(text: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TTS_CONFIG.API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: TTS_CONFIG.VOICE_SETTINGS.openai.model,
      input: text,
      voice: TTS_CONFIG.VOICE_SETTINGS.openai.voice,
      speed: TTS_CONFIG.VOICE_SETTINGS.openai.speed,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI TTS API 오류: ${response.status}`);
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}

// ElevenLabs TTS API 호출
async function callElevenLabsTTS(text: string): Promise<string> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${TTS_CONFIG.VOICE_SETTINGS.elevenlabs.voice_id}`, {
    method: 'POST',
    headers: {
      'xi-api-key': TTS_CONFIG.API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: TTS_CONFIG.VOICE_SETTINGS.elevenlabs.stability,
        similarity_boost: TTS_CONFIG.VOICE_SETTINGS.elevenlabs.similarity_boost,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS API 오류: ${response.status}`);
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}

// 메인 TTS 함수
export async function textToSpeech(text: string): Promise<string> {
  if (!TTS_CONFIG.API_KEY) {
    throw new Error('TTS API 키가 설정되지 않았습니다.');
  }

  switch (TTS_CONFIG.PROVIDER) {
    case 'openai':
      return await callOpenAITTS(text);
    case 'elevenlabs':
      return await callElevenLabsTTS(text);
    case 'google':
      // Google Cloud TTS 구현
      throw new Error('Google TTS는 아직 구현되지 않았습니다.');
    case 'azure':
      // Azure TTS 구현
      throw new Error('Azure TTS는 아직 구현되지 않았습니다.');
    default:
      throw new Error('지원하지 않는 TTS 제공자입니다.');
  }
}

// 오디오 재생 함수 (React Native용)
export async function playAudio(audioUrl: string): Promise<void> {
  // React Native에서는 react-native-sound나 expo-av 사용
  // 여기서는 기본 구현만 제공
  
  if (Platform.OS === 'web') {
    const audio = new Audio(audioUrl);
    await audio.play();
  } else {
    // React Native에서는 expo-av 사용 권장
    console.log('React Native 오디오 재생:', audioUrl);
    // const { Audio } = require('expo-av');
    // const { sound } = await Audio.Sound.createAsync(audioUrl);
    // await sound.playAsync();
  }
}
