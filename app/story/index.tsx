// app/story/page.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
// import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ImageBackground,
    LayoutChangeEvent,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
// @ts-ignore
import { ResizeMode, Video } from 'expo-av';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG, storyVideoApi, type StoryVideo } from '../../src/_lib/api';
import { useProgress } from '../../store/progress';
import CustomText from '../_components/CustomText';

const STONE_IMAGE = require('../../assets/images/stone.png');
const DAYS_PER_STONE = 3;   // 3일차 단위로 언락

// 지그재그로 따라가는 10개 위치 (1번이 가장 아래 중앙)
const POSITIONS = [
  // 1번 돌 (가장 아래 중앙)
  { xPct: 0.50, yPct: 0.95 },
  
  // 2번 돌 (1번보다 조금 위, 왼쪽)
  { xPct: 0.35, yPct: 0.88 },
  
  // 3번 돌 (2번보다 조금 위, 오른쪽)
  { xPct: 0.27, yPct: 0.81 },
  
  // 4번 돌 (3번보다 조금 위, 왼쪽)
  { xPct: 0.35, yPct: 0.74 },
  
  // 5번 돌 (4번보다 조금 위, 오른쪽)
  { xPct: 0.50, yPct: 0.67 },
  
  // 6번 돌 (5번보다 조금 위, 왼쪽)
  { xPct: 0.60, yPct: 0.60 },
  
  // 7번 돌 (6번보다 조금 위, 오른쪽)
  { xPct: 0.75, yPct: 0.54 },
  
  // 8번 돌 (7번보다 조금 위, 왼쪽)
  { xPct: 0.60, yPct: 0.49 },
  
  // 9번 돌 (8번보다 조금 위, 오른쪽)
  { xPct: 0.40, yPct: 0.45 },
  
  // 10번 돌 (9번보다 조금 위, 왼쪽)
  { xPct: 0.23, yPct: 0.41 },
];

// 돌 크기 배열 (아래쪽일수록 더 크게, 원근법 적용)
const STONE_SIZES = [
  120, // 1번 돌 (가장 아래) - 가장 큼
  115, // 2번 돌
  110, // 3번 돌
  105,  // 4번 돌
  100,  // 5번 돌
  95,  // 6번 돌
  90,  // 7번 돌
  85,  // 8번 돌
  80,  // 9번 돌
  75,  // 10번 돌 (가장 위) - 가장 작음
];

type BlockProgress = {
  // blockIndex: 1~10 (1블록 = 1~3일, 2블록 = 4~6일, ...)
  blockIndex: number;
  reconstructed: boolean; // "시 재구성 완료" 여부
};

type Progress = {
  // 오늘이 몇 일차인지(선택): 나중에 백엔드에서 같이 줄 수 있음
  currentDay?: number;
  // 각 블록의 완료 상태
  blocks: BlockProgress[];
};

// 백엔드 연결 상태에 따라 스토리 비디오를 가져오는 함수
async function fetchStoryVideos(): Promise<StoryVideo[]> {
  // 백엔드 연결이 활성화되어 있으면 API 호출 시도
  if (API_CONFIG.ENABLE_BACKEND) {
    try {
      const response = await storyVideoApi.getAllVideos();
      if (response.success) {
        // 성공 시 캐시 업데이트
        await AsyncStorage.setItem('story_videos_cache', JSON.stringify(response.data));
        return response.data;
      }
    } catch (apiError) {
      console.warn('스토리 비디오 API 호출 실패:', apiError);
      // API 실패 시 캐시로 폴백
    }
  }
  
  // 백엔드 연결이 비활성화되었거나 API 호출이 실패한 경우 캐시 사용
  const cached = await AsyncStorage.getItem('story_videos_cache');
  if (cached) {
    const cachedData = JSON.parse(cached);
    if (!API_CONFIG.ENABLE_BACKEND) {
      console.log('백엔드 연결 비활성화: 캐시된 스토리 비디오를 사용합니다.');
    }
    return cachedData;
  }
  
  // 캐시도 없는 경우 기본 스토리 비디오 데이터 사용
  const defaultVideos: StoryVideo[] = [
    {
      day: 3,
      title: '3일차 스토리 (테스트)',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://gamttori-story-videos.s3.ap-northeast-2.amazonaws.com/최종본/thumbnails/1.jpg',
      description: '3일차 감정 여행 스토리 (테스트 비디오)',
      duration: null,
      createdAt: new Date().toISOString()
    },
    {
      day: 6,
      title: '6일차 스토리 (테스트)',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://gamttori-story-videos.s3.ap-northeast-2.amazonaws.com/최종본/thumbnails/2.jpg',
      description: '6일차 감정 여행 스토리 (테스트 비디오)',
      duration: null,
      createdAt: new Date().toISOString()
    }
  ];
  
  // 기본 데이터를 캐시에 저장
  await AsyncStorage.setItem('story_videos_cache', JSON.stringify(defaultVideos));
  return defaultVideos;
}

