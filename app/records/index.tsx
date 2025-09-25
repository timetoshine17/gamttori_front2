import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import Card from '../_components/Card';
import CustomText from '../_components/CustomText';
import { useAuth } from '../_providers/AuthProvider';

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

export default function RecordsPage() {
  const { token, initialized } = useAuth();
  const data = useMemo(() => DAYS, []);

  // 인증 확인 - 로그인되지 않은 경우 로그인 화면으로 이동
  useEffect(() => {
    if (initialized && !token) {
      console.log('로그인되지 않은 상태, 로그인 화면으로 이동');
      router.replace('/login');
    }
  }, [initialized, token]);

  // 초기화되지 않았거나 토큰이 없으면 아무것도 렌더링하지 않음
  if (!initialized || !token) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 타이틀 */}
      <View style={styles.headRow}>
        <CustomText weight="Bold" style={styles.title}>지난 기록들</CustomText>
        <Image source={require('../../assets/images/gamttori_down.png')} style={styles.titleImg} />
      </View>

      {/* 안내 메시지 */}
      <Pressable 
        onPress={() => router.push('/records/graph')}
        android_ripple={{ color: '#e5e7eb' }}
      >
        <Card style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <CustomText style={styles.starIcon}>✨</CustomText>
            <CustomText weight="Bold" style={styles.welcomeText}>
              지난기록
            </CustomText>
            <CustomText style={styles.welcomeSubtext}>
              당신의 날들을 기록합니다.{'\n'}최근 7일간의 감정 변화를 확인하세요
            </CustomText>
          </View>
        </Card>
      </Pressable>

      {/* 일차 선택 카드 */}
      <Card style={styles.daysCard}>
        <View style={styles.daysHeader}>
          <View style={styles.daysTitleContainer}>
            <CustomText style={styles.calendarIcon}>📅</CustomText>
            <CustomText weight="Bold" style={styles.daysTitle}>일차별 기록</CustomText>
          </View>
          <CustomText style={styles.daysSubtitle}>클릭해서 자세히 보기</CustomText>
        </View>

        {/* 숫자 그리드 */}
        <FlatList
          data={data}
          numColumns={6}
          keyExtractor={(n) => String(n)}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/records/${item}`)}
              style={[styles.numBtn, item === 1 && styles.recentBtn]}
              android_ripple={{ color: '#e5e7eb' }}
            >
              <CustomText weight="Bold" style={[styles.numText, item === 1 && styles.recentText]}>
                {item}
              </CustomText>
              {item === 1 && <CustomText style={styles.newBadge}>NEW</CustomText>}
            </Pressable>
          )}
        />
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
  headRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    marginBottom: 16,
  },
  title: { 
    fontSize: 28, 
    paddingTop: 40,
    color: '#8b4513', // 따뜻한 갈색
    fontWeight: 'bold',
  },
  titleImg: { 
    width: 60, 
    marginTop: 30, 
    marginLeft: 10, 
    height: 60,
  },
  
  // 환영 카드
  welcomeCard: {
    backgroundColor: '#fff3cd', // 연한 노란색
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107', // 노란색 테두리
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: '#6c757d', // 회색
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  welcomeSubtext: { 
    fontSize: 14, 
    color: '#6c757d', // 회색
    textAlign: 'center',
  },
  
  // 일차 카드
  daysCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  daysHeader: {
    marginBottom: 16,
  },
  daysTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  calendarIcon: {
    fontSize: 16,
  },
  daysTitle: {
    fontSize: 18,
    color: '#495057', // 진한 회색
    fontWeight: '600',
  },
  daysSubtitle: {
    fontSize: 14,
    color: '#6c757d', // 회색
  },
  
  // 그리드
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    gap: 12,
    marginBottom: 12,
  },
  numBtn: {
    flex: 1,
    minWidth: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f8f9fa', // 연한 회색
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#dee2e6', // 회색 테두리
  },
  recentBtn: {
    backgroundColor: '#fff3cd', // 연한 노란색
    borderColor: '#ffc107', // 노란색 테두리
    borderWidth: 2,
  },
  numText: {
    fontSize: 16,
    color: '#495057', // 진한 회색
    fontWeight: '600',
  },
  recentText: {
    color: '#ffc107', // 노란색
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc3545', // 빨간색
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
