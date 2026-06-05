// // src/screens/admin/AdminTeacherEarningsScreen.js

// import React, { useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   Platform,
//   Modal,
//   Pressable,
//   Dimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AdminBottomNavigation from "../../components/AdminBottomNavigation";
// import { useAppContext } from "../../context/AppContext";

// const { width } = Dimensions.get("window");
// const isSmall = width < 380;

// const COLORS = {
//   bg: "#F6FAFB",
//   white: "#FFFFFF",
//   teal: "#00796B",
//   tealDark: "#006A60",
//   tealLight: "#E6F5F3",
//   tealSoft: "#F0FFFC",
//   text: "#07123A",
//   muted: "#6E7891",
//   border: "#E4EBF2",
//   green: "#059669",
//   greenSoft: "#DCFCE7",
//   red: "#EF4444",
//   redSoft: "#FEE2E2",
//   orange: "#F97316",
//   orangeSoft: "#FFEDD5",
//   blue: "#2563EB",
//   blueSoft: "#DBEAFE",
//   purple: "#7C3AED",
//   purpleSoft: "#EDE9FE",
//   shadow: "rgba(0,0,0,0.10)",
// };

// const FILTERS = ["All", "Unpaid", "Paid", "Doubts", "Sessions", "Mock Tests"];

// const RATE_CONFIG = {
//   doubtRate: 40,
//   sessionRate: 250,
//   mockTestRate: 120,
//   adminCommissionPercent: 20,
// };

// function safeArray(value) {
//   return Array.isArray(value) ? value : [];
// }

// function formatMoney(value) {
//   return `₹${Number(value || 0).toLocaleString("en-IN")}`;
// }

// function normalizeText(value = "") {
//   return String(value || "").trim().toLowerCase();
// }

// function getTeacherName(teacher = {}) {
//   return (
//     teacher.teacherName ||
//     teacher.name ||
//     teacher.fullName ||
//     teacher.displayName ||
//     "Teacher"
//   );
// }

// function getTeacherId(teacher = {}) {
//   return teacher.id || teacher.teacherId || teacher.tutorId || "";
// }

// function getTeacherSubject(teacher = {}) {
//   return (
//     teacher.subject ||
//     teacher.primarySubject ||
//     teacher.mainSubject ||
//     teacher.subjectExpertise ||
//     "General"
//   );
// }

// function getTeacherAvatar(teacher = {}) {
//   const raw = teacher.avatar || teacher.image || teacher.photo || "";

//   if (typeof raw === "string" && /^https?:\/\//i.test(raw)) {
//     return getInitial(getTeacherName(teacher));
//   }

//   return raw || getInitial(getTeacherName(teacher));
// }

// function getInitial(name = "T") {
//   return String(name || "T").trim().charAt(0).toUpperCase() || "T";
// }

// function getAllTestsFromContext(getAllMockTests, mockData) {
//   if (typeof getAllMockTests === "function") {
//     return safeArray(getAllMockTests());
//   }

//   const tests = [];

//   Object.values(mockData || {}).forEach((category) => {
//     safeArray(category?.subjects).forEach((subject) => {
//       safeArray(subject?.list).forEach((test) => {
//         if (test?.isPublished !== false) {
//           tests.push({
//             ...test,
//             category: category?.title,
//             categoryTitle: category?.title,
//             subjectId: subject?.id,
//             subjectName: subject?.name,
//           });
//         }
//       });
//     });
//   });

//   return tests;
// }

// function belongsToTeacher(item = {}, teacher = {}) {
//   const teacherId = String(getTeacherId(teacher) || "");
//   const teacherName = normalizeText(getTeacherName(teacher));

//   const itemTeacherId = String(
//     item.teacherId ||
//       item.tutorId ||
//       item.assignedTeacherId ||
//       item.createdBy ||
//       item.acceptedBy ||
//       ""
//   );

//   const itemTeacherName = normalizeText(
//     item.teacherName ||
//       item.tutorName ||
//       item.tutor ||
//       item.assignedTeacher ||
//       item.createdByName ||
//       ""
//   );

//   if (teacherId && itemTeacherId && teacherId === itemTeacherId) return true;
//   if (teacherName && itemTeacherName && teacherName === itemTeacherName) return true;

//   return false;
// }

// function calculateTeacherWork({ teacher, answeredDoubts, completedSessions, mockTests }) {
//   const teacherDoubts = safeArray(answeredDoubts).filter((item) =>
//     belongsToTeacher(item, teacher)
//   );

//   const teacherSessions = safeArray(completedSessions).filter((item) =>
//     belongsToTeacher(item, teacher)
//   );

//   const teacherMockTests = safeArray(mockTests).filter((item) =>
//     belongsToTeacher(item, teacher)
//   );

//   const completedDoubts = teacherDoubts.length;
//   const completedSessionsCount = teacherSessions.length;
//   const createdTests = teacherMockTests.length;

//   const doubtAmount = completedDoubts * RATE_CONFIG.doubtRate;
//   const sessionAmount = completedSessionsCount * RATE_CONFIG.sessionRate;
//   const testAmount = createdTests * RATE_CONFIG.mockTestRate;

//   const grossAmount = doubtAmount + sessionAmount + testAmount;
//   const adminCommission = Math.round(
//     (grossAmount * RATE_CONFIG.adminCommissionPercent) / 100
//   );
//   const payableAmount = Math.max(grossAmount - adminCommission, 0);

//   return {
//     completedDoubts,
//     completedSessions: completedSessionsCount,
//     createdTests,
//     doubtAmount,
//     sessionAmount,
//     testAmount,
//     grossAmount,
//     adminCommission,
//     payableAmount,
//     latestActivity:
//       teacherDoubts[0]?.answeredAt ||
//       teacherSessions[0]?.completedAt ||
//       teacherSessions[0]?.endedAt ||
//       teacherMockTests[0]?.createdAt ||
//       teacher.updatedAt ||
//       teacher.createdAt ||
//       "",
//   };
// }

// function buildTeacherActivities({ teacher, answeredDoubts, completedSessions, mockTests }) {
//   const activities = [];

//   safeArray(answeredDoubts)
//     .filter((item) => belongsToTeacher(item, teacher))
//     .slice(0, 2)
//     .forEach((item) => {
//       activities.push({
//         id: item.id || item.doubtId || `D_${Date.now()}`,
//         type: "Doubt",
//         title: item.question || item.title || item.topic || "Doubt answered",
//         grossAmount: RATE_CONFIG.doubtRate,
//         adminCommission: Math.round(
//           (RATE_CONFIG.doubtRate * RATE_CONFIG.adminCommissionPercent) / 100
//         ),
//         teacherAmount: Math.max(
//           RATE_CONFIG.doubtRate -
//             Math.round(
//               (RATE_CONFIG.doubtRate * RATE_CONFIG.adminCommissionPercent) / 100
//             ),
//           0
//         ),
//         createdAt: item.answeredAt || item.updatedAt || item.createdAt || "",
//       });
//     });

//   safeArray(completedSessions)
//     .filter((item) => belongsToTeacher(item, teacher))
//     .slice(0, 2)
//     .forEach((item) => {
//       activities.push({
//         id: item.id || item.sessionId || `S_${Date.now()}`,
//         type: "Session",
//         title: `${item.subject || "Session"} completed`,
//         grossAmount: RATE_CONFIG.sessionRate,
//         adminCommission: Math.round(
//           (RATE_CONFIG.sessionRate * RATE_CONFIG.adminCommissionPercent) / 100
//         ),
//         teacherAmount: Math.max(
//           RATE_CONFIG.sessionRate -
//             Math.round(
//               (RATE_CONFIG.sessionRate * RATE_CONFIG.adminCommissionPercent) / 100
//             ),
//           0
//         ),
//         createdAt: item.completedAt || item.endedAt || item.updatedAt || item.createdAt || "",
//       });
//     });

//   safeArray(mockTests)
//     .filter((item) => belongsToTeacher(item, teacher))
//     .slice(0, 2)
//     .forEach((item) => {
//       activities.push({
//         id: item.id || item.testId || `T_${Date.now()}`,
//         type: "Mock Test",
//         title: item.title || "Mock test created",
//         grossAmount: RATE_CONFIG.mockTestRate,
//         adminCommission: Math.round(
//           (RATE_CONFIG.mockTestRate * RATE_CONFIG.adminCommissionPercent) / 100
//         ),
//         teacherAmount: Math.max(
//           RATE_CONFIG.mockTestRate -
//             Math.round(
//               (RATE_CONFIG.mockTestRate * RATE_CONFIG.adminCommissionPercent) / 100
//             ),
//           0
//         ),
//         createdAt: item.createdAt || item.updatedAt || "",
//       });
//     });

//   const chronological = [...activities].sort(
//     (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
//   );

//   let remainingPaid = Number(teacher.paidAmount || teacher.lastPayoutAmount || 0);

//   const withStatus = chronological.map((item) => {
//     const itemAmount = Number(item.teacherAmount || 0);
//     const isPaid = remainingPaid >= itemAmount && itemAmount > 0;

//     if (isPaid) {
//       remainingPaid -= itemAmount;
//     }

//     return {
//       ...item,
//       status: isPaid ? "Paid" : "Unpaid",
//     };
//   });

//   return withStatus
//     .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
//     .slice(0, 4);
// }

// function normalizeTeacherRecord(teacher = {}) {
//   const id = getTeacherId(teacher) || teacher.teacherName || teacher.name || `TEACHER_${Date.now()}`;
//   const teacherName = getTeacherName(teacher);
//   const paidAmount = Number(
//     teacher.paidAmount ||
//       teacher.settledAmount ||
//       teacher.withdrawnAmount ||
//       teacher.creditedAmount ||
//       teacher.lastPayoutAmount ||
//       0
//   );

//   return {
//     id,
//     teacherId: teacher.teacherId || teacher.id || id,
//     teacherName,
//     name: teacher.name || teacherName,
//     subject: getTeacherSubject(teacher),
//     avatar: getTeacherAvatar(teacher),
//     rating: Number(teacher.rating || 0),
//     status:
//       teacher.lastPayoutStatus ||
//       teacher.status ||
//       teacher.payoutStatus ||
//       (paidAmount > 0 ? "Paid" : "Unpaid"),
//     paidAmount,
//     pendingAmount: Number(teacher.pendingAmount || 0),
//     totalEarned: Number(teacher.totalEarned || 0),
//     doubts: Number(teacher.doubts || 0),
//     sessions: Number(teacher.sessions || 0),
//     mockTests: Number(teacher.mockTests || 0),
//     lastActivity: teacher.lastActivity || teacher.updatedAt || teacher.createdAt || "",
//     activities: safeArray(teacher.activities),
//     teacherRaw: teacher,
//   };
// }