// 조건: 해당 일차에만 돌이 보이도록 설정
function isStoryUnlocked(storyVideos: StoryVideo[], stoneIdxZeroBased: number, userCurrentDay: number) {
  const blockIndex = stoneIdxZeroBased + 1; // 1~10
  const targetDay = blockIndex * DAYS_PER_STONE; // 3, 6, 9, 12, 15, 18, 21, 24, 27, 30
  
  // 해당 일차에만 돌이 보이도록 설정 (정확히 해당 일차일 때만)
  return userCurrentDay === targetDay;
}

export default function StoryPage() {
  const { token, initialized } = useAuth();
  const { currentDay } = useProgress();
  const [container, setContainer] = useState({ w: 0, h: 0 });
  const [storyVideos, setStoryVideos] = useState<StoryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<StoryVideo | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // 네트워크 연결 상태 확인 (임시로 비활성화)
  useEffect(() => {
    // NetInfo가 설치되면 활성화
    setIsConnected(true);
    console.log('현재 플랫폼:', Platform.OS);
    console.log('앱 상태 - initialized:', initialized, 'token:', token ? '존재' : '없음');
  }, []);

  // 로그인 체크는 나중에 처리 (일단 화면 표시)
  // useEffect(() => {
  //   if (initialized && !token) {
  //     console.log('로그인되지 않은 상태, 로그인 화면으로 이동');
  //     router.replace('/login');
  //   }
  // }, [initialized, token]);

  // 초기화 중이면 로딩 화면 표시
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
        <CustomText>로딩 중...</CustomText>
      </View>
    );
  }

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainer({ w: width, h: height });
  };

  const handleStonePress = (targetDay: number) => {
    const video = storyVideos.find(v => v.day === targetDay);
    if (video) {
      console.log('선택된 비디오:', video);
      console.log('비디오 URL:', video.videoUrl);
      
      // 네트워크 연결 확인
      if (!isConnected) {
        Alert.alert(
          '인터넷 연결 필요',
          '비디오를 재생하려면 인터넷 연결이 필요합니다.',
          [{ text: '확인' }]
        );
        return;
      }
      
      // URL 유효성 검사
      if (!video.videoUrl || !video.videoUrl.startsWith('http')) {
        Alert.alert(
          '비디오 오류',
          '비디오 URL이 유효하지 않습니다.',
          [{ text: '확인' }]
        );
        return;
      }
      
      setVideoError(null);
      setVideoLoading(true); // 로딩 상태를 true로 설정하여 로딩 화면 표시
      setSelectedVideo(video);
      setShowVideoModal(true);
    } else {
      console.log('비디오를 찾을 수 없습니다. targetDay:', targetDay);
      console.log('사용 가능한 비디오들:', storyVideos);
      Alert.alert(
        '비디오 없음',
        '해당 일차의 비디오를 찾을 수 없습니다.',
        [{ text: '확인' }]
      );
    }
  };

  const closeVideoModal = () => {
    // 기존 타임아웃 클리어
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
    setShowVideoModal(false);
    setSelectedVideo(null);
    setVideoError(null);
    setVideoLoading(false);
  };

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadingTimeout]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const videos = await fetchStoryVideos();
        if (mounted) setStoryVideos(videos);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/images/storybg.png')}
      style={styles.bg}
      imageStyle={styles.bgImage}
      resizeMode="cover"
      onLayout={onLayout}
    >
      <View style={styles.container}>
        {/* 타이틀 */}
        <View style={styles.headRow}>
          <CustomText weight="Bold" style={styles.title}>감또리 이야기</CustomText>
          <Image source={require('../../assets/images/gamttori_down.png')} style={styles.titleImg} />
        </View>

        {/* 서브타이틀 */}
        <CustomText style={styles.subtitle}>감또리의 숨겨진 이야기, 우리 같이 볼까요?</CustomText>

        {/* 안내 문구 */}
        <View style={styles.instructionBox}>
          <CustomText style={styles.instructionText}>
            3일마다 하나씩 돌멩이가 등장해요!{'\n'}
            돌멩이를 클릭해서 감또리 이야기를 들여다봐요
          </CustomText>
        </View>

        {/* 로딩 중 */}
        {loading && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator />
            <CustomText style={{ marginTop: 8 }}>스토리 비디오를 불러오는 중…</CustomText>
          </View>
        )}

        {/* 돌 10개: 스토리 비디오가 있고 사용자가 해당 일차에 도달한 것만 렌더 */}
        {!loading && container.w > 0 && POSITIONS.map((p, idx) => {
          if (!isStoryUnlocked(storyVideos, idx, currentDay)) {
            // 요구사항: 스토리 비디오가 있고 사용자가 해당 일차에 도달해야 "보이도록" ⇒ 조건 미충족시 아예 렌더하지 않음
            return null;
          }
          const stoneSize = STONE_SIZES[idx];
          const left = p.xPct * container.w - stoneSize / 2;
          const top  = p.yPct * container.h - stoneSize / 2;
          const labelText = String(idx + 1); // 1~10
          const targetDay = (idx + 1) * DAYS_PER_STONE; // 3, 6, 9, 12, 15, 18, 21, 24, 27, 30

          return (
            <Pressable
              key={`stone-${idx + 1}`}
              style={[styles.stoneWrap, { left, top, width: stoneSize, height: stoneSize }]}
              onPress={() => handleStonePress(targetDay)}
              android_ripple={{ color: '#e5e7eb' }}
              hitSlop={10}
            >
              <Image source={STONE_IMAGE} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              <View pointerEvents="none" style={styles.centerLabel}>
                <CustomText weight="Bold" style={styles.centerLabelText}>{labelText}</CustomText>
              </View>
            </Pressable>
          );
        })}

        {/* 비디오 모달 */}
        <Modal
          visible={showVideoModal}
          animationType="fade"
          transparent={true}
          onRequestClose={closeVideoModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedVideo && (
                <>
                  <View style={styles.videoHeader}>
                    <CustomText weight="Bold" style={styles.videoTitle}>
                      {selectedVideo.title}
                    </CustomText>
                    <Pressable onPress={closeVideoModal} style={styles.closeButton}>
                      <CustomText style={styles.closeButtonText}>✕</CustomText>
                    </Pressable>
                  </View>
                  
                  {videoLoading && (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#0ea5e9" />
                      <CustomText style={styles.loadingText}>비디오를 불러오는 중...</CustomText>
                      <CustomText style={styles.loadingSubText}>잠시만 기다려주세요 (최대 10초)</CustomText>
                    </View>
                  )}
                  
                  {videoError ? (
                    <View style={styles.errorContainer}>
                      <CustomText style={styles.errorText}>
                        비디오를 재생할 수 없습니다: {videoError}
                      </CustomText>
                      <CustomText style={styles.errorSubText}>
                        URL: {selectedVideo.videoUrl}
                      </CustomText>
                      <Pressable
                        onPress={() => {
                          setVideoError(null);
                          setVideoLoading(true);
                          // 비디오 재시도 시 모달을 다시 열기
                          if (selectedVideo) {
                            setShowVideoModal(false);
                            setTimeout(() => {
                              setShowVideoModal(true);
                            }, 100);
                          }
                        }}
                        style={styles.retryButton}
                      >
                        <CustomText style={styles.retryButtonText}>다시 시도</CustomText>
                      </Pressable>
                    </View>
                  ) : Platform.OS === 'web' ? (
                    <WebView
                      source={{ 
                        html: `
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                              body { margin: 0; padding: 0; background: #000; }
                              video { width: 100%; height: 100%; object-fit: contain; }
                            </style>
                          </head>
                          <body>
                            <video controls autoplay onerror="console.error('Video load error:', event)">
                              <source src="${selectedVideo.videoUrl}" type="video/mp4">
                              Your browser does not support the video tag.
                            </video>
                          </body>
                          </html>
                        `
                      }}
                      style={styles.videoPlayer}
                      allowsInlineMediaPlayback={true}
                      mediaPlaybackRequiresUserAction={false}
                      onError={(error) => {
                        console.error('WebView error:', error);
                        setVideoLoading(false);
                        setVideoError('웹 브라우저에서 비디오를 재생할 수 없습니다. 다른 방법으로 시도해주세요.');
                      }}
                    />
                  ) : (
                    <Video
                      source={{ 
                        uri: selectedVideo.videoUrl,
                        headers: {
                          'User-Agent': 'Mozilla/5.0 (compatible; GamttoriApp/1.0)',
                        }
                      }}
                      style={styles.videoPlayer}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={false}
                      isLooping={false}
                      progressUpdateIntervalMillis={1000}
                      positionMillis={0}
                      rate={1.0}
                      volume={1.0}
                      isMuted={false}
                      // 추가 최적화 설정
                      ignoreSilentSwitch="ignore"
                      playInBackground={false}
                      playWhenInactive={false}
                      onLoadStart={() => {
                        console.log('앱에서 비디오 로딩 시작:', selectedVideo.videoUrl);
                        setVideoLoading(true);
                        setVideoError(null); // 이전 오류 상태 클리어
                        
                        // 기존 타임아웃 클리어
                        if (loadingTimeout) {
                          clearTimeout(loadingTimeout);
                        }
                        
                        // 10초 타임아웃 설정
                        const timeout = setTimeout(() => {
                          console.log('비디오 로딩 타임아웃');
                          setVideoLoading(false);
                          setVideoError('비디오 로딩 시간이 초과되었습니다. 네트워크를 확인해주세요.');
                        }, 10000);
                        
                        setLoadingTimeout(timeout);
                      }}
                      onLoad={() => {
                        console.log('앱에서 비디오 로딩 완료');
                        // 타임아웃 클리어
                        if (loadingTimeout) {
                          clearTimeout(loadingTimeout);
                          setLoadingTimeout(null);
                        }
                        setVideoLoading(false);
                        setVideoError(null); // 로딩 완료 시 오류 상태 클리어
                      }}
                      onError={(error) => {
                        console.error('앱에서 Video error:', error);
                        // 타임아웃 클리어
                        if (loadingTimeout) {
                          clearTimeout(loadingTimeout);
                          setLoadingTimeout(null);
                        }
                        setVideoLoading(false);
                        
                        // 더 구체적인 오류 메시지 제공
                        let errorMessage = '앱에서 비디오 로딩 실패';
                        if (typeof error === 'string') {
                          errorMessage = `앱에서 비디오 로딩 실패: ${error}`;
                        } else if (error && typeof error === 'object') {
                          errorMessage = `앱에서 비디오 로딩 실패: ${error.message || '알 수 없는 오류'}`;
                        }
                        
                        setVideoError(errorMessage);
                      }}
                      onPlaybackStatusUpdate={(status) => {
                        if (status.isLoaded && 'error' in status && status.error) {
                          console.error('앱에서 Playback error:', status.error);
                          setVideoLoading(false);
                          
                          // 더 구체적인 재생 오류 메시지 제공
                          let errorMessage = '앱에서 비디오 재생 실패';
                          if (typeof status.error === 'string') {
                            errorMessage = `앱에서 비디오 재생 실패: ${status.error}`;
                          } else if (status.error && typeof status.error === 'object') {
                            errorMessage = `앱에서 비디오 재생 실패: ${status.error.message || '알 수 없는 오류'}`;
                          }
                          
                          setVideoError(errorMessage);
                        }
                      }}
                    />
                  )}
                  
                  {selectedVideo.description && (
                    <CustomText style={styles.videoDescription}>
                      {selectedVideo.description}
                    </CustomText>
                  )}
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImage: {
    width: '100%',
    height: '100%',
    // opacity: 0.95,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  title: { fontSize: 35, paddingTop: 40 },
  titleImg: { width: 100, height: 100, marginTop: 30, marginLeft: 10 },
  subtitle: { 
    fontSize: 18, 
    color: '#1a1a1a', 
    fontWeight: '600',
    textAlign: 'center', 
    marginTop: 8,
    marginBottom: 12,
  },
  instructionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFB347',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: 'MaruBuri-Regular',
  },

  stoneWrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabel: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabelText: {
    fontSize: 20,
    color: '#8B4513', // 어두운 갈색
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // 비디오 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  videoTitle: {
    fontSize: 20,
    flex: 1,
    marginRight: 12,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoDescription: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubText: {
    color: '#7f1d1d',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
    fontFamily: 'MaruBuri-Regular',
  },
  loadingSubText: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'MaruBuri-Regular',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'MaruBuri-SemiBold',
  },
});
