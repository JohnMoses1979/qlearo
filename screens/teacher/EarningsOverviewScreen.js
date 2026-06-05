import React, { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Circle as SvgCircle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#F4F7FB",
  white: "#FFFFFF",
  primary: "#00897B",
  primaryLight: "#E5F7F4",
  text: "#07123A",
  muted: "#7A859F",
  border: "#E8EDF5",
  success: "#17B890",
  blue: "#2979FF",
  orange: "#FF8A00",
  purple: "#8E3FD1",
};

const CARD_WIDTH = width < 380 ? "47.5%" : "48.2%";
const EARNING_PER_DOUBT = 40;

const safeArray = (value) => (Array.isArray(value) ? value : []);
const safeText = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    return String(
      value.title ||
        value.name ||
        value.label ||
        value.desc ||
        value.description ||
        value.question ||
        value.topic ||
        fallback
    );
  }
  return fallback;
};

const formatMoney = (value = 0) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const pad = (value) => String(value).padStart(2, "0");

const monthKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

const monthLabel = (key) => {
  const [year, month] = String(key || "").split("-");
  if (!year || !month) return "This Month";
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(date);
};

const teacherBelongs = (item = {}, teacherId = "", teacherName = "") => {
  const itemTeacherId = String(
    item.teacherId || item.tutorId || item.assignedTeacherId || item.createdBy || ""
  ).toLowerCase();
  const itemTeacherName = String(
    item.teacherName || item.tutor || item.assignedTeacher || item.createdByName || ""
  ).toLowerCase();

  const tid = String(teacherId || "").toLowerCase();
  const tname = String(teacherName || "").toLowerCase();

  if (tid && itemTeacherId && tid === itemTeacherId) return true;
  if (tname && itemTeacherName && tname === itemTeacherName) return true;
  return false;
};

const flattenMockTests = (source = []) =>
  safeArray(source).flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const parent = {
      ...item,
      title: safeText(item.title || item.name || item.label || item.desc, "Mock test"),
      subject: safeText(item.subject || item.categoryTitle || item.category || item.name, "Mock test"),
    };

    if (Array.isArray(item.list) && item.list.length > 0) {
      return item.list.flatMap((child) => {
        if (!child || typeof child !== "object") return [];
        return [
          {
            ...parent,
            ...child,
            title: safeText(child.title || child.name || child.question || parent.title, parent.title),
            subject: safeText(child.subject || child.categoryTitle || parent.subject, parent.subject),
          },
        ];
      });
    }

    return [parent];
  });

