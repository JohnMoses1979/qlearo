

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import StudentBottomNavigation from "../../components/StudentBottomNavigation";

const C = {
  bg: "#F7F9FC",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  primary: "#0F766E",
  primaryLight: "#E7F7F4",
  white: "#FFFFFF",
  shadow: "#0F172A",
  green: "#16A34A",
  greenLight: "#EAF8EF",
  blue: "#2563EB",
  blueLight: "#EEF4FF",
  orange: "#F97316",
  orangeLight: "#FFF3E8",
  purple: "#7C3AED",
  purpleLight: "#F1ECFF",
  red: "#EF4444",
};

const filters = ["All", "Easy", "Medium", "Hard", "Attempted"];

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

function getLevelColor(level) {
  if (level === "Easy") return C.green;
  if (level === "Medium") return C.orange;
  if (level === "Hard") return C.red;
  return C.primary;
}

function getLevelBg(level) {
  if (level === "Easy") return C.greenLight;
  if (level === "Medium") return C.orangeLight;
  if (level === "Hard") return "#FEECEC";
  return C.primaryLight;
}

function getTestQuestionCount(test) {
  return Number(test?.questions || 0) || safeArray(test?.questionList).length;
}

function EmptyState({ title, sub }) {
  return (
    <View style={styles.emptyBox}>
      <Ionicons name="clipboard-outline" size={42} color="#98A2B3" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{sub}</Text>
    </View>
  );
}

