import { useEffect, useState } from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import CustomText from "../app/_components/CustomText";
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
    console.warn('StoryModal: 유효하지 않은 day 데이터', { day });
    // 모달이 열려있으면 닫기
    if (visible && onClose) {
      try {
        onClose();
      } catch (error) {
        console.error('StoryModal onClose 오류:', error);
      }
    }
    return null;
  }
  
  const scene = day.scenes[sceneIndex];
  
  // 안전장치: scene이 없을 때 처리
  if (!scene) {
    console.warn('StoryModal: 유효하지 않은 scene 데이터', { sceneIndex, scenesLength: day.scenes?.length });
    // sceneIndex를 0으로 리셋
    if (sceneIndex !== 0) {
      setSceneIndex(0);
    }
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
            <CustomText style={styles.skipButtonText}>✕</CustomText>
          </TouchableOpacity>
          
          {/* 모달 콘텐츠 박스 */}
          <View style={styles.contentBox}>
            <CustomText style={styles.dayTitle}>
              Day {day.day} · {day.title}
            </CustomText>

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
                  <CustomText style={styles.speaker}>{line.speaker}</CustomText>
                )}
                {line.text && <CustomText style={styles.lineText}>{line.text}</CustomText>}
                {line.aside && (
                  <CustomText style={styles.aside}>({line.aside})</CustomText>
                )}
              </View>
            )) : (
              <View style={styles.speechBubble}>
                <CustomText style={styles.lineText}>스토리 내용을 불러올 수 없습니다.</CustomText>
              </View>
            )}

            {/* 버튼 */}
            <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
              <CustomText style={styles.nextBtnText}>
                {day.scenes && sceneIndex < day.scenes.length - 1 ? "다음" : "닫기"}
              </CustomText>
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
    width: width * 0.7, // 0.45 -> 0.7로 증가
    height: height * 0.6, // 0.375 -> 0.6으로 증가
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 6,
  },
  contentBox: {
    flex: 1,
    padding: 20, // 12 -> 20으로 증가
    justifyContent: "flex-end",
  },
  dayTitle: {
    fontSize: 20, // 16 -> 20으로 증가
    fontWeight: "bold",
    marginBottom: 12, // 8 -> 12로 증가
    textAlign: "center",
    fontFamily: "MaruBuri-Bold",
  },
  speechBubble: {
    marginBottom: 12, // 8 -> 12로 증가
    padding: 12, // 8 -> 12로 증가
    borderRadius: 16, // 12 -> 16으로 증가
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
    marginTop: 20, // 12 -> 20으로 증가
    backgroundColor: "#4CAF50",
    paddingVertical: 12, // 8 -> 12로 증가
    borderRadius: 10, // 6 -> 10으로 증가
  },
  nextBtnText: {
    textAlign: "center",
    fontSize: 16, // 14 -> 16으로 증가
    color: "#fff",
    fontWeight: "600",
    fontFamily: "MaruBuri-SemiBold",
  },
  skipButton: {
    position: "absolute",
    top: 15, // 10 -> 15로 증가
    right: 15, // 10 -> 15로 증가
    width: 35, // 28 -> 35로 증가
    height: 35, // 28 -> 35로 증가
    borderRadius: 17.5, // 14 -> 17.5로 증가
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
    fontSize: 18, // 14 -> 18로 증가
    color: "#666",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "MaruBuri-Bold",
  },
});