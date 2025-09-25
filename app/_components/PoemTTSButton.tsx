import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet } from 'react-native';
import CustomText from './CustomText';

interface PoemTTSButtonProps {
  day?: number; // 일차 번호
  onPlay?: () => void;
  onStop?: () => void;
  disabled?: boolean;
}

// S3 URL 생성 함수
const getPoemAudioUrl = (day: number): string => {
  // 일차별 전체 URL 매핑
  const poemUrls: { [key: number]: string } = {
    1: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/1.+%EC%83%88%EB%A1%9C%EC%9A%B4+%EA%B8%B8_%EC%9C%A4%EB%8F%99%EC%A3%BC(%EC%97%AC%EC%9E%90+%EB%8A%90%EB%A6%B0ver.).mp3',
    2: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/2.+%EB%8F%8C%EC%95%84%EC%99%80+%EB%B3%B4%EB%8A%94+%EB%B0%A4_%EC%9C%A4%EB%8F%99%EC%A3%BC(%EC%97%AC%EC%9E%90+%EB%8A%90%EB%A6%B0ver.).mp3',
    3: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/3.+%EC%9D%BC%EA%B3%B1+%EA%B0%9C%EC%9D%98+%EB%8B%A8%EC%96%B4%EB%A1%9C+%EB%90%9C+%EC%82%AC%EC%A0%84_%EC%A7%84%EC%9D%80%EC%98%81(%EC%97%AC%EC%9E%90%EB%8A%90%EB%A6%B0ver.).mp3',
    4: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/4.+%EB%B4%84_+%EC%9C%A4%EB%8F%99%EC%A3%BC.mp3',
    5: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/5.+%ED%95%9C%EC%97%86%EC%9D%B4+%EA%B3%A0%EC%9A%94%ED%95%9C+%EC%97%AC%EB%A6%84+%EB%8B%A4%EB%9D%BD_%EC%B5%9C%EC%A7%80%EC%9D%80.mp3',
    6: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/6.+%EA%B0%80%EC%9D%84+%EA%B7%B8%EB%A6%AC%EA%B3%A0+%EA%B2%A8%EC%9A%B8_%EC%B5%9C%ED%95%98%EB%A6%BC.mp3',
    7: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/7.+%EB%8B%AC%EC%9D%B4+%EB%96%B4%EB%8B%A4%EA%B3%A0+%EC%A0%84%ED%99%94%EB%A5%BC+%EC%A3%BC%EC%8B%9C%EB%8B%A4%EB%8B%88%EC%9A%94_%EA%B9%80%EC%9A%A9%ED%83%9D.mp3',
    8: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/8.+%EC%82%AC%EC%9B%94%EC%9D%98+%EC%9E%A0_%EB%B0%95%EC%A4%80.mp3',
    9: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/8.+%EC%82%AC%EC%9B%94%EC%9D%98+%EC%9E%A0_%EB%B0%95%EC%A4%80.mp3', // 9일차는 8일차와 동일
    10: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/10.+%EC%8B%AD%EC%9D%B4%EC%9B%94_%EC%B5%9C%EC%A7%80%EC%9D%80.mp3',
    11: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/11.+%EC%9E%90%EC%97%B0%EC%97%90%EA%B2%8C%EC%84%9C+%EB%B0%B0%EC%9A%B4+%EA%B2%83_%ED%95%B8%EB%A6%AC+%EB%8D%B0%EC%9D%B4%EB%B9%97+%EC%86%8C%EB%A1%9C.mp3',
    12: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/12.+%EA%B1%B8%EC%96%B4%EB%B3%B4%EC%A7%80+%EB%AA%BB%ED%95%9C+%EA%B8%B8_%EB%A1%9C%EB%B2%84%ED%8A%B8+%ED%94%84%EB%A1%9C%EC%8A%A4%ED%8A%B8.mp3',
    13: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/13.+%EB%82%A8%EC%95%84%EC%9E%88%EB%8A%94+%EA%B2%83%EB%93%A4_%EC%A7%84%EC%9D%80%EC%98%81.mp3',
    14: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/14.+%EC%82%AC%EB%9E%91%ED%95%98%EB%9D%BC%2C+%ED%95%9C+%EB%B2%88%EB%8F%84+%EC%83%81%EC%B2%98%EB%B0%9B%EC%A7%80+%EC%95%8A%EC%9D%80+%EA%B2%83%EC%B2%98%EB%9F%BC_%EC%95%8C%ED%94%84%EB%A0%88%EB%93%9C+%EB%94%94+%EC%88%98%EC%9E%90.mp3',
    15: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/15.+%EB%B3%84+%ED%97%A4%EB%8A%94+%EB%B0%A4_%EC%9C%A4%EB%8F%99%EC%A3%BC.mp3',
    16: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/16.+%EB%A9%94%EB%B0%80%EA%B5%AD%EC%88%98_%EB%B0%95%EC%A4%80.mp3',
    17: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/17.+%ED%98%9C%ED%99%94%EC%97%AD+4%EB%B2%88+%EC%B6%9C%EA%B5%AC_%EC%9D%B4%EC%83%81%EA%B5%AD.mp3',
    18: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/18.+%EC%82%AC%EB%9E%91%ED%95%A9%EB%8B%88%EB%8B%A4_%EC%A7%84%EC%9D%80%EC%98%81.mp3',
    19: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/19.+%EB%82%98%EC%99%80+%EB%82%98%ED%83%80%EC%83%A4%EC%99%80+%ED%9D%B0+%EB%8B%B9%EB%82%98%EA%B7%80_%EB%B0%B1%EC%84%9D.mp3',
    20: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/20.+%EB%B0%A4%EC%9D%98+%EC%84%9D%EC%A1%B0%EC%A0%84_%EC%95%88%ED%9D%AC%EC%97%B0.mp3',
    21: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/21.+%EC%96%B4%EC%A9%8C%EB%A9%B4_%EB%8C%84+%EC%A1%B0%EC%A7%80.mp3',
    22: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/22.+%ED%99%A9%ED%98%BC_%EC%9D%B4%EC%9C%A1%EC%82%AC.mp3',
    23: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/23.+%EC%8B%9C%EC%9B%94_%ED%99%A9%EB%8F%99%EA%B7%9C.mp3',
    24: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/24.+%EC%A7%84%EC%A7%9C%EB%A1%9C+%EB%81%9D%EB%82%98%EB%B2%84%EB%A0%B8%EC%96%B4+%EC%97%AC%EB%A6%84_%EA%B3%A0%EC%84%A0%EA%B2%BD.mp3',
    25: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/25.+%EC%B2%AD%ED%98%BC_%EC%A7%84%EC%9D%80%EC%98%81.mp3',
    26: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/26.+%EC%B2%AB%EB%88%88%EC%97%90+%EB%B0%98%ED%95%9C+%EC%82%AC%EB%9E%91_%EB%B9%84%EC%8A%AC%EB%9D%BC%EB%B0%94+%EC%89%BC%EB%B3%B4%EB%A5%B4%EC%8A%A4%EC%B9%B4.mp3',
    27: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/27.+%EC%A7%80%EA%B8%88+%EC%95%8C%EA%B3%A0+%EC%9E%88%EB%8A%94+%EA%B1%B8+%EA%B7%B8%EB%95%8C%EB%8F%84+%EC%95%8C%EC%95%98%EB%8D%94%EB%9D%BC%EB%A9%B4_%ED%82%B4%EB%B2%8C%EB%A6%AC+%EC%BB%A4%EB%B2%84%EA%B1%B0.mp3',
    28: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/28.+%EC%97%AC%EB%A6%84%EC%9D%B4+%EC%98%A4%EA%B8%B0+%EC%A0%84%EC%97%90_%EC%B5%9C%EC%A7%80%EC%9D%80.mp3',
    29: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/29.+%EC%9E%90%ED%99%94%EC%83%81_%EC%9C%A4%EB%8F%99%EC%A3%BC.mp3',
    30: 'https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/30.+%EC%9D%B4+%EA%BF%88%EC%97%90%EB%8F%84+%EB%8B%AC%EC%9D%98+%EB%92%B7%EB%A9%B4+%EA%B0%99%EC%9D%80+%EB%82%B4%EA%B0%80+%EB%AA%A8%EB%A5%B4%EB%8A%94+%EC%9D%B4%EC%95%BC%EA%B8%B0+%EC%9E%88%EC%9D%84%EA%B9%8C_%EC%B5%9C%EC%A7%80%EC%9D%80.mp3',
    // 1-30일차 모든 URL 매핑 완료!
  };
  
  return poemUrls[day] || `https://gamttori-poem-audios.s3.ap-northeast-2.amazonaws.com/%EC%8B%9C+%EB%82%AD%EC%86%A1+ai+%EB%AA%A9%EC%86%8C%EB%A6%AC+%EB%AA%A8%EC%9D%8C(1-30)/1.+%EC%83%88%EB%A1%9C%EC%9A%B4+%EA%B8%B8_%EC%9C%A4%EB%8F%99%EC%A3%BC(%EC%97%AC%EC%9E%90+%EB%8A%90%EB%A6%B0ver.).mp3`;
};

