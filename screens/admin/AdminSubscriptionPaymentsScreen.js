



// src/screens/admin/AdminSubscriptionPaymentsScreen.js

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminBottomNavigation from "../../components/AdminBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const { width } = Dimensions.get("window");
const isSmall = width < 380;

const COLORS = {
  bg: "#F6FAFB",
  white: "#FFFFFF",
  teal: "#00796B",
  tealDark: "#006A60",
  tealLight: "#E6F5F3",
  tealSoft: "#F0FFFC",
  text: "#07123A",
  muted: "#6E7891",
  border: "#E4EBF2",
  green: "#059669",
  greenSoft: "#DCFCE7",
  red: "#EF4444",
  redSoft: "#FEE2E2",
  orange: "#F97316",
  orangeSoft: "#FFEDD5",
  blue: "#2563EB",
  blueSoft: "#DBEAFE",
  purple: "#7C3AED",
  purpleSoft: "#EDE9FE",
  shadow: "rgba(0,0,0,0.10)",
};

const FILTERS = ["All", "Paid", "Pending", "Failed"];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getInitial(name = "S") {
  return String(name || "S").trim().charAt(0).toUpperCase();
}

function formatDateTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeStatus(status = "") {
  const clean = String(status || "").toLowerCase();

  if (clean === "success" || clean === "completed" || clean === "paid") {
    return "Paid";
  }

  if (clean === "pending" || clean === "processing") {
    return "Pending";
  }

  if (clean === "failed" || clean === "cancelled" || clean === "rejected") {
    return "Failed";
  }

  return status ? String(status) : "Paid";
}

function normalizePayment(payment = {}, index = 0) {
  const student = payment.student || payment.user || {};

  const id = firstValue(
    payment.id,
    payment.paymentId,
    payment.transactionId,
    payment.orderId,
    `SUB_PAYMENT_${index}`
  );

  const paidAt = firstValue(
    payment.paidAt,
    payment.createdAt,
    payment.updatedAt,
    payment.date,
    payment.paymentDate,
    null
  );

  return {
    ...payment,
    id,
    studentId: firstValue(
      payment.studentId,
      student.studentId,
      student.id,
      payment.userId,
      "-"
    ),
    studentName: firstValue(
      payment.studentName,
      student.studentName,
      student.name,
      payment.name,
      "Student"
    ),
    className: firstValue(
      payment.className,
      payment.class,
      student.className,
      student.class,
      "Class not added"
    ),
    planName: firstValue(
      payment.planName,
      payment.plan,
      payment.packageName,
      payment.subscriptionName,
      "Subscription Plan"
    ),
    amount: Number(firstValue(payment.amount, payment.price, payment.total, 0)),
    paymentMode: firstValue(
      payment.paymentMode,
      payment.mode,
      payment.method,
      payment.gateway,
      "Online"
    ),
    transactionId: firstValue(
      payment.transactionId,
      payment.txnId,
      payment.paymentId,
      payment.orderId,
      id
    ),
    status: normalizeStatus(payment.status),
    paidAt,
  };
}

function getStatusTheme(status) {
  if (status === "Paid") {
    return {
      bg: COLORS.greenSoft,
      color: COLORS.green,
      icon: "checkmark-circle-outline",
    };
  }

  if (status === "Pending") {
    return {
      bg: COLORS.orangeSoft,
      color: COLORS.orange,
      icon: "time-outline",
    };
  }

  return {
    bg: COLORS.redSoft,
    color: COLORS.red,
    icon: "close-circle-outline",
  };
}

function getPlanTheme(planName = "") {
  const plan = String(planName).toLowerCase();

  if (plan.includes("year")) {
    return {
      bg: COLORS.purpleSoft,
      color: COLORS.purple,
      icon: "trophy-outline",
    };
  }

  if (plan.includes("quarter") || plan.includes("3 month")) {
    return {
      bg: COLORS.blueSoft,
      color: COLORS.blue,
      icon: "calendar-outline",
    };
  }

  return {
    bg: COLORS.tealLight,
    color: COLORS.teal,
    icon: "reader-outline",
  };
}

