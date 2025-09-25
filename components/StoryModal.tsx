import React, { useState } from "react";
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
  const scene = day.scenes[sceneIndex];

  const handleNext = () => {
    if (sceneIndex < day.scenes.length - 1) {
      setSceneIndex(sceneIndex + 1);
    } else {
      onClose();
      setSceneIndex(0);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        {/* 배경 */}
        <View style={styles.backgroundBox}>
          {/* 모달 콘텐츠 박스 */}
          <View style={styles.contentBox}>
            <Text style={styles.dayTitle}>
              Day {day.day} · {day.title}
            </Text>

            {scene.lines.map((line, idx) => (
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
            ))}

            {/* 버튼 */}
            <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>
                {sceneIndex < day.scenes.length - 1 ? "다음" : "닫기"}
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
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  lineText: {
    fontSize: 15,
    color: "#333",
  },
  aside: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#777",
    marginTop: 4,
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
  },
});