import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#F4F7FB",
  white: "#FFFFFF",
  primary: "#00897B",
  primaryLight: "#E9F8F5",
  text: "#07123A",
  muted: "#7A7F9A",
  border: "#E8EDF5",
  success: "#17B890",
};

const formatMoney = (value = 0) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDateTime = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatMethod = (value = "") => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "bank") return "Bank Transfer";
  if (normalized === "paytm") return "Paytm";
  if (normalized === "upi") return "UPI";
  return String(value || "UPI").toUpperCase();
};

export default function WithdrawSuccessScreen({ navigation, route }) {
  const amount = route?.params?.amount ?? 0;
  const method = route?.params?.method ?? "UPI";
  const processedAt = route?.params?.processedAt ?? new Date().toISOString();
  const paymentId =
    route?.params?.paymentId ?? route?.params?.transactionId ?? "Pending";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.bg} barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.headerTitle}>Withdrawal Success</Text>
            <Text style={styles.headerSub}>Teacher Wallet</Text>
          </View>

          <View style={{ width: 50 }} />
        </View>

        <View style={styles.successWrap}>
          <View style={styles.outerCircle}>
            <View style={styles.middleCircle}>
              <View style={styles.innerCircle}>
                <Ionicons name="checkmark" size={70} color={COLORS.white} />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.successTitle}>Withdrawal Request</Text>
        <Text style={styles.successGreen}>Successful!</Text>
        <Text style={styles.successDesc}>
          Your withdrawal request has been verified and is being processed.
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.cardTop}>
            <View style={styles.docIcon}>
              <Ionicons name="document-text" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Transaction Details</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.leftRow}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="currency-rupee" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.detailLabel}>Amount</Text>
            </View>
            <Text style={styles.amountText}>{formatMoney(amount)}</Text>
          </View>

          <View style={styles.line} />

          <View style={styles.detailItem}>
            <View style={styles.leftRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="card-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.detailLabel}>Payment Method</Text>
            </View>
            <Text style={styles.detailValue}>{formatMethod(method)}</Text>
          </View>

          <View style={styles.line} />

          <View style={styles.detailItem}>
            <View style={styles.leftRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.detailLabel}>Date & Time</Text>
            </View>
            <Text style={styles.detailValue}>{formatDateTime(processedAt)}</Text>
          </View>

          <View style={styles.line} />

          <View style={styles.detailItem}>
            <View style={styles.leftRow}>
              <View style={styles.iconCircle}>
                <Feather name="hash" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.detailLabel}>Transaction ID</Text>
            </View>
            <Text style={styles.detailValue}>{paymentId}</Text>
          </View>
        </View>

        <View style={styles.nextCard}>
          <View style={styles.nextIcon}>
            <Ionicons name="shield-checkmark" size={26} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nextTitle}>What Happens Next?</Text>
            <Text style={styles.nextDesc}>
              Your payout is verified and will be transferred within 24 hours.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.homeBtn}
          onPress={() => navigation.navigate("TeacherDashboard")}
        >
          <Ionicons name="home" size={24} color={COLORS.white} />
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>

      <TeacherBottomNavigation navigation={navigation} active="Earnings" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingBottom: 130 },
  header: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 15 : 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerBtn: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  headerTitle: { fontSize: width < 380 ? 22 : 26, fontWeight: "900", color: COLORS.text },
  headerSub: { marginTop: 3, fontSize: 13, fontWeight: "700", color: COLORS.muted },
  successWrap: {
    marginTop: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  outerCircle: {
    width: 210,
    height: 210,
    borderRadius: 120,
    backgroundColor: "rgba(23,184,144,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  middleCircle: {
    width: 170,
    height: 170,
    borderRadius: 100,
    backgroundColor: "rgba(23,184,144,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 130,
    height: 130,
    borderRadius: 80,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    marginTop: 24,
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },
  successGreen: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.success,
    textAlign: "center",
  },
  successDesc: {
    marginTop: 12,
    marginHorizontal: 26,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
    color: COLORS.muted,
  },
  detailsCard: {
    marginTop: 24,
    marginHorizontal: 18,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  docIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  leftRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  detailLabel: { fontSize: 13, fontWeight: "800", color: COLORS.text },
  detailValue: { fontSize: 13, fontWeight: "900", color: COLORS.text, textAlign: "right" },
  amountText: { fontSize: 14, fontWeight: "900", color: COLORS.primary },
  line: { height: 1, backgroundColor: COLORS.border },
  nextCard: {
    marginTop: 18,
    marginHorizontal: 18,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  nextIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  nextTitle: { fontSize: 16, fontWeight: "900", color: COLORS.text },
  nextDesc: { marginTop: 5, fontSize: 13, lineHeight: 20, fontWeight: "700", color: COLORS.muted },
  homeBtn: {
    marginTop: 20,
    marginHorizontal: 18,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  homeBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "900" },
});
