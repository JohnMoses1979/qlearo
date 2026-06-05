

// ===============================================
// StudentBottomNavigation.js
// PROFESSIONAL PREMIUM BOTTOM NAVIGATION
// VIDEO SCREEN FRIENDLY
// SAFE AREA FIXED
// NO OVERLAP
// MOBILE FRIENDLY
// ===============================================

import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const COLORS = {
  white: "#FFFFFF",
  primary: "#006D6A",
  secondary: "#0F172A",
  border: "#E5ECF6",
  gray: "#6B7280",
  bg: "#F8FAFC",
  shadow: "#000000",
};

export default function StudentBottomNavigation({
  navigation,
  active = "Home",
  hidden = false,
}) {
  // =========================================
  // HIDE NAVIGATION IN LANDSCAPE
  // =========================================

  if (hidden) return null;

  // =========================================
  // NAV ITEMS
  // =========================================

  const navItems = [
    {
      key: "Home",
      label: "Home",
      icon: "home-outline",
      activeIcon: "home",
      screen: "StudentDashboard",
    },

    {
      key: "MyDoubts",
      label: "Doubts",
      icon: "chatbox-ellipses-outline",
      activeIcon: "chatbox-ellipses",
      screen: "StudentMyDoubts",
    },

    {
      key: "AskDoubt",
      label: "",
      icon: "add",
      screen: "AskDoubt",
      center: true,
    },

    {
      key: "Sessions",
      label: "Sessions",
      icon: "chatbubble-outline",
      activeIcon: "chatbubble",
      screen: "StudentChat",
    },

    {
      key: "Profile",
      label: "Profile",
      icon: "person-outline",
      activeIcon: "person",
      screen: "StudentProfile",
    },
  ];

  // =========================================
  // NAVIGATION
  // =========================================

  const goTo = (screen) => {
    if (!navigation || !screen) return;

    navigation.navigate(screen);
  };

  // =========================================
  // UI
  // =========================================

  return (
    <View
      style={styles.wrapper}
      pointerEvents="box-none"
    >
      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          const isActive =
            active === item.key;

          // =====================================
          // CENTER BUTTON
          // =====================================

          if (item.center) {
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.9}
                style={styles.centerBox}
                onPress={() =>
                  goTo(item.screen)
                }
              >
                <View
                  style={styles.plusButton}
                >
                  <Ionicons
                    name="add"
                    size={34}
                    color={
                      COLORS.white
                    }
                  />
                </View>
              </TouchableOpacity>
            );
          }

          // =====================================
          // NORMAL ITEMS
          // =====================================

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              activeOpacity={0.85}
              onPress={() =>
                goTo(item.screen)
              }
            >
              {/* ICON */}

              <View
                style={[
                  styles.iconContainer,

                  isActive &&
                    styles.activeIconContainer,
                ]}
              >
                <Ionicons
                  name={
                    isActive
                      ? item.activeIcon
                      : item.icon
                  }
                  size={
                    width < 360
                      ? 21
                      : 23
                  }
                  color={
                    isActive
                      ? COLORS.white
                      : COLORS.gray
                  }
                />
              </View>

              {/* LABEL */}

              <Text
                numberOfLines={1}
                style={[
                  styles.navText,

                  isActive &&
                    styles.activeText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ===============================================
// STYLES
// ===============================================

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor:
      "transparent",

    zIndex: 999,
  },

  bottomNav: {
    height:
      Platform.OS === "ios"
        ? 92
        : 82,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    backgroundColor:
      COLORS.white,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    paddingHorizontal:
      width < 360 ? 4 : 8,

    paddingBottom:
      Platform.OS === "ios"
        ? 18
        : 10,

    paddingTop: 10,

    shadowColor:
      COLORS.shadow,

    shadowOpacity: 0.08,

    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: -5,
    },

    elevation: 16,
  },

  navItem: {
    flex: 1,

    height: 60,

    alignItems: "center",

    justifyContent: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: "center",

    justifyContent: "center",
  },

  activeIconContainer: {
    backgroundColor:
      COLORS.primary,

    shadowColor:
      COLORS.primary,

    shadowOpacity: 0.25,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 6,
  },

  navText: {
    marginTop: 4,

    fontSize:
      width < 360 ? 10 : 11,

    fontWeight: "800",

    color: COLORS.gray,

    maxWidth: 62,
  },

  activeText: {
    color: COLORS.primary,
  },

  centerBox: {
    width:
      width < 360 ? 62 : 70,

    alignItems: "center",

    justifyContent: "center",
  },

  plusButton: {
    width:
      width < 360 ? 60 : 68,

    height:
      width < 360 ? 60 : 68,

    borderRadius:
      width < 360 ? 30 : 34,

    backgroundColor:
      COLORS.primary,

    alignItems: "center",

    justifyContent: "center",

    marginTop: -42,

    borderWidth: 5,

    borderColor: COLORS.bg,

    shadowColor:
      COLORS.primary,

    shadowOpacity: 0.35,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 12,
  },
});
