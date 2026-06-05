



// src/context/AppContext.js
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doubtApi } from "../services/doubtApi";
import { studentApi } from "../services/studentApi";
import { teacherApi } from "../services/teacherApi";
import { mockTestApi } from "../services/mockTestApi";
import { videoApi } from "../services/videoApi";
import { tuitionApi } from "../services/tuitionApi";
import { subscriptionApi } from "../services/subscriptionApi";

const AppContext = createContext(null);
const SESSION_STORAGE_KEY = "@qlearo_student_session";
const SESSION_CACHE_KEY = "@qlearo_sessions_cache";

const STATUS = {
  REQUEST_PENDING: "pending",
  REQUEST_ACCEPTED: "accepted",
  REQUEST_DECLINED: "declined",
  REQUEST_CANCELLED: "cancelled",

  SESSION_UPCOMING: "upcoming",
  SESSION_READY: "ready",
  SESSION_LIVE: "live",
  SESSION_COMPLETED: "completed",
  SESSION_CANCELLED: "cancelled",
};

const DEFAULT_STUDENT = {
  id: "STUDENT_001",
  studentId: "STUDENT_001",
  name: "Student",
  role: "student",
  className: "Class 10",
  avatar: null,
  freeDoubtsLeft: 3,
  isPremium: false,
};

const DEFAULT_TEACHER = {
  id: "TEACHER_001",
  teacherId: "TEACHER_001",
  name: "Teacher",
  role: "teacher",
  avatar: null,
};

const STUDY_FREE_LIMIT = 3;

const makeId = (prefix = "ID") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const nowISO = () => new Date().toISOString();

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const isMockTestNotification = (notification) => {
  const id = String(notification?.id || "");
  const type = String(notification?.type || "").toLowerCase();

  return (
    type === "mock_test" ||
    type === "mock_result" ||
    id.startsWith("NOTIF_PUBLISH_") ||
    id.startsWith("NOTIF_RESULT_")
  );
};

const safeArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(
      (item) => item !== undefined && item !== null && item !== ""
    );
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const slugify = (value = "") =>
  String(value || "item")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "item";

const getNameInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "U";

const getReadableDate = (dateValue) => {
  if (!dateValue) return "Today";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getReadableTime = (dateValue) => {
  if (!dateValue) return "Now";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const C = {
  green: "#05B986",
  greenSoft: "#E8FFF7",
  blue: "#236CFF",
  blueSoft: "#EAF2FF",
  purple: "#7C4DFF",
  purpleSoft: "#F2ECFF",
  pink: "#FF4FA3",
  pinkSoft: "#FFF0F8",
  orange: "#FF7A1A",
  orangeSoft: "#FFF1E8",
  cyan: "#10BFD4",
  cyanSoft: "#E8FCFF",
  yellow: "#FFB300",
  yellowSoft: "#FFF8E5",
  danger: "#FF3B7A",
};

const INITIAL_MOCK_DATA = {};

const VISIBILITY_TO_STATUS = {
  Public: "Published",
  Unlisted: "Unlisted",
  Private: "Draft",
};

const normalizeMockTest = (test = {}, extra = {}) => {
  const questionList = safeArray(test.questionList);
  const id = firstValue(test.id, test.testId, makeId("TEST"));

  return {
    id,
    testId: id,
    no: firstValue(test.no, extra.no, "01"),
    title: firstValue(test.title, "Untitled Mock Test"),
    sub: firstValue(test.sub, test.subtitle, extra.sub, "Practice Test"),
    questions: questionList.length || Number(firstValue(test.questions, 0)),
    time: firstValue(test.time, test.duration, "30 min"),
    duration: firstValue(test.duration, test.time, "30 min"),
    level: firstValue(test.level, "Easy"),
    attempts: Number(firstValue(test.attempts, 0)),
    questionList,
    createdBy: firstValue(test.createdBy, extra.createdBy, DEFAULT_TEACHER.id),
    teacherId: firstValue(
      test.teacherId,
      extra.teacherId,
      test.createdBy,
      DEFAULT_TEACHER.id
    ),
    teacherName: firstValue(
      test.teacherName,
      extra.teacherName,
      DEFAULT_TEACHER.name
    ),
    category: firstValue(test.category, extra.category, ""),
    categoryTitle: firstValue(test.categoryTitle, test.category, extra.category, ""),
    categoryId: firstValue(
      test.categoryId,
      extra.categoryId,
      slugify(extra.category || test.category || "")
    ),
    subjectId: firstValue(
      test.subjectId,
      extra.subjectId,
      slugify(extra.subjectName || "subject")
    ),
    subjectName: firstValue(test.subjectName, extra.subjectName, "Subject"),
    isPublished: firstValue(test.isPublished, true),
    createdAt: firstValue(test.createdAt, nowISO()),
    updatedAt: nowISO(),
  };
};

const normalizeSubject = (subject = {}, categoryTitle = "") => {
  const name = firstValue(subject.name, subject.title, "Subject");
  const id = firstValue(subject.id, slugify(`${categoryTitle}_${name}`));

  const list = safeArray(subject.list).map((test, index) =>
    normalizeMockTest(test, {
      no: String(index + 1).padStart(2, "0"),
      category: categoryTitle,
      categoryId: slugify(categoryTitle),
      subjectId: id,
      subjectName: name,
    })
  );

  return {
    id,
    teacherId: firstValue(subject.teacherId, null),
    name,
    desc: firstValue(subject.desc, subject.description, "Mock test subject"),
    tests: list.length,
    questions: list.reduce((sum, test) => sum + Number(test.questions || 0), 0),
    time: firstValue(subject.time, "30 min"),
    emoji: firstValue(subject.emoji, "📝"),
    color: firstValue(subject.color, C.blue),
    soft: firstValue(subject.soft, C.blueSoft),
    list,
  };
};

const normalizeMockCategory = (category = {}) => {
  const title = firstValue(category.title, category.name, "Category");

  const subjects = safeArray(category.subjects).map((subject) =>
    normalizeSubject(subject, title)
  );

  return {
    teacherId: firstValue(category.teacherId, null),
    title,
    subtitle: firstValue(category.subtitle, "Mock Tests"),
    description: firstValue(category.description, `${title} mock tests`),
    emoji: firstValue(category.emoji, "🎓"),
    color: firstValue(category.color, C.green),
    soft: firstValue(category.soft, C.greenSoft),
    subjects,
  };
};

const normalizeVideoCategory = (category = {}) => {
  const title = firstValue(category.title, category.name, "Category");

  return {
    id: firstValue(category.id, slugify(title)),
    title,
    subtitle: firstValue(category.subtitle, "Explanation Videos"),
    description: firstValue(category.description, `${title} explanation videos`),
    emoji: firstValue(category.emoji, "🎥"),
    color: firstValue(category.color, C.green),
    soft: firstValue(category.soft, C.greenSoft),
    sortOrder: Number(firstValue(category.sortOrder, 0)),
    videoCount: Number(firstValue(category.videoCount, 0)),
    createdAt: firstValue(category.createdAt, nowISO()),
    updatedAt: firstValue(category.updatedAt, nowISO()),
    ...category,
  };
};

const normalizeUploadedVideo = (video = {}, extra = {}) => {
  const visibility = firstValue(video.visibility, extra.visibility, "Public");
  const id = firstValue(video.id, video.videoId, extra.id, makeId("VIDEO"));

  return {
    id,
    videoId: firstValue(video.videoId, video.id, id),
    teacherId: firstValue(video.teacherId, extra.teacherId, DEFAULT_TEACHER.id),
    teacherName: firstValue(
      video.teacherName,
      extra.teacherName,
      DEFAULT_TEACHER.name
    ),
    title: firstValue(video.title, extra.title, "Untitled"),
    subject: firstValue(video.subject, extra.subject, ""),
    topic: firstValue(video.topic, extra.topic, ""),
    className: firstValue(video.className, video.class, extra.className, ""),
    description: firstValue(video.description, extra.description, ""),
    duration: firstValue(video.duration, extra.duration, "00:00"),
    views: firstValue(video.views, extra.views, "0"),
    likes: firstValue(video.likes, extra.likes, "0"),
    comments: firstValue(video.comments, extra.comments, "0"),
    rating: firstValue(video.rating, extra.rating, "0"),
    visibility,
    status: firstValue(video.status, VISIBILITY_TO_STATUS[visibility] || "Published"),
    thumbnail: firstValue(video.thumbnail, extra.thumbnail, null),
    videoUrl: firstValue(video.videoUrl, video.url, video.uri, extra.videoUrl, null),
    url: firstValue(video.url, video.videoUrl, video.uri, extra.url, null),
    color: firstValue(video.color, extra.color, "#008F7A"),
    categoryId: firstValue(video.categoryId, extra.categoryId, ""),
    categoryTitle: firstValue(video.categoryTitle, extra.categoryTitle, ""),
    recipientStudentId: firstValue(video.recipientStudentId, extra.recipientStudentId, null),
    recipientStudentName: firstValue(
      video.recipientStudentName,
      extra.recipientStudentName,
      null
    ),
    uploadedAgo: firstValue(video.uploadedAgo, extra.uploadedAgo, "Just now"),
    time: firstValue(video.time, extra.time, "Just now"),
    createdAt: firstValue(video.createdAt, extra.createdAt, nowISO()),
    updatedAt: firstValue(video.updatedAt, extra.updatedAt, nowISO()),
    ...video,
  };
};

const normalizeSubscriptionPayment = (payment = {}) => {
  const id = firstValue(payment.id, payment.paymentId, makeId("SUB"));

  return {
    id,
    paymentId: firstValue(payment.paymentId, id),
    studentId: firstValue(payment.studentId, payment.student?.studentId, payment.student?.id, ""),
    studentName: firstValue(payment.studentName, payment.student?.name, "Student"),
    className: firstValue(payment.className, payment.student?.className, payment.student?.class, ""),
    planId: firstValue(payment.planId, payment.plan, ""),
    planName: firstValue(payment.planName, payment.subscriptionName, payment.plan, "Subscription Plan"),
    billingType: firstValue(payment.billingType, payment.billing, payment.durationLabel, null),
    durationLabel: firstValue(payment.durationLabel, payment.billingType, null),
    amount: Number(firstValue(payment.amount, payment.price, payment.total, 0)),
    paymentMode: firstValue(payment.paymentMode, payment.mode, payment.method, "Online"),
    transactionId: firstValue(payment.transactionId, payment.txnId, payment.paymentId, makeId("TXN")),
    status: firstValue(payment.status, "Paid"),
    paidAt: firstValue(payment.paidAt, payment.paymentDate, payment.createdAt, nowISO()),
    expiresAt: firstValue(payment.expiresAt, payment.subscriptionExpiresAt, null),
    createdAt: firstValue(payment.createdAt, nowISO()),
    updatedAt: firstValue(payment.updatedAt, nowISO()),
    ...payment,
  };
};

const serializeMockQuestionForApi = (question = {}) => {
  const optionMap = question.optionMap || question.options || {};
  const options = Array.isArray(question.options)
    ? question.options
    : [
        optionMap.A || "",
        optionMap.B || "",
        optionMap.C || "",
        optionMap.D || "",
      ];

  return {
    id: question.id,
    question: question.question || "",
    options,
    optionMap: {
      A: options[0] || "",
      B: options[1] || "",
      C: options[2] || "",
      D: options[3] || "",
    },
    correctAnswer: question.correctAnswer || "A",
    answer: question.answer || options[0] || "",
    explanation: question.explanation || "",
    marks: Number(question.marks || 4),
  };
};

const serializeMockTestForApi = (test = {}, extra = {}) => ({
  ...test,
  category: firstValue(test.category, extra.category, ""),
  categoryTitle: firstValue(test.categoryTitle, test.category, extra.category, ""),
  subjectId: firstValue(test.subjectId, extra.subjectId, ""),
  subjectName: firstValue(test.subjectName, extra.subjectName, ""),
  questionList: safeArray(test.questionList).map(serializeMockQuestionForApi),
});

const buildInitialMockData = () => {
  return {};
};

const buildMockDataFromCatalog = (catalog = []) => {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    return {};
  }

  return catalog.reduce((acc, category) => {
    const cleanCategory = normalizeMockCategory(category);
    acc[cleanCategory.title] = cleanCategory;
    return acc;
  }, {});
};

  const normalizeTutor = (tutor = {}) => {
    const id = firstValue(tutor.id, tutor.teacherId, makeId("TUTOR"));
    const name = firstValue(tutor.name, tutor.teacherName, "Teacher");
    const resolvedTutorTotalEarnings = Number(
      firstValue(tutor.totalEarnings, tutor.earnings, tutor.paidAmount, 0)
  );
    const resolvedTutorPaidAmount = Number(firstValue(tutor.paidAmount, 0));
    const resolvedTutorWithdrawnAmount = Number(firstValue(tutor.withdrawnAmount, 0));
    const computedTutorAvailableBalance = Math.max(
      0,
      resolvedTutorPaidAmount - resolvedTutorWithdrawnAmount
    );
  const experienceText = firstValue(tutor.experience, tutor.yearsExperience, "");
  const experienceLabel = experienceText == null ? "" : String(experienceText).trim();
  const experienceMatch = experienceLabel.match(/(\d+(?:\.\d+)?)/);
  const normalizeCategoryEntries = (value) => {
    if (Array.isArray(value)) {
      return value
        .flatMap((item) => normalizeCategoryEntries(item))
        .filter((item) => String(item || "").trim().length > 0);
    }

    if (typeof value === "string") {
      const text = value.trim();
      return text ? [text] : [];
    }

    if (value && typeof value === "object") {
      const text = firstValue(
        value.title,
        value.name,
        value.category,
        value.label,
        value.key,
        value.id,
        ""
      );

      return String(text || "").trim() ? [String(text).trim()] : [];
    }

    return [];
  };

  return {
    id,
    teacherId: firstValue(tutor.teacherId, id),
    name,
    teacherName: firstValue(tutor.teacherName, name),
    subject: firstValue(tutor.subject, tutor.primarySubject, "General"),
    category: normalizeCategoryEntries(tutor.category),
    rating: Number(firstValue(tutor.rating, 0)),
    reviews: Number(firstValue(tutor.reviews, 0)),
    experience: experienceLabel,
    experienceYears: Number(firstValue(tutor.experienceYears, experienceMatch?.[1], 0)),
    available: firstValue(tutor.available, true),
    image: firstValue(tutor.image, tutor.avatar, tutor.photo, null),
    avatar: firstValue(tutor.avatar, tutor.image, tutor.photo, null),
    sessions: Number(firstValue(tutor.sessions, 0)),
    bio: firstValue(tutor.bio, tutor.about, ""),
    topics: safeArray(tutor.topics),
    languages: safeArray(tutor.languages),
    qualification: firstValue(tutor.qualification, ""),
    fee: firstValue(tutor.fee, tutor.price, ""),
    phone: firstValue(tutor.phone, tutor.mobile, ""),
    email: firstValue(tutor.email, ""),
    city: firstValue(tutor.city, tutor.location, ""),
    totalEarnings: resolvedTutorTotalEarnings,
    earnings: Number(firstValue(tutor.earnings, tutor.totalEarnings, tutor.paidAmount, 0)),
    paidAmount: resolvedTutorPaidAmount,
    pendingAmount: Number(firstValue(tutor.pendingAmount, 0)),
    withdrawnAmount: resolvedTutorWithdrawnAmount,
    availableBalance:
      Number.isFinite(Number(tutor.availableBalance)) && Number(tutor.availableBalance) > 0
        ? Number(tutor.availableBalance)
        : computedTutorAvailableBalance,
    lastPayoutStatus: firstValue(tutor.lastPayoutStatus, null),
    lastPayoutAmount: firstValue(tutor.lastPayoutAmount, null),
    lastPayoutMethod: firstValue(tutor.lastPayoutMethod, null),
    lastPayoutTransactionId: firstValue(tutor.lastPayoutTransactionId, null),
    lastPayoutNote: firstValue(tutor.lastPayoutNote, null),
    lastPayoutAt: firstValue(tutor.lastPayoutAt, null),
    lastWithdrawalAmount: firstValue(tutor.lastWithdrawalAmount, null),
    lastWithdrawalMethod: firstValue(tutor.lastWithdrawalMethod, null),
    lastWithdrawalAt: firstValue(tutor.lastWithdrawalAt, null),
    withdrawalHistory: safeArray(tutor.withdrawalHistory),
    verified: Boolean(firstValue(tutor.verified, false)),
    status: firstValue(tutor.status, "active"),
    initials: getNameInitials(name),
    createdAt: firstValue(tutor.createdAt, nowISO()),
    updatedAt: nowISO(),
    ...tutor,
  };
};

const normalizeTuitionRequest = (request = {}) => {
  const id = firstValue(request.id, makeId("REQ"));
  const status = String(firstValue(request.status, STATUS.REQUEST_PENDING)).toLowerCase();
  const proposal = request.proposal || null;

  return {
    id,
    conversationId: firstValue(request.conversationId, makeId("CHAT")),
    tutorId: firstValue(request.tutorId, request.teacherId, DEFAULT_TEACHER.id),
    teacherId: firstValue(request.teacherId, request.tutorId, DEFAULT_TEACHER.id),
    tutorName: firstValue(request.tutorName, request.teacherName, "Teacher"),
    teacherName: firstValue(request.teacherName, request.tutorName, "Teacher"),
    tutorImage: firstValue(request.tutorImage, request.teacherAvatar, null),
    teacherAvatar: firstValue(request.teacherAvatar, request.tutorImage, null),
    studentId: firstValue(request.studentId, DEFAULT_STUDENT.id),
    studentName: firstValue(request.studentName, request.name, "Student"),
    name: firstValue(request.name, request.studentName, "Student"),
    studentAvatar: firstValue(request.studentAvatar, request.avatar, null),
    avatar: firstValue(request.avatar, request.studentAvatar, null),
    className: firstValue(request.className, request.class, ""),
    class: firstValue(request.class, request.className, ""),
    subject: firstValue(request.subject, "General"),
    topic: firstValue(request.topic, "Class Topic"),
    focus: firstValue(request.focus, ""),
    note: firstValue(request.note, ""),
    message: firstValue(request.message, ""),
    duration: firstValue(request.duration, "1 Hour"),
    requestedTime: firstValue(request.requestedTime, "Flexible"),
    preferredDate: firstValue(request.preferredDate, null),
    sessionType: firstValue(request.sessionType, "Video Class"),
    mode: firstValue(request.mode, "Live Class"),
    language: firstValue(request.language, "English"),
    level: firstValue(request.level, "Intermediate"),
    status,
    studentViewed: Boolean(firstValue(request.studentViewed, false)),
    teacherViewed: Boolean(firstValue(request.teacherViewed, false)),
    proposal: proposal
      ? {
          timeSlot: firstValue(proposal.timeSlot, request.requestedTime, "Flexible"),
          date: firstValue(proposal.date, request.preferredDate, null),
          duration: firstValue(proposal.duration, request.duration, "1 Hour"),
          message: firstValue(proposal.message, ""),
          createdAt: firstValue(proposal.createdAt, nowISO()),
        }
      : null,
    sessionId: firstValue(request.sessionId, null),
    declineReason: firstValue(request.declineReason, ""),
    cancelReason: firstValue(request.cancelReason, ""),
    createdAt: firstValue(request.createdAt, nowISO()),
    updatedAt: firstValue(request.updatedAt, nowISO()),
  };
};

  const buildSessionFromRequest = (request = {}, proposal = {}) => {
  const createdAt = nowISO();

  const proposedDate = firstValue(
    proposal.date,
    proposal.sessionDate,
    request.date,
    request.preferredDate,
    createdAt
  );

  const proposedTime = firstValue(
    proposal.time,
    proposal.timeSlot,
    proposal.requestedTime,
    request.requestedTime,
    "Time not selected"
  );

  const duration = firstValue(proposal.duration, request.duration, "1 Hour");
  const sessionId = makeId("SESSION");

  return {
    id: sessionId,
    sessionId,
    requestId: request.id,
    conversationId: firstValue(request.conversationId, `CHAT_${sessionId}`),

    teacherId: request.teacherId,
    tutorId: request.tutorId || request.teacherId,
    tutor: request.tutorName || request.teacherName || "Teacher",
    tutorName: request.tutorName || request.teacherName || "Teacher",
    teacherName: request.teacherName || request.tutorName || "Teacher",
    tutorImage: request.tutorImage || request.teacherAvatar || null,
    teacherAvatar: request.teacherAvatar || request.tutorImage || null,

    studentId: request.studentId,
    student: request.studentName || "Student",
    studentName: request.studentName || "Student",
    studentAvatar: request.studentAvatar || request.avatar || null,

    className: request.className || request.class || "",
    subject: request.subject || "General",
    topic: request.topic || "Class Topic",
    focus: firstValue(request.focus, request.note, request.description, ""),
    note: request.note || "",

    date: getReadableDate(proposedDate),
    rawDate: proposedDate,
    time: proposedTime,
    requestedTime: request.requestedTime || proposedTime,
    timeStart:
      proposal.timeStart ||
      String(proposedTime).split("-")[0]?.trim() ||
      proposedTime,
    timeEnd: proposal.timeEnd || String(proposedTime).split("-")[1]?.trim() || "",
    duration,

    sessionType: firstValue(
      proposal.sessionType,
      request.sessionType,
      "Video Class"
    ),
    mode: firstValue(proposal.mode, request.mode, "Live Class"),
    status: STATUS.SESSION_READY,
    canEnter: true,

    image: request.tutorImage || request.teacherAvatar || request.avatar || null,
    meetingId: firstValue(
      proposal.meetingId,
      `CLS-${sessionId.slice(-6).toUpperCase()}`
    ),
    language: firstValue(proposal.language, request.language, "English"),
    level: firstValue(proposal.level, request.level, "Intermediate"),
    teacherMessage: proposal.message || "",

    studentViewed: false,
    teacherViewed: true,

    startedAt: null,
    endedAt: null,
    completedAt: null,

    rating: 0,
    review: "",

    createdAt,
    updatedAt: createdAt,
    };
};

  const buildDraftSessionFromRequest = (request = {}, proposal = {}) => {
  const createdAt = nowISO();
  const sessionId = makeId("SESSION");

  const proposedDate = firstValue(
    proposal.date,
    proposal.sessionDate,
    request.date,
    request.preferredDate,
    null
  );

  const proposedTime = firstValue(
    proposal.time,
    proposal.timeSlot,
    proposal.requestedTime,
    request.requestedTime,
    "To be scheduled"
  );

  return {
    id: sessionId,
    sessionId,
    requestId: request.id,
    conversationId: firstValue(request.conversationId, `CHAT_${sessionId}`),

    teacherId: request.teacherId,
    tutorId: request.tutorId || request.teacherId,
    tutor: request.tutorName || request.teacherName || "Teacher",
    tutorName: request.tutorName || request.teacherName || "Teacher",
    teacherName: request.teacherName || request.tutorName || "Teacher",
    tutorImage: request.tutorImage || request.teacherAvatar || null,
    teacherAvatar: request.teacherAvatar || request.tutorImage || null,

    studentId: request.studentId,
    student: request.studentName || "Student",
    studentName: request.studentName || "Student",
    studentAvatar: request.studentAvatar || request.avatar || null,

    className: request.className || request.class || "",
    subject: request.subject || "General",
    topic: request.topic || "Class Topic",
    focus: firstValue(request.focus, request.note, request.description, ""),
    note: request.note || "",

    date: proposedDate ? getReadableDate(proposedDate) : "To be scheduled",
    rawDate: proposedDate,
    time: proposedTime,
    requestedTime: request.requestedTime || proposedTime || "Flexible",
    timeStart:
      proposal.timeStart ||
      String(proposedTime).split("-")[0]?.trim() ||
      proposedTime ||
      "",
    timeEnd: proposal.timeEnd || String(proposedTime).split("-")[1]?.trim() || "",
    duration: firstValue(request.duration, "1 Hour"),

    sessionType: firstValue(request.sessionType, "Video Class"),
    mode: firstValue(request.mode, "Live Class"),
    status: STATUS.SESSION_UPCOMING,
    canEnter: false,
    needsScheduling: true,
    scheduledFor: null,
    startAt: null,

    image: request.tutorImage || request.teacherAvatar || request.avatar || null,
    meetingId: null,
    language: firstValue(request.language, "English"),
    level: firstValue(request.level, "Intermediate"),
    teacherMessage: "",

    studentViewed: false,
    teacherViewed: true,

    startedAt: null,
    endedAt: null,
    completedAt: null,

    rating: 0,
    review: "",

    createdAt,
    updatedAt: createdAt,
  };
};

const getSessionStartDateTime = (dateValue, timeValue) => {
  const baseDate = dateValue ? new Date(dateValue) : new Date();

  if (Number.isNaN(baseDate.getTime())) {
    return nowISO();
  }

  const timeText = String(timeValue || "").trim();
  const timeMatch = timeText.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);

  if (timeMatch) {
    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const meridiem = timeMatch[3]?.toUpperCase();

    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate.toISOString();
  }

  const parsed = new Date(`${baseDate.toDateString()} ${timeText}`);
  return Number.isNaN(parsed.getTime()) ? baseDate.toISOString() : parsed.toISOString();
};

