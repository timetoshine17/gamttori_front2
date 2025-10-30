import * as Font from 'expo-font';
import { Slot, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import Footer from './_components/Footer';

// 스플래시 화면을 자동으로 숨기지 않게 설정
SplashScreen.preventAutoHideAsync();

// 전역 에러 핸들러 설정 (앱 크래시 방지)
if (typeof ErrorUtils !== 'undefined') {
  const defaultHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('전역 에러 발생:', error);
    console.error('치명적 오류:', isFatal);
    
    // 기본 핸들러 호출 (필요한 경우)
    if (defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });
}

function AppContent() {
  const pathname = usePathname();

  // 디버깅을 위한 로그
  console.log('현재 경로:', pathname);

  // 로그인 페이지가 아닌 모든 페이지에서 Footer 보이기
  const showFooter = !pathname.includes('/login');
  
  console.log('푸터 표시 여부:', showFooter);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      {showFooter && <Footer />}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        console.log('폰트 로딩 시작...');
        await Font.loadAsync({
          'MaruBuri-Light': require('../assets/fonts/MaruBuri-Light.ttf'),
          'MaruBuri-Regular': require('../assets/fonts/MaruBuri-Regular.ttf'),
          'MaruBuri-SemiBold': require('../assets/fonts/MaruBuri-SemiBold.ttf'),
          'MaruBuri-Bold': require('../assets/fonts/MaruBuri-Bold.ttf'),
          'MaruBuri-ExtraLight': require('../assets/fonts/MaruBuri-ExtraLight.ttf'),
        });
        console.log('폰트 로딩 완료');
        setFontsLoaded(true);
      } catch (error) {
        console.error('폰트 로딩 실패:', error);
        setFontsLoaded(true); // 폰트 로딩 실패해도 앱은 계속 실행
      }
    };

    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      const hideSplash = async () => {
        console.log('스플래시 화면 숨기기...');
        await SplashScreen.hideAsync();
        console.log('스플래시 화면 숨김 완료');
      };

      hideSplash();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // 폰트가 로드될 때까지 대기
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

