import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userApi } from '../../src/_lib/api';
import AuthInput from '../_components/AuthInput';
import Button from '../_components/Button';
import CustomText from '../_components/CustomText';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  const validate = () => {
    if (!name || !email || !pw || !pw2) throw new Error('모든 항목을 입력해주세요.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('이메일 형식을 확인해주세요.');
    if (pw.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.');
    if (pw !== pw2) throw new Error('비밀번호가 일치하지 않습니다.');
  };

  const onSignup = async () => {
    try {
      console.log('=== 회원가입 버튼 클릭됨 ===');
      console.log('입력된 이름:', name);
      console.log('입력된 이메일:', email);
      console.log('입력된 비밀번호:', pw ? '***' : '없음');
      console.log('입력된 비밀번호 확인:', pw2 ? '***' : '없음');
      
      // 먼저 간단한 알림으로 버튼이 작동하는지 확인
      Alert.alert('버튼 테스트', '회원가입 버튼이 클릭되었습니다!');
      
      validate();
      
      console.log('API 호출 시작...');
      // 백엔드 API를 통한 회원가입
      const response = await userApi.register(email, pw, name);
      console.log('API 응답:', response);
      
      if (response.success) {
        console.log('회원가입 성공, 완료 페이지로 이동...');
        router.replace({ pathname: '/login/signup-complete', params: { name } });
      } else {
        throw new Error('회원가입에 실패했습니다.');
      }
    } catch (e: any) {
      console.error('회원가입 오류:', e);
      Alert.alert('가입 실패', e?.message ?? '다시 시도해주세요.');
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

        <Button title="동의하고 가입하기" size="xl" onPress={onSignup} />
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
