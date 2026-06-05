

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

const { width } = Dimensions.get("window");

const C = {
  bg: "#F3F6FB",
  card: "#FFFFFF",
  text: "#07123D",
  muted: "#73829A",
  border: "#E4ECF5",
  primary: "#061755",
  green: "#05B986",
  greenSoft: "#E8FFF7",
  blue: "#236CFF",
  blueSoft: "#EAF2FF",
  purpleSoft: "#F2ECFF",
  pink: "#FF4FA3",
  pinkSoft: "#FFF0F8",
  orange: "#FF7A1A",
  orangeSoft: "#FFF1E8",
  cyanSoft: "#E8FCFF",
};

function numberWithCommas(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getCategoryArray(mockData) {
  if (!mockData || typeof mockData !== "object") return [];
  return Object.values(mockData).filter(Boolean);
}

function getTestsFromSubject(subject) {
  return safeArray(subject?.list);
}

function getSubjectTestsCount(subject) {
  const list = getTestsFromSubject(subject);
  return list.length > 0 ? list.length : Number(subject?.tests || 0);
}

function getSubjectQuestionsCount(subject) {
  const list = getTestsFromSubject(subject);

  if (list.length > 0) {
    return list.reduce((sum, test) => {
      const questionCount =
        Number(test?.questions || 0) || safeArray(test?.questionList).length;
      return sum + questionCount;
    }, 0);
  }

  return Number(subject?.questions || 0);
}

function getSubjectAttemptsCount(subject) {
  return getTestsFromSubject(subject).reduce(
    (sum, test) => sum + Number(test?.attempts || 0),
    0
  );
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

function getCategoryAttemptsCount(category) {
  return safeArray(category?.subjects).reduce(
    (sum, subject) => sum + getSubjectAttemptsCount(subject),
    0
  );
}

function getCategoryDifficultySplit(category) {
  const split = { Easy: 0, Medium: 0, Hard: 0 };

  safeArray(category?.subjects).forEach((subject) => {
    getTestsFromSubject(subject).forEach((test) => {
      if (test?.level === "Easy") split.Easy += 1;
      else if (test?.level === "Medium") split.Medium += 1;
      else if (test?.level === "Hard") split.Hard += 1;
    });
  });

  return split;
}

function getAccuracyByCategory(category) {
  const tests = [];

  safeArray(category?.subjects).forEach((subject) => {
    getTestsFromSubject(subject).forEach((test) => tests.push(test));
  });

  if (tests.length === 0) return 0;

  let score = 0;

  tests.forEach((test) => {
    if (test?.level === "Easy") score += 78;
    else if (test?.level === "Medium") score += 66;
    else score += 54;
  });

  return Math.round(score / tests.length);
}

function getOverallStats(categories) {
  let totalSubjects = 0;
  let totalTests = 0;
  let totalQuestions = 0;
  let totalAttempts = 0;
  let totalAccuracy = 0;

  categories.forEach((category) => {
    totalSubjects += safeArray(category?.subjects).length;
    totalTests += getCategoryTestsCount(category);
    totalQuestions += getCategoryQuestionsCount(category);
    totalAttempts += getCategoryAttemptsCount(category);
    totalAccuracy += getAccuracyByCategory(category);
  });

  return {
    totalCategories: categories.length,
    totalSubjects,
    totalTests,
    totalQuestions,
    totalAttempts,
    avgAccuracy:
      categories.length > 0 ? Math.round(totalAccuracy / categories.length) : 0,
  };
}

function getTopCategory(categories) {
  if (!categories.length) return null;

  return [...categories].sort(
    (a, b) => getCategoryAttemptsCount(b) - getCategoryAttemptsCount(a)
  )[0];
}

function EmojiBox({ emoji, soft, size = 48, emojiSize = 24 }) {
  return (
    <View
      style={[
        styles.emojiBox,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size / 3),
          backgroundColor: soft || C.blueSoft,
        },
      ]}
    >
      <Text style={{ fontSize: emojiSize }}>{emoji || "📊"}</Text>
    </View>
  );
}

