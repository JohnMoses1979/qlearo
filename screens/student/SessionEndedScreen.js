

// screens/student/SessionEndedScreen.js
// FULLY UPDATED — Real AppContext session + rating save + stable beautiful UI

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
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
  bg: '#F8FAFC',
  white: '#FFFFFF',
  text: '#07123A',
  muted: '#64748B',
  lightMuted: '#94A3B8',
  border: '#E2E8F0',
  softBorder: '#F1F5F9',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  blue: '#06B6D4',
  orange: '#F97316',
  pink: '#EC4899',
};

const CONFETTI = [
  { color: '#F59E0B', top: 14, left: '12%', size: 8, rotate: '10deg', radius: 4 },
  { color: '#10B981', top: 44, left: '24%', size: 12, rotate: '28deg', radius: 3 },
  { color: '#078C80', top: 8, left: '38%', size: 10, rotate: '45deg', radius: 5 },
  { color: '#8B5CF6', top: 55, left: '48%', size: 13, rotate: '65deg', radius: 4 },
  { color: '#EF4444', top: 20, left: '62%', size: 9, rotate: '85deg', radius: 4 },
  { color: '#06B6D4', top: 64, left: '72%', size: 12, rotate: '110deg', radius: 3 },
  { color: '#F97316', top: 10, left: '82%', size: 10, rotate: '130deg', radius: 5 },
  { color: '#EC4899', top: 48, left: '90%', size: 8, rotate: '155deg', radius: 3 },
];

const safeText = (value, fallback = '') => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
};