// function createTeacherEarningRecord({
//   teacher,
//   answeredDoubts,
//   completedSessions,
//   mockTests,
// }) {
//   const calc = calculateTeacherWork({
//     teacher,
//     answeredDoubts,
//     completedSessions,
//     mockTests,
//   });

//   const paidAmount = Number(
//     teacher.paidAmount ||
//       teacher.settledAmount ||
//       teacher.withdrawnAmount ||
//       teacher.creditedAmount ||
//       teacher.lastPayoutAmount ||
//       0
//   );

//   const pendingAmount = Math.max(calc.payableAmount - paidAmount, 0);

//   const status =
//     calc.grossAmount <= 0
//       ? "No Earnings"
//       : pendingAmount > 0
//       ? "Unpaid"
//       : "Paid";

//   return {
//     id: teacher.id || teacher.teacherId || teacher.teacherName,
//     teacherId: teacher.teacherId || teacher.id || "",
//     teacherName: getTeacherName(teacher),
//     subject: getTeacherSubject(teacher),
//     avatar: getTeacherAvatar(teacher),
//     totalEarned: calc.grossAmount,
//     paidAmount,
//     pendingAmount,
//     doubts: calc.completedDoubts,
//     sessions: calc.completedSessions,
//     mockTests: calc.createdTests,
//     rating: Number(teacher.rating || 0),
//     status,
//     lastActivity: calc.latestActivity,
//     activities: buildTeacherActivities({
//       teacher,
//       answeredDoubts,
//       completedSessions,
//       mockTests,
//     }),
//   };
// }

//   function formatDateTime(value) {
//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return "Today";
//   }

//   return date.toLocaleString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// function getActivityTheme(type = "") {
//   const clean = String(type).toLowerCase();

//   if (clean.includes("session")) {
//     return {
//       bg: COLORS.purpleSoft,
//       color: COLORS.purple,
//       icon: "videocam-outline",
//     };
//   }

//   if (clean.includes("mock")) {
//     return {
//       bg: COLORS.orangeSoft,
//       color: COLORS.orange,
//       icon: "document-text-outline",
//     };
//   }

//   return {
//     bg: COLORS.blueSoft,
//     color: COLORS.blue,
//     icon: "chatbubble-ellipses-outline",
//   };
// }

// function getStatusTheme(status = "") {
//   if (status === "Paid") {
//     return {
//       bg: COLORS.greenSoft,
//       color: COLORS.green,
//       icon: "checkmark-circle-outline",
//     };
//   }

//   return {
//     bg: COLORS.orangeSoft,
//     color: COLORS.orange,
//     icon: "time-outline",
//   };
// }

// function SummaryCard({ title, value, sub, icon, color, bg }) {
//   return (
//     <View style={styles.summaryCard}>
//       <View style={[styles.summaryIcon, { backgroundColor: bg }]}>
//         <Ionicons name={icon} size={22} color={color} />
//       </View>

//       <Text style={styles.summaryValue} numberOfLines={1}>
//         {value}
//       </Text>

//       <Text style={styles.summaryTitle} numberOfLines={1}>
//         {title}
//       </Text>

//       {!!sub && (
//         <Text style={[styles.summarySub, { color }]} numberOfLines={1}>
//           {sub}
//         </Text>
//       )}
//     </View>
//   );
// }

// function TeacherEarningCard({ teacher, onPress }) {
//   const statusTheme = getStatusTheme(teacher.status);

//   return (
//     <TouchableOpacity
//       activeOpacity={0.88}
//       style={styles.teacherCard}
//       onPress={() => onPress(teacher)}
//     >
//       <View style={styles.teacherTop}>
//         <View style={styles.teacherAvatar}>
//           <Text style={styles.teacherAvatarText}>{teacher.avatar}</Text>
//         </View>

//         <View style={styles.teacherInfo}>
//           <Text style={styles.teacherName} numberOfLines={1}>
//             {teacher.teacherName}
//           </Text>

//           <Text style={styles.teacherMeta} numberOfLines={1}>
//             {teacher.subject} • ⭐ {teacher.rating}
//           </Text>
//         </View>

//         <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
//           <Ionicons name={statusTheme.icon} size={13} color={statusTheme.color} />
//           <Text style={[styles.statusText, { color: statusTheme.color }]}>
//             {teacher.status}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.amountPanel}>
//         <View>
//           <Text style={styles.amountLabel}>Total Earned</Text>
//           <Text style={styles.totalAmount}>{formatMoney(teacher.totalEarned)}</Text>
//         </View>

//         <View style={styles.amountRight}>
//           <Text style={styles.pendingLabel}>Pending</Text>
//           <Text style={styles.pendingAmount}>{formatMoney(teacher.pendingAmount)}</Text>
//         </View>
//       </View>

//       <View style={styles.workStatsRow}>
//         <View style={styles.workStat}>
//           <Ionicons name="chatbubble-ellipses-outline" size={17} color={COLORS.blue} />
//           <Text style={styles.workStatText}>{teacher.doubts} Doubts</Text>
//         </View>

//         <View style={styles.workStat}>
//           <Ionicons name="videocam-outline" size={17} color={COLORS.purple} />
//           <Text style={styles.workStatText}>{teacher.sessions} Sessions</Text>
//         </View>

//         <View style={styles.workStat}>
//           <Ionicons name="document-text-outline" size={17} color={COLORS.orange} />
//           <Text style={styles.workStatText}>{teacher.mockTests} Tests</Text>
//         </View>
//       </View>

//       <View style={styles.teacherBottom}>
//         <Text style={styles.lastActivity}>
//           Last activity: {formatDateTime(teacher.lastActivity)}
//         </Text>

//         <View style={styles.openCircle}>
//           <Ionicons name="chevron-forward" size={20} color={COLORS.teal} />
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// }

// function ActivityRow({ item }) {
//   const theme = getActivityTheme(item.type);
//   const statusTheme = getStatusTheme(item.status);

//   return (
//     <View style={styles.activityRow}>
//       <View style={[styles.activityIcon, { backgroundColor: theme.bg }]}>
//         <Ionicons name={theme.icon} size={20} color={theme.color} />
//       </View>

//       <View style={styles.activityInfo}>
//         <Text style={styles.activityTitle} numberOfLines={1}>
//           {item.title}
//         </Text>

//         <Text style={styles.activityMeta}>
//           {item.type} • {formatDateTime(item.createdAt)}
//         </Text>

//         <View style={styles.activityCalc}>
//           <Text style={styles.activityCalcText}>
//             Gross {formatMoney(item.grossAmount)}
//           </Text>
//           <Text style={styles.activityCalcText}>
//             Commission {formatMoney(item.adminCommission)}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.activityAmountBox}>
//         <Text style={styles.activityAmount}>
//           +{formatMoney(item.teacherAmount)}
//         </Text>

//         <View style={[styles.smallStatusBadge, { backgroundColor: statusTheme.bg }]}>
//           <Text style={[styles.smallStatusText, { color: statusTheme.color }]}>
//             {item.status}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// }

// function DetailRow({ label, value, icon }) {
//   return (
//     <View style={styles.detailRow}>
//       <View style={styles.detailIcon}>
//         <Ionicons name={icon} size={18} color={COLORS.teal} />
//       </View>

//       <View style={{ flex: 1 }}>
//         <Text style={styles.detailLabel}>{label}</Text>
//         <Text style={styles.detailValue}>{value}</Text>
//       </View>
//     </View>
//   );
// }

// export default function AdminTeacherEarningsScreen({ navigation }) {
//   const [search, setSearch] = useState("");
//   const [activeFilter, setActiveFilter] = useState("All");
//   const [selectedTeacher, setSelectedTeacher] = useState(null);
//   const [detailVisible, setDetailVisible] = useState(false);
//   const {
//     tutors = [],
//     tuitionRequests = [],
//     answeredDoubts = [],
//     completedSessions = [],
//     mockData = {},
//     getAllMockTests,
//   } = useAppContext();

//   const allMockTests = useMemo(
//     () => getAllTestsFromContext(getAllMockTests, mockData),
//     [getAllMockTests, mockData]
//   );

//   const teachersSource = useMemo(() => {
//     const byId = new Map();

//     const addTeacher = (teacher = {}) => {
//       const normalized = normalizeTeacherRecord(teacher);
//       const key = String(normalized.id || normalized.teacherId || normalized.teacherName);

//       if (!byId.has(key) || normalized.teacherName !== "Teacher") {
//         byId.set(key, normalized);
//       }
//     };

//     safeArray(tutors).forEach((teacher) => addTeacher(teacher));

//     safeArray(tuitionRequests).forEach((request) => {
//       if (!request.teacherId && !request.tutorId && !request.teacherName) {
//         return;
//       }

//       addTeacher({
//         id: request.teacherId || request.tutorId || request.teacherName,
//         teacherId: request.teacherId || request.tutorId || request.teacherName,
//         teacherName: request.teacherName || request.tutorName || "Teacher",
//         name: request.teacherName || request.tutorName || "Teacher",
//         subject: request.subject || request.topic || "General",
//         rating: request.rating || 0,
//         status:
//           request.status === "accepted"
//             ? "Accepted"
//             : request.status === "pending"
//             ? "Pending"
//             : request.status || "Unpaid",
//       });
//     });

//     safeArray(answeredDoubts).forEach((item) => {
//       if (item?.teacherId || item?.assignedTeacherId || item?.teacherName || item?.assignedTeacher) {
//         addTeacher({
//           id: item.teacherId || item.assignedTeacherId || item.teacherName || item.assignedTeacher,
//           teacherId: item.teacherId || item.assignedTeacherId || item.teacherName || item.assignedTeacher,
//           teacherName: item.teacherName || item.assignedTeacher || "Teacher",
//           name: item.teacherName || item.assignedTeacher || "Teacher",
//           subject: item.subject || "General",
//         });
//       }
//     });