function SummaryCard({ emoji, label, value, soft, onPress }) {
  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.summaryCard}
        activeOpacity={0.86}
        onPress={onPress}
      >
        <EmojiBox emoji={emoji} soft={soft} size={46} emojiSize={22} />

        <View style={{ flex: 1 }}>
          <Text style={styles.summaryValue} numberOfLines={1}>
            {value}
          </Text>
          <Text style={styles.summaryLabel} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.summaryCard}>
      <EmojiBox emoji={emoji} soft={soft} size={46} emojiSize={22} />

      <View style={{ flex: 1 }}>
        <Text style={styles.summaryValue} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.summaryLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function DotLabel({ color, label, value }) {
  return (
    <View style={styles.dotLabel}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.dotText}>{label}</Text>
      <Text style={styles.dotValue}>{value}</Text>
    </View>
  );
}

function EmptyBox({ title, sub }) {
  return (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
    </View>
  );
}

function CategoryAnalysisCard({ category, onPress, onAttemptsPress }) {
  const subjectsCount = safeArray(category?.subjects).length;
  const testsCount = getCategoryTestsCount(category);
  const questionsCount = getCategoryQuestionsCount(category);
  const attemptsCount = getCategoryAttemptsCount(category);
  const split = getCategoryDifficultySplit(category);
  const accuracy = getAccuracyByCategory(category);

  return (
    <TouchableOpacity
      style={styles.categoryAnalysisCard}
      activeOpacity={0.86}
      onPress={onPress}
    >
      <View style={styles.categoryTopRow}>
        <EmojiBox emoji={category?.emoji} soft={category?.soft} size={58} emojiSize={28} />

        <View style={styles.categoryMainInfo}>
          <Text style={styles.categoryTitle} numberOfLines={1}>
            {category?.title || "Category"}
          </Text>

          <Text style={styles.categorySubtitle} numberOfLines={1}>
            {category?.subtitle || "Mock Tests"}
          </Text>

          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.attemptRow}
            onPress={onAttemptsPress}
            disabled={!onAttemptsPress}
          >
            <Text style={styles.attemptLabel}>Attempts</Text>
            <Text style={styles.attemptValue}>
              {numberWithCommas(attemptsCount)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryRightStats}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>Subjects</Text>
            <Text style={styles.miniStatValue}>{subjectsCount}</Text>
          </View>

          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>Tests</Text>
            <Text style={styles.miniStatValue}>{testsCount}</Text>
          </View>

          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>Questions</Text>
            <Text style={styles.miniStatValue}>{questionsCount}</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={22} color="#52617F" />
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.categoryBottomRow}>
        <DotLabel color={C.green} label="Easy" value={split.Easy} />
        <DotLabel color={C.orange} label="Medium" value={split.Medium} />
        <DotLabel color={C.pink} label="Hard" value={split.Hard} />

        <View style={styles.accuracyPill}>
          <Text style={styles.accuracyText}>{accuracy}% Accuracy</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SubjectAnalysisCard({ subject, onPress, onAttemptsPress }) {
  const testsCount = getSubjectTestsCount(subject);
  const questionsCount = getSubjectQuestionsCount(subject);
  const attemptsCount = getSubjectAttemptsCount(subject);

  return (
    <TouchableOpacity
      style={styles.subjectAnalysisCard}
      activeOpacity={0.86}
      onPress={onPress}
    >
      <View style={styles.subjectLeftRow}>
        <EmojiBox emoji={subject?.emoji} soft={subject?.soft} size={48} emojiSize={23} />

        <View style={{ flex: 1 }}>
          <Text style={styles.subjectTitle} numberOfLines={1}>
            {subject?.name || "Subject"}
          </Text>

          <Text style={styles.subjectSubtitle} numberOfLines={1}>
            {subject?.desc || "Mock test subject"}
          </Text>

          <View style={styles.subjectPillRow}>
            <View style={styles.subjectPill}>
              <Text style={styles.subjectPillEmoji}>📝</Text>
              <Text style={styles.subjectPillText}>{testsCount} Tests</Text>
            </View>

            <View style={styles.subjectPill}>
              <Text style={styles.subjectPillEmoji}>❓</Text>
              <Text style={styles.subjectPillText}>{questionsCount} Qs</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.subjectPill}
              onPress={onAttemptsPress}
              disabled={!onAttemptsPress}
            >
              <Text style={styles.subjectPillEmoji}>👥</Text>
              <Text style={styles.subjectPillText}>
                {numberWithCommas(attemptsCount)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#52617F" />
      </View>
    </TouchableOpacity>
  );
}

