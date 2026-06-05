

// // screens/student/JoinSessionScreen.js
// import React, { useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   Image,
//   StatusBar,
//   ScrollView,
//   Platform,
// } from 'react-native';
// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// const C = {
//   primary: '#078C80',
//   primaryDark: '#056C63',
//   primaryLight: '#E7F8F6',
//   bg: '#F6F8FB',
//   card: '#FFFFFF',
//   text: '#07123A',
//   muted: '#64748B',
//   lightMuted: '#94A3B8',
//   border: '#E2E8F0',
//   softBorder: '#F1F5F9',
//   warning: '#F59E0B',
//   success: '#16A34A',
//   danger: '#EF4444',
//   white: '#FFFFFF',
// };

// const DEFAULT_SESSION = {
//   id: '1',
//   tutor: 'Dr. Sarah Johnson',
//   subject: 'Mathematics',
//   topic: 'Algebra – Linear Equations',
//   rating: 4.8,
//   reviews: 120,
//   date: '22 May 2024',
//   time: '5:00 PM – 6:00 PM',
//   duration: '1 Hour',
//   sessionType: 'Video Class',
//   mode: 'Live Class',
//   status: 'Ready to Join',
//   canEnter: true,
//   image: 'https://i.pravatar.cc/150?img=1',
//   meetingId: 'CLS-MATH-2205',
//   language: 'English',
//   level: 'Intermediate',
// };

// export default function JoinSessionScreen({ route, navigation }) {
//   const session = {
//     ...DEFAULT_SESSION,
//     ...(route?.params?.session || {}),
//   };

//   const [selectedMode, setSelectedMode] = useState('video');
//   const [cameraEnabled, setCameraEnabled] = useState(true);
//   const [micEnabled, setMicEnabled] = useState(true);

//   const sessionInfo = useMemo(
//     () => [
//       {
//         id: '1',
//         icon: 'calendar-outline',
//         label: 'Date',
//         value: session.date || 'Not available',
//       },
//       {
//         id: '2',
//         icon: 'time-outline',
//         label: 'Time',
//         value: session.time || 'Not available',
//       },
//       {
//         id: '3',
//         icon: 'hourglass-outline',
//         label: 'Duration',
//         value: session.duration || '1 Hour',
//       },
//       {
//         id: '4',
//         icon: 'language-outline',
//         label: 'Language',
//         value: session.language || 'English',
//       },
//     ],
//     [session]
//   );

//   const handleJoin = () => {
//     navigation.navigate('InSessionScreen', {
//       session,
//       mode: selectedMode,
//       cameraEnabled: selectedMode === 'video' ? cameraEnabled : false,
//       micEnabled,
//     });
//   };

//   const handleVideoMode = () => {
//     setSelectedMode('video');
//     setCameraEnabled(true);
//   };

//   const handleAudioMode = () => {
//     setSelectedMode('audio');
//     setCameraEnabled(false);
//   };

//   const isVideo = selectedMode === 'video';

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={C.white} />

//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.headerIconBtn}
//           activeOpacity={0.85}
//         >
//           <Ionicons name="arrow-back" size={21} color={C.text} />
//         </TouchableOpacity>

//         <View style={styles.headerTitleWrap}>
//           <Text style={styles.headerTitle}>Join Session</Text>
//           <Text style={styles.headerSub}>Choose how you want to enter</Text>
//         </View>

//         <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.85}>
//           <Ionicons name="ellipsis-vertical" size={21} color={C.text} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         <View style={styles.tutorCard}>
//           <View style={styles.tutorTop}>
//             <View style={styles.avatarWrap}>
//               <Image source={{ uri: session.image }} style={styles.tutorAvatar} />
//               <View style={styles.onlineDot} />
//             </View>

//             <View style={styles.tutorInfo}>
//               <Text style={styles.tutorSmall}>Your Tutor</Text>
//               <Text style={styles.tutorName} numberOfLines={1}>
//                 {session.tutor}
//               </Text>
//               <Text style={styles.tutorSubject} numberOfLines={1}>
//                 {session.subject}
//               </Text>

//               <View style={styles.ratingRow}>
//                 <Ionicons name="star" size={14} color={C.warning} />
//                 <Text style={styles.ratingText}>
//                   {session.rating} ({session.reviews} reviews)
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.statusBadge}>
//               <View style={styles.statusDot} />
//               <Text style={styles.statusText}>Ready</Text>
//             </View>
//           </View>

//           <View style={styles.topicBox}>
//             <View style={styles.topicIcon}>
//               <MaterialCommunityIcons
//                 name="book-open-page-variant-outline"
//                 size={21}
//                 color={C.primary}
//               />
//             </View>

