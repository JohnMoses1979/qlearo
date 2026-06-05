


// screens/teacher/TeacherMockTestAddScreen.js

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

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
  purple: "#7C4DFF",
  purpleSoft: "#F2ECFF",
  pink: "#FF4FA3",
  pinkSoft: "#FFF0F8",
  orange: "#FF7A1A",
  orangeSoft: "#FFF1E8",
  danger: "#FF3B7A",
};

function makeId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

function getLevelColor(level) {
  if (level === "Easy") return C.green;
  if (level === "Medium") return C.orange;
  return C.danger;
}

function getLevelSoft(level) {
  if (level === "Easy") return C.greenSoft;
  if (level === "Medium") return C.orangeSoft;
  return C.pinkSoft;
}

function getOptionAnswer(correctAnswer, options) {
  if (correctAnswer === "A") return options.A;
  if (correctAnswer === "B") return options.B;
  if (correctAnswer === "C") return options.C;
  if (correctAnswer === "D") return options.D;
  return options.A;
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#95A0B5"
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMulti]}
      />
    </View>
  );
}

function OptionInput({ label, value, onChangeText, selected, onSelect }) {
  return (
    <View style={styles.optionRow}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.optionSelect, selected && styles.optionSelectActive]}
        onPress={onSelect}
      >
        <Text style={[styles.optionLetter, selected && styles.optionLetterActive]}>
          {label}
        </Text>
      </TouchableOpacity>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={`Option ${label}`}
        placeholderTextColor="#95A0B5"
        style={styles.optionInput}
      />
    </View>
  );
}

