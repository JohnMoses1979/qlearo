

// // screens/student/InSessionScreen.js
// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   Modal,
//   FlatList,
//   TextInput,
//   ScrollView,
//   Animated,
//   Dimensions,
//   StatusBar,
//   Platform,
//   Share,
//   PanResponder,
// } from 'react-native';
// import {
//   Ionicons,
//   MaterialCommunityIcons,
//   FontAwesome5,
// } from '@expo/vector-icons';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import { Audio } from 'expo-av';

// const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// const C = {
//   primary: '#078C80',
//   primaryDark: '#056C63',
//   primaryLight: '#E7F8F6',
//   bgDark: '#080B12',
//   darkCard: '#101827',
//   white: '#FFFFFF',
//   text: '#07123A',
//   muted: '#64748B',
//   lightMuted: '#94A3B8',
//   border: '#E2E8F0',
//   softBorder: '#F1F5F9',
//   danger: '#EF4444',
//   success: '#16A34A',
//   warning: '#F59E0B',
//   black: '#000000',
// };

// const DEFAULT_SESSION = {
//   id: '1',
//   tutor: 'Dr. Sarah Johnson',
//   subject: 'Mathematics',
//   topic: 'Algebra – Linear Equations',
//   time: '5:00 PM – 6:00 PM',
//   meetingId: 'CLS-MATH-2205',
// };

// const INITIAL_MESSAGES = [
//   {
//     id: '1',
//     sender: 'Dr. Sarah Johnson',
//     text: 'Hello! Welcome to today’s live class.',
//     time: 'Now',
//     isMe: false,
//   },
//   {
//     id: '2',
//     sender: 'You',
//     text: 'Hello ma’am, I joined the session.',
//     time: 'Now',
//     isMe: true,
//   },
// ];

// const Avatar = ({ initials = 'ST', color = C.primary, size = 54 }) => {
//   return (
//     <View
//       style={[
//         styles.avatar,
//         {
//           width: size,
//           height: size,
//           borderRadius: size / 2,
//           backgroundColor: color,
//         },
//       ]}
//     >
//       <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>
//         {initials}
//       </Text>
//     </View>
//   );
// };

// export default function InSessionScreen({ route, navigation }) {
//   const session = {
//     ...DEFAULT_SESSION,
//     ...(route?.params?.session || {}),
//   };

//   const joinMode = route?.params?.mode || 'video';
//   const initialCameraEnabled =
//     route?.params?.cameraEnabled !== undefined
//       ? route.params.cameraEnabled
//       : joinMode === 'video';
//   const initialMicEnabled =
//     route?.params?.micEnabled !== undefined ? route.params.micEnabled : true;

//   const [cameraPermission, requestCameraPermission] = useCameraPermissions();
//   const [hasMicPermission, setHasMicPermission] = useState(null);

//   const [cameraFacing, setCameraFacing] = useState('front');
//   const [isMuted, setIsMuted] = useState(!initialMicEnabled);
//   const [isVideoOff, setIsVideoOff] = useState(!initialCameraEnabled);
//   const [sessionTime, setSessionTime] = useState(0);
//   const [isRecording, setIsRecording] = useState(false);

//   const [showChat, setShowChat] = useState(false);
//   const [showParticipants, setShowParticipants] = useState(false);
//   const [showMore, setShowMore] = useState(false);
//   const [showEndConfirm, setShowEndConfirm] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [showWhiteboard, setShowWhiteboard] = useState(false);

//   const [messages, setMessages] = useState(INITIAL_MESSAGES);
//   const [newMessage, setNewMessage] = useState('');
//   const [unreadCount, setUnreadCount] = useState(0);

//   const [whiteboardStrokes, setWhiteboardStrokes] = useState([]);
//   const [currentStroke, setCurrentStroke] = useState([]);

//   const chatScrollRef = useRef(null);
//   const controlsOpacity = useRef(new Animated.Value(1)).current;
//   const toastOpacity = useRef(new Animated.Value(0)).current;
//   const hideTimer = useRef(null);
//   const controlsVisible = useRef(true);

//   const [toastMsg, setToastMsg] = useState('');

//   const participants = useMemo(
//     () => [
//       {
//         id: '1',
//         name: session.tutor || 'Tutor',
//         role: 'Tutor',
//         initials: getInitials(session.tutor || 'Tutor'),
//         color: C.primary,
//         muted: false,
//         videoOff: false,
//       },
//       {
//         id: '2',
//         name: 'You',
//         role: 'Student',
//         initials: 'YO',
//         color: '#2563EB',
//         muted: isMuted,
//         videoOff: isVideoOff,
//         isMe: true,
//       },
//     ],
//     [session.tutor, isMuted, isVideoOff]
//   );

//   useEffect(() => {
//     let mounted = true;

//     const askPermissions = async () => {
//       try {
//         if (!cameraPermission?.granted) {
//           await requestCameraPermission();
//         }

//         const micStatus = await Audio.requestPermissionsAsync();

//         if (mounted) {
//           setHasMicPermission(micStatus.status === 'granted');
//         }
//       } catch (error) {
//         if (mounted) {
//           setHasMicPermission(false);
//         }
//       }
//     };

//     askPermissions();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setSessionTime((prev) => prev + 1);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     resetHideTimer();

//     return () => {
//       if (hideTimer.current) clearTimeout(hideTimer.current);
//     };
//   }, []);

//   useEffect(() => {
//     const autoMessageTimer = setTimeout(() => {
//       const tutorMessage = {
//         id: Date.now().toString(),
//         sender: session.tutor || 'Tutor',
//         text: 'Students, please use the chat if you have any doubts.',
//         time: getTimeNow(),
//         isMe: false,
//       };

//       setMessages((prev) => [...prev, tutorMessage]);

//       if (!showChat) {
//         setUnreadCount((prev) => prev + 1);
//       }
//     }, 9000);

//     return () => clearTimeout(autoMessageTimer);
//   }, [showChat, session.tutor]);

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onMoveShouldSetPanResponder: () => true,

//       onPanResponderGrant: (event) => {
//         const { locationX, locationY } = event.nativeEvent;
//         setCurrentStroke([{ x: locationX, y: locationY }]);
//       },

//       onPanResponderMove: (event) => {
//         const { locationX, locationY } = event.nativeEvent;
//         setCurrentStroke((prev) => [...prev, { x: locationX, y: locationY }]);
//       },

//       onPanResponderRelease: () => {
//         setWhiteboardStrokes((prev) => {
//           if (currentStroke.length === 0) return prev;
//           return [...prev, currentStroke];
//         });
//         setCurrentStroke([]);
//       },
//     })
//   ).current;

//   function getInitials(name) {
//     return String(name)
//       .split(' ')
//       .filter(Boolean)
//       .slice(0, 2)
//       .map((word) => word[0])
//       .join('')
//       .toUpperCase();
//   }

//   function getTimeNow() {
//     return new Date().toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   }

//   function formatTime(totalSeconds) {
//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     const seconds = totalSeconds % 60;

//     if (hours > 0) {
//       return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
//         2,
//         '0'
//       )}:${String(seconds).padStart(2, '0')}`;
//     }

//     return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
//       2,
//       '0'
//     )}`;
//   }

//   const showToast = (message) => {
//     setToastMsg(message);

//     Animated.sequence([
//       Animated.timing(toastOpacity, {
//         toValue: 1,
//         duration: 180,
//         useNativeDriver: true,
//       }),
//       Animated.delay(1400),
//       Animated.timing(toastOpacity, {
//         toValue: 0,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const resetHideTimer = () => {
//     if (hideTimer.current) clearTimeout(hideTimer.current);

//     if (!controlsVisible.current) {
//       Animated.timing(controlsOpacity, {
//         toValue: 1,
//         duration: 180,
//         useNativeDriver: true,
//       }).start();
//       controlsVisible.current = true;
//     }

//     hideTimer.current = setTimeout(() => {
//       Animated.timing(controlsOpacity, {
//         toValue: 0,
//         duration: 350,
//         useNativeDriver: true,
//       }).start();
//       controlsVisible.current = false;
//     }, 5000);
//   };

//   const handleMute = () => {
//     setIsMuted((prev) => {
//       showToast(prev ? 'Microphone turned on' : 'Microphone muted');
//       return !prev;
//     });
//     resetHideTimer();
//   };

//   const handleVideo = () => {
//     setIsVideoOff((prev) => {
//       showToast(prev ? 'Camera turned on' : 'Camera turned off');
//       return !prev;
//     });
//     resetHideTimer();
//   };

//   const handleFlipCamera = () => {
//     setCameraFacing((prev) => (prev === 'front' ? 'back' : 'front'));
//     showToast('Camera switched');
//     resetHideTimer();
//   };

//   const handleChatOpen = () => {
//     setShowChat(true);
//     setUnreadCount(0);
//     resetHideTimer();
//   };

//   const handleShare = async () => {
//     try {
//       await Share.share({
//         message: `Join my live class: ${session.subject} with ${
//           session.tutor
//         }\nMeeting ID: ${session.meetingId || 'CLS-SESSION'}`,
//       });
//     } catch (error) {
//       showToast('Unable to open share');
//     }
//   };

//   const sendMessage = () => {
//     const value = newMessage.trim();
//     if (!value) return;

//     const message = {
//       id: Date.now().toString(),
//       sender: 'You',
//       text: value,
//       time: getTimeNow(),
//       isMe: true,
//     };

//     setMessages((prev) => [...prev, message]);
//     setNewMessage('');

//     setTimeout(() => {
//       chatScrollRef.current?.scrollToEnd({ animated: true });
//     }, 80);
//   };

//   const confirmEndSession = () => {
//     setShowEndConfirm(false);
//     navigation.goBack();
//   };

