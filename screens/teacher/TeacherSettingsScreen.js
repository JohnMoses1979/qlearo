// screens/teacher/TeacherSettingsScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Switch,
  Modal,
  Alert,
} from "react-native";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const COLORS = {
  bg: "#F6FAFF",
  white: "#FFFFFF",
  primary: "#006D6A",
  primarySoft: "#EAF7F4",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E7EEF8",
  red: "#EF4444",
  orange: "#F59E0B",
  blue: "#1677FF",
  purple: "#7B61FF",
  green: "#0E9F6E",
};

const SETTINGS = [
  {
    key: "profile",
    title: "Edit Profile",
    sub: "Update teacher name, photo, subjects",
    icon: "person-outline",
    color: COLORS.primary,
    bg: COLORS.primarySoft,
    screen: "TeacherEditProfile",
  },
  {
    key: "notifications",
    title: "Notifications",
    sub: "Manage doubt, class and payment alerts",
    icon: "notifications-outline",
    color: COLORS.orange,
    bg: "#FFF7E6",
    screen:"TeacherNotifications",
  },
  {
    key: "privacy",
    title: "Privacy & Security",
    sub: "Password, account safety and privacy",
    icon: "shield-checkmark-outline",
    color: COLORS.blue,
    bg: "#EAF2FF",
  },
  {
    key: "support",
    title: "Help & Support",
    sub: "Contact support and report issues",
    icon: "headset-outline",
    color: COLORS.green,
    bg: "#E8F7EF",
    screen: "TeacherHelpSupport",
  },
  {
    key: "about",
    title: "About App",
    sub: "Version, terms and app details",
    icon: "information-circle-outline",
    color: COLORS.purple,
    bg: "#F2EFFF",
  },
];

export default function TeacherSettingsScreen({ navigation }) {
  const { clearLoggedInUser } = useAppContext();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [doubtEnabled, setDoubtEnabled] = useState(true);
  const [classEnabled, setClassEnabled] = useState(true);
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [aboutVisible, setAboutVisible] = useState(false);

  const handleSettingPress = (item) => {
    if (item.screen) {
      navigation?.navigate(item.screen);
      return;
    }

    if (item.key === "notifications") {
      global.showAlert("Notifications", "Use the switches below to manage notifications.");
      return;
    }

    if (item.key === "privacy") {
      global.showAlert("Privacy & Security", "Password and security options will be added here.");
      return;
    }

    if (item.key === "about") {
      setAboutVisible(true);
    }
  };

  const handleLogout = async () => {
    global.showAlert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          if (typeof clearLoggedInUser === "function") {
            await clearLoggedInUser();
          }

          const rootNavigation = navigation?.getParent?.() || navigation;

          rootNavigation?.dispatch?.(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "RoleSelectionScreen", params: { fromLogout: true } }],
            })
          ) ||
            rootNavigation?.reset?.({
              index: 0,
              routes: [{ name: "RoleSelectionScreen", params: { fromLogout: true } }],
            });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Settings</Text>

        <View style={styles.headerBtn}>
          <Ionicons name="settings-outline" size={22} color={COLORS.text} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="school-outline" size={34} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>Teacher Settings</Text>
          <Text style={styles.heroSub}>
            Manage your teacher profile, alerts, support and account preferences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.card}>
            {SETTINGS.map((item, index) => (
              <View key={item.key}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.settingRow}
                  onPress={() => handleSettingPress(item)}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={21} color={item.color} />
                  </View>

                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSub}>{item.sub}</Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                </TouchableOpacity>

                {index !== SETTINGS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>

          <View style={styles.card}>
            <SettingSwitch
              title="Push Notifications"
              sub="Receive app notifications"
              value={pushEnabled}
              onValueChange={setPushEnabled}
            />
            <View style={styles.divider} />

            <SettingSwitch
              title="New Doubt Alerts"
              sub="Notify when students ask doubts"
              value={doubtEnabled}
              onValueChange={setDoubtEnabled}
            />
            <View style={styles.divider} />

            <SettingSwitch
              title="Live Class Alerts"
              sub="Reminder for upcoming sessions"
              value={classEnabled}
              onValueChange={setClassEnabled}
            />
            <View style={styles.divider} />

            <SettingSwitch
              title="Payment Alerts"
              sub="Receive earning and payout updates"
              value={paymentEnabled}
              onValueChange={setPaymentEnabled}
            />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={21} color={COLORS.red} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <TeacherBottomNavigation navigation={navigation} active="Profile" />

      <Modal
        visible={aboutVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAboutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About App</Text>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setAboutVisible(false)}
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.aboutBox}>
              <View style={styles.aboutIcon}>
                <Ionicons name="school" size={36} color={COLORS.primary} />
              </View>

              <Text style={styles.aboutTitle}>Teacher Learning App</Text>
              <Text style={styles.aboutSub}>Version 1.0.0</Text>

              <Text style={styles.aboutText}>
                This app helps teachers manage doubts, live classes, schedules,
                videos, profile, and student learning support.
              </Text>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setAboutVisible(false)}
              >
                <Text style={styles.primaryBtnText}>Okay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingSwitch({ title, sub, value, onValueChange }) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSub}>{sub}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D8E0EC", true: "#BFE8E2" }}
        thumbColor={value ? COLORS.primary : COLORS.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    height: 56,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "android" ? 6 : 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === "ios" ? 150 : 135,
  },

  heroCard: {
    marginTop: 12,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: "center",
  },

  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },

  heroSub: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },

  section: {
    marginTop: 18,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 10,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  settingRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  settingInfo: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  settingSub: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: COLORS.muted,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 70,
  },

  switchRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  switchInfo: {
    flex: 1,
    paddingRight: 12,
  },

  logoutBtn: {
    marginTop: 18,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FFD5DA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.red,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7,18,58,0.35)",
    justifyContent: "flex-end",
  },

  modalBox: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
  },

  modalHeader: {
    minHeight: 62,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  aboutBox: {
    padding: 18,
    alignItems: "center",
  },

  aboutIcon: {
    width: 74,
    height: 74,
    borderRadius: 26,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  aboutTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  aboutSub: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.muted,
  },

  aboutText: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },

  primaryBtn: {
    marginTop: 18,
    width: "100%",
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },
});
