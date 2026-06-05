import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  muted: "#4D5B73",
  border: "#E3E9F3",
  inputText: "#2D3B52",
};

export default function TeacherRegisterScreen({ navigation }) {
  const { initiateTeacherRegistration } = useAppContext();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [agree, setAgree] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onClose: null,
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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

  const handleRegister = async () => {
    if (!form.name.trim()) {
      openAlert("Required", "Please enter your name");
      return;
    }
    if (!form.email.trim()) {
      openAlert("Required", "Please enter your email");
      return;
    }
    if (!form.phone.trim()) {
      openAlert("Required", "Please enter your phone number");
      return;
    }
    if (!form.password.trim()) {
      openAlert("Required", "Please enter your password");
      return;
    }
    if (form.password !== form.confirmPassword) {
      openAlert("Password Error", "Password and confirm password do not match");
      return;
    }
    if (!agree) {
      openAlert("Terms Required", "Please accept Terms & Conditions");
      return;
    }

    try {
      setLoading(true);
      await initiateTeacherRegistration({
        fullName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password.trim(),
      });
      setLoading(false);
      navigation.navigate("TeacherOtpVerification", {
        fullName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password.trim(),
      });
    } catch (error) {
      setLoading(false);
      openAlert("Registration Failed", error.message || "Unable to send OTP.");
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
            activeOpacity={0.8}
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Teacher Account</Text>
            <Text style={styles.subtitle}>Register and verify your phone</Text>
          </View>

          <View style={styles.formBox}>
            <Field icon="person" value={form.name} onChangeText={(text) => updateField("name", text)} placeholder="Name" />
            <Field icon="mail" value={form.email} onChangeText={(text) => updateField("email", text)} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
            <Field icon="call" value={form.phone} onChangeText={(text) => updateField("phone", text)} placeholder="Phone number" keyboardType="phone-pad" />

            <PasswordField
              value={form.password}
              onChangeText={(text) => updateField("password", text)}
              placeholder="Password"
              show={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
            />

            <PasswordField
              value={form.confirmPassword}
              onChangeText={(text) => updateField("confirmPassword", text)}
              placeholder="Confirm Password"
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
            />

            <TouchableOpacity style={styles.termsRow} onPress={() => setAgree((prev) => !prev)}>
              <View style={[styles.checkBox, agree && styles.checkBoxActive]}>
                {agree ? <Ionicons name="checkmark" size={14} color={COLORS.white} /> : null}
              </View>
              <Text style={styles.termsText}>I accept Terms & Conditions</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.registerText}>Send OTP</Text>}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginLabel}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("TeacherLogin")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
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

function Field({ icon, ...props }) {
  return (
    <View style={styles.inputBox}>
      <Ionicons name={icon} size={22} color={COLORS.muted} />
      <TextInput placeholderTextColor={COLORS.muted} style={styles.input} {...props} />
    </View>
  );
}

function PasswordField({ show, onToggle, ...props }) {
  return (
    <View style={styles.inputBox}>
      <Ionicons name="lock-closed" size={22} color={COLORS.muted} />
      <TextInput
        placeholderTextColor={COLORS.muted}
        style={styles.input}
        secureTextEntry={!show}
        autoCapitalize="none"
        {...props}
      />
      <TouchableOpacity onPress={onToggle}>
        <Ionicons name={show ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.muted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  header: { alignItems: "center", marginBottom: 28 },
  title: { fontSize: 28, fontWeight: "900", color: COLORS.text, textAlign: "center" },
  subtitle: { marginTop: 8, fontSize: 14, fontWeight: "600", color: COLORS.muted, textAlign: "center" },
  formBox: { gap: 14 },
  inputBox: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: { flex: 1, fontSize: 14, fontWeight: "600", color: COLORS.inputText },
  termsRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBoxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  termsText: { fontSize: 13, fontWeight: "600", color: COLORS.muted },
  registerBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  registerText: { fontSize: 15, fontWeight: "900", color: COLORS.white },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  loginLabel: { fontSize: 13, fontWeight: "600", color: COLORS.muted },
  loginLink: { fontSize: 13, fontWeight: "900", color: COLORS.primary },
});