//   const renderControlButton = ({
//     label,
//     icon,
//     active,
//     onPress,
//     danger,
//     badge,
//     iconType = 'ion',
//   }) => {
//     return (
//       <TouchableOpacity
//         style={[
//           styles.controlBtn,
//           active && styles.controlBtnActive,
//           danger && styles.controlDangerBtn,
//         ]}
//         onPress={onPress}
//         activeOpacity={0.85}
//       >
//         <View>
//           {iconType === 'font' ? (
//             <FontAwesome5 name={icon} size={18} color={C.white} />
//           ) : iconType === 'material' ? (
//             <MaterialCommunityIcons name={icon} size={22} color={C.white} />
//           ) : (
//             <Ionicons name={icon} size={22} color={C.white} />
//           )}

//           {badge > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>{badge}</Text>
//             </View>
//           )}
//         </View>

//         <Text style={styles.controlLabel}>{label}</Text>
//       </TouchableOpacity>
//     );
//   };

//   const renderMessage = (message) => {
//     return (
//       <View
//         key={message.id}
//         style={[
//           styles.messageRow,
//           message.isMe ? styles.messageRowMe : styles.messageRowOther,
//         ]}
//       >
//         {!message.isMe && (
//           <Avatar
//             initials={getInitials(message.sender)}
//             color={C.primary}
//             size={30}
//           />
//         )}

//         <View
//           style={[
//             styles.messageBubble,
//             message.isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
//           ]}
//         >
//           {!message.isMe && (
//             <Text style={styles.messageSender}>{message.sender}</Text>
//           )}

//           <Text
//             style={[
//               styles.messageText,
//               message.isMe && styles.messageTextMe,
//             ]}
//           >
//             {message.text}
//           </Text>

//           <Text
//             style={[
//               styles.messageTime,
//               message.isMe && styles.messageTimeMe,
//             ]}
//           >
//             {message.time}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   const renderWhiteboardPoints = (stroke, strokeIndex) => {
//     return stroke.map((point, pointIndex) => (
//       <View
//         key={`${strokeIndex}-${pointIndex}`}
//         style={[
//           styles.drawPoint,
//           {
//             left: point.x,
//             top: point.y,
//           },
//         ]}
//       />
//     ));
//   };

//   const allWhiteboardStrokes = [...whiteboardStrokes, currentStroke];

//   const micBlockedText =
//     hasMicPermission === false ? 'Mic permission not granted' : 'Mic ready';

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor={C.black} />

//       <TouchableOpacity
//         activeOpacity={1}
//         style={styles.videoArea}
//         onPress={resetHideTimer}
//       >
//         <View style={styles.remoteVideo}>
//           <View style={styles.remoteGlow}>
//             <Avatar
//               initials={getInitials(session.tutor)}
//               color={C.primary}
//               size={108}
//             />
//           </View>

//           <Text style={styles.remoteName}>{session.tutor}</Text>
//           <Text style={styles.remoteRole}>Tutor • {session.subject}</Text>

//           <View style={styles.speakingPill}>
//             <View style={styles.speakingDot} />
//             <Text style={styles.speakingText}>Speaking now</Text>
//           </View>
//         </View>

//         <View style={styles.pipContainer}>
//           {cameraPermission?.granted && !isVideoOff ? (
//             <CameraView
//               style={styles.pipCamera}
//               facing={cameraFacing}
//             />
//           ) : (
//             <View style={styles.pipOff}>
//               <Avatar initials="YO" color="#2563EB" size={42} />
//               <Text style={styles.pipOffText}>
//                 {isVideoOff ? 'Camera Off' : 'No Camera'}
//               </Text>
//             </View>
//           )}

//           <View style={styles.pipFooter}>
//             <Text style={styles.pipLabel}>You</Text>
//             <Ionicons
//               name={isMuted ? 'mic-off' : 'mic'}
//               size={13}
//               color={isMuted ? C.danger : C.success}
//             />
//           </View>

//           <TouchableOpacity
//             style={styles.flipBtn}
//             onPress={handleFlipCamera}
//             activeOpacity={0.85}
//           >
//             <Ionicons name="camera-reverse-outline" size={17} color={C.white} />
//           </TouchableOpacity>
//         </View>

//         <Animated.View style={[styles.topBar, { opacity: controlsOpacity }]}>
//           <TouchableOpacity
//             style={styles.topBackBtn}
//             onPress={() => setShowEndConfirm(true)}
//             activeOpacity={0.85}
//           >
//             <Ionicons name="chevron-down" size={22} color={C.white} />
//           </TouchableOpacity>

//           <View style={styles.topCenter}>
//             <View style={styles.liveBadge}>
//               <View style={styles.liveDot} />
//               <Text style={styles.liveText}>LIVE</Text>
//             </View>

//             <View style={styles.timerBadge}>
//               <Ionicons name="time-outline" size={14} color={C.white} />
//               <Text style={styles.timerText}>{formatTime(sessionTime)}</Text>
//             </View>
//           </View>

//           <TouchableOpacity
//             style={[
//               styles.recordBtn,
//               isRecording && styles.recordBtnActive,
//             ]}
//             activeOpacity={0.85}
//             onPress={() => {
//               setIsRecording((prev) => {
//                 showToast(prev ? 'Recording stopped' : 'Recording started');
//                 return !prev;
//               });
//               resetHideTimer();
//             }}
//           >
//             <Ionicons
//               name={isRecording ? 'radio-button-on' : 'radio-button-off'}
//               size={21}
//               color={isRecording ? C.danger : C.white}
//             />
//           </TouchableOpacity>
//         </Animated.View>

//         <Animated.View
//           style={[styles.sessionInfoBar, { opacity: controlsOpacity }]}
//         >
//           <Text style={styles.sessionTitle} numberOfLines={1}>
//             {session.topic || session.subject}
//           </Text>
//           <Text style={styles.sessionSub} numberOfLines={1}>
//             {session.meetingId} • {micBlockedText}
//           </Text>
//         </Animated.View>

//         <Animated.View
//           style={[styles.controlsBar, { opacity: controlsOpacity }]}
//         >
//           {renderControlButton({
//             label: isMuted ? 'Unmute' : 'Mute',
//             icon: isMuted ? 'mic-off' : 'mic-outline',
//             active: isMuted,
//             onPress: handleMute,
//           })}

//           {renderControlButton({
//             label: isVideoOff ? 'Start Video' : 'Video',
//             icon: isVideoOff ? 'videocam-off-outline' : 'videocam-outline',
//             active: isVideoOff,
//             onPress: handleVideo,
//           })}

//           {renderControlButton({
//             label: 'Chat',
//             icon: 'chatbubble-outline',
//             badge: unreadCount,
//             onPress: handleChatOpen,
//           })}

//           {renderControlButton({
//             label: 'Share',
//             icon: 'share-social-outline',
//             onPress: () => setShowShareModal(true),
//           })}

//           {renderControlButton({
//             label: 'Students',
//             icon: 'users',
//             iconType: 'font',
//             onPress: () => setShowParticipants(true),
//           })}

//           {renderControlButton({
//             label: 'More',
//             icon: 'ellipsis-horizontal',
//             onPress: () => setShowMore(true),
//           })}

//           {renderControlButton({
//             label: 'End',
//             icon: 'phone-hangup',
//             iconType: 'material',
//             danger: true,
//             onPress: () => setShowEndConfirm(true),
//           })}
//         </Animated.View>
//       </TouchableOpacity>

//       <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
//         <Text style={styles.toastText}>{toastMsg}</Text>
//       </Animated.View>

//       <Modal
//         visible={showChat}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setShowChat(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalSheet}>
//             <View style={styles.modalHeader}>
//               <View>
//                 <Text style={styles.modalTitle}>Class Chat</Text>
//                 <Text style={styles.modalSub}>Ask doubts and share notes</Text>
//               </View>

//               <TouchableOpacity
//                 onPress={() => setShowChat(false)}
//                 style={styles.modalCloseBtn}
//               >
//                 <Ionicons name="close" size={22} color={C.text} />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               ref={chatScrollRef}
//               style={styles.chatList}
//               contentContainerStyle={styles.chatContent}
//               onContentSizeChange={() =>
//                 chatScrollRef.current?.scrollToEnd({ animated: true })
//               }
//             >
//               {messages.map(renderMessage)}
//             </ScrollView>

//             <View style={styles.chatInputRow}>
//               <TextInput
//                 style={styles.chatInput}
//                 placeholder="Type your message..."
//                 placeholderTextColor={C.lightMuted}
//                 value={newMessage}
//                 onChangeText={setNewMessage}
//                 multiline
//                 returnKeyType="send"
//                 onSubmitEditing={sendMessage}
//               />

//               <TouchableOpacity
//                 style={[
//                   styles.sendBtn,
//                   !newMessage.trim() && styles.sendBtnDisabled,
//                 ]}
//                 onPress={sendMessage}
//                 activeOpacity={0.85}
//                 disabled={!newMessage.trim()}
//               >
//                 <Ionicons name="send" size={19} color={C.white} />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={showParticipants}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setShowParticipants(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalSheet}>
//             <View style={styles.modalHeader}>
//               <View>
//                 <Text style={styles.modalTitle}>
//                   Participants ({participants.length})
//                 </Text>
//                 <Text style={styles.modalSub}>Tutor and student list</Text>
//               </View>

//               <TouchableOpacity
//                 onPress={() => setShowParticipants(false)}
//                 style={styles.modalCloseBtn}
//               >
//                 <Ionicons name="close" size={22} color={C.text} />
//               </TouchableOpacity>
//             </View>

//             <FlatList
//               data={participants}
//               keyExtractor={(item) => item.id}
//               contentContainerStyle={styles.participantList}
//               renderItem={({ item }) => (
//                 <View style={styles.participantRow}>
//                   <Avatar
//                     initials={item.initials}
//                     color={item.color}
//                     size={46}
//                   />

