import React, { useMemo } from "react";
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SUPPORT_PHONE =
  process.env.EXPO_PUBLIC_SUPPORT_PHONE || "+919876543210";
const SUPPORT_EMAIL =
  process.env.EXPO_PUBLIC_SUPPORT_EMAIL || "support@qlearo.com";
const SUPPORT_WHATSAPP =
  process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP || SUPPORT_PHONE;

const digitsOnly = (value) => String(value || "").replace(/\D/g, "");

const buildWhatsAppUrl = (phone, message) => {
  const phoneDigits = digitsOnly(phone);
  const text = encodeURIComponent(message);
  return `https://wa.me/${phoneDigits}?text=${text}`;
};

const buildMailUrl = (email, subject, body) => {
  const safeSubject = encodeURIComponent(subject);
  const safeBody = encodeURIComponent(body);
  return `mailto:${email}?subject=${safeSubject}&body=${safeBody}`;
};

const openExternalUrl = async (url, fallbackMessage) => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      throw new Error(fallbackMessage || "Unable to open this contact option");
    }
    await Linking.openURL(url);
  } catch (error) {
    global.showAlert("Unable to open", error?.message || fallbackMessage || "Please try again.");
  }
};

const SupportActionCard = ({ icon, title, subtitle, onPress, accentColor }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.9}>
    <View style={[styles.iconBubble, { backgroundColor: accentColor }]}>
      <Text style={styles.iconText}>{icon}</Text>
    </View>
    <View style={styles.actionTextWrap}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

export default function StudentHelpSupportScreen({ navigation }) {
  const supportMessage = useMemo(
    () =>
      "Hi Qlearo Support, I need help with my student account. Please assist me.",
    []
  );

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation?.navigate?.("StudentProfile");
  };

  const handleCall = () => {
    const phone = SUPPORT_PHONE;
    if (!phone) {
      global.showAlert("Missing phone", "Support phone number is not configured.");
      return;
    }
    openExternalUrl(`tel:${phone}`, "Calling is not supported on this device.");
  };

  const handleEmail = () => {
    if (!SUPPORT_EMAIL) {
      global.showAlert("Missing email", "Support email is not configured.");
      return;
    }
    const subject = "Qlearo Student Support";
    const body = `${supportMessage}\n\nStudent app: ${Platform.OS}`;
    openExternalUrl(
      buildMailUrl(SUPPORT_EMAIL, subject, body),
      "Email app is not available on this device."
    );
  };

  const handleWhatsApp = () => {
    const phone = SUPPORT_WHATSAPP;
    if (!phone) {
      global.showAlert("Missing WhatsApp", "Support WhatsApp number is not configured.");
      return;
    }
    const message = `${supportMessage}\n\nI am contacting from the Qlearo student app.`;
    openExternalUrl(
      buildWhatsAppUrl(phone, message),
      "WhatsApp is not installed or cannot be opened."
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Help &amp; Support</Text>
            <Text style={styles.headerSubtitle}>Reach us instantly for account or class help</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroBadge}>Support</Text>
          <Text style={styles.heroTitle}>Need help?</Text>
          <Text style={styles.heroSubtitle}>
            Reach us instantly through a real phone call, email, or WhatsApp chat.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact options</Text>

          <SupportActionCard
            icon="☎"
            title="Call Support"
            subtitle={SUPPORT_PHONE}
            accentColor="#E0F2FE"
            onPress={handleCall}
          />

          <SupportActionCard
            icon="@"
            title="Email Support"
            subtitle={SUPPORT_EMAIL}
            accentColor="#DCFCE7"
            onPress={handleEmail}
          />

          <SupportActionCard
            icon="🟢"
            title="WhatsApp Support"
            subtitle={SUPPORT_WHATSAPP}
            accentColor="#DCFCE7"
            onPress={handleWhatsApp}
          />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoIconBubble}>
              <Ionicons name="sparkles-outline" size={18} color="#0F766E" />
            </View>
            <View style={styles.infoHeaderText}>
              <Text style={styles.infoTitle}>Support at a glance</Text>
              <Text style={styles.infoSubtitle}>
                Quick ways to reach us when you need help with your account or classes.
              </Text>
            </View>
          </View>

          <View style={styles.infoPillRow}>
            <View style={styles.infoPill}>
              <Ionicons name="time-outline" size={14} color="#0F766E" />
              <Text style={styles.infoPillText}>Fast response</Text>
            </View>
            <View style={styles.infoPill}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#0F766E" />
              <Text style={styles.infoPillText}>Phone, Email, WhatsApp</Text>
            </View>
            <View style={styles.infoPill}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#0F766E" />
              <Text style={styles.infoPillText}>Real support team</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3FAFA",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 2,
    paddingTop: 2,
    paddingBottom: 2,
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  headerTextWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  headerSubtitle: {
    marginTop: 3,
    fontSize: 12.5,
    lineHeight: 17,
    color: "#64748B",
    textAlign: "center",
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E7E6",
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  heroCard: {
    backgroundColor: "#0F766E",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#0F766E",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.16)",
    color: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#E6FFFB",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D9E7E6",
    gap: 12,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  actionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },
  chevron: {
    fontSize: 26,
    lineHeight: 26,
    color: "#0F766E",
    fontWeight: "300",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D9E7E6",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  infoIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6FFFB",
  },
  infoHeaderText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  infoSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },
  infoPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#F0FAF9",
    borderWidth: 1,
    borderColor: "#D7EFEB",
  },
  infoPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F766E",
  },
});
