
// screens/student/StudentDashboardScreen.js
// FULLY UPDATED + REALTIME + PREMIUM + MOCK TESTS CARD
// NO MISSING CODE — PRODUCTION READY — EXPO SAFE — ANDROID SAFE

import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Animated,
  RefreshControl,
  Dimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import StudentBottomNavigation from "../../components/StudentBottomNavigation";
import { useAppContext } from "../../context/AppContext";
import { buildStudentCategoriesFromTutors } from "./studentCategoryUtils";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#F2F7FF",
  white: "#FFFFFF",
  primary: "#006D6A",
  primaryLight: "#E6F5F4",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E2EBF6",
  streakBg: "#FFF8EC",
  streakBorder: "#FFE4A0",
  streakText: "#9A6000",
  streakSub: "#B08030",
  streakCount: "#C07A00",
  red: "#FF4757",
  green: "#00A86B",
  premium: "#6C4DFF",
  purple: "#7C3AED",
  purpleLight: "#EDE9FE",
};

// ─────────────────────────────────────────────
// FADE IN ANIMATION
// ─────────────────────────────────────────────

const FadeIn = ({ delay = 0, children, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// QUESTION CARD
// ─────────────────────────────────────────────

const QuestionCard = ({ emoji, title, subject, badgeType, delay, onPress }) => {
  const badgeStyles = {
    answered: { bg: "#E6F5F4", text: "#006D6A", label: "Answered" },
    pending: { bg: "#FFF5E0", text: "#C07A00", label: "Pending" },
    review: { bg: "#EAF1FD", text: "#1A5FBB", label: "In Review" },
  };
  const badge = badgeStyles[badgeType] || badgeStyles.answered;

  return (
    <FadeIn delay={delay}>
      <TouchableOpacity
        activeOpacity={0.84}
        style={styles.questionCard}
        onPress={onPress}
      >
        <View style={styles.questionIconBox}>
          <Text style={{ fontSize: 20 }}>{emoji}</Text>
        </View>
        <View style={styles.questionInfo}>
          <Text style={styles.questionTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.questionSub}>{subject}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
      </TouchableOpacity>
    </FadeIn>
  );
};

const formatExperienceText = (value) => {
  const text = String(value ?? "").trim();

  if (!text) return "";

  if (/^\d+(\.\d+)?$/.test(text)) {
    return `${text} yrs`;
  }

  return text
    .replace(/\byears?\b/gi, "yrs")
    .replace(/\s+/g, " ")
    .trim();
};

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function StudentDashboardScreen({ navigation }) {
  const {
        allDoubts,
        unreadNotifications,
        currentUser,
        getStudentMockTests,
        mockTestResults,
        mockCategories,
        uploadedVideos,
        tutors,
    } = useAppContext();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  useFocusEffect(
    useCallback(() => {
      return () => {};
    }, [allDoubts])
  );

  const categories = useMemo(
    () => buildStudentCategoriesFromTutors(tutors).slice(0, 3),
    [tutors]
  );

  const legacyCategories = useMemo(
    () =>
      (Array.isArray(mockCategories) ? mockCategories : [])
        .filter(Boolean)
        .slice(0, 3)
        .map((category, index) => ({
          id: category.id || category.title || `category-${index}`,
          title: category.title || "Category",
          subtitle: category.subtitle || category.description || "",
          emoji: category.emoji || "📚",
        })),
    [mockCategories]
  );

  const explanationVideos = useMemo(
    () => (Array.isArray(uploadedVideos) ? uploadedVideos : []).slice(0, 3),
    [uploadedVideos]
  );

  const availableTutors = useMemo(
    () =>
      (Array.isArray(tutors) ? tutors : [])
        .filter((tutor) => tutor && (tutor.teacherId || tutor.id))
        .slice(0, 3)
        .map((tutor) => ({
          id: tutor.id || tutor.teacherId,
          tutor,
          name: tutor.name || tutor.teacherName || "Teacher",
          subject: tutor.subject || tutor.subjectExpertise || "General Tutor",
          rating: tutor.verified ? "Approved" : "Pending",
          price:
            tutor.fee ||
            (tutor.experience ? `${formatExperienceText(tutor.experience)} exp` : "Available"),
        })),
    [tutors]
  );
  // ── Mock Test Stats ──────────────────────────
  const currentStudentId =
    currentUser?.studentId || currentUser?.id || currentUser?.userId || "";
  const isPremiumUser =
    currentUser?.isPremium ||
    currentUser?.premiumAccess ||
    String(currentUser?.subscriptionStatus || "").toLowerCase() === "active";
  const freeStudyUsesLeft = Number(currentUser?.freeDoubtsLeft);
  const remainingStudyUses = Number.isFinite(freeStudyUsesLeft)
    ? Math.max(freeStudyUsesLeft, 0)
    : 3;
  const shouldPromptPremium = !isPremiumUser && remainingStudyUses <= 0;
  const studyCardLabel = isPremiumUser
    ? "ACTIVE PREMIUM"
    : shouldPromptPremium
    ? "GO PREMIUM"
    : "FREE STUDY USES LEFT";
  const studyCardValue = isPremiumUser ? "∞" : String(remainingStudyUses);
  const studyCardTotal = isPremiumUser ? "" : "/3";
  const premiumBannerTitle = isPremiumUser ? "✓ Active Premium" : "✨ Go Premium";
  const premiumBannerSub = "Unlimited doubts · Expert tutors";
  const premiumBannerPill = isPremiumUser ? "Active Premium" : "Upgrade →";
  const askDoubtBlocked = shouldPromptPremium;
  const askDoubtIcon = askDoubtBlocked ? "lock-closed-outline" : "help-circle-outline";
  const askDoubtLabel = askDoubtBlocked ? "Go Premium" : "Ask Doubt";
  const askDoubtTarget = askDoubtBlocked ? "SubscriptionPlans" : "AskDoubt";

    const mockTestDashboard = useMemo(() => {
        const allTests = typeof getStudentMockTests === "function" ? getStudentMockTests() : [];
        const publishedTests = Array.isArray(allTests) ? allTests.filter(Boolean) : [];
        const studentResults = Array.isArray(mockTestResults)
            ? mockTestResults.filter((result) => {
                const resultStudentId = result?.studentId || result?.student?.id || result?.student?.studentId || "";
                return String(resultStudentId || "").trim() === String(currentStudentId || "").trim();
            })
            : [];

        const completedTestIds = new Set(
            studentResults
                .map((result) => result?.testId || result?.mockTestId || result?.id)
                .filter(Boolean)
                .map((value) => String(value))
        );

        const isCompleted = (test) => {
            const testId = test?.id || test?.testId || test?.mockTestId;
            return testId ? completedTestIds.has(String(testId)) : false;
        };

        const upcomingTests = publishedTests.filter((test) => !isCompleted(test) && Number(test?.attempts || 0) === 0);
        const ongoingTests = publishedTests.filter((test) => !isCompleted(test) && Number(test?.attempts || 0) > 0);
        const completedTests = studentResults.filter(Boolean);

        const stats = [
            { label: "Upcoming", count: upcomingTests.length, color: "#E8F5E9", textColor: "#2E7D32", icon: "calendar-outline" },
            { label: "Ongoing", count: ongoingTests.length, color: "#FFF3E0", textColor: "#E65100", icon: "time-outline" },
            { label: "Completed", count: completedTests.length, color: "#E3F2FD", textColor: "#1565C0", icon: "checkmark-circle-outline" },
        ];

        const formatMockTestTitle = (test) =>
            test?.title ||
            test?.sub ||
            test?.subjectName ||
            test?.categoryTitle ||
            test?.subjectId ||
            "Mock Test";

        const formatMockTestMeta = (test) => {
            const questionCount = Number(test?.questions || test?.questionCount || test?.questionList?.length || 0);
            const duration = test?.duration || test?.time || "";
            const parts = [];

            if (questionCount > 0) {
                parts.push(`${questionCount} Questions`);
            }

            if (duration) {
                parts.push(String(duration));
            }

            if (parts.length > 0) {
                return parts.join(" • ");
            }

            return test?.level || test?.sub || test?.categoryTitle || "Published test";
        };

        const formatMockTestDate = (test) => {
            const sourceDate = test?.createdAt || test?.updatedAt;
            if (!sourceDate) return "";

            const date = new Date(sourceDate);
            if (Number.isNaN(date.getTime())) return "";

            return date.toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        };

        const buildCard = (test, badge, badgeColor, badgeTextColor) => ({
            key: `${badge.toLowerCase()}-${test?.id || test?.testId || test?.title || badge}`,
            title: formatMockTestTitle(test),
            subtitle: [test?.subjectName || test?.subjectId || null, test?.categoryTitle || null, test?.level || null]
                .filter(Boolean)
                .join(" • "),
            meta: formatMockTestMeta(test),
            dateLabel: formatMockTestDate(test),
            badge,
            badgeColor,
            badgeTextColor,
        });

        const previewSource = [
            ...upcomingTests,
            ...ongoingTests,
            ...publishedTests,
        ].filter(Boolean);

        const previewCards = previewSource.slice(0, 2).map((test) => {
            const attempts = Number(test?.attempts || 0);
            const badge = attempts > 0 ? "Ongoing" : "Upcoming";
            const badgeColor = attempts > 0 ? "#FFF3E0" : "#E8F5E9";
            const badgeTextColor = attempts > 0 ? "#E65100" : "#2E7D32";
            return buildCard(test, badge, badgeColor, badgeTextColor);
        });

        return { stats, previewCards };
    }, [currentStudentId, getStudentMockTests, mockTestResults]);

    const mockTestStats = mockTestDashboard.stats;
    const mockTestPreviewCards = mockTestDashboard.previewCards;

  // ── Recent doubts ───────────────────────────
  const recentQuestions = useMemo(() => {
    return [...allDoubts]
      .sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 5)
      .map((item) => ({
        emoji: item.emoji || "📘",
        title: item.question || "Student Doubt",
        subject: `${item.subject || "General"} • ${item.classLabel || "Class"}`,
        type:
          item.status === "Answered" || item.answered
            ? "answered"
            : item.status === "In Progress"
            ? "review"
            : "pending",
        doubt: item,
      }));
  }, [allDoubts]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

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
        {/* ── TOP BAR ── */}
        <FadeIn delay={0}>
          <View style={styles.topBar}>
            <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
              <Ionicons name="menu" size={20} color={COLORS.text} />
            </TouchableOpacity>

            <Text style={styles.appName}>QLEARO</Text>

            <View style={styles.topBarRight}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.iconBtn}
                onPress={() => navigation.navigate("StudentNotification")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={COLORS.text}
                />
                {unreadNotifications.length > 0 && (
                  <View style={styles.notifyDot}>
                    <Text style={styles.notifyText}>
                      {unreadNotifications.length > 9
                        ? "9+"
                        : unreadNotifications.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate("StudentProfile")}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {(currentUser?.name || "ST").substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </FadeIn>

        {/* ── GREETING ── */}
        <FadeIn delay={60}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>
              Hi, {currentUser?.name || "Student"} 👋
            </Text>
            <Text style={styles.greetingSub}>What do you want to learn today?</Text>
          </View>
        </FadeIn>

        {/* ── SEARCH ── */}
        <FadeIn delay={90}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color={COLORS.muted} />
            <TextInput
              placeholder="Search any question or topic…"
              placeholderTextColor={COLORS.muted}
              style={styles.searchInput}
            />
            <TouchableOpacity activeOpacity={0.8} style={styles.filterBtn}>
              <Ionicons name="options-outline" size={15} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* ── DOUBTS ROW ── */}
        <FadeIn delay={120}>
          <View style={styles.doubtRow}>
            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.freeCard}
              onPress={() => navigation.navigate("FreeDoubtsLeft")}
            >
              <Text style={styles.freeLabel}>{studyCardLabel}</Text>
              <View style={styles.freeCountRow}>
                <Text style={styles.freeCount}>
                  {studyCardValue}
                </Text>
                <Text style={styles.freeTotal}>{studyCardTotal}</Text>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: isPremiumUser
                        ? "100%"
                        : `${Math.max(0, Math.min(remainingStudyUses / 3, 1)) * 100}%`,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.askBtn}
              onPress={() => navigation.navigate(askDoubtTarget)}
            >
              <View style={styles.askIconBox}>
                <Ionicons name={askDoubtIcon} size={22} color={COLORS.white} />
              </View>
              <Text style={styles.askLabel}>{askDoubtLabel}</Text>
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* ── STREAK ── */}
        <FadeIn delay={170}>
          <View style={styles.streakCard}>
            <Text style={{ fontSize: 26 }}>🔥</Text>
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>Daily Streak</Text>
              <Text style={styles.streakSub}>Keep it up — you're on a roll!</Text>
            </View>
            <Text style={styles.streakCount}>7d</Text>
          </View>
        </FadeIn>

        {/* ── PREMIUM BANNER ── */}
        <FadeIn delay={200}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.banner}
            onPress={() => navigation.navigate("SubscriptionPlans")}
          >
            <View>
              <Text style={styles.bannerTitle}>{premiumBannerTitle}</Text>
              <Text style={styles.bannerSub}>{premiumBannerSub}</Text>
            </View>
            <View style={styles.bannerPill}>
              <Text style={styles.bannerPillText}>{premiumBannerPill}</Text>
            </View>
          </TouchableOpacity>
        </FadeIn>

        {/* ── MOCK TESTS SECTION ── */}
        <FadeIn delay={230}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Mock Tests</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.viewAllPill}
              onPress={() => navigation.navigate("MockTestCategories")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Mock Test Stats Row */}
          <View style={styles.mockStatsRow}>
            {mockTestStats.map((stat) => (
              <View
                key={stat.label}
                style={[styles.mockStatCard, { backgroundColor: stat.color }]}
              >
                <Ionicons name={stat.icon} size={18} color={stat.textColor} />
                <Text style={[styles.mockStatCount, { color: stat.textColor }]}>
                  {stat.count}
                </Text>
                <Text style={[styles.mockStatLabel, { color: stat.textColor }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Mock Test Quick Access Card */}
          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.mockTestCard}
            onPress={() => navigation.navigate("MockTestCategories")}
          >
            <View style={styles.mockTestLeft}>
              <View style={styles.mockTestIconBox}>
                <Ionicons name="document-text-outline" size={22} color={COLORS.purple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mockTestTitle}>{mockTestPreviewCards?.[0]?.title || "No tests yet"}</Text>
                <Text style={styles.mockTestMeta}>
                  {mockTestPreviewCards?.[0]?.meta || "Published tests will appear here"}
                </Text>
                <View style={styles.mockTestDateRow}>
                  <Ionicons name="calendar-outline" size={11} color={COLORS.muted} />
                  <Text style={styles.mockTestDate}>{mockTestPreviewCards?.[0]?.dateLabel || "Backend data only"}</Text>
                </View>
              </View>
            </View>
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingBadgeText}>{mockTestPreviewCards?.[0]?.badge || "Upcoming"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.mockTestCard}
            onPress={() => navigation.navigate("MockTestCategories")}
          >
            <View style={styles.mockTestLeft}>
              <View style={[styles.mockTestIconBox, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="git-branch-outline" size={22} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mockTestTitle}>{mockTestPreviewCards?.[1]?.title || "No tests yet"}</Text>
                <Text style={styles.mockTestMeta}>{mockTestPreviewCards?.[1]?.meta || "Published tests will appear here"}</Text>
                <View style={styles.mockTestDateRow}>
                  <Ionicons name="calendar-outline" size={11} color={COLORS.muted} />
                  <Text style={styles.mockTestDate}>{mockTestPreviewCards?.[1]?.dateLabel || "Backend data only"}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.upcomingBadge, { backgroundColor: "#FFF3E0" }]}>
              <Text style={[styles.upcomingBadgeText, { color: mockTestPreviewCards?.[1]?.badgeTextColor || "#E65100" }]}>
                {mockTestPreviewCards?.[1]?.badge || "Upcoming"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Start a Test CTA */}
          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.startTestBtn}
            onPress={() => navigation.navigate("MockTestCategories")}
          >
            <Ionicons name="play-circle-outline" size={18} color={COLORS.white} />
            <Text style={styles.startTestBtnText}>Explore All Mock Tests</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </FadeIn>

        {/* ── CATEGORIES ── */}
        <FadeIn delay={260}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Explore Categories</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.viewAllPill}
              onPress={() => navigation.navigate("StudentCategories")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.catRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.84}
                style={styles.catCard}
              >
                <View style={styles.catIconBox}>
                  <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
                </View>
                <Text style={styles.catTitle}>{cat.title}</Text>
                <Text style={styles.catSub}>{cat.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FadeIn>

        {/* ── EXPLANATION VIDEOS ── */}
        <FadeIn delay={290}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Explanation Videos</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.viewAllPill}
              onPress={() => navigation.navigate("ExplanationVideos")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {explanationVideos.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="videocam-outline" size={30} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No videos yet</Text>
              <Text style={styles.emptySub}>Uploaded videos will appear here.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 10 }}
            >
              {explanationVideos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  activeOpacity={0.88}
                  style={styles.videoCard}
                  onPress={() =>
                    navigation.navigate("VideoPlayerScreen", { video })
                  }
                >
                  <View
                    style={[
                      styles.videoThumbnail,
                      { backgroundColor: video.color || COLORS.primary },
                    ]}
                  >
                    <Ionicons name="play" size={30} color="#FFFFFF" />
                    <View style={styles.videoDuration}>
                      <Text style={styles.videoDurationText}>
                        {video.duration || "00:00"}
                      </Text>
                    </View>
                  </View>
                  <Text numberOfLines={2} style={styles.videoTitle}>
                    {video.title}
                  </Text>
                  <Text style={styles.videoSub}>
                    {video.className || video.subject || ""}
                    {video.topic ? ` • ${video.topic}` : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </FadeIn>

        {/* ── AVAILABLE TUTORS ── */}
        <FadeIn delay={320}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Available Tutors</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.viewAllPill}
              onPress={() => navigation.navigate("StudentTutorsScreen")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 10 }}
          >
            {availableTutors.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="person-outline" size={30} color={COLORS.muted} />
                <Text style={styles.emptyTitle}>No tutors yet</Text>
                <Text style={styles.emptySub}>Approved teachers will appear here.</Text>
              </View>
            ) : (
              availableTutors.map((tutor) => (
                <TouchableOpacity
                  key={tutor.id}
                  activeOpacity={0.88}
                  style={styles.tutorCard}
                >
                  <View style={styles.tutorAvatar}>
                    <Ionicons name="person" size={26} color="#FFFFFF" />
                  </View>
                  <Text style={styles.tutorName}>{tutor.name}</Text>
                  <Text style={styles.tutorSubject}>{tutor.subject}</Text>
                  <Text style={styles.tutorRating}>⭐ {tutor.rating}</Text>
                  <Text style={styles.tutorPrice}>{tutor.price}</Text>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    style={styles.requestBtn}
                    onPress={() =>
                      navigation.navigate("TutorRequestScreen", { tutor: tutor.tutor })
                    }
                  >
                    <Text style={styles.requestBtnText}>Request Tutoring</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </FadeIn>

        {/* ── RECENT QUESTIONS ── */}
        <FadeIn delay={360}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Questions</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.viewAllPill}
              onPress={() => navigation.navigate("StudentMyDoubts")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
        </FadeIn>

        {recentQuestions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="help-circle-outline" size={54} color="#C7D4E2" />
            <Text style={styles.emptyTitle}>No Doubts Yet</Text>
            <Text style={styles.emptySub}>Start asking your first doubt now.</Text>
          </View>
        ) : (
          recentQuestions.map((q, i) => (
            <QuestionCard
              key={q.doubt.id}
              emoji={q.emoji}
              title={q.title}
              subject={q.subject}
              badgeType={q.type}
              delay={380 + i * 50}
              onPress={() =>
                navigation.navigate("DoubtDetail", { doubt: q.doubt })
              }
            />
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <StudentBottomNavigation navigation={navigation} active="Home" />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 12 : 4,
    paddingBottom: 125,
  },

  // ── TOP BAR ──────────────────────────────
  topBar: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  iconBtn: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  notifyDot: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.red,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },

  notifyText: { fontSize: 8, fontWeight: "900", color: "#FFFFFF" },

  appName: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
    letterSpacing: 2,
  },

  topBarRight: { flexDirection: "row", alignItems: "center", gap: 8 },

  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: { fontSize: 13, fontWeight: "800", color: COLORS.white },

  // ── GREETING ─────────────────────────────
  greeting: { marginTop: 8, marginBottom: 14 },

  greetingText: {
    fontSize: 23,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  greetingSub: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.muted,
  },

  // ── SEARCH ───────────────────────────────
  searchBox: {
    height: 46,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    paddingVertical: 0,
  },

  filterBtn: {
    width: 28,
    height: 28,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── DOUBTS ROW ───────────────────────────
  doubtRow: { flexDirection: "row", gap: 10, marginBottom: 12 },

  freeCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 14,
    justifyContent: "center",
  },

  freeLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.muted,
    letterSpacing: 0.5,
  },

  freeCountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 3,
  },

  freeCount: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.text,
    lineHeight: 34,
  },

  freeTotal: { fontSize: 14, fontWeight: "700", color: COLORS.muted, marginLeft: 2 },

  progressBg: {
    height: 4,
    backgroundColor: "#EDF2FA",
    borderRadius: 4,
    marginTop: 8,
    overflow: "hidden",
  },

  progressFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 4 },

  askBtn: {
    width: 110,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 12,
  },

  askIconBox: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  askLabel: { fontSize: 11.5, fontWeight: "900", color: COLORS.white },

  // ── STREAK ───────────────────────────────
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.streakBg,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.streakBorder,
    padding: 14,
    marginBottom: 4,
    gap: 12,
  },

  streakInfo: { flex: 1 },
  streakTitle: { fontSize: 12.5, fontWeight: "900", color: COLORS.streakText },
  streakSub: { fontSize: 10, fontWeight: "700", color: COLORS.streakSub, marginTop: 2 },
  streakCount: { fontSize: 22, fontWeight: "900", color: COLORS.streakCount },

  // ── PREMIUM BANNER ───────────────────────
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 4,
  },

  bannerTitle: { fontSize: 14, fontWeight: "900", color: COLORS.white },

  bannerSub: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
    marginTop: 3,
  },

  bannerPill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },

  bannerPillText: { fontSize: 11, fontWeight: "900", color: COLORS.white },

  // ── SECTION ROW ──────────────────────────
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 10,
  },

  sectionTitle: { fontSize: 14, fontWeight: "900", color: COLORS.text },

  viewAllPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  viewAllText: { fontSize: 10, fontWeight: "900", color: COLORS.primary },

  // ── MOCK TEST SECTION ─────────────────────
  mockStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  mockStatCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },

  mockStatCount: { fontSize: 20, fontWeight: "900" },

  mockStatLabel: { fontSize: 9.5, fontWeight: "700" },

  mockTestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  mockTestLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  mockTestIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.purpleLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  mockTestTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 2,
  },

  mockTestMeta: { fontSize: 10.5, fontWeight: "700", color: COLORS.muted, marginBottom: 4 },

  mockTestDateRow: { flexDirection: "row", alignItems: "center", gap: 4 },

  mockTestDate: { fontSize: 10, fontWeight: "600", color: COLORS.muted },

  upcomingBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 8,
  },

  upcomingBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#2E7D32",
  },

  startTestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 13,
    marginTop: 2,
  },

  startTestBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.white,
  },

  // ── CATEGORIES ───────────────────────────
  catRow: { flexDirection: "row", gap: 9 },

  catCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    paddingVertical: 14,
    alignItems: "center",
    gap: 5,
  },

  catIconBox: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },

  catTitle: { fontSize: 11.5, fontWeight: "900", color: COLORS.text },
  catSub: { fontSize: 9.5, fontWeight: "700", color: COLORS.muted },

  // ── VIDEO CARDS ──────────────────────────
  videoCard: {
    width: 185,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 12,
    marginRight: 12,
  },

  videoThumbnail: {
    height: 105,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  videoDuration: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  videoDurationText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  videoTitle: { marginTop: 10, fontSize: 12.5, fontWeight: "900", color: COLORS.text },
  videoSub: { marginTop: 4, fontSize: 10, fontWeight: "700", color: COLORS.muted },

  // ── TUTOR CARDS ──────────────────────────
  tutorCard: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 14,
    marginRight: 12,
    alignItems: "center",
  },

  tutorAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  tutorName: { marginTop: 10, fontSize: 13, fontWeight: "900", color: COLORS.text },
  tutorSubject: { marginTop: 4, fontSize: 10, fontWeight: "700", color: COLORS.muted },
  tutorRating: { marginTop: 10, fontSize: 13, fontWeight: "900", color: "#F59E0B" },
  tutorPrice: { marginTop: 4, fontSize: 14, fontWeight: "900", color: COLORS.text },

  requestBtn: {
    marginTop: 12,
    width: "100%",
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  requestBtnText: { color: COLORS.primary, fontSize: 11, fontWeight: "900" },

  // ── QUESTION CARDS ───────────────────────
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 9,
  },

  questionIconBox: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  questionInfo: { flex: 1 },
  questionTitle: { fontSize: 12.5, fontWeight: "900", color: COLORS.text },
  questionSub: { fontSize: 10, fontWeight: "700", color: COLORS.muted, marginTop: 3 },

  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 9.5, fontWeight: "900" },

  // ── EMPTY STATE ──────────────────────────
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    marginTop: 6,
  },

  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: "900", color: COLORS.text },

  emptySub: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
    color: COLORS.muted,
    fontWeight: "600",
  },
});











































































