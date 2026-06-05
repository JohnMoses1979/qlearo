


// screens/teacher/TeacherTuitionRequestsCombined.js
// FULLY UPDATED — Real AppContext data + Accept creates session + Decline updates request

import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from "../../context/AppContext";

const PRIMARY = '#006D6A';
const BG = '#F6F8FC';
const TEXT = '#07123A';
const MUTED = '#7A859F';
const BORDER = '#E6ECF5';
const WHITE = '#FFFFFF';

const TABS = ['All', 'Pending', 'Accepted', 'Declined'];
const TIME_SLOTS = [
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM',
  '6:00 PM - 7:00 PM',
  '7:00 PM - 8:00 PM',
];
const DURATIONS = ['30 min', '1 Hour', '1.5 Hours', '2 Hours'];

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Student&background=006D6A&color=fff&size=200';

const safeText = (value, fallback = '') => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
};

const getStudentAvatar = (request = {}) => {
  return (
    request.avatar ||
    request.studentAvatar ||
    request.studentPhoto ||
    request.image ||
    DEFAULT_AVATAR
  );
};

const splitTimeSlot = (slot = '') => {
  const parts = String(slot)
    .split('-')
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    timeStart: parts[0] || String(slot).trim(),
    timeEnd: parts[1] || '',
  };
};

