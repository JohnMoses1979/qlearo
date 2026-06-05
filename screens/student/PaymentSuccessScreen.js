import React, { useMemo } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const formatDate = (value) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route?.params || {};

  const paymentDate = useMemo(
    () => formatDate(params.paymentDate || params.purchasedAt || new Date().toISOString()),
    [params.paymentDate, params.purchasedAt]
  );

  const expiresAt = useMemo(
    () => formatDate(params.expiresAt),
    [params.expiresAt]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.statusPill}>
              <Text style={styles.statusDot}>●</Text>
              <Text style={styles.statusText}>Verified</Text>
            </View>
            <Text style={styles.transactionHint}>{params.paymentId ? "Razorpay" : "Premium"}</Text>
          </View>

          <View style={styles.successRing}>
            <Text style={styles.successIcon}>✓</Text>
          </View>

          <Text style={styles.title}>Payment successful</Text>
          <Text style={styles.subtitle}>
            Your premium subscription is active now and your payment has been verified securely.
          </Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailHeaderRow}>
            <Text style={styles.detailHeading}>Payment details</Text>
            <View style={styles.amountChip}>
              <Text style={styles.amountChipLabel}>Rs.</Text>
              <Text style={styles.amountChipValue}>{params.amount || "-"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Plan</Text>
            <Text style={styles.value}>{params.planName || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Date</Text>
            <Text style={styles.value}>{paymentDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Next Renewal</Text>
            <Text style={styles.value}>{expiresAt}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment ID</Text>
            <Text style={styles.value}>{params.paymentId || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value}>{params.orderId || "-"}</Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>What happens next</Text>
          <Text style={styles.noteText}>
            Your free limits are removed and the premium plan is synced across your student account.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("MySubscription")}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>View subscription</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEF7F6",
  },
  container: {
    padding: 20,
    gap: 14,
  },
  heroCard: {
    backgroundColor: "#0F766E",
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
    shadowColor: "#0F766E",
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  heroTopRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  statusDot: {
    color: "#D1FAE5",
    fontSize: 11,
    lineHeight: 14,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  transactionHint: {
    color: "#C9F4E6",
    fontSize: 12,
    fontWeight: "700",
  },
  successRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    marginBottom: 14,
  },
  successIcon: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#E6FFFB",
    textAlign: "center",
    maxWidth: 280,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  detailHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  detailHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  amountChip: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E6FFFB",
  },
  amountChipLabel: {
    color: "#0F766E",
    fontSize: 11,
    fontWeight: "800",
  },
  amountChipValue: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "900",
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  noteCard: {
    backgroundColor: "#F7FBFA",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D8EEEA",
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },
  button: {
    backgroundColor: "#0F766E",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#0F766E",
    shadowOpacity: Platform.OS === "ios" ? 0.18 : 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
