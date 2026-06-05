// src/screens/admin/AdminMoreScreen.js

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Pressable,
  Dimensions,
  Switch,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import AdminBottomNavigation from "../../components/AdminBottomNavigation";

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

const ADMIN_PROFILE = {
  name: "Admin",
  role: "Platform Controller",
  email: "admin@gmail.com",
  phone: "+91 98765 43210",
  version: "1.0.0",
};

const RATE_CONFIG = {
  doubtRate: 40,
  sessionRate: 250,
  mockTestRate: 120,
  adminCommissionPercent: 20,
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
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

function getAllTestsFromContext(getAllMockTests, mockData) {
  if (typeof getAllMockTests === "function") {
    return safeArray(getAllMockTests());
  }

  const tests = [];

  Object.values(mockData || {}).forEach((category) => {
    safeArray(category?.subjects).forEach((subject) => {
      safeArray(subject?.list).forEach((test) => {
        tests.push({
          ...test,
          category: category?.title,
          subjectName: subject?.name,
        });
      });
    });
  });

  return tests;
}

function calculateTeacherStats({
  teacher,
  allDoubts = [],
  completedSessions = [],
  allMockTests = [],
}) {
  const teacherId = getTeacherId(teacher);
  const teacherName = getTeacherName(teacher);

  const teacherDoubts = safeArray(allDoubts).filter((item) => {
    const itemTeacherId =
      item.teacherId || item.assignedTeacherId || item.tutorId || item.acceptedBy;
    const itemTeacherName = item.teacherName || item.assignedTeacher;

    return (
      item.answered === true &&
      (String(itemTeacherId || "") === String(teacherId || "") ||
        String(itemTeacherName || "").toLowerCase() ===
          String(teacherName || "").toLowerCase())
    );
  });

  const teacherSessions = safeArray(completedSessions).filter((item) => {
    const itemTeacherId = item.teacherId || item.tutorId;
    const itemTeacherName = item.teacherName || item.tutorName || item.tutor;

    return (
      String(itemTeacherId || "") === String(teacherId || "") ||
      String(itemTeacherName || "").toLowerCase() ===
        String(teacherName || "").toLowerCase()
    );
  });

  const teacherMockTests = safeArray(allMockTests).filter((item) => {
    const itemTeacherId = item.teacherId || item.createdBy || item.tutorId;
    const itemTeacherName = item.teacherName || item.createdByName;

    return (
      String(itemTeacherId || "") === String(teacherId || "") ||
      String(itemTeacherName || "").toLowerCase() ===
        String(teacherName || "").toLowerCase()
    );
  });

  const doubtAmount = teacherDoubts.length * RATE_CONFIG.doubtRate;
  const sessionAmount = teacherSessions.length * RATE_CONFIG.sessionRate;
  const mockTestAmount = teacherMockTests.length * RATE_CONFIG.mockTestRate;
  const grossAmount = doubtAmount + sessionAmount + mockTestAmount;
  const adminCommission = Math.round(
    (grossAmount * RATE_CONFIG.adminCommissionPercent) / 100
  );
  const payableAmount = Math.max(grossAmount - adminCommission, 0);

  return {
    teacherId,
    teacherName,
    subject: getTeacherSubject(teacher),
    completedDoubts: teacherDoubts.length,
    completedSessions: teacherSessions.length,
    mockTests: teacherMockTests.length,
    grossAmount,
    adminCommission,
    payableAmount,
  };
}

const MENU_SECTIONS = [
  {
    title: "Management",
    data: [
      {
        key: "teachers",
        title: "Teachers Management",
        sub: "View teachers, approvals and profiles",
        icon: "people-outline",
        color: COLORS.teal,
        bg: COLORS.tealLight,
        screen: "TeacherRequestScreen",
      },
      {
        key: "subscriptions",
        title: "Subscription Payments",
        sub: "Student plan payments and revenue",
        icon: "reader-outline",
        color: COLORS.blue,
        bg: COLORS.blueSoft,
        screen: "AdminSubscriptionPayments",
      },
      {
        key: "earnings",
        title: "Teacher Earnings",
        sub: "Instant earnings from doubts, sessions and tests",
        icon: "cash-outline",
        color: COLORS.green,
        bg: COLORS.greenSoft,
        screen: "AdminTeacherEarnings",
      },
      {
        key: "payouts",
        title: "Teacher Payouts",
        sub: "Pending, processing and paid payouts",
        icon: "wallet-outline",
        color: COLORS.orange,
        bg: COLORS.orangeSoft,
        screen: "AdminTeacherPayouts",
      },
    ],
  },
  {
    title: "Platform",
    data: [
      {
        key: "notifications",
        title: "Admin Notifications",
        sub: "System alerts, payment updates and reports",
        icon: "notifications-outline",
        color: COLORS.purple,
        bg: COLORS.purpleSoft,
        screen: "AdminNotifications",
      },
      {
        key: "reports",
        title: "Reports & Analytics",
        sub: "Revenue, teacher work and student activity",
        icon: "bar-chart-outline",
        color: COLORS.blue,
        bg: COLORS.blueSoft,
        modal: "reports",
      },
      {
        key: "settings",
        title: "App Settings",
        sub: "Commission, payout and platform settings",
        icon: "settings-outline",
        color: COLORS.teal,
        bg: COLORS.tealLight,
        modal: "settings",
      },
      {
        key: "support",
        title: "Help & Support",
        sub: "Admin help center and contact support",
        icon: "headset-outline",
        color: COLORS.green,
        bg: COLORS.greenSoft,
        modal: "support",
      },
    ],
  },
  {
    title: "Legal",
    data: [
      {
        key: "terms",
        title: "Terms & Conditions",
        sub: "Platform usage and admin policies",
        icon: "document-text-outline",
        color: COLORS.orange,
        bg: COLORS.orangeSoft,
        modal: "terms",
      },
      {
        key: "privacy",
        title: "Privacy Policy",
        sub: "Data safety and privacy information",
        icon: "shield-checkmark-outline",
        color: COLORS.blue,
        bg: COLORS.blueSoft,
        modal: "privacy",
      },
      {
        key: "about",
        title: "About App",
        sub: "Version, app info and company details",
        icon: "information-circle-outline",
        color: COLORS.purple,
        bg: COLORS.purpleSoft,
        modal: "about",
      },
    ],
  },
];

function getInitial(name = "A") {
  return String(name || "A").trim().charAt(0).toUpperCase();
}

function StatPill({ icon, value, label, color, bg }) {
  return (
    <View style={styles.statPill}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuRow({ item, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.menuRow} onPress={onPress}>
      <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={21} color={item.color} />
      </View>

      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSub} numberOfLines={1}>
          {item.sub}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
    </TouchableOpacity>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={COLORS.teal} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function SupportActionRow({ icon, label, value, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.84} style={styles.infoRow} onPress={onPress}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={COLORS.teal} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
    </TouchableOpacity>
  );
}

export default function AdminMoreScreen({ navigation }) {
  const [modalType, setModalType] = useState(null);
  const [commissionPercent, setCommissionPercent] = useState("20");
  const [autoCredit, setAutoCredit] = useState(true);
  const [monthlyPayout, setMonthlyPayout] = useState(true);
  const [paymentNotifications, setPaymentNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);

  const {
    tutors = [],
    subscriptionPayments = [],
    allDoubts = [],
    completedSessions = [],
    mockData = {},
    getAllMockTests,
  } = useAppContext();

  const allMockTests = useMemo(
    () => getAllTestsFromContext(getAllMockTests, mockData),
    [getAllMockTests, mockData]
  );

  const teacherStats = useMemo(
    () =>
      safeArray(tutors).map((teacher) =>
        calculateTeacherStats({
          teacher,
          allDoubts,
          completedSessions,
          allMockTests,
        })
      ),
    [tutors, allDoubts, completedSessions, allMockTests]
  );

  const reportStats = useMemo(
    () => ({
      teachers: safeArray(tutors).length,
      subscriptions: safeArray(subscriptionPayments)
        .filter((item) => String(item.status || "").toLowerCase() === "paid")
        .reduce((sum, item) => sum + Number(item.amount || item.price || 0), 0),
      earnings: teacherStats.reduce((sum, item) => sum + Number(item.adminCommission || 0), 0),
      payouts: teacherStats.reduce((sum, item) => sum + Number(item.payableAmount || 0), 0),
    }),
    [tutors, subscriptionPayments, teacherStats]
  );

  const closeModal = () => {
    setModalType(null);
  };

  const handleMenuPress = (item) => {
    if (item.screen) {
      navigation?.navigate?.(item.screen);
      return;
    }

    if (item.modal) {
      setModalType(item.modal);
    }
  };

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation?.navigate?.("AdminDashboard");
  };

  const logout = () => {
    navigation?.reset?.({
      index: 0,
      routes: [{ name: "RoleSelectionScreen", params: { fromLogout: true } }],
    });
  };

  const openExternalLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn("Unable to open link", url, error);
    }
  };

  const openSupportEmail = () => {
    openExternalLink("mailto:support@adminapp.com?subject=Admin%20Support");
  };

  const openSupportCall = () => {
    openExternalLink("tel:+919876543210");
  };

  const openSupportWhatsApp = () => {
    openExternalLink(
      "https://wa.me/919876543210?text=Hi%20Admin%20Support%2C%20I%20need%20help%20with%20the%20platform."
    );
  };

  const getModalTitle = () => {
    if (modalType === "settings") return "App Settings";
    if (modalType === "reports") return "Reports & Analytics";
    if (modalType === "support") return "Help & Support";
    if (modalType === "terms") return "Terms & Conditions";
    if (modalType === "privacy") return "Privacy Policy";
    if (modalType === "about") return "About App";
    return "Details";
  };

  const renderModalContent = () => {
    if (modalType === "settings") {
      return (
        <View>
          <View style={styles.settingBox}>
            <Text style={styles.settingLabel}>Admin Commission Percentage</Text>

            <View style={styles.percentInputBox}>
              <TextInput
                value={commissionPercent}
                onChangeText={setCommissionPercent}
                keyboardType="numeric"
                placeholder="20"
                placeholderTextColor="#9AA4B6"
                style={styles.percentInput}
              />
              <Text style={styles.percentSymbol}>%</Text>
            </View>

            <Text style={styles.settingHelp}>
              Example: if teacher earns ₹100, admin keeps ₹20 and teacher gets ₹80.
            </Text>
          </View>

          <SettingSwitch
            title="Auto Credit Teacher Earnings"
            sub="Credit amount instantly after completed doubt, session or mock test"
            value={autoCredit}
            onValueChange={setAutoCredit}
          />

          <SettingSwitch
            title="Monthly Teacher Payout"
            sub="Keep earnings pending and pay teachers monthly"
            value={monthlyPayout}
            onValueChange={setMonthlyPayout}
          />

          <SettingSwitch
            title="Payment Notifications"
            sub="Notify admin for student subscriptions and payout status"
            value={paymentNotifications}
            onValueChange={setPaymentNotifications}
          />

          <SettingSwitch
            title="System Notifications"
            sub="Notify admin about reports, approvals and app issues"
            value={systemNotifications}
            onValueChange={setSystemNotifications}
          />

          <TouchableOpacity activeOpacity={0.86} style={styles.primaryBtn} onPress={closeModal}>
            <Text style={styles.primaryBtnText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (modalType === "reports") {
      return (
        <View>
          <View style={styles.reportGrid}>
            <ReportCard
              icon="reader-outline"
              title="Subscriptions"
              value={formatMoney(reportStats.subscriptions)}
              sub="Total revenue"
              color={COLORS.blue}
              bg={COLORS.blueSoft}
            />
            <ReportCard
              icon="cash-outline"
              title="Earnings"
              value={formatMoney(reportStats.earnings)}
              sub="Admin commission"
              color={COLORS.green}
              bg={COLORS.greenSoft}
            />
            <ReportCard
              icon="wallet-outline"
              title="Payouts"
              value={formatMoney(reportStats.payouts)}
              sub="Pending amount"
              color={COLORS.orange}
              bg={COLORS.orangeSoft}
            />
            <ReportCard
              icon="people-outline"
              title="Teachers"
              value={reportStats.teachers}
              sub="Active teachers"
              color={COLORS.teal}
              bg={COLORS.tealLight}
            />
          </View>

          <InfoRow
            icon="bar-chart-outline"
            label="Revenue Report"
            value="View subscription payments, failed payments and pending payments."
          />
          <InfoRow
            icon="trending-up-outline"
            label="Teacher Work Report"
            value="Track doubts, sessions, mock tests and teacher earnings."
          />
          <InfoRow
            icon="receipt-outline"
            label="Payout Report"
            value="Track pending, processing, paid and failed teacher payouts."
          />
        </View>
      );
    }

    if (modalType === "support") {
      return (
        <View>
          <SupportActionRow
            icon="mail-outline"
            label="Email Support"
            value="support@adminapp.com"
            onPress={openSupportEmail}
          />
          <SupportActionRow
            icon="call-outline"
            label="Phone Support"
            value="+91 98765 43210"
            onPress={openSupportCall}
          />
          <SupportActionRow
            icon="logo-whatsapp"
            label="WhatsApp Support"
            value="+91 98765 43210"
            onPress={openSupportWhatsApp}
          />

          <View style={styles.supportNote}>
            <Ionicons name="information-circle-outline" size={22} color={COLORS.teal} />
            <Text style={styles.supportNoteText}>
              Admin support helps with subscription payment issues, teacher payout
              problems, approval workflows and platform reports.
            </Text>
          </View>
        </View>
      );
    }

    if (modalType === "terms") {
      return (
        <View>
          <PolicyText text="Admins must manage student subscription payments, teacher earnings and payouts responsibly." />
          <PolicyText text="Teacher earnings should be credited only after verified completion of doubts, sessions or mock tests." />
          <PolicyText text="Admin commission, payout rules, refunds and subscription plans must follow platform policy." />
          <PolicyText text="Any misuse of payment records, teacher records or student data may result in account restriction." />
        </View>
      );
    }

    if (modalType === "privacy") {
      return (
        <View>
          <PolicyText text="Admin can access required platform data like student payments, teacher earnings, teacher payout accounts and reports." />
          <PolicyText text="Payment records should be used only for accounting, payout, refund and support purposes." />
          <PolicyText text="Teacher bank or UPI details should be protected and not shared outside the platform." />
          <PolicyText text="Student and teacher personal information must remain private and secure." />
        </View>
      );
    }

    if (modalType === "about") {
      return (
        <View>
          <View style={styles.aboutHero}>
            <View style={styles.aboutIcon}>
              <Ionicons name="shield-checkmark" size={42} color={COLORS.teal} />
            </View>

            <Text style={styles.aboutTitle}>Admin Management App</Text>
            <Text style={styles.aboutSub}>Version {ADMIN_PROFILE.version}</Text>
          </View>

          <InfoRow
            icon="person-outline"
            label="Admin Name"
            value={ADMIN_PROFILE.name}
          />
          <InfoRow
            icon="mail-outline"
            label="Admin Email"
            value={ADMIN_PROFILE.email}
          />
          <InfoRow
            icon="briefcase-outline"
            label="Role"
            value={ADMIN_PROFILE.role}
          />
          <InfoRow
            icon="flash-outline"
            label="Main Feature"
            value="Instant teacher earning credit after completed work."
          />
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.headerBtn}
            onPress={goBackSafe}
          >
            <Ionicons name="chevron-back" size={25} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>More</Text>
            <Text style={styles.headerSub}>Admin settings and tools</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.headerBtn}
            onPress={() => navigation?.navigate?.("AdminNotifications")}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {getInitial(ADMIN_PROFILE.name)}
                </Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{ADMIN_PROFILE.name}</Text>
                <Text style={styles.profileRole}>{ADMIN_PROFILE.role}</Text>
                <Text style={styles.profileEmail}>{ADMIN_PROFILE.email}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.86}
                style={styles.editBtn}
                onPress={() => setModalType("about")}
              >
                <Ionicons name="create-outline" size={19} color={COLORS.teal} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileStatsRow}>
            <StatPill
              icon="people-outline"
                value={reportStats.teachers}
              label="Teachers"
              color={COLORS.teal}
              bg={COLORS.tealLight}
            />
            <StatPill
              icon="reader-outline"
                value={reportStats.subscriptions}
              label="Subscriptions"
              color={COLORS.blue}
              bg={COLORS.blueSoft}
            />
            <StatPill
              icon="wallet-outline"
                value={reportStats.payouts}
              label="Payouts"
              color={COLORS.orange}
              bg={COLORS.orangeSoft}
            />
            <StatPill
              icon="bar-chart-outline"
                value={teacherStats.length}
              label="Reports"
              color={COLORS.purple}
              bg={COLORS.purpleSoft}
            />
            </View>
          </View>

          <View style={styles.instantCard}>
            <View style={styles.instantIcon}>
              <Ionicons name="flash-outline" size={25} color={COLORS.green} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.instantTitle}>Instant Teacher Earnings</Text>
              <Text style={styles.instantSub}>
                When teacher completes a doubt, session or mock test, earning is
                credited immediately and added to pending payout.
              </Text>
            </View>
          </View>

          {MENU_SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <View style={styles.menuCard}>
                {section.data.map((item, index) => (
                  <View key={item.key}>
                    <MenuRow item={item} onPress={() => handleMenuPress(item)} />
                    {index !== section.data.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity activeOpacity={0.86} style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={21} color={COLORS.red} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>

        <AdminBottomNavigation navigation={navigation} active="More" />
      </View>

      <Modal
        visible={!!modalType}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDim} onPress={closeModal} />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{getModalTitle()}</Text>
                <Text style={styles.modalSub}>Admin control panel</Text>
              </View>

              <TouchableOpacity activeOpacity={0.82} style={styles.closeBtn} onPress={closeModal}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {renderModalContent()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingSwitch({ title, sub, value, onValueChange }) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchInfo}>
        <Text style={styles.switchTitle}>{title}</Text>
        <Text style={styles.switchSub}>{sub}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D8E0EC", true: "#BFE8E2" }}
        thumbColor={value ? COLORS.teal : COLORS.white}
      />
    </View>
  );
}

function ReportCard({ icon, title, value, sub, color, bg }) {
  return (
    <View style={styles.reportCard}>
      <View style={[styles.reportIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <Text style={styles.reportValue}>{value}</Text>
      <Text style={styles.reportTitle}>{title}</Text>
      <Text style={[styles.reportSub, { color }]}>{sub}</Text>
    </View>
  );
}

function PolicyText({ text }) {
  return (
    <View style={styles.policyTextBox}>
      <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.teal} />
      <Text style={styles.policyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.tealDark,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

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
    fontSize: isSmall ? 21 : 24,
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

  profileCard: {
    borderRadius: 23,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 3,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileAvatar: {
    width: 62,
    height: 62,
    borderRadius: 24,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  profileAvatarText: {
    fontSize: 25,
    fontWeight: "900",
    color: COLORS.white,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  profileRole: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.teal,
  },

  profileEmail: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },

  profileStatsRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },

  statPill: {
    flex: 1,
    minWidth: "22%",
    borderRadius: 16,
    backgroundColor: "#FAFCFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 9,
    alignItems: "center",
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  statValue: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  statLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.muted,
  },

  instantCard: {
    borderRadius: 21,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  instantIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  instantTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  instantSub: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.muted,
  },

  section: {
    marginBottom: 16,
  },

  sectionTitle: {
    marginBottom: 9,
    paddingHorizontal: 2,
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  menuCard: {
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 2,
  },

  menuRow: {
    minHeight: 72,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIconBox: {
    width: 45,
    height: 45,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  menuInfo: {
    flex: 1,
    paddingRight: 8,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  menuSub: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 70,
  },

  logoutBtn: {
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.red,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7,18,58,0.35)",
  },

  modalCard: {
    maxHeight: "88%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    paddingBottom: Platform.OS === "ios" ? 32 : 22,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  modalSub: {
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

  settingBox: {
    borderRadius: 18,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 14,
    marginBottom: 12,
  },

  settingLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 8,
  },

  percentInputBox: {
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  percentInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
    paddingVertical: 0,
  },

  percentSymbol: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.teal,
  },

  settingHelp: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
    color: COLORS.muted,
  },

  switchRow: {
    minHeight: 72,
    borderRadius: 18,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  switchInfo: {
    flex: 1,
    paddingRight: 10,
  },

  switchTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  switchSub: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: COLORS.muted,
  },

  primaryBtn: {
    marginTop: 8,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },

  reportGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  reportCard: {
    width: (width - 54) / 2,
    borderRadius: 18,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 10,
  },

  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  reportValue: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  reportTitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
  },

  reportSub: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "900",
  },

  infoRow: {
    minHeight: 64,
    borderRadius: 17,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
  },

  infoValue: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: COLORS.muted,
  },

  supportNote: {
    marginTop: 4,
    borderRadius: 18,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  supportNoteText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  policyTextBox: {
    borderRadius: 17,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  policyText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    color: COLORS.text,
  },

  aboutHero: {
    borderRadius: 22,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 18,
    alignItems: "center",
    marginBottom: 14,
  },

  aboutIcon: {
    width: 78,
    height: 78,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  aboutTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  aboutSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.teal,
  },
});





