//                   <View style={styles.participantInfo}>
//                     <Text style={styles.participantName}>
//                       {item.name} {item.isMe ? '(You)' : ''}
//                     </Text>
//                     <Text style={styles.participantRole}>{item.role}</Text>
//                   </View>

//                   <View style={styles.participantIcons}>
//                     <Ionicons
//                       name={item.muted ? 'mic-off' : 'mic-outline'}
//                       size={18}
//                       color={item.muted ? C.danger : C.success}
//                     />
//                     <Ionicons
//                       name={
//                         item.videoOff
//                           ? 'videocam-off-outline'
//                           : 'videocam-outline'
//                       }
//                       size={18}
//                       color={item.videoOff ? C.danger : C.success}
//                       style={{ marginLeft: 12 }}
//                     />
//                   </View>
//                 </View>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={showShareModal}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setShowShareModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalSheet, styles.smallSheet]}>
//             <View style={styles.modalHeader}>
//               <View>
//                 <Text style={styles.modalTitle}>Share Session</Text>
//                 <Text style={styles.modalSub}>Share live class details</Text>
//               </View>

//               <TouchableOpacity
//                 onPress={() => setShowShareModal(false)}
//                 style={styles.modalCloseBtn}
//               >
//                 <Ionicons name="close" size={22} color={C.text} />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.shareBody}>
//               <View style={styles.shareCard}>
//                 <Ionicons name="link-outline" size={22} color={C.primary} />
//                 <View style={{ flex: 1, marginLeft: 10 }}>
//                   <Text style={styles.shareTitle}>Meeting ID</Text>
//                   <Text style={styles.shareText}>
//                     {session.meetingId || 'CLS-SESSION'}
//                   </Text>
//                 </View>
//               </View>

//               <TouchableOpacity
//                 style={styles.primarySheetBtn}
//                 onPress={() => {
//                   setShowShareModal(false);
//                   handleShare();
//                 }}
//               >
//                 <Ionicons name="share-social-outline" size={20} color={C.white} />
//                 <Text style={styles.primarySheetBtnText}>Share Now</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={showMore}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setShowMore(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalSheet, styles.moreSheet]}>
//             <View style={styles.modalHeader}>
//               <View>
//                 <Text style={styles.modalTitle}>More Options</Text>
//                 <Text style={styles.modalSub}>Student tools</Text>
//               </View>

//               <TouchableOpacity
//                 onPress={() => setShowMore(false)}
//                 style={styles.modalCloseBtn}
//               >
//                 <Ionicons name="close" size={22} color={C.text} />
//               </TouchableOpacity>
//             </View>

//             {[
//               {
//                 label: 'Open Whiteboard',
//                 sub: 'Draw and explain doubts',
//                 icon: 'draw',
//                 type: 'material',
//                 action: () => {
//                   setShowMore(false);
//                   setShowWhiteboard(true);
//                 },
//               },
//               {
//                 label: 'Class Information',
//                 sub: `${session.subject} • ${session.time}`,
//                 icon: 'information-circle-outline',
//                 type: 'ion',
//                 action: () => {
//                   setShowMore(false);
//                   showToast('Class information loaded');
//                 },
//               },
//               {
//                 label: isRecording ? 'Stop Recording' : 'Start Recording',
//                 sub: 'Local recording indicator',
//                 icon: isRecording ? 'stop-circle-outline' : 'radio-button-on',
//                 type: 'ion',
//                 action: () => {
//                   setShowMore(false);
//                   setIsRecording((prev) => !prev);
//                   showToast(isRecording ? 'Recording stopped' : 'Recording started');
//                 },
//               },
//               {
//                 label: 'Report Issue',
//                 sub: 'Send issue to support',
//                 icon: 'flag-outline',
//                 type: 'ion',
//                 action: () => {
//                   setShowMore(false);
//                   showToast('Issue reported');
//                 },
//               },
//             ].map((item) => (
//               <TouchableOpacity
//                 key={item.label}
//                 style={styles.moreOption}
//                 activeOpacity={0.85}
//                 onPress={item.action}
//               >
//                 <View style={styles.moreIconBox}>
//                   {item.type === 'material' ? (
//                     <MaterialCommunityIcons
//                       name={item.icon}
//                       size={22}
//                       color={C.primary}
//                     />
//                   ) : (
//                     <Ionicons name={item.icon} size={22} color={C.primary} />
//                   )}
//                 </View>

//                 <View style={styles.moreTextWrap}>
//                   <Text style={styles.moreTitle}>{item.label}</Text>
//                   <Text style={styles.moreSub}>{item.sub}</Text>
//                 </View>

//                 <Ionicons name="chevron-forward" size={18} color={C.lightMuted} />
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={showWhiteboard}
//         animationType="slide"
//         onRequestClose={() => setShowWhiteboard(false)}
//       >
//         <SafeAreaView style={styles.whiteboardContainer}>
//           <StatusBar barStyle="dark-content" backgroundColor={C.white} />

//           <View style={styles.whiteboardHeader}>
//             <TouchableOpacity
//               style={styles.whiteboardIconBtn}
//               onPress={() => setShowWhiteboard(false)}
//             >
//               <Ionicons name="close" size={22} color={C.text} />
//             </TouchableOpacity>

//             <View style={{ flex: 1, alignItems: 'center' }}>
//               <Text style={styles.whiteboardTitle}>Student Whiteboard</Text>
//               <Text style={styles.whiteboardSub}>
//                 Write your doubt and share in chat
//               </Text>
//             </View>

//             <TouchableOpacity
//               style={styles.whiteboardIconBtn}
//               onPress={() => {
//                 setWhiteboardStrokes([]);
//                 setCurrentStroke([]);
//               }}
//             >
//               <Ionicons name="trash-outline" size={21} color={C.danger} />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.whiteboardTools}>
//             <TouchableOpacity
//               style={styles.whiteboardToolBtn}
//               onPress={() => {
//                 setShowWhiteboard(false);
//                 setShowChat(true);
//                 setMessages((prev) => [
//                   ...prev,
//                   {
//                     id: Date.now().toString(),
//                     sender: 'You',
//                     text: 'I shared my doubt on the whiteboard.',
//                     time: getTimeNow(),
//                     isMe: true,
//                   },
//                 ]);
//               }}
//             >
//               <Ionicons name="chatbubble-ellipses-outline" size={18} color={C.white} />
//               <Text style={styles.whiteboardToolText}>Share in Chat</Text>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.whiteboardCanvas} {...panResponder.panHandlers}>
//             <Text style={styles.whiteboardHint}>
//               Write here using your finger
//             </Text>

//             {allWhiteboardStrokes.map((stroke, index) =>
//               renderWhiteboardPoints(stroke, index)
//             )}
//           </View>
//         </SafeAreaView>
//       </Modal>

//       <Modal
//         visible={showEndConfirm}
//         animationType="fade"
//         transparent
//         onRequestClose={() => setShowEndConfirm(false)}
//       >
//         <View style={styles.confirmOverlay}>
//           <View style={styles.confirmBox}>
//             <View style={styles.confirmIconWrap}>
//               <MaterialCommunityIcons name="phone-hangup" size={31} color={C.white} />
//             </View>

//             <Text style={styles.confirmTitle}>Leave Session?</Text>
//             <Text style={styles.confirmText}>
//               Your live class will close on this device.
//             </Text>

//             <View style={styles.summaryBox}>
//               <Text style={styles.summaryText}>
//                 Time spent: {formatTime(sessionTime)}
//               </Text>
//               <Text style={styles.summaryText}>
//                 Tutor: {session.tutor}
//               </Text>
//             </View>

//             <View style={styles.confirmActions}>
//               <TouchableOpacity
//                 style={styles.stayBtn}
//                 onPress={() => setShowEndConfirm(false)}
//               >
//                 <Text style={styles.stayBtnText}>Stay</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.leaveBtn}
//                 onPress={confirmEndSession}
//               >
//                 <Text style={styles.leaveBtnText}>Leave</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: C.black,
//   },

//   videoArea: {
//     flex: 1,
//     backgroundColor: C.bgDark,
//   },

//   remoteVideo: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: C.bgDark,
//   },

//   remoteGlow: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     backgroundColor: 'rgba(7,140,128,0.14)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.08)',
//   },

//   avatar: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   avatarText: {
//     color: C.white,
//     fontWeight: '900',
//   },

//   remoteName: {
//     marginTop: 18,
//     color: C.white,
//     fontSize: 22,
//     fontWeight: '900',
//   },

//   remoteRole: {
//     marginTop: 5,
//     color: '#B6C2D2',
//     fontSize: 13,
//     fontWeight: '700',
//   },

//   speakingPill: {
//     marginTop: 13,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(22,163,74,0.14)',
//     borderWidth: 1,
//     borderColor: 'rgba(22,163,74,0.25)',
//     borderRadius: 999,
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//   },

//   speakingDot: {
//     width: 7,
//     height: 7,
//     borderRadius: 4,
//     backgroundColor: C.success,
//     marginRight: 7,
//   },

//   speakingText: {
//     color: '#BBF7D0',
//     fontSize: 12,
//     fontWeight: '800',
//   },

//   pipContainer: {
//     position: 'absolute',
//     top: 88,
//     right: 14,
//     width: 116,
//     height: 158,
//     borderRadius: 18,
//     overflow: 'hidden',
//     backgroundColor: '#111827',
//     borderWidth: 2,
//     borderColor: C.primary,
//   },

//   pipCamera: {
//     flex: 1,
//   },

//   pipOff: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   pipOffText: {
//     marginTop: 8,
//     color: '#CBD5E1',
//     fontSize: 10,
//     fontWeight: '800',
//   },

//   pipFooter: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.55)',
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },

