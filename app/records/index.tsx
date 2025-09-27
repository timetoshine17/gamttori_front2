import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../store/progress';
import Card from '../_components/Card';
import CustomText from '../_components/CustomText';

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

export default function RecordsPage() {
  const { token, initialized } = useAuth();
  const { currentDay } = useProgress();
  
  // 디버깅을 위한 로그
  console.log('RecordsPage - currentDay:', currentDay);
  
  // 테스트용: currentDay가 없으면 1로 설정
  const testCurrentDay = currentDay || 1;
  console.log('RecordsPage - testCurrentDay:', testCurrentDay);

  // 로그인 체크는 나중에 처리 (일단 화면 표시)
  // useEffect(() => {
  //   if (initialized && !token) {
  //     console.log('로그인되지 않은 상태, 로그인 화면으로 이동');
  //     router.replace('/login');
  //   }
  // }, [initialized, token]);

  // 초기화 중이면 로딩 화면 표시
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
        <CustomText>로딩 중...</CustomText>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
      bounces={true}
    >
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
        <View style={styles.gridWrapper}>
          <FlatList
            data={DAYS}
            numColumns={6}
            keyExtractor={(n) => String(n)}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.gridRow}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            style={styles.flatListStyle}
            renderItem={({ item }) => {
              // 현재 일차까지만 클릭 가능
              const userCurrentDay = currentDay || 1;
              const isClickable = item <= userCurrentDay;
              const isLatestDay = item === userCurrentDay; // 가장 최신 일차
              
              const handlePress = () => {
                console.log('버튼 클릭:', { item, currentDay, userCurrentDay, isClickable });
                if (isClickable) {
                  router.push(`/records/${item}`);
                } else {
                  console.log('Alert 표시 시도 - 미래일차 클릭');
                  Alert.alert(
                    '알림', 
                    '앗 조금만 더 기다려주세요!',
                    [{ text: '확인', style: 'default' }],
                    { cancelable: true }
                  );
                }
              };
              
              return (
                <Pressable
                  onPress={handlePress}
                  style={[
                    styles.numBtn, 
                    isClickable && styles.recentBtn, // 열린 일차는 모두 1일차 색깔
                    !isClickable && styles.futureBtn
                  ]}
                  android_ripple={{ color: '#e5e7eb' }}
                >
                  <CustomText weight="Bold" style={[
                    styles.numText, 
                    isClickable && styles.recentText, // 열린 일차는 모두 1일차 텍스트 색깔
                    !isClickable && styles.futureText
                  ]}>
                    {item}
                  </CustomText>
                  {isLatestDay && <CustomText style={styles.newBadge}>NEW</CustomText>}
                </Pressable>
              );
            }}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#faf9f7', // 베이지/오프화이트 배경
  },
  container: { 
    padding: 12, // 16 -> 12로 줄임
    gap: 12, // 16 -> 12로 줄임
    paddingBottom: 20, // 30 -> 20으로 줄임
  },
  headRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    marginBottom: 12, // 16 -> 12로 줄임
  },
  title: { 
    fontSize: 26, // 28 -> 26으로 줄임
    paddingTop: 30, // 40 -> 30으로 줄임
    color: '#8b4513', // 따뜻한 갈색
    fontWeight: 'bold',
    fontFamily: 'MaruBuri-Bold',
  },
  titleImg: { 
    width: 50, // 60 -> 50으로 줄임
    marginTop: 20, // 30 -> 20으로 줄임
    marginLeft: 10, 
    height: 50, // 60 -> 50으로 줄임
  },
  
  // 환영 카드
  welcomeCard: {
    backgroundColor: '#fff3cd', // 연한 노란색
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107', // 노란색 테두리
    padding: 12, // 20 -> 12로 줄임
    borderRadius: 12,
    marginBottom: 12, // 16 -> 12로 줄임
  },
  welcomeContent: {
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 20, // 24 -> 20으로 줄임
    marginBottom: 6, // 8 -> 6으로 줄임
  },
  welcomeText: {
    fontSize: 16, // 18 -> 16으로 줄임
    color: '#6c757d', // 회색
    marginBottom: 6, // 8 -> 6으로 줄임
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'MaruBuri-SemiBold',
  },
  welcomeSubtext: { 
    fontSize: 12, // 14 -> 12로 줄임
    color: '#6c757d', // 회색
    textAlign: 'center',
    fontFamily: 'MaruBuri-Regular',
  },
  
  // 일차 카드
  daysCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16, // 20 -> 16으로 줄임
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 300, // 350 -> 300으로 줄임
  },
  daysHeader: {
    marginBottom: 12, // 16 -> 12로 줄임
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
    fontFamily: 'MaruBuri-SemiBold',
  },
  daysSubtitle: {
    fontSize: 14,
    color: '#6c757d', // 회색
    fontFamily: 'MaruBuri-Regular',
  },
  
  // 그리드
  gridWrapper: {
    flex: 1,
    minHeight: 250, // 300 -> 250으로 줄임
  },
  flatListStyle: {
    flex: 1,
  },
  gridContainer: {
    gap: 8, // 12 -> 8로 줄임
    paddingBottom: 15, // 20 -> 15로 줄임
    flexGrow: 1, // 스크롤 가능하도록
  },
  gridRow: {
    gap: 8, // 12 -> 8로 줄임
    marginBottom: 8, // 12 -> 8로 줄임
  },
  numBtn: {
    flex: 1,
    minWidth: 40, // 50 -> 40으로 줄임
    height: 40, // 50 -> 40으로 줄임
    borderRadius: 6, // 8 -> 6으로 줄임
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
    fontSize: 14, // 16 -> 14로 줄임
    color: '#495057', // 진한 회색
    fontWeight: '600',
    fontFamily: 'MaruBuri-SemiBold',
  },
  recentText: {
    color: '#ffc107', // 노란색
    fontFamily: 'MaruBuri-SemiBold',
  },
  availableBtn: {
    backgroundColor: '#fff3e0', // 연한 오렌지색 배경
    borderColor: '#ff9800', // 오렌지색 테두리
    borderWidth: 2,
  },
  availableText: {
    color: '#ff9800', // 오렌지색 텍스트
    fontFamily: 'MaruBuri-SemiBold',
  },
  futureBtn: {
    backgroundColor: '#f5f5f5', // 연한 회색 배경
    borderColor: '#bdbdbd', // 회색 테두리
    opacity: 0.7,
  },
  futureText: {
    color: '#9e9e9e', // 회색 텍스트
    fontFamily: 'MaruBuri-SemiBold',
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
    fontFamily: 'MaruBuri-Bold',
  },
});