//     safeArray(completedSessions).forEach((item) => {
//       if (item?.teacherId || item?.tutorId || item?.teacherName || item?.tutorName) {
//         addTeacher({
//           id: item.teacherId || item.tutorId || item.teacherName || item.tutorName,
//           teacherId: item.teacherId || item.tutorId || item.teacherName || item.tutorName,
//           teacherName: item.teacherName || item.tutorName || "Teacher",
//           name: item.teacherName || item.tutorName || "Teacher",
//           subject: item.subject || "General",
//         });
//       }
//     });

//     safeArray(allMockTests).forEach((item) => {
//       if (item?.teacherId || item?.createdBy || item?.teacherName || item?.createdByName) {
//         addTeacher({
//           id: item.teacherId || item.createdBy || item.teacherName || item.createdByName,
//           teacherId: item.teacherId || item.createdBy || item.teacherName || item.createdByName,
//           teacherName: item.teacherName || item.createdByName || "Teacher",
//           name: item.teacherName || item.createdByName || "Teacher",
//           subject: item.subjectName || item.subject || "General",
//         });
//       }
//     });

//     return Array.from(byId.values());
//   }, [
//     completedSessions,
//     answeredDoubts,
//     tutors,
//     tuitionRequests,
//     getAllMockTests,
//     mockData,
//   ]);

//   const teachers = useMemo(
//     () =>
//       teachersSource
//         .map((teacher) =>
//           createTeacherEarningRecord({
//             teacher,
//             answeredDoubts,
//             completedSessions,
//             mockTests: allMockTests,
//           })
//         )
//         .sort(
//           (a, b) =>
//             new Date(b.lastActivity || 0).getTime() -
//             new Date(a.lastActivity || 0).getTime()
//         ),
//     [answeredDoubts, allMockTests, completedSessions, teachersSource]
//   );

//   const summary = useMemo(() => {
//     const totalEarned = teachers.reduce(
//       (sum, item) => sum + Number(item.totalEarned || 0),
//       0
//     );

//     const paidAmount = teachers.reduce(
//       (sum, item) => sum + Number(item.paidAmount || 0),
//       0
//     );

//     const pendingAmount = teachers.reduce(
//       (sum, item) => sum + Number(item.pendingAmount || 0),
//       0
//     );

//     const totalDoubts = teachers.reduce(
//       (sum, item) => sum + Number(item.doubts || 0),
//       0
//     );

//     const totalSessions = teachers.reduce(
//       (sum, item) => sum + Number(item.sessions || 0),
//       0
//     );

//     const totalMockTests = teachers.reduce(
//       (sum, item) => sum + Number(item.mockTests || 0),
//       0
//     );

//     return {
//       totalEarned,
//       paidAmount,
//       pendingAmount,
//       totalDoubts,
//       totalSessions,
//       totalMockTests,
//       teacherCount: teachers.length,
//     };
//   }, [teachers]);

//   const filteredTeachers = useMemo(() => {
//     const q = search.trim().toLowerCase();

//     return teachers.filter((item) => {
//       const searchMatch =
//         !q ||
//         String(item.teacherName || "").toLowerCase().includes(q) ||
//         String(item.subject || "").toLowerCase().includes(q) ||
//         String(item.id || "").toLowerCase().includes(q);

//       let filterMatch = true;

//       if (activeFilter === "Paid") {
//         filterMatch = item.status === "Paid";
//       } else if (activeFilter === "Unpaid") {
//         filterMatch = item.status === "Unpaid";
//       } else if (activeFilter === "Doubts") {
//         filterMatch = Number(item.doubts || 0) > 0;
//       } else if (activeFilter === "Sessions") {
//         filterMatch = Number(item.sessions || 0) > 0;
//       } else if (activeFilter === "Mock Tests") {
//         filterMatch = Number(item.mockTests || 0) > 0;
//       }

//       return searchMatch && filterMatch;
//     });
//   }, [teachers, search, activeFilter]);

//   const openTeacherDetails = (teacher) => {
//     setSelectedTeacher(teacher);
//     setDetailVisible(true);
//   };

//   const closeDetails = () => {
//     setDetailVisible(false);
//     setSelectedTeacher(null);
//   };

//   const goBackSafe = () => {
//     if (navigation?.canGoBack?.()) {
//       navigation.goBack();
//       return;
//     }

//     navigation?.navigate?.("AdminDashboard");
//   };

//   const goToPayout = () => {
//     if (!selectedTeacher) return;

//     closeDetails();

//     navigation?.navigate?.("AdminTeacherPayouts", {
//       teacherId: selectedTeacher.id,
//       teacherName: selectedTeacher.teacherName,
//       pendingAmount: selectedTeacher.pendingAmount,
//     });
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

//       <View style={styles.screen}>
//         <View style={styles.header}>
//           <TouchableOpacity
//             activeOpacity={0.85}
//             style={styles.headerBtn}
//             onPress={goBackSafe}
//           >
//             <Ionicons name="chevron-back" size={25} color={COLORS.white} />
//           </TouchableOpacity>

//           <View style={styles.headerCenter}>
//             <Text style={styles.headerTitle}>Teacher Earnings</Text>
//             <Text style={styles.headerSub}>Instant earning management</Text>
//           </View>

//           <TouchableOpacity
//             activeOpacity={0.85}
//             style={styles.headerBtn}
//             onPress={() => setSearch("")}
//           >
//             <Ionicons name="refresh-outline" size={24} color={COLORS.white} />
//           </TouchableOpacity>
//         </View>

//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.scrollContent}
//         >
//           <View style={styles.heroCard}>
//             <View style={styles.heroTop}>
//               <View style={styles.heroIcon}>
//                 <Ionicons name="cash-outline" size={30} color={COLORS.teal} />
//               </View>

//               <View style={styles.heroInfo}>
//                 <Text style={styles.heroTitle}>Instant Teacher Earnings</Text>
//                 <Text style={styles.heroSub}>
//                   Teachers earn after completed doubts, sessions and mock tests.
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.heroAmountRow}>
//               <View>
//                 <Text style={styles.heroAmount}>{formatMoney(summary.totalEarned)}</Text>
//                 <Text style={styles.heroAmountSub}>Total teacher earnings</Text>
//               </View>

//               <View style={styles.heroBadge}>
//                 <Ionicons name="flash-outline" size={16} color={COLORS.green} />
//                 <Text style={styles.heroBadgeText}>Instant</Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.summaryGrid}>
//             <SummaryCard
//               title="Total Earned"
//               value={formatMoney(summary.totalEarned)}
//               sub={`${summary.teacherCount} teachers`}
//               icon="cash-outline"
//               color={COLORS.teal}
//               bg={COLORS.tealLight}
//             />

//             <SummaryCard
//               title="Paid"
//               value={formatMoney(summary.paidAmount)}
//               sub="Completed payouts"
//               icon="checkmark-circle-outline"
//               color={COLORS.green}
//               bg={COLORS.greenSoft}
//             />

//             <SummaryCard
//               title="Pending"
//               value={formatMoney(summary.pendingAmount)}
//               sub="Need payout"
//               icon="time-outline"
//               color={COLORS.orange}
//               bg={COLORS.orangeSoft}
//             />

//             <SummaryCard
//               title="Work Done"
//               value={summary.totalDoubts + summary.totalSessions + summary.totalMockTests}
//               sub="Doubts + classes + tests"
//               icon="briefcase-outline"
//               color={COLORS.blue}
//               bg={COLORS.blueSoft}
//             />
//           </View>

//           <View style={styles.workOverviewCard}>
//             <View style={styles.workOverviewItem}>
//               <Ionicons name="chatbubble-ellipses-outline" size={21} color={COLORS.blue} />
//               <Text style={styles.workOverviewValue}>{summary.totalDoubts}</Text>
//               <Text style={styles.workOverviewLabel}>Doubts</Text>
//             </View>

//             <View style={styles.workOverviewDivider} />

//             <View style={styles.workOverviewItem}>
//               <Ionicons name="videocam-outline" size={21} color={COLORS.purple} />
//               <Text style={styles.workOverviewValue}>{summary.totalSessions}</Text>
//               <Text style={styles.workOverviewLabel}>Sessions</Text>
//             </View>

//             <View style={styles.workOverviewDivider} />

//             <View style={styles.workOverviewItem}>
//               <Ionicons name="document-text-outline" size={21} color={COLORS.orange} />
//               <Text style={styles.workOverviewValue}>{summary.totalMockTests}</Text>
//               <Text style={styles.workOverviewLabel}>Mock Tests</Text>
//             </View>
//           </View>

//           <View style={styles.searchCard}>
//             <View style={styles.searchBox}>
//               <Ionicons name="search-outline" size={19} color={COLORS.muted} />

//               <TextInput
//                 value={search}
//                 onChangeText={setSearch}
//                 placeholder="Search teacher or subject..."
//                 placeholderTextColor="#9AA4B6"
//                 style={styles.searchInput}
//               />

//               {search.length > 0 && (
//                 <TouchableOpacity activeOpacity={0.75} onPress={() => setSearch("")}>
//                   <Ionicons name="close-circle" size={19} color={COLORS.muted} />
//                 </TouchableOpacity>
//               )}
//             </View>

//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.filterContent}
//             >
//               {FILTERS.map((filter) => {
//                 const isActive = activeFilter === filter;

//                 return (
//                   <TouchableOpacity
//                     key={filter}
//                     activeOpacity={0.85}
//                     style={[styles.filterChip, isActive && styles.filterChipActive]}
//                     onPress={() => setActiveFilter(filter)}
//                   >
//                     <Text
//                       style={[
//                         styles.filterText,
//                         isActive && styles.filterTextActive,
//                       ]}
//                     >
//                       {filter}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//           </View>

//           <View style={styles.sectionHeader}>
//             <View>
//               <Text style={styles.sectionTitle}>Teacher Earnings</Text>
//               <Text style={styles.sectionSub}>
//                 {filteredTeachers.length} teachers found
//               </Text>
//             </View>

//             <TouchableOpacity
//               activeOpacity={0.85}
//               style={styles.payoutBtn}
//               onPress={() => navigation?.navigate?.("AdminTeacherPayouts")}
//             >
//               <Ionicons name="wallet-outline" size={17} color={COLORS.teal} />
//               <Text style={styles.payoutBtnText}>Payouts</Text>
//             </TouchableOpacity>
//           </View>

