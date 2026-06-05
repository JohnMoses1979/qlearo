// screens/student/StudentSettingsScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";

const COLORS = {
  bg: "#F2F7FF",
  white: "#FFFFFF",
  primary: "#006D6A",
  primaryLight: "#E6F5F4",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E2EBF6",
  red: "#FF4757",
  redBg: "#FFF0F1",
};

export default function StudentSettingsScreen({ navigation }) {
  const { clearLoggedInUser } = useAppContext();
  const [pushNotifs,    setPushNotifs]    = useState(true);
  const [emailNotifs,   setEmailNotifs]   = useState(false);
  const [smsNotifs,     setSmsNotifs]     = useState(true);
  const [darkMode,      setDarkMode]      = useState(false);
  const [sound,         setSound]         = useState(true);
  const [autoPlay,      setAutoPlay]      = useState(false);
  const [saveData,      setSaveData]      = useState(false);
  const [locationShare, setLocationShare] = useState(false);

  const handleClearCache = () => {
    global.showAlert("Clear Cache", "Cache cleared successfully.");
  };

  const handleChangePassword = () => {
    global.showAlert("Change Password", "A reset link will be sent to your email.");
  };

  const handleDeleteAccount = () => {
    global.showAlert(
      "Delete Account",
      "This action is permanent and cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await clearLoggedInUser();
            navigation.reset({
              index: 0,
              routes: [{ name: "RoleSelectionScreen", params: { fromLogout: true } }],
            });
          },
        },
      ]
    );
  };

  const ToggleRow = ({ icon, iconBg, iconColor, label, sublabel, value, onToggle }) => (
    <View style={styles.settingRow}>
      <View style={[styles.settingIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <View style={styles.settingTextBox}>
        <Text style={styles.settingLabel}>{label}</Text>
        {sublabel ? <Text style={styles.settingSubLabel}>{sublabel}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary + "60" }}
        thumbColor={value ? COLORS.primary : COLORS.muted}
        ios_backgroundColor={COLORS.border}
      />
    </View>
  );

  const TapRow = ({ icon, iconBg, iconColor, label, sublabel, onPress, danger }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.82}>
      <View style={[styles.settingIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={17} color={danger ? COLORS.red : iconColor} />
      </View>
      <View style={styles.settingTextBox}>
        <Text style={[styles.settingLabel, danger && { color: COLORS.red }]}>{label}</Text>
        {sublabel ? <Text style={styles.settingSubLabel}>{sublabel}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Notifications ── */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <ToggleRow
            icon="notifications-outline"
            iconBg="#FFF8E1"
            iconColor="#F9A825"
            label="Push Notifications"
            sublabel="Get alerts for new answers"
            value={pushNotifs}
            onToggle={setPushNotifs}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            icon="mail-outline"
            iconBg="#EAF0FD"
            iconColor="#1677FF"
            label="Email Notifications"
            sublabel="Weekly digest & updates"
            value={emailNotifs}
            onToggle={setEmailNotifs}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            icon="chatbubble-outline"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            label="SMS Notifications"
            sublabel="Urgent updates via SMS"
            value={smsNotifs}
            onToggle={setSmsNotifs}
          />
        </View>

        {/* ── Appearance ── */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <ToggleRow
            icon="moon-outline"
            iconBg="#F0EEFF"
            iconColor="#7B61FF"
            label="Dark Mode"
            sublabel="Switch to dark theme"
            value={darkMode}
            onToggle={setDarkMode}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            icon="volume-high-outline"
            iconBg="#FFF0F5"
            iconColor="#D81B60"
            label="Sound Effects"
            sublabel="Audio feedback on actions"
            value={sound}
            onToggle={setSound}
          />
        </View>

        {/* ── Learning ── */}
        <Text style={styles.sectionTitle}>Learning</Text>
        <View style={styles.card}>
          <ToggleRow
            icon="play-circle-outline"
            iconBg="#E6F5F4"
            iconColor={COLORS.primary}
            label="Auto-play Videos"
            sublabel="Start videos automatically"
            value={autoPlay}
            onToggle={setAutoPlay}
          />
          <View style={styles.rowDivider} />
          <ToggleRow
            icon="cellular-outline"
            iconBg="#FFF4E5"
            iconColor="#E27800"
            label="Save Data Mode"
            sublabel="Reduce video quality on mobile"
            value={saveData}
            onToggle={setSaveData}
          />
        </View>

        {/* ── Privacy ── */}
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.card}>
          <ToggleRow
            icon="location-outline"
            iconBg="#E3F2FD"
            iconColor="#1565C0"
            label="Share Location"
            sublabel="For regional tutor matching"
            value={locationShare}
            onToggle={setLocationShare}
          />
          <View style={styles.rowDivider} />
          <TapRow
            icon="lock-closed-outline"
            iconBg="#F0EEFF"
            iconColor="#7B61FF"
            label="Change Password"
            sublabel="Update your login password"
            onPress={handleChangePassword}
          />
        </View>

        {/* ── Storage ── */}
        <Text style={styles.sectionTitle}>Storage & Data</Text>
        <View style={styles.card}>
          <TapRow
            icon="trash-bin-outline"
            iconBg="#FFF8E1"
            iconColor="#F9A825"
            label="Clear Cache"
            sublabel="Free up device storage"
            onPress={handleClearCache}
          />
          <View style={styles.rowDivider} />
          <TapRow
            icon="cloud-download-outline"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            label="Download My Data"
            sublabel="Export all your activity data"
            onPress={() => global.showAlert("Download", "Your data export will be sent to your email.")}
          />
        </View>

        {/* ── About ── */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <TapRow
            icon="information-circle-outline"
            iconBg="#EAF0FD"
            iconColor="#1677FF"
            label="About Learnly"
            sublabel="Version 1.0.0"
            onPress={() => global.showAlert("Learnly", "Version 1.0.0\nMade with ❤️ for students.")}
          />
          <View style={styles.rowDivider} />
          <TapRow
            icon="document-text-outline"
            iconBg="#F3F8FF"
            iconColor="#5C6BC0"
            label="Terms & Conditions"
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <TapRow
            icon="shield-checkmark-outline"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            label="Privacy Policy"
            onPress={() => {}}
          />
        </View>

        {/* ── Danger Zone ── */}
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.card}>
          <TapRow
            icon="person-remove-outline"
            iconBg={COLORS.redBg}
            iconColor={COLORS.red}
            label="Delete Account"
            sublabel="Permanently remove your account"
            onPress={handleDeleteAccount}
            danger
          />
        </View>

        <Text style={styles.versionText}>Learnly v1.0.0 · © 2025</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  /* Header */
  header: {
    height: 56,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  backBtn: {
    width: 38,
    height: 38,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 15, fontWeight: "900", color: COLORS.text },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },

  /* Section */
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
    letterSpacing: 0.8,
    marginBottom: 9,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 22,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  rowDivider: { height: 0.5, backgroundColor: COLORS.border, marginLeft: 58 },

  /* Row */
  settingRow: {
    minHeight: 58,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  settingTextBox: { flex: 1 },
  settingLabel: { fontSize: 13, fontWeight: "800", color: COLORS.text },
  settingSubLabel: { fontSize: 10.5, fontWeight: "600", color: COLORS.muted, marginTop: 2 },

  versionText: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
    marginTop: 4,
    marginBottom: 8,
  },
});
