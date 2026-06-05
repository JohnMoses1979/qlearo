

// screens/student/StudentProfileScreen.js

import React, { useMemo } from "react";
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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import StudentBottomNavigation from "../../components/StudentBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const COLORS = {
  bg: "#F2F7FF",
  white: "#FFFFFF",
  primary: "#006D6A",
  primaryLight: "#E6F5F4",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E2EBF6",
  red: "#FF4757",
  redBg: "#FFF0F1",
};

const MENU_SECTIONS = [
  {
    title: "Account",
    items: [
      {
        title: "Edit Profile",
        icon: "person-outline",
        screen: "EditProfile",
        iconBg: "#EAF5FF",
        iconColor: "#1677FF",
      },
      {
        title: "My Subscription",
        icon: "ribbon-outline",
        screen: "MySubscription",
        iconBg: "#FFF4E5",
        iconColor: "#E27800",
        badge: "Active",
      },
      {
        title: "My Payments",
        icon: "wallet-outline",
        screen: "StudentWallet",
        iconBg: "#E8F5E9",
        iconColor: "#2E8B47",
      },
    ],
  },
  {
    title: "Learning",
    items: [
      {
        title: "My Doubts",
        icon: "help-circle-outline",
        screen: "StudentMyDoubts",
        iconBg: "#F0EEFF",
        iconColor: "#7B61FF",
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      {
        title: "Settings",
        icon: "settings-outline",
        screen: "StudentSettings",
        iconBg: "#F3F6FF",
        iconColor: "#5C6BC0",
      },
      {
        title: "Notifications",
        icon: "notifications-outline",
        screen: "StudentNotification",
        iconBg: "#FFF8E1",
        iconColor: "#F9A825",
      },
      {
        title: "Help & Support",
        icon: "headset-outline",
        screen: "StudentHelpSupport",
        iconBg: "#E8F5E9",
        iconColor: "#2E7D32",
      },
    ],
  },
];

export default function StudentProfileScreen({ navigation }) {
  const {
    currentUser,
    allDoubts,
    clearLoggedInUser,
    refreshStudentProfile,
  } = useAppContext();

  const studentName = currentUser?.fullName || currentUser?.name || "Student";
  const studentEmail = currentUser?.email || "No email connected";
  const studentClass = currentUser?.className || "Class 10";
  const studentAvatar = currentUser?.avatar || currentUser?.image || null;
  const studentInitials = useMemo(
    () =>
      String(studentName)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "S",
    [studentName]
  );

  const stats = useMemo(() => {
    const totalDoubts = Array.isArray(allDoubts) ? allDoubts.length : 0;
    const answeredCount = Array.isArray(allDoubts)
      ? allDoubts.filter(
          (item) =>
            item?.answered ||
            String(item?.status || "").toLowerCase() === "answered"
        ).length
      : 0;

    return {
      totalDoubts,
      answeredCount,
      streak: currentUser?.streakLabel || "7d",
    };
  }, [allDoubts, currentUser?.streakLabel]);

  useFocusEffect(
    React.useCallback(() => {
      if (currentUser?.role === "student" && currentUser?.id) {
        refreshStudentProfile(currentUser.id).catch(() => {});
      }
    }, [currentUser?.id, currentUser?.role, refreshStudentProfile])
  );

  const handleNav = (screen) => {
    if (screen && navigation) {
      navigation.navigate(screen);
    }
  };

  const handleLogout = async () => {
    await clearLoggedInUser();
    navigation.reset({
      index: 0,
      routes: [{ name: "RoleSelectionScreen", params: { fromLogout: true } }],
    });
  };

  const goBackToHome = () => {
    navigation.navigate("StudentDashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.headerBtn} onPress={goBackToHome}>
            <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Profile</Text>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate("StudentSettings")}
          >
            <Ionicons name="settings-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHero}>
          <View style={styles.avatarWrapper}>
            {studentAvatar ? (
              <Image
                key={studentAvatar}
                source={{ uri: studentAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitials}>{studentInitials}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Ionicons name="camera" size={13} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{studentName}</Text>
          <Text style={styles.email}>{studentEmail}</Text>

          <View style={styles.roleRow}>
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons
                name="school"
                size={12}
                color={COLORS.white}
              />
              <Text style={styles.roleText}>{`Student · ${studentClass}`}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{stats.totalDoubts}</Text>
              <Text style={styles.statLabel}>Doubts Asked</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statNum}>{stats.answeredCount}</Text>
              <Text style={styles.statLabel}>Answered</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statNum}>{stats.streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>

            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.title}
                  activeOpacity={0.82}
                  style={[
                    styles.menuRow,
                    index !== section.items.length - 1 && styles.menuBorder,
                  ]}
                  onPress={() => handleNav(item.screen)}
                >
                  <View style={styles.menuLeft}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: item.iconBg },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={item.iconColor}
                      />
                    </View>

                    <Text style={styles.menuText}>{item.title}</Text>
                  </View>

                  <View style={styles.menuRight}>
                    {item.badge && (
                      <View style={styles.activeBadge}>
                        <View style={styles.activeDot} />
                        <Text style={styles.activeBadgeText}>
                          {item.badge}
                        </Text>
                      </View>
                    )}

                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={COLORS.muted}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <View style={[styles.iconBox, { backgroundColor: COLORS.redBg }]}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.red} />
          </View>

          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Qlearo v1.0.0</Text>
      </ScrollView>

      <StudentBottomNavigation navigation={navigation} active="Profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    paddingBottom: 125,
  },

  topHeader: {
    height: 56,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "android" ? 6 : 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  profileHero: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarPlaceholder: {
    backgroundColor: "#0B5B58",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.8,
  },

  editAvatarBtn: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    marginTop: 14,
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.white,
  },

  email: {
    marginTop: 3,
    fontSize: 11.5,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },

  roleRow: {
    marginTop: 8,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  roleText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.white,
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: -20,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },

  statNum: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  statLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: COLORS.muted,
    marginTop: 3,
  },

  statDivider: {
    width: 0.5,
    height: 40,
    backgroundColor: COLORS.border,
    alignSelf: "center",
  },

  section: {
    marginTop: 32,
    paddingHorizontal: 16,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },

  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  menuRow: {
    minHeight: 58,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  menuBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  menuText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  activeBadgeText: {
    fontSize: 9.5,
    fontWeight: "900",
    color: COLORS.primary,
  },

  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    height: 56,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: "#FFCDD2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 12,
  },

  logoutText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.red,
  },

  version: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },
});
