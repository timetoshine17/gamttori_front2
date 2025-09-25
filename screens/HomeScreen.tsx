// screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useProgress } from "../store/progress";
import { GAMTORI_DAYS } from "../data/gamttoriDays";
import StoryModal from "../components/StoryModal";

export default function HomeScreen() {
  const { lastShownDate, setShown, currentDay } = useProgress();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (lastShownDate !== today) {
      setShowModal(true);
      setShown(today);
    }
  }, [lastShownDate]);

  const todayData = GAMTORI_DAYS.find((d) => d.day === currentDay);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>홈 화면</Text>
      {todayData && (
        <StoryModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          day={todayData}
        />
      )}
    </View>
  );
}
