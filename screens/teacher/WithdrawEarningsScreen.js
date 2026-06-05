import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { useAppContext } from "../../context/AppContext";
import { subscriptionApi } from "../../services/subscriptionApi";

const THEME = {
  bg: "#F3F7FB",
  card: "#FFFFFF",
  text: "#101A45",
  muted: "#7E88A6",
  primary: "#0B8B82",
  primarySoft: "#E8FBF7",
  accent: "#2563EB",
  border: "#E6ECF5",
};

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const MIN_WITHDRAW_AMOUNT = 20;

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const parseAmount = (value) => {
  const numeric = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? Math.floor(numeric) : 0;
};

const buildCheckoutHtml = ({
  keyId,
  orderId,
  amount,
  name,
  email,
  contact,
  method,
  note,
}) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        background: #0b1220;
        color: white;
        font-family: Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .box { padding: 24px; text-align: center; }
      .title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
      .sub { font-size: 14px; opacity: 0.8; line-height: 1.4; }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="title">Opening secure withdrawal flow...</div>
      <div class="sub">Please wait while Razorpay loads.</div>
    </div>
    <script>
      (function () {
        function post(payload) {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
        try {
          var checkout = new Razorpay({
            key: ${JSON.stringify(keyId)},
            amount: ${Number(amount) * 100},
            currency: "INR",
            name: "Qlearo",
            description: ${JSON.stringify(note || "Teacher withdrawal")},
            order_id: ${JSON.stringify(orderId)},
            prefill: {
              name: ${JSON.stringify(name || "")},
              email: ${JSON.stringify(email || "")},
              contact: ${JSON.stringify(contact || "")}
            },
            theme: { color: "#0B8B82" },
            modal: {
              ondismiss: function () {
                post({ type: "cancelled" });
              }
            },
            handler: function (response) {
              post({
                type: "success",
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              });
            }
          });

          checkout.on("payment.failed", function (response) {
            post({
              type: "failed",
              message: (response && response.error && response.error.description) || "Payment failed"
            });
          });

          checkout.open();
        } catch (error) {
          post({
            type: "failed",
            message: error && error.message ? error.message : "Unable to open Razorpay"
          });
        }
      })();
    </script>
  </body>
</html>`;

export default function WithdrawEarningsScreen({ navigation }) {
  const { currentUser, setLoggedInUser, refreshTeacherProfile, updateTeacherProfileRemote } = useAppContext();
  const teacherId = currentUser?.teacherId || currentUser?.id || "";

  const [amountText, setAmountText] = useState("");
  const [loading, setLoading] = useState(false);
  const [webVisible, setWebVisible] = useState(false);
  const [webHtml, setWebHtml] = useState("");
  const pendingPromiseRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (currentUser?.role === "teacher" && teacherId && typeof refreshTeacherProfile === "function") {
        void refreshTeacherProfile(teacherId).catch(() => {});
      }
      return () => {};
    }, [currentUser?.role, refreshTeacherProfile, teacherId])
  );

  const totalEarnings = Number(firstValue(currentUser?.paidAmount, currentUser?.lastPayoutAmount, 0));
  const paidAmount = Number(firstValue(currentUser?.paidAmount, currentUser?.lastPayoutAmount, 0));
  const pendingAmount = Number(firstValue(currentUser?.pendingAmount, 0));
  const withdrawnAmount = Number(firstValue(currentUser?.withdrawnAmount, 0));
  const withdrawalMethod = firstValue(currentUser?.withdrawalMethod, "upi");
  const payoutLabel =
    withdrawalMethod === "bank"
      ? "Bank account"
      : withdrawalMethod === "paytm"
      ? "Paytm wallet"
      : "UPI payout";

  const availableBalance = useMemo(() => {
    return Math.max(0, paidAmount - withdrawnAmount);
  }, [totalEarnings, paidAmount, withdrawnAmount]);

  const quickAmounts = useMemo(() => {
    const base = [1000, 2000, 5000, 10000];
    return base.filter((amount) => amount <= Math.max(availableBalance, 1000));
  }, [availableBalance]);

  const amount = parseAmount(amountText);
  const canWithdraw = amount >= MIN_WITHDRAW_AMOUNT && amount <= availableBalance && !loading;

  const showError = useCallback((message) => {
    global.showAlert("Withdraw", message);
  }, []);

  const resolveKeyId = useCallback((order) => {
    return firstValue(
      order?.keyId,
      order?.key,
      order?.razorpayKey,
      process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
      process.env.RAZORPAY_KEY_ID,
      ""
    );
  }, []);

  const ensureRazorpayScript = useCallback(() => {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("Browser checkout is not available"));
    }

    if (window.Razorpay) {
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existing) {
        existing.addEventListener("load", () => resolve(true), { once: true });
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Razorpay checkout"))
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
      document.body.appendChild(script);
    });
  }, []);

  const updateLocalWallet = useCallback(
    async (withdrawAmount) => {
      if (typeof setLoggedInUser !== "function") {
        return;
      }

      const now = new Date().toISOString();
      const historyItem = {
        id: `WITHDRAW_${Date.now()}`,
        type: "Withdrawal",
        title: `${formatMoney(withdrawAmount)} withdrawn`,
        amount: -Math.abs(Number(withdrawAmount || 0)),
        method: withdrawalMethod,
        status: "Completed",
        createdAt: now,
      };

      const updatedUser = {
        ...currentUser,
        availableBalance: Math.max(0, availableBalance - withdrawAmount),
        withdrawnAmount: withdrawnAmount + withdrawAmount,
        pendingAmount,
        lastWithdrawalAmount: withdrawAmount,
        lastWithdrawalMethod: withdrawalMethod,
        lastWithdrawalAt: now,
        withdrawalHistory: [
          historyItem,
          ...firstValue(currentUser?.withdrawalHistory, []),
        ],
      };

      setLoggedInUser(updatedUser);

      if (typeof updateTeacherProfileRemote === "function") {
        try {
          await updateTeacherProfileRemote({
            availableBalance: updatedUser.availableBalance,
            withdrawnAmount: updatedUser.withdrawnAmount,
            pendingAmount: updatedUser.pendingAmount,
            lastWithdrawalAmount: updatedUser.lastWithdrawalAmount,
            lastWithdrawalMethod: updatedUser.lastWithdrawalMethod,
            lastWithdrawalAt: updatedUser.lastWithdrawalAt,
            withdrawalHistory: updatedUser.withdrawalHistory,
          });
        } catch (error) {
          console.warn("Failed to persist withdraw balance", error);
        }
      }
    },
    [availableBalance, currentUser, pendingAmount, setLoggedInUser, updateTeacherProfileRemote, withdrawalMethod, withdrawnAmount]
  );

  const verifyAndComplete = useCallback(
    async (payload) => {
      const orderId = payload?.orderId;
      const paymentId = payload?.paymentId;
      const signature = payload?.signature;

      if (!orderId || !paymentId || !signature) {
        throw new Error("Invalid Razorpay response");
      }

      await subscriptionApi.verifyRazorpayPayment({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        amount: amount * 100,
        purpose: "teacher_withdrawal",
        withdrawal: true,
        teacherId: firstValue(currentUser?.teacherId, currentUser?.id, ""),
        teacherName: firstValue(currentUser?.name, currentUser?.teacherName, "Teacher"),
        method: withdrawalMethod,
        bankAccountHolderName: firstValue(currentUser?.bankAccountHolderName, ""),
        bankName: firstValue(currentUser?.bankName, ""),
        bankAccountNumber: firstValue(currentUser?.bankAccountNumber, ""),
        bankIfscCode: firstValue(currentUser?.bankIfscCode, ""),
        bankBranchName: firstValue(currentUser?.bankBranchName, ""),
        upiId: firstValue(currentUser?.upiId, ""),
      });

      await updateLocalWallet(amount);

      navigation.navigate("WithdrawSuccessScreen", {
        amount,
        method: "upi",
        paymentId,
        orderId,
        signature,
        processedAt: new Date().toISOString(),
      });
    },
    [amount, currentUser?.bankAccountHolderName, currentUser?.bankAccountNumber, currentUser?.bankBranchName, currentUser?.bankIfscCode, currentUser?.bankName, currentUser?.id, currentUser?.name, currentUser?.teacherId, currentUser?.teacherName, currentUser?.upiId, navigation, updateLocalWallet, withdrawalMethod]
  );

  const openRazorpayWeb = useCallback(
    (order) =>
      new Promise((resolve, reject) => {
        if (Platform.OS !== "web") {
          reject(new Error("Razorpay checkout script not available"));
          return;
        }

        ensureRazorpayScript()
          .then(() => {
            const keyId = resolveKeyId(order);
            if (!keyId) {
              throw new Error("Razorpay key missing");
            }

            const checkout = new window.Razorpay({
              key: keyId,
              amount: amount * 100,
              currency: "INR",
              name: "Qlearo",
              description: "Teacher withdrawal",
              order_id: firstValue(order?.orderId, order?.order_id, order?.id, ""),
              prefill: {
                name: firstValue(currentUser?.name, currentUser?.teacherName, "Teacher"),
                email: firstValue(currentUser?.email, ""),
                contact: firstValue(currentUser?.phone, currentUser?.mobile, ""),
              },
              theme: { color: THEME.primary },
              modal: {
                ondismiss: () => reject(new Error("Withdrawal cancelled")),
              },
              handler: (response) =>
                resolve({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
            });

            checkout.on("payment.failed", (response) => {
              reject(new Error(response?.error?.description || "Payment failed"));
            });
            checkout.open();
          })
          .catch(reject);
      }),
    [amount, currentUser?.email, currentUser?.mobile, currentUser?.name, currentUser?.phone, currentUser?.teacherName, ensureRazorpayScript, resolveKeyId]
  );

  const onWebMessage = useCallback((event) => {
    try {
      const payload = JSON.parse(event?.nativeEvent?.data || "{}");

      if (payload.type === "success") {
        setWebVisible(false);
        setWebHtml("");
        pendingPromiseRef.current?.resolve?.(payload);
      } else if (payload.type === "failed") {
        setWebVisible(false);
        setWebHtml("");
        pendingPromiseRef.current?.reject?.(
          new Error(payload.message || "Payment failed")
        );
      } else if (payload.type === "cancelled") {
        setWebVisible(false);
        setWebHtml("");
        pendingPromiseRef.current?.reject?.(
          new Error("Withdrawal cancelled")
        );
      }
    } catch (error) {
      pendingPromiseRef.current?.reject?.(error);
    }
  }, []);

  const openRazorpayMobile = useCallback(
    (order) =>
      new Promise((resolve, reject) => {
        const keyId = resolveKeyId(order);
        if (!keyId) {
          reject(new Error("Razorpay key missing"));
          return;
        }

        const orderId = firstValue(order?.orderId, order?.order_id, order?.id, "");
        const html = buildCheckoutHtml({
          keyId,
          orderId,
          amount,
          name: firstValue(currentUser?.name, currentUser?.teacherName, "Teacher"),
          email: firstValue(currentUser?.email, ""),
          contact: firstValue(currentUser?.phone, currentUser?.mobile, ""),
          method: withdrawalMethod,
          note: "Teacher withdrawal",
        });

        pendingPromiseRef.current = { resolve, reject };
        setWebHtml(html);
        setWebVisible(true);
      }),
    [amount, currentUser?.email, currentUser?.mobile, currentUser?.name, currentUser?.phone, currentUser?.teacherName, resolveKeyId, withdrawalMethod]
  );

  const startWithdrawal = useCallback(async () => {
    const finalAmount = parseAmount(amountText);

    if (!finalAmount || finalAmount < MIN_WITHDRAW_AMOUNT) {
      showError(`Enter at least ₹${MIN_WITHDRAW_AMOUNT} to withdraw.`);
      return;
    }

    if (finalAmount > availableBalance) {
      showError("You cannot withdraw more than the available balance.");
      return;
    }

    setLoading(true);

    try {
      const order = await subscriptionApi.createWithdrawalRazorpayOrder({
        studentId: firstValue(currentUser?.teacherId, currentUser?.id, ""),
        studentName: firstValue(currentUser?.name, currentUser?.teacherName, "Teacher"),
        className: firstValue(currentUser?.qualification, "Teacher"),
        planName: `Withdrawal - ${withdrawalMethod}`,
        amount: finalAmount,
        paymentMode: withdrawalMethod,
        transactionId: `WITHDRAW_${Date.now()}`,
        status: "Requested",
      });

      const result =
        Platform.OS === "web"
          ? await openRazorpayWeb(order)
          : await openRazorpayMobile(order);

      await verifyAndComplete(result);
    } catch (error) {
      showError(
        error?.message ||
          error?.response?.data?.message ||
          "Unable to start withdrawal right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    amountText,
    availableBalance,
    currentUser?.id,
    currentUser?.name,
    currentUser?.teacherId,
    currentUser?.teacherName,
    openRazorpayMobile,
    openRazorpayWeb,
    showError,
    verifyAndComplete,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Withdraw</Text>
            <Text style={styles.subtitle}>Teacher Wallet</Text>
          </View>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => Linking.openURL("tel:+919876543210")}
          >
            <Text style={styles.helpIcon}>?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>{formatMoney(availableBalance)}</Text>
          <Text style={styles.balanceHint}>100% Secure Withdrawals</Text>
        </View>

        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <View style={styles.payoutIcon}>
              <Text style={styles.payoutIconText}>₹</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.payoutTitle}>Payout Details</Text>
              <Text style={styles.payoutSub}>{payoutLabel}</Text>
            </View>
            <TouchableOpacity
              style={styles.payoutEditBtn}
              onPress={() => navigation.navigate("TeacherEditProfile")}
            >
              <Text style={styles.payoutEditText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.payoutMetaGrid}>
            <View style={styles.payoutMetaItem}>
              <Text style={styles.payoutMetaLabel}>Account</Text>
              <Text style={styles.payoutMetaValue}>
                {firstValue(currentUser?.bankAccountNumber, currentUser?.upiId, "Not added")}
              </Text>
            </View>
            <View style={styles.payoutMetaItem}>
              <Text style={styles.payoutMetaLabel}>Holder</Text>
              <Text style={styles.payoutMetaValue}>
                {firstValue(currentUser?.bankAccountHolderName, currentUser?.name, "Teacher")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statTitle}>Total Earnings</Text>
            <Text style={styles.statValue}>{formatMoney(totalEarnings)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statTitle}>Paid</Text>
            <Text style={[styles.statValue, { color: "#0F766E" }]}>{formatMoney(paidAmount)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statTitle}>Pending Amount</Text>
            <Text style={[styles.statValue, { color: THEME.accent }]}>{formatMoney(pendingAmount)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statTitle}>Withdrawn</Text>
            <Text style={[styles.statValue, { color: "#8A4DFF" }]}>{formatMoney(withdrawnAmount)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdraw Amount</Text>

          <View style={styles.quickGrid}>
            {quickAmounts.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.quickBtn,
                  amount === item && styles.quickBtnActive,
                ]}
                onPress={() => setAmountText(String(item))}
              >
                <Text style={[styles.quickBtnText, amount === item && styles.quickBtnTextActive]}>
                  {formatMoney(item).replace(".00", "")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.amountBox}>
            <Text style={styles.amountCurrency}>₹</Text>
            <TextInput
              value={amountText}
              onChangeText={setAmountText}
              placeholder="Enter amount"
              placeholderTextColor="#9AA3B6"
              keyboardType="number-pad"
              style={styles.amountInput}
              editable={!loading}
            />
          </View>

          <Text style={styles.amountNote}>
            Minimum withdraw amount is ₹{MIN_WITHDRAW_AMOUNT} in test mode.
          </Text>

          <TouchableOpacity
            style={[styles.withdrawBtn, (!canWithdraw || loading) && styles.withdrawBtnDisabled]}
            onPress={startWithdrawal}
            disabled={!canWithdraw || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.withdrawBtnText}>Withdraw Now</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={webVisible}
        animationType="slide"
        onRequestClose={() => {
          setWebVisible(false);
          setWebHtml("");
          pendingPromiseRef.current?.reject?.(new Error("Withdrawal cancelled"));
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0B1220" }}>
          <View style={styles.webHeader}>
            <TouchableOpacity
              style={styles.webClose}
              onPress={() => {
                setWebVisible(false);
                setWebHtml("");
                pendingPromiseRef.current?.reject?.(
                  new Error("Withdrawal cancelled")
                );
              }}
            >
              <Text style={styles.webCloseText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.webTitle}>Secure Checkout</Text>
            <View style={{ width: 64 }} />
          </View>
          <WebView
            originWhitelist={["*"]}
            source={{ html: webHtml }}
            mixedContentMode="always"
            onMessage={onWebMessage}
            onError={(event) => {
              setWebVisible(false);
              setWebHtml("");
              pendingPromiseRef.current?.reject?.(
                new Error(event?.nativeEvent?.description || "Unable to open Razorpay")
              );
            }}
            javaScriptEnabled
            javaScriptCanOpenWindowsAutomatically
            domStorageEnabled
            startInLoadingState
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  container: {
    padding: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: THEME.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  backIcon: {
    fontSize: 22,
    color: THEME.text,
    fontWeight: "800",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: THEME.text,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.muted,
    marginTop: 2,
    fontWeight: "600",
  },
  helpBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: THEME.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  helpIcon: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.primary,
  },
  balanceCard: {
    backgroundColor: THEME.primary,
    borderRadius: 28,
    padding: 20,
    minHeight: 240,
    justifyContent: "space-between",
    marginBottom: 18,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  balanceValue: {
    marginTop: 14,
    fontSize: 44,
    fontWeight: "900",
    color: "#fff",
  },
  balanceHint: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.92)",
  },
  payoutCard: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginBottom: 18,
  },
  payoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  payoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: THEME.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  payoutIconText: {
    color: THEME.primary,
    fontWeight: "900",
    fontSize: 18,
  },
  payoutTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: THEME.text,
  },
  payoutSub: {
    marginTop: 3,
    fontSize: 12,
    color: THEME.muted,
    fontWeight: "700",
  },
  payoutEditBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: THEME.primarySoft,
    borderWidth: 1,
    borderColor: "#BDEDE5",
  },
  payoutEditText: {
    color: THEME.primary,
    fontWeight: "900",
    fontSize: 12,
  },
  payoutMetaGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  payoutMetaItem: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
  },
  payoutMetaLabel: {
    fontSize: 11,
    color: THEME.muted,
    fontWeight: "800",
  },
  payoutMetaValue: {
    marginTop: 6,
    fontSize: 13,
    color: THEME.text,
    fontWeight: "900",
  },
  statsCard: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 56,
    backgroundColor: THEME.border,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.muted,
    textAlign: "center",
  },
  statValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "900",
    color: THEME.primary,
    textAlign: "center",
  },
  section: {
    backgroundColor: THEME.card,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: THEME.text,
    marginBottom: 14,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickBtn: {
    flexGrow: 1,
    minWidth: "45%",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  quickBtnActive: {
    backgroundColor: THEME.primarySoft,
    borderColor: THEME.primary,
  },
  quickBtnText: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: "900",
  },
  quickBtnTextActive: {
    color: THEME.primary,
  },
  amountBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 22,
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  amountCurrency: {
    fontSize: 26,
    fontWeight: "900",
    color: THEME.muted,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    color: THEME.text,
    paddingVertical: 14,
  },
  amountNote: {
    marginTop: 10,
    fontSize: 12,
    color: THEME.muted,
    fontWeight: "700",
  },
  withdrawBtn: {
    marginTop: 16,
    backgroundColor: THEME.primary,
    borderRadius: 18,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawBtnDisabled: {
    opacity: 0.55,
  },
  withdrawBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  webHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0B1220",
  },
  webClose: {
    width: 64,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  webCloseText: {
    color: "#fff",
    fontWeight: "800",
  },
  webTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});
