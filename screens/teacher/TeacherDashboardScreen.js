

// screens/teacher/TeacherDashboardScreen.js
// FULLY UPDATED + PREMIUM + REALTIME
// MOCK TEST CATEGORIES FIXED AS HORIZONTAL SCROLLABLE ONE ROW
// VIEW ALL -> TeacherMockTestCategories

import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const { width } = Dimensions.get("window");

const COLORS = {
  white: "#FFFFFF",
  bg: "#F6F8FC",
  primary: "#006D6A",
  primaryDark: "#004D4A",
  primaryLight: "#EAF8F6",
  text: "#07123A",
  muted: "#7A859F",
  border: "#E6ECF5",
  card: "#FFFFFF",
  lightGreen: "#F1FBF9",
  accent: "#FFB800",
  newDoubt: "#E8F5E9",
  newDoubtIcon: "#2E7D32",
  pending: "#FFF8E1",
  pendingIcon: "#F9A825",
  answered: "#E3F2FD",
  answeredIcon: "#1565C0",
  shadow: "rgba(0,0,0,0.08)",
  red: "#FF3B30",

  blue: "#2F80ED",
  blueLight: "#EEF5FF",
  purple: "#7B61FF",
  purpleLight: "#F3EFFF",
  orange: "#F2994A",
  orangeLight: "#FFF5EA",
  green: "#16A66A",
  greenLight: "#EAFBF3",
  cyan: "#0891B2",
  cyanLight: "#E6FFFB",
  pink: "#EC4899",
  pinkLight: "#FCE7F3",
  navy: "#334155",
  navyLight: "#E8EEF8",
};

const MOCK_CATEGORIES_ROUTE = "TeacherMockTestCategories";

const MOCK_TEST_CARDS = [
  {
    id: "school",
    title: "School",
    subTitle: "1st–10th",
    count: "120",
    icon: "school-outline",
    color: COLORS.green,
    bg: COLORS.greenLight,
  },
  {
    id: "competitive",
    title: "Competitive",
    subTitle: "JEE/NEET",
    count: "180",
    icon: "locate-outline",
    color: COLORS.pink,
    bg: COLORS.pinkLight,
  },
  {
    id: "college",
    title: "College",
    subTitle: "Higher Ed",
    count: "85",
    icon: "library-outline",
    color: COLORS.navy,
    bg: COLORS.navyLight,
  },
  {
    id: "civils",
    title: "Civils",
    subTitle: "UPSC/PSC",
    count: "150",
    icon: "business-outline",
    color: COLORS.orange,
    bg: COLORS.orangeLight,
  },
  {
    id: "coding",
    title: "Coding",
    subTitle: "DSA/Web",
    count: "95",
    icon: "code-slash-outline",
    color: COLORS.cyan,
    bg: COLORS.cyanLight,
  },
];