const getSessionStatusByStart = (startAt) => {
  const startTime = new Date(startAt).getTime();

  if (Number.isNaN(startTime)) {
    return STATUS.SESSION_UPCOMING;
  }

  const diff = startTime - Date.now();

  if (diff <= 0) {
    return STATUS.SESSION_READY;
  }

  if (diff <= 15 * 60 * 1000) {
    return STATUS.SESSION_READY;
  }

  return STATUS.SESSION_UPCOMING;
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [allDoubts, setAllDoubts] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [videoCategories, setVideoCategories] = useState([]);

  const [mockData, setMockData] = useState({});
  const [teacherMockCatalog, setTeacherMockCatalog] = useState([]);
  const [mockTestResults, setMockTestResults] = useState([]);

  const [subscriptionPayments, setSubscriptionPayments] = useState([]);

  const [tutors, setTutors] = useState([]);
  const [tuitionRequests, setTuitionRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionMessages, setSessionMessages] = useState({});
  const [whiteboardShares, setWhiteboardShares] = useState({});

  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [sessionReminderLog, setSessionReminderLog] = useState({});
  const teacherApprovalAlertLogRef = useRef(new Set());

  const persistCurrentUser = useCallback(async (user) => {
    try {
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn("Failed to persist student session", error);
    }
  }, []);

  const persistSessionsCache = useCallback(async (items = []) => {
    try {
      await AsyncStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(safeArray(items)));
    } catch (error) {
      console.warn("Failed to persist cached sessions", error);
    }
  }, []);

  const restoreSessionsCache = useCallback(async () => {
    try {
      const rawSessions = await AsyncStorage.getItem(SESSION_CACHE_KEY);

      if (!rawSessions) {
        return [];
      }

      const parsedSessions = JSON.parse(rawSessions);
      return safeArray(parsedSessions);
    } catch (error) {
      console.warn("Failed to restore cached sessions", error);
      return [];
    }
  }, []);

  const getUserSignature = useCallback((user = null) => {
    if (!user) {
      return "null";
    }

    const pick = (value) => {
      if (Array.isArray(value)) {
        return value.join("|");
      }

      return value == null ? "" : String(value);
    };

    return [
      pick(user.id),
      pick(user.userId),
      pick(user.studentId),
      pick(user.teacherId),
      pick(user.name),
      pick(user.fullName),
      pick(user.role),
      pick(user.token),
      pick(user.avatar),
      pick(user.image),
      pick(user.email),
      pick(user.phone),
      pick(user.className),
      pick(user.school),
      pick(user.freeDoubtsLeft),
      pick(user.subscriptionStatus),
      pick(user.subscriptionPlan),
      pick(user.subscriptionPlanId),
      pick(user.subscriptionBillingType),
      pick(user.subscriptionAmount),
      pick(user.subscriptionPurchasedAt),
      pick(user.subscriptionExpiresAt),
      pick(user.premiumAccess),
      pick(user.isPremium),
      pick(user.approvalStatus),
      pick(user.qualification),
      pick(user.subjectExpertise),
      pick(user.experience),
      pick(user.bio),
      pick(user.withdrawalMethod),
      pick(user.bankAccountHolderName),
      pick(user.bankName),
      pick(user.bankAccountNumber),
      pick(user.bankIfscCode),
      pick(user.bankBranchName),
      pick(user.upiId),
      pick(user.lastPayoutStatus),
      pick(user.lastPayoutAmount),
      pick(user.paidAmount),
      pick(user.lastPayoutMethod),
      pick(user.lastPayoutTransactionId),
      pick(user.lastPayoutNote),
      pick(user.lastPayoutAt),
      pick(user.totalEarnings),
      pick(user.earnings),
      pick(user.availableBalance),
      pick(user.pendingAmount),
      pick(user.withdrawnAmount),
      pick(user.lastWithdrawalAmount),
      pick(user.lastWithdrawalMethod),
      pick(user.lastWithdrawalAt),
      pick(user.withdrawalHistory),
      pick(user.doubtsSolved),
      pick(user.solved),
      pick(user.sessionCount),
      pick(user.sessions),
      pick(user.reviewCount),
      pick(user.reviews),
      pick(user.averageRating),
      pick(user.rating),
      pick(user.status),
    ].join("::");
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    void persistSessionsCache(sessions);
  }, [authReady, persistSessionsCache, sessions]);

  const setLoggedInUser = useCallback((user = {}) => {
    const { 
      password: _password,
      resetCode: _resetCode,
      reset_code: _reset_code,
      resetCodeExpiresAt: _resetCodeExpiresAt,
      reset_code_expires_at: _reset_code_expires_at,
      ...safeUser
    } = user || {};

    const resolvedTotalEarnings = Number(
      firstValue(safeUser.totalEarnings, safeUser.earnings, safeUser.paidAmount, 0)
    );
    const resolvedPaidAmount = Number(firstValue(safeUser.paidAmount, 0));
    const resolvedWithdrawnAmount = Number(firstValue(safeUser.withdrawnAmount, 0));
    const resolvedPendingAmount = Number(
      firstValue(
        safeUser.pendingAmount,
        Math.max(0, resolvedTotalEarnings - resolvedPaidAmount),
        0
      )
    );
    const hasPayoutFields =
      String(firstValue(safeUser.role, "")).toLowerCase() === "teacher" ||
      Boolean(
        firstValue(
          safeUser.teacherId,
          safeUser.withdrawalMethod,
          safeUser.lastPayoutStatus,
          safeUser.lastPayoutAmount,
          safeUser.availableBalance,
          null
        )
      );
    const resolvedAvailableBalance = hasPayoutFields
      ? Math.max(0, resolvedPaidAmount - resolvedWithdrawnAmount)
      : Number(firstValue(safeUser.availableBalance, 0));

    const cleanUser = {
      id: firstValue(
        safeUser.id,
        safeUser.userId,
        safeUser.teacherId,
        safeUser.studentId,
        makeId("USER")
      ),
      userId: firstValue(safeUser.userId, safeUser.id, makeId("USER")),
      studentId: firstValue(safeUser.studentId, safeUser.id, DEFAULT_STUDENT.id),
      teacherId: firstValue(safeUser.teacherId, safeUser.id, DEFAULT_TEACHER.id),
      name: firstValue(safeUser.name, safeUser.fullName, "User"),
      fullName: firstValue(safeUser.fullName, safeUser.name, "User"),
      role: firstValue(safeUser.role, "student"),
      token: firstValue(safeUser.token, null),
      avatar: firstValue(safeUser.avatar, safeUser.image, safeUser.photo, null),
      image: firstValue(safeUser.image, safeUser.avatar, safeUser.photo, null),
      email: firstValue(safeUser.email, ""),
      phone: firstValue(safeUser.phone, ""),
      className: firstValue(safeUser.className, safeUser.class, ""),
      school: firstValue(safeUser.school, ""),
      withdrawalMethod: firstValue(safeUser.withdrawalMethod, "upi"),
      bankAccountHolderName: firstValue(safeUser.bankAccountHolderName, ""),
      bankName: firstValue(safeUser.bankName, ""),
      bankAccountNumber: firstValue(safeUser.bankAccountNumber, ""),
      bankIfscCode: firstValue(safeUser.bankIfscCode, ""),
      bankBranchName: firstValue(safeUser.bankBranchName, ""),
      upiId: firstValue(safeUser.upiId, ""),
      lastPayoutStatus: firstValue(safeUser.lastPayoutStatus, null),
      lastPayoutAmount: firstValue(safeUser.lastPayoutAmount, null),
      paidAmount: resolvedPaidAmount,
      lastPayoutMethod: firstValue(safeUser.lastPayoutMethod, null),
      lastPayoutTransactionId: firstValue(safeUser.lastPayoutTransactionId, null),
      lastPayoutNote: firstValue(safeUser.lastPayoutNote, null),
      lastPayoutAt: firstValue(safeUser.lastPayoutAt, null),
      withdrawalHistory: safeArray(safeUser.withdrawalHistory),
      favoriteSubjects: safeArray(safeUser.favoriteSubjects),
      freeDoubtsLeft: firstValue(safeUser.freeDoubtsLeft, STUDY_FREE_LIMIT),
      subscriptionStatus: firstValue(safeUser.subscriptionStatus, "inactive"),
      subscriptionPlan: firstValue(safeUser.subscriptionPlan, null),
      subscriptionPlanId: firstValue(safeUser.subscriptionPlanId, null),
      subscriptionBillingType: firstValue(safeUser.subscriptionBillingType, null),
      subscriptionAmount: firstValue(safeUser.subscriptionAmount, 0),
      subscriptionPurchasedAt: firstValue(safeUser.subscriptionPurchasedAt, null),
      subscriptionExpiresAt: firstValue(safeUser.subscriptionExpiresAt, null),
      premiumAccess: Boolean(
        safeUser.premiumAccess ||
          safeUser.isPremium ||
          String(safeUser.subscriptionStatus || "").toLowerCase() === "active"
      ),
      isPremium: Boolean(
        safeUser.isPremium ||
          safeUser.premiumAccess ||
          String(safeUser.subscriptionStatus || "").toLowerCase() === "active"
      ),
      createdAt: firstValue(safeUser.createdAt, nowISO()),
      updatedAt: nowISO(),
      ...safeUser,
      paidAmount: resolvedPaidAmount,
      pendingAmount: resolvedPendingAmount,
      withdrawnAmount: resolvedWithdrawnAmount,
      availableBalance: resolvedAvailableBalance,
      freeDoubtsLeft: firstValue(safeUser.freeDoubtsLeft, STUDY_FREE_LIMIT),
      subscriptionStatus: firstValue(safeUser.subscriptionStatus, "inactive"),
      subscriptionPlan: firstValue(safeUser.subscriptionPlan, null),
      subscriptionPlanId: firstValue(safeUser.subscriptionPlanId, null),
      subscriptionBillingType: firstValue(safeUser.subscriptionBillingType, null),
      subscriptionAmount: firstValue(safeUser.subscriptionAmount, 0),
      subscriptionPurchasedAt: firstValue(safeUser.subscriptionPurchasedAt, null),
      subscriptionExpiresAt: firstValue(safeUser.subscriptionExpiresAt, null),
      premiumAccess: Boolean(
        safeUser.premiumAccess ||
          safeUser.isPremium ||
          String(safeUser.subscriptionStatus || "").toLowerCase() === "active"
      ),
      isPremium: Boolean(
        safeUser.isPremium ||
          safeUser.premiumAccess ||
          String(safeUser.subscriptionStatus || "").toLowerCase() === "active"
      ),
    };

    const nextSignature = getUserSignature(cleanUser);
    let shouldPersist = false;

    setCurrentUser((prev) => {
      if (getUserSignature(prev) === nextSignature) {
        return prev;
      }

      shouldPersist = true;
      return cleanUser;
    });

    if (shouldPersist) {
      persistCurrentUser(cleanUser);
    }
    return cleanUser;
  }, [getUserSignature, persistCurrentUser]);

  const clearLoggedInUser = useCallback(async () => {
    setCurrentUser(null);
    try {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear student session", error);
    }
  }, []);

  const isPremiumSubscriber = useCallback(
    (user = currentUser) =>
      Boolean(
        user?.isPremium ||
          user?.premiumAccess ||
          String(user?.subscriptionStatus || "").toLowerCase() === "active"
      ),
    [currentUser]
  );

  const getRemainingStudyUses = useCallback(
    (user = currentUser) => {
      if (isPremiumSubscriber(user)) {
        return Number.POSITIVE_INFINITY;
      }

      const parsed = Number(user?.freeDoubtsLeft);
      return Number.isFinite(parsed) ? parsed : STUDY_FREE_LIMIT;
    },
    [currentUser, isPremiumSubscriber]
  );

  const createPremiumRequiredError = useCallback((featureLabel = "this feature") => {
    const error = new Error(
      `Free limit completed. Please go Premium to continue using ${featureLabel}.`
    );
    error.code = "PREMIUM_REQUIRED";
    error.featureLabel = featureLabel;
    error.remaining = 0;
    return error;
  }, []);

  const requireStudyAccess = useCallback(
    (featureLabel = "this feature") => {
      if (isPremiumSubscriber(currentUser)) {
        return { allowed: true, premium: true, remaining: Number.POSITIVE_INFINITY };
      }

      const remaining = getRemainingStudyUses(currentUser);

      if (remaining <= 0) {
        throw createPremiumRequiredError(featureLabel);
      }

      return { allowed: true, premium: false, remaining };
    },
    [createPremiumRequiredError, currentUser, getRemainingStudyUses, isPremiumSubscriber]
  );

  const consumeStudyAccess = useCallback(
    (featureLabel = "this feature") => {
      if (isPremiumSubscriber(currentUser)) {
        return { premium: true, remaining: Number.POSITIVE_INFINITY };
      }

      const remaining = getRemainingStudyUses(currentUser);

      if (remaining <= 0) {
        throw createPremiumRequiredError(featureLabel);
      }

      const nextRemaining = Math.max(remaining - 1, 0);
      setLoggedInUser({
        ...currentUser,
        freeDoubtsLeft: nextRemaining,
      });

      return { premium: false, remaining: nextRemaining };
    },
    [
      createPremiumRequiredError,
      currentUser,
      getRemainingStudyUses,
      isPremiumSubscriber,
      setLoggedInUser,
    ]
  );

  const activatePremiumSubscription = useCallback(
    (subscription = {}) => {
      if (!currentUser) {
        return null;
      }

      return setLoggedInUser({
        ...currentUser,
        isPremium: true,
        premiumAccess: true,
        freeDoubtsLeft: 0,
        subscriptionStatus: "active",
        subscriptionPlan: firstValue(
          subscription.planName,
          subscription.subscriptionName,
          subscription.plan,
          currentUser.subscriptionPlan,
          "Premium"
        ),
        subscriptionPlanId: firstValue(
          subscription.planId,
          subscription.subscriptionPlanId,
          currentUser.subscriptionPlanId,
          null
        ),
        subscriptionBillingType: firstValue(
          subscription.billingType,
          subscription.billing,
          currentUser.subscriptionBillingType,
          null
        ),
        subscriptionAmount: Number(
          firstValue(subscription.amount, currentUser.subscriptionAmount, 0)
        ),
        subscriptionPurchasedAt: firstValue(
          subscription.paidAt,
          subscription.createdAt,
          nowISO()
        ),
        subscriptionExpiresAt: firstValue(
          subscription.expiresAt,
          currentUser.subscriptionExpiresAt,
          null
        ),
      });
    },
    [currentUser, setLoggedInUser]
  );

  const restoreLoggedInUser = useCallback(async () => {
    try {
      const rawUser = await AsyncStorage.getItem(SESSION_STORAGE_KEY);

      if (!rawUser) {
        return null;
      }

      const parsedUser = JSON.parse(rawUser);
      setCurrentUser(parsedUser);
      return parsedUser;
    } catch (error) {
      console.warn("Failed to restore student session", error);
      return null;
    }
  }, []);

  const syncTeacherTutorState = useCallback((teacher = {}) => {
    const cleanTutor = normalizeTutor({
      ...teacher,
      id: firstValue(teacher.id, teacher.teacherId),
      teacherId: firstValue(teacher.teacherId, teacher.id),
      name: firstValue(teacher.fullName, teacher.name, teacher.teacherName, "Teacher"),
      teacherName: firstValue(teacher.fullName, teacher.teacherName, teacher.name, "Teacher"),
      subject: firstValue(teacher.subject, teacher.subjectExpertise, teacher.primarySubject, "General"),
      primarySubject: firstValue(teacher.primarySubject, teacher.subjectExpertise, teacher.subject, "General"),
      image: firstValue(teacher.avatar, teacher.image, teacher.photo, null),
      avatar: firstValue(teacher.avatar, teacher.image, teacher.photo, null),
      verified: String(teacher.approvalStatus || "").toUpperCase() === "APPROVED",
      status: firstValue(teacher.approvalStatus, teacher.status, "PENDING_APPROVAL"),
    });

    setTutors((prev) => {
      const exists = prev.some(
        (item) =>
          item.id === cleanTutor.id ||
          item.teacherId === cleanTutor.teacherId
      );

      if (exists) {
        return prev.map((item) =>
          item.id === cleanTutor.id || item.teacherId === cleanTutor.teacherId
            ? { ...item, ...cleanTutor }
            : item
        );
      }

      return [cleanTutor, ...prev];
    });

    return cleanTutor;
  }, []);

  const refreshStudentProfile = useCallback(async (studentId) => {
    const targetStudentId = firstValue(
      studentId,
      currentUser?.studentId,
      currentUser?.id,
      null
    );

    if (!targetStudentId) {
      return null;
    }

    const profile = await studentApi.getStudentProfile(targetStudentId);

    return setLoggedInUser({
      ...currentUser,
      ...profile,
      id: firstValue(profile.id, targetStudentId),
      studentId: firstValue(profile.id, targetStudentId),
      name: firstValue(profile.fullName, profile.name, currentUser?.name, "Student"),
      fullName: firstValue(profile.fullName, profile.name, currentUser?.fullName, "Student"),
      role: "student",
      avatar: firstValue(profile.avatar, currentUser?.avatar, null),
      image: firstValue(profile.avatar, currentUser?.image, null),
      token: currentUser?.token || null,
    });
  }, [currentUser, setLoggedInUser]);

  const loginStudent = useCallback(async (credentials = {}) => {
    const response = await studentApi.loginStudent(credentials);
    const student = response?.student || {};

    return setLoggedInUser({
      ...student,
      token: response?.token || null,
      id: firstValue(student.id, student.studentId),
      studentId: firstValue(student.id, student.studentId),
      name: firstValue(student.fullName, student.name, "Student"),
      fullName: firstValue(student.fullName, student.name, "Student"),
      role: "student",
      avatar: firstValue(student.avatar, null),
      image: firstValue(student.avatar, null),
    });
  }, [setLoggedInUser]);

  const registerStudent = useCallback(async (payload = {}) => {
    const response = await studentApi.registerStudent(payload);
    const student = response?.student || {};

    return {
      ...student,
      token: response?.token || null,
      id: firstValue(student.id, student.studentId),
      studentId: firstValue(student.id, student.studentId),
      name: firstValue(student.fullName, student.name, "Student"),
      fullName: firstValue(student.fullName, student.name, "Student"),
      role: "student",
      avatar: firstValue(student.avatar, null),
      image: firstValue(student.avatar, null),
    };
  }, []);

  const updateStudentProfile = useCallback(async (payload = {}) => {
    const targetStudentId = firstValue(
      currentUser?.studentId,
      currentUser?.id,
      payload.studentId,
      payload.id,
      null
    );

    if (!targetStudentId) {
      throw new Error("Student session not found");
    }

    const updatedProfile = await studentApi.updateStudentProfile(targetStudentId, payload);

    return setLoggedInUser({
      ...currentUser,
      ...updatedProfile,
      id: firstValue(updatedProfile.id, targetStudentId),
      studentId: firstValue(updatedProfile.id, targetStudentId),
      name: firstValue(updatedProfile.fullName, currentUser?.name, "Student"),
      fullName: firstValue(updatedProfile.fullName, currentUser?.fullName, "Student"),
      role: "student",
      avatar: firstValue(updatedProfile.avatar, currentUser?.avatar, null),
      image: firstValue(updatedProfile.avatar, currentUser?.image, null),
      token: currentUser?.token || null,
    });
  }, [currentUser, setLoggedInUser]);

  const uploadStudentAvatar = useCallback(async (fileAsset) => {
    const targetStudentId = firstValue(
      currentUser?.studentId,
      currentUser?.id,
      null
    );

    if (!targetStudentId) {
      throw new Error("Student session not found");
    }

    const updatedProfile = await studentApi.uploadStudentAvatar(targetStudentId, fileAsset);

    return setLoggedInUser({
      ...currentUser,
      ...updatedProfile,
      id: firstValue(updatedProfile.id, targetStudentId),
      studentId: firstValue(updatedProfile.id, targetStudentId),
      name: firstValue(updatedProfile.fullName, currentUser?.name, "Student"),
      fullName: firstValue(updatedProfile.fullName, currentUser?.fullName, "Student"),
      role: "student",
      avatar: firstValue(updatedProfile.avatar, currentUser?.avatar, null),
      image: firstValue(updatedProfile.avatar, currentUser?.image, null),
      token: currentUser?.token || null,
    });
  }, [currentUser, setLoggedInUser]);

  const loginTeacher = useCallback(async (credentials = {}) => {
    const response = await teacherApi.login(credentials);
    const teacher = response?.teacher || {};

    const cleanUser = setLoggedInUser({
      ...teacher,
      token: response?.token || null,
      id: firstValue(teacher.id, teacher.teacherId),
      teacherId: firstValue(teacher.id, teacher.teacherId),
      name: firstValue(teacher.fullName, teacher.name, "Teacher"),
      fullName: firstValue(teacher.fullName, teacher.name, "Teacher"),
      role: "teacher",
      avatar: firstValue(teacher.avatar, null),
      image: firstValue(teacher.avatar, null),
      approvalStatus: firstValue(teacher.approvalStatus, "APPROVED"),
    });

    syncTeacherTutorState(cleanUser);
    return cleanUser;
  }, [setLoggedInUser, syncTeacherTutorState]);

  const initiateTeacherRegistration = useCallback(
    async (payload = {}) => teacherApi.initiateRegistration(payload),
    []
  );

  const verifyTeacherRegistrationOtp = useCallback(
    async (payload = {}) => teacherApi.verifyRegistrationOtp(payload),
    []
  );

  const completeTeacherRegistration = useCallback(async (payload = {}, avatarAsset = null) => {
    const teacher = await teacherApi.completeRegistration(payload);
    let finalTeacher = teacher;

    if (avatarAsset?.uri && teacher?.id) {
      try {
        finalTeacher = await teacherApi.uploadAvatar(teacher.id, avatarAsset);
      } catch (error) {
        console.warn("Teacher profile saved, but avatar upload failed", error);
      }
    }

    syncTeacherTutorState({
      ...finalTeacher,
      role: "teacher",
    });

    return {
      ...finalTeacher,
      id: firstValue(finalTeacher.id, finalTeacher.teacherId),
      teacherId: firstValue(finalTeacher.id, finalTeacher.teacherId),
      name: firstValue(finalTeacher.fullName, finalTeacher.name, "Teacher"),
      fullName: firstValue(finalTeacher.fullName, finalTeacher.name, "Teacher"),
      role: "teacher",
    };
  }, [syncTeacherTutorState]);

  const refreshTeacherProfile = useCallback(async (teacherId) => {
    const targetTeacherId = firstValue(
      teacherId,
      currentUser?.teacherId,
      currentUser?.id,
      null
    );

    if (!targetTeacherId || targetTeacherId === DEFAULT_TEACHER.id) {
      return null;
    }

    let profile = null;

    try {
      profile = await teacherApi.getProfile(targetTeacherId);
    } catch (error) {
      console.warn("Teacher profile refresh skipped, keeping local session", error?.message || error);

      const fallbackUser = setLoggedInUser({
        ...currentUser,
        id: firstValue(currentUser?.id, currentUser?.teacherId, targetTeacherId),
        teacherId: firstValue(currentUser?.teacherId, currentUser?.id, targetTeacherId),
        name: firstValue(currentUser?.fullName, currentUser?.name, "Teacher"),
        fullName: firstValue(currentUser?.fullName, currentUser?.name, "Teacher"),
        role: "teacher",
        token: currentUser?.token || null,
        approvalStatus: firstValue(currentUser?.approvalStatus, "APPROVED"),
      });

      syncTeacherTutorState(fallbackUser);
      return fallbackUser;
    }

    const cleanUser = setLoggedInUser({
      ...currentUser,
      ...profile,
      id: firstValue(profile.id, targetTeacherId),
      teacherId: firstValue(profile.id, targetTeacherId),
      name: firstValue(profile.fullName, profile.name, currentUser?.name, "Teacher"),
      fullName: firstValue(profile.fullName, profile.name, currentUser?.fullName, "Teacher"),
      role: "teacher",
      avatar: firstValue(profile.avatar, currentUser?.avatar, null),
      image: firstValue(profile.avatar, currentUser?.image, null),
      token: currentUser?.token || null,
      approvalStatus: firstValue(profile.approvalStatus, currentUser?.approvalStatus, "APPROVED"),
    });

    syncTeacherTutorState(cleanUser);
    return cleanUser;
  }, [currentUser, setLoggedInUser, syncTeacherTutorState]);

  const updateTeacherProfileRemote = useCallback(async (payload = {}) => {
    const targetTeacherId = firstValue(
      currentUser?.teacherId,
      currentUser?.id,
      payload.teacherId,
      payload.id,
      null
    );

    if (!targetTeacherId) {
      throw new Error("Teacher session not found");
    }

    const updatedProfile = await teacherApi.updateProfile(targetTeacherId, payload);

    const cleanUser = setLoggedInUser({
      ...currentUser,
      ...updatedProfile,
      id: firstValue(updatedProfile.id, targetTeacherId),
      teacherId: firstValue(updatedProfile.id, targetTeacherId),
      name: firstValue(updatedProfile.fullName, currentUser?.name, "Teacher"),
      fullName: firstValue(updatedProfile.fullName, currentUser?.fullName, "Teacher"),
      role: "teacher",
      avatar: firstValue(updatedProfile.avatar, currentUser?.avatar, null),
      image: firstValue(updatedProfile.avatar, currentUser?.image, null),
      token: currentUser?.token || null,
      approvalStatus: firstValue(updatedProfile.approvalStatus, currentUser?.approvalStatus, "APPROVED"),
    });

    syncTeacherTutorState(cleanUser);
    return cleanUser;
  }, [currentUser, setLoggedInUser, syncTeacherTutorState]);

  const uploadTeacherAvatar = useCallback(async (fileAsset) => {
    const targetTeacherId = firstValue(
      currentUser?.teacherId,
      currentUser?.id,
      null
    );

    if (!targetTeacherId) {
      throw new Error("Teacher session not found");
    }

    const updatedProfile = await teacherApi.uploadAvatar(targetTeacherId, fileAsset);

    const cleanUser = setLoggedInUser({
      ...currentUser,
      ...updatedProfile,
      id: firstValue(updatedProfile.id, targetTeacherId),
      teacherId: firstValue(updatedProfile.id, targetTeacherId),
      name: firstValue(updatedProfile.fullName, currentUser?.name, "Teacher"),
      fullName: firstValue(updatedProfile.fullName, currentUser?.fullName, "Teacher"),
      role: "teacher",
      avatar: firstValue(updatedProfile.avatar, currentUser?.avatar, null),
      image: firstValue(updatedProfile.avatar, currentUser?.image, null),
      token: currentUser?.token || null,
      approvalStatus: firstValue(updatedProfile.approvalStatus, currentUser?.approvalStatus, "APPROVED"),
    });

    syncTeacherTutorState(cleanUser);
    return cleanUser;
  }, [currentUser, setLoggedInUser, syncTeacherTutorState]);

  const sendTeacherForgotPasswordCode = useCallback(
    async (payload = {}) => teacherApi.forgotPassword(payload),
    []
  );

  const resetTeacherPassword = useCallback(
    async (payload = {}) => teacherApi.resetPassword(payload),
    []
  );

  const refreshTeacherApprovals = useCallback(async (status = "PENDING_APPROVAL") => {
    const teachers = await teacherApi.getTeachersByStatus(status);
    teachers.forEach((teacher) => syncTeacherTutorState(teacher));

    const normalizedStatus = String(status || "").trim().toUpperCase();
    const isPendingApproval = normalizedStatus === "PENDING_APPROVAL";
    const pendingTeachers = isPendingApproval
      ? teachers.filter((teacher) =>
          String(firstValue(teacher.approvalStatus, teacher.status, status) || "")
            .trim()
            .toUpperCase() === "PENDING_APPROVAL"
        )
      : [];

    if (isPendingApproval && typeof addNotification === "function") {
      const activeIds = new Set(
        pendingTeachers.map((teacher) => String(firstValue(teacher.id, teacher.teacherId, "")))
      );

      for (const seenId of Array.from(teacherApprovalAlertLogRef.current)) {
        if (!activeIds.has(seenId)) {
          teacherApprovalAlertLogRef.current.delete(seenId);
        }
      }

      pendingTeachers.forEach((teacher) => {
        const teacherId = String(firstValue(teacher.id, teacher.teacherId, "")).trim();

        if (!teacherId || teacherApprovalAlertLogRef.current.has(teacherId)) {
          return;
        }

        teacherApprovalAlertLogRef.current.add(teacherId);
        addNotification(
          "Teacher pending approval",
          `${firstValue(teacher.fullName, teacher.teacherName, teacher.name, "Teacher")} is waiting for admin review.`,
          "admin",
          {
            teacherId,
            status: "pending",
            source: "teacher_registration",
          }
        );
      });
    }

    return teachers.map((teacher) =>
      normalizeTutor({
        ...teacher,
        name: firstValue(teacher.fullName, teacher.name, "Teacher"),
        teacherName: firstValue(teacher.fullName, teacher.teacherName, "Teacher"),
        subject: firstValue(teacher.subjectExpertise, teacher.subject, "General"),
        status: firstValue(teacher.approvalStatus, teacher.status, status),
        verified: String(teacher.approvalStatus || "").toUpperCase() === "APPROVED",
      })
    );
  }, [syncTeacherTutorState]);

  const approveTeacherProfile = useCallback(async (teacherId) => {
    const teacher = await teacherApi.approveTeacher(teacherId);
    return syncTeacherTutorState(teacher);
  }, [syncTeacherTutorState]);

  const rejectTeacherProfile = useCallback(async (teacherId) => {
    const teacher = await teacherApi.rejectTeacher(teacherId);
    return syncTeacherTutorState(teacher);
  }, [syncTeacherTutorState]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const restoredUser = await restoreLoggedInUser();

      if (restoredUser?.role === "student") {
        try {
          const profile = await studentApi.getStudentProfile(
            restoredUser.id || restoredUser.studentId
          );

          setLoggedInUser({
            ...restoredUser,
            ...profile,
            id: firstValue(profile.id, restoredUser.id, restoredUser.studentId),
            studentId: firstValue(profile.id, restoredUser.studentId, restoredUser.id),
            name: firstValue(profile.fullName, restoredUser.name, "Student"),
            fullName: firstValue(profile.fullName, restoredUser.fullName, "Student"),
            role: "student",
            token: restoredUser.token || null,
          });
        } catch (error) {
          console.warn("Failed to sync student profile from backend", error);

          setLoggedInUser({
            ...restoredUser,
            id: firstValue(restoredUser.id, restoredUser.studentId),
            studentId: firstValue(restoredUser.studentId, restoredUser.id),
            name: firstValue(restoredUser.fullName, restoredUser.name, "Student"),
            fullName: firstValue(restoredUser.fullName, restoredUser.name, "Student"),
            role: "student",
            token: restoredUser.token || null,
          });
        }
      } else if (restoredUser?.role === "teacher") {
        try {
          const profile = await teacherApi.getProfile(
            restoredUser.id || restoredUser.teacherId
          );

          const cleanUser = setLoggedInUser({
            ...restoredUser,
            ...profile,
            id: firstValue(profile.id, restoredUser.id, restoredUser.teacherId),
            teacherId: firstValue(profile.id, restoredUser.teacherId, restoredUser.id),
            name: firstValue(profile.fullName, restoredUser.name, "Teacher"),
            fullName: firstValue(profile.fullName, restoredUser.fullName, "Teacher"),
            role: "teacher",
            token: restoredUser.token || null,
            approvalStatus: firstValue(profile.approvalStatus, restoredUser.approvalStatus, "APPROVED"),
          });

          syncTeacherTutorState(cleanUser);
        } catch (error) {
          console.warn("Failed to sync teacher profile from backend", error);

          const cleanUser = setLoggedInUser({
            ...restoredUser,
            id: firstValue(restoredUser.id, restoredUser.teacherId),
            teacherId: firstValue(restoredUser.teacherId, restoredUser.id),
            name: firstValue(restoredUser.fullName, restoredUser.name, "Teacher"),
            fullName: firstValue(restoredUser.fullName, restoredUser.name, "Teacher"),
            role: "teacher",
            token: restoredUser.token || null,
            approvalStatus: firstValue(
              restoredUser.approvalStatus,
              "APPROVED"
            ),
          });

          syncTeacherTutorState(cleanUser);
        }
      }

      if (isMounted) {
        setAuthReady(true);
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [restoreLoggedInUser, setLoggedInUser, syncTeacherTutorState]);

  useEffect(() => {
    let cancelled = false;

    const loadMockCatalog = async () => {
      try {
        const catalog = await mockTestApi.getCatalog();

        if (!cancelled) {
          setMockData(buildMockDataFromCatalog(catalog));
        }
      } catch (error) {
        console.warn("Failed to load mock test catalog from backend", error);
      }
    };

    loadMockCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadVideoLibrary = async () => {
      try {
        const [categories, videos] = await Promise.all([
          videoApi.getCategories(),
          videoApi.getVideos(),
        ]);

        if (!cancelled) {
          setVideoCategories(
            Array.isArray(categories) ? categories.map(normalizeVideoCategory) : []
          );
          setUploadedVideos(
            Array.isArray(videos) ? videos.map((video) => normalizeUploadedVideo(video)) : []
          );
        }
      } catch (error) {
        console.warn("Failed to load explanation videos from backend", error);
      }
    };

    loadVideoLibrary();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTeachersForTutoring = async () => {
      try {
        const teachers = await teacherApi.getTeachersByStatus("APPROVED");

        if (!cancelled && Array.isArray(teachers)) {
          teachers.forEach((teacher) => syncTeacherTutorState(teacher));
        }
      } catch (error) {
        console.warn("Failed to load approved teachers from backend", error);
      }
    };

    loadTeachersForTutoring();

    return () => {
      cancelled = true;
    };
  }, [syncTeacherTutorState]);

  const refreshTuitionRequests = useCallback(async () => {
    try {
      const requests = await tuitionApi.getRequests();
      const normalizedRequests = Array.isArray(requests)
        ? requests.map(normalizeTuitionRequest)
        : [];
      setTuitionRequests(normalizedRequests);
      return normalizedRequests;
    } catch (error) {
      console.warn("Failed to load tuition requests from backend", error);
      return [];
    }
  }, []);

  const refreshTeacherMockCatalog = useCallback(
    async (teacherId) => {
      const resolvedTeacherId = firstValue(
        teacherId,
        currentUser?.teacherId,
        currentUser?.id,
        ""
      );

      if (currentUser?.role !== "teacher" || !resolvedTeacherId) {
        setTeacherMockCatalog([]);
        return [];
      }

      try {
        const catalog = await mockTestApi.getTeacherCatalog(resolvedTeacherId);
        const normalizedCatalog = Array.isArray(catalog)
          ? catalog.map((category) => normalizeMockCategory(category))
          : [];
        setTeacherMockCatalog(normalizedCatalog);
        return normalizedCatalog;
      } catch (error) {
        console.warn("Failed to load teacher mock test catalog from backend", error);
        setTeacherMockCatalog([]);
        return [];
      }
    },
    [currentUser?.id, currentUser?.role, currentUser?.teacherId]
  );

  useEffect(() => {
    if (!authReady) {
      return undefined;
    }

    if (currentUser?.role !== "teacher") {
      setTeacherMockCatalog([]);
      return undefined;
    }

    void refreshTeacherMockCatalog(
      firstValue(currentUser?.teacherId, currentUser?.id, "")
    );

    return undefined;
  }, [
    authReady,
    currentUser?.id,
    currentUser?.role,
    currentUser?.teacherId,
    refreshTeacherMockCatalog,
  ]);

    const refreshDoubtsAndNotifications = useCallback(async () => {
      if (!authReady || !currentUser?.role) {
        return;
      }

      const studentId = firstValue(
        currentUser?.studentId,
        currentUser?.id,
        DEFAULT_STUDENT.id
      );

      const teacherId = firstValue(
        currentUser?.teacherId,
        currentUser?.id,
        DEFAULT_TEACHER.teacherId
      );

      try {
        const doubtItems =
          currentUser?.role === "student"
            ? await doubtApi.getStudentDoubts(studentId)
            : await doubtApi.getTeacherDoubts(teacherId);

        if (Array.isArray(doubtItems)) {
          setAllDoubts(doubtItems);
        }
      } catch (error) {
        console.warn("Failed to load doubts from backend", error);
      }

      try {
        const notificationRole = currentUser?.role === "admin"
          ? "admin"
          : currentUser?.role;
        const notificationRecipientId =
          currentUser?.role === "student" ? studentId : "all";

        const doubtNotifications = await doubtApi.getNotifications(
          notificationRole,
          notificationRecipientId
        );

        const extraTeacherNotifications =
          currentUser?.role === "teacher"
            ? await doubtApi.getNotifications(notificationRole, teacherId)
            : [];

        if (Array.isArray(doubtNotifications)) {
          setNotifications((prev) => {
            const byId = new Map();
            [...doubtNotifications, ...extraTeacherNotifications, ...prev].forEach((item) => {
              if (item?.id) {
                byId.set(item.id, item);
              }
            });
            return Array.from(byId.values()).sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
          });
        }
      } catch (error) {
        console.warn("Failed to load doubt notifications from backend", error);
      }
    }, [authReady, currentUser?.id, currentUser?.role, currentUser?.studentId, currentUser?.teacherId]);

    useEffect(() => {
      let cancelled = false;

    const loadDoubtsAndNotifications = async () => {
      if (!authReady || !currentUser?.role) {
        return;
      }

      const studentId = firstValue(
        currentUser?.studentId,
        currentUser?.id,
        DEFAULT_STUDENT.id
      );

      const teacherId = firstValue(
        currentUser?.teacherId,
        currentUser?.id,
        DEFAULT_TEACHER.teacherId
      );

      try {
        const doubtItems =
          currentUser?.role === "student"
            ? await doubtApi.getStudentDoubts(studentId)
            : await doubtApi.getTeacherDoubts(teacherId);

        if (!cancelled && Array.isArray(doubtItems)) {
          setAllDoubts(doubtItems);
        }
      } catch (error) {
        console.warn("Failed to load doubts from backend", error);
      }

      try {
        const doubtNotifications = await doubtApi.getNotifications(
          currentUser?.role,
          currentUser?.role === "student" ? studentId : "all"
        );

        const teacherSpecificNotifications =
          currentUser?.role === "teacher"
            ? await doubtApi.getNotifications(currentUser?.role, teacherId)
            : [];

        if (!cancelled && Array.isArray(doubtNotifications)) {
          setNotifications((prev) => {
            const byId = new Map();
            [...doubtNotifications, ...teacherSpecificNotifications, ...prev].forEach((item) => {
              if (item?.id) {
                byId.set(item.id, item);
              }
            });
            return Array.from(byId.values()).sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
          });
        }
      } catch (error) {
        console.warn("Failed to load doubt notifications from backend", error);
      }

      if (currentUser?.role === "student") {
        try {
          const items = await mockTestApi.getStudentNotifications(studentId);
          if (!cancelled && Array.isArray(items)) {
            setNotifications((prev) => {
              const byId = new Map();
              [...items, ...prev].forEach((item) => {
                if (item?.id) {
                  byId.set(item.id, item);
                }
              });
              return Array.from(byId.values()).sort(
                (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              );
            });
          }
        } catch (error) {
          console.warn("Failed to load student notifications from backend", error);
        }
      }
    };

      void refreshDoubtsAndNotifications();

    return () => {
      cancelled = true;
    };
    }, [refreshDoubtsAndNotifications]);

  useEffect(() => {
    let cancelled = false;

    const loadStudentResults = async () => {
      if (!authReady || currentUser?.role !== "student") {
        return;
      }

      const studentId = firstValue(
        currentUser?.studentId,
        currentUser?.id,
        DEFAULT_STUDENT.id
      );

      if (!studentId) {
        return;
      }

      try {
        const items = await mockTestApi.getStudentResults(studentId);

        if (!cancelled && Array.isArray(items)) {
          setMockTestResults(items);
        }
      } catch (error) {
        console.warn("Failed to load student mock test results from backend", error);
      }
    };

    loadStudentResults();

    return () => {
      cancelled = true;
    };
  }, [authReady, currentUser?.id, currentUser?.role, currentUser?.studentId]);

  useEffect(() => {
    if (!authReady || currentUser?.role !== "admin") {
      return undefined;
    }

    let cancelled = false;

    const mergeNotifications = (incoming = []) => {
      setNotifications((prev) => {
        const byId = new Map();
        [...incoming, ...prev].forEach((item) => {
          if (item?.id) {
            byId.set(item.id, item);
          }
        });

        return Array.from(byId.values()).sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
      });
    };

    const refreshAdminData = async () => {
      try {
        await Promise.all([
          refreshTeacherApprovals("PENDING_APPROVAL"),
          refreshTeacherApprovals("APPROVED"),
          refreshTeacherApprovals("REJECTED"),
        ]);
      } catch (error) {
        console.warn("Failed to refresh admin teacher approvals", error);
      }

      try {
        const adminNotifications = await doubtApi.getNotifications("admin", "all");

        if (!cancelled && Array.isArray(adminNotifications)) {
          mergeNotifications(adminNotifications);
        }
      } catch (error) {
        console.warn("Failed to load admin notifications from backend", error);
      }
    };

    refreshAdminData();
    const timer = setInterval(refreshAdminData, 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authReady, currentUser?.role, refreshTeacherApprovals]);

  const addNotification = useCallback(
    (title, message, type = "general", extra = {}) => {
      const notification = {
        id: firstValue(extra.id, makeId("NOTIF")),
        title: title || "Notification",
        message: message || "",
        type,
        read: false,
        createdAt: nowISO(),
        ...extra,
      };

      setNotifications((prev) => [notification, ...prev]);
      return notification;
    },
    []
  );

  useEffect(() => {
    if (!authReady || !currentUser?.role) {
      return undefined;
    }

    const checkSessionReminders = () => {
      const now = Date.now();
      const thresholdMs = 15 * 60 * 1000;
      const ownerId =
        currentUser?.role === "teacher"
          ? firstValue(currentUser?.teacherId, currentUser?.id, DEFAULT_TEACHER.id)
          : firstValue(currentUser?.studentId, currentUser?.id, DEFAULT_STUDENT.id);

      const ownedSessions =
        currentUser?.role === "teacher"
          ? sessions.filter(
              (item) =>
                item.teacherId === ownerId ||
                item.tutorId === ownerId
            )
          : sessions.filter((item) => item.studentId === ownerId);

      ownedSessions.forEach((session) => {
        const startAt = new Date(
          session.startAt || session.scheduledFor || session.rawDate || session.createdAt || 0
        ).getTime();

        if (Number.isNaN(startAt)) {
          return;
        }

        const delta = startAt - now;
        const reminderKey = `${currentUser.role}:${session.sessionId || session.id}`;

        if (delta <= thresholdMs && delta > -5 * 60 * 1000 && !sessionReminderLog[reminderKey]) {
          const title = delta <= 0 ? "Session is starting now" : "Session Reminder";
          const whenText =
            session.time || getReadableTime(session.startAt || session.scheduledFor || session.rawDate);

          addNotification(
            title,
            `${session.subject || "Your session"} is scheduled for ${
              session.date || getReadableDate(session.startAt || session.scheduledFor || session.rawDate)
            } at ${whenText}.`,
            "session",
            {
              sessionId: session.sessionId || session.id,
              requestId: session.requestId,
              ownerId,
              role: currentUser.role,
            }
          );

          setSessionReminderLog((prev) => ({
            ...prev,
            [reminderKey]: nowISO(),
          }));

          if (typeof tuitionApi.sendSessionReminder === "function") {
            tuitionApi.sendSessionReminder(session.sessionId || session.id, {
              role: currentUser.role,
              ownerId,
            }).catch((error) => {
              console.warn("Failed to persist session reminder", error);
            });
          }
        }
      });
    };

    checkSessionReminders();
    const timer = setInterval(checkSessionReminders, 60 * 1000);

    return () => clearInterval(timer);
  }, [
    addNotification,
    authReady,
    currentUser?.id,
    currentUser?.role,
    currentUser?.studentId,
    currentUser?.teacherId,
    sessionReminderLog,
    sessions,
  ]);

  const markNotificationRead = useCallback((notificationOrId) => {
    const id =
      typeof notificationOrId === "object" && notificationOrId !== null
        ? notificationOrId.id
        : notificationOrId;
    const notification =
      typeof notificationOrId === "object" && notificationOrId !== null
        ? notificationOrId
        : notifications.find((item) => item.id === notificationOrId) || { id };

    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );

    const studentId = firstValue(
      currentUser?.studentId,
      currentUser?.id,
      DEFAULT_STUDENT.id
    );
    const adminRecipientId = "all";

    if (currentUser?.role === "student") {
      if (isMockTestNotification(notification)) {
        void mockTestApi.markStudentNotificationRead(studentId, id).catch((error) => {
          console.warn("Failed to mark student notification as read in backend", error);
        });
      } else {
        void doubtApi.markNotificationRead("student", studentId, id).catch((error) => {
          console.warn("Failed to mark student doubt notification as read in backend", error);
        });
      }
    } else if (currentUser?.role === "teacher") {
      const teacherRecipientId = firstValue(
        currentUser?.teacherId,
        currentUser?.id,
        DEFAULT_TEACHER.teacherId
      );
      const notificationRecipientId = firstValue(
        notifications.find((item) => item.id === id)?.recipientId,
        "all"
      );
      void doubtApi.markNotificationRead("teacher", notificationRecipientId || teacherRecipientId || "all", id).catch((error) => {
        console.warn("Failed to mark teacher notification as read in backend", error);
      });
    } else if (currentUser?.role === "admin") {
      void doubtApi.markNotificationRead("admin", adminRecipientId, id).catch((error) => {
        console.warn("Failed to mark admin notification as read in backend", error);
      });
    }
  }, [currentUser, notifications]);

  const markAllNotificationsRead = useCallback(() => {
    const studentId = firstValue(
      currentUser?.studentId,
      currentUser?.id,
      DEFAULT_STUDENT.id
    );

    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read: true }))
    );

    if (currentUser?.role === "student") {
      notifications
        .filter((item) => !item.read)
        .forEach((item) => {
          if (isMockTestNotification(item)) {
            void mockTestApi
              .markStudentNotificationRead(studentId, item.id)
              .catch((error) => {
                console.warn(
                  "Failed to mark student notification as read in backend",
                  error
                );
              });
          } else {
            void doubtApi.markNotificationRead("student", studentId, item.id).catch((error) => {
              console.warn(
                "Failed to mark student doubt notification as read in backend",
                error
              );
            });
          }
        });
    } else if (currentUser?.role === "teacher") {
      notifications
        .filter((item) => !item.read)
        .forEach((item) => {
          const notificationRecipientId =
            item?.recipientId === null || item?.recipientId === undefined || item?.recipientId === ""
              ? "all"
              : item.recipientId;
          void doubtApi.markNotificationRead("teacher", notificationRecipientId, item.id).catch((error) => {
            console.warn(
              "Failed to mark teacher notification as read in backend",
              error
            );
          });
        });
    } else if (currentUser?.role === "admin") {
      notifications
        .filter((item) => !item.read)
        .forEach((item) => {
          void doubtApi.markNotificationRead("admin", "all", item.id).catch((error) => {
            console.warn(
              "Failed to mark admin notification as read in backend",
              error
            );
          });
        });
    }
  }, [currentUser, notifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const registerTutor = useCallback(
    (tutor = {}) => {
      const cleanTutor = normalizeTutor(tutor);
      let isNewTutor = false;

      setTutors((prev) => {
        const exists = prev.some(
          (item) =>
            item.id === cleanTutor.id ||
            item.teacherId === cleanTutor.teacherId
        );

        if (exists) {
          return prev.map((item) =>
            item.id === cleanTutor.id ||
            item.teacherId === cleanTutor.teacherId
              ? normalizeTutor({
                  ...item,
                  ...cleanTutor,
                  id: item.id || cleanTutor.id,
                  teacherId: item.teacherId || cleanTutor.teacherId,
                  createdAt: item.createdAt || cleanTutor.createdAt,
                  updatedAt: nowISO(),
                })
              : item
          );
        }

        isNewTutor = true;
        return [cleanTutor, ...prev];
      });

      if (isNewTutor) {
        addNotification(
          "Tutor Profile Ready",
          `${cleanTutor.name} is now available for student requests.`,
          "teacher",
          {
            teacherId: cleanTutor.teacherId,
            tutorId: cleanTutor.id,
          }
        );
      }

      return cleanTutor;
    },
    [addNotification]
  );

  const updateTutorProfile = useCallback((tutorId, updates = {}) => {
    const targetId = firstValue(
      tutorId,
      updates.id,
      updates.teacherId,
      makeId("TUTOR")
    );

    let updatedTutor = null;

    setTutors((prev) => {
      const exists = prev.some(
        (item) => item.id === targetId || item.teacherId === targetId
      );

      if (!exists) {
        updatedTutor = normalizeTutor({
          ...updates,
          id: firstValue(updates.id, targetId),
          teacherId: firstValue(updates.teacherId, targetId),
          createdAt: nowISO(),
          updatedAt: nowISO(),
        });

        return [updatedTutor, ...prev];
      }

      return prev.map((item) => {
        if (item.id !== targetId && item.teacherId !== targetId) {
          return item;
        }

        updatedTutor = normalizeTutor({
          ...item,
          ...updates,
          id: item.id || targetId,
          teacherId: item.teacherId || targetId,
          createdAt: item.createdAt || updates.createdAt || nowISO(),
          updatedAt: nowISO(),
        });

        return updatedTutor;
      });
    });

    return updatedTutor;
  }, []);

  const removeTutorProfile = useCallback((tutorId) => {
    setTutors((prev) =>
      prev.filter((item) => item.id !== tutorId && item.teacherId !== tutorId)
    );

    return true;
  }, []);

  const updateTutorAvailability = useCallback((tutorId, available) => {
    setTutors((prev) =>
      prev.map((item) =>
        item.id === tutorId || item.teacherId === tutorId
          ? {
              ...item,
              available: Boolean(available),
              updatedAt: nowISO(),
            }
          : item
      )
    );

    return true;
  }, []);

  const getTutorById = useCallback(
    (id) =>
      tutors.find((item) => item.id === id || item.teacherId === id) || null,
    [tutors]
  );

  const requestTutorSession = useCallback(
    async (payload = {}) => {
      requireStudyAccess("Tutor Request");

      const student = payload.student || currentUser || DEFAULT_STUDENT;
      const tutor = payload.tutor || {};

      const requestPayload = {
        teacherId: firstValue(payload.teacherId, tutor.teacherId, tutor.id, DEFAULT_TEACHER.id),
        teacherName: firstValue(payload.teacherName, tutor.name, tutor.teacherName, "Teacher"),
        teacherAvatar: firstValue(payload.teacherAvatar, tutor.avatar, tutor.image, null),
        studentId: firstValue(
          payload.studentId,
          student.studentId,
          student.id,
          DEFAULT_STUDENT.id
        ),
        studentName: firstValue(payload.studentName, student.name, "Student"),
        studentAvatar: firstValue(payload.studentAvatar, student.avatar, student.image, null),
        className: firstValue(
          payload.className,
          payload.class,
          student.className,
          student.class,
          ""
        ),
        subject: firstValue(payload.subject, tutor.subject, "General"),
        topic: firstValue(payload.topic, "Class Topic"),
        focus: firstValue(payload.focus, payload.note, payload.description, ""),
        note: firstValue(payload.note, payload.message, payload.description, ""),
        message: firstValue(payload.message, payload.note, ""),
        duration: firstValue(payload.duration, "1 Hour"),
        requestedTime: firstValue(payload.requestedTime, payload.time, "Flexible"),
        preferredDate: firstValue(payload.preferredDate, payload.date, nowISO()),
        sessionType: firstValue(payload.sessionType, "Video Class"),
        mode: firstValue(payload.mode, "Live Class"),
        language: firstValue(payload.language, "English"),
        level: firstValue(payload.level, "Intermediate"),
      };

      const savedRequest = await tuitionApi.createRequest(requestPayload);
      const request = normalizeTuitionRequest(savedRequest);

      setTuitionRequests((prev) => [request, ...prev.filter((item) => item.id !== request.id)]);

      setChatList((prev) => [
        {
          id: request.conversationId,
          requestId: request.id,
          name: request.tutorName,
          role: "Tutor",
          avatar: request.tutorImage,
          message: `Request sent for ${request.topic}`,
          type: "Tutors",
          unread: 0,
          sent: true,
          seen: false,
          time: "Now",
          updatedAt: request.createdAt,
        },
        ...prev.filter((item) => item.id !== request.conversationId),
      ]);

      addNotification(
        "Request Sent",
        `Your session request was sent to ${request.tutorName}.`,
        "student",
        {
          studentId: request.studentId,
          requestId: request.id,
        }
      );

      consumeStudyAccess("Tutor Request");

      return request;
    },
    [
      addNotification,
      consumeStudyAccess,
      currentUser,
      requireStudyAccess,
    ]
  );

  const acceptTuitionRequest = useCallback(
    async (requestId, proposal = {}) => {
      const teacherId = firstValue(currentUser?.teacherId, currentUser?.id, DEFAULT_TEACHER.id);
      const savedRequest = await tuitionApi.acceptRequest(requestId, teacherId, proposal);
      const acceptedRequest = normalizeTuitionRequest(savedRequest);

      setTuitionRequests((prev) =>
        prev.map((request) => (request.id === acceptedRequest.id ? acceptedRequest : request))
      );

      setSessions((prev) => {
        const existing = prev.find(
          (item) => item.requestId === acceptedRequest.id || item.sessionId === acceptedRequest.sessionId
        );

        if (existing) {
          return prev.map((item) =>
            item.requestId === acceptedRequest.id || item.sessionId === acceptedRequest.sessionId
              ? {
                  ...item,
                  ...acceptedRequest,
                  status: firstValue(item.status, STATUS.SESSION_UPCOMING),
                  needsScheduling: true,
                  canEnter: false,
                  updatedAt: nowISO(),
                }
              : item
          );
        }

        const draftSession = buildDraftSessionFromRequest({
          ...acceptedRequest,
          teacherId: acceptedRequest.teacherId,
          tutorId: acceptedRequest.tutorId,
          teacherName: acceptedRequest.teacherName,
          tutorName: acceptedRequest.tutorName,
          teacherAvatar: acceptedRequest.teacherAvatar,
          tutorImage: acceptedRequest.tutorImage,
        }, proposal);

        return [draftSession, ...prev];
      });

      addNotification(
        "Session Accepted",
        `${acceptedRequest.tutorName} accepted your ${acceptedRequest.subject} session request.`,
        "student",
        {
          studentId: acceptedRequest.studentId,
          requestId,
        }
      );

      if (currentUser?.role === "teacher" && typeof refreshTeacherProfile === "function") {
        void refreshTeacherProfile(teacherId).catch((error) => {
          console.warn("Failed to refresh teacher profile after accepting a session", error);
        });
      }

      return acceptedRequest;
    },
    [addNotification, currentUser, refreshTeacherProfile]
  );

  const createTuitionSession = useCallback(
    async (requestId, schedule = {}) => {
      const teacherId = firstValue(currentUser?.teacherId, currentUser?.id, DEFAULT_TEACHER.id);
      const request = getRequestById(requestId);

      if (!request) {
        throw new Error("Tuition request not found");
      }

      if (
        String(request.status || "").toLowerCase() !== STATUS.REQUEST_ACCEPTED &&
        String(request.status || "").toLowerCase() !== "accepted"
      ) {
        throw new Error("Only accepted requests can be scheduled");
      }

      if (!String(schedule.date || "").trim() || !String(schedule.time || "").trim()) {
        throw new Error("Session date and time are required");
      }

      const sessionStartAt = getSessionStartDateTime(
        firstValue(schedule.date, request.preferredDate, nowISO()),
        firstValue(schedule.time, schedule.timeSlot, request.requestedTime, "10:00 AM")
      );
      const sessionDuration = firstValue(schedule.duration, request.duration, "1 Hour");
      const sessionStatus = getSessionStatusByStart(sessionStartAt);

      const payload = {
        requestId,
        teacherId,
        studentId: request.studentId,
        subject: firstValue(schedule.subject, request.subject, "General"),
        topic: firstValue(schedule.topic, request.topic, "Class Topic"),
        focus: firstValue(schedule.focus, request.focus, request.note, ""),
        note: firstValue(schedule.note, request.note, ""),
        date: firstValue(schedule.date, request.preferredDate, nowISO()),
        time: firstValue(schedule.time, schedule.timeSlot, request.requestedTime, "10:00 AM"),
        duration: sessionDuration,
        sessionType: firstValue(schedule.sessionType, request.sessionType, "Video Class"),
        mode: firstValue(schedule.mode, request.mode, "Live Class"),
        language: firstValue(schedule.language, request.language, "English"),
        level: firstValue(schedule.level, request.level, "Intermediate"),
        meetingId: firstValue(schedule.meetingId, null),
        message: firstValue(schedule.message, ""),
        startAt: sessionStartAt,
        status: sessionStatus,
      };

      let savedSession = null;
      try {
        savedSession = await tuitionApi.createSession?.(payload);
      } catch (error) {
        console.warn("Failed to persist tuition session to backend", error);
      }

      const sessionBase = buildSessionFromRequest(
        {
          ...request,
          requestedTime: payload.time,
          duration: payload.duration,
          preferredDate: payload.date,
        },
        {
          date: payload.date,
          timeSlot: payload.time,
          duration: payload.duration,
          message: payload.message,
          sessionType: payload.sessionType,
          mode: payload.mode,
          language: payload.language,
          level: payload.level,
          meetingId: payload.meetingId,
          startAt: payload.startAt,
        }
      );

      const createdSession = normalizeTuitionRequest({
        ...sessionBase,
        ...savedSession,
        id: firstValue(savedSession?.id, sessionBase.id),
        sessionId: firstValue(savedSession?.sessionId, sessionBase.sessionId),
        requestId,
        teacherId: firstValue(savedSession?.teacherId, sessionBase.teacherId),
        tutorId: firstValue(savedSession?.tutorId, sessionBase.tutorId),
        studentId: firstValue(savedSession?.studentId, sessionBase.studentId),
        subject: firstValue(savedSession?.subject, sessionBase.subject),
        topic: firstValue(savedSession?.topic, sessionBase.topic),
        date: firstValue(savedSession?.date, sessionBase.date),
        rawDate: firstValue(savedSession?.rawDate, payload.startAt, sessionBase.rawDate),
        time: firstValue(savedSession?.time, sessionBase.time),
        duration: firstValue(savedSession?.duration, sessionBase.duration),
        sessionType: firstValue(savedSession?.sessionType, sessionBase.sessionType),
        mode: firstValue(savedSession?.mode, sessionBase.mode),
        language: firstValue(savedSession?.language, sessionBase.language),
        level: firstValue(savedSession?.level, sessionBase.level),
        meetingId: firstValue(savedSession?.meetingId, sessionBase.meetingId),
        status: firstValue(savedSession?.status, sessionStatus),
        canEnter: sessionStatus !== STATUS.SESSION_UPCOMING,
        reminderSentAt: firstValue(savedSession?.reminderSentAt, null),
      });

      createdSession.startAt = firstValue(savedSession?.startAt, payload.startAt, sessionStartAt);
      createdSession.scheduledFor = firstValue(
        savedSession?.scheduledFor,
        payload.startAt,
        sessionStartAt
      );
      createdSession.requestId = requestId;
      createdSession.canEnter = sessionStatus !== STATUS.SESSION_UPCOMING;
      createdSession.meetingId = firstValue(
        savedSession?.meetingId,
        payload.meetingId,
        createdSession.meetingId,
        null
      );
      createdSession.teacherMessage = firstValue(
        savedSession?.teacherMessage,
        payload.message,
        ""
      );

      setSessions((prev) => {
        const upserted = prev.map((item) => {
          if (item.requestId !== requestId && item.sessionId !== createdSession.sessionId) {
            return item;
          }

          return {
            ...item,
            ...createdSession,
            needsScheduling: false,
                  canEnter:
                    createdSession.status === STATUS.SESSION_READY ||
                    createdSession.status === STATUS.SESSION_LIVE,
            updatedAt: nowISO(),
          };
        });

        const exists = upserted.some(
          (item) =>
            item.id === createdSession.id ||
            item.sessionId === createdSession.sessionId ||
            item.requestId === requestId
        );

        const next = exists
          ? upserted
          : [createdSession, ...prev];

        return next.sort(
          (a, b) =>
            new Date(a.startAt || a.scheduledFor || a.rawDate || a.createdAt || 0).getTime() -
            new Date(b.startAt || b.scheduledFor || b.rawDate || b.createdAt || 0).getTime()
        );
      });

      setTuitionRequests((prev) =>
        prev.map((item) =>
          item.id === requestId
            ? {
                ...item,
                sessionId: createdSession.sessionId,
                sessionStatus: createdSession.status,
                updatedAt: nowISO(),
              }
            : item
        )
      );

      setSessionMessages((prev) => ({
        ...prev,
        [createdSession.sessionId]: [
          {
            id: makeId("MSG"),
            sessionId: createdSession.sessionId,
            senderId: createdSession.teacherId,
            sender: createdSession.tutorName,
            senderName: createdSession.tutorName,
            senderRole: "teacher",
            type: "text",
            text: `Session scheduled for ${createdSession.date} at ${createdSession.time}.`,
            time: getReadableTime(createdSession.createdAt || nowISO()),
            createdAt: createdSession.createdAt || nowISO(),
            isMe: false,
          },
          ...safeArray(prev[createdSession.sessionId]),
        ],
      }));

      addNotification(
        "Session Scheduled",
        `${createdSession.tutorName} scheduled ${createdSession.subject} for ${createdSession.date} at ${createdSession.time}.`,
        "student",
        {
          studentId: createdSession.studentId,
          requestId,
          sessionId: createdSession.sessionId,
        }
      );

      addNotification(
        "Session Scheduled",
        `Your ${createdSession.subject} session is fixed for ${createdSession.date} at ${createdSession.time}.`,
        "teacher",
        {
          teacherId: createdSession.teacherId,
          requestId,
          sessionId: createdSession.sessionId,
        }
      );

      if (typeof tuitionApi.sendSessionReminder === "function") {
        tuitionApi.sendSessionReminder(createdSession.sessionId).catch((error) => {
          console.warn("Failed to trigger session reminder in backend", error);
        });
      }

      if (currentUser?.role === "teacher" && typeof refreshTeacherProfile === "function") {
        void refreshTeacherProfile(teacherId).catch((error) => {
          console.warn("Failed to refresh teacher profile after creating a session", error);
        });
      }

      return createdSession;
    },
    [addNotification, currentUser, refreshTeacherProfile, tuitionRequests]
  );

  const declineTuitionRequest = useCallback(
    async (requestId, reason = "") => {
      const teacherId = firstValue(currentUser?.teacherId, currentUser?.id, DEFAULT_TEACHER.id);
      const savedRequest = await tuitionApi.declineRequest(requestId, teacherId, { reason });
      const declinedRequest = normalizeTuitionRequest(savedRequest);

      setTuitionRequests((prev) =>
        prev.map((request) => (request.id === declinedRequest.id ? declinedRequest : request))
      );

      addNotification(
        "Request Declined",
        `${declinedRequest.tutorName} declined your ${declinedRequest.subject} session request.`,
        "student",
        {
          studentId: declinedRequest.studentId,
          requestId,
        }
      );

      return declinedRequest;
    },
    [addNotification, currentUser]
  );

  const cancelTuitionRequest = useCallback((requestId, reason = "") => {
    const updatedAt = nowISO();

    setTuitionRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: STATUS.REQUEST_CANCELLED,
              cancelReason: reason,
              updatedAt,
            }
          : request
      )
    );

    return true;
  }, []);

  const markTuitionRequestViewed = useCallback(async (requestId, role = "student") => {
    const savedRequest = await tuitionApi.markViewed(requestId, role);
    const viewedRequest = normalizeTuitionRequest(savedRequest);

    setTuitionRequests((prev) =>
      prev.map((request) => (request.id === viewedRequest.id ? viewedRequest : request))
    );

    return viewedRequest;
  }, []);

  useEffect(() => {
    let cancelled = false;

  const loadTuitionRequests = async () => {
      const requests = await refreshTuitionRequests();
      if (cancelled || !Array.isArray(requests)) {
        return;
      }
    };

    loadTuitionRequests();

    return () => {
      cancelled = true;
    };
  }, [refreshTuitionRequests]);

  useEffect(() => {
    let cancelled = false;

    const loadSessions = async () => {
      const cachedSessions = await restoreSessionsCache();
      let rawSessions = [];

      try {
        const teacherId = firstValue(
          currentUser?.teacherId,
          currentUser?.id,
          DEFAULT_TEACHER.id
        );
        const studentId = firstValue(
          currentUser?.studentId,
          currentUser?.id,
          DEFAULT_STUDENT.id
        );

        rawSessions = currentUser?.role === "teacher"
          ? await tuitionApi.getTeacherSessions?.(teacherId)
          : currentUser?.role === "student"
          ? await tuitionApi.getStudentSessions?.(studentId)
          : await tuitionApi.getSessions?.();
      } catch (error) {
        console.warn("Failed to load tuition sessions from backend", error);
      }

      if (cancelled) {
        return;
      }

      const sourceSessions = [
        ...safeArray(rawSessions),
        ...safeArray(cachedSessions),
      ];

      const mergedSessions = Array.from(
        new Map(
          sourceSessions.map((session) => {
            const key = firstValue(session.id, session.sessionId, makeId("SESSION"));
            return [key, session];
          })
        ).values()
      );

      const normalized = mergedSessions.map((session) =>
        normalizeTuitionRequest({
          ...session,
          id: firstValue(session.id, session.sessionId),
          sessionId: firstValue(session.sessionId, session.id),
          studentId: firstValue(session.studentId, session.student?.studentId, session.student?.id),
          studentName: firstValue(session.studentName, session.student?.name, "Student"),
          teacherId: firstValue(session.teacherId, session.tutorId),
          tutorId: firstValue(session.tutorId, session.teacherId),
          tutorName: firstValue(session.tutorName, session.teacherName, "Teacher"),
          teacherName: firstValue(session.teacherName, session.tutorName, "Teacher"),
          subject: firstValue(session.subject, "General"),
          topic: firstValue(session.topic, "Class Topic"),
          date: firstValue(session.date, session.rawDate, session.preferredDate, session.proposal?.date, null),
          rawDate: firstValue(session.rawDate, session.startAt, session.date, session.preferredDate, null),
          time: firstValue(session.time, session.requestedTime, session.proposal?.timeSlot, "10:00 AM"),
          duration: firstValue(session.duration, session.proposal?.duration, "1 Hour"),
          sessionType: firstValue(session.sessionType, session.proposal?.sessionType, "Video Class"),
          mode: firstValue(session.mode, session.proposal?.mode, "Live Class"),
          language: firstValue(session.language, session.proposal?.language, "English"),
          level: firstValue(session.level, session.proposal?.level, "Intermediate"),
          status: firstValue(session.status, STATUS.SESSION_UPCOMING),
          canEnter: Boolean(session.canEnter),
          startAt: firstValue(session.startAt, session.scheduledFor, null),
          scheduledFor: firstValue(session.scheduledFor, session.startAt, null),
          meetingId: firstValue(session.meetingId, null),
          requestId: firstValue(session.requestId, session.id, null),
          teacherMessage: firstValue(session.teacherMessage, ""),
        })
      );

      setSessions(
        normalized.sort(
          (a, b) =>
            new Date(a.startAt || a.scheduledFor || a.rawDate || 0).getTime() -
            new Date(b.startAt || b.scheduledFor || b.rawDate || 0).getTime()
        )
      );
    };

    loadSessions();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.role, currentUser?.studentId, currentUser?.teacherId]);

  useEffect(() => {
    let cancelled = false;

    const loadSubscriptionPayments = async () => {
      try {
        const payments = await subscriptionApi.getAllPayments();

        if (!cancelled && Array.isArray(payments)) {
          setSubscriptionPayments(
            payments.map((payment) => normalizeSubscriptionPayment(payment))
          );
        }
      } catch (error) {
        console.warn("Failed to load subscription payments from backend", error);
      }
    };

    loadSubscriptionPayments();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSession = useCallback((sessionId, updates = {}) => {
    let updatedSession = null;

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId && session.sessionId !== sessionId) {
          return session;
        }

        updatedSession = {
          ...session,
          ...updates,
          updatedAt: nowISO(),
        };

        return updatedSession;
      })
    );

    const syncPayload = {
      ...updates,
      sessionId,
      id: sessionId,
      updatedAt: nowISO(),
    };

    persistSessionsCache(
      sessions.map((session) =>
        session.id === sessionId || session.sessionId === sessionId
          ? {
              ...session,
              ...updates,
              updatedAt: nowISO(),
            }
          : session
      )
    );

    const backendUpdate =
      tuitionApi.updateSession?.(sessionId, syncPayload) ||
      tuitionApi.saveSession?.(sessionId, syncPayload) ||
      tuitionApi.completeSession?.(sessionId, syncPayload) ||
      tuitionApi.endSession?.(sessionId, syncPayload);

    if (backendUpdate?.catch) {
      backendUpdate.catch((error) => {
        console.warn("Failed to sync session update to backend", error);
      });
    }

    return updatedSession;
  }, [persistSessionsCache, sessions]);

  const startSession = useCallback(
    (sessionId) =>
      updateSession(sessionId, {
        status: STATUS.SESSION_LIVE,
        canEnter: true,
        startedAt: nowISO(),
      }),
    [updateSession]
  );

  const endSession = useCallback(
    (sessionId) =>
      updateSession(sessionId, {
        status: STATUS.SESSION_COMPLETED,
        canEnter: false,
        endedAt: nowISO(),
        completedAt: nowISO(),
      }),
    [updateSession]
  );

  const completeSession = useCallback(
    (sessionId, payload = {}) =>
      updateSession(sessionId, {
        status: STATUS.SESSION_COMPLETED,
        canEnter: false,
        endedAt: firstValue(payload.endedAt, nowISO()),
        completedAt: firstValue(payload.completedAt, nowISO()),
        durationCompleted: payload.durationCompleted || payload.duration || null,
      }),
    [updateSession]
  );

  const cancelSession = useCallback(
    (sessionId, reason = "") =>
      updateSession(sessionId, {
        status: STATUS.SESSION_CANCELLED,
        canEnter: false,
        cancelReason: reason,
        cancelledAt: nowISO(),
      }),
    [updateSession]
  );

  const rateSession = useCallback(
    (sessionId, rating = 0, review = "") =>
      updateSession(sessionId, {
        rating: Number(rating),
        review,
        reviewAdded: true,
      }),
    [updateSession]
  );

  const markSessionViewed = useCallback(
    (sessionId, role = "student") => {
      const updates =
        role === "teacher" ? { teacherViewed: true } : { studentViewed: true };

      return updateSession(sessionId, updates);
    },
    [updateSession]
  );

  const addSessionMessage = useCallback(
    (sessionId, message = {}) => {
      const createdAt = nowISO();

      const newMessage = {
        id: makeId("MSG"),
        sessionId,
        senderId: firstValue(message.senderId, currentUser?.id, "USER"),
        sender: firstValue(message.sender, currentUser?.name, "You"),
        senderName: firstValue(message.senderName, currentUser?.name, "You"),
        senderRole: firstValue(message.senderRole, currentUser?.role, "student"),
        type: firstValue(message.type, "text"),
        text: firstValue(message.text, ""),
        image: firstValue(message.image, null),
        audio: firstValue(message.audio, null),
        video: firstValue(message.video, null),
        whiteboard: firstValue(message.whiteboard, null),
        strokes: safeArray(message.strokes),
        delivered: true,
        seen: false,
        time: firstValue(message.time, getReadableTime(createdAt)),
        createdAt,
        isMe: Boolean(message.isMe),
      };

      setSessionMessages((prev) => ({
        ...prev,
        [sessionId]: [...safeArray(prev[sessionId]), newMessage],
      }));

      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId || session.sessionId === sessionId
            ? {
                ...session,
                lastMessage: newMessage.text || newMessage.type,
                lastMessageAt: createdAt,
                studentViewed: newMessage.senderRole === "student",
                teacherViewed: newMessage.senderRole === "teacher",
                updatedAt: createdAt,
              }
            : session
        )
      );

      return newMessage;
    },
    [currentUser]
  );

  const shareWhiteboardToChat = useCallback(
    (sessionId, payload = {}) => {
      const createdAt = nowISO();

      const share = {
        id: makeId("BOARD"),
        sessionId,
        title: firstValue(payload.title, "Whiteboard Shared"),
        strokes: safeArray(payload.strokes),
        imageUri: firstValue(payload.imageUri, null),
        sender: firstValue(payload.sender, currentUser?.name, "You"),
        senderRole: firstValue(payload.senderRole, currentUser?.role, "teacher"),
        createdAt,
      };

      setWhiteboardShares((prev) => ({
        ...prev,
        [sessionId]: [...safeArray(prev[sessionId]), share],
      }));

      addSessionMessage(sessionId, {
        sender: share.sender,
        senderRole: share.senderRole,
        type: "whiteboard",
        text: share.title,
        whiteboard: share,
        strokes: share.strokes,
      });

      return share;
    },
    [addSessionMessage, currentUser]
  );

  const clearSessionMessages = useCallback((sessionId) => {
    setSessionMessages((prev) => ({
      ...prev,
      [sessionId]: [],
    }));

    return true;
  }, []);

  const getSessionMessages = useCallback(
    (sessionId) => safeArray(sessionMessages[sessionId]),
    [sessionMessages]
  );

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // DOUBTS MODULE - FIXED PROPERLY
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const addDoubt = useCallback(
    async (doubt = {}) => {
      requireStudyAccess("Ask Doubt");

      const now = nowISO();
      const student = doubt.student || currentUser || DEFAULT_STUDENT;

      const payload = {
        studentId: firstValue(
          doubt.studentId,
          student.studentId,
          student.id,
          DEFAULT_STUDENT.id
        ),
        studentName: firstValue(doubt.studentName, student.name, "Student"),
        studentPhoto: firstValue(doubt.studentPhoto, student.avatar, null),
        teacherId: firstValue(doubt.teacherId, doubt.assignedTeacherId, null),
        teacherName: firstValue(doubt.teacherName, doubt.assignedTeacher, null),
        categoryTitle: firstValue(doubt.categoryTitle, doubt.category, doubt.subject, "General"),
        subject: firstValue(doubt.subject, "General"),
        topic: firstValue(doubt.topic, ""),
        className: firstValue(doubt.className, doubt.class, student.className, ""),
        question: firstValue(doubt.question, doubt.title, ""),
        description: firstValue(doubt.description, doubt.question, ""),
        preferredLanguage: firstValue(doubt.preferredLanguage, "English"),
        preferredAnswerType: firstValue(doubt.preferredAnswerType, "Text"),
        attachments: safeArray(doubt.attachments),
        cameraImages: safeArray(doubt.cameraImages),
        galleryImages: safeArray(doubt.galleryImages),
        documents: safeArray(doubt.documents),
        audioUri: firstValue(doubt.audioUri, null),
        videoUri: firstValue(doubt.videoUri, null),
      };

      let backendDoubt = null;

      try {
        backendDoubt = await doubtApi.submitDoubt(
          payload.studentId,
          payload
        );
      } catch (error) {
        console.warn("Failed to submit doubt to backend", error);
      }

      const newDoubt = {
        id: firstValue(doubt.id, makeId("DOUBT")),
        conversationId: firstValue(doubt.conversationId, makeId("CHAT")),
        ...backendDoubt,
        ...doubt,
        studentId: firstValue(backendDoubt?.studentId, payload.studentId),
        studentName: firstValue(backendDoubt?.studentName, payload.studentName),
        studentPhoto: firstValue(backendDoubt?.studentPhoto, payload.studentPhoto),
        subject: firstValue(backendDoubt?.subject, payload.subject),
        topic: firstValue(backendDoubt?.topic, payload.topic),
        className: firstValue(backendDoubt?.className, payload.className),
        question: firstValue(backendDoubt?.question, payload.question),
        title: firstValue(backendDoubt?.question, payload.question),
        description: firstValue(backendDoubt?.description, payload.description),
        attachments: safeArray(backendDoubt?.attachments || payload.attachments),
        cameraImages: safeArray(backendDoubt?.cameraImages || payload.cameraImages),
        galleryImages: safeArray(backendDoubt?.galleryImages || payload.galleryImages),
        images: safeArray([
          ...safeArray(backendDoubt?.cameraImages || payload.cameraImages),
          ...safeArray(backendDoubt?.galleryImages || payload.galleryImages),
        ]),
        documents: safeArray(backendDoubt?.documents || payload.documents),
        audioUri: firstValue(backendDoubt?.audioUri, payload.audioUri),
        videoUri: firstValue(backendDoubt?.videoUri, payload.videoUri),
        preferredLanguage: firstValue(backendDoubt?.preferredLanguage, payload.preferredLanguage),
        preferredAnswerType: firstValue(backendDoubt?.preferredAnswerType, payload.preferredAnswerType),
        status: firstValue(backendDoubt?.status, "Pending"),
        accepted: Boolean(backendDoubt?.accepted),
        answered: Boolean(backendDoubt?.answered),
        assignedTeacher: firstValue(backendDoubt?.teacherName, payload.teacherName),
        assignedTeacherId: firstValue(backendDoubt?.teacherId, payload.teacherId),
        teacherId: firstValue(backendDoubt?.teacherId, payload.teacherId),
        teacherName: firstValue(backendDoubt?.teacherName, payload.teacherName),
        answerType: firstValue(backendDoubt?.answerType, null),
        answerText: firstValue(backendDoubt?.answerText, ""),
        answerAudio: firstValue(backendDoubt?.answerAudio, null),
        answerVideo: firstValue(backendDoubt?.answerVideo, null),
        audioAnswer: firstValue(backendDoubt?.answerAudio, null),
        videoAnswer: firstValue(backendDoubt?.answerVideo, null),
        answerImages: safeArray(backendDoubt?.answerImages),
        answerAttachments: safeArray(backendDoubt?.answerAttachments),
        answerPreview: firstValue(backendDoubt?.answerPreview, ""),
        answeredAt: firstValue(backendDoubt?.answeredAt, null),
        reviewAdded: Boolean(backendDoubt?.reviewAdded),
        rating: Number(firstValue(backendDoubt?.rating, 0)),
        review: firstValue(backendDoubt?.review, ""),
        studentViewed: backendDoubt?.studentViewed ?? true,
        teacherViewed: backendDoubt?.teacherViewed ?? false,
        messages: safeArray(backendDoubt?.messages || doubt.messages),
        lastMessageAt: firstValue(backendDoubt?.lastMessageAt, now),
        createdAt: firstValue(backendDoubt?.createdAt, now),
        updatedAt: firstValue(backendDoubt?.updatedAt, now),
      };

      setAllDoubts((prev) => [newDoubt, ...prev]);
      consumeStudyAccess("Ask Doubt");

      try {
        const recipientId =
          currentUser?.role === "student"
            ? newDoubt.studentId
            : newDoubt.teacherId;
        const recipientRole = currentUser?.role || "student";
        const items = await doubtApi.getNotifications(recipientRole, recipientId || "");
        if (Array.isArray(items)) {
          setNotifications((prev) => {
            const byId = new Map();
            [...items, ...prev].forEach((item) => {
              if (item?.id) {
                byId.set(item.id, item);
              }
            });
            return Array.from(byId.values()).sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
          });
        }
      } catch (error) {
        console.warn("Failed to refresh doubt notifications", error);
      }

      return newDoubt;
    },
    [
      addNotification,
      consumeStudyAccess,
      currentUser,
      requireStudyAccess,
    ]
  );

  const acceptDoubt = useCallback(
    async (doubtId, teacher = {}) => {
      const now = nowISO();

      const teacherId = firstValue(
        teacher.teacherId,
        teacher.id,
        currentUser?.teacherId,
        currentUser?.id,
        DEFAULT_TEACHER.teacherId
      );

      const teacherName = firstValue(
        teacher.name,
        teacher.teacherName,
        currentUser?.name,
        currentUser?.teacherName,
        DEFAULT_TEACHER.name
      );

      let acceptedDoubt = null;

      try {
        const saved = await doubtApi.acceptDoubt(teacherId, doubtId, {
          teacherName,
        });

        acceptedDoubt = {
          ...saved,
          lastMessageAt: firstValue(saved?.lastMessageAt, now),
        };
      } catch (error) {
        console.warn("Failed to accept doubt in backend", error);
      }

      setAllDoubts((prev) =>
        prev.map((item) => {
          if (String(item.id) !== String(doubtId)) {
            return item;
          }

          const nextItem = {
            ...item,
            accepted: true,
            status: "In Progress",

            assignedTeacher: teacherName,
            assignedTeacherId: teacherId,
            teacherId,
            teacherName,

            teacherViewed: true,
            studentViewed: false,

            lastMessageAt: acceptedDoubt?.lastMessageAt || now,
            updatedAt: now,
          };

          return acceptedDoubt ? { ...nextItem, ...acceptedDoubt } : nextItem;
        })
      );

      if (acceptedDoubt) {
        addNotification(
          "Doubt Accepted",
          `${teacherName} accepted your doubt.`,
          "student",
          {
            studentId: acceptedDoubt.studentId,
            doubtId,
            teacherId,
          }
        );
      }

      return acceptedDoubt || true;
    },
    [addNotification, currentUser]
  );

  const deleteDoubt = useCallback((doubtId) => {
    setAllDoubts((prev) =>
      prev.filter((item) => String(item.id) !== String(doubtId))
    );
    return true;
  }, []);

  const addMessage = useCallback(
    (doubtId, message = {}) => {
      const now = nowISO();

      const senderRole = firstValue(message.senderRole, currentUser?.role, "student");

      const newMessage = {
        id: makeId("MSG"),
        sender: firstValue(message.sender, senderRole),
        senderRole,
        type: firstValue(message.type, "text"),
        text: firstValue(message.text, ""),
        audio: firstValue(message.audio, null),
        video: firstValue(message.video, null),
        image: firstValue(message.image, null),
        seen: false,
        delivered: true,
        createdAt: now,
      };

      setAllDoubts((prev) =>
        prev.map((item) =>
          String(item.id) === String(doubtId)
            ? {
                ...item,
                messages: [...safeArray(item.messages), newMessage],
                lastMessageAt: now,
                updatedAt: now,
                studentViewed: senderRole === "student",
                teacherViewed: senderRole === "teacher",
              }
            : item
        )
      );

      return newMessage;
    },
    [currentUser]
  );

  const submitAnswer = useCallback(
    async (doubtId, payload = {}, answerType = "Text") => {
      const now = nowISO();

      const normalizedType = firstValue(answerType, payload.answerType, "Text");

      const answerText = firstValue(
        payload.answerText,
        payload.text,
        payload.answer,
        ""
      );

      const answerAudio = firstValue(
        payload.answerAudio,
        payload.audioUri,
        payload.audio,
        null
      );

      const answerVideo = firstValue(
        payload.answerVideo,
        payload.videoUri,
        payload.video,
        null
      );

      const answerImages = safeArray(payload.answerImages || payload.images);
      const answerAttachments = safeArray(
        payload.answerAttachments || payload.attachments
      );

      const teacherId = firstValue(
        payload.teacherId,
        currentUser?.teacherId,
        currentUser?.id,
        DEFAULT_TEACHER.teacherId
      );

      const teacherName = firstValue(
        payload.teacher,
        payload.teacherName,
        currentUser?.name,
        currentUser?.teacherName,
        DEFAULT_TEACHER.name
      );

      let backendAnswer = null;
      try {
        backendAnswer = await doubtApi.answerDoubt(teacherId, doubtId, {
          teacherName,
          answerType: normalizedType,
          answerText,
          answerAudio,
          answerVideo,
        });
      } catch (error) {
        console.warn("Failed to submit doubt answer to backend", error);
      }

      let updatedDoubt = null;

      setAllDoubts((prev) =>
        prev.map((item) => {
          if (String(item.id) !== String(doubtId)) {
            return item;
          }

          const finalText =
            normalizedType === "Text" ? answerText : item.answerText || "";

          const finalAudio =
            normalizedType === "Audio" ? answerAudio : item.answerAudio || null;

          const finalVideo =
            normalizedType === "Video" ? answerVideo : item.answerVideo || null;

          updatedDoubt = {
            ...item,

            accepted: true,
            answered: true,
            status: "Answered",

            answerType: normalizedType,

            answerText: finalText,
            answerAudio: finalAudio,
            answerVideo: finalVideo,

            audioAnswer: finalAudio,
            videoAnswer: finalVideo,

            answerImages,
            answerAttachments,

            answerPreview:
              normalizedType === "Text"
                ? finalText || "Text Answer"
                : normalizedType === "Audio"
                ? "Audio Answer"
                : "Video Answer",

            assignedTeacher: teacherName,
            assignedTeacherId: teacherId,
            teacherId,
            teacherName,

            studentViewed: false,
            teacherViewed: true,

            answeredAt: now,
            lastMessageAt: now,
            updatedAt: now,

            messages: [
              ...safeArray(item.messages),
              {
                id: makeId("MSG"),
                sender: "teacher",
                senderRole: "teacher",
                type: String(normalizedType).toLowerCase(),
                text: normalizedType === "Text" ? finalText : "",
                audio: normalizedType === "Audio" ? finalAudio : null,
                video: normalizedType === "Video" ? finalVideo : null,
                image: answerImages?.[0] || null,
                attachments: answerAttachments,
                seen: false,
                delivered: true,
                createdAt: now,
              },
            ],
          };

          return backendAnswer ? { ...updatedDoubt, ...backendAnswer } : updatedDoubt;
        })
      );

      if (currentUser?.role === "teacher" && typeof refreshTeacherProfile === "function") {
        void refreshTeacherProfile(teacherId).catch((error) => {
          console.warn("Failed to refresh teacher profile after answering a doubt", error);
        });
      }

      return backendAnswer || updatedDoubt || true;
    },
    [addNotification, currentUser, refreshTeacherProfile]
  );

  const submitTextAnswer = useCallback(
    (doubtId, payload = {}) => {
      return submitAnswer(
        doubtId,
        {
          ...payload,
          answerText: firstValue(payload.answerText, payload.text, ""),
        },
        "Text"
      );
    },
    [submitAnswer]
  );

  const submitAudioAnswer = useCallback(
    (doubtId, payload = {}) => {
      return submitAnswer(
        doubtId,
        {
          ...payload,
          answerAudio: firstValue(
            payload.answerAudio,
            payload.audioUri,
            payload.audio,
            null
          ),
        },
        "Audio"
      );
    },
    [submitAnswer]
  );

  const submitVideoAnswer = useCallback(
    (doubtId, payload = {}) => {
      return submitAnswer(
        doubtId,
        {
          ...payload,
          answerVideo: firstValue(
            payload.answerVideo,
            payload.videoUri,
            payload.video,
            null
          ),
        },
        "Video"
      );
    },
    [submitAnswer]
  );

  const addReview = useCallback((payload = {}) => {
    const doubtId = payload.doubtId;
    const rating = payload.rating || 0;
    const review = payload.review || "";

    setAllDoubts((prev) =>
      prev.map((item) =>
        String(item.id) === String(doubtId)
          ? {
              ...item,
              reviewAdded: true,
              rating: Number(rating),
              review,
              studentViewed: true,
              updatedAt: nowISO(),
            }
          : item
      )
    );

    if (currentUser?.role === "teacher" && typeof refreshTeacherProfile === "function") {
      void refreshTeacherProfile(
        firstValue(currentUser?.teacherId, currentUser?.id, DEFAULT_TEACHER.teacherId)
      ).catch((error) => {
        console.warn("Failed to refresh teacher profile after adding a review", error);
      });
    }

    return true;
  }, [currentUser, refreshTeacherProfile]);

  const markDoubtViewed = useCallback((doubtId, role = "student") => {
    setAllDoubts((prev) =>
      prev.map((item) =>
        String(item.id) === String(doubtId)
          ? {
              ...item,
              studentViewed: role === "student" ? true : item.studentViewed,
              teacherViewed: role === "teacher" ? true : item.teacherViewed,
              updatedAt: nowISO(),
            }
          : item
      )
    );

    return true;
  }, []);

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // VIDEOS
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const addUploadedVideo = useCallback(
    async (video = {}) => {
      const now = nowISO();
      const teacherId = firstValue(
        video.teacherId,
        currentUser?.teacherId,
        currentUser?.id,
        DEFAULT_TEACHER.id
      );
      const teacherName = firstValue(
        video.teacherName,
        currentUser?.name,
        currentUser?.fullName,
        DEFAULT_TEACHER.name
      );

      const payload = {
        ...video,
        teacherId,
        teacherName,
        title: firstValue(video.title, "Untitled"),
        subject: firstValue(video.subject, ""),
        topic: firstValue(video.topic, ""),
        className: firstValue(video.className, video.class, ""),
        description: firstValue(video.description, ""),
        duration: firstValue(video.duration, "00:00"),
        visibility: firstValue(video.visibility, "Public"),
        thumbnail: firstValue(video.thumbnail, null),
        videoUrl: firstValue(video.videoUrl, video.url, video.uri, null),
        url: firstValue(video.url, video.videoUrl, video.uri, null),
        color: firstValue(video.color, "#008F7A"),
        recipientStudentId: firstValue(video.recipientStudentId, null),
        recipientStudentName: firstValue(video.recipientStudentName, null),
        uploadedAgo: firstValue(video.uploadedAgo, "Just now"),
        time: firstValue(video.time, "Just now"),
      };

      let savedVideo = null;
      try {
        savedVideo = await videoApi.saveVideo(teacherId, payload);
      } catch (error) {
        console.warn("Failed to save explanation video to backend", error);
        throw error;
      }

      const newVideo = normalizeUploadedVideo(savedVideo, {
        ...payload,
        createdAt: now,
        updatedAt: now,
      });

      setUploadedVideos((prev) => {
        const next = prev.filter((item) => item.id !== newVideo.id);
        return [newVideo, ...next];
      });

      addNotification(
        "Video Uploaded",
        `${newVideo.title} is saved successfully.`,
        "teacher",
        {
          videoId: newVideo.id,
          teacherId: newVideo.teacherId,
        }
      );

      return newVideo;
    },
    [addNotification, currentUser]
  );

  const deleteUploadedVideo = useCallback(
    async (videoId) => {
      const teacherId = firstValue(
        currentUser?.teacherId,
        currentUser?.id,
        DEFAULT_TEACHER.id
      );

      try {
        await videoApi.deleteVideo(teacherId, videoId);
      } catch (error) {
        console.warn("Failed to delete explanation video from backend", error);
        throw error;
      }

      setUploadedVideos((prev) => prev.filter((video) => video.id !== videoId));
      return true;
    },
    [currentUser]
  );

  const updateUploadedVideo = useCallback(
    async (videoId, updates = {}) => {
      const teacherId = firstValue(
        currentUser?.teacherId,
        currentUser?.id,
        DEFAULT_TEACHER.id
      );

      const existingVideo = uploadedVideos.find(
        (video) => video.id === videoId || video.videoId === videoId
      );

      const payload = {
        ...existingVideo,
        ...updates,
        videoId,
        teacherId,
        teacherName: firstValue(
          updates.teacherName,
          existingVideo?.teacherName,
          currentUser?.name,
          DEFAULT_TEACHER.name
        ),
        title: firstValue(updates.title, existingVideo?.title, "Untitled"),
        subject: firstValue(updates.subject, existingVideo?.subject, ""),
        topic: firstValue(updates.topic, existingVideo?.topic, ""),
        className: firstValue(
          updates.className,
          updates.class,
          existingVideo?.className,
          ""
        ),
        description: firstValue(
          updates.description,
          existingVideo?.description,
          ""
        ),
        duration: firstValue(updates.duration, existingVideo?.duration, "00:00"),
        visibility: firstValue(
          updates.visibility,
          existingVideo?.visibility,
          "Public"
        ),
        thumbnail: firstValue(updates.thumbnail, existingVideo?.thumbnail, null),
        videoUrl: firstValue(
          updates.videoUrl,
          updates.url,
          existingVideo?.videoUrl,
          existingVideo?.url,
          null
        ),
        url: firstValue(
          updates.url,
          updates.videoUrl,
          existingVideo?.url,
          existingVideo?.videoUrl,
          null
        ),
        color: firstValue(updates.color, existingVideo?.color, "#008F7A"),
        recipientStudentId: firstValue(
          updates.recipientStudentId,
          existingVideo?.recipientStudentId,
          null
        ),
        recipientStudentName: firstValue(
          updates.recipientStudentName,
          existingVideo?.recipientStudentName,
          null
        ),
        uploadedAgo: firstValue(
          updates.uploadedAgo,
          existingVideo?.uploadedAgo,
          "Just now"
        ),
        time: firstValue(updates.time, existingVideo?.time, "Just now"),
      };

      let savedVideo = null;
      try {
        savedVideo = await videoApi.updateVideo(teacherId, videoId, payload);
      } catch (error) {
        console.warn("Failed to update explanation video in backend", error);
        throw error;
      }

      const updatedVideo = normalizeUploadedVideo(savedVideo, {
        ...payload,
        updatedAt: nowISO(),
      });

      setUploadedVideos((prev) =>
        prev.map((video) =>
          video.id === videoId || video.videoId === videoId ? updatedVideo : video
        )
      );

      return updatedVideo;
    },
    [currentUser, uploadedVideos]
  );

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // MOCK TESTS
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const mockCategories = useMemo(
    () => Object.values(mockData || {}).filter(Boolean),
    [mockData]
  );

  const addMockCategory = useCallback(async (category = {}) => {
    const title = firstValue(category.title, category.name, "New Category");
    const key = title;

    const cleanCategory = normalizeMockCategory({
      ...category,
      title,
      subjects: safeArray(category.subjects),
    });

    const teacherId = firstValue(
      currentUser?.teacherId,
      currentUser?.id,
      DEFAULT_TEACHER.id
    );

    await mockTestApi.createCategory(teacherId, {
      title,
      subtitle: cleanCategory.subtitle,
      description: cleanCategory.description,
      emoji: cleanCategory.emoji,
      color: cleanCategory.color,
      soft: cleanCategory.soft,
    });

    setMockData((prev) => ({
      ...prev,
      [key]: cleanCategory,
    }));

    return cleanCategory;
  }, [currentUser]);

  const addMockSubject = useCallback(async (categoryTitle, subject = {}) => {
    const categoryKey = categoryTitle || firstValue(subject.categoryTitle, "");
    const subjectName = firstValue(subject.name, subject.title, "New Subject");

    const cleanSubject = normalizeSubject(
      {
        ...subject,
        id: firstValue(subject.id, slugify(`${categoryKey}_${subjectName}`)),
        name: subjectName,
        list: safeArray(subject.list),
      },
      categoryKey
    );

    const teacherId = firstValue(
      currentUser?.teacherId,
      currentUser?.id,
      DEFAULT_TEACHER.id
    );

    await mockTestApi.createSubject(teacherId, categoryKey, {
      id: cleanSubject.id,
      name: cleanSubject.name,
      desc: cleanSubject.desc,
      time: cleanSubject.time,
      emoji: cleanSubject.emoji,
      color: cleanSubject.color,
      soft: cleanSubject.soft,
    });

    setMockData((prev) => {
      const existingCategory =
        prev[categoryKey] ||
        normalizeMockCategory({
          title: categoryKey,
          subjects: [],
        });

      const oldSubjects = safeArray(existingCategory.subjects);
      const exists = oldSubjects.some(
        (item) => item.id === cleanSubject.id || item.name === cleanSubject.name
      );

      const nextSubjects = exists
        ? oldSubjects.map((item) =>
            item.id === cleanSubject.id || item.name === cleanSubject.name
              ? {
                  ...item,
                  ...cleanSubject,
                  list: safeArray(item.list),
                }
              : item
          )
        : [...oldSubjects, cleanSubject];

      return {
        ...prev,
        [categoryKey]: {
          ...existingCategory,
          subjects: nextSubjects,
        },
      };
    });

    return cleanSubject;
  }, [currentUser]);

  const saveTeacherMockTest = useCallback(
    async (payload = {}) => {
      const teacher = payload.teacher || currentUser || DEFAULT_TEACHER;

      const categoryTitle = firstValue(
        payload.category,
        payload.categoryTitle,
        payload.categoryName,
        ""
      );

      const subjectObj = payload.subject || {};

      const subjectName = firstValue(
        payload.subjectName,
        subjectObj.name,
        subjectObj.title,
        ""
      );

      const subjectId = firstValue(
        payload.subjectId,
        subjectObj.id,
        ""
      );

      const test = normalizeMockTest(payload.test || payload.createdTest || payload, {
        category: categoryTitle,
        categoryId: slugify(categoryTitle),
        subjectId,
        subjectName,
        createdBy: firstValue(teacher.id, teacher.teacherId, DEFAULT_TEACHER.id),
        teacherId: firstValue(teacher.teacherId, teacher.id, DEFAULT_TEACHER.id),
        teacherName: firstValue(teacher.name, teacher.teacherName, "Teacher"),
      });

      const teacherId = firstValue(
        teacher.id,
        teacher.teacherId,
        currentUser?.teacherId,
        currentUser?.id,
        DEFAULT_TEACHER.id
      );

      const apiTest = serializeMockTestForApi(test, {
        category: categoryTitle,
        categoryTitle,
        subjectId,
        subjectName,
      });

      const saved = await mockTestApi.saveTest(teacherId, {
        category: categoryTitle,
        categoryTitle,
        subjectId,
        subjectName,
        createdTest: apiTest,
        test: apiTest,
      });

      setMockData((prev) => {
        const existingCategory =
          prev[categoryTitle] ||
          normalizeMockCategory({
            title: categoryTitle,
            subtitle: "Mock Tests",
            description: `${categoryTitle} mock tests`,
            subjects: [],
          });

        const oldSubjects = safeArray(existingCategory.subjects);

        const subjectExists = oldSubjects.some(
          (item) => item.id === subjectId || item.name === subjectName
        );

        let nextSubjects = oldSubjects;

        if (!subjectExists) {
          nextSubjects = [
            ...oldSubjects,
            normalizeSubject(
              {
                id: subjectId,
                name: subjectName,
                desc: firstValue(
                  subjectObj.desc,
                  subjectObj.description,
                  "Mock test subject"
                ),
                emoji: firstValue(subjectObj.emoji, "ðŸ“"),
                color: firstValue(subjectObj.color, C.blue),
                soft: firstValue(subjectObj.soft, C.blueSoft),
                list: [],
              },
              categoryTitle
            ),
          ];
        }

        nextSubjects = nextSubjects.map((subject) => {
          if (subject.id !== subjectId && subject.name !== subjectName) {
            return subject;
          }

          const oldList = safeArray(subject.list);
          const existsTest = oldList.some(
            (item) => item.id === test.id || item.testId === test.testId
          );

          const nextList = existsTest
            ? oldList.map((item) =>
                item.id === test.id || item.testId === test.testId
                  ? {
                      ...item,
                      ...test,
                      updatedAt: nowISO(),
                    }
                  : item
              )
            : [
                {
                  ...test,
                  no: test.no || String(oldList.length + 1).padStart(2, "0"),
                },
                ...oldList,
              ];

          return {
            ...subject,
            list: nextList,
            tests: nextList.length,
            questions: nextList.reduce(
              (sum, item) => sum + Number(item.questions || 0),
              0
            ),
            updatedAt: nowISO(),
          };
        });

        return {
          ...prev,
          [categoryTitle]: {
            ...existingCategory,
            title: categoryTitle,
            subjects: nextSubjects,
          },
        };
      });

      addNotification(
        "Mock Test Published",
        `${test.title} is now available for students.`,
        "mock_test",
        {
          testId: test.id,
          category: categoryTitle,
          subjectId,
          subjectName,
        }
      );

      return saved || test;
    },
    [addNotification, currentUser]
  );

  const deleteTeacherMockTest = useCallback((testId) => {
    setMockData((prev) => {
      const next = { ...prev };

      Object.keys(next).forEach((categoryKey) => {
        next[categoryKey] = {
          ...next[categoryKey],
          subjects: safeArray(next[categoryKey].subjects).map((subject) => {
            const list = safeArray(subject.list).filter(
              (test) => test.id !== testId && test.testId !== testId
            );

            return {
              ...subject,
              list,
              tests: list.length,
              questions: list.reduce(
                (sum, test) => sum + Number(test.questions || 0),
                0
              ),
            };
          }),
        };
      });

      return next;
    });

    const teacherId = firstValue(
      currentUser?.teacherId,
      currentUser?.id,
      DEFAULT_TEACHER.id
    );

    void mockTestApi.deleteTest(teacherId, testId).catch((error) => {
      console.warn("Failed to delete mock test from backend", error);
    });

    return true;
  }, [currentUser]);

  const getMockCategory = useCallback(
    (categoryTitle) => mockData?.[categoryTitle] || null,
    [mockData]
  );

  const getMockSubjects = useCallback(
    (categoryTitle) => safeArray(mockData?.[categoryTitle]?.subjects),
    [mockData]
  );

  const getMockTestsBySubject = useCallback(
    (categoryTitle, subjectIdOrName) => {
      const subject = safeArray(mockData?.[categoryTitle]?.subjects).find(
        (item) => item.id === subjectIdOrName || item.name === subjectIdOrName
      );

      return safeArray(subject?.list).filter((test) => test.isPublished !== false);
    },
    [mockData]
  );

  const getAllMockTests = useCallback(() => {
    const tests = [];

    Object.values(mockData || {}).forEach((category) => {
      safeArray(category.subjects).forEach((subject) => {
        safeArray(subject.list).forEach((test) => {
          if (test.isPublished !== false) {
            tests.push({
              ...test,
              category: category.title,
              categoryTitle: category.title,
              subjectId: subject.id,
              subjectName: subject.name,
              subject,
            });
          }
        });
      });
    });

    return tests;
  }, [mockData]);

  const getMockTestById = useCallback(
    (testId) =>
      getAllMockTests().find(
        (test) => test.id === testId || test.testId === testId
      ) || null,
    [getAllMockTests]
  );

  const getStudentMockTests = useCallback(
    (categoryTitle = null, subjectIdOrName = null) => {
      if (categoryTitle && subjectIdOrName) {
        return getMockTestsBySubject(categoryTitle, subjectIdOrName);
      }

      if (categoryTitle) {
        const tests = [];

        safeArray(mockData?.[categoryTitle]?.subjects).forEach((subject) => {
          safeArray(subject.list).forEach((test) => {
            if (test.isPublished !== false) {
              tests.push({
                ...test,
                category: categoryTitle,
                categoryTitle,
                subjectId: subject.id,
                subjectName: subject.name,
                subject,
              });
            }
          });
        });

        return tests;
      }

      return getAllMockTests();
    },
    [getAllMockTests, getMockTestsBySubject, mockData]
  );

  const saveMockTestResult = useCallback(
    (payload = {}) => {
      requireStudyAccess("Mock Test");

      const student = payload.student || currentUser || DEFAULT_STUDENT;
      const test = payload.test || getMockTestById(payload.testId);
      const selectedAnswers = payload.selectedAnswers || {};
      const questions = safeArray(payload.questions || test?.questionList);

      let correct = 0;
      let wrong = 0;

      questions.forEach((question) => {
        const selected = selectedAnswers[question.id];

        if (!selected) return;

        if (
          selected === question.answer ||
          selected === question.correctAnswer ||
          selected === question.optionMap?.[question.correctAnswer]
        ) {
          correct += 1;
        } else {
          wrong += 1;
        }
      });

      const attempted = Object.keys(selectedAnswers).length;
      const unattempted = questions.length - attempted;

      const result = {
        id: makeId("RESULT"),
        testId: firstValue(payload.testId, test?.id),
        testTitle: firstValue(payload.testTitle, test?.title, "Mock Test"),
        studentId: firstValue(
          payload.studentId,
          student.studentId,
          student.id,
          DEFAULT_STUDENT.id
        ),
        studentName: firstValue(payload.studentName, student.name, "Student"),
        questions,
        selectedAnswers,
        totalQuestions: questions.length,
        attempted,
        correct,
        wrong,
        unattempted,
        score: correct * 4 - wrong,
        totalMarks: questions.length * 4,
        accuracy:
          attempted === 0 ? 0 : Math.round((correct / attempted) * 1000) / 10,
        timeTaken: payload.timeTaken || 0,
        createdAt: nowISO(),
      };

      setMockTestResults((prev) => [result, ...prev]);

      if (test?.categoryTitle && (test?.subjectId || test?.subjectName)) {
        setMockData((prev) => {
          const next = { ...prev };

          Object.keys(next).forEach((categoryKey) => {
            next[categoryKey] = {
              ...next[categoryKey],
              subjects: safeArray(next[categoryKey].subjects).map((subject) => {
                const list = safeArray(subject.list).map((item) =>
                  item.id === test.id || item.testId === test.testId
                    ? {
                        ...item,
                        attempts: Number(item.attempts || 0) + 1,
                        updatedAt: nowISO(),
                      }
                    : item
                );

                return {
                  ...subject,
                  list,
                  tests: list.length,
                  questions: list.reduce(
                    (sum, item) => sum + Number(item.questions || 0),
                    0
                  ),
                };
              }),
            };
          });

          return next;
        });
      }

      const studentId = firstValue(
        payload.studentId,
        student.studentId,
        student.id,
        DEFAULT_STUDENT.id
      );

      void mockTestApi.saveAttempt(studentId, {
        testId: result.testId,
        studentName: result.studentName,
        selectedAnswers,
        questions: questions.map((question) => ({
          id: question.id,
          question: question.question,
          options: question.options,
          optionMap: question.optionMap,
          correctAnswer: question.correctAnswer,
          answer: question.answer,
          explanation: question.explanation,
          marks: question.marks,
        })),
        timeTaken: payload.timeTaken || 0,
      }).catch((error) => {
        console.warn("Failed to persist mock test result", error);
      });

      if (currentUser?.role === "student") {
        addNotification(
          "Mock Test Submitted",
          `${result.testTitle} completed with ${result.correct} correct answers.`,
          "mock_result",
          {
            id: `NOTIF_RESULT_${result.testId}_${studentId}`,
            testId: result.testId,
            studentId,
          }
        );
      }

      consumeStudyAccess("Mock Test");

      return result;
    },
    [
      addNotification,
      consumeStudyAccess,
      currentUser,
      getMockTestById,
      requireStudyAccess,
    ]
  );

  const getStudentMockResults = useCallback(
    (studentId) =>
      mockTestResults.filter(
        (item) => !studentId || item.studentId === studentId
      ),
    [mockTestResults]
  );

  const getTeacherMockTestAttempts = useCallback(
    async (params = {}) => {
      const teacherId = firstValue(
        params.teacherId,
        currentUser?.teacherId,
        currentUser?.id,
        DEFAULT_TEACHER.id
      );

      return mockTestApi.getTeacherAttempts(teacherId, {
        categoryTitle: params.categoryTitle,
        subjectId: params.subjectId,
        testId: params.testId,
      });
    },
    [currentUser]
  );

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // CHAT / ONLINE
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const updateChatList = useCallback(
    ({
      id,
      name,
      role,
      avatar,
      message,
      type = "Tutors",
      unread = 0,
      sent = true,
      seen = false,
    } = {}) => {
      const now = nowISO();
      const chatId = id || makeId("CHAT");

      setChatList((prev) => {
        const exists = prev.find((item) => item.id === chatId);

        if (exists) {
          return prev.map((item) =>
            item.id === chatId
              ? {
                  ...item,
                  name,
                  role,
                  avatar,
                  message,
                  unread,
                  seen,
                  sent,
                  updatedAt: now,
                  time: "Now",
                }
              : item
          );
        }

        return [
          {
            id: chatId,
            name,
            role,
            avatar,
            message,
            type,
            unread,
            sent,
            seen,
            time: "Now",
            updatedAt: now,
          },
          ...prev,
        ];
      });

      return chatId;
    },
    []
  );

  const updateOnlineUsers = useCallback((users = []) => {
    setOnlineUsers(safeArray(users));
    return true;
  }, []);

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // DERIVED DATA
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const sortedDoubts = useMemo(
    () =>
      [...allDoubts].sort(
        (a, b) =>
          new Date(b.lastMessageAt || b.updatedAt || 0).getTime() -
          new Date(a.lastMessageAt || a.updatedAt || 0).getTime()
      ),
    [allDoubts]
  );

  const teacherDoubts = useMemo(() => {
    const teacherId = String(
      firstValue(currentUser?.teacherId, currentUser?.id, "")
    ).trim().toLowerCase();

    if (!teacherId) {
      return [];
    }

    const normalizeList = (value) =>
      safeArray(Array.isArray(value) ? value : [value])
        .flatMap((item) => {
          if (typeof item === "string") {
            const text = item.trim();
            return text ? [text.toLowerCase()] : [];
          }

          if (item && typeof item === "object") {
            const text = firstValue(
              item.title,
              item.name,
              item.category,
              item.label,
              item.key,
              item.id,
              ""
            );

            const normalized = String(text || "").trim().toLowerCase();
            return normalized ? [normalized] : [];
          }

          return [];
        });

    const teacherScopes = new Set([
      ...normalizeList(currentUser?.subject),
      ...normalizeList(currentUser?.subjectExpertise),
      ...normalizeList(currentUser?.primarySubject),
      ...normalizeList(currentUser?.category),
      ...normalizeList(currentUser?.categories),
      ...normalizeList(currentUser?.topics),
    ]);

    const doubtFields = (item = {}) =>
      normalizeList([
        item?.subject,
        item?.categoryTitle,
        item?.topic,
        item?.assignedTeacher,
        item?.teacherName,
      ]);

    return sortedDoubts.filter((item) => {
      const itemTeacherId = String(
        firstValue(item?.teacherId, item?.assignedTeacherId, "")
      )
        .trim()
        .toLowerCase();

      if (itemTeacherId === teacherId) {
        return true;
      }

      const itemScopes = doubtFields(item);
      if (itemScopes.length === 0 || teacherScopes.size === 0) {
        return false;
      }

      return itemScopes.some((scope) => teacherScopes.has(scope));
    });
  }, [currentUser?.id, currentUser?.teacherId, sortedDoubts]);

  const pendingDoubts = useMemo(
    () =>
      sortedDoubts.filter(
        (item) =>
          (item.status === "Pending" || item.status === "pending") &&
          !item.accepted &&
          !item.answered
      ),
    [sortedDoubts]
  );

  const teacherPendingDoubts = useMemo(
    () =>
      teacherDoubts.filter(
        (item) =>
          (item.status === "Pending" || item.status === "pending") &&
          !item.accepted &&
          !item.answered
      ),
    [teacherDoubts]
  );

  const teacherInProgressDoubts = useMemo(
    () =>
      teacherDoubts.filter(
        (item) =>
          (item.accepted ||
            item.status === "In Progress" ||
            item.status === "in-progress") &&
          !item.answered
      ),
    [teacherDoubts]
  );

  const teacherAnsweredDoubts = useMemo(
    () =>
      teacherDoubts.filter(
        (item) =>
          item.answered ||
          item.status === "Answered" ||
          item.status === "answered"
      ),
    [teacherDoubts]
  );

  const inProgressDoubts = useMemo(
    () =>
      sortedDoubts.filter(
        (item) =>
          (item.accepted ||
            item.status === "In Progress" ||
            item.status === "in-progress") &&
          !item.answered
      ),
    [sortedDoubts]
  );

  const answeredDoubts = useMemo(
    () =>
      sortedDoubts.filter(
        (item) =>
          item.answered ||
          item.status === "Answered" ||
          item.status === "answered"
      ),
    [sortedDoubts]
  );

  const pendingTuitionRequests = useMemo(
    () =>
      tuitionRequests.filter((item) => item.status === STATUS.REQUEST_PENDING),
    [tuitionRequests]
  );

  const acceptedTuitionRequests = useMemo(
    () =>
      tuitionRequests.filter((item) => item.status === STATUS.REQUEST_ACCEPTED),
    [tuitionRequests]
  );

  const declinedTuitionRequests = useMemo(
    () =>
      tuitionRequests.filter((item) => item.status === STATUS.REQUEST_DECLINED),
    [tuitionRequests]
  );

  const upcomingSessions = useMemo(
    () =>
      sessions
        .filter((item) =>
          currentUser?.role === "teacher"
            ? [
                STATUS.SESSION_UPCOMING,
                STATUS.SESSION_READY,
                STATUS.SESSION_LIVE,
              ].includes(item.status) || item.needsScheduling
            : [
                STATUS.SESSION_UPCOMING,
                STATUS.SESSION_READY,
                STATUS.SESSION_LIVE,
              ].includes(item.status) && !item.needsScheduling
        )
        .sort(
          (a, b) =>
            new Date(a.startAt || a.scheduledFor || a.rawDate || 0).getTime() -
            new Date(b.startAt || b.scheduledFor || b.rawDate || 0).getTime()
        ),
    [currentUser?.role, sessions]
  );

  const pendingSessions = useMemo(
    () => sessions.filter((item) => Boolean(item.needsScheduling)),
    [sessions]
  );

  const completedSessions = useMemo(
    () => sessions.filter((item) => item.status === STATUS.SESSION_COMPLETED),
    [sessions]
  );

  const teacherSessions = useMemo(() => {
    const teacherId = currentUser?.role === "teacher" ? currentUser.id : null;

    if (!teacherId)
      return [...sessions].sort(
        (a, b) =>
          new Date(a.startAt || a.scheduledFor || a.rawDate || 0).getTime() -
          new Date(b.startAt || b.scheduledFor || b.rawDate || 0).getTime()
      );

    return sessions
      .filter((item) => item.teacherId === teacherId || item.tutorId === teacherId)
      .sort(
        (a, b) =>
          new Date(a.startAt || a.scheduledFor || a.rawDate || 0).getTime() -
          new Date(b.startAt || b.scheduledFor || b.rawDate || 0).getTime()
      );
  }, [currentUser, sessions]);

  const studentSessions = useMemo(() => {
    const studentId = currentUser?.role === "student" ? currentUser.id : null;

    if (!studentId)
      return [...sessions].sort(
        (a, b) =>
          new Date(a.startAt || a.scheduledFor || a.rawDate || 0).getTime() -
          new Date(b.startAt || b.scheduledFor || b.rawDate || 0).getTime()
      );

    return sessions
      .filter((item) => item.studentId === studentId && !item.needsScheduling)
      .sort(
        (a, b) =>
          new Date(a.startAt || a.scheduledFor || a.rawDate || 0).getTime() -
          new Date(b.startAt || b.scheduledFor || b.rawDate || 0).getTime()
      );
  }, [currentUser, sessions]);

  const teacherTuitionRequests = useMemo(() => {
    const teacherId = currentUser?.role === "teacher" ? currentUser.id : null;

    if (!teacherId) return tuitionRequests;

    return tuitionRequests.filter(
      (item) => item.teacherId === teacherId || item.tutorId === teacherId
    );
  }, [currentUser, tuitionRequests]);

  const studentTuitionRequests = useMemo(() => {
    const studentId = currentUser?.role === "student" ? currentUser.id : null;

    if (!studentId) return tuitionRequests;

    return tuitionRequests.filter((item) => item.studentId === studentId);
  }, [currentUser, tuitionRequests]);

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.read),
    [notifications]
  );

  const unreadNotificationsCount = unreadNotifications.length;

  const getRequestById = useCallback(
    (id) => tuitionRequests.find((item) => item.id === id) || null,
    [tuitionRequests]
  );

  const getSessionById = useCallback(
    (id) =>
      sessions.find((item) => item.id === id || item.sessionId === id) || null,
    [sessions]
  );

  const getTeacherRequests = useCallback(
    (teacherId) =>
      tuitionRequests.filter(
        (item) => item.teacherId === teacherId || item.tutorId === teacherId
      ),
    [tuitionRequests]
  );

  const getStudentRequests = useCallback(
    (studentId) => tuitionRequests.filter((item) => item.studentId === studentId),
    [tuitionRequests]
  );

  const getTeacherSessions = useCallback(
    (teacherId) =>
      sessions.filter(
        (item) => item.teacherId === teacherId || item.tutorId === teacherId
      ),
    [sessions]
  );

  const getStudentSessions = useCallback(
    (studentId) => sessions.filter((item) => item.studentId === studentId),
    [sessions]
  );

   // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // SUBSCRIPTION PAYMENTS
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const addSubscriptionPayment = useCallback(
    async (payment = {}) => {
      const now = nowISO();
      const student = payment.student || currentUser || DEFAULT_STUDENT;

      const newPayment = {
        id: firstValue(payment.id, makeId("SUB")),
        paymentId: firstValue(payment.paymentId, makeId("PAY")),

        studentId: firstValue(
          payment.studentId,
          student.studentId,
          student.id,
          DEFAULT_STUDENT.id
        ),

        studentName: firstValue(
          payment.studentName,
          student.name,
          student.fullName,
          "Student"
        ),

        className: firstValue(
          payment.className,
          payment.class,
          student.className,
          student.class,
          ""
        ),

        planName: firstValue(
          payment.planName,
          payment.plan,
          payment.subscriptionName,
          "Subscription Plan"
        ),

        amount: Number(
          firstValue(payment.amount, payment.price, payment.total, 0)
        ),

        paymentMode: firstValue(
          payment.paymentMode,
          payment.mode,
          payment.method,
          "Online"
        ),

        transactionId: firstValue(
          payment.transactionId,
          payment.txnId,
          makeId("TXN")
        ),

        status: firstValue(payment.status, "Paid"),

        paidAt: firstValue(payment.paidAt, payment.paymentDate, now),
        createdAt: firstValue(payment.createdAt, now),
        updatedAt: now,

        ...payment,
      };

      const normalizedPayment = normalizeSubscriptionPayment(newPayment);
      setSubscriptionPayments((prev) => [normalizedPayment, ...prev]);

      const subscriptionPayload = {
        paymentId: normalizedPayment.paymentId,
        studentId: normalizedPayment.studentId,
        studentName: normalizedPayment.studentName,
        className: normalizedPayment.className,
        planId: normalizedPayment.planId,
        planName: normalizedPayment.planName,
        billingType: normalizedPayment.billingType,
        durationLabel: normalizedPayment.durationLabel,
        amount: normalizedPayment.amount,
        paymentMode: normalizedPayment.paymentMode,
        transactionId: normalizedPayment.transactionId,
        status: normalizedPayment.status,
        paidAt: normalizedPayment.paidAt,
        expiresAt: normalizedPayment.expiresAt,
      };

      try {
        await subscriptionApi.createPayment(subscriptionPayload);
      } catch (error) {
        console.warn("Failed to persist subscription payment to backend", error);
      }

      addNotification(
        "Subscription Payment Received",
        `${normalizedPayment.studentName} paid ${normalizedPayment.planName}.`,
        "payment",
        {
          studentId: normalizedPayment.studentId,
          paymentId: normalizedPayment.id,
        }
      );

      return normalizedPayment;
    },
    [addNotification, currentUser]
  );

  const updateSubscriptionPayment = useCallback((paymentId, updates = {}) => {
    let updatedPayment = null;

    setSubscriptionPayments((prev) =>
      prev.map((item) => {
        if (item.id !== paymentId && item.paymentId !== paymentId) {
          return item;
        }

        updatedPayment = {
          ...item,
          ...updates,
          updatedAt: nowISO(),
        };

        return updatedPayment;
      })
    );

    return updatedPayment;
  }, []);

  const deleteSubscriptionPayment = useCallback((paymentId) => {
    setSubscriptionPayments((prev) =>
      prev.filter(
        (item) => item.id !== paymentId && item.paymentId !== paymentId
      )
    );

    return true;
  }, []);

  const getSubscriptionPaymentById = useCallback(
    (paymentId) =>
      subscriptionPayments.find(
        (item) => item.id === paymentId || item.paymentId === paymentId
      ) || null,
    [subscriptionPayments]
  );

  const value = useMemo(
    () => ({
      STATUS,

      authReady,
      currentUser,
      setLoggedInUser,
      clearLoggedInUser,
      loginStudent,
      registerStudent,
      refreshStudentProfile,
      updateStudentProfile,
      uploadStudentAvatar,
      loginTeacher,
      initiateTeacherRegistration,
      verifyTeacherRegistrationOtp,
      completeTeacherRegistration,
      refreshTeacherProfile,
      updateTeacherProfileRemote,
      uploadTeacherAvatar,
      sendTeacherForgotPasswordCode,
      resetTeacherPassword,
      refreshTeacherApprovals,
      approveTeacherProfile,
      rejectTeacherProfile,

      allDoubts,
      teacherDoubts,
      teacherPendingDoubts,
      teacherInProgressDoubts,
      teacherAnsweredDoubts,
      pendingDoubts,
      inProgressDoubts,
      answeredDoubts,
        refreshDoubtsAndNotifications,
        addDoubt,
        acceptDoubt,
        deleteDoubt,
      addMessage,
      markDoubtViewed,
      submitAnswer,
      submitTextAnswer,
      submitAudioAnswer,
      submitVideoAnswer,
      addReview,

      uploadedVideos,
      videoCategories,
      addUploadedVideo,
      deleteUploadedVideo,
      updateUploadedVideo,

      mockData,
      setMockData,
      mockCategories,
      teacherMockCatalog,
      mockTestResults,

      subscriptionPayments,
      setSubscriptionPayments,
      addSubscriptionPayment,
      updateSubscriptionPayment,
      deleteSubscriptionPayment,
      getSubscriptionPaymentById,
      isPremiumSubscriber,
      getRemainingStudyUses,
      requireStudyAccess,
      consumeStudyAccess,
      activatePremiumSubscription,

      addMockCategory,
      addMockSubject,
      refreshTeacherMockCatalog,
      saveTeacherMockTest,
      deleteTeacherMockTest,
      getMockCategory,
      getMockSubjects,
      getMockTestsBySubject,
      getAllMockTests,
      getMockTestById,
      getStudentMockTests,
      saveMockTestResult,
      getStudentMockResults,
      getTeacherMockTestAttempts,

      tutors,
      setTutors,
      registerTutor,
      updateTutorProfile,
      removeTutorProfile,
      updateTutorAvailability,
      getTutorById,

      tuitionRequests,
      pendingTuitionRequests,
      acceptedTuitionRequests,
      declinedTuitionRequests,
      teacherTuitionRequests,
      studentTuitionRequests,
      requestTutorSession,
      acceptTuitionRequest,
      createTuitionSession,
      declineTuitionRequest,
      cancelTuitionRequest,
      markTuitionRequestViewed,
      getRequestById,
      getTeacherRequests,
      getStudentRequests,

      sessions,
      pendingSessions,
      upcomingSessions,
      completedSessions,
      teacherSessions,
      studentSessions,
      updateSession,
      startSession,
      endSession,
      completeSession,
      cancelSession,
      rateSession,
      markSessionViewed,
      getSessionById,
      getTeacherSessions,
      getStudentSessions,

      sessionMessages,
      whiteboardShares,
      addSessionMessage,
      shareWhiteboardToChat,
      clearSessionMessages,
      getSessionMessages,

      notifications,
      unreadNotifications,
      unreadNotificationsCount,
      onlineUsers,
      chatList,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      updateChatList,
      updateOnlineUsers,
    }),
    [
      authReady,
      currentUser,
      loginStudent,
      registerStudent,
      refreshStudentProfile,
      updateStudentProfile,
      uploadStudentAvatar,
      loginTeacher,
      initiateTeacherRegistration,
      verifyTeacherRegistrationOtp,
      completeTeacherRegistration,
      refreshTeacherProfile,
      updateTeacherProfileRemote,
      uploadTeacherAvatar,
      sendTeacherForgotPasswordCode,
      resetTeacherPassword,
      refreshTeacherApprovals,
      approveTeacherProfile,
      rejectTeacherProfile,

      allDoubts,
      teacherDoubts,
      teacherPendingDoubts,
      teacherInProgressDoubts,
      teacherAnsweredDoubts,
      pendingDoubts,
      inProgressDoubts,
      answeredDoubts,
        refreshDoubtsAndNotifications,
        addDoubt,
        acceptDoubt,
        deleteDoubt,
      addMessage,
      markDoubtViewed,
      submitAnswer,
      submitTextAnswer,
      submitAudioAnswer,
      submitVideoAnswer,
      addReview,

      uploadedVideos,
      videoCategories,
      addUploadedVideo,
      deleteUploadedVideo,
      updateUploadedVideo,

      mockData,
      mockCategories,
      teacherMockCatalog,
      mockTestResults,

      subscriptionPayments,
      addSubscriptionPayment,
      updateSubscriptionPayment,
      deleteSubscriptionPayment,
      getSubscriptionPaymentById,
      isPremiumSubscriber,
      getRemainingStudyUses,
      requireStudyAccess,
      consumeStudyAccess,
      activatePremiumSubscription,

      addMockCategory,
      addMockSubject,
      refreshTeacherMockCatalog,
      saveTeacherMockTest,
      deleteTeacherMockTest,
      getMockCategory,
      getMockSubjects,
      getMockTestsBySubject,
      getAllMockTests,
      getMockTestById,
      getStudentMockTests,
      saveMockTestResult,
      getStudentMockResults,
      getTeacherMockTestAttempts,

      tutors,
      registerTutor,
      updateTutorProfile,
      removeTutorProfile,
      updateTutorAvailability,
      getTutorById,

      tuitionRequests,
      pendingTuitionRequests,
      acceptedTuitionRequests,
      declinedTuitionRequests,
      teacherTuitionRequests,
      studentTuitionRequests,
      requestTutorSession,
      acceptTuitionRequest,
      createTuitionSession,
      declineTuitionRequest,
      cancelTuitionRequest,
      markTuitionRequestViewed,
      getRequestById,
      getTeacherRequests,
      getStudentRequests,

      sessions,
      pendingSessions,
      upcomingSessions,
      completedSessions,
      teacherSessions,
      studentSessions,
      updateSession,
      startSession,
      endSession,
      completeSession,
      cancelSession,
      rateSession,
      markSessionViewed,
      getSessionById,
      getTeacherSessions,
      getStudentSessions,

      sessionMessages,
      whiteboardShares,
      addSessionMessage,
      shareWhiteboardToChat,
      clearSessionMessages,
      getSessionMessages,

      notifications,
      unreadNotifications,
      unreadNotificationsCount,
      onlineUsers,
      chatList,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      updateChatList,
      updateOnlineUsers,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
};

export default AppContext; 