//           {filteredTeachers.length === 0 ? (
//             <View style={styles.emptyBox}>
//               <Ionicons name="cash-outline" size={44} color={COLORS.muted} />
//               <Text style={styles.emptyTitle}>No earnings found</Text>
//               <Text style={styles.emptySub}>
//                 Try changing search text or selected filter.
//               </Text>
//             </View>
//           ) : (
//             filteredTeachers.map((teacher) => (
//               <TeacherEarningCard
//                 key={teacher.id}
//                 teacher={teacher}
//                 onPress={openTeacherDetails}
//               />
//             ))
//           )}
//         </ScrollView>

//         <AdminBottomNavigation navigation={navigation} active="Earnings" />
//       </View>

//       <Modal
//         visible={detailVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={closeDetails}
//       >
//         <View style={styles.modalOverlay}>
//           <Pressable style={styles.modalDim} onPress={closeDetails} />

//           <View style={styles.detailCard}>
//             <View style={styles.detailHeader}>
//               <View>
//                 <Text style={styles.detailTitle}>Teacher Details</Text>
//                 <Text style={styles.detailSub}>Earning breakdown and activities</Text>
//               </View>

//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 style={styles.closeBtn}
//                 onPress={closeDetails}
//               >
//                 <Ionicons name="close" size={22} color={COLORS.text} />
//               </TouchableOpacity>
//             </View>

//             {selectedTeacher && (
//               <ScrollView showsVerticalScrollIndicator={false}>
//                 <View style={styles.detailTeacherBox}>
//                   <View style={styles.detailAvatar}>
//                     <Text style={styles.detailAvatarText}>
//                       {selectedTeacher.avatar}
//                     </Text>
//                   </View>

//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.detailTeacherName}>
//                       {selectedTeacher.teacherName}
//                     </Text>
//                     <Text style={styles.detailTeacherMeta}>
//                       {selectedTeacher.subject} • ⭐ {selectedTeacher.rating}
//                     </Text>
//                   </View>

//                   <Text style={styles.detailPendingAmount}>
//                     {formatMoney(selectedTeacher.pendingAmount)}
//                   </Text>
//                 </View>

//                 <View style={styles.detailSummaryGrid}>
//                   <View style={styles.detailMiniCard}>
//                     <Text style={styles.detailMiniValue}>
//                       {formatMoney(selectedTeacher.totalEarned)}
//                     </Text>
//                     <Text style={styles.detailMiniLabel}>Total</Text>
//                   </View>

//                   <View style={styles.detailMiniCard}>
//                     <Text style={styles.detailMiniValue}>
//                       {formatMoney(selectedTeacher.paidAmount)}
//                     </Text>
//                     <Text style={styles.detailMiniLabel}>Paid</Text>
//                   </View>

//                   <View style={styles.detailMiniCard}>
//                     <Text style={styles.detailMiniValue}>
//                       {formatMoney(selectedTeacher.pendingAmount)}
//                     </Text>
//                     <Text style={styles.detailMiniLabel}>Pending</Text>
//                   </View>
//                 </View>

//                 <DetailRow
//                   icon="chatbubble-ellipses-outline"
//                   label="Completed Doubts"
//                   value={`${selectedTeacher.doubts} doubts`}
//                 />

//                 <DetailRow
//                   icon="videocam-outline"
//                   label="Completed Sessions"
//                   value={`${selectedTeacher.sessions} sessions`}
//                 />

//                 <DetailRow
//                   icon="document-text-outline"
//                   label="Mock Tests Created"
//                   value={`${selectedTeacher.mockTests} mock tests`}
//                 />

//                 <Text style={styles.activitySectionTitle}>Recent Activities</Text>

//                 {selectedTeacher.activities.map((item) => (
//                   <ActivityRow key={item.id} item={item} />
//                 ))}

//                 {selectedTeacher.pendingAmount > 0 && (
//                   <TouchableOpacity
//                     activeOpacity={0.86}
//                     style={styles.primaryBtn}
//                     onPress={goToPayout}
//                   >
//                     <Ionicons name="wallet-outline" size={19} color={COLORS.white} />
//                     <Text style={styles.primaryBtnText}>Go to Payout</Text>
//                   </TouchableOpacity>
//                 )}

//                 <TouchableOpacity
//                   activeOpacity={0.86}
//                   style={styles.secondaryBtn}
//                   onPress={closeDetails}
//                 >
//                   <Text style={styles.secondaryBtnText}>Close</Text>
//                 </TouchableOpacity>
//               </ScrollView>
//             )}
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: COLORS.tealDark,
//   },

//   screen: {
//     flex: 1,
//     backgroundColor: COLORS.bg,
//   },

//   header: {
//     height: Platform.OS === "ios" ? 108 : 92,
//     backgroundColor: COLORS.teal,
//     paddingHorizontal: 14,
//     paddingTop: Platform.OS === "ios" ? 22 : 14,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   headerBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 15,
//     backgroundColor: "rgba(255,255,255,0.14)",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   headerCenter: {
//     flex: 1,
//     alignItems: "center",
//     paddingHorizontal: 10,
//   },

//   headerTitle: {
//     fontSize: isSmall ? 21 : 24,
//     fontWeight: "900",
//     color: COLORS.white,
//   },

//   headerSub: {
//     marginTop: 2,
//     fontSize: 12,
//     fontWeight: "700",
//     color: "rgba(255,255,255,0.82)",
//   },

//   scrollContent: {
//     paddingHorizontal: 14,
//     paddingTop: 16,
//     paddingBottom: Platform.OS === "ios" ? 138 : 122,
//   },

//   heroCard: {
//     borderRadius: 22,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 16,
//     marginBottom: 14,
//     shadowColor: COLORS.shadow,
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 5 },
//     shadowRadius: 14,
//     elevation: 3,
//   },

//   heroTop: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   heroIcon: {
//     width: 58,
//     height: 58,
//     borderRadius: 20,
//     backgroundColor: COLORS.tealLight,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//   },

//   heroInfo: {
//     flex: 1,
//   },

//   heroTitle: {
//     fontSize: 19,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   heroSub: {
//     marginTop: 4,
//     fontSize: 12,
//     lineHeight: 18,
//     fontWeight: "650",
//     color: COLORS.muted,
//   },

//   heroAmountRow: {
//     marginTop: 16,
//     borderRadius: 18,
//     backgroundColor: COLORS.tealSoft,
//     borderWidth: 1,
//     borderColor: "#C9E8E3",
//     padding: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   heroAmount: {
//     fontSize: 28,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   heroAmountSub: {
//     marginTop: 3,
//     fontSize: 12,
//     fontWeight: "700",
//     color: COLORS.muted,
//   },

//   heroBadge: {
//     borderRadius: 18,
//     backgroundColor: COLORS.greenSoft,
//     paddingHorizontal: 10,
//     paddingVertical: 7,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },

//   heroBadgeText: {
//     fontSize: 12,
//     fontWeight: "900",
//     color: COLORS.green,
//   },

//   summaryGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginBottom: 2,
//   },

//   summaryCard: {
//     width: (width - 40) / 2,
//     minHeight: 118,
//     borderRadius: 20,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 13,
//     marginBottom: 12,
//     shadowColor: COLORS.shadow,
//     shadowOpacity: 0.07,
//     shadowOffset: { width: 0, height: 5 },
//     shadowRadius: 14,
//     elevation: 2,
//   },

//   summaryIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 9,
//   },

//   summaryValue: {
//     fontSize: isSmall ? 18 : 20,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   summaryTitle: {
//     marginTop: 3,
//     fontSize: 12,
//     fontWeight: "800",
//     color: COLORS.muted,
//   },

//   summarySub: {
//     marginTop: 5,
//     fontSize: 11,
//     fontWeight: "900",
//   },

//   workOverviewCard: {
//     borderRadius: 20,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 14,
//     marginBottom: 14,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   workOverviewItem: {
//     flex: 1,
//     alignItems: "center",
//   },

//   workOverviewValue: {
//     marginTop: 6,
//     fontSize: 17,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   workOverviewLabel: {
//     marginTop: 3,
//     fontSize: 10,
//     fontWeight: "700",
//     color: COLORS.muted,
//   },

//   workOverviewDivider: {
//     width: 1,
//     height: 48,
//     backgroundColor: COLORS.border,
//   },

//   searchCard: {
//     borderRadius: 20,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 12,
//     marginBottom: 16,
//   },

