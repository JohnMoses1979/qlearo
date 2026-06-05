

// screens/teacher/TeacherProfileScreen.js
// FULLY UPDATED — Teacher profile syncs edited data + save/publish tutor profile to AppContext

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { CommonActions } from "@react-navigation/native";

import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#F4F7FB",
  white: "#FFFFFF",
  primary: "#00897B",
  primaryDark: "#006D62",
  primaryLight: "#EAF8F6",
  text: "#07123A",
  muted: "#7A859F",
  border: "#E8EDF5",
  danger: "#FF4D4F",
  gold: "#FFB800",
  green: "#16A34A",
  greenLight: "#DCFCE7",
  blue: "#2563EB",
  blueLight: "#DBEAFE",
  purple: "#7C3AED",
  purpleLight: "#EDE9FE",
  orange: "#F97316",
  orangeLight: "#FFEDD5",
};

const MENU_ITEMS = [
  {
    id: "1",
    title: "Edit Profile",
    subtitle: "Update your tutor details",
    icon: "person-outline",
    screen: "TeacherEditProfile",
  },
  {
    id: "2",
    title: "Settings",
    subtitle: "Manage teaching subjects",
    icon: "book-outline",
    screen: "TeacherSettings",
  },
  {
    id: "3",
    title: "Help and Support",
    subtitle: "Certificates and verification",
    icon: "document-text-outline",
    screen: "TeacherHelpSupport",
  },
  {
    id: "4",
    title: "Earnings",
    subtitle: "View payments and income",
    icon: "wallet-outline",
    screen: "EarningsOverview",
  },
  {
    id: "5",
    title: "Change Password",
    subtitle: "Update account security",
    icon: "shield-checkmark-outline",
    screen: "TeacherForgotPassword",
  },
];

const DEFAULT_TEACHER_PROFILE = {
  id: "TEACHER_001",
  teacherId: "TEACHER_001",
  name: "Teacher",
  fullName: "Teacher",
  teacherName: "Teacher",
  role: "teacher",
  roleLabel: "Teacher",
  subject: "Subject",
  primarySubject: "Subject",
  rating: 0,
  reviews: 0,
  earnings: "0",
  solved: 0,
  experience: "",
  sessions: 0,
  fee: "Set fee",
  qualification: "",
  city: "",
  phone: "",
  email: "",
  language: "English",
  languages: ["English"],
  topics: [],
  category: ["tutor"],
  bio: "Add your tutor bio in Edit Profile.",
  image: null,
  avatar: null,
  photo: null,
  available: true,
  verified: false,
  status: "active",
};

const safeArray = (value, fallback = []) => {
  if (Array.isArray(value) && value.length > 0) return value;

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
};

const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

const getInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "T";

const getImage = (source = {}) =>
  source.image || source.avatar || source.photo || null;

const firstValue = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
};

const formatExperienceText = (value) => {
  const text = String(value ?? "").trim();

  if (!text) return "0 yrs";

  if (/^\d+(\.\d+)?$/.test(text)) {
    return `${text} yrs`;
  }

  return text
    .replace(/\byears?\b/gi, "yrs")
    .replace(/\s+/g, " ")
    .trim();
};

