
// screens/student/FreeDoubtsLeftScreen.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";

const COLORS = {
  bg: "#F6FAFF",
  white: "#FFFFFF",
  navy: "#071F4F",
  blue: "#003B8E",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E7EEF8",
  yellow: "#F7B500",
};

export default function FreeDoubtsLeftScreen({ navigation }) {
  const { currentUser } = useAppContext();
  const isPremiumUser =
    currentUser?.isPremium ||
    currentUser?.premiumAccess ||
    String(currentUser?.subscriptionStatus || "").toLowerCase() === "active";
  const remainingCount = isPremiumUser ? Infinity : Number(currentUser?.freeDoubtsLeft ?? 3);
  const remainingUses = isPremiumUser ? "∞" : remainingCount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Free Doubts Left</Text>

        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Card */}
      <View style={styles.mainContainer}>
        <View style={styles.card}>
          {/* Gift Icon */}
          <View style={styles.giftCircle}>
            <Text style={styles.giftEmoji}>🎁</Text>
          </View>

          {/* Title */}
          <Text style={styles.mainTitle}>You have</Text>

          <Text style={styles.countText}>
            {isPremiumUser ? "Premium Active" : `${remainingUses} Free Study Uses Left`}
          </Text>

          <Text style={styles.subText}>
            Ask doubts, watch videos, and{"\n"}try mock tests before premium.
          </Text>

          {/* FIX: "View Plans" button → "SubscriptionPlans" (was incorrectly going to "AskDoubt") */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.viewBtn}
            onPress={() => navigation.navigate("SubscriptionPlans")}
          >
            <Text style={styles.viewBtnText}>View Plans</Text>
          </TouchableOpacity>

          {/* Continue */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.continueBtn}
            onPress={() => {
              if (!isPremiumUser && remainingCount <= 0) {
                Alert.alert(
                  "Free doubts completed",
                  "You have used all 3 free doubts. Please choose a subscription plan to continue asking doubts.",
                  [
                    {
                      text: "Choose Plan",
                      onPress: () => navigation.navigate("SubscriptionPlans"),
                    },
                    { text: "Cancel", style: "cancel" },
                  ]
                );
                return;
              }

              navigation.navigate("AskDoubt");
            }}
          >
            <Text style={styles.continueText}>
              {isPremiumUser || remainingCount > 0 ? "Continue Asking" : "Get Premium"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },

  header: {
    height: 58,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "android" ? 6 : 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.white,
  },

  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 28,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  giftCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FFF7E7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  giftEmoji: {
    fontSize: 38,
  },

  mainTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  countText: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
  },

  subText: {
    marginTop: 14,
    fontSize: 11.5,
    lineHeight: 18,
    textAlign: "center",
    fontWeight: "700",
    color: COLORS.muted,
  },

  viewBtn: {
    marginTop: 28,
    width: "100%",
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  viewBtnText: {
    fontSize: 12.5,
    fontWeight: "900",
    color: COLORS.white,
  },

  continueBtn: {
    marginTop: 18,
    paddingVertical: 8,
  },

  continueText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.text,
  },
});
