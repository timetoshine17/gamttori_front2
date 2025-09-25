import { Slot, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import Footer from './_components/Footer';

// 스플래시 화면을 자동으로 숨기지 않게 설정
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const pathname = usePathname();

  // 디버깅을 위한 로그
  console.log('현재 경로:', pathname);

  // 로그인 페이지가 아닌 모든 페이지에서 Footer 보이기
  const showFooter = !pathname.includes('/login');
  
  console.log('푸터 표시 여부:', showFooter);

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
      <AppContent />
    </AuthProvider>
  );
}