export default function PoemTTSButton({ day = 1, onPlay, onStop, disabled = false }: PoemTTSButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    // 오디오 권한 설정
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('오디오 설정 오류:', error);
      }
    };
    setupAudio();

    // 컴포넌트 언마운트 시 사운드 정리
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePress = async () => {
    if (isPlaying) {
      // 재생 중이면 정지
      try {
        setIsPlaying(false);
        if (sound) {
          await sound.stopAsync();
        }
        onStop?.();
      } catch (error) {
        console.error('음성 정지 오류:', error);
      }
      return;
    }

    try {
      setIsLoading(true);
      setIsPlaying(true);
      onPlay?.();

      // 이전 사운드가 있으면 정리
      if (sound) {
        await sound.unloadAsync();
      }

      // 일차에 맞는 MP3 파일 URL 생성
      const audioUrl = getPoemAudioUrl(day);
      console.log(`${day}일차 시 음성 재생:`, audioUrl);
      
      // URL이 올바른지 확인
      console.log('URL 길이:', audioUrl.length);
      console.log('URL 끝:', audioUrl.slice(-10));

      // URL 유효성 검사
      if (!audioUrl || !audioUrl.startsWith('https://')) {
        throw new Error('유효하지 않은 오디오 URL');
      }

      // 새로운 사운드 로드 및 재생
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: true, 
          volume: 1.0,
          isLooping: false,
          isMuted: false,
        },
        (status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              // 재생 완료
              setIsPlaying(false);
              setIsLoading(false);
            }
          } else if (status.error) {
            console.error('음성 재생 오류:', status.error);
            setIsPlaying(false);
            setIsLoading(false);
            Alert.alert('음성 재생 오류', `${day}일차 음성 파일을 재생할 수 없습니다.\n오류: ${status.error}`);
          }
        }
      );

      setSound(newSound);

    } catch (error) {
      console.error('시 음성 재생 오류:', error);
      setIsPlaying(false);
      setIsLoading(false);
      
      let errorMessage = `${day}일차 음성 파일을 불러올 수 없습니다.`;
      
      if (error instanceof Error) {
        if (error.message.includes('NotSupportedError')) {
          errorMessage = `${day}일차 음성 파일 형식을 지원하지 않습니다.\nMP3 파일을 확인해주세요.`;
        } else if (error.message.includes('Network')) {
          errorMessage = `네트워크 연결을 확인해주세요.\n${day}일차 음성 파일을 다운로드할 수 없습니다.`;
        } else if (error.message.includes('404')) {
          errorMessage = `${day}일차 음성 파일을 찾을 수 없습니다.`;
        }
      }
      
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
