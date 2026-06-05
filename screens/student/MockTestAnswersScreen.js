
// import React, { useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   TouchableOpacity,
//   ScrollView,
//   Platform,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppContext } from "../../context/AppContext";

// const C = {
//   bg: "#F7F9FC",
//   card: "#FFFFFF",
//   text: "#111827",
//   muted: "#6B7280",
//   border: "#E5E7EB",
//   primary: "#007C78",
//   primaryLight: "#E7F7F4",
//   green: "#16A34A",
//   greenLight: "#EAF8EF",
//   red: "#EF4444",
//   redLight: "#FEECEC",
//   orange: "#F97316",
//   orangeLight: "#FFF3E8",
//   grey: "#6B7280",
//   greyLight: "#F1F5F9",
//   blue: "#2563EB",
//   white: "#FFFFFF",
// };

// function safeArray(value) {
//   return Array.isArray(value) ? value : [];
// }

// function normalizeOptions(options, optionMap) {
//   if (Array.isArray(options)) {
//     return options.map((item) => String(item || "").trim()).filter(Boolean);
//   }

//   if (options && typeof options === "object") {
//     return ["A", "B", "C", "D"]
//       .map((key) => options[key])
//       .map((item) => String(item || "").trim())
//       .filter(Boolean);
//   }

//   if (optionMap && typeof optionMap === "object") {
//     return ["A", "B", "C", "D"]
//       .map((key) => optionMap[key])
//       .map((item) => String(item || "").trim())
//       .filter(Boolean);
//   }

//   return [];
// }

// function getAnswerFromCorrectKey(correctAnswer, optionsArray, optionMap) {
//   if (!correctAnswer) return "";

//   const key = String(correctAnswer).trim();

//   if (optionMap && optionMap[key]) return optionMap[key];

//   if (key === "A") return optionsArray[0] || "";
//   if (key === "B") return optionsArray[1] || "";
//   if (key === "C") return optionsArray[2] || "";
//   if (key === "D") return optionsArray[3] || "";

//   return key;
// }

// function normalizeQuestion(question = {}, index = 0) {
//   const options = normalizeOptions(question.options, question.optionMap);

//   const optionMap = {
//     A: question?.optionMap?.A || options[0] || "",
//     B: question?.optionMap?.B || options[1] || "",
//     C: question?.optionMap?.C || options[2] || "",
//     D: question?.optionMap?.D || options[3] || "",
//   };

//   const correctAnswer =
//     question.correctAnswer ||
//     question.correctOption ||
//     question.answerKey ||
//     "";

//   const answer =
//     question.answer ||
//     getAnswerFromCorrectKey(correctAnswer, options, optionMap) ||
//     "";

//   return {
//     id: question.id || `question_${index + 1}`,
//     question: question.question || question.title || "",
//     options,
//     optionMap,
//     correctAnswer,
//     answer,
//     explanation: question.explanation || "",
//     marks: Number(question.marks || 4),
//   };
// }

// function isAnswerCorrect(question, selected) {
//   if (!selected) return false;

//   const cleanSelected = String(selected).trim();

//   const correctText = String(question.answer || "").trim();
//   const correctKey = String(question.correctAnswer || "").trim();
//   const correctFromMap = question.optionMap?.[correctKey];

//   return (
//     cleanSelected === correctText ||
//     cleanSelected === correctKey ||
//     cleanSelected === correctFromMap
//   );
// }

// function getSelectedStatus(question, selectedAnswers) {
//   const selected = selectedAnswers?.[question.id];

//   if (!selected) return "Unattempted";
//   if (isAnswerCorrect(question, selected)) return "Correct";
//   return "Wrong";
// }

// function getStatusStyle(status) {
//   if (status === "Correct") {
//     return {
//       color: C.green,
//       bg: C.greenLight,
//       iconBg: C.green,
//       icon: "checkmark",
//     };
//   }

//   if (status === "Wrong") {
//     return {
//       color: C.red,
//       bg: C.redLight,
//       iconBg: C.red,
//       icon: "close",
//     };
//   }

//   return {
//     color: C.grey,
//     bg: C.greyLight,
//     iconBg: C.grey,
//     icon: "remove",
//   };
// }

// function AnswerOptionRow({ label, option, selected, correct }) {
//   const isSelected = selected === option;
//   const isCorrect = correct === option;

