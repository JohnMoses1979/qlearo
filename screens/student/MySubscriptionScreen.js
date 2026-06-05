

// screens/student/MySubscriptionScreen.js

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import StudentBottomNavigation from "../../components/StudentBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const COLORS = {
  bg: "#F6FAFF",
  white: "#FFFFFF",
  primary: "#006D6A",
  primaryDark: "#005A58",
  text: "#07123A",
  muted: "#6F7890",
  border: "#E5ECF6",
  green: "#0E9F6E",
  greenLight: "#DDF4ED",
  orange: "#E27800",
  orangeLight: "#FFF4E5",
  blue: "#1677FF",
  blueLight: "#EAF2FF",
  purple: "#7B61FF",
  purpleLight: "#F2EFFF",
  red: "#FF3B45",
  redLight: "#FFF0F1",
};

export default function MySubscriptionScreen({ navigation }) {
  const { currentUser, unreadNotificationsCount = 0 } = useAppContext();
  const planName = currentUser?.subscriptionPlan || "Qlearo Premium";
  const planAmount = currentUser?.subscriptionAmount
    ? `Rs. ${currentUser.subscriptionAmount}`
    : "Rs. 899";
  const billingCycle = currentUser?.subscriptionBillingType || "1 year";
  const formatDate = (value, fallback) => {
    if (!value) return fallback;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const nextBillingDate = formatDate(
    currentUser?.subscriptionExpiresAt,
    "After plan expiry"
  );
  const activeSince = formatDate(currentUser?.subscriptionPurchasedAt, "Today");
  const daysRemaining = (() => {
    if (!currentUser?.subscriptionExpiresAt) return null;

    const expiry = new Date(currentUser.subscriptionExpiresAt);
    if (Number.isNaN(expiry.getTime())) return null;

    const diffMs = expiry.getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Expired";
    if (diffDays === 1) return "1 Day";
    return `${diffDays} Days`;
  })();

  const DetailRow = ({ icon, iconColor, iconBg, label, value, isLast }) => (
    <TouchableOpacity
      activeOpacity={label === "Auto-renewal" ? 0.85 : 1}
      style={[styles.detailRow, !isLast && styles.detailBorder]}
    >
      <View style={[styles.detailIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <Text style={styles.detailLabel} numberOfLines={1}>
        {label}
      </Text>

      <View style={styles.detailRight}>
        {!!value && (
          <Text style={styles.detailValue} numberOfLines={1}>
            {value}
          </Text>
        )}

        {label === "Auto-renewal" && (
          <View style={styles.onBadge}>
            <Text style={styles.onText}>ON</Text>
          </View>
        )}
      </View>

      {label === "Auto-renewal" && (
        <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
      )}
    </TouchableOpacity>
  );

  const FeatureItem = ({ icon, color, bg, title, sub }) => (
    <View style={styles.featureItem}>
      <View style={[styles.featureIconBox, { backgroundColor: bg }]}>
        <MaterialCommunityIcons name={icon} size={25} color={color} />
      </View>
      <Text style={styles.featureTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.featureSub} numberOfLines={1}>
        {sub}
      </Text>
    </View>
  );

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
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={23} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerTextBox}>
            <Text style={styles.headerTitle}>My Subscription</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Manage your plan details
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.notificationBtn}
            onPress={() => navigation.navigate("StudentNotification")}
          >
            <Ionicons name="notifications-outline" size={23} color={COLORS.text} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.notifyBadge}>
                <Text style={styles.notifyText}>
                  {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.planCard}>
          <View style={styles.planTop}>
            <View style={styles.planBadgeRow}>
              <View style={styles.currentPlanBadge}>
                <Text style={styles.currentPlanText}>Current Plan</Text>
              </View>

              <View style={styles.activeBadge}>
                <Ionicons name="checkmark-circle-outline" size={17} color={COLORS.green} />
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>

            <Text style={styles.planName}>{planName}</Text>
            <Text style={styles.planDesc}>Unlimited doubts, videos & mock tests</Text>

            <View style={styles.priceBox}>
              <View style={styles.priceHeader}>
                <View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{planAmount}</Text>
                    <Text style={styles.monthText}>/ {billingCycle}</Text>
                  </View>

                  <Text style={styles.billingLabel}>Next billing date</Text>

                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={17} color="#4F5B76" />
                    <Text style={styles.billingDate}>{nextBillingDate}</Text>
                  </View>
                </View>

                <View style={styles.daysBox}>
                  <Text style={styles.renewLabel}>Renews in</Text>
                  <Text style={styles.daysLeft}>{daysRemaining || "After plan expiry"}</Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>

              <View style={styles.autoRow}>
                <Ionicons name="sync-outline" size={18} color={COLORS.green} />
                <Text style={styles.autoText}>Auto-renewal is ON</Text>
              </View>
            </View>
          </View>

          <View style={styles.featuresRow}>
            <FeatureItem icon="infinity" color={COLORS.primary} bg="#DDF4ED" title="Unlimited" sub="Doubts" />
            <FeatureItem icon="headphones" color={COLORS.blue} bg={COLORS.blueLight} title="Priority" sub="Support" />
            <FeatureItem icon="star-outline" color={COLORS.purple} bg={COLORS.purpleLight} title="Rated" sub="Tutors" />
            <FeatureItem icon="download-outline" color={COLORS.orange} bg={COLORS.orangeLight} title="Solution" sub="Files" />
          </View>
        </View>

        <View style={styles.paymentCard}>
          <Text style={styles.cardTitle}>Payment Method</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.paymentRow}
            onPress={() => navigation.navigate("PaymentMethod")}
          >
            <View style={styles.visaBox}>
              <Text style={styles.visaText}>VISA</Text>
            </View>

            <View style={styles.cardNumberBox}>
              <Text style={styles.cardNumber}>•••• 4242</Text>
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#4F5B76" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Plan Details</Text>

          <DetailRow icon="calendar-outline" iconColor={COLORS.primary} iconBg="#DDF4ED" label="Start Date" value={activeSince} />
          <DetailRow icon="calendar-outline" iconColor={COLORS.primary} iconBg="#DDF4ED" label="Next Billing Date" value={nextBillingDate} />
          <DetailRow icon="cash-outline" iconColor={COLORS.orange} iconBg={COLORS.orangeLight} label="Billing Cycle" value={billingCycle} />
          <DetailRow icon="wallet-outline" iconColor={COLORS.primary} iconBg="#DDF4ED" label="Amount" value={planAmount} />
          <DetailRow icon="sync-outline" iconColor={COLORS.purple} iconBg={COLORS.purpleLight} label="Auto-renewal" value="Enabled" isLast />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.changeBtn}
            onPress={() => navigation.navigate("SubscriptionPlans")}
          >
            <Text style={styles.changeText}>Change Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.9} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.supportCard}>
          <View style={styles.supportIconBox}>
            <Ionicons name="headset-outline" size={25} color={COLORS.primary} />
          </View>

          <View style={styles.supportTextBox}>
            <Text style={styles.supportTitle} numberOfLines={1}>
              Need help?
            </Text>
            <Text style={styles.supportSub} numberOfLines={1}>
              Our support team is here.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.supportBtn}
            onPress={() => navigation.navigate("StudentHelpSupport")}
          >
            <Text style={styles.supportBtnText}>Support</Text>
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
    fontSize: 23,
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
    backgroundColor: COLORS.red,
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

  planCard: {
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 15,
  },

  planTop: {
    backgroundColor: COLORS.primary,
    padding: 14,
    paddingBottom: 0,
  },

  planBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  currentPlanBadge: {
    backgroundColor: "#12C8A0",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },

  currentPlanText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.white,
  },

  activeBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  activeText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.green,
  },

  planName: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.white,
  },

  planDesc: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "700",
    color: "#E9FFFC",
  },

  priceBox: {
    marginTop: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: COLORS.white,
    padding: 14,
  },

  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  priceText: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.primary,
  },

  monthText: {
    marginBottom: 5,
    marginLeft: 5,
    fontSize: 13,
    fontWeight: "800",
    color: "#4F5B76",
  },

  billingLabel: {
    marginTop: 13,
    fontSize: 11,
    fontWeight: "700",
    color: "#65708E",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 6,
  },

  billingDate: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4F5B76",
  },

  daysBox: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  renewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#65708E",
  },

  daysLeft: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.primary,
  },

  progressTrack: {
    height: 7,
    borderRadius: 8,
    backgroundColor: "#D9DCE6",
    marginTop: 15,
    overflow: "hidden",
  },

  progressFill: {
    width: "75%",
    height: "100%",
    backgroundColor: COLORS.green,
    borderRadius: 8,
  },

  autoRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  autoText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#65708E",
  },

  featuresRow: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 15,
  },

  featureItem: {
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  featureIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  featureTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  featureSub: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#4F5B76",
    textAlign: "center",
  },

  paymentCard: {
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 13,
  },

  paymentRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
  },

  visaBox: {
    width: 56,
    height: 42,
    borderRadius: 9,
    backgroundColor: "#F1F3F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  visaText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#174EA6",
    fontStyle: "italic",
  },

  cardNumberBox: {
    flex: 1,
    minWidth: 0,
  },

  cardNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: "#4F5B76",
  },

  defaultBadge: {
    marginTop: 7,
    alignSelf: "flex-start",
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },

  defaultText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.green,
  },

  detailsCard: {
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingTop: 14,
    marginBottom: 16,
  },

  detailRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
  },

  detailBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  detailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  detailLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: "#4F5B76",
  },

  detailRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    maxWidth: 130,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4F5B76",
  },

  onBadge: {
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },

  onText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.green,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  changeBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  changeText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.primary,
  },

  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },

  supportCard: {
    minHeight: 82,
    borderRadius: 16,
    backgroundColor: "#F0FBFA",
    borderWidth: 1,
    borderColor: "#D5EFEB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  supportIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#DDF4ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  supportTextBox: {
    flex: 1,
    minWidth: 0,
  },

  supportTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  supportSub: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#65708E",
  },

  supportBtn: {
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  supportBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.white,
  },
});
