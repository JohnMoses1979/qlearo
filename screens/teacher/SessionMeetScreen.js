



// screens/teacher/SessionMeetScreen.js
// FULLY UPDATED — Real session data from AppContext + fixed LiveSession navigation

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAppContext } from "../../context/AppContext";

const { width } = Dimensions.get('window');

const IS_SMALL = width < 380;

const C = {
  primary: '#00796F',
  primaryDark: '#00534E',
  primaryDeep: '#003E3B',
  primaryLight: '#EAF8F6',
  bg: '#F2F6FA',
  white: '#FFFFFF',
  text: '#07123A',
  muted: '#718096',
  border: '#E2EAF4',
  card: '#FFFFFF',
  warningBg: '#FFF8E7',
  warning: '#F59E0B',
  green: '#22C55E',
  red: '#EF4444',
  shadow: '#0F172A',
};

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Student&background=00796F&color=fff&size=200';

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

const normalizeSession = (params = {}, contextSession = null) => {
  const merged = {
    ...(contextSession || {}),
    ...(params?.session || {}),
    ...params,
  };

  const timeParts = splitTimeRange(merged.time || merged.requestedTime);

  const sessionId = safeText(
    merged.sessionId || merged.id,
    'demo-session'
  );

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

  const avatar =
    merged.avatar ||
    merged.studentAvatar ||
    merged.studentPhoto ||
    merged.image ||
    DEFAULT_AVATAR;

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
    date: safeText(merged.date, formatDateLabel(merged.rawDate || merged.createdAt)),
    rawDate: merged.rawDate || merged.date || merged.createdAt || new Date().toISOString(),
    avatar,
    status: safeText(merged.status, 'ready'),
    meetingId: safeText(merged.meetingId, `CLS-${sessionId.slice(-6).toUpperCase()}`),
    language: safeText(merged.language, 'English'),
    level: safeText(merged.level, 'Intermediate'),
  };
};

