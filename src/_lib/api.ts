// src/_lib/api.ts

export const API_BASE = 'https://gamttori-back0917.vercel.app/api';

// 백엔드 연결 제어 설정
export const API_CONFIG = {
  // 백엔드 연결을 사용할지 여부 (true로 설정하여 백엔드 연결 활성화)
  ENABLE_BACKEND: true, // ← 이 값을 true로 설정하여 백엔드 연결 활성화
  
  // 연결 타임아웃 (밀리초) - 폰에서는 더 길게 설정
  TIMEOUT: 20000,
  
  // 재시도 횟수
  RETRY_COUNT: 3,
};

// API 호출 래퍼 함수
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_CONFIG.ENABLE_BACKEND) {
    throw new Error('백엔드 연결이 비활성화되어 있습니다. 캐시를 사용하세요.');
  }

  const url = `${API_BASE}${endpoint}`;
  console.log('API 호출:', url);
  console.log('요청 옵션:', options);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    console.log('API 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = errorData.error || errorData.message || response.statusText;
        console.error('API 오류 응답:', errorData);
      } catch {
        errorText = await response.text();
        console.error('API 오류 응답 (텍스트):', errorText);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API 응답 데이터:', data);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('API 호출 오류:', error);
    
    // 폰에서의 네트워크 에러를 더 자세히 처리
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요. 인터넷 연결 상태를 확인하고 다시 시도해주세요.');
      } else if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
      }
    }
    
    throw error;
  }
}

// 인증 토큰을 포함한 API 호출 함수
export async function apiCallWithAuth<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
}

// ===== 시 관련 API =====
export interface Poem {
  id: number;
  day: number;
  date: string;
  title: string;
  author: string;
  content: string;
  source?: string;
}

export const poemApi = {
  // 모든 시 목록 조회
  async getAllPoems(): Promise<{ success: boolean; data: Poem[]; count: number; message: string }> {
    return apiCall('/poems');
  },

  // 특정 일차의 시 조회
  async getPoemByDay(day: number): Promise<{ success: boolean; data: Poem; message: string }> {
    return apiCall(`/poems/day/${day}`);
  },

  // 오늘의 시 조회
  async getTodayPoem(): Promise<{ success: boolean; data: Poem; message: string }> {
    return apiCall('/poems/today');
  },

  // 특정 일차의 질문 조회
  async getQuestionsByDay(day: number): Promise<{ success: boolean; data: any[]; count: number; message: string }> {
    return apiCall(`/poems/questions-by-day/${day}`);
  },
};

// ===== 사용자 관련 API =====
export interface User {
  userId: number;
  email: string;
  nickname: string;
  userCode: string;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

export const userApi = {
  // 회원가입
  async register(email: string, password: string, nickname: string): Promise<RegisterResponse> {
    return apiCall('/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nickname }),
    });
  },

  // 로그인
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiCall('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // 프로필 조회
  async getProfile(token: string): Promise<{ success: boolean; message: string; data: User }> {
    return apiCallWithAuth('/users/profile', token);
  },
};

// ===== 기분 관련 API =====
export interface MoodData {
  id: string;
  userId: number;
  date: string;
  mood: number;
  createdAt: string;
  updatedAt: string;
}

export const moodApi = {
  // 기분 기록 생성/업데이트
  async createOrUpdateMood(userId: number, date: string, mood: number): Promise<MoodData> {
    return apiCall('/moods', {
      method: 'POST',
      body: JSON.stringify({ userId, date, mood }),
    });
  },

  // 사용자의 기분 기록 조회
  async getMoodsByUserId(userId: number): Promise<MoodData[]> {
    return apiCall(`/moods/user/${userId}`);
  },

  // 30일간 기분 시계열 데이터 조회
  async getMoodTimeSeries(userId: number): Promise<{ success: boolean; data: any[] }> {
    return apiCall(`/moods/timeseries/${userId}`);
  },

  // 주별 평균 기분 데이터 조회
  async getWeeklyMoodAverage(userId: number): Promise<{ success: boolean; data: any[] }> {
    return apiCall(`/moods/weekly/${userId}`);
  },
};

// ===== 기록 관련 API =====
export interface RecordData {
  id: number;
  day: number;
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface RecordWithContent {
  day: number;
  poem: Poem | null;
  question: any | null;
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
}

export const recordApi = {
  // 특정 일차의 기록 조회 (시, 질문, 답변 포함)
  async getRecordByDay(day: number, token: string): Promise<{ success: boolean; data: RecordWithContent }> {
    return apiCallWithAuth(`/records/${day}`, token);
  },

  // 특정 일차의 답변 저장/수정
  async updateRecordByDay(day: number, answers: Array<{ questionId: string; answer: string }>, token: string): Promise<{ success: boolean; message: string; data: RecordWithContent }> {
    return apiCallWithAuth(`/records/${day}`, token, {
      method: 'PUT',
      body: JSON.stringify({ answers }),
    });
  },

  // 사용자의 모든 답변 기록 조회
  async getAnswers(token: string): Promise<{ success: boolean; data: RecordData[]; count: number; message: string }> {
    return apiCallWithAuth('/records/answers/all', token);
  },

  // 특정 일차의 답변만 조회
  async getAnswerByDay(day: number, token: string): Promise<{ success: boolean; data: RecordData; message: string }> {
    return apiCallWithAuth(`/records/answers/${day}`, token);
  },
};

// ===== 스토리 비디오 관련 API =====
export interface StoryVideo {
  day: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  duration: number | null;
  createdAt: string;
}

export const storyVideoApi = {
  // 모든 스토리 비디오 목록 조회
  async getAllVideos(): Promise<{ success: boolean; data: StoryVideo[]; count: number; message: string }> {
    return apiCall('/story-videos');
  },

  // 오늘의 스토리 비디오 조회
  async getTodayVideo(): Promise<{ success: boolean; data: StoryVideo; message: string }> {
    return apiCall('/story-videos/today');
  },

  // 특정 일차의 스토리 비디오 조회
  async getVideoByDay(day: number): Promise<{ success: boolean; data: StoryVideo; message: string }> {
    return apiCall(`/story-videos/${day}`);
  },

  // 스토리 비디오 메타데이터 조회
  async getVideoMeta(): Promise<{ success: boolean; data: any; message: string }> {
    return apiCall('/story-videos/meta/info');
  },
};