//   let borderColor = C.border;
//   let bg = C.white;
//   let icon = "ellipse-outline";
//   let iconColor = C.muted;

//   if (isCorrect) {
//     borderColor = "#BFE7CC";
//     bg = C.greenLight;
//     icon = "checkmark-circle";
//     iconColor = C.green;
//   }

//   if (isSelected && !isCorrect) {
//     borderColor = "#F7CACA";
//     bg = C.redLight;
//     icon = "close-circle";
//     iconColor = C.red;
//   }

//   return (
//     <View style={[styles.optionRow, { borderColor, backgroundColor: bg }]}>
//       <Ionicons name={icon} size={18} color={iconColor} />

//       <Text style={styles.optionText}>
//         {label}. {option}
//       </Text>

//       {isSelected && (
//         <View style={styles.yourPill}>
//           <Text style={styles.yourPillText}>Your</Text>
//         </View>
//       )}

//       {isCorrect && (
//         <View style={styles.correctPill}>
//           <Text style={styles.correctPillText}>Correct</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// export default function MockTestAnswersScreen({ navigation, route }) {
//   const { getMockTestById } = useAppContext();

//   const params = route?.params || {};
//   const testId = params?.testId || params?.test?.id || params?.test?.testId;

//   const contextTest = useMemo(() => {
//     if (!testId || !getMockTestById) return null;
//     return getMockTestById(testId);
//   }, [getMockTestById, testId]);

//   const testTitle =
//     params?.testTitle ||
//     params?.test?.title ||
//     contextTest?.title ||
//     "View Answers";

//   const categoryTitle =
//     params?.categoryTitle ||
//     params?.category ||
//     params?.test?.categoryTitle ||
//     contextTest?.categoryTitle ||
//     "Mock Tests";

//   const subjectName =
//     params?.subjectName ||
//     params?.test?.subjectName ||
//     contextTest?.subjectName ||
//     "Subject";

//   const selectedAnswers = params?.selectedAnswers || {};

//   const questions = useMemo(() => {
//     const raw =
//       safeArray(params?.questions).length > 0
//         ? params.questions
//         : safeArray(params?.questionList).length > 0
//         ? params.questionList
//         : safeArray(params?.test?.questionList).length > 0
//         ? params.test.questionList
//         : safeArray(contextTest?.questionList);

//     return raw.map((item, index) => normalizeQuestion(item, index));
//   }, [
//     params?.questions,
//     params?.questionList,
//     params?.test?.questionList,
//     contextTest?.questionList,
//   ]);

//   const [activeFilter, setActiveFilter] = useState("All");

//   const stats = useMemo(() => {
//     let correct = 0;
//     let wrong = 0;
//     let unattempted = 0;

//     questions.forEach((q) => {
//       const status = getSelectedStatus(q, selectedAnswers);

//       if (status === "Correct") correct += 1;
//       else if (status === "Wrong") wrong += 1;
//       else unattempted += 1;
//     });

//     return {
//       all: questions.length,
//       correct,
//       wrong,
//       unattempted,
//     };
//   }, [questions, selectedAnswers]);

//   const filteredQuestions = useMemo(() => {
//     if (activeFilter === "All") return questions;

//     return questions.filter((q) => {
//       const status = getSelectedStatus(q, selectedAnswers);
//       return status === activeFilter;
//     });
//   }, [questions, selectedAnswers, activeFilter]);

//   const renderAnswerCard = (question, index) => {
//     const selected = selectedAnswers[question.id];
//     const status = getSelectedStatus(question, selectedAnswers);
//     const statusStyle = getStatusStyle(status);
//     const correctAnswerText = question.answer;

//     return (
//       <View key={question.id} style={styles.answerCard}>
//         <View style={styles.answerTopRow}>
//           <View
//             style={[
//               styles.numberCircle,
//               { backgroundColor: statusStyle.iconBg },
//             ]}
//           >
//             <Text style={styles.numberText}>{index + 1}</Text>
//           </View>

//           <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
//             <Ionicons
//               name={statusStyle.icon}
//               size={13}
//               color={statusStyle.color}
//             />
//             <Text style={[styles.statusText, { color: statusStyle.color }]}>
//               {status}
//             </Text>
//           </View>

//           <View style={{ flex: 1 }} />

//           <Ionicons name="bookmark-outline" size={20} color={C.muted} />
//         </View>

//         <Text style={styles.questionText}>Q. {question.question}</Text>