//             <View style={styles.topicInfo}>
//               <Text style={styles.topicLabel}>Class Topic</Text>
//               <Text style={styles.topicTitle} numberOfLines={2}>
//                 {session.topic || 'Class Topic'}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.previewCard}>
//           <View style={styles.previewHeader}>
//             <View>
//               <Text style={styles.cardTitle}>Session Preview</Text>
//               <Text style={styles.cardSubtitle}>
//                 Check your audio and video before joining
//               </Text>
//             </View>

//             <View style={styles.previewHeaderIcon}>
//               <Ionicons name="videocam-outline" size={23} color={C.primary} />
//             </View>
//           </View>

//           <View style={styles.previewBox}>
//             <View style={styles.previewCircle}>
//               {isVideo && cameraEnabled ? (
//                 <Image source={{ uri: session.image }} style={styles.previewAvatar} />
//               ) : (
//                 <Ionicons
//                   name={isVideo ? 'videocam-off-outline' : 'headset-outline'}
//                   size={42}
//                   color={C.primary}
//                 />
//               )}
//             </View>

//             <Text style={styles.previewTitle}>
//               {isVideo
//                 ? cameraEnabled
//                   ? 'Video Preview Ready'
//                   : 'Camera Turned Off'
//                 : 'Audio Only Mode'}
//             </Text>

//             <Text style={styles.previewSub}>
//               {isVideo
//                 ? 'You can join the class with video enabled.'
//                 : 'You will join without camera video.'}
//             </Text>

//             <View style={styles.controlRow}>
//               <TouchableOpacity
//                 style={[
//                   styles.controlBtn,
//                   !micEnabled && styles.controlBtnOff,
//                 ]}
//                 activeOpacity={0.85}
//                 onPress={() => setMicEnabled((prev) => !prev)}
//               >
//                 <Ionicons
//                   name={micEnabled ? 'mic' : 'mic-off'}
//                   size={20}
//                   color={micEnabled ? C.white : C.danger}
//                 />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.controlBtn,
//                   (!cameraEnabled || !isVideo) && styles.controlBtnOff,
//                 ]}
//                 activeOpacity={0.85}
//                 onPress={() => {
//                   if (isVideo) {
//                     setCameraEnabled((prev) => !prev);
//                   }
//                 }}
//               >
//                 <Ionicons
//                   name={cameraEnabled && isVideo ? 'videocam' : 'videocam-off'}
//                   size={20}
//                   color={cameraEnabled && isVideo ? C.white : C.danger}
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         <View style={styles.joinModeCard}>
//           <View style={styles.cardHeadingRow}>
//             <View>
//               <Text style={styles.cardTitle}>Join Options</Text>
//               <Text style={styles.cardSubtitle}>
//                 Select your preferred class mode
//               </Text>
//             </View>

//             <View style={styles.cardIcon}>
//               <Ionicons name="options-outline" size={23} color={C.primary} />
//             </View>
//           </View>

//           <TouchableOpacity
//             style={[
//               styles.modeOption,
//               selectedMode === 'video' && styles.modeOptionActive,
//             ]}
//             activeOpacity={0.88}
//             onPress={handleVideoMode}
//           >
//             <View
//               style={[
//                 styles.modeIcon,
//                 selectedMode === 'video' && styles.modeIconActive,
//               ]}
//             >
//               <Ionicons
//                 name="videocam"
//                 size={21}
//                 color={selectedMode === 'video' ? C.white : C.primary}
//               />
//             </View>

//             <View style={styles.modeTextWrap}>
//               <Text
//                 style={[
//                   styles.modeTitle,
//                   selectedMode === 'video' && styles.modeTitleActive,
//                 ]}
//               >
//                 Join with Video
//               </Text>
//               <Text style={styles.modeSub}>
//                 Camera and microphone enabled
//               </Text>
//             </View>

//             <Ionicons
//               name={
//                 selectedMode === 'video'
//                   ? 'radio-button-on'
//                   : 'radio-button-off'
//               }
//               size={22}
//               color={selectedMode === 'video' ? C.primary : C.lightMuted}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.modeOption,
//               selectedMode === 'audio' && styles.modeOptionActive,
//             ]}
//             activeOpacity={0.88}
//             onPress={handleAudioMode}
//           >
//             <View
//               style={[
//                 styles.modeIcon,
//                 selectedMode === 'audio' && styles.modeIconActive,
//               ]}
//             >
//               <Ionicons
//                 name="headset-outline"
//                 size={21}
//                 color={selectedMode === 'audio' ? C.white : C.primary}
//               />
//             </View>

//             <View style={styles.modeTextWrap}>
//               <Text
//                 style={[
//                   styles.modeTitle,
//                   selectedMode === 'audio' && styles.modeTitleActive,
//                 ]}
//               >
//                 Join with Audio Only
//               </Text>
//               <Text style={styles.modeSub}>
//                 Camera disabled, microphone enabled
//               </Text>
//             </View>

