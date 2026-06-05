

// // screens/teacher/TeacherScheduleScreen.js
// // FULLY UPDATED — Neat professional mobile UI + working calendar + filter + details modal

// import React, { useMemo, useState } from 'react';
// import {
//   SafeAreaView,
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   StatusBar,
//   Platform,
//   Dimensions,
//   Modal,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import TeacherBottomNavigation from '../../components/TeacherBottomNavigation';

// const { width } = Dimensions.get('window');

// const IS_SMALL = width < 380;
// const IS_TINY = width < 340;

// const C = {
//   primary: '#00796F',
//   primaryDark: '#00534E',
//   primaryDeep: '#003E3B',
//   primaryLight: '#EAF8F6',
//   primarySoft: '#F4FBFA',
//   bg: '#F3F7FA',
//   white: '#FFFFFF',
//   text: '#07123A',
//   muted: '#74819A',
//   muted2: '#9AA6B8',
//   border: '#E4ECF4',
//   green: '#22C55E',
//   red: '#FF3B30',
//   warning: '#F59E0B',
//   warningBg: '#FFF7E6',
//   shadow: '#0F172A',
// };

// function pad2(value) {
//   return String(value).padStart(2, '0');
// }

// function formatDateKey(date) {
//   return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
// }

// const TODAY = new Date();
// const TODAY_KEY = formatDateKey(TODAY);
// const YESTERDAY_KEY = formatDateKey(
//   new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - 1)
// );
// const TOMORROW_KEY = formatDateKey(
//   new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 1)
// );

// const ALL_SESSIONS = [
//   {
//     id: '1',
//     date: TODAY_KEY,
//     student: 'Ananya Sharma',
//     className: 'Class 10',
//     subject: 'Mathematics',
//     topic: 'Algebra',
//     focus: 'Linear Equations, Quadratic Equations',
//     avatar: 'https://i.pravatar.cc/150?img=47',
//     timeStart: '4:00 PM',
//     timeEnd: '5:00 PM',
//     duration: '1 Hour',
//     status: 'confirmed',
//     online: true,
//   },
//   {
//     id: '2',
//     date: TODAY_KEY,
//     student: 'Rohan Verma',
//     className: 'Class 12',
//     subject: 'Physics',
//     topic: 'Electromagnetism',
//     focus: 'EM Waves, Applications',
//     avatar: 'https://i.pravatar.cc/150?img=12',
//     timeStart: '6:00 PM',
//     timeEnd: '7:00 PM',
//     duration: '1 Hour',
//     status: 'confirmed',
//     online: true,
//   },
//   {
//     id: '3',
//     date: TODAY_KEY,
//     student: 'Meera Iyer',
//     className: 'Class 11',
//     subject: 'Chemistry',
//     topic: 'Organic Chemistry',
//     focus: 'Reactions & Mechanisms',
//     avatar: 'https://i.pravatar.cc/150?img=32',
//     timeStart: '5:00 PM',
//     timeEnd: '6:00 PM',
//     duration: '1 Hour',
//     status: 'confirmed',
//     online: true,
//   },
//   {
//     id: '4',
//     date: YESTERDAY_KEY,
//     student: 'Kavya Reddy',
//     className: 'Class 11',
//     subject: 'Biology',
//     topic: 'Human Physiology',
//     focus: 'Digestion, Breathing, Circulation',
//     avatar: 'https://i.pravatar.cc/150?img=36',
//     timeStart: '7:00 PM',
//     timeEnd: '8:00 PM',
//     duration: '1 Hour',
//     status: 'pending',
//     online: false,
//   },
//   {
//     id: '5',
//     date: TOMORROW_KEY,
//     student: 'Arjun Nair',
//     className: 'Class 9',
//     subject: 'English',
//     topic: 'Grammar',
//     focus: 'Tenses, Active & Passive Voice',
//     avatar: 'https://i.pravatar.cc/150?img=15',
//     timeStart: '3:00 PM',
//     timeEnd: '4:00 PM',
//     duration: '1 Hour',
//     status: 'pending',
//     online: true,
//   },
// ];

// const MONTHS = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
// ];

// const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// function isSameDay(a, b) {
//   return formatDateKey(a) === formatDateKey(b);
// }

// function addDays(date, days) {
//   const d = new Date(date);
//   d.setDate(d.getDate() + days);
//   return d;
// }

// function getStartOfWeekMonday(date) {
//   const d = new Date(date);
//   const day = d.getDay();
//   const diff = day === 0 ? -6 : 1 - day;
//   d.setDate(d.getDate() + diff);
//   return d;
// }

// function getWeekDays(date) {
//   const start = getStartOfWeekMonday(date);
//   return Array.from({ length: 7 }, (_, index) => addDays(start, index));
// }

// function getStatusLabel(status) {
//   if (status === 'confirmed') return 'Confirmed';
//   if (status === 'pending') return 'Pending';
//   return 'Scheduled';
// }

// function formatReadableDate(dateKey) {
//   const [year, month, day] = dateKey.split('-');
//   return `${day}-${month}-${year}`;
// }

// export default function TeacherScheduleScreen({ navigation }) {
//   const initialDate = new Date();

//   const [selectedDate, setSelectedDate] = useState(initialDate);
//   const [calendarBaseDate, setCalendarBaseDate] = useState(initialDate);
//   const [filterActive, setFilterActive] = useState(false);
//   const [selectedSession, setSelectedSession] = useState(null);

//   const weekDays = useMemo(() => getWeekDays(calendarBaseDate), [calendarBaseDate]);
//   const selectedDateKey = formatDateKey(selectedDate);

//   const visibleSessions = useMemo(() => {
//     const sessionsForDate = ALL_SESSIONS.filter(item => item.date === selectedDateKey);

//     if (!filterActive) {
//       return sessionsForDate;
//     }

//     return sessionsForDate.filter(item => item.status === 'confirmed');
//   }, [selectedDateKey, filterActive]);

//   const monthTitle = `${MONTHS[calendarBaseDate.getMonth()]} ${calendarBaseDate.getFullYear()}`;

//   const handlePrevWeek = () => {
//     const nextBase = addDays(calendarBaseDate, -7);
//     setCalendarBaseDate(nextBase);
//     setSelectedDate(nextBase);
//   };

//   const handleNextWeek = () => {
//     const nextBase = addDays(calendarBaseDate, 7);
//     setCalendarBaseDate(nextBase);
//     setSelectedDate(nextBase);
//   };

//   const handleToday = () => {
//     const today = new Date();
//     setCalendarBaseDate(today);
//     setSelectedDate(today);
//   };

//   const handleStartSession = item => {
//     navigation?.navigate?.('SessionMeet', {
//       sessionId: item.id,
//       student: item.student,
//       subject: item.subject,
//       topic: item.topic,
//       focus: item.focus,
//       timeStart: item.timeStart,
//       timeEnd: item.timeEnd,
//       duration: item.duration,
//       date: item.date,
//     });
//   };

//   const handleViewDetails = item => {
//     setSelectedSession(item);
//   };

//   const closeDetails = () => {
//     setSelectedSession(null);
//   };

//   const renderCalendarDay = date => {
//     const isSelected = isSameDay(date, selectedDate);
//     const isToday = isSameDay(date, new Date());
//     const dayLabel = DAY_LABELS[date.getDay()];
//     const dateNumber = date.getDate();

//     return (
//       <TouchableOpacity
//         key={formatDateKey(date)}
//         style={styles.dateCol}
//         activeOpacity={0.8}
//         onPress={() => setSelectedDate(date)}
//       >
//         <Text style={[styles.dayLbl, isSelected && styles.dayLblSelected]}>{dayLabel}</Text>

//         <View
//           style={[
//             styles.dateBubble,
//             isToday && !isSelected && styles.todayBubble,
//             isSelected && styles.dateBubbleSel,
//           ]}
//         >
//           <Text
//             style={[
//               styles.dateNum,
//               isToday && !isSelected && styles.todayDateNum,
//               isSelected && styles.dateNumSelected,
//             ]}
//           >
//             {dateNumber}
//           </Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const InfoLine = ({ icon, label, value }) => (
//     <View style={styles.infoLine}>
//       <View style={styles.infoIcon}>
//         <Ionicons name={icon} size={15} color={C.primary} />
//       </View>

//       <View style={styles.infoTextBox}>
//         <Text style={styles.infoLabel}>{label}</Text>
//         <Text style={styles.infoValue}>{value}</Text>
//       </View>
//     </View>
//   );

