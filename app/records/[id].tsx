import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG, poemApi, recordApi, type Poem } from '../../src/_lib/api';
import AdvancedSTTButton from '../_components/AdvancedSTTButton';
import Button from '../_components/Button';
import Card from '../_components/Card';
import CustomText from '../_components/CustomText';
import PoemTTSButton from '../_components/PoemTTSButton';
import TextArea from '../_components/TextArea';
import TTSButton from '../_components/TTSButton';

export default function RecordDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [answer, setAnswer] = useState('');
  const [poemData, setPoemData] = useState<Poem | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showPoemModal, setShowPoemModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAnswer, setEditAnswer] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      // 시 데이터 로드
      await loadPoemData();
      
      // 답변 데이터 로드
      await loadAnswerData();
    })();
  }, [id]);

  const loadAnswerData = async () => {
    try {
      const dayNumber = parseInt(id || '1', 10);
      
      // 백엔드 연결이 활성화되어 있고 로그인된 사용자인 경우 API 호출 시도
      if (API_CONFIG.ENABLE_BACKEND && token) {
        try {
          const response = await recordApi.getRecordByDay(dayNumber, token);
          
          if (response.success && response.data && response.data.answers && response.data.answers.length > 0) {
            // 백엔드에서 답변 가져오기 성공
            const answerText = response.data.answers[0].answer || '';
            setAnswer(answerText);
            // 로컬 캐시도 업데이트
            await AsyncStorage.setItem(`poem_answer_${id}`, answerText);
            console.log('백엔드에서 답변 로드 성공');
            return;
          }
        } catch (apiError) {
          console.warn('API 답변 조회 실패:', apiError);
          // API 실패 시 로컬 캐시로 폴백
        }
      }
      
      // 로컬 캐시에서 답변 로드
      const a = await AsyncStorage.getItem(`poem_answer_${id}`);
      const a2 = await AsyncStorage.getItem('poem_answer');
      setAnswer(a ?? a2 ?? '');
      console.log('로컬 캐시에서 답변 로드');
    } catch (error) {
      console.error('답변 로딩 오류:', error);
    }
  };

  const loadPoemData = async () => {
    try {
      setLoading(true);
      const dayNumber = parseInt(id || '1', 10);
      
      // 백엔드 연결이 활성화되어 있으면 API 호출 시도
      if (API_CONFIG.ENABLE_BACKEND) {
        try {
          console.log(`${dayNumber}일차 시 데이터 로딩 시작...`);
          const [poemResponse, questionsResponse] = await Promise.all([
            poemApi.getPoemByDay(dayNumber),
            poemApi.getQuestionsByDay(dayNumber)
          ]);
          
          console.log('시 응답:', poemResponse);
          console.log('질문 응답:', questionsResponse);
          
          if (poemResponse.success && poemResponse.data) {
            console.log('시 데이터:', poemResponse.data);
            console.log('시 내용:', poemResponse.data.content);
            setPoemData(poemResponse.data);
            // 캐시에 저장
            await AsyncStorage.setItem(`poem_${dayNumber}_cache`, JSON.stringify(poemResponse.data));
          }
          
          if (questionsResponse.success) {
            const questionData = questionsResponse.data;
            const questionsArray = Array.isArray(questionData) ? questionData : [questionData];
            setQuestions(questionsArray);
            // 캐시에 저장
            await AsyncStorage.setItem(`questions_${dayNumber}_cache`, JSON.stringify(questionData));
          }
          
          if (poemResponse.success && questionsResponse.success) {
            console.log(`${dayNumber}일차 데이터 로딩 성공`);
            return;
          }
        } catch (apiError) {
          console.warn('API 호출 실패:', apiError);
        }
      }
      
      // 캐시에서 데이터 로드
      console.log(`${dayNumber}일차 캐시에서 데이터 로드 시도...`);
      const [cachedPoem, cachedQuestions] = await Promise.all([
        AsyncStorage.getItem(`poem_${dayNumber}_cache`),
        AsyncStorage.getItem(`questions_${dayNumber}_cache`)
      ]);
      
      if (cachedPoem) {
        const parsedPoem = JSON.parse(cachedPoem);
        console.log('캐시된 시 데이터:', parsedPoem);
        console.log('캐시된 시 내용:', parsedPoem.content);
        setPoemData(parsedPoem);
      } else {
        console.log('캐시 없음, 기본 시 데이터 사용');
        // 기본 시 데이터
        setPoemData({
          id: dayNumber,
          day: dayNumber,
          date: new Date().toISOString(),
          title: `${dayNumber}일차 시`,
          author: '감또리',
          content: '오늘도 좋은 하루 되세요.\n감또리와 함께하는\n아름다운 시간입니다.',
          source: '감또리 앱'
        });
      }
      
      if (cachedQuestions) {
        const questionData = JSON.parse(cachedQuestions);
        const questionsArray = Array.isArray(questionData) ? questionData : [questionData];
        setQuestions(questionsArray);
      } else {
        // 기본 질문 데이터
        setQuestions([{
          id: '1',
          question: '오늘은 어떤 하루를 보내셨나요?',
          day: dayNumber
        }]);
      }
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
      // Alert 대신 기본값 설정
      const dayNumber = parseInt(id || '1', 10);
      setPoemData({
        id: dayNumber,
        day: dayNumber,
        date: new Date().toISOString(),
        title: `${dayNumber}일차 시`,
        author: '감또리',
        content: '오늘도 좋은 하루 되세요.\n감또리와 함께하는\n아름다운 시간입니다.',
        source: '감또리 앱'
      });
      setQuestions([{
        id: '1',
        question: '오늘은 어떤 하루를 보내셨나요?',
        day: dayNumber
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePoemPress = () => {
    if (poemData) {
      setShowPoemModal(true);
    }
  };

  const handleEditPress = () => {
    setEditAnswer(answer);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editAnswer.trim()) return;
    
    // 이미 저장 중이면 중복 실행 방지
    if (saveMessage) return;
    
    try {
      const dayNumber = parseInt(id || '1', 10);
      
      // 백엔드 연결이 활성화되어 있고 로그인된 사용자인 경우 API 호출 시도
      if (API_CONFIG.ENABLE_BACKEND && token) {
        console.log('백엔드에 답변 저장 시도...');
        try {
          // 답변 데이터 준비
          const answers = [{
            questionId: questions.length > 0 ? questions[0].id : '1',
            answer: editAnswer.trim()
          }];

          // 백엔드에 답변 저장
          const response = await recordApi.updateRecordByDay(
            dayNumber, 
            answers, 
            token
          );

          if (response.success) {
            console.log('백엔드 저장 성공!');
            // 로컬 캐시도 업데이트
            await AsyncStorage.setItem(`poem_answer_${id}`, editAnswer.trim());
            
            // 현재 답변 상태 업데이트
            setAnswer(editAnswer.trim());
            
            // 성공 메시지 표시
            setSaveMessage('✨ 답변이 수정되었습니다!');
            setTimeout(() => {
              setSaveMessage(null);
              setShowEditModal(false);
            }, 2000);
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
      await AsyncStorage.setItem(`poem_answer_${id}`, editAnswer.trim());
      
      // 현재 답변 상태 업데이트
      setAnswer(editAnswer.trim());
      
      // 성공 메시지 표시 (로컬 저장임을 명시)
      setSaveMessage(token ? '⚠️ 로컬에만 저장되었습니다.' : '✨ 답변이 수정되었습니다!');
      setTimeout(() => {
        setSaveMessage(null);
        setShowEditModal(false);
      }, 2000);
      
    } catch (error) {
      console.error('답변 수정 오류:', error);
      setSaveMessage('❌ 수정 중 오류가 발생했습니다.');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headRow}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          android_ripple={{ color: '#e5e7eb' }}
        >
          <CustomText style={styles.backButtonText}>뒤로가기</CustomText>
        </Pressable>
        <CustomText weight="Bold" style={styles.title}>{id}일차 기록</CustomText>
        <Image source={require('../../assets/images/gamttori_down.png')} style={styles.titleImg} />
      </View>

      {/* 시 카드(클릭 시 모달로 시 전문 표시) */}
      <Card style={styles.poemCard}>
        <Pressable onPress={handlePoemPress} android_ripple={{ color: '#e5e7eb' }}>
          <View style={styles.poemHeader}>
            <View style={styles.poemTextContainer}>
              <CustomText weight="Bold" style={styles.poemTitle}>
                {poemData ? `${poemData.title} - ${poemData.author}` : '시를 불러오는 중...'}
              </CustomText>
              <CustomText style={styles.poemSubtitle}>
                터치하여 시 전문 보기
              </CustomText>
            </View>
          </View>
        </Pressable>
      </Card>

      {/* 질문 카드 */}
      <Card style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <View style={styles.questionTextContainer}>
            <CustomText weight="Bold" style={styles.questionTitle}>
              {questions.length > 0 ? `질문: ${questions[0].question}` : '질문: 오늘은 어떤 하루를 보내셨나요?'}
            </CustomText>
          </View>
          <TTSButton 
            text={questions.length > 0 ? questions[0].question : '오늘은 어떤 하루를 보내셨나요?'}
            disabled={false}
          />
        </View>
      </Card>

      {/* 나의 답변 */}
      <Card style={styles.answerCard}>
        <View style={styles.answerHeader}>
          <CustomText weight="Bold" style={styles.answerTitle}>
            나의 답변
          </CustomText>
        </View>
        <View style={styles.answerContent}>
          <CustomText style={styles.answerText}>
            {answer || '아직 기록이 없어요.'}
          </CustomText>
        </View>
        <Button
          title="수정하기"
          size="lg"
          onPress={handleEditPress}
          style={styles.editButton}
        />
      </Card>

      {/* 시 전문 모달 */}
      <Modal
        visible={showPoemModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPoemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {poemData && (
              <>
                <View style={styles.modalHeader}>
                  <CustomText weight="Bold" style={styles.modalTitle}>
                    {poemData.title} — {poemData.author}
                  </CustomText>
                  <Pressable 
                    onPress={() => setShowPoemModal(false)} 
                    style={styles.closeButton}
                  >
                    <CustomText style={styles.closeButtonText}>✕</CustomText>
                  </Pressable>
                </View>
                
                <ScrollView 
                  style={styles.poemScrollView}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.poemScrollContent}
                >
                  <View style={styles.poemContent}>
                    <View style={styles.modalPoemHeader}>
                      <CustomText weight="Bold" style={styles.modalPoemTitle}>
                        {poemData.title}
                      </CustomText>
                      <PoemTTSButton 
                        day={poemData?.day || parseInt(id || '1', 10)}
                        disabled={!poemData}
                      />
                    </View>
                    
                    <CustomText weight="Medium" style={styles.poemText}>
                      {poemData.content}
                    </CustomText>
                    
                    {poemData.source && (
                      <CustomText style={styles.poemSource}>
                        출처: {poemData.source}
                      </CustomText>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 수정 모달 */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.modalHeader}>
              <CustomText weight="Bold" style={styles.modalTitle}>
                답변 수정하기
              </CustomText>
              <Pressable 
                onPress={() => setShowEditModal(false)} 
                style={styles.closeButton}
              >
                <CustomText style={styles.closeButtonText}>✕</CustomText>
              </Pressable>
            </View>
            
            <View style={styles.editContent}>
              <CustomText weight="Bold" style={styles.editQuestion}>
                {questions.length > 0 ? questions[0].question : '오늘은 어떤 하루를 보내셨나요?'}
              </CustomText>
              
              <View style={styles.editInputContainer}>
                <TextArea 
                  placeholder="답변을 말하거나 입력해주세요" 
                  value={editAnswer} 
                  onChangeText={setEditAnswer} 
                  style={styles.editTextArea} 
                />
                <View style={styles.editSttContainer}>
                  <AdvancedSTTButton 
                    onResult={(text) => {
                      setEditAnswer(prev => prev + (prev ? ' ' : '') + text);
                    }}
                    disabled={false}
                    style={styles.editSttButton}
                  />
                </View>
              </View>
              
              <View style={styles.editButtons}>
                <Button 
                  title="취소" 
                  variant="ghost" 
                  size="lg" 
                  onPress={() => setShowEditModal(false)}
                  style={styles.cancelButton}
                />
                <Button 
                  title="저장" 
                  size="lg" 
                  onPress={handleSaveEdit}
                  disabled={!editAnswer.trim()}
                  style={styles.saveButton}
                />
              </View>
              
              {/* 저장 메시지 표시 */}
              {saveMessage && (
                <View style={styles.saveMessageContainer}>
                  <View style={styles.saveMessageBox}>
                    <CustomText style={styles.saveMessageText}>
                      {saveMessage}
                    </CustomText>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#faf9f7', // 베이지/오프화이트 배경
    padding: 16, 
    gap: 16,
  },
  headRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    minWidth: 60,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f8f9fa', // 연한 회색
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#dee2e6', // 회색 테두리
  },
  backButtonText: {
    fontSize: 14,
    color: '#495057', // 진한 회색
    fontWeight: '600',
  },
  title: { 
    fontSize: 24, 
    paddingTop: 40, 
    flex: 1,
    color: '#8b4513', // 따뜻한 갈색
    fontWeight: 'bold',
  },
  titleImg: { 
    width: 60, 
    marginTop: 30, 
    marginLeft: 10, 
    height: 60,
  },
  
  // 시 카드 스타일
  poemCard: { 
    backgroundColor: '#e3f2fd', // 연한 파란색
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3', // 파란색 테두리
    borderRadius: 12,
    padding: 16,
  },
  poemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  poemTextContainer: {
    flex: 1,
  },
  poemTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: '#1976d2', // 파란색
    marginBottom: 4,
    fontWeight: '600',
  },
  poemSubtitle: {
    fontSize: 14,
    color: '#1976d2', // 파란색
  },
  
  // 질문 카드 스타일
  questionCard: {
    backgroundColor: '#fff3cd', // 연한 노란색
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107', // 노란색 테두리
    borderRadius: 12,
    padding: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  questionTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: '#856404', // 진한 노란색
    fontWeight: '600',
  },
  
  // 답변 카드 스타일
  answerCard: {
    backgroundColor: '#d4edda', // 연한 초록색
    borderLeftWidth: 4,
    borderLeftColor: '#28a745', // 초록색 테두리
    borderRadius: 12,
    padding: 16,
  },
  answerHeader: {
    marginBottom: 12,
  },
  answerTitle: {
    fontSize: 20,
    color: '#155724', // 진한 초록색
    fontWeight: '600',
  },
  answerContent: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c3e6cb', // 연한 초록색 테두리
    minHeight: 80,
  },
  answerText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#155724', // 진한 초록색
  },
  editButton: {
    alignSelf: 'flex-end',
    minWidth: 100,
    height: 40,
  },
  
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  poemScrollView: {
    flex: 1,
    maxHeight: '70%',
  },
  poemScrollContent: {
    flexGrow: 1,
  },
  poemContent: {
    flex: 1,
  },
  // 모달용 poemHeader (기존 스타일 유지)
  modalPoemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalPoemTitle: {
    fontSize: 24,
    lineHeight: 30,
    flex: 1,
    marginRight: 12,
  },
  poemText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 16,
  },
  poemSource: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  
  // 수정 모달 스타일
  editModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    maxWidth: 500,
  },
  editContent: {
    flex: 1,
  },
  editQuestion: {
    fontSize: 18,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
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
  editInputContainer: {
    marginBottom: 20,
  },
  editTextArea: {
    height: 200,
  },
  editSttContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  editSttButton: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
});
