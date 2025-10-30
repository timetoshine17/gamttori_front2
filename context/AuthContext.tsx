import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextType = {
  token: string | null;
  initialized: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        console.log('AuthProvider: 토큰 복원 시작...');
        
        const t = await AsyncStorage.getItem('auth_token');
        console.log('AuthProvider: 저장된 토큰:', t ? '존재함' : '없음');
        if (t) {
          setToken(t);
          console.log('AuthProvider: 토큰 설정 완료, 토큰:', t.substring(0, 20) + '...');
        } else {
          console.log('AuthProvider: 저장된 토큰 없음');
        }
      } catch (error) {
        console.error('AuthProvider: 토큰 복원 오류:', error);
      } finally {
        setInitialized(true);
        console.log('AuthProvider: 초기화 완료');
      }
    })();
  }, []);

  const signIn = async (t: string) => {
    console.log('AuthProvider: signIn 호출됨, 토큰:', t ? '존재함' : '없음');
    try {
      // 먼저 AsyncStorage에 저장
      await AsyncStorage.setItem('auth_token', t);
      // 그 다음 상태 업데이트
      setToken(t);
      console.log('AuthProvider: signIn 완료, 토큰 설정됨');
    } catch (error) {
      console.error('AuthProvider: signIn 오류:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setToken(null);
    await AsyncStorage.multiRemove(['auth_token', 'user_info']);
  };

  const value = useMemo(() => ({ 
    token, 
    initialized, 
    signIn, 
    signOut 
  }), [token, initialized]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
