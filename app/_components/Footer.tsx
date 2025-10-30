// app/_components/Footer.tsx
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import CustomText from './CustomText';

const TABS = [
  { key: 'Records', path: '/records', label: '지난 기록' },
  { key: 'Home',    path: '/home',    label: '홈' },
  { key: 'Story',   path: '/story',   label: '감또리 이야기' },
];

export default function Footer({ style }: { style?: object }) {
  const router = useRouter();
  const pathname = usePathname();

  // 현재 활성 탭 확인
  const getCurrentTab = () => {
    if (pathname.includes('/records')) return 'Records';
    if (pathname.includes('/story')) return 'Story';
    return 'Home';
  };

  const currentTab = getCurrentTab();

  return (
    <View style={[styles.container, style]}>
      {TABS.map(t => (
        <Pressable
          key={t.key}
          style={styles.tab}
          android_ripple={{ color: '#fff8ecff' }}
          onPress={() => {
            console.log('푸터 클릭:', t.path);
            router.push(t.path as any);
          }}
        >
          <CustomText 
            weight="Bold" 
            style={{ 
              color: currentTab === t.key ? '#ec7600ff' : '#000000ff' 
            }}
          >
            {t.label}
          </CustomText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    width: '100%', 
    flexDirection: 'row', 
    backgroundColor: '#ffffffff',
    paddingBottom: 20, // 시스템 네비게이션 바와의 간격
    paddingTop: 10, // 상단 여백
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb', // 상단 구분선
  },
  tab: { 
    width: '33%', 
    height: 60, // 높이를 약간 줄임
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});