export default function TeacherMockTestAnalysisScreen({ navigation, route }) {
  const { teacherMockCatalog } = useAppContext();

  const selectedCategoryTitle =
    route?.params?.category || route?.params?.categoryTitle || "";

  const selectedSubject = route?.params?.subject || null;

  const [viewMode, setViewMode] = useState(
    selectedCategoryTitle ? "Selected" : "All"
  );

  const categories = useMemo(() => {
    return safeArray(teacherMockCatalog);
  }, [teacherMockCatalog]);

  const selectedCategory = useMemo(() => {
    if (!categories.length) return null;

    return (
      categories.find((item) => item.title === selectedCategoryTitle) ||
      categories[0]
    );
  }, [categories, selectedCategoryTitle]);

  const overall = useMemo(() => getOverallStats(categories), [categories]);
  const topCategory = useMemo(() => getTopCategory(categories), [categories]);

  const visibleCategories = useMemo(() => {
    if (viewMode === "Selected" && selectedCategory) return [selectedCategory];
    return categories;
  }, [viewMode, selectedCategory, categories]);

  const selectedSubjects = useMemo(
    () => safeArray(selectedCategory?.subjects),
    [selectedCategory]
  );

  const firstSubject = selectedSubject || selectedSubjects[0] || null;

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("TeacherMockTestCategories");
  };

  const openCategory = (category) => {
    navigation.navigate("TeacherMockTestSubjects", {
      category: category.title,
      categoryTitle: category.title,
    });
  };

  const openSubject = (subject) => {
    if (!selectedCategory || !subject) return;

    navigation.navigate("TeacherMockTestList", {
      category: selectedCategory.title,
      categoryTitle: selectedCategory.title,
      subject,
      subjectId: subject.id,
    });
  };

  const openAddTest = () => {
    if (!selectedCategory || !firstSubject) return;

    navigation.navigate("TeacherMockTestAdd", {
      category: selectedCategory.title,
      categoryTitle: selectedCategory.title,
      subject: firstSubject,
      subjectId: firstSubject.id,
      nextNo: String((safeArray(firstSubject?.list).length || 0) + 1).padStart(
        2,
        "0"
      ),
    });
  };

  const openAttempts = () => {
    navigation.navigate("TeacherMockTestAttempts", {
      categoryTitle: selectedCategoryTitle || undefined,
      subjectId: selectedSubject?.id || undefined,
      subjectName: selectedSubject?.name || undefined,
      source: "analysis",
    });
  };

  const openCategoriesOverview = () => {
    navigation.navigate("TeacherMockTestCategories");
  };

  const openSubjectsOverview = () => {
    if (selectedCategory) {
      navigation.navigate("TeacherMockTestSubjects", {
        category: selectedCategory.title,
        categoryTitle: selectedCategory.title,
      });
      return;
    }

    navigation.navigate("TeacherMockTestCategories");
  };

  const openTestsOverview = () => {
    if (selectedCategory && firstSubject) {
      navigation.navigate("TeacherMockTestList", {
        category: selectedCategory.title,
        categoryTitle: selectedCategory.title,
        subject: firstSubject,
        subjectId: firstSubject.id,
      });
      return;
    }

    openSubjectsOverview();
  };

  const openQuestionsOverview = () => {
    openTestsOverview();
  };

  const openCategoryAttempts = (category) => {
    navigation.navigate("TeacherMockTestAttempts", {
      categoryTitle: category?.title || undefined,
      source: "analysis-category",
    });
  };

  const openSubjectAttempts = (subject) => {
    if (!selectedCategory || !subject) return;

    navigation.navigate("TeacherMockTestAttempts", {
      categoryTitle: selectedCategory.title,
      subjectId: subject.id,
      subjectName: subject.name,
      source: "analysis-subject",
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.headerBtn}
            onPress={goBackSafe}
          >
            <Ionicons name="arrow-back" size={23} color={C.primary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Mock Test Analysis</Text>
            <Text style={styles.headerSub}>Live overview from AppContext</Text>
          </View>

          <TouchableOpacity activeOpacity={0.75} style={styles.headerBtn}>
            <Ionicons name="filter-outline" size={23} color={C.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.summaryWrapper}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryTitleRow}>
                <View style={styles.summaryBlueIcon}>
                  <Ionicons name="bar-chart-outline" size={20} color="#fff" />
                </View>

                <Text style={styles.summaryTitle}>Overall Summary</Text>
              </View>

              <TouchableOpacity style={styles.monthBtn} activeOpacity={0.8}>
                <Ionicons name="calendar-outline" size={16} color={C.primary} />
                <Text style={styles.monthText}>This Month</Text>
                <Ionicons name="chevron-down" size={17} color={C.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.summaryGrid}>
              <SummaryCard emoji="🗂️" label="Categories" value={overall.totalCategories} soft={C.blueSoft} onPress={openCategoriesOverview} />
              <SummaryCard emoji="📚" label="Subjects" value={overall.totalSubjects} soft={C.greenSoft} onPress={openSubjectsOverview} />
              <SummaryCard emoji="📋" label="Mock Tests" value={overall.totalTests} soft={C.purpleSoft} onPress={openTestsOverview} />
              <SummaryCard emoji="❓" label="Questions" value={numberWithCommas(overall.totalQuestions)} soft={C.orangeSoft} onPress={openQuestionsOverview} />
              <SummaryCard emoji="👥" label="Attempts" value={numberWithCommas(overall.totalAttempts)} soft={C.pinkSoft} onPress={openAttempts} />
              <SummaryCard emoji="🎯" label="Accuracy" value={`${overall.avgAccuracy}%`} soft={C.cyanSoft} onPress={openAttempts} />
            </View>

            {topCategory && (
              <View style={styles.topCategoryCard}>
                <EmojiBox emoji="🏆" soft={C.blueSoft} size={54} emojiSize={25} />

                <View style={{ flex: 1 }}>
                  <Text style={styles.topSmall}>Top Performing Category</Text>

                  <Text style={styles.topName} numberOfLines={1}>
                    {topCategory.title}
                  </Text>

                  <Text style={styles.topMeta} numberOfLines={1}>
                    {numberWithCommas(getCategoryAttemptsCount(topCategory))} Attempts
                    {"  •  "}
                    {getAccuracyByCategory(topCategory)}% Accuracy
                  </Text>
                </View>

                <View style={styles.trendBox}>
                  <Ionicons name="trending-up" size={24} color={C.green} />
                </View>
              </View>
            )}
          </View>

          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, viewMode === "All" && styles.modeBtnActive]}
              activeOpacity={0.84}
              onPress={() => setViewMode("All")}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === "All" && styles.modeBtnTextActive,
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeBtn,
                viewMode === "Selected" && styles.modeBtnActive,
              ]}
              activeOpacity={0.84}
              onPress={() => setViewMode("Selected")}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === "Selected" && styles.modeBtnTextActive,
                ]}
              >
                Selected
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category Wise Performance</Text>

            <TouchableOpacity style={styles.sortBtn} activeOpacity={0.8}>
              <Text style={styles.sortText}>Sort by: Attempts</Text>
              <Ionicons name="chevron-down" size={17} color={C.blue} />
            </TouchableOpacity>
          </View>

          {visibleCategories.length === 0 ? (
            <EmptyBox
              title="No analysis data found"
              sub="Create categories, subjects, and tests to see analysis."
            />
          ) : (
            visibleCategories.map((category) => (
              <CategoryAnalysisCard
                key={category.title}
                category={category}
                onPress={() => openCategory(category)}
                onAttemptsPress={() => openCategoryAttempts(category)}
              />
            ))
          )}

          {selectedCategory && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory.title} Subjects
                </Text>

                <Text style={styles.sectionCount}>
                  {selectedSubjects.length} Subjects
                </Text>
              </View>

              {selectedSubjects.length === 0 ? (
                <EmptyBox
                  title="No subjects found"
                  sub="Create subjects under this category to see analysis."
                />
              ) : (
                selectedSubjects.map((subject) => (
                  <SubjectAnalysisCard
                    key={subject.id}
                    subject={subject}
                    onPress={() => openSubject(subject)}
                    onAttemptsPress={() => openSubjectAttempts(subject)}
                  />
                ))
              )}
            </>
          )}

          <TouchableOpacity
            style={[
              styles.addTestCard,
              (!selectedCategory || !firstSubject) && styles.disabledCard,
            ]}
            activeOpacity={0.86}
            onPress={openAddTest}
          >
            <View style={styles.addCircle}>
              <Ionicons name="add" size={25} color="#fff" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.addTestTitle}>Add More Questions</Text>
              <Text style={styles.addTestSub}>
                Create another test for selected subject
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color={C.green} />
          </TouchableOpacity>
        </ScrollView>

        <TeacherBottomNavigation navigation={navigation} active="Home" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 14,
  },

  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 155 : 140,
  },

  header: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },

  headerBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: { flex: 1, alignItems: "center" },

  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.text,
  },

  headerSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#52617F",
  },

  summaryWrapper: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginTop: 5,
    marginBottom: 16,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  summaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryBlueIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: C.text,
  },

  monthBtn: {
    height: 38,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "#FAFCFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 6,
  },

  monthText: {
    fontSize: 12,
    fontWeight: "800",
    color: C.text,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  summaryCard: {
    width: (width - 58) / 2,
    minHeight: 92,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },

  emojiBox: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: "900",
    color: C.text,
  },

  summaryLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#52617F",
  },

  topCategoryCard: {
    marginTop: 3,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#BFD9FF",
    backgroundColor: "#F3F8FF",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  topSmall: {
    fontSize: 12,
    fontWeight: "900",
    color: C.blue,
  },

  topName: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
  },

  topMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#52617F",
  },

  trendBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },

  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  modeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  modeBtnActive: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },

  modeBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#52617F",
  },

  modeBtnTextActive: { color: "#FFFFFF" },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
    paddingHorizontal: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: C.text,
    flex: 1,
  },

  sectionCount: {
    fontSize: 12,
    fontWeight: "900",
    color: C.green,
  },

  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  sortText: {
    fontSize: 12,
    fontWeight: "900",
    color: C.blue,
  },

  categoryAnalysisCard: {
    backgroundColor: C.card,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: C.border,
    padding: 13,
    marginBottom: 11,
  },

  categoryTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  categoryMainInfo: { flex: 1 },

  categoryTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: C.text,
  },

  categorySubtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#52617F",
  },

  attemptRow: { marginTop: 10 },

  attemptLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#73829A",
  },

  attemptValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "900",
    color: C.green,
  },

  categoryRightStats: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
  },

  miniStat: {
    alignItems: "center",
    marginHorizontal: 6,
  },

  miniStatLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#52617F",
  },

  miniStatValue: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
  },

  cardDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 12,
  },

  categoryBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },

  dotLabel: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  dotText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#52617F",
    marginRight: 5,
  },

  dotValue: {
    fontSize: 12,
    fontWeight: "900",
    color: C.text,
  },

  accuracyPill: {
    marginLeft: "auto",
    borderRadius: 20,
    backgroundColor: C.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  accuracyText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.green,
  },

  subjectAnalysisCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 13,
    marginBottom: 10,
  },

  subjectLeftRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  subjectTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
  },

  subjectSubtitle: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#52617F",
  },

  subjectPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9,
  },

  subjectPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFCFF",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.border,
  },

  subjectPillEmoji: { fontSize: 11 },

  subjectPillText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "900",
    color: "#405174",
  },

  addTestCard: {
    marginTop: 6,
    backgroundColor: "#F3FFFB",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#BFF5E7",
    borderStyle: "dashed",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  disabledCard: { opacity: 0.55 },

  addCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },

  addTestTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: C.green,
  },

  addTestSub: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#4E5D80",
  },

  emptyBox: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 35,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  emptyEmoji: { fontSize: 36 },

  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
  },

  emptySub: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
    textAlign: "center",
  },
});
