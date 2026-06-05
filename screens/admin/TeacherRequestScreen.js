


// src/screens/admin/TeacherRequestScreen.js

import React, { useEffect, useMemo, useState } from "react";
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

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getInitial(name = "T") {
  return String(name || "T").trim().charAt(0).toUpperCase();
}

function normalizeText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function formatDateTime(value) {
  if (!value) return "Not available";

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

function normalizeStatus(status = "") {
  const clean = normalizeText(status);

  if (clean === "accepted" || clean === "approved" || clean === "active") {
    return "Accepted";
  }

  if (clean === "rejected" || clean === "declined") {
    return "Rejected";
  }

  return "Pending";
}

function getStatusTheme(status = "") {
  if (status === "Accepted") {
    return {
      bg: COLORS.greenSoft,
      color: COLORS.green,
      icon: "checkmark-circle-outline",
    };
  }

  if (status === "Rejected") {
    return {
      bg: COLORS.redSoft,
      color: COLORS.red,
      icon: "close-circle-outline",
    };
  }

  return {
    bg: COLORS.orangeSoft,
    color: COLORS.orange,
    icon: "time-outline",
  };
}

function getTeacherId(teacher = {}) {
  return teacher.id || teacher.teacherId || teacher.tutorId || "";
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

function getTeacherSubject(teacher = {}) {
  return teacher.subject || teacher.primarySubject || teacher.mainSubject || "General";
}

function getTeacherExperience(teacher = {}) {
  const exp = firstValue(
    teacher.experienceText,
    teacher.experience,
    teacher.yearsOfExperience,
    "0"
  );

  if (typeof exp === "number") {
    return `${exp} ${exp === 1 ? "Year" : "Years"}`;
  }

  const value = String(exp || "").trim();

  if (!value) return "0 Years";
  if (/year/i.test(value)) return value;

  return `${value} Years`;
}

function getTeacherLanguages(teacher = {}) {
  const languages = teacher.languages;

  if (Array.isArray(languages)) {
    return languages.length > 0 ? languages.join(", ") : "Not added";
  }

  return languages || teacher.language || "Not added";
}

function getTeacherPreferredClasses(teacher = {}) {
  const classes = firstValue(
    teacher.preferredClasses,
    teacher.classes,
    teacher.className,
    teacher.class,
    ""
  );

  if (Array.isArray(classes)) {
    return classes.length > 0 ? classes.join(", ") : "Not added";
  }

  return classes || "Not added";
}

function getTeacherDocumentType(teacher = {}) {
  const documents = safeArray(teacher.documents || teacher.uploadedDocuments);

  if (teacher.documentType) return teacher.documentType;
  if (documents.length > 0) return `${documents.length} document(s) uploaded`;

  const parts = [];

  if (teacher.aadhaar || teacher.aadhaarCard || teacher.idProof) {
    parts.push("ID Proof");
  }

  if (teacher.degree || teacher.degreeCertificate || teacher.qualificationProof) {
    parts.push("Qualification Proof");
  }

  if (teacher.experienceCertificate) {
    parts.push("Experience Certificate");
  }

  return parts.length > 0 ? parts.join(" + ") : "Documents not added";
}

function normalizeTeacher(teacher = {}) {
  const id = getTeacherId(teacher);
  const teacherName = getTeacherName(teacher);

  return {
    ...teacher,
    id,
    teacherId: teacher.teacherId || id,
    teacherName,
    name: teacher.name || teacherName,
    subject: getTeacherSubject(teacher),
    phone: teacher.phone || teacher.mobile || teacher.phoneNumber || "-",
    email: teacher.email || "-",
    qualification: teacher.qualification || teacher.degree || teacher.education || "Not added",
    experience: getTeacherExperience(teacher),
    location: teacher.location || teacher.city || teacher.address || "Not added",
    documentType: getTeacherDocumentType(teacher),
    appliedAt: formatDateTime(teacher.appliedAt || teacher.createdAt || teacher.updatedAt),
    rawAppliedAt: teacher.appliedAt || teacher.createdAt || teacher.updatedAt || "",
    status: normalizeStatus(teacher.status),
    rating: Number(teacher.rating || 0),
    completedSessions: Number(teacher.completedSessions || teacher.sessions || 0),
    completedDoubts: Number(teacher.completedDoubts || teacher.doubtsClarified || 0),
    earnings: Number(teacher.earnings || 0),
    preferredClasses: getTeacherPreferredClasses(teacher),
    languages: getTeacherLanguages(teacher),
    bio: teacher.bio || teacher.about || teacher.description || "No bio added.",
  };
}

function ScreenHeader({
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
        <Ionicons name={rightIcon} size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

function SearchBox({ value, onChangeText }) {
  return (
    <View style={styles.searchCard}>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={19} color={COLORS.muted} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search teacher, subject, location..."
          placeholderTextColor="#9AA4B6"
          style={styles.searchInput}
        />

        {value.length > 0 && (
          <TouchableOpacity activeOpacity={0.75} onPress={() => onChangeText("")}>
            <Ionicons name="close-circle" size={19} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function SummaryCard({ icon, title, value, sub, color, bg }) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={[styles.summarySub, { color }]}>{sub}</Text>
    </View>
  );
}

function TeacherRequestCard({ item, onPress, onAccept, onReject }) {
  const theme = getStatusTheme(item.status);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.teacherCard}
      onPress={() => onPress(item)}
    >
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
            {item.qualification}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: theme.bg }]}>
          <Ionicons name={theme.icon} size={13} color={theme.color} />
          <Text style={[styles.statusText, { color: theme.color }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.docBox}>
        <View style={styles.docRow}>
          <Ionicons name="briefcase-outline" size={16} color={COLORS.teal} />
          <Text style={styles.docText}>Experience: {item.experience}</Text>
        </View>

        <View style={styles.docRow}>
          <Ionicons name="document-text-outline" size={16} color={COLORS.teal} />
          <Text style={styles.docText}>{item.documentType}</Text>
        </View>

        <View style={styles.docRow}>
          <Ionicons name="language-outline" size={16} color={COLORS.teal} />
          <Text style={styles.docText}>{item.languages}</Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <Text style={styles.appliedText} numberOfLines={1}>
          Applied: {item.appliedAt}
        </Text>

        {item.status === "Pending" ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.rejectSmallBtn}
              onPress={(event) => {
                event?.stopPropagation?.();
                onReject(item);
              }}
            >
              <Ionicons name="close" size={15} color={COLORS.red} />
              <Text style={styles.rejectSmallText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.acceptSmallBtn}
              onPress={(event) => {
                event?.stopPropagation?.();
                onAccept(item);
              }}
            >
              <Ionicons name="checkmark" size={15} color={COLORS.white} />
              <Text style={styles.acceptSmallText}>Accept</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.openCircle}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.teal} />
          </View>
        )}
      </View>
    </TouchableOpacity>
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

