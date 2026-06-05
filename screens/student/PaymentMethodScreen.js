import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext";
import subscriptionApi from "../../services/subscriptionApi";

const RAZORPAY_KEY_ID =
  process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SpBxhOSWb9CzJg";

const PLANS = [
  {
    id: "plan_1m",
    title: "1 Month",
    subtitle: "Unlimited doubts, videos & mock tests",
    amount: 99,
    durationMonths: 1,
    badge: "Best for trying",
  },
  {
    id: "plan_3m",
    title: "3 Months",
    subtitle: "Save more with a longer plan",
    amount: 249,
    durationMonths: 3,
    badge: "Most popular",
  },
  {
    id: "plan_12m",
    title: "1 Year",
    subtitle: "Best value for regular learners",
    amount: 899,
    durationMonths: 12,
    badge: "Best value",
  },
];

const buildExpiryDate = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
};

const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay checkout is only available in the browser."));
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector('script[data-razorpay="checkout"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load Razorpay checkout")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.setAttribute("data-razorpay", "checkout");
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
    document.body.appendChild(script);
  });

const createMobileCheckoutHtml = ({
  amount,
  currency,
  keyId,
  orderId,
  description,
  name,
  prefillName,
  prefillEmail,
  prefillContact,
}) => {
  const safe = (value) => String(value ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
    <title>Razorpay Checkout</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #f6f9fc;
        font-family: Arial, sans-serif;
      }
      .wrap {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 12px;
        color: #0f172a;
      }
      .spinner {
        width: 36px;
        height: 36px;
        border-radius: 999px;
        border: 4px solid #dbeafe;
        border-top-color: #0f766e;
        animation: spin 1s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="spinner"></div>
      <div>Opening secure checkout...</div>
    </div>
    <script>
      (function () {
        function postMessage(payload) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        }

        function openCheckout() {
          try {
            var options = {
              key: "${safe(keyId)}",
              amount: ${Number(amount) * 100},
              currency: "${safe(currency || "INR")}",
              order_id: "${safe(orderId)}",
              name: "${safe(name)}",
              description: "${safe(description)}",
              prefill: {
                name: "${safe(prefillName)}",
                email: "${safe(prefillEmail)}",
                contact: "${safe(prefillContact)}"
              },
              theme: {
                color: "#0f766e"
              },
              handler: function (response) {
                postMessage({
                  type: "success",
                  payload: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                  }
                });
              },
              modal: {
                ondismiss: function () {
                  postMessage({ type: "dismiss" });
                }
              }
            };

            var checkout = new Razorpay(options);
            checkout.on("payment.failed", function (response) {
              postMessage({
                type: "failed",
                payload: response && response.error ? response.error : response
              });
            });
            checkout.open();
          } catch (error) {
            postMessage({
              type: "error",
              payload: { message: error && error.message ? error.message : "Unable to open Razorpay checkout" }
            });
          }
        }

        if (document.readyState === "complete") {
          openCheckout();
        } else {
          window.addEventListener("load", openCheckout);
        }
      })();
    </script>
  </body>