const buildEarningTransactions = ({
  currentUser,
  teacherDoubts = [],
  teacherSessions = [],
  teacherMockTests = [],
  withdrawalHistory = [],
}) => {
  const doubtTxns = safeArray(teacherDoubts)
    .filter(
      (item) =>
        item?.answered ||
        item?.status === "Answered" ||
        item?.status === "answered"
    )
    .map((item) => ({
      id: item.id || item.doubtId || `D_${Date.now()}`,
      title: item.question || item.title || item.topic || "Doubt solved",
      subtitle: item.subject || item.className || "Doubt earning",
      amount: EARNING_PER_DOUBT,
      status: "Completed",
      createdAt: item.answeredAt || item.updatedAt || item.createdAt || "",
      icon: "school-outline",
      color: COLORS.orange,
      bg: "#FFF2E6",
    }));

  const sessionTxns = safeArray(teacherSessions)
    .filter(
      (item) =>
        item?.status === "Completed" ||
        item?.status === "completed" ||
        item?.status === "Finished" ||
        item?.completed === true
    )
    .map((item) => ({
      id: item.id || item.sessionId || `S_${Date.now()}`,
      title: item.subject || item.topic || item.title || "Session completed",
      subtitle: item.studentName || item.student || "Completed session",
      amount: 250,
      status: "Completed",
      createdAt: item.completedAt || item.endedAt || item.updatedAt || item.createdAt || "",
      icon: "videocam-outline",
      color: COLORS.purple,
      bg: "#F5ECFF",
    }));

  const testTxns = flattenMockTests(teacherMockTests)
    .filter(
      (item) =>
        item?.isPublished !== false &&
        (item?.status === "Published" ||
          item?.status === "published" ||
          item?.published === true ||
          item?.publishedAt ||
          item?.createdAt)
    )
    .map((item) => ({
      id: item.id || item.testId || `T_${Date.now()}`,
      title: safeText(item.title || item.name, "Mock test published"),
      subtitle: safeText(item.subject || item.categoryTitle, "Mock test earning"),
      amount: 120,
      status: "Published",
      createdAt: item.publishedAt || item.createdAt || item.updatedAt || "",
      icon: "document-text-outline",
      color: COLORS.orange,
      bg: "#FFF2E6",
    }));

  const withdrawalTxns = safeArray(withdrawalHistory).map((item) => ({
    id: item.id || `W_${Date.now()}`,
    title: item.title || "Withdrawal",
    subtitle: item.method || "Payout",
    amount: -Math.abs(Number(item.amount || 0)),
    status: item.status || "Completed",
    createdAt: item.createdAt || item.processedAt || item.updatedAt || "",
    icon: "download-outline",
    color: COLORS.purple,
    bg: "#F5ECFF",
  }));

  const payoutAmount = Number(
    currentUser?.lastPayoutAmount ?? currentUser?.paidAmount ?? 0
  );
  const payoutTxns =
    payoutAmount > 0
      ? [
          {
            id:
              currentUser?.lastPayoutTransactionId ||
              `PAYOUT_${currentUser?.teacherId || currentUser?.id || "T"}`,
            title: "Admin payout received",
            subtitle: currentUser?.lastPayoutMethod || "Teacher payout",
            amount: payoutAmount,
            status: currentUser?.lastPayoutStatus || "Paid",
            createdAt: currentUser?.lastPayoutAt || currentUser?.updatedAt || "",
            icon: "cash-outline",
            color: COLORS.success,
            bg: "#E8FFF4",
          },
        ]
      : [];

  return [...payoutTxns, ...doubtTxns, ...sessionTxns, ...testTxns, ...withdrawalTxns].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
};

const buildMonthBuckets = (transactions = [], selectedMonthKey = "") => {
  const filtered = transactions.filter(
    (item) => monthKey(item.createdAt) === selectedMonthKey
  );
  const date = new Date(`${selectedMonthKey}-01T00:00:00`);
  const daysInMonth = Number.isNaN(date.getTime())
    ? 30
    : new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const buckets = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    amount: 0,
  }));

  filtered.forEach((item) => {
    const d = new Date(item.createdAt);
    if (Number.isNaN(d.getTime())) return;
    const idx = d.getDate() - 1;
    if (idx >= 0 && idx < buckets.length && Number(item.amount || 0) > 0) {
      buckets[idx].amount += Number(item.amount || 0);
    }
  });

  return buckets;
};

const buildChartSeries = (data = [], maxPoints = 6) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const segmentSize = Math.max(1, Math.ceil(data.length / maxPoints));

  return Array.from({ length: Math.ceil(data.length / segmentSize) }, (_, index) => {
    const slice = data.slice(index * segmentSize, (index + 1) * segmentSize);
    const total = slice.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const average = slice.length > 0 ? total / slice.length : 0;

    return {
      amount: average,
      startDay: slice[0]?.day || 0,
      endDay: slice[slice.length - 1]?.day || slice[0]?.day || 0,
    };
  });
};