const formatDateLabel = (value) => {
  if (!value) return 'Flexible';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeRequest = (request = {}) => {
  const status = safeText(request.status, 'pending').toLowerCase();

  return {
    ...request,
    id: safeText(request.id),
    name: safeText(request.name || request.studentName, 'Student'),
    studentName: safeText(request.studentName || request.name, 'Student'),
    class: safeText(request.class || request.className, 'Class not added'),
    className: safeText(request.className || request.class, 'Class not added'),
    subject: safeText(request.subject, 'General'),
    topic: safeText(request.topic, 'Class Topic'),
    duration: safeText(request.duration, '1 Hour'),
    requestedTime: safeText(request.requestedTime || request.time, 'Flexible'),
    preferredDate: safeText(request.preferredDate, ''),
    avatar: getStudentAvatar(request),
    note: safeText(request.note || request.message || request.description, ''),
    status,
  };
};

export default function TeacherTuitionRequestsCombined({ navigation, route }) {
  const {
    teacherTuitionRequests = [],
    tuitionRequests = [],
    acceptTuitionRequest,
    createTuitionSession,
    declineTuitionRequest,
    markTuitionRequestViewed,
  } = useAppContext();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [message, setMessage] = useState('');

  const routeRequestId = route?.params?.requestId || null;

  const requests = useMemo(() => {
    const source =
      Array.isArray(teacherTuitionRequests) && teacherTuitionRequests.length > 0
        ? teacherTuitionRequests
        : Array.isArray(tuitionRequests)
        ? tuitionRequests
        : [];

    return source.map(normalizeRequest);
  }, [teacherTuitionRequests, tuitionRequests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (activeTab === 'All') return true;
      return request.status === activeTab.toLowerCase();
    });
  }, [activeTab, requests]);

  const totalCount = requests.length;
  const pendingCount = requests.filter((request) => request.status === 'pending').length;
  const acceptedCount = requests.filter((request) => request.status === 'accepted').length;
  const declinedCount = requests.filter((request) => request.status === 'declined').length;

  const getStatusStyle = (status) => {
    if (status === 'accepted') return { bg: '#E8F5E9', text: '#2E7D32' };
    if (status === 'declined') return { bg: '#FFEBEE', text: '#C62828' };
    if (status === 'cancelled') return { bg: '#F1F5F9', text: '#64748B' };
    return { bg: '#FFF8E1', text: '#F9A825' };
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleAccept = (request) => {
    const cleanRequest = normalizeRequest(request);

    setSelectedSlot(
      cleanRequest.requestedTime && cleanRequest.requestedTime !== 'Flexible'
        ? cleanRequest.requestedTime
        : TIME_SLOTS[0]
    );
    setSelectedDuration(cleanRequest.duration || DURATIONS[1]);
    setMessage('');
    setSelectedRequest(cleanRequest);

    if (typeof markTuitionRequestViewed === 'function') {
      void markTuitionRequestViewed(cleanRequest.id, 'teacher').catch((error) => {
        console.warn('Failed to mark tuition request as viewed', error);
      });
    }
  };

  useEffect(() => {
    if (!routeRequestId || selectedRequest) {
      return;
    }

    const preselected = requests.find((item) => item.id === routeRequestId);
    if (!preselected) {
      return;
    }

    handleAccept(preselected);
  }, [routeRequestId, requests, selectedRequest]);

  const handleReject = async (requestId) => {
    if (typeof declineTuitionRequest !== 'function') {
      global.showAlert(
        'AppContext Missing',
        'declineTuitionRequest is not available in AppContext.'
      );
      return;
    }

    try {
      await declineTuitionRequest(requestId, 'Teacher declined this tuition request.');
    } catch (error) {
      global.showAlert('Reject Failed', error?.message || 'Unable to reject request.');
    }
  };

  const handleSendProposal = async () => {
    if (!selectedRequest) {
      global.showAlert('Request Missing', 'Please select a request again.');
      return;
    }

    if (!selectedSlot) {
      global.showAlert('Select Time', 'Please select a time slot.');
      return;
    }

    if (!selectedDuration) {
      global.showAlert('Select Duration', 'Please select a duration.');
      return;
    }

    if (typeof acceptTuitionRequest !== 'function') {
      global.showAlert(
        'AppContext Missing',
        'acceptTuitionRequest is not available in AppContext.'
      );
      return;
    }

    const { timeStart, timeEnd } = splitTimeSlot(selectedSlot);
    const sessionDate = selectedRequest.preferredDate || new Date().toISOString();
    let createdSession = null;

    try {
      await acceptTuitionRequest(selectedRequest.id, {
        timeSlot: selectedSlot,
        time: timeStart,
        timeStart,
        timeEnd,
        duration: selectedDuration,
        message,
        sessionType: 'Video Class',
        mode: 'Live Class',
        language: 'English',
        level: 'Intermediate',
      });

      if (typeof createTuitionSession === 'function') {
        createdSession = await createTuitionSession(selectedRequest.id, {
          date: sessionDate,
          time: timeStart,
          timeSlot: selectedSlot,
          timeStart,
          timeEnd,
          duration: selectedDuration,
          message,
          note: message,
          focus: message || selectedRequest.note || selectedRequest.topic,
          subject: selectedRequest.subject,
          topic: selectedRequest.topic,
          sessionType: 'Video Class',
          mode: 'Live Class',
          language: 'English',
          level: 'Intermediate',
        });
      }
    } catch (error) {
      global.showAlert('Accept Failed', error?.message || 'Unable to accept request.');
      return;
    }

    setSelectedRequest(null);
    setSelectedSlot('');
    setSelectedDuration('');
    setMessage('');

    if (createdSession) {
      global.showAlert(
        'Session Accepted',
        'The session was accepted and added to your schedule.'
      );
      navigation?.navigate?.('TeacherSchedule');
    } else {
      global.showAlert(
        'Request Updated',
        'The request was accepted, but the session could not be created yet.'
      );
    }
  };

  // ─── Detail / Propose Screen ────────────────────────────────────────────────
  if (selectedRequest) {
    const request = normalizeRequest(selectedRequest);

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setSelectedRequest(null)}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={22} color={TEXT} />
          </TouchableOpacity>

          <Text style={styles.detailHeaderTitle}>Request Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.detailScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.studentCard}>
            <Image source={{ uri: request.avatar }} style={styles.avatarLarge} />

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.detailName}>{request.name}</Text>
              <Text style={styles.detailSub}>
                {request.class} • {request.subject}
              </Text>
              <Text style={styles.detailSub}>
                Topic:{' '}
                <Text style={{ color: PRIMARY, fontWeight: '700' }}>
                  {request.topic}
                </Text>
              </Text>
              <Text style={styles.detailSub}>Requested: {request.requestedTime}</Text>
              <Text style={styles.detailSub}>
                Date: {formatDateLabel(request.preferredDate)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Message from Student</Text>

            <View style={styles.messageBox}>
              <Text style={styles.messageText}>
                {request.note ||
                  `Hi, I need help with ${request.topic}. Please guide me through the concepts and help me practice problems.`}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propose Session</Text>

            <Text style={styles.fieldLabel}>Select Time Slot</Text>
            <View style={styles.chipsRow}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setSelectedSlot(slot)}
                  style={[styles.chip, selectedSlot === slot && styles.chipActive]}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedSlot === slot && styles.chipTextActive,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Duration</Text>
            <View style={styles.chipsRow}>
              {DURATIONS.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  onPress={() => setSelectedDuration(duration)}
                  style={[
                    styles.chip,
                    selectedDuration === duration && styles.chipActive,
                  ]}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedDuration === duration && styles.chipTextActive,
                    ]}
                  >
                    {duration}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Message to Student (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Add a message for the student..."
              placeholderTextColor={MUTED}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => {
                handleReject(request.id);
                setSelectedRequest(null);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSendProposal}
              activeOpacity={0.85}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={WHITE}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sendBtnText}>Accept & Send</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Requests List Screen ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      <View style={styles.listHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={22} color={WHITE} />
        </TouchableOpacity>

        <Text style={styles.listHeaderTitle}>Tuition Requests</Text>

        <TouchableOpacity activeOpacity={0.85}>
          <Ionicons name="notifications-outline" size={22} color={WHITE} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={[styles.statBox, { borderLeftWidth: 1, borderColor: BORDER }]}>
          <Text style={[styles.statNumber, { color: '#F9A825' }]}>
            {pendingCount}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={[styles.statBox, { borderLeftWidth: 1, borderColor: BORDER }]}>
          <Text style={[styles.statNumber, { color: '#2E7D32' }]}>
            {acceptedCount}
          </Text>
          <Text style={styles.statLabel}>Accepted</Text>
        </View>

        <View style={[styles.statBox, { borderLeftWidth: 1, borderColor: BORDER }]}>
          <Text style={[styles.statNumber, { color: '#C62828' }]}>
            {declinedCount}
          </Text>
          <Text style={styles.statLabel}>Declined</Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            <Ionicons name="person-outline" size={56} color="#C5D2E0" />
            <Text style={styles.emptyTitle}>No Requests</Text>
            <Text style={styles.emptySub}>
              No {activeTab.toLowerCase()} tuition requests found.
            </Text>
            <Text style={styles.emptyHint}>
              When a student sends a request from Student Tutors, it will appear here.
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const request = normalizeRequest(item);
          const statusStyle = getStatusStyle(request.status);

          return (
            <View style={styles.requestCard}>
              <View style={styles.requestTop}>
                <Image source={{ uri: request.avatar }} style={styles.avatar} />

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.requestNameRow}>
                    <Text style={styles.requestName} numberOfLines={1}>
                      {request.name}
                    </Text>

                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: statusStyle.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: statusStyle.text },
                        ]}
                      >
                        {getStatusLabel(request.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.requestSub}>
                    {request.class} • {request.subject}
                  </Text>

                  <Text style={styles.requestSub}>
                    Topic:{' '}
                    <Text style={{ color: PRIMARY, fontWeight: '700' }}>
                      {request.topic}
                    </Text>
                  </Text>

                  <Text style={styles.requestSub}>Time: {request.requestedTime}</Text>
                  <Text style={styles.requestSub}>Duration: {request.duration}</Text>
                </View>
              </View>

              {request.note ? (
                <View style={styles.notePreview}>
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={PRIMARY} />
                  <Text style={styles.notePreviewText} numberOfLines={2}>
                    {request.note}
                  </Text>
                </View>
              ) : null}

              {request.status === 'pending' && (
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(request.id)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color="#C62828"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(request)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={WHITE}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}

              {request.status === 'accepted' && (
                <View style={styles.acceptedBox}>
                  <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                  <Text style={styles.acceptedText}>
                    Accepted. This session is added to schedule.
                  </Text>
                </View>
              )}

              {request.status === 'declined' && (
                <View style={styles.declinedBox}>
                  <Ionicons name="close-circle" size={16} color="#C62828" />
                  <Text style={styles.declinedText}>
                    Declined. Student will see this request status.
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // List Header
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 16,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: WHITE,
  },

  // Detail Header
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: TEXT,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    marginTop: 2,
  },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: PRIMARY,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
  },
  tabTextActive: {
    color: WHITE,
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  requestCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
  },
  requestTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E2E8F0',
  },
  requestNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestName: {
    fontSize: 15,
    fontWeight: '900',
    color: TEXT,
    flex: 1,
  },
  requestSub: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
    marginTop: 3,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  notePreview: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F0FAF8',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CFEDE8',
  },
  notePreviewText: {
    flex: 1,
    fontSize: 12,
    color: TEXT,
    fontWeight: '600',
    lineHeight: 18,
  },
  requestActions: {
    flexDirection: 'row',
    marginTop: 14,
    justifyContent: 'flex-end',
    gap: 10,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  acceptBtnText: {
    color: WHITE,
    fontWeight: '800',
    fontSize: 13,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C62828',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rejectBtnText: {
    color: '#C62828',
    fontWeight: '800',
    fontSize: 13,
  },
  acceptedBox: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 12,
  },
  acceptedText: {
    flex: 1,
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },
  declinedBox: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 12,
  },
  declinedText: {
    flex: 1,
    color: '#C62828',
    fontSize: 12,
    fontWeight: '700',
  },

  // Empty
  emptyBox: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 28,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: TEXT,
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    color: MUTED,
    marginTop: 6,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Detail scroll
  detailScroll: {
    padding: 16,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
  },
  detailName: {
    fontSize: 17,
    fontWeight: '900',
    color: TEXT,
  },
  detailSub: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '600',
    marginTop: 3,
  },

  section: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 12,
  },
  messageBox: {
    backgroundColor: BG,
    borderRadius: 12,
    padding: 12,
  },
  messageText: {
    fontSize: 13,
    color: TEXT,
    lineHeight: 20,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: MUTED,
    marginBottom: 8,
    marginTop: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: BG,
  },
  chipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
  },
  chipTextActive: {
    color: WHITE,
  },
  textArea: {
    backgroundColor: BG,
    borderRadius: 14,
    padding: 14,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 13,
    color: TEXT,
    fontWeight: '600',
    marginTop: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  declineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#C62828',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  declineBtnText: {
    color: '#C62828',
    fontWeight: '900',
    fontSize: 14,
  },
  sendBtn: {
    flex: 2,
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sendBtnText: {
    color: WHITE,
    fontWeight: '900',
    fontSize: 14,
  },
});