//         <View style={styles.optionsBox}>
//           {safeArray(question.options).map((option, optionIndex) => (
//             <AnswerOptionRow
//               key={`${question.id}_${optionIndex}_${option}`}
//               label={String.fromCharCode(65 + optionIndex)}
//               option={option}
//               selected={selected}
//               correct={correctAnswerText}
//             />
//           ))}
//         </View>

//         <View style={styles.answerInfoBox}>
//           <Text style={styles.answerLine}>
//             Your Answer:{" "}
//             <Text
//               style={[
//                 styles.answerValue,
//                 {
//                   color:
//                     status === "Correct"
//                       ? C.green
//                       : status === "Wrong"
//                       ? C.red
//                       : C.grey,
//                 },
//               ]}
//             >
//               {selected || "Not Attempted"}
//             </Text>
//           </Text>

//           <Text style={styles.answerLine}>
//             Correct Answer:{" "}
//             <Text style={[styles.answerValue, { color: C.green }]}>
//               {question.correctAnswer
//                 ? `${question.correctAnswer} - ${correctAnswerText}`
//                 : correctAnswerText}
//             </Text>
//           </Text>
//         </View>

//         <Text style={styles.explanationTitle}>Explanation:</Text>
//         <Text style={styles.explanationText}>
//           {question.explanation ||
//             `${correctAnswerText || "This option"} is the correct answer for this question.`}
//         </Text>
//       </View>
//     );
//   };

//   const goBackSafe = () => {
//     if (navigation?.canGoBack?.()) {
//       navigation.goBack();
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

//       <View style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity
//             activeOpacity={0.75}
//             style={styles.headerIcon}
//             onPress={goBackSafe}
//           >
//             <Ionicons name="chevron-back" size={22} color={C.text} />
//           </TouchableOpacity>

//           <Text style={styles.headerTitle}>View Answers</Text>

//           <TouchableOpacity activeOpacity={0.75} style={styles.headerIcon}>
//             <Ionicons name="filter-outline" size={21} color={C.text} />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.testInfoCard}>
//           <View style={styles.testIcon}>
//             <Ionicons name="document-text-outline" size={22} color={C.primary} />
//           </View>

//           <View style={{ flex: 1 }}>
//             <Text style={styles.testTitle} numberOfLines={1}>
//               {testTitle}
//             </Text>
//             <Text style={styles.testSub} numberOfLines={1}>
//               {categoryTitle} • {subjectName}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.filterRow}>
//           {[
//             { key: "All", label: "All", value: stats.all },
//             { key: "Correct", label: "Correct", value: stats.correct },
//             { key: "Wrong", label: "Wrong", value: stats.wrong },
//             {
//               key: "Unattempted",
//               label: "Unattempted",
//               value: stats.unattempted,
//             },
//           ].map((item) => {
//             const active = activeFilter === item.key;

//             return (
//               <TouchableOpacity
//                 key={item.key}
//                 activeOpacity={0.85}
//                 style={[
//                   styles.filterBox,
//                   active && styles.activeFilterBox,
//                   item.key === "Correct" && !active && styles.correctFilter,
//                   item.key === "Wrong" && !active && styles.wrongFilter,
//                   item.key === "Unattempted" &&
//                     !active &&
//                     styles.unattemptedFilter,
//                 ]}
//                 onPress={() => setActiveFilter(item.key)}
//               >
//                 <Text
//                   style={[
//                     styles.filterLabel,
//                     active && styles.activeFilterText,
//                     item.key === "Correct" && !active && { color: C.green },
//                     item.key === "Wrong" && !active && { color: C.red },
//                     item.key === "Unattempted" &&
//                       !active && { color: C.grey },
//                   ]}
//                 >
//                   {item.label}
//                 </Text>

//                 <Text
//                   style={[
//                     styles.filterValue,
//                     active && styles.activeFilterText,
//                     item.key === "Correct" && !active && { color: C.green },
//                     item.key === "Wrong" && !active && { color: C.red },
//                     item.key === "Unattempted" &&
//                       !active && { color: C.grey },
//                   ]}
//                 >
//                   {item.value}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>

//         <ScrollView showsVerticalScrollIndicator={false}>
//           {filteredQuestions.length === 0 ? (
//             <View style={styles.emptyCard}>
//               <Ionicons name="document-text-outline" size={42} color={C.muted} />
//               <Text style={styles.emptyTitle}>No questions found</Text>
//               <Text style={styles.emptyText}>
//                 No questions are available for this filter.
//               </Text>
//             </View>
//           ) : (
//             filteredQuestions.map(renderAnswerCard)
//           )}