//   const SessionCard = ({ item }) => {
//     const isConfirmed = item.status === 'confirmed';

//     return (
//       <View style={styles.sessionCard}>
//         <View style={styles.cardTopRow}>
//           <View style={styles.avatarWrap}>
//             <Image source={{ uri: item.avatar }} style={styles.avatar} />
//             {item.online && <View style={styles.onlineDot} />}
//           </View>

//           <View style={styles.studentInfo}>
//             <Text style={styles.studentName} numberOfLines={1}>
//               {item.student}
//             </Text>

//             <Text style={styles.studentSub} numberOfLines={1}>
//               {item.className} • {item.subject}
//             </Text>
//           </View>

//           <View style={[styles.statusBadge, !isConfirmed && styles.pendingBadge]}>
//             <Text style={[styles.statusTxt, !isConfirmed && styles.pendingTxt]}>
//               {getStatusLabel(item.status)}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.timeBox}>
//           <View style={styles.timeItem}>
//             <View style={styles.timeIcon}>
//               <Ionicons name="time-outline" size={15} color={C.primary} />
//             </View>
//             <View>
//               <Text style={styles.timeLabel}>Start</Text>
//               <Text style={styles.timeValue}>{item.timeStart}</Text>
//             </View>
//           </View>

//           <View style={styles.timeDivider} />

//           <View style={styles.timeItem}>
//             <View style={styles.timeIcon}>
//               <Ionicons name="time-outline" size={15} color={C.primary} />
//             </View>
//             <View>
//               <Text style={styles.timeLabel}>End</Text>
//               <Text style={styles.timeValue}>{item.timeEnd}</Text>
//             </View>
//           </View>

//           <View style={styles.timeDivider} />

//           <View style={styles.timeItem}>
//             <View style={styles.timeIcon}>
//               <Ionicons name="hourglass-outline" size={15} color={C.primary} />
//             </View>
//             <View>
//               <Text style={styles.timeLabel}>Duration</Text>
//               <Text style={styles.timeValue}>{item.duration}</Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.topicBox}>
//           <View style={styles.topicRow}>
//             <Ionicons name="book-outline" size={15} color={C.primary} />
//             <Text style={styles.topicLabel}>Topic</Text>
//           </View>

//           <Text style={styles.topicValue} numberOfLines={1}>
//             {item.topic}
//           </Text>

//           <Text style={styles.focusText} numberOfLines={2}>
//             {item.focus}
//           </Text>
//         </View>