//   pipLabel: {
//     color: C.white,
//     fontSize: 11,
//     fontWeight: '900',
//   },

//   flipBtn: {
//     position: 'absolute',
//     top: 7,
//     right: 7,
//     width: 29,
//     height: 29,
//     borderRadius: 15,
//     backgroundColor: 'rgba(0,0,0,0.55)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   topBar: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     top: 0,
//     paddingHorizontal: 14,
//     paddingTop: Platform.OS === 'android' ? 12 : 8,
//     paddingBottom: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.42)',
//   },

//   topBackBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 14,
//     backgroundColor: 'rgba(255,255,255,0.14)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   topCenter: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },

//   liveBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: C.danger,
//     paddingHorizontal: 10,
//     paddingVertical: 7,
//     borderRadius: 999,
//     marginRight: 8,
//   },

//   liveDot: {
//     width: 7,
//     height: 7,
//     borderRadius: 4,
//     backgroundColor: C.white,
//     marginRight: 6,
//   },

//   liveText: {
//     color: C.white,
//     fontSize: 11,
//     fontWeight: '900',
//   },

//   timerBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.14)',
//     paddingHorizontal: 10,
//     paddingVertical: 7,
//     borderRadius: 999,
//   },

//   timerText: {
//     marginLeft: 5,
//     color: C.white,
//     fontSize: 12,
//     fontWeight: '900',
//   },

//   recordBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 14,
//     backgroundColor: 'rgba(255,255,255,0.14)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   recordBtnActive: {
//     backgroundColor: 'rgba(239,68,68,0.18)',
//   },

//   sessionInfoBar: {
//     position: 'absolute',
//     left: 16,
//     right: 142,
//     top: 76,
//     backgroundColor: 'rgba(0,0,0,0.42)',
//     borderRadius: 15,
//     paddingHorizontal: 12,
//     paddingVertical: 9,
//   },

//   sessionTitle: {
//     color: C.white,
//     fontSize: 13,
//     fontWeight: '900',
//   },

//   sessionSub: {
//     marginTop: 3,
//     color: '#CBD5E1',
//     fontSize: 10,
//     fontWeight: '700',
//   },

//   controlsBar: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     paddingHorizontal: 7,
//     paddingTop: 12,
//     paddingBottom: Platform.OS === 'ios' ? 24 : 12,
//     backgroundColor: 'rgba(0,0,0,0.82)',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },

//   controlBtn: {
//     minWidth: 45,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   controlBtnActive: {
//     opacity: 0.72,
//   },

//   controlDangerBtn: {
//     backgroundColor: C.danger,
//     borderRadius: 14,
//     paddingHorizontal: 9,
//     paddingVertical: 7,
//   },

//   controlLabel: {
//     marginTop: 4,
//     color: C.white,
//     fontSize: 9,
//     fontWeight: '800',
//   },

//   badge: {
//     position: 'absolute',
//     top: -7,
//     right: -9,
//     minWidth: 17,
//     height: 17,
//     borderRadius: 9,
//     backgroundColor: C.danger,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 4,
//     borderWidth: 1,
//     borderColor: C.black,
//   },

//   badgeText: {
//     color: C.white,
//     fontSize: 9,
//     fontWeight: '900',
//   },

//   toast: {
//     position: 'absolute',
//     bottom: 106,
//     alignSelf: 'center',
//     backgroundColor: 'rgba(15,23,42,0.92)',
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//     borderRadius: 999,
//   },

//   toastText: {
//     color: C.white,
//     fontSize: 13,
//     fontWeight: '800',
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.52)',
//     justifyContent: 'flex-end',
//   },

//   modalSheet: {
//     maxHeight: SCREEN_HEIGHT * 0.86,
//     minHeight: 360,
//     backgroundColor: C.white,
//     borderTopLeftRadius: 26,
//     borderTopRightRadius: 26,
//     overflow: 'hidden',
//   },

//   smallSheet: {
//     minHeight: 300,
//     maxHeight: SCREEN_HEIGHT * 0.46,
//   },

//   moreSheet: {
//     minHeight: 450,
//     maxHeight: SCREEN_HEIGHT * 0.68,
//   },

//   modalHeader: {
//     paddingHorizontal: 16,
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: C.softBorder,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },

//   modalTitle: {
//     fontSize: 18,
//     color: C.text,
//     fontWeight: '900',
//   },

//   modalSub: {
//     marginTop: 2,
//     fontSize: 12,
//     color: C.muted,
//     fontWeight: '600',
//   },

//   modalCloseBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 14,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: C.softBorder,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   chatList: {
//     flex: 1,
//   },

//   chatContent: {
//     padding: 14,
//   },

//   messageRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     marginBottom: 13,
//   },

//   messageRowMe: {
//     justifyContent: 'flex-end',
//   },

//   messageRowOther: {
//     justifyContent: 'flex-start',
//   },

//   messageBubble: {
//     maxWidth: '75%',
//     borderRadius: 17,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//   },

//   messageBubbleMe: {
//     backgroundColor: C.primary,
//     borderBottomRightRadius: 5,
//   },

//   messageBubbleOther: {
//     backgroundColor: '#F1F5F9',
//     borderBottomLeftRadius: 5,
//     marginLeft: 8,
//   },

//   messageSender: {
//     marginBottom: 3,
//     fontSize: 11,
//     color: C.primary,
//     fontWeight: '900',
//   },

//   messageText: {
//     color: C.text,
//     fontSize: 14,
//     lineHeight: 20,
//     fontWeight: '600',
//   },

//   messageTextMe: {
//     color: C.white,
//   },

//   messageTime: {
//     alignSelf: 'flex-end',
//     marginTop: 5,
//     fontSize: 10,
//     color: C.lightMuted,
//     fontWeight: '700',
//   },

//   messageTimeMe: {
//     color: 'rgba(255,255,255,0.74)',
//   },

//   chatInputRow: {
//     paddingHorizontal: 12,
//     paddingTop: 10,
//     paddingBottom: Platform.OS === 'ios' ? 26 : 12,
//     borderTopWidth: 1,
//     borderTopColor: C.softBorder,
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//   },

//   chatInput: {
//     flex: 1,
//     maxHeight: 110,
//     minHeight: 44,
//     borderRadius: 18,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: C.border,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     color: C.text,
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   sendBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 17,
//     marginLeft: 9,
//     backgroundColor: C.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   sendBtnDisabled: {
//     backgroundColor: '#CBD5E1',
//   },

//   participantList: {
//     padding: 16,
//   },

//   participantRow: {
//     minHeight: 68,
//     borderRadius: 18,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: C.softBorder,
//     paddingHorizontal: 12,
//     marginBottom: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   participantInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   participantName: {
//     fontSize: 15,
//     color: C.text,
//     fontWeight: '900',
//   },

//   participantRole: {
//     marginTop: 3,
//     fontSize: 12,
//     color: C.muted,
//     fontWeight: '700',
//   },

//   participantIcons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   shareBody: {
//     padding: 16,
//   },

//   shareCard: {
//     minHeight: 68,
//     borderRadius: 18,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: C.softBorder,
//     paddingHorizontal: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   shareTitle: {
//     fontSize: 12,
//     color: C.muted,
//     fontWeight: '800',
//   },

//   shareText: {
//     marginTop: 2,
//     fontSize: 14,
//     color: C.text,
//     fontWeight: '900',
//   },

//   primarySheetBtn: {
//     marginTop: 16,
//     height: 52,
//     borderRadius: 18,
//     backgroundColor: C.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//   },

//   primarySheetBtnText: {
//     marginLeft: 8,
//     color: C.white,
//     fontSize: 15,
//     fontWeight: '900',
//   },

//   moreOption: {
//     marginHorizontal: 16,
//     marginBottom: 10,
//     minHeight: 72,
//     borderRadius: 18,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: C.softBorder,
//     paddingHorizontal: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   moreIconBox: {
//     width: 43,
//     height: 43,
//     borderRadius: 15,
//     backgroundColor: C.primaryLight,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },

//   moreTextWrap: {
//     flex: 1,
//   },

//   moreTitle: {
//     fontSize: 14,
//     color: C.text,
//     fontWeight: '900',
//   },

//   moreSub: {
//     marginTop: 3,
//     fontSize: 12,
//     color: C.muted,
//     fontWeight: '600',
//   },

//   whiteboardContainer: {
//     flex: 1,
//     backgroundColor: C.white,
//   },

