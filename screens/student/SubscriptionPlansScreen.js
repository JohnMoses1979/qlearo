import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppContext } from "../../context/AppContext";

const COLORS = {
  bg: "#F4F8FF",
  white: "#FFFFFF",
  text: "#07123A",
  muted: "#6D7690",
  border: "#E3EAF6",
  primary: "#0F766E",
  primaryDark: "#095A55",
  primarySoft: "#E7F7F4",
  blue: "#2563EB",
  blueSoft: "#EAF2FF",
  gold: "#F59E0B",
  goldSoft: "#FFF5DD",
  orange: "#F97316",
  orangeSoft: "#FFF2E6",
  shadow: "rgba(7,18,58,0.12)",
};

const PLANS = [
  {
    id: "plan_1m",
    title: "1 Month Access",
    durationLabel: "1 month",
    amountValue: 99,
    priceLabel: "Rs. 99",
    subtitle: "Best for trying premium support",
    icon: "calendar-outline",
    accent: COLORS.primary,
    accentSoft: COLORS.primarySoft,
    badge: "Starter",
    features: ["Unlimited doubts", "Video help", "Mock tests", "Support access"],
  },
  {
    id: "plan_3m",
    title: "3 Month Access",
    durationLabel: "3 months",
    amountValue: 249,
    priceLabel: "Rs. 249",
    subtitle: "Most balanced learning plan",
    icon: "calendar-sharp",
    accent: COLORS.blue,
    accentSoft: COLORS.blueSoft,
    badge: "Popular",
    features: ["Unlimited doubts", "Video help", "Mock tests", "Priority support"],
  },
  {
    id: "plan_1y",
    title: "1 Year Access",
    durationLabel: "1 year",
    amountValue: 899,
    priceLabel: "Rs. 899",
    subtitle: "Best value for full-year preparation",
    icon: "trophy-outline",
    accent: COLORS.gold,
    accentSoft: COLORS.goldSoft,
    badge: "Best Value",
    features: ["Unlimited doubts", "Video help", "Mock tests", "Premium support"],
  },
];

