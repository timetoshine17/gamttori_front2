// src/_lib/freeTTS.ts
import { Platform } from 'react-native';

// 더 안정적인 무료 TTS 구현
export const FREE_TTS_CONFIG = {
  // 사용할 무료 TTS 서비스 선택
  PROVIDER: 'web' as 'web' | 'react-native',
  
  // 음성 설정
  VOICE_SETTINGS: {
    rate: 0.8,    // 속도 (0.1 ~ 10)
    pitch: 1.0,   // 음조 (0 ~ 2)
    volume: 1.0,  // 볼륨 (0 ~ 1)
  },
};

// Web Speech API (브라우저용, 완전 무료)
class WebSpeechTTS {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // 브라우저 환경 확인
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        this.isInitialized = true;
      } else {
        console.warn('Web Speech API가 지원되지 않습니다.');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Web Speech API 초기화 오류:', error);
      this.isInitialized = false;
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    
    try {
      this.voices = this.synth.getVoices();
      if (this.voices.length === 0) {
        // 음성이 아직 로드되지 않은 경우
        this.synth.addEventListener('voiceschanged', () => {
          this.voices = this.synth?.getVoices() || [];
        });
      }
    } catch (error) {
      console.error('음성 로드 오류:', error);
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.isInitialized || !this.synth) {
      throw new Error('Web Speech API가 초기화되지 않았습니다.');
    }

    return new Promise((resolve, reject) => {
      try {
        // 이전 재생 중지
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // 한국어 음성 찾기 (더 관대한 조건)
        const koreanVoice = this.voices.find(voice => 
          voice.lang.includes('ko') || 
          voice.lang.includes('KR') ||
          voice.name.includes('Korean') ||
          voice.name.includes('한국어')
        );
        
        if (koreanVoice) {
          utterance.voice = koreanVoice;
        }

        utterance.rate = FREE_TTS_CONFIG.VOICE_SETTINGS.rate;
        utterance.pitch = FREE_TTS_CONFIG.VOICE_SETTINGS.pitch;
        utterance.volume = FREE_TTS_CONFIG.VOICE_SETTINGS.volume;

        utterance.onend = () => {
          this.currentUtterance = null;
          resolve();
        };
        
        utterance.onerror = (event) => {
          this.currentUtterance = null;
          reject(new Error(`TTS 오류: ${event.error}`));
        };

        utterance.onstart = () => {
          console.log('TTS 재생 시작');
        };

        this.currentUtterance = utterance;
        if (this.synth) {
          this.synth.speak(utterance);
        }

        // 타임아웃 설정 (30초)
        setTimeout(() => {
          if (this.currentUtterance) {
            this.stop();
            reject(new Error('TTS 재생 타임아웃'));
          }
        }, 30000);

      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): void {
    if (this.synth && this.currentUtterance) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

// React Native TTS (모바일용)
class ReactNativeTTS {
  private tts: any = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        this.tts = require('react-native-tts').default;
        this.isInitialized = true;
        
        // TTS 초기화
        this.tts.setDefaultLanguage('ko-KR');
        this.tts.setDefaultRate(FREE_TTS_CONFIG.VOICE_SETTINGS.rate);
        this.tts.setDefaultPitch(FREE_TTS_CONFIG.VOICE_SETTINGS.pitch);
      }
    } catch (error) {
      console.warn('React Native TTS 초기화 실패:', error);
      this.isInitialized = false;
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.isInitialized || !this.tts) {
      throw new Error('React Native TTS가 초기화되지 않았습니다.');
    }

    return new Promise((resolve, reject) => {
      try {
        this.tts.speak(text, {
          onDone: () => resolve(),
          onError: (error: any) => reject(new Error(`TTS 오류: ${error}`)),
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): void {
    if (this.tts) {
      this.tts.stop();
    }
  }

  isSpeaking(): boolean {
    return this.tts ? this.tts.isSpeaking() : false;
  }
}

// TTS 인스턴스들
let webTTS: WebSpeechTTS | null = null;
let rnTTS: ReactNativeTTS | null = null;

// 메인 무료 TTS 함수
export async function freeTextToSpeech(text: string): Promise<void> {
  try {
    console.log('TTS 재생 시작:', text.substring(0, 50) + '...');
    
    if (Platform.OS === 'web') {
      // 웹 환경
      if (!webTTS) {
        webTTS = new WebSpeechTTS();
      }
      await webTTS.speak(text);
      
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // 모바일 환경
      if (FREE_TTS_CONFIG.PROVIDER === 'react-native') {
        if (!rnTTS) {
          rnTTS = new ReactNativeTTS();
        }
        await rnTTS.speak(text);
      } else {
        // React Native TTS가 없으면 Web Speech API 사용 (Expo Web)
        if (!webTTS) {
          webTTS = new WebSpeechTTS();
        }
        await webTTS.speak(text);
      }
      
    } else {
      throw new Error('지원하지 않는 플랫폼입니다.');
    }
    
    console.log('TTS 재생 완료');
    
  } catch (error) {
    console.error('무료 TTS 오류:', error);
    
    // 사용자에게 친화적인 오류 메시지
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    
    // 개발 환경에서만 콘솔에 표시
    if (__DEV__) {
      console.error('TTS 상세 오류:', error);
    }
    
    throw new Error(`음성 재생에 실패했습니다: ${errorMessage}`);
  }
}

// TTS 정지 함수
export function stopFreeTTS(): void {
  try {
    if (Platform.OS === 'web' && webTTS) {
      webTTS.stop();
    } else if (rnTTS) {
      rnTTS.stop();
    }
  } catch (error) {
    console.error('TTS 정지 오류:', error);
  }
}

// TTS 재생 상태 확인
export function isFreeTTSSpeaking(): boolean {
  try {
    if (Platform.OS === 'web' && webTTS) {
      return webTTS.isSpeaking();
    } else if (rnTTS) {
      return rnTTS.isSpeaking();
    }
    return false;
  } catch (error) {
    console.error('TTS 상태 확인 오류:', error);
    return false;
  }
}