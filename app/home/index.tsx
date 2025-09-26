// app/home/page.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import StoryModal from '../../components/StoryModal';
import { useAuth } from '../../context/AuthContext';
import { GAMTORI_DAYS } from '../../data/gamttoriDays';
import { useProgress } from '../../store/progress';
import CustomText from '../_components/CustomText';
import MoodModal from './mood';

export default function HomePage() {
  const { token, initialized } = useAuth();
  const { lastShownDate, setShown, currentDay } = useProgress();
  const [count, setCount] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [greeting, setGreeting] = useState('만나서 반가워요!');

  // 디버깅을 위한 로그
  useEffect(() => {
    console.log('홈 페이지 렌더링됨');
    console.log('initialized:', initialized);
    console.log('token:', token ? '존재함' : '없음');
    console.log('AuthProvider가 정상적으로 작동 중입니다!');
  }, [initialized, token]);

  // 로그인 페이지로 리다이렉트 처리
  useEffect(() => {
    if (initialized && !token) {
      console.log('토큰이 없어서 로그인 페이지로 리다이렉트');
      // 약간의 지연을 두어 무한 리다이렉트 방지
      const timer = setTimeout(() => {
        router.replace('/login');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialized, token]);

  // 랜덤 인사말 배열
  const greetings = [
    '오늘 하루도 충분히 잘해내셨어요.',
    '오늘 마음속에 떠오르는 노래가 있나요?',
    '오늘 떠오른 생각 중 잊고 싶지 않은 건 무엇인가요?',
    '오늘도 감또리랑 행복한 시간을 보내요!',
    '지금 창밖 풍경은 어떤가요?',
    '오늘도 당신이 있어 세상이 더 빛나요.',
    '어떤 하루를 보내고 계신가요?',
    '힘들 땐 감또리가 옆에 있을게요.',
    '당신은 충분히 잘하고 있어요.',
    '오늘 하루의 소소한 행복은 뭐였나요?',
    '오랜만이에요! 잘 지내셨나요?',
    '오늘도 당신의 하루를 응원해요!',
    '당신의 이야기가 감또리에게는 선물 같아요.',
    '오늘도 함께해요!',
    '오늘 마음을 울린 말 한마디가 있나요?',
    '만나서 반가워요!',
    '오늘 작은 목표는 무엇인가요?',
    '오늘도 마음을 나눠줘서 고마워요.',
    '오늘 하루 중 가장 기억에 남는 순간은 언제인가요?',
    '오늘은 어떤 마음으로 살아가고 싶으신가요?',
    '오늘도 새로운 하루가 시작됐네요!',
    '안녕하세요! 오늘은 어떤 하루였나요?',
    '당신의 하루는 소중해요.',
    '오늘 웃었던 순간이 있었나요?',
    '요즘 가장 기다려지는 순간은 언제인가요?',
    '행복으로 가득한 하루 되시길 바라요!',
    '오늘은 어제보다 더 따뜻한 하루가 되길 바라요.',
    '오늘 스스로를 칭찬하고 싶은 일은 무엇인가요?',
    '반가워요! 오늘 하루는 어땠나요?',
    '오늘 스스로에게 해주고 싶은 말은 무엇인가요?',
    '오늘 누군가와 나눈 대화 중 가장 따뜻했던 말은 무엇인가요?',
    '안녕하세요! 감또리가 기다렸어요.',
    '반가워요! 지금 마음은 편안하신가요?',
    '지금 기분을 색깔로 표현하면 어떤 색일까요?',
    '지금 떠올리고 싶은 사람이 있나요?',
    '오늘 하루는 어떤 색으로 빛나고 있나요?',
    '힘들 때 잠시 쉬어가도 괜찮아요.',
    '반가워요! 오늘 기분은 어떤가요?',
    '오늘은 어떤 이야기를 나눌까요?',
    '오늘 가장 감사한 순간은 무엇이었나요?',
    '오늘 하루 중 고마움을 느낀 순간이 있었나요?',
    '오늘 하루는 감또리와 함께해요!',
    '지금 가장 듣고 싶은 말은 무엇인가요?',
    '오늘 하루도 보람찬 하루를 보냈나요?',
    '작은 한 걸음이 모여 큰 길이 돼요.',
    '오늘 하루를 한 단어로 표현한다면 어떤 말이 어울릴까요?',
    '안녕하세요! 오늘도 힘내요!',
    '스스로를 믿고 한 발짝 나아가 보아요.',
    '안녕하세요! 오늘도 좋은 하루예요!',
    '오늘은 어떤 기분으로 하루를 시작하셨나요?'
  ];

  // n일차 계산 (가입일 기준)
  useEffect(() => {
    (async () => {
      try {
        // 가입일 가져오기
        const joinDateStr = await AsyncStorage.getItem('user_join_date');
        let joinDate: Date;
        
        if (joinDateStr) {
          joinDate = new Date(joinDateStr);
        } else {
          // 가입일이 없으면 오늘을 가입일로 설정
          joinDate = new Date();
          await AsyncStorage.setItem('user_join_date', joinDate.toISOString());
        }
        
        // 오늘과 가입일의 차이 계산
        const today = new Date();
        const timeDiff = today.getTime() - joinDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        // 최소 1일차로 설정
        const dayCount = Math.max(1, daysDiff);
        setCount(dayCount);
        
        // 기존 gamttori_count도 업데이트 (호환성을 위해)
        await AsyncStorage.setItem('gamttori_count', String(dayCount));
      } catch (error) {
        console.error('일차 계산 오류:', error);
        // 오류 시 기본값
        setCount(1);
      }
    })();
  }, []);

  // 사용자 정보 불러오기
  useEffect(() => {
    (async () => {
      const userInfoStr = await AsyncStorage.getItem('user_info');
      if (userInfoStr) {
        setUserInfo(JSON.parse(userInfoStr));
      }
    })();
  }, [token]);

  // 랜덤 인사말 선택 함수
  const selectRandomGreeting = () => {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    setGreeting(greetings[randomIndex]);
  };

  // 컴포넌트 마운트 시 랜덤 인사말 선택
  useEffect(() => {
    selectRandomGreeting();
  }, []);

  // 주기적으로 인사말 변경 (30초마다)
  useEffect(() => {
    const interval = setInterval(selectRandomGreeting, 30000);
    return () => clearInterval(interval);
  }, []);

  // 스토리 모달 표시 로직
  useEffect(() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      if (lastShownDate !== today) {
        console.log('스토리 모달 표시:', { lastShownDate, today });
        setShowStoryModal(true);
        setShown(today);
      }
    } catch (error) {
      console.error('스토리 모달 표시 오류:', error);
    }
  }, [lastShownDate, setShown]);

  // 현재 일차에 해당하는 스토리 데이터 찾기 (count 값 사용)
  const todayData = GAMTORI_DAYS.find((d) => d.day === count);

  // 로딩 중이거나 인증되지 않은 경우 처리
  if (!initialized) {
    return (
      <View style={styles.loadingContainer}>
        <CustomText style={styles.loadingText}>로딩 중...</CustomText>
      </View>
    );
  }

  if (!token) {
    return null; // 리다이렉트가 useEffect에서 처리됨
  }

  return (
    <ImageBackground 
      source={require('../../assets/images/homebg.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      {/* 상단 타이틀 */}
      <View style={styles.header}>
        <CustomText weight="Bold" style={styles.title}>감또리네</CustomText>
        <CustomText weight="Regular" style={styles.subtitle}>
          {userInfo?.nickname || '000'}님과 함께한 지 {count}일차
        </CustomText>
      </View>

      {/* 설정 버튼 */}
      <Pressable
        style={styles.settingsButton}
        onPress={() => router.push('/settings/Settings')}
        android_ripple={{ color: '#d1d5db' }}
      >
        <CustomText style={styles.settingsText}>⚙️</CustomText>
      </Pressable>

      {/* 말풍선 버튼 */}
      <View style={styles.bubbleButtons}>
         <Pressable 
           style={styles.bubble} 
           onPress={() => setShowMoodModal(true)}
         >
           <Image 
             source={require('../../assets/images/smile.png')}
             style={styles.bubbleIcon}
             resizeMode="contain"
           />
           <CustomText style={styles.bubbleText}> 오늘 기분이 어때요?</CustomText>
         </Pressable>

         <Pressable 
           style={styles.bubble} 
           onPress={() => router.push('/home/poem')}
         >
           <Image 
             source={require('../../assets/images/book.png')}
             style={styles.bubbleIcon}
             resizeMode="contain"
           />
           <CustomText style={styles.bubbleText}> 시를 읽어볼까요?</CustomText>
         </Pressable>
      </View>

      {/* 중앙 캐릭터 */}
      <View style={styles.mascotContainer}>
        <Image
          source={require('../../assets/images/gamttori.png')}
          style={styles.mascot}
          resizeMode="contain"
        />
      </View>

      {/* 말풍선 답변 */}
      <View style={styles.replyBubble}>
        <CustomText style={styles.replyText}>{greeting}</CustomText>
        <View style={styles.bubbleTail} />
      </View>

      {/* Mood 모달 */}
      <MoodModal
        visible={showMoodModal}
        onClose={() => setShowMoodModal(false)}
      />

      {/* 스토리 모달 */}
      {todayData && (
        <StoryModal
          visible={showStoryModal}
          onClose={() => {
            try {
              console.log('스토리 모달 닫기');
              setShowStoryModal(false);
            } catch (error) {
              console.error('스토리 모달 닫기 오류:', error);
              setShowStoryModal(false);
            }
          }}
          day={todayData}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },

  // 로딩 스타일
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'MaruBuri-Regular',
  },

   // 헤더
   header: {
     marginTop: 80,
     alignItems: 'center',
   },
   title: { 
     fontSize: 32, 
     color: '#000',
     fontFamily: 'MaruBuri-Bold',
   },
   subtitle: { 
     fontSize: 16, 
     color: '#333', 
     marginTop: 8, 
     textAlign: 'center',
     fontFamily: 'MaruBuri-Regular',
   },

   // 설정 버튼
   settingsButton: {
     position: 'absolute',
     top: 60,
     right: 20,
     width: 40,
     height: 40,
     borderRadius: 20,
     backgroundColor: 'rgba(243, 244, 246, 0.8)',
     justifyContent: 'center',
     alignItems: 'center',
     zIndex: 1,
   },
   settingsText: { 
     fontSize: 20,
     fontFamily: 'MaruBuri-Regular',
   },

  // 말풍선 버튼
  bubbleButtons: {
    position: 'absolute',
    left: 20,
    top: 200,
    gap: 12,
  },
   bubble: {
     backgroundColor: '#fff',
     borderRadius: 20,
     paddingHorizontal: 16,
     paddingVertical: 10,
     shadowColor: '#000',
     shadowOpacity: 0.1,
     shadowOffset: { width: 1, height: 1 },
     shadowRadius: 3,
     elevation: 2,
     flexDirection: 'row',
     alignItems: 'center',
     gap: 8,
   },
   bubbleText: { 
     fontSize: 20, 
     color: '#000',
     fontFamily: 'MaruBuri-SemiBold',
   },
   bubbleIcon: {
     width: 30,
     height: 30,
   },

  // 캐릭터
  mascotContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 120, // 180 -> 120으로 줄여서 캐릭터를 아래로 이동
    alignItems: 'flex-end', // 오른쪽 정렬 추가
    paddingRight: 20, // 오른쪽 여백 추가
  },
  mascot: { width: 200, height: 200 },

   // 답변 말풍선
   replyBubble: {
     position: 'absolute',
     bottom: 280, // 350 -> 280으로 아래로 이동
     left: 20,
     right: '50%', // right: 20 -> right: '50%'로 변경하여 왼쪽 절반만 사용
     backgroundColor: '#fff',
     borderRadius: 20,
     paddingHorizontal: 20,
     paddingVertical: 15,
     shadowColor: '#000',
     shadowOpacity: 0.15,
     shadowOffset: { width: 2, height: 2 },
     shadowRadius: 8,
     elevation: 5,
     maxWidth: '45%', // 80% -> 45%로 줄여서 왼쪽에만 위치
     alignSelf: 'flex-start', // center -> flex-start로 변경하여 왼쪽 정렬
   },
   replyText: { 
     fontSize: 18, 
     color: '#000',
     fontFamily: 'MaruBuri-SemiBold',
     textAlign: 'center',
     lineHeight: 24,
   },
   bubbleTail: {
     position: 'absolute',
     bottom: -8,
     right: 20, // 30 -> 20으로 조정하여 왼쪽 정렬에 맞게
     width: 0,
     height: 0,
     borderLeftWidth: 12,
     borderRightWidth: 12,
     borderTopWidth: 12,
     borderLeftColor: 'transparent',
     borderRightColor: 'transparent',
     borderTopColor: '#fff',
   },

});