//         <View style={styles.btnRow}>
//           <TouchableOpacity
//             style={styles.startBtn}
//             activeOpacity={0.88}
//             onPress={() => handleStartSession(item)}
//           >
//             <Ionicons name="videocam" size={15} color={C.white} />
//             <Text style={styles.startBtnTxt}>Start Session</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.detailsBtn}
//             activeOpacity={0.82}
//             onPress={() => handleViewDetails(item)}
//           >
//             <Text style={styles.detailsTxt}>Details</Text>
//             <Ionicons name="chevron-forward" size={15} color={C.primary} />
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   const EmptyState = () => (
//     <View style={styles.emptyCard}>
//       <View style={styles.emptyIconBox}>
//         <Ionicons name="calendar-clear-outline" size={24} color={C.primary} />
//       </View>

//       <Text style={styles.emptyTitle}>No sessions found</Text>

//       <Text style={styles.emptySub}>
//         Select another date from the calendar to view your upcoming sessions.
//       </Text>
//     </View>
//   );

//   const DetailsModal = () => {
//     if (!selectedSession) return null;

//     const isConfirmed = selectedSession.status === 'confirmed';

//     return (
//       <Modal
//         visible={!!selectedSession}
//         transparent
//         animationType="slide"
//         onRequestClose={closeDetails}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <View style={styles.modalHandle} />

//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Session Details</Text>

//               <TouchableOpacity style={styles.modalCloseBtn} onPress={closeDetails}>
//                 <Ionicons name="close" size={19} color={C.text} />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.modalProfileRow}>
//               <Image source={{ uri: selectedSession.avatar }} style={styles.modalAvatar} />

//               <View style={styles.modalProfileText}>
//                 <Text style={styles.modalName} numberOfLines={1}>
//                   {selectedSession.student}
//                 </Text>
//                 <Text style={styles.modalSub} numberOfLines={1}>
//                   {selectedSession.className} • {selectedSession.subject}
//                 </Text>
//               </View>

//               <View style={[styles.statusBadge, !isConfirmed && styles.pendingBadge]}>
//                 <Text style={[styles.statusTxt, !isConfirmed && styles.pendingTxt]}>
//                   {getStatusLabel(selectedSession.status)}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.modalInfoBox}>
//               <InfoLine
//                 icon="calendar-outline"
//                 label="Date"
//                 value={formatReadableDate(selectedSession.date)}
//               />
//               <InfoLine
//                 icon="time-outline"
//                 label="Time"
//                 value={`${selectedSession.timeStart} - ${selectedSession.timeEnd}`}
//               />
//               <InfoLine
//                 icon="hourglass-outline"
//                 label="Duration"
//                 value={selectedSession.duration}
//               />
//               <InfoLine icon="book-outline" label="Topic" value={selectedSession.topic} />
//               <InfoLine
//                 icon="radio-button-on-outline"
//                 label="Focus"
//                 value={selectedSession.focus}
//               />
//             </View>

//             <TouchableOpacity
//               style={styles.modalStartBtn}
//               activeOpacity={0.88}
//               onPress={() => {
//                 const tempSession = selectedSession;
//                 closeDetails();
//                 handleStartSession(tempSession);
//               }}
//             >
//               <Ionicons name="videocam" size={16} color={C.white} />
//               <Text style={styles.modalStartTxt}>Start Session</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   const HeaderComponent = () => (
//     <>
//       <View style={styles.statsCard}>
//         <View style={styles.statItem}>
//           <Text style={styles.statNumber}>{ALL_SESSIONS.filter(x => x.date === TODAY_KEY).length}</Text>
//           <Text style={styles.statLabel}>Today</Text>
//         </View>

//         <View style={styles.statDivider} />

//         <View style={styles.statItem}>
//           <Text style={styles.statNumber}>
//             {ALL_SESSIONS.filter(x => x.status === 'confirmed').length}
//           </Text>
//           <Text style={styles.statLabel}>Confirmed</Text>
//         </View>

//         <View style={styles.statDivider} />

//         <View style={styles.statItem}>
//           <Text style={styles.statNumber}>
//             {ALL_SESSIONS.filter(x => x.status === 'pending').length}
//           </Text>
//           <Text style={styles.statLabel}>Pending</Text>
//         </View>
//       </View>

//       <View style={styles.calCard}>
//         <View style={styles.calTopRow}>
//           <View style={styles.monthLeft}>
//             <View style={styles.calIconCircle}>
//               <Ionicons name="calendar-outline" size={17} color={C.primary} />
//             </View>

//             <Text style={styles.monthTxt} numberOfLines={1}>
//               {monthTitle}
//             </Text>
//           </View>

//           <TouchableOpacity style={styles.todayBtn} activeOpacity={0.8} onPress={handleToday}>
//             <Text style={styles.todayTxt}>Today</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.weekRow}>
//           <TouchableOpacity style={styles.arrowBtn} activeOpacity={0.75} onPress={handlePrevWeek}>
//             <Ionicons name="chevron-back" size={18} color={C.text} />
//           </TouchableOpacity>

//           <View style={styles.daysWrap}>{weekDays.map(renderCalendarDay)}</View>

//           <TouchableOpacity style={styles.arrowBtn} activeOpacity={0.75} onPress={handleNextWeek}>
//             <Ionicons name="chevron-forward" size={18} color={C.text} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <View style={styles.sectionRow}>
//         <View>
//           <Text style={styles.sectionTxt}>Upcoming Sessions</Text>
//           <Text style={styles.sectionSub}>
//             {filterActive ? 'Confirmed sessions only' : 'All sessions for selected date'}
//           </Text>
//         </View>

//         <TouchableOpacity
//           style={[styles.filterBtn, filterActive && styles.filterBtnOn]}
//           onPress={() => setFilterActive(prev => !prev)}
//           activeOpacity={0.82}
//         >
//           <Ionicons
//             name="funnel-outline"
//             size={17}
//             color={filterActive ? C.white : C.primary}
//           />
//         </TouchableOpacity>
//       </View>
//     </>
//   );

//   const FooterComponent = () => (
//     <>
//       <View style={styles.pastSection}>
//         <Text style={styles.sectionTxt}>Past Sessions</Text>

//         <TouchableOpacity
//           style={styles.pastCard}
//           activeOpacity={0.86}
//           onPress={() => navigation?.navigate?.('TeacherPastSessions')}
//         >
//           <View style={styles.pastIcon}>
//             <Ionicons name="calendar-outline" size={20} color={C.primary} />
//           </View>

//           <View style={styles.pastTextBox}>
//             <Text style={styles.pastTitle}>View Completed Sessions</Text>
//             <Text style={styles.pastSub}>Review your old sessions and class notes</Text>
//           </View>

//           <Ionicons name="chevron-forward" size={19} color={C.muted} />
//         </TouchableOpacity>
//       </View>

//       <View style={{ height: 115 }} />
//     </>
//   );

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar backgroundColor={C.primaryDeep} barStyle="light-content" />

//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.headerIconBtn}
//           onPress={() => navigation?.goBack?.()}
//           activeOpacity={0.8}
//         >
//           <Ionicons name="chevron-back" size={22} color={C.primaryDeep} />
//         </TouchableOpacity>

//         <View style={styles.headerTextBox}>
//           <Text style={styles.headerTitle}>My Schedule</Text>
//           <Text style={styles.headerSub} numberOfLines={1}>
//             View and manage your sessions
//           </Text>
//         </View>

//         <TouchableOpacity
//           style={styles.bellBtn}
//           onPress={() => navigation?.navigate?.('TeacherNotification')}
//           activeOpacity={0.85}
//         >
//           <Ionicons name="notifications-outline" size={22} color={C.white} />

//           <View style={styles.notifBadge}>
//             <Text style={styles.notifCount}>3</Text>
//           </View>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={visibleSessions}
//         keyExtractor={item => item.id}
//         renderItem={({ item }) => <SessionCard item={item} />}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContent}
//         ListHeaderComponent={<HeaderComponent />}
//         ListEmptyComponent={<EmptyState />}
//         ListFooterComponent={<FooterComponent />}
//       />

//       <DetailsModal />

//       <TeacherBottomNavigation navigation={navigation} active="MySchedule" />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: C.bg,
//   },

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: C.primaryDark,
//     paddingHorizontal: IS_SMALL ? 13 : 16,
//     paddingTop: Platform.OS === 'android' ? 20 : 14,
//     paddingBottom: IS_SMALL ? 18 : 22,
//   },
//   headerIconBtn: {
//     width: IS_SMALL ? 40 : 44,
//     height: IS_SMALL ? 40 : 44,
//     borderRadius: IS_SMALL ? 20 : 22,
//     backgroundColor: C.white,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.12,
//     shadowRadius: 7,
//     shadowOffset: { width: 0, height: 3 },
//   },
//   headerTextBox: {
//     flex: 1,
//     marginLeft: 12,
//     marginRight: 8,
//   },
//   headerTitle: {
//     fontSize: IS_SMALL ? 20 : 23,
//     fontWeight: '900',
//     color: C.white,
//   },
//   headerSub: {
//     fontSize: IS_SMALL ? 11 : 13,
//     fontWeight: '600',
//     color: 'rgba(255,255,255,0.82)',
//     marginTop: 3,
//   },
//   bellBtn: {
//     width: IS_SMALL ? 42 : 46,
//     height: IS_SMALL ? 42 : 46,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.14)',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.16)',
//   },
//   notifBadge: {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: C.red,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1.3,
//     borderColor: C.primaryDark,
//   },
//   notifCount: {
//     fontSize: 8,
//     fontWeight: '900',
//     color: C.white,
//   },

//   listContent: {
//     paddingHorizontal: IS_SMALL ? 13 : 16,
//     paddingTop: 16,
//   },

//   statsCard: {
//     flexDirection: 'row',
//     backgroundColor: C.white,
//     borderRadius: 22,
//     paddingVertical: 15,
//     paddingHorizontal: 10,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: C.border,
//     elevation: 3,
//     shadowColor: C.shadow,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.06,
//     shadowRadius: 12,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   statNumber: {
//     fontSize: IS_SMALL ? 18 : 20,
//     fontWeight: '900',
//     color: C.primary,
//   },
//   statLabel: {
//     fontSize: IS_SMALL ? 11 : 12,
//     fontWeight: '700',
//     color: C.muted,
//     marginTop: 3,
//   },
//   statDivider: {
//     width: 1,
//     backgroundColor: C.border,
//   },

//   calCard: {
//     backgroundColor: C.white,
//     borderRadius: 22,
//     paddingHorizontal: IS_SMALL ? 12 : 14,
//     paddingTop: 14,
//     paddingBottom: 15,
//     marginBottom: 17,
//     borderWidth: 1,
//     borderColor: C.border,
//     elevation: 3,
//     shadowColor: C.shadow,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.06,
//     shadowRadius: 12,
//   },
//   calTopRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   monthLeft: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   calIconCircle: {
//     width: 36,
//     height: 36,
//     borderRadius: 16,
//     backgroundColor: C.primaryLight,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 9,
//   },
//   monthTxt: {
//     flex: 1,
//     fontSize: IS_SMALL ? 17 : 19,
//     fontWeight: '900',
//     color: C.text,
//   },
//   todayBtn: {
//     borderWidth: 1.2,
//     borderColor: C.primary,
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 18,
//     backgroundColor: C.white,
//   },
//   todayTxt: {
//     fontSize: 12,
//     fontWeight: '900',
//     color: C.primary,
//   },
//   weekRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 18,
//   },
//   arrowBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: C.bg,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   daysWrap: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingHorizontal: 4,
//   },
//   dateCol: {
//     alignItems: 'center',
//     minWidth: IS_TINY ? 27 : 30,
//   },
//   dayLbl: {
//     fontSize: IS_TINY ? 9 : 10,
//     fontWeight: '800',
//     color: C.muted,
//     marginBottom: 6,
//   },
//   dayLblSelected: {
//     color: C.primary,
//   },
//   dateBubble: {
//     width: IS_TINY ? 30 : IS_SMALL ? 33 : 36,
//     height: IS_TINY ? 30 : IS_SMALL ? 33 : 36,
//     borderRadius: IS_TINY ? 15 : IS_SMALL ? 16.5 : 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   todayBubble: {
//     backgroundColor: C.primaryLight,
//   },
//   dateBubbleSel: {
//     backgroundColor: C.primary,
//     elevation: 4,
//     shadowColor: C.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.26,
//     shadowRadius: 7,
//   },
//   dateNum: {
//     fontSize: IS_TINY ? 13 : IS_SMALL ? 14 : 15,
//     fontWeight: '900',
//     color: C.text,
//   },
//   todayDateNum: {
//     color: C.primary,
//   },
//   dateNumSelected: {
//     color: C.white,
//   },

//   sectionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 13,
//   },
//   sectionTxt: {
//     fontSize: IS_SMALL ? 18 : 20,
//     fontWeight: '900',
//     color: C.text,
//   },
//   sectionSub: {
//     fontSize: IS_SMALL ? 11 : 12,
//     fontWeight: '600',
//     color: C.muted,
//     marginTop: 3,
//   },
//   filterBtn: {
//     width: 42,
//     height: 42,
//     borderRadius: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: C.white,
//     borderWidth: 1,
//     borderColor: C.border,
//     elevation: 2,
//   },
//   filterBtnOn: {
//     backgroundColor: C.primary,
//     borderColor: C.primary,
//   },

//   sessionCard: {
//     backgroundColor: C.white,
//     borderRadius: 22,
//     padding: IS_SMALL ? 13 : 15,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: C.border,
//     elevation: 3,
//     shadowColor: C.shadow,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.06,
//     shadowRadius: 12,
//   },
//   cardTopRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatarWrap: {
//     position: 'relative',
//   },
//   avatar: {
//     width: IS_SMALL ? 44 : 48,
//     height: IS_SMALL ? 44 : 48,
//     borderRadius: IS_SMALL ? 22 : 24,
//     backgroundColor: C.border,
//   },
//   onlineDot: {
//     position: 'absolute',
//     bottom: 1,
//     right: 1,
//     width: 13,
//     height: 13,
//     borderRadius: 7,
//     backgroundColor: C.green,
//     borderWidth: 2,
//     borderColor: C.white,
//   },
//   studentInfo: {
//     flex: 1,
//     marginLeft: 11,
//   },
//   studentName: {
//     fontSize: IS_SMALL ? 15 : 16,
//     fontWeight: '900',
//     color: C.text,
//   },
//   studentSub: {
//     fontSize: IS_SMALL ? 11 : 12,
//     fontWeight: '700',
//     color: C.muted,
//     marginTop: 3,
//   },
//   statusBadge: {
//     backgroundColor: C.primaryLight,
//     paddingHorizontal: IS_SMALL ? 8 : 10,
//     paddingVertical: 5,
//     borderRadius: 16,
//     marginLeft: 6,
//   },
//   statusTxt: {
//     fontSize: IS_SMALL ? 9 : 10,
//     fontWeight: '900',
//     color: C.primary,
//   },
//   pendingBadge: {
//     backgroundColor: C.warningBg,
//   },
//   pendingTxt: {
//     color: C.warning,
//   },

//   timeBox: {
//     flexDirection: 'row',
//     backgroundColor: C.primarySoft,
//     borderRadius: 18,
//     paddingVertical: 12,
//     paddingHorizontal: IS_SMALL ? 8 : 10,
//     marginTop: 14,
//   },
//   timeItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   timeIcon: {
//     width: 30,
//     height: 30,
//     borderRadius: 12,
//     backgroundColor: C.white,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   timeLabel: {
//     fontSize: IS_SMALL ? 10 : 11,
//     fontWeight: '700',
//     color: C.muted,
//     textAlign: 'center',
//   },
//   timeValue: {
//     fontSize: IS_SMALL ? 11 : 12,
//     fontWeight: '900',
//     color: C.text,
//     marginTop: 2,
//     textAlign: 'center',
//   },
//   timeDivider: {
//     width: 1,
//     backgroundColor: C.border,
//     marginHorizontal: 4,
//   },

//   topicBox: {
//     marginTop: 13,
//     paddingTop: 13,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//   },
//   topicRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   topicLabel: {
//     fontSize: 12,
//     fontWeight: '900',
//     color: C.primary,
//     marginLeft: 6,
//   },
//   topicValue: {
//     fontSize: IS_SMALL ? 14 : 15,
//     fontWeight: '900',
//     color: C.text,
//     marginTop: 7,
//   },
//   focusText: {
//     fontSize: IS_SMALL ? 12 : 13,
//     fontWeight: '600',
//     color: C.muted,
//     lineHeight: IS_SMALL ? 17 : 19,
//     marginTop: 3,
//   },

//   btnRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 9,
//     marginTop: 14,
//   },
//   startBtn: {
//     flex: 1,
//     height: IS_SMALL ? 42 : 45,
//     borderRadius: 15,
//     backgroundColor: C.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 3,
//     shadowColor: C.primary,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.22,
//     shadowRadius: 8,
//   },
//   startBtnTxt: {
//     color: C.white,
//     fontWeight: '900',
//     fontSize: IS_SMALL ? 13 : 14,
//     marginLeft: 6,
//   },
//   detailsBtn: {
//     minWidth: IS_SMALL ? 92 : 102,
//     height: IS_SMALL ? 42 : 45,
//     borderRadius: 15,
//     borderWidth: 1.3,
//     borderColor: C.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: C.white,
//   },
//   detailsTxt: {
//     fontSize: IS_SMALL ? 13 : 14,
//     fontWeight: '900',
//     color: C.primary,
//     marginRight: 3,
//   },

//   emptyCard: {
//     backgroundColor: C.white,
//     borderRadius: 22,
//     padding: IS_SMALL ? 20 : 24,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: C.border,
//     marginBottom: 16,
//   },
//   emptyIconBox: {
//     width: 54,
//     height: 54,
//     borderRadius: 18,
//     backgroundColor: C.primaryLight,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   emptyTitle: {
//     fontSize: IS_SMALL ? 15 : 16,
//     fontWeight: '900',
//     color: C.text,
//   },
//   emptySub: {
//     fontSize: IS_SMALL ? 12 : 13,
//     fontWeight: '600',
//     color: C.muted,
//     textAlign: 'center',
//     marginTop: 6,
//     lineHeight: 18,
//   },

//   pastSection: {
//     marginTop: 6,
//   },
//   pastCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: C.white,
//     borderRadius: 22,
//     padding: 15,
//     borderWidth: 1,
//     borderColor: C.border,
//     marginTop: 12,
//     elevation: 3,
//     shadowColor: C.shadow,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.05,
//     shadowRadius: 10,
//   },
//   pastIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 16,
//     backgroundColor: C.primaryLight,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   pastTextBox: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   pastTitle: {
//     fontSize: IS_SMALL ? 13 : 14,
//     fontWeight: '900',
//     color: C.text,
//   },
//   pastSub: {
//     fontSize: IS_SMALL ? 11 : 12,
//     fontWeight: '600',
//     color: C.muted,
//     marginTop: 3,
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(7,18,58,0.45)',
//     justifyContent: 'flex-end',
//   },
//   modalCard: {
//     backgroundColor: C.white,
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     paddingHorizontal: IS_SMALL ? 15 : 18,
//     paddingTop: 12,
//     paddingBottom: Platform.OS === 'ios' ? 32 : 22,
//   },
//   modalHandle: {
//     width: 42,
//     height: 5,
//     borderRadius: 10,
//     backgroundColor: C.border,
//     alignSelf: 'center',
//     marginBottom: 14,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   modalTitle: {
//     flex: 1,
//     fontSize: IS_SMALL ? 18 : 20,
//     fontWeight: '900',
//     color: C.text,
//   },
//   modalCloseBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 13,
//     backgroundColor: C.bg,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalProfileRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: C.primarySoft,
//     borderRadius: 18,
//     padding: IS_SMALL ? 11 : 13,
//     marginBottom: 14,
//   },
//   modalAvatar: {
//     width: IS_SMALL ? 50 : 55,
//     height: IS_SMALL ? 50 : 55,
//     borderRadius: IS_SMALL ? 25 : 27.5,
//     marginRight: 10,
//   },
//   modalProfileText: {
//     flex: 1,
//   },
//   modalName: {
//     fontSize: IS_SMALL ? 15 : 16,
//     fontWeight: '900',
//     color: C.text,
//   },
//   modalSub: {
//     fontSize: IS_SMALL ? 11 : 12,
//     fontWeight: '700',
//     color: C.primary,
//     marginTop: 3,
//   },
//   modalInfoBox: {
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 18,
//     padding: IS_SMALL ? 12 : 14,
//     marginBottom: 16,
//   },
//   infoLine: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   infoIcon: {
//     width: 34,
//     height: 34,
//     borderRadius: 12,
//     backgroundColor: C.primaryLight,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   infoTextBox: {
//     flex: 1,
//   },
//   infoLabel: {
//     fontSize: IS_SMALL ? 11 : 12,
//     fontWeight: '700',
//     color: C.muted,
//   },
//   infoValue: {
//     fontSize: IS_SMALL ? 13 : 14,
//     fontWeight: '900',
//     color: C.text,
//     marginTop: 2,
//   },
//   modalStartBtn: {
//     height: IS_SMALL ? 48 : 51,
//     borderRadius: 16,
//     backgroundColor: C.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection: 'row',
//     elevation: 4,
//     shadowColor: C.primary,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.24,
//     shadowRadius: 8,
//   },
//   modalStartTxt: {
//     color: C.white,
//     fontSize: IS_SMALL ? 14 : 15,
//     fontWeight: '900',
//     marginLeft: 7,
//   },
// });






























































// screens/teacher/TeacherScheduleScreen.js
// FULLY UPDATED — Real AppContext sessions + accepted requests reflect here

import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Platform,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TeacherBottomNavigation from '../../components/TeacherBottomNavigation';
import { useAppContext } from "../../context/AppContext";

const { width } = Dimensions.get('window');

const IS_SMALL = width < 380;
const IS_TINY = width < 340;

const C = {
  primary: '#00796F',
  primaryDark: '#00534E',
  primaryDeep: '#003E3B',
  primaryLight: '#EAF8F6',
  primarySoft: '#F4FBFA',
  bg: '#F3F7FA',
  white: '#FFFFFF',
  text: '#07123A',
  muted: '#74819A',
  muted2: '#9AA6B8',
  border: '#E4ECF4',
  green: '#22C55E',
  red: '#FF3B30',
  warning: '#F59E0B',
  warningBg: '#FFF7E6',
  shadow: '#0F172A',
};

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Student&background=00796F&color=fff&size=200';

function pad2(value) {
  return String(value).padStart(2, '0');
}

function formatDateKey(date) {
  const safeDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(safeDate.getTime())) {
    const today = new Date();
    return `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
  }

  return `${safeDate.getFullYear()}-${pad2(safeDate.getMonth() + 1)}-${pad2(safeDate.getDate())}`;
}

function parseSessionDate(session = {}) {
  const rawDate =
    session.rawDate ||
    session.sessionDate ||
    session.dateValue ||
    session.date ||
    session.createdAt ||
    new Date();

  const date = new Date(rawDate);

  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  const today = new Date();
  return today;
}

function getTodayKey() {
  return formatDateKey(new Date());
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isSameDay(a, b) {
  return formatDateKey(a) === formatDateKey(b);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getStartOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function getWeekDays(date) {
  const start = getStartOfWeekMonday(date);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function safeText(value, fallback = '') {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
}

function getStatusLabel(status) {
  const safeStatus = safeText(status, 'scheduled').toLowerCase();

  if (safeStatus === 'confirmed') return 'Confirmed';
  if (safeStatus === 'ready') return 'Ready';
  if (safeStatus === 'live') return 'Live';
  if (safeStatus === 'completed') return 'Completed';
  if (safeStatus === 'cancelled') return 'Cancelled';
  if (safeStatus === 'pending') return 'Pending';

  return 'Scheduled';
}

function isSessionConfirmed(status) {
  const safeStatus = safeText(status, '').toLowerCase();
  return ['confirmed', 'ready', 'live', 'upcoming', 'scheduled'].includes(safeStatus);
}

function isSessionPending(status) {
  const safeStatus = safeText(status, '').toLowerCase();
  return safeStatus === 'pending';
}

function isSessionCompleted(status) {
  const safeStatus = safeText(status, '').toLowerCase();
  return safeStatus === 'completed';
}

function formatReadableDate(dateKey) {
  if (!dateKey) return 'Today';

  if (String(dateKey).includes('-')) {
    const parts = String(dateKey).split('-');

    if (parts.length === 3 && parts[0].length === 4) {
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
  }

  return String(dateKey);
}

function splitTimeRange(timeText = '') {
  const value = safeText(timeText, '');

  if (!value) {
    return {
      timeStart: 'Flexible',
      timeEnd: '',
    };
  }

  const parts = value.split('-');

  return {
    timeStart: safeText(parts[0], value).trim(),
    timeEnd: safeText(parts[1], '').trim(),
  };
}

function normalizeSession(session = {}) {
  const sessionDate = parseSessionDate(session);
  const dateKey = formatDateKey(sessionDate);
  const timeParts = splitTimeRange(session.time || session.requestedTime);

  const studentName = safeText(
    session.student ||
      session.studentName ||
      session.name ||
      session.learnerName,
    'Student'
  );

  const avatar =
    session.avatar ||
    session.studentAvatar ||
    session.studentPhoto ||
    session.image ||
    DEFAULT_AVATAR;

  const timeStart = safeText(session.timeStart || timeParts.timeStart, 'Flexible');
  const timeEnd = safeText(session.timeEnd || timeParts.timeEnd, '');

  const status = safeText(session.status, 'ready').toLowerCase();

  return {
    ...session,
    id: safeText(session.id || session.sessionId, `SESSION_${Date.now()}`),
    sessionId: safeText(session.sessionId || session.id, `SESSION_${Date.now()}`),
    date: dateKey,
    rawDate: session.rawDate || session.date || sessionDate,
    student: studentName,
    studentName,
    className: safeText(session.className || session.class, 'Class not added'),
    subject: safeText(session.subject, 'General'),
    topic: safeText(session.topic, 'Class Topic'),
    focus: safeText(session.focus || session.note || session.description, 'Session accepted from student request'),
    avatar,
    timeStart,
    timeEnd,
    time: session.time || (timeEnd ? `${timeStart} - ${timeEnd}` : timeStart),
    duration: safeText(session.duration, '1 Hour'),
    status,
    online: status !== 'completed' && status !== 'cancelled',
  };
}

export default function TeacherScheduleScreen({ navigation }) {
  const {
    currentUser,
    teacherSessions = [],
    sessions = [],
    pendingSessions = [],
    completedSessions = [],
    unreadNotificationsCount = 0,
    markSessionViewed,
    startSession,
    createTuitionSession,
  } = useAppContext();

  const initialDate = new Date();

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [calendarBaseDate, setCalendarBaseDate] = useState(initialDate);
  const [filterActive, setFilterActive] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionToCreate, setSessionToCreate] = useState(null);
  const [sessionDateText, setSessionDateText] = useState('');
  const [sessionTimeText, setSessionTimeText] = useState('');
  const [sessionDurationText, setSessionDurationText] = useState('1 Hour');
  const [sessionNoteText, setSessionNoteText] = useState('');
  const [showCompletedSessions, setShowCompletedSessions] = useState(false);
  const currentTeacherId = currentUser?.teacherId || currentUser?.id || '';

  const matchesCurrentTeacher = (item = {}) => {
    if (!currentTeacherId) {
      return true;
    }

    const candidateIds = [
      item.teacherId,
      item.tutorId,
      item.assignedTeacherId,
      item.acceptedBy,
      item.createdBy,
    ];

    return candidateIds.some(
      (value) => String(value || '').trim() === String(currentTeacherId).trim()
    );
  };

  const allSessions = useMemo(() => {
    const source =
      Array.isArray(teacherSessions) && teacherSessions.length > 0
        ? teacherSessions
        : Array.isArray(sessions)
        ? sessions
        : [];

    return source.map(normalizeSession).filter(matchesCurrentTeacher);
  }, [teacherSessions, sessions, currentTeacherId]);

  const pendingSessionList = useMemo(() => {
    const source = Array.isArray(pendingSessions) && pendingSessions.length > 0
      ? pendingSessions
      : allSessions.filter(item => item.needsScheduling);

    return source.map(normalizeSession).filter(matchesCurrentTeacher);
  }, [allSessions, pendingSessions, currentTeacherId]);

  const completedSessionList = useMemo(() => {
    const source =
      Array.isArray(completedSessions) && completedSessions.length > 0
        ? completedSessions
        : allSessions.filter(item => isSessionCompleted(item.status));

    return source
      .map(normalizeSession)
      .filter(matchesCurrentTeacher)
      .sort((a, b) => {
        return String(b.date || '').localeCompare(String(a.date || ''));
      });
  }, [allSessions, completedSessions, currentTeacherId]);

  const weekDays = useMemo(() => getWeekDays(calendarBaseDate), [calendarBaseDate]);
  const selectedDateKey = formatDateKey(selectedDate);
  const todayKey = getTodayKey();

  const visibleSessions = useMemo(() => {
    const sessionsForDate = allSessions.filter(item => item.date === selectedDateKey);
    const pendingForTeacher = pendingSessionList.filter(item => !item.date || item.needsScheduling);

    if (!filterActive) {
      return [...sessionsForDate.filter(item => !isSessionCompleted(item.status)), ...pendingForTeacher]
        .filter((item, index, arr) => arr.findIndex(next => next.id === item.id) === index);
    }

    return [...sessionsForDate.filter(item => isSessionConfirmed(item.status)), ...pendingForTeacher]
      .filter((item, index, arr) => arr.findIndex(next => next.id === item.id) === index);
  }, [allSessions, pendingSessionList, selectedDateKey, filterActive]);

  const listData = showCompletedSessions ? completedSessionList : visibleSessions;

  const todaySessionsCount = useMemo(
    () => allSessions.filter(item => item.date === todayKey).length + pendingSessionList.length,
    [allSessions, pendingSessionList.length, todayKey]
  );

  const confirmedCount = useMemo(
    () => allSessions.filter(item => isSessionConfirmed(item.status)).length,
    [allSessions]
  );

  const pendingCount = useMemo(
    () =>
      allSessions.filter(item => isSessionPending(item.status)).length + pendingSessionList.length,
    [allSessions, pendingSessionList.length]
  );

  const monthTitle = `${MONTHS[calendarBaseDate.getMonth()]} ${calendarBaseDate.getFullYear()}`;

  const handlePrevWeek = () => {
    const nextBase = addDays(calendarBaseDate, -7);
    setCalendarBaseDate(nextBase);
    setSelectedDate(nextBase);
  };

  const handleNextWeek = () => {
    const nextBase = addDays(calendarBaseDate, 7);
    setCalendarBaseDate(nextBase);
    setSelectedDate(nextBase);
  };

  const handleToday = () => {
    const today = new Date();
    setCalendarBaseDate(today);
    setSelectedDate(today);
  };

  const handleStartSession = item => {
    const session = normalizeSession(item);

    if (typeof startSession === 'function') {
      startSession(session.id);
    }

    if (typeof markSessionViewed === 'function') {
      markSessionViewed(session.id, 'teacher');
    }

    navigation?.navigate?.('SessionMeet', {
      sessionId: session.id,
      session,
      student: session.student,
      studentName: session.studentName,
      subject: session.subject,
      topic: session.topic,
      focus: session.focus,
      timeStart: session.timeStart,
      timeEnd: session.timeEnd,
      duration: session.duration,
      date: session.date,
      rawDate: session.rawDate,
      status: session.status,
      avatar: session.avatar,
      className: session.className,
    });
  };

  const handleViewDetails = item => {
    setSelectedSession(normalizeSession(item));
  };

  const handleOpenCompletedSessions = () => {
    setShowCompletedSessions(true);
    setFilterActive(false);
  };

  const handleBackToSchedule = () => {
    setShowCompletedSessions(false);
  };

  const openCreateSession = item => {
    const session = normalizeSession(item);
    setSessionToCreate(session);
    setSessionDateText('');
    setSessionTimeText('');
    setSessionDurationText(session.duration || '1 Hour');
    setSessionNoteText(session.focus || session.topic || '');
  };

  const closeCreateSession = () => {
    setSessionToCreate(null);
    setSessionDateText('');
    setSessionTimeText('');
    setSessionDurationText('1 Hour');
    setSessionNoteText('');
  };

  const submitCreateSession = async () => {
    if (!sessionToCreate) return;

    const requestId = sessionToCreate.requestId || sessionToCreate.id;

    if (typeof createTuitionSession !== 'function') {
      return;
    }

    await createTuitionSession(requestId, {
      date: sessionDateText.trim(),
      time: sessionTimeText.trim(),
      duration: sessionDurationText.trim() || '1 Hour',
      topic: sessionToCreate.topic,
      subject: sessionToCreate.subject,
      focus: sessionNoteText.trim() || sessionToCreate.focus,
      message: sessionNoteText.trim(),
      sessionType: sessionToCreate.sessionType,
      mode: sessionToCreate.mode,
      language: sessionToCreate.language,
      level: sessionToCreate.level,
    });

    closeCreateSession();
  };

  const closeDetails = () => {
    setSelectedSession(null);
  };

  const renderCalendarDay = date => {
    const isSelected = isSameDay(date, selectedDate);
    const isToday = isSameDay(date, new Date());
    const dayLabel = DAY_LABELS[date.getDay()];
    const dateNumber = date.getDate();
    const dateKey = formatDateKey(date);
    const hasSessions = allSessions.some(item => item.date === dateKey);

    return (
      <TouchableOpacity
        key={dateKey}
        style={styles.dateCol}
        activeOpacity={0.8}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[styles.dayLbl, isSelected && styles.dayLblSelected]}>
          {dayLabel}
        </Text>

        <View
          style={[
            styles.dateBubble,
            isToday && !isSelected && styles.todayBubble,
            isSelected && styles.dateBubbleSel,
          ]}
        >
          <Text
            style={[
              styles.dateNum,
              isToday && !isSelected && styles.todayDateNum,
              isSelected && styles.dateNumSelected,
            ]}
          >
            {dateNumber}
          </Text>
        </View>

        {hasSessions ? (
          <View
            style={[
              styles.sessionDot,
              isSelected && { backgroundColor: C.white },
            ]}
          />
        ) : (
          <View style={styles.sessionDotPlaceholder} />
        )}
      </TouchableOpacity>
    );
  };

  const InfoLine = ({ icon, label, value }) => (
    <View style={styles.infoLine}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={15} color={C.primary} />
      </View>

      <View style={styles.infoTextBox}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const SessionCard = ({ item }) => {
    const session = normalizeSession(item);
    const isConfirmed = isSessionConfirmed(session.status);
    const isDraft = Boolean(session.needsScheduling);
    const isCompleted = isSessionCompleted(session.status);

    return (
      <View style={styles.sessionCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: session.avatar }} style={styles.avatar} />
            {session.online && <View style={styles.onlineDot} />}
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.studentName} numberOfLines={1}>
              {session.student}
            </Text>

            <Text style={styles.studentSub} numberOfLines={1}>
              {session.className} • {session.subject}
            </Text>
          </View>

          <View
            style={[
            styles.statusBadge,
            !isConfirmed && styles.pendingBadge,
            isCompleted && styles.completedBadge,
            isDraft && styles.draftBadge,
          ]}
          >
            <Text
              style={[
                styles.statusTxt,
                isCompleted ? styles.completedTxt : !isConfirmed && styles.pendingTxt,
              ]}
            >
              {isDraft ? 'Needs Scheduling' : getStatusLabel(session.status)}
            </Text>
          </View>
        </View>

        <View style={styles.timeBox}>
          <View style={styles.timeItem}>
            <View style={styles.timeIcon}>
              <Ionicons name="time-outline" size={15} color={C.primary} />
            </View>
            <View>
              <Text style={styles.timeLabel}>Start</Text>
              <Text style={styles.timeValue}>
                {isDraft ? 'Select time' : session.timeStart}
              </Text>
            </View>
          </View>

          <View style={styles.timeDivider} />

          <View style={styles.timeItem}>
            <View style={styles.timeIcon}>
              <Ionicons name="time-outline" size={15} color={C.primary} />
            </View>
            <View>
              <Text style={styles.timeLabel}>End</Text>
              <Text style={styles.timeValue}>{isDraft ? 'Select time' : (session.timeEnd || '—')}</Text>
            </View>
          </View>

          <View style={styles.timeDivider} />

          <View style={styles.timeItem}>
            <View style={styles.timeIcon}>
              <Ionicons name="hourglass-outline" size={15} color={C.primary} />
            </View>
            <View>
              <Text style={styles.timeLabel}>Duration</Text>
              <Text style={styles.timeValue}>{session.duration}</Text>
            </View>
          </View>
        </View>

        <View style={styles.topicBox}>
          <View style={styles.topicRow}>
            <Ionicons name="book-outline" size={15} color={C.primary} />
            <Text style={styles.topicLabel}>Topic</Text>
          </View>

          <Text style={styles.topicValue} numberOfLines={1}>
            {session.topic}
          </Text>

          <Text style={styles.focusText} numberOfLines={2}>
            {session.focus}
          </Text>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.startBtn}
            activeOpacity={0.88}
            onPress={() => {
              if (isDraft) {
                openCreateSession(session);
                return;
              }
              if (isCompleted) {
                handleViewDetails(session);
                return;
              }
              handleStartSession(session);
            }}
          >
            <Ionicons
              name={isCompleted ? 'document-text-outline' : 'videocam'}
              size={15}
              color={C.white}
            />
            <Text style={styles.startBtnTxt}>
              {isDraft ? 'Create Session' : isCompleted ? 'View Summary' : 'Start Session'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsBtn}
            activeOpacity={0.82}
            onPress={() => handleViewDetails(session)}
          >
            <Text style={styles.detailsTxt}>Details</Text>
            <Ionicons name="chevron-forward" size={15} color={C.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconBox}>
        <Ionicons
          name={showCompletedSessions ? 'archive-outline' : 'calendar-clear-outline'}
          size={24}
          color={C.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {showCompletedSessions ? 'No completed sessions yet' : 'No sessions found'}
      </Text>

      <Text style={styles.emptySub}>
        {showCompletedSessions
          ? 'Completed classes will appear here after the live session is marked finished.'
          : 'Accepted requests will appear here as draft sessions. Tap Details and create the real session time to share it with the student.'}
      </Text>
    </View>
  );

  const DetailsModal = () => {
    if (!selectedSession) return null;

    const session = normalizeSession(selectedSession);
    const isConfirmed = isSessionConfirmed(session.status);

    return (
      <Modal
        visible={!!selectedSession}
        transparent
        animationType="slide"
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Session Details</Text>

              <TouchableOpacity style={styles.modalCloseBtn} onPress={closeDetails}>
                <Ionicons name="close" size={19} color={C.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalProfileRow}>
              <Image source={{ uri: session.avatar }} style={styles.modalAvatar} />

              <View style={styles.modalProfileText}>
                <Text style={styles.modalName} numberOfLines={1}>
                  {session.student}
                </Text>
                <Text style={styles.modalSub} numberOfLines={1}>
                  {session.className} • {session.subject}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  !isConfirmed && styles.pendingBadge,
                  isSessionCompleted(session.status) && styles.completedBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusTxt,
                    isSessionCompleted(session.status)
                      ? styles.completedTxt
                      : !isConfirmed && styles.pendingTxt,
                  ]}
                >
                  {getStatusLabel(session.status)}
                </Text>
              </View>
            </View>

            <View style={styles.modalInfoBox}>
              <InfoLine
                icon="calendar-outline"
                label="Date"
                value={formatReadableDate(session.date)}
              />
              <InfoLine
                icon="time-outline"
                label="Time"
                value={
                  session.timeEnd
                    ? `${session.timeStart} - ${session.timeEnd}`
                    : session.timeStart
                }
              />
              <InfoLine
                icon="hourglass-outline"
                label="Duration"
                value={session.duration}
              />
              <InfoLine icon="book-outline" label="Topic" value={session.topic} />
              <InfoLine
                icon="radio-button-on-outline"
                label="Focus"
                value={session.focus}
              />
            </View>

            {isConfirmed ? (
              <TouchableOpacity
                style={styles.modalChatBtn}
                activeOpacity={0.88}
                onPress={() => {
                  closeDetails();
                  navigation?.navigate?.('PreClassChat', {
                    session,
                    sessionId: session.sessionId || session.id,
                    teacherId: session.teacherId || currentTeacherId || null,
                    teacherName: currentUser?.name || session.teacherName || session.tutor || 'Teacher',
                    studentId: session.studentId || null,
                    studentName: session.student || 'Student',
                    subject: session.subject,
                    topic: session.topic,
                    avatar: session.avatar || null,
                  });
                }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={C.primary} />
                <Text style={styles.modalChatTxt}>Message Student</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.modalStartBtn}
              activeOpacity={0.88}
              onPress={() => {
                const tempSession = session;
                closeDetails();

                if (isConfirmed) {
                  handleStartSession(tempSession);
                }
              }}
            >
              <Ionicons
                name={isConfirmed ? 'videocam' : 'document-text-outline'}
                size={16}
                color={C.white}
              />
              <Text style={styles.modalStartTxt}>
                {isConfirmed ? 'Start Session' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const CreateSessionModal = () => {
    if (!sessionToCreate) return null;

    return (
      <Modal
        visible={!!sessionToCreate}
        transparent
        animationType="slide"
        onRequestClose={closeCreateSession}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Session</Text>

              <TouchableOpacity style={styles.modalCloseBtn} onPress={closeCreateSession}>
                <Ionicons name="close" size={19} color={C.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInfoBox}>
              <InfoLine icon="person-outline" label="Student" value={sessionToCreate.student} />
              <InfoLine icon="book-outline" label="Topic" value={sessionToCreate.topic} />
              <InfoLine icon="hourglass-outline" label="Duration" value={sessionToCreate.duration} />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                value={sessionDateText}
                onChangeText={setSessionDateText}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={C.muted2}
                style={styles.input}
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                value={sessionTimeText}
                onChangeText={setSessionTimeText}
                placeholder="06:00 PM"
                placeholderTextColor={C.muted2}
                style={styles.input}
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Duration</Text>
              <TextInput
                value={sessionDurationText}
                onChangeText={setSessionDurationText}
                placeholder="1 Hour"
                placeholderTextColor={C.muted2}
                style={styles.input}
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                value={sessionNoteText}
                onChangeText={setSessionNoteText}
                placeholder="Add a note for the student"
                placeholderTextColor={C.muted2}
                style={[styles.input, styles.inputMultiline]}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.modalStartBtn}
              activeOpacity={0.88}
              onPress={submitCreateSession}
            >
              <Ionicons name="calendar-outline" size={16} color={C.white} />
              <Text style={styles.modalStartTxt}>Save Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const HeaderComponent = () => (
    <>
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{todaySessionsCount}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{confirmedCount}</Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.calCard}>
        <View style={styles.calTopRow}>
          <View style={styles.monthLeft}>
            <View style={styles.calIconCircle}>
              <Ionicons name="calendar-outline" size={17} color={C.primary} />
            </View>

            <Text style={styles.monthTxt} numberOfLines={1}>
              {monthTitle}
            </Text>
          </View>

          <TouchableOpacity style={styles.todayBtn} activeOpacity={0.8} onPress={handleToday}>
            <Text style={styles.todayTxt}>Today</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          <TouchableOpacity style={styles.arrowBtn} activeOpacity={0.75} onPress={handlePrevWeek}>
            <Ionicons name="chevron-back" size={18} color={C.text} />
          </TouchableOpacity>

          <View style={styles.daysWrap}>{weekDays.map(renderCalendarDay)}</View>

          <TouchableOpacity style={styles.arrowBtn} activeOpacity={0.75} onPress={handleNextWeek}>
            <Ionicons name="chevron-forward" size={18} color={C.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionRow}>
        <View>
          <Text style={styles.sectionTxt}>
            {showCompletedSessions ? 'Completed Sessions' : 'Upcoming Sessions'}
          </Text>
          <Text style={styles.sectionSub}>
            {showCompletedSessions
              ? 'Review your old sessions and class notes'
              : filterActive
              ? 'Confirmed sessions only'
              : 'All sessions for selected date'}
          </Text>
        </View>

        {showCompletedSessions ? (
          <TouchableOpacity
            style={[styles.filterBtn, styles.filterBtnOn]}
            onPress={handleBackToSchedule}
            activeOpacity={0.82}
          >
            <Ionicons name="chevron-back" size={17} color={C.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.filterBtn, filterActive && styles.filterBtnOn]}
            onPress={() => setFilterActive(prev => !prev)}
            activeOpacity={0.82}
          >
            <Ionicons
              name="funnel-outline"
              size={17}
              color={filterActive ? C.white : C.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  const FooterComponent = () => (
    <>
      <View style={styles.pastSection}>
        <Text style={styles.sectionTxt}>Past Sessions</Text>

        <TouchableOpacity
          style={styles.pastCard}
          activeOpacity={0.86}
          onPress={showCompletedSessions ? handleBackToSchedule : handleOpenCompletedSessions}
        >
          <View style={styles.pastIcon}>
            <Ionicons
              name={showCompletedSessions ? 'return-up-back-outline' : 'calendar-outline'}
              size={20}
              color={C.primary}
            />
          </View>

          <View style={styles.pastTextBox}>
            <Text style={styles.pastTitle}>
              {showCompletedSessions ? 'Back to Schedule' : 'View Completed Sessions'}
            </Text>
            <Text style={styles.pastSub}>
              {showCompletedSessions
                ? 'Return to upcoming sessions and scheduling'
                : 'Review your old sessions and class notes'}
            </Text>
          </View>

          <Ionicons
            name={showCompletedSessions ? 'chevron-back' : 'chevron-forward'}
            size={19}
            color={C.muted}
          />
        </TouchableOpacity>
      </View>

      <View style={{ height: 115 }} />
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={C.primaryDeep} barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={C.primaryDeep} />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            View and manage your accepted sessions
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation?.navigate?.('TeacherNotification')}
          activeOpacity={0.85}
        >
          <Ionicons name="notifications-outline" size={22} color={C.white} />

          {unreadNotificationsCount > 0 ? (
            <View style={styles.notifBadge}>
              <Text style={styles.notifCount}>
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <FlatList
        data={listData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <SessionCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<HeaderComponent />}
        ListEmptyComponent={<EmptyState />}
        ListFooterComponent={<FooterComponent />}
      />

      <DetailsModal />
      <CreateSessionModal />

      <TeacherBottomNavigation navigation={navigation} active="MySchedule" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryDark,
    paddingHorizontal: IS_SMALL ? 13 : 16,
    paddingTop: Platform.OS === 'android' ? 20 : 14,
    paddingBottom: IS_SMALL ? 18 : 22,
  },
  headerIconBtn: {
    width: IS_SMALL ? 40 : 44,
    height: IS_SMALL ? 40 : 44,
    borderRadius: IS_SMALL ? 20 : 22,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },
  headerTextBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: IS_SMALL ? 20 : 23,
    fontWeight: '900',
    color: C.white,
  },
  headerSub: {
    fontSize: IS_SMALL ? 11 : 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
    marginTop: 3,
  },
  bellBtn: {
    width: IS_SMALL ? 42 : 46,
    height: IS_SMALL ? 42 : 46,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.3,
    borderColor: C.primaryDark,
    paddingHorizontal: 3,
  },
  notifCount: {
    fontSize: 8,
    fontWeight: '900',
    color: C.white,
  },

  listContent: {
    paddingHorizontal: IS_SMALL ? 13 : 16,
    paddingTop: 16,
  },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: 22,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 3,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: IS_SMALL ? 18 : 20,
    fontWeight: '900',
    color: C.primary,
  },
  statLabel: {
    fontSize: IS_SMALL ? 11 : 12,
    fontWeight: '700',
    color: C.muted,
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    backgroundColor: C.border,
  },

  calCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    paddingHorizontal: IS_SMALL ? 12 : 14,
    paddingTop: 14,
    paddingBottom: 15,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 3,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  calTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  calIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  monthTxt: {
    flex: 1,
    fontSize: IS_SMALL ? 17 : 19,
    fontWeight: '900',
    color: C.text,
  },
  todayBtn: {
    borderWidth: 1.2,
    borderColor: C.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: C.white,
  },
  todayTxt: {
    fontSize: 12,
    fontWeight: '900',
    color: C.primary,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  daysWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  dateCol: {
    alignItems: 'center',
    minWidth: IS_TINY ? 27 : 30,
  },
  dayLbl: {
    fontSize: IS_TINY ? 9 : 10,
    fontWeight: '800',
    color: C.muted,
    marginBottom: 6,
  },
  dayLblSelected: {
    color: C.primary,
  },
  dateBubble: {
    width: IS_TINY ? 30 : IS_SMALL ? 33 : 36,
    height: IS_TINY ? 30 : IS_SMALL ? 33 : 36,
    borderRadius: IS_TINY ? 15 : IS_SMALL ? 16.5 : 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBubble: {
    backgroundColor: C.primaryLight,
  },
  dateBubbleSel: {
    backgroundColor: C.primary,
    elevation: 4,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.26,
    shadowRadius: 7,
  },
  dateNum: {
    fontSize: IS_TINY ? 13 : IS_SMALL ? 14 : 15,
    fontWeight: '900',
    color: C.text,
  },
  todayDateNum: {
    color: C.primary,
  },
  dateNumSelected: {
    color: C.white,
  },
  sessionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.primary,
    marginTop: 4,
  },
  sessionDotPlaceholder: {
    width: 5,
    height: 5,
    marginTop: 4,
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  sectionTxt: {
    fontSize: IS_SMALL ? 18 : 20,
    fontWeight: '900',
    color: C.text,
  },
  sectionSub: {
    fontSize: IS_SMALL ? 11 : 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 3,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 2,
  },
  filterBtnOn: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },

  sessionCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: IS_SMALL ? 13 : 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 3,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: IS_SMALL ? 44 : 48,
    height: IS_SMALL ? 44 : 48,
    borderRadius: IS_SMALL ? 22 : 24,
    backgroundColor: C.border,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.white,
  },
  studentInfo: {
    flex: 1,
    marginLeft: 11,
  },
  studentName: {
    fontSize: IS_SMALL ? 15 : 16,
    fontWeight: '900',
    color: C.text,
  },
  studentSub: {
    fontSize: IS_SMALL ? 11 : 12,
    fontWeight: '700',
    color: C.muted,
    marginTop: 3,
  },
  statusBadge: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: IS_SMALL ? 8 : 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginLeft: 6,
  },
  statusTxt: {
    fontSize: IS_SMALL ? 9 : 10,
    fontWeight: '900',
    color: C.primary,
  },
  pendingBadge: {
    backgroundColor: C.warningBg,
  },
  pendingTxt: {
    color: C.warning,
  },
  draftBadge: {
    backgroundColor: '#E8F7F6',
  },
  completedBadge: {
    backgroundColor: '#EAF7EE',
  },
  completedTxt: {
    color: C.green,
  },

  timeBox: {
    flexDirection: 'row',
    backgroundColor: C.primarySoft,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: IS_SMALL ? 8 : 10,
    marginTop: 14,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeIcon: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeLabel: {
    fontSize: IS_SMALL ? 10 : 11,
    fontWeight: '700',
    color: C.muted,
    textAlign: 'center',
  },
  timeValue: {
    fontSize: IS_SMALL ? 11 : 12,
    fontWeight: '900',
    color: C.text,
    marginTop: 2,
    textAlign: 'center',
  },
  timeDivider: {
    width: 1,
    backgroundColor: C.border,
    marginHorizontal: 4,
  },

  topicBox: {
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: C.primary,
    marginLeft: 6,
  },
  topicValue: {
    fontSize: IS_SMALL ? 14 : 15,
    fontWeight: '900',
    color: C.text,
    marginTop: 7,
  },
  focusText: {
    fontSize: IS_SMALL ? 12 : 13,
    fontWeight: '600',
    color: C.muted,
    lineHeight: IS_SMALL ? 17 : 19,
    marginTop: 3,
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 14,
  },
  startBtn: {
    flex: 1,
    height: IS_SMALL ? 42 : 45,
    borderRadius: 15,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  startBtnTxt: {
    color: C.white,
    fontWeight: '900',
    fontSize: IS_SMALL ? 13 : 14,
    marginLeft: 6,
  },
  detailsBtn: {
    minWidth: IS_SMALL ? 92 : 102,
    height: IS_SMALL ? 42 : 45,
    borderRadius: 15,
    borderWidth: 1.3,
    borderColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
  },
  detailsTxt: {
    fontSize: IS_SMALL ? 13 : 14,
    fontWeight: '900',
    color: C.primary,
    marginRight: 3,
  },

  emptyCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: IS_SMALL ? 20 : 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  emptyIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: IS_SMALL ? 15 : 16,
    fontWeight: '900',
    color: C.text,
  },
  emptySub: {
    fontSize: IS_SMALL ? 12 : 13,
    fontWeight: '600',
    color: C.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  pastSection: {
    marginTop: 6,
  },
  pastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 15,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 12,
    elevation: 3,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  pastIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastTextBox: {
    flex: 1,
    marginLeft: 12,
  },
  pastTitle: {
    fontSize: IS_SMALL ? 13 : 14,
    fontWeight: '900',
    color: C.text,
  },
  pastSub: {
    fontSize: IS_SMALL ? 11 : 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7,18,58,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: IS_SMALL ? 15 : 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 22,
  },
  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: 10,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    flex: 1,
    fontSize: IS_SMALL ? 18 : 20,
    fontWeight: '900',
    color: C.text,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primarySoft,
    borderRadius: 18,
    padding: IS_SMALL ? 11 : 13,
    marginBottom: 14,
  },
  modalAvatar: {
    width: IS_SMALL ? 50 : 55,
    height: IS_SMALL ? 50 : 55,
    borderRadius: IS_SMALL ? 25 : 27.5,
    marginRight: 10,
    backgroundColor: C.border,
  },
  modalProfileText: {
    flex: 1,
  },
  modalName: {
    fontSize: IS_SMALL ? 15 : 16,
    fontWeight: '900',
    color: C.text,
  },
  modalSub: {
    fontSize: IS_SMALL ? 11 : 12,
    fontWeight: '700',
    color: C.primary,
    marginTop: 3,
  },
  modalInfoBox: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: IS_SMALL ? 12 : 14,
    marginBottom: 16,
  },
  inputBox: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: C.muted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    backgroundColor: C.bg,
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoTextBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: IS_SMALL ? 11 : 12,
    fontWeight: '700',
    color: C.muted,
  },
  infoValue: {
    fontSize: IS_SMALL ? 13 : 14,
    fontWeight: '900',
    color: C.text,
    marginTop: 2,
  },
  modalStartBtn: {
    height: IS_SMALL ? 48 : 51,
    borderRadius: 16,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
  },
  modalChatBtn: {
    marginTop: 12,
    height: IS_SMALL ? 46 : 49,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: '#C9F0EB',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  modalChatTxt: {
    color: C.primaryDark,
    fontSize: IS_SMALL ? 13 : 14,
    fontWeight: '900',
    marginLeft: 7,
  },
  modalStartTxt: {
    color: C.white,
    fontSize: IS_SMALL ? 14 : 15,
    fontWeight: '900',
    marginLeft: 7,
  },
});
