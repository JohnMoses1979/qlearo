

// screens/student/StudentTutorsScreen.js
import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from "../../context/AppContext";
import { buildStudentCategoriesFromTutors } from "./studentCategoryUtils";

// ─── Theme ────────────────────────────────────────────────────────
const PRIMARY      = '#006D6A';
const PRIMARY_LIGHT = '#E6F4F3';
const DARK         = '#07123A';
const SLATE        = '#64748B';
const BORDER       = '#E8EDF2';
const BG           = '#F4F7FB';

// ─── Categories Data ──────────────────────────────────────────────
const categoriesData = [
  {
    id: '1', title: 'School', key: 'school',
    icon: 'school-outline', color: '#006D6A', light: '#E6F4F3',
    subjects: ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'],
    tutorKeys: ['Mathematics', 'Science', 'English', 'Biology', 'Physics', 'Chemistry'],
  },
  {
    id: '2', title: 'Competitive', key: 'competitive',
    icon: 'trophy-outline', color: '#7C3AED', light: '#EDE9FE',
    subjects: ['JEE Maths', 'JEE Physics', 'JEE Chemistry', 'NEET Biology', 'UPSC'],
    tutorKeys: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
  },
  {
    id: '3', title: 'College', key: 'college',
    icon: 'library-outline', color: '#1D4ED8', light: '#DBEAFE',
    subjects: ['Engineering Maths', 'Data Structures', 'Economics', 'Accountancy'],
    tutorKeys: ['Mathematics', 'Physics', 'Chemistry', 'Coding'],
  },
  {
    id: '4', title: 'Coding', key: 'coding',
    icon: 'code-slash-outline', color: '#0F766E', light: '#CCFBF1',
    subjects: ['Python', 'JavaScript', 'Data Structures', 'Web Dev', 'DSA'],
    tutorKeys: ['Coding'],
  },
  {
    id: '5', title: 'Languages', key: 'languages',
    icon: 'language-outline', color: '#B45309', light: '#FEF3C7',
    subjects: ['English Speaking', 'Hindi', 'French', 'German', 'Spanish'],
    tutorKeys: ['Language', 'English'],
  },
  {
    id: '6', title: 'Commerce', key: 'commerce',
    icon: 'bar-chart-outline', color: '#0369A1', light: '#E0F2FE',
    subjects: ['Accountancy', 'Economics', 'Business Studies', 'Statistics'],
    tutorKeys: ['Commerce', 'Economics', 'Accountancy'],
  },
  {
    id: '7', title: 'Science', key: 'science',
    icon: 'flask-outline', color: '#BE185D', light: '#FCE7F3',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Environmental Science'],
    tutorKeys: ['Physics', 'Chemistry', 'Biology', 'Science'],
  },
  {
    id: '8', title: 'Arts', key: 'arts',
    icon: 'color-palette-outline', color: '#C2410C', light: '#FFEDD5',
    subjects: ['Drawing', 'Painting', 'History', 'Political Science', 'Sociology'],
    tutorKeys: ['Arts', 'History'],
  },
];

// ─── Tutors come from AppContext real data ─────────────────────────

// ─── Topics per subject (for Request screen) ─────────────────────
const SUBJECT_TOPICS = {
  Mathematics: ['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics', 'Probability'],
  Physics:     ['Mechanics', 'Electrostatics', 'Optics', 'Thermodynamics', 'Modern Physics', 'Waves'],
  Chemistry:   ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Reactions', 'Electrochemistry'],
  Biology:     ['Human Biology', 'Genetics', 'Ecology', 'Cell Biology', 'Botany', 'Zoology'],
  Science:     ['General Science', 'Environmental Science', 'Basic Physics', 'Basic Chemistry'],
  Coding:      ['Python', 'JavaScript', 'DSA', 'Web Development', 'Database', 'System Design'],
  English:     ['Grammar', 'Spoken English', 'Essay Writing', 'Comprehension', 'Literature'],
  Economics:   ['Microeconomics', 'Macroeconomics', 'Accountancy', 'Business Studies', 'Statistics'],
};
const DEFAULT_TOPICS = ['Topic 1', 'Topic 2', 'Topic 3', 'Other'];