//   searchBox: {
//     height: 48,
//     borderRadius: 16,
//     backgroundColor: "#F9FBFD",
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     paddingHorizontal: 12,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   searchInput: {
//     flex: 1,
//     marginLeft: 8,
//     fontSize: 13,
//     fontWeight: "700",
//     color: COLORS.text,
//     paddingVertical: 0,
//   },

//   filterContent: {
//     paddingTop: 12,
//     gap: 9,
//   },

//   filterChip: {
//     height: 38,
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     backgroundColor: "#FAFCFF",
//     paddingHorizontal: 16,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   filterChipActive: {
//     backgroundColor: COLORS.teal,
//     borderColor: COLORS.teal,
//   },

//   filterText: {
//     fontSize: 12,
//     fontWeight: "900",
//     color: COLORS.muted,
//   },

//   filterTextActive: {
//     color: COLORS.white,
//   },

//   sectionHeader: {
//     marginBottom: 12,
//     paddingHorizontal: 2,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   sectionSub: {
//     marginTop: 3,
//     fontSize: 12,
//     fontWeight: "700",
//     color: COLORS.muted,
//   },

//   payoutBtn: {
//     height: 38,
//     borderRadius: 14,
//     backgroundColor: COLORS.tealLight,
//     paddingHorizontal: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//   },

//   payoutBtnText: {
//     fontSize: 12,
//     fontWeight: "900",
//     color: COLORS.teal,
//   },

//   teacherCard: {
//     borderRadius: 21,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 14,
//     marginBottom: 12,
//     shadowColor: COLORS.shadow,
//     shadowOpacity: 0.07,
//     shadowOffset: { width: 0, height: 5 },
//     shadowRadius: 14,
//     elevation: 2,
//   },

//   teacherTop: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   teacherAvatar: {
//     width: 45,
//     height: 45,
//     borderRadius: 23,
//     backgroundColor: COLORS.teal,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 11,
//   },

//   teacherAvatarText: {
//     fontSize: 18,
//     fontWeight: "900",
//     color: COLORS.white,
//   },

//   teacherInfo: {
//     flex: 1,
//     paddingRight: 8,
//   },

//   teacherName: {
//     fontSize: 15,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   teacherMeta: {
//     marginTop: 3,
//     fontSize: 11,
//     fontWeight: "700",
//     color: COLORS.muted,
//   },

//   statusBadge: {
//     borderRadius: 15,
//     paddingHorizontal: 8,
//     paddingVertical: 5,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 3,
//   },

//   statusText: {
//     fontSize: 10,
//     fontWeight: "900",
//   },

//   amountPanel: {
//     marginTop: 13,
//     borderRadius: 18,
//     backgroundColor: COLORS.tealSoft,
//     borderWidth: 1,
//     borderColor: "#C9E8E3",
//     padding: 13,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   amountLabel: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: COLORS.muted,
//   },

//   totalAmount: {
//     marginTop: 4,
//     fontSize: 22,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   amountRight: {
//     alignItems: "flex-end",
//   },

//   pendingLabel: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: COLORS.orange,
//   },

//   pendingAmount: {
//     marginTop: 4,
//     fontSize: 18,
//     fontWeight: "900",
//     color: COLORS.orange,
//   },

//   workStatsRow: {
//     marginTop: 12,
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//   },

//   workStat: {
//     borderRadius: 14,
//     backgroundColor: "#FAFCFF",
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     paddingHorizontal: 9,
//     paddingVertical: 6,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//   },

//   workStatText: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: COLORS.text,
//   },

//   teacherBottom: {
//     marginTop: 12,
//     paddingTop: 11,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   lastActivity: {
//     flex: 1,
//     fontSize: 11,
//     fontWeight: "700",
//     color: COLORS.muted,
//   },

//   openCircle: {
//     width: 35,
//     height: 35,
//     borderRadius: 18,
//     backgroundColor: COLORS.tealLight,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   emptyBox: {
//     borderRadius: 22,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 28,
//     alignItems: "center",
//   },

//   emptyTitle: {
//     marginTop: 12,
//     fontSize: 17,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   emptySub: {
//     marginTop: 5,
//     fontSize: 12,
//     lineHeight: 18,
//     fontWeight: "700",
//     color: COLORS.muted,
//     textAlign: "center",
//   },

//   modalOverlay: {
//     flex: 1,
//     justifyContent: "flex-end",
//   },

//   modalDim: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(7,18,58,0.35)",
//   },

//   detailCard: {
//     maxHeight: "88%",
//     backgroundColor: COLORS.white,
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     padding: 18,
//     paddingBottom: Platform.OS === "ios" ? 32 : 22,
//   },

//   detailHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 16,
//   },

//   detailTitle: {
//     fontSize: 20,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   detailSub: {
//     marginTop: 4,
//     fontSize: 12,
//     fontWeight: "700",
//     color: COLORS.muted,
//   },

//   closeBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 14,
//     backgroundColor: COLORS.bg,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   detailTeacherBox: {
//     borderRadius: 19,
//     backgroundColor: COLORS.tealSoft,
//     borderWidth: 1,
//     borderColor: "#C9E8E3",
//     padding: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 14,
//   },

//   detailAvatar: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     backgroundColor: COLORS.teal,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//   },

//   detailAvatarText: {
//     fontSize: 20,
//     fontWeight: "900",
//     color: COLORS.white,
//   },

//   detailTeacherName: {
//     fontSize: 16,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   detailTeacherMeta: {
//     marginTop: 3,
//     fontSize: 12,
//     fontWeight: "700",
//     color: COLORS.muted,
//   },

//   detailPendingAmount: {
//     fontSize: 18,
//     fontWeight: "900",
//     color: COLORS.orange,
//   },

//   detailSummaryGrid: {
//     flexDirection: "row",
//     gap: 8,
//     marginBottom: 12,
//   },

//   detailMiniCard: {
//     flex: 1,
//     borderRadius: 16,
//     backgroundColor: COLORS.bg,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 10,
//     alignItems: "center",
//   },

//   detailMiniValue: {
//     fontSize: 13,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   detailMiniLabel: {
//     marginTop: 3,
//     fontSize: 10,
//     fontWeight: "700",
//     color: COLORS.muted,
//   },

//   detailRow: {
//     minHeight: 64,
//     borderRadius: 17,
//     backgroundColor: COLORS.bg,
//     paddingHorizontal: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   detailIcon: {
//     width: 38,
//     height: 38,
//     borderRadius: 14,
//     backgroundColor: COLORS.tealLight,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 11,
//   },

//   detailLabel: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: COLORS.muted,
//   },

//   detailValue: {
//     marginTop: 3,
//     fontSize: 14,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   activitySectionTitle: {
//     marginTop: 4,
//     marginBottom: 10,
//     fontSize: 16,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   activityRow: {
//     minHeight: 76,
//     borderRadius: 17,
//     backgroundColor: COLORS.bg,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   activityIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 15,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },

//   activityInfo: {
//     flex: 1,
//     paddingRight: 8,
//   },

//   activityTitle: {
//     fontSize: 13,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   activityMeta: {
//     marginTop: 3,
//     fontSize: 11,
//     fontWeight: "700",
//     color: COLORS.muted,
//   },

//   activityCalc: {
//     marginTop: 5,
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 6,
//   },

//   activityCalcText: {
//     fontSize: 10,
//     fontWeight: "800",
//     color: COLORS.muted,
//   },

//   activityAmountBox: {
//     alignItems: "flex-end",
//   },

//   activityAmount: {
//     fontSize: 14,
//     fontWeight: "900",
//     color: COLORS.green,
//   },

//   smallStatusBadge: {
//     marginTop: 5,
//     borderRadius: 12,
//     paddingHorizontal: 7,
//     paddingVertical: 3,
//   },

//   smallStatusText: {
//     fontSize: 10,
//     fontWeight: "900",
//   },

//   primaryBtn: {
//     marginTop: 8,
//     height: 52,
//     borderRadius: 18,
//     backgroundColor: COLORS.teal,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     gap: 7,
//   },

//   primaryBtnText: {
//     fontSize: 14,
//     fontWeight: "900",
//     color: COLORS.white,
//   },

//   secondaryBtn: {
//     marginTop: 10,
//     height: 50,
//     borderRadius: 17,
//     backgroundColor: COLORS.tealLight,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   secondaryBtnText: {
//     fontSize: 14,
//     fontWeight: "900",
//     color: COLORS.teal,
//   },
// });



// src/screens/admin/AdminTeacherEarningsScreen.js

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminBottomNavigation from "../../components/AdminBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const { width } = Dimensions.get("window");
const isSmall = width < 380;

const COLORS = {
  bg: "#F6FAFB",
  white: "#FFFFFF",
  teal: "#00796B",
  tealDark: "#006A60",
  tealLight: "#E6F5F3",
  tealSoft: "#F0FFFC",
  text: "#07123A",
  muted: "#6E7891",
  border: "#E4EBF2",
  green: "#059669",
  greenSoft: "#DCFCE7",
  red: "#EF4444",
  redSoft: "#FEE2E2",
  orange: "#F97316",
  orangeSoft: "#FFEDD5",
  blue: "#2563EB",
  blueSoft: "#DBEAFE",
  purple: "#7C3AED",
  purpleSoft: "#EDE9FE",
  shadow: "rgba(0,0,0,0.10)",
};

const FILTERS = ["All", "Unpaid", "Paid", "Doubts", "Sessions", "Mock Tests"];

const RATE_CONFIG = {
  doubtRate: 40,
  sessionRate: 250,
  mockTestRate: 120,
  adminCommissionPercent: 20,
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function normalizeText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function getTeacherName(teacher = {}) {
  return (
    teacher.teacherName ||
    teacher.name ||
    teacher.fullName ||
    teacher.displayName ||
    "Teacher"
  );
}

function getTeacherId(teacher = {}) {
  return teacher.id || teacher.teacherId || teacher.tutorId || "";
}

function getTeacherSubject(teacher = {}) {
  return (
    teacher.subject ||
    teacher.primarySubject ||
    teacher.mainSubject ||
    teacher.subjectExpertise ||
    "General"
  );
}

function getTeacherAvatar(teacher = {}) {
  const raw = teacher.avatar || teacher.image || teacher.photo || "";

  if (typeof raw === "string" && /^https?:\/\//i.test(raw)) {
    return getInitial(getTeacherName(teacher));
  }

  return raw || getInitial(getTeacherName(teacher));
}

function getInitial(name = "T") {
  return String(name || "T").trim().charAt(0).toUpperCase() || "T";
}

function getAllTestsFromContext(getAllMockTests, mockData) {
  if (typeof getAllMockTests === "function") {
    return safeArray(getAllMockTests());
  }

  const tests = [];

  Object.values(mockData || {}).forEach((category) => {
    safeArray(category?.subjects).forEach((subject) => {
      safeArray(subject?.list).forEach((test) => {
        if (test?.isPublished !== false) {
          tests.push({
            ...test,
            category: category?.title,
            categoryTitle: category?.title,
            subjectId: subject?.id,
            subjectName: subject?.name,
          });
        }
      });
    });
  });

  return tests;
}

function belongsToTeacher(item = {}, teacher = {}) {
  const teacherId = String(getTeacherId(teacher) || "");
  const teacherName = normalizeText(getTeacherName(teacher));

  const itemTeacherId = String(
    item.teacherId ||
      item.tutorId ||
      item.assignedTeacherId ||
      item.createdBy ||
      item.acceptedBy ||
      ""
  );

  const itemTeacherName = normalizeText(
    item.teacherName ||
      item.tutorName ||
      item.tutor ||
      item.assignedTeacher ||
      item.createdByName ||
      ""
  );

  if (teacherId && itemTeacherId && teacherId === itemTeacherId) return true;
  if (teacherName && itemTeacherName && teacherName === itemTeacherName) return true;

  return false;
}

function parseTimestamp(value) {
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getTeacherPayoutCutoff(teacher = {}) {
  return parseTimestamp(
    teacher.lastPayoutAt ||
      teacher.paidAt ||
      teacher.lastPayoutProcessedAt ||
      teacher.lastPaidAt ||
      ""
  );
}

function getActivityTimestamp(item = {}) {
  return parseTimestamp(
    item.answeredAt ||
      item.completedAt ||
      item.endedAt ||
      item.publishedAt ||
      item.createdAt ||
      item.updatedAt ||
      item.submittedAt ||
      ""
  );
}

function calculateTeacherWork({ teacher, answeredDoubts, completedSessions, mockTests }) {
  const teacherDoubts = safeArray(answeredDoubts).filter((item) =>
    belongsToTeacher(item, teacher)
  );

  const teacherSessions = safeArray(completedSessions).filter((item) =>
    belongsToTeacher(item, teacher)
  );

  const teacherMockTests = safeArray(mockTests).filter((item) =>
    belongsToTeacher(item, teacher)
  );

  const completedDoubts = teacherDoubts.length;
  const completedSessionsCount = teacherSessions.length;
  const createdTests = teacherMockTests.length;

  const doubtAmount = completedDoubts * RATE_CONFIG.doubtRate;
  const sessionAmount = completedSessionsCount * RATE_CONFIG.sessionRate;
  const testAmount = createdTests * RATE_CONFIG.mockTestRate;

  const grossAmount = doubtAmount + sessionAmount + testAmount;
  const adminCommission = Math.round(
    (grossAmount * RATE_CONFIG.adminCommissionPercent) / 100
  );
  const payableAmount = Math.max(grossAmount - adminCommission, 0);

  const payoutCutoff = getTeacherPayoutCutoff(teacher);
  const cycleDoubts = teacherDoubts.filter((item) => {
    const ts = getActivityTimestamp(item);
    return ts > payoutCutoff || payoutCutoff === 0;
  });
  const cycleSessions = teacherSessions.filter((item) => {
    const ts = getActivityTimestamp(item);
    return ts > payoutCutoff || payoutCutoff === 0;
  });
  const cycleMockTests = teacherMockTests.filter((item) => {
    const ts = getActivityTimestamp(item);
    return ts > payoutCutoff || payoutCutoff === 0;
  });

  const cycleCompletedDoubts = cycleDoubts.length;
  const cycleCompletedSessionsCount = cycleSessions.length;
  const cycleCreatedTests = cycleMockTests.length;

  const cycleDoubtAmount = cycleCompletedDoubts * RATE_CONFIG.doubtRate;
  const cycleSessionAmount = cycleCompletedSessionsCount * RATE_CONFIG.sessionRate;
  const cycleTestAmount = cycleCreatedTests * RATE_CONFIG.mockTestRate;

  const cycleGrossAmount = cycleDoubtAmount + cycleSessionAmount + cycleTestAmount;
  const cycleAdminCommission = Math.round(
    (cycleGrossAmount * RATE_CONFIG.adminCommissionPercent) / 100
  );
  const cyclePayableAmount = Math.max(cycleGrossAmount - cycleAdminCommission, 0);

  return {
    completedDoubts,
    completedSessions: completedSessionsCount,
    createdTests,
    doubtAmount,
    sessionAmount,
    testAmount,
    grossAmount,
    adminCommission,
    payableAmount,
    cycleCompletedDoubts,
    cycleCompletedSessions: cycleCompletedSessionsCount,
    cycleCreatedTests,
    cycleDoubtAmount,
    cycleSessionAmount,
    cycleTestAmount,
    cycleGrossAmount,
    cycleAdminCommission,
    cyclePayableAmount,
    payoutCutoff,
    latestActivity:
      teacherDoubts[0]?.answeredAt ||
      teacherSessions[0]?.completedAt ||
      teacherSessions[0]?.endedAt ||
      teacherMockTests[0]?.createdAt ||
      teacher.updatedAt ||
      teacher.createdAt ||
      "",
  };
}

function buildTeacherActivities({ teacher, answeredDoubts, completedSessions, mockTests }) {
  const activities = [];
  const payoutCutoff = getTeacherPayoutCutoff(teacher);
  const hasCycleCutoff = payoutCutoff > 0;

  safeArray(answeredDoubts)
    .filter((item) => belongsToTeacher(item, teacher))
    .slice(0, 2)
    .forEach((item) => {
      const createdAt = item.answeredAt || item.updatedAt || item.createdAt || "";
      activities.push({
        id: item.id || item.doubtId || `D_${Date.now()}`,
        type: "Doubt",
        title: item.question || item.title || item.topic || "Doubt answered",
        grossAmount: RATE_CONFIG.doubtRate,
        adminCommission: Math.round(
          (RATE_CONFIG.doubtRate * RATE_CONFIG.adminCommissionPercent) / 100
        ),
        teacherAmount: Math.max(
          RATE_CONFIG.doubtRate -
            Math.round(
              (RATE_CONFIG.doubtRate * RATE_CONFIG.adminCommissionPercent) / 100
            ),
          0
        ),
        createdAt,
        status:
          hasCycleCutoff && getActivityTimestamp(item) <= payoutCutoff
            ? "Paid"
            : "Unpaid",
      });
    });

  safeArray(completedSessions)
    .filter((item) => belongsToTeacher(item, teacher))
    .slice(0, 2)
    .forEach((item) => {
      const createdAt = item.completedAt || item.endedAt || item.updatedAt || item.createdAt || "";
      activities.push({
        id: item.id || item.sessionId || `S_${Date.now()}`,
        type: "Session",
        title: `${item.subject || "Session"} completed`,
        grossAmount: RATE_CONFIG.sessionRate,
        adminCommission: Math.round(
          (RATE_CONFIG.sessionRate * RATE_CONFIG.adminCommissionPercent) / 100
        ),
        teacherAmount: Math.max(
          RATE_CONFIG.sessionRate -
            Math.round(
              (RATE_CONFIG.sessionRate * RATE_CONFIG.adminCommissionPercent) / 100
            ),
          0
        ),
        createdAt,
        status:
          hasCycleCutoff && getActivityTimestamp(item) <= payoutCutoff
            ? "Paid"
            : "Unpaid",
      });
    });

  safeArray(mockTests)
    .filter((item) => belongsToTeacher(item, teacher))
    .slice(0, 2)
    .forEach((item) => {
      const createdAt = item.createdAt || item.updatedAt || "";
      activities.push({
        id: item.id || item.testId || `T_${Date.now()}`,
        type: "Mock Test",
        title: item.title || "Mock test created",
        grossAmount: RATE_CONFIG.mockTestRate,
        adminCommission: Math.round(
          (RATE_CONFIG.mockTestRate * RATE_CONFIG.adminCommissionPercent) / 100
        ),
        teacherAmount: Math.max(
          RATE_CONFIG.mockTestRate -
            Math.round(
              (RATE_CONFIG.mockTestRate * RATE_CONFIG.adminCommissionPercent) / 100
            ),
          0
        ),
        createdAt,
        status:
          hasCycleCutoff && getActivityTimestamp(item) <= payoutCutoff
            ? "Paid"
            : "Unpaid",
      });
    });

  const chronological = [...activities].sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );

  let remainingPaid = Number(teacher.paidAmount || teacher.lastPayoutAmount || 0);

  const withStatus = chronological.map((item) => {
    const itemAmount = Number(item.teacherAmount || 0);
    const itemTimestamp = getActivityTimestamp(item);
    const isPaid = hasCycleCutoff
      ? itemTimestamp > 0 && itemTimestamp <= payoutCutoff
      : remainingPaid >= itemAmount && itemAmount > 0;

    if (isPaid) {
      if (!hasCycleCutoff) {
        remainingPaid -= itemAmount;
      }
    }

    return {
      ...item,
      status: isPaid ? "Paid" : "Unpaid",
    };
  });

  return withStatus
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 4);
}

// ✅ CHANGE 1: status: "Pending" గా మార్చాం — createTeacherEarningRecord లో override అవుతుంది
function normalizeTeacherRecord(teacher = {}) {
  const id = getTeacherId(teacher) || teacher.teacherName || teacher.name || `TEACHER_${Date.now()}`;
  const teacherName = getTeacherName(teacher);
  const paidAmount = Number(
    teacher.paidAmount ||
      teacher.settledAmount ||
      teacher.withdrawnAmount ||
      teacher.creditedAmount ||
      teacher.lastPayoutAmount ||
      0
  );

  return {
    id,
    teacherId: teacher.teacherId || teacher.id || id,
    teacherName,
    name: teacher.name || teacherName,
    subject: getTeacherSubject(teacher),
    avatar: getTeacherAvatar(teacher),
    rating: Number(teacher.rating || 0),
    status: "Pending", // ✅ FIXED: createTeacherEarningRecord లో correct గా set అవుతుంది
    paidAmount,
    pendingAmount: Number(teacher.pendingAmount || 0),
    totalEarned: Number(teacher.totalEarned || 0),
    doubts: Number(teacher.doubts || 0),
    sessions: Number(teacher.sessions || 0),
    mockTests: Number(teacher.mockTests || 0),
    lastActivity: teacher.lastActivity || teacher.updatedAt || teacher.createdAt || "",
    activities: safeArray(teacher.activities),
    teacherRaw: teacher,
  };
}

// ✅ CHANGE 2: pendingAmount > 0 అయితే "Unpaid", paidAmount > 0 అయితే "Paid"
function createTeacherEarningRecord({
  teacher,
  answeredDoubts,
  completedSessions,
  mockTests,
}) {
  const calc = calculateTeacherWork({
    teacher,
    answeredDoubts,
    completedSessions,
    mockTests,
  });

  const paidAmount = Number(
    teacher.paidAmount ||
      teacher.settledAmount ||
      teacher.withdrawnAmount ||
      teacher.creditedAmount ||
      teacher.lastPayoutAmount ||
      0
  );

  const pendingAmount = Math.max(calc.cyclePayableAmount || 0, 0);

  // ✅ FIXED STATUS LOGIC
  const status =
    calc.grossAmount <= 0
      ? "No Earnings"
      : pendingAmount > 0
      ? "Unpaid"
      : paidAmount > 0
      ? "Paid"
      : "No Earnings";

  return {
    id: teacher.id || teacher.teacherId || teacher.teacherName,
    teacherId: teacher.teacherId || teacher.id || "",
    teacherName: getTeacherName(teacher),
    subject: getTeacherSubject(teacher),
    avatar: getTeacherAvatar(teacher),
    totalEarned: calc.grossAmount,
    paidAmount,
    pendingAmount,
    doubts: calc.completedDoubts,
    sessions: calc.completedSessions,
    mockTests: calc.createdTests,
    rating: Number(teacher.rating || 0),
    status,
    lastActivity: calc.latestActivity,
    activities: buildTeacherActivities({
      teacher,
      answeredDoubts,
      completedSessions,
      mockTests,
    }),
  };
}

function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Today";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActivityTheme(type = "") {
  const clean = String(type).toLowerCase();

  if (clean.includes("session")) {
    return {
      bg: COLORS.purpleSoft,
      color: COLORS.purple,
      icon: "videocam-outline",
    };
  }

  if (clean.includes("mock")) {
    return {
      bg: COLORS.orangeSoft,
      color: COLORS.orange,
      icon: "document-text-outline",
    };
  }

  return {
    bg: COLORS.blueSoft,
    color: COLORS.blue,
    icon: "chatbubble-ellipses-outline",
  };
}