const SessionMeetScreen = ({ navigation, route }) => {
  const {
    getSessionById,
    startSession,
    markSessionViewed,
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

  const handleJoinSession = () => {
    if (typeof startSession === 'function') {
      startSession(session.id);
    }

    if (typeof markSessionViewed === 'function') {
      markSessionViewed(session.id, 'teacher');
    }

    navigation?.navigate?.('LiveSession', {
      sessionId: session.id,
      session,
      student: session.student,
      studentName: session.studentName,
      subject: session.subject,
      topic: session.topic,
      focus: session.focus,
      timeStart: session.timeStart,
      timeEnd: session.timeEnd,
      time: session.time,
      duration: session.duration,
      date: session.date,
      rawDate: session.rawDate,
      avatar: session.avatar,
      className: session.className,
      meetingId: session.meetingId,
      language: session.language,
      level: session.level,
      mode: 'teacher',
    });
  };

  const handleCheckAV = () => {
    navigation?.navigate?.('AVCheckScreen', {
      sessionId: session.id,
      session,
      student: session.student,
      subject: session.subject,
      topic: session.topic,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={C.primaryDeep} barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={C.primaryDeep} />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>Session Meet</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            Join your accepted online class
          </Text>
        </View>

        <TouchableOpacity style={styles.helpBtn} activeOpacity={0.8}>
          <Ionicons name="help-circle-outline" size={23} color={C.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.heroCard}>
          <View style={styles.avatarOuter}>
            <Image source={{ uri: session.avatar }} style={styles.studentAvatar} />
            <View style={styles.liveDot} />
          </View>

          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="video-outline"
              size={IS_SMALL ? 38 : 44}
              color={C.primary}
            />
          </View>

          <Text style={styles.title}>Ready to Start?</Text>

          <Text style={styles.subtitle}>You are about to start the session with</Text>

          <Text style={styles.name} numberOfLines={1}>
            {session.student}
          </Text>

          <View style={styles.classPill}>
            <Ionicons name="school-outline" size={13} color={C.primary} />
            <Text style={styles.classPillText} numberOfLines={1}>
              {session.className}
            </Text>
          </View>

          <View style={styles.subjectPill}>
            <Ionicons name="book-outline" size={14} color={C.primary} />
            <Text style={styles.subjectPillText} numberOfLines={1}>
              {session.subject} • {session.topic}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <View style={styles.infoIconBox}>
              <FontAwesome5 name="calendar-alt" size={16} color={C.primary} />
            </View>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {session.date}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoIconBox}>
              <Ionicons name="time-outline" size={18} color={C.primary} />
            </View>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {session.timeEnd ? `${session.timeStart} - ${session.timeEnd}` : session.timeStart}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoIconBox}>
              <MaterialCommunityIcons
                name="timer-outline"
                size={18}
                color={C.primary}
              />
            </View>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{session.duration}</Text>
          </View>
        </View>

        <View style={styles.focusCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBox}>
              <Ionicons name="radio-button-on-outline" size={18} color={C.primary} />
            </View>
            <Text style={styles.guidelinesTitle}>Class Focus</Text>
          </View>

          <Text style={styles.focusText}>{session.focus}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="language-outline" size={13} color={C.primary} />
              <Text style={styles.metaText}>{session.language}</Text>
            </View>

            <View style={styles.metaChip}>
              <Ionicons name="stats-chart-outline" size={13} color={C.primary} />
              <Text style={styles.metaText}>{session.level}</Text>
            </View>

            <View style={styles.metaChip}>
              <Ionicons name="key-outline" size={13} color={C.primary} />
              <Text style={styles.metaText}>{session.meetingId}</Text>
            </View>
          </View>
        </View>

        <View style={styles.guidelines}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color={C.primary} />
            </View>
            <Text style={styles.guidelinesTitle}>Teacher Checklist</Text>
          </View>

          <View style={styles.guidelineItem}>
            <Ionicons name="checkmark-circle" size={18} color={C.green} />
            <Text style={styles.guidelineText}>
              Start from a quiet place with stable internet.
            </Text>
          </View>

          <View style={styles.guidelineItem}>
            <Ionicons name="checkmark-circle" size={18} color={C.green} />
            <Text style={styles.guidelineText}>
              Keep class notes and whiteboard material ready.
            </Text>
          </View>

          <View style={styles.guidelineItem}>
            <Ionicons name="checkmark-circle" size={18} color={C.green} />
            <Text style={styles.guidelineText}>
              Use chat, participants, whiteboard, and share tools during class.
            </Text>
          </View>

          <View style={styles.guidelineItem}>
            <Ionicons name="checkmark-circle" size={18} color={C.green} />
            <Text style={styles.guidelineText}>
              Check microphone and camera before starting.
            </Text>
          </View>
        </View>

        <View style={styles.avCheck}>
          <View style={styles.avLeft}>
            <View style={styles.avIconBox}>
              <MaterialCommunityIcons
                name="video-check-outline"
                size={22}
                color={C.primary}
              />
            </View>

            <View style={styles.avTextBox}>
              <Text style={styles.avTitle}>Audio & Video Check</Text>
              <Text style={styles.avSubtitle}>
                Test your camera and microphone before starting.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkButton}
            onPress={handleCheckAV}
            activeOpacity={0.85}
          >
            <Text style={styles.checkButtonText}>Check</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="information-circle-outline" size={20} color={C.warning} />

          <Text style={styles.warningText}>
            This session was created from an accepted student request. Once you start,
            the live class screen will open with real session data.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleJoinSession}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons name="video-outline" size={20} color={C.white} />
          <Text style={styles.joinButtonText}>Start Live Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar-outline" size={18} color={C.primary} />
          <Text style={styles.secondaryButtonText}>Back to Schedule</Text>
        </TouchableOpacity>

        <View style={{ height: 25 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SessionMeetScreen;

const styles = StyleSheet.create({
  container: {
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
  backBtn: {
    width: IS_SMALL ? 40 : 44,
    height: IS_SMALL ? 40 : 44,
    borderRadius: IS_SMALL ? 20 : 22,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },
  headerTextBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  headerTitle: {
    color: C.white,
    fontSize: IS_SMALL ? 20 : 23,
    fontWeight: '900',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: IS_SMALL ? 11 : 13,
    fontWeight: '600',
    marginTop: 3,
  },
  helpBtn: {
    width: IS_SMALL ? 40 : 44,
    height: IS_SMALL ? 40 : 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.13)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  scrollContainer: {
    paddingHorizontal: IS_SMALL ? 13 : 16,
    paddingTop: IS_SMALL ? 16 : 20,
  },

  heroCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    paddingHorizontal: IS_SMALL ? 16 : 20,
    paddingVertical: IS_SMALL ? 22 : 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    elevation: 4,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
  },
  avatarOuter: {
    width: IS_SMALL ? 78 : 86,
    height: IS_SMALL ? 78 : 86,
    borderRadius: IS_SMALL ? 26 : 30,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  studentAvatar: {
    width: IS_SMALL ? 66 : 74,
    height: IS_SMALL ? 66 : 74,
    borderRadius: IS_SMALL ? 22 : 26,
    backgroundColor: C.border,
  },
  liveDot: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.white,
  },
  iconContainer: {
    width: IS_SMALL ? 68 : 76,
    height: IS_SMALL ? 68 : 76,
    borderRadius: IS_SMALL ? 24 : 28,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: IS_SMALL ? 21 : 24,
    fontWeight: '900',
    color: C.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: IS_SMALL ? 12 : 13,
    fontWeight: '600',
    color: C.muted,
    textAlign: 'center',
    marginTop: 8,
  },
  name: {
    fontSize: IS_SMALL ? 18 : 20,
    fontWeight: '900',
    color: C.primary,
    textAlign: 'center',
    marginTop: 6,
  },
  classPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4FBFA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 12,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: C.border,
  },
  classPillText: {
    fontSize: IS_SMALL ? 11 : 12,
    fontWeight: '800',
    color: C.primary,
    marginLeft: 6,
  },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginTop: 10,
    maxWidth: '100%',
  },
  subjectPillText: {
    fontSize: IS_SMALL ? 12 : 13,
    fontWeight: '800',
    color: C.primary,
    marginLeft: 6,
  },

  infoRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: IS_SMALL ? 8 : 10,
  },
  infoBox: {
    flex: 1,
    backgroundColor: C.white,
    paddingVertical: IS_SMALL ? 12 : 14,
    paddingHorizontal: IS_SMALL ? 6 : 8,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    elevation: 3,
    shadowColor: C.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  infoIconBox: {
    width: IS_SMALL ? 34 : 38,
    height: IS_SMALL ? 34 : 38,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: IS_SMALL ? 10 : 11,
    color: C.muted,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: IS_SMALL ? 10 : 11,
    color: C.text,
    fontWeight: '900',
    marginTop: 3,
    textAlign: 'center',
  },

  focusCard: {
    backgroundColor: C.white,
    padding: IS_SMALL ? 14 : 16,
    borderRadius: 22,
    marginTop: 15,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 3,
    shadowColor: C.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  focusText: {
    color: C.text,
    fontSize: IS_SMALL ? 12 : 13,
    fontWeight: '700',
    lineHeight: IS_SMALL ? 18 : 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.primaryLight,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: {
    fontSize: 11,
    color: C.primary,
    fontWeight: '800',
  },

  guidelines: {
    backgroundColor: C.white,
    padding: IS_SMALL ? 14 : 16,
    borderRadius: 22,
    marginTop: 15,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 3,
    shadowColor: C.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  guidelinesTitle: {
    fontSize: IS_SMALL ? 15 : 16,
    fontWeight: '900',
    color: C.text,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 9,
  },
  guidelineText: {
    flex: 1,
    marginLeft: 9,
    color: C.muted,
    fontSize: IS_SMALL ? 12 : 13,
    fontWeight: '600',
    lineHeight: IS_SMALL ? 17 : 19,
  },

  avCheck: {
    backgroundColor: C.white,
    padding: IS_SMALL ? 13 : 15,
    borderRadius: 22,
    flexDirection: IS_SMALL ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: IS_SMALL ? 'stretch' : 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 3,
    shadowColor: C.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  avLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avIconBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avTextBox: {
    flex: 1,
    marginLeft: 11,
  },
  avTitle: {
    fontSize: IS_SMALL ? 14 : 15,
    fontWeight: '900',
    color: C.text,
  },
  avSubtitle: {
    fontSize: IS_SMALL ? 11 : 12,
    color: C.muted,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 17,
  },
  checkButton: {
    borderWidth: 1.4,
    borderColor: C.primary,
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: IS_SMALL ? 13 : 0,
    alignSelf: IS_SMALL ? 'stretch' : 'auto',
  },
  checkButtonText: {
    color: C.primary,
    fontWeight: '900',
    fontSize: 13,
  },

  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.warningBg,
    borderRadius: 18,
    padding: 13,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#FFE6A8',
  },
  warningText: {
    flex: 1,
    fontSize: IS_SMALL ? 11 : 12,
    fontWeight: '700',
    color: '#8A5A00',
    marginLeft: 8,
    lineHeight: 18,
  },

  joinButton: {
    flexDirection: 'row',
    backgroundColor: C.primary,
    height: IS_SMALL ? 50 : 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    elevation: 5,
    shadowColor: C.primary,
    shadowOpacity: 0.3,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 6 },
  },
  joinButtonText: {
    color: C.white,
    fontWeight: '900',
    marginLeft: 9,
    fontSize: IS_SMALL ? 15 : 16,
  },

  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: C.white,
    height: IS_SMALL ? 48 : 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1.3,
    borderColor: C.primary,
  },
  secondaryButtonText: {
    color: C.primary,
    fontWeight: '900',
    marginLeft: 8,
    fontSize: IS_SMALL ? 14 : 15,
  },
});