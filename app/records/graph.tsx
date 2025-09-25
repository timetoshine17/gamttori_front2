import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { API_CONFIG, moodApi } from '../../src/_lib/api';
import Card from '../_components/Card';
import CustomText from '../_components/CustomText';

interface MoodData {
  date: string;
  weight: number;
  emoji: string;
}

export default function MoodGraph() {
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState({
    average: 0,
    trend: 'stable',
    highest: 0,
    lowest: 0,
    totalDays: 0
  });

  // 최근 7일치 감정 데이터 수집
  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const moodDataArray: MoodData[] = [];

        // 사용자 정보 가져오기
        const userInfoStr = await AsyncStorage.getItem('user_info');
        if (!userInfoStr) {
          console.log('사용자 정보가 없습니다.');
          return;
        }
        const userInfo = JSON.parse(userInfoStr);
        const userId = userInfo.userId;

        // 최근 7일치 데이터 수집
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          try {
            // 백엔드에서 감정 데이터 가져오기
            if (API_CONFIG.ENABLE_BACKEND) {
              try {
                const response = await moodApi.getMoodsByUserId(userId);
                if (Array.isArray(response)) {
                  const dayMood = response.find((mood: any) => 
                    mood.date && mood.date.startsWith(dateStr)
                  );
                  if (dayMood) {
                    moodDataArray.push({
                      date: dateStr,
                      weight: (dayMood as any).weight || 3,
                      emoji: getEmojiByWeight((dayMood as any).weight || 3)
                    });
                    continue;
                  }
                }
              } catch (apiError) {
                console.log(`${dateStr} API 호출 실패:`, apiError);
              }
            }
            
            // 로컬 캐시에서 감정 데이터 가져오기
            const cachedMood = await AsyncStorage.getItem(`mood_${dateStr}`);
            if (cachedMood) {
              const mood = JSON.parse(cachedMood);
              moodDataArray.push({
                date: dateStr,
                weight: mood.weight,
                emoji: getEmojiByWeight(mood.weight)
              });
            } else {
              // 데이터가 없는 경우 기본값
              moodDataArray.push({
                date: dateStr,
                weight: 3, // 중립
                emoji: '😐'
              });
            }
          } catch (error) {
            console.log(`${dateStr} 데이터 로드 실패:`, error);
            moodDataArray.push({
              date: dateStr,
              weight: 3,
              emoji: '😐'
            });
          }
        }

        setMoodData(moodDataArray);
        analyzeMoodData(moodDataArray);
      } catch (error) {
        console.error('감정 데이터 수집 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodData();
  }, []);

  // 가중치를 이모지로 변환
  const getEmojiByWeight = (weight: number): string => {
    const emojis = ['😢', '🙁', '😐', '🙂', '😄'];
    const index = Math.max(0, Math.min(4, weight - 1));
    return emojis[index];
  };

  // 감정 데이터 분석
  const analyzeMoodData = (data: MoodData[]) => {
    const weights = data.map(d => d.weight);
    const average = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    
    // 트렌드 분석 (첫 3일 vs 마지막 3일)
    const firstHalf = weights.slice(0, 3).reduce((sum, w) => sum + w, 0) / 3;
    const secondHalf = weights.slice(-3).reduce((sum, w) => sum + w, 0) / 3;
    
    let trend = 'stable';
    if (secondHalf > firstHalf + 0.5) trend = 'up';
    else if (secondHalf < firstHalf - 0.5) trend = 'down';

    setAnalysis({
      average: Math.round(average * 10) / 10,
      trend,
      highest: Math.max(...weights),
      lowest: Math.min(...weights),
      totalDays: data.length
    });
  };

  // 평균 점수에 따른 귀여운 격려 문구 생성
  const getEncouragementMessage = (average: number): string => {
    if (average >= 4.0) {
      return "와! 정말 멋진 하루였어요! 🌟✨\n감또리가 응원할게요! 💕";
    } else if (average >= 3.0) {
      return "오늘도 수고했어요! 🥰\n감또리와 함께 더 좋은 날 만들어요! 🌈";
    } else {
      return "힘든 하루였지만 잘 버텨냈어요! 🤗\n감또리가 따뜻하게 안아줄게요! 💝";
    }
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            android_ripple={{ color: '#d1d5db' }}
          >
            <CustomText style={styles.backButtonText}>←</CustomText>
          </Pressable>
          <CustomText weight="Bold" style={styles.title}>감정 그래프</CustomText>
        </View>
        <Card style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#ec7600" />
          <CustomText style={styles.loadingText}>감정 데이터를 분석 중...</CustomText>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          android_ripple={{ color: '#e5e7eb' }}
        >
          <CustomText style={styles.backButtonText}>뒤로가기</CustomText>
        </Pressable>
        <CustomText weight="Bold" style={styles.title}>감또리의 응원 💕</CustomText>
      </View>

      {/* 감정 분석 결과 */}
      <Card style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <CustomText weight="Bold" style={styles.cardTitle}>최근 기분은 어떠셨나요?</CustomText>
        </View>
        
        <View style={styles.cardContent}>
          <CustomText weight="Bold" style={styles.encouragementMessage}>
            {getEncouragementMessage(analysis.average)}
          </CustomText>
          
          <View style={styles.emojiRow}>
            {moodData.map((mood, index) => (
              <CustomText key={index} style={styles.emojiText}>{mood.emoji}</CustomText>
            ))}
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#faf9f7', // 베이지/오프화이트 배경
    padding: 16, 
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    minWidth: 60,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f8f9fa', // 연한 회색
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6', // 회색 테두리
  },
  backButtonText: {
    fontSize: 14,
    color: '#495057', // 진한 회색
    fontWeight: '600',
  },
  title: { 
    fontSize: 24, 
    flex: 1,
    color: '#8b4513', // 따뜻한 갈색
    fontWeight: 'bold',
  },
  
  // 로딩 스타일
  loadingCard: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa', // 연한 회색
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6', // 회색 테두리
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#495057', // 진한 회색
  },
  
  // 메인 카드 스타일 (기다란 상자)
  mainCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 200,
  },
  cardHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    color: '#333333',
    fontWeight: '700',
    textAlign: 'center',
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  encouragementMessage: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
    marginBottom: 32,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  emojiText: {
    fontSize: 36,
  },
});