//             <Ionicons
//               name={
//                 selectedMode === 'audio'
//                   ? 'radio-button-on'
//                   : 'radio-button-off'
//               }
//               size={22}
//               color={selectedMode === 'audio' ? C.primary : C.lightMuted}
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.infoCard}>
//           <View style={styles.cardHeadingRow}>
//             <View>
//               <Text style={styles.cardTitle}>Class Details</Text>
//               <Text style={styles.cardSubtitle}>
//                 Important session information
//               </Text>
//             </View>

//             <View style={styles.cardIcon}>
//               <Ionicons name="information-circle-outline" size={23} color={C.primary} />
//             </View>
//           </View>

//           {sessionInfo.map((item, index) => (
//             <View
//               key={item.id}
//               style={[
//                 styles.infoRow,
//                 index < sessionInfo.length - 1 && styles.infoRowBorder,
//               ]}
//             >
//               <View style={styles.infoLeft}>
//                 <View style={styles.infoIcon}>
//                   <Ionicons name={item.icon} size={17} color={C.primary} />
//                 </View>

//                 <Text style={styles.infoLabel}>{item.label}</Text>
//               </View>

//               <Text style={styles.infoValue} numberOfLines={1}>
//                 {item.value}
//               </Text>
//             </View>
//           ))}
//         </View>

//         <View style={styles.noteCard}>
//           <View style={styles.noteIcon}>
//             <Ionicons name="shield-checkmark-outline" size={23} color={C.white} />
//           </View>

//           <View style={styles.noteTextWrap}>
//             <Text style={styles.noteTitle}>Secure Learning Room</Text>
//             <Text style={styles.noteSub}>
//               Meeting ID: {session.meetingId || 'CLS-SESSION'}
//             </Text>
//           </View>
//         </View>
//       </ScrollView>

//       <View style={styles.bottomBar}>
//         <TouchableOpacity
//           style={styles.cancelBtn}
//           activeOpacity={0.85}
//           onPress={() => navigation.goBack()}
//         >
//           <Text style={styles.cancelBtnText}>Cancel</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.joinBtn}
//           activeOpacity={0.9}
//           onPress={handleJoin}
//         >
//           <Ionicons
//             name={selectedMode === 'video' ? 'videocam' : 'headset-outline'}
//             size={20}
//             color={C.white}
//           />
//           <Text style={styles.joinBtnText}>
//             {selectedMode === 'video' ? 'Join Video' : 'Join Audio'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const shadow = Platform.select({
//   ios: {
//     shadowColor: '#0F172A',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.08,
//     shadowRadius: 18,
//   },
//   android: {
//     elevation: 3,
//   },
// });

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: C.bg,
//   },

//   header: {
//     backgroundColor: C.white,
//     paddingHorizontal: 16,
//     paddingTop: Platform.OS === 'android' ? 12 : 8,
//     paddingBottom: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: C.softBorder,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   headerIconBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 14,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: C.softBorder,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   headerTitleWrap: {
//     flex: 1,
//     alignItems: 'center',
//     paddingHorizontal: 10,
//   },

//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '900',
//     color: C.text,
//     letterSpacing: -0.2,
//   },

//   headerSub: {
//     marginTop: 2,
//     fontSize: 11,
//     color: C.muted,
//     fontWeight: '600',
//   },

//   scrollContent: {
//     padding: 16,
//     paddingBottom: 124,
//   },

//   tutorCard: {
//     backgroundColor: C.primary,
//     borderRadius: 26,
//     padding: 16,
//     overflow: 'hidden',
//     ...shadow,
//   },

//   tutorTop: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },

//   avatarWrap: {
//     width: 70,
//     height: 70,
//     marginRight: 12,
//   },

//   tutorAvatar: {
//     width: 70,
//     height: 70,
//     borderRadius: 24,
//     borderWidth: 3,
//     borderColor: 'rgba(255,255,255,0.42)',
//     backgroundColor: '#DDE7EF',
//   },

//   onlineDot: {
//     position: 'absolute',
//     bottom: 2,
//     right: 2,
//     width: 16,
//     height: 16,
//     borderRadius: 9,
//     backgroundColor: C.success,
//     borderWidth: 2,
//     borderColor: C.white,
//   },

//   tutorInfo: {
//     flex: 1,
//     paddingRight: 8,
//   },

//   tutorSmall: {
//     fontSize: 11,
//     color: '#CFF7F2',
//     fontWeight: '900',
//     textTransform: 'uppercase',
//     letterSpacing: 0.8,
//     marginBottom: 3,
//   },

//   tutorName: {
//     fontSize: 19,
//     fontWeight: '900',
//     color: C.white,
//     letterSpacing: -0.3,
//   },