export default function TeacherMockTestAddScreen({ navigation, route }) {
  const { currentUser, saveTeacherMockTest } = useAppContext();

  const category =
    route?.params?.category ||
    route?.params?.categoryTitle ||
    route?.params?.categoryName ||
    "";

  const subject = route?.params?.subject || null;

  const nextNo = route?.params?.nextNo || "01";
  const viewTest = route?.params?.test || null;
  const mode = route?.params?.mode || "create";

  const [testForm, setTestForm] = useState({
    title: viewTest?.title || "",
    sub: viewTest?.sub || "",
    time: viewTest?.time || viewTest?.duration || "30 min",
    level: viewTest?.level || "Easy",
  });

  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");

  const [questions, setQuestions] = useState(() => {
    if (!Array.isArray(viewTest?.questionList)) return [];

    return viewTest.questionList.map((item, index) => {
      const optionMap = item.optionMap || item.options || {};
      const optionsArray = Array.isArray(item.options) ? item.options : null;

      const cleanOptions = {
        A: optionsArray?.[0] || optionMap.A || "",
        B: optionsArray?.[1] || optionMap.B || "",
        C: optionsArray?.[2] || optionMap.C || "",
        D: optionsArray?.[3] || optionMap.D || "",
      };

      const cleanCorrectAnswer = item.correctAnswer || "A";

      return {
        id: item.id || makeId(`question_${index + 1}`),
        question: item.question || "",
        options: cleanOptions,
        correctAnswer: cleanCorrectAnswer,
        answer: item.answer || getOptionAnswer(cleanCorrectAnswer, cleanOptions),
        explanation: item.explanation || "",
      };
    });
  });

  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const questionCount = questions.length;

  const canSaveTest = useMemo(() => {
    return testForm.title.trim().length > 0 && questions.length > 0;
  }, [testForm.title, questions.length]);

  const resetQuestionForm = () => {
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
    setExplanation("");
    setError("");
  };

  const addQuestion = () => {
    const q = questionText.trim();
    const a = optionA.trim();
    const b = optionB.trim();
    const c = optionC.trim();
    const d = optionD.trim();

    if (!q) {
      setError("Please enter question.");
      return;
    }

    if (!a || !b || !c || !d) {
      setError("Please enter all 4 options.");
      return;
    }

    const optionMap = { A: a, B: b, C: c, D: d };

    const newQuestion = {
      id: makeId("question"),
      question: q,
      options: optionMap,
      correctAnswer,
      answer: getOptionAnswer(correctAnswer, optionMap),
      explanation: explanation.trim(),
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setSavedMessage("");
    resetQuestionForm();
  };

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((item) => item.id !== id));
    setSavedMessage("");
  };

  const saveTest = async () => {
    const title = testForm.title.trim();
    const sub = testForm.sub.trim();

    if (!title) {
      setError("Please enter test title.");
      return;
    }

    if (questions.length === 0) {
      setError("Please add at least one question.");
      return;
    }

    const createdTest = {
      id: viewTest?.id || viewTest?.testId || makeId("test"),
      testId: viewTest?.testId || viewTest?.id || makeId("test"),
      no: viewTest?.no || nextNo,
      title,
      sub: sub || `${category} • ${subject?.name || "Subject"} Test`,
      questions: questions.length,
      time: testForm.time.trim() || "30 min",
      duration: testForm.time.trim() || "30 min",
      level: testForm.level,
      attempts: viewTest?.attempts || 0,
      questionList: questions,
      category,
      categoryTitle: category,
      subjectId: route?.params?.subjectId || subject?.id || "",
      subjectName: route?.params?.subjectName || subject?.name || "",
      teacherId: currentUser?.teacherId || currentUser?.id || "TEACHER_001",
      teacherName: currentUser?.name || currentUser?.teacherName || "Teacher",
      isPublished: true,
    };

    try {
      const savedTest = await saveTeacherMockTest({
        category,
        categoryTitle: category,
        subject,
        subjectId: route?.params?.subjectId || subject?.id || "",
        subjectName: route?.params?.subjectName || subject?.name || "",
        createdTest,
        test: createdTest,
        teacher: currentUser,
      });

      setError("");
      setSavedMessage("Mock test saved and published for students.");

      navigation.navigate({
        name: "TeacherMockTestList",
        params: {
          category,
          subject,
          createdTest: savedTest || createdTest,
          refresh: Date.now(),
        },
        merge: true,
      });
    } catch (error) {
      setError(error?.message || "Unable to save mock test.");
    }
  };

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("TeacherMockTestList", {
      category,
      subject,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.headerBtn}
              onPress={goBackSafe}
            >
              <Ionicons name="chevron-back" size={24} color={C.primary} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {mode === "view" ? "Edit Mock Test" : "Create Mock Test"}
              </Text>
              <Text style={styles.headerSub}>
                {category} • {subject?.name || "Subject"}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.headerBtn}
              onPress={saveTest}
            >
              <Ionicons
                name="checkmark-circle"
                size={25}
                color={canSaveTest ? C.green : C.muted}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.heroCard}>
              <View
                style={[
                  styles.emojiBox,
                  { backgroundColor: subject?.soft || C.blueSoft },
                ]}
              >
                <Text style={styles.heroEmoji}>{subject?.emoji || "🧮"}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>{subject?.name || "Subject"}</Text>

                <Text style={styles.heroSub}>Add test details and questions</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statPill}>
                    <Text style={styles.statEmoji}>📝</Text>
                    <Text style={styles.statText}>{questionCount} Questions</Text>
                  </View>

                  <View style={styles.statPill}>
                    <Text style={styles.statEmoji}>⏱️</Text>
                    <Text style={styles.statText}>{testForm.time}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Test Details</Text>

              <FormInput
                label="Test Title"
                value={testForm.title}
                onChangeText={(v) => {
                  setTestForm((p) => ({ ...p, title: v }));
                  setError("");
                  setSavedMessage("");
                }}
                placeholder="Example: Algebra Practice Test"
              />

              <FormInput
                label="Test Subtitle"
                value={testForm.sub}
                onChangeText={(v) => {
                  setTestForm((p) => ({ ...p, sub: v }));
                  setSavedMessage("");
                }}
                placeholder="Example: Class 8 • Chapter Test"
              />

              <FormInput
                label="Duration"
                value={testForm.time}
                onChangeText={(v) => {
                  setTestForm((p) => ({ ...p, time: v }));
                  setSavedMessage("");
                }}
                placeholder="Example: 30 min"
              />

              <Text style={styles.formLabel}>Difficulty Level</Text>

              <View style={styles.levelRow}>
                {["Easy", "Medium", "Hard"].map((level) => (
                  <TouchableOpacity
                    key={level}
                    activeOpacity={0.84}
                    style={[
                      styles.levelBtn,
                      { backgroundColor: getLevelSoft(level) },
                      testForm.level === level && styles.levelBtnActive,
                    ]}
                    onPress={() => {
                      setTestForm((p) => ({ ...p, level }));
                      setSavedMessage("");
                    }}
                  >
                    <Text style={[styles.levelText, { color: getLevelColor(level) }]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Add Question</Text>
                <Text style={styles.questionCount}>{questions.length} Added</Text>
              </View>

              <FormInput
                label="Question"
                value={questionText}
                onChangeText={(v) => {
                  setQuestionText(v);
                  setError("");
                }}
                placeholder="Enter your question here"
                multiline
              />

              <OptionInput label="A" value={optionA} onChangeText={(v) => { setOptionA(v); setError(""); }} selected={correctAnswer === "A"} onSelect={() => setCorrectAnswer("A")} />
              <OptionInput label="B" value={optionB} onChangeText={(v) => { setOptionB(v); setError(""); }} selected={correctAnswer === "B"} onSelect={() => setCorrectAnswer("B")} />
              <OptionInput label="C" value={optionC} onChangeText={(v) => { setOptionC(v); setError(""); }} selected={correctAnswer === "C"} onSelect={() => setCorrectAnswer("C")} />
              <OptionInput label="D" value={optionD} onChangeText={(v) => { setOptionD(v); setError(""); }} selected={correctAnswer === "D"} onSelect={() => setCorrectAnswer("D")} />

              <FormInput
                label="Explanation"
                value={explanation}
                onChangeText={(v) => {
                  setExplanation(v);
                  setError("");
                }}
                placeholder="Optional explanation for answer"
                multiline
              />

              {!!error && <Text style={styles.errorText}>{error}</Text>}

              {!!savedMessage && (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={16} color={C.green} />
                  <Text style={styles.successText}>{savedMessage}</Text>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.86}
                style={styles.addQuestionBtn}
                onPress={addQuestion}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.addQuestionText}>Add Question</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Added Questions</Text>
                <Text style={styles.questionCount}>{questions.length}</Text>
              </View>

              {questions.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyEmoji}>❓</Text>
                  <Text style={styles.emptyTitle}>No questions added</Text>
                  <Text style={styles.emptySub}>
                    Add questions before saving the test.
                  </Text>
                </View>
              ) : (
                questions.map((item, index) => (
                  <View key={item.id} style={styles.questionCard}>
                    <View style={styles.questionTop}>
                      <View style={styles.questionNo}>
                        <Text style={styles.questionNoText}>{index + 1}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.questionTitle}>{item.question}</Text>

                        <Text style={styles.answerText}>
                          Correct Answer: {item.correctAnswer} - {item.answer}
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.75}
                        style={styles.deleteBtn}
                        onPress={() => removeQuestion(item.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color={C.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveMainBtn, !canSaveTest && styles.saveMainBtnDisabled]}
              onPress={saveTest}
              activeOpacity={0.86}
            >
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveMainText}>
                {mode === "view" ? "Update Test" : "Save & Publish Test"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <TeacherBottomNavigation navigation={navigation} active="Home" />
      </KeyboardAvoidingView>
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
    paddingHorizontal: 14,
    backgroundColor: C.bg,
  },

  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 155 : 140,
  },

  header: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
  },

  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: C.text,
  },

  headerSub: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
  },

  heroCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  emojiBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  heroEmoji: {
    fontSize: 32,
  },

  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.text,
  },

  heroSub: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
  },

  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10,
  },

  statPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFCFF",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },

  statEmoji: {
    fontSize: 12,
  },

  statText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "900",
    color: "#405174",
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 15,
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: C.text,
    marginBottom: 13,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  questionCount: {
    fontSize: 12,
    fontWeight: "900",
    color: C.green,
    marginBottom: 13,
  },

  formGroup: {
    marginBottom: 13,
  },

  formLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: C.primary,
    marginBottom: 7,
  },

  input: {
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "#F9FBFF",
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
  },

  inputMulti: {
    minHeight: 88,
    textAlignVertical: "top",
    paddingTop: 13,
  },

  levelRow: {
    flexDirection: "row",
    gap: 10,
  },

  levelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },

  levelBtnActive: {
    borderColor: C.primary,
  },

  levelText: {
    fontSize: 12,
    fontWeight: "900",
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  optionSelect: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "#F2F6FC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  optionSelectActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },

  optionLetter: {
    fontSize: 13,
    fontWeight: "900",
    color: C.primary,
  },

  optionLetterActive: {
    color: "#fff",
  },

  optionInput: {
    flex: 1,
    height: 45,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "#F9FBFF",
    paddingHorizontal: 13,
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
  },

  errorText: {
    color: C.danger,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 10,
  },

  successBox: {
    minHeight: 38,
    borderRadius: 14,
    backgroundColor: C.greenSoft,
    borderWidth: 1,
    borderColor: "#BDF5DF",
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  successText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    fontWeight: "800",
    color: C.green,
  },

  addQuestionBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  addQuestionText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#fff",
  },

  emptyBox: {
    backgroundColor: "#F9FBFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 28,
    paddingHorizontal: 12,
    alignItems: "center",
  },

  emptyEmoji: {
    fontSize: 32,
  },

  emptyTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "900",
    color: C.text,
  },

  emptySub: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
    textAlign: "center",
  },

  questionCard: {
    backgroundColor: "#F9FBFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    marginBottom: 10,
  },

  questionTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  questionNo: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  questionNoText: {
    fontSize: 12,
    fontWeight: "900",
    color: C.blue,
  },

  questionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: C.text,
    lineHeight: 19,
  },

  answerText: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "800",
    color: C.green,
  },

  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: C.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  saveMainBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  saveMainBtnDisabled: {
    opacity: 0.55,
  },

  saveMainText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#fff",
  },
});
