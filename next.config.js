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
    ignoreBuildErrors: false,
  },
  
  // ESLint 설정
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
