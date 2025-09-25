import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../src/_lib/api';
import AuthInput from '../_components/AuthInput';
import Button from '../_components/Button';
import CustomText from '../_components/CustomText';

export default function LoginPage() {
  const { signIn, token, initialized } = useAuth();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 디버깅을 위한 로그
  useEffect(() => {
    console.log('Login 컴포넌트 렌더링됨');
    console.log('initialized:', initialized);
    console.log('token:', token ? '존재함' : '없음');
  }, [initialized, token]);

  // 이미 로그인된 상태라면 홈으로 이동
  useEffect(() => {
    if (initialized && token) {
      console.log('이미 로그인된 상태, 홈으로 이동');
      router.replace('/home');
    }
  }, [initialized, token]);

  // 로딩 중이면 로딩 화면 표시
  if (!initialized) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <CustomText style={styles.loadingText}>로딩 중...</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  const onLogin = async () => {
    if (isLoggingIn) return; // 이미 로그인 중이면 중복 실행 방지
    
    try {
      setIsLoggingIn(true);
      console.log('로그인 버튼 클릭됨');
      console.log('입력된 이메일:', id);
      console.log('입력된 비밀번호:', pw ? '***' : '없음');
      
      if (!id || !pw) {
        Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
        return;
      }
      
      console.log('API 호출 시작...');
      console.log('API_BASE:', 'https://gamttori-back0917.vercel.app/api');
      
      // 백엔드 API를 통한 로그인
      const response = await userApi.login(id, pw);
      console.log('API 응답:', response);
      
      if (response.success) {
        console.log('로그인 성공, 토큰 저장 중...');
        // 토큰과 사용자 정보를 AsyncStorage에 저장
        await AsyncStorage.setItem('auth_token', response.data.token);
        await AsyncStorage.setItem('user_info', JSON.stringify(response.data.user));
        
        // AuthProvider에 로그인 상태 전달
        await signIn(response.data.token);
        
        console.log('홈으로 이동...');
        // replace 대신 push를 사용하여 네비게이션 스택을 유지
        router.push('/home');
      } else {
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (e: any) {
      console.error('로그인 오류:', e);
      console.error('오류 상세:', e.stack);
      
      let errorMessage = '다시 시도해주세요.';
      
      if (e.message) {
        errorMessage = e.message;
      } else if (e.name === 'TypeError' && e.message.includes('fetch')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (e.name === 'AbortError') {
        errorMessage = '요청 시간이 초과되었습니다.';
      }
      
      Alert.alert('로그인 실패', errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <CustomText weight="Bold" style={styles.title}>
            안녕하세요,{'\n'}만나서 반가워요!
          </CustomText>

          <View style={{ height: 20, marginTop:100 }} />
          <AuthInput
            placeholder="이메일을 입력해주세요."
            autoCapitalize="none"
            keyboardType="email-address"
            value={id}
            onChangeText={setId}
          />
          <View style={{ height: 12 }} />
          <AuthInput
            placeholder="비밀번호를 입력해주세요."
            secure
            autoCapitalize="none"
            value={pw}
            onChangeText={setPw}
          />
        </View>

        <View style={styles.centerSection}>
          <Button 
            title={isLoggingIn ? "로그인 중..." : "로그인 하기"} 
            size="xl" 
            onPress={onLogin}
            disabled={isLoggingIn}
          />
        </View>

        <View style={styles.bottomSection}>
          <Pressable onPress={() => router.push('/login/signup')} style={{ alignItems: 'center' }}>
            <CustomText style={styles.signUpText}>
              아직 회원이 아니신가요?  <CustomText style={styles.signUpLink}>→ 지금 가입하기</CustomText>
            </CustomText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'MaruBuri-Regular',
  },
  topSection: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  title: { fontSize: 32, lineHeight: 40 },
  helpLink: { textAlign: 'right', marginTop: 10, fontSize: 13, color: '#6b7280' },
  signUpText: { fontSize: 14, color: '#374151' },
  signUpLink: { color: '#0ea5a4' },
});
