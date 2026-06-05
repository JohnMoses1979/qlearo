


// screens/student/RateReviewScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  bg: "#F6FAFF",
  white: "#FFFFFF",
  blue: "#003B8E",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E7EEF8",
  yellow: "#F7B500",
};

export default function RateReviewScreen({ navigation }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Rate & Review</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate("StudentNotification")}
        >
          <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          {/* Emoji */}
          <View style={styles.emojiBox}>
            <Text style={styles.sparkle}>✨</Text>
            <Text style={styles.emoji}>🥰</Text>
            <Text style={styles.sparkleRight}>✨</Text>
          </View>

          {/* Heading */}
          <Text style={styles.mainTitle}>Great! You got your answer</Text>

          <Text style={styles.subTitle}>
            How would you rate{"\n"}
            <Text style={styles.teacherName}>Neha Ma'am</Text>?
          </Text>

          {/* Stars */}
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => setRating(item)}
              >
                <Ionicons
                  name={item <= rating ? "star" : "star-outline"}
                  size={30}
                  color={COLORS.yellow}
                  style={styles.star}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Review */}
          <Text style={styles.reviewLabel}>
            Write a review <Text style={styles.optional}>(Optional)</Text>
          </Text>

          <TextInput
            value={review}
            onChangeText={setReview}
            placeholder="Write your feedback here..."
            placeholderTextColor={COLORS.muted}
            multiline
            textAlignVertical="top"
            style={styles.reviewInput}
          />

          {/* FIX: "StudentHome" → "StudentDashboard" */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.submitBtn}
            onPress={() => navigation.navigate("StudentDashboard")}
          >
            <Text style={styles.submitText}>Submit Review</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    height: 50,
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
    color: COLORS.text,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emojiBox: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 4,
  },

  sparkle: {
    fontSize: 15,
    marginRight: 10,
  },

  sparkleRight: {
    fontSize: 15,
    marginLeft: 10,
  },

  emoji: {
    fontSize: 42,
  },

  mainTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  subTitle: {
    marginTop: 10,
    fontSize: 11.5,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },

  teacherName: {
    color: COLORS.text,
    fontWeight: "900",
  },

  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 26,
  },

  star: {
    marginHorizontal: 3,
  },

  reviewLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 8,
  },

  optional: {
    color: COLORS.muted,
    fontWeight: "700",
  },

  reviewInput: {
    height: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 11.5,
    fontWeight: "600",
    color: COLORS.text,
  },

  submitBtn: {
    marginTop: 26,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  submitText: {
    fontSize: 12.5,
    fontWeight: "900",
    color: COLORS.white,
  },
});