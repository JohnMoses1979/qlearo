

// screens/teacher/LiveSessionScreen.js
// FULLY UPDATED — Real AppContext session + real chat + whiteboard share + end session update

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
  Linking,
  PanResponder,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { useAppContext } from "../../context/AppContext";
import { useLiveSessionRoom } from '../../services/useLiveSessionRoom';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const IS_SMALL = SCREEN_WIDTH < 380;
const IS_TINY = SCREEN_WIDTH < 340;

const C = {
  primary: '#00796F',
  primaryDark: '#00534E',
  primaryLight: '#EAF8F6',
  white: '#FFFFFF',
  black: '#000000',
  bgDark: '#081114',
  text: '#07123A',
  muted: '#74819A',
  border: '#E2EAF4',
  red: '#E53935',
  green: '#22C55E',
  warning: '#F59E0B',
  blue: '#1565C0',
  purple: '#7C3AED',
};

const getCurrentTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const safeText = (value, fallback = '') => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
};

const formatTimer = seconds => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(
      2,
      '0'
    )}:${String(s).padStart(2, '0')}`;
  }

  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getInitials = name =>
  safeText(name, 'User')
    .split(' ')
    .filter(Boolean)
    .map(item => item[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

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

  const timeParts = splitTimeRange(merged.time || merged.requestedTime);

  const sessionId = safeText(merged.sessionId || merged.id, 'demo-session');

  const student = safeText(
    merged.student ||
      merged.studentName ||
      merged.name ||
      merged.learnerName,
    'Student'
  );

  const subject = safeText(merged.subject, 'General');
  const topic = safeText(merged.topic, 'Class Topic');

  const timeStart = safeText(merged.timeStart || timeParts.timeStart, 'Flexible');
  const timeEnd = safeText(merged.timeEnd || timeParts.timeEnd, '');

  return {
    ...merged,
    id: safeText(merged.id || sessionId, sessionId),
    sessionId,
    student,
    studentName: safeText(merged.studentName || student, student),
    subject,
    topic,
    focus: safeText(
      merged.focus || merged.note || merged.description,
      'Live online learning session'
    ),
    className: safeText(merged.className || merged.class, 'Class not added'),
    timeStart,
    timeEnd,
    time: merged.time || (timeEnd ? `${timeStart} - ${timeEnd}` : timeStart),
    duration: safeText(merged.duration, '1 Hour'),
    date: safeText(merged.date, 'Today'),
    rawDate: merged.rawDate || merged.date || merged.createdAt || new Date().toISOString(),
    avatar: merged.avatar || merged.studentAvatar || merged.studentPhoto || null,
    meetingId: safeText(merged.meetingId, `CLS-${sessionId.slice(-6).toUpperCase()}`),
    language: safeText(merged.language, 'English'),
    level: safeText(merged.level, 'Intermediate'),
  };
};

const Avatar = ({ initials, color, size = 60, style }) => (
  <View
    style={[
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        justifyContent: 'center',
        alignItems: 'center',
      },
      style,
    ]}
  >
    <Text style={{ color: C.white, fontWeight: '900', fontSize: size * 0.34 }}>
      {initials}
    </Text>
  </View>
);

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
        <MaterialCommunityIcons name="draw" size={17} color={C.primary} />
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

export default function LiveSessionScreen({ navigation, route }) {
  const {
    getSessionById,
    getSessionMessages,
    endSession,
    completeSession,
    currentUser,
  } = useAppContext();

  const params = route?.params || {};
  const paramSessionId = params.sessionId || params.session?.id || params.session?.sessionId;

  const contextSession = useMemo(() => {
    if (typeof getSessionById === 'function' && paramSessionId) {
      return getSessionById(paramSessionId);
    }

    return null;
  }, [getSessionById, paramSessionId]);

  const session = useMemo(
    () => normalizeSession(params, contextSession),
    [params, contextSession]
  );

  const sessionId = session.id;
  const student = session.student;
  const subject = session.subject;
  const topic = session.topic;
  const focus = session.focus;
  const timeStart = session.timeStart;
  const timeEnd = session.timeEnd;
  const duration = session.duration;

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
              id: 'welcome-1',
              senderId: session.studentId || 'student-real',
              sender: student,
              senderName: student,
              senderRole: 'student',
              text: `Welcome to the ${subject} live class. Today we will cover ${topic}.`,
              time: timeStart,
              createdAt: new Date().toISOString(),
              isMe: false,
              type: 'text',
            },
            {
              id: 'welcome-2',
              senderId: currentUser?.id || 'teacher-me',
              sender: currentUser?.name || 'You',
              senderName: currentUser?.name || 'You',
              senderRole: 'teacher',
              text: 'Hello, the teacher joined the class.',
              time: getCurrentTime(),
              createdAt: new Date().toISOString(),
              isMe: true,
              type: 'text',
            },
          ],
    fallbackRole: 'teacher',
  });

  const {
    messages,
    sendEvent,
    shareWhiteboard,
    sendTypingState,
  } = liveRoom;

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMicPermission, setHasMicPermission] = useState(null);

  const [cameraFacing, setCameraFacing] = useState('front');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const [students, setStudents] = useState(() => [
    {
      id: 'student-real',
      name: student,
      role: 'Student',
      initials: getInitials(student),
      color: C.primary,
      muted: false,
      videoOff: false,
    },
    {
      id: 'teacher-me',
      name: currentUser?.name || 'You',
      role: 'Teacher',
      initials: getInitials(currentUser?.name || 'You'),
      color: C.blue,
      muted: false,
      videoOff: false,
      isMe: true,
    },
  ]);

  const [toastMsg, setToastMsg] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsVisible = useRef(true);
  const hideTimer = useRef(null);
  const chatScrollRef = useRef(null);
  const cameraRef = useRef(null);

  const [reportText, setReportText] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [autoHideControls, setAutoHideControls] = useState(true);

  const [whiteboardTool, setWhiteboardTool] = useState('pen');
  const [whiteboardColor, setWhiteboardColor] = useState('#07123A');
  const [whiteboardSize, setWhiteboardSize] = useState(7);
  const [whiteboardStrokes, setWhiteboardStrokes] = useState([]);

  const activeStrokeIdRef = useRef(null);
  const lastPointRef = useRef(null);
  const lastMessageCountRef = useRef(messages.length);
  const unreadHydratedRef = useRef(false);

  const remoteStudent = students.find(item => !item.isMe) || students[0];

  const shareLink = useMemo(() => {
    return `https://liveclass.app/session/${sessionId}`;
  }, [sessionId]);

  useEffect(() => {
    setStudents(prev => {
      const teacher = prev.find(item => item.isMe) || {
        id: 'teacher-me',
        name: currentUser?.name || 'You',
        role: 'Teacher',
        initials: getInitials(currentUser?.name || 'You'),
        color: C.blue,
        muted: isMuted,
        videoOff: isVideoOff,
        isMe: true,
      };

      return [
        {
          id: session.studentId || 'student-real',
          name: student,
          role: 'Student',
          initials: getInitials(student),
          color: C.primary,
          muted: false,
          videoOff: false,
        },
        {
          ...teacher,
          name: currentUser?.name || 'You',
          initials: getInitials(currentUser?.name || 'You'),
          muted: isMuted,
          videoOff: isVideoOff,
        },
      ];
    });
  }, [student, session.studentId, currentUser?.name, isMuted, isVideoOff]);

  useEffect(() => {
    const askPermissions = async () => {
      try {
        if (!cameraPermission?.granted) {
          await requestCameraPermission();
        }

        const micStatus = await Audio.requestPermissionsAsync();
        setHasMicPermission(micStatus.status === 'granted');
      } catch (error) {
        setHasMicPermission(false);
      }
    };

    askPermissions();
  }, [cameraPermission?.granted, requestCameraPermission]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (autoHideControls) {
      resetHideTimer();
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [autoHideControls]);

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
      const newUnread = newMessages.filter(msg => !msg.isMe).length;

      if (newUnread > 0) {
        setUnreadCount(prev => prev + newUnread);
      }
    }

    lastMessageCountRef.current = nextCount;
  }, [messages, showChat]);

  const showToast = msg => {
    setToastMsg(msg);

    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(1300),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetHideTimer = () => {
    if (!autoHideControls) return;

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
    }, 4500);
  };

  const keepControlsVisible = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);

    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 160,
      useNativeDriver: true,
    }).start();

    controlsVisible.current = true;
  };

  const handleMute = () => {
    const nextValue = !isMuted;
    setIsMuted(nextValue);

    setStudents(prev =>
      prev.map(item => (item.isMe ? { ...item, muted: nextValue } : item))
    );

    showToast(nextValue ? 'Microphone muted' : 'Microphone unmuted');
    resetHideTimer();
  };

  const handleVideo = () => {
    const nextValue = !isVideoOff;
    setIsVideoOff(nextValue);

    setStudents(prev =>
      prev.map(item => (item.isMe ? { ...item, videoOff: nextValue } : item))
    );

    showToast(nextValue ? 'Camera turned off' : 'Camera turned on');
    resetHideTimer();
  };

  const handleFlipCamera = () => {
    setCameraFacing(prev => (prev === 'front' ? 'back' : 'front'));
    showToast('Camera switched');
    resetHideTimer();
  };

  const handleRecording = () => {
    const nextValue = !isRecording;
    setIsRecording(nextValue);
    showToast(nextValue ? 'Recording started' : 'Recording stopped');
    resetHideTimer();
  };

  const handleChat = () => {
    setShowChat(true);
    setUnreadCount(0);
    keepControlsVisible();
  };

  const handleParticipants = () => {
    setShowParticipants(true);
    keepControlsVisible();
  };

  const handleMore = () => {
    setShowMore(true);
    keepControlsVisible();
  };

  const handleShare = () => {
    setShowShareModal(true);
    keepControlsVisible();
  };

  const handleEnd = () => {
    setShowEndConfirm(true);
    keepControlsVisible();
  };

  const confirmEnd = () => {
    if (typeof endSession === 'function') {
      endSession(sessionId);
    }

    if (typeof completeSession === 'function') {
      completeSession(sessionId, {
        durationCompleted: formatTimer(sessionTime),
      });
    }

    setShowEndConfirm(false);

    navigation?.navigate?.('TeacherSchedule');
  };

  const sendMessage = () => {
    const cleanText = newMessage.trim();
    if (!cleanText) return;

    sendEvent({
      type: 'chat',
      text: cleanText,
    });

    setNewMessage('');
    sendTypingState(false);
  };

  const handleMuteAll = () => {
    setStudents(prev => prev.map(item => (item.isMe ? item : { ...item, muted: true })));
    setShowMore(false);
    showToast('All students muted');
  };

  const handleShareAction = label => {
    const shareMessage = `Join my live class on ${subject} • ${topic}\nMeeting ID: ${session.meetingId}\nLink: ${shareLink}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;

    setShowShareModal(false);

    if (label === 'WhatsApp') {
      Linking.canOpenURL(whatsappUrl)
        .then(canOpen => {
          if (canOpen) {
            return Linking.openURL(whatsappUrl);
          }

          return Share.share({
            message: shareMessage,
            url: shareLink,
          });
        })
        .catch(() =>
          Share.share({
            message: shareMessage,
            url: shareLink,
          })
        );
      return;
    }

    Share.share({
      message: shareMessage,
      url: shareLink,
    }).catch(() => {});
  };

  const submitReport = () => {
    setReportText('');
    setShowReportModal(false);
    showToast('Issue report submitted');
  };

  const openWhiteboard = () => {
    setShowMore(false);
    setShowWhiteboard(true);
    showToast('Whiteboard opened');
  };

  const undoWhiteboard = () => {
    setWhiteboardStrokes(prev => prev.slice(0, -1));
  };

  const clearWhiteboard = () => {
    setWhiteboardStrokes([]);
    showToast('Whiteboard cleared');
  };

  const shareBoardToChat = () => {
    if (whiteboardStrokes.length === 0) {
      showToast('Write something before sharing');
      return;
    }

    const copiedStrokes = JSON.parse(JSON.stringify(whiteboardStrokes));

    shareWhiteboard({
      title: 'Whiteboard shared with students',
      strokes: copiedStrokes,
      sender: currentUser?.name || 'You',
      senderRole: 'teacher',
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

        onPanResponderGrant: evt => {
          const { locationX, locationY } = evt.nativeEvent;

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

        onPanResponderMove: evt => {
          const { locationX, locationY } = evt.nativeEvent;
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

  const ControlButton = ({ icon, label, onPress, active, end, badge, family }) => (
    <TouchableOpacity
      style={[styles.ctrlBtn, active && styles.ctrlBtnActive, end && styles.endBtn]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View>
        {family === 'MaterialCommunityIcons' ? (
          <MaterialCommunityIcons name={icon} size={22} color={C.white} />
        ) : family === 'FontAwesome5' ? (
          <FontAwesome5 name={icon} size={18} color={C.white} />
        ) : (
          <Ionicons name={icon} size={22} color={C.white} />
        )}

        {badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>

      <Text style={styles.ctrlLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const SheetHeader = ({ title, subtitle, onClose }) => (
    <View style={styles.modalHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.modalTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.modalSub}>{subtitle}</Text>}
      </View>

      <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.8}>
        <Ionicons name="close" size={20} color={C.text} />
      </TouchableOpacity>
    </View>
  );

  const MoreOption = ({ icon, family, title, subtitle, onPress, danger }) => (
    <TouchableOpacity style={styles.moreOption} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.moreIconBox, danger && styles.moreIconDanger]}>
        {family === 'MaterialCommunityIcons' ? (
          <MaterialCommunityIcons name={icon} size={21} color={danger ? C.red : C.primary} />
        ) : family === 'FontAwesome5' ? (
          <FontAwesome5 name={icon} size={18} color={danger ? C.red : C.primary} />
        ) : (
          <Ionicons name={icon} size={21} color={danger ? C.red : C.primary} />
        )}
      </View>

      <View style={styles.moreTextBox}>
        <Text style={[styles.moreTitle, danger && { color: C.red }]}>{title}</Text>
        {!!subtitle && <Text style={styles.moreSubtitle}>{subtitle}</Text>}
      </View>

      <Ionicons name="chevron-forward" size={18} color="#B8C1CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.black} />

      <TouchableOpacity activeOpacity={1} style={styles.videoArea} onPress={resetHideTimer}>
        <View style={styles.remoteVideo}>
          <View style={styles.remoteGlow}>
            <Avatar initials={remoteStudent.initials} color={remoteStudent.color} size={105} />
          </View>

          <Text style={styles.remoteNameLabel}>{remoteStudent.name}</Text>

          <View style={styles.remoteStatusPill}>
            <View style={styles.speakingDot} />
            <Text style={styles.remoteStatusText}>
              {remoteStudent.muted ? 'Muted' : 'Student Connected'}
            </Text>
          </View>

          <Text style={styles.classTitle} numberOfLines={1}>
            {subject} • {topic}
          </Text>
        </View>

        <View style={styles.pipContainer}>
          {cameraPermission?.granted && !isVideoOff ? (
            <CameraView ref={cameraRef} style={styles.pipCamera} facing={cameraFacing} />
          ) : (
            <View style={styles.pipOff}>
              <Avatar initials="YO" color={C.blue} size={42} />
              <Text style={styles.pipOffText}>
                {cameraPermission?.granted ? 'Camera off' : 'No access'}
              </Text>
            </View>
          )}

          <View style={styles.pipBottomBar}>
            <Text style={styles.pipLabel}>You</Text>
            {isMuted && <Ionicons name="mic-off" size={13} color={C.white} />}
          </View>

          <TouchableOpacity style={styles.flipBtn} onPress={handleFlipCamera} activeOpacity={0.8}>
            <Ionicons name="camera-reverse-outline" size={16} color={C.white} />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.topBar, { opacity: controlsOpacity }]}>
          <TouchableOpacity
            style={styles.liveBadge}
            activeOpacity={0.85}
            onPress={handleEnd}
            accessibilityRole="button"
            accessibilityLabel="End live session"
          >
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </TouchableOpacity>

          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={14} color={C.white} />
            <Text style={styles.timerText}>{formatTimer(sessionTime)}</Text>
          </View>

          <View style={styles.topRight}>
            <TouchableOpacity style={styles.topIconBtn} onPress={handleFlipCamera}>
              <Ionicons name="camera-reverse-outline" size={19} color={C.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.topIconBtn, isRecording && styles.recordingActive]}
              onPress={handleRecording}
            >
              <Ionicons
                name={isRecording ? 'radio-button-on' : 'radio-button-off'}
                size={19}
                color={isRecording ? C.red : C.white}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.controlsBar, { opacity: controlsOpacity }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.controlsScroll}
          >
            <ControlButton
              icon={isMuted ? 'mic-off' : 'mic-outline'}
              label={isMuted ? 'Unmute' : 'Mute'}
              active={isMuted}
              onPress={handleMute}
            />

            <ControlButton
              icon={isVideoOff ? 'videocam-off-outline' : 'videocam-outline'}
              label={isVideoOff ? 'Video On' : 'Video'}
              active={isVideoOff}
              onPress={handleVideo}
            />

            <ControlButton
              icon="chatbubble-outline"
              label="Chat"
              badge={unreadCount}
              onPress={handleChat}
            />

            <ControlButton icon="share-social-outline" label="Share" onPress={handleShare} />

            <ControlButton
              icon="users"
              label="Students"
              family="FontAwesome5"
              onPress={handleParticipants}
            />

            <ControlButton icon="ellipsis-horizontal" label="More" onPress={handleMore} />

            <ControlButton
              icon="phone-hangup"
              label="End"
              family="MaterialCommunityIcons"
              end
              onPress={handleEnd}
            />
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>

      <Modal visible={showChat} animationType="slide" transparent onRequestClose={() => setShowChat(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView style={styles.keyboardSheetWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalSheet}>
            <SheetHeader
              title="Class Chat"
              subtitle={`${subject} • ${topic}`}
              onClose={() => setShowChat(false)}
            />

            <ScrollView
              ref={chatScrollRef}
              style={styles.chatList}
              contentContainerStyle={styles.chatContent}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => chatScrollRef.current?.scrollToEnd?.({ animated: true })}
            >
              {messages.map(msg => (
                <View
                  key={msg.id}
                  style={[styles.msgRow, msg.isMe ? styles.msgRowMe : styles.msgRowThem]}
                >
                  {!msg.isMe && (
                    <Avatar
                      initials={remoteStudent.initials}
                      color={remoteStudent.color}
                      size={30}
                      style={styles.chatAvatar}
                    />
                  )}

                  <View style={[styles.bubble, msg.isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    {!msg.isMe && <Text style={styles.bubbleSender}>{msg.sender}</Text>}

                    {msg.type === 'whiteboard' ? (
                      <>
                        <Text style={[styles.bubbleText, msg.isMe && styles.bubbleTextMe]}>
                          {msg.text}
                        </Text>
                        <WhiteboardPreview strokes={msg.strokes} />
                      </>
                    ) : (
                      <Text style={[styles.bubbleText, msg.isMe && styles.bubbleTextMe]}>
                        {msg.text}
                      </Text>
                    )}

                    <Text style={[styles.bubbleTime, msg.isMe && styles.bubbleTimeMe]}>
                      {msg.time}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type your message..."
                placeholderTextColor="#9AA6B8"
                value={newMessage}
                onChangeText={text => {
                  setNewMessage(text);
                  sendTypingState(text.trim().length > 0);
                }}
                onBlur={() => sendTypingState(false)}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.85}>
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
            <SheetHeader
              title={`Students (${students.length})`}
              subtitle="Live class participants"
              onClose={() => setShowParticipants(false)}
            />

            <FlatList
              data={students}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.participantList}
              renderItem={({ item }) => (
                <View style={styles.participantRow}>
                  <Avatar initials={item.initials} color={item.color} size={44} />

                  <View style={styles.participantTextBox}>
                    <Text style={styles.participantName}>
                      {item.name} {item.isMe ? '(You)' : ''}
                    </Text>
                    <Text style={styles.participantRole}>{item.role}</Text>
                  </View>

                  <View style={styles.participantIcons}>
                    <View style={styles.participantIconCircle}>
                      <Ionicons
                        name={item.muted ? 'mic-off' : 'mic-outline'}
                        size={17}
                        color={item.muted ? C.red : C.primary}
                      />
                    </View>

                    <View style={styles.participantIconCircle}>
                      <Ionicons
                        name={item.videoOff ? 'videocam-off-outline' : 'videocam-outline'}
                        size={17}
                        color={item.videoOff ? C.red : C.primary}
                      />
                    </View>
                  </View>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.participantDivider} />}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showMore} animationType="slide" transparent onRequestClose={() => setShowMore(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, styles.moreSheet]}>
            <SheetHeader
              title="More Tools"
              subtitle="Class tools and settings"
              onClose={() => setShowMore(false)}
            />

            <ScrollView contentContainerStyle={styles.moreContent}>
              <MoreOption
                icon="draw"
                family="MaterialCommunityIcons"
                title="Whiteboard"
                subtitle="Open board and explain to students"
                onPress={openWhiteboard}
              />

              <MoreOption
                icon="volume-mute-outline"
                title="Mute All Students"
                subtitle="Mute student microphones"
                onPress={handleMuteAll}
              />

              <MoreOption
                icon="information-circle-outline"
                title="Session Info"
                subtitle="View class details and duration"
                onPress={() => {
                  setShowMore(false);
                  setShowInfoModal(true);
                }}
              />

              <MoreOption
                icon="settings-outline"
                title="Settings"
                subtitle="Quality and control settings"
                onPress={() => {
                  setShowMore(false);
                  setShowSettingsModal(true);
                }}
              />

              <MoreOption
                icon="flag-outline"
                title="Report an Issue"
                subtitle="Submit class problem without alert popup"
                danger
                onPress={() => {
                  setShowMore(false);
                  setShowReportModal(true);
                }}
              />
            </ScrollView>
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
          <View style={[styles.modalSheet, styles.shareSheet]}>
            <SheetHeader
              title="Share Session"
              subtitle="Invite students to this live class"
              onClose={() => setShowShareModal(false)}
            />

            <View style={styles.shareContent}>
              <Text style={styles.inputLabel}>Session Link</Text>

              <View style={styles.shareLinkRow}>
                <Text style={styles.shareLink} numberOfLines={1}>
                  {shareLink}
                </Text>

                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => handleShareAction('Copy')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="copy-outline" size={18} color={C.primary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 20 }]}>Share Via</Text>

              <View style={styles.shareAppsRow}>
                {[
                  { label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
                  { label: 'Message', icon: 'chatbubble-outline', color: '#007AFF' },
                  { label: 'Email', icon: 'mail-outline', color: '#EA4335' },
                  { label: 'Copy', icon: 'link-outline', color: '#555555' },
                ].map(app => (
                  <TouchableOpacity
                    key={app.label}
                    style={styles.shareAppBtn}
                    onPress={() => handleShareAction(app.label)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.shareAppIcon, { backgroundColor: app.color }]}>
                      <Ionicons name={app.icon} size={21} color={C.white} />
                    </View>

                    <Text style={styles.shareAppLabel}>{app.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showWhiteboard}
        animationType="slide"
        onRequestClose={() => setShowWhiteboard(false)}
      >
        <SafeAreaView style={styles.whiteboardScreen}>
          <StatusBar barStyle="dark-content" backgroundColor={C.white} />

          <View style={styles.whiteboardHeader}>
            <TouchableOpacity
              style={styles.whiteboardBackBtn}
              onPress={() => setShowWhiteboard(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color={C.text} />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.whiteboardTitle}>Whiteboard</Text>
              <Text style={styles.whiteboardSubtitle} numberOfLines={1}>
                Draw and explain to students live
              </Text>
            </View>

            <TouchableOpacity style={styles.whiteboardActionBtn} onPress={undoWhiteboard}>
              <Ionicons name="arrow-undo-outline" size={19} color={C.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.whiteboardActionBtn} onPress={clearWhiteboard}>
              <Ionicons name="trash-outline" size={19} color={C.red} />
            </TouchableOpacity>
          </View>

          <View style={styles.whiteboardTools}>
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
              <Text
                style={[styles.toolText, whiteboardTool === 'eraser' && styles.toolTextActive]}
              >
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
          </View>

          <View style={styles.colorRow}>
            {['#07123A', '#00796F', '#E53935', '#1565C0', '#F59E0B', '#7C3AED'].map(color => (
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
          </View>

          <View style={styles.whiteboardCanvasWrapper}>
            <View
              style={styles.whiteboardCanvas}
              collapsable={false}
              {...whiteboardResponder.panHandlers}
            >
              {whiteboardStrokes.length === 0 && (
                <View pointerEvents="none" style={styles.whiteboardPlaceholder}>
                  <MaterialCommunityIcons name="draw" size={48} color="#D3DCE7" />
                  <Text style={styles.whiteboardPlaceholderTitle}>Start writing here</Text>
                  <Text style={styles.whiteboardPlaceholderSub}>
                    Smooth writing fixed. Lines will not cut.
                  </Text>
                </View>
              )}

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
              <Ionicons name="chatbubble-ellipses-outline" size={17} color={C.white} />
              <Text style={styles.shareBoardText}>Share to Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBoardBtn}
              onPress={() => setShowWhiteboard(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.closeBoardText}>Back to Live Class</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showInfoModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, styles.infoSheet]}>
            <SheetHeader
              title="Session Info"
              subtitle="Current live class details"
              onClose={() => setShowInfoModal(false)}
            />

            <View style={styles.infoContent}>
              {[
                ['Subject', subject],
                ['Topic', topic],
                ['Focus', focus],
                ['Time', timeEnd ? `${timeStart} - ${timeEnd}` : timeStart],
                ['Planned Duration', duration],
                ['Live Duration', formatTimer(sessionTime)],
                ['Students', `${students.filter(item => !item.isMe).length} students joined`],
                ['Meeting ID', session.meetingId],
              ].map(([label, value]) => (
                <View key={label} style={styles.infoModalRow}>
                  <Text style={styles.infoModalLabel}>{label}</Text>
                  <Text style={styles.infoModalValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSettingsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, styles.settingsSheet]}>
            <SheetHeader
              title="Settings"
              subtitle="Live class preferences"
              onClose={() => setShowSettingsModal(false)}
            />

            <View style={styles.settingsContent}>
              <Text style={styles.inputLabel}>Video Quality</Text>

              <View style={styles.qualityRow}>
                {['Auto', 'Low', 'HD'].map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.qualityBtn, selectedQuality === item && styles.qualityBtnActive]}
                    onPress={() => {
                      setSelectedQuality(item);
                      showToast(`Quality set to ${item}`);
                    }}
                  >
                    <Text
                      style={[
                        styles.qualityText,
                        selectedQuality === item && styles.qualityTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => {
                  setAutoHideControls(prev => !prev);

                  if (autoHideControls) {
                    keepControlsVisible();
                  }

                  showToast(!autoHideControls ? 'Auto-hide enabled' : 'Auto-hide disabled');
                }}
                activeOpacity={0.85}
              >
                <View>
                  <Text style={styles.settingTitle}>Auto-hide controls</Text>
                  <Text style={styles.settingSub}>Hide bottom buttons after few seconds</Text>
                </View>

                <View style={[styles.switchBox, autoHideControls && styles.switchBoxOn]}>
                  <View style={[styles.switchDot, autoHideControls && styles.switchDotOn]} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showReportModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, styles.reportSheet]}>
            <SheetHeader
              title="Report Issue"
              subtitle="Tell us what problem happened"
              onClose={() => setShowReportModal(false)}
            />

            <View style={styles.reportContent}>
              <Text style={styles.inputLabel}>Issue Details</Text>

              <TextInput
                style={styles.reportInput}
                placeholder="Example: Audio not clear, video stuck, student cannot join..."
                placeholderTextColor="#9AA6B8"
                value={reportText}
                onChangeText={setReportText}
                multiline
              />

              <TouchableOpacity
                style={[styles.submitReportBtn, !reportText.trim() && styles.submitReportBtnDisabled]}
                disabled={!reportText.trim()}
                onPress={submitReport}
                activeOpacity={0.88}
              >
                <Ionicons name="send-outline" size={18} color={C.white} />
                <Text style={styles.submitReportText}>Submit Issue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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

            <Text style={styles.confirmTitle}>End Live Class?</Text>

            <Text style={styles.confirmSubtitle}>
              Your current live session will be closed and marked as completed.
            </Text>

            <View style={styles.sessionSummary}>
              <Text style={styles.summaryItem}>Duration: {formatTimer(sessionTime)}</Text>
              <Text style={styles.summaryItem}>Subject: {subject}</Text>
              <Text style={styles.summaryItem}>
                Students: {students.filter(item => !item.isMe).length}
              </Text>
            </View>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowEndConfirm(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelBtnText}>Stay</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.endConfirmBtn} onPress={confirmEnd} activeOpacity={0.88}>
                <Text style={styles.endConfirmBtnText}>End Class</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bgDark,
    paddingHorizontal: 24,
  },
  remoteGlow: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: 'rgba(0,121,111,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  remoteNameLabel: {
    color: C.white,
    fontSize: IS_SMALL ? 20 : 23,
    fontWeight: '900',
    marginTop: 16,
  },
  remoteStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 8,
  },
  speakingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.green,
    marginRight: 7,
  },
  remoteStatusText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '800',
  },
  classTitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: IS_SMALL ? 12 : 13,
    fontWeight: '700',
    marginTop: 14,
    maxWidth: '90%',
  },

  pipContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 76 : 70,
    right: 14,
    width: IS_SMALL ? 104 : 116,
    height: IS_SMALL ? 142 : 154,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: '#182225',
  },
  pipCamera: {
    flex: 1,
  },
  pipOff: {
    flex: 1,
    backgroundColor: '#172226',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipOffText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
  },
  pipBottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 28,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.58)',
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
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 15,
    padding: 5,
  },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'android' ? 10 : 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.42)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.red,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginLeft: 9,
  },
  timerText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 5,
    fontVariant: ['tabular-nums'],
  },
  topRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  topIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.13)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  recordingActive: {
    backgroundColor: 'rgba(229,57,53,0.22)',
  },

  controlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.78)',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 13,
  },
  controlsScroll: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  ctrlBtn: {
    minWidth: IS_SMALL ? 62 : 68,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  ctrlBtnActive: {
    backgroundColor: 'rgba(229,57,53,0.33)',
  },
  endBtn: {
    backgroundColor: C.red,
    marginLeft: 4,
  },
  ctrlLabel: {
    color: C.white,
    fontSize: IS_TINY ? 9 : 10,
    fontWeight: '800',
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: -9,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
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
    bottom: 104,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.78)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    zIndex: 999,
  },
  toastText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: SCREEN_HEIGHT * 0.88,
    minHeight: 320,
    overflow: 'hidden',
  },
  keyboardSheetWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  modalTitle: {
    fontSize: IS_SMALL ? 17 : 19,
    fontWeight: '900',
    color: C.text,
  },
  modalSub: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 3,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: '#F3F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  chatList: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  chatContent: {
    padding: 14,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowThem: {
    justifyContent: 'flex-start',
  },
  chatAvatar: {
    marginRight: 8,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  bubbleMe: {
    backgroundColor: C.primary,
    borderBottomRightRadius: 5,
  },
  bubbleThem: {
    backgroundColor: C.white,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#E8EEF5',
  },
  bubbleSender: {
    fontSize: 11,
    fontWeight: '900',
    color: C.primary,
    marginBottom: 3,
  },
  bubbleText: {
    fontSize: 14,
    color: C.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  bubbleTextMe: {
    color: C.white,
  },
  bubbleTime: {
    fontSize: 10,
    color: C.muted,
    marginTop: 5,
    alignSelf: 'flex-end',
    fontWeight: '700',
  },
  bubbleTimeMe: {
    color: 'rgba(255,255,255,0.72)',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  chatInput: {
    flex: 1,
    minHeight: 43,
    maxHeight: 100,
    borderRadius: 21,
    backgroundColor: '#F5F8FA',
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: C.text,
    textAlignVertical: 'top',
  },
  sendBtn: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  participantTextBox: {
    flex: 1,
    marginLeft: 12,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '900',
    color: C.text,
  },
  participantRole: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 3,
  },
  participantIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: '#F2F7F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  participantDivider: {
    height: 1,
    backgroundColor: '#EEF2F6',
  },

  moreSheet: {
    maxHeight: SCREEN_HEIGHT * 0.68,
  },
  moreContent: {
    paddingVertical: 8,
  },
  moreOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  moreIconBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIconDanger: {
    backgroundColor: '#FEECEC',
  },
  moreTextBox: {
    flex: 1,
    marginLeft: 12,
  },
  moreTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: C.text,
  },
  moreSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 3,
  },

  shareSheet: {
    maxHeight: SCREEN_HEIGHT * 0.56,
  },
  shareContent: {
    padding: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: C.muted,
    marginBottom: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  shareLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  shareLink: {
    flex: 1,
    color: C.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  copyBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  shareAppsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareAppBtn: {
    alignItems: 'center',
    flex: 1,
  },
  shareAppIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },
  shareAppLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: C.text,
  },

  whiteboardScreen: {
    flex: 1,
    backgroundColor: '#F3F7FA',
  },
  whiteboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  whiteboardBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#F3F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  whiteboardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: C.text,
  },
  whiteboardSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
  },
  whiteboardActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#F3F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 7,
  },
  whiteboardTools: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  toolBtn: {
    height: 36,
    borderRadius: 14,
    paddingHorizontal: 11,
    backgroundColor: C.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 7,
  },
  toolBtnActive: {
    backgroundColor: C.primary,
  },
  toolText: {
    fontSize: 12,
    fontWeight: '900',
    color: C.primary,
    marginLeft: 5,
  },
  toolTextActive: {
    color: C.white,
  },
  sizeBtn: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  sizeBtnActive: {
    backgroundColor: C.primary,
  },
  colorRow: {
    flexDirection: 'row',
    backgroundColor: C.white,
    paddingHorizontal: 13,
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  colorBtn: {
    width: 29,
    height: 29,
    borderRadius: 15,
    marginRight: 10,
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
    backgroundColor: C.white,
    borderRadius: 22,
    borderWidth: 1,
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
    paddingHorizontal: 30,
  },
  whiteboardPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: C.text,
    marginTop: 12,
  },
  whiteboardPlaceholderSub: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    textAlign: 'center',
    marginTop: 5,
  },
  whiteboardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  shareBoardBtn: {
    flex: 1,
    height: 45,
    borderRadius: 16,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 8,
  },
  shareBoardText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 7,
  },
  closeBoardBtn: {
    flex: 1,
    height: 45,
    borderRadius: 16,
    backgroundColor: '#EEF6F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.primaryLight,
  },
  closeBoardText: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '900',
  },

  infoSheet: {
    maxHeight: SCREEN_HEIGHT * 0.62,
  },
  infoContent: {
    padding: 18,
  },
  infoModalRow: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  infoModalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: C.muted,
  },
  infoModalValue: {
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
    marginTop: 4,
  },

  settingsSheet: {
    maxHeight: SCREEN_HEIGHT * 0.56,
  },
  settingsContent: {
    padding: 18,
  },
  qualityRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  qualityBtn: {
    flex: 1,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#F3F7FA',
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  qualityBtnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  qualityText: {
    fontSize: 13,
    fontWeight: '900',
    color: C.primary,
  },
  qualityTextActive: {
    color: C.white,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
  },
  settingSub: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 3,
  },
  switchBox: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D8E0EA',
    padding: 3,
    marginLeft: 'auto',
  },
  switchBoxOn: {
    backgroundColor: C.primary,
  },
  switchDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.white,
  },
  switchDotOn: {
    alignSelf: 'flex-end',
  },

  reportSheet: {
    maxHeight: SCREEN_HEIGHT * 0.58,
  },
  reportContent: {
    padding: 18,
  },
  reportInput: {
    minHeight: 120,
    backgroundColor: '#F5F8FA',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 14,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  submitReportBtn: {
    height: 50,
    borderRadius: 17,
    backgroundColor: C.primary,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  submitReportBtnDisabled: {
    opacity: 0.5,
  },
  submitReportText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 8,
  },

  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 26,
  },
  confirmBox: {
    width: '100%',
    backgroundColor: C.white,
    borderRadius: 26,
    padding: IS_SMALL ? 22 : 26,
    alignItems: 'center',
  },
  confirmIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  confirmTitle: {
    fontSize: IS_SMALL ? 19 : 21,
    fontWeight: '900',
    color: C.text,
  },
  confirmSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 19,
  },
  sessionSummary: {
    width: '100%',
    backgroundColor: '#F6F8FB',
    borderRadius: 18,
    padding: 14,
    marginTop: 17,
  },
  summaryItem: {
    fontSize: 13,
    fontWeight: '800',
    color: C.text,
    marginBottom: 6,
  },
  confirmButtons: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.3,
    borderColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  endConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endConfirmBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '900',
  },
});
