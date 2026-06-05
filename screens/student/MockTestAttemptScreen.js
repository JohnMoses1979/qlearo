

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  blue: "#2563EB",
  orange: "#F97316",
  green: "#22C55E",
  grey: "#A3AAB8",
  white: "#FFFFFF",
  red: "#EF4444",
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getDurationSeconds(duration) {
  if (typeof duration === "number") return duration * 60;
  const text = String(duration || "60 min").toLowerCase();
  const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(num) && num > 0 ? num * 60 : 3600;
}

function formatTime(seconds) {
  const s = Math.max(Number(seconds || 0), 0);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

function normalizeOptions(options) {
  if (Array.isArray(options)) {
    return options.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (options && typeof options === "object") {
    return ["A", "B", "C", "D"]
      .map((key) => options[key])
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  return [];
}

function getAnswerFromCorrectKey(correctAnswer, optionsArray) {
  if (!correctAnswer) return "";

  const key = String(correctAnswer).trim();

  if (key === "A") return optionsArray[0] || "";
  if (key === "B") return optionsArray[1] || "";
  if (key === "C") return optionsArray[2] || "";
  if (key === "D") return optionsArray[3] || "";

  return key;
}

function normalizeQuestion(question = {}, index = 0) {
  const options = normalizeOptions(question.options || question.optionMap);

  const correctAnswer =
    question.correctAnswer ||
    question.correctOption ||
    question.answerKey ||
    "";

  const answer =
    question.answer || getAnswerFromCorrectKey(correctAnswer, options) || "";

  return {
    id: question.id || `question_${index + 1}`,
    question: question.question || question.title || "",
    options,
    optionMap: {
      A: options[0] || "",
      B: options[1] || "",
      C: options[2] || "",
      D: options[3] || "",
    },
    correctAnswer,
    answer,
    explanation: question.explanation || "",
    marks: Number(question.marks || 4),
  };
}

function getQuestionListFromParams(params, contextTest) {
  if (Array.isArray(params?.questionList)) return params.questionList;
  if (Array.isArray(params?.questions)) return params.questions;
  if (Array.isArray(params?.test?.questionList)) return params.test.questionList;
  if (Array.isArray(contextTest?.questionList)) return contextTest.questionList;
  return [];
}

export default function MockTestAttemptScreen({ navigation, route }) {
  const { getMockTestById } = useAppContext();

  const params = route?.params || {};
  const testId = params?.testId || params?.test?.id || params?.test?.testId;

  const contextTest = useMemo(() => {
    if (!testId || !getMockTestById) return null;
    return getMockTestById(testId);
  }, [getMockTestById, testId]);

  const rawQuestionList = useMemo(
    () => getQuestionListFromParams(params, contextTest),
    [params, contextTest]
  );

  const questions = useMemo(
    () => rawQuestionList.map((item, index) => normalizeQuestion(item, index)),
    [rawQuestionList]
  );

  const categoryId =
    params?.categoryId || params?.category || contextTest?.categoryId || "mock";

  const categoryTitle =
    params?.categoryTitle ||
    params?.category ||
    contextTest?.categoryTitle ||
    contextTest?.category ||
    "Mock Tests";

  const subjectName =
    params?.subjectName ||
    params?.subject?.name ||
    contextTest?.subjectName ||
    "Subject";

  const testTitle =
    params?.testTitle || params?.test?.title || contextTest?.title || "Mock Test";

  const testType =
    params?.testType ||
    params?.test?.type ||
    params?.test?.level ||
    contextTest?.level ||
    "Practice";

  const duration =
    params?.duration ||
    params?.test?.duration ||
    params?.test?.time ||
    contextTest?.duration ||
    contextTest?.time ||
    "60 min";

  const totalDuration = useMemo(() => getDurationSeconds(duration), [duration]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [reviewQuestions, setReviewQuestions] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalDuration);

  const isSubmittedRef = useRef(false);
  const selectedAnswersRef = useRef({});
  const reviewQuestionsRef = useRef({});
  const timeLeftRef = useRef(totalDuration);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    reviewQuestionsRef.current = reviewQuestions;
  }, [reviewQuestions]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const currentQuestion = questions[currentIndex] || null;
  const selectedOption = currentQuestion
    ? selectedAnswers[currentQuestion.id]
    : null;

  const answeredCount = Object.keys(selectedAnswers).length;

  const submitTest = () => {
    if (isSubmittedRef.current) return;

    isSubmittedRef.current = true;
    setIsSubmitted(true);

    navigation.navigate("MockTestSubmitted", {
      ...params,
      testId,
      testTitle,
      testType,
      categoryId,
      categoryTitle,
      category: categoryTitle,
      subjectName,
      duration,
      questions,
      questionList: questions,
      selectedAnswers: selectedAnswersRef.current,
      reviewQuestions: reviewQuestionsRef.current,
      totalDuration,
      timeLeft: timeLeftRef.current,
      timeTaken: totalDuration - timeLeftRef.current,
      test: {
        ...(contextTest || {}),
        ...(params?.test || {}),
        id: testId,
        testId,
        title: testTitle,
        categoryId,
        categoryTitle,
        category: categoryTitle,
        subjectName,
        duration,
        time: duration,
        type: testType,
        questions: questions.length,
        questionList: questions,
      },
    });
  };

  useEffect(() => {
    if (isPaused || isSubmitted || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(submitTest, 0);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isSubmitted, questions.length]);

  const handleSelectOption = (option) => {
    if (!currentQuestion) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleClear = () => {
    if (!currentQuestion) return;

    setSelectedAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQuestion.id];
      return updated;
    });
  };

  const handleReview = () => {
    if (!currentQuestion) return;

    setReviewQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleSaveNext = () => {
    if (questions.length === 0) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      submitTest();
    }
  };

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation.navigate("StudentDashboard");
    }
  };

  const getQuestionStatus = (item) => {
    if (reviewQuestions[item.id]) return "review";
    if (selectedAnswers[item.id]) return "answered";
    return "notAnswered";
  };

  const renderQuestionNumber = ({ item, index }) => {
    const status = getQuestionStatus(item);
    const active = index === currentIndex;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.questionNumber,
          active && styles.activeQuestionNumber,
          status === "answered" && !active && styles.answeredQuestionNumber,
          status === "review" && !active && styles.reviewQuestionNumber,
        ]}
        onPress={() => setCurrentIndex(index)}
      >
        <Text
          style={[
            styles.questionNumberText,
            active && styles.activeQuestionNumberText,
            status === "answered" && !active && styles.answeredQuestionNumberText,
            status === "review" && !active && styles.reviewQuestionNumberText,
          ]}
        >
          {index + 1}
        </Text>
      </TouchableOpacity>
    );
  };

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

        <View style={styles.containerWithBottomNav}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerIcon} onPress={goBackSafe}>
              <Ionicons name="chevron-back" size={22} color={C.text} />
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1}>
              {testTitle}
            </Text>

            <View style={styles.headerIcon} />
          </View>

          <View style={styles.emptyBox}>
            <Ionicons name="alert-circle-outline" size={46} color={C.red} />
            <Text style={styles.emptyTitle}>No Questions Added</Text>
            <Text style={styles.emptyText}>
              This mock test does not have questions yet. Please ask your teacher
              to add questions and publish again.
            </Text>

            <TouchableOpacity style={styles.backBtn} onPress={goBackSafe}>
              <Text style={styles.backBtnText}>Back to Tests</Text>
            </TouchableOpacity>
          </View>
        </View>

        <StudentBottomNavigation navigation={navigation} active="Home" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.containerWithBottomNav}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIcon} onPress={goBackSafe}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {testTitle}
          </Text>

          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="bookmark-outline" size={21} color={C.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.topCards}>
          <View style={[styles.timeCard, timeLeft <= 60 && styles.dangerCard]}>
            <Text style={styles.smallLabel}>Time Left</Text>
            <Text style={[styles.timeText, timeLeft <= 60 && styles.dangerText]}>
              {formatTime(timeLeft)}
            </Text>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.smallLabel}>Questions</Text>

            <View style={styles.questionPauseRow}>
              <Text style={styles.timeText}>
                {currentIndex + 1}/{questions.length}
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.pauseBtn}
                onPress={() => setIsPaused((prev) => !prev)}
              >
                <Ionicons
                  name={isPaused ? "play" : "pause"}
                  size={15}
                  color={C.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaItem}>
            <Ionicons name="folder-outline" size={14} color={C.primary} />
            <Text style={styles.metaText}>{categoryTitle}</Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="book-outline" size={14} color={C.primary} />
            <Text style={styles.metaText}>{subjectName}</Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="ribbon-outline" size={14} color={C.primary} />
            <Text style={styles.metaText}>{testType}</Text>
          </View>
        </View>

        {isPaused && (
          <View style={styles.pausedBanner}>
            <Ionicons name="pause-circle-outline" size={16} color={C.primary} />
            <Text style={styles.pausedText}>Test paused. Tap play to continue.</Text>
          </View>
        )}

        <FlatList
          horizontal
          data={questions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderQuestionNumber}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.numberList}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>
              Q{currentIndex + 1}. {currentQuestion.question}
            </Text>

            {safeArray(currentQuestion.options).map((option, index) => {
              const selected = selectedOption === option;

              return (
                <TouchableOpacity
                  key={`${currentQuestion.id}_${index}_${option}`}
                  activeOpacity={0.85}
                  style={[styles.optionCard, selected && styles.selectedOption]}
                  onPress={() => handleSelectOption(option)}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterSelected,
                    ]}
                  >
                    {selected && <View style={styles.radioInner} />}
                  </View>

                  <Text style={styles.optionText}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.reviewBtn} onPress={handleReview}>
                <Text style={styles.reviewText}>
                  {reviewQuestions[currentQuestion.id]
                    ? "Remove Review"
                    : "Mark for Review"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNext}>
              <Text style={styles.saveText}>
                {currentIndex === questions.length - 1
                  ? "Submit Test"
                  : "Save & Next"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: C.green }]} />
              <Text style={styles.legendText}>Answered</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: C.orange }]} />
              <Text style={styles.legendText}>Review</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: C.grey }]} />
              <Text style={styles.legendText}>Not Answered</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              Answered {answeredCount} of {questions.length} questions
            </Text>

            <Text style={styles.summarySub}>
              Time Taken: {formatTime(totalDuration - timeLeft)}
            </Text>
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

  containerWithBottomNav: {
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

  topCards: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },

  timeCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 13,
  },

  dangerCard: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },

  dangerText: {
    color: C.red,
  },

  questionCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 13,
  },

  smallLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.muted,
    marginBottom: 6,
  },

  timeText: {
    fontSize: 20,
    fontWeight: "900",
    color: C.text,
  },

  questionPauseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pauseBtn: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  metaCard: {
    minHeight: 40,
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  metaItem: {
    minHeight: 24,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  metaText: {
    marginLeft: 4,
    fontSize: 10.5,
    fontWeight: "800",
    color: C.primary,
  },

  pausedBanner: {
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: "#BFE7E2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  pausedText: {
    marginLeft: 8,
    fontSize: 11.5,
    fontWeight: "800",
    color: C.primary,
  },

  numberList: {
    gap: 8,
    paddingBottom: 12,
  },

  questionNumber: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  activeQuestionNumber: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },

  answeredQuestionNumber: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },

  reviewQuestionNumber: {
    backgroundColor: "#FFEDD5",
    borderColor: "#FED7AA",
  },

  questionNumberText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.text,
  },

  activeQuestionNumberText: {
    color: C.white,
  },

  answeredQuestionNumberText: {
    color: "#15803D",
  },

  reviewQuestionNumberText: {
    color: "#C2410C",
  },

  scrollContent: {
    paddingBottom: 24,
  },

  questionBox: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 15,
    marginTop: 4,
  },

  questionText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "900",
    color: C.text,
    marginBottom: 18,
  },

  optionCard: {
    minHeight: 48,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 11,
  },

  selectedOption: {
    borderColor: C.blue,
    backgroundColor: "#F8FBFF",
  },

  radioOuter: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#AAB2C0",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterSelected: {
    borderColor: C.blue,
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.blue,
  },

  optionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    color: C.text,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },

  clearBtn: {
    flex: 1,
    height: 44,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  reviewBtn: {
    flex: 1,
    height: 44,
    borderRadius: 9,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  clearText: {
    fontSize: 12,
    fontWeight: "900",
    color: C.text,
  },

  reviewText: {
    fontSize: 12,
    fontWeight: "900",
    color: C.primary,
  },

  saveBtn: {
    height: 48,
    borderRadius: 9,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  saveText: {
    fontSize: 13,
    fontWeight: "900",
    color: C.white,
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    paddingHorizontal: 8,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },

  legendText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: C.muted,
  },

  summaryCard: {
    marginTop: 18,
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    alignItems: "center",
  },

  summaryText: {
    fontSize: 12,
    fontWeight: "900",
    color: C.text,
  },

  summarySub: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
  },

  emptyBox: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "900",
    color: C.text,
  },

  emptyText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
    lineHeight: 18,
    textAlign: "center",
  },

  backBtn: {
    height: 46,
    minWidth: 140,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  backBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: C.white,
  },
});