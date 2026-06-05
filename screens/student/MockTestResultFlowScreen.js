

import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  TouchableOpacity,
  ScrollView,
  Platform,
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
  primary: "#007C78",
  primaryDark: "#006864",
  primaryLight: "#E7F7F4",
  white: "#FFFFFF",
  green: "#16A34A",
  red: "#EF4444",
  blue: "#2563EB",
  orange: "#F97316",
  grey: "#6B7280",
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatTime(seconds) {
  if (typeof seconds === "string") return seconds;

  const s = Math.max(Number(seconds || 0), 0);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

function normalizeOptions(options, optionMap) {
  if (Array.isArray(options)) {
    return options.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (options && typeof options === "object") {
    return ["A", "B", "C", "D"]
      .map((key) => options[key])
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  if (optionMap && typeof optionMap === "object") {
    return ["A", "B", "C", "D"]
      .map((key) => optionMap[key])
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  return [];
}

function getAnswerFromCorrectKey(correctAnswer, optionsArray, optionMap) {
  if (!correctAnswer) return "";

  const key = String(correctAnswer).trim();

  if (optionMap && optionMap[key]) return optionMap[key];

  if (key === "A") return optionsArray[0] || "";
  if (key === "B") return optionsArray[1] || "";
  if (key === "C") return optionsArray[2] || "";
  if (key === "D") return optionsArray[3] || "";

  return key;
}

function normalizeQuestion(question = {}, index = 0) {
  const options = normalizeOptions(question.options, question.optionMap);

  const optionMap = {
    A: question?.optionMap?.A || options[0] || "",
    B: question?.optionMap?.B || options[1] || "",
    C: question?.optionMap?.C || options[2] || "",
    D: question?.optionMap?.D || options[3] || "",
  };

  const correctAnswer =
    question.correctAnswer ||
    question.correctOption ||
    question.answerKey ||
    "";

  const answer =
    question.answer ||
    getAnswerFromCorrectKey(correctAnswer, options, optionMap) ||
    "";

  return {
    id: question.id || `question_${index + 1}`,
    question: question.question || question.title || "",
    options,
    optionMap,
    correctAnswer,
    answer,
    explanation: question.explanation || "",
    marks: Number(question.marks || 4),
  };
}

function isAnswerCorrect(question, selected) {
  if (!selected) return false;

  const cleanSelected = String(selected).trim();
  const correctText = String(question.answer || "").trim();
  const correctKey = String(question.correctAnswer || "").trim();
  const correctFromMap = question.optionMap?.[correctKey];

  return (
    cleanSelected === correctText ||
    cleanSelected === correctKey ||
    cleanSelected === correctFromMap
  );
}

function getPerformanceText(accuracy) {
  if (accuracy >= 85) return "Excellent Performance! 🎉";
  if (accuracy >= 65) return "Good Performance! 👍";
  if (accuracy >= 40) return "Keep Practicing! 📚";
  return "Needs More Practice 💪";
}

function getPerformanceColor(accuracy) {
  if (accuracy >= 65) return C.green;
  if (accuracy >= 40) return C.orange;
  return C.red;
}

export function MockTestSubmittedScreen({ navigation, route }) {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );

    animation.start();

    const timer = setTimeout(() => {
      navigation.replace("MockTestResult", route?.params || {});
    }, 2000);

    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [navigation, route?.params, rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.submittedContainer}>
        <View style={styles.submittedCard}>
          <View style={styles.submittedIconCircle}>
            <MaterialCommunityIcons
              name="clipboard-check-outline"
              size={50}
              color={C.primary}
            />
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={15} color={C.white} />
            </View>
          </View>

          <Text style={styles.submittedTitle}>Test Submitted!</Text>
          <Text style={styles.submittedSubtitle}>
            Please wait while we calculate your result...
          </Text>

          <View style={styles.timerWrap}>
            <Animated.View
              style={[styles.circleBorder, { transform: [{ rotate: spin }] }]}
            />
            <Text style={styles.timerText}>2s</Text>
          </View>

          <View style={styles.points}>
            {[
              "Calculating your performance",
              "Analyzing teacher-added answers",
              "Calculating score",
              "Generating report",
            ].map((item) => (
              <View key={item} style={styles.pointRow}>
                <Ionicons name="checkmark" size={14} color={C.primary} />
                <Text style={styles.pointText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="flash-outline" size={23} color={C.blue} />
            <Text style={styles.infoText}>
              Result will be shown in 2 seconds.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function MockTestResultScreen({ navigation, route }) {
  const { saveMockTestResult } = useAppContext();

  const params = route?.params || {};

  const testTitle = params?.testTitle || params?.test?.title || "Mock Test";

  const categoryTitle =
    params?.categoryTitle ||
    params?.category ||
    params?.test?.categoryTitle ||
    "Mock Tests";

  const subjectName =
    params?.subjectName || params?.test?.subjectName || "Subject";

  const testId = params?.testId || params?.test?.id || params?.test?.testId || "";

  const selectedAnswers = params?.selectedAnswers || {};

  const questions = useMemo(() => {
    const raw =
      safeArray(params?.questions).length > 0
        ? params.questions
        : safeArray(params?.questionList).length > 0
        ? params.questionList
        : safeArray(params?.test?.questionList);

    return raw.map((item, index) => normalizeQuestion(item, index));
  }, [params?.questions, params?.questionList, params?.test?.questionList]);

  const result = useMemo(() => {
    let correct = 0;
    let wrong = 0;

    questions.forEach((q) => {
      const selected = selectedAnswers[q.id];

      if (!selected) return;

      if (isAnswerCorrect(q, selected)) {
        correct += 1;
      } else {
        wrong += 1;
      }
    });

    const totalQuestions = questions.length;
    const attempted = Object.keys(selectedAnswers).length;
    const unattempted = Math.max(totalQuestions - attempted, 0);

    const totalMarks = totalQuestions * 4;
    const correctMarks = correct * 4;
    const negativeMarks = wrong;
    const finalScore = correctMarks - negativeMarks;

    const accuracy =
      attempted === 0 ? 0 : Math.round((correct / attempted) * 1000) / 10;

    const percentage =
      totalMarks === 0 ? 0 : Math.round((finalScore / totalMarks) * 1000) / 10;

    return {
      correct,
      wrong,
      unattempted,
      attempted,
      totalQuestions,
      totalMarks,
      correctMarks,
      finalScore,
      negativeMarks,
      accuracy,
      percentage,
      percentile: totalQuestions > 0 ? "92.36" : "0",
      rank: totalQuestions > 0 ? "125/2500" : "-",
      timeTaken: formatTime(params?.timeTaken || 0),
    };
  }, [questions, selectedAnswers, params?.timeTaken]);

  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    if (!saveMockTestResult) return;

    savedRef.current = true;

    saveMockTestResult({
      testId,
      testTitle,
      categoryTitle,
      subjectName,
      test: params?.test,
      questions,
      selectedAnswers,
      timeTaken: params?.timeTaken || 0,
    });
  }, [
    saveMockTestResult,
    testId,
    testTitle,
    categoryTitle,
    subjectName,
    params?.test,
    params?.timeTaken,
    questions,
    selectedAnswers,
  ]);

  const performanceText = getPerformanceText(result.accuracy);
  const performanceColor = getPerformanceColor(result.accuracy);

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation.navigate("StudentDashboard");
    }
  };

  const goDashboard = () => {
    navigation.navigate("StudentDashboard");
  };

  const openAnswers = () => {
    navigation.navigate("MockTestAnswers", {
      ...params,
      testId,
      testTitle,
      categoryTitle,
      subjectName,
      questions,
      questionList: questions,
      selectedAnswers,
      result,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.resultContainer}>
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

          <TouchableOpacity activeOpacity={0.75} style={styles.headerIcon}>
            <Ionicons name="share-outline" size={21} color={C.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultScrollContent}
        >
          <View style={styles.scoreCard}>
            <Text style={styles.yourScore}>Your Score</Text>

            <Text style={[styles.bigScore, { color: performanceColor }]}>
              {result.finalScore}
              <Text style={styles.totalScore}>/{result.totalMarks}</Text>
            </Text>

            <Text style={[styles.performanceText, { color: performanceColor }]}>
              {performanceText}
            </Text>

            <View style={styles.testMetaBox}>
              <Text style={styles.testMetaText} numberOfLines={1}>
                {categoryTitle} • {subjectName}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.resultThreeRow}>
              <View style={styles.resultMiniBox}>
                <Text style={styles.miniLabel}>Correct</Text>
                <Text style={[styles.miniValue, { color: C.green }]}>
                  {result.correct}
                </Text>
              </View>

              <View style={styles.verticalLine} />

              <View style={styles.resultMiniBox}>
                <Text style={styles.miniLabel}>Wrong</Text>
                <Text style={[styles.miniValue, { color: C.red }]}>
                  {result.wrong}
                </Text>
              </View>

              <View style={styles.verticalLine} />

              <View style={styles.resultMiniBox}>
                <Text style={styles.miniLabel}>Unattempted</Text>
                <Text style={styles.miniValue}>{result.unattempted}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.resultThreeRow}>
              <View style={styles.resultMiniBox}>
                <Text style={styles.miniLabel}>Accuracy</Text>
                <Text style={styles.miniValue}>{result.accuracy}%</Text>
              </View>

              <View style={styles.verticalLine} />

              <View style={styles.resultMiniBox}>
                <Text style={styles.miniLabel}>Attempted</Text>
                <Text style={styles.miniValue}>{result.attempted}</Text>
              </View>

              <View style={styles.verticalLine} />

              <View style={styles.resultMiniBox}>
                <Text style={styles.miniLabel}>Percentage</Text>
                <Text style={styles.miniValue}>{result.percentage}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>Performance Overview</Text>

            <View style={styles.overviewRow}>
              <Text style={styles.overviewLabel}>Total Questions</Text>
              <Text style={styles.overviewValue}>{result.totalQuestions}</Text>
            </View>

            <View style={styles.overviewRow}>
              <Text style={styles.overviewLabel}>Total Marks</Text>
              <Text style={styles.overviewValue}>{result.totalMarks}</Text>
            </View>

            <View style={styles.overviewRow}>
              <Text style={styles.overviewLabel}>Time Taken</Text>
              <Text style={styles.overviewValue}>{result.timeTaken}</Text>
            </View>

            <View style={styles.overviewRow}>
              <Text style={styles.overviewLabel}>Correct Marks</Text>
              <Text style={[styles.overviewValue, { color: C.green }]}>
                +{result.correctMarks}
              </Text>
            </View>

            <View style={[styles.overviewRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.overviewLabel}>Negative Marks</Text>
              <Text style={[styles.overviewValue, { color: C.red }]}>
                -{result.negativeMarks}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.primaryBtn}
            onPress={openAnswers}
          >
            <Text style={styles.primaryBtnText}>View Answers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.outlineBtn}
            onPress={goDashboard}
          >
            <Text style={styles.outlineBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <StudentBottomNavigation navigation={navigation} active="Home" />
    </SafeAreaView>
  );
}

export default MockTestSubmittedScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  submittedContainer: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 20 : 8,
    justifyContent: "center",
  },

  submittedCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 24,
    paddingVertical: 42,
    alignItems: "center",
  },

  submittedIconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  checkBadge: {
    position: "absolute",
    right: 10,
    bottom: 14,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },

  submittedTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: C.primary,
  },

  submittedSubtitle: {
    marginTop: 9,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
  },

  timerWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 34,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  circleBorder: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: "#DDE5EA",
    borderTopColor: C.primary,
    borderLeftColor: C.primary,
  },

  timerText: {
    fontSize: 33,
    fontWeight: "900",
    color: C.primary,
  },

  points: {
    width: "100%",
    marginTop: 4,
  },

  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
    paddingLeft: 42,
  },

  pointText: {
    marginLeft: 10,
    fontSize: 12.5,
    fontWeight: "700",
    color: C.text,
  },

  infoBox: {
    marginTop: 26,
    width: "100%",
    minHeight: 62,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    fontWeight: "800",
    color: C.text,
  },

  resultContainer: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 14 : 4,
    paddingBottom: Platform.OS === "ios" ? 100 : 90,
  },

  resultScrollContent: {
    paddingBottom: 24,
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

  scoreCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingTop: 22,
    paddingBottom: 18,
    marginTop: 10,
    alignItems: "center",
  },

  yourScore: {
    fontSize: 11,
    fontWeight: "800",
    color: C.muted,
  },

  bigScore: {
    marginTop: 8,
    fontSize: 37,
    lineHeight: 44,
    fontWeight: "900",
  },

  totalScore: {
    fontSize: 23,
    fontWeight: "900",
    color: C.text,
  },

  performanceText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "900",
  },

  testMetaBox: {
    marginTop: 10,
    minHeight: 30,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  testMetaText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.primary,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: C.border,
    marginTop: 18,
    marginBottom: 14,
  },

  resultThreeRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  resultMiniBox: {
    flex: 1,
    alignItems: "center",
  },

  miniLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.muted,
    marginBottom: 5,
  },

  miniValue: {
    fontSize: 16,
    fontWeight: "900",
    color: C.text,
  },

  verticalLine: {
    width: 1,
    height: 38,
    backgroundColor: C.border,
  },

  overviewCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingTop: 16,
  },

  overviewTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: C.text,
    marginBottom: 8,
  },

  overviewRow: {
    minHeight: 46,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  overviewLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.text,
  },

  overviewValue: {
    fontSize: 12,
    fontWeight: "900",
    color: C.text,
  },

  primaryBtn: {
    height: 52,
    borderRadius: 10,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  primaryBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: C.white,
  },

  outlineBtn: {
    height: 52,
    borderRadius: 10,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  outlineBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: C.primary,
  },
});