//   tutorSubject: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#E8FFFC',
//     fontWeight: '700',
//   },

//   ratingRow: {
//     marginTop: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   ratingText: {
//     marginLeft: 5,
//     color: C.white,
//     fontSize: 12,
//     fontWeight: '800',
//   },

//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(220,252,231,0.96)',
//     borderRadius: 999,
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//   },

//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 4,
//     backgroundColor: C.success,
//     marginRight: 5,
//   },

//   statusText: {
//     fontSize: 10,
//     fontWeight: '900',
//     color: C.success,
//   },

//   topicBox: {
//     marginTop: 18,
//     backgroundColor: 'rgba(255,255,255,0.14)',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.18)',
//     borderRadius: 20,
//     padding: 13,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   topicIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 15,
//     backgroundColor: C.white,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 11,
//   },

//   topicInfo: {
//     flex: 1,
//   },

//   topicLabel: {
//     fontSize: 11,
//     color: '#CFF7F2',
//     fontWeight: '900',
//     textTransform: 'uppercase',
//     letterSpacing: 0.7,
//   },

//   topicTitle: {
//     marginTop: 3,
//     color: C.white,
//     fontSize: 15,
//     lineHeight: 20,
//     fontWeight: '900',
//   },

//   previewCard: {
//     marginTop: 16,
//     backgroundColor: C.white,
//     borderRadius: 24,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: C.softBorder,
//     ...shadow,
//   },

//   previewHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 15,
//   },

//   cardTitle: {
//     fontSize: 17,
//     fontWeight: '900',
//     color: C.text,
//     letterSpacing: -0.2,
//   },

//   cardSubtitle: {
//     marginTop: 3,
//     fontSize: 12,
//     color: C.muted,
//     fontWeight: '600',
//   },

//   previewHeaderIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 15,
//     backgroundColor: C.primaryLight,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   previewBox: {
//     borderRadius: 22,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: C.softBorder,
//     paddingVertical: 26,
//     paddingHorizontal: 18,
//     alignItems: 'center',
//   },

//   previewCircle: {
//     width: 104,
//     height: 104,
//     borderRadius: 36,
//     backgroundColor: C.primaryLight,
//     borderWidth: 1,
//     borderColor: '#C8F1EC',
//     alignItems: 'center',
//     justifyContent: 'center',
//     overflow: 'hidden',
//   },

//   previewAvatar: {
//     width: '100%',
//     height: '100%',
//   },

//   previewTitle: {
//     marginTop: 16,
//     fontSize: 18,
//     fontWeight: '900',
//     color: C.text,
//     textAlign: 'center',
//   },

//   previewSub: {
//     marginTop: 6,
//     fontSize: 13,
//     fontWeight: '600',
//     color: C.muted,
//     textAlign: 'center',
//     lineHeight: 19,
//   },

//   controlRow: {
//     flexDirection: 'row',
//     marginTop: 18,
//     gap: 12,
//   },

//   controlBtn: {
//     width: 48,
//     height: 48,
//     borderRadius: 18,
//     backgroundColor: C.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   controlBtnOff: {
//     backgroundColor: '#FEE2E2',
//     borderWidth: 1,
//     borderColor: '#FECACA',
//   },

//   joinModeCard: {
//     marginTop: 16,
//     backgroundColor: C.white,
//     borderRadius: 24,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: C.softBorder,
//     ...shadow,
//   },

//   cardHeadingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 15,
//   },

//   cardIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 15,
//     backgroundColor: C.primaryLight,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   modeOption: {
//     minHeight: 76,
//     borderRadius: 19,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: C.softBorder,
//     padding: 13,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },

//   modeOptionActive: {
//     backgroundColor: C.primaryLight,
//     borderColor: '#BEEBE6',
//   },

//   modeIcon: {
//     width: 45,
//     height: 45,
//     borderRadius: 16,
//     backgroundColor: C.white,
//     borderWidth: 1,
//     borderColor: '#C8F1EC',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },

//   modeIconActive: {
//     backgroundColor: C.primary,
//     borderColor: C.primary,
//   },

//   modeTextWrap: {
//     flex: 1,
//     paddingRight: 8,
//   },

//   modeTitle: {
//     fontSize: 14,
//     fontWeight: '900',
//     color: C.text,
//   },

//   modeTitleActive: {
//     color: C.primaryDark,
//   },

//   modeSub: {
//     marginTop: 4,
//     fontSize: 12,
//     fontWeight: '600',
//     color: C.muted,
//     lineHeight: 17,
//   },

//   infoCard: {
//     marginTop: 16,
//     backgroundColor: C.white,
//     borderRadius: 24,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: C.softBorder,
//     ...shadow,
//   },

