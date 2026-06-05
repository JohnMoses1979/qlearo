import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import ShowAlert from "../../components/ShowAlert";

const { width, height } = Dimensions.get("window");

const COLORS = {
  white: "#FFFFFF",
  bg: "#FFFFFF",
  primary: "#006D6A",
  text: "#07123A",
  muted: "#5E687C",
  border: "#E3E9F3",
  inputText: "#2D3B52",
  lightGreen: "#F0FAF9",
};

export default function TeacherLoginScreen({ navigation, route }) {
  const { loginTeacher } = useAppContext();
  const [emailOrPhone, setEmailOrPhone] = useState(route?.params?.emailOrPhone || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onClose: null,
  });

  const openAlert = (title, message, onClose = null) => {
    setAlertConfig({ visible: true, title, message, onClose });
  };

  const closeAlert = () => {
    const callback = alertConfig.onClose;
    setAlertConfig({ visible: false, title: "", message: "", onClose: null });
    if (typeof callback === "function") {
      callback();
    }
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

  const handleLogin = async () => {
    if (!emailOrPhone.trim()) {
      openAlert("Required", "Please enter your phone number or email.");
      return;
    }

    if (!password.trim()) {
      openAlert("Required", "Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      await loginTeacher({
        emailOrPhone: emailOrPhone.trim(),
        password: password.trim(),
      });
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "TeacherDashboard" }],
      });
    } catch (error) {
      setLoading(false);
      openAlert("Login Failed", error.message || "Unable to login right now.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={goBackSafe}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="school-outline" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Teacher Login</Text>
            <Text style={styles.subtitle}>
              Welcome back! Sign in after admin approval
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Phone / Email</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={18} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                placeholder="Enter phone number or email"
                placeholderTextColor={COLORS.muted}
                style={styles.input}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.muted}
                style={styles.input}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)} activeOpacity={0.7}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color={COLORS.muted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.forgotRow}
              onPress={() => navigation.navigate("TeacherForgotPassword")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerLabel}>Don't have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("TeacherRegister")}
            >
              <Text style={styles.registerLink}>Register</Text>
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
  container: { flex: 1, backgroundColor: COLORS.bg },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width < 380 ? 18 : 24,
    paddingTop: Platform.OS === "android" ? 20 : 12,
    paddingBottom: 34,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  header: {
    alignItems: "center",
    marginTop: height < 700 ? 16 : 28,
    marginBottom: height < 700 ? 28 : 38,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: width < 380 ? 22 : 26,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  form: { width: "100%" },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 2,
  },
  inputBox: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.inputText,
    paddingVertical: 0,
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginBottom: 22,
    marginTop: -6,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
  },
  loginBtn: {
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
    marginBottom: 22,
  },
  loginText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.white,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  registerLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
  },
});