function SubjectChip({ item, active, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      style={[styles.subjectChip, active && styles.subjectChipActive]}
      onPress={onPress}
    >
      <Text style={styles.subjectEmoji}>{item?.emoji || "📚"}</Text>

      <View>
        <Text
          style={[
            styles.subjectChipTitle,
            active && styles.subjectChipTitleActive,
          ]}
          numberOfLines={1}
        >
          {item?.name || "Subject"}
        </Text>

        <Text
          style={[
            styles.subjectChipSub,
            active && styles.subjectChipSubActive,
          ]}
          numberOfLines={1}
        >
          {getSubjectTestsCount(item)} Tests
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MockTestListScreen({ navigation, route }) {
  const { mockData, getMockCategory } = useAppContext();

  const categoryTitle =
    route?.params?.categoryTitle || route?.params?.category || "Civils";

  const categoryId = route?.params?.categoryId || categoryTitle;

  const category = useMemo(() => {
    return (
      getMockCategory?.(categoryTitle) ||
      mockData?.[categoryTitle] ||
      Object.values(mockData || {}).find(
        (item) =>
          String(item?.title || "").toLowerCase() ===
          String(categoryTitle || "").toLowerCase()
      ) || {
        title: categoryTitle,
        subtitle: "Mock Tests",
        description: "Student mock tests",
        emoji: "📚",
        color: C.primary,
        soft: C.primaryLight,
        subjects: safeArray(route?.params?.subjects),
      }
    );
  }, [getMockCategory, mockData, categoryTitle, route?.params?.subjects]);

  const subjects = useMemo(() => safeArray(category?.subjects), [category]);

  const [selectedSubjectId, setSelectedSubjectId] = useState(
    subjects?.[0]?.id || null
  );

  const selectedSubject = useMemo(() => {
    if (!subjects.length) return null;

    return (
      subjects.find((item) => item.id === selectedSubjectId) ||
      subjects[0] ||
      null
    );
  }, [subjects, selectedSubjectId]);

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const allTests = useMemo(() => {
    if (!selectedSubject) return [];

    return safeArray(selectedSubject?.list).map((test, index) => ({
      ...test,
      id: test?.id || test?.testId || `${selectedSubject.id}_${index}`,
      testId: test?.testId || test?.id || `${selectedSubject.id}_${index}`,
      title: test?.title || "Mock Test",
      sub:
        test?.sub ||
        test?.subtitle ||
        `${category.title} • ${selectedSubject.name}`,
      questions: getTestQuestionCount(test),
      duration: test?.duration || test?.time || selectedSubject?.time || "30 min",
      time: test?.time || test?.duration || selectedSubject?.time || "30 min",
      level: test?.level || "Easy",
      type: test?.type || test?.testType || test?.level || "Practice",
      categoryId,
      categoryTitle: category.title,
      category: category.title,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      subject: selectedSubject,
      questionList: safeArray(test?.questionList),
    }));
  }, [selectedSubject, category, categoryId]);

  const tests = useMemo(() => {
    const q = search.trim().toLowerCase();

    let baseList = allTests;

    if (activeFilter === "Attempted") {
      baseList = allTests.filter((item) => Number(item?.attempts || 0) > 0);
    } else if (activeFilter !== "All") {
      baseList = allTests.filter(
        (item) =>
          String(item?.level || "").toLowerCase() === activeFilter.toLowerCase()
      );
    }

    if (!q) return baseList;

    return baseList.filter(
      (item) =>
        String(item?.title || "").toLowerCase().includes(q) ||
        String(item?.sub || "").toLowerCase().includes(q) ||
        String(item?.level || "").toLowerCase().includes(q) ||
        String(item?.subjectName || "").toLowerCase().includes(q)
    );
  }, [allTests, activeFilter, search]);

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation.navigate("StudentDashboard");
    }
  };

  const openInstructions = (item) => {
    navigation.navigate("MockTestInstructions", {
      testId: item.id,
      testTitle: item.title,
      categoryId: item.categoryId,
      categoryTitle: item.categoryTitle,
      category: item.categoryTitle,
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      subject: item.subject,
      test: item,
      questions: item.questionList,
      questionList: item.questionList,
      duration: item.duration,
      testType: item.type,
    });
  };

  const renderTest = ({ item }) => {
    const noQuestions = safeArray(item?.questionList).length === 0;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.testCard}
        onPress={() => openInstructions(item)}
      >
        <View style={styles.testIconBox}>
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={21}
            color={C.primary}
          />
        </View>

        <View style={styles.testInfo}>
          <Text style={styles.testTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <Text style={styles.testSub} numberOfLines={1}>
            {item.subjectName} • {item.sub}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{item.questions} Questions</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaText}>{item.type}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaText}>{item.duration}</Text>
          </View>

          {noQuestions && (
            <Text style={styles.warningText}>
              Teacher has not added questions yet.
            </Text>
          )}
        </View>

        <View style={styles.rightBox}>
          <View
            style={[
              styles.levelPill,
              { backgroundColor: getLevelBg(item.level) },
            ]}
          >
            <Text
              style={[styles.levelText, { color: getLevelColor(item.level) }]}
            >
              {item.level}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#7B8794" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.heroCard}>
        <View
          style={[
            styles.heroIcon,
            { backgroundColor: category?.soft || C.primaryLight },
          ]}
        >
          <Text style={styles.heroEmoji}>{category?.emoji || "📚"}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>{category.title} Mock Tests</Text>
          <Text style={styles.heroSub}>
            Select a subject and start teacher-published tests.
          </Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.heroPill}>
              <Ionicons name="folder-outline" size={13} color={C.primary} />
              <Text style={styles.heroPillText}>{subjects.length} Subjects</Text>
            </View>

            <View style={styles.heroPill}>
              <Ionicons
                name="document-text-outline"
                size={13}
                color={C.primary}
              />
              <Text style={styles.heroPillText}>{allTests.length} Tests</Text>
            </View>

            <View style={styles.heroPill}>
              <Ionicons
                name="help-circle-outline"
                size={13}
                color={C.primary}
              />
              <Text style={styles.heroPillText}>
                {getSubjectQuestionsCount(selectedSubject)} Qs
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color="#98A2B3" />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search tests..."
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

      {subjects.length > 0 && (
        <>
          <Text style={styles.smallSectionTitle}>Subjects</Text>

          <FlatList
            data={subjects}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id || item.name)}
            contentContainerStyle={styles.subjectList}
            renderItem={({ item }) => (
              <SubjectChip
                item={item}
                active={item.id === selectedSubject?.id}
                onPress={() => {
                  setSelectedSubjectId(item.id);
                  setActiveFilter("All");
                }}
              />
            )}
          />
        </>
      )}

      <View style={styles.filterRow}>
        {filters.map((item) => {
          const active = activeFilter === item;

          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              style={[styles.filterChip, active && styles.activeChip]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[styles.filterText, active && styles.activeChipText]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.smallSectionTitle}>
          {selectedSubject?.name || "Tests"}
        </Text>

        <Text style={styles.sectionCount}>{tests.length} Tests</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.headerIcon}
            onPress={goBackSafe}
          >
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {category.title} Mock Tests
          </Text>

          <View style={styles.headerIcon} />
        </View>

        <FlatList
          data={tests}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTest}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              title={subjects.length === 0 ? "No subjects found" : "No tests found"}
              sub={
                subjects.length === 0
                  ? "Ask your teacher to create subjects and publish tests."
                  : "No mock tests are published for this subject yet."
              }
            />
          }
          ListFooterComponent={
            <View style={styles.infoCard}>
              <View style={styles.bulbBox}>
                <Ionicons name="bulb-outline" size={22} color="#8A6D1D" />
              </View>

              <Text style={styles.infoText}>
                Each test gives result in 2 seconds after submission.
                Teacher-added questions will appear here automatically.
              </Text>
            </View>
          }
        />
      </View>

      <StudentBottomNavigation navigation={navigation} active="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 14 : 4,
    paddingBottom: Platform.OS === "ios" ? 100 : 90,
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
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
  },

  listContent: {
    paddingBottom: 28,
  },

  heroCard: {
    minHeight: 110,
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: C.shadow,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 2,
  },

  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  heroEmoji: {
    fontSize: 30,
  },

  heroTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: C.text,
  },

  heroSub: {
    marginTop: 5,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "700",
    color: C.muted,
  },

  heroMetaRow: {
    marginTop: 9,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  heroPill: {
    minHeight: 24,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  heroPillText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
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

  smallSectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: C.text,
    marginBottom: 10,
  },

  subjectList: {
    paddingBottom: 14,
  },

  subjectChip: {
    minWidth: 145,
    maxWidth: 190,
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  subjectChipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },

  subjectEmoji: {
    fontSize: 22,
    marginRight: 8,
  },

  subjectChipTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: C.text,
    maxWidth: 120,
  },

  subjectChipTitleActive: {
    color: C.white,
  },

  subjectChipSub: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: C.muted,
  },

  subjectChipSubActive: {
    color: "#D8F4F0",
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 16,
  },

  filterChip: {
    height: 32,
    paddingHorizontal: 17,
    borderRadius: 12,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  activeChip: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },

  filterText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.text,
  },

  activeChipText: {
    color: C.white,
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionCount: {
    fontSize: 12,
    fontWeight: "900",
    color: C.primary,
    marginBottom: 10,
  },

  testCard: {
    minHeight: 92,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: C.shadow,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 2,
  },

  testIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  testInfo: {
    flex: 1,
  },

  testTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: C.text,
    marginBottom: 4,
  },

  testSub: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
    marginBottom: 6,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  metaText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.muted,
  },

  dot: {
    fontSize: 12,
    color: C.muted,
    marginHorizontal: 6,
  },

  warningText: {
    marginTop: 6,
    fontSize: 10.5,
    fontWeight: "800",
    color: C.red,
  },

  rightBox: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    gap: 8,
  },

  levelPill: {
    minWidth: 62,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  levelText: {
    fontSize: 10,
    fontWeight: "900",
  },

  infoCard: {
    marginTop: 20,
    minHeight: 78,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  bulbBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF7D6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "700",
    color: C.text,
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