//   infoRow: {
//     minHeight: 54,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },

//   infoRowBorder: {
//     borderBottomWidth: 1,
//     borderBottomColor: C.softBorder,
//   },

//   infoLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },

//   infoIcon: {
//     width: 34,
//     height: 34,
//     borderRadius: 13,
//     backgroundColor: C.primaryLight,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 10,
//   },

//   infoLabel: {
//     fontSize: 13,
//     color: C.muted,
//     fontWeight: '800',
//   },

//   infoValue: {
//     flex: 1,
//     textAlign: 'right',
//     fontSize: 13,
//     color: C.text,
//     fontWeight: '900',
//   },

//   noteCard: {
//     marginTop: 16,
//     backgroundColor: C.primaryDark,
//     borderRadius: 22,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   noteIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 17,
//     backgroundColor: 'rgba(255,255,255,0.18)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },

//   noteTextWrap: {
//     flex: 1,
//   },

//   noteTitle: {
//     fontSize: 15,
//     color: C.white,
//     fontWeight: '900',
//   },

//   noteSub: {
//     marginTop: 4,
//     fontSize: 12,
//     color: '#D7FFFB',
//     fontWeight: '700',
//   },

//   bottomBar: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: C.white,
//     paddingHorizontal: 16,
//     paddingTop: 12,
//     paddingBottom: Platform.OS === 'ios' ? 28 : 16,
//     borderTopWidth: 1,
//     borderTopColor: C.softBorder,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   cancelBtn: {
//     width: 105,
//     height: 52,
//     borderRadius: 18,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: C.border,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },

//   cancelBtnText: {
//     color: C.muted,
//     fontSize: 14,
//     fontWeight: '900',
//   },

//   joinBtn: {
//     flex: 1,
//     height: 52,
//     borderRadius: 18,
//     backgroundColor: C.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     shadowColor: C.primary,
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     elevation: 4,
//   },

//   joinBtnText: {
//     marginLeft: 8,
//     color: C.white,
//     fontSize: 15,
//     fontWeight: '900',
//   },
// });











































// screens/student/JoinSessionScreen.js
// FULLY UPDATED — Real AppContext session + passes real data to InSessionScreen

import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from "../../context/AppContext";

const C = {
  primary: '#078C80',
  primaryDark: '#056C63',
  primaryLight: '#E7F8F6',
  bg: '#F6F8FB',
  card: '#FFFFFF',
  text: '#07123A',
  muted: '#64748B',
  lightMuted: '#94A3B8',
  border: '#E2E8F0',
  softBorder: '#F1F5F9',
  warning: '#F59E0B',
  success: '#16A34A',
  danger: '#EF4444',
  white: '#FFFFFF',
};

const DEFAULT_TUTOR_IMAGE =
  'https://ui-avatars.com/api/?name=Tutor&background=078C80&color=fff&size=200';

const safeText = (value, fallback = '') => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
};

const splitTimeRange = (timeText = '') => {
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
};