function PerformanceCard({ icon, value, label, color, bg }) {
  return (
    <View style={styles.performanceCard}>
      <View style={[styles.performanceIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <Text style={styles.performanceValue}>{value}</Text>
      <Text style={styles.performanceLabel}>{label}</Text>
    </View>
  );
}

/* =====================================================
   SCREEN 1: TEACHER REQUEST SCREEN
===================================================== */

function TeacherRequestScreen({ navigation, route }) {
  const {
    tutors = [],
    updateTutorProfile,
    registerTutor,
    addNotification,
    refreshTeacherApprovals,
    approveTeacherProfile,
    rejectTeacherProfile,
  } = useAppContext();

  const routeTeachers = route?.params?.teachers;

  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("Pending");

  useEffect(() => {
    refreshTeacherApprovals?.("PENDING_APPROVAL").catch(() => {});
    refreshTeacherApprovals?.("APPROVED").catch(() => {});
    refreshTeacherApprovals?.("REJECTED").catch(() => {});
  }, [refreshTeacherApprovals]);

  const teachers = useMemo(() => {
    const source =
      safeArray(routeTeachers).length > 0 ? routeTeachers : safeArray(tutors);

    return source.map(normalizeTeacher);
  }, [routeTeachers, tutors]);

  const summary = useMemo(() => {
    const pending = teachers.filter((item) => item.status === "Pending").length;
    const accepted = teachers.filter((item) => item.status === "Accepted").length;
    const rejected = teachers.filter((item) => item.status === "Rejected").length;

    return {
      pending,
      accepted,
      rejected,
      total: teachers.length,
    };
  }, [teachers]);

  const statusTabs = useMemo(
    () => [
      { key: "Pending", label: "Pending", count: summary.pending },
      { key: "Accepted", label: "Accepted", count: summary.accepted },
      { key: "Rejected", label: "Rejected", count: summary.rejected },
      { key: "All", label: "All", count: summary.total },
    ],
    [summary]
  );

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();

    return teachers.filter((item) => {
      const statusMatch =
        activeStatus === "All" ? true : item.status === activeStatus;

      const searchMatch =
        !q ||
        String(item.teacherName || "").toLowerCase().includes(q) ||
        String(item.subject || "").toLowerCase().includes(q) ||
        String(item.location || "").toLowerCase().includes(q) ||
        String(item.status || "").toLowerCase().includes(q);

      return statusMatch && searchMatch;
    });
  }, [teachers, search, activeStatus]);

  const updateTeacherStatus = async (teacher, status) => {
    const teacherId = getTeacherId(teacher);

    const updates = {
      ...teacher,
      status: status === "Accepted" ? "accepted" : status === "Rejected" ? "rejected" : "pending",
      verified: status === "Accepted",
      approvedAt: status === "Accepted" ? new Date().toISOString() : teacher.approvedAt,
      rejectedAt: status === "Rejected" ? new Date().toISOString() : teacher.rejectedAt,
    };

    try {
      if (teacherId && status === "Accepted" && typeof approveTeacherProfile === "function") {
        await approveTeacherProfile(teacherId);
      } else if (teacherId && status === "Rejected" && typeof rejectTeacherProfile === "function") {
        await rejectTeacherProfile(teacherId);
      }
    } catch (error) {
      console.warn("Teacher approval action failed", error);
    }

    if (teacherId && typeof updateTutorProfile === "function") {
      updateTutorProfile(teacherId, updates);
    } else if (typeof registerTutor === "function") {
      registerTutor(updates);
    }

    if (typeof addNotification === "function") {
      addNotification(
        status === "Accepted" ? "Teacher Accepted" : "Teacher Rejected",
        `${teacher.teacherName} has been ${status.toLowerCase()} by admin.`,
        "admin",
        {
          teacherId,
          status,
        }
      );
    }
  };

  const acceptTeacher = async (teacher) => {
    await updateTeacherStatus(teacher, "Accepted");
  };

  const rejectTeacher = async (teacher) => {
    await updateTeacherStatus(teacher, "Rejected");
  };

  const openTeacherDetails = (teacher) => {
    navigation?.navigate?.("TeacherDetailsScreen", {
      teacher,
      teacherId: teacher.id || teacher.teacherId,
    });
  };

  const goToAcceptedTeachers = () => {
    navigation?.navigate?.("AcceptedTeachersScreen");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

      <View style={styles.screen}>
        <ScreenHeader
          navigation={navigation}
          title="Teacher Requests"
          sub="Real teacher registration data"
          onRightPress={() => setSearch("")}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="clipboard-outline" size={31} color={COLORS.teal} />
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle}>Teacher Registration Requests</Text>
              <Text style={styles.heroSub}>
                View real teacher profile information from AppContext, verify details,
                then accept or reject.
              </Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryCard
              icon="time-outline"
              title="Pending"
              value={summary.pending}
              sub="Need review"
              color={COLORS.orange}
              bg={COLORS.orangeSoft}
            />

            <SummaryCard
              icon="checkmark-circle-outline"
              title="Accepted"
              value={summary.accepted}
              sub="Approved"
              color={COLORS.green}
              bg={COLORS.greenSoft}
            />

            <SummaryCard
              icon="close-circle-outline"
              title="Rejected"
              value={summary.rejected}
              sub="Not approved"
              color={COLORS.red}
              bg={COLORS.redSoft}
            />

            <SummaryCard
              icon="people-outline"
              title="Total"
              value={summary.total}
              sub="All teachers"
              color={COLORS.teal}
              bg={COLORS.tealLight}
            />
          </View>

          <View style={styles.statusTabs}>
            {statusTabs.map((tab) => {
              const isActive = activeStatus === tab.key;

              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.86}
                  style={[styles.statusTab, isActive && styles.statusTabActive]}
                  onPress={() => setActiveStatus(tab.key)}
                >
                  <Text style={[styles.statusTabLabel, isActive && styles.statusTabLabelActive]}>
                    {tab.label}
                  </Text>
                  <View style={[styles.statusTabCount, isActive && styles.statusTabCountActive]}>
                    <Text
                      style={[
                        styles.statusTabCountText,
                        isActive && styles.statusTabCountTextActive,
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <SearchBox value={search} onChangeText={setSearch} />

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTextBox}>
              <Text style={styles.sectionTitle}>Registration Requests</Text>
              <Text style={styles.sectionSub}>
                {filteredRequests.length}{" "}
                {activeStatus === "All"
                  ? "requests"
                  : `${activeStatus.toLowerCase()} requests`}{" "}
                found
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.acceptedBtn}
              onPress={goToAcceptedTeachers}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color={COLORS.teal}
              />
              <Text style={styles.acceptedBtnText}>Accepted</Text>
            </TouchableOpacity>
          </View>

          {teachers.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={44} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No real teachers found</Text>
              <Text style={styles.emptySub}>
                Teacher registrations from AppContext will appear here. No dummy
                teacher data is used.
              </Text>
            </View>
          ) : filteredRequests.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="clipboard-outline" size={44} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No teacher requests found</Text>
              <Text style={styles.emptySub}>
                Try another search or open accepted teachers.
              </Text>
            </View>
          ) : (
            filteredRequests.map((teacher) => (
              <TeacherRequestCard
                key={teacher.id || teacher.teacherId || teacher.teacherName}
                item={teacher}
                onPress={openTeacherDetails}
                onAccept={acceptTeacher}
                onReject={rejectTeacher}
              />
            ))
          )}
        </ScrollView>

        <AdminBottomNavigation navigation={navigation} active="More" />
      </View>
    </SafeAreaView>
  );
}

