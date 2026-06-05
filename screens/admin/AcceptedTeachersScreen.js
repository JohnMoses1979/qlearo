
// src/screens/admin/AcceptedTeachersScreen.js

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  orange: "#F97316",
  orangeSoft: "#FFEDD5",
  blue: "#2563EB",
  blueSoft: "#DBEAFE",
  purple: "#7C3AED",
  purpleSoft: "#EDE9FE",
  red: "#EF4444",
  redSoft: "#FEE2E2",
  shadow: "rgba(0,0,0,0.10)",
};

const FALLBACK_TEACHERS = [
  {
    id: "TEACHER_001",
    teacherName: "Neha Iyer",
    subject: "Biology",
    phone: "+91 99887 76655",
    email: "neha.bio@gmail.com",
    qualification: "M.Sc Biology",
    experience: "6 Years",
    location: "Chennai",
    documentType: "Aadhaar + Degree Certificate",
    appliedAt: "Yesterday, 6:10 PM",
    status: "Accepted",
    rating: 4.8,
    completedSessions: 0,
    completedDoubts: 0,
    earnings: 0,
    mockTests: 2,
    studentsHelped: 18,
    activeCourses: 1,
    lastActive: "Today, 10:15 AM",
    bio: "Biology teacher for school exams, NEET foundation, and doubt solving.",
  },
  {
    id: "TEACHER_002",
    teacherName: "Sameer Khan",
    subject: "Coding",
    phone: "+91 93456 77889",
    email: "sameer.coding@gmail.com",
    qualification: "B.Tech Computer Science",
    experience: "7 Years",
    location: "Pune",
    documentType: "Aadhaar + Degree Certificate",
    appliedAt: "25 May, 4:30 PM",
    status: "Accepted",
    rating: 4.7,
    completedSessions: 12,
    completedDoubts: 45,
    earnings: 9200,
    mockTests: 5,
    studentsHelped: 64,
    activeCourses: 3,
    lastActive: "Today, 9:20 AM",
    bio: "Coding mentor for JavaScript, React Native, Python and web development.",
  },
];

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getInitial(name = "T") {
  return String(name || "T").trim().charAt(0).toUpperCase();
}

function getAcceptedTeachers(routeTeachers) {
  const source =
    Array.isArray(routeTeachers) && routeTeachers.length > 0
      ? routeTeachers
      : FALLBACK_TEACHERS;

  return source.filter((item) => item.status === "Accepted");
}

function Header({ navigation, title, sub, rightIcon = "refresh-outline", onRightPress }) {
  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation?.navigate?.("AdminDashboard");
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity activeOpacity={0.85} style={styles.headerBtn} onPress={goBackSafe}>
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

      <TouchableOpacity activeOpacity={0.85} style={styles.headerBtn} onPress={onRightPress}>
        <Ionicons name={rightIcon} size={23} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

function SummaryCard({ icon, title, value, sub, color, bg }) {
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

      <Text style={[styles.summarySub, { color }]} numberOfLines={1}>
        {sub}
      </Text>
    </View>
  );
}