//           <TouchableOpacity
//             activeOpacity={0.88}
//             style={styles.backButton}
//             onPress={goBackSafe}
//           >
//             <Text style={styles.backButtonText}>Back to Result</Text>
//           </TouchableOpacity>

//           <View style={{ height: 24 }} />
//         </ScrollView>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: C.bg,
//   },

//   container: {
//     flex: 1,
//     backgroundColor: C.bg,
//     paddingHorizontal: 16,
//     paddingTop: Platform.OS === "android" ? 14 : 4,
//   },

//   header: {
//     height: 52,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   headerIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   headerTitle: {
//     fontSize: 16,
//     fontWeight: "900",
//     color: C.text,
//   },

//   testInfoCard: {
//     minHeight: 70,
//     backgroundColor: C.white,
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: C.border,
//     paddingHorizontal: 12,
//     paddingVertical: 11,
//     marginTop: 6,
//     marginBottom: 12,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   testIcon: {
//     width: 46,
//     height: 46,
//     borderRadius: 14,
//     backgroundColor: C.primaryLight,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 11,
//   },

//   testTitle: {
//     fontSize: 14,
//     fontWeight: "900",
//     color: C.text,
//   },

//   testSub: {
//     marginTop: 5,
//     fontSize: 11.5,
//     fontWeight: "700",
//     color: C.muted,
//   },

//   filterRow: {
//     flexDirection: "row",
//     gap: 8,
//     marginBottom: 12,
//   },

//   filterBox: {
//     flex: 1,
//     minHeight: 58,
//     borderRadius: 10,
//     backgroundColor: C.white,
//     borderWidth: 1,
//     borderColor: C.border,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   activeFilterBox: {
//     backgroundColor: C.primary,
//     borderColor: C.primary,
//   },

//   correctFilter: {
//     backgroundColor: C.greenLight,
//     borderColor: "#CFEFDB",
//   },

//   wrongFilter: {
//     backgroundColor: C.redLight,
//     borderColor: "#FBD1D1",
//   },

//   unattemptedFilter: {
//     backgroundColor: C.greyLight,
//     borderColor: "#DDE4EE",
//   },

//   filterLabel: {
//     fontSize: 9.5,
//     fontWeight: "800",
//     color: C.text,
//     marginBottom: 4,
//   },

//   filterValue: {
//     fontSize: 13,
//     fontWeight: "900",
//     color: C.text,
//   },

//   activeFilterText: {
//     color: C.white,
//   },

//   answerCard: {
//     backgroundColor: C.card,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: C.border,
//     padding: 13,
//     marginBottom: 10,
//   },

//   answerTopRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },

//   numberCircle: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 9,
//   },

//   numberText: {
//     fontSize: 12,
//     fontWeight: "900",
//     color: C.white,
//   },

//   statusPill: {
//     minHeight: 24,
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     gap: 4,
//   },

//   statusText: {
//     fontSize: 10.5,
//     fontWeight: "900",
//   },

//   questionText: {
//     fontSize: 12.5,
//     lineHeight: 18,
//     fontWeight: "900",
//     color: C.text,
//     marginBottom: 10,
//   },

//   optionsBox: {
//     marginBottom: 10,
//   },

//   optionRow: {
//     minHeight: 42,
//     borderRadius: 10,
//     borderWidth: 1,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     marginBottom: 8,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   optionText: {
//     flex: 1,
//     marginLeft: 8,
//     fontSize: 11.5,
//     lineHeight: 16,
//     fontWeight: "800",
//     color: C.text,
//   },

//   yourPill: {
//     minHeight: 21,
//     borderRadius: 11,
//     backgroundColor: C.blue,
//     paddingHorizontal: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     marginLeft: 5,
//   },

//   yourPillText: {
//     fontSize: 9,
//     fontWeight: "900",
//     color: C.white,
//   },

//   correctPill: {
//     minHeight: 21,
//     borderRadius: 11,
//     backgroundColor: C.green,
//     paddingHorizontal: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     marginLeft: 5,
//   },

//   correctPillText: {
//     fontSize: 9,
//     fontWeight: "900",
//     color: C.white,
//   },

