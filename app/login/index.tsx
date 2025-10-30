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
      console.log('=== 로그인 시도 시작 ===');
      console.log('로그인 버튼 클릭됨');
      console.log('입력된 이메일:', id);
      console.log('입력된 비밀번호:', pw ? '***' : '없음');
      console.log('현재 시간:', new Date().toISOString());
      
      if (!id || !pw) {
        Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
        return;
      }

      // 폰에서 네트워크 연결 확인
      console.log('네트워크 연결 상태 확인 중...');
      try {
        const testResponse = await fetch('https://www.google.com', { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        console.log('네트워크 연결 확인됨');
      } catch (networkError) {
        console.warn('네트워크 연결 확인 실패:', networkError);
      }
      
      console.log('API 호출 시작...');
      console.log('API_BASE:', 'https://gamttori-back0917.vercel.app/api');
      console.log('폰에서 로그인 시도 중...');
      
      // 백엔드 API를 통한 로그인
      console.log('API 호출 시작 - userApi.login 호출');
      const response = await userApi.login(id, pw);
      console.log('=== API 응답 받음 ===');
      console.log('응답 전체:', JSON.stringify(response, null, 2));
      console.log('success:', response.success);
      console.log('data:', response.data);
      console.log('error:', response.error);
      console.log('message:', response.message);
      
      if (response.success && response.data) {
        console.log('=== 로그인 성공 ===');
        console.log('사용자 정보:', response.data.user);
        console.log('토큰 길이:', response.data.token ? response.data.token.length : '토큰 없음');
        
        // 사용자 정보만 저장 (토큰은 AuthProvider에서 처리)
        await AsyncStorage.setItem('user_info', JSON.stringify(response.data.user));
        console.log('사용자 정보 AsyncStorage 저장 완료');
        
        // AuthProvider에 로그인 상태 전달 (토큰 저장 포함)
        await signIn(response.data.token);
        console.log('AuthProvider signIn 완료');
        
        console.log('홈으로 이동...');
        // replace를 사용하여 로그인 페이지를 스택에서 제거
        router.replace('/home');
      } else {
        // 백엔드에서 반환하는 에러 메시지 사용
        const errorMessage = response.error || response.message || '로그인에 실패했습니다.';
        console.error('=== 로그인 실패 ===');
        console.error('에러 메시지:', errorMessage);
        console.error('응답 전체:', response);
        throw new Error(errorMessage);
      }
    } catch (e: any) {
      console.error('=== 로그인 오류 발생 ===');
      console.error('오류 타입:', e.name);
      console.error('오류 메시지:', e.message);
      console.error('오류 전체:', e);
      console.error('오류 스택:', e.stack);
      
      let errorMessage = '다시 시도해주세요.';
      
      if (e.message) {
        // 백엔드에서 반환한 에러 메시지가 있으면 사용
        if (e.message.includes('Invalid email or password')) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (e.message.includes('Email already exists')) {
          errorMessage = '이미 가입된 이메일입니다. 로그인을 시도해주세요.';
        } else if (e.message.includes('Email and password are required')) {
          errorMessage = '이메일과 비밀번호를 모두 입력해주세요.';
        } else {
          errorMessage = e.message;
        }
      } else if (e.name === 'TypeError' && e.message && e.message.includes('fetch')) {
        errorMessage = '네트워크 연결을 확인해주세요. 인터넷 연결 상태를 확인하고 다시 시도해주세요.';
      } else if (e.name === 'AbortError') {
        errorMessage = '요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.';
      } else if (e.message && e.message.includes('Failed to fetch')) {
        errorMessage = '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.';
      } else if (e.message && e.message.includes('HTTP 401')) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (e.message && e.message.includes('HTTP 404')) {
        errorMessage = '사용자를 찾을 수 없습니다. 이메일을 확인해주세요.';
      } else if (e.message && e.message.includes('HTTP 500')) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      Alert.alert('로그인 실패', errorMessage);
    } finally {
      console.log('=== 로그인 시도 종료 ===');
      console.log('isLoggingIn을 false로 설정');
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

          <View style={{ height: 20, marginTop: 60 }} />
          <AuthInput
            placeholder="이메일을 입력해주세요."
            autoCapitalize="none"
            keyboardType="email-address"
            value={id}
            onChangeText={setId}
            autoFocus={true}
            returnKeyType="next"
            blurOnSubmit={false}
          />
          <View style={{ height: 12 }} />
          <AuthInput
            placeholder="비밀번호를 입력해주세요."
            secure
            autoCapitalize="none"
            value={pw}
            onChangeText={setPw}
            returnKeyType="done"
            onSubmitEditing={onLogin}
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
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  centerSection: {
    justifyContent: 'center',
    paddingVertical: 40,
  },
  bottomSection: {
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  title: { fontSize: 32, lineHeight: 40 },
  helpLink: { textAlign: 'right', marginTop: 10, fontSize: 13, color: '#6b7280' },
  signUpText: { fontSize: 14, color: '#374151' },
  signUpLink: { color: '#0ea5a4' },
});
