


// src/screens/admin/AdminTeacherPayoutsScreen.js

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Modal,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import AdminBottomNavigation from "../../components/AdminBottomNavigation";
import { useAppContext } from "../../context/AppContext";
import { teacherApi } from "../../services/teacherApi";
import subscriptionApi from "../../services/subscriptionApi";

const { width } = Dimensions.get("window");
const isSmall = width < 380;

const COLORS = {
  bg: "#F6FAFB",
  white: "#FFFFFF",
  teal: "#00796B",
  tealDark: "#006A60",
  tealLight: "#E6F5F3",
  tealSoft: "#F0FFFC",
  text: "#07123A",
  muted: "#6E7891",
  border: "#E4EBF2",
  green: "#059669",
  greenSoft: "#DCFCE7",
  red: "#EF4444",
  redSoft: "#FEE2E2",
  orange: "#F97316",
  orangeSoft: "#FFEDD5",
  blue: "#2563EB",
  blueSoft: "#DBEAFE",
  purple: "#7C3AED",
  purpleSoft: "#EDE9FE",
  shadow: "rgba(0,0,0,0.10)",
};

const FILTERS = ["All", "Pending", "Processing", "Paid", "Failed", "No Earnings"];

const RATE_CONFIG = {
  doubtRate: 40,
  sessionRate: 250,
  mockTestRate: 120,
  adminCommissionPercent: 20,
};

const PAYMENT_METHODS = [
  {
    id: "UPI",
    title: "UPI Payment",
    sub: "Pay directly to teacher UPI ID",
    icon: "phone-portrait-outline",
  },
  {
    id: "Bank Transfer",
    title: "Bank Transfer",
    sub: "NEFT / IMPS / account transfer",
    icon: "business-outline",
  },
  {
    id: "Cash",
    title: "Cash Paid",
    sub: "Mark payout as cash paid",
    icon: "cash-outline",
  },
];

const RAZORPAY_KEY_ID =
  process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SpBxhOSWb9CzJg";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getInitial(name = "T") {
  return String(name || "T").trim().charAt(0).toUpperCase();
}

function formatDateTime(value) {
  if (!value) return "Not paid yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function getTeacherName(teacher = {}) {
  return (
    teacher.teacherName ||
    teacher.name ||
    teacher.fullName ||
    teacher.displayName ||
    "Teacher"
  );
}

function getTeacherId(teacher = {}) {
  return teacher.id || teacher.teacherId || teacher.tutorId || "";
}

function getTeacherSubject(teacher = {}) {
  return teacher.subject || teacher.primarySubject || teacher.mainSubject || "General";
}

function getTeacherPayoutAccount(teacher = {}) {
  return (
    teacher.payoutAccount ||
    teacher.upiId ||
    teacher.upi ||
    teacher.bankAccount ||
    teacher.accountNumber ||
    "Account not added"
  );
}

function getTeacherPaymentMode(teacher = {}) {
  if (teacher.paymentMode) return teacher.paymentMode;
  if (teacher.upiId || teacher.upi) return "UPI";
  if (teacher.bankAccount || teacher.accountNumber) return "Bank Transfer";
  return "UPI";
}

function isTeacherAccepted(teacher = {}) {
  const status = normalizeText(teacher.status);
  return (
    status === "accepted" ||
    status === "approved" ||
    status === "active" ||
    teacher.verified === true
  );
}

function getAllTestsFromContext(getAllMockTests, mockData) {
  if (typeof getAllMockTests === "function") {
    return safeArray(getAllMockTests());
  }

  const tests = [];

  Object.values(mockData || {}).forEach((category) => {
    safeArray(category?.subjects).forEach((subject) => {
      safeArray(subject?.list).forEach((test) => {
        if (test?.isPublished !== false) {
          tests.push({
            ...test,
            category: category?.title,
            categoryTitle: category?.title,
            subjectId: subject?.id,
            subjectName: subject?.name,
          });
        }
      });
    });
  });

  return tests;
}

function belongsToTeacher(item = {}, teacher = {}) {
  const teacherId = String(getTeacherId(teacher) || "");
  const teacherName = normalizeText(getTeacherName(teacher));

  const itemTeacherId = String(
    item.teacherId ||
      item.tutorId ||
      item.assignedTeacherId ||
      item.createdBy ||
      item.acceptedBy ||
      ""
  );

  const itemTeacherName = normalizeText(
    item.teacherName ||
      item.tutorName ||
      item.tutor ||
      item.assignedTeacher ||
      item.createdByName ||
      ""
  );

  if (teacherId && itemTeacherId && teacherId === itemTeacherId) return true;
  if (teacherName && itemTeacherName && teacherName === itemTeacherName) return true;

  return false;
}