function TeacherCard({ item, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.88} style={styles.teacherCard} onPress={() => onPress(item)}>
      <View style={styles.teacherTop}>
        <View style={styles.teacherAvatar}>
          <Text style={styles.teacherAvatarText}>{getInitial(item.teacherName)}</Text>
        </View>

        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName} numberOfLines={1}>
            {item.teacherName}
          </Text>

          <Text style={styles.teacherMeta} numberOfLines={1}>
            {item.subject} • {item.location}
          </Text>

          <Text style={styles.teacherSub} numberOfLines={1}>
            ⭐ {item.rating || 4.8} • {item.experience}
          </Text>
        </View>

        <View style={styles.acceptedBadge}>
          <Ionicons name="checkmark-circle-outline" size={13} color={COLORS.green} />
          <Text style={styles.acceptedText}>Accepted</Text>
        </View>
      </View>

      <View style={styles.performanceBox}>
        <View style={styles.performanceItem}>
          <Text style={styles.performanceValue}>{item.completedSessions || 0}</Text>
          <Text style={styles.performanceLabel}>Sessions</Text>
        </View>

        <View style={styles.performanceDivider} />

        <View style={styles.performanceItem}>
          <Text style={styles.performanceValue}>{item.completedDoubts || 0}</Text>
          <Text style={styles.performanceLabel}>Doubts</Text>
        </View>

        <View style={styles.performanceDivider} />

        <View style={styles.performanceItem}>
          <Text style={styles.performanceValue}>{formatMoney(item.earnings || 0)}</Text>
          <Text style={styles.performanceLabel}>Earnings</Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <Text style={styles.activeText} numberOfLines={1}>
          Tap to manage this teacher
        </Text>

        <View style={styles.openCircle}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.teal} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ManageStatCard({ icon, title, value, sub, color, bg }) {
  return (
    <View style={styles.manageStatCard}>
      <View style={[styles.manageStatIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <Text style={styles.manageStatValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.manageStatTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.manageStatSub, { color }]} numberOfLines={1}>
        {sub}
      </Text>
    </View>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={COLORS.teal} />
      </View>

      <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || "-"}</Text>
      </View>
    </View>
  );
}

function ActionButton({ icon, title, sub, color, bg, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>

      <View style={styles.actionInfo}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSub}>{sub}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
    </TouchableOpacity>
  );
}

/* SCREEN 1: ACCEPTED TEACHERS LIST */

