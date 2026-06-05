
// screens/SplashScreen.js

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#007C7A",
  primaryDark: "#005F5D",
  light: "#E8FFFD",
  white: "#FFFFFF",
  text: "#07123A",
  muted: "#65749C",
};

export default function SplashScreen({ navigation }) {
  const { authReady, currentUser } = useAppContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== "web";

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver,
      }),
    ]).start();

    if (!authReady) {
      return undefined;
    }

    if (currentUser?.role === "student") {
      navigation.replace("StudentDashboard");
      return undefined;
    }

    if (currentUser?.role === "teacher") {
      navigation.replace("TeacherDashboard");
      return undefined;
    }

    const timer = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 2200);

    return () => clearTimeout(timer);
  }, [authReady, currentUser?.role, navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.topCircle} />
      <View style={styles.bottomLeftWave} />
      <View style={styles.bottomRightWave} />

      <Feather name="book-open" size={38} color="#D7F3F1" style={styles.iconBook} />
      <Ionicons name="school-outline" size={43} color="#D7F3F1" style={styles.iconCap} />
      <Ionicons name="bulb-outline" size={42} color="#D7F3F1" style={styles.iconBulb} />
      <Feather name="search" size={43} color="#D7F3F1" style={styles.iconSearch} />
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={42}
        color="#D7F3F1"
        style={styles.iconChat}
      />

      <View style={[styles.dot, styles.dot1]} />
      <View style={[styles.dot, styles.dot2]} />
      <View style={[styles.smallDot, styles.dot3]} />
      <View style={[styles.smallDot, styles.dot4]} />
      <View style={[styles.smallDot, styles.dot5]} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.logoName}>Clarivo</Text>

        <Text style={styles.tagline}>Learn. Ask. Understand.</Text>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDot} />
          <View style={styles.dividerLineLight} />
        </View>

        <Text style={styles.subtitle}>
          Instant doubt solutions{"\n"}Anytime, Anywhere.
        </Text>
      </Animated.View>

      <Image
        source={require("../assets/images/bookicon.png")}
        style={styles.bookImage}
        resizeMode="contain"
      />

      <View style={styles.pagination}>
        <View style={styles.activeDot} />
        <View style={styles.pageDot} />
        <View style={styles.pageDot} />
        <View style={styles.pageDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },

  topCircle: {
    position: "absolute",
    top: -125,
    left: -120,
    width: 315,
    height: 315,
    borderRadius: 160,
    backgroundColor: COLORS.light,
  },

  bottomLeftWave: {
    position: "absolute",
    bottom: -130,
    left: -135,
    width: width * 0.95,
    height: 270,
    borderRadius: 170,
    backgroundColor: "#EFFFFD",
    transform: [{ rotate: "15deg" }],
  },

  bottomRightWave: {
    position: "absolute",
    bottom: -130,
    right: -135,
    width: width * 0.95,
    height: 270,
    borderRadius: 170,
    backgroundColor: "#DFFFFC",
    transform: [{ rotate: "-15deg" }],
  },

  content: {
    position: "absolute",
    top: height * 0.17,
    width: "100%",
    alignItems: "center",
    zIndex: 5,
  },

  logo: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: -55,
  },

  logoName: {
    fontSize: width * 0.105,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -1,
    marginBottom: 12,
  },

  tagline: {
    fontSize: width * 0.052,
    fontWeight: "600",
    color: "#24335F",
    letterSpacing: 0.2,
  },

  divider: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  dividerLine: {
    width: 34,
    height: 3,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  dividerDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  dividerLineLight: {
    width: 34,
    height: 3,
    borderRadius: 5,
    backgroundColor: "#73D8D4",
  },

  subtitle: {
    marginTop: 26,
    textAlign: "center",
    fontSize: width * 0.045,
    lineHeight: width * 0.068,
    color: COLORS.muted,
    fontWeight: "600",
  },

  bookImage: {
    position: "absolute",
    bottom: Platform.OS === "android" ? height * 0.075 : height * 0.085,
    alignSelf: "center",
    width: width * 0.9,
    height: height * 0.25,
    zIndex: 2,
  },

  pagination: {
    position: "absolute",
    bottom: 34,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    zIndex: 10,
  },

  activeDot: {
    width: 13,
    height: 13,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },

  pageDot: {
    width: 13,
    height: 13,
    borderRadius: 8,
    backgroundColor: "#C8EDEA",
  },

  iconBook: {
    position: "absolute",
    top: height * 0.13,
    left: width * 0.1,
  },

  iconCap: {
    position: "absolute",
    top: height * 0.13,
    right: width * 0.13,
  },

  iconBulb: {
    position: "absolute",
    top: height * 0.34,
    left: width * 0.07,
  },

  iconSearch: {
    position: "absolute",
    top: height * 0.31,
    right: width * 0.09,
  },

  iconChat: {
    position: "absolute",
    bottom: height * 0.34,
    left: width * 0.07,
  },

  dot: {
    position: "absolute",
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#C8EDEA",
  },

  smallDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C8EDEA",
  },

  dot1: {
    top: height * 0.22,
    left: width * 0.12,
  },

  dot2: {
    bottom: height * 0.34,
    right: width * 0.12,
  },

  dot3: {
    top: height * 0.08,
    right: width * 0.28,
  },

  dot4: {
    top: height * 0.15,
    left: width * 0.29,
  },

  dot5: {
    top: height * 0.43,
    right: width * 0.18,
  },
});