function parseTimestamp(value) {
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getTeacherPayoutCutoff(teacher = {}) {
  return parseTimestamp(
    teacher.lastPayoutAt ||
      teacher.paidAt ||
      teacher.lastPayoutProcessedAt ||
      teacher.lastPaidAt ||
      ""
  );
}

function getActivityTimestamp(item = {}) {
  return parseTimestamp(
    item.answeredAt ||
      item.completedAt ||
      item.endedAt ||
      item.publishedAt ||
      item.createdAt ||
      item.updatedAt ||
      item.submittedAt ||
      ""
  );
}

function calculateTeacherWork({ teacher, answeredDoubts, completedSessions, mockTests }) {
  const teacherDoubts = safeArray(answeredDoubts).filter((item) =>
    belongsToTeacher(item, teacher)
  );

  const teacherSessions = safeArray(completedSessions).filter((item) =>
    belongsToTeacher(item, teacher)
  );

  const teacherMockTests = safeArray(mockTests).filter((item) =>
    belongsToTeacher(item, teacher)
  );

  const completedDoubts = teacherDoubts.length;
  const completedSessionsCount = teacherSessions.length;
  const createdTests = teacherMockTests.length;

  const doubtAmount = completedDoubts * RATE_CONFIG.doubtRate;
  const sessionAmount = completedSessionsCount * RATE_CONFIG.sessionRate;
  const testAmount = createdTests * RATE_CONFIG.mockTestRate;

  const grossAmount = doubtAmount + sessionAmount + testAmount;
  const adminCommission = Math.round(
    (grossAmount * RATE_CONFIG.adminCommissionPercent) / 100
  );
  const payableAmount = Math.max(grossAmount - adminCommission, 0);

  const payoutCutoff = getTeacherPayoutCutoff(teacher);
  const cycleDoubts = teacherDoubts.filter((item) => {
    const ts = getActivityTimestamp(item);
    return ts > payoutCutoff || payoutCutoff === 0;
  });
  const cycleSessions = teacherSessions.filter((item) => {
    const ts = getActivityTimestamp(item);
    return ts > payoutCutoff || payoutCutoff === 0;
  });
  const cycleMockTests = teacherMockTests.filter((item) => {
    const ts = getActivityTimestamp(item);
    return ts > payoutCutoff || payoutCutoff === 0;
  });

  const cycleCompletedDoubts = cycleDoubts.length;
  const cycleCompletedSessionsCount = cycleSessions.length;
  const cycleCreatedTests = cycleMockTests.length;

  const cycleDoubtAmount = cycleCompletedDoubts * RATE_CONFIG.doubtRate;
  const cycleSessionAmount = cycleCompletedSessionsCount * RATE_CONFIG.sessionRate;
  const cycleTestAmount = cycleCreatedTests * RATE_CONFIG.mockTestRate;

  const cycleGrossAmount = cycleDoubtAmount + cycleSessionAmount + cycleTestAmount;
  const cycleAdminCommission = Math.round(
    (cycleGrossAmount * RATE_CONFIG.adminCommissionPercent) / 100
  );
  const cyclePayableAmount = Math.max(cycleGrossAmount - cycleAdminCommission, 0);

  return {
    completedDoubts,
    completedSessions: completedSessionsCount,
    createdTests,
    doubtAmount,
    sessionAmount,
    testAmount,
    grossAmount,
    adminCommission,
    payableAmount,
    cycleCompletedDoubts,
    cycleCompletedSessions: cycleCompletedSessionsCount,
    cycleCreatedTests,
    cycleDoubtAmount,
    cycleSessionAmount,
    cycleTestAmount,
    cycleGrossAmount,
    cycleAdminCommission,
    cyclePayableAmount,
    payoutCutoff,
    latestActivity:
      teacherDoubts[0]?.answeredAt ||
      teacherSessions[0]?.completedAt ||
      teacherSessions[0]?.endedAt ||
      teacherMockTests[0]?.createdAt ||
      teacher.updatedAt ||
      teacher.createdAt ||
      "",
  };
}

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
      existing.addEventListener(
        "error",
        () => reject(new Error("Unable to load Razorpay checkout")),
        { once: true }
      );
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

const buildCheckoutHtml = ({
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
      html, body { margin:0; padding:0; width:100%; height:100%; background:#f6f9fc; font-family:Arial,sans-serif; }
      .wrap { height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:12px; color:#0f172a; }
      .spinner { width:36px; height:36px; border-radius:999px; border:4px solid #dbeafe; border-top-color:#0f766e; animation:spin 1s linear infinite; }
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
              theme: { color: "#0f766e" },
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
              modal: { ondismiss: function () { postMessage({ type: "dismiss" }); } }
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
              payload: { message: error && error.message ? error.message : "Unable to open Razorpay" }
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

function createPayoutFromTeacher({
  teacher,
  answeredDoubts,
  completedSessions,
  mockTests,
  override,
}) {
  const calc = calculateTeacherWork({
    teacher,
    answeredDoubts,
    completedSessions,
    mockTests,
  });

  const teacherId = getTeacherId(teacher);
  const teacherName = getTeacherName(teacher);
  const defaultStatus = calc.payableAmount > 0 ? "Pending" : "No Earnings";
  const paidAmount = Number(
    teacher.paidAmount ||
      teacher.settledAmount ||
      teacher.withdrawnAmount ||
      teacher.creditedAmount ||
      teacher.lastPayoutAmount ||
      0
  );
  const pendingAmount = Math.max(calc.cyclePayableAmount || 0, 0);
  const status =
    override?.status ||
    (calc.grossAmount <= 0
      ? "No Earnings"
      : pendingAmount > 0
      ? "Pending"
      : paidAmount > 0
      ? "Paid"
      : defaultStatus);

  return {
    id: `PAY_${teacherId || teacherName}`,
    teacherId,
    teacherName,
    subject: getTeacherSubject(teacher),
    avatar: getInitial(teacherName),
    phone: teacher.phone || teacher.mobile || "-",
    email: teacher.email || "-",
    location: teacher.location || teacher.city || "-",
    rating: teacher.rating || 0,

    grossAmount: calc.cycleGrossAmount || calc.grossAmount,
    adminCommission: calc.cycleAdminCommission || calc.adminCommission,
    payableAmount: calc.cyclePayableAmount || calc.payableAmount,
    paidAmount,
    pendingAmount,

    payoutAccount: getTeacherPayoutAccount(teacher),

    status,
    requestedAt: calc.latestActivity || teacher.updatedAt || teacher.createdAt || "",
    paidAt:
      override?.paidAt ||
      teacher.lastPayoutAt ||
      teacher.paidAt ||
      "",
    transactionId:
      override?.transactionId ||
      teacher.lastPayoutTransactionId ||
      teacher.transactionId ||
      "",
    paymentNote:
      override?.paymentNote ||
      teacher.lastPayoutNote ||
      teacher.paymentNote ||
      "",
    paymentMode:
      override?.paymentMode ||
      teacher.lastPayoutMethod ||
      getTeacherPaymentMode(teacher),
    autoPayEligible: calc.payableAmount > 0,

    workSummary: {
      doubts: calc.cycleCompletedDoubts ?? calc.completedDoubts,
      sessions: calc.cycleCompletedSessions ?? calc.completedSessions,
      mockTests: calc.cycleCreatedTests ?? calc.createdTests,
    },

    earningBreakup: {
      doubtAmount: calc.doubtAmount,
      sessionAmount: calc.sessionAmount,
      testAmount: calc.testAmount,
      doubtRate: RATE_CONFIG.doubtRate,
      sessionRate: RATE_CONFIG.sessionRate,
      mockTestRate: RATE_CONFIG.mockTestRate,
      adminCommissionPercent: RATE_CONFIG.adminCommissionPercent,
    },

    teacherRaw: teacher,
  };
}

function getStatusTheme(status = "") {
  if (status === "Paid") {
    return {
      bg: COLORS.greenSoft,
      color: COLORS.green,
      icon: "checkmark-circle-outline",
    };
  }

  if (status === "Processing") {
    return {
      bg: COLORS.blueSoft,
      color: COLORS.blue,
      icon: "sync-outline",
    };
  }

  if (status === "Failed") {
    return {
      bg: COLORS.redSoft,
      color: COLORS.red,
      icon: "close-circle-outline",
    };
  }

  if (status === "No Earnings") {
    return {
      bg: COLORS.tealLight,
      color: COLORS.teal,
      icon: "information-circle-outline",
    };
  }

  return {
    bg: COLORS.orangeSoft,
    color: COLORS.orange,
    icon: "time-outline",
  };
}

function Header({
  navigation,
  title,
  sub,
  rightIcon = "refresh-outline",
  onRightPress,
}) {
  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation?.navigate?.("AdminDashboard");
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.headerBtn}
        onPress={goBackSafe}
      >
        <Ionicons name="chevron-back" size={25} color={COLORS.white} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.headerSub} numberOfLines={1}>
          {sub}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.headerBtn}
        onPress={onRightPress}
      >
        <Ionicons name={rightIcon} size={23} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

function SummaryCard({ title, value, sub, icon, color, bg }) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <Text style={styles.summaryValue} numberOfLines={1}>
        {value}
      </Text>

      <Text style={styles.summaryTitle} numberOfLines={1}>
        {title}
      </Text>

      {!!sub && (
        <Text style={[styles.summarySub, { color }]} numberOfLines={1}>
          {sub}
        </Text>
      )}
    </View>
  );
}

function DetailRow({ label, value, icon }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={COLORS.teal} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || "-"}</Text>
      </View>
    </View>
  );
}