function getStatusTheme(status = "") {
  if (status === "Paid") {
    return {
      bg: COLORS.greenSoft,
      color: COLORS.green,
      icon: "checkmark-circle-outline",
    };
  }

  return {
    bg: COLORS.orangeSoft,
    color: COLORS.orange,
    icon: "time-outline",
  };
}

function SummaryCard({ title, value, sub, icon, color, bg }) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <Text style={styles.summaryValue} numberOfLines={1}>
        {value}
      </Text>

      <Text style={styles.summaryTitle} numberOfLines={1}>
        {title}
      </Text>

      {!!sub && (
        <Text style={[styles.summarySub, { color }]} numberOfLines={1}>
          {sub}
        </Text>
      )}
    </View>
  );
}

function TeacherEarningCard({ teacher, onPress }) {
  const statusTheme = getStatusTheme(teacher.status);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.teacherCard}
      onPress={() => onPress(teacher)}
    >
      <View style={styles.teacherTop}>
        <View style={styles.teacherAvatar}>
          <Text style={styles.teacherAvatarText}>{teacher.avatar}</Text>
        </View>

        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName} numberOfLines={1}>
            {teacher.teacherName}
          </Text>

          <Text style={styles.teacherMeta} numberOfLines={1}>
            {teacher.subject} • ⭐ {teacher.rating}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
          <Ionicons name={statusTheme.icon} size={13} color={statusTheme.color} />
          <Text style={[styles.statusText, { color: statusTheme.color }]}>
            {teacher.status}
          </Text>
        </View>
      </View>

      <View style={styles.amountPanel}>
        <View>
          <Text style={styles.amountLabel}>Total Earned</Text>
          <Text style={styles.totalAmount}>{formatMoney(teacher.totalEarned)}</Text>
        </View>

        <View style={styles.amountRight}>
          <Text style={styles.pendingLabel}>Pending</Text>
          <Text style={styles.pendingAmount}>{formatMoney(teacher.pendingAmount)}</Text>
        </View>
      </View>

      <View style={styles.workStatsRow}>
        <View style={styles.workStat}>
          <Ionicons name="chatbubble-ellipses-outline" size={17} color={COLORS.blue} />
          <Text style={styles.workStatText}>{teacher.doubts} Doubts</Text>
        </View>

        <View style={styles.workStat}>
          <Ionicons name="videocam-outline" size={17} color={COLORS.purple} />
          <Text style={styles.workStatText}>{teacher.sessions} Sessions</Text>
        </View>

        <View style={styles.workStat}>
          <Ionicons name="document-text-outline" size={17} color={COLORS.orange} />
          <Text style={styles.workStatText}>{teacher.mockTests} Tests</Text>
        </View>
      </View>

      <View style={styles.teacherBottom}>
        <Text style={styles.lastActivity}>
          Last activity: {formatDateTime(teacher.lastActivity)}
        </Text>

        <View style={styles.openCircle}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.teal} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ActivityRow({ item }) {
  const theme = getActivityTheme(item.type);
  const statusTheme = getStatusTheme(item.status);

  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityIcon, { backgroundColor: theme.bg }]}>
        <Ionicons name={theme.icon} size={20} color={theme.color} />
      </View>

      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={styles.activityMeta}>
          {item.type} • {formatDateTime(item.createdAt)}
        </Text>

        <View style={styles.activityCalc}>
          <Text style={styles.activityCalcText}>
            Gross {formatMoney(item.grossAmount)}
          </Text>
          <Text style={styles.activityCalcText}>
            Commission {formatMoney(item.adminCommission)}
          </Text>
        </View>
      </View>

      <View style={styles.activityAmountBox}>
        <Text style={styles.activityAmount}>
          +{formatMoney(item.teacherAmount)}
        </Text>

        <View style={[styles.smallStatusBadge, { backgroundColor: statusTheme.bg }]}>
          <Text style={[styles.smallStatusText, { color: statusTheme.color }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );
}

