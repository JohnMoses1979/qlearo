import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext";
import { API_BASE_URL } from "../../services/studentApi";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const C = {
  bg: "#F3F6FB",
  card: "#FFFFFF",
  text: "#07123D",
  muted: "#73829A",
  border: "#E4ECF5",
  primary: "#061755",
  green: "#05B986",
  greenSoft: "#E8FFF7",
  blue: "#236CFF",
  blueSoft: "#EAF2FF",
  purple: "#7C4DFF",
  purpleSoft: "#F2ECFF",
  pink: "#FF4FA3",
  pinkSoft: "#FFF0F8",
  orange: "#FF7A1A",
  orangeSoft: "#FFF1E8",
  cyanSoft: "#E8FCFF",
};

function safeText(value, fallback = "") {
  return String(value || fallback).trim() || fallback;
}

function safeNumber(value) {
  return Number(value || 0);
}

function numberWithCommas(value) {
  return safeNumber(value).toLocaleString("en-IN");
}

function formatPercent(value) {
  const rounded = Math.round((Number(value || 0) + Number.EPSILON) * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds || 0)));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  if (minutes === 0) {
    return `${remaining}s`;
  }

  if (remaining === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remaining}s`;
}

function getInitials(name) {
  return safeText(name, "Student")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function resolveAvatarUrl(avatar) {
  if (!avatar) return null;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  if (String(avatar).startsWith("/api/")) return `${API_ORIGIN}${avatar}`;
  if (String(avatar).startsWith("/")) return `${API_ORIGIN}${avatar}`;
  return `${API_BASE_URL}/${avatar}`;
}

function Avatar({ name, avatar }) {
  const resolvedAvatar = resolveAvatarUrl(avatar);

  if (resolvedAvatar) {
    return <Image source={{ uri: resolvedAvatar }} style={styles.avatar} />;
  }

  return (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarFallbackText}>{getInitials(name)}</Text>
    </View>
  );
}

function StatPill({ label, value, color, soft }) {
  return (
    <View style={[styles.statPill, { backgroundColor: soft, borderColor: soft }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AttemptCard({ item }) {
  return (
    <View style={styles.attemptCard}>
      <View style={styles.attemptTopRow}>
        <Avatar name={item.studentName} avatar={item.studentAvatar} />

        <View style={{ flex: 1 }}>
          <Text style={styles.studentName} numberOfLines={1}>
            {safeText(item.studentName, "Student")}
          </Text>

          <Text style={styles.studentMeta} numberOfLines={1}>
            {safeText(item.studentClassName, "Student")}{" "}
            {item.studentSchool ? `• ${item.studentSchool}` : ""}
          </Text>
        </View>

        <View style={styles.percentBadge}>
          <Text style={styles.percentValue}>{formatPercent(item.accuracy)}</Text>
          <Text style={styles.percentLabel}>Accuracy</Text>
        </View>
      </View>

      <View style={styles.testBlock}>
        <Text style={styles.testTitle} numberOfLines={2}>
          {safeText(item.testTitle, "Mock Test")}
        </Text>
        <Text style={styles.testMeta} numberOfLines={1}>
          {safeText(item.categoryTitle, "Category")}
          {item.subjectName ? ` • ${item.subjectName}` : ""}
          {item.testNo ? ` • Test ${item.testNo}` : ""}
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <StatPill
          label="Score"
          value={`${safeNumber(item.score)}/${safeNumber(item.totalMarks)}`}
          color={C.blue}
          soft={C.blueSoft}
        />

        <StatPill
          label="Correct"
          value={numberWithCommas(item.correct)}
          color={C.green}
          soft={C.greenSoft}
        />

        <StatPill
          label="Wrong"
          value={numberWithCommas(item.wrong)}
          color={C.orange}
          soft={C.orangeSoft}
        />
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerChip}>
          <Ionicons name="checkbox-outline" size={13} color={C.blue} />
          <Text style={styles.footerChipText}>
            Attempted {numberWithCommas(item.attempted)}
          </Text>
        </View>

        <View style={styles.footerChip}>
          <Ionicons name="remove-circle-outline" size={13} color={C.pink} />
          <Text style={styles.footerChipText}>
            Unattempted {numberWithCommas(item.unattempted)}
          </Text>
        </View>

        <View style={styles.footerChip}>
          <Ionicons name="time-outline" size={13} color={C.green} />
          <Text style={styles.footerChipText}>
            {formatDuration(item.timeTaken)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function TeacherMockTestAttemptsScreen({ navigation, route }) {
  const { currentUser, getTeacherMockTestAttempts } = useAppContext();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categoryTitle = route?.params?.categoryTitle || "";
  const subjectId = route?.params?.subjectId || "";
  const subjectName = route?.params?.subjectName || "";

  const loadAttempts = useCallback(async (cancelledRef) => {
    setLoading(true);
    setError("");

    try {
      const items = await getTeacherMockTestAttempts({
        teacherId: currentUser?.teacherId || currentUser?.id,
        categoryTitle,
        subjectId,
      });

      if (!cancelledRef.current) {
        setAttempts(Array.isArray(items) ? items : []);
      }
    } catch (loadError) {
      if (!cancelledRef.current) {
        setError(loadError?.message || "Unable to load attempts.");
        setAttempts([]);
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, [categoryTitle, currentUser?.id, currentUser?.teacherId, getTeacherMockTestAttempts, subjectId]);

  useFocusEffect(
    useCallback(() => {
      const cancelledRef = { current: false };
      loadAttempts(cancelledRef);

      return () => {
        cancelledRef.current = true;
      };
    }, [loadAttempts])
  );

  const summary = useMemo(() => {
    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce((sum, item) => sum + safeNumber(item.score), 0);
    const totalMarks = attempts.reduce((sum, item) => sum + safeNumber(item.totalMarks), 0);
    const avgAccuracy =
      totalAttempts > 0
        ? Math.round(
            attempts.reduce((sum, item) => sum + safeNumber(item.accuracy), 0) /
              totalAttempts
          )
        : 0;

    const top = [...attempts].sort((a, b) => safeNumber(b.score) - safeNumber(a.score))[0];

    return {
      totalAttempts,
      totalScore,
      totalMarks,
      avgAccuracy,
      top,
    };
  }, [attempts]);

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("TeacherMockTestAnalysis");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerBtn}
            onPress={goBackSafe}
          >
            <Ionicons name="arrow-back" size={23} color={C.primary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Attempt Details</Text>
            <Text style={styles.headerSub}>
              {subjectName || categoryTitle || "All mock test attempts"}
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.headerBtn}>
            <Ionicons name="filter-outline" size={23} color={C.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <View>
                <Text style={styles.summaryTitle}>Teacher Overview</Text>
                <Text style={styles.summarySub}>
                  {categoryTitle || "All categories"}
                  {subjectName ? ` • ${subjectName}` : ""}
                </Text>
              </View>

              <View style={styles.summaryIcon}>
                <Ionicons name="podium-outline" size={22} color={C.blue} />
              </View>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryMetric}>
                <Text style={styles.summaryMetricValue}>{summary.totalAttempts}</Text>
                <Text style={styles.summaryMetricLabel}>Attempts</Text>
              </View>

              <View style={styles.summaryMetric}>
                <Text style={styles.summaryMetricValue}>
                  {summary.totalMarks > 0
                    ? `${summary.totalScore}/${summary.totalMarks}`
                    : "0"}
                </Text>
                <Text style={styles.summaryMetricLabel}>Total Score</Text>
              </View>

              <View style={styles.summaryMetric}>
                <Text style={styles.summaryMetricValue}>
                  {formatPercent(summary.avgAccuracy)}
                </Text>
                <Text style={styles.summaryMetricLabel}>Avg Accuracy</Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={C.blue} />
              <Text style={styles.loadingText}>Loading attempt records...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={28} color={C.pink} />
              <Text style={styles.errorTitle}>Could not load attempts</Text>
              <Text style={styles.errorSub}>{error}</Text>
            </View>
          ) : attempts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={34} color={C.blue} />
              <Text style={styles.emptyTitle}>No attempts found</Text>
              <Text style={styles.emptySub}>
                Student attempts will appear here after they submit mock tests.
              </Text>
            </View>
          ) : (
            attempts.map((item) => <AttemptCard key={item.id} item={item} />)
          )}

          {summary.top && (
            <View style={styles.topCard}>
              <View>
                <Text style={styles.topSmall}>Top Score</Text>
                <Text style={styles.topName} numberOfLines={1}>
                  {safeText(summary.top.studentName, "Student")}
                </Text>
                <Text style={styles.topMeta} numberOfLines={2}>
                  {safeText(summary.top.testTitle, "Mock Test")} •{" "}
                  {formatPercent(summary.top.accuracy)}
                </Text>
              </View>

              <View style={styles.topPill}>
                <Text style={styles.topPillValue}>
                  {safeNumber(summary.top.score)}
                </Text>
                <Text style={styles.topPillLabel}>Marks</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <TeacherBottomNavigation navigation={navigation} active="Home" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 14,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  header: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.text,
  },
  headerSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#52617F",
  },
  summaryCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginTop: 6,
    marginBottom: 14,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
  },
  summarySub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#52617F",
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryGrid: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryMetric: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#FAFCFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 12,
    alignItems: "center",
  },
  summaryMetricValue: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
  },
  summaryMetricLabel: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "800",
    color: "#52617F",
  },
  loadingBox: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 34,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: C.muted,
  },
  errorBox: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  errorTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
  },
  errorSub: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
    textAlign: "center",
  },
  emptyBox: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 34,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
  },
  emptySub: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
    textAlign: "center",
  },
  attemptCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 12,
  },
  attemptTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: C.blueSoft,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 16,
    fontWeight: "900",
    color: C.blue,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "900",
    color: C.text,
  },
  studentMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#52617F",
  },
  percentBadge: {
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: C.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  percentValue: {
    fontSize: 18,
    fontWeight: "900",
    color: C.green,
  },
  percentLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "800",
    color: C.green,
  },
  testBlock: {
    marginTop: 12,
    backgroundColor: "#FAFCFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
  testTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
  },
  testMeta: {
    marginTop: 4,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#52617F",
  },
  metricsRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  statPill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "800",
    color: "#52617F",
  },
  footerRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  footerChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFCFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  footerChipText: {
    marginLeft: 4,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#405174",
  },
  topCard: {
    backgroundColor: "#F3F8FF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BFD9FF",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  topSmall: {
    fontSize: 12,
    fontWeight: "900",
    color: C.blue,
  },
  topName: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "900",
    color: C.text,
  },
  topMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#52617F",
  },
  topPill: {
    minWidth: 72,
    borderRadius: 18,
    backgroundColor: C.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  topPillValue: {
    fontSize: 18,
    fontWeight: "900",
    color: C.green,
  },
  topPillLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "800",
    color: C.green,
  },
});
