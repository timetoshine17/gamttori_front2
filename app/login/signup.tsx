import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../src/_lib/api';
import AuthInput from '../_components/AuthInput';
import Button from '../_components/Button';
import CustomText from '../_components/CustomText';

export default function Signup() {
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const validate = () => {
    if (!name || !email || !pw || !pw2) throw new Error('모든 항목을 입력해주세요.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('이메일 형식을 확인해주세요.');
    if (pw.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.');
    if (pw !== pw2) throw new Error('비밀번호가 일치하지 않습니다.');
  };

  const onSignup = async () => {
    if (isSigningUp) return; // 이미 회원가입 중이면 중복 실행 방지
    
    try {
      setIsSigningUp(true);
      console.log('=== 회원가입 버튼 클릭됨 ===');
      console.log('입력된 이름:', name);
      console.log('입력된 이메일:', email);
      console.log('입력된 비밀번호:', pw ? '***' : '없음');
      console.log('입력된 비밀번호 확인:', pw2 ? '***' : '없음');
      
      validate();
      
      console.log('회원가입 API 호출 시작...');
      // 백엔드 API를 통한 회원가입
      const registerResponse = await userApi.register(email, pw, name);
      console.log('회원가입 API 응답:', registerResponse);
      
      if (registerResponse.success) {
        console.log('회원가입 성공, 자동 로그인 시도...');
        
        // 회원가입 성공 후 자동으로 로그인 시도
        try {
          const loginResponse = await userApi.login(email, pw);
          console.log('자동 로그인 API 응답:', loginResponse);
          
          if (loginResponse.success && loginResponse.data) {
            console.log('자동 로그인 성공, 사용자 정보 저장 중...');
            
            // 사용자 정보 저장
            await AsyncStorage.setItem('user_info', JSON.stringify(loginResponse.data.user));
            
            // 가입일 저장
            const today = new Date();
            await AsyncStorage.setItem('user_join_date', today.toISOString());
            console.log('가입일 저장 완료:', today.toISOString());
            
            // AuthProvider에 로그인 상태 전달
            await signIn(loginResponse.data.token);
            console.log('AuthProvider signIn 완료');
            
            console.log('홈으로 이동...');
            // 회원가입 완료 후 바로 홈으로 이동
            router.replace('/home');
          } else {
            // 자동 로그인 실패 시 회원가입 완료 페이지로 이동
            console.log('자동 로그인 실패, 회원가입 완료 페이지로 이동...');
            router.replace({ pathname: '/login/signup-complete', params: { name } });
          }
        } catch (loginError) {
          console.error('자동 로그인 오류:', loginError);
          // 자동 로그인 실패 시 회원가입 완료 페이지로 이동
          console.log('자동 로그인 실패, 회원가입 완료 페이지로 이동...');
          router.replace({ pathname: '/login/signup-complete', params: { name } });
        }
      } else {
        throw new Error(registerResponse.message || '회원가입에 실패했습니다.');
      }
    } catch (e: any) {
      console.error('회원가입 오류:', e);
      Alert.alert('가입 실패', e?.message ?? '다시 시도해주세요.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <CustomText style={styles.backArrow}>‹</CustomText>
          </Pressable>
          <CustomText weight="Bold" style={styles.title}>
            처음 오신 것을{'\n'}환영합니다!
          </CustomText>

          <View style={{ height: 20, marginTop:80 }} />
          <AuthInput placeholder="이름을 적어주세요." value={name} onChangeText={setName} />
          <View style={{ height: 12 }} />
          <AuthInput
            placeholder="이메일을 적어주세요."
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <View style={{ height: 12 }} />
          <AuthInput
            placeholder="비밀번호를 적어주세요."
            secure
            autoCapitalize="none"
            value={pw}
            onChangeText={(text) => {
              console.log('비밀번호 입력:', text ? '***' : '없음');
              setPw(text);
            }}
          />
          <View style={{ height: 12 }} />
          <AuthInput
            placeholder="비밀번호를 다시 적어주세요."
            secure
            autoCapitalize="none"
            value={pw2}
            onChangeText={(text) => {
              console.log('비밀번호 확인 입력:', text ? '***' : '없음');
              setPw2(text);
            }}
          />
        </View>

        <Button 
          title={isSigningUp ? "가입 중..." : "동의하고 가입하기"} 
          size="xl" 
          onPress={onSignup}
          disabled={isSigningUp}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  backArrow: { fontSize: 22, width: 22, height: 22, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 32, lineHeight: 40, marginTop: 30 },
});