//   whiteboardHeader: {
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: C.softBorder,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   whiteboardIconBtn: {
//     width: 42,
//     height: 42,
//     borderRadius: 15,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: C.softBorder,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   whiteboardTitle: {
//     fontSize: 17,
//     color: C.text,
//     fontWeight: '900',
//   },

//   whiteboardSub: {
//     marginTop: 2,
//     fontSize: 11,
//     color: C.muted,
//     fontWeight: '600',
//   },

//   whiteboardTools: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: C.softBorder,
//     alignItems: 'flex-end',
//   },

//   whiteboardToolBtn: {
//     height: 42,
//     borderRadius: 15,
//     paddingHorizontal: 14,
//     backgroundColor: C.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   whiteboardToolText: {
//     marginLeft: 8,
//     color: C.white,
//     fontSize: 13,
//     fontWeight: '900',
//   },

//   whiteboardCanvas: {
//     flex: 1,
//     margin: 14,
//     borderRadius: 22,
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1.5,
//     borderColor: C.border,
//     overflow: 'hidden',
//   },

//   whiteboardHint: {
//     position: 'absolute',
//     top: 16,
//     alignSelf: 'center',
//     color: C.lightMuted,
//     fontSize: 13,
//     fontWeight: '700',
//   },

//   drawPoint: {
//     position: 'absolute',
//     width: 7,
//     height: 7,
//     borderRadius: 4,
//     backgroundColor: C.primary,
//   },

//   confirmOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.62)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24,
//   },

//   confirmBox: {
//     width: '100%',
//     borderRadius: 26,
//     backgroundColor: C.white,
//     padding: 24,
//     alignItems: 'center',
//   },

//   confirmIconWrap: {
//     width: 66,
//     height: 66,
//     borderRadius: 24,
//     backgroundColor: C.danger,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 16,
//   },

//   confirmTitle: {
//     fontSize: 21,
//     color: C.text,
//     fontWeight: '900',
//   },

//   confirmText: {
//     marginTop: 7,
//     color: C.muted,
//     fontSize: 14,
//     textAlign: 'center',
//     fontWeight: '600',
//     lineHeight: 20,
//   },

//   summaryBox: {
//     width: '100%',
//     marginTop: 16,
//     borderRadius: 18,
//     backgroundColor: '#F8FAFC',
//     borderWidth: 1,
//     borderColor: C.softBorder,
//     padding: 14,
//   },

//   summaryText: {
//     color: C.text,
//     fontSize: 13,
//     fontWeight: '800',
//     marginBottom: 5,
//   },

//   confirmActions: {
//     marginTop: 20,
//     width: '100%',
//     flexDirection: 'row',
//   },

//   stayBtn: {
//     flex: 1,
//     height: 50,
//     borderRadius: 17,
//     backgroundColor: C.primaryLight,
//     borderWidth: 1,
//     borderColor: '#BEEBE6',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 10,
//   },

//   stayBtnText: {
//     color: C.primary,
//     fontSize: 15,
//     fontWeight: '900',
//   },

//   leaveBtn: {
//     flex: 1,
//     height: 50,
//     borderRadius: 17,
//     backgroundColor: C.danger,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   leaveBtnText: {
//     color: C.white,
//     fontSize: 15,
//     fontWeight: '900',
//   },
// });




























































// screens/student/InSessionScreen.js
// FULLY UPDATED — Real AppContext session + real chat + smooth whiteboard + share to chat

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Share,
  PanResponder,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { useAppContext } from "../../context/AppContext";
import { useLiveSessionRoom } from '../../services/useLiveSessionRoom';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const C = {
  primary: '#078C80',
  primaryDark: '#056C63',
  primaryLight: '#E7F8F6',
  bgDark: '#080B12',
  white: '#FFFFFF',
  text: '#07123A',
  muted: '#64748B',
  lightMuted: '#94A3B8',
  border: '#E2E8F0',
  softBorder: '#F1F5F9',
  danger: '#EF4444',
  success: '#16A34A',
  warning: '#F59E0B',
  black: '#000000',
  blue: '#2563EB',
};

const safeText = (value, fallback = '') => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
};

const getInitials = name =>
  safeText(name, 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase() || 'U';

const getTimeNow = () =>
  new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatTime = totalSeconds => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

const normalizeSession = (params = {}, contextSession = null) => {
  const merged = {
    ...(contextSession || {}),
    ...(params?.session || {}),
    ...params,
  };

  const id = safeText(merged.id || merged.sessionId, 'SESSION_DEMO');
  const timeParts = splitTimeRange(merged.time || merged.requestedTime);

  const tutor = safeText(
    merged.tutor ||
      merged.tutorName ||
      merged.teacherName ||
      merged.teacher ||
      merged.name,
    'Tutor'
  );

  const subject = safeText(merged.subject, 'General');
  const topic = safeText(merged.topic, 'Class Topic');

  const timeStart = safeText(merged.timeStart || timeParts.timeStart, 'Flexible');
  const timeEnd = safeText(merged.timeEnd || timeParts.timeEnd, '');

  return {
    ...merged,
    id,
    sessionId: safeText(merged.sessionId || merged.id, id),
    tutor,
    tutorName: tutor,
    teacherName: tutor,
    subject,
    topic,
    focus: safeText(merged.focus || merged.note || merged.description, ''),
    time: merged.time || (timeEnd ? `${timeStart} - ${timeEnd}` : timeStart),
    timeStart,
    timeEnd,
    duration: safeText(merged.duration, '1 Hour'),
    meetingId: safeText(merged.meetingId, `CLS-${id.slice(-6).toUpperCase()}`),
    language: safeText(merged.language, 'English'),
    level: safeText(merged.level, 'Intermediate'),
  };
};

const Avatar = ({ initials = 'ST', color = C.primary, size = 54, style }) => {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>
        {initials}
      </Text>
    </View>
  );
};

const LineSegment = ({ from, to, color, size }) => {
  if (!from || !to) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length < 0.5) return null;

  const angle = Math.atan2(dy, dx);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: midX - length / 2,
        top: midY - size / 2,
        width: length,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ rotateZ: `${angle}rad` }],
      }}
    />
  );
};

const WhiteboardPreview = ({ strokes }) => {
  const previewStrokes = (strokes || []).slice(-8);

  return (
    <View style={styles.chatWhiteboardPreview}>
      <View style={styles.chatWhiteboardHeader}>
        <MaterialCommunityIcons name="draw" size={16} color={C.primary} />
        <Text style={styles.chatWhiteboardTitle}>Whiteboard Shared</Text>
      </View>

      <View style={styles.chatWhiteboardCanvas}>
        {previewStrokes.length === 0 ? (
          <Text style={styles.chatWhiteboardEmpty}>No drawing</Text>
        ) : (
          previewStrokes.map(stroke =>
            (stroke.points || []).map((point, index) => {
              if (index === 0) return null;

              const previous = stroke.points[index - 1];

              return (
                <LineSegment
                  key={`${stroke.id}-${index}`}
                  from={{
                    x: previous.x * 0.28,
                    y: previous.y * 0.18,
                  }}
                  to={{
                    x: point.x * 0.28,
                    y: point.y * 0.18,
                  }}
                  color={stroke.tool === 'eraser' ? C.white : stroke.color}
                  size={Math.max(2, stroke.size * 0.35)}
                />
              );
            })
          )
        )}
      </View>
    </View>
  );
};

