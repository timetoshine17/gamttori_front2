import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { DayEntry } from "../data/types";

const { width, height } = Dimensions.get("window");

type Props = {
  visible: boolean;
  onClose: () => void;
  day: DayEntry;
};

export default function StoryModal({ visible, onClose, day }: Props) {
  const [sceneIndex, setSceneIndex] = useState(0);
  
  // 안전장치: day나 scenes가 없을 때 처리
  if (!day || !day.scenes || day.scenes.length === 0) {
    console.warn('StoryModal: 유효하지 않은 day 데이터');
    return null;
  }
  
  const scene = day.scenes[sceneIndex];
  
  // 안전장치: scene이 없을 때 처리
  if (!scene) {
    console.warn('StoryModal: 유효하지 않은 scene 데이터');
    return null;
  }

  // 모달이 열릴 때마다 sceneIndex를 0으로 리셋
  useEffect(() => {
    if (visible) {
      setSceneIndex(0);
    }
  }, [visible]);

  const handleNext = () => {
    try {
      // 안전장치: day.scenes가 유효한지 확인
      if (!day.scenes || day.scenes.length === 0) {
        console.warn('StoryModal: scenes 데이터가 없습니다');
        onClose();
        return;
      }
      
      if (sceneIndex < day.scenes.length - 1) {
        setSceneIndex(sceneIndex + 1);
      } else {
        // 모달을 닫기 전에 상태를 먼저 리셋
        setSceneIndex(0);
        // 약간의 지연을 두고 모달 닫기 (상태 업데이트 완료 후)
        setTimeout(() => {
          try {
            onClose();
          } catch (closeError) {
            console.error('StoryModal onClose 오류:', closeError);
          }
        }, 100);
      }
    } catch (error) {
      console.error('StoryModal handleNext 오류:', error);
      // 오류 발생 시에도 모달은 닫기
      setSceneIndex(0);
      try {
        onClose();
      } catch (closeError) {
        console.error('StoryModal onClose 오류 (에러 핸들링 중):', closeError);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        {/* 배경 */}
        <View style={styles.backgroundBox}>
          {/* Skip 버튼 */}
          <TouchableOpacity 
            onPress={() => {
              try {
                console.log('스토리 모달 건너뛰기');
                setSceneIndex(0); // 상태 리셋
                onClose();
              } catch (error) {
                console.error('Skip 버튼 오류:', error);
                onClose();
              }
            }} 
            style={styles.skipButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>✕</Text>
          </TouchableOpacity>
          
          {/* 모달 콘텐츠 박스 */}
          <View style={styles.contentBox}>
            <Text style={styles.dayTitle}>
              Day {day.day} · {day.title}
            </Text>

            {scene.lines && scene.lines.length > 0 ? scene.lines.map((line, idx) => (
              <View
                key={idx}
                style={[
                  styles.speechBubble,
                  line.speaker === "감또리" && styles.gamtoriBubble,
                  line.speaker && line.speaker !== "감또리" && styles.otherBubble,
                ]}
              >
                {line.speaker && (
                  <Text style={styles.speaker}>{line.speaker}</Text>
                )}
                {line.text && <Text style={styles.lineText}>{line.text}</Text>}
                {line.aside && (
                  <Text style={styles.aside}>({line.aside})</Text>
                )}
              </View>
            )) : (
              <View style={styles.speechBubble}>
                <Text style={styles.lineText}>스토리 내용을 불러올 수 없습니다.</Text>
              </View>
            )}

            {/* 버튼 */}
            <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>
                {day.scenes && sceneIndex < day.scenes.length - 1 ? "다음" : "닫기"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundBox: {
    width: width * 0.9,
    height: height * 0.75,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 6,
  },
  contentBox: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-end",
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "MaruBuri-Bold",
  },
  speechBubble: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 16,
    maxWidth: "85%",
  },
  gamtoriBubble: {
    backgroundColor: "#e0f7fa",
    alignSelf: "flex-start",
  },
  otherBubble: {
    backgroundColor: "#f1f8e9",
    alignSelf: "flex-end",
  },
  speaker: {
    fontSize: 16, // 13 -> 16으로 증가
    fontWeight: "600",
    marginBottom: 6, // 4 -> 6으로 증가
    color: "#333",
    fontFamily: "MaruBuri-SemiBold",
  },
  lineText: {
    fontSize: 18, // 15 -> 18로 증가
    color: "#333",
    fontFamily: "MaruBuri-Regular",
    lineHeight: 26, // 줄 간격 추가
  },
  aside: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#777",
    marginTop: 4,
    fontFamily: "MaruBuri-Regular",
  },
  nextBtn: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
  },
  nextBtnText: {
    textAlign: "center",
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    fontFamily: "MaruBuri-SemiBold",
  },
  skipButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  skipButtonText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "MaruBuri-Bold",
  },
});