/* =====================================================
   SCREEN 2: TEACHER DETAILS SCREEN
===================================================== */

function TeacherDetailsScreen({ navigation, route }) {
  const {
    tutors = [],
    updateTutorProfile,
    registerTutor,
    addNotification,
  } = useAppContext();

  const teacherFromRoute = route?.params?.teacher;
  const teacherIdFromRoute = route?.params?.teacherId;

  const [localTeacher, setLocalTeacher] = useState(
    teacherFromRoute ? normalizeTeacher(teacherFromRoute) : null
  );

  const teacher = useMemo(() => {
    const sourceTeacher =
      safeArray(tutors).find((item) => {
        const itemId = getTeacherId(item);
        return (
          String(itemId || "") === String(teacherIdFromRoute || "") ||
          String(itemId || "") === String(localTeacher?.id || "") ||
          String(itemId || "") === String(localTeacher?.teacherId || "")
        );
      }) ||
      teacherFromRoute ||
      localTeacher;

    return sourceTeacher ? normalizeTeacher(sourceTeacher) : null;
  }, [tutors, teacherFromRoute, teacherIdFromRoute, localTeacher]);

  const theme = getStatusTheme(teacher?.status);

  const updateTeacherStatus = (status) => {
    if (!teacher) return;

    const teacherId = getTeacherId(teacher);

    const updatedTeacher = {
      ...teacher,
      status: status === "Accepted" ? "accepted" : status === "Rejected" ? "rejected" : "pending",
      verified: status === "Accepted",
      approvedAt: status === "Accepted" ? new Date().toISOString() : teacher.approvedAt,
      rejectedAt: status === "Rejected" ? new Date().toISOString() : teacher.rejectedAt,
    };

    setLocalTeacher(normalizeTeacher(updatedTeacher));

    if (teacherId && typeof updateTutorProfile === "function") {
      updateTutorProfile(teacherId, updatedTeacher);
    } else if (typeof registerTutor === "function") {
      registerTutor(updatedTeacher);
    }

    if (typeof addNotification === "function") {
      addNotification(
        status === "Accepted" ? "Teacher Accepted" : "Teacher Rejected",
        `${teacher.teacherName} has been ${status.toLowerCase()} by admin.`,
        "admin",
        {
          teacherId,
          status,
        }
      );
    }
  };

  const acceptTeacher = () => {
    updateTeacherStatus("Accepted");
  };

  const rejectTeacher = () => {
    updateTeacherStatus("Rejected");
  };

  const goBackToRequests = () => {
    navigation?.navigate?.("TeacherRequestScreen");
  };

  if (!teacher) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

        <View style={styles.screen}>
          <ScreenHeader
            navigation={navigation}
            title="Teacher Details"
            sub="No teacher selected"
            rightIcon="clipboard-outline"
            onRightPress={goBackToRequests}
          />

          <View style={styles.emptyBoxFull}>
            <Ionicons name="person-outline" size={48} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No teacher data found</Text>
            <Text style={styles.emptySub}>
              Open teacher details from the real teacher request list.
            </Text>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.doneBtn}
              onPress={goBackToRequests}
            >
              <Text style={styles.doneBtnText}>Back to Requests</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

      <View style={styles.screen}>
        <ScreenHeader
          navigation={navigation}
          title="Teacher Details"
          sub="Real registration profile"
          rightIcon="clipboard-outline"
          onRightPress={goBackToRequests}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.detailHeroCard}>
            <View style={styles.detailHeroAvatar}>
              <Text style={styles.detailHeroAvatarText}>
                {getInitial(teacher.teacherName)}
              </Text>
            </View>

            <View style={styles.detailHeroInfo}>
              <Text style={styles.detailHeroName} numberOfLines={1}>
                {teacher.teacherName}
              </Text>

              <Text style={styles.detailHeroMeta} numberOfLines={1}>
                {teacher.subject} • {teacher.location}
              </Text>

              <View style={[styles.detailStatusPill, { backgroundColor: theme.bg }]}>
                <Ionicons name={theme.icon} size={14} color={theme.color} />
                <Text style={[styles.detailStatusText, { color: theme.color }]}>
                  {teacher.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.registrationInfoCard}>
            <View style={styles.registrationInfoIcon}>
              <Ionicons name="document-text-outline" size={24} color={COLORS.teal} />
            </View>

            <View style={styles.registrationInfoTextBox}>
              <Text style={styles.registrationInfoTitle}>Registration Application</Text>
              <Text style={styles.registrationInfoText}>
                This page shows the teacher profile and registration details saved
                in AppContext.
              </Text>
            </View>
          </View>

          {teacher.status === "Accepted" && (
            <View style={styles.performanceGrid}>
              <PerformanceCard
                icon="star-outline"
                value={`${teacher.rating || 0}`}
                label="Rating"
                color={COLORS.orange}
                bg={COLORS.orangeSoft}
              />

              <PerformanceCard
                icon="videocam-outline"
                value={teacher.completedSessions}
                label="Sessions"
                color={COLORS.purple}
                bg={COLORS.purpleSoft}
              />

              <PerformanceCard
                icon="chatbubble-ellipses-outline"
                value={teacher.completedDoubts}
                label="Doubts"
                color={COLORS.blue}
                bg={COLORS.blueSoft}
              />

              <PerformanceCard
                icon="cash-outline"
                value={formatMoney(teacher.earnings)}
                label="Earnings"
                color={COLORS.green}
                bg={COLORS.greenSoft}
              />
            </View>
          )}

          <View style={styles.detailsCard}>
            <Text style={styles.detailsSectionTitle}>Personal Information</Text>

            <DetailRow
              icon="person-outline"
              label="Teacher Name"
              value={teacher.teacherName}
            />
            <DetailRow icon="call-outline" label="Phone Number" value={teacher.phone} />
            <DetailRow icon="mail-outline" label="Email" value={teacher.email} />
            <DetailRow icon="location-outline" label="Location" value={teacher.location} />
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.detailsSectionTitle}>Teaching Information</Text>

            <DetailRow icon="school-outline" label="Subject" value={teacher.subject} />
            <DetailRow
              icon="ribbon-outline"
              label="Qualification"
              value={teacher.qualification}
            />
            <DetailRow
              icon="briefcase-outline"
              label="Experience"
              value={teacher.experience}
            />
            <DetailRow
              icon="people-outline"
              label="Preferred Classes"
              value={teacher.preferredClasses}
            />
            <DetailRow
              icon="language-outline"
              label="Languages"
              value={teacher.languages}
            />
            <DetailRow
              icon="information-circle-outline"
              label="About Teacher"
              value={teacher.bio}
            />
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.detailsSectionTitle}>Registration Documents</Text>

            <DetailRow
              icon="document-text-outline"
              label="Document Submitted"
              value={teacher.documentType}
            />
            <DetailRow
              icon="calendar-outline"
              label="Applied At"
              value={teacher.appliedAt}
            />
            <DetailRow
              icon="shield-checkmark-outline"
              label="Approval Status"
              value={teacher.status}
            />
          </View>

          {teacher.status === "Pending" && (
            <View style={styles.approvalActionCard}>
              <TouchableOpacity
                activeOpacity={0.86}
                style={styles.rejectBtn}
                onPress={rejectTeacher}
              >
                <Ionicons name="close-circle-outline" size={19} color={COLORS.red} />
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.86}
                style={styles.acceptBtn}
                onPress={acceptTeacher}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={19}
                  color={COLORS.white}
                />
                <Text style={styles.acceptBtnText}>Accept Teacher</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.doneBtn}
            onPress={goBackToRequests}
          >
            <Text style={styles.doneBtnText}>Back to Requests</Text>
          </TouchableOpacity>
        </ScrollView>

        <AdminBottomNavigation navigation={navigation} active="More" />
      </View>
    </SafeAreaView>
  );
}

