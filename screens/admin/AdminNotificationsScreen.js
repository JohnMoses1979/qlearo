import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminBottomNavigation from "../../components/AdminBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const COLORS = {
  bg: "#F6FAFB",
  white: "#FFFFFF",
  teal: "#00796B",
  tealDark: "#006A60",
  tealLight: "#E6F5F3",
  text: "#07123A",
  muted: "#6E7891",
  border: "#E4EBF2",
  unread: "#E8FFF9",
  shadow: "rgba(0,0,0,0.10)",
};

const typeMeta = {
  general: { icon: "notifications-outline", color: COLORS.teal, bg: COLORS.tealLight },
  payment: { icon: "cash-outline", color: "#2563EB", bg: "#DBEAFE" },
  teacher: { icon: "people-outline", color: "#7C3AED", bg: "#EDE9FE" },
  student: { icon: "school-outline", color: "#059669", bg: "#DCFCE7" },
  session: { icon: "videocam-outline", color: "#F97316", bg: "#FFEDD5" },
};

const formatDate = (value) => {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminNotificationsScreen({ navigation, route }) {
  const { unreadNotifications = [], notifications = [], markNotificationRead, markAllNotificationsRead } =
    useAppContext();

  const data = useMemo(() => {
    const combined = notifications.length > 0 ? notifications : unreadNotifications;
    return [...combined].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [notifications, unreadNotifications]);

  const unreadCount = useMemo(
    () => data.filter((item) => !item.read).length,
    [data]
  );

  const renderItem = ({ item }) => {
    const meta = typeMeta[item.type] || typeMeta.general;
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        activeOpacity={0.86}
        style={[styles.card, isUnread && styles.cardUnread]}
        onPress={() => markNotificationRead?.(item.id)}
      >
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title || "Notification"}
            </Text>
            {isUnread ? <View style={styles.dot} /> : null}
          </View>

          <Text style={styles.cardMessage} numberOfLines={3}>
            {item.message || "No details available."}
          </Text>

          <Text style={styles.cardTime}>{formatDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Admin Notifications</Text>
          <Text style={styles.headerSub}>
            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.headerBtn}
          onPress={() => markAllNotificationsRead?.()}
        >
          <Ionicons name="checkmark-done-outline" size={22} color={COLORS.teal} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={34} color={COLORS.teal} />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
              Platform alerts, approval updates, and payment notices will appear here.
            </Text>
          </View>
        }
      />

      <AdminBottomNavigation navigation={navigation} active="More" />
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
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerText: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  headerSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...shadow,
  },
  cardUnread: {
    backgroundColor: COLORS.unread,
    borderColor: "#CBEFE5",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
    paddingRight: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.teal,
  },
  cardMessage: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.muted,
  },
  cardTime: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.tealDark,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    color: COLORS.muted,
    fontWeight: "600",
  },
});