const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '1 Hour', value: 60 },
  { label: '1.5 Hrs', value: 90 },
  { label: '2 Hours', value: 120 },
];

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Tutor&background=006D6A&color=fff&size=200';

const safeText = (value, fallback = '') => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
};

const slugify = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const getTutorImage = (tutor = {}) => {
  return tutor.image || tutor.avatar || tutor.photo || DEFAULT_AVATAR;
};

const formatExperienceText = (value) => {
  const text = String(value ?? "").trim();

  if (!text) return "";

  if (/^\d+(\.\d+)?$/.test(text)) {
    return `${text} yrs`;
  }

  return text
    .replace(/\byears?\b/gi, "yrs")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeTutorForStudent = (tutor = {}) => {
  const id = safeText(tutor.id || tutor.teacherId, `TUTOR_${Date.now()}`);
  const name = safeText(tutor.name || tutor.teacherName || tutor.fullName, 'Tutor');
  const subject = safeText(tutor.subject || tutor.primarySubject, 'General');

  return {
    ...tutor,
    id,
    teacherId: tutor.teacherId || id,
    name,
    subject,
    category: Array.isArray(tutor.category) ? tutor.category : [],
    rating: Number(tutor.rating || 0),
    reviews: Number(tutor.reviews || 0),
    experience: formatExperienceText(tutor.experience || tutor.yearsExperience || ""),
    available: tutor.available !== false,
    image: getTutorImage(tutor),
    sessions: Number(tutor.sessions || tutor.totalSessions || 0),
    bio: safeText(tutor.bio || tutor.about, ''),
    topics: Array.isArray(tutor.topics) && tutor.topics.length > 0 ? tutor.topics : [subject],
  };
};

const tutorMatchesCategory = (tutor, category) => {
  const tutorCategories = Array.isArray(tutor.category) ? tutor.category : [];
  const subject = safeText(tutor.subject).toLowerCase();
  const topics = Array.isArray(tutor.topics) ? tutor.topics : [];
  const categorySubjects = Array.isArray(category.subjects) ? category.subjects : [];
  const categoryKey = slugify(category.key || category.id || category.title);

  const byCategoryKey = tutorCategories
    .map((item) => slugify(item))
    .includes(categoryKey);

  const bySubjects = categorySubjects.some((item) => {
    const title = safeText(item.title || item.name || item).toLowerCase();
    return title.length > 0 && (subject.includes(title) || topics.some((topic) => safeText(topic).toLowerCase().includes(title)));
  });

  const byTopics = topics.some((topic) =>
    categorySubjects.some((item) => {
      const title = safeText(item.title || item.name || item).toLowerCase();
      return title.length > 0 && safeText(topic).toLowerCase().includes(title);
    })
  );

  return byCategoryKey || bySubjects || byTopics;
};

// ─── Star Rating ──────────────────────────────────────────────────
const StarRating = ({ rating, size = 12 }) => {
  const safeRating = Number(rating || 0);
  const full = Math.floor(safeRating);
  const half = safeRating - full >= 0.5;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= full ? 'star' : i === full + 1 && half ? 'star-half' : 'star-outline'}
          size={size}
          color={i <= full || (i === full + 1 && half) ? '#F59E0B' : '#CBD5E1'}
        />
      ))}
    </View>
  );
};

// ─── Back Button ──────────────────────────────────────────────────
const BackButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={shared.backBtn} activeOpacity={0.8}>
    <Ionicons name="arrow-back" size={20} color={DARK} />
  </TouchableOpacity>
);