function DetailRow({ label, value, icon }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={COLORS.teal} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function AdminTeacherEarningsScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const {
    tutors = [],
    tuitionRequests = [],
    answeredDoubts = [],
    completedSessions = [],
    mockData = {},
    getAllMockTests,
  } = useAppContext();

  const allMockTests = useMemo(
    () => getAllTestsFromContext(getAllMockTests, mockData),
    [getAllMockTests, mockData]
  );

  const teachersSource = useMemo(() => {
    const byId = new Map();

    const addTeacher = (teacher = {}) => {
      const normalized = normalizeTeacherRecord(teacher);
      const key = String(normalized.id || normalized.teacherId || normalized.teacherName);

      if (!byId.has(key) || normalized.teacherName !== "Teacher") {
        byId.set(key, normalized);
      }
    };

    safeArray(tutors).forEach((teacher) => addTeacher(teacher));

    safeArray(tuitionRequests).forEach((request) => {
      if (!request.teacherId && !request.tutorId && !request.teacherName) {
        return;
      }

      addTeacher({
        id: request.teacherId || request.tutorId || request.teacherName,
        teacherId: request.teacherId || request.tutorId || request.teacherName,
        teacherName: request.teacherName || request.tutorName || "Teacher",
        name: request.teacherName || request.tutorName || "Teacher",
        subject: request.subject || request.topic || "General",
        rating: request.rating || 0,
        status:
          request.status === "accepted"
            ? "Accepted"
            : request.status === "pending"
            ? "Pending"
            : request.status || "Unpaid",
      });
    });

    safeArray(answeredDoubts).forEach((item) => {
      if (item?.teacherId || item?.assignedTeacherId || item?.teacherName || item?.assignedTeacher) {
        addTeacher({
          id: item.teacherId || item.assignedTeacherId || item.teacherName || item.assignedTeacher,
          teacherId: item.teacherId || item.assignedTeacherId || item.teacherName || item.assignedTeacher,
          teacherName: item.teacherName || item.assignedTeacher || "Teacher",
          name: item.teacherName || item.assignedTeacher || "Teacher",
          subject: item.subject || "General",
        });
      }
    });

    safeArray(completedSessions).forEach((item) => {
      if (item?.teacherId || item?.tutorId || item?.teacherName || item?.tutorName) {
        addTeacher({
          id: item.teacherId || item.tutorId || item.teacherName || item.tutorName,
          teacherId: item.teacherId || item.tutorId || item.teacherName || item.tutorName,
          teacherName: item.teacherName || item.tutorName || "Teacher",
          name: item.teacherName || item.tutorName || "Teacher",
          subject: item.subject || "General",
        });
      }
    });

    safeArray(allMockTests).forEach((item) => {
      if (item?.teacherId || item?.createdBy || item?.teacherName || item?.createdByName) {
        addTeacher({
          id: item.teacherId || item.createdBy || item.teacherName || item.createdByName,
          teacherId: item.teacherId || item.createdBy || item.teacherName || item.createdByName,
          teacherName: item.teacherName || item.createdByName || "Teacher",
          name: item.teacherName || item.createdByName || "Teacher",
          subject: item.subjectName || item.subject || "General",
        });
      }
    });

    return Array.from(byId.values());
  }, [
    completedSessions,
    answeredDoubts,
    tutors,
    tuitionRequests,
    getAllMockTests,
    mockData,
  ]);

  const teachers = useMemo(
    () =>
      teachersSource
        .map((teacher) =>
          createTeacherEarningRecord({
            teacher,
            answeredDoubts,
            completedSessions,
            mockTests: allMockTests,
          })
        )
        .sort(
          (a, b) =>
            new Date(b.lastActivity || 0).getTime() -
            new Date(a.lastActivity || 0).getTime()
        ),
    [answeredDoubts, allMockTests, completedSessions, teachersSource]
  );

  const summary = useMemo(() => {
    const totalEarned = teachers.reduce(
      (sum, item) => sum + Number(item.totalEarned || 0),
      0
    );

    const paidAmount = teachers.reduce(
      (sum, item) => sum + Number(item.paidAmount || 0),
      0
    );

    const pendingAmount = teachers.reduce(
      (sum, item) => sum + Number(item.pendingAmount || 0),
      0
    );

    const totalDoubts = teachers.reduce(
      (sum, item) => sum + Number(item.doubts || 0),
      0
    );

    const totalSessions = teachers.reduce(
      (sum, item) => sum + Number(item.sessions || 0),
      0
    );

    const totalMockTests = teachers.reduce(
      (sum, item) => sum + Number(item.mockTests || 0),
      0
    );

    return {
      totalEarned,
      paidAmount,
      pendingAmount,
      totalDoubts,
      totalSessions,
      totalMockTests,
      teacherCount: teachers.length,
    };
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return teachers.filter((item) => {
      const searchMatch =
        !q ||
        String(item.teacherName || "").toLowerCase().includes(q) ||
        String(item.subject || "").toLowerCase().includes(q) ||
        String(item.id || "").toLowerCase().includes(q);

      let filterMatch = true;

      if (activeFilter === "Paid") {
        filterMatch = item.status === "Paid";
      } else if (activeFilter === "Unpaid") {
        filterMatch = item.status === "Unpaid";
      } else if (activeFilter === "Doubts") {
        filterMatch = Number(item.doubts || 0) > 0;
      } else if (activeFilter === "Sessions") {
        filterMatch = Number(item.sessions || 0) > 0;
      } else if (activeFilter === "Mock Tests") {
        filterMatch = Number(item.mockTests || 0) > 0;
      }

      return searchMatch && filterMatch;
    });
  }, [teachers, search, activeFilter]);

  const openTeacherDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setDetailVisible(true);
  };

  const closeDetails = () => {
    setDetailVisible(false);
    setSelectedTeacher(null);
  };

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation?.navigate?.("AdminDashboard");
  };

  const goToPayout = () => {
    if (!selectedTeacher) return;

    closeDetails();

    navigation?.navigate?.("AdminTeacherPayouts", {
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.teacherName,
      pendingAmount: selectedTeacher.pendingAmount,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.tealDark} />

      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.headerBtn}
            onPress={goBackSafe}
          >
            <Ionicons name="chevron-back" size={25} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Teacher Earnings</Text>
            <Text style={styles.headerSub}>Instant earning management</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.headerBtn}
            onPress={() => setSearch("")}
          >
            <Ionicons name="refresh-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Ionicons name="cash-outline" size={30} color={COLORS.teal} />
              </View>

              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle}>Instant Teacher Earnings</Text>
                <Text style={styles.heroSub}>
                  Teachers earn after completed doubts, sessions and mock tests.
                </Text>
              </View>
            </View>

            <View style={styles.heroAmountRow}>
              <View>
                <Text style={styles.heroAmount}>{formatMoney(summary.totalEarned)}</Text>
                <Text style={styles.heroAmountSub}>Total teacher earnings</Text>
              </View>

              <View style={styles.heroBadge}>
                <Ionicons name="flash-outline" size={16} color={COLORS.green} />
                <Text style={styles.heroBadgeText}>Instant</Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryCard
              title="Total Earned"
              value={formatMoney(summary.totalEarned)}
              sub={`${summary.teacherCount} teachers`}
              icon="cash-outline"
              color={COLORS.teal}
              bg={COLORS.tealLight}
            />

            <SummaryCard
              title="Paid"
              value={formatMoney(summary.paidAmount)}
              sub="Completed payouts"
              icon="checkmark-circle-outline"
              color={COLORS.green}
              bg={COLORS.greenSoft}
            />

            <SummaryCard
              title="Pending"
              value={formatMoney(summary.pendingAmount)}
              sub="Need payout"
              icon="time-outline"
              color={COLORS.orange}
              bg={COLORS.orangeSoft}
            />

            <SummaryCard
              title="Work Done"
              value={summary.totalDoubts + summary.totalSessions + summary.totalMockTests}
              sub="Doubts + classes + tests"
              icon="briefcase-outline"
              color={COLORS.blue}
              bg={COLORS.blueSoft}
            />
          </View>

          <View style={styles.workOverviewCard}>
            <View style={styles.workOverviewItem}>
              <Ionicons name="chatbubble-ellipses-outline" size={21} color={COLORS.blue} />
              <Text style={styles.workOverviewValue}>{summary.totalDoubts}</Text>
              <Text style={styles.workOverviewLabel}>Doubts</Text>
            </View>

            <View style={styles.workOverviewDivider} />

            <View style={styles.workOverviewItem}>
              <Ionicons name="videocam-outline" size={21} color={COLORS.purple} />
              <Text style={styles.workOverviewValue}>{summary.totalSessions}</Text>
              <Text style={styles.workOverviewLabel}>Sessions</Text>
            </View>

            <View style={styles.workOverviewDivider} />

            <View style={styles.workOverviewItem}>
              <Ionicons name="document-text-outline" size={21} color={COLORS.orange} />
              <Text style={styles.workOverviewValue}>{summary.totalMockTests}</Text>
              <Text style={styles.workOverviewLabel}>Mock Tests</Text>
            </View>
          </View>

          <View style={styles.searchCard}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={19} color={COLORS.muted} />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search teacher or subject..."
                placeholderTextColor="#9AA4B6"
                style={styles.searchInput}
              />

              {search.length > 0 && (
                <TouchableOpacity activeOpacity={0.75} onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={19} color={COLORS.muted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
            >
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter;

                return (
                  <TouchableOpacity
                    key={filter}
                    activeOpacity={0.85}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Teacher Earnings</Text>
              <Text style={styles.sectionSub}>
                {filteredTeachers.length} teachers found
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.payoutBtn}
              onPress={() => navigation?.navigate?.("AdminTeacherPayouts")}
            >
              <Ionicons name="wallet-outline" size={17} color={COLORS.teal} />
              <Text style={styles.payoutBtnText}>Payouts</Text>
            </TouchableOpacity>
          </View>

          {filteredTeachers.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="cash-outline" size={44} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No earnings found</Text>
              <Text style={styles.emptySub}>
                Try changing search text or selected filter.
              </Text>
            </View>
          ) : (
            filteredTeachers.map((teacher) => (
              <TeacherEarningCard
                key={teacher.id}
                teacher={teacher}
                onPress={openTeacherDetails}
              />
            ))
          )}
        </ScrollView>

        <AdminBottomNavigation navigation={navigation} active="Earnings" />
      </View>

      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDim} onPress={closeDetails} />

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.detailTitle}>Teacher Details</Text>
                <Text style={styles.detailSub}>Earning breakdown and activities</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.closeBtn}
                onPress={closeDetails}
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedTeacher && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailTeacherBox}>
                  <View style={styles.detailAvatar}>
                    <Text style={styles.detailAvatarText}>
                      {selectedTeacher.avatar}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailTeacherName}>
                      {selectedTeacher.teacherName}
                    </Text>
                    <Text style={styles.detailTeacherMeta}>
                      {selectedTeacher.subject} • ⭐ {selectedTeacher.rating}
                    </Text>
                  </View>

                  <Text style={styles.detailPendingAmount}>
                    {formatMoney(selectedTeacher.pendingAmount)}
                  </Text>
                </View>

                <View style={styles.detailSummaryGrid}>
                  <View style={styles.detailMiniCard}>
                    <Text style={styles.detailMiniValue}>
                      {formatMoney(selectedTeacher.totalEarned)}
                    </Text>
                    <Text style={styles.detailMiniLabel}>Total</Text>
                  </View>

                  <View style={styles.detailMiniCard}>
                    <Text style={styles.detailMiniValue}>
                      {formatMoney(selectedTeacher.paidAmount)}
                    </Text>
                    <Text style={styles.detailMiniLabel}>Paid</Text>
                  </View>

                  <View style={styles.detailMiniCard}>
                    <Text style={styles.detailMiniValue}>
                      {formatMoney(selectedTeacher.pendingAmount)}
                    </Text>
                    <Text style={styles.detailMiniLabel}>Pending</Text>
                  </View>
                </View>

                <DetailRow
                  icon="chatbubble-ellipses-outline"
                  label="Completed Doubts"
                  value={`${selectedTeacher.doubts} doubts`}
                />

                <DetailRow
                  icon="videocam-outline"
                  label="Completed Sessions"
                  value={`${selectedTeacher.sessions} sessions`}
                />

                <DetailRow
                  icon="document-text-outline"
                  label="Mock Tests Created"
                  value={`${selectedTeacher.mockTests} mock tests`}
                />

                <Text style={styles.activitySectionTitle}>Recent Activities</Text>

                {selectedTeacher.activities.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}

                {selectedTeacher.pendingAmount > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.86}
                    style={styles.primaryBtn}
                    onPress={goToPayout}
                  >
                    <Ionicons name="wallet-outline" size={19} color={COLORS.white} />
                    <Text style={styles.primaryBtnText}>Go to Payout</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  activeOpacity={0.86}
                  style={styles.secondaryBtn}
                  onPress={closeDetails}
                >
                  <Text style={styles.secondaryBtnText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.tealDark,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    height: Platform.OS === "ios" ? 108 : 92,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "ios" ? 22 : 14,
    flexDirection: "row",
    alignItems: "center",
  },

  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontSize: isSmall ? 21 : 24,
    fontWeight: "900",
    color: COLORS.white,
  },

  headerSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.82)",
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 138 : 122,
  },

  heroCard: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 3,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  heroInfo: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  heroSub: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "650",
    color: COLORS.muted,
  },

  heroAmountRow: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroAmount: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },

  heroAmountSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  heroBadge: {
    borderRadius: 18,
    backgroundColor: COLORS.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  heroBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.green,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  summaryCard: {
    width: (width - 40) / 2,
    minHeight: 118,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 2,
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  summaryValue: {
    fontSize: isSmall ? 18 : 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  summaryTitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
  },

  summarySub: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "900",
  },

  workOverviewCard: {
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  workOverviewItem: {
    flex: 1,
    alignItems: "center",
  },

  workOverviewValue: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  workOverviewLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.muted,
  },

  workOverviewDivider: {
    width: 1,
    height: 48,
    backgroundColor: COLORS.border,
  },

  searchCard: {
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 16,
  },

  searchBox: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F9FBFD",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    paddingVertical: 0,
  },

  filterContent: {
    paddingTop: 12,
    gap: 9,
  },

  filterChip: {
    height: 38,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FAFCFF",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  filterChipActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },

  filterText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.muted,
  },

  filterTextActive: {
    color: COLORS.white,
  },

  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  sectionSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  payoutBtn: {
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  payoutBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.teal,
  },

  teacherCard: {
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 2,
  },

  teacherTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  teacherAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  teacherAvatarText: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.white,
  },

  teacherInfo: {
    flex: 1,
    paddingRight: 8,
  },

  teacherName: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  teacherMeta: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  statusBadge: {
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  amountPanel: {
    marginTop: 13,
    borderRadius: 18,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  amountLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
  },

  totalAmount: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
  },

  amountRight: {
    alignItems: "flex-end",
  },

  pendingLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.orange,
  },

  pendingAmount: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.orange,
  },

  workStatsRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  workStat: {
    borderRadius: 14,
    backgroundColor: "#FAFCFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  workStatText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
  },

  teacherBottom: {
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  lastActivity: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  openCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyBox: {
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptySub: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7,18,58,0.35)",
  },

  detailCard: {
    maxHeight: "88%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    paddingBottom: Platform.OS === "ios" ? 32 : 22,
  },

  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  detailTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  detailSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  detailTeacherBox: {
    borderRadius: 19,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 1,
    borderColor: "#C9E8E3",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  detailAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  detailAvatarText: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.white,
  },

  detailTeacherName: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  detailTeacherMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  detailPendingAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.orange,
  },

  detailSummaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  detailMiniCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    alignItems: "center",
  },

  detailMiniValue: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },

  detailMiniLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.muted,
  },

  detailRow: {
    minHeight: 64,
    borderRadius: 17,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  detailLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
  },

  detailValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  activitySectionTitle: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  activityRow: {
    minHeight: 76,
    borderRadius: 17,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  activityInfo: {
    flex: 1,
    paddingRight: 8,
  },

  activityTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },

  activityMeta: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
  },

  activityCalc: {
    marginTop: 5,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  activityCalcText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.muted,
  },

  activityAmountBox: {
    alignItems: "flex-end",
  },

  activityAmount: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.green,
  },

  smallStatusBadge: {
    marginTop: 5,
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  smallStatusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  primaryBtn: {
    marginTop: 8,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  primaryBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },

  secondaryBtn: {
    marginTop: 10,
    height: 50,
    borderRadius: 17,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.teal,
  },
});
