// screens/student/StudentCategoryDetailsScreen.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { buildStudentCategoryDetail } from "./studentCategoryUtils";

const COLORS = {
  bg: "#F2F7FF",
  white: "#FFFFFF",
  primary: "#006D6A",
  primaryLight: "#E6F5F4",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E2EBF6",
};

export default function StudentCategoryDetailsScreen({ route, navigation }) {
  const category = route?.params?.category || {};
  const data = buildStudentCategoryDetail(category);

  const handleSubjectPress = (subject) => {
    navigation.navigate("AskDoubt", {
      category: data.title,
      subject: subject.title,
      tutor: subject.tutor || null,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topHeader}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View
            style={[
              styles.heroImageBox,
              { backgroundColor: `${data.gradient}18` },
            ]}
          >
            <Text style={styles.heroEmoji}>{data.emoji}</Text>
          </View>

          <View style={styles.heroTextBox}>
            <Text style={styles.heroTitle}>{data.title}</Text>
            <Text style={[styles.heroSubtitle, { color: data.gradient }]}>
              {data.subtitle}
            </Text>
            <Text style={styles.heroDescription} numberOfLines={2}>
              {data.description}
            </Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          {data.stats.map((item, index) => (
            <View
              key={`${item.label}-${index}`}
              style={[
                styles.statItem,
                index !== data.stats.length - 1 && styles.statBorder,
              ]}
            >
              <View style={styles.statIconBox}>
                <Ionicons name={item.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>{data.about}</Text>

        <Text style={styles.sectionTitle}>Subjects</Text>
        {data.subjects.map((subject, index) => (
          <TouchableOpacity
            key={subject.key || `${subject.title}-${index}`}
            activeOpacity={0.86}
            style={styles.subjectCard}
            onPress={() => handleSubjectPress(subject)}
          >
            <View
              style={[
                styles.subjectIconBox,
                { backgroundColor: `${subject.color || COLORS.primary}18` },
              ]}
            >
              <MaterialCommunityIcons
                name={subject.mcIcon || "book-outline"}
                size={28}
                color={subject.color || COLORS.primary}
              />
            </View>

            <View style={styles.subjectInfo}>
              <Text style={styles.subjectTitle}>{subject.title}</Text>
              <Text
                style={[
                  styles.subjectClass,
                  { color: subject.color || COLORS.primary },
                ]}
              >
                {subject.cls || "All levels"}
              </Text>
              <Text style={styles.subjectDesc} numberOfLines={1}>
                {subject.desc || "Ask a doubt"}
              </Text>
            </View>

            <View style={styles.arrowBox}>
              <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.askButton, { backgroundColor: data.gradient }]}
          onPress={() =>
            navigation.navigate("AskDoubt", { category: data.title })
          }
        >
          <Ionicons name="paper-plane-outline" size={22} color={COLORS.white} />
          <Text style={styles.askButtonText}>Ask Doubt in {data.title}</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentDashboard")}
        >
          <Ionicons name="home-outline" size={22} color={COLORS.muted} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentMyDoubts")}
        >
          <Ionicons name="help-circle-outline" size={23} color={COLORS.muted} />
          <Text style={styles.navText}>My Doubts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.fab}
          onPress={() => navigation.navigate("AskDoubt")}
        >
          <Ionicons name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentChat")}
        >
          <Ionicons name="chatbubble-outline" size={22} color={COLORS.muted} />
          <Text style={styles.navText}>Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentProfile")}
        >
          <Ionicons name="person-outline" size={22} color={COLORS.muted} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 12 : 4,
    paddingBottom: 110,
  },

  topHeader: { height: 46, justifyContent: "center", marginBottom: 4 },
  backButton: {
    width: 38,
    height: 38,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  hero: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 14,
  },
  heroImageBox: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroEmoji: { fontSize: 42 },
  heroTextBox: { flex: 1 },
  heroTitle: { fontSize: 22, fontWeight: "900", color: COLORS.text },
  heroSubtitle: { fontSize: 13.5, fontWeight: "900", marginTop: 4 },
  heroDescription: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
    marginTop: 4,
    lineHeight: 17,
  },

  statsCard: {
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 4,
  },
  statBorder: { borderRightWidth: 0.5, borderRightColor: COLORS.border },
  statIconBox: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.muted,
    textAlign: "center",
  },
  statValue: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 13.5,
    lineHeight: 22,
    fontWeight: "600",
    color: "#59627D",
    marginBottom: 22,
  },

  subjectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  subjectIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  subjectInfo: { flex: 1 },
  subjectTitle: { fontSize: 13.5, fontWeight: "900", color: COLORS.text },
  subjectClass: { fontSize: 11.5, fontWeight: "800", marginTop: 3 },
  subjectDesc: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
    marginTop: 2,
  },
  arrowBox: {
    width: 28,
    height: 28,
    backgroundColor: COLORS.bg,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  askButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
    }),
  },
  askButtonText: { fontSize: 15, fontWeight: "900", color: COLORS.white },

  bottomNav: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    height: 66,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
      },
      android: { elevation: 14 },
    }),
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  navText: { fontSize: 9, fontWeight: "800", color: COLORS.muted },
  fab: {
    width: 52,
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
    }),
  },
});
