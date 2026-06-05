


// screens/student/SessionDetailsScreen.js
// FULLY UPDATED — Real AppContext session details + accepted session reflection

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  TextInput,
  Platform,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from "../../context/AppContext";
import { useLiveSessionRoom } from '../../services/useLiveSessionRoom';

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

const getInitials = (value = '') =>
  safeText(value, 'Tutor')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'T';

const normalizeText = (value = '') =>
  safeText(value, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

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

const parseTimeString = (timeText = '') => {
  const value = safeText(timeText, '').trim();
  if (!value || /flexible/i.test(value)) return null;

  const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const meridiem = safeText(match[3], '').toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return { hours, minutes };
};

const parseDateOnly = (dateValue = '') => {
  const value = safeText(dateValue, '').trim();
  if (!value || /flexible/i.test(value)) return null;

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const match = value.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const monthName = match[2].slice(0, 3).toLowerCase();
  const year = Number(match[3]);
  const months = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  if (!(monthName in months)) return null;

  return new Date(year, months[monthName], day);
};

const resolveSessionStartAt = (session = {}) => {
  const rawStart =
    session.startAt ||
    session.scheduledFor ||
    session.sessionStartAt ||
    session.meetingStartAt ||
    null;

  if (rawStart) {
    const direct = new Date(rawStart);
    if (!Number.isNaN(direct.getTime())) return direct;
  }

  const dateOnly =
    session.rawDate ||
    session.sessionDate ||
    session.date ||
    session.preferredDate ||
    null;
  const timeText =
    session.timeStart ||
    session.time ||
    session.requestedTime ||
    session.proposal?.timeSlot ||
    '';

  const parsedDate = parseDateOnly(dateOnly);
  const parsedTime = parseTimeString(timeText);

  if (!parsedDate || !parsedTime) return null;

  const startAt = new Date(parsedDate);
  startAt.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  return startAt;
};

const resolveTutorAvatar = (session = {}, lookupTutor) => {
  const tutorId =
    session.teacherId ||
    session.tutorId ||
    session.tutor?.id ||
    session.teacher?.id ||
    null;

  const tutor =
    typeof lookupTutor === 'function' && tutorId ? lookupTutor(tutorId) : null;

  return (
    session.image ||
    session.tutorImage ||
    session.teacherAvatar ||
    session.avatar ||
    tutor?.avatar ||
    tutor?.image ||
    tutor?.photo ||
    tutor?.teacherAvatar ||
    DEFAULT_TUTOR_IMAGE
  );
};

const formatDateLabel = (value) => {
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

const normalizeSession = (session = {}, lookupTutor) => {
  const timeParts = splitTimeRange(session.time || session.requestedTime);

  const id = safeText(session.id || session.sessionId, 'SESSION_DEMO');

  const tutor = safeText(
    session.tutor ||
      session.tutorName ||
      session.teacherName ||
      session.teacher ||
      session.name,
    'Tutor'
  );

  const subject = safeText(session.subject, 'General');
  const topic = safeText(session.topic, 'Class Topic');

  const timeStart = safeText(session.timeStart || timeParts.timeStart, 'Flexible');
  const timeEnd = safeText(session.timeEnd || timeParts.timeEnd, '');

  const time = session.time || (timeEnd ? `${timeStart} - ${timeEnd}` : timeStart);
  const image = resolveTutorAvatar(session, lookupTutor);

  const statusValue = safeText(session.status, 'ready').toLowerCase();

  const isCompleted =
    statusValue === 'completed' ||
    statusValue === 'session completed' ||
    session.completedAt;

  const canEnter =
    session.canEnter === true ||
    statusValue === 'ready' ||
    statusValue === 'live' ||
    statusValue === 'upcoming' ||
    statusValue === 'scheduled';

  return {
    ...session,
    id,
    sessionId: safeText(session.sessionId || session.id, id),
    tutor,
    tutorName: tutor,
    teacherName: tutor,
    subject,
    topic,
    rating: Number(session.rating || 4.8),
    reviews: Number(session.reviews || 0),
    date: safeText(
      session.date,
      formatDateLabel(session.rawDate || session.sessionDate || session.createdAt)
    ),
    rawDate: session.rawDate || session.date || session.sessionDate || session.createdAt,
    time,
    timeStart,
    timeEnd,
    duration: safeText(session.duration, '1 Hour'),
    sessionType: safeText(session.sessionType || session.mode, 'Video Class'),
    mode: safeText(session.mode, 'Live Class'),
    status: isCompleted ? 'Completed' : canEnter ? 'Ready to Join' : 'Upcoming',
    canEnter,
    isCompleted,
    image,
    meetingId: safeText(session.meetingId, `CLS-${id.slice(-6).toUpperCase()}`),
    language: safeText(session.language, 'English'),
    level: safeText(session.level, 'Intermediate'),
    focus: safeText(session.focus || session.note || session.description, ''),
  };
};

export default function SessionDetailsScreen({ route, navigation }) {
  const {
    getSessionById,
    getTutorById,
    currentUser,
    markSessionViewed,
    studentSessions = [],
  } = useAppContext();

  const routeSession = route?.params?.session || {};
  const routeSessionId =
    route?.params?.sessionId ||
    routeSession?.id ||
    routeSession?.sessionId;
  const isFocused = useIsFocused();

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
      }, getTutorById),
    [contextSession, routeSession, getTutorById]
  );

  const [now, setNow] = useState(Date.now());
  const reminderShownRef = useRef(false);
  const [avatarLoadErrorIds, setAvatarLoadErrorIds] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [chatText, setChatText] = useState('');
  const chatListRef = useRef(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const lastSeenMessageCountRef = useRef(0);

  const isReadyToJoin = Boolean(session.canEnter);
  const isCompleted = session.isCompleted || session.status === 'Completed';
  const startAt = useMemo(() => resolveSessionStartAt(session), [session]);
  const liveSessionId = safeText(session.sessionId || session.id, '');
  const preChatSessionId = useMemo(
    () => `PRECHAT_${liveSessionId || 'DEMO'}`,
    [liveSessionId]
  );
  const liveRoom = useLiveSessionRoom({
    sessionId: preChatSessionId,
    currentUser,
    initialMessages: [],
    fallbackRole: 'student',
  });

  const timeLeft = useMemo(() => {
    if (!startAt) {
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }

    const totalSeconds = Math.max(0, Math.floor((startAt.getTime() - now) / 1000));

    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      totalSeconds,
    };
  }, [startAt, now]);

  const isStartingSoon =
    !isCompleted &&
    Boolean(startAt) &&
    timeLeft.totalSeconds > 0 &&
    timeLeft.totalSeconds <= 15 * 60;

  useEffect(() => {
    if (typeof markSessionViewed === 'function') {
      markSessionViewed(session.id, 'student');
    }
  }, [markSessionViewed, session.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isStartingSoon || reminderShownRef.current) return;

    reminderShownRef.current = true;
    Alert.alert(
      'Class Reminder',
      'Your class starts in 15 minutes. Please get ready to join.'
    );
  }, [isStartingSoon]);

  useEffect(() => {
    if (!showChat) return;

    const timer = setTimeout(() => {
      chatListRef.current?.scrollToEnd?.({ animated: true });
    }, 250);

    return () => clearTimeout(timer);
  }, [showChat, liveRoom.messages]);

  useEffect(() => {
    if (!isFocused) return;
    if (!Array.isArray(liveRoom.messages)) return;

    const previousCount = lastSeenMessageCountRef.current;
    const nextCount = liveRoom.messages.length;

    if (nextCount <= previousCount) {
      setUnreadChatCount(0);
      lastSeenMessageCountRef.current = nextCount;
      return;
    }

    const newMessages = liveRoom.messages.slice(previousCount);
    const incomingFromTeacher = newMessages.filter((item) => {
      const senderRole = safeText(item?.senderRole || item?.role, '').toLowerCase();
      return senderRole === 'teacher' && !item?.isMe;
    }).length;

    if (incomingFromTeacher > 0) {
      setUnreadChatCount((prev) => prev + incomingFromTeacher);
    }

    lastSeenMessageCountRef.current = nextCount;
  }, [isFocused, liveRoom.messages]);

  const pad = n => String(n).padStart(2, '0');

  const renderAvatar = () => {
    const avatarUri = session.image || DEFAULT_TUTOR_IMAGE;
    const avatarKey = String(session.id || session.sessionId || session.tutor || 'session-avatar');

    if (avatarLoadErrorIds[avatarKey] || !avatarUri) {
      return (
        <View style={styles.heroAvatarPlaceholder}>
          <Text style={styles.heroAvatarPlaceholderText}>
            {getInitials(session.tutor || session.teacherName || 'Tutor')}
          </Text>
        </View>
      );
    }

    return (
      <Image
        key={avatarUri}
        source={{ uri: avatarUri }}
        style={styles.heroAvatar}
        onError={() =>
          setAvatarLoadErrorIds((prev) => ({
            ...prev,
            [avatarKey]: true,
          }))
        }
      />
    );
  };

  const sendChatMessage = async () => {
    const text = chatText.trim();
    if (!text) return;

    try {
      await liveRoom.sendEvent({
        type: 'chat',
        text,
        senderId: currentUser?.id || 'student-live',
        senderName: currentUser?.name || 'You',
        senderRole: currentUser?.role || 'student',
      });
      setChatText('');
    } catch (error) {
      Alert.alert('Chat Failed', error?.message || 'Unable to send message.');
    }
  };

  const openChat = () => {
    setUnreadChatCount(0);
    lastSeenMessageCountRef.current = liveRoom.messages.length;

    navigation?.navigate?.('PreClassChat', {
      session,
      sessionId: session.sessionId || session.id,
      teacherId: session.teacherId || session.tutorId || null,
      teacherName: session.teacherName || session.tutor || null,
      studentId: session.studentId || null,
      studentName: session.student || null,
      subject: session.subject,
      topic: session.topic,
    });
  };
  const closeChat = () => setShowChat(false);

  const renderChatItem = ({ item }) => {
    const isMine = Boolean(item?.isMe);
    const messageText = safeText(item?.text || item?.payload?.text || item?.payload?.message, '');

    if (!messageText && item?.type !== 'whiteboard') return null;

    return (
      <View style={[styles.chatRow, isMine ? styles.chatRowMe : styles.chatRowOther]}>
        <View style={[styles.chatBubble, isMine ? styles.chatBubbleMe : styles.chatBubbleOther]}>
          <Text style={[styles.chatSender, isMine && styles.chatSenderMe]}>
            {isMine ? 'You' : safeText(item?.senderName || item?.sender || 'Tutor', 'Tutor')}
          </Text>
          <Text style={[styles.chatText, isMine && styles.chatTextMe]}>
            {messageText || 'Shared content'}
          </Text>
          <Text style={[styles.chatTime, isMine && styles.chatTimeMe]}>
            {safeText(item?.time, '')}
          </Text>
        </View>
      </View>
    );
  };

  const sessionDetails = useMemo(
    () => [
      {
        icon: 'calendar-outline',
        label: 'Date',
        value: session.date || 'Not available',
      },
      {
        icon: 'time-outline',
        label: 'Time',
        value: session.time || 'Not available',
      },
      {
        icon: 'hourglass-outline',
        label: 'Duration',
        value: session.duration || '1 Hour',
      },
      {
        icon: 'book-outline',
        label: 'Topic',
        value: session.topic || 'Class Topic',
      },
      {
        icon: 'videocam-outline',
        label: 'Session Type',
        value: session.sessionType || session.mode || 'Video Class',
      },
      {
        icon: 'language-outline',
        label: 'Language',
        value: session.language || 'English',
      },
    ],
    [session]
  );

  const preparationItems = [
    {
      id: '1',
      title: 'Keep your notebook ready',
      icon: 'notebook-outline',
    },
    {
      id: '2',
      title: 'Join with stable internet',
      icon: 'wifi-outline',
    },
    {
      id: '3',
      title: 'Use headphones for better audio',
      icon: 'headphones',
    },
  ];

  const handleJoinSession = () => {
    navigation?.navigate?.('JoinSessionScreen', {
      sessionId: session.id,
      session,
      tutor: session.tutor,
      subject: session.subject,
      topic: session.topic,
      timeStart: session.timeStart,
      timeEnd: session.timeEnd,
      duration: session.duration,
      meetingId: session.meetingId,
    });
  };

  const handleBack = () => {
    navigation?.goBack?.();
  };

  const renderStatusBadge = () => {
    let badgeStyle = styles.statusUpcoming;
    let textStyle = styles.statusUpcomingText;
    let dotStyle = styles.statusUpcomingDot;
    let label = session.status || 'Upcoming';

    if (isReadyToJoin) {
      badgeStyle = styles.statusReady;
      textStyle = styles.statusReadyText;
      dotStyle = styles.statusReadyDot;
      label = 'Ready to Join';
    }

    if (isCompleted) {
      badgeStyle = styles.statusCompleted;
      textStyle = styles.statusCompletedText;
      dotStyle = styles.statusCompletedDot;
      label = 'Completed';
    }

    return (
      <View style={[styles.statusBadge, badgeStyle]}>
        <View style={[styles.statusDot, dotStyle]} />
        <Text style={[styles.statusText, textStyle]}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerIconBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={21} color={C.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Session Details</Text>
          <Text style={styles.headerSub}>Your accepted tutor class</Text>
        </View>

        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.85}>
          <Ionicons name="ellipsis-vertical" size={21} color={C.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarWrap}>
              {renderAvatar()}
              {!isCompleted ? <View style={styles.onlineDot} /> : null}
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.heroSmall}>Tutor</Text>
              <Text style={styles.heroName} numberOfLines={1}>
                {session.tutor}
              </Text>
              <Text style={styles.heroSubject} numberOfLines={1}>
                {session.subject}
              </Text>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={15} color={C.warning} />
                <Text style={styles.ratingText}>
                  {session.rating} ({session.reviews} reviews)
                </Text>
              </View>
            </View>

            {renderStatusBadge()}
          </View>

          <View style={styles.topicCard}>
            <View style={styles.topicIcon}>
              <MaterialCommunityIcons
                name="book-open-page-variant-outline"
                size={21}
                color={C.primary}
              />
            </View>

            <View style={styles.topicInfo}>
              <Text style={styles.topicLabel}>Today’s Topic</Text>
              <Text style={styles.topicTitle} numberOfLines={2}>
                {session.topic || 'Class Topic'}
              </Text>
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatValue}>
                {session.duration || '1 Hour'}
              </Text>
              <Text style={styles.heroStatLabel}>Duration</Text>
            </View>

            <View style={styles.heroStatDivider} />

            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatValue}>
                {session.level || 'Intermediate'}
              </Text>
              <Text style={styles.heroStatLabel}>Level</Text>
            </View>

            <View style={styles.heroStatDivider} />

            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatValue}>
                {session.language || 'English'}
              </Text>
              <Text style={styles.heroStatLabel}>Language</Text>
            </View>
          </View>
        </View>

        {isStartingSoon ? (
          <View style={styles.reminderCard}>
            <View style={styles.reminderIcon}>
              <Ionicons name="notifications-outline" size={22} color={C.primary} />
            </View>

            <View style={styles.reminderTextWrap}>
              <Text style={styles.reminderTitle}>Class starts in 15 minutes</Text>
              <Text style={styles.reminderSub}>
                Please join on time and keep your device ready.
              </Text>
            </View>
          </View>
        ) : null}

        {!isCompleted ? (
          <View style={styles.countdownCard}>
            <View style={styles.cardHeadingRow}>
              <View>
                <Text style={styles.cardTitle}>Class Countdown</Text>
                <Text style={styles.cardSubtitle}>
                  {isStartingSoon ? 'Session is starting very soon' : 'Session will start soon'}
                </Text>
              </View>

              <View style={styles.clockIcon}>
                <Ionicons name="alarm-outline" size={22} color={C.primary} />
              </View>
            </View>

            <View style={styles.countdownRow}>
              <View style={styles.timeBox}>
                <Text style={styles.timeVal}>{pad(timeLeft.hours)}</Text>
                <Text style={styles.timeUnit}>Hours</Text>
              </View>

              <Text style={styles.colon}>:</Text>

              <View style={styles.timeBox}>
                <Text style={styles.timeVal}>{pad(timeLeft.minutes)}</Text>
                <Text style={styles.timeUnit}>Minutes</Text>
              </View>

              <Text style={styles.colon}>:</Text>

              <View style={styles.timeBox}>
                <Text style={styles.timeVal}>{pad(timeLeft.seconds)}</Text>
                <Text style={styles.timeUnit}>Seconds</Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.detailCard}>
          <View style={styles.cardHeadingRow}>
            <View>
              <Text style={styles.cardTitle}>Class Information</Text>
              <Text style={styles.cardSubtitle}>
                Complete details about this session
              </Text>
            </View>

            <View style={styles.clockIcon}>
              <Ionicons name="information-circle-outline" size={23} color={C.primary} />
            </View>
          </View>

          <View style={styles.detailsList}>
            {sessionDetails.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.detailRow,
                  index < sessionDetails.length - 1 && styles.detailRowBorder,
                ]}
              >
                <View style={styles.detailLeft}>
                  <View style={styles.detailIconBox}>
                    <Ionicons name={item.icon} size={18} color={C.primary} />
                  </View>

                  <Text style={styles.detailLabel}>{item.label}</Text>
                </View>

                <Text style={styles.detailValue} numberOfLines={2}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.prepareCard}>
          <View style={styles.cardHeadingRow}>
            <View>
              <Text style={styles.cardTitle}>Before You Join</Text>
              <Text style={styles.cardSubtitle}>
                Quick preparation checklist
              </Text>
            </View>

            <View style={styles.clockIcon}>
              <Ionicons name="checkmark-done-outline" size={23} color={C.primary} />
            </View>
          </View>

          {preparationItems.map(item => (
            <View key={item.id} style={styles.prepareItem}>
              <View style={styles.prepareIcon}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={18}
                  color={C.primary}
                />
              </View>

              <Text style={styles.prepareText}>{item.title}</Text>

              <Ionicons name="checkmark-circle" size={20} color={C.success} />
            </View>
          ))}
        </View>

        {session.focus ? (
          <View style={styles.focusCard}>
            <View style={styles.cardHeadingRow}>
              <View>
                <Text style={styles.cardTitle}>Teacher Message</Text>
                <Text style={styles.cardSubtitle}>
                  Notes shared for this class
                </Text>
              </View>

              <View style={styles.clockIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={C.primary} />
              </View>
            </View>

            <Text style={styles.focusText}>{session.focus}</Text>
          </View>
        ) : null}

        <View style={styles.meetingCard}>
          <View style={styles.meetingLeft}>
            <View style={styles.meetingIcon}>
              <Ionicons name="shield-checkmark-outline" size={23} color={C.white} />
            </View>

            <View style={styles.meetingTextWrap}>
              <Text style={styles.meetingTitle}>Secure Session</Text>
              <Text style={styles.meetingSub}>
                Meeting ID: {session.meetingId || 'CLS-SESSION'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.messageBtn}
          activeOpacity={0.88}
          onPress={openChat}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={C.primary} />
          {unreadChatCount > 0 ? (
            <View style={styles.messageBadge}>
              <Text style={styles.messageBadgeText}>
                {unreadChatCount > 99 ? '99+' : String(unreadChatCount)}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.joinBtn,
            !isReadyToJoin && !isCompleted && styles.joinBtnDisabled,
            isCompleted && styles.joinBtnCompleted,
          ]}
          activeOpacity={0.9}
          onPress={isCompleted ? undefined : handleJoinSession}
          disabled={isCompleted}
        >
          <Ionicons
            name={
              isCompleted
                ? 'checkmark-circle-outline'
                : isReadyToJoin
                ? 'videocam'
                : 'lock-closed-outline'
            }
            size={20}
            color={isReadyToJoin ? C.white : C.lightMuted}
          />

          <Text
            style={[
              styles.joinBtnText,
              !isReadyToJoin && styles.joinBtnTextDisabled,
            ]}
          >
                  {isCompleted
              ? 'Session Completed'
              : isReadyToJoin
              ? 'Join Session'
              : 'Session Not Started'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showChat}
        animationType="slide"
        transparent
        onRequestClose={closeChat}
      >
        <View style={styles.chatOverlay}>
          <KeyboardAvoidingView
            style={styles.chatSheet}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.chatHeader}>
              <View>
                <Text style={styles.chatHeaderTitle}>Session Chat</Text>
                <Text style={styles.chatHeaderSub}>
                  {session.tutor} · {session.subject}
                </Text>
              </View>

              <TouchableOpacity onPress={closeChat} style={styles.chatCloseBtn}>
                <Ionicons name="close" size={20} color={C.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.chatMetaRow}>
              <View style={styles.chatMetaPill}>
                <Ionicons name="sync-outline" size={13} color={C.primary} />
                <Text style={styles.chatMetaText}>
                  {liveRoom.connectionState === 'open'
                    ? 'Live connected'
                    : 'Connecting chat...'}
                </Text>
              </View>
              <View style={styles.chatMetaPill}>
                <Ionicons name="chatbubble-ellipses-outline" size={13} color={C.primary} />
                <Text style={styles.chatMetaText}>{liveRoom.messages.length} messages</Text>
              </View>
            </View>

            <FlatList
              ref={chatListRef}
              data={liveRoom.messages}
              keyExtractor={(item) => String(item.id || item.clientId || `${item.senderName}-${item.time}`)}
              renderItem={renderChatItem}
              contentContainerStyle={styles.chatList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.chatEmpty}>
                  <Ionicons name="chatbubbles-outline" size={28} color={C.lightMuted} />
                  <Text style={styles.chatEmptyTitle}>Start the conversation</Text>
                  <Text style={styles.chatEmptySub}>
                    Messages you send here will appear live to your teacher.
                  </Text>
                </View>
              }
              onContentSizeChange={() => chatListRef.current?.scrollToEnd?.({ animated: true })}
            />

            <View style={styles.chatComposer}>
              <TextInput
                value={chatText}
                onChangeText={setChatText}
                placeholder="Type your message..."
                placeholderTextColor={C.lightMuted}
                style={styles.chatInput}
                multiline
              />
              <TouchableOpacity
                onPress={sendChatMessage}
                style={styles.chatSendBtn}
                activeOpacity={0.9}
              >
                <Ionicons name="send" size={18} color={C.white} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    paddingBottom: 120,
  },

  heroCard: {
    backgroundColor: C.primary,
    borderRadius: 26,
    padding: 16,
    overflow: 'hidden',
    ...shadow,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatarWrap: {
    width: 72,
    height: 72,
    marginRight: 12,
  },

  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.42)',
    backgroundColor: '#DDE7EF',
  },

  heroAvatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.42)',
    backgroundColor: '#DDE7EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroAvatarPlaceholderText: {
    color: C.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
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

  heroInfo: {
    flex: 1,
    paddingRight: 8,
  },

  heroSmall: {
    fontSize: 11,
    color: '#CFF7F2',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  heroName: {
    fontSize: 19,
    fontWeight: '900',
    color: C.white,
    letterSpacing: -0.3,
  },

  heroSubject: {
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
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    marginRight: 5,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '900',
  },

  statusReady: {
    backgroundColor: 'rgba(220,252,231,0.96)',
  },

  statusReadyDot: {
    backgroundColor: C.success,
  },

  statusReadyText: {
    color: C.success,
  },

  statusUpcoming: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  statusUpcomingDot: {
    backgroundColor: '#E8FFFC',
  },

  statusUpcomingText: {
    color: C.white,
  },

  statusCompleted: {
    backgroundColor: 'rgba(220,252,231,0.96)',
  },

  statusCompletedDot: {
    backgroundColor: C.success,
  },

  statusCompletedText: {
    color: C.success,
  },

  topicCard: {
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

  heroStatsRow: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroStatBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  heroStatValue: {
    color: C.white,
    fontSize: 13,
    fontWeight: '900',
  },

  heroStatLabel: {
    marginTop: 3,
    color: '#CFF7F2',
    fontSize: 10,
    fontWeight: '800',
  },

  heroStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  countdownCard: {
    marginTop: 16,
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: C.softBorder,
    ...shadow,
  },

  reminderCard: {
    marginTop: 16,
    backgroundColor: '#FFF8E8',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE3A7',
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow,
  },

  reminderIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#FFF0C8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  reminderTextWrap: {
    flex: 1,
  },

  reminderTitle: {
    fontSize: 15,
    color: C.text,
    fontWeight: '900',
  },

  reminderSub: {
    marginTop: 3,
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
    lineHeight: 18,
  },

  detailCard: {
    marginTop: 16,
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: C.softBorder,
    ...shadow,
  },

  prepareCard: {
    marginTop: 16,
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: C.softBorder,
    ...shadow,
  },

  focusCard: {
    marginTop: 16,
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: C.softBorder,
    ...shadow,
  },

  focusText: {
    fontSize: 13,
    color: C.text,
    fontWeight: '700',
    lineHeight: 20,
  },

  cardHeadingRow: {
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

  clockIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timeBox: {
    width: 76,
    height: 82,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.softBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  timeVal: {
    fontSize: 31,
    fontWeight: '900',
    color: C.text,
    lineHeight: 37,
  },

  timeUnit: {
    marginTop: 4,
    fontSize: 10,
    color: C.lightMuted,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  colon: {
    marginHorizontal: 7,
    fontSize: 29,
    color: C.primary,
    fontWeight: '900',
    marginBottom: 17,
  },

  detailsList: {
    borderRadius: 18,
    overflow: 'hidden',
  },

  detailRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.softBorder,
  },

  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },

  detailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  detailLabel: {
    fontSize: 13,
    color: C.muted,
    fontWeight: '800',
  },

  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: C.text,
    fontWeight: '900',
    lineHeight: 18,
  },

  prepareItem: {
    minHeight: 52,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.softBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 9,
  },

  prepareIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  prepareText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: C.text,
  },

  meetingCard: {
    marginTop: 16,
    backgroundColor: C.primaryDark,
    borderRadius: 22,
    padding: 16,
  },

  meetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  meetingIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  meetingTextWrap: {
    flex: 1,
  },

  meetingTitle: {
    fontSize: 15,
    color: C.white,
    fontWeight: '900',
  },

  meetingSub: {
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

  chatOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7,18,58,0.28)',
    justifyContent: 'flex-end',
  },

  chatSheet: {
    maxHeight: '78%',
    backgroundColor: C.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderTopWidth: 1,
    borderTopColor: C.softBorder,
  },

  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: C.text,
  },

  chatHeaderSub: {
    marginTop: 3,
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
  },

  chatCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.softBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chatMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },

  chatMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },

  chatMetaText: {
    fontSize: 11,
    color: C.primaryDark,
    fontWeight: '800',
  },

  chatList: {
    paddingVertical: 4,
    paddingBottom: 12,
  },

  chatRow: {
    marginBottom: 10,
    flexDirection: 'row',
  },

  chatRowMe: {
    justifyContent: 'flex-end',
  },

  chatRowOther: {
    justifyContent: 'flex-start',
  },

  chatBubble: {
    maxWidth: '84%',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },

  chatBubbleMe: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },

  chatBubbleOther: {
    backgroundColor: '#F8FAFC',
    borderColor: C.softBorder,
  },

  chatSender: {
    fontSize: 11,
    fontWeight: '900',
    color: C.primaryDark,
    marginBottom: 4,
  },

  chatSenderMe: {
    color: C.white,
  },

  chatText: {
    fontSize: 13,
    color: C.text,
    fontWeight: '700',
    lineHeight: 19,
  },

  chatTextMe: {
    color: C.white,
  },

  chatTime: {
    marginTop: 5,
    fontSize: 10,
    color: C.muted,
    fontWeight: '600',
  },

  chatTimeMe: {
    color: 'rgba(255,255,255,0.82)',
  },

  chatEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },

  chatEmptyTitle: {
    marginTop: 10,
    fontSize: 14,
    color: C.text,
    fontWeight: '900',
  },

  chatEmptySub: {
    marginTop: 4,
    fontSize: 12,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 18,
  },

  chatComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingTop: 8,
  },

  chatInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.softBorder,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 13,
    fontWeight: '700',
  },

  chatSendBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 9,
    elevation: 3,
  },

  messageBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: '#C8F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },

  messageBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  messageBadgeText: {
    color: C.white,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
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

  joinBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: C.border,
    shadowOpacity: 0,
    elevation: 0,
  },

  joinBtnCompleted: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: C.border,
    shadowOpacity: 0,
    elevation: 0,
  },

  joinBtnText: {
    marginLeft: 8,
    color: C.white,
    fontSize: 15,
    fontWeight: '900',
  },

  joinBtnTextDisabled: {
    color: C.lightMuted,
  },
});
