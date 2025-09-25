import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../_components/Button';
import CustomText from '../_components/CustomText';

export default function SignupComplete() {
  const { name } = useLocalSearchParams<{ name?: string }>();

  // 가입일 저장
  useEffect(() => {
    const saveJoinDate = async () => {
      try {
        const today = new Date();
        await AsyncStorage.setItem('user_join_date', today.toISOString());
        console.log('가입일 저장 완료:', today.toISOString());
      } catch (error) {
        console.error('가입일 저장 오류:', error);
      }
    };
    
    saveJoinDate();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View>
          <CustomText style={styles.back} onPress={() => router.back()}>‹</CustomText>

          <View style={styles.card}>
            {/* 마스코트 이미지가 있으면 이 경로 교체하세요 */}
            {/* <Image source={require('../../assets/images/mascot.png')} style={styles.img} /> */}
            <CustomText style={styles.emoji}>🍊</CustomText>
            <CustomText weight="Bold" style={styles.doneText}>
              {name ? `${name}님, ` : ''}회원가입이 완료되었습니다!
            </CustomText>
          </View>
        </View>

        <Button title="로그인하러 가기" size="xl" onPress={() => router.replace('/login/login')} />
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
  back: { fontSize: 22, width: 22, height: 22, textAlign: 'center' },
  card: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emoji: { fontSize: 72, marginBottom: 8 },
  img: { width: 120, height: 120, marginBottom: 12, resizeMode: 'contain' },
  doneText: { fontSize: 20, textAlign: 'center', marginTop: 4 },
});
