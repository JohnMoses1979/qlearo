// src/screens/admin/AdminLoginScreen.js

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminApi } from "../../services/adminApi";

const COLORS = {
  bg: "#F6FAFB",
  white: "#FFFFFF",
  teal: "#00796B",
  tealDark: "#006A60",
  tealDeep: "#00574F",
  tealLight: "#E6F5F3",
  tealSoft: "#F0FFFC",
  text: "#07123A",
  muted: "#6E7891",
  border: "#E4EBF2",
  green: "#059669",
  red: "#EF4444",
  orange: "#F97316",
  shadow: "rgba(0,0,0,0.12)",
};

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  const isValid = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0;
  }, [email, password]);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      global.showAlert("Email Required", "Please enter admin email.");
      return;
    }

    if (!cleanPassword) {
      global.showAlert("Password Required", "Please enter admin password.");
      return;
    }

    try {
      setLoading(true);
      await adminApi.login({
        email: cleanEmail,
        password: cleanPassword,
      });
      navigation?.replace?.("AdminDashboard", {
        admin: {
          email: cleanEmail,
          name: "Admin",
          role: "admin",
        },
      });
    } catch (error) {
      global.showAlert(
        "Invalid Login",
        error?.message || "Please check admin email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const goBackSafe = () => {
    navigation?.reset?.({
      index: 0,
      routes: [{ name: "RoleSelectionScreen" }],
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.hero}>
            <View style={styles.heroHeader}>
              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.heroIconBtn}
                onPress={goBackSafe}
              >
                <Ionicons name="chevron-back" size={24} color={COLORS.white} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.heroIconBtn}
                onPress={() => setHelpVisible(true)}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.logoWrap}>
              <View style={styles.logoCircle}>
                <Ionicons name="shield-checkmark" size={42} color={COLORS.teal} />
              </View>

              <View style={styles.glowOne} />
              <View style={styles.glowTwo} />
            </View>

            <Text style={styles.heroTitle}>Admin Portal</Text>
            <Text style={styles.heroSub}>
              Manage subscriptions, teacher earnings, payouts and platform activity.
            </Text>
          </View>

          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Login to continue as admin</Text>
              </View>

              <View style={styles.adminBadge}>
                <Ionicons name="person" size={16} color={COLORS.teal} />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="flash-outline" size={20} color={COLORS.teal} />
              <Text style={styles.infoText}>
                Teacher earnings are credited instantly after completed doubts,
                sessions and mock tests.
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Admin Email</Text>

              <View style={styles.inputWrap}>
                <View style={styles.inputIcon}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.teal} />
                </View>

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter admin email"
                  placeholderTextColor="#9AA4B6"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />

                {email.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setEmail("")}
                    style={styles.clearBtn}
                  >
                    <Ionicons name="close-circle" size={18} color={COLORS.muted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>

              <View style={styles.inputWrap}>
                <View style={styles.inputIcon}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.teal}
                  />
                </View>

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#9AA4B6"
                  secureTextEntry={secure}
                  style={styles.input}
                />

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSecure((prev) => !prev)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={secure ? "eye-off-outline" : "eye-outline"}
                    size={21}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionRow}>
              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.rememberRow}
                onPress={() => setRememberMe((prev) => !prev)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxActive,
                  ]}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={15} color={COLORS.white} />
                  )}
                </View>

                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() =>
                  global.showAlert(
                    "Forgot Password",
                    "Password reset option will be connected with your backend later."
                  )
                }
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.loginBtn,
                (!isValid || loading) && styles.loginBtnDisabled,
              ]}
              onPress={handleLogin}
              disabled={!isValid || loading}
            >
              <Text style={styles.loginText}>
                {loading ? "Checking..." : "Login as Admin"}
              </Text>
              <Ionicons
                name={loading ? "hourglass-outline" : "arrow-forward"}
                size={20}
                color={COLORS.white}
              />
            </TouchableOpacity>

          </View>

          <View style={styles.bottomInfo}>
            <View style={styles.bottomIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.teal} />
            </View>
            <Text style={styles.bottomText}>
              Secure admin access for revenue, payouts and teacher earning management.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={helpVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setHelpVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalDim}
            onPress={() => setHelpVisible(false)}
          />

          <View style={styles.helpCard}>
            <View style={styles.helpHeader}>
              <Text style={styles.helpTitle}>Admin Login Help</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.helpClose}
                onPress={() => setHelpVisible(false)}
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.helpItem}>
              <Ionicons name="mail-outline" size={21} color={COLORS.teal} />
              <Text style={styles.helpText}>
                Use your registered admin email and password.
              </Text>
            </View>

            <View style={styles.helpItem}>
              <Ionicons name="wallet-outline" size={21} color={COLORS.teal} />
              <Text style={styles.helpText}>
                Admin can view student subscriptions and teacher payouts.
              </Text>
            </View>

            <View style={styles.helpItem}>
              <Ionicons name="flash-outline" size={21} color={COLORS.teal} />
              <Text style={styles.helpText}>
                Teacher earnings can be generated instantly after completed work.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.helpPrimaryBtn}
              onPress={() => setHelpVisible(false)}
            >
              <Text style={styles.helpPrimaryText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 56,
    backgroundColor: COLORS.bg,
  },

  hero: {
    minHeight: 330,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === "ios" ? 12 : 18,
    paddingBottom: 32,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: "hidden",
  },

  heroHeader: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  logoWrap: {
    alignSelf: "center",
    marginTop: 18,
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },

  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },

  glowOne: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  glowTwo: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  heroTitle: {
    marginTop: 14,
    fontSize: 31,
    fontWeight: "900",
    color: COLORS.white,
    textAlign: "center",
  },

  heroSub: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    color: "rgba(255,255,255,0.86)",
    textAlign: "center",
  },

  loginCard: {
    marginHorizontal: 18,
    marginTop: -38,
    backgroundColor: COLORS.white,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.muted,
  },

  adminBadge: {
    height: 34,
    borderRadius: 15,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  adminBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.teal,
  },

  infoBox: {
    borderRadius: 17,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  infoText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  formGroup: {
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 8,
  },

  inputWrap: {
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: "#F9FBFD",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    paddingVertical: 0,
  },

  clearBtn: {
    padding: 6,
  },

  eyeBtn: {
    padding: 6,
  },

  optionRow: {
    marginTop: 2,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  checkboxActive: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.teal,
  },

  rememberText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  forgotText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.teal,
  },

  loginBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },

  loginBtnDisabled: {
    opacity: 0.55,
  },

  loginText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.white,
  },

  bottomInfo: {
    marginHorizontal: 18,
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  bottomIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  bottomText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.muted,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7,18,58,0.35)",
  },

  helpCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    paddingBottom: Platform.OS === "ios" ? 32 : 22,
  },

  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  helpTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  helpClose: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  helpItem: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  helpText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  helpPrimaryBtn: {
    marginTop: 8,
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
  },

  helpPrimaryText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },
});
