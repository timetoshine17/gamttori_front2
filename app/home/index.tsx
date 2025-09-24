// app/home/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import CustomText from '../_components/CustomText';
import { useAuth } from '../_providers/AuthProvider';
import MoodModal from './mood';

export default function Home() {
  const { token, initialized } = useAuth();
  const [count, setCount] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [greeting, setGreeting] = useState('만나서 반가워요!');

  // 랜덤 인사말 배열
  const greetings = [
    '만나서 반가워요!',
    '안녕하세요! 오늘도 좋은 하루에요!',
    '어떤 하루를 보내고 계신가요?',
    '오늘도 감또리와 함께해요!',
    '기분이 어떤가요?',
    '오늘은 어떤 이야기를 나눌까요?',
    '반가워요! 오늘 하루는 어땠나요?',
    '안녕! 오늘도 힘내요!',
    '어떤 기분으로 하루를 시작하셨나요?',
    '오늘도 함께해요!',
    '안녕하세요! 오늘은 어떤 하루인가요?',
    '반가워요! 오늘 기분은 어떤가요?'
  ];

  // 로그인 확인
  useEffect(() => {
    if (initialized && !token) {
      router.replace('/login/login');
    }
  }, [initialized, token]);

  if (!initialized || !token) {
    return null;
  }

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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },

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
   settingsText: { fontSize: 20 },

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
    marginBottom: 120,
  },
  mascot: { width: 200, height: 200 },

   // 답변 말풍선
   replyBubble: {
     position: 'absolute',
     bottom: 350,
     left: 20,
     right: 20,
     backgroundColor: '#fff',
     borderRadius: 20,
     paddingHorizontal: 20,
     paddingVertical: 15,
     shadowColor: '#000',
     shadowOpacity: 0.15,
     shadowOffset: { width: 2, height: 2 },
     shadowRadius: 8,
     elevation: 5,
     maxWidth: '80%',
     alignSelf: 'center',
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
     right: 30,
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
