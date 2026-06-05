


// screens/student/DoubtStatusScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const COLORS = {
  bg: "#F6FAFF",
  white: "#FFFFFF",
  primary: "#003B8E",
  teal: "#006D6A",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E7EEF8",
  greenBg: "#EAF7F4",
  greenText: "#006D6A",
  orangeBg: "#FFF4E5",
  orangeText: "#E27800",
  iconBlueBg: "#EEF3FF",
  iconOrangeBg: "#FFF0E6",
  iconGreenBg: "#EAF7F4",
  iconGrayBg: "#F1F3F6",
};

const TABS = ["All", "Pending", "Answered", "Closed"];

const DOUBTS = [
  {
    id: "1",
    title: "Photosynthesis in Plants",
    meta: "Science • Class 10",
    time: "2 min ago",
    status: "Answered",
    iconType: "ion",
    icon: "document-text-outline",
    iconBg: COLORS.iconBlueBg,
    iconColor: "#284FBA",
    subject: "Science",
    classLabel: "Class 10",
    askedOn: "12 May, 10:30 AM",
    question: "What is the process of photosynthesis and how does it occur in plants?",
    attachments: ["Question.jpg", "Diagram.png"],
    emoji: "🌿",
  },
  {
    id: "2",
    title: "Limits and Continuity",
    meta: "Mathematics • JEE",
    time: "10 min ago",
    status: "Pending",
    iconType: "mci",
    icon: "math-integral-box",
    iconBg: COLORS.iconOrangeBg,
    iconColor: COLORS.orangeText,
    subject: "Mathematics",
    classLabel: "JEE",
    askedOn: "12 May, 9:00 AM",
    question: "Explain the concept of limits and continuity with examples.",
    attachments: [],
    emoji: "📐",
  },
  {
    id: "3",
    title: "Indian Polity - Fundamental Rights",
    meta: "UPSC • Polity",
    time: "1 hour ago",
    status: "Answered",
    iconType: "ion",
    icon: "people-outline",
    iconBg: COLORS.iconGreenBg,
    iconColor: COLORS.teal,
    subject: "Polity",
    classLabel: "UPSC",
    askedOn: "12 May, 8:00 AM",
    question: "What are the fundamental rights guaranteed under the Indian Constitution?",
    attachments: [],
    emoji: "🏛️",
  },
  {
    id: "4",
    title: "Vector and 3D Geometry",
    meta: "Physics • Class 12",
    time: "2 hours ago",
    status: "Pending",
    iconType: "ion",
    icon: "cube-outline",
    iconBg: COLORS.iconGrayBg,
    iconColor: "#596579",
    subject: "Physics",
    classLabel: "Class 12",
    askedOn: "11 May, 5:00 PM",
    question: "How do we solve problems involving vectors and 3D geometry?",
    attachments: ["Question.jpg"],
    emoji: "⚛️",
  },
];

export default function DoubtStatusScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("All");

  const filteredDoubts =
    activeTab === "All"
      ? DOUBTS
      : DOUBTS.filter((item) => item.status === activeTab);

  const renderIcon = (item) => {
    if (item.iconType === "mci") {
      return (
        <MaterialCommunityIcons
          name={item.icon}
          size={21}
          color={item.iconColor}
        />
      );
    }
    return <Ionicons name={item.icon} size={20} color={item.iconColor} />;
  };

  const renderItem = ({ item }) => {
    const isAnswered = item.status === "Answered";

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        // FIX: navigate to DoubtDetail with full doubt object
        onPress={() => navigation.navigate("DoubtDetail", { doubt: item })}
      >
        <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
          {renderIcon(item)}
        </View>

        <View style={styles.cardContent}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {item.title}
          </Text>
          <Text style={styles.cardMeta}>{item.meta}</Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: isAnswered ? COLORS.greenBg : COLORS.orangeBg,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: isAnswered ? COLORS.greenText : COLORS.orangeText,
              },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Doubt Status</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.headerBtn}
          onPress={() => navigation.navigate("StudentNotification")}
        >
          <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.85}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredDoubts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.bottomNav}>
        {/* FIX: "StudentHome" → "StudentDashboard" */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentDashboard")}
        >
          <Ionicons name="home-outline" size={20} color={COLORS.muted} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentMyDoubts")}
        >
          <Ionicons name="help-circle" size={20} color={COLORS.primary} />
          <Text style={[styles.navText, styles.activeNavText]}>My Doubts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.plusButton}
          onPress={() => navigation.navigate("AskDoubt")}
        >
          <Ionicons name="add" size={29} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentChat")}
        >
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.muted} />
          <Text style={styles.navText}>Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentProfile")}
        >
          <Ionicons name="person-outline" size={20} color={COLORS.muted} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 8 : 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerBtn: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 15,
    gap: 8,
  },

  tab: {
    paddingHorizontal: 15,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTab: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.text,
  },

  activeTabText: {
    color: COLORS.white,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 96,
  },

  card: {
    minHeight: 76,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  cardContent: {
    flex: 1,
    paddingRight: 8,
  },

  cardTitle: {
    fontSize: 12.5,
    fontWeight: "900",
    color: COLORS.text,
  },

  cardMeta: {
    marginTop: 4,
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.muted,
  },

  cardTime: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.muted,
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 9.5,
    fontWeight: "900",
  },

  bottomNav: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    height: 66,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 5,
    elevation: 10,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    marginTop: 3,
    fontSize: 8.8,
    fontWeight: "800",
    color: COLORS.muted,
  },

  activeNavText: {
    color: COLORS.primary,
  },

  plusButton: {
    width: 52,
    height: 52,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
});