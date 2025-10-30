import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG, poemApi, recordApi, type Poem } from '../../src/_lib/api';
import AdvancedSTTButton from '../_components/AdvancedSTTButton';
import Button from '../_components/Button';
import Card from '../_components/Card';
import CustomText from '../_components/CustomText';
import PoemTTSButton from '../_components/PoemTTSButton';
import TextArea from '../_components/TextArea';
import TTSButton from '../_components/TTSButton';

type Step = 0 | 1;

export default function Poem() {
  const { step: urlStep } = useLocalSearchParams<{ step?: string }>();
  const { token } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [answer, setAnswer] = useState('');
  const [poem, setPoem] = useState<Poem | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null); // 저장 메시지 상태
  const [currentDay, setCurrentDay] = useState(1); // 현재 일차 상태

  const titles = useMemo(
    () => ['읽기', '답변하기'],
    []
  );

  // URL 파라미터로 받은 step 설정
  useEffect(() => {
    if (urlStep === '1') {
      setStep(1);
    }
  }, [urlStep]);

  // 현재 일차 계산
  useEffect(() => {
    const calculateCurrentDay = async () => {
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
        setCurrentDay(dayCount);
        
        console.log('시 페이지 일차 계산:', { joinDate, today, daysDiff, dayCount });
      } catch (error) {
        console.error('일차 계산 오류:', error);
        setCurrentDay(1);
      }
    };

    calculateCurrentDay();
  }, []);

  useEffect(() => {
    const fetchPoem = async () => {
      try {
        setLoading(true);
        
        // 백엔드 연결이 활성화되어 있으면 API 호출 시도
        if (API_CONFIG.ENABLE_BACKEND) {
          try {
            const [poemResponse, questionsResponse] = await Promise.all([
              poemApi.getPoemByDay(currentDay), // 현재 일차 시 요청
              poemApi.getQuestionsByDay(currentDay) // 현재 일차 질문
            ]);
            
            if (!poemResponse.success) throw new Error('오늘의 시 로드 실패');
            if (!questionsResponse.success) throw new Error('질문 로드 실패');

            setPoem(poemResponse.data);
            // 질문 데이터가 단일 객체인 경우 배열로 변환
            const questionData = questionsResponse.data;
            const questionsArray = Array.isArray(questionData) ? questionData : [questionData];
            setQuestions(questionsArray);
            
            // 디버깅용 로그
            console.log('시 데이터:', poemResponse.data);
            console.log('질문 데이터:', questionsResponse.data);
            console.log('질문 배열:', questionsArray);
            
            // 성공 시 캐시 업데이트
            await AsyncStorage.setItem('poem_today_cache', JSON.stringify(poemResponse.data));
            await AsyncStorage.setItem('questions_today_cache', JSON.stringify(questionsResponse.data || []));
            return; // 성공하면 함수 종료
          } catch (apiError) {
            console.warn('API 호출 실패:', apiError);
            // API 실패 시 캐시로 폴백
          }
        }
        
        // 백엔드 연결이 비활성화되었거나 API 호출이 실패한 경우 캐시 사용
        const [cachedPoem, cachedQuestions] = await Promise.all([
          AsyncStorage.getItem('poem_today_cache'),
          AsyncStorage.getItem('questions_today_cache')
        ]);
        
        if (cachedPoem) {
          setPoem(JSON.parse(cachedPoem));
          if (cachedQuestions) {
            setQuestions(JSON.parse(cachedQuestions));
          }
          if (!API_CONFIG.ENABLE_BACKEND) {
            console.log('백엔드 연결 비활성화: 캐시된 시를 사용합니다.');
          } else {
            Alert.alert('오프라인', '서버 연결에 실패해 캐시된 시를 불러왔어요.');
          }
        } else {
          // 캐시도 없는 경우 기본 시 데이터 사용
          const defaultPoem: Poem = {
            id: 0,
            day: currentDay,
            date: new Date().toISOString(),
            title: '기본 시',
            author: '감또리',
            content: '오늘도 좋은 하루 되세요.\n감또리와 함께하는\n아름다운 시간입니다.',
            source: '감또리 앱'
          };
          setPoem(defaultPoem);
          await AsyncStorage.setItem('poem_today_cache', JSON.stringify(defaultPoem));
          Alert.alert('알림', '기본 시를 표시합니다.');
        }
      } catch (e) {
        console.error('시 로딩 오류:', e);
        Alert.alert('오류', '시를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    };

    fetchPoem();
  }, [currentDay]);

  const goNext = () => setStep(s => (s < 1 ? ((s + 1) as Step) : s));
  const goPrev = () => {
    if (step === 0) {
      // 첫 번째 스텝(읽기)에서 이전 버튼을 클릭하면 홈화면으로 이동
      router.replace('/home');
    } else {
      // 두 번째 스텝(답변하기)에서 이전 버튼을 클릭하면 이전 스텝으로 이동
      setStep(0);
    }
  };

  const saveAnswer = async () => {
    console.log('저장 버튼 클릭됨!');
    
    // 이미 저장 중이면 중복 실행 방지
    if (saveMessage) return;
    
    try {
      console.log('토큰 확인:', token ? '있음' : '없음');
      
      // 백엔드 연결이 활성화되어 있고 로그인된 사용자인 경우 API 호출 시도
      if (API_CONFIG.ENABLE_BACKEND && token) {
        console.log('백엔드에 답변 저장 시도...');
        try {
          // 답변 데이터 준비
          const answers = [{
            questionId: questions.length > 0 ? questions[0].id : '1',
            answer: answer.trim()
          }];

          // 백엔드에 답변 저장
          const response = await recordApi.updateRecordByDay(
            currentDay, 
            answers, 
            token
          );

          if (response.success) {
            console.log('백엔드 저장 성공!');
            // 로컬 캐시도 업데이트
            await AsyncStorage.setItem('poem_answer', answer.trim());
            await AsyncStorage.setItem(`poem_answer_${currentDay}`, answer.trim());
            
            // 성공 메시지 표시
            setSaveMessage('✨ 저장되었습니다!');
            setTimeout(() => setSaveMessage(null), 3000);
            return;
          } else {
            console.warn('백엔드 저장 실패:', response);
            throw new Error('저장 실패');
          }
        } catch (apiError) {
          console.warn('API 저장 실패:', apiError);
          // API 실패 시 로컬 저장으로 폴백
        }
      }
      
      // 로그인하지 않은 사용자이거나 API 호출이 실패한 경우 로컬 저장
      console.log('로컬에만 답변 저장...');
      await AsyncStorage.setItem('poem_answer', answer.trim());
      await AsyncStorage.setItem(`poem_answer_${currentDay}`, answer.trim());
      console.log('로컬 저장 완료!');
      
      // 화면에 성공 메시지 표시 (로컬 저장임을 명시)
      setSaveMessage(token ? '⚠️ 로컬에만 저장되었습니다.' : '✨ 저장되었습니다!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('저장 오류:', error);
      setSaveMessage('❌ 저장 중 오류가 발생했습니다.');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };
  const saveAnswerAndFinish = async () => {
    try {
      // 답변 저장
      await saveAnswer();
      
      // 카운트 증가
      const raw = await AsyncStorage.getItem('gamttori_count');
      const n = parseInt(raw || '0', 10) || 0;
      await AsyncStorage.setItem('gamttori_count', String(Math.min(n + 1, 30)));
      
      // 성공 메시지 표시 (Alert 대신 인라인 메시지 사용)
      setSaveMessage('🎉 완료되었습니다! 홈으로 이동합니다...');
      setTimeout(() => {
        setSaveMessage(null);
        router.replace('/home');
      }, 2000);
    } catch (error) {
      console.error('답변 저장 오류:', error);
      setSaveMessage('❌ 저장 중 오류가 발생했습니다.');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <CustomText weight="Bold" style={styles.header}>
          {titles[step]} {poem ? `· ${poem.title} (${poem.author})` : ''}
        </CustomText>

        {/* 로딩 표시 */}
        {loading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        )}

        {/* STEP 0: 오늘의 시 보기 */}
        {step === 0 && !!poem && !loading && (
          <Card style={styles.card}>
            <View style={styles.poemHeader}>
              <CustomText weight="Bold" style={styles.bigText}>
                {poem.title} — {poem.author}{'\n\n'}
              </CustomText>
              <PoemTTSButton 
                day={poem?.day || 1}
                disabled={!poem}
              />
            </View>
            <CustomText weight="Medium" style={{ fontSize: 18, lineHeight: 28 }}>
              {poem.content}
            </CustomText>
            {!!poem.source && (
              <CustomText style={{ marginTop: 16, color: '#6b7280' }}>
                출처: {poem.source}
              </CustomText>
            )}
          </Card>
        )}


        {/* STEP 1: 답변하기 */}
        {step === 1 && (
          <Card style={styles.card}>
            <View style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <CustomText weight="Bold" style={styles.questionText}>
                  {questions.length > 0 ? `Q. ${questions[0].question}` : 'Q. 오늘은 어떤 하루를 보내셨나요?'}
                </CustomText>
                <View style={styles.rightSection}>
                  <TTSButton 
                    text={questions.length > 0 ? questions[0].question : '오늘은 어떤 하루를 보내셨나요?'}
                    disabled={false}
                  />
                  <Image 
                    source={require('../../assets/images/gamttori_question.png')} 
                    style={styles.questionImage} 
                  />
                </View>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <TextArea 
                placeholder="답변을 말하거나 입력해주세요" 
                value={answer} 
                onChangeText={setAnswer} 
                style={styles.textArea} 
              />
              <View style={styles.sttContainer}>
                <AdvancedSTTButton 
                  onResult={(text) => {
                    setAnswer(prev => prev + (prev ? ' ' : '') + text);
                  }}
                  disabled={false}
                  style={styles.sttButton}
                />
              </View>
            </View>
            <View style={styles.rowGap}>
              <Button 
                title="저장하기" 
                onPress={saveAnswerAndFinish}
                size="lg" 
              />
              <Button 
                title="홈화면으로가기" 
                variant="ghost" 
                size="lg" 
                onPress={() => router.replace('/home')} 
              />
            </View>
            {saveMessage && (
              <View style={styles.saveMessageContainer}>
                <View style={styles.saveMessageBox}>
                  <CustomText style={styles.saveMessageText}>
                    {saveMessage}
                  </CustomText>
                </View>
              </View>
            )}
          </Card>
        )}
      </ScrollView>

      {/* ▼ 하단 네비게이션: 이전 / (진행도) / 다음  */}
      <View style={styles.bottomBar}>
        <Button
          title="이전"
          variant="ghost"
          size="xl"
          onPress={goPrev}
          style={styles.navBtn}
        />
        <CustomText style={styles.progress}>{step + 1} / 2</CustomText>
        <Button
          title="다음"
          variant="ghost"            // ← 이전과 동일한 스타일
          size="xl"                  // ← 크게
          onPress={goNext}
          disabled={step === 1}
          style={[styles.navBtn, { alignSelf: 'flex-end' }, step === 1 && { opacity: 0.5 }]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f6f7' }, // 상단 잘림 방지
  container: { padding: 16, paddingBottom: 100 }, // 바닥 바 높이만큼 여유
  header: { fontSize: 16, color: '#6b7280', marginBottom: 12 },
  card: { paddingBottom: 14, width: '100%', height: 700, },
  bigText: { fontSize: 30, lineHeight: 30, marginBottom: 12 },
  poemHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  rowGap: { flexDirection: 'row', gap: 12, marginTop: 12, alignSelf: 'flex-end' },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f6f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  navBtn: { width: '10%' }, // 두 버튼이 커지도록
  progress: { fontSize: 14, color: '#6b7280' },
  
  // 질문 섹션 스타일
  questionContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  questionText: {
    fontSize: 28,
    lineHeight: 36,
    flex: 1,
    marginRight: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionImage: {
    width: 60,
    height: 70,
  },
  
  // 저장 메시지 스타일
  saveMessageContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  saveMessageBox: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0ea5a4',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#0ea5a4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 200,
    alignItems: 'center',
  },
  saveMessageText: {
    color: '#0ea5a4',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // STT 관련 스타일
  inputContainer: {
    marginTop: 4,
  },
  textArea: {
    height: 400,
  },
  sttContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  sttButton: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
});
