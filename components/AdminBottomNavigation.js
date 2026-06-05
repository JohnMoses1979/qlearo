// src/components/AdminBottomNavigation.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  teal: "#00796B",
  tealDark: "#006A60",
  white: "#FFFFFF",
};

const NAV_ITEMS = [
  {
    key: "Dashboard",
    label: "Dashboard",
    icon: "home-outline",
    activeIcon: "home",
    screen: "AdminDashboard",
  },
  {
    key: "Subscriptions",
    label: "Subscriptions",
    icon: "reader-outline",
    activeIcon: "reader",
    screen: "AdminSubscriptionPayments",
  },
  {
    key: "Earnings",
    label: "Earnings",
    icon: "cash-outline",
    activeIcon: "cash",
    screen: "AdminTeacherEarnings",
  },
  
  {
    key: "Payouts",
    label: "Payouts",
    icon: "wallet-outline",
    activeIcon: "wallet",
    screen: "AdminTeacherPayouts",
  },
  {
    key: "More",
    label: "More",
    icon: "ellipsis-horizontal",
    activeIcon: "ellipsis-horizontal-circle",
    screen: "AdminMore",
  },
];

export default function AdminBottomNavigation({
  navigation,
  active = "Dashboard",
}) {
  const handleNavigate = (item) => {
    if (!navigation) return;
    if (active === item.key) return;

    navigation.navigate(item.screen);
  };

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.container}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;

          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.86}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => handleNavigate(item)}
            >
              <Ionicons
                name={isActive ? item.activeIcon : item.icon}
                size={26}
                color={COLORS.white}
              />

              <Text
                style={[styles.navLabel, isActive && styles.navLabelActive]}
                numberOfLines={1}
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

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },

  container: {
    minHeight: Platform.OS === "ios" ? 106 : 92,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 14,
    elevation: 12,
  },

  navItem: {
    flex: 1,
    minHeight: 68,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.95,
  },

  navItemActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  navLabel: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.white,
  },

  navLabelActive: {
    fontWeight: "900",
  },
});