// ─── Success Screen ───────────────────────────────────────────────
const SuccessScreen = ({ tutor, onDone }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 7 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={successSt.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Animated.View style={[successSt.inner, { opacity: fadeAnim }]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 28 }}>
          <View style={successSt.checkCircle}>
            <Ionicons name="checkmark" size={52} color="#fff" />
          </View>
        </Animated.View>

        <Image source={{ uri: getTutorImage(tutor) }} style={successSt.avatar} />

        <Text style={successSt.title}>Request Sent!</Text>

        <Text style={successSt.subtitle}>
          Your session request has been sent to{'\n'}
          <Text style={{ fontWeight: '800', color: DARK }}>{tutor.name}</Text>.
          {'\n'}You'll receive a confirmation shortly.
        </Text>

        <View style={successSt.infoRow}>
          <View style={successSt.infoChip}>
            <Ionicons name="book-outline" size={14} color={PRIMARY} />
            <Text style={successSt.infoText}>{tutor.subject}</Text>
          </View>

          <View style={successSt.infoChip}>
            <Ionicons name="people-outline" size={14} color={PRIMARY} />
            <Text style={successSt.infoText}>{tutor.sessions} sessions</Text>
          </View>
        </View>

        <TouchableOpacity style={successSt.doneBtn} onPress={onDone} activeOpacity={0.85}>
          <Text style={successSt.doneBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

// ─── Tutor Card ───────────────────────────────────────────────────
const TutorCard = ({ item, isTop, onRequestPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pressIn  = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();

  const pressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();

  const tutor = normalizeTutorForStudent(item);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={cardSt.card}
      >
        <View style={cardSt.avatarWrap}>
          <Image source={{ uri: getTutorImage(tutor) }} style={cardSt.avatar} />
          <View style={tutor.available ? cardSt.onlineDot : cardSt.offlineDot} />
        </View>

        <View style={cardSt.body}>
          <View style={cardSt.nameRow}>
            <Text style={cardSt.name} numberOfLines={1}>{tutor.name}</Text>

            {isTop && (
              <View style={cardSt.topBadge}>
                <Ionicons name="ribbon" size={10} color="#D97706" />
                <Text style={cardSt.topBadgeText}>Top</Text>
              </View>
            )}
          </View>

          <View style={cardSt.subjectPill}>
            <Ionicons name="book-outline" size={11} color={PRIMARY} />
            <Text style={cardSt.subjectText}>{tutor.subject}</Text>
          </View>

          <View style={cardSt.ratingRow}>
            <StarRating rating={tutor.rating} />
            <Text style={cardSt.ratingVal}>{tutor.rating}</Text>
            <Text style={cardSt.ratingCount}>({tutor.reviews} reviews)</Text>
          </View>

          <View style={cardSt.statsRow}>
            <View style={cardSt.statChip}>
              <Ionicons name="briefcase-outline" size={11} color={SLATE} />
              <Text style={cardSt.statText}>
                {tutor.experience ? `${tutor.experience} exp` : "Experience"}
              </Text>
            </View>

            <View style={cardSt.statChip}>
              <Ionicons name="people-outline" size={11} color={SLATE} />
              <Text style={cardSt.statText}>{tutor.sessions} sessions</Text>
            </View>
          </View>

          {Array.isArray(tutor.topics) && tutor.topics.length > 0 ? (
            <View style={cardSt.topicRow}>
              {tutor.topics.slice(0, 3).map((topic) => (
                <View key={topic} style={cardSt.topicTag}>
                  <Text style={cardSt.topicTagText}>{topic}</Text>
                </View>
              ))}

              {tutor.topics.length > 3 && (
                <View style={cardSt.topicTag}>
                  <Text style={cardSt.topicTagText}>+{tutor.topics.length - 3}</Text>
                </View>
              )}
            </View>
          ) : null}

          <View style={cardSt.footer}>
            <View style={tutor.available ? cardSt.availBadge : cardSt.unavailBadge}>
              <View style={tutor.available ? cardSt.availDot : cardSt.unavailDot} />
              <Text style={tutor.available ? cardSt.availText : cardSt.unavailText}>
                {tutor.available ? 'Available Now' : 'Unavailable'}
              </Text>
            </View>

            {tutor.available ? (
              <TouchableOpacity
                style={cardSt.requestBtn}
                onPress={() => onRequestPress(tutor)}
                activeOpacity={0.85}
              >
                <Text style={cardSt.requestBtnText}>Request</Text>
                <Ionicons name="arrow-forward" size={13} color="#fff" />
              </TouchableOpacity>
            ) : (
              <View style={cardSt.notifyBtn}>
                <Ionicons name="notifications-outline" size={13} color={SLATE} />
                <Text style={cardSt.notifyText}>Notify Me</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Request Tutor Screen ─────────────────────────────────────────
const RequestTutorScreen = ({ tutor, onBack, onSubmit }) => {
  const topics = SUBJECT_TOPICS[tutor.subject] || tutor.topics || DEFAULT_TOPICS;
  const [selectedTopic,    setSelectedTopic]    = useState(topics[0]);
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[1]);
  const [note,             setNote]             = useState('');
  const [submitting,       setSubmitting]       = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);

      onSubmit({
        topic: selectedTopic,
        duration: selectedDuration.label,
        durationMinutes: selectedDuration.value,
        note,
        requestedTime: 'Flexible',
      });
    }, 650);
  };

  return (
    <SafeAreaView style={reqSt.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={reqSt.header}>
        <BackButton onPress={onBack} />
        <Text style={reqSt.headerTitle}>Request Session</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        <View style={reqSt.tutorBanner}>
          <Image source={{ uri: getTutorImage(tutor) }} style={reqSt.tutorAvatar} />

          <View style={reqSt.tutorInfo}>
            <Text style={reqSt.tutorName}>{tutor.name}</Text>

            <View style={reqSt.subjectPill}>
              <Ionicons name="book-outline" size={12} color={PRIMARY} />
              <Text style={reqSt.subjectText}>{tutor.subject}</Text>
            </View>

            <View style={reqSt.ratingRow}>
              <StarRating rating={tutor.rating} size={13} />
              <Text style={reqSt.ratingText}>
                {tutor.rating} · {tutor.reviews} reviews
              </Text>
            </View>
          </View>

          <View style={reqSt.expBadge}>
            <Text style={reqSt.expNum}>{tutor.experience || "0 yrs"}</Text>
            <Text style={reqSt.expLabel}>Exp</Text>
          </View>
        </View>

        {tutor.bio ? (
          <View style={reqSt.section}>
            <View style={reqSt.bioCard}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={PRIMARY}
                style={{ marginTop: 1 }}
              />
              <Text style={reqSt.bioText}>{tutor.bio}</Text>
            </View>
          </View>
        ) : null}

        <View style={reqSt.section}>
          <Text style={reqSt.sectionTitle}>Select Topic</Text>
          <Text style={reqSt.sectionSub}>Choose a topic you need help with</Text>

          <View style={reqSt.chipGrid}>
            {topics.map((topic) => (
              <TouchableOpacity
                key={topic}
                style={[reqSt.chip, selectedTopic === topic && reqSt.chipActive]}
                onPress={() => setSelectedTopic(topic)}
                activeOpacity={0.8}
              >
                {selectedTopic === topic && (
                  <Ionicons name="checkmark-circle" size={13} color={PRIMARY} />
                )}
                <Text style={[reqSt.chipText, selectedTopic === topic && reqSt.chipTextActive]}>
                  {topic}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

       

        <View style={reqSt.section}>
          <Text style={reqSt.sectionTitle}>Session Summary</Text>

          <View style={reqSt.summaryCard}>
            <View style={reqSt.summaryRow}>
              <View style={reqSt.summaryIcon}>
                <Ionicons name="person-outline" size={15} color={PRIMARY} />
              </View>
              <Text style={reqSt.summaryLabel}>Tutor</Text>
              <Text style={reqSt.summaryValue} numberOfLines={1}>{tutor.name}</Text>
            </View>

            <View style={reqSt.divider} />

            <View style={reqSt.summaryRow}>
              <View style={reqSt.summaryIcon}>
                <Ionicons name="book-outline" size={15} color={PRIMARY} />
              </View>
              <Text style={reqSt.summaryLabel}>Topic</Text>
              <Text style={reqSt.summaryValue} numberOfLines={1}>{selectedTopic}</Text>
            </View>

            <View style={reqSt.divider} />

           
          </View>
        </View>

        <View style={reqSt.section}>
          <Text style={reqSt.sectionTitle}>Additional Note</Text>
          <Text style={reqSt.sectionSub}>
            Optional — share specific doubts or requirements
          </Text>

          <TextInput
            style={reqSt.noteInput}
            placeholder={`E.g. I need help with ${topics[0]} problems for my upcoming exam...`}
            placeholderTextColor="#B0BCCF"
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={reqSt.bottomBar}>
        <TouchableOpacity
          style={[reqSt.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <Text style={reqSt.submitBtnText}>Sending Request...</Text>
          ) : (
            <>
              <Ionicons
                name="send-outline"
                size={16}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={reqSt.submitBtnText}>Send Request</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Tutors List Screen ───────────────────────────────────────────
const TutorsListScreen = ({ category, tutors, onBack, onRequestPress }) => {
  const [search,          setSearch]          = useState('');
  const [activeSubject,   setActiveSubject]   = useState('All');

  const subjectFilters = [
    'All',
    ...(Array.isArray(category.subjects)
      ? category.subjects.map((subject) => subject.title || subject.name || subject)
      : []),
  ];

  const filtered = useMemo(() => {
    const list = Array.isArray(tutors) ? tutors : [];

    return list.filter((item) => {
      const tutor = normalizeTutorForStudent(item);
      const inCategory = tutorMatchesCategory(tutor, category);

      const inSubject = activeSubject === 'All'
        ? true
        : tutor.subject.toLowerCase().includes(activeSubject.split(' ')[0].toLowerCase()) ||
          tutor.topics?.some((topic) =>
            safeText(topic).toLowerCase().includes(activeSubject.toLowerCase())
          );

      const searchValue = search.trim().toLowerCase();
      const inSearch = searchValue.length === 0 ||
        tutor.name.toLowerCase().includes(searchValue) ||
        tutor.subject.toLowerCase().includes(searchValue) ||
        tutor.topics?.some((topic) =>
          safeText(topic).toLowerCase().includes(searchValue)
        );

      return inCategory && inSubject && inSearch;
    });
  }, [activeSubject, category, search, tutors]);

  const topId = filtered.find((tutor) => tutor.available)?.id;

  return (
    <SafeAreaView style={listSt.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={listSt.header}>
        <BackButton onPress={onBack} />
        <View style={listSt.headerCenter}>
          <Text style={listSt.headerTitle}>{category.title} Tutors</Text>
          <Text style={listSt.headerSub}>
            {filtered.length} tutor{filtered.length !== 1 ? 's' : ''} found
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={listSt.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" />

        <TextInput
          style={listSt.searchInput}
          placeholder="Search by name or subject..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={listSt.subjectScrollContent}
        style={listSt.subjectScroll}
      >
        {subjectFilters.map((subject) => {
          const active = activeSubject === subject;

          return (
            <TouchableOpacity
              key={subject}
              style={[
                listSt.subjectChip,
                active && {
                  backgroundColor: category.color,
                  borderColor: category.color,
                },
              ]}
              onPress={() => setActiveSubject(subject)}
              activeOpacity={0.8}
            >
              <Text style={[listSt.subjectChipText, active && { color: '#fff' }]}>
                {subject}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TutorCard
            item={item}
            isTop={item.id === topId}
            onRequestPress={onRequestPress}
          />
        )}
        ListEmptyComponent={
          <View style={listSt.emptyState}>
            <View style={listSt.emptyIcon}>
              <Ionicons name="person-outline" size={36} color="#CBD5E1" />
            </View>
            <Text style={listSt.emptyTitle}>No real tutors found</Text>
            <Text style={listSt.emptySub}>
              When a teacher creates a tutor profile, it will appear here automatically.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
};

// ─── Categories Screen ────────────────────────────────────────────
const CategoriesScreen = ({ categories = [], onBack, onSelectCategory }) => (
  <SafeAreaView style={catSt.container}>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />

    <View style={catSt.header}>
      <BackButton onPress={onBack} />
      <Text style={catSt.heading}>Find a Tutor</Text>
      <View style={{ width: 40 }} />
    </View>

    <Text style={catSt.subheading}>Select a category to explore tutors</Text>

    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            catSt.card,
            { backgroundColor: item.iconBg || item.light || '#F8FAFC' },
          ]}
          onPress={() => onSelectCategory(item)}
          activeOpacity={0.85}
        >
          <View style={[catSt.iconCircle, { backgroundColor: item.iconColor || item.color || PRIMARY }]}>
            <Text style={{ fontSize: 22 }}>{item.emoji || "📚"}</Text>
          </View>

          <Text style={[catSt.cardTitle, { color: item.iconColor || item.color || PRIMARY }]}>{item.title}</Text>

          <Text style={[catSt.cardSub, { color: (item.iconColor || item.color || PRIMARY) + 'BB' }]}>
            {Array.isArray(item.subjects)
              ? item.subjects.slice(0, 2).map((subject) => subject.title || subject.name || subject).join(', ')
              : ''}
          </Text>

          <View style={catSt.arrowWrap}>
            <Ionicons name="arrow-forward" size={14} color={item.iconColor || item.color || PRIMARY} />
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ padding: 16, gap: 14 }}
      columnWrapperStyle={{ gap: 14 }}
    />
  </SafeAreaView>
);

// ─── Main Export ──────────────────────────────────────────────────
export default function StudentTutorsScreen({ navigation }) {
  const {
    tutors = [],
    requestTutorSession,
    currentUser,
  } = useAppContext();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTutor,    setSelectedTutor]    = useState(null);
  const [showSuccess,      setShowSuccess]      = useState(false);
  const [lastTutor,        setLastTutor]        = useState(null);

  const realTutors = useMemo(
    () => (Array.isArray(tutors) ? tutors.map(normalizeTutorForStudent) : []),
    [tutors]
  );

  const teacherCategories = useMemo(
    () => buildStudentCategoriesFromTutors(realTutors),
    [realTutors]
  );

  const handleSubmit = async (requestData = {}) => {
    if (!selectedTutor) {
      global.showAlert('Tutor Missing', 'Please select a tutor again.');
      return;
    }

    if (typeof requestTutorSession !== 'function') {
      global.showAlert(
        'AppContext Missing',
        'requestTutorSession is not available in AppContext.'
      );
      return;
    }

    let createdRequest = null;

    try {
      createdRequest = await requestTutorSession({
        tutor: selectedTutor,
        tutorId: selectedTutor.id,
        teacherId: selectedTutor.teacherId || selectedTutor.id,
        tutorName: selectedTutor.name,
        teacherName: selectedTutor.name,
        tutorImage: getTutorImage(selectedTutor),
        teacherAvatar: getTutorImage(selectedTutor),

        student: currentUser || undefined,
        studentId: currentUser?.id || currentUser?.studentId || 'STUDENT_001',
        studentName: currentUser?.name || currentUser?.fullName || 'Student',
        studentAvatar: currentUser?.avatar || currentUser?.image || null,
        className: currentUser?.className || currentUser?.class || '',

        subject: selectedTutor.subject,
        topic: requestData.topic,
        duration: requestData.duration,
        durationMinutes: requestData.durationMinutes,
        requestedTime: requestData.requestedTime || 'Flexible',
        note: requestData.note || '',
        message: requestData.note || '',
        language: selectedTutor.language || 'English',
        level: selectedTutor.level || 'Intermediate',
      });
    } catch (error) {
      global.showAlert('Request Failed', error?.message || 'Unable to send request. Please try again.');
      return;
    }

    if (!createdRequest) {
      global.showAlert('Request Failed', 'Unable to send request. Please try again.');
      return;
    }

    setLastTutor(selectedTutor);
    setSelectedTutor(null);
    setShowSuccess(true);
  };

  const handleDone = () => {
    setShowSuccess(false);
    setSelectedCategory(null);
    setLastTutor(null);
    navigation?.navigate?.('StudentDashboard');
  };

  if (showSuccess && lastTutor) {
    return <SuccessScreen tutor={lastTutor} onDone={handleDone} />;
  }

  if (selectedTutor) {
    return (
      <RequestTutorScreen
        tutor={selectedTutor}
        onBack={() => setSelectedTutor(null)}
        onSubmit={handleSubmit}
      />
    );
  }

  if (selectedCategory) {
    return (
      <TutorsListScreen
        category={selectedCategory}
        tutors={realTutors}
        onBack={() => setSelectedCategory(null)}
        onRequestPress={(tutor) => setSelectedTutor(normalizeTutorForStudent(tutor))}
      />
    );
  }

  return (
    <CategoriesScreen
      categories={teacherCategories}
      onBack={() => navigation?.goBack?.()}
      onSelectCategory={setSelectedCategory}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════

const shared = StyleSheet.create({
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Categories ───────────────────────────────────────────────────
const catSt = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: DARK,
  },
  subheading: {
    fontSize: 13,
    color: SLATE,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    minHeight: 148,
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 6,
  },
  arrowWrap: {
    alignSelf: 'flex-end',
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Tutors List ──────────────────────────────────────────────────
const listSt = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
  },
  headerSub: {
    fontSize: 12,
    color: SLATE,
    marginTop: 1,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 0,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DARK,
  },
  subjectScroll: {
    maxHeight: 52,
  },
  subjectScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: SLATE,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 70,
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
  },
  emptySub: {
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

// ─── Card ─────────────────────────────────────────────────────────
const cardSt = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#00000012',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  offlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#CBD5E1',
    borderWidth: 2,
    borderColor: '#fff',
  },
  body: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
  },
  topBadgeText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '800',
  },
  subjectPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: PRIMARY_LIGHT,
    marginBottom: 7,
  },
  subjectText: {
    fontSize: 11,
    color: PRIMARY,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 7,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '800',
    color: DARK,
  },
  ratingCount: {
    fontSize: 11,
    color: SLATE,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statText: {
    fontSize: 10.5,
    color: SLATE,
    fontWeight: '600',
  },
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  topicTag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  topicTagText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  unavailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  availDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  unavailDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  availText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  unavailText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: PRIMARY,
  },
  requestBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  notifyText: {
    color: SLATE,
    fontSize: 12,
    fontWeight: '700',
  },
});

// ─── Request Screen ───────────────────────────────────────────────
const reqSt = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: DARK,
  },
  tutorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    ...Platform.select({
      ios: {
        shadowColor: '#00000010',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 14,
      },
      android: { elevation: 2 },
    }),
  },
  tutorAvatar: {
    width: 66,
    height: 66,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  tutorInfo: {
    flex: 1,
    marginLeft: 13,
  },
  tutorName: {
    fontSize: 17,
    fontWeight: '900',
    color: DARK,
    marginBottom: 6,
  },
  subjectPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: PRIMARY_LIGHT,
    marginBottom: 6,
  },
  subjectText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 12,
    color: SLATE,
    fontWeight: '600',
  },
  expBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
  },
  expLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FB923C',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: DARK,
    marginBottom: 3,
  },
  sectionSub: {
    fontSize: 12,
    color: SLATE,
    marginBottom: 12,
  },
  bioCard: {
    flexDirection: 'row',
    gap: 8,
    padding: 13,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
  },
  bioText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  chipActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY_LIGHT,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: SLATE,
  },
  chipTextActive: {
    color: PRIMARY,
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  durationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  durationBtnActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '800',
    color: SLATE,
  },
  durationTextActive: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  summaryLabel: {
    width: 70,
    fontSize: 12,
    color: SLATE,
    fontWeight: '700',
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: DARK,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 42,
  },
  noteInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    minHeight: 110,
    borderWidth: 1.5,
    borderColor: BORDER,
    padding: 14,
    fontSize: 14,
    color: DARK,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  submitBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
});

// ─── Success Screen Styles ────────────────────────────────────────
const successSt = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: PRIMARY_LIGHT,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: DARK,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: SLATE,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 22,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 36,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PRIMARY_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  doneBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 15,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