//   answerInfoBox: {
//     borderRadius: 11,
//     borderWidth: 1,
//     borderColor: C.border,
//     backgroundColor: "#FAFCFF",
//     padding: 10,
//   },

//   answerLine: {
//     fontSize: 11.5,
//     lineHeight: 19,
//     fontWeight: "800",
//     color: C.text,
//   },

//   answerValue: {
//     fontWeight: "900",
//   },

//   explanationTitle: {
//     marginTop: 10,
//     fontSize: 11.5,
//     fontWeight: "900",
//     color: C.text,
//   },

//   explanationText: {
//     marginTop: 4,
//     fontSize: 11.2,
//     lineHeight: 16,
//     fontWeight: "600",
//     color: C.text,
//   },

//   emptyCard: {
//     backgroundColor: C.white,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: C.border,
//     padding: 28,
//     alignItems: "center",
//   },

//   emptyTitle: {
//     marginTop: 8,
//     fontSize: 14,
//     fontWeight: "900",
//     color: C.text,
//   },

//   emptyText: {
//     marginTop: 5,
//     fontSize: 11.5,
//     fontWeight: "600",
//     color: C.muted,
//     textAlign: "center",
//   },

//   backButton: {
//     height: 52,
//     borderRadius: 10,
//     backgroundColor: C.primary,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 8,
//   },

//   backButtonText: {
//     fontSize: 14,
//     fontWeight: "900",
//     color: C.white,
//   },
// });







































import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
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
  primary: "#007C78",
  primaryLight: "#E7F7F4",
  green: "#16A34A",
  greenLight: "#EAF8EF",
  red: "#EF4444",
  redLight: "#FEECEC",
  orange: "#F97316",
  orangeLight: "#FFF3E8",
  grey: "#6B7280",
  greyLight: "#F1F5F9",
  blue: "#2563EB",
  white: "#FFFFFF",
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
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

function getSelectedStatus(question, selectedAnswers) {
  const selected = selectedAnswers?.[question.id];

  if (!selected) return "Unattempted";
  if (isAnswerCorrect(question, selected)) return "Correct";
  return "Wrong";
}

function getStatusStyle(status) {
  if (status === "Correct") {
    return {
      color: C.green,
      bg: C.greenLight,
      iconBg: C.green,
      icon: "checkmark",
    };
  }

  if (status === "Wrong") {
    return {
      color: C.red,
      bg: C.redLight,
      iconBg: C.red,
      icon: "close",
    };
  }

  return {
    color: C.grey,
    bg: C.greyLight,
    iconBg: C.grey,
    icon: "remove",
  };
}

function AnswerOptionRow({ label, option, selected, correct }) {
  const isSelected = selected === option;
  const isCorrect = correct === option;

  let borderColor = C.border;
  let bg = C.white;
  let icon = "ellipse-outline";
  let iconColor = C.muted;

  if (isCorrect) {
    borderColor = "#BFE7CC";
    bg = C.greenLight;
    icon = "checkmark-circle";
    iconColor = C.green;
  }

  if (isSelected && !isCorrect) {
    borderColor = "#F7CACA";
    bg = C.redLight;
    icon = "close-circle";
    iconColor = C.red;
  }

  return (
    <View style={[styles.optionRow, { borderColor, backgroundColor: bg }]}>
      <Ionicons name={icon} size={18} color={iconColor} />

      <Text style={styles.optionText}>
        {label}. {option}
      </Text>

      {isSelected && (
        <View style={styles.yourPill}>
          <Text style={styles.yourPillText}>Your</Text>
        </View>
      )}

      {isCorrect && (
        <View style={styles.correctPill}>
          <Text style={styles.correctPillText}>Correct</Text>
        </View>
      )}
    </View>
  );
}