function EarningRow({ title, count, rate, amount, icon, color }) {
  return (
    <View style={styles.earningRow}>
      <View style={[styles.earningIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>

      <View style={styles.earningInfo}>
        <Text style={styles.earningTitle}>{title}</Text>
        <Text style={styles.earningSub}>
          {count} × {formatMoney(rate)}
        </Text>
      </View>

      <Text style={styles.earningAmount}>{formatMoney(amount)}</Text>
    </View>
  );
}

function PayoutCard({ item, onPress, onPayPress }) {
  const statusTheme = getStatusTheme(item.status);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.payoutCard}
      onPress={() => onPress(item)}
    >
      <View style={styles.payoutTop}>
        <View style={styles.teacherAvatar}>
          <Text style={styles.teacherAvatarText}>{item.avatar}</Text>
        </View>

        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName} numberOfLines={1}>
            {item.teacherName}
          </Text>

          <Text style={styles.teacherMeta} numberOfLines={1}>
            {item.subject} • {item.teacherId || "No ID"}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
          <Ionicons name={statusTheme.icon} size={13} color={statusTheme.color} />
          <Text style={[styles.statusText, { color: statusTheme.color }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.amountPanel}>
        <View>
          <Text style={styles.amountLabel}>Auto Calculated Payable</Text>
          <Text style={styles.payableAmount}>{formatMoney(item.payableAmount)}</Text>
        </View>

        <View style={styles.amountRight}>
          <Text style={styles.commissionLabel}>Admin Commission</Text>
          <Text style={styles.commissionAmount}>
            {formatMoney(item.adminCommission)}
          </Text>
        </View>
      </View>

      <View style={styles.workStatsRow}>
        <View style={styles.workStat}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={16}
            color={COLORS.blue}
          />
          <Text style={styles.workStatText}>{item.workSummary.doubts} Doubts</Text>
        </View>

        <View style={styles.workStat}>
          <Ionicons name="videocam-outline" size={16} color={COLORS.purple} />
          <Text style={styles.workStatText}>
            {item.workSummary.sessions} Sessions
          </Text>
        </View>

        <View style={styles.workStat}>
          <Ionicons
            name="document-text-outline"
            size={16}
            color={COLORS.orange}
          />
          <Text style={styles.workStatText}>
            {item.workSummary.mockTests} Tests
          </Text>
        </View>
      </View>

      <View style={styles.payoutBottom}>
        <View style={styles.accountBox}>
          <Text style={styles.accountLabel}>Teacher Account</Text>
          <Text style={styles.accountValue} numberOfLines={1}>
            {item.paymentMode} • {item.payoutAccount}
          </Text>
        </View>

        {item.status === "Pending" || item.status === "Processing" ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.quickPayBtn}
            onPress={(e) => {
              e?.stopPropagation?.();
              onPayPress(item);
            }}
          >
            <Text style={styles.quickPayText}>
              {item.status === "Processing" ? "Complete" : "Pay"}
            </Text>
            <Ionicons name="arrow-forward" size={15} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.openCircle}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.teal} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function AdminTeacherPaymentScreen({
  navigation,
  payout: propPayout,
  onBack,
  onPaymentDone,
}) {
  const payout = propPayout || null;

  const [selectedMethod, setSelectedMethod] = useState(
    payout?.paymentMode || "UPI"
  );
  const [transactionId, setTransactionId] = useState(payout?.transactionId || "");
  const [note, setNote] = useState(payout?.paymentNote || "");
  const [successVisible, setSuccessVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileCheckoutHtml, setMobileCheckoutHtml] = useState("");
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    loadRazorpayScript().catch(() => {
      // script is retried during payment start
    });
  }, []);

  const finalizePayment = useCallback(
    async ({ paymentId, orderId, signature }) => {
      const resolvedTransactionId =
        paymentId || orderId || transactionId.trim() || `TXN${Date.now().toString().slice(-8)}`;

      setTransactionId(resolvedTransactionId);

      const updatedPayout = {
        ...payout,
        status: "Paid",
        paidAt: new Date().toISOString(),
        paymentMode: selectedMethod,
        transactionId: resolvedTransactionId,
        paymentNote: note.trim(),
      };

      await onPaymentDone?.(updatedPayout);
      setSuccessVisible(true);
      setLoading(false);
      setCheckoutVisible(false);
      return updatedPayout;
    },
    [note, onPaymentDone, payout, selectedMethod, transactionId]
  );

  const startWebCheckout = useCallback(
    async (orderResponse) => {
      const orderId = orderResponse?.orderId || orderResponse?.id || orderResponse?.razorpay_order_id;
      const keyId = orderResponse?.keyId || orderResponse?.key_id || RAZORPAY_KEY_ID;
      const amount = orderResponse?.amount || Math.max(1, Math.round(Number(payout?.payableAmount || 0)) * 100);
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
        description: `${payout?.teacherName || "Teacher"} payout`,
        prefill: {
          name: payout?.teacherName || "Teacher",
          email: payout?.email || "",
          contact: payout?.phone || "",
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
            await finalizePayment({
              paymentId: response?.razorpay_payment_id,
              orderId: response?.razorpay_order_id,
              signature: response?.razorpay_signature,
            });
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
    [finalizePayment, payout]
  );

  const startMobileCheckout = useCallback(
    (orderResponse) => {
      const orderId = orderResponse?.orderId || orderResponse?.id || orderResponse?.razorpay_order_id;
      const keyId = orderResponse?.keyId || orderResponse?.key_id || RAZORPAY_KEY_ID;
      const amount = orderResponse?.amount || Math.max(1, Math.round(Number(payout?.payableAmount || 0)) * 100);
      const currency = orderResponse?.currency || "INR";
      const html = buildCheckoutHtml({
        amount: Math.max(1, Math.round(amount / 100)),
        currency,
        keyId,
        orderId,
        description: `${payout?.teacherName || "Teacher"} payout`,
        name: "Qlearo",
        prefillName: payout?.teacherName || "Teacher",
        prefillEmail: payout?.email || "",
        prefillContact: payout?.phone || "",
      });

      setMobileCheckoutHtml(html);
      setCheckoutVisible(true);
    },
    [payout]
  );

  const startCheckout = useCallback(async () => {
    if (!payout) return;

    try {
      setLoading(true);
      const orderResponse = await subscriptionApi.createWithdrawalRazorpayOrder({
        amount: Math.max(1, Math.round(Number(payout.payableAmount || 0))),
        currency: "INR",
        receipt: `payout-${payout.id}-${Date.now()}`,
        studentId: payout.teacherId || payout.id || "",
        studentName: payout.teacherName || "Teacher",
        planId: payout.id || "",
        planName: `${payout.teacherName || "Teacher"} payout`,
        planDurationMonths: 0,
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
  }, [payout, startMobileCheckout, startWebCheckout]);

  const handleMobileMessage = useCallback(
    async (event) => {
      try {
        const raw = event?.nativeEvent?.data;
        const message = JSON.parse(raw);

        if (message?.type === "success") {
          await finalizePayment({
            paymentId: message?.payload?.razorpay_payment_id,
            orderId: message?.payload?.razorpay_order_id,
            signature: message?.payload?.razorpay_signature,
          });
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
    [finalizePayment]
  );

  const goBackSafe = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation?.navigate?.("AdminTeacherPayouts");
  };

  const completePayment = async () => {
    if (!payout) return;

    const updatedPayout = {
      ...payout,
      status: "Paid",
      paidAt: new Date().toISOString(),
      paymentMode: selectedMethod,
      transactionId:
        transactionId.trim() || `TXN${Date.now().toString().slice(-8)}`,
      paymentNote: note.trim(),
    };

    await onPaymentDone?.(updatedPayout);
    setSuccessVisible(true);
  };

  if (!payout) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

        <View style={styles.screen}>
          <Header
            navigation={navigation}
            title="Teacher Payment"
            sub="No payout selected"
            rightIcon="wallet-outline"
            onRightPress={goBackSafe}
          />

          <View style={styles.emptyFullBox}>
            <Ionicons name="wallet-outline" size={52} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No payment data</Text>
            <Text style={styles.emptySub}>
              Please open payment from teacher payout list.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryBtnFull}
              onPress={goBackSafe}
            >
              <Ionicons
                name="arrow-back-outline"
                size={18}
                color={COLORS.white}
              />
              <Text style={styles.primaryBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Header
          navigation={navigation}
          title="Teacher Payment"
          sub="Auto calculated payout"
          rightIcon="shield-checkmark-outline"
          onRightPress={goBackSafe}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.paymentScroll}
        >
          <View style={styles.paymentHero}>
            <View style={styles.paymentAvatar}>
              <Text style={styles.paymentAvatarText}>{payout.avatar}</Text>
            </View>

            <Text style={styles.paymentTeacher}>{payout.teacherName}</Text>
            <Text style={styles.paymentMeta}>
              {payout.subject} • {payout.teacherId || "No ID"}
            </Text>

            <View style={styles.paymentAmountBox}>
              <Text style={styles.paymentAmountLabel}>Amount to Pay</Text>
              <Text style={styles.paymentAmount}>
                {formatMoney(payout.payableAmount)}
              </Text>
              <Text style={styles.paymentAccount}>
                {selectedMethod} • {payout.payoutAccount}
              </Text>
            </View>
          </View>

          <View style={styles.paymentBreakdownCard}>
            <Text style={styles.paymentSectionTitle}>
              Automatic Work Calculation
            </Text>

            <EarningRow
              title="Doubts Clarified"
              count={payout.workSummary.doubts}
              rate={payout.earningBreakup.doubtRate}
              amount={payout.earningBreakup.doubtAmount}
              icon="chatbubble-ellipses-outline"
              color={COLORS.blue}
            />

            <EarningRow
              title="Live Sessions Completed"
              count={payout.workSummary.sessions}
              rate={payout.earningBreakup.sessionRate}
              amount={payout.earningBreakup.sessionAmount}
              icon="videocam-outline"
              color={COLORS.purple}
            />

            <EarningRow
              title="Mock Tests Created"
              count={payout.workSummary.mockTests}
              rate={payout.earningBreakup.mockTestRate}
              amount={payout.earningBreakup.testAmount}
              icon="document-text-outline"
              color={COLORS.orange}
            />
          </View>

          <View style={styles.paymentBreakdownCard}>
            <Text style={styles.paymentSectionTitle}>Payment Breakdown</Text>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Gross Amount</Text>
              <Text style={styles.breakdownValue}>
                {formatMoney(payout.grossAmount)}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Admin Commission ({RATE_CONFIG.adminCommissionPercent}%)
              </Text>
              <Text style={[styles.breakdownValue, { color: COLORS.orange }]}>
                - {formatMoney(payout.adminCommission)}
              </Text>
            </View>

            <View style={styles.breakdownDivider} />

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownTotalLabel}>Teacher Payable</Text>
              <Text style={styles.breakdownTotalValue}>
                {formatMoney(payout.payableAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.paymentBreakdownCard}>
            <Text style={styles.paymentSectionTitle}>Choose Payment Method</Text>

            {PAYMENT_METHODS.map((method) => {
              const active = selectedMethod === method.id;

              return (
                <TouchableOpacity
                  key={method.id}
                  activeOpacity={0.85}
                  style={[styles.methodCard, active && styles.methodCardActive]}
                  onPress={() => setSelectedMethod(method.id)}
                >
                  <View
                    style={[
                      styles.methodIcon,
                      active && { backgroundColor: COLORS.teal },
                    ]}
                  >
                    <Ionicons
                      name={method.icon}
                      size={21}
                      color={active ? COLORS.white : COLORS.teal}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodTitle}>{method.title}</Text>
                    <Text style={styles.methodSub}>{method.sub}</Text>
                  </View>

                  <Ionicons
                    name={active ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={active ? COLORS.teal : COLORS.muted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.paymentBreakdownCard}>
            <Text style={styles.paymentSectionTitle}>Payment Reference</Text>

            <Text style={styles.inputLabel}>Transaction ID / Reference No.</Text>
            <View style={styles.paymentInputBox}>
              <Ionicons name="receipt-outline" size={19} color={COLORS.muted} />
              <TextInput
                value={transactionId}
                onChangeText={setTransactionId}
                placeholder="Enter transaction ID"
                placeholderTextColor="#9AA4B6"
                style={styles.paymentInput}
              />
            </View>

            <Text style={styles.inputLabel}>Admin Note</Text>
            <View style={[styles.paymentInputBox, styles.noteInputBox]}>
              <Ionicons
                name="document-text-outline"
                size={19}
                color={COLORS.muted}
                style={{ marginTop: 3 }}
              />
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Optional payment note"
                placeholderTextColor="#9AA4B6"
                style={[styles.paymentInput, styles.noteInput]}
                multiline
              />
            </View>
          </View>

          <View style={styles.warningBox}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={COLORS.orange}
            />
            <Text style={styles.warningText}>
              Amount is automatically calculated from completed sessions,
              clarified doubts, and created mock tests. Click Complete Payment
              only after paying the teacher.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.completePaymentBtn,
              (payout.payableAmount <= 0 || loading) && styles.disabledBtn,
            ]}
            disabled={payout.payableAmount <= 0 || loading}
            onPress={startCheckout}
          >
            <Ionicons
              name={loading ? "hourglass-outline" : "checkmark-circle-outline"}
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.completePaymentText}>
              {loading ? "Opening Razorpay..." : "Pay with Razorpay"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.secondaryBtn}
            onPress={goBackSafe}
          >
            <Text style={styles.secondaryBtnText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={checkoutVisible}
        animationType="slide"
        onRequestClose={() => {
          setCheckoutVisible(false);
          setLoading(false);
        }}
      >
        <View style={styles.checkoutScreen}>
          <View style={styles.checkoutHeader}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.checkoutCloseBtn}
              onPress={() => {
                setCheckoutVisible(false);
                setLoading(false);
              }}
            >
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkoutTitle}>Secure Checkout</Text>
              <Text style={styles.checkoutSub}>Razorpay payment options</Text>
            </View>
          </View>

          <View style={styles.checkoutAmountStrip}>
            <Text style={styles.checkoutAmountLabel}>{payout.teacherName}</Text>
            <Text style={styles.checkoutAmountValue}>
              {formatMoney(payout.payableAmount)}
            </Text>
          </View>

          <WebView
            source={{ html: mobileCheckoutHtml || "<html><body></body></html>" }}
            originWhitelist={["*"]}
            mixedContentMode="always"
            onMessage={handleMobileMessage}
            javaScriptEnabled
            javaScriptCanOpenWindowsAutomatically
            domStorageEnabled
            startInLoadingState
            style={styles.checkoutWebView}
            renderLoading={() => (
              <View style={styles.checkoutLoading}>
                <ActivityIndicator size="large" color={COLORS.teal} />
                <Text style={styles.checkoutLoadingText}>Loading Razorpay...</Text>
              </View>
            )}
          />
        </View>
      </Modal>

      <Modal visible={successVisible} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDim} />

          <View style={styles.confirmCard}>
            <View style={styles.successIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={42}
                color={COLORS.green}
              />
            </View>

            <Text style={styles.confirmTitle}>Payment Completed</Text>

            <Text style={styles.confirmSub}>
              Teacher payout has been marked as paid successfully.
            </Text>

            <View style={styles.confirmAmountBox}>
              <Text style={styles.confirmTeacherName}>{payout.teacherName}</Text>
              <Text style={styles.confirmAmount}>
                {formatMoney(payout.payableAmount)}
              </Text>
              <Text style={styles.confirmAccount}>
                {selectedMethod} •{" "}
                {transactionId.trim() || "Auto generated reference"}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.confirmPayBtnFull}
              onPress={goBackSafe}
            >
              <Text style={styles.confirmPayText}>Back to Payouts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function AdminTeacherPayoutsScreen({ navigation, route }) {
  const {
    tutors = [],
    allDoubts = [],
    answeredDoubts = [],
    completedSessions = [],
    mockData = {},
    getAllMockTests,
    setTutors,
  } = useAppContext();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [paymentPayout, setPaymentPayout] = useState(null);
  const [payoutOverrides, setPayoutOverrides] = useState({});

  const realTeachers = useMemo(() => {
    const routeTeacher = route?.params?.teacher;
    const routeTeachers = route?.params?.teachers;

    const tutorMap = new Map(
      safeArray(tutors).map((teacher) => [String(getTeacherId(teacher)), teacher])
    );

    const source = safeArray(routeTeachers).length > 0
      ? routeTeachers
      : routeTeacher
      ? [routeTeacher]
      : safeArray(tutors);

    return source
      .filter(Boolean)
      .filter((teacher) => isTeacherAccepted(teacher))
      .map((teacher) => ({
        ...(tutorMap.get(String(getTeacherId(teacher))) || {}),
        ...teacher,
        id: getTeacherId(teacher),
        teacherId: teacher.teacherId || getTeacherId(teacher),
        teacherName: getTeacherName(teacher),
      }));
  }, [route, tutors]);

  const realMockTests = useMemo(
    () => getAllTestsFromContext(getAllMockTests, mockData),
    [getAllMockTests, mockData]
  );

  const realAnsweredDoubts = useMemo(() => {
    const source = safeArray(answeredDoubts).length > 0 ? answeredDoubts : allDoubts;

    return safeArray(source).filter(
      (item) =>
        item.answered === true ||
        item.status === "Answered" ||
        item.status === "answered"
    );
  }, [answeredDoubts, allDoubts]);

  const payouts = useMemo(() => {
    return realTeachers.map((teacher) => {
      const teacherId = getTeacherId(teacher);
      const payoutId = `PAY_${teacherId || getTeacherName(teacher)}`;

      return createPayoutFromTeacher({
        teacher,
        answeredDoubts: realAnsweredDoubts,
        completedSessions,
        mockTests: realMockTests,
        override: payoutOverrides[payoutId],
      });
    });
  }, [
    realTeachers,
    realAnsweredDoubts,
    completedSessions,
    realMockTests,
    payoutOverrides,
  ]);

  const summary = useMemo(() => {
    const payable = payouts.filter(
      (item) => item.status === "Pending" || item.status === "Processing"
    );
    const pending = payouts.filter((item) => item.status === "Pending");
    const processing = payouts.filter((item) => item.status === "Processing");
    const paid = payouts.filter((item) => item.status === "Paid");
    const failed = payouts.filter((item) => item.status === "Failed");

    const pendingAmount = payable.reduce(
      (sum, item) => sum + Number(item.pendingAmount || item.payableAmount || 0),
      0
    );

    const paidAmount = paid.reduce(
      (sum, item) => sum + Number(item.paidAmount || item.payableAmount || 0),
      0
    );

    const gross = payouts.reduce(
      (sum, item) => sum + Number(item.grossAmount || 0),
      0
    );

    const commission = payouts.reduce(
      (sum, item) => sum + Number(item.adminCommission || 0),
      0
    );

    const doubts = payouts.reduce(
      (sum, item) => sum + Number(item.workSummary?.doubts || 0),
      0
    );

    const sessions = payouts.reduce(
      (sum, item) => sum + Number(item.workSummary?.sessions || 0),
      0
    );

    const tests = payouts.reduce(
      (sum, item) => sum + Number(item.workSummary?.mockTests || 0),
      0
    );

    return {
      pendingAmount,
      paidAmount,
      gross,
      commission,
      doubts,
      sessions,
      tests,
      pendingCount: pending.length,
      processingCount: processing.length,
      paidCount: paid.length,
      failedCount: failed.length,
      totalCount: payouts.length,
    };
  }, [payouts]);

  const filteredPayouts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return payouts.filter((item) => {
      const filterMatch = activeFilter === "All" || item.status === activeFilter;

      const searchMatch =
        !q ||
        String(item.teacherName || "").toLowerCase().includes(q) ||
        String(item.subject || "").toLowerCase().includes(q) ||
        String(item.teacherId || "").toLowerCase().includes(q) ||
        String(item.paymentMode || "").toLowerCase().includes(q) ||
        String(item.payoutAccount || "").toLowerCase().includes(q);

      return filterMatch && searchMatch;
    });
  }, [payouts, search, activeFilter]);

  const openDetails = (payout) => {
    setSelectedPayout(payout);
    setDetailVisible(true);
  };

  const closeDetails = () => {
    setDetailVisible(false);
    setSelectedPayout(null);
  };

  const openPayment = (payout) => {
    setDetailVisible(false);
    setSelectedPayout(null);
    setPaymentPayout(payout);
  };

  const updatePayoutOverride = (payout, updates = {}) => {
    setPayoutOverrides((prev) => ({
      ...prev,
      [payout.id]: {
        ...(prev[payout.id] || {}),
        ...updates,
      },
    }));
  };

  const handlePaymentDone = async (updatedPayout) => {
    updatePayoutOverride(updatedPayout, {
      status: "Paid",
      paidAt: updatedPayout.paidAt,
      transactionId: updatedPayout.transactionId,
      paymentNote: updatedPayout.paymentNote,
      paymentMode: updatedPayout.paymentMode,
    });

    try {
      if (updatedPayout?.teacherId) {
        const currentPaidAmount = Number(
          updatedPayout.teacherRaw?.paidAmount ||
            updatedPayout.teacherRaw?.lastPayoutAmount ||
            0
        );
        const nextPaidAmount = currentPaidAmount + Number(updatedPayout.payableAmount || 0);
        const savedTeacher = await teacherApi.updateProfile(updatedPayout.teacherId, {
          lastPayoutStatus: "Paid",
          lastPayoutAmount: Number(updatedPayout.payableAmount || 0),
          paidAmount: nextPaidAmount,
          lastPayoutMethod: updatedPayout.paymentMode || "UPI",
          lastPayoutTransactionId: updatedPayout.transactionId || "",
          lastPayoutNote: updatedPayout.paymentNote || "",
          lastPayoutAt: updatedPayout.paidAt || new Date().toISOString(),
        });

        if (typeof setTutors === "function") {
          setTutors((prev) =>
            safeArray(prev).map((teacher) =>
              String(getTeacherId(teacher)) === String(updatedPayout.teacherId)
                ? { ...teacher, ...savedTeacher }
                : teacher
            )
          );
        }
      }

      setActiveFilter("Paid");
    } catch (error) {
      global.showAlert(
        "Payment saved locally",
        error?.message || "Backend update failed, but the payout was marked paid in the screen."
      );
      setActiveFilter("Paid");
    }
  };

  const markAsProcessing = () => {
    if (!selectedPayout) return;

    updatePayoutOverride(selectedPayout, {
      status: "Processing",
    });

    setDetailVisible(false);
    setSelectedPayout(null);
  };

  const autoPayAllPending = async () => {
    const now = new Date().toISOString();
    const txn = `AUTO${Date.now().toString().slice(-8)}`;

    const pendingItems = payouts.filter(
      (item) =>
        (item.status === "Pending" || item.status === "Processing") &&
        Number(item.payableAmount || 0) > 0
    );

    for (const item of pendingItems) {
      // Reuse the single-payout path so backend and UI stay in sync.
      // eslint-disable-next-line no-await-in-loop
      await handlePaymentDone({
        ...item,
        status: "Paid",
        paidAt: now,
        transactionId: txn,
        paymentNote: "Auto marked as paid after completed work calculation.",
        paymentMode: item.paymentMode || "UPI",
      });
    }

    setActiveFilter("Paid");
  };

  const retryFailed = (payout) => {
    updatePayoutOverride(payout, {
      status: "Pending",
    });

    setActiveFilter("Pending");
  };

  const refreshFromTeacherWork = () => {
    setSearch("");
    setActiveFilter("All");
  };

  if (paymentPayout) {
    return (
      <AdminTeacherPaymentScreen
        navigation={navigation}
        payout={paymentPayout}
        onBack={() => setPaymentPayout(null)}
        onPaymentDone={handlePaymentDone}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

      <View style={styles.screen}>
        <Header
          navigation={navigation}
          title="Teacher Payouts"
          sub="Real payout by completed work"
          onRightPress={refreshFromTeacherWork}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Ionicons name="wallet-outline" size={30} color={COLORS.teal} />
              </View>

              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle}>Real Payout Center</Text>
                <Text style={styles.heroSub}>
                  Teacher amount is calculated from real answered doubts,
                  completed sessions, and published mock tests from AppContext.
                </Text>
              </View>
            </View>

            <View style={styles.heroAmountRow}>
              <View>
                <Text style={styles.heroAmount}>
                  {formatMoney(summary.pendingAmount)}
                </Text>
                <Text style={styles.heroAmountSub}>Pending automatic payout</Text>
              </View>

              <View style={styles.heroBadge}>
                <Ionicons name="flash-outline" size={16} color={COLORS.orange} />
                <Text style={styles.heroBadgeText}>
                  {summary.pendingCount + summary.processingCount} Due
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.autoPayBtn,
                summary.pendingAmount <= 0 && styles.disabledBtn,
              ]}
              disabled={summary.pendingAmount <= 0}
              onPress={autoPayAllPending}
            >
              <Ionicons name="flash-outline" size={18} color={COLORS.white} />
              <Text style={styles.autoPayText}>Auto Pay All Completed Work</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryCard
              title="Doubts"
              value={summary.doubts}
              sub={`₹${RATE_CONFIG.doubtRate} each`}
              icon="chatbubble-ellipses-outline"
              color={COLORS.blue}
              bg={COLORS.blueSoft}
            />

            <SummaryCard
              title="Sessions"
              value={summary.sessions}
              sub={`₹${RATE_CONFIG.sessionRate} each`}
              icon="videocam-outline"
              color={COLORS.purple}
              bg={COLORS.purpleSoft}
            />

            <SummaryCard
              title="Tests"
              value={summary.tests}
              sub={`₹${RATE_CONFIG.mockTestRate} each`}
              icon="document-text-outline"
              color={COLORS.orange}
              bg={COLORS.orangeSoft}
            />

            <SummaryCard
              title="Commission"
              value={formatMoney(summary.commission)}
              sub={`${RATE_CONFIG.adminCommissionPercent}% admin`}
              icon="trending-up-outline"
              color={COLORS.teal}
              bg={COLORS.tealLight}
            />

            <SummaryCard
              title="Pending"
              value={formatMoney(summary.pendingAmount)}
              sub={`${summary.pendingCount} pending`}
              icon="time-outline"
              color={COLORS.orange}
              bg={COLORS.orangeSoft}
            />

            <SummaryCard
              title="Paid"
              value={formatMoney(summary.paidAmount)}
              sub={`${summary.paidCount} paid`}
              icon="checkmark-circle-outline"
              color={COLORS.green}
              bg={COLORS.greenSoft}
            />
          </View>

          <View style={styles.searchCard}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={19} color={COLORS.muted} />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search teacher, subject, account..."
                placeholderTextColor="#9AA4B6"
                style={styles.searchInput}
              />

              {search.length > 0 && (
                <TouchableOpacity activeOpacity={0.75} onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={19} color={COLORS.muted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
            >
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter;

                return (
                  <TouchableOpacity
                    key={filter}
                    activeOpacity={0.85}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Teacher Payout Requests</Text>
              <Text style={styles.sectionSub}>
                {filteredPayouts.length} payout records found
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.historyBtn}
              onPress={() => setActiveFilter("Paid")}
            >
              <Ionicons name="receipt-outline" size={17} color={COLORS.teal} />
              <Text style={styles.historyText}>History</Text>
            </TouchableOpacity>
          </View>

          {realTeachers.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={44} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No real accepted teachers</Text>
              <Text style={styles.emptySub}>
                Accepted teachers from AppContext will appear here. No dummy
                teacher data is used.
              </Text>
            </View>
          ) : filteredPayouts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="wallet-outline" size={44} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No payouts found</Text>
              <Text style={styles.emptySub}>
                Try changing search text or selected filter.
              </Text>
            </View>
          ) : (
            filteredPayouts.map((item) => (
              <View key={item.id}>
                <PayoutCard
                  item={item}
                  onPress={openDetails}
                  onPayPress={openPayment}
                />

                {item.status === "Failed" && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.retryBtn}
                    onPress={() => retryFailed(item)}
                  >
                    <Ionicons name="reload-outline" size={17} color={COLORS.red} />
                    <Text style={styles.retryText}>Retry Failed Payout</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>

        <AdminBottomNavigation navigation={navigation} active="Payouts" />
      </View>

      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDim} onPress={closeDetails} />

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.detailTitle}>Teacher Payout Details</Text>
                <Text style={styles.detailSub}>Real earning breakup</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.closeBtn}
                onPress={closeDetails}
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedPayout && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailTeacherBox}>
                  <View style={styles.detailAvatar}>
                    <Text style={styles.detailAvatarText}>
                      {selectedPayout.avatar}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailTeacherName}>
                      {selectedPayout.teacherName}
                    </Text>
                    <Text style={styles.detailTeacherMeta}>
                      {selectedPayout.subject} •{" "}
                      {selectedPayout.teacherId || "No ID"}
                    </Text>
                  </View>

                  <Text style={styles.detailAmount}>
                    {formatMoney(selectedPayout.payableAmount)}
                  </Text>
                </View>

                <View style={styles.detailSummaryGrid}>
                  <View style={styles.detailMiniCard}>
                    <Text style={styles.detailMiniValue}>
                      {formatMoney(selectedPayout.grossAmount)}
                    </Text>
                    <Text style={styles.detailMiniLabel}>Gross</Text>
                  </View>

                  <View style={styles.detailMiniCard}>
                    <Text style={styles.detailMiniValue}>
                      {formatMoney(selectedPayout.adminCommission)}
                    </Text>
                    <Text style={styles.detailMiniLabel}>Commission</Text>
                  </View>

                  <View style={styles.detailMiniCard}>
                    <Text style={styles.detailMiniValue}>
                      {formatMoney(selectedPayout.payableAmount)}
                    </Text>
                    <Text style={styles.detailMiniLabel}>Payable</Text>
                  </View>
                </View>

                <View style={styles.paymentBreakdownCard}>
                  <Text style={styles.paymentSectionTitle}>Work Completed</Text>

                  <EarningRow
                    title="Doubts Clarified"
                    count={selectedPayout.workSummary.doubts}
                    rate={selectedPayout.earningBreakup.doubtRate}
                    amount={selectedPayout.earningBreakup.doubtAmount}
                    icon="chatbubble-ellipses-outline"
                    color={COLORS.blue}
                  />

                  <EarningRow
                    title="Live Sessions Completed"
                    count={selectedPayout.workSummary.sessions}
                    rate={selectedPayout.earningBreakup.sessionRate}
                    amount={selectedPayout.earningBreakup.sessionAmount}
                    icon="videocam-outline"
                    color={COLORS.purple}
                  />

                  <EarningRow
                    title="Mock Tests Created"
                    count={selectedPayout.workSummary.mockTests}
                    rate={selectedPayout.earningBreakup.mockTestRate}
                    amount={selectedPayout.earningBreakup.testAmount}
                    icon="document-text-outline"
                    color={COLORS.orange}
                  />
                </View>

                <DetailRow
                  icon="wallet-outline"
                  label="Payment Mode"
                  value={selectedPayout.paymentMode}
                />

                <DetailRow
                  icon="card-outline"
                  label="Teacher Account"
                  value={selectedPayout.payoutAccount}
                />

                <DetailRow
                  icon="calendar-outline"
                  label="Requested At"
                  value={formatDateTime(selectedPayout.requestedAt)}
                />

                <DetailRow
                  icon="checkmark-circle-outline"
                  label="Paid At"
                  value={formatDateTime(selectedPayout.paidAt)}
                />

                <DetailRow
                  icon="receipt-outline"
                  label="Transaction ID"
                  value={selectedPayout.transactionId || "Not added"}
                />

                <DetailRow
                  icon="shield-checkmark-outline"
                  label="Current Status"
                  value={selectedPayout.status}
                />

                {selectedPayout.status === "Pending" && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      activeOpacity={0.86}
                      style={styles.processingBtn}
                      onPress={markAsProcessing}
                    >
                      <Ionicons name="sync-outline" size={18} color={COLORS.blue} />
                      <Text style={styles.processingText}>Processing</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.86}
                      style={styles.primaryBtn}
                      onPress={() => openPayment(selectedPayout)}
                    >
                      <Ionicons
                        name="wallet-outline"
                        size={18}
                        color={COLORS.white}
                      />
                      <Text style={styles.primaryBtnText}>Pay Now</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedPayout.status === "Processing" && (
                  <TouchableOpacity
                    activeOpacity={0.86}
                    style={styles.primaryBtnFull}
                    onPress={() => openPayment(selectedPayout)}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color={COLORS.white}
                    />
                    <Text style={styles.primaryBtnText}>Complete Payment</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  activeOpacity={0.86}
                  style={styles.secondaryBtn}
                  onPress={closeDetails}
                >
                  <Text style={styles.secondaryBtnText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.tealDark },
  screen: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    height: Platform.OS === "ios" ? 108 : 92,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "ios" ? 22 : 14,
    flexDirection: "row",
    alignItems: "center",
  },

  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontSize: isSmall ? 20 : 23,
    fontWeight: "900",
    color: COLORS.white,
  },

  headerSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.82)",
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 138 : 122,
  },

  heroCard: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 3,
  },

  heroTop: { flexDirection: "row", alignItems: "center" },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  heroInfo: { flex: 1 },

  heroTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  heroSub: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.muted,
  },

  heroAmountRow: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroAmount: {
    fontSize: isSmall ? 24 : 28,
    fontWeight: "900",
    color: COLORS.text,
  },

  heroAmountSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  heroBadge: {
    borderRadius: 18,
    backgroundColor: COLORS.orangeSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  heroBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.orange,
  },

  autoPayBtn: {
    marginTop: 14,
    height: 50,
    borderRadius: 17,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  autoPayText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  summaryCard: {
    width: "48%",
    minHeight: 118,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 2,
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  summaryValue: {
    fontSize: isSmall ? 18 : 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  summaryTitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
  },

  summarySub: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "900",
  },

  searchCard: {
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 16,
  },

  searchBox: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F9FBFD",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    paddingVertical: 0,
  },

  filterContent: { paddingTop: 12, gap: 9 },

  filterChip: {
    height: 38,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FAFCFF",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  filterChipActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },

  filterText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.muted,
  },

  filterTextActive: { color: COLORS.white },

  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  sectionSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  historyBtn: {
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  historyText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.teal,
  },

  payoutCard: {
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 2,
  },

  payoutTop: { flexDirection: "row", alignItems: "center" },

  teacherAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  teacherAvatarText: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.white,
  },

  teacherInfo: { flex: 1, paddingRight: 8 },

  teacherName: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  teacherMeta: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  statusBadge: {
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  statusText: { fontSize: 10, fontWeight: "900" },

  amountPanel: {
    marginTop: 13,
    borderRadius: 18,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  amountLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
  },

  payableAmount: {
    marginTop: 4,
    fontSize: isSmall ? 20 : 22,
    fontWeight: "900",
    color: COLORS.text,
  },

  amountRight: { alignItems: "flex-end", maxWidth: "45%" },

  commissionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.teal,
  },

  commissionAmount: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.teal,
  },

  workStatsRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  workStat: {
    borderRadius: 14,
    backgroundColor: "#FAFCFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  workStatText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
  },

  payoutBottom: {
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  accountBox: { flex: 1, paddingRight: 8 },

  accountLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.muted,
  },

  accountValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
  },

  quickPayBtn: {
    height: 36,
    borderRadius: 15,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  quickPayText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.white,
  },

  openCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },

  retryBtn: {
    height: 42,
    borderRadius: 15,
    backgroundColor: COLORS.redSoft,
    marginTop: -4,
    marginBottom: 12,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  retryText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.red,
  },

  emptyBox: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    alignItems: "center",
  },

  emptyFullBox: {
    margin: 16,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptySub: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },

  modalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7,18,58,0.35)",
  },

  detailCard: {
    maxHeight: "90%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    paddingBottom: Platform.OS === "ios" ? 32 : 22,
  },

  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  detailTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  detailSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  detailTeacherBox: {
    borderRadius: 19,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  detailAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  detailAvatarText: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.white,
  },

  detailTeacherName: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  detailTeacherMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  detailAmount: {
    fontSize: isSmall ? 17 : 20,
    fontWeight: "900",
    color: COLORS.teal,
  },

  detailSummaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  detailMiniCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    alignItems: "center",
  },

  detailMiniValue: {
    fontSize: isSmall ? 11 : 13,
    fontWeight: "900",
    color: COLORS.text,
  },

  detailMiniLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.muted,
  },

  detailRow: {
    minHeight: 64,
    borderRadius: 17,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  detailLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
  },

  detailValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  earningRow: {
    minHeight: 62,
    borderRadius: 16,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  earningIcon: {
    width: 39,
    height: 39,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  earningInfo: { flex: 1 },

  earningTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },

  earningSub: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  earningAmount: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.teal,
  },

  actionRow: { flexDirection: "row", gap: 10, marginTop: 6 },

  processingBtn: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  processingText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.blue,
  },

  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  primaryBtnFull: {
    marginTop: 16,
    width: "100%",
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  primaryBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },

  secondaryBtn: {
    marginTop: 10,
    height: 50,
    borderRadius: 17,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.teal,
  },

  paymentScroll: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 36,
  },

  paymentHero: {
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 3,
  },

  paymentAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  paymentAvatarText: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.white,
  },

  paymentTeacher: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  paymentMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  paymentAmountBox: {
    marginTop: 16,
    width: "100%",
    borderRadius: 20,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 16,
    alignItems: "center",
  },

  paymentAmountLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
  },

  paymentAmount: {
    marginTop: 4,
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.teal,
  },

  paymentAccount: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },

  paymentBreakdownCard: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 14,
  },

  paymentSectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 12,
  },

  breakdownRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  breakdownLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.muted,
  },

  breakdownValue: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  breakdownDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },

  breakdownTotalLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  breakdownTotalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.teal,
  },

  methodCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FAFCFF",
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  methodCardActive: {
    backgroundColor: COLORS.tealSoft,
    borderColor: "#A7DCD5",
  },

  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  methodTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  methodSub: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 2,
  },

  paymentInputBox: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#F9FBFD",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  noteInputBox: {
    minHeight: 90,
    alignItems: "flex-start",
    paddingTop: 12,
  },

  paymentInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    paddingVertical: 0,
  },

  noteInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },

  warningBox: {
    borderRadius: 17,
    backgroundColor: COLORS.orangeSoft,
    borderWidth: 1,
    borderColor: "#FED7AA",
    padding: 12,
    flexDirection: "row",
    marginBottom: 14,
  },

  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.orange,
  },

  completePaymentBtn: {
    height: 56,
    borderRadius: 19,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  disabledBtn: { opacity: 0.45 },

  completePaymentText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.white,
  },

  confirmOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  confirmDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7,18,58,0.40)",
  },

  confirmCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    padding: 20,
    alignItems: "center",
  },

  successIcon: {
    width: 78,
    height: 78,
    borderRadius: 30,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  confirmTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  confirmSub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },

  confirmAmountBox: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 14,
    marginTop: 16,
    alignItems: "center",
  },

  confirmTeacherName: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  confirmAmount: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.teal,
  },

  confirmAccount: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },

  confirmPayBtnFull: {
    width: "100%",
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  confirmPayText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },

  checkoutWebView: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});
