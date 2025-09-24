import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { API_CONFIG, moodApi } from '../../src/_lib/api';
import Card from '../_components/Card';
import CustomText from '../_components/CustomText';

const screenWidth = Dimensions.get('window').width - 32;

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

  const labels = moodData.map((_, index) => {
    const date = new Date(moodData[index].date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  const data = moodData.map(d => d.weight);

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
        <CustomText weight="Bold" style={styles.title}>감정 분석</CustomText>
      </View>

      {/* 감정 분석 요약 */}
      <Card style={styles.analysisCard}>
        <View style={styles.analysisHeader}>
          <CustomText weight="Bold" style={styles.analysisTitle}>감정 분석 결과</CustomText>
        </View>
        <View style={styles.analysisGrid}>
          <View style={styles.analysisItem}>
            <CustomText style={styles.analysisLabel}>평균 기분</CustomText>
            <CustomText weight="Bold" style={styles.analysisValue}>
              {getEmojiByWeight(Math.round(analysis.average))} {analysis.average.toFixed(1)}점
            </CustomText>
          </View>
          <View style={styles.analysisItem}>
            <CustomText style={styles.analysisLabel}>기분 변화</CustomText>
            <CustomText weight="Bold" style={styles.analysisValue}>
              {analysis.trend === 'up' ? '상승' : 
               analysis.trend === 'down' ? '하락' : '안정'}
            </CustomText>
          </View>
          <View style={styles.analysisItem}>
            <CustomText style={styles.analysisLabel}>최고 기분</CustomText>
            <CustomText weight="Bold" style={styles.analysisValue}>
              {getEmojiByWeight(analysis.highest)} {analysis.highest}점
            </CustomText>
          </View>
          <View style={styles.analysisItem}>
            <CustomText style={styles.analysisLabel}>최저 기분</CustomText>
            <CustomText weight="Bold" style={styles.analysisValue}>
              {getEmojiByWeight(analysis.lowest)} {analysis.lowest}점
            </CustomText>
          </View>
        </View>
      </Card>

      {/* 감정 그래프 */}
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <CustomText weight="Bold" style={styles.chartTitle}>7일간 감정 변화</CustomText>
        </View>
        <LineChart
          data={{ labels, datasets: [{ data }] }}
          width={screenWidth - 32}
          height={260}
          fromZero
          segments={4}
          yAxisInterval={1}
          chartConfig={{
            backgroundGradientFrom: '#fef3c7',
            backgroundGradientTo: '#fef3c7',
            color: (o = 1) => `rgba(245, 158, 11, ${o})`,
            labelColor: (o = 1) => `rgba(146, 64, 14, ${o})`,
            propsForDots: { r: '8', strokeWidth: '3', stroke: '#f59e0b' },
            strokeWidth: 4,
          }}
          bezier
          withVerticalLines={false}
          withHorizontalLines
          style={{ borderRadius: 16, marginTop: 12 }}
        />
        <View style={styles.legend}>
          <CustomText style={styles.legendText}>😢 1점 (매우 나쁨) ~ 😄 5점 (매우 좋음)</CustomText>
        </View>
      </Card>

      {/* 일별 감정 상세 */}
      <Card style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <CustomText weight="Bold" style={styles.detailTitle}>일별 감정 상세</CustomText>
        </View>
        {moodData.map((mood, index) => (
          <View key={index} style={styles.detailItem}>
            <View style={styles.detailDateContainer}>
              <CustomText style={styles.detailDate}>
                {new Date(mood.date).toLocaleDateString('ko-KR', { 
                  month: 'short', 
                  day: 'numeric',
                  weekday: 'short'
                })}
              </CustomText>
              <CustomText style={styles.detailDay}>Day {index + 1}</CustomText>
            </View>
            <View style={styles.detailMood}>
              <CustomText style={styles.detailEmoji}>{mood.emoji}</CustomText>
              <CustomText style={styles.detailWeight}>{mood.weight}점</CustomText>
            </View>
          </View>
        ))}
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
  
  // 분석 카드 스타일
  analysisCard: {
    backgroundColor: '#e3f2fd', // 연한 파란색
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3', // 파란색 테두리
    borderRadius: 12,
    padding: 16,
  },
  analysisHeader: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 20,
    color: '#1976d2', // 파란색
    fontWeight: '600',
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analysisItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbdefb', // 연한 파란색 테두리
    shadowColor: '#2196f3',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  analysisLabel: {
    fontSize: 14,
    color: '#1976d2', // 파란색
    marginBottom: 4,
    fontWeight: '600',
  },
  analysisValue: {
    fontSize: 16,
    color: '#0d47a1', // 진한 파란색
    fontWeight: 'bold',
  },
  
  // 차트 카드 스타일
  chartCard: {
    backgroundColor: '#fff3cd', // 연한 노란색
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107', // 노란색 테두리
  },
  chartHeader: {
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 18,
    color: '#856404', // 진한 노란색
    fontWeight: '600',
  },
  legend: {
    alignItems: 'center',
    marginTop: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#856404', // 진한 노란색
  },
  
  // 상세 카드 스타일
  detailCard: {
    backgroundColor: '#d4edda', // 연한 초록색
    borderLeftWidth: 4,
    borderLeftColor: '#28a745', // 초록색 테두리
    borderRadius: 12,
    padding: 16,
  },
  detailHeader: {
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 18,
    color: '#155724', // 진한 초록색
    fontWeight: '600',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#c3e6cb', // 연한 초록색 테두리
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  detailDateContainer: {
    flex: 1,
  },
  detailDate: {
    fontSize: 16,
    color: '#155724', // 진한 초록색
    fontWeight: '600',
  },
  detailDay: {
    fontSize: 12,
    color: '#28a745', // 초록색
    marginTop: 2,
  },
  detailMood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailEmoji: {
    fontSize: 24,
  },
  detailWeight: {
    fontSize: 16,
    color: '#155724', // 진한 초록색
    fontWeight: 'bold',
  },
});