function SummaryCard({ title, value, sub, icon, color, bg }) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <Text style={styles.summaryValue} numberOfLines={1}>
        {value}
      </Text>

      <Text style={styles.summaryTitle} numberOfLines={1}>
        {title}
      </Text>

      {!!sub && (
        <Text style={[styles.summarySub, { color }]} numberOfLines={1}>
          {sub}
        </Text>
      )}
    </View>
  );
}

function PaymentCard({ item, onPress }) {
  const statusTheme = getStatusTheme(item.status);
  const planTheme = getPlanTheme(item.planName);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.paymentCard}
      onPress={() => onPress(item)}
    >
      <View style={styles.paymentTop}>
        <View style={styles.studentAvatar}>
          <Text style={styles.studentAvatarText}>{getInitial(item.studentName)}</Text>
        </View>

        <View style={styles.paymentInfo}>
          <Text style={styles.studentName} numberOfLines={1}>
            {item.studentName}
          </Text>

          <Text style={styles.studentMeta} numberOfLines={1}>
            {item.className} • {item.studentId}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
          <Ionicons name={statusTheme.icon} size={13} color={statusTheme.color} />
          <Text style={[styles.statusText, { color: statusTheme.color }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.paymentMiddle}>
        <View style={[styles.planBox, { backgroundColor: planTheme.bg }]}>
          <Ionicons name={planTheme.icon} size={18} color={planTheme.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.planName, { color: planTheme.color }]}>
              {item.planName}
            </Text>
            <Text style={styles.planSub}>{item.paymentMode}</Text>
          </View>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountText}>{formatMoney(item.amount)}</Text>
          <Text style={styles.dateText}>{formatDateTime(item.paidAt)}</Text>
        </View>
      </View>

      <View style={styles.paymentBottom}>
        <View style={styles.transactionBox}>
          <Text style={styles.transactionLabel}>Transaction ID</Text>
          <Text style={styles.transactionValue} numberOfLines={1}>
            {item.transactionId}
          </Text>
        </View>

        <View style={styles.openCircle}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.teal} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function DetailRow({ label, value, icon }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={COLORS.teal} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || "-"}</Text>
      </View>
    </View>
  );
}

export default function AdminSubscriptionPaymentsScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const {
    subscriptionPayments = [],
    subscriptions = [],
    studentPayments = [],
    payments = [],
    notifications = [],
    unreadNotificationsCount = 0,
  } = useAppContext();

  const notificationCount =
    unreadNotificationsCount ||
    safeArray(notifications).filter((item) => !item.read).length;

  const paymentsList = useMemo(() => {
    const source =
      safeArray(subscriptionPayments).length > 0
        ? subscriptionPayments
        : safeArray(subscriptions).length > 0
        ? subscriptions
        : safeArray(studentPayments).length > 0
        ? studentPayments
        : safeArray(payments);

    return source
      .map((item, index) => normalizePayment(item, index))
      .sort(
        (a, b) =>
          new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime()
      );
  }, [subscriptionPayments, subscriptions, studentPayments, payments]);

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();

    return paymentsList.filter((item) => {
      const statusMatch = activeFilter === "All" || item.status === activeFilter;

      const searchMatch =
        !q ||
        String(item.studentName || "").toLowerCase().includes(q) ||
        String(item.studentId || "").toLowerCase().includes(q) ||
        String(item.className || "").toLowerCase().includes(q) ||
        String(item.planName || "").toLowerCase().includes(q) ||
        String(item.transactionId || "").toLowerCase().includes(q) ||
        String(item.paymentMode || "").toLowerCase().includes(q);

      return statusMatch && searchMatch;
    });
  }, [paymentsList, search, activeFilter]);

  const summary = useMemo(() => {
    const paidPayments = paymentsList.filter((item) => item.status === "Paid");
    const pendingPayments = paymentsList.filter((item) => item.status === "Pending");
    const failedPayments = paymentsList.filter((item) => item.status === "Failed");

    const revenue = paidPayments.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const pendingAmount = pendingPayments.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    return {
      revenue,
      paidCount: paidPayments.length,
      pendingAmount,
      pendingCount: pendingPayments.length,
      failedCount: failedPayments.length,
      totalCount: paymentsList.length,
    };
  }, [paymentsList]);

  const openDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailVisible(true);
  };

  const closeDetails = () => {
    setDetailVisible(false);
    setSelectedPayment(null);
  };

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation?.navigate?.("AdminDashboard");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.headerBtn}
            onPress={goBackSafe}
          >
            <Ionicons name="chevron-back" size={25} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Subscriptions</Text>
            <Text style={styles.headerSub}>Student payment management</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.headerBtn}
              onPress={() => navigation?.navigate?.("AdminNotifications")}
            >
              <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
              {notificationCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.headerBtn}
              onPress={() => {
                setSearch("");
                setActiveFilter("All");
              }}
            >
              <Ionicons name="refresh-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Ionicons name="reader-outline" size={30} color={COLORS.teal} />
              </View>

              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle}>Subscription Revenue</Text>
                <Text style={styles.heroSub}>
                  Track real student subscription payments from AppContext.
                </Text>
              </View>
            </View>

            <View style={styles.heroAmountRow}>
              <View>
                <Text style={styles.heroAmount}>{formatMoney(summary.revenue)}</Text>
                <Text style={styles.heroAmountSub}>Total paid revenue</Text>
              </View>

              <View style={styles.heroBadge}>
                <Ionicons name="wallet-outline" size={16} color={COLORS.green} />
                <Text style={styles.heroBadgeText}>{summary.paidCount} Paid</Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryCard
              title="Paid"
              value={summary.paidCount}
              sub={formatMoney(summary.revenue)}
              icon="checkmark-circle-outline"
              color={COLORS.green}
              bg={COLORS.greenSoft}
            />

            <SummaryCard
              title="Pending"
              value={summary.pendingCount}
              sub={formatMoney(summary.pendingAmount)}
              icon="time-outline"
              color={COLORS.orange}
              bg={COLORS.orangeSoft}
            />

            <SummaryCard
              title="Failed"
              value={summary.failedCount}
              sub="Need review"
              icon="close-circle-outline"
              color={COLORS.red}
              bg={COLORS.redSoft}
            />

            <SummaryCard
              title="Total"
              value={summary.totalCount}
              sub="All payments"
              icon="albums-outline"
              color={COLORS.blue}
              bg={COLORS.blueSoft}
            />
          </View>

          <View style={styles.searchCard}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={19} color={COLORS.muted} />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search student, plan, transaction..."
                placeholderTextColor="#9AA4B6"
                style={styles.searchInput}
              />

              {search.length > 0 && (
                <TouchableOpacity activeOpacity={0.75} onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={19} color={COLORS.muted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
            >
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter;

                return (
                  <TouchableOpacity
                    key={filter}
                    activeOpacity={0.85}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent Payments</Text>
              <Text style={styles.sectionSub}>
                {filteredPayments.length} payment records found
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.exportBtn}>
              <Ionicons name="download-outline" size={17} color={COLORS.teal} />
              <Text style={styles.exportText}>Export</Text>
            </TouchableOpacity>
          </View>

          {filteredPayments.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="receipt-outline" size={44} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No real payments found</Text>
              <Text style={styles.emptySub}>
                When students complete subscription payment, records from AppContext will appear here.
              </Text>
            </View>
          ) : (
            filteredPayments.map((item) => (
              <PaymentCard key={item.id} item={item} onPress={openDetails} />
            ))
          )}
        </ScrollView>

        <AdminBottomNavigation navigation={navigation} active="Subscriptions" />
      </View>

      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDim} onPress={closeDetails} />

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.detailTitle}>Payment Details</Text>
                <Text style={styles.detailSub}>Subscription transaction info</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.closeBtn}
                onPress={closeDetails}
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedPayment && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailStudentBox}>
                  <View style={styles.detailAvatar}>
                    <Text style={styles.detailAvatarText}>
                      {getInitial(selectedPayment.studentName)}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailStudentName}>
                      {selectedPayment.studentName}
                    </Text>
                    <Text style={styles.detailStudentMeta}>
                      {selectedPayment.className} • {selectedPayment.studentId}
                    </Text>
                  </View>

                  <Text style={styles.detailAmount}>
                    {formatMoney(selectedPayment.amount)}
                  </Text>
                </View>

                <DetailRow
                  icon="reader-outline"
                  label="Plan Name"
                  value={selectedPayment.planName}
                />

                <DetailRow
                  icon="card-outline"
                  label="Payment Mode"
                  value={selectedPayment.paymentMode}
                />

                <DetailRow
                  icon="finger-print-outline"
                  label="Transaction ID"
                  value={selectedPayment.transactionId}
                />

                <DetailRow
                  icon="calendar-outline"
                  label="Paid At"
                  value={formatDateTime(selectedPayment.paidAt)}
                />

                <DetailRow
                  icon="shield-checkmark-outline"
                  label="Status"
                  value={selectedPayment.status}
                />

                <TouchableOpacity
                  activeOpacity={0.86}
                  style={styles.primaryBtn}
                  onPress={closeDetails}
                >
                  <Text style={styles.primaryBtnText}>Done</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.tealDark,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    height: Platform.OS === "ios" ? 108 : 92,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "ios" ? 22 : 14,
    flexDirection: "row",
    alignItems: "center",
  },

  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: "#FF3B5C",
    alignItems: "center",
    justifyContent: "center",
  },

  headerBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontSize: isSmall ? 21 : 24,
    fontWeight: "900",
    color: COLORS.white,
  },

  headerSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.82)",
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 138 : 122,
  },

  heroCard: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 3,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  heroInfo: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  heroSub: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.muted,
  },

  heroAmountRow: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroAmount: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },

  heroAmountSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  heroBadge: {
    borderRadius: 18,
    backgroundColor: COLORS.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  heroBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.green,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  summaryCard: {
    width: (width - 40) / 2,
    minHeight: 118,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 2,
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
  },

  summaryTitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
  },

  summarySub: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "900",
  },

  searchCard: {
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 16,
  },

  searchBox: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F9FBFD",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    paddingVertical: 0,
  },

  filterContent: {
    paddingTop: 12,
    gap: 9,
  },

  filterChip: {
    height: 38,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FAFCFF",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  filterChipActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },

  filterText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.muted,
  },

  filterTextActive: {
    color: COLORS.white,
  },

  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  sectionSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  exportBtn: {
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  exportText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.teal,
  },

  paymentCard: {
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 2,
  },

  paymentTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  studentAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  studentAvatarText: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.white,
  },

  paymentInfo: {
    flex: 1,
    paddingRight: 8,
  },

  studentName: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  studentMeta: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  statusBadge: {
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  paymentMiddle: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  planBox: {
    flex: 1,
    minHeight: 56,
    borderRadius: 17,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  planName: {
    fontSize: 13,
    fontWeight: "900",
  },

  planSub: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  amountBox: {
    minWidth: 88,
    alignItems: "flex-end",
  },

  amountText: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  dateText: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.muted,
  },

  paymentBottom: {
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  transactionBox: {
    flex: 1,
  },

  transactionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.muted,
  },

  transactionValue: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
  },

  openCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyBox: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptySub: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7,18,58,0.35)",
  },

  detailCard: {
    maxHeight: "86%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    paddingBottom: Platform.OS === "ios" ? 32 : 22,
  },

  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  detailTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  detailSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  detailStudentBox: {
    borderRadius: 19,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  detailAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  detailAvatarText: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.white,
  },

  detailStudentName: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  detailStudentMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  detailAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.teal,
  },

  detailRow: {
    minHeight: 64,
    borderRadius: 17,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  detailLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
  },

  detailValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  primaryBtn: {
    marginTop: 8,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },
});