const buildSmoothPath = (points = []) => {
  if (points.length < 2) {
    return "";
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] || points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

function MiniLineChart({ data = [] }) {
  const widthPx = width - 72;
  const heightPx = 210;
  const leftPad = 16;
  const rightPad = 16;
  const topPad = 18;
  const bottomPad = 28;
  const chartHeight = heightPx - topPad - bottomPad;
  const displayData = useMemo(() => buildChartSeries(data, 6), [data]);
  const maxValue = Math.max(...displayData.map((item) => Number(item.amount || 0)), 0, 1);
  const points = displayData.map((item, index) => {
    const x =
      leftPad +
      (index / Math.max(displayData.length - 1, 1)) * (widthPx - leftPad - rightPad);
    const y = topPad + chartHeight - (Number(item.amount || 0) / maxValue) * (chartHeight - 18);
    return { x, y, amount: Number(item.amount || 0) };
  });
  const smoothPath = buildSmoothPath(points);
  const areaPath =
    points.length > 1
      ? `${smoothPath} L ${points[points.length - 1].x} ${topPad + chartHeight} L ${points[0].x} ${topPad + chartHeight} Z`
      : "";

  return (
    <View style={[styles.graphWrapper, { height: heightPx }]}>
      <Svg width={widthPx} height={heightPx} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="earningsStroke" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#0A9B8A" />
            <Stop offset="100%" stopColor="#078174" />
          </LinearGradient>
          <LinearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="rgba(10,155,138,0.30)" />
            <Stop offset="100%" stopColor="rgba(10,155,138,0.02)" />
          </LinearGradient>
        </Defs>

        {[0.18, 0.52, 0.84].map((ratio, index) => (
          <Path
            key={`grid-${index}`}
            d={`M ${leftPad} ${topPad + chartHeight * ratio} H ${widthPx - rightPad}`}
            stroke="#EEF2F7"
            strokeWidth={1}
          />
        ))}

        {areaPath ? (
          <Path d={areaPath} fill="url(#earningsFill)" stroke="none" />
        ) : null}

        {smoothPath ? (
          <Path
            d={smoothPath}
            fill="none"
            stroke="url(#earningsStroke)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {points.map((point, index) => (
          <React.Fragment key={`pt-${index}`}>
            <SvgCircle
              cx={point.x}
              cy={point.y}
              r={8}
              fill="#FFFFFF"
              opacity={0.95}
            />
            <SvgCircle
              cx={point.x}
              cy={point.y}
              r={5}
              fill="#0A8F80"
            />
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

export default function EarningsOverviewScreen({ navigation }) {
  const {
    currentUser,
    teacherDoubts = [],
    teacherSessions = [],
    getAllMockTests,
    teacherMockCatalog = [],
    refreshTeacherProfile,
  } = useAppContext();
  const teacherId = currentUser?.teacherId || currentUser?.id || "";

  const [selectedMonth, setSelectedMonth] = useState(
    monthKey(new Date()) || "2026-06"
  );
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (
        currentUser?.role === "teacher" &&
        teacherId &&
        typeof refreshTeacherProfile === "function"
      ) {
        void refreshTeacherProfile(teacherId).catch((error) => {
          console.warn("Failed to refresh teacher profile on earnings focus", error);
        });
      }
      return () => {};
    }, [currentUser?.role, refreshTeacherProfile, teacherId])
  );

  const solvedCount =
    safeArray(teacherDoubts).filter(
      (item) =>
        (item?.answered ||
          item?.status === "Answered" ||
          item?.status === "answered")
    ).length || 0;

  const totalEarnings = Number(currentUser?.paidAmount ?? currentUser?.lastPayoutAmount ?? 0);
  const paidAmount = Number(currentUser?.paidAmount ?? currentUser?.lastPayoutAmount ?? 0);
  const pendingAmount = Number(currentUser?.pendingAmount ?? 0);
  const withdrawnAmount = Number(currentUser?.withdrawnAmount ?? 0);
  const availableBalance = Math.max(0, paidAmount - withdrawnAmount);
  const doubtsSolved = Number(currentUser?.doubtsSolved ?? solvedCount);
  const sessionCount = Number(
    currentUser?.sessionCount ??
      safeArray(teacherSessions).filter(
        (item) =>
          String(item.teacherId || item.tutorId || "").toLowerCase() ===
          String(currentUser?.teacherId || currentUser?.id || "").toLowerCase()
      ).length
  );

  const transactions = useMemo(
    () =>
      buildEarningTransactions({
        currentUser,
        teacherDoubts,
        teacherSessions,
        teacherMockTests:
          typeof getAllMockTests === "function" ? getAllMockTests() : teacherMockCatalog,
        withdrawalHistory: currentUser?.withdrawalHistory,
      }),
    [currentUser, teacherDoubts, teacherSessions, getAllMockTests, teacherMockCatalog]
  );

  const monthOptions = useMemo(() => {
    const keys = new Set();
    transactions.forEach((item) => {
      const key = monthKey(item.createdAt);
      if (key) keys.add(key);
    });
    const current = monthKey(new Date());
    if (current) keys.add(current);
    return Array.from(keys).sort().reverse();
  }, [transactions]);

  const selectedLabel =
    selectedMonth === monthKey(new Date())
      ? "This Month"
      : monthLabel(selectedMonth);

  const chartBuckets = useMemo(
    () => buildMonthBuckets(transactions, selectedMonth),
    [selectedMonth, transactions]
  );
  const chartSeries = useMemo(
    () => buildChartSeries(chartBuckets, 6),
    [chartBuckets]
  );

  const visibleTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 3);

  const chartMax = Math.max(
    ...chartBuckets.map((item) => Number(item.amount || 0)),
    0
  );

  const monthChartLabels = useMemo(() => {
    const monthName = monthLabel(selectedMonth).split(" ")[0] || "Month";
    return {
      left: chartSeries[0]?.startDay ? `${chartSeries[0].startDay} ${monthName}` : "",
      mid: chartSeries[Math.floor(chartSeries.length / 2)]?.startDay
        ? `${chartSeries[Math.floor(chartSeries.length / 2)].startDay} ${monthName}`
        : "",
      right: chartSeries[chartSeries.length - 1]?.endDay
        ? `${chartSeries[chartSeries.length - 1].endDay} ${monthName}`
        : "",
    };
  }, [chartSeries, selectedMonth]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.bg} barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={21} color={COLORS.text} />
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.headerTitle}>Earnings</Text>
            <Text style={styles.headerSub}>Teacher Wallet</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.bigBlur} />
          <View style={styles.smallBlur} />

          <View style={{ flex: 1 }}>
            <Text style={styles.balanceLabel}>Total Earnings</Text>
            <Text style={styles.balanceAmount}>{formatMoney(totalEarnings)}</Text>
            <View style={styles.growthRow}>
              <Text style={styles.monthText}>{selectedLabel}</Text>
              <View style={styles.growthBadge}>
                <Ionicons name="trending-up" size={12} color={COLORS.white} />
                <Text style={styles.growthText}>Real activity</Text>
              </View>
            </View>
          </View>

          <View style={styles.walletCircle}>
            <View style={styles.walletInner}>
              <Ionicons name="wallet-outline" size={48} color={COLORS.white} />
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconWrap, { backgroundColor: "#E8F7F4" }]}>
              <Ionicons name="wallet-outline" size={23} color={COLORS.primary} />
            </View>
            <Text style={styles.statLabel}>Available</Text>
            <Text numberOfLines={1} style={[styles.statValue, { color: COLORS.primary }]}>
              {formatMoney(availableBalance)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconWrap, { backgroundColor: "#EEF4FF" }]}>
              <MaterialIcons name="schedule" size={22} color={COLORS.blue} />
            </View>
            <Text style={styles.statLabel}>Pending</Text>
            <Text numberOfLines={1} style={[styles.statValue, { color: COLORS.blue }]}>
              {formatMoney(pendingAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconWrap, { backgroundColor: "#F5ECFF" }]}>
              <MaterialCommunityIcons name="bank-transfer" size={23} color={COLORS.purple} />
            </View>
            <Text style={styles.statLabel}>Withdrawn</Text>
            <Text numberOfLines={1} style={[styles.statValue, { color: COLORS.purple }]}>
              {formatMoney(withdrawnAmount)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconWrap, { backgroundColor: "#FFF2E6" }]}>
              <Ionicons name="school-outline" size={22} color={COLORS.orange} />
            </View>
            <Text style={styles.statLabel}>Solved</Text>
            <Text style={[styles.statValue, { color: COLORS.orange }]}>{doubtsSolved}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconWrap, { backgroundColor: "#EDE9FE" }]}>
              <MaterialCommunityIcons name="cash-check" size={23} color={COLORS.purple} />
            </View>
            <Text style={styles.statLabel}>Admin Paid</Text>
            <Text numberOfLines={1} style={[styles.statValue, { color: COLORS.purple }]}>
              {formatMoney(paidAmount)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconWrap, { backgroundColor: "#EEF4FF" }]}>
              <MaterialIcons name="pending-actions" size={22} color={COLORS.blue} />
            </View>
            <Text style={styles.statLabel}>Pending</Text>
            <Text numberOfLines={1} style={[styles.statValue, { color: COLORS.blue }]}>
              {formatMoney(pendingAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Earnings Overview</Text>
              <Text style={styles.chartSubTitle}>Monthly Performance</Text>
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.monthDropdown} onPress={() => setMonthPickerVisible(true)}>
              <Text style={styles.dropdownText}>{selectedLabel}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <MiniLineChart data={chartBuckets} />
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabel}>{monthChartLabels.left}</Text>
            <Text style={styles.chartLabel}>{monthChartLabels.mid}</Text>
            <Text style={styles.chartLabel}>{monthChartLabels.right}</Text>
          </View>
        </View>

        <View style={styles.transactionCard}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => setShowAllTransactions((prev) => !prev)}>
              <Text style={styles.viewAll}>{showAllTransactions ? "Show Less" : "View All"}</Text>
            </TouchableOpacity>
          </View>

          {visibleTransactions.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySub}>Solved doubts and withdrawals will appear here.</Text>
            </View>
          ) : (
            visibleTransactions.map((item) => {
              const title = safeText(item.title, "Transaction");
              const subtitle = safeText(item.subtitle, "Update");
              const amount = Number(item.amount || 0);
              const createdAt = new Date(item.createdAt || Date.now());
              const safeDate = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;

              return (
                <View key={item.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={[styles.messageIcon, { backgroundColor: item.bg }]}>
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={styles.transactionName}>
                        {title}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {subtitle} ?{" "}
                        {new Intl.DateTimeFormat("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(safeDate)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: amount >= 0 ? COLORS.primary : COLORS.purple },
                      ]}
                    >
                      {amount >= 0 ? "+" : "-"} {formatMoney(Math.abs(amount))}
                    </Text>
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>{safeText(item.status, "")}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.withdrawBtn}
          onPress={() => navigation.navigate("WithdrawScreen")}
        >
          <Ionicons name="paper-plane-outline" size={22} color={COLORS.white} />
          <Text style={styles.withdrawText}>Withdraw Earnings</Text>
          <View style={styles.arrowWrap}>
            <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={monthPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMonthPickerVisible(false)}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setMonthPickerVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Month</Text>
            {monthOptions.map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.monthItem, selectedMonth === key && styles.monthItemActive]}
                onPress={() => {
                  setSelectedMonth(key);
                  setMonthPickerVisible(false);
                }}
              >
                <Text style={[styles.monthItemText, selectedMonth === key && styles.monthItemTextActive]}>
                  {monthLabel(key)}
                </Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <TeacherBottomNavigation navigation={navigation} active="Earnings" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingBottom: 140 },
  header: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 15 : 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerBtn: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: { fontSize: 25, fontWeight: "900", color: COLORS.text },
  headerSub: { marginTop: 2, fontSize: 12, fontWeight: "700", color: COLORS.muted },
  balanceCard: {
    marginHorizontal: 18,
    marginTop: 24,
    borderRadius: 34,
    backgroundColor: COLORS.primary,
    padding: 24,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 150,
  },
  bigBlur: {
    position: "absolute",
    right: -60,
    top: -20,
    width: 240,
    height: 240,
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  smallBlur: {
    position: "absolute",
    left: -20,
    bottom: -40,
    width: 130,
    height: 130,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  balanceLabel: { fontSize: 16, fontWeight: "700", color: COLORS.white },
  balanceAmount: { marginTop: 12, fontSize: width < 380 ? 40 : 48, fontWeight: "900", color: COLORS.white },
  growthRow: { marginTop: 15, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  monthText: { fontSize: 15, fontWeight: "700", color: COLORS.white },
  growthBadge: {
    marginLeft: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  growthText: { marginLeft: 5, fontSize: 12, fontWeight: "900", color: COLORS.white },
  walletCircle: {
    width: 118,
    height: 118,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  walletInner: {
    width: 84,
    height: 84,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  statsRow: {
    marginHorizontal: 18,
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: { marginTop: 16, fontSize: 14, fontWeight: "700", color: COLORS.muted },
  statValue: { marginTop: 8, fontSize: width < 380 ? 24 : 28, fontWeight: "900" },
  chartCard: {
    marginHorizontal: 18,
    marginTop: 24,
    backgroundColor: COLORS.white,
    borderRadius: 32,
    padding: 20,
    elevation: 4,
  },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chartTitle: { fontSize: width < 380 ? 18 : 22, fontWeight: "900", color: COLORS.text },
  chartSubTitle: { marginTop: 4, fontSize: 12, fontWeight: "700", color: COLORS.muted },
  monthDropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  dropdownText: { marginRight: 4, fontSize: 12, fontWeight: "700", color: COLORS.text },
  graphWrapper: { marginTop: 28, position: "relative" },
  gridLine1: {
    position: "absolute",
    top: 24,
    width: "100%",
    height: 1,
    backgroundColor: "#EEF2F7",
  },
  gridLine2: {
    position: "absolute",
    top: 92,
    width: "100%",
    height: 1,
    backgroundColor: "#EEF2F7",
  },
  gridLine3: {
    position: "absolute",
    top: 160,
    width: "100%",
    height: 1,
    backgroundColor: "#EEF2F7",
  },
  chartSegment: {
    position: "absolute",
    height: 4,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  graphPoint: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: COLORS.white,
    elevation: 5,
  },
  chartLabels: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartLabel: { fontSize: 12, fontWeight: "700", color: COLORS.muted },
  transactionCard: {
    marginHorizontal: 18,
    marginTop: 22,
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 20,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionTitle: { fontSize: 21, fontWeight: "900", color: COLORS.text },
  viewAll: { fontSize: 15, fontWeight: "800", color: COLORS.primary },
  transactionItem: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  messageIcon: {
    width: 58,
    height: 58,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  transactionName: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  transactionDate: { marginTop: 4, fontSize: 12, fontWeight: "600", color: COLORS.muted },
  transactionRight: { alignItems: "flex-end" },
  transactionAmount: { fontSize: 18, fontWeight: "900" },
  completedBadge: {
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
    backgroundColor: "rgba(23,184,144,0.12)",
  },
  completedText: { fontSize: 11, fontWeight: "800", color: COLORS.success },
  emptyWrap: {
    marginTop: 20,
    paddingVertical: 18,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: COLORS.text },
  emptySub: { marginTop: 4, fontSize: 12, color: COLORS.muted, fontWeight: "600" },
  withdrawBtn: {
    marginHorizontal: 18,
    marginTop: 28,
    height: 72,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    elevation: 5,
  },
  withdrawText: { marginHorizontal: 10, fontSize: 18, fontWeight: "900", color: COLORS.white },
  arrowWrap: {
    position: "absolute",
    right: 14,
    width: 46,
    height: 46,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(7, 18, 58, 0.42)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text, marginBottom: 10 },
  monthItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 10,
    backgroundColor: "#fff",
  },
  monthItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  monthItemText: { fontSize: 14, fontWeight: "800", color: COLORS.text },
  monthItemTextActive: { color: COLORS.primary },
});
