// screens/StudentLoginScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
  Image,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import ShowAlert from "../../components/ShowAlert";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#006D6A",
  primaryDark: "#00514F",
  white: "#FFFFFF",
  text: "#07123A",
  muted: "#6B7890",
  border: "#E6ECEC",
  inputBg: "#F7F9FC",
  error: "#E53935",
  light: "#F0F9F9",
};

export default function StudentLoginScreen({ navigation, route }) {
  const { loginStudent } = useAppContext();
  const [emailOrPhone, setEmailOrPhone] = useState(
    route?.params?.emailOrPhone || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onClose: null,
  });

  const openAlert = (title, message, onClose = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      onClose,
    });
  };

  const closeAlert = () => {
    const callback = alertConfig.onClose;

    setAlertConfig({
      visible: false,
      title: "",
      message: "",
      onClose: null,
    });

    if (typeof callback === "function") {
      callback();
    }
  };

  const handleLogin = async () => {
    if (!emailOrPhone.trim()) {
      openAlert("Required", "Email or phone enter cheyyandi.");
      return;
    }

    if (!password.trim()) {
      openAlert("Required", "Password enter cheyyandi.");
      return;
    }

    try {
      setLoading(true);
      await loginStudent({
        emailOrPhone: emailOrPhone.trim(),
        password,
      });
      navigation.replace("StudentDashboard");
    } catch (error) {
      openAlert(
        "Login Failed",
        error.message || "Wrong credentials. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate("StudentRegister");
  };

  const handleForgotPassword = () => {
    // handle forgot password
  };

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation?.reset?.({
      index: 0,
      routes: [{ name: "RoleSelectionScreen" }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBackSafe}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.welcomeText}>Welcome Back! 👋</Text>
            <Text style={styles.subText}>Login to continue</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email / Phone */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Email / Phone</Text>
              <View
                style={[
                  styles.inputContainer,
                  emailFocused && styles.inputFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={emailFocused ? COLORS.primary : COLORS.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email or Phone number"
                  placeholderTextColor={COLORS.muted}
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={passwordFocused ? COLORS.primary : COLORS.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={COLORS.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotWrapper}
              activeOpacity={0.75}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.88}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <FontAwesome name="google" size={20} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <FontAwesome name="apple" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.75}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ShowAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={closeAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  backButton: {
    marginTop: Platform.OS === "android" ? 16 : 10,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSection: {
    marginTop: 32,
    marginBottom: 36,
  },

  welcomeText: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.text,
  },

  subText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.muted,
  },

  form: {
    width: "100%",
  },

  fieldWrapper: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 54,
  },

  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.light,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
  },

  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },

  forgotWrapper: {
    alignSelf: "flex-end",
    marginBottom: 28,
  },

  forgotText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },

  loginButton: {
    width: "100%",
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    marginBottom: 28,
  },

  loginText: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 32,
  },

  socialButton: {
    width: 58,
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    paddingTop: 12,
  },

  signupPrompt: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.muted,
  },

  signupLink: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },
});
