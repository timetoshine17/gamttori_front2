// app/_components/Footer.tsx
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import currentAppZustand from '../../store/currentApp';
import tabTypeZustand from '../../store/tabType';
import CustomText from './CustomText';

const TABS = [
  { key: 'Records', path: '/records', label: '지난 기록' },
  { key: 'Home',    path: '/home',    label: '홈' },
  { key: 'Story',   path: '/story',   label: '감또리 이야기' },
];

export default function Footer({ style }: { style?: object }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabType = tabTypeZustand(s => s.tabType);
  const setTabType = tabTypeZustand(s => s.setTabType);
  const currentApp = currentAppZustand(s => s.currentApp);
  const setCurrentApp = currentAppZustand(s => s.setCurrentApp);

  const activeRoot = useMemo(() => {
    const seg = pathname.split('/').filter(Boolean).find(s => !s.startsWith('(')) ?? 'home';
    return seg.toLowerCase(); // 'home' | 'records' | 'story'
  }, [pathname]);

  useEffect(() => {
    const map: any = { home: 'Home', records: 'Records', story: 'Story' };
    const next = map[activeRoot];
    if (next && tabType !== next) setTabType(next);
    if (next && currentApp !== next) setCurrentApp(next);
  }, [activeRoot, tabType, currentApp]);

  const colorFor = (key: string) => (tabType === key ? '#ec7600ff' : '#000000ff');

  return (
    <View style={[styles.container, style]}>
      {TABS.map(t => (
        <Pressable
          key={t.key}
          style={styles.tab}
          android_ripple={{ color: '#fff8ecff' }}
          onPress={() => {
            if (tabType !== t.key) {
              setTabType(t.key as any);
              setCurrentApp(t.key);
              router.push(t.path as any);
            }
          }}
        >
          <CustomText weight="Bold" style={{ color: colorFor(t.key) }}>{t.label}</CustomText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', flexDirection: 'row', backgroundColor: '#ffffffff' },
  tab: { width: '33%', height: 70, justifyContent: 'center', alignItems: 'center' },
});
