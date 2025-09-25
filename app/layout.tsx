// Tabs 제거 + 커스텀 Footer 고정 + 로그인 상태 가드
import { Slot, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Footer from './_components/Footer';
import { AuthProvider, useAuth } from './_providers/AuthProvider';

// 스플래시 화면을 자동으로 숨기지 않게 설정
SplashScreen.preventAutoHideAsync();

function Gate() {
  const { token, initialized } = useAuth();
  const pathname = usePathname();

  // 홈/지난기록/이야기에서만 Footer 보이기
  const showFooter = /^\/(home|records|story)(\/)?$/.test(pathname);

  // 초기화 중일 때는 로딩 화면 표시
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        {/* 로딩 인디케이터나 스플래시 화면 */}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {showFooter && <Footer />}
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const hideSplash = async () => {
      console.log('스플래시 화면 숨기기...');
      await SplashScreen.hideAsync();
      console.log('스플래시 화면 숨김 완료');
    };

    hideSplash();
  }, []);

  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