const formatDateLabel = value => {
  if (!value) return 'Today';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeSession = session => {
  const raw = session || {};
  const timeParts = splitTimeRange(raw.time || raw.requestedTime);

  const id = safeText(raw.id || raw.sessionId, 'SESSION_DEMO');

  const tutor = safeText(
    raw.tutor ||
      raw.tutorName ||
      raw.teacherName ||
      raw.teacher ||
      raw.name,
    'Tutor'
  );

  const subject = safeText(raw.subject, 'General');
  const topic = safeText(raw.topic, 'Class Topic');

  const timeStart = safeText(raw.timeStart || timeParts.timeStart, 'Flexible');
  const timeEnd = safeText(raw.timeEnd || timeParts.timeEnd, '');

  const time = raw.time || (timeEnd ? `${timeStart} - ${timeEnd}` : timeStart);

  const statusValue = safeText(raw.status, 'ready').toLowerCase();

  return {
    ...raw,
    id,
    sessionId: safeText(raw.sessionId || raw.id, id),
    tutor,
    tutorName: tutor,
    teacherName: tutor,
    subject,
    topic,
    rating: Number(raw.rating || 4.8),
    reviews: Number(raw.reviews || 0),
    date: safeText(
      raw.date,
      formatDateLabel(raw.rawDate || raw.sessionDate || raw.createdAt)
    ),
    rawDate: raw.rawDate || raw.date || raw.sessionDate || raw.createdAt,
    time,
    timeStart,
    timeEnd,
    duration: safeText(raw.duration, '1 Hour'),
    sessionType: safeText(raw.sessionType || raw.mode, 'Video Class'),
    mode: safeText(raw.mode, 'Live Class'),
    status: statusValue,
    canEnter:
      raw.canEnter === true ||
      statusValue === 'ready' ||
      statusValue === 'live' ||
      statusValue === 'upcoming' ||
      statusValue === 'scheduled',
    image:
      raw.image ||
      raw.tutorImage ||
      raw.teacherAvatar ||
      raw.avatar ||
      DEFAULT_TUTOR_IMAGE,
    meetingId: safeText(raw.meetingId, `CLS-${id.slice(-6).toUpperCase()}`),
    language: safeText(raw.language, 'English'),
    level: safeText(raw.level, 'Intermediate'),
    focus: safeText(raw.focus || raw.note || raw.description, ''),
  };
};

export default function JoinSessionScreen({ route, navigation }) {
  const {
    getSessionById,
    markSessionViewed,
    startSession,
    studentSessions = [],
  } = useAppContext();

  const routeSession = route?.params?.session || {};
  const routeSessionId =
    route?.params?.sessionId ||
    routeSession?.id ||
    routeSession?.sessionId;

  const contextSession = useMemo(() => {
    if (typeof getSessionById === 'function' && routeSessionId) {
      return getSessionById(routeSessionId);
    }

    if (routeSessionId && Array.isArray(studentSessions)) {
      return studentSessions.find(
        item => item.id === routeSessionId || item.sessionId === routeSessionId
      );
    }

    return null;
  }, [getSessionById, routeSessionId, studentSessions]);

  const session = useMemo(
    () =>
      normalizeSession({
        ...(contextSession || {}),
        ...routeSession,
      }),
    [contextSession, routeSession]
  );

  const [selectedMode, setSelectedMode] = useState('video');
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  useEffect(() => {
    if (typeof markSessionViewed === 'function') {
      markSessionViewed(session.id, 'student');
    }
  }, [markSessionViewed, session.id]);

  const sessionInfo = useMemo(
    () => [
      {
        id: '1',
        icon: 'calendar-outline',
        label: 'Date',
        value: session.date || 'Not available',
      },
      {
        id: '2',
        icon: 'time-outline',
        label: 'Time',
        value: session.time || 'Not available',
      },
      {
        id: '3',
        icon: 'hourglass-outline',
        label: 'Duration',
        value: session.duration || '1 Hour',
      },
      {
        id: '4',
        icon: 'language-outline',
        label: 'Language',
        value: session.language || 'English',
      },
    ],
    [session]
  );

  const handleJoin = () => {
    if (typeof startSession === 'function') {
      startSession(session.id);
    }

    if (typeof markSessionViewed === 'function') {
      markSessionViewed(session.id, 'student');
    }

    navigation?.navigate?.('InSessionScreen', {
      sessionId: session.id,
      session,
      mode: selectedMode,
      cameraEnabled: selectedMode === 'video' ? cameraEnabled : false,
      micEnabled,
      tutor: session.tutor,
      subject: session.subject,
      topic: session.topic,
      timeStart: session.timeStart,
      timeEnd: session.timeEnd,
      duration: session.duration,
      meetingId: session.meetingId,
    });
  };

  const handleVideoMode = () => {
    setSelectedMode('video');
    setCameraEnabled(true);
  };

  const handleAudioMode = () => {
    setSelectedMode('audio');
    setCameraEnabled(false);
  };

  const isVideo = selectedMode === 'video';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={styles.headerIconBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={21} color={C.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Join Session</Text>
          <Text style={styles.headerSub}>Choose how you want to enter</Text>
        </View>

        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.85}>
          <Ionicons name="ellipsis-vertical" size={21} color={C.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.tutorCard}>
          <View style={styles.tutorTop}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: session.image }} style={styles.tutorAvatar} />
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.tutorInfo}>
              <Text style={styles.tutorSmall}>Your Tutor</Text>
              <Text style={styles.tutorName} numberOfLines={1}>
                {session.tutor}
              </Text>
              <Text style={styles.tutorSubject} numberOfLines={1}>
                {session.subject}
              </Text>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={C.warning} />
                <Text style={styles.ratingText}>
                  {session.rating} ({session.reviews} reviews)
                </Text>
              </View>
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Ready</Text>
            </View>
          </View>

          <View style={styles.topicBox}>
            <View style={styles.topicIcon}>
              <MaterialCommunityIcons
                name="book-open-page-variant-outline"
                size={21}
                color={C.primary}
              />
            </View>

            <View style={styles.topicInfo}>
              <Text style={styles.topicLabel}>Class Topic</Text>
              <Text style={styles.topicTitle} numberOfLines={2}>
                {session.topic || 'Class Topic'}
              </Text>
            </View>
          </View>

          {session.focus ? (
            <View style={styles.focusBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={C.white} />
              <Text style={styles.focusText} numberOfLines={2}>
                {session.focus}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.cardTitle}>Session Preview</Text>
              <Text style={styles.cardSubtitle}>
                Check your audio and video before joining
              </Text>
            </View>

            <View style={styles.previewHeaderIcon}>
              <Ionicons name="videocam-outline" size={23} color={C.primary} />
            </View>
          </View>

          <View style={styles.previewBox}>
            <View style={styles.previewCircle}>
              {isVideo && cameraEnabled ? (
                <Image source={{ uri: session.image }} style={styles.previewAvatar} />
              ) : (
                <Ionicons
                  name={isVideo ? 'videocam-off-outline' : 'headset-outline'}
                  size={42}
                  color={C.primary}
                />
              )}
            </View>

            <Text style={styles.previewTitle}>
              {isVideo
                ? cameraEnabled
                  ? 'Video Preview Ready'
                  : 'Camera Turned Off'
                : 'Audio Only Mode'}
            </Text>

            <Text style={styles.previewSub}>
              {isVideo
                ? 'You can join the class with video enabled.'
                : 'You will join without camera video.'}
            </Text>

            <View style={styles.controlRow}>
              <TouchableOpacity
                style={[
                  styles.controlBtn,
                  !micEnabled && styles.controlBtnOff,
                ]}
                activeOpacity={0.85}
                onPress={() => setMicEnabled(prev => !prev)}
              >
                <Ionicons
                  name={micEnabled ? 'mic' : 'mic-off'}
                  size={20}
                  color={micEnabled ? C.white : C.danger}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.controlBtn,
                  (!cameraEnabled || !isVideo) && styles.controlBtnOff,
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  if (isVideo) {
                    setCameraEnabled(prev => !prev);
                  }
                }}
              >
                <Ionicons
                  name={cameraEnabled && isVideo ? 'videocam' : 'videocam-off'}
                  size={20}
                  color={cameraEnabled && isVideo ? C.white : C.danger}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.joinModeCard}>
          <View style={styles.cardHeadingRow}>
            <View>
              <Text style={styles.cardTitle}>Join Options</Text>
              <Text style={styles.cardSubtitle}>
                Select your preferred class mode
              </Text>
            </View>

            <View style={styles.cardIcon}>
              <Ionicons name="options-outline" size={23} color={C.primary} />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.modeOption,
              selectedMode === 'video' && styles.modeOptionActive,
            ]}
            activeOpacity={0.88}
            onPress={handleVideoMode}
          >
            <View
              style={[
                styles.modeIcon,
                selectedMode === 'video' && styles.modeIconActive,
              ]}
            >
              <Ionicons
                name="videocam"
                size={21}
                color={selectedMode === 'video' ? C.white : C.primary}
              />
            </View>

            <View style={styles.modeTextWrap}>
              <Text
                style={[
                  styles.modeTitle,
                  selectedMode === 'video' && styles.modeTitleActive,
                ]}
              >
                Join with Video
              </Text>
              <Text style={styles.modeSub}>
                Camera and microphone enabled
              </Text>
            </View>

            <Ionicons
              name={
                selectedMode === 'video'
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={22}
              color={selectedMode === 'video' ? C.primary : C.lightMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeOption,
              selectedMode === 'audio' && styles.modeOptionActive,
            ]}
            activeOpacity={0.88}
            onPress={handleAudioMode}
          >
            <View
              style={[
                styles.modeIcon,
                selectedMode === 'audio' && styles.modeIconActive,
              ]}
            >
              <Ionicons
                name="headset-outline"
                size={21}
                color={selectedMode === 'audio' ? C.white : C.primary}
              />
            </View>

            <View style={styles.modeTextWrap}>
              <Text
                style={[
                  styles.modeTitle,
                  selectedMode === 'audio' && styles.modeTitleActive,
                ]}
              >
                Join with Audio Only
              </Text>
              <Text style={styles.modeSub}>
                Camera disabled, microphone enabled
              </Text>
            </View>

            <Ionicons
              name={
                selectedMode === 'audio'
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={22}
              color={selectedMode === 'audio' ? C.primary : C.lightMuted}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeadingRow}>
            <View>
              <Text style={styles.cardTitle}>Class Details</Text>
              <Text style={styles.cardSubtitle}>
                Important session information
              </Text>
            </View>

            <View style={styles.cardIcon}>
              <Ionicons name="information-circle-outline" size={23} color={C.primary} />
            </View>
          </View>

          {sessionInfo.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.infoRow,
                index < sessionInfo.length - 1 && styles.infoRowBorder,
              ]}
            >
              <View style={styles.infoLeft}>
                <View style={styles.infoIcon}>
                  <Ionicons name={item.icon} size={17} color={C.primary} />
                </View>

                <Text style={styles.infoLabel}>{item.label}</Text>
              </View>

              <Text style={styles.infoValue} numberOfLines={1}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.noteCard}>
          <View style={styles.noteIcon}>
            <Ionicons name="shield-checkmark-outline" size={23} color={C.white} />
          </View>

          <View style={styles.noteTextWrap}>
            <Text style={styles.noteTitle}>Secure Learning Room</Text>
            <Text style={styles.noteSub}>
              Meeting ID: {session.meetingId || 'CLS-SESSION'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelBtn}
          activeOpacity={0.85}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.joinBtn}
          activeOpacity={0.9}
          onPress={handleJoin}
        >
          <Ionicons
            name={selectedMode === 'video' ? 'videocam' : 'headset-outline'}
            size={20}
            color={C.white}
          />
          <Text style={styles.joinBtnText}>
            {selectedMode === 'video' ? 'Join Video' : 'Join Audio'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  android: {
    elevation: 3,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.softBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.softBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: C.text,
    letterSpacing: -0.2,
  },

  headerSub: {
    marginTop: 2,
    fontSize: 11,
    color: C.muted,
    fontWeight: '600',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 124,
  },

  tutorCard: {
    backgroundColor: C.primary,
    borderRadius: 26,
    padding: 16,
    overflow: 'hidden',
    ...shadow,
  },

  tutorTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatarWrap: {
    width: 70,
    height: 70,
    marginRight: 12,
  },

  tutorAvatar: {
    width: 70,
    height: 70,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.42)',
    backgroundColor: '#DDE7EF',
  },

  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 9,
    backgroundColor: C.success,
    borderWidth: 2,
    borderColor: C.white,
  },

  tutorInfo: {
    flex: 1,
    paddingRight: 8,
  },

  tutorSmall: {
    fontSize: 11,
    color: '#CFF7F2',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  tutorName: {
    fontSize: 19,
    fontWeight: '900',
    color: C.white,
    letterSpacing: -0.3,
  },

  tutorSubject: {
    marginTop: 4,
    fontSize: 13,
    color: '#E8FFFC',
    fontWeight: '700',
  },

  ratingRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    marginLeft: 5,
    color: C.white,
    fontSize: 12,
    fontWeight: '800',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220,252,231,0.96)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: C.success,
    marginRight: 5,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '900',
    color: C.success,
  },

  topicBox: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  topicIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  topicInfo: {
    flex: 1,
  },

  topicLabel: {
    fontSize: 11,
    color: '#CFF7F2',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },

  topicTitle: {
    marginTop: 3,
    color: C.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },

  focusBox: {
    marginTop: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  focusText: {
    flex: 1,
    color: '#E8FFFC',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginLeft: 8,
  },

  previewCard: {
    marginTop: 16,
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: C.softBorder,
    ...shadow,
  },

  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.text,
    letterSpacing: -0.2,
  },

  cardSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
  },

  previewHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewBox: {
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.softBorder,
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: 'center',
  },

  previewCircle: {
    width: 104,
    height: 104,
    borderRadius: 36,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: '#C8F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  previewAvatar: {
    width: '100%',
    height: '100%',
  },

  previewTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '900',
    color: C.text,
    textAlign: 'center',
  },

  previewSub: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
    textAlign: 'center',
    lineHeight: 19,
  },

  controlRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },

  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  controlBtnOff: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  joinModeCard: {
    marginTop: 16,
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: C.softBorder,
    ...shadow,
  },

  cardHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modeOption: {
    minHeight: 76,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.softBorder,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  modeOptionActive: {
    backgroundColor: C.primaryLight,
    borderColor: '#BEEBE6',
  },

  modeIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: '#C8F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  modeIconActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },

  modeTextWrap: {
    flex: 1,
    paddingRight: 8,
  },

  modeTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
  },

  modeTitleActive: {
    color: C.primaryDark,
  },

  modeSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    lineHeight: 17,
  },

  infoCard: {
    marginTop: 16,
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: C.softBorder,
    ...shadow,
  },

  infoRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.softBorder,
  },

  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoLabel: {
    fontSize: 13,
    color: C.muted,
    fontWeight: '800',
  },

  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: C.text,
    fontWeight: '900',
  },

  noteCard: {
    marginTop: 16,
    backgroundColor: C.primaryDark,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  noteIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  noteTextWrap: {
    flex: 1,
  },

  noteTitle: {
    fontSize: 15,
    color: C.white,
    fontWeight: '900',
  },

  noteSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#D7FFFB',
    fontWeight: '700',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: C.softBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },

  cancelBtn: {
    width: 105,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  cancelBtnText: {
    color: C.muted,
    fontSize: 14,
    fontWeight: '900',
  },

  joinBtn: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  joinBtnText: {
    marginLeft: 8,
    color: C.white,
    fontSize: 15,
    fontWeight: '900',
  },
});