export default function TeacherProfileScreen({ navigation, route }) {
  const {
    currentUser,
    teacherDoubts = [],
    teacherSessions = [],
    registerTutor,
    updateTutorProfile,
    updateTutorAvailability,
    getTutorById,
    tutors = [],
    unreadNotificationsCount = 0,
    setLoggedInUser,
    clearLoggedInUser,
    refreshTeacherProfile,
  } = useAppContext();

  const updatedTeacherFromRoute =
    route?.params?.updatedTeacher ||
    route?.params?.teacher ||
    route?.params?.tutor ||
    null;
  const teacherId =
    currentUser?.teacherId ||
    currentUser?.id ||
    updatedTeacherFromRoute?.teacherId ||
    updatedTeacherFromRoute?.id ||
    DEFAULT_TEACHER_PROFILE.teacherId;

  const teacher = useMemo(() => {
    // Keep backend-backed teacher stats from currentUser.
    // Route data is only used as a fallback for edited fields.
    const solvedCount = teacherDoubts.filter(
      (item) =>
        item?.answered ||
        item?.status === "Answered" ||
        item?.status === "answered"
    ).length;
    const reviewCount = teacherDoubts.filter(
      (item) => item?.reviewAdded || Number(item?.rating || 0) > 0
    ).length;
    const averageRating = reviewCount
      ? teacherDoubts
          .filter((item) => Number(item?.rating || 0) > 0)
          .reduce((sum, item) => sum + Number(item?.rating || 0), 0) /
        teacherDoubts.filter((item) => Number(item?.rating || 0) > 0).length
      : 0;
    const sessionCount = teacherSessions.filter(
      (item) =>
        item?.teacherId === teacherId ||
        item?.tutorId === teacherId
    ).length;
    const source = {
      ...DEFAULT_TEACHER_PROFILE,
      ...(updatedTeacherFromRoute || {}),
      ...(currentUser || {}),
    };
    const computedEarnings =
      currentUser?.paidAmount ??
      currentUser?.lastPayoutAmount ??
      source.paidAmount ??
      source.lastPayoutAmount ??
      0;

    const teacherName =
      source.name ||
      source.fullName ||
      source.teacherName ||
      DEFAULT_TEACHER_PROFILE.name;

    const teacherImage = getImage(source);

    return {
      ...DEFAULT_TEACHER_PROFILE,
      ...source,
      id: teacherId,
      teacherId,
      name: teacherName,
      fullName: teacherName,
      teacherName,
      image: teacherImage,
      avatar: teacherImage,
      photo: teacherImage,
      role: "teacher",
      roleLabel:
        source.roleLabel && String(source.roleLabel).toLowerCase() === "tutor"
          ? "Teacher"
          : source.roleLabel || "Teacher",
      subject:
        source.subject ||
        source.primarySubject ||
        DEFAULT_TEACHER_PROFILE.subject,
      primarySubject:
        source.primarySubject ||
        source.subject ||
        DEFAULT_TEACHER_PROFILE.primarySubject,
      rating: safeNumber(
        currentUser?.averageRating ??
          currentUser?.rating ??
          source.averageRating ??
          source.rating ??
          averageRating,
        DEFAULT_TEACHER_PROFILE.rating
      ),
      reviews: safeNumber(
        currentUser?.reviewCount ??
          currentUser?.reviews ??
          source.reviewCount ??
          source.reviews ??
          reviewCount,
        DEFAULT_TEACHER_PROFILE.reviews
      ),
      experience: firstValue(
        currentUser?.experience,
        source.experience,
        DEFAULT_TEACHER_PROFILE.experience
      ),
      sessions: safeNumber(
        currentUser?.sessionCount ??
          currentUser?.sessions ??
          source.sessionCount ??
          source.sessions ??
          sessionCount,
        DEFAULT_TEACHER_PROFILE.sessions
      ),
      earnings: safeNumber(computedEarnings, DEFAULT_TEACHER_PROFILE.earnings),
      solved: safeNumber(
        currentUser?.doubtsSolved ??
          currentUser?.solved ??
          source.doubtsSolved ??
          source.solved ??
          solvedCount,
        DEFAULT_TEACHER_PROFILE.solved
      ),
      fee: source.fee || DEFAULT_TEACHER_PROFILE.fee,
      qualification: source.qualification || DEFAULT_TEACHER_PROFILE.qualification,
      city: source.city || DEFAULT_TEACHER_PROFILE.city,
      phone: source.phone || DEFAULT_TEACHER_PROFILE.phone,
      email: source.email || DEFAULT_TEACHER_PROFILE.email,
      bio: source.bio || DEFAULT_TEACHER_PROFILE.bio,
      topics: safeArray(source.topics, DEFAULT_TEACHER_PROFILE.topics),
      category: safeArray(source.category, DEFAULT_TEACHER_PROFILE.category),
      languages: safeArray(source.languages, DEFAULT_TEACHER_PROFILE.languages),
      available: source.available !== false,
      verified: source.verified !== false,
      status: source.status || "active",
    };
  }, [currentUser, teacherDoubts, teacherSessions, updatedTeacherFromRoute]);

  useEffect(() => {
    if (currentUser?.role === "teacher" && teacherId && typeof refreshTeacherProfile === "function") {
      refreshTeacherProfile(teacherId).catch(() => {});
    }
  }, [currentUser?.role, refreshTeacherProfile, teacherId]);

  useEffect(() => {
    if (!currentUser && typeof setLoggedInUser === "function") {
      setLoggedInUser({
        ...DEFAULT_TEACHER_PROFILE,
        role: "teacher",
      });
    }
  }, [currentUser, setLoggedInUser]);

  const existingTutor = useMemo(() => {
    if (typeof getTutorById === "function") {
      return getTutorById(teacher.teacherId);
    }

    return (
      tutors.find(
        (item) =>
          item.id === teacher.teacherId || item.teacherId === teacher.teacherId
      ) || null
    );
  }, [getTutorById, teacher.teacherId, tutors]);

  const [available, setAvailable] = useState(
    existingTutor?.available ?? teacher.available ?? true
  );

  const [published, setPublished] = useState(Boolean(existingTutor));

  useEffect(() => {
    setAvailable(existingTutor?.available ?? teacher.available ?? true);
    setPublished(Boolean(existingTutor));
  }, [existingTutor, teacher.available]);

  const tutorPayload = useMemo(
    () => ({
      id: teacher.teacherId,
      teacherId: teacher.teacherId,
      name: teacher.name,
      teacherName: teacher.name,
      fullName: teacher.name,
      role: "teacher",
      roleLabel: "Teacher",
      subject: teacher.subject,
      primarySubject: teacher.primarySubject,
      category: teacher.category,
      rating: teacher.rating,
      reviews: teacher.reviews,
      experience: teacher.experience,
      available,
      image: teacher.image,
      avatar: teacher.image,
      photo: teacher.image,
      sessions: teacher.sessions,
      bio: teacher.bio,
      topics: teacher.topics,
      languages: teacher.languages,
      qualification: teacher.qualification,
      fee: teacher.fee,
      phone: teacher.phone,
      email: teacher.email,
      city: teacher.city,
      verified: teacher.verified,
      status: "active",
      updatedAt: new Date().toISOString(),
    }),
    [teacher, available]
  );

  const saveAndPublishTutor = (showAlert = true) => {
    const payload = {
      ...tutorPayload,
      available,
      updatedAt: new Date().toISOString(),
    };

    if (typeof setLoggedInUser === "function") {
      setLoggedInUser(payload);
    }

    if (typeof updateTutorProfile === "function") {
      updateTutorProfile(teacher.teacherId, payload);
    }

    if (typeof registerTutor === "function") {
      registerTutor(payload);
    }

    if (typeof updateTutorAvailability === "function") {
      updateTutorAvailability(teacher.teacherId, available);
    }

    setPublished(true);

    if (showAlert) {
      global.showAlert(
        "Saved & Published",
        "Your teacher profile is saved and visible to students."
      );
    }

    return payload;
  };

  const handlePublishTutor = () => {
    saveAndPublishTutor(true);
  };

  const handleToggleAvailability = () => {
    const next = !available;
    setAvailable(next);

    const payload = {
      ...tutorPayload,
      available: next,
      updatedAt: new Date().toISOString(),
    };

    if (typeof setLoggedInUser === "function") {
      setLoggedInUser(payload);
    }

    if (typeof updateTutorAvailability === "function") {
      updateTutorAvailability(teacher.teacherId, next);
    }

    if (typeof updateTutorProfile === "function") {
      updateTutorProfile(teacher.teacherId, payload);
    }
  };

  const handleMenuPress = (item) => {
    if (item.screen) {
      navigation?.navigate?.(item.screen, {
        teacher,
        tutor: tutorPayload,
      });
    }
  };

  const handleLogout = async () => {
    if (typeof clearLoggedInUser === "function") {
      await clearLoggedInUser();
    }

    const rootNavigation = navigation?.getParent?.() || navigation;

    rootNavigation?.dispatch?.(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "RoleSelectionScreen", params: { fromLogout: true } }],
      })
    ) ||
      rootNavigation?.reset?.({
        index: 0,
        routes: [{ name: "RoleSelectionScreen", params: { fromLogout: true } }],
      });
  };

  const handlePreviewInStudent = () => {
    saveAndPublishTutor(false);
    navigation?.navigate?.("StudentTutorsScreen", {
      tutor: {
        ...tutorPayload,
        available,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.bg} barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.headerBtn}
            onPress={() => navigation?.goBack?.()}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.headerTextBox}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerSub}>Teacher account</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.headerBtn}
            onPress={() => navigation?.navigate?.("TeacherNotification")}
          >
            <Feather name="bell" size={20} color={COLORS.text} />
            {unreadNotificationsCount > 0 ? (
              <View style={styles.notificationDot}>
                <Text style={styles.notificationCount}>
                  {unreadNotificationsCount > 9
                    ? "9+"
                    : unreadNotificationsCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {teacher.image ? (
              <Image source={{ uri: teacher.image }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarFallbackText}>
                  {getInitials(teacher.name)}
                </Text>
              </View>
            )}

            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={14} color={COLORS.white} />
            </View>
          </View>

          <View style={styles.publishPill}>
            <View
              style={[
                styles.publishDot,
                { backgroundColor: published ? COLORS.green : COLORS.gold },
              ]}
            />
            <Text
              style={[
                styles.publishPillText,
                { color: published ? COLORS.green : "#B7791F" },
              ]}
            >
              {published ? "Visible to Students" : "Not Published"}
            </Text>
          </View>

          <Text numberOfLines={1} style={styles.name}>
            {teacher.name}
          </Text>

          <Text style={styles.role}>{teacher.roleLabel || "Teacher"}</Text>

          <View style={styles.subjectBadge}>
            <Ionicons name="book-outline" size={15} color={COLORS.primary} />
            <Text style={styles.subjectBadgeText}>{teacher.subject}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color={COLORS.gold} />
            <Text style={styles.rating}>{teacher.rating}</Text>
            <Text style={styles.reviewText}>{teacher.reviews} Reviews</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.editButton}
              onPress={() =>
                navigation?.navigate?.("TeacherEditProfile", {
                  teacher,
                  tutor: tutorPayload,
                })
              }
            >
              <Ionicons name="create-outline" size={18} color={COLORS.white} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.availabilityBtn,
                available ? styles.availableBtn : styles.unavailableBtn,
              ]}
              onPress={handleToggleAvailability}
            >
              <Ionicons
                name={available ? "radio-button-on" : "radio-button-off"}
                size={18}
                color={available ? COLORS.green : COLORS.danger}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tutorPublishCard}>
          <View style={styles.tutorPublishTop}>
            <View style={styles.tutorPublishIcon}>
              <MaterialCommunityIcons
                name="account-school-outline"
                size={26}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.tutorPublishTextBox}>
              <Text style={styles.tutorPublishTitle}>Student Teacher Listing</Text>
              <Text style={styles.tutorPublishSub}>
                Save and publish this profile to show it in StudentTutorsScreen.
              </Text>
            </View>
          </View>

          <View style={styles.tutorInfoGrid}>
            <View style={styles.tutorInfoChip}>
              <Text style={styles.tutorInfoValue}>
                {formatExperienceText(teacher.experience)}
              </Text>
              <Text style={styles.tutorInfoLabel}>Experience</Text>
            </View>

            <View style={styles.tutorInfoChip}>
              <Text style={styles.tutorInfoValue}>{teacher.sessions}</Text>
              <Text style={styles.tutorInfoLabel}>Sessions</Text>
            </View>

            <View style={styles.tutorInfoChip}>
              <Text numberOfLines={1} style={styles.tutorInfoValue}>
                {teacher.fee}
              </Text>
              <Text style={styles.tutorInfoLabel}>Fee</Text>
            </View>
          </View>

          <View style={styles.topicWrap}>
            {teacher.topics.slice(0, 5).map((topic) => (
              <View key={topic} style={styles.topicChip}>
                <Text style={styles.topicChipText}>{topic}</Text>
              </View>
            ))}
          </View>

          <View style={styles.publishActions}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.publishButton}
              onPress={handlePublishTutor}
            >
              <Ionicons name="cloud-upload-outline" size={18} color={COLORS.white} />
              <Text style={styles.publishButtonText}>
                {published ? "Save & Update Listing" : "Save & Publish"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.previewButton}
              onPress={handlePreviewInStudent}
            >
              <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
              <Text style={styles.previewButtonText}>Preview</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bioCard}>
          <View style={styles.bioHeader}>
            <View style={styles.bioIcon}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.bioTitle}>Teacher Bio</Text>
          </View>

          <Text style={styles.bioText}>{teacher.bio}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="location-outline" size={14} color={COLORS.primary} />
              <Text style={styles.metaText}>{teacher.city}</Text>
            </View>

            <View style={styles.metaChip}>
              <Ionicons name="language-outline" size={14} color={COLORS.primary} />
              <Text style={styles.metaText}>{teacher.languages.join(", ")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={[
                styles.menuItem,
                index !== MENU_ITEMS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.border,
                },
              ]}
              onPress={() => handleMenuPress(item)}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name={item.icon} size={22} color={COLORS.primary} />
                </View>

                <View style={styles.menuTextBox}>
                  <Text numberOfLines={1} style={styles.menuTitle}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.menuSubtitle}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.logoutCard}
          onPress={handleLogout}
        >
          <View style={styles.logoutIconBox}>
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color={COLORS.danger}
            />
          </View>

          <View style={styles.logoutTextBox}>
            <Text style={styles.logoutText}>Logout</Text>
            <Text style={styles.logoutSub}>Exit from teacher account</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <TeacherBottomNavigation navigation={navigation} active="Profile" />
    </SafeAreaView>
  );
}