const formatExperienceText = (value) => {
  const text = String(value ?? "").trim();

  if (!text) return "0 yrs";

  if (/^\d+(\.\d+)?$/.test(text)) {
    return `${text} yrs`;
  }

  return text
    .replace(/\byears?\b/gi, "yrs")
    .replace(/\s+/g, " ")
    .trim();
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

  export default function TeacherDashboardScreen({ navigation }) {
  const appContext = useAppContext();
  const currentUser = appContext?.currentUser || {};
  const teacherId = currentUser?.teacherId || currentUser?.id || "";
  const teacherDoubts = appContext?.teacherDoubts || [];
  const teacherSessions = appContext?.teacherSessions || [];
    const unreadNotifications = appContext?.unreadNotifications || [];
    const teacherMockCategories = appContext?.teacherMockCatalog || [];
    const uploadedVideos = appContext?.uploadedVideos || [];
    const teacherTuitionRequests = appContext?.teacherTuitionRequests || [];
    const declineTuitionRequest = appContext?.declineTuitionRequest;
    const UPLOADED_VIDEOS = useMemo(
      () =>
        uploadedVideos.filter(
          (video) =>
            String(video?.teacherId || "").toLowerCase() ===
            String(teacherId || "").toLowerCase()
        ),
      [teacherId, uploadedVideos]
    );
    const refreshDoubtsAndNotifications =
      appContext?.refreshDoubtsAndNotifications;
    const refreshTeacherProfile = appContext?.refreshTeacherProfile;
    const refreshTeacherMockCatalog = appContext?.refreshTeacherMockCatalog;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const goToMockCategories = () => {
    navigation.navigate(MOCK_CATEGORIES_ROUTE);
  };

  const handleAccept = (id) => {
    navigation?.navigate?.("TeacherTuitionRequests", {
      requestId: id,
    });
  };

    const handleReject = async (id) => {
      if (typeof declineTuitionRequest !== "function") {
        return;
      }

      try {
        await declineTuitionRequest(id, "Teacher declined from dashboard.");
      } catch (error) {
        console.warn("Failed to decline tuition request", error);
      }
    };

    const mockTestCards = useMemo(() => {
      const pickStyle = (title = "") => {
        const normalized = String(title).toLowerCase();

        if (normalized.includes("school")) {
          return { icon: "school-outline", color: COLORS.green, bg: COLORS.greenLight };
        }

        if (
          normalized.includes("competitive") ||
          normalized.includes("jee") ||
          normalized.includes("neet")
        ) {
          return { icon: "locate-outline", color: COLORS.pink, bg: COLORS.pinkLight };
        }

        if (normalized.includes("college")) {
          return { icon: "library-outline", color: COLORS.navy, bg: COLORS.navyLight };
        }

        if (normalized.includes("civils") || normalized.includes("upsc") || normalized.includes("psc")) {
          return { icon: "business-outline", color: COLORS.orange, bg: COLORS.orangeLight };
        }

        if (normalized.includes("coding") || normalized.includes("dsa") || normalized.includes("web")) {
          return { icon: "code-slash-outline", color: COLORS.cyan, bg: COLORS.cyanLight };
        }

        return { icon: "layers-outline", color: COLORS.primary, bg: COLORS.primaryLight };
      };

      return (teacherMockCategories || []).map((category, index) => {
        const title = category?.title || category?.name || `Category ${index + 1}`;
        const subjects = Array.isArray(category?.subjects) ? category.subjects : [];
        const totalTests = subjects.reduce((sum, subject) => {
          const listLength = Array.isArray(subject?.list) ? subject.list.length : Number(subject?.tests || 0);
          return sum + listLength;
        }, 0);
        const style = pickStyle(title);

        return {
          id: category?.id || title,
          title,
          subTitle: category?.subtitle || category?.description || `${subjects.length || 0} Subjects`,
          count: String(totalTests || subjects.length || 0),
          icon: style.icon,
          color: style.color,
          bg: style.bg,
        };
      });
    }, [teacherMockCategories]);

    useFocusEffect(
      useCallback(() => {
        void refreshDoubtsAndNotifications?.();
        if (
          currentUser?.role === "teacher" &&
          teacherId &&
          typeof refreshTeacherProfile === "function"
        ) {
          void refreshTeacherProfile(teacherId).catch(() => {});
          if (typeof refreshTeacherMockCatalog === "function") {
            void refreshTeacherMockCatalog(teacherId).catch((error) => {
              console.warn("Failed to refresh teacher mock catalog on dashboard focus", error);
            });
          }
        }
        return () => {};
      }, [currentUser?.role, refreshDoubtsAndNotifications, refreshTeacherMockCatalog, refreshTeacherProfile, teacherId])
    );

  const pendingDoubts = useMemo(
    () => teacherDoubts.filter((item) => item.status === "Pending" && !item.accepted),
    [teacherDoubts]
  );

  const inProgressDoubts = useMemo(
    () => teacherDoubts.filter((item) => item.status === "In Progress"),
    [teacherDoubts]
  );

  const answeredDoubts = useMemo(
    () => teacherDoubts.filter((item) => item.status === "Answered" || item.answered),
    [teacherDoubts]
  );

  const totalAnswered = Number(
    currentUser?.doubtsSolved ?? currentUser?.solved ?? answeredDoubts.length
  );
  const sessionEarnings = safeArray(teacherSessions).filter(
    (item) =>
      String(item.teacherId || item.tutorId || "").toLowerCase() ===
        String(teacherId || "").toLowerCase() &&
      (item.status === "Completed" ||
        item.status === "completed" ||
        item.status === "Finished" ||
        item.completed === true)
  ).length * 250;
  const totalEarnings = Number(currentUser?.paidAmount ?? currentUser?.lastPayoutAmount ?? 0);
  const paidAmount = Number(currentUser?.paidAmount ?? 0);
  const withdrawnAmount = Number(currentUser?.withdrawnAmount ?? 0);
  const pendingAmount = Number(currentUser?.pendingAmount ?? 0);
  const availableBalance = Math.max(0, paidAmount - withdrawnAmount);
  const totalSessions = Number(
    currentUser?.sessionCount ?? currentUser?.sessions ?? 0
  );
  const teacherExperience = currentUser?.experience ?? "";

  const recentDoubts = useMemo(
    () =>
      [...teacherDoubts]
        .sort((a, b) => {
          const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return bTime - aTime;
        })
        .slice(0, 3),
    [teacherDoubts]
  );

  const getTimeAgo = (date) => {
    if (!date) return "Now";

    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return "Now";
    if (mins < 60) return `${mins}m ago`;

    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;

    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const getStatusColor = (status) => {
    if (status === "Answered") return { bg: "#E3F2FD", text: "#1565C0" };
    if (status === "In Progress") return { bg: "#FFF8E1", text: "#F9A825" };
    return { bg: "#E8F5E9", text: "#2E7D32" };
  };

  const renderExploreCategoryCard = (item) => {
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.9}
        style={styles.exploreCategoryCard}
        onPress={goToMockCategories}
      >
        <View style={[styles.exploreIconBox, { backgroundColor: item.bg }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>

        <Text style={styles.exploreTitle} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={styles.exploreSub} numberOfLines={1}>
          {item.subTitle}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.bg} barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>Hi, Teacher</Text>
              <Text style={styles.wave}>👋</Text>
            </View>
            <Text style={styles.subGreeting}>Welcome back!</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.notificationBtn}
              onPress={() => navigation.navigate("TeacherNotifications")}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />

              {(pendingDoubts.length > 0 || unreadNotifications?.length > 0) && (
                <View style={styles.notificationDot}>
                  <Text style={styles.notificationCount}>
                    {pendingDoubts.length > 9 ? "9+" : pendingDoubts.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.avatarBtn}
              onPress={() => navigation.navigate("TeacherProfile")}
            >
              <Text style={styles.avatarBtnText}>ST</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* EARNINGS CARD */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsTopRow}>
            <View>
              <Text style={styles.earningsLabel}>Available Balance</Text>
              <Text style={styles.earningsAmount}>₹{availableBalance}</Text>
              <Text style={styles.earningsMonth}>After withdrawals and pending cuts</Text>
            </View>

            <View style={styles.walletIcon}>
              <Ionicons name="wallet-outline" size={34} color={COLORS.white} />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalAnswered}</Text>
              <Text style={styles.statLabel}>Doubts Solved</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {formatExperienceText(teacherExperience)}
              </Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>

          <View style={styles.earningsFooterRow}>
            <Text style={styles.earningsFooterText}>
              Total Earned: ₹{totalEarnings}
            </Text>
            <Text style={styles.earningsFooterText}>
              Paid: ₹{paidAmount}
            </Text>
            <Text style={styles.earningsFooterText}>
              Withdrawn: ₹{withdrawnAmount}
            </Text>
          </View>
        </View>

        {/* QUICK ACTION */}
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.quickActionCard}
          onPress={() => navigation.navigate("AvailableDoubts")}
        >
          <View style={styles.quickActionLeft}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={26}
                color={COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.quickTitle}>Available Doubts</Text>
              <Text style={styles.quickSub}>{pendingDoubts.length} doubts waiting</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        {/* EXPLORE CATEGORIES - HORIZONTAL SCROLLABLE */}
        <View style={styles.exploreHeader}>
          <Text style={styles.exploreHeading}>Mock Tests</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.exploreViewAllBtn}
            onPress={goToMockCategories}
          >
            <Text style={styles.exploreViewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.exploreScrollContent}
          style={styles.exploreScroll}
        >
          {mockTestCards.map(renderExploreCategoryCard)}
        </ScrollView>

        {/* OVERVIEW */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>

        <View style={styles.overviewContainer}>
          <View style={styles.overviewCard}>
            <View style={[styles.overviewIconBox, { backgroundColor: COLORS.newDoubt }]}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={22}
                color={COLORS.newDoubtIcon}
              />
            </View>
            <Text style={styles.overviewCount}>{pendingDoubts.length}</Text>
            <Text style={styles.overviewLabel}>New Doubts</Text>
          </View>

          <View style={styles.overviewCard}>
            <View style={[styles.overviewIconBox, { backgroundColor: COLORS.pending }]}>
              <Ionicons name="time-outline" size={22} color={COLORS.pendingIcon} />
            </View>
            <Text style={styles.overviewCount}>{inProgressDoubts.length}</Text>
            <Text style={styles.overviewLabel}>In Progress</Text>
          </View>

          <View style={styles.overviewCard}>
            <View style={[styles.overviewIconBox, { backgroundColor: COLORS.answered }]}>
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color={COLORS.answeredIcon}
              />
            </View>
            <Text style={styles.overviewCount}>{totalAnswered}</Text>
            <Text style={styles.overviewLabel}>Solved</Text>
          </View>
        </View>

        {/* UPLOADED VIDEOS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Uploaded Videos</Text>

          <TouchableOpacity onPress={() => navigation.navigate("UploadedVideosScreen")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {UPLOADED_VIDEOS.map((video) => (
          <TouchableOpacity
            key={video.id}
            activeOpacity={0.88}
            style={styles.videoCard}
            onPress={() => navigation.navigate("UploadVideoPlayerScreen", { video })}
          >
            <View style={[styles.videoThumb, { backgroundColor: video.color }]}>
              <Ionicons name="play-circle" size={34} color="#FFFFFF" />

              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            </View>

            <View style={styles.videoInfo}>
              <View style={styles.videoTopRow}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {video.title}
                </Text>

                <TouchableOpacity activeOpacity={0.7} style={styles.moreBtn}>
                  <Ionicons name="ellipsis-vertical" size={18} color={COLORS.muted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.videoSub}>
                {video.subject} • {video.topic}
              </Text>

              <View style={styles.videoMeta}>
                <View style={styles.metaRow}>
                  <Ionicons name="eye-outline" size={13} color={COLORS.muted} />
                  <Text style={styles.metaText}>{video.views} views</Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={13} color={COLORS.muted} />
                  <Text style={styles.metaText}>{video.uploadedAgo}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* REQUESTED FOR TUITION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Requested for Tuition</Text>

          <TouchableOpacity onPress={() => navigation.navigate("TeacherTuitionRequests")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {teacherTuitionRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="person-outline" size={50} color="#C5D2E0" />
            <Text style={styles.emptyTitle}>No Requests</Text>
            <Text style={styles.emptySub}>Tuition requests will appear here.</Text>
          </View>
        ) : (
          teacherTuitionRequests.map((request) => (
            <View key={request.id} style={styles.tuitionCard}>
              <View style={styles.tuitionLeft}>
                <View style={styles.avatarBox}>
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                  {request.status === "pending" && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.tuitionDetails}>
                  <Text style={styles.tName}>{request.studentName || request.name}</Text>

                  <Text style={styles.tSub}>
                    Subject:{" "}
                    <Text style={styles.tSubHighlight}>{request.subject}</Text>
                  </Text>

                  <Text style={styles.tTime}>
                    Preferred Time:{" "}
                    <Text style={styles.tTimeHighlight}>{request.requestedTime || request.duration}</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.tuitionActions}>
                {request.status === "pending" ? (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.88}
                      style={styles.acceptBtn}
                      onPress={() => handleAccept(request.id)}
                    >
                      <Text style={styles.acceptText}>Review</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.88}
                      style={styles.rejectBtn}
                      onPress={() => handleReject(request.id)}
                    >
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={[styles.statusChip, { backgroundColor: request.status === "accepted" ? "#E8F5E9" : "#FFF3E0" }]}>
                    <Text style={[styles.statusChipText, { color: request.status === "accepted" ? "#2E7D32" : "#C07A00" }]}>
                      {request.status}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}

        {/* RECENT DOUBTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Doubts</Text>

          <TouchableOpacity onPress={() => navigation.navigate("AvailableDoubts")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentDoubts.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="help-circle-outline" size={60} color="#C5D2E0" />
            <Text style={styles.emptyTitle}>No Doubts Yet</Text>
            <Text style={styles.emptySub}>Student doubts will appear here.</Text>
          </View>
        )}

        {recentDoubts.map((item) => {
          const statusColor = getStatusColor(item.status);

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.92}
              style={styles.doubtCard}
              onPress={() =>
                navigation.navigate("TeacherDoubtDetail", {
                  doubtId: item.id,
                  doubt: item,
                })
              }
            >
              <View style={styles.doubtTop}>
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectText}>{item.subject || "General"}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                  <Text style={[styles.statusText, { color: statusColor.text }]}>
                    {item.status || "Pending"}
                  </Text>
                </View>
              </View>

              <Text numberOfLines={2} style={styles.question}>
                {item.question}
              </Text>

              <View style={styles.mediaRow}>
                {item.audioUri && (
                  <View style={styles.mediaBadge}>
                    <Ionicons name="mic" size={13} color={COLORS.primary} />
                    <Text style={styles.mediaText}>Audio</Text>
                  </View>
                )}

                {item.videoUri && (
                  <View style={styles.mediaBadge}>
                    <Ionicons name="videocam" size={13} color={COLORS.primary} />
                    <Text style={styles.mediaText}>Video</Text>
                  </View>
                )}

                {item.documents?.length > 0 && (
                  <View style={styles.mediaBadge}>
                    <Ionicons name="document-text" size={13} color={COLORS.primary} />
                    <Text style={styles.mediaText}>{item.documents.length}</Text>
                  </View>
                )}
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.studentRow}>
                  <Ionicons
                    name="person-circle-outline"
                    size={16}
                    color={COLORS.muted}
                  />
                  <Text style={styles.studentName}>{item.studentName || "Student"}</Text>
                </View>

                <Text style={styles.time}>
                  {getTimeAgo(item.updatedAt || item.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      <TeacherBottomNavigation navigation={navigation} active="Home" />
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - 52) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 20 : 12,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  greeting: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },

  wave: {
    fontSize: 26,
    marginLeft: 4,
  },

  subGreeting: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.muted,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
    elevation: 2,
  },

  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 20,
    backgroundColor: COLORS.red,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },

  notificationCount: {
    fontSize: 8,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  avatarBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  avatarBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },

  earningsCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    padding: 22,
    marginBottom: 22,
    elevation: 7,
  },

  earningsTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  walletIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  earningsLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
  },

  earningsAmount: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.white,
    marginTop: 6,
  },

  earningsMonth: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 18,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statBox: {
    flex: 1,
    alignItems: "center",
  },

  verticalDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.white,
  },

  statLabel: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  earningsFooterRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },

  earningsFooterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
  },

  quickActionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  quickActionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  quickTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },

  quickSub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
  },

  exploreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  exploreHeading: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  exploreViewAllBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },

  exploreViewAllText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },

  exploreScroll: {
    marginHorizontal: -20,
    marginBottom: 26,
  },

  exploreScrollContent: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 12,
  },

  exploreCategoryCard: {
    width: 116,
    height: 112,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    elevation: 2,
  },

  exploreIconBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  exploreTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 5,
  },

  exploreSub: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 14,
  },

  seeAll: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },

  overviewContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
  },

  overviewCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  overviewIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  overviewCount: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
  },

  overviewLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },

  videoCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 14,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  videoThumb: {
    width: 130,
    height: 90,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    overflow: "hidden",
  },

  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  durationText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  videoInfo: {
    flex: 1,
    marginLeft: 14,
  },

  videoTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  videoTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
    lineHeight: 20,
  },

  moreBtn: {
    paddingLeft: 6,
    paddingTop: 2,
  },

  videoSub: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
  },

  videoMeta: {
    flexDirection: "row",
    marginTop: 10,
    flexWrap: "wrap",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    marginBottom: 2,
  },

  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "600",
  },

  tuitionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  tuitionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    flexShrink: 0,
  },

  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  tuitionDetails: {
    marginLeft: 12,
    flex: 1,
  },

  tName: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  tSub: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "600",
  },

  tSubHighlight: {
    color: COLORS.primary,
    fontWeight: "800",
  },

  tTime: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "600",
  },

  tTimeHighlight: {
    color: COLORS.text,
    fontWeight: "800",
  },

  tuitionActions: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    marginLeft: 10,
  },

  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  statusChipText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },

  acceptBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    minWidth: 80,
  },

  acceptText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 13,
  },

  rejectBtn: {
    borderWidth: 1.5,
    borderColor: "#FF4D4F",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    minWidth: 80,
  },

  rejectText: {
    color: "#FF4D4F",
    fontWeight: "900",
    fontSize: 13,
  },

  doubtCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },

  doubtTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  subjectBadge: {
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  subjectText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  question: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 14,
  },

  mediaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },

  mediaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF8F6",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },

  mediaText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  studentName: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.muted,
  },

  time: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptySub: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 24,
    color: COLORS.muted,
  },
});
