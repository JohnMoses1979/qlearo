
// screens/OnboardingScreen.js

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#006D6A",
  primaryDark: "#00514F",
  white: "#FFFFFF",
  text: "#07123A",
  muted: "#6B7890",
  dot: "#D8E5E7",
};

const slides = [
  {
    id: "1",
    title: "Learn Smarter",
    subtitle: "Ask doubts anytime, understand concepts clearly, and study better.",
    image: require("../assets/images/onboarding1.png"),
  },
  {
    id: "2",
    title: "Teach & Earn",
    subtitle: "Answer doubts, help students, and earn for your knowledge.",
    image: require("../assets/images/onboarding2.png"),
  },
  {
    id: "3",
    title: "Grow Together",
    subtitle: "Connect with learners and teachers in one simple learning app.",
    image: require("../assets/images/onboarding3.png"),
  },
];

export default function OnboardingScreen({ navigation }) {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      navigation.replace("RoleSelectionScreen");
    }
  };

  const skip = () => {
    navigation.replace("RoleSelectionScreen");
  };

  const onMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageSection}>
          <Image source={item.image} style={styles.image} resizeMode="contain" />
        </View>

        <View style={styles.textSection}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
          <Text numberOfLines={3} style={styles.subtitle}>
            {item.subtitle}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.75} onPress={skip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        snapToInterval={width}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <View style={styles.footer}>
        <View style={styles.dotsWrapper}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.nextButton} onPress={goNext}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? "Start" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },

  header: {
    position: "absolute",
    top: Platform.OS === "android" ? 36 : 50,
    right: 18,
    zIndex: 50,
  },

  skipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  skipText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.muted,
  },

  slide: {
    width,
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },

  imageSection: {
    width,
    height: height * 0.54,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 25,
  },

  image: {
    width: width * 0.9,
    height: height * 0.44,
    maxWidth: 390,
  },

  textSection: {
    width,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 12,
  },

  title: {
    fontSize: width < 360 ? 25 : 30,
    lineHeight: width < 360 ? 31 : 36,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 12,
    fontSize: width < 360 ? 15 : 17,
    lineHeight: width < 360 ? 23 : 26,
    fontWeight: "600",
    color: COLORS.muted,
    textAlign: "center",
  },

  footer: {
    position: "absolute",
    bottom: Platform.OS === "android" ? 28 : 38,
    left: 0,
    right: 0,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dotsWrapper: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 74,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    marginHorizontal: 4,
    backgroundColor: COLORS.dot,
  },

  activeDot: {
    width: 22,
    backgroundColor: COLORS.primary,
  },

  nextButton: {
    minWidth: 74,
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  nextText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.white,
  },
});