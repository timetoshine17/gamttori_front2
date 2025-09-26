import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Button from '../_components/Button';
import Card from '../_components/Card';
import CustomText from '../_components/CustomText';

export default function Settings() {
  const { signOut } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [joinDate, setJoinDate] = useState<string>('');
  const [currentDay, setCurrentDay] = useState<number>(1);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // 사용자 정보 가져오기
        const userInfoStr = await AsyncStorage.getItem('user_info');
        if (userInfoStr) {
          setUserInfo(JSON.parse(userInfoStr));
        }

        // 가입일 가져오기
        const joinDateStr = await AsyncStorage.getItem('user_join_date');
        if (joinDateStr) {
          const joinDateObj = new Date(joinDateStr);
          setJoinDate(joinDateObj.toLocaleDateString('ko-KR'));
          
          // 현재 일차 계산
          const today = new Date();
          const timeDiff = today.getTime() - joinDateObj.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          setCurrentDay(Math.max(1, daysDiff));
        }
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
      }
    };

    loadUserInfo();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <CustomText weight="Bold" style={styles.title}>
          설정
        </CustomText>
        
        {/* 사용자 정보 카드 */}
        <Card style={styles.userCard}>
          <View style={styles.userHeader}>
            <CustomText weight="Bold" style={styles.userTitle}>
              사용자 정보
            </CustomText>
          </View>
          
          <View style={styles.userInfoRow}>
            <CustomText style={styles.label}>닉네임</CustomText>
            <CustomText weight="SemiBold" style={styles.value}>
              {userInfo?.nickname || '설정되지 않음'}
            </CustomText>
          </View>
          
          <View style={styles.userInfoRow}>
            <CustomText style={styles.label}>이메일</CustomText>
            <CustomText weight="SemiBold" style={styles.value}>
              {userInfo?.email || '설정되지 않음'}
            </CustomText>
          </View>
          
          <View style={styles.userInfoRow}>
            <CustomText style={styles.label}>가입일</CustomText>
            <CustomText weight="SemiBold" style={styles.value}>
              {joinDate || '알 수 없음'}
            </CustomText>
          </View>
          
          <View style={styles.userInfoRow}>
            <CustomText style={styles.label}>현재 일차</CustomText>
            <CustomText weight="SemiBold" style={styles.value}>
              {currentDay}일차
            </CustomText>
          </View>
        </Card>

        {/* 감사 메시지 카드 */}
        <Card style={styles.thanksCard}>
          <View style={styles.thanksContent}>
            <CustomText weight="Bold" style={styles.thanksTitle}>
              감또리와 함께 해줘서 고마워요
            </CustomText>
            <CustomText style={styles.thanksMessage}>
              매일 매일 감또리와 함께하는 소중한 시간이에요.{'\n'}
              앞으로도 함께 성장해 나가요! 🌱
            </CustomText>
          </View>
        </Card>
        
        <View style={styles.section}>
          <Button
            title="로그아웃"
            variant="ghost"
            size="lg"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'MaruBuri-Bold',
  },
  
  // 사용자 정보 카드
  userCard: {
    marginBottom: 20,
    padding: 20,
  },
  userHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  userTitle: {
    fontSize: 18,
    color: '#374151',
    fontFamily: 'MaruBuri-Bold',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'MaruBuri-Regular',
  },
  value: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'MaruBuri-SemiBold',
  },
  
  // 감사 메시지 카드
  thanksCard: {
    marginBottom: 20,
    padding: 24,
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  thanksContent: {
    alignItems: 'center',
  },
  thanksTitle: {
    fontSize: 20,
    color: '#0c4a6e',
    fontFamily: 'MaruBuri-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  thanksMessage: {
    fontSize: 16,
    color: '#0369a1',
    fontFamily: 'MaruBuri-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  section: {
    marginTop: 20,
  },
});
