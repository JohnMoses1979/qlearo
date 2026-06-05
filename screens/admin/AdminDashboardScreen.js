

// src/screens/admin/AdminDashboardScreen.js

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";

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

function getInitial(name = "U") {
  return String(name || "U").trim().charAt(0).toUpperCase();
}

function normalizeStatus(status = "") {
  const clean = String(status || "").trim().toLowerCase();

  if (
    clean === "accepted" ||
    clean === "approved" ||
    clean === "active"
  ) {
    return "Accepted";
  }

  if (
    clean === "rejected" ||
    clean === "declined"
  ) {
    return "Rejected";
  }

  if (
    clean === "pending" ||
    clean === "pending_approval" ||
    clean === "requested" ||
    clean === "review" ||
    clean === "under_review"
  ) {
    return "Pending";
  }

  return status ? String(status) : "Pending";
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

function getTeacherLocation(teacher = {}) {
  return teacher.location || teacher.city || teacher.address || "Location not added";
}

function getTeacherExperience(teacher = {}) {
  const exp = teacher.experience || teacher.yearsOfExperience || teacher.experienceText;

  if (!exp) return "0 Years";

  if (typeof exp === "number") {
    return `${exp} ${exp === 1 ? "Year" : "Years"}`;
  }

  return String(exp);
}

function getTeacherQualification(teacher = {}) {
  return teacher.qualification || teacher.degree || teacher.education || "Qualification not added";
}

function normalizeTeacher(teacher = {}) {
  const id = getTeacherId(teacher);
  const name = getTeacherName(teacher);

  return {
    ...teacher,
    id,
    teacherId: teacher.teacherId || id,
    teacherName: name,
    name,
    subject: getTeacherSubject(teacher),
    location: getTeacherLocation(teacher),
    qualification: getTeacherQualification(teacher),
    experience: getTeacherExperience(teacher),
    status: normalizeStatus(teacher.status),
  };
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
    latestActivity:
      teacherDoubts[0]?.answeredAt ||
      teacherSessions[0]?.completedAt ||
      teacherMockTests[0]?.createdAt ||
      teacher.updatedAt ||
      teacher.createdAt ||
      null,
  };
}

function formatTime(value) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({ icon, title, value, sub, color, bg, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.88} style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>

      <Text style={styles.statTitle} numberOfLines={1}>
        {title}
      </Text>

      <Text style={[styles.statSub, { color }]} numberOfLines={1}>
        {sub}
      </Text>
    </TouchableOpacity>
  );
}