export default function InSessionScreen({ route, navigation }) {
  const {
    getSessionById,
    getSessionMessages,
    markSessionViewed,
    currentUser,
  } = useAppContext();

  const params = route?.params || {};
  const routeSessionId = params.sessionId || params.session?.id || params.session?.sessionId;

  const contextSession = useMemo(() => {
    if (typeof getSessionById === 'function' && routeSessionId) {
      return getSessionById(routeSessionId);
    }

    return null;
  }, [getSessionById, routeSessionId]);

  const session = useMemo(
    () => normalizeSession(params, contextSession),
    [params, contextSession]
  );

  const sessionId = session.id;
  const shareLink = useMemo(() => `https://liveclass.app/session/${sessionId}`, [sessionId]);

  const contextMessages = useMemo(() => {
    if (typeof getSessionMessages === 'function') {
      return getSessionMessages(sessionId);
    }

    return [];
  }, [getSessionMessages, sessionId]);

  const liveRoom = useLiveSessionRoom({
    sessionId,
    currentUser,
    initialMessages:
      Array.isArray(contextMessages) && contextMessages.length > 0
        ? contextMessages
        : [
            {
              id: 'welcome-student-1',
              sessionId,
              senderId: session.teacherId || session.tutorId || 'teacher-real',
              sender: session.tutor,
              senderName: session.tutor,
              senderRole: 'teacher',
              text: `Hello! Welcome to ${session.subject}. Today we will cover ${session.topic}.`,
              time: getTimeNow(),
              createdAt: new Date().toISOString(),
              isMe: false,
              type: 'text',
            },
            {
              id: 'welcome-student-2',
              sessionId,
              senderId: currentUser?.id || 'student-me',
              sender: 'You',
              senderName: currentUser?.name || 'You',
              senderRole: 'student',
              text: 'Hello, I joined the session.',
              time: getTimeNow(),
              createdAt: new Date().toISOString(),
              isMe: true,
              type: 'text',
            },
          ],
    fallbackRole: 'student',
  });

  const {
    messages,
    sendEvent,
    shareWhiteboard,
    sendTypingState,
  } = liveRoom;

  const joinMode = params.mode || 'video';
  const initialCameraEnabled =
    params.cameraEnabled !== undefined ? params.cameraEnabled : joinMode === 'video';
  const initialMicEnabled =
    params.micEnabled !== undefined ? params.micEnabled : true;

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMicPermission, setHasMicPermission] = useState(null);

  const [cameraFacing, setCameraFacing] = useState('front');
  const [isMuted, setIsMuted] = useState(!initialMicEnabled);
  const [isVideoOff, setIsVideoOff] = useState(!initialCameraEnabled);
  const [sessionTime, setSessionTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const [whiteboardTool, setWhiteboardTool] = useState('pen');
  const [whiteboardColor, setWhiteboardColor] = useState('#078C80');
  const [whiteboardSize, setWhiteboardSize] = useState(7);
  const [whiteboardStrokes, setWhiteboardStrokes] = useState([]);

  const activeStrokeIdRef = useRef(null);
  const lastPointRef = useRef(null);
  const lastMessageCountRef = useRef(messages.length);
  const unreadHydratedRef = useRef(false);

  const chatScrollRef = useRef(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef(null);
  const controlsVisible = useRef(true);

  const [toastMsg, setToastMsg] = useState('');

  const participants = useMemo(
    () => [
      {
        id: 'teacher-real',
        name: session.tutor || 'Tutor',
        role: 'Tutor',
        initials: getInitials(session.tutor || 'Tutor'),
        color: C.primary,
        muted: false,
        videoOff: false,
      },
      {
        id: 'student-me',
        name: currentUser?.name || 'You',
        role: 'Student',
        initials: getInitials(currentUser?.name || 'You'),
        color: C.blue,
        muted: isMuted,
        videoOff: isVideoOff,
        isMe: true,
      },
    ],
    [session.tutor, currentUser?.name, isMuted, isVideoOff]
  );

  useEffect(() => {
    if (typeof markSessionViewed === 'function') {
      markSessionViewed(sessionId, 'student');
    }
  }, [markSessionViewed, sessionId]);

  useEffect(() => {
    let mounted = true;

    const askPermissions = async () => {
      try {
        if (!cameraPermission?.granted) {
          await requestCameraPermission();
        }

        const micStatus = await Audio.requestPermissionsAsync();

        if (mounted) {
          setHasMicPermission(micStatus.status === 'granted');
        }
      } catch (error) {
        if (mounted) {
          setHasMicPermission(false);
        }
      }
    };

    askPermissions();

    return () => {
      mounted = false;
    };
  }, [cameraPermission?.granted, requestCameraPermission]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    resetHideTimer();

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    const previousCount = lastMessageCountRef.current;
    const nextCount = messages.length;

    if (!unreadHydratedRef.current) {
      unreadHydratedRef.current = true;
      lastMessageCountRef.current = nextCount;
      return;
    }

    if (nextCount > previousCount && !showChat) {
      const newMessages = messages.slice(previousCount);
      const newUnread = newMessages.filter(message => !message.isMe).length;

      if (newUnread > 0) {
        setUnreadCount(prev => prev + newUnread);
      }
    }

    lastMessageCountRef.current = nextCount;
  }, [messages, showChat]);

  const showToast = message => {
    setToastMsg(message);

    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(1400),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetHideTimer = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);

    if (!controlsVisible.current) {
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();

      controlsVisible.current = true;
    }

    hideTimer.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();

      controlsVisible.current = false;
    }, 5000);
  };

  const handleMute = () => {
    setIsMuted(prev => {
      showToast(prev ? 'Microphone turned on' : 'Microphone muted');
      return !prev;
    });

    resetHideTimer();
  };

  const handleVideo = () => {
    setIsVideoOff(prev => {
      showToast(prev ? 'Camera turned on' : 'Camera turned off');
      return !prev;
    });

    resetHideTimer();
  };

  const handleFlipCamera = () => {
    setCameraFacing(prev => (prev === 'front' ? 'back' : 'front'));
    showToast('Camera switched');
    resetHideTimer();
  };

  const handleChatOpen = () => {
    setShowChat(true);
    setUnreadCount(0);
    resetHideTimer();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my live class: ${session.subject} with ${session.tutor}\nMeeting ID: ${
          session.meetingId || 'CLS-SESSION'
        }\nLink: ${shareLink}`,
        url: shareLink,
      });
    } catch (error) {
      showToast('Unable to open share');
    }
  };

  const sendMessage = () => {
    const value = newMessage.trim();
    if (!value) return;

    sendEvent({
      type: 'chat',
      text: value,
    });

    setNewMessage('');
    sendTypingState(false);
  };

  const confirmEndSession = () => {
    setShowEndConfirm(false);
    navigation?.navigate?.('SessionEndedScreen', {
      sessionId,
      session,
      duration: formatTime(sessionTime),
    });
  };

  const shareBoardToChat = () => {
    if (whiteboardStrokes.length === 0) {
      showToast('Write something before sharing');
      return;
    }

    const copiedStrokes = JSON.parse(JSON.stringify(whiteboardStrokes));

    shareWhiteboard({
      title: 'I shared my doubt on the whiteboard.',
      strokes: copiedStrokes,
      sender: currentUser?.name || 'You',
      senderRole: 'student',
    });

    setShowWhiteboard(false);
    setShowChat(true);
    setUnreadCount(0);
    showToast('Whiteboard shared in chat');
  };

  const whiteboardResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,

        onPanResponderGrant: event => {
          const { locationX, locationY } = event.nativeEvent;

          const strokeId = `${Date.now()}-${Math.random()}`;
          activeStrokeIdRef.current = strokeId;
          lastPointRef.current = { x: locationX, y: locationY };

          const strokeColor = whiteboardTool === 'eraser' ? C.white : whiteboardColor;
          const strokeSize = whiteboardTool === 'eraser' ? whiteboardSize * 3 : whiteboardSize;

          setWhiteboardStrokes(prev => [
            ...prev,
            {
              id: strokeId,
              color: strokeColor,
              size: strokeSize,
              tool: whiteboardTool,
              points: [{ x: locationX, y: locationY }],
            },
          ]);
        },

        onPanResponderMove: event => {
          const { locationX, locationY } = event.nativeEvent;
          const strokeId = activeStrokeIdRef.current;

          if (!strokeId) return;

          const lastPoint = lastPointRef.current;

          if (lastPoint) {
            const dx = locationX - lastPoint.x;
            const dy = locationY - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1.5) return;
          }

          lastPointRef.current = { x: locationX, y: locationY };

          setWhiteboardStrokes(prev =>
            prev.map(stroke => {
              if (stroke.id !== strokeId) return stroke;

              return {
                ...stroke,
                points: [...stroke.points, { x: locationX, y: locationY }],
              };
            })
          );
        },

        onPanResponderRelease: () => {
          activeStrokeIdRef.current = null;
          lastPointRef.current = null;
        },

        onPanResponderTerminate: () => {
          activeStrokeIdRef.current = null;
          lastPointRef.current = null;
        },
      }),
    [whiteboardTool, whiteboardColor, whiteboardSize]
  );

  const renderStroke = stroke => {
    if (!stroke.points || stroke.points.length === 0) return null;

    if (stroke.points.length === 1) {
      const point = stroke.points[0];

      return (
        <View
          key={`${stroke.id}-single`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: point.x - stroke.size / 2,
            top: point.y - stroke.size / 2,
            width: stroke.size,
            height: stroke.size,
            borderRadius: stroke.size / 2,
            backgroundColor: stroke.color,
          }}
        />
      );
    }

    return stroke.points.map((point, index) => {
      if (index === 0) return null;

      return (
        <LineSegment
          key={`${stroke.id}-${index}`}
          from={stroke.points[index - 1]}
          to={point}
          color={stroke.color}
          size={stroke.size}
        />
      );
    });
  };

  const renderControlButton = ({
    label,
    icon,
    active,
    onPress,
    danger,
    badge,
    iconType = 'ion',
  }) => {
    return (
      <TouchableOpacity
        style={[
          styles.controlBtn,
          active && styles.controlBtnActive,
          danger && styles.controlDangerBtn,
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View>
          {iconType === 'font' ? (
            <FontAwesome5 name={icon} size={18} color={C.white} />
          ) : iconType === 'material' ? (
            <MaterialCommunityIcons name={icon} size={22} color={C.white} />
          ) : (
            <Ionicons name={icon} size={22} color={C.white} />
          )}

          {badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>

        <Text style={styles.controlLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderMessage = message => {
    const isMe = Boolean(message.isMe || message.senderRole === 'student');

    return (
      <View
        key={message.id}
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        {!isMe && (
          <Avatar
            initials={getInitials(message.sender)}
            color={C.primary}
            size={30}
          />
        )}

        <View
          style={[
            styles.messageBubble,
            isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
          ]}
        >
          {!isMe && (
            <Text style={styles.messageSender}>{message.sender}</Text>
          )}

          {message.type === 'whiteboard' ? (
            <>
              <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                {message.text}
              </Text>
              <WhiteboardPreview strokes={message.strokes} />
            </>
          ) : (
            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
              {message.text}
            </Text>
          )}

          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {message.time || getTimeNow()}
          </Text>
        </View>
      </View>
    );
  };

  const micBlockedText =
    hasMicPermission === false ? 'Mic permission not granted' : 'Mic ready';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoArea}
        onPress={resetHideTimer}
      >
        <View style={styles.remoteVideo}>
          <View style={styles.remoteGlow}>
            <Avatar
              initials={getInitials(session.tutor)}
              color={C.primary}
              size={108}
            />
          </View>

          <Text style={styles.remoteName}>{session.tutor}</Text>
          <Text style={styles.remoteRole}>Tutor • {session.subject}</Text>

          <View style={styles.speakingPill}>
            <View style={styles.speakingDot} />
            <Text style={styles.speakingText}>Connected now</Text>
          </View>
        </View>

        <View style={styles.pipContainer}>
          {cameraPermission?.granted && !isVideoOff ? (
            <CameraView
              style={styles.pipCamera}
              facing={cameraFacing}
            />
          ) : (
            <View style={styles.pipOff}>
              <Avatar initials="YO" color={C.blue} size={42} />
              <Text style={styles.pipOffText}>
                {isVideoOff ? 'Camera Off' : 'No Camera'}
              </Text>
            </View>
          )}

          <View style={styles.pipFooter}>
            <Text style={styles.pipLabel}>You</Text>
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={13}
              color={isMuted ? C.danger : C.success}
            />
          </View>

          <TouchableOpacity
            style={styles.flipBtn}
            onPress={handleFlipCamera}
            activeOpacity={0.85}
          >
            <Ionicons name="camera-reverse-outline" size={17} color={C.white} />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.topBar, { opacity: controlsOpacity }]}>
          <TouchableOpacity
            style={styles.topBackBtn}
            onPress={() => setShowEndConfirm(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-down" size={22} color={C.white} />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>

            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={14} color={C.white} />
              <Text style={styles.timerText}>{formatTime(sessionTime)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.recordBtn,
              isRecording && styles.recordBtnActive,
            ]}
            activeOpacity={0.85}
            onPress={() => {
              setIsRecording(prev => {
                showToast(prev ? 'Recording stopped' : 'Recording started');
                return !prev;
              });
              resetHideTimer();
            }}
          >
            <Ionicons
              name={isRecording ? 'radio-button-on' : 'radio-button-off'}
              size={21}
              color={isRecording ? C.danger : C.white}
            />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[styles.sessionInfoBar, { opacity: controlsOpacity }]}
        >
          <Text style={styles.sessionTitle} numberOfLines={1}>
            {session.topic || session.subject}
          </Text>
          <Text style={styles.sessionSub} numberOfLines={1}>
            {session.meetingId} • {micBlockedText}
          </Text>
        </Animated.View>

        <Animated.View
          style={[styles.controlsBar, { opacity: controlsOpacity }]}
        >
          {renderControlButton({
            label: isMuted ? 'Unmute' : 'Mute',
            icon: isMuted ? 'mic-off' : 'mic-outline',
            active: isMuted,
            onPress: handleMute,
          })}

          {renderControlButton({
            label: isVideoOff ? 'Start Video' : 'Video',
            icon: isVideoOff ? 'videocam-off-outline' : 'videocam-outline',
            active: isVideoOff,
            onPress: handleVideo,
          })}

          {renderControlButton({
            label: 'Chat',
            icon: 'chatbubble-outline',
            badge: unreadCount,
            onPress: handleChatOpen,
          })}

          {renderControlButton({
            label: 'Share',
            icon: 'share-social-outline',
            onPress: () => setShowShareModal(true),
          })}

          {renderControlButton({
            label: 'People',
            icon: 'users',
            iconType: 'font',
            onPress: () => setShowParticipants(true),
          })}

          {renderControlButton({
            label: 'More',
            icon: 'ellipsis-horizontal',
            onPress: () => setShowMore(true),
          })}

          {renderControlButton({
            label: 'Leave',
            icon: 'phone-hangup',
            iconType: 'material',
            danger: true,
            onPress: () => setShowEndConfirm(true),
          })}
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>

      <Modal
        visible={showChat}
        animationType="slide"
        transparent
        onRequestClose={() => setShowChat(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView style={styles.keyboardSheetWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Class Chat</Text>
                <Text style={styles.modalSub}>Ask doubts and view shared notes</Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowChat(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={C.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={chatScrollRef}
              style={styles.chatList}
              contentContainerStyle={styles.chatContent}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() =>
                chatScrollRef.current?.scrollToEnd?.({ animated: true })
              }
            >
              {messages.map(renderMessage)}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type your message..."
                placeholderTextColor={C.lightMuted}
                value={newMessage}
                onChangeText={text => {
                  setNewMessage(text);
                  sendTypingState(text.trim().length > 0);
                }}
                onBlur={() => sendTypingState(false)}
                multiline
                returnKeyType="send"
                onSubmitEditing={sendMessage}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  !newMessage.trim() && styles.sendBtnDisabled,
                ]}
                onPress={sendMessage}
                activeOpacity={0.85}
                disabled={!newMessage.trim()}
              >
                <Ionicons name="send" size={19} color={C.white} />
              </TouchableOpacity>
            </View>
          </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        visible={showParticipants}
        animationType="slide"
        transparent
        onRequestClose={() => setShowParticipants(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Participants ({participants.length})
                </Text>
                <Text style={styles.modalSub}>Tutor and student list</Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowParticipants(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={C.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={participants}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.participantList}
              renderItem={({ item }) => (
                <View style={styles.participantRow}>
                  <Avatar
                    initials={item.initials}
                    color={item.color}
                    size={46}
                  />

                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>
                      {item.name} {item.isMe ? '(You)' : ''}
                    </Text>
                    <Text style={styles.participantRole}>{item.role}</Text>
                  </View>

                  <View style={styles.participantIcons}>
                    <Ionicons
                      name={item.muted ? 'mic-off' : 'mic-outline'}
                      size={18}
                      color={item.muted ? C.danger : C.success}
                    />
                    <Ionicons
                      name={
                        item.videoOff
                          ? 'videocam-off-outline'
                          : 'videocam-outline'
                      }
                      size={18}
                      color={item.videoOff ? C.danger : C.success}
                      style={{ marginLeft: 12 }}
                    />
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showShareModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, styles.smallSheet]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Share Session</Text>
                <Text style={styles.modalSub}>Share live class details</Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowShareModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={C.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.shareBody}>
              <View style={styles.shareCard}>
                <Ionicons name="link-outline" size={22} color={C.primary} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.shareTitle}>Meeting ID</Text>
                  <Text style={styles.shareText}>
                    {session.meetingId || 'CLS-SESSION'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primarySheetBtn}
                onPress={() => {
                  setShowShareModal(false);
                  handleShare();
                }}
              >
                <Ionicons name="share-social-outline" size={20} color={C.white} />
                <Text style={styles.primarySheetBtnText}>Share Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMore}
        animationType="slide"
        transparent
        onRequestClose={() => setShowMore(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, styles.moreSheet]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>More Options</Text>
                <Text style={styles.modalSub}>Student tools</Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowMore(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={C.text} />
              </TouchableOpacity>
            </View>

            {[
              {
                label: 'Open Whiteboard',
                sub: 'Draw and share your doubt',
                icon: 'draw',
                type: 'material',
                action: () => {
                  setShowMore(false);
                  setShowWhiteboard(true);
                },
              },
              {
                label: 'Class Information',
                sub: `${session.subject} • ${session.time}`,
                icon: 'information-circle-outline',
                type: 'ion',
                action: () => {
                  setShowMore(false);
                  showToast('Class information loaded');
                },
              },
              {
                label: isRecording ? 'Stop Recording' : 'Start Recording',
                sub: 'Local recording indicator',
                icon: isRecording ? 'stop-circle-outline' : 'radio-button-on',
                type: 'ion',
                action: () => {
                  setShowMore(false);
                  setIsRecording(prev => !prev);
                  showToast(isRecording ? 'Recording stopped' : 'Recording started');
                },
              },
              {
                label: 'Report Issue',
                sub: 'Send issue to support',
                icon: 'flag-outline',
                type: 'ion',
                action: () => {
                  setShowMore(false);
                  showToast('Issue reported');
                },
              },
            ].map(item => (
              <TouchableOpacity
                key={item.label}
                style={styles.moreOption}
                activeOpacity={0.85}
                onPress={item.action}
              >
                <View style={styles.moreIconBox}>
                  {item.type === 'material' ? (
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={22}
                      color={C.primary}
                    />
                  ) : (
                    <Ionicons name={item.icon} size={22} color={C.primary} />
                  )}
                </View>

                <View style={styles.moreTextWrap}>
                  <Text style={styles.moreTitle}>{item.label}</Text>
                  <Text style={styles.moreSub}>{item.sub}</Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color={C.lightMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showWhiteboard}
        animationType="slide"
        onRequestClose={() => setShowWhiteboard(false)}
      >
        <SafeAreaView style={styles.whiteboardContainer}>
          <StatusBar barStyle="dark-content" backgroundColor={C.white} />

          <View style={styles.whiteboardHeader}>
            <TouchableOpacity
              style={styles.whiteboardIconBtn}
              onPress={() => setShowWhiteboard(false)}
            >
              <Ionicons name="close" size={22} color={C.text} />
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.whiteboardTitle}>Student Whiteboard</Text>
              <Text style={styles.whiteboardSub}>
                Write your doubt and share in chat
              </Text>
            </View>

            <TouchableOpacity
              style={styles.whiteboardIconBtn}
              onPress={() => setWhiteboardStrokes([])}
            >
              <Ionicons name="trash-outline" size={21} color={C.danger} />
            </TouchableOpacity>
          </View>

          <View style={styles.whiteboardTools}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.whiteboardToolsScroll}
            >
              <TouchableOpacity
                style={[styles.toolBtn, whiteboardTool === 'pen' && styles.toolBtnActive]}
                onPress={() => setWhiteboardTool('pen')}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={17}
                  color={whiteboardTool === 'pen' ? C.white : C.primary}
                />
                <Text style={[styles.toolText, whiteboardTool === 'pen' && styles.toolTextActive]}>
                  Pen
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolBtn, whiteboardTool === 'eraser' && styles.toolBtnActive]}
                onPress={() => setWhiteboardTool('eraser')}
              >
                <MaterialCommunityIcons
                  name="eraser"
                  size={17}
                  color={whiteboardTool === 'eraser' ? C.white : C.primary}
                />
                <Text style={[styles.toolText, whiteboardTool === 'eraser' && styles.toolTextActive]}>
                  Eraser
                </Text>
              </TouchableOpacity>

              {[5, 8, 12].map(size => (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeBtn, whiteboardSize === size && styles.sizeBtnActive]}
                  onPress={() => setWhiteboardSize(size)}
                >
                  <View
                    style={{
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      backgroundColor: whiteboardSize === size ? C.white : C.primary,
                    }}
                  />
                </TouchableOpacity>
              ))}

              {['#078C80', '#07123A', '#EF4444', '#2563EB', '#F59E0B'].map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorBtn,
                    { backgroundColor: color },
                    whiteboardColor === color && styles.colorBtnSelected,
                  ]}
                  onPress={() => {
                    setWhiteboardColor(color);
                    setWhiteboardTool('pen');
                  }}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.whiteboardCanvasWrapper}>
            <View
              style={styles.whiteboardCanvas}
              collapsable={false}
              {...whiteboardResponder.panHandlers}
            >
              {whiteboardStrokes.length === 0 ? (
                <View pointerEvents="none" style={styles.whiteboardPlaceholder}>
                  <MaterialCommunityIcons name="draw" size={48} color="#D3DCE7" />
                  <Text style={styles.whiteboardPlaceholderTitle}>
                    Write here using your finger
                  </Text>
                  <Text style={styles.whiteboardPlaceholderSub}>
                    Smooth writing fixed. Lines will not cut.
                  </Text>
                </View>
              ) : null}

              {whiteboardStrokes.map(stroke => (
                <View key={stroke.id} pointerEvents="none">
                  {renderStroke(stroke)}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.whiteboardFooter}>
            <TouchableOpacity
              style={styles.shareBoardBtn}
              onPress={shareBoardToChat}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={C.white} />
              <Text style={styles.shareBoardText}>Share in Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBoardBtn}
              onPress={() => setShowWhiteboard(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.closeBoardText}>Back to Class</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showEndConfirm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowEndConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <View style={styles.confirmIconWrap}>
              <MaterialCommunityIcons name="phone-hangup" size={31} color={C.white} />
            </View>

            <Text style={styles.confirmTitle}>Leave Session?</Text>
            <Text style={styles.confirmText}>
              Your live class will close on this device.
            </Text>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                Time spent: {formatTime(sessionTime)}
              </Text>
              <Text style={styles.summaryText}>
                Tutor: {session.tutor}
              </Text>
            </View>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.stayBtn}
                onPress={() => setShowEndConfirm(false)}
              >
                <Text style={styles.stayBtnText}>Stay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.leaveBtn}
                onPress={confirmEndSession}
              >
                <Text style={styles.leaveBtnText}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.black,
  },

  videoArea: {
    flex: 1,
    backgroundColor: C.bgDark,
  },

  remoteVideo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgDark,
  },

  remoteGlow: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(7,140,128,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: C.white,
    fontWeight: '900',
  },

  remoteName: {
    marginTop: 18,
    color: C.white,
    fontSize: 22,
    fontWeight: '900',
  },

  remoteRole: {
    marginTop: 5,
    color: '#B6C2D2',
    fontSize: 13,
    fontWeight: '700',
  },

  speakingPill: {
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22,163,74,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.25)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  speakingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.success,
    marginRight: 7,
  },

  speakingText: {
    color: '#BBF7D0',
    fontSize: 12,
    fontWeight: '800',
  },

  pipContainer: {
    position: 'absolute',
    top: 88,
    right: 14,
    width: 116,
    height: 158,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: C.primary,
  },

  pipCamera: {
    flex: 1,
  },

  pipOff: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pipOffText: {
    marginTop: 8,
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '800',
  },

  pipFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  pipLabel: {
    color: C.white,
    fontSize: 11,
    fontWeight: '900',
  },

  flipBtn: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.42)',
  },

  topBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topCenter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.danger,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 8,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.white,
    marginRight: 6,
  },

  liveText: {
    color: C.white,
    fontSize: 11,
    fontWeight: '900',
  },

  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  timerText: {
    marginLeft: 5,
    color: C.white,
    fontSize: 12,
    fontWeight: '900',
  },

  recordBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  recordBtnActive: {
    backgroundColor: 'rgba(239,68,68,0.18)',
  },

  sessionInfoBar: {
    position: 'absolute',
    left: 16,
    right: 142,
    top: 76,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  sessionTitle: {
    color: C.white,
    fontSize: 13,
    fontWeight: '900',
  },

  sessionSub: {
    marginTop: 3,
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },

  controlsBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 7,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: 'rgba(0,0,0,0.82)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  controlBtn: {
    minWidth: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },

  controlBtnActive: {
    opacity: 0.72,
  },

  controlDangerBtn: {
    backgroundColor: C.danger,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  controlLabel: {
    marginTop: 4,
    color: C.white,
    fontSize: 9,
    fontWeight: '800',
  },

  badge: {
    position: 'absolute',
    top: -7,
    right: -9,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: C.black,
  },

  badgeText: {
    color: C.white,
    fontSize: 9,
    fontWeight: '900',
  },

  toast: {
    position: 'absolute',
    bottom: 106,
    alignSelf: 'center',
    backgroundColor: 'rgba(15,23,42,0.92)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },

  toastText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'flex-end',
  },

  modalSheet: {
    maxHeight: SCREEN_HEIGHT * 0.86,
    minHeight: 360,
    backgroundColor: C.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
  },
  keyboardSheetWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },

  smallSheet: {
    minHeight: 300,
    maxHeight: SCREEN_HEIGHT * 0.46,
  },

  moreSheet: {
    minHeight: 450,
    maxHeight: SCREEN_HEIGHT * 0.68,
  },

  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.softBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalTitle: {
    fontSize: 18,
    color: C.text,
    fontWeight: '900',
  },

  modalSub: {
    marginTop: 2,
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
  },

  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.softBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chatList: {
    flex: 1,
  },

  chatContent: {
    padding: 14,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 13,
  },

  messageRowMe: {
    justifyContent: 'flex-end',
  },

  messageRowOther: {
    justifyContent: 'flex-start',
  },

  messageBubble: {
    maxWidth: '75%',
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  messageBubbleMe: {
    backgroundColor: C.primary,
    borderBottomRightRadius: 5,
  },

  messageBubbleOther: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 5,
    marginLeft: 8,
  },

  messageSender: {
    marginBottom: 3,
    fontSize: 11,
    color: C.primary,
    fontWeight: '900',
  },

  messageText: {
    color: C.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  messageTextMe: {
    color: C.white,
  },

  messageTime: {
    alignSelf: 'flex-end',
    marginTop: 5,
    fontSize: 10,
    color: C.lightMuted,
    fontWeight: '700',
  },

  messageTimeMe: {
    color: 'rgba(255,255,255,0.74)',
  },

  chatInputRow: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 12,
    borderTopWidth: 1,
    borderTopColor: C.softBorder,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  chatInput: {
    flex: 1,
    maxHeight: 110,
    minHeight: 44,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: C.text,
    fontSize: 14,
    fontWeight: '600',
    textAlignVertical: 'top',
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 17,
    marginLeft: 9,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },

  chatWhiteboardPreview: {
    marginTop: 8,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE6EF',
    overflow: 'hidden',
    width: 210,
  },

  chatWhiteboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },

  chatWhiteboardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: C.primary,
    marginLeft: 6,
  },

  chatWhiteboardCanvas: {
    height: 120,
    backgroundColor: C.white,
    position: 'relative',
  },

  chatWhiteboardEmpty: {
    color: C.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 45,
  },

  participantList: {
    padding: 16,
  },

  participantRow: {
    minHeight: 68,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.softBorder,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },

  participantName: {
    fontSize: 15,
    color: C.text,
    fontWeight: '900',
  },

  participantRole: {
    marginTop: 3,
    fontSize: 12,
    color: C.muted,
    fontWeight: '700',
  },

  participantIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  shareBody: {
    padding: 16,
  },

  shareCard: {
    minHeight: 68,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.softBorder,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  shareTitle: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '800',
  },

  shareText: {
    marginTop: 2,
    fontSize: 14,
    color: C.text,
    fontWeight: '900',
  },

  primarySheetBtn: {
    marginTop: 16,
    height: 52,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  primarySheetBtnText: {
    marginLeft: 8,
    color: C.white,
    fontSize: 15,
    fontWeight: '900',
  },

  moreOption: {
    marginHorizontal: 16,
    marginBottom: 10,
    minHeight: 72,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.softBorder,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  moreIconBox: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  moreTextWrap: {
    flex: 1,
  },

  moreTitle: {
    fontSize: 14,
    color: C.text,
    fontWeight: '900',
  },

  moreSub: {
    marginTop: 3,
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
  },

  whiteboardContainer: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },

  whiteboardHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.softBorder,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
  },

  whiteboardIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.softBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  whiteboardTitle: {
    fontSize: 17,
    color: C.text,
    fontWeight: '900',
  },

  whiteboardSub: {
    marginTop: 2,
    fontSize: 11,
    color: C.muted,
    fontWeight: '600',
  },

  whiteboardTools: {
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.softBorder,
  },

  whiteboardToolsScroll: {
    padding: 12,
    alignItems: 'center',
  },

  toolBtn: {
    height: 38,
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: C.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },

  toolBtnActive: {
    backgroundColor: C.primary,
  },

  toolText: {
    marginLeft: 5,
    color: C.primary,
    fontSize: 12,
    fontWeight: '900',
  },

  toolTextActive: {
    color: C.white,
  },

  sizeBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  sizeBtnActive: {
    backgroundColor: C.primary,
  },

  colorBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 2,
    borderColor: C.white,
  },

  colorBtnSelected: {
    borderColor: C.black,
  },

  whiteboardCanvasWrapper: {
    flex: 1,
    padding: 12,
  },

  whiteboardCanvas: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    overflow: 'hidden',
    position: 'relative',
  },

  whiteboardPlaceholder: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '38%',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  whiteboardPlaceholderTitle: {
    marginTop: 12,
    color: C.text,
    fontSize: 16,
    fontWeight: '900',
  },

  whiteboardPlaceholderSub: {
    marginTop: 5,
    color: C.lightMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  whiteboardFooter: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.softBorder,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },

  shareBoardBtn: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginRight: 8,
  },

  shareBoardText: {
    marginLeft: 7,
    color: C.white,
    fontSize: 13,
    fontWeight: '900',
  },

  closeBoardBtn: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BEEBE6',
  },

  closeBoardText: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '900',
  },

  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  confirmBox: {
    width: '100%',
    borderRadius: 26,
    backgroundColor: C.white,
    padding: 24,
    alignItems: 'center',
  },

  confirmIconWrap: {
    width: 66,
    height: 66,
    borderRadius: 24,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  confirmTitle: {
    fontSize: 21,
    color: C.text,
    fontWeight: '900',
  },

  confirmText: {
    marginTop: 7,
    color: C.muted,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },

  summaryBox: {
    width: '100%',
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.softBorder,
    padding: 14,
  },

  summaryText: {
    color: C.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 5,
  },

  confirmActions: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
  },

  stayBtn: {
    flex: 1,
    height: 50,
    borderRadius: 17,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: '#BEEBE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  stayBtnText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '900',
  },

  leaveBtn: {
    flex: 1,
    height: 50,
    borderRadius: 17,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },

  leaveBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '900',
  },
});