function AcceptedTeachersScreen({ navigation, route }) {
  const routeTeachers = route?.params?.teachers;

  const acceptedTeachers = useMemo(
    () => getAcceptedTeachers(routeTeachers),
    [routeTeachers]
  );

  const [search, setSearch] = useState("");

  const summary = useMemo(() => {
    const sessions = acceptedTeachers.reduce(
      (sum, item) => sum + Number(item.completedSessions || 0),
      0
    );

    const doubts = acceptedTeachers.reduce(
      (sum, item) => sum + Number(item.completedDoubts || 0),
      0
    );

    const earnings = acceptedTeachers.reduce(
      (sum, item) => sum + Number(item.earnings || 0),
      0
    );

    return {
      teachers: acceptedTeachers.length,
      sessions,
      doubts,
      earnings,
    };
  }, [acceptedTeachers]);

  const filteredTeachers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return acceptedTeachers;

    return acceptedTeachers.filter(
      (item) =>
        String(item.teacherName || "").toLowerCase().includes(q) ||
        String(item.subject || "").toLowerCase().includes(q) ||
        String(item.location || "").toLowerCase().includes(q)
    );
  }, [acceptedTeachers, search]);

  const openTeacherManage = (teacher) => {
    navigation?.navigate?.("AcceptedTeacherManageScreen", {
      teacher,
      teachers: acceptedTeachers,
    });
  };

  const goToRequests = () => {
    navigation?.navigate?.("TeacherRequestScreen", {
      teachers: routeTeachers || acceptedTeachers,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

      <View style={styles.screen}>
        <Header
          navigation={navigation}
          title="Accepted Teachers"
          sub="Approved teacher accounts"
          onRightPress={() => setSearch("")}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="checkmark-circle-outline" size={31} color={COLORS.teal} />
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle}>Approved Teachers</Text>
              <Text style={styles.heroSub}>
                Only accepted teachers are visible here.
              </Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryCard
              icon="people-outline"
              title="Teachers"
              value={summary.teachers}
              sub="Approved"
              color={COLORS.teal}
              bg={COLORS.tealLight}
            />

            <SummaryCard
              icon="videocam-outline"
              title="Sessions"
              value={summary.sessions}
              sub="Completed"
              color={COLORS.purple}
              bg={COLORS.purpleSoft}
            />

            <SummaryCard
              icon="chatbubble-ellipses-outline"
              title="Doubts"
              value={summary.doubts}
              sub="Solved"
              color={COLORS.blue}
              bg={COLORS.blueSoft}
            />

            <SummaryCard
              icon="cash-outline"
              title="Earnings"
              value={formatMoney(summary.earnings)}
              sub="Total"
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
                placeholder="Search accepted teacher..."
                placeholderTextColor="#9AA4B6"
                style={styles.searchInput}
              />

              {search.length > 0 && (
                <TouchableOpacity activeOpacity={0.75} onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={19} color={COLORS.muted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Accepted Teachers</Text>
              <Text style={styles.sectionSub}>{filteredTeachers.length} teachers found</Text>
            </View>

            <TouchableOpacity activeOpacity={0.86} style={styles.requestBtn} onPress={goToRequests}>
              <Ionicons name="clipboard-outline" size={17} color={COLORS.teal} />
              <Text style={styles.requestBtnText}>Requests</Text>
            </TouchableOpacity>
          </View>

          {filteredTeachers.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={44} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No accepted teachers</Text>
              <Text style={styles.emptySub}>Accept teacher requests to show them here.</Text>
            </View>
          ) : (
            filteredTeachers.map((teacher) => (
              <TeacherCard key={teacher.id} item={teacher} onPress={openTeacherManage} />
            ))
          )}
        </ScrollView>

        <AdminBottomNavigation navigation={navigation} active="More" />
      </View>
    </SafeAreaView>
  );
}

/* SCREEN 2: MANAGE ACCEPTED TEACHER */

function AcceptedTeacherManageScreen({ navigation, route }) {
  const teacher = route?.params?.teacher || FALLBACK_TEACHERS[0];
  const teachers = route?.params?.teachers || FALLBACK_TEACHERS;

  const goBackToAccepted = () => {
    navigation?.navigate?.("AcceptedTeachersScreen", {
      teachers,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

      <View style={styles.screen}>
        <Header
          navigation={navigation}
          title="Manage Teacher"
          sub="Teacher performance and access"
          rightIcon="checkmark-circle-outline"
          onRightPress={goBackToAccepted}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.manageHeroCard}>
            <View style={styles.manageAvatar}>
              <Text style={styles.manageAvatarText}>{getInitial(teacher.teacherName)}</Text>
            </View>

            <View style={styles.manageHeroInfo}>
              <Text style={styles.manageName} numberOfLines={1}>
                {teacher.teacherName}
              </Text>
              <Text style={styles.manageMeta} numberOfLines={1}>
                {teacher.subject} • {teacher.location}
              </Text>

              <View style={styles.manageBadge}>
                <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.green} />
                <Text style={styles.manageBadgeText}>Accepted Teacher</Text>
              </View>
            </View>
          </View>

          <View style={styles.manageStatsGrid}>
            <ManageStatCard
              icon="star-outline"
              title="Rating"
              value={teacher.rating || 4.8}
              sub="Teacher score"
              color={COLORS.orange}
              bg={COLORS.orangeSoft}
            />

            <ManageStatCard
              icon="videocam-outline"
              title="Sessions"
              value={teacher.completedSessions || 0}
              sub="Completed"
              color={COLORS.purple}
              bg={COLORS.purpleSoft}
            />

            <ManageStatCard
              icon="chatbubble-ellipses-outline"
              title="Doubts"
              value={teacher.completedDoubts || 0}
              sub="Solved"
              color={COLORS.blue}
              bg={COLORS.blueSoft}
            />

            <ManageStatCard
              icon="cash-outline"
              title="Earnings"
              value={formatMoney(teacher.earnings || 0)}
              sub="Total"
              color={COLORS.green}
              bg={COLORS.greenSoft}
            />
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Teacher Information</Text>

            <DetailRow icon="person-outline" label="Teacher Name" value={teacher.teacherName} />
            <DetailRow icon="school-outline" label="Subject" value={teacher.subject} />
            <DetailRow icon="call-outline" label="Phone Number" value={teacher.phone} />
            <DetailRow icon="mail-outline" label="Email" value={teacher.email} />
            <DetailRow icon="location-outline" label="Location" value={teacher.location} />
            <DetailRow icon="ribbon-outline" label="Qualification" value={teacher.qualification} />
            <DetailRow icon="briefcase-outline" label="Experience" value={teacher.experience} />
            <DetailRow icon="document-text-outline" label="Document" value={teacher.documentType} />
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Manage Actions</Text>

            <ActionButton
              icon="wallet-outline"
              title="View Payout"
              sub="Check this teacher payout details"
              color={COLORS.green}
              bg={COLORS.greenSoft}
              onPress={() =>
                navigation?.navigate?.("AdminTeacherPayouts", {
                  teacher,
                })
              }
            />

            <ActionButton
              icon="cash-outline"
              title="View Earnings"
              sub="See session, doubt and mock test earnings"
              color={COLORS.blue}
              bg={COLORS.blueSoft}
              onPress={() =>
                navigation?.navigate?.("AdminTeacherEarnings", {
                  teacher,
                })
              }
            />

            <ActionButton
              icon="notifications-outline"
              title="Send Notice"
              sub="Send admin notice to this teacher"
              color={COLORS.orange}
              bg={COLORS.orangeSoft}
              onPress={() =>
                navigation?.navigate?.("AdminNotifications", {
                  teacher,
                })
              }
            />

            <ActionButton
              icon="person-circle-outline"
              title="Teacher Profile"
              sub="Open full teacher profile"
              color={COLORS.purple}
              bg={COLORS.purpleSoft}
              onPress={() =>
                navigation?.navigate?.("TeacherDetailsScreen", {
                  teacher,
                  teachers,
                })
              }
            />
          </View>

          <TouchableOpacity activeOpacity={0.86} style={styles.backBtn} onPress={goBackToAccepted}>
            <Ionicons name="arrow-back" size={19} color={COLORS.teal} />
            <Text style={styles.backBtnText}>Back to Accepted Teachers</Text>
          </TouchableOpacity>
        </ScrollView>

        <AdminBottomNavigation navigation={navigation} active="More" />
      </View>
    </SafeAreaView>
  );
}

export default AcceptedTeachersScreen;
export { AcceptedTeacherManageScreen };

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
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 3,
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  heroInfo: {
    flex: 1,
  },

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
    fontSize: isSmall ? 18 : 21,
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

  requestBtn: {
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  requestBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.teal,
  },

  teacherCard: {
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

  teacherTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  teacherAvatar: {
    width: 46,
    height: 46,
    borderRadius: 20,
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

  teacherInfo: {
    flex: 1,
    paddingRight: 8,
  },

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

  teacherSub: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal,
  },

  acceptedBadge: {
    borderRadius: 15,
    backgroundColor: COLORS.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  acceptedText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.green,
  },

  performanceBox: {
    marginTop: 13,
    borderRadius: 18,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  performanceItem: {
    flex: 1,
    alignItems: "center",
  },

  performanceValue: {
    fontSize: isSmall ? 13 : 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  performanceLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.muted,
  },

  performanceDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#C9E8E3",
  },

  cardBottom: {
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  activeText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  openCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyBox: {
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

  manageHeroCard: {
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 3,
  },

  manageAvatar: {
    width: 70,
    height: 70,
    borderRadius: 27,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  manageAvatarText: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.white,
  },

  manageHeroInfo: {
    flex: 1,
  },

  manageName: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  manageMeta: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.muted,
  },

  manageBadge: {
    marginTop: 9,
    alignSelf: "flex-start",
    borderRadius: 15,
    backgroundColor: COLORS.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  manageBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.green,
  },

  manageStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  manageStatCard: {
    width: "48%",
    minHeight: 112,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    marginBottom: 12,
  },

  manageStatIcon: {
    width: 43,
    height: 43,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  manageStatValue: {
    fontSize: isSmall ? 17 : 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  manageStatTitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
  },

  manageStatSub: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "900",
  },

  detailsCard: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 14,
  },

  detailsTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 11,
  },

  detailRow: {
    minHeight: 64,
    borderRadius: 17,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 12,
    paddingVertical: 10,
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

  detailInfo: {
    flex: 1,
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

  actionButton: {
    minHeight: 68,
    borderRadius: 18,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  actionInfo: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  actionSub: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  backBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  backBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.teal,
  },
});