// screens/student/StudentCategoriesScreen.js

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import { buildStudentCategoriesFromTutors } from "./studentCategoryUtils";

const COLORS = {
  bg: "#F2F7FF",
  white: "#FFFFFF",
  primary: "#006D6A",
  primaryLight: "#E6F5F4",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E2EBF6",
};

export default function StudentCategoriesScreen({ navigation }) {
  const { tutors = [] } = useAppContext();
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => buildStudentCategoriesFromTutors(tutors),
    [tutors]
  );

  const filteredCategories = categories.filter((item) =>
    `${item.title} ${item.subtitle} ${item.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.86}
      style={styles.categoryCard}
      onPress={() =>
        navigation.navigate("StudentCategoryDetails", { category: item })
      }
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: item.iconBg || `${item.iconColor || COLORS.primary}18` },
        ]}
      >
        <Text style={styles.categoryEmoji}>{item.emoji || "📚"}</Text>
      </View>

      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{item.title}</Text>
        <Text style={[styles.categorySubtitle, { color: item.iconColor || COLORS.primary }]}>
          {item.subtitle}
        </Text>
        <Text style={styles.categoryDescription} numberOfLines={1}>
          {item.description}
        </Text>
      </View>

      <View style={styles.arrowBox}>
        <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>Explore Categories</Text>
          <Text style={styles.headerSubtitle}>
            Choose a teacher-backed category to find subjects and ask doubts
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={COLORS.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search categories..."
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.countRow}>
        <View style={styles.countChip}>
          <Ionicons name="grid-outline" size={12} color={COLORS.primary} />
          <Text style={styles.countText}>
            {filteredCategories.length} Categories
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>Try a different keyword</Text>
          </View>
        }
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentDashboard")}
        >
          <Ionicons name="home-outline" size={22} color={COLORS.muted} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentMyDoubts")}
        >
          <Ionicons name="help-circle-outline" size={23} color={COLORS.muted} />
          <Text style={styles.navText}>My Doubts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.fab}
          onPress={() => navigation.navigate("AskDoubt")}
        >
          <Ionicons name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentChat")}
        >
          <Ionicons name="chatbubble-outline" size={22} color={COLORS.muted} />
          <Text style={styles.navText}>Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentProfile")}
        >
          <Ionicons name="person-outline" size={22} color={COLORS.muted} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 12 : 6,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextBox: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  headerSubtitle: {
    fontSize: 11.5,
    fontWeight: "600",
    color: COLORS.muted,
    marginTop: 2,
  },

  searchBox: {
    marginHorizontal: 16,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "600",
    color: COLORS.text,
    paddingVertical: 0,
  },

  countRow: { paddingHorizontal: 16, marginBottom: 10 },
  countChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countText: { fontSize: 11, fontWeight: "800", color: COLORS.primary },

  listContent: { paddingHorizontal: 16, paddingBottom: 100 },

  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  categoryEmoji: { fontSize: 28 },
  categoryInfo: { flex: 1 },
  categoryTitle: { fontSize: 14.5, fontWeight: "900", color: COLORS.text },
  categorySubtitle: { fontSize: 12, fontWeight: "800", marginTop: 3 },
  categoryDescription: {
    fontSize: 11.5,
    fontWeight: "600",
    color: COLORS.muted,
    marginTop: 2,
  },
  arrowBox: {
    width: 30,
    height: 30,
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  emptySubtitle: { fontSize: 13, fontWeight: "600", color: COLORS.muted },

  bottomNav: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    height: 66,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
      },
      android: { elevation: 14 },
    }),
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  navText: { fontSize: 9, fontWeight: "800", color: COLORS.muted },
  fab: {
    width: 52,
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
    }),
  },
});
