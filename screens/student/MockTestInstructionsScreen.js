

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
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
  primaryDark: "#0B5F59",
  primaryLight: "#E7F7F4",
  white: "#FFFFFF",
  red: "#EF4444",
  redLight: "#FEECEC",
  green: "#16A34A",
  greenLight: "#EAF8EF",
  orange: "#F97316",
  orangeLight: "#FFF3E8",
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getQuestionListFromParams(routeParams, testFromContext) {
  if (Array.isArray(routeParams?.questionList)) return routeParams.questionList;
  if (Array.isArray(routeParams?.questions)) return routeParams.questions;
  if (Array.isArray(routeParams?.test?.questionList)) return routeParams.test.questionList;
  if (Array.isArray(testFromContext?.questionList)) return testFromContext.questionList;

  return [];
}

function getQuestionCount(routeParams, questionList, testFromContext) {
  if (questionList.length > 0) return questionList.length;
  if (typeof routeParams?.questions === "number") return routeParams.questions;
  if (typeof routeParams?.test?.questions === "number") return routeParams.test.questions;
  if (typeof testFromContext?.questions === "number") return testFromContext.questions;

  return 0;
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
  if (level === "Hard") return C.redLight;
  return C.primaryLight;
}

export default function MockTestInstructionsScreen({ navigation, route }) {
  const {
    getMockTestById,
    requireStudyAccess,
    consumeStudyAccess,
  } = useAppContext();

  const params = route?.params || {};
  const testId = params?.testId || params?.test?.id || params?.test?.testId;

  const testFromContext = useMemo(() => {
    if (!testId || !getMockTestById) return null;
    return getMockTestById(testId);
  }, [getMockTestById, testId]);

  const test = params?.test || testFromContext || {};

  const questionList = useMemo(
    () => getQuestionListFromParams(params, testFromContext),
    [params, testFromContext]
  );

  const testTitle =
    params?.testTitle ||
    test?.title ||
    testFromContext?.title ||
    "Mock Test";

  const categoryTitle =
    params?.categoryTitle ||
    params?.category ||
    test?.categoryTitle ||
    test?.category ||
    testFromContext?.categoryTitle ||
    "Mock Tests";

  const subjectName =
    params?.subjectName ||
    params?.subject?.name ||
    test?.subjectName ||
    testFromContext?.subjectName ||
    "Subject";

  const testType =
    params?.testType ||
    test?.testType ||
    test?.type ||
    test?.level ||
    testFromContext?.level ||
    "Practice";

  const duration =
    params?.duration ||
    test?.duration ||
    test?.time ||
    testFromContext?.duration ||
    testFromContext?.time ||
    "30 min";

  const level =
    test?.level ||
    params?.level ||
    testFromContext?.level ||
    "Easy";

  const questionCount = getQuestionCount(params, questionList, testFromContext);
  const hasQuestions = questionList.length > 0;

  const normalizedTest = {
    ...testFromContext,
    ...test,
    id: test?.id || test?.testId || testFromContext?.id || testId,
    testId: test?.testId || test?.id || testFromContext?.testId || testId,
    title: testTitle,
    categoryTitle,
    category: categoryTitle,
    subjectName,
    questions: questionCount,
    questionList,
    duration,
    time: duration,
    level,
    type: testType,
  };

  const startTest = () => {
    if (!hasQuestions) return;

    try {
      const access = requireStudyAccess?.("Mock Test");

      if (!access?.allowed) {
        global.showAlert(
          "Premium Required",
          "You have used your 3 free study actions. Please choose a subscription plan to continue."
        );
        navigation?.navigate?.("SubscriptionPlans");
        return;
      }

      if (!access?.premium) {
        consumeStudyAccess?.("Mock Test");
      }
    } catch (error) {
      global.showAlert(
        "Premium Required",
        error?.message || "Please choose a subscription plan to continue."
      );
      navigation?.navigate?.("SubscriptionPlans");
      return;
    }

    navigation.navigate("MockTestAttempt", {
      ...params,
      testId: normalizedTest.id,
      testTitle,
      categoryTitle,
      category: categoryTitle,
      subjectName,
      testType,
      duration,
      level,
      test: normalizedTest,
      questions: questionList,
      questionList,
      totalQuestions: questionList.length,
    });
  };

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation.navigate("StudentDashboard");
    }
  };

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
            {testTitle}
          </Text>

          <View style={styles.headerIcon} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <View style={styles.mainIconCircle}>
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={45}
                color={C.primary}
              />
            </View>

            <Text style={styles.title}>{testTitle}</Text>

            <Text style={styles.subTitle}>
              {categoryTitle} • {subjectName} • {testType}
            </Text>

            <View style={styles.levelWrap}>
              <View style={[styles.levelPill, { backgroundColor: getLevelBg(level) }]}>
                <Text style={[styles.levelText, { color: getLevelColor(level) }]}>
                  {level}
                </Text>
              </View>
            </View>

            <View style={styles.statsBox}>
              <View style={styles.statRow}>
                <View style={styles.smallIcon}>
                  <MaterialCommunityIcons
                    name="clipboard-text-outline"
                    size={17}
                    color={C.primary}
                  />
                </View>

                <Text style={styles.statText}>{questionCount}</Text>
                <Text style={styles.statLabel}>Total Questions</Text>
              </View>

              <View style={styles.statRow}>
                <View style={styles.smallIcon}>
                  <Ionicons name="time-outline" size={17} color={C.primary} />
                </View>

                <Text style={styles.statText}>{duration}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>

              <View style={styles.statRow}>
                <View style={styles.smallIcon}>
                  <Ionicons name="timer-outline" size={17} color={C.primary} />
                </View>

                <Text style={styles.statText}>2 Seconds</Text>
                <Text style={styles.statLabel}>Result</Text>
              </View>
            </View>

            {!hasQuestions && (
              <View style={styles.warningBox}>
                <Ionicons name="alert-circle-outline" size={20} color={C.red} />
                <Text style={styles.warningText}>
                  No questions are added for this test yet. Please ask your teacher
                  to add questions before starting.
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.instructionTitle}>Instructions</Text>

            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                All questions are compulsory, but you can leave a question and submit.
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                You can review answers before submitting.
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Result will be shown in 2 seconds after submission.
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Your answers will be compared with teacher-added correct answers.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              style={[
                styles.startButton,
                !hasQuestions && styles.startButtonDisabled,
              ]}
              onPress={startTest}
            >
              <Text style={styles.startButtonText}>
                {hasQuestions ? "Start Test" : "Questions Not Added"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.backButton}
              onPress={goBackSafe}
            >
              <Text style={styles.backButtonText}>Back to Tests</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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

  scrollContent: {
    paddingTop: 10,
    paddingBottom: 28,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 22,
  },

  mainIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 22,
  },

  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
  },

  subTitle: {
    textAlign: "center",
    fontSize: 11.5,
    fontWeight: "700",
    color: C.muted,
    marginTop: 10,
    marginBottom: 12,
  },

  levelWrap: {
    alignItems: "center",
    marginBottom: 22,
  },

  levelPill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  levelText: {
    fontSize: 11,
    fontWeight: "900",
  },

  statsBox: {
    backgroundColor: "#F1FAFB",
    borderWidth: 1,
    borderColor: "#D9EEF0",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
  },

  smallIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  statText: {
    fontSize: 12.5,
    fontWeight: "900",
    color: C.text,
    marginRight: 5,
  },

  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.text,
  },

  warningBox: {
    marginTop: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#F7CACA",
    backgroundColor: C.redLight,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "700",
    color: C.red,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 24,
  },

  instructionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: C.text,
    marginBottom: 10,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 11,
  },

  bullet: {
    fontSize: 13,
    fontWeight: "900",
    color: C.text,
    marginRight: 8,
  },

  bulletText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "600",
    color: C.text,
  },

  startButton: {
    height: 56,
    borderRadius: 11,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  startButtonDisabled: {
    backgroundColor: "#A7B4C2",
  },

  startButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: C.white,
  },

  backButton: {
    height: 48,
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: C.text,
  },
});
