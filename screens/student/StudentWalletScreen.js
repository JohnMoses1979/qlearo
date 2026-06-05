// screens/student/StudentWalletScreen.js

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import StudentBottomNavigation from "../../components/StudentBottomNavigation";

const COLORS = {
  bg: "#F6FAFF",
  white: "#FFFFFF",
  primary: "#006D6A",
  text: "#07123A",
  muted: "#6F7890",
  border: "#E5ECF6",
  green: "#0E9F6E",
  red: "#EF4444",
  orange: "#F39A00",
  blue: "#245DFF",
  purple: "#7B61FF",
};

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateTime = (value) => {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) {
    return String(value || "-");
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export default function StudentWalletScreen({ navigation }) {
  const { currentUser, subscriptionPayments = [] } = useAppContext();

  const safeNavigate = (screen) => {
    if (navigation?.navigate) {
      navigation.navigate(screen);
      return;
    }

    global.showAlert("Coming Soon", `${screen} screen will open here.`);
  };

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation?.navigate?.("StudentProfile");
  };

  const studentPayments = useMemo(() => {
    const items = Array.isArray(subscriptionPayments) ? subscriptionPayments : [];
    const studentId = String(currentUser?.studentId || currentUser?.id || "").trim();

    const filtered = studentId
      ? items.filter((item) => {
          const paymentStudentId = String(item.studentId || "").trim();
          return paymentStudentId === studentId || paymentStudentId === String(currentUser?.id || "").trim();
        })
      : items;

    return [...filtered].sort(
      (a, b) =>
        new Date(b.paidAt || b.createdAt || 0).getTime() -
        new Date(a.paidAt || a.createdAt || 0).getTime()
    );
  }, [currentUser?.id, currentUser?.studentId, subscriptionPayments]);

  const walletTransactions = useMemo(() => {
    return studentPayments.map((payment) => {
      const amount = Number(payment.amount || 0);
      const title =
        payment.planName ||
        payment.subscriptionName ||
        payment.paymentMode ||
        "Subscription Payment";

      return {
        id: payment.id || payment.paymentId || payment.transactionId || `${title}_${payment.paidAt}`,
        title,
        date: formatDateTime(payment.paidAt || payment.createdAt),
        amount: `+ ${formatMoney(amount)}`,
        type: "credit",
        status: String(payment.status || "Paid"),
      };
    });
  }, [studentPayments]);

  const availableBalance = useMemo(
    () => studentPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    [studentPayments]
  );

  const latestTransaction = walletTransactions[0] || null;

  const QuickAction = ({ icon, title, color, bg, onPress }) => (
    <TouchableOpacity activeOpacity={0.85} style={styles.quickItem} onPress={onPress}>
      <View style={[styles.quickIconBox, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickText} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const TransactionRow = ({ item, isLast }) => {
    const isCredit = item.type === "credit";

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.transactionRow, !isLast && styles.transactionBorder]}
        onPress={() =>
          global.showAlert(
            item.title,
            `${item.date}\nAmount: ${item.amount}\nStatus: ${item.status}`
          )
        }
      >
        <View
          style={[
            styles.transactionIconBox,
            { backgroundColor: isCredit ? "#DDF4ED" : "#FFF0E6" },
          ]}
        >
          <Ionicons
            name={isCredit ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
            size={24}
            color={isCredit ? COLORS.primary : COLORS.orange}
          />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.transactionDate} numberOfLines={1}>
            {item.date}
          </Text>
        </View>

        <View style={styles.amountBox}>
          <Text
            style={[
              styles.amountText,
              { color: isCredit ? COLORS.green : COLORS.red },
            ]}
            numberOfLines={1}
          >
            {item.amount}
          </Text>
          <Text style={styles.successText}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const openTransactions = () => {
    if (navigation?.navigate) {
      navigation.navigate("MySubscription");
      return;
    }

    global.showAlert("Transactions", "Open subscription payments from the profile menu.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backBtn}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={23} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerTextBox}>
            <Text style={styles.headerTitle}>My Payments</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Subscription payments and history
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.notificationBtn}
            onPress={() => safeNavigate("StudentNotification")}
          >
            <Ionicons name="notifications-outline" size={23} color={COLORS.text} />
            <View style={styles.notifyBadge}>
              <Text style={styles.notifyText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <View>
              <View style={styles.balanceLabelRow}>
                <Text style={styles.balanceLabel}>Total Paid</Text>
                <Ionicons name="eye-outline" size={18} color={COLORS.white} />
              </View>

              <Text style={styles.balanceAmount}>{formatMoney(availableBalance)}</Text>
            </View>

            <View style={styles.walletIllustration}>
              <View style={styles.cardBack} />
              <View style={styles.cardFront}>
                <View style={styles.cardDot} />
              </View>
              <View style={styles.coin}>
                <Text style={styles.coinText}>₹</Text>
              </View>
            </View>
          </View>

          <View style={styles.walletRow}>
            <Ionicons name="wallet" size={19} color={COLORS.white} />
            <Text style={styles.walletName}>Qlearo Payments</Text>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>

          <View style={styles.quickGrid}>
            <QuickAction
              icon="add-circle-outline"
              title="Buy Plan"
              color={COLORS.green}
              bg="#DDF4ED"
              onPress={() => safeNavigate("SubscriptionPlans")}
            />

            <QuickAction
              icon="arrow-up-outline"
              title="Send Money"
              color={COLORS.blue}
              bg="#EAF2FF"
              onPress={() =>
                global.showAlert(
                  "Send Money",
                  "Wallet transfers are not enabled yet. Use subscription payments for now."
                )
              }
            />

            <QuickAction
              icon="receipt-outline"
              title="History"
              color={COLORS.purple}
              bg="#F2EFFF"
              onPress={openTransactions}
            />

            <QuickAction
              icon="pricetag-outline"
              title="Plans"
              color={COLORS.orange}
              bg="#FFF4E5"
              onPress={() => safeNavigate("SubscriptionPlans")}
            />
          </View>
        </View>

        <View style={styles.transactionsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Recent Transactions</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.viewAllBtn}
              onPress={openTransactions}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="arrow-forward" size={17} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {walletTransactions.length > 0 ? (
            walletTransactions.slice(0, 5).map((item, index) => (
              <TransactionRow
                key={item.id}
                item={item}
                isLast={index === Math.min(walletTransactions.length, 5) - 1}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={22} color={COLORS.primary} />
              <Text style={styles.emptyStateTitle}>No transactions yet</Text>
              <Text style={styles.emptyStateText}>
                Your subscription payments will appear here once you complete a payment.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.addMoneyBanner}>
          <View style={styles.bannerWalletBox}>
            <Ionicons name="wallet" size={30} color={COLORS.primary} />
            <View style={styles.bannerPlus}>
              <Ionicons name="add" size={15} color={COLORS.white} />
            </View>
          </View>

          <View style={styles.bannerTextBox}>
              <Text style={styles.bannerTitle} numberOfLines={1}>
              {latestTransaction ? "Latest payment" : "Payments"}
              </Text>
              <Text style={styles.bannerSub} numberOfLines={2}>
              {latestTransaction
                ? `${latestTransaction.title} on ${latestTransaction.date}`
                : "Your subscription payments will show here."}
              </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.bannerBtn}
            onPress={() => safeNavigate("SubscriptionPlans")}
          >
            <Text style={styles.bannerBtnText}>{latestTransaction ? "View" : "Pay"}</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <StudentBottomNavigation navigation={navigation} active="Profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "android" ? 14 : 8,
    paddingBottom: 125,
  },

  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  headerTextBox: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#65708E",
  },

  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  notifyBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#FF4D4F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },

  notifyText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.white,
  },

  balanceCard: {
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    padding: 18,
    overflow: "hidden",
    marginBottom: 16,
  },

  balanceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  balanceLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  balanceLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#DFFFFB",
  },

  balanceAmount: {
    marginTop: 13,
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  walletRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  walletName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },

  activePill: {
    backgroundColor: "#54C95B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  activePillText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.white,
  },

  walletIllustration: {
    width: 92,
    height: 86,
    alignItems: "center",
    justifyContent: "center",
  },

  cardBack: {
    position: "absolute",
    top: 18,
    right: 12,
    width: 66,
    height: 42,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.92)",
    transform: [{ rotate: "-13deg" }],
  },

  cardFront: {
    width: 62,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#008D86",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.18)",
  },

  cardDot: {
    position: "absolute",
    right: 10,
    bottom: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#FFC94D",
  },

  coin: {
    position: "absolute",
    right: 0,
    bottom: 13,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFCA3A",
    borderWidth: 3,
    borderColor: "#FFD86B",
    alignItems: "center",
    justifyContent: "center",
  },

  coinText: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.white,
  },

  quickCard: {
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  quickGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  quickItem: {
    width: "47.8%",
    minHeight: 96,
    borderRadius: 16,
    backgroundColor: "#FAFCFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },

  quickIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  quickText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  transactionsCard: {
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  viewAllText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
  },

  transactionRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
  },

  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  transactionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },

  transactionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },

  transactionDate: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#65708E",
  },

  amountBox: {
    alignItems: "flex-end",
    maxWidth: 95,
  },

  amountText: {
    fontSize: 13,
    fontWeight: "900",
  },

  successText: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.green,
  },

  emptyState: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  emptyStateTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptyStateText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#65708E",
    textAlign: "center",
  },

  addMoneyBanner: {
    minHeight: 86,
    borderRadius: 18,
    backgroundColor: "#F0FBFA",
    borderWidth: 1,
    borderColor: "#D5EFEB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  bannerWalletBox: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#DDF4ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  bannerPlus: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#54C95B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  bannerTextBox: {
    flex: 1,
    minWidth: 0,
  },

  bannerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  bannerSub: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: "#65708E",
  },

  bannerBtn: {
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  bannerBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.white,
  },
});
