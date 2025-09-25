# Supabase 연결 설정 가이드

## 1. Supabase 패키지 설치

```bash
npm install @supabase/supabase-js
```

## 2. 환경 변수 설정

### 방법 1: .env 파일 사용 (권장)
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 방법 2: app.config.js에서 직접 설정
`app.config.js` 파일의 `extra` 섹션에서 직접 값을 설정할 수 있습니다:

```javascript
extra: {
  supabaseUrl: "your_supabase_url_here",
  supabaseAnonKey: "your_supabase_anon_key_here",
}
```

## 3. Supabase 프로젝트 설정

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Settings > API에서 다음 정보를 복사:
   - Project URL → `SUPABASE_URL`
   - Project API keys > anon public → `SUPABASE_ANON_KEY`

## 4. 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 SQL을 실행하여 `profiles` 테이블을 생성하세요:

```sql
-- profiles 테이블 생성
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 자신의 프로필을 읽을 수 있도록 정책 생성
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 모든 사용자가 자신의 프로필을 업데이트할 수 있도록 정책 생성
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## 5. 앱 실행

```bash
npm start
```

## 6. 연결 확인

앱을 실행하면 홈 화면에서 Supabase 연결 상태와 profiles 데이터 개수를 확인할 수 있습니다.

## 파일 구조

```
gamttori_front/
├── app.config.js          # Expo 설정 (환경 변수 포함)
├── supabase.js            # Supabase 클라이언트 초기화
├── app/
│   └── home/
│       └── index.tsx      # Supabase 예제 코드 포함
└── .env                   # 환경 변수 (선택사항)
```

## 문제 해결

### 연결 오류가 발생하는 경우:
1. SUPABASE_URL과 SUPABASE_ANON_KEY가 올바른지 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. 네트워크 연결 상태 확인
4. 콘솔 로그에서 구체적인 오류 메시지 확인

### 데이터가 표시되지 않는 경우:
1. profiles 테이블이 존재하는지 확인
2. RLS 정책이 올바르게 설정되어 있는지 확인
3. 인증된 사용자인지 확인 (필요한 경우)

