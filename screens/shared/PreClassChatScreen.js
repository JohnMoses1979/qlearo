import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import { doubtApi } from "../../services/doubtApi";
import { useLiveSessionRoom } from "../../services/useLiveSessionRoom";

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
  white: "#FFFFFF",
};

const safeText = (value, fallback = "") => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
};

const getInitials = (value = "Tutor") =>
  safeText(value, "Tutor")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "T";

const buildRoomId = (session = {}) =>
  `PRECHAT_${safeText(session.sessionId || session.id || "DEMO")}`;

const resolveAvatar = (session = {}, fallback = null) =>
  session.teacherAvatar ||
  session.tutorImage ||
  session.image ||
  session.avatar ||
  fallback ||
  null;

export default function PreClassChatScreen({ route, navigation }) {
  const { currentUser } = useAppContext();
  const routeSession = route?.params?.session || {};

  const session = useMemo(
    () => ({
      ...routeSession,
      ...route?.params,
    }),
    [route?.params, routeSession]
  );

  const roomId = useMemo(() => buildRoomId(session), [session]);
  const counterpartName = useMemo(() => {
    if ((currentUser?.role || "student") === "teacher") {
      return (
        session.studentName ||
        session.student ||
        session.learnerName ||
        "Student"
      );
    }

    return (
      session.tutor ||
      session.teacherName ||
      session.tutorName ||
      "Teacher"
    );
  }, [
    currentUser?.role,
    session.studentName,
    session.student,
    session.learnerName,
    session.tutor,
    session.teacherName,
    session.tutorName,
  ]);

  const [draft, setDraft] = useState("");
  const listRef = useRef(null);
  const [avatarError, setAvatarError] = useState(false);

  const liveRoom = useLiveSessionRoom({
    sessionId: roomId,
    currentUser,
    initialMessages: [],
    fallbackRole: currentUser?.role || "student",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd?.({ animated: true });
    }, 250);

    return () => clearTimeout(timer);
  }, [liveRoom.messages]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text) return;

    try {
      await liveRoom.sendEvent({
        type: "chat",
        text,
        senderId: currentUser?.id || "",
        senderName: currentUser?.name || "You",
        senderRole: currentUser?.role || "student",
      });

      setDraft("");

      try {
        const senderRole = safeText(currentUser?.role, "student").toLowerCase();
        const recipientRole = senderRole === "teacher" ? "student" : "teacher";
        const recipientId =
          recipientRole === "student"
            ? safeText(session.studentId || session.student?.studentId || session.student?.id || "", "")
            : safeText(session.teacherId || session.tutorId || session.teacher?.id || session.ownerTeacherId || "", "all");

        await doubtApi.createNotification({
          recipientRole,
          recipientId: recipientId || (recipientRole === "teacher" ? "all" : ""),
          title: senderRole === "teacher" ? "Teacher Message" : "Student Message",
          message: `${currentUser?.name || "Someone"}: ${text.slice(0, 120)}`,
          type: "chat",
          relatedId: roomId.replace(/^PRECHAT_/, ""),
          categoryTitle: safeText(session.subject || "", ""),
          subjectId: safeText(session.topic || "", ""),
        });
      } catch (notifyError) {
        console.warn("Chat notification failed", notifyError);
      }
    } catch (error) {
      Alert.alert("Chat Failed", error?.message || "Unable to send message.");
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = Boolean(item?.isMe);
    const text = safeText(item?.text || item?.payload?.text, "");
    if (!text) return null;

    return (
      <View style={[styles.row, isMine ? styles.rowMe : styles.rowOther]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.sender, isMine && styles.senderMe]}>
            {isMine ? "You" : safeText(item?.senderName || item?.sender || counterpartName, counterpartName)}
          </Text>
          <Text style={[styles.message, isMine && styles.messageMe]}>{text}</Text>
          <Text style={[styles.time, isMine && styles.timeMe]}>
            {safeText(item?.time, "")}
          </Text>
        </View>
      </View>
    );
  };

  const avatarUri = resolveAvatar(session);
  const title = currentUser?.role === "teacher" ? "Message Student" : "Message Teacher";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={styles.iconBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={21} color={C.text} />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {safeText(session.subject || session.topic || "Pre-class conversation", "Pre-class conversation")}
          </Text>
        </View>

        <View style={styles.iconBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={C.primary} />
        </View>
      </View>

      <View style={styles.sessionCard}>
        <View style={styles.sessionRow}>
          <View style={styles.avatarWrap}>
            {avatarUri && !avatarError ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials(counterpartName)}</Text>
              </View>
            )}
          </View>

          <View style={styles.sessionInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {counterpartName}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {safeText(session.subject || "General")} · {safeText(session.topic || "Class Topic")}
            </Text>
            <View style={styles.pill}>
              <Ionicons name="time-outline" size={12} color={C.primaryDark} />
              <Text style={styles.pillText}>
                {safeText(session.timeStart || session.time || "Flexible")}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatWrap}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 20}
      >
        <FlatList
          ref={listRef}
          data={liveRoom.messages}
          keyExtractor={(item) =>
            String(item.id || item.clientId || `${item.senderName || item.sender}-${item.createdAt || item.time || ""}`)
          }
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={28} color={C.lightMuted} />
              <Text style={styles.emptyTitle}>Start the conversation</Text>
              <Text style={styles.emptySub}>
                Say hi here. The same message will appear on the teacher side for this session.
              </Text>
            </View>
          }
        />

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type your message..."
            placeholderTextColor={C.lightMuted}
            style={styles.input}
            multiline
          />

          <TouchableOpacity
            onPress={sendMessage}
            style={styles.sendBtn}
            activeOpacity={0.9}
          >
            <Ionicons name="send" size={18} color={C.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.softBorder,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: C.softBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
  },
  headerSub: {
    marginTop: 2,
    fontSize: 11,
    color: C.muted,
    fontWeight: "600",
  },
  sessionCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: C.softBorder,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#DDE7EF",
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#DDE7EF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "900",
    color: C.text,
  },
  sessionInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
  },
  meta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
  },
  pill: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.primaryDark,
  },
  chatWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  row: {
    marginBottom: 10,
    flexDirection: "row",
  },
  rowMe: {
    justifyContent: "flex-end",
  },
  rowOther: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "84%",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  bubbleMe: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  bubbleOther: {
    backgroundColor: C.card,
    borderColor: C.softBorder,
  },
  sender: {
    fontSize: 11,
    fontWeight: "900",
    color: C.primaryDark,
    marginBottom: 4,
  },
  senderMe: {
    color: C.white,
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: C.text,
  },
  messageMe: {
    color: C.white,
  },
  time: {
    marginTop: 4,
    fontSize: 10,
    color: C.muted,
    fontWeight: "600",
  },
  timeMe: {
    color: "rgba(255,255,255,0.84)",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "900",
    color: C.text,
  },
  emptySub: {
    marginTop: 4,
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    lineHeight: 18,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingBottom: Platform.OS === "ios" ? 8 : 6,
    marginTop: 4,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.softBorder,
    backgroundColor: C.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