const splitTimeRange = (timeText = '') => {
  const value = safeText(timeText, '');

  if (!value) {
    return {
      timeStart: '',
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

const normalizeSession = (session = {}) => {
  const id = safeText(session.id || session.sessionId, 'SESSION_COMPLETED');
  const timeParts = splitTimeRange(session.time || session.requestedTime);

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

  const timeStart = safeText(session.timeStart || timeParts.timeStart, '');
  const timeEnd = safeText(session.timeEnd || timeParts.timeEnd, '');

  return {
    ...session,
    id,
    sessionId: safeText(session.sessionId || session.id, id),
    tutor,
    tutorName: tutor,
    teacherName: tutor,
    subject,
    topic,
    date: safeText(
      session.date,
      formatDateLabel(session.rawDate || session.sessionDate || session.createdAt)
    ),
    time: safeText(
      session.time,
      timeEnd ? `${timeStart} - ${timeEnd}` : timeStart || 'Completed'
    ),
    timeStart,
    timeEnd,
    duration: safeText(
      session.durationCompleted || session.completedDuration || session.duration,
      'Completed'
    ),
    plannedDuration: safeText(session.duration, '1 Hour'),
    meetingId: safeText(session.meetingId, `CLS-${id.slice(-6).toUpperCase()}`),
    language: safeText(session.language, 'English'),
    level: safeText(session.level, 'Intermediate'),
    focus: safeText(session.focus || session.note || session.description, ''),
  };
};

export default function SessionEndedScreen({ route, navigation }) {
  const {
    getSessionById,
    rateSession,
    completeSession,
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

    return null;
  }, [getSessionById, routeSessionId]);

  const session = useMemo(
    () =>
      normalizeSession({
        ...(contextSession || {}),
        ...routeSession,
        durationCompleted:
          route?.params?.duration ||
          routeSession?.durationCompleted ||
          contextSession?.durationCompleted,
      }),
    [contextSession, routeSession, route?.params?.duration]
  );

  const [selectedRating, setSelectedRating] = useState(Number(session.rating || 0));
  const [submitted, setSubmitted] = useState(Boolean(session.reviewAdded));

  const summary = [
    { label: 'Tutor', value: session.tutor },
    { label: 'Subject', value: session.subject },
    { label: 'Topic', value: session.topic },
    { label: 'Date', value: session.date },
    { label: 'Time', value: session.time },
    { label: 'Duration', value: session.duration },
    { label: 'Meeting ID', value: session.meetingId },
  ];

  const handleRatingPress = rating => {
    setSelectedRating(rating);

    if (typeof rateSession === 'function') {
      rateSession(session.id, rating, '');
    }

    if (typeof completeSession === 'function') {
      completeSession(session.id, {
        durationCompleted: session.duration,
      });
    }

    setSubmitted(true);
  };

  const handleBackHome = () => {
    navigation?.navigate?.('StudentDashboard');
  };

  const handleViewSessions = () => {
    navigation?.navigate?.('StudentSessionsScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.illustrationWrap}>
          {CONFETTI.map((item, index) => (
            <View
              key={`confetti-${index}`}
              style={[
                styles.confettiDot,
                {
                  backgroundColor: item.color,
                  top: item.top,
                  left: item.left,
                  width: item.size,
                  height: item.size,
                  borderRadius: item.radius,
                  transform: [{ rotate: item.rotate }],
                },
              ]}
            />
          ))}

          <View style={styles.iconWrap}>
            <View style={styles.clipboardBase}>
              <Ionicons name="clipboard-outline" size={60} color={C.primary} />
            </View>

            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={17} color={C.white} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Session Ended</Text>

        <Text style={styles.subtitle}>
          Great job! Your live class has been completed successfully.
        </Text>

        <View style={styles.successPill}>
          <View style={styles.successDot} />
          <Text style={styles.successPillText}>Class completed</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Session Summary</Text>
              <Text style={styles.cardSub}>Your completed class details</Text>
            </View>

            <View style={styles.cardIcon}>
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={23}
                color={C.primary}
              />
            </View>
          </View>

          {summary.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.summaryRow,
                index < summary.length - 1 && styles.summaryRowBorder,
              ]}
            >
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {session.focus ? (
          <View style={styles.noteCard}>
            <View style={styles.noteIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={21} color={C.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.noteTitle}>Teacher Message</Text>
              <Text style={styles.noteText}>{session.focus}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.rateCard}>
          <Text style={styles.rateTitle}>
            {submitted ? 'Thanks for your rating!' : 'Rate this session'}
          </Text>

          <Text style={styles.rateSub}>
            {submitted
              ? 'Your feedback has been saved.'
              : 'Tap a star to save your feedback.'}
          </Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(star => {
              const active = star <= selectedRating;

              return (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRatingPress(star)}
                  activeOpacity={0.75}
                  style={styles.starBtn}
                >
                  <Ionicons
                    name={active ? 'star' : 'star-outline'}
                    size={34}
                    color={C.warning}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={handleBackHome}
          activeOpacity={0.88}
        >
          <Ionicons name="home-outline" size={19} color={C.white} />
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sessionsBtn}
          onPress={handleViewSessions}
          activeOpacity={0.88}
        >
          <Ionicons name="calendar-outline" size={19} color={C.primary} />
          <Text style={styles.sessionsBtnText}>View My Sessions</Text>
        </TouchableOpacity>
      </ScrollView>
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

  scrollContent: {
    flexGrow: 1,
    padding: 22,
    paddingBottom: 42,
  },

  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 165,
    marginBottom: 18,
    position: 'relative',
  },

  confettiDot: {
    position: 'absolute',
    opacity: 0.78,
  },

  iconWrap: {
    position: 'relative',
    zIndex: 1,
  },

  clipboardBase: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BEEBE6',
    shadowColor: C.primary,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 5,
  },

  checkBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: C.white,
  },

  title: {
    fontSize: 27,
    fontWeight: '900',
    color: C.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },

  subtitle: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 21,
    fontWeight: '600',
    paddingHorizontal: 8,
  },

  successPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginBottom: 20,
  },

  successDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.success,
    marginRight: 7,
  },

  successPillText: {
    color: C.success,
    fontSize: 12,
    fontWeight: '900',
  },

  summaryCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.softBorder,
    ...shadow,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.text,
  },

  cardSub: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 3,
  },

  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
    paddingVertical: 10,
  },

  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.softBorder,
  },

  summaryLabel: {
    flex: 1,
    fontSize: 13,
    color: C.muted,
    fontWeight: '800',
  },

  summaryValue: {
    flex: 1.35,
    fontSize: 13,
    color: C.text,
    fontWeight: '900',
    textAlign: 'right',
    lineHeight: 18,
  },

  noteCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.softBorder,
    flexDirection: 'row',
    ...shadow,
  },

  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  noteTitle: {
    fontSize: 14,
    color: C.text,
    fontWeight: '900',
  },

  noteText: {
    marginTop: 5,
    fontSize: 13,
    color: C.muted,
    fontWeight: '600',
    lineHeight: 19,
  },

  rateCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.softBorder,
    ...shadow,
  },

  rateTitle: {
    fontSize: 16,
    color: C.text,
    fontWeight: '900',
  },

  rateSub: {
    marginTop: 5,
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
    textAlign: 'center',
  },

  stars: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 14,
  },

  starBtn: {
    padding: 2,
  },

  homeBtn: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: C.primary,
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 13,
    elevation: 4,
  },

  homeBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 8,
  },

  sessionsBtn: {
    marginTop: 12,
    backgroundColor: C.white,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1.4,
    borderColor: '#BEEBE6',
  },

  sessionsBtnText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 8,
  },
});