function TeacherActionCard({ icon, title, value, sub, color, bg, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.88} style={styles.teacherActionCard} onPress={onPress}>
      <View style={[styles.teacherActionIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>

      <Text style={styles.teacherActionValue}>{value}</Text>
      <Text style={styles.teacherActionTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.teacherActionSub} numberOfLines={2}>
        {sub}
      </Text>
    </TouchableOpacity>
  );
}

function SmallTeacherCard({ item, onPress }) {
  const isAccepted = item.status === "Accepted";

  return (
    <TouchableOpacity activeOpacity={0.88} style={styles.teacherMiniCard} onPress={onPress}>
      <View style={styles.teacherAvatar}>
        <Text style={styles.teacherAvatarText}>{getInitial(item.teacherName)}</Text>
      </View>

      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName} numberOfLines={1}>
          {item.teacherName}
        </Text>
        <Text style={styles.teacherMeta} numberOfLines={1}>
          {item.subject} • {item.experience}
        </Text>
      </View>

      <View style={[styles.statusPill, isAccepted ? styles.acceptedPill : styles.pendingPill]}>
        <Text style={[styles.statusText, isAccepted ? styles.acceptedText : styles.pendingText]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function EmptyBox({ icon, title, sub }) {
  return (
    <View style={styles.emptyBox}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={22} color={COLORS.teal} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
    </View>
  );
}

function EarningRow({ item }) {
  return (
    <View style={styles.rowItem}>
      <View style={styles.rowIcon}>
        <Ionicons name={item.icon} size={20} color={COLORS.teal} />
      </View>

      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.teacherName}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {item.work} • {item.time}
        </Text>
      </View>

      <Text style={styles.earningAmount}>+{formatMoney(item.amount)}</Text>
    </View>
  );
}

function SubscriptionRow({ item }) {
  return (
    <View style={styles.rowItem}>
      <View style={styles.studentAvatar}>
        <Text style={styles.studentAvatarText}>{getInitial(item.studentName)}</Text>
      </View>

      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.studentName}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {item.planName}
        </Text>
      </View>

      <View style={styles.subscriptionAmountBox}>
        <Text style={styles.subscriptionAmount}>{formatMoney(item.amount)}</Text>
        <Text style={styles.paidText}>{item.status || "Paid"}</Text>
      </View>
    </View>
  );
}

function AdminBottomNavigation({ navigation, active = "Dashboard" }) {
  const items = [
    {
      key: "Dashboard",
      label: "Home",
      icon: "home-outline",
      activeIcon: "home",
      screen: "AdminDashboard",
    },
    {
      key: "Subscriptions",
      label: "Payments",
      icon: "reader-outline",
      activeIcon: "reader",
      screen: "AdminSubscriptionPayments",
    },
    {
      key: "Earnings",
      label: "Earnings",
      icon: "cash-outline",
      activeIcon: "cash",
      screen: "AdminTeacherEarnings",
    },
    {
      key: "Payouts",
      label: "Payouts",
      icon: "wallet-outline",
      activeIcon: "wallet",
      screen: "AdminTeacherPayouts",
    },
    {
      key: "More",
      label: "More",
      icon: "ellipsis-horizontal",
      activeIcon: "ellipsis-horizontal-circle",
      screen: "AdminMore",
    },
  ];

  return (
    <View pointerEvents="box-none" style={styles.bottomWrapper}>
      <View style={styles.bottomNav}>
        {items.map((item) => {
          const isActive = active === item.key;

          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.86}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => {
                if (!isActive) navigation?.navigate?.(item.screen);
              }}
            >
              <Ionicons
                name={isActive ? item.activeIcon : item.icon}
                size={22}
                color={COLORS.white}
              />
              <Text style={styles.navLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function DrawerItem({ icon, title, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.84} style={styles.drawerItem} onPress={onPress}>
      <View style={styles.drawerIcon}>
        <Ionicons name={icon} size={20} color={COLORS.teal} />
      </View>

      <Text style={styles.drawerText}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const {
    currentUser,
    tutors = [],
    tuitionRequests = [],
    pendingTuitionRequests = [],
    acceptedTuitionRequests = [],
    allDoubts = [],
    answeredDoubts = [],
    completedSessions = [],
    mockData = {},
    getAllMockTests,
    notifications = [],
    subscriptionPayments = [],
    refreshTeacherApprovals,
  } = useAppContext();

  useEffect(() => {
    refreshTeacherApprovals?.("PENDING_APPROVAL").catch(() => {});
    refreshTeacherApprovals?.("APPROVED").catch(() => {});
    refreshTeacherApprovals?.("REJECTED").catch(() => {});
  }, [refreshTeacherApprovals]);

  const teachers = useMemo(() => {
    const fromTutors = safeArray(tutors).map(normalizeTeacher);

    const fromRequests = safeArray(tuitionRequests)
      .filter((request) => request.teacherId || request.tutorId || request.teacherName)
      .map((request) =>
        normalizeTeacher({
          id: request.teacherId || request.tutorId,
          teacherId: request.teacherId || request.tutorId,
          teacherName: request.teacherName || request.tutorName,
          name: request.teacherName || request.tutorName,
          subject: request.subject,
          status:
            request.status === "accepted"
              ? "Accepted"
              : request.status === "pending"
              ? "Pending"
              : request.status,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        })
      );

    const merged = [...fromTutors];

    fromRequests.forEach((teacher) => {
      const exists = merged.some(
        (item) =>
          String(item.id || item.teacherId) === String(teacher.id || teacher.teacherId)
      );

      if (!exists && teacher.teacherName && teacher.teacherName !== "Teacher") {
        merged.push(teacher);
      }
    });

    return merged;
  }, [tutors, tuitionRequests]);

  const allMockTests = useMemo(
    () => getAllTestsFromContext(getAllMockTests, mockData),
    [getAllMockTests, mockData]
  );

  const teacherStats = useMemo(
    () =>
      teachers.map((teacher) =>
        calculateTeacherStats({
          teacher,
          allDoubts,
          completedSessions,
          allMockTests,
        })
      ),
    [teachers, allDoubts, completedSessions, allMockTests]
  );

  const subscriptionList = useMemo(() => {
    return safeArray(subscriptionPayments)
      .map((item) => ({
        id: item.id || item.transactionId || `${item.studentId}_${item.createdAt}`,
        studentName: item.studentName || item.name || "Student",
        planName: item.planName || item.plan || "Subscription Plan",
        amount: Number(item.amount || item.price || 0),
        status: item.status || "Paid",
        createdAt: item.createdAt || item.paidAt || item.updatedAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }, [subscriptionPayments]);

  const summary = useMemo(() => {
    const pendingTeachers = teachers.filter((item) => item.status === "Pending").length;
    const acceptedTeachers = teachers.filter((item) => item.status === "Accepted").length;

    const subscriptionsRevenue = subscriptionList
      .filter((item) => String(item.status).toLowerCase() === "paid")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const totalTeacherGross = teacherStats.reduce(
      (sum, item) => sum + Number(item.grossAmount || 0),
      0
    );

    const pendingPayouts = teacherStats.reduce(
      (sum, item) => sum + Number(item.payableAmount || 0),
      0
    );

    const todayEarnings = teacherStats.reduce(
      (sum, item) => sum + Number(item.adminCommission || 0),
      0
    );

    return {
      revenue: subscriptionsRevenue + totalTeacherGross,
      todayEarnings,
      pendingPayouts,
      pendingTeachers,
      acceptedTeachers,
      totalTeachers: teachers.length,
      totalDoubts: safeArray(answeredDoubts).length,
      totalSessions: safeArray(completedSessions).length,
      totalTests: allMockTests.length,
      notificationsCount: safeArray(notifications).filter((item) => !item.read).length,
    };
  }, [
    teachers,
    subscriptionList,
    teacherStats,
    answeredDoubts,
    completedSessions,
    allMockTests,
    notifications,
  ]);

  const pendingTeachers = useMemo(
    () => teachers.filter((item) => item.status === "Pending").slice(0, 2),
    [teachers]
  );

  const liveEarnings = useMemo(() => {
    const rows = [];

    safeArray(answeredDoubts).slice(0, 3).forEach((doubt) => {
      rows.push({
        id: `DOUBT_${doubt.id}`,
        teacherName: doubt.teacherName || doubt.assignedTeacher || "Teacher",
        work: "Doubt completed",
        amount: RATE_CONFIG.doubtRate,
        time: formatTime(doubt.answeredAt || doubt.updatedAt || doubt.createdAt),
        icon: "chatbubble-ellipses-outline",
      });
    });

    safeArray(completedSessions).slice(0, 3).forEach((session) => {
      rows.push({
        id: `SESSION_${session.id}`,
        teacherName: session.teacherName || session.tutorName || session.tutor || "Teacher",
        work: "Session completed",
        amount: RATE_CONFIG.sessionRate,
        time: formatTime(session.completedAt || session.endedAt || session.updatedAt),
        icon: "videocam-outline",
      });
    });

    safeArray(allMockTests).slice(0, 3).forEach((test) => {
      rows.push({
        id: `TEST_${test.id || test.testId}`,
        teacherName: test.teacherName || "Teacher",
        work: "Mock test published",
        amount: RATE_CONFIG.mockTestRate,
        time: formatTime(test.createdAt || test.updatedAt),
        icon: "document-text-outline",
      });
    });

    return rows.slice(0, 5);
  }, [answeredDoubts, completedSessions, allMockTests]);

  const recentSubscriptions = useMemo(
    () => subscriptionList.slice(0, 5),
    [subscriptionList]
  );

  const goToTeacherRequests = () => {
    navigation?.navigate?.("TeacherRequestScreen");
  };

  const goToAcceptedTeachers = () => {
    navigation?.navigate?.("AcceptedTeachersScreen");
  };

  const goToTeacherDetails = (teacher) => {
    navigation?.navigate?.("TeacherDetailsScreen", {
      teacher,
      teacherId: teacher.id || teacher.teacherId,
    });
  };

  const goTo = (screen) => {
    setMenuVisible(false);
    navigation?.navigate?.(screen);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.headerBtn}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="menu-outline" size={28} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerTextBox}>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSub}>Manage real platform data</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.headerBtn}
            onPress={() => navigation?.navigate?.("AdminNotifications")}
          >
            <Ionicons name="notifications-outline" size={25} color={COLORS.white} />
            {(summary.pendingTeachers > 0 || summary.notificationsCount > 0) && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {summary.pendingTeachers + summary.notificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.welcomeCard}>
            <View style={styles.adminIcon}>
              <Ionicons name="shield-checkmark-outline" size={30} color={COLORS.white} />
            </View>

            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeTitle}>
                Welcome {currentUser?.name || "Admin"}!
              </Text>
              <Text style={styles.welcomeSub}>
                Review teacher requests, subscriptions, earnings and payouts from AppContext.
              </Text>
            </View>
          </View>

          <View style={styles.statGrid}>
            <StatCard
              icon="reader-outline"
              title="Revenue"
              value={formatMoney(summary.revenue)}
              sub="Real total"
              color={COLORS.blue}
              bg={COLORS.blueSoft}
              onPress={() => navigation?.navigate?.("AdminSubscriptionPayments")}
            />

            <StatCard
              icon="school-outline"
              title="Requests"
              value={summary.pendingTeachers}
              sub="Teacher pending"
              color={COLORS.orange}
              bg={COLORS.orangeSoft}
              onPress={goToTeacherRequests}
            />

            <StatCard
              icon="cash-outline"
              title="Earnings"
              value={formatMoney(summary.todayEarnings)}
              sub="Admin commission"
              color={COLORS.green}
              bg={COLORS.greenSoft}
              onPress={() => navigation?.navigate?.("AdminTeacherEarnings")}
            />

            <StatCard
              icon="wallet-outline"
              title="Payouts"
              value={formatMoney(summary.pendingPayouts)}
              sub="Teacher payable"
              color={COLORS.purple}
              bg={COLORS.purpleSoft}
              onPress={() => navigation?.navigate?.("AdminTeacherPayouts")}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Teacher Approval</Text>
                <Text style={styles.cardSub}>Real registered teachers</Text>
              </View>
            </View>

            <View style={styles.teacherActionRow}>
              <TeacherActionCard
                icon="clipboard-outline"
                title="Teacher Requests"
                value={summary.pendingTeachers}
                sub="Pending teachers"
                color={COLORS.orange}
                bg={COLORS.orangeSoft}
                onPress={goToTeacherRequests}
              />

              <TeacherActionCard
                icon="checkmark-circle-outline"
                title="Accepted Teachers"
                value={summary.acceptedTeachers}
                sub="Approved teachers"
                color={COLORS.green}
                bg={COLORS.greenSoft}
                onPress={goToAcceptedTeachers}
              />
            </View>

            {pendingTeachers.length > 0 ? (
              <View style={styles.miniList}>
                {pendingTeachers.map((teacher) => (
                  <SmallTeacherCard
                    key={teacher.id || teacher.teacherId}
                    item={teacher}
                    onPress={() => goToTeacherDetails(teacher)}
                  />
                ))}
              </View>
            ) : (
              <EmptyBox
                icon="checkmark-done-circle-outline"
                title="No pending teachers"
                sub="New teacher registrations will appear here."
              />
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Live Earnings</Text>
                <Text style={styles.cardSub}>From doubts, sessions and mock tests</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation?.navigate?.("AdminTeacherEarnings")}
              >
                <Text style={styles.linkText}>View</Text>
              </TouchableOpacity>
            </View>

            {liveEarnings.length > 0 ? (
              liveEarnings.map((item, index) => (
                <View key={item.id}>
                  <EarningRow item={item} />
                  {index !== liveEarnings.length - 1 && <View style={styles.divider} />}
                </View>
              ))
            ) : (
              <EmptyBox
                icon="cash-outline"
                title="No earnings yet"
                sub="Completed doubts, sessions and tests will show here."
              />
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Subscriptions</Text>
                <Text style={styles.cardSub}>Recent student payments</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation?.navigate?.("AdminSubscriptionPayments")}
              >
                <Text style={styles.linkText}>View</Text>
              </TouchableOpacity>
            </View>

            {recentSubscriptions.length > 0 ? (
              recentSubscriptions.map((item, index) => (
                <View key={item.id}>
                  <SubscriptionRow item={item} />
                  {index !== recentSubscriptions.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))
            ) : (
              <EmptyBox
                icon="reader-outline"
                title="No subscription payments"
                sub="Student plan payments will appear here after checkout."
              />
            )}
          </View>
        </ScrollView>

        <AdminBottomNavigation navigation={navigation} active="Dashboard" />
      </View>

      <Modal
        visible={menuVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.drawerOverlay}>
          <Pressable style={styles.drawerDim} onPress={() => setMenuVisible(false)} />

          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerAvatar}>
                <Ionicons name="person" size={28} color={COLORS.white} />
              </View>

              <View style={styles.drawerProfile}>
                <Text style={styles.drawerName}>{currentUser?.name || "Admin"}</Text>
                <Text style={styles.drawerRole}>Platform Controller</Text>
              </View>

              <TouchableOpacity style={styles.drawerClose} onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={21} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <DrawerItem icon="home-outline" title="Dashboard" onPress={() => goTo("AdminDashboard")} />
            <DrawerItem icon="clipboard-outline" title="Teacher Requests" onPress={goToTeacherRequests} />
            <DrawerItem icon="checkmark-circle-outline" title="Accepted Teachers" onPress={goToAcceptedTeachers} />
            <DrawerItem icon="reader-outline" title="Subscription Payments" onPress={() => goTo("AdminSubscriptionPayments")} />
            <DrawerItem icon="cash-outline" title="Teacher Earnings" onPress={() => goTo("AdminTeacherEarnings")} />
            <DrawerItem icon="wallet-outline" title="Teacher Payouts" onPress={() => goTo("AdminTeacherPayouts")} />
            <DrawerItem icon="settings-outline" title="More" onPress={() => goTo("AdminMore")} />

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.logoutBtn}
              onPress={() => {
                setMenuVisible(false);
                navigation?.reset?.({
                  index: 0,
                  routes: [{ name: "RoleSelectionScreen", params: { fromLogout: true } }],
                });
              }}
            >
              <Ionicons name="log-out-outline" size={21} color={COLORS.red} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    position: "relative",
  },

  headerTextBox: {
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

  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    paddingHorizontal: 4,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.white,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 138 : 122,
  },

  welcomeCard: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 3,
  },

  adminIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  welcomeInfo: {
    flex: 1,
  },

  welcomeTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  welcomeSub: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.muted,
  },

  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  statCard: {
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

  statIcon: {
    width: 43,
    height: 43,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  statValue: {
    fontSize: isSmall ? 18 : 21,
    fontWeight: "900",
    color: COLORS.text,
  },

  statTitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
  },

  statSub: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "900",
  },

  card: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 3,
  },

  cardHeader: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  cardSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  linkText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.teal,
  },

  teacherActionRow: {
    flexDirection: "row",
    gap: 10,
  },

  teacherActionCard: {
    flex: 1,
    minHeight: 126,
    borderRadius: 20,
    backgroundColor: "#FAFCFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },

  teacherActionIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  teacherActionValue: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
  },

  teacherActionTitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
  },

  teacherActionSub: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    color: COLORS.muted,
  },

  miniList: {
    marginTop: 12,
    gap: 9,
  },

  teacherMiniCard: {
    minHeight: 66,
    borderRadius: 18,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  teacherAvatar: {
    width: 42,
    height: 42,
    borderRadius: 17,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  teacherAvatarText: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.white,
  },

  teacherInfo: {
    flex: 1,
    paddingRight: 8,
  },

  teacherName: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },

  teacherMeta: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  statusPill: {
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  pendingPill: {
    backgroundColor: COLORS.orangeSoft,
  },

  acceptedPill: {
    backgroundColor: COLORS.greenSoft,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  pendingText: {
    color: COLORS.orange,
  },

  acceptedText: {
    color: COLORS.green,
  },

  rowItem: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  rowInfo: {
    flex: 1,
    paddingRight: 8,
  },

  rowTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  rowSub: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  earningAmount: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.green,
  },

  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  studentAvatarText: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.white,
  },

  subscriptionAmountBox: {
    alignItems: "flex-end",
  },

  subscriptionAmount: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  paidText: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.green,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  emptyBox: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FAFCFF",
    padding: 16,
    alignItems: "center",
  },

  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptySub: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 16,
  },

  bottomWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },

  bottomNav: {
    minHeight: Platform.OS === "ios" ? 104 : 88,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 8,
    paddingTop: 9,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    elevation: 12,
  },

  navItem: {
    flex: 1,
    minHeight: 62,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  navItemActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  navLabel: {
    marginTop: 4,
    fontSize: isSmall ? 9 : 10,
    fontWeight: "800",
    color: COLORS.white,
  },

  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
  },

  drawerDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  drawer: {
    width: Math.min(width * 0.84, 330),
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === "ios" ? 58 : 34,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowOffset: { width: 4, height: 0 },
    shadowRadius: 18,
    elevation: 20,
  },

  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  drawerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  drawerProfile: {
    flex: 1,
  },

  drawerName: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  drawerRole: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  drawerClose: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  drawerItem: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  drawerIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  drawerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  logoutBtn: {
    marginTop: 12,
    height: 52,
    borderRadius: 16,
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
});
