// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // 일단 로그인 화면으로 바로 이동
  // AuthProvider는 각 화면에서 개별적으로 처리
  return <Redirect href="/login" />;
}