// screens/teacher/TeacherNotificationScreen.js

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

const COLORS = {
  bg: "#F6FAFF",
  white: "#FFFFFF",
  primary: "#006D6A",
  primarySoft: "#EAF7F4",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E7EEF8",
  blue: "#1677FF",
  green: "#0E9F6E",
  orange: "#F59E0B",
  purple: "#7B61FF",
  red: "#EF4444",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "doubt", label: "Doubts" },
  { key: "student", label: "Students" },
  { key: "class", label: "Classes" },
];

const getTimeText = (dateValue) => {
  if (!dateValue) return "Now";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Now";

  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  if (hour < 24) return `${hour} hr ago`;
  if (day < 7) return `${day} day ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getIconData = (type = "") => {
  const clean = String(type).toLowerCase();

  if (clean.includes("doubt")) {
    return {
      icon: "chatbubble-ellipses",
      color: COLORS.blue,
      bg: "#EAF2FF",
    };
  }

  if (clean.includes("chat")) {
    return {
      icon: "chatbubble-ellipses-outline",
      color: COLORS.blue,
      bg: "#EAF2FF",
    };
  }

  if (clean.includes("student") || clean.includes("request")) {
    return {
      icon: "person-add",
      color: COLORS.green,
      bg: "#E8F7EF",
    };
  }

  if (clean.includes("session") || clean.includes("class")) {
    return {
      icon: "videocam",
      color: COLORS.purple,
      bg: "#F2EFFF",
    };
  }

  if (clean.includes("video")) {
    return {
      icon: "play-circle",
      color: COLORS.red,
      bg: "#FFF1F2",
    };
  }

  if (clean.includes("mock")) {
    return {
      icon: "document-text",
      color: COLORS.orange,
      bg: "#FFF7E6",
    };
  }

  return {
    icon: "notifications",
    color: COLORS.primary,
    bg: COLORS.primarySoft,
  };
};

export default function TeacherNotificationScreen({ navigation }) {
  const {
    notifications = [],
    currentUser,
    pendingDoubts = [],
    inProgressDoubts = [],
    answeredDoubts = [],
    tuitionRequests = [],
    sessions = [],
    uploadedVideos = [],
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useAppContext();

  const [activeFilter, setActiveFilter] = useState("all");

  const generatedNotifications = useMemo(() => {
    const items = [];

    pendingDoubts.forEach((doubt) => {
      items.push({
        id: `pending_${doubt.id}`,
        title: "New Student Doubt",
        message: `${doubt.studentName || "Student"} asked ${
          doubt.subject || "a subject"
        } doubt${doubt.topic ? `: ${doubt.topic}` : ""}.`,
        type: "doubt",
        read: doubt.teacherViewed === true,
        createdAt: doubt.createdAt || doubt.updatedAt,
        route: "AvailableDoubts",
      });
    });

    inProgressDoubts.forEach((doubt) => {
      items.push({
        id: `progress_${doubt.id}`,
        title: "Doubt In Progress",
        message: `${doubt.studentName || "Student"}'s doubt is waiting for your answer.`,
        type: "doubt",
        read: doubt.teacherViewed === true,
        createdAt: doubt.updatedAt || doubt.createdAt,
        route: "AvailableDoubts",
      });
    });

    answeredDoubts.forEach((doubt) => {
      if (doubt.reviewAdded) {
        items.push({
          id: `review_${doubt.id}`,
          title: "Student Review Received",
          message: `${doubt.studentName || "Student"} gave ${
            doubt.rating || 0
          } star rating.`,
          type: "student",
          read: true,
          createdAt: doubt.updatedAt || doubt.answeredAt,
          route: "AvailableDoubts",
        });
      }
    });

    tuitionRequests.forEach((request) => {
      items.push({
        id: `request_${request.id}`,
        title: "Tuition Request",
        message: `${request.studentName || "Student"} requested ${
          request.subject || "class"
        } ${request.topic ? `for ${request.topic}` : ""}.`,
        type: "student",
        read: request.teacherViewed === true,
        createdAt: request.createdAt || request.updatedAt,
        route: "TeacherSchedule",
      });
    });

    sessions.forEach((session) => {
      items.push({
        id: `session_${session.id}`,
        title: "Class Session Update",
        message: `${session.studentName || "Student"} - ${
          session.subject || "Live Class"
        } is ${session.status || "updated"}.`,
        type: "class",
        read: session.teacherViewed === true,
        createdAt: session.updatedAt || session.createdAt,
        route: "TeacherSchedule",
      });
    });

    const teacherVideos = uploadedVideos.filter(
      (video) =>
        String(video?.teacherId || "").toLowerCase() ===
        String(currentUser?.teacherId || currentUser?.id || "").toLowerCase()
    );

    teacherVideos.forEach((video) => {
      items.push({
        id: `video_${video.id}`,
        title: "Video Saved",
        message: `${video.title || "Your video"} is ${
          video.status || "uploaded"
        }.`,
        type: "video",
        read: true,
        createdAt: video.createdAt || video.updatedAt,
        route: "UploadedVideosScreen",
      });
    });

    return items;
  }, [
    pendingDoubts,
    inProgressDoubts,
    answeredDoubts,
    tuitionRequests,
    sessions,
    uploadedVideos,
    currentUser,
  ]);

  const allNotifications = useMemo(() => {
    const contextNotifications = notifications
      .filter((item) =>
        item.type === "teacher" ||
        item.type === "mock_test" ||
        item.type === "chat"
      )
      .map((item) => ({
        ...item,
        route:
          item.type === "mock_test"
            ? "TeacherMockTestCategories"
            : item.type === "chat"
              ? "PreClassChat"
              : "AvailableDoubts",
      }));

    return [...contextNotifications, ...generatedNotifications].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
  }, [notifications, generatedNotifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return allNotifications;
    if (activeFilter === "unread") {
      return allNotifications.filter((item) => !item.read);
    }

    return allNotifications.filter((item) =>
      String(item.type || "").toLowerCase().includes(activeFilter)
    );
  }, [activeFilter, allNotifications]);

  const unreadCount = allNotifications.filter((item) => !item.read).length;

  const handleOpenNotification = (item) => {
    if (item.id && !String(item.id).includes("_")) {
      markNotificationRead?.(item.id);
    }

    if (item.type === "chat") {
      navigation?.navigate?.("PreClassChat", {
        sessionId: item.relatedTestId || item.relatedId || item.sessionId || item.id,
        session: {
          sessionId: item.relatedTestId || item.relatedId || item.sessionId || item.id,
          subject: item.categoryTitle || "Pre-class chat",
          topic: item.message || "New chat message",
          studentName: item.studentName || item.recipientName || "Student",
        },
      });
      return;
    }

    if (item.route) {
      navigation?.navigate?.(item.route);
    }
  };

  const handleClear = () => {
    global.showAlert("Clear Notifications", "Do you want to clear notifications?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => clearNotifications?.(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.8}
          onPress={() => navigation?.goBack?.()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.8}
          onPress={handleClear}
        >
          <Ionicons name="trash-outline" size={21} color={COLORS.red} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <View style={styles.heroIcon}>
              <Ionicons name="notifications" size={32} color={COLORS.primary} />
            </View>

            <View style={styles.heroTextBox}>
              <Text style={styles.heroTitle}>Teacher Alerts</Text>
              <Text style={styles.heroSub}>
                Student doubts, class requests, sessions, reviews and updates.
              </Text>
            </View>
          </View>

          <View style={styles.badgeBox}>
            <Text style={styles.badgeCount}>{unreadCount}</Text>
            <Text style={styles.badgeLabel}>Unread</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.85}
            onPress={() => markAllNotificationsRead?.()}
          >
            <Ionicons name="checkmark-done" size={18} color={COLORS.primary} />
            <Text style={styles.actionText}>Mark all read</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate?.("AvailableDoubts")}
          >
            <Ionicons name="chatbubbles" size={18} color={COLORS.primary} />
            <Text style={styles.actionText}>Open doubts</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;

            return (
              <TouchableOpacity
                key={filter.key}
                activeOpacity={0.85}
                style={[styles.filterChip, isActive && styles.activeFilterChip]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.activeFilterText,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="notifications-off-outline"
              size={44}
              color={COLORS.muted}
            />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>
              Student doubts, requests and class updates will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.listBox}>
            {filteredNotifications.map((item) => {
              const iconData = getIconData(item.type);

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.86}
                  style={[
                    styles.notificationCard,
                    !item.read && styles.unreadCard,
                  ]}
                  onPress={() => handleOpenNotification(item)}
                >
                  <View
                    style={[
                      styles.notificationIcon,
                      { backgroundColor: iconData.bg },
                    ]}
                  >
                    <Ionicons
                      name={iconData.icon}
                      size={22}
                      color={iconData.color}
                    />
                  </View>

                  <View style={styles.notificationInfo}>
                    <View style={styles.notificationTop}>
                      <Text style={styles.notificationTitle} numberOfLines={1}>
                        {item.title}
                      </Text>

                      {!item.read && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.notificationMsg} numberOfLines={2}>
                      {item.message}
                    </Text>

                    <View style={styles.metaRow}>
                      <Ionicons
                        name="time-outline"
                        size={13}
                        color={COLORS.muted}
                      />
                      <Text style={styles.timeText}>
                        {getTimeText(item.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TeacherBottomNavigation navigation={navigation} active="Profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    height: 56,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "android" ? 6 : 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === "ios" ? 150 : 135,
  },

  heroCard: {
    marginTop: 12,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  heroTextBox: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  heroSub: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.muted,
  },

  badgeBox: {
    minWidth: 64,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    alignItems: "center",
  },

  badgeCount: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.white,
  },

  badgeLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.white,
  },

  actionRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },

  actionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  actionText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },

  filterContent: {
    paddingVertical: 14,
    gap: 10,
  },

  filterChip: {
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.muted,
  },

  activeFilterText: {
    color: COLORS.white,
  },

  listBox: {
    gap: 10,
  },

  notificationCard: {
    minHeight: 82,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  unreadCard: {
    borderColor: "#BFE8E2",
    backgroundColor: "#FBFFFE",
  },

  notificationIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  notificationInfo: {
    flex: 1,
  },

  notificationTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },

  notificationMsg: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.muted,
  },

  metaRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  timeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
  },

  emptyCard: {
    marginTop: 18,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptySub: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },
});
