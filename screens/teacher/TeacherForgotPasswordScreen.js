import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import ShowAlert from "../../components/ShowAlert";

const COLORS = {
  bg: "#FFFFFF",
  white: "#FFFFFF",
  primary: "#006D6A",
  text: "#07123A",
  muted: "#5E687C",
  border: "#E3E9F3",
  inputText: "#2D3B52",
};

export default function TeacherForgotPasswordScreen({ navigation }) {
  const { sendTeacherForgotPasswordCode, resetTeacherPassword } = useAppContext();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onClose: null,
  });

  const openAlert = (title, message, onClose = null) =>
    setAlertConfig({ visible: true, title, message, onClose });

  const closeAlert = () => {
    const callback = alertConfig.onClose;
    setAlertConfig({ visible: false, title: "", message: "", onClose: null });
    if (typeof callback === "function") callback();
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      openAlert("Required", "Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      await sendTeacherForgotPasswordCode({ email: email.trim() });
      setLoading(false);
      setCodeSent(true);
      openAlert("Email Sent", "Reset code sent to your email.");
    } catch (error) {
      setLoading(false);
      openAlert("Request Failed", error.message || "Unable to send reset code.");
    }
  };

  const handleReset = async () => {
    if (!email.trim() || !code.trim() || !newPassword.trim()) {
      openAlert("Required", "Please fill email, code and new password.");
      return;
    }

    try {
      setLoading(true);
      await resetTeacherPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword: newPassword.trim(),
      });
      setLoading(false);
      openAlert(
        "Password Updated",
        "Your password was changed successfully.",
        () => navigation.replace("TeacherLogin", { emailOrPhone: email.trim() })
      );
    } catch (error) {
      setLoading(false);
      openAlert("Reset Failed", error.message || "Unable to reset password.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>We will send a reset code to your registered email.</Text>

          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={18} color={COLORS.muted} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {codeSent ? (
            <>
              <View style={styles.inputBox}>
                <Ionicons name="key-outline" size={18} color={COLORS.muted} />
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter reset code"
                  placeholderTextColor={COLORS.muted}
                  style={styles.input}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.muted} />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={COLORS.muted}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={codeSent ? handleReset : handleSendCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryBtnText}>
                {codeSent ? "Reset Password" : "Send Reset Code"}
              </Text>
            )}
          </TouchableOpacity>
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
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: "900", color: COLORS.text },
  subtitle: { marginTop: 10, fontSize: 14, lineHeight: 22, fontWeight: "600", color: COLORS.muted, marginBottom: 24 },
  inputBox: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 14, fontWeight: "600", color: COLORS.inputText },
  primaryBtn: {
    marginTop: 8,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 15, fontWeight: "900", color: COLORS.white },
});
