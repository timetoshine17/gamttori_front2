/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expo Router를 위한 SPA 설정
  trailingSlash: true,
  
  // Vercel 배포를 위한 설정
  output: 'export',
  distDir: 'dist',
  
  // 이미지 최적화 비활성화 (정적 배포용)
  images: {
    unoptimized: true,
  },
  
  // TypeScript 설정
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint 설정
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Transpile packages
  transpilePackages: [
    'expo-router',
    'expo-modules-core',
    'expo-linking',
    'expo-constants',
    'expo-font',
    'expo-splash-screen',
    'expo-status-bar',
    'expo-system-ui',
    'expo-web-browser',
    'expo-av',
    'expo-blur',
    'expo-haptics',
    'expo-image',
    'expo-speech',
    'expo-symbols',
    'react-native',
    'react-native-web',
    'react-native-screens',
    'react-native-safe-area-context',
    'react-native-gesture-handler',
    'react-native-reanimated',
    'react-native-svg',
    'react-native-webview',
    'react-native-chart-kit',
    'react-native-tts',
    '@react-navigation/native',
    '@react-navigation/bottom-tabs',
    '@react-navigation/elements',
    '@react-native-async-storage/async-storage',
    '@supabase/supabase-js',
    '@tanstack/react-query',
    'zustand',
  ],
};

module.exports = nextConfig;
