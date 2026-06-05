
// screens/teacher/TeacherAnalyticsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#008F7A",
  bg: "#F5F7FB",
  white: "#FFFFFF",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E8ECF4",
  green: "#16A34A",
  blue: "#2563EB",
  purple: "#7C3AED",
  orange: "#F59E0B",
};

const PERIODS = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"];

export default function TeacherAnalyticsScreen({ navigation, route }) {
  const video = route?.params?.video || null;
  const [period, setPeriod] = useState("Last 30 Days");
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  // Dummy data for stats (replace with API or context later)
  const stats = [
    { title: "Views", value: "245K", growth: "+12.5%" },
    { title: "Watch Time", value: "12K", growth: "+15.3%" },
    { title: "Unique Viewers", value: "8.4K", growth: "+10.2%" },
    { title: "Comments", value: "1.2K", growth: "+8.7%" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.heading}>Analytics</Text>
          {video && <Text style={styles.subHeading}>{video.title}</Text>}
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setShowPeriodModal(true)}
        >
          <Ionicons name="calendar-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* PERIOD FILTER BUTTON */}
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowPeriodModal(true)}
        >
          <Ionicons name="time-outline" size={16} color={COLORS.primary} />
          <Text style={styles.filterText}>{period}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.text} />
        </TouchableOpacity>

        {/* STATS GRID */}
        <View style={styles.statsWrap}>
          {stats.map((item, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={styles.statNo}>{item.value}</Text>
              <Text style={styles.statTitle}>{item.title}</Text>
              <Text style={styles.growthText}>{item.growth}</Text>
            </View>
          ))}
        </View>

        {/* PERIOD MODAL */}
        <Modal
          visible={showPeriodModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPeriodModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowPeriodModal(false)}
          >
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Select Period</Text>
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.periodItem,
                    period === p && styles.periodItemActive,
                  ]}
                  onPress={() => {
                    setPeriod(p);
                    setShowPeriodModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.periodText,
                      period === p && styles.periodTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                  {period === p && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>

      <TeacherBottomNavigation navigation={navigation} active="Analytics" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 110, paddingTop: 4 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 16 : 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.bg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerCenter: { flex: 1, alignItems: "center", marginHorizontal: 8 },
  heading: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  subHeading: { marginTop: 2, color: COLORS.muted, fontSize: 11, fontWeight: "600", maxWidth: "90%" },

  filterBtn: {
    marginTop: 12,
    height: 46,
    width: 180,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
  },
  filterText: { fontSize: 14, fontWeight: "700", color: COLORS.text },

  statsWrap: { marginTop: 16, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statCard: {
    width: "47%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statNo: { fontSize: 28, fontWeight: "900", color: COLORS.text },
  statTitle: { marginTop: 6, textAlign: "center", color: COLORS.muted, fontWeight: "700", fontSize: 12, lineHeight: 18 },
  growthText: { color: COLORS.green, fontWeight: "900", fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: width - 64, backgroundColor: COLORS.white, borderRadius: 24, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text, marginBottom: 16, textAlign: "center" },
  periodItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 6 },
  periodItemActive: { backgroundColor: "#E9FFF6" },
  periodText: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  periodTextActive: { color: COLORS.primary, fontWeight: "900" },
});