export default TeacherRequestScreen;
export { TeacherDetailsScreen };

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

  statusTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
    marginBottom: 14,
  },

  statusTab: {
    minWidth: 88,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  statusTabActive: {
    backgroundColor: COLORS.tealLight,
    borderColor: "#BFE8E1",
  },

  statusTabLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.muted,
  },

  statusTabLabelActive: {
    color: COLORS.tealDark,
  },

  statusTabCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 6,
    backgroundColor: "#EEF3F7",
    alignItems: "center",
    justifyContent: "center",
  },

  statusTabCountActive: {
    backgroundColor: COLORS.white,
  },

  statusTabCountText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.muted,
  },

  statusTabCountTextActive: {
    color: COLORS.tealDark,
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

  sectionTextBox: {
    flex: 1,
    paddingRight: 10,
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

  acceptedBtn: {
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  acceptedBtnText: {
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

  statusBadge: {
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  docBox: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 11,
    gap: 8,
  },

  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  docText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
  },

  cardBottom: {
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  appliedText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  rejectSmallBtn: {
    height: 34,
    borderRadius: 14,
    backgroundColor: COLORS.redSoft,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  rejectSmallText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.red,
  },

  acceptSmallBtn: {
    height: 34,
    borderRadius: 14,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  acceptSmallText: {
    fontSize: 11,
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

  emptyBox: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    alignItems: "center",
  },

  emptyBoxFull: {
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

  detailHeroCard: {
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

  detailHeroAvatar: {
    width: 70,
    height: 70,
    borderRadius: 27,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  detailHeroAvatarText: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.white,
  },

  detailHeroInfo: {
    flex: 1,
  },

  detailHeroName: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  detailHeroMeta: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.muted,
  },

  detailStatusPill: {
    marginTop: 9,
    alignSelf: "flex-start",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  detailStatusText: {
    fontSize: 12,
    fontWeight: "900",
  },

  registrationInfoCard: {
    borderRadius: 18,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 13,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  registrationInfoIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  registrationInfoTextBox: {
    flex: 1,
  },

  registrationInfoTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  registrationInfoText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: COLORS.muted,
  },

  detailsCard: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 14,
  },

  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 10,
  },

  detailRow: {
    minHeight: 66,
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

  performanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  performanceCard: {
    width: "48%",
    minHeight: 108,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    marginBottom: 12,
  },

  performanceIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  performanceValue: {
    fontSize: isSmall ? 16 : 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  performanceLabel: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
  },

  approvalActionCard: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    gap: 10,
  },

  rejectBtn: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.redSoft,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  rejectBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.red,
  },

  acceptBtn: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  acceptBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.white,
  },

  doneBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 10,
  },

  doneBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.teal,
  },
});
