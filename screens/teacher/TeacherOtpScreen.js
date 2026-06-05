import React, { useEffect, useRef, useState } from "react";
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
const OTP_LENGTH = 6;

const COLORS = {
  white: "#FFFFFF",
  primary: "#006D6A",
  text: "#07123A",
  muted: "#586176",
  border: "#E1E7F0",
  light: "#F5FBFB",
};

export default function TeacherOtpVerificationScreen({ navigation, route }) {
  const { verifyTeacherRegistrationOtp, initiateTeacherRegistration } = useAppContext();
  const phoneNumber = route?.params?.phone || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onClose: null,
  });
  const inputRefs = useRef([]);

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

  useEffect(() => {
    if (timer <= 0) return undefined;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const updateOtp = (text, index) => {
    const value = text.replace(/[^0-9]/g, "");
    const updatedOtp = [...otp];
    updatedOtp[index] = value.slice(-1);
    setOtp(updatedOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // const handleVerify = async () => {
  //   const finalOtp = otp.join("");

  //   if (finalOtp.length !== OTP_LENGTH) {
  //     openAlert("Invalid OTP", "Please enter all 6 digits.");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     await verifyTeacherRegistrationOtp({
  //       phone: phoneNumber,
  //       otp: finalOtp,
  //     });
  //     setLoading(false);
  //     navigation.reset({
  //       index: 0,
  //       routes: [{ name: "CompleteProfile", params: { ...route?.params } }],
  //     });
  //   } catch (error) {
  //     setLoading(false);
  //     openAlert("Verification Failed", error.message || "Invalid OTP.");
  //   }
  // };
const handleVerify = async () => {
  const finalOtp = otp.join("");

  if (finalOtp.length !== OTP_LENGTH) {
    openAlert("Invalid OTP", "Please enter all 6 digits.");
    return;
  }

  try {
    setLoading(true);
    await verifyTeacherRegistrationOtp({
      phone: phoneNumber,
      otp: finalOtp,
    });
    setLoading(false);

    // ✅ FIX - explicitly pass each field instead of spreading route?.params
    navigation.navigate("CompleteProfile", {
      fullName: route?.params?.fullName || "",
      email: route?.params?.email || "",
      phone: route?.params?.phone || "",
      password: route?.params?.password || "",
    });

  } catch (error) {
    setLoading(false);
    openAlert("Verification Failed", error.message || "Invalid OTP.");
  }
};
  const handleResend = async () => {
    if (timer > 0 || loading) return;

    try {
      setLoading(true);
      await initiateTeacherRegistration({
        fullName: route?.params?.fullName,
        email: route?.params?.email,
        phone: route?.params?.phone,
        password: route?.params?.password,
      });
      setOtp(["", "", "", "", "", ""]);
      setTimer(45);
      inputRefs.current[0]?.focus();
      setLoading(false);
      openAlert("OTP Sent", "A new OTP has been sent to your phone.");
    } catch (error) {
      setLoading(false);
      openAlert("Resend Failed", error.message || "Unable to resend OTP.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity activeOpacity={0.8} style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
            <Text style={styles.phoneText}>{phoneNumber}</Text>
          </View>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={digit}
                onChangeText={(text) => updateOtp(text, index)}
                onKeyPress={(event) => handleBackspace(event, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                style={styles.otpBox}
                selectionColor={COLORS.primary}
              />
            ))}
          </View>

          <TouchableOpacity activeOpacity={timer === 0 ? 0.8 : 1} style={styles.resendBox} onPress={handleResend}>
            <Text style={styles.resendText}>
              {timer > 0 ? `Resend code in 00:${String(timer).padStart(2, "0")}` : "Resend code"}
            </Text>
          </TouchableOpacity>

          <View style={styles.shieldContainer}>
            <View style={styles.shieldGlow}>
              <Ionicons name="shield-checkmark" size={width < 380 ? 88 : 105} color={COLORS.primary} />
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.9} style={styles.verifyBtn} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.verifyText}>Verify</Text>}
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
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width < 380 ? 20 : 28,
    paddingTop: Platform.OS === "android" ? 16 : 10,
    paddingBottom: 35,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  header: { alignItems: "center", marginTop: height < 700 ? 20 : 40 },
  title: { fontSize: width < 380 ? 26 : 31, fontWeight: "900", color: COLORS.text, textAlign: "center" },
  subtitle: { marginTop: 22, fontSize: width < 380 ? 16 : 20, fontWeight: "700", color: COLORS.muted, textAlign: "center", lineHeight: 30 },
  phoneText: { marginTop: 12, fontSize: width < 380 ? 22 : 27, fontWeight: "900", color: COLORS.text, textAlign: "center", letterSpacing: 0.4 },
  otpRow: { marginTop: height < 700 ? 45 : 65, flexDirection: "row", justifyContent: "space-between" },
  otpBox: {
    width: width < 380 ? 48 : 54,
    height: width < 380 ? 58 : 68,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    fontSize: width < 380 ? 24 : 28,
    fontWeight: "900",
    color: COLORS.text,
  },
  resendBox: { marginTop: 38, alignItems: "center" },
  resendText: { fontSize: width < 380 ? 15 : 18, fontWeight: "700", color: COLORS.muted },
  shieldContainer: { alignItems: "center", marginTop: height < 700 ? 55 : 80, marginBottom: height < 700 ? 55 : 75 },
  shieldGlow: {
    width: width < 380 ? 160 : 190,
    height: width < 380 ? 160 : 190,
    borderRadius: 100,
    backgroundColor: COLORS.light,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBtn: {
    height: width < 380 ? 60 : 72,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  verifyText: { fontSize: width < 380 ? 21 : 25, fontWeight: "900", color: COLORS.white, letterSpacing: 0.3 },
});
