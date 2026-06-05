

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
  Keyboard,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

import { useAppContext } from "../../context/AppContext";
import StudentBottomNavigation from "../../components/StudentBottomNavigation";

const C = {
  bg: "#F6F8FC",
  card: "#FFFFFF",
  text: "#101828",
  muted: "#667085",
  border: "#E4E7EC",
  primary: "#007C78",
  primaryLight: "#E7F7F4",
  white: "#FFFFFF",
  shadow: "#101828",
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getSubjectTestsCount(subject) {
  const list = safeArray(subject?.list);
  if (list.length > 0) return list.length;
  return Number(subject?.tests || 0);
}

function getSubjectQuestionsCount(subject) {
  const list = safeArray(subject?.list);

  if (list.length > 0) {
    return list.reduce((sum, test) => {
      const count =
        Number(test?.questions || 0) || safeArray(test?.questionList).length;
      return sum + count;
    }, 0);
  }

  return Number(subject?.questions || 0);
}

function getCategoryTestsCount(category) {
  return safeArray(category?.subjects).reduce(
    (sum, subject) => sum + getSubjectTestsCount(subject),
    0
  );
}

function getCategoryQuestionsCount(category) {
  return safeArray(category?.subjects).reduce(
    (sum, subject) => sum + getSubjectQuestionsCount(subject),
    0
  );
}

function getCategoryColor(index) {
  const colors = [
    { bg: "#EAF8EF", color: "#16803A", iconType: "fa", icon: "school" },
    { bg: "#F1ECFF", color: "#6554C0", iconType: "mci", icon: "school-outline" },
    { bg: "#FFF3E8", color: "#D86512", iconType: "fa", icon: "university" },
    { bg: "#EEF4FF", color: "#2458D6", iconType: "mci", icon: "target" },
    { bg: "#EAFBFB", color: "#168A92", iconType: "mci", icon: "code-tags" },
    { bg: "#FFF0F8", color: "#DB2777", iconType: "mci", icon: "medical-bag" },
  ];

  return colors[index % colors.length];
}

export default function MockTestCategoriesScreen({ navigation }) {
  const { mockData, mockCategories } = useAppContext();
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const fromContext =
      safeArray(mockCategories).length > 0
        ? safeArray(mockCategories)
        : Object.values(mockData || {}).filter(Boolean);

    return fromContext.map((item, index) => {
      const colorData = getCategoryColor(index);

      return {
        id: item?.id || item?.title || `category_${index}`,
        title: item?.title || "Category",
        subtitle: item?.subtitle || item?.description || "Mock Tests",
        description: item?.description || "",
        subjects: safeArray(item?.subjects),
        tests: getCategoryTestsCount(item),
        questions: getCategoryQuestionsCount(item),
        emoji: item?.emoji,
        iconType: item?.iconType || colorData.iconType,
        icon: item?.icon || colorData.icon,
        iconBg: item?.soft || colorData.bg,
        iconColor: item?.color || colorData.color,
      };
    });
  }, [mockCategories, mockData]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [search, categories]);

  const handleCategoryPress = (item) => {
    Keyboard.dismiss();

    navigation.navigate("MockTestList", {
      categoryId: item.id,
      categoryTitle: item.title,
      category: item.title,
      totalTests: item.tests,
      totalQuestions: item.questions,
      subjects: item.subjects,
    });
  };

  const renderIcon = (item) => {
    if (item.emoji) return <Text style={styles.emojiIcon}>{item.emoji}</Text>;

    if (item.iconType === "fa") {
      return <FontAwesome5 name={item.icon} size={22} color={item.iconColor} />;
    }

    return (
      <MaterialCommunityIcons name={item.icon} size={28} color={item.iconColor} />
    );
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.86}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
        {renderIcon(item)}
      </View>

      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{item.title}</Text>

        <Text style={styles.categorySubtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Ionicons name="folder-outline" size={12} color={C.primary} />
            <Text style={styles.metaText}>
              {safeArray(item.subjects).length} Subjects
            </Text>
          </View>

          <View style={styles.metaPill}>
            <Ionicons name="help-circle-outline" size={12} color={C.primary} />
            <Text style={styles.metaText}>{item.questions} Qs</Text>
          </View>
        </View>
      </View>

      <View style={styles.testBox}>
        <Text style={styles.testCount}>{item.tests}</Text>
        <Text style={styles.testLabel}>Tests</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#98A2B3" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.screen}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.headerIcon}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={22} color={C.text} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>All Categories</Text>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.headerIcon}
              onPress={() => setSearch("")}
            >
              <Ionicons name="search-outline" size={21} color={C.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color="#98A2B3" />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search categories..."
              placeholderTextColor="#98A2B3"
              style={styles.searchInput}
              returnKeyType="search"
            />

            {search.length > 0 && (
              <TouchableOpacity activeOpacity={0.7} onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#98A2B3" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCategory}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.heroCard}>
                <View style={styles.heroIcon}>
                  <MaterialCommunityIcons
                    name="clipboard-text-outline"
                    size={26}
                    color={C.primary}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>Practice Mock Tests</Text>
                  <Text style={styles.heroSub}>
                    Select a category and start tests published by your teacher.
                  </Text>
                </View>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={42} color="#98A2B3" />
                <Text style={styles.emptyTitle}>No category found</Text>
                <Text style={styles.emptyText}>
                  Ask your teacher to publish mock tests.
                </Text>
              </View>
            }
            ListFooterComponent={
              <View style={styles.requestCard}>
                <View style={styles.requestIcon}>
                  <Ionicons name="add-circle-outline" size={25} color={C.primary} />
                </View>

                <Text style={styles.requestTitle}>Can’t find your category?</Text>

                <Text style={styles.requestSubtitle}>
                  Request a new test category for your exam.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.86}
                  style={styles.requestButton}
                  onPress={() => navigation.navigate("RequestMockTestCategory")}
                >
                  <Text style={styles.requestButtonText}>Request Now</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>

        <StudentBottomNavigation navigation={navigation} active="Home" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  screen: {
    flex: 1,
    backgroundColor: C.bg,
    position: "relative",
  },

  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 14 : 4,
  },

  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: C.text,
  },

  searchBox: {
    height: 44,
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 6,
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 8,
    fontSize: 13,
    color: C.text,
    fontWeight: "600",
  },

  listContent: {
    paddingBottom: Platform.OS === "ios" ? 130 : 120,
  },

  heroCard: {
    minHeight: 84,
    backgroundColor: C.primaryLight,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#C9ECE8",
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  heroTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
  },

  heroSub: {
    marginTop: 5,
    fontSize: 11.5,
    lineHeight: 16,
    color: C.muted,
    fontWeight: "700",
  },

  categoryCard: {
    minHeight: 96,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: C.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 2,
  },

  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  emojiIcon: {
    fontSize: 25,
  },

  categoryInfo: {
    flex: 1,
  },

  categoryTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: C.text,
    marginBottom: 4,
  },

  categorySubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
    color: C.muted,
    fontWeight: "600",
  },

  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  metaPill: {
    minHeight: 24,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  metaText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
  },

  testBox: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    minWidth: 42,
  },

  testCount: {
    fontSize: 13,
    fontWeight: "900",
    color: C.text,
  },

  testLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.muted,
    marginTop: 2,
  },

  requestCard: {
    marginTop: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDE4EE",
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: "center",
  },

  requestIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  requestTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: C.text,
    marginBottom: 4,
  },

  requestSubtitle: {
    fontSize: 11.5,
    color: C.muted,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 14,
  },

  requestButton: {
    height: 36,
    minWidth: 126,
    borderRadius: 10,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: "#D7E1EA",
    alignItems: "center",
    justifyContent: "center",
  },

  requestButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: C.primary,
  },

  emptyBox: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 28,
    alignItems: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
    marginTop: 10,
  },

  emptyText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
    marginTop: 5,
    textAlign: "center",
  },
});