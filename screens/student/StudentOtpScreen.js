



// screens/StudentOtpScreen.js

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";

const { width, height } = Dimensions.get("window");

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

const OTP_LENGTH = 6;
const H_PADDING = 22;
const GAP = width < 360 ? 6 : 8;
const BOX_SIZE = Math.min(48, (width - H_PADDING * 2 - GAP * 5) / 6);

export default function StudentOtpScreen({ navigation, route }) {
  const { setLoggedInUser } = useAppContext();
  const phone = route?.params?.phone || "+91 98765 43210";
  const registeredStudent = route?.params?.registeredStudent || null;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChangeText = (text, index) => {
    const digits = text.replace(/[^0-9]/g, "");

    if (digits.length > 1) {
      const pasted = digits.slice(0, OTP_LENGTH).split("");
      const newOtp = Array(OTP_LENGTH).fill("");

      pasted.forEach((d, i) => {
        newOtp[i] = d;
      });

      setOtp(newOtp);

      const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digits;
    setOtp(newOtp);

    if (digits && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key !== "Backspace") return;

    const newOtp = [...otp];

    if (newOtp[index]) {
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    if (index > 0) {
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (!isComplete) {
      global.showAlert("Incomplete OTP", "Please enter the 6-digit OTP.");
      return;
    }

    if (registeredStudent) {
      setLoggedInUser({
        ...registeredStudent,
        role: "student",
      });
      navigation.reset({
        index: 0,
        routes: [{ name: "StudentDashboard" }],
      });
      return;
    }

    navigation.navigate("StudentLogin");
  };

  const handleResend = () => {
    if (!canResend) return;

    setOtp(Array(OTP_LENGTH).fill(""));
    setResendTimer(60);
    setCanResend(false);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.75}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <Ionicons
                  name="shield-checkmark"
                  size={42}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <Text style={styles.headingText}>Verify Your Number</Text>

            <Text style={styles.subText}>
              Enter the 6-digit OTP code sent to
            </Text>

            <Text style={styles.phoneText}>{phone}</Text>

            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpBox,
                    focusedIndex === index && styles.otpBoxFocused,
                    digit !== "" && styles.otpBoxFilled,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleChangeText(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  caretHidden={false}
                  selectTextOnFocus
                />
              ))}
            </View>

            <View style={styles.resendRow}>
              {canResend ? (
                <>
                  <Text style={styles.resendLabel}>Didn’t get code? </Text>
                  <TouchableOpacity onPress={handleResend} activeOpacity={0.75}>
                    <Text style={styles.resendLink}>Resend</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.resendLabel}>Resend code in </Text>
                  <Text style={styles.timerText}>
                    00:{String(resendTimer).padStart(2, "0")}
                  </Text>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.verifyButton,
                !isComplete && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerify}
              activeOpacity={0.88}
              disabled={!isComplete}
            >
              <Text style={styles.verifyText}>Verify OTP</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bottomNote}>
            Your number is safe with us. We use OTP only for secure login.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#F4FAFA",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: Platform.OS === "android" ? 16 : 10,
    paddingBottom: 28,
    justifyContent: height < 700 ? "flex-start" : "center",
  },

  topRow: {
    width: "100%",
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  card: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 28,
    paddingHorizontal: width < 360 ? 16 : 20,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: "center",
    shadowColor: "#002E2C",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  iconOuter: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: "#E8F7F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#DDF3F2",
    alignItems: "center",
    justifyContent: "center",
  },

  headingText: {
    fontSize: width < 360 ? 24 : 28,
    lineHeight: width < 360 ? 30 : 34,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  subText: {
    marginTop: 12,
    fontSize: width < 360 ? 13 : 14,
    lineHeight: 22,
    fontWeight: "600",
    color: COLORS.muted,
    textAlign: "center",
  },

  phoneText: {
    marginTop: 5,
    fontSize: width < 360 ? 14 : 16,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  otpRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: GAP,
    marginTop: 34,
    marginBottom: 26,
  },

  otpBox: {
    width: BOX_SIZE,
    height: BOX_SIZE + 8,
    borderRadius: 14,
    borderWidth: 1.6,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    fontSize: width < 360 ? 19 : 22,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    paddingVertical: 0,
  },

  otpBoxFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.light,
  },

  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: "#E8F7F7",
  },

  resendRow: {
    minHeight: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },

  resendLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.muted,
  },

  timerText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
  },

  resendLink: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
    textDecorationLine: "underline",
  },

  verifyButton: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  verifyButtonDisabled: {
    opacity: 0.45,
  },

  verifyText: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  bottomNote: {
    marginTop: 18,
    paddingHorizontal: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: COLORS.muted,
    textAlign: "center",
  },
});
