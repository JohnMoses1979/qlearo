

// screens/student/AcceptedTutorsScreen.js
// FULLY UPDATED — Real accepted tutors/sessions from AppContext, dummy data removed

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";

const C = {
  primary: "#078C80",
  primaryDark: "#056C63",
  primaryLight: "#E7F8F6",
  bg: "#F6F8FB",
  card: "#FFFFFF",
  text: "#07123A",
  muted: "#64748B",
  lightMuted: "#94A3B8",
  border: "#E2E8F0",
  softBorder: "#F1F5F9",
  warning: "#F59E0B",
  success: "#16A34A",
  danger: "#EF4444",
  white: "#FFFFFF",
};

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=Tutor&background=078C80&color=fff&size=200";

const safeText = (value, fallback = "") => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
};

const getInitials = (value = "T") => {
  const text = String(value || "T").trim();
  if (!text) return "T";

  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] || "T"}${parts[1][0] || ""}`.toUpperCase();
};

const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

const getReadableDate = (value) => {
  if (!value) return "Date not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getReadableTime = (value) => {
  if (!value) return "Time not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getSessionDate = (session = {}) => {
  return (
    session.rawDate ||
    session.dateValue ||
    session.sessionDate ||
    session.preferredDate ||
    session.createdAt ||
    session.date
  );
};

const getSessionTime = (session = {}) => {
  if (session.time && session.time !== "Time not selected") return session.time;

  if (session.timeStart && session.timeEnd) {
    return `${session.timeStart} – ${session.timeEnd}`;
  }

  if (session.timeStart) return session.timeStart;

  if (session.requestedTime) return session.requestedTime;

  return "Time not set";
};

const isCompletedStatus = (status = "") => {
  const clean = String(status).toLowerCase();
  return clean === "completed" || clean === "done" || clean === "finished";
};

const isLiveStatus = (status = "") => {
  const clean = String(status).toLowerCase();
  return clean === "live" || clean === "ready";
};

const resolveTutorAvatar = (item = {}, lookupTutor = null) => {
  const direct =
    item.tutorImage ||
    item.teacherAvatar ||
    item.image ||
    item.avatar ||
    item.photo ||
    null;

  if (direct) return direct;

  const tutorId = item.teacherId || item.tutorId || item.teacher?.id || item.tutor?.id || null;
  const tutor =
    typeof lookupTutor === "function" && tutorId ? lookupTutor(tutorId) : null;

  return (
    tutor?.avatar ||
    tutor?.image ||
    tutor?.photo ||
    tutor?.teacherAvatar ||
    null
  );
};

const normalizeSession = (item = {}, sourceType = "session", lookupTutor = null) => {
  const rawStatus = safeText(item.status, "upcoming");
  const completed = isCompletedStatus(rawStatus);

  const tutorName =
    item.tutorName ||
    item.teacherName ||
    item.tutor ||
    item.name ||
    "Tutor";

  const image = resolveTutorAvatar(item, lookupTutor) || DEFAULT_AVATAR;

  const canEnter =
    item.canEnter === true ||
    isLiveStatus(rawStatus) ||
    rawStatus === "ready";

  return {
    id:
      item.id ||
      item.sessionId ||
      item.requestId ||
      `${sourceType}_${Date.now()}_${Math.random()}`,
    sourceType,

    sessionId: item.sessionId || item.id || null,
    requestId: item.requestId || null,
    conversationId: item.conversationId || null,

    teacherId: item.teacherId || item.tutorId || null,
    tutorId: item.tutorId || item.teacherId || null,

    tutor: tutorName,
    tutorName,
    subject: safeText(item.subject, "General"),
    topic: safeText(item.topic, item.focus || "Class Topic"),
    focus: item.focus || item.note || "",
    rating: safeNumber(item.rating, 4.8),
    reviews: safeNumber(item.reviews, 0),

    date: item.date && !item.rawDate ? item.date : getReadableDate(getSessionDate(item)),
    rawDate: getSessionDate(item),
    time: getSessionTime(item),
    mode: completed
      ? "Completed"
      : safeText(item.mode || item.sessionType, "Live Class"),

    image,
    canEnter,
    status: completed
      ? "Completed"
      : canEnter
      ? "Ready to Join"
      : "Upcoming",

    original: item,
  };
};

const normalizeAcceptedRequest = (request = {}, lookupTutor = null) => {
  const proposal = request.proposal || {};

  const tutorName =
    request.tutorName ||
    request.teacherName ||
    request.tutor ||
    "Tutor";

  const rawDate =
    proposal.date ||
    proposal.sessionDate ||
    request.preferredDate ||
    request.date ||
    request.updatedAt ||
    request.createdAt;

  const time =
    proposal.timeSlot ||
    proposal.time ||
    request.requestedTime ||
    request.time ||
    "Time not set";

  return {
    id: request.sessionId || request.id,
    sourceType: "request",

    sessionId: request.sessionId || null,
    requestId: request.id,
    conversationId: request.conversationId || null,

    teacherId: request.teacherId || request.tutorId || null,
    tutorId: request.tutorId || request.teacherId || null,

    tutor: tutorName,
    tutorName,
    subject: safeText(request.subject, "General"),
    topic: safeText(request.topic, "Class Topic"),
    focus: request.focus || request.note || request.message || "",

    rating: safeNumber(request.rating, 4.8),
    reviews: safeNumber(request.reviews, 0),

    date: getReadableDate(rawDate),
    rawDate,
    time,
    mode: safeText(request.mode || request.sessionType, "Live Class"),

    image: resolveTutorAvatar(request, lookupTutor) || DEFAULT_AVATAR,

    canEnter: Boolean(request.sessionId),
    status: request.sessionId ? "Ready to Join" : "Accepted",

    original: request,
  };
};

export default function AcceptedTutorsScreen({ navigation }) {
  const {
    currentUser,
    sessions = [],
    studentSessions = [],
    upcomingSessions = [],
    completedSessions = [],
    acceptedTuitionRequests = [],
    studentTuitionRequests = [],
    getTutorById,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState("Upcoming");
  const [searchText, setSearchText] = useState("");
  const [avatarLoadErrorIds, setAvatarLoadErrorIds] = useState({});

  const currentStudentId = currentUser?.role === "student" ? currentUser.id : null;

  const realSessions = useMemo(() => {
    const baseSessions =
      Array.isArray(studentSessions) && studentSessions.length > 0
        ? studentSessions
        : Array.isArray(sessions)
        ? sessions
        : [];

    if (!currentStudentId) return baseSessions;

    return baseSessions.filter(
      (item) =>
        item.studentId === currentStudentId ||
        item.student === currentUser?.name ||
        item.studentName === currentUser?.name
    );
  }, [studentSessions, sessions, currentStudentId, currentUser?.name]);

  const realAcceptedRequests = useMemo(() => {
    const baseRequests =
      Array.isArray(studentTuitionRequests) && studentTuitionRequests.length > 0
        ? studentTuitionRequests
        : Array.isArray(acceptedTuitionRequests)
        ? acceptedTuitionRequests
        : [];

    return baseRequests.filter((item) => {
      const status = String(item.status || "").toLowerCase();
      const isAccepted = status === "accepted";

      if (!isAccepted) return false;

      if (!currentStudentId) return true;

      return item.studentId === currentStudentId;
    });
  }, [studentTuitionRequests, acceptedTuitionRequests, currentStudentId]);

  const upcomingData = useMemo(() => {
    const sessionItems = realSessions
      .filter((item) => !isCompletedStatus(item.status))
      .map((item) => normalizeSession(item, "session", getTutorById));

    const requestItems = realAcceptedRequests
      .filter((request) => {
        if (!request.sessionId) return true;

        const alreadyInSessions = sessionItems.some(
          (session) =>
            session.sessionId === request.sessionId ||
            session.requestId === request.id
        );

        return !alreadyInSessions;
      })
      .map((request) => normalizeAcceptedRequest(request, getTutorById));

    const merged = [...sessionItems, ...requestItems];

    return merged.sort((a, b) => {
      const dateA = new Date(a.rawDate || 0).getTime();
      const dateB = new Date(b.rawDate || 0).getTime();
      return dateA - dateB;
    });
  }, [realSessions, realAcceptedRequests, getTutorById]);

  const pastData = useMemo(() => {
    const completedFromSessions = realSessions
      .filter((item) => isCompletedStatus(item.status))
      .map((item) => normalizeSession(item, "session", getTutorById));

    const completedFromContext = Array.isArray(completedSessions)
      ? completedSessions
          .filter((item) => {
            if (!currentStudentId) return true;
            return item.studentId === currentStudentId;
          })
          .map((item) => normalizeSession(item, "session", getTutorById))
      : [];

    const map = new Map();

    [...completedFromSessions, ...completedFromContext].forEach((item) => {
      map.set(item.id, item);
    });

    return Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(a.rawDate || 0).getTime();
      const dateB = new Date(b.rawDate || 0).getTime();
      return dateB - dateA;
    });
  }, [realSessions, completedSessions, currentStudentId, getTutorById]);

  const currentData = activeTab === "Upcoming" ? upcomingData : pastData;

  const filteredData = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) return currentData;

    return currentData.filter((item) => {
      return (
        item.tutor.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.topic.toLowerCase().includes(query) ||
        item.date.toLowerCase().includes(query) ||
        item.time.toLowerCase().includes(query)
      );
    });
  }, [currentData, searchText]);

  const renderAvatar = (item) => {
    const avatarUri = item.image || DEFAULT_AVATAR;
    const avatarKey = String(item.id || item.sessionId || item.requestId || item.tutorName || "avatar");

    if (avatarLoadErrorIds[avatarKey] || !avatarUri) {
      return (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarPlaceholderText}>
            {getInitials(item.tutor || item.tutorName || "Tutor")}
          </Text>
        </View>
      );
    }

    return (
      <Image
        key={avatarUri}
        source={{ uri: avatarUri }}
        style={styles.avatar}
        onError={() =>
          setAvatarLoadErrorIds((prev) => ({
            ...prev,
            [avatarKey]: true,
          }))
        }
      />
    );
  };

  const totalUpcoming = upcomingData.length;
  const totalPast = pastData.length;

  const handleEnterSession = (session) => {
    if (!session.canEnter) return;

    navigation.navigate("SessionDetailsScreen", {
      session: session.original || session,
      acceptedTutor: session,
      sessionId: session.sessionId,
      requestId: session.requestId,
    });
  };

  const handleViewDetails = (session) => {
    navigation.navigate("SessionDetailsScreen", {
      session: session.original || session,
      acceptedTutor: session,
      sessionId: session.sessionId,
      requestId: session.requestId,
    });
  };

  const renderTab = (tab, count) => {
    const isActive = activeTab === tab;

    return (
      <TouchableOpacity
        key={tab}
        style={[styles.tab, isActive && styles.tabActive]}
        activeOpacity={0.85}
        onPress={() => {
          setActiveTab(tab);
          setSearchText("");
        }}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {tab}
        </Text>

        <View style={[styles.tabCount, isActive && styles.tabCountActive]}>
          <Text style={[styles.tabCountText, isActive && styles.tabCountTextActive]}>
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStatusBadge = (item) => {
    const isReady = item.canEnter;
    const isCompleted = item.status === "Completed";
    const isAccepted = item.status === "Accepted";

    return (
      <View
        style={[
          styles.statusBadge,
          isReady && styles.statusReady,
          isCompleted && styles.statusCompleted,
          isAccepted && styles.statusAccepted,
        ]}
      >
        <View
          style={[
            styles.statusDot,
            isReady && styles.statusDotReady,
            isCompleted && styles.statusDotCompleted,
            isAccepted && styles.statusDotAccepted,
          ]}
        />

        <Text
          style={[
            styles.statusText,
            isReady && styles.statusTextReady,
            isCompleted && styles.statusTextCompleted,
            isAccepted && styles.statusTextAccepted,
          ]}
        >
          {item.status}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }) => (
      <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.avatarWrap}>
          {renderAvatar(item)}
          <View style={item.status === "Completed" ? styles.completedDot : styles.onlineDot} />
        </View>

        <View style={styles.cardMain}>
          <View style={styles.nameRow}>
            <View style={styles.nameBlock}>
              <Text style={styles.tutorName} numberOfLines={1}>
                {item.tutor}
              </Text>
              <Text style={styles.subject} numberOfLines={1}>
                {item.subject}
              </Text>
            </View>

            {renderStatusBadge(item)}
          </View>

          <View style={styles.topicPill}>
            <MaterialCommunityIcons
              name="book-open-page-variant-outline"
              size={14}
              color={C.primary}
            />
            <Text style={styles.topicText} numberOfLines={1}>
              {item.topic}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Ionicons name="star" size={15} color={C.warning} />
          <Text style={styles.infoValue}>{item.rating}</Text>
          <Text style={styles.infoLabel}>({item.reviews})</Text>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="calendar-outline" size={15} color={C.primary} />
          <Text style={styles.infoValue} numberOfLines={1}>
            {item.date}
          </Text>
        </View>

        <View style={styles.infoBoxWide}>
          <Ionicons name="time-outline" size={15} color={C.primary} />
          <Text style={styles.infoValue} numberOfLines={1}>
            {item.time}
          </Text>
        </View>
      </View>

      <View style={styles.modeRow}>
        <View style={styles.modeBadge}>
          <MaterialCommunityIcons
            name={activeTab === "Past" ? "check-circle-outline" : "video-outline"}
            size={15}
            color={activeTab === "Past" ? C.success : C.primary}
          />
          <Text
            style={[
              styles.modeText,
              activeTab === "Past" && { color: C.success },
            ]}
          >
            {item.mode}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.detailsBtn}
          activeOpacity={0.85}
          onPress={() => handleViewDetails(item)}
        >
          <Text style={styles.detailsText}>Details</Text>
          <Ionicons name="chevron-forward" size={15} color={C.primary} />
        </TouchableOpacity>
      </View>

      {activeTab === "Upcoming" ? (
        <TouchableOpacity
          style={[styles.enterBtn, !item.canEnter && styles.enterBtnDisabled]}
          disabled={!item.canEnter}
          activeOpacity={0.9}
          onPress={() => handleEnterSession(item)}
        >
          <Ionicons
            name={item.canEnter ? "videocam" : "lock-closed-outline"}
            size={17}
            color={item.canEnter ? C.white : C.lightMuted}
          />
          <Text
            style={[
              styles.enterBtnText,
              !item.canEnter && styles.enterBtnTextDisabled,
            ]}
          >
            {item.canEnter ? "Enter Session" : "Waiting for Session"}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.reviewBtn}
          activeOpacity={0.9}
          onPress={() => handleViewDetails(item)}
        >
          <Ionicons name="document-text-outline" size={17} color={C.primary} />
          <Text style={styles.reviewBtnText}>View Session Summary</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={activeTab === "Upcoming" ? "calendar-clear-outline" : "archive-outline"}
          size={34}
          color={C.primary}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === "Upcoming"
          ? "No accepted tutors yet"
          : "No completed sessions yet"}
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === "Upcoming"
          ? "Accepted tutor sessions will appear here after a teacher accepts your request."
          : "Completed classes will appear here after your sessions are finished."}
      </Text>
    </View>
  );

  const renderHeaderContent = () => (
    <>
      <View style={styles.heroCard}>
        <View>
          <Text style={styles.heroSmall}>My Learning Sessions</Text>
          <Text style={styles.heroTitle}>Accepted Tutors</Text>
          <Text style={styles.heroSub}>
            Track real accepted tutor requests, live classes and completed sessions.
          </Text>
        </View>

        <View style={styles.heroIcon}>
          <MaterialCommunityIcons name="school-outline" size={30} color={C.white} />
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={19} color={C.lightMuted} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search tutor, subject or topic"
          placeholderTextColor={C.lightMuted}
          style={styles.searchInput}
        />

        {searchText.length > 0 ? (
          <TouchableOpacity
            onPress={() => setSearchText("")}
            style={styles.clearBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={16} color={C.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.tabRow}>
        {renderTab("Upcoming", totalUpcoming)}
        {renderTab("Past", totalPast)}
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          {activeTab === "Upcoming" ? "Upcoming Sessions" : "Past Sessions"}
        </Text>
        <Text style={styles.sectionCount}>
          {filteredData.length} {filteredData.length === 1 ? "Session" : "Sessions"}
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerIconBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={21} color={C.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Accepted Tutors</Text>
          <Text style={styles.headerSub}>Your confirmed learning sessions</Text>
        </View>

        <TouchableOpacity
          style={styles.headerIconBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("StudentNotifications")}
        >
          <Ionicons name="notifications-outline" size={21} color={C.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeaderContent}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  android: {
    elevation: 3,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 12 : 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.softBorder,
    flexDirection: "row",
    alignItems: "center",
  },

  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: C.softBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -0.2,
  },

  headerSub: {
    fontSize: 11,
    color: C.muted,
    fontWeight: "600",
    marginTop: 2,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },

  heroCard: {
    backgroundColor: C.primary,
    borderRadius: 24,
    padding: 18,
    minHeight: 132,
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
    ...shadow,
  },

  heroSmall: {
    fontSize: 12,
    color: "#CFF7F2",
    fontWeight: "800",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  heroTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: C.white,
    letterSpacing: -0.6,
  },

  heroSub: {
    marginTop: 8,
    maxWidth: 250,
    fontSize: 13,
    lineHeight: 19,
    color: "#E8FFFC",
    fontWeight: "600",
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  searchBox: {
    marginTop: 16,
    height: 50,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.softBorder,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    ...shadow,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 9,
    fontSize: 14,
    color: C.text,
    fontWeight: "600",
  },

  clearBtn: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  tabRow: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: "#EAF0F5",
    borderRadius: 18,
    padding: 5,
  },

  tab: {
    flex: 1,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  tabActive: {
    backgroundColor: C.white,
    ...shadow,
  },

  tabText: {
    fontSize: 14,
    fontWeight: "800",
    color: C.lightMuted,
  },

  tabTextActive: {
    color: C.primary,
  },

  tabCount: {
    minWidth: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#DDE7EF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 7,
  },

  tabCountActive: {
    backgroundColor: C.primaryLight,
  },

  tabCountText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.muted,
  },

  tabCountTextActive: {
    color: C.primary,
  },

  sectionRow: {
    marginTop: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -0.3,
  },

  sectionCount: {
    fontSize: 12,
    fontWeight: "800",
    color: C.primary,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.softBorder,
    ...shadow,
  },

  cardTopRow: {
    flexDirection: "row",
  },

  avatarWrap: {
    width: 66,
    height: 66,
    marginRight: 12,
  },

  avatar: {
    width: 66,
    height: 66,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#DDF4F1",
    backgroundColor: "#E2E8F0",
  },

  avatarPlaceholder: {
    width: 66,
    height: 66,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#DDF4F1",
    backgroundColor: "#EEF6FB",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarPlaceholderText: {
    fontSize: 18,
    fontWeight: "900",
    color: C.primary,
  },

  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: C.success,
    borderWidth: 2,
    borderColor: C.white,
  },

  completedDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: C.lightMuted,
    borderWidth: 2,
    borderColor: C.white,
  },

  cardMain: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  nameBlock: {
    flex: 1,
    paddingRight: 8,
  },

  tutorName: {
    fontSize: 16,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -0.2,
  },

  subject: {
    marginTop: 3,
    fontSize: 13,
    color: C.muted,
    fontWeight: "700",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  statusReady: {
    backgroundColor: "#DCFCE7",
  },

  statusCompleted: {
    backgroundColor: "#EAF8EF",
  },

  statusAccepted: {
    backgroundColor: "#FEF3C7",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: C.lightMuted,
    marginRight: 5,
  },

  statusDotReady: {
    backgroundColor: C.success,
  },

  statusDotCompleted: {
    backgroundColor: C.success,
  },

  statusDotAccepted: {
    backgroundColor: C.warning,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
    color: C.muted,
  },

  statusTextReady: {
    color: C.success,
  },

  statusTextCompleted: {
    color: C.success,
  },

  statusTextAccepted: {
    color: "#B45309",
  },

  topicPill: {
    marginTop: 10,
    alignSelf: "flex-start",
    maxWidth: "100%",
    backgroundColor: C.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  topicText: {
    marginLeft: 6,
    fontSize: 12,
    color: C.primary,
    fontWeight: "800",
  },

  infoGrid: {
    marginTop: 15,
    flexDirection: "row",
    gap: 8,
  },

  infoBox: {
    flex: 0.9,
    minHeight: 43,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: C.softBorder,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  infoBoxWide: {
    flex: 1.4,
    minHeight: 43,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: C.softBorder,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  infoValue: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "900",
    color: C.text,
    flexShrink: 1,
  },

  infoLabel: {
    marginLeft: 3,
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
  },

  modeRow: {
    marginTop: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.softBorder,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  modeText: {
    marginLeft: 6,
    fontSize: 12,
    color: C.primary,
    fontWeight: "900",
  },

  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  detailsText: {
    fontSize: 13,
    color: C.primary,
    fontWeight: "900",
  },

  enterBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  enterBtnDisabled: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: C.border,
  },

  enterBtnText: {
    marginLeft: 8,
    color: C.white,
    fontSize: 14,
    fontWeight: "900",
  },

  enterBtnTextDisabled: {
    color: C.lightMuted,
  },

  reviewBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: "#C8F1EC",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  reviewBtnText: {
    marginLeft: 8,
    color: C.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingHorizontal: 28,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 28,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "600",
  },
});