export default function MockTestAnswersScreen({ navigation, route }) {
  const { getMockTestById } = useAppContext();

  const params = route?.params || {};
  const testId = params?.testId || params?.test?.id || params?.test?.testId;

  const contextTest = useMemo(() => {
    if (!testId || !getMockTestById) return null;
    return getMockTestById(testId);
  }, [getMockTestById, testId]);

  const testTitle =
    params?.testTitle ||
    params?.test?.title ||
    contextTest?.title ||
    "View Answers";

  const categoryTitle =
    params?.categoryTitle ||
    params?.category ||
    params?.test?.categoryTitle ||
    contextTest?.categoryTitle ||
    "Mock Tests";

  const subjectName =
    params?.subjectName ||
    params?.test?.subjectName ||
    contextTest?.subjectName ||
    "Subject";

  const selectedAnswers = params?.selectedAnswers || {};

  const questions = useMemo(() => {
    const raw =
      safeArray(params?.questions).length > 0
        ? params.questions
        : safeArray(params?.questionList).length > 0
        ? params.questionList
        : safeArray(params?.test?.questionList).length > 0
        ? params.test.questionList
        : safeArray(contextTest?.questionList);

    return raw.map((item, index) => normalizeQuestion(item, index));
  }, [
    params?.questions,
    params?.questionList,
    params?.test?.questionList,
    contextTest?.questionList,
  ]);

  const [activeFilter, setActiveFilter] = useState("All");

  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    questions.forEach((q) => {
      const status = getSelectedStatus(q, selectedAnswers);

      if (status === "Correct") correct += 1;
      else if (status === "Wrong") wrong += 1;
      else unattempted += 1;
    });

    return {
      all: questions.length,
      correct,
      wrong,
      unattempted,
    };
  }, [questions, selectedAnswers]);

  const filteredQuestions = useMemo(() => {
    if (activeFilter === "All") return questions;

    return questions.filter((q) => {
      const status = getSelectedStatus(q, selectedAnswers);
      return status === activeFilter;
    });
  }, [questions, selectedAnswers, activeFilter]);

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation.navigate("StudentDashboard");
    }
  };

  const renderAnswerCard = (question, index) => {
    const selected = selectedAnswers[question.id];
    const status = getSelectedStatus(question, selectedAnswers);
    const statusStyle = getStatusStyle(status);
    const correctAnswerText = question.answer;

    return (
      <View key={question.id} style={styles.answerCard}>
        <View style={styles.answerTopRow}>
          <View
            style={[
              styles.numberCircle,
              { backgroundColor: statusStyle.iconBg },
            ]}
          >
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>

          <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
            <Ionicons
              name={statusStyle.icon}
              size={13}
              color={statusStyle.color}
            />
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {status}
            </Text>
          </View>

          <View style={{ flex: 1 }} />

          <Ionicons name="bookmark-outline" size={20} color={C.muted} />
        </View>

        <Text style={styles.questionText}>Q. {question.question}</Text>

        <View style={styles.optionsBox}>
          {safeArray(question.options).map((option, optionIndex) => (
            <AnswerOptionRow
              key={`${question.id}_${optionIndex}_${option}`}
              label={String.fromCharCode(65 + optionIndex)}
              option={option}
              selected={selected}
              correct={correctAnswerText}
            />
          ))}
        </View>

        <View style={styles.answerInfoBox}>
          <Text style={styles.answerLine}>
            Your Answer:{" "}
            <Text
              style={[
                styles.answerValue,
                {
                  color:
                    status === "Correct"
                      ? C.green
                      : status === "Wrong"
                      ? C.red
                      : C.grey,
                },
              ]}
            >
              {selected || "Not Attempted"}
            </Text>
          </Text>

          <Text style={styles.answerLine}>
            Correct Answer:{" "}
            <Text style={[styles.answerValue, { color: C.green }]}>
              {question.correctAnswer
                ? `${question.correctAnswer} - ${correctAnswerText}`
                : correctAnswerText}
            </Text>
          </Text>
        </View>

        <Text style={styles.explanationTitle}>Explanation:</Text>
        <Text style={styles.explanationText}>
          {question.explanation ||
            `${
              correctAnswerText || "This option"
            } is the correct answer for this question.`}
        </Text>
      </View>
    );
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

          <Text style={styles.headerTitle}>View Answers</Text>

          <TouchableOpacity activeOpacity={0.75} style={styles.headerIcon}>
            <Ionicons name="filter-outline" size={21} color={C.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.testInfoCard}>
          <View style={styles.testIcon}>
            <Ionicons name="document-text-outline" size={22} color={C.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.testTitle} numberOfLines={1}>
              {testTitle}
            </Text>
            <Text style={styles.testSub} numberOfLines={1}>
              {categoryTitle} • {subjectName}
            </Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {[
            { key: "All", label: "All", value: stats.all },
            { key: "Correct", label: "Correct", value: stats.correct },
            { key: "Wrong", label: "Wrong", value: stats.wrong },
            {
              key: "Unattempted",
              label: "Unattempted",
              value: stats.unattempted,
            },
          ].map((item) => {
            const active = activeFilter === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.85}
                style={[
                  styles.filterBox,
                  active && styles.activeFilterBox,
                  item.key === "Correct" && !active && styles.correctFilter,
                  item.key === "Wrong" && !active && styles.wrongFilter,
                  item.key === "Unattempted" &&
                    !active &&
                    styles.unattemptedFilter,
                ]}
                onPress={() => setActiveFilter(item.key)}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    active && styles.activeFilterText,
                    item.key === "Correct" && !active && { color: C.green },
                    item.key === "Wrong" && !active && { color: C.red },
                    item.key === "Unattempted" &&
                      !active && { color: C.grey },
                  ]}
                >
                  {item.label}
                </Text>

                <Text
                  style={[
                    styles.filterValue,
                    active && styles.activeFilterText,
                    item.key === "Correct" && !active && { color: C.green },
                    item.key === "Wrong" && !active && { color: C.red },
                    item.key === "Unattempted" &&
                      !active && { color: C.grey },
                  ]}
                >
                  {item.value}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredQuestions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={42} color={C.muted} />
              <Text style={styles.emptyTitle}>No questions found</Text>
              <Text style={styles.emptyText}>
                No questions are available for this filter.
              </Text>
            </View>
          ) : (
            filteredQuestions.map(renderAnswerCard)
          )}

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.backButton}
            onPress={goBackSafe}
          >
            <Text style={styles.backButtonText}>Back to Result</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 14 : 4,
    paddingBottom: Platform.OS === "ios" ? 100 : 90,
  },

  scrollContent: {
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
    fontSize: 16,
    fontWeight: "900",
    color: C.text,
  },

  testInfoCard: {
    minHeight: 70,
    backgroundColor: C.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 6,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  testIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  testTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: C.text,
  },

  testSub: {
    marginTop: 5,
    fontSize: 11.5,
    fontWeight: "700",
    color: C.muted,
  },

  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  filterBox: {
    flex: 1,
    minHeight: 58,
    borderRadius: 10,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  activeFilterBox: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },

  correctFilter: {
    backgroundColor: C.greenLight,
    borderColor: "#CFEFDB",
  },

  wrongFilter: {
    backgroundColor: C.redLight,
    borderColor: "#FBD1D1",
  },

  unattemptedFilter: {
    backgroundColor: C.greyLight,
    borderColor: "#DDE4EE",
  },

  filterLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: C.text,
    marginBottom: 4,
  },

  filterValue: {
    fontSize: 13,
    fontWeight: "900",
    color: C.text,
  },

  activeFilterText: {
    color: C.white,
  },

  answerCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 13,
    marginBottom: 10,
  },

  answerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  numberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  numberText: {
    fontSize: 12,
    fontWeight: "900",
    color: C.white,
  },

  statusPill: {
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },

  statusText: {
    fontSize: 10.5,
    fontWeight: "900",
  },

  questionText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "900",
    color: C.text,
    marginBottom: 10,
  },

  optionsBox: {
    marginBottom: 10,
  },

  optionRow: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  optionText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "800",
    color: C.text,
  },

  yourPill: {
    minHeight: 21,
    borderRadius: 11,
    backgroundColor: C.blue,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },

  yourPillText: {
    fontSize: 9,
    fontWeight: "900",
    color: C.white,
  },

  correctPill: {
    minHeight: 21,
    borderRadius: 11,
    backgroundColor: C.green,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },

  correctPillText: {
    fontSize: 9,
    fontWeight: "900",
    color: C.white,
  },

  answerInfoBox: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "#FAFCFF",
    padding: 10,
  },

  answerLine: {
    fontSize: 11.5,
    lineHeight: 19,
    fontWeight: "800",
    color: C.text,
  },

  answerValue: {
    fontWeight: "900",
  },

  explanationTitle: {
    marginTop: 10,
    fontSize: 11.5,
    fontWeight: "900",
    color: C.text,
  },

  explanationText: {
    marginTop: 4,
    fontSize: 11.2,
    lineHeight: 16,
    fontWeight: "600",
    color: C.text,
  },

  emptyCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 28,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "900",
    color: C.text,
  },

  emptyText: {
    marginTop: 5,
    fontSize: 11.5,
    fontWeight: "600",
    color: C.muted,
    textAlign: "center",
  },

  backButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  backButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: C.white,
  },
});