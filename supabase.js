import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Supabase 설정
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 연결 테스트 함수 - 백엔드와 동일한 테이블 사용
export const testConnection = async () => {
  try {
    console.log('=== Supabase 연결 테스트 시작 ===');
    
    // 백엔드에서 사용하는 poems 테이블로 테스트
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .limit(1);
    
    console.log('Supabase 응답:', { data, error });
    
    if (error) {
      console.error('Supabase 연결 오류:', error);
      return false;
    }
    
    console.log('✅ Supabase 연결 성공! 데이터:', data);
    return true;
  } catch (err) {
    console.error('❌ Supabase 연결 테스트 실패:', err);
    return false;
  }
};

export default supabase;
