// app/home/mood.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { moodApi } from '../../src/_lib/api';
import Button from '../_components/Button';
import CustomText from '../_components/CustomText';

const EMOJIS = ['😄', '🙂', '😐', '🙁', '😢'];

interface MoodModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function MoodModal({ visible, onClose }: MoodModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [savedMood, setSavedMood] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // 저장된 기분 불러오기
  useEffect(() => {
    if (visible) {
      const loadSavedMood = async () => {
        try {
          const saved = await AsyncStorage.getItem('mood_last');
          if (saved) {
            setSavedMood(saved);
            setSelected(saved);
            setIsEditing(false);
          } else {
            setIsEditing(true);
          }
        } catch (error) {
          console.error('저장된 기분 불러오기 오류:', error);
          setIsEditing(true);
        }
      };
      loadSavedMood();
    }
  }, [visible]);

  // 왼쪽부터 5,4,3,2,1 가중치
  const getWeight = (emoji: string | null) => {
    if (!emoji) return null;
    const idx = EMOJIS.indexOf(emoji); // 0~4
    if (idx < 0) return null;
    return 5 - idx; // 0->5 ... 4->1
  };

  const onSave = async () => {
    if (!selected) return;
    
    // 이미 저장 중이면 중복 실행 방지
    if (saveMessage) return;
    
    try {
      const weight = getWeight(selected);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
      
      // 사용자 정보 가져오기
      const userInfoStr = await AsyncStorage.getItem('user_info');
      if (!userInfoStr) {
        setSaveMessage('❌ 로그인이 필요합니다.');
        setTimeout(() => {
          setSaveMessage(null);
          onClose();
        }, 2000);
        return;
      }
      
      const userInfo = JSON.parse(userInfoStr);
      const userId = userInfo.userId;
      
      // 백엔드 API를 통한 기분 기록 저장
      await moodApi.createOrUpdateMood(userId, today, weight!);
      
      // 로컬 캐시에도 저장
      await AsyncStorage.multiSet([
        ['mood_last', selected],
        ['mood_last_weight', String(weight ?? '')],
      ]);
      
      // 저장된 기분 업데이트
      setSavedMood(selected);
      setIsEditing(false);
      
      // 저장 완료 메시지 표시
      setSaveMessage('✨ 기분이 저장되었습니다!');
      setTimeout(() => {
        setSaveMessage(null);
        onClose(); // 모달 닫기
      }, 2000);
      
    } catch (error) {
      console.error('기분 기록 저장 오류:', error);
      setSaveMessage('❌ 저장 중 오류가 발생했습니다.');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <CustomText weight="Bold" style={styles.title}>
              오늘 기분 어때요?
            </CustomText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <CustomText style={styles.closeButtonText}>✕</CustomText>
            </Pressable>
          </View>

          {!isEditing && savedMood ? (
            // 저장된 기분 표시
            <View style={styles.savedMoodContainer}>
              <CustomText weight="Bold" style={styles.savedMoodTitle}>
                오늘의 기분
              </CustomText>
              <View style={styles.savedMoodDisplay}>
                <CustomText style={styles.savedEmojiText}>{savedMood}</CustomText>
              </View>
              <Button
                title="수정하기"
                size="xl"
                onPress={() => {
                  setIsEditing(true);
                }}
                style={styles.editBtn}
              />
            </View>
          ) : (
            // 기분 선택 화면
            <View style={styles.selectionContainer}>
              <View style={styles.emojiRow}>
                {EMOJIS.map((e) => {
                  const isActive = selected === e;
                  return (
                    <Pressable
                      key={e}
                      onPress={() => setSelected(e)}
                      style={styles.emojiBtn}
                      android_ripple={{ color: '#e5e7eb', borderless: true }}
                      hitSlop={8}
                    >
                      {isActive && <View style={styles.orangeCircle} />}
                      <CustomText style={styles.emojiText}>{e}</CustomText>
                    </Pressable>
                  );
                })}
              </View>

              <Button
                title="저장"
                size="xl"
                onPress={onSave}
                style={[styles.saveBtn, !selected && { opacity: 0.5 }]}
                disabled={!selected}
              />
            </View>
          )}

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
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    flex: 1,
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
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  // 저장된 기분 표시 컨테이너
  savedMoodContainer: {
    alignItems: 'center',
    width: '100%',
  },
  savedMoodTitle: {
    fontSize: 20,
    color: '#333',
    marginBottom: 16,
    fontFamily: 'MaruBuri-SemiBold',
  },
  savedMoodDisplay: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ec7600',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  savedEmojiText: {
    fontSize: 48,
  },
  editBtn: {
    width: '100%',
  },

  // 기분 선택 컨테이너
  selectionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  emojiBtn: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orangeCircle: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d1d5db',
    shadowColor: '#9ca3af',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    zIndex: -1,
  },
  emojiText: { 
    fontSize: 34,
  },
  saveBtn: {
    width: '100%',
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
});