</html>`;
};

export default function PaymentMethodScreen() {
  const navigation = useNavigation();
  const {
    currentUser,
    activatePremiumSubscription,
    addSubscriptionPayment,
  } = useAppContext();

  const [selectedPlanId, setSelectedPlanId] = useState(PLANS[0].id);
  const [loading, setLoading] = useState(false);
  const [mobileCheckoutHtml, setMobileCheckoutHtml] = useState("");
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  const selectedPlan = useMemo(
    () => PLANS.find((plan) => plan.id === selectedPlanId) || PLANS[0],
    [selectedPlanId]
  );

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    loadRazorpayScript().catch(() => {
      // Script loading is retried when payment starts.
    });
  }, []);

  const finishPremiumActivation = useCallback(
    async ({ paymentId, orderId, signature }) => {
      const purchasedAt = new Date().toISOString();
      const expiresAt = buildExpiryDate(selectedPlan.durationMonths).toISOString();

      const paymentRecord = {
        studentId: currentUser?.id || currentUser?.studentId || "",
        studentName: currentUser?.name || currentUser?.fullName || currentUser?.studentName || "Student",
        studentEmail: currentUser?.email || "",
        className: currentUser?.className || currentUser?.class || "",
        amount: selectedPlan.amount,
        planId: selectedPlan.id,
        planName: selectedPlan.title,
        planDurationMonths: selectedPlan.durationMonths,
        billingType: "Subscription",
        durationLabel: selectedPlan.title,
        paymentMode: "Razorpay",
        transactionId: paymentId || orderId,
        status: "Paid",
        paidAt: purchasedAt,
        expiresAt,
        paymentId,
      };

      try {
        if (typeof addSubscriptionPayment === "function") {
          await addSubscriptionPayment(paymentRecord);
        }
      } catch (error) {
        console.warn("Subscription payment save failed:", error?.message || error);
      }

      if (typeof activatePremiumSubscription === "function") {
        activatePremiumSubscription({
          ...paymentRecord,
          subscriptionPurchasedAt: purchasedAt,
          subscriptionExpiresAt: expiresAt,
          isPremium: true,
        });
      }

      navigation.navigate("PaymentSuccess", {
        planName: selectedPlan.title,
        amount: selectedPlan.amount,
        paymentId,
        orderId,
        signature,
        paymentDate: purchasedAt,
        purchasedAt,
        expiresAt,
      });
    },
    [activatePremiumSubscription, addSubscriptionPayment, currentUser, navigation, selectedPlan]
  );

  const verifyAndCompletePayment = useCallback(
    async (responsePayload) => {
      const orderId = responsePayload?.razorpay_order_id;
      const paymentId = responsePayload?.razorpay_payment_id;
      const signature = responsePayload?.razorpay_signature;

      if (!orderId || !paymentId || !signature) {
        throw new Error("Missing Razorpay payment details");
      }

      const verification = await subscriptionApi.verifyRazorpayPayment({
        orderId,
        paymentId,
        signature,
        studentId: currentUser?.id || currentUser?.studentId || "",
        studentName: currentUser?.name || currentUser?.fullName || currentUser?.studentName || "Student",
        planId: selectedPlan.id,
        planName: selectedPlan.title,
        amount: selectedPlan.amount,
        currency: "INR",
        planDurationMonths: selectedPlan.durationMonths,
      });

      if (!verification?.success && !verification?.verified) {
        throw new Error(verification?.message || "Payment verification failed");
      }

      await finishPremiumActivation({ paymentId, orderId, signature });
    },
    [currentUser, finishPremiumActivation, selectedPlan]
  );

  const startWebCheckout = useCallback(
    async (orderResponse) => {
      const orderId = orderResponse?.orderId || orderResponse?.id || orderResponse?.razorpay_order_id;
      const keyId = orderResponse?.keyId || orderResponse?.key_id || RAZORPAY_KEY_ID;
      const amount = orderResponse?.amount || selectedPlan.amount * 100;
      const currency = orderResponse?.currency || "INR";

      await loadRazorpayScript();

      if (!window?.Razorpay) {
        throw new Error("Razorpay checkout is unavailable in the browser");
      }

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "Qlearo",
        description: `${selectedPlan.title} subscription`,
        prefill: {
          name: currentUser?.name || currentUser?.fullName || currentUser?.studentName || "Student",
          email: currentUser?.email || "",
          contact: currentUser?.phone || currentUser?.mobile || "",
        },
        theme: {
          color: "#0f766e",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response) => {
          try {
            await verifyAndCompletePayment(response);
          } catch (error) {
            global.showAlert("Payment verification failed", error?.message || "Please try again.");
            setLoading(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        const message =
          response?.error?.description ||
          response?.error?.reason ||
          "Payment failed. Please try again.";
        global.showAlert("Payment failed", message);
        setLoading(false);
      });
      razorpay.open();
    },
    [currentUser, selectedPlan.amount, selectedPlan.title, verifyAndCompletePayment]
  );

  const startMobileCheckout = useCallback(
    (orderResponse) => {
      const orderId = orderResponse?.orderId || orderResponse?.id || orderResponse?.razorpay_order_id;
      const keyId = orderResponse?.keyId || orderResponse?.key_id || RAZORPAY_KEY_ID;
      const amount = orderResponse?.amount || selectedPlan.amount * 100;
      const currency = orderResponse?.currency || "INR";
      const html = createMobileCheckoutHtml({
        amount: Math.max(1, Math.round(amount / 100)),
        currency,
        keyId,
        orderId,
        description: `${selectedPlan.title} subscription`,
        name: "Qlearo",
        prefillName: currentUser?.name || currentUser?.fullName || currentUser?.studentName || "Student",
        prefillEmail: currentUser?.email || "",
        prefillContact: currentUser?.phone || currentUser?.mobile || "",
      });

      setMobileCheckoutHtml(html);
      setCheckoutVisible(true);
    },
    [currentUser, selectedPlan.amount, selectedPlan.title]
  );

  const startCheckout = useCallback(async () => {
    try {
      setLoading(true);
      const orderResponse = await subscriptionApi.createRazorpayOrder({
        amount: selectedPlan.amount,
        currency: "INR",
        receipt: `subscription-${selectedPlan.id}-${Date.now()}`,
        studentId: currentUser?.id || currentUser?.studentId || "",
        studentName: currentUser?.name || currentUser?.fullName || currentUser?.studentName || "Student",
        planId: selectedPlan.id,
        planName: selectedPlan.title,
        planDurationMonths: selectedPlan.durationMonths,
      });

      if (Platform.OS === "web") {
        await startWebCheckout(orderResponse);
      } else {
        startMobileCheckout(orderResponse);
      }
    } catch (error) {
      global.showAlert("Payment failed", error?.message || "Unable to start payment");
      setLoading(false);
      setCheckoutVisible(false);
    }
  }, [currentUser, selectedPlan, startMobileCheckout, startWebCheckout]);

  const handleMobileMessage = useCallback(
    async (event) => {
      try {
        const raw = event?.nativeEvent?.data;
        const message = JSON.parse(raw);

        if (message?.type === "success") {
          setCheckoutVisible(false);
          await verifyAndCompletePayment(message.payload);
          setLoading(false);
          return;
        }

        if (message?.type === "dismiss") {
          setCheckoutVisible(false);
          setLoading(false);
          return;
        }

        if (message?.type === "failed" || message?.type === "error") {
          const errorMessage =
            message?.payload?.description ||
            message?.payload?.reason ||
            message?.payload?.message ||
            "Payment failed. Please try again.";
          setCheckoutVisible(false);
          global.showAlert("Payment failed", errorMessage);
          setLoading(false);
        }
      } catch (error) {
        setCheckoutVisible(false);
        setLoading(false);
        global.showAlert("Payment failed", error?.message || "Unable to complete payment");
      }
    },
    [verifyAndCompletePayment]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose a plan</Text>
          <Text style={styles.subtitle}>
            After secure Razorpay payment, premium activates automatically.
          </Text>
        </View>

        <View style={styles.planList}>
          {PLANS.map((plan) => {
            const selected = plan.id === selectedPlanId;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planCard, selected && styles.planCardSelected]}
                activeOpacity={0.86}
                onPress={() => setSelectedPlanId(plan.id)}
                disabled={loading}
              >
                <View style={styles.planCardTopRow}>
                  <View>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                  </View>
                  <View style={[styles.badge, selected && styles.badgeSelected]}>
                    <Text style={[styles.badgeText, selected && styles.badgeTextSelected]}>
                      {plan.badge}
                    </Text>
                  </View>
                </View>
                <View style={styles.planPriceRow}>
                  <Text style={styles.currency}>Rs.</Text>
                  <Text style={styles.amount}>{plan.amount}</Text>
                  <Text style={styles.duration}>/ {plan.durationMonths} month{plan.durationMonths > 1 ? "s" : ""}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Selected plan</Text>
          <Text style={styles.summaryValue}>{selectedPlan.title}</Text>
          <Text style={styles.summaryMeta}>{selectedPlan.subtitle}</Text>
          <Text style={styles.summaryAmount}>Rs. {selectedPlan.amount}</Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={startCheckout}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.payButtonText}>Pay with Razorpay</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={checkoutVisible} animationType="slide" onRequestClose={() => setCheckoutVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Secure checkout</Text>
            <TouchableOpacity
              onPress={() => {
                setCheckoutVisible(false);
                setLoading(false);
              }}
            >
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <WebView
            originWhitelist={["*"]}
            source={{ html: mobileCheckoutHtml || "<html><body></body></html>" }}
            mixedContentMode="always"
            onMessage={handleMobileMessage}
            javaScriptEnabled
            javaScriptCanOpenWindowsAutomatically
            domStorageEnabled
            startInLoadingState
            style={styles.webView}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4FAFB",
  },
  container: {
    padding: 20,
    gap: 16,
  },
  header: {
    paddingTop: 8,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
  },
  planList: {
    gap: 12,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  planCardSelected: {
    borderColor: "#0F766E",
    shadowColor: "#0F766E",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
  },
  planCardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  planSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#E2E8F0",
  },
  badgeSelected: {
    backgroundColor: "#D1FAE5",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  badgeTextSelected: {
    color: "#047857",
  },
  planPriceRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  currency: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F766E",
  },
  amount: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F766E",
  },
  duration: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  summaryMeta: {
    marginTop: 6,
    fontSize: 13,
    color: "#475569",
  },
  summaryAmount: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: "900",
    color: "#0F766E",
  },
  payButton: {
    backgroundColor: "#0F766E",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F766E",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 4,
    marginBottom: 18,
  },
  payButtonDisabled: {
    opacity: 0.78,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalClose: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F766E",
  },
  webView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