const AVATAR_SIZE = width < 380 ? 95 : 110;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 14 : 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTextBox: {
    alignItems: "center",
  },

  headerTitle: {
    fontSize: width < 380 ? 20 : 22,
    fontWeight: "900",
    color: COLORS.text,
  },

  headerSub: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  headerBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
  },

  notificationDot: {
    minWidth: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    position: "absolute",
    top: 8,
    right: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: COLORS.white,
  },

  notificationCount: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "900",
  },

  profileCard: {
    marginHorizontal: 18,
    marginTop: 70,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    alignItems: "center",
    paddingTop: 65,
    paddingBottom: 24,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
  },

  avatarWrapper: {
    position: "absolute",
    top: -55,
  },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 5,
    borderColor: COLORS.white,
    backgroundColor: COLORS.primaryLight,
  },

  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  avatarFallbackText: {
    color: COLORS.primary,
    fontSize: 34,
    fontWeight: "900",
  },

  verifiedBadge: {
    width: 30,
    height: 30,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 2,
    right: 2,
    borderWidth: 3,
    borderColor: COLORS.white,
  },

  publishPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },

  publishDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  publishPillText: {
    fontSize: 11,
    fontWeight: "900",
  },

  name: {
    fontSize: width < 380 ? 26 : 30,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  role: {
    marginTop: 6,
    fontSize: width < 380 ? 15 : 17,
    fontWeight: "700",
    color: COLORS.primary,
  },

  subjectBadge: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  subjectBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "900",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  rating: {
    marginLeft: 6,
    fontSize: width < 380 ? 18 : 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  reviewText: {
    marginLeft: 10,
    fontSize: width < 380 ? 14 : 15,
    fontWeight: "600",
    color: COLORS.muted,
  },

  actionRow: {
    marginTop: 22,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  editButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  editButtonText: {
    marginLeft: 8,
    fontSize: width < 380 ? 15 : 16,
    fontWeight: "800",
    color: COLORS.white,
  },

  availabilityBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  availableBtn: {
    backgroundColor: COLORS.greenLight,
    borderColor: "#BBF7D0",
  },

  unavailableBtn: {
    backgroundColor: "#FFF1F1",
    borderColor: "#FECACA",
  },

  tutorPublishCard: {
    marginHorizontal: 18,
    marginTop: 22,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  tutorPublishTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  tutorPublishIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  tutorPublishTextBox: {
    flex: 1,
  },

  tutorPublishTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  tutorPublishSub: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "600",
    lineHeight: 18,
  },

  tutorInfoGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },

  tutorInfoChip: {
    flex: 1,
    minHeight: 64,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  tutorInfoValue: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  tutorInfoLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.muted,
  },

  topicWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 15,
  },

  topicChip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  topicChipText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "800",
  },

  publishActions: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
  },

  publishButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  publishButtonText: {
    marginLeft: 7,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  previewButton: {
    width: 96,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: "#BEEBE6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  previewButtonText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  bioCard: {
    marginHorizontal: 18,
    marginTop: 22,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  bioHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  bioIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  bioTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "900",
  },

  bioText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: "600",
    lineHeight: 20,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 13,
  },

  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  metaText: {
    marginLeft: 5,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  menuContainer: {
    marginHorizontal: 18,
    marginTop: 22,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  menuItem: {
    minHeight: 82,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  menuIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  menuTextBox: {
    marginLeft: 14,
    flex: 1,
  },

  menuTitle: {
    fontSize: width < 380 ? 15 : 17,
    fontWeight: "800",
    color: COLORS.text,
  },

  menuSubtitle: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
  },

  logoutCard: {
    marginHorizontal: 18,
    marginTop: 22,
    height: 84,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  logoutIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFF1F1",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutTextBox: {
    marginLeft: 14,
  },

  logoutText: {
    fontSize: width < 380 ? 18 : 20,
    fontWeight: "900",
    color: COLORS.danger,
  },

  logoutSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },
});
