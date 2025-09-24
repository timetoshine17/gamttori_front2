import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../_components/Button';
import CustomText from '../_components/CustomText';
import { useAuth } from '../_providers/AuthProvider';

export default function Settings() {
  const { signOut } = useAuth();
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    joinDate: string;
  } | null>(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('user_info');
      if (userInfoStr) {
        const user = JSON.parse(userInfoStr);
        setUserInfo({
          name: user.name || user.username || '사용자',
          email: user.email || '이메일 없음',
          joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '가입일자 없음'
        });
      }
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
    }
  };

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
            router.replace('/login/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <CustomText weight="Bold" style={styles.title}>
            설정
          </CustomText>
          <Image source={require('../../assets/images/gamttori_down.png')} style={styles.titleImg} />
        </View>
        
        {/* 사용자 정보 카드 */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.userIcon}>
              <CustomText style={styles.userIconText}>👤</CustomText>
            </View>
            <View style={styles.userDetails}>
              <CustomText weight="Bold" style={styles.userName}>
                {userInfo?.name || '사용자'}
              </CustomText>
              <CustomText style={styles.userEmail}>
                {userInfo?.email || '이메일 없음'}
              </CustomText>
              <CustomText style={styles.userJoinDate}>
                가입일: {userInfo?.joinDate || '가입일자 없음'}
              </CustomText>
            </View>
          </View>
        </View>
        
        {/* 홈 버튼 */}
        <View style={styles.homeSection}>
          <Button
            title="홈으로 돌아가기"
            size="lg"
            onPress={() => router.push('/home')}
            style={styles.homeButton}
          />
        </View>
        
        {/* 로그아웃 버튼 */}
        <View style={styles.logoutSection}>
          <Button
            title="로그아웃"
            variant="ghost"
            size="lg"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    color: '#8b4513',
    fontWeight: 'bold',
  },
  titleImg: {
    width: 60,
    height: 60,
    marginLeft: 12,
  },
  
  // 사용자 정보 카드
  userCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 20,
    padding: 40,
    marginBottom: 32,
    marginHorizontal: -20,
    minHeight: 300,
    borderWidth: 2,
    borderColor: '#0ea5a4',
    shadowColor: '#0ea5a4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  userIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#0ea5a4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 24,
    shadowColor: '#0ea5a4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  userIconText: {
    fontSize: 48,
  },
  userDetails: {
    alignItems: 'flex-start',
    flex: 1,
  },
  userName: {
    fontSize: 32,
    color: '#0ea5a4',
    marginBottom: 16,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 20,
    color: '#666',
    marginBottom: 12,
    textAlign: 'left',
  },
  userJoinDate: {
    fontSize: 18,
    color: '#999',
    textAlign: 'left',
  },
  
  // 홈 버튼 섹션
  homeSection: {
    marginBottom: 16,
  },
  homeButton: {
    backgroundColor: '#0ea5a4',
  },
  
  // 로그아웃 섹션
  logoutSection: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dc3545',
    borderWidth: 1,
  },
});