export default function SubscriptionPlansScreen({ navigation }) {
  const { unreadNotificationsCount = 0 } = useAppContext();
  const [selectedPlanId, setSelectedPlanId] = useState(PLANS[0].id);

  const selectedPlan = useMemo(
    () => PLANS.find((plan) => plan.id === selectedPlanId) || PLANS[0],
    [selectedPlanId]
  );

  const handleContinuePayment = () => {
    if (!selectedPlan) {
      global.showAlert("Select a plan", "Please choose one subscription plan.");
      return;
    }

    navigation?.navigate?.("PaymentMethod", {
      planId: selectedPlan.id,
      planName: selectedPlan.title,
      billingType: "subscription",
      durationLabel: selectedPlan.durationLabel,
      amount: selectedPlan.priceLabel,
      amountValue: selectedPlan.amountValue,
      period: `/${selectedPlan.durationLabel}`,
      description: selectedPlan.subtitle,
      features: selectedPlan.features,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.85} style={styles.iconBtn} onPress={() => navigation?.goBack?.()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>Subscription Plans</Text>
            <Text style={styles.subtitle}>Choose a plan to unlock premium learning</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.iconBtn}
            onPress={() => navigation?.navigate?.("StudentNotification")}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <LinearGradient colors={["#0F766E", "#085B56"]} style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name="crown" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.heroTextBox}>
              <Text style={styles.heroTitle}>Go Premium in seconds</Text>
              <Text style={styles.heroSub}>
                3 free actions are available. After that, premium is required.
              </Text>
            </View>
          </View>

          <View style={styles.heroPills}>
            <View style={styles.heroPill}>
              <Feather name="message-square" size={13} color="#FFFFFF" />
              <Text style={styles.heroPillText}>Doubts</Text>
            </View>
            <View style={styles.heroPill}>
              <Feather name="play-circle" size={13} color="#FFFFFF" />
              <Text style={styles.heroPillText}>Videos</Text>
            </View>
            <View style={styles.heroPill}>
              <Feather name="file-text" size={13} color="#FFFFFF" />
              <Text style={styles.heroPillText}>Mock Tests</Text>
            </View>
          </View>
        </LinearGradient>

        {PLANS.map((plan) => {
          const selected = selectedPlanId === plan.id;

          return (
            <TouchableOpacity
              key={plan.id}
              activeOpacity={0.9}
              onPress={() => setSelectedPlanId(plan.id)}
              style={[styles.planCard, selected && styles.planCardSelected]}
            >
              <View style={[styles.planAccent, { backgroundColor: plan.accentSoft }]}>
                <Ionicons name={plan.icon} size={24} color={plan.accent} />
              </View>

              <View style={styles.planBody}>
                <View style={styles.planTopRow}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <View style={[styles.planBadge, { backgroundColor: plan.accentSoft }]}>
                    <Text style={[styles.planBadgeText, { color: plan.accent }]}>
                      {plan.badge}
                    </Text>
                  </View>
                </View>

                <Text style={styles.planSubtitle}>{plan.subtitle}</Text>

                <View style={styles.planPriceRow}>
                  <View>
                    <Text style={styles.planPrice}>{plan.priceLabel}</Text>
                    <Text style={styles.planPeriod}>/{plan.durationLabel}</Text>
                  </View>

                  <View style={[styles.selectChip, selected && { backgroundColor: COLORS.primary }]}>
                    <Text style={[styles.selectChipText, selected && styles.selectChipTextActive]}>
                      {selected ? "Selected" : "Select"}
                    </Text>
                  </View>
                </View>

                <View style={styles.featureWrap}>
                  {plan.features.map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={15} color={plan.accent} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Selected plan</Text>
          <Text style={styles.summaryTitle}>{selectedPlan.title}</Text>
          <Text style={styles.summarySub}>{selectedPlan.subtitle}</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryAmount}>{selectedPlan.priceLabel}</Text>
            <Text style={styles.summaryPeriod}>/{selectedPlan.durationLabel}</Text>
          </View>

          <TouchableOpacity activeOpacity={0.92} onPress={handleContinuePayment}>
            <LinearGradient colors={["#10B39C", "#0A7C73"]} style={styles.payBtn}>
              <Text style={styles.payBtnText}>Continue to Pay</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.supportRow}
          onPress={() => navigation?.navigate?.("StudentHelpSupport")}
        >
          <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.supportText}>Need help? Open support</Text>
          <Feather name="chevron-right" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 23,
    fontWeight: "900",
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.muted,
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: "#FF3B5C",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  heroCard: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  heroTextBox: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  heroSub: {
    marginTop: 5,
    fontSize: 12.5,
    fontWeight: "700",
    color: "rgba(255,255,255,0.86)",
    lineHeight: 18,
  },
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  heroPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  planCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  planCardSelected: {
    borderColor: COLORS.primary,
  },
  planAccent: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  planBody: {
    flex: 1,
    minWidth: 0,
  },
  planTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  planTitle: {
    flex: 1,
    fontSize: 16.5,
    fontWeight: "900",
    color: COLORS.text,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: "900",
  },
  planSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.muted,
    fontWeight: "700",
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 12,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.primaryDark,
  },
  planPeriod: {
    marginTop: 2,
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.muted,
  },
  selectChip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  selectChipText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primaryDark,
  },
  selectChipTextActive: {
    color: "#FFFFFF",
  },
  featureWrap: {
    marginTop: 12,
    gap: 7,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  featureText: {
    fontSize: 11.5,
    color: COLORS.text,
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginTop: 6,
    marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 11.5,
    fontWeight: "900",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryTitle: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  summarySub: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginTop: 14,
  },
  summaryAmount: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.primaryDark,
  },
  summaryPeriod: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
    marginBottom: 4,
  },
  payBtn: {
    marginTop: 14,
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  supportText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "800",
  },
});
