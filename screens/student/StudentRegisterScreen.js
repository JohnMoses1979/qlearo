// screens/StudentRegisterScreen.js

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
  light: "#F0F9F9",
};

export default function StudentRegisterScreen({ navigation }) {
  const { registerStudent } = useAppContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [focusedField, setFocusedField] = useState(null);
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

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      openAlert("Required", "Please fill all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      openAlert("Password Mismatch", "Password and confirm password should match.");
      return;
    }

    try {
      setLoading(true);
      await registerStudent({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        className: "10th",
      });
      openAlert(
        "Account Created",
        "Registration successful. Please login with your email or phone and password.",
        () =>
          navigation.replace("StudentLogin", {
            emailOrPhone: email.trim() || phone.trim(),
          })
      );
    } catch (error) {
      openAlert("Registration Failed", error.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => [
    styles.inputContainer,
    focusedField === field && styles.inputFocused,
  ];

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
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.headingText}>Create Account</Text>
            <Text style={styles.subText}>Let's get you started</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Full Name</Text>
              <View style={inputStyle("name")}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={focusedField === "name" ? COLORS.primary : COLORS.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={COLORS.muted}
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Email</Text>
              <View style={inputStyle("email")}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={focusedField === "email" ? COLORS.primary : COLORS.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={COLORS.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={inputStyle("phone")}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  color={focusedField === "phone" ? COLORS.primary : COLORS.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor={COLORS.muted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={inputStyle("password")}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={focusedField === "password" ? COLORS.primary : COLORS.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={COLORS.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
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

            {/* Confirm Password */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={inputStyle("confirmPassword")}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={focusedField === "confirmPassword" ? COLORS.primary : COLORS.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor={COLORS.muted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms & Conditions */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && (
                  <Ionicons name="checkmark" size={13} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to{" "}
                <Text style={styles.termsLink}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                !agreed && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              activeOpacity={0.88}
              disabled={!agreed}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.registerText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("StudentLogin")}
              activeOpacity={0.75}
            >
              <Text style={styles.loginLink}>Login</Text>
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
    marginTop: 28,
    marginBottom: 30,
  },

  headingText: {
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
    marginBottom: 16,
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

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 28,
    gap: 10,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.8,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  termsText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
  },

  termsLink: {
    color: COLORS.primary,
    fontWeight: "800",
  },

  registerButton: {
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

  registerButtonDisabled: {
    opacity: 0.55,
  },

  registerText: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },

  loginPrompt: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.muted,
  },

  loginLink: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },
});
