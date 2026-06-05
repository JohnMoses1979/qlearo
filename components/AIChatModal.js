import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import {
  AudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import clarivoChatApi from "../services/clarivoChatApi";

/*
  IMPORTANT:
  For testing only, paste your Groq API key below.

  For production:
  Do NOT keep API keys inside frontend React Native code.
  Use your backend API to call Groq safely.
*/
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

const CHAT_MODEL = "llama-3.3-70b-versatile";
const TRANSCRIPTION_MODEL = "whisper-large-v3-turbo";

const APP_NAME = "Clarivo";

const Speech = {
  stop() {},
  speak(_text, options = {}) {
    if (typeof options.onDone === "function") {
      options.onDone();
    }
  },
};

/*
  Set this true if you want every AI answer to automatically speak.
  If false, user can still tap speaker icon on each AI message.
*/
const AUTO_SPEAK_AI_REPLIES = false;

const QUICK_PROMPTS = [
  {
    label: "What can I ask?",
    prompt:
      "Tell me exactly what I can ask you inside Clarivo and outside Clarivo.",
  },
  {
    label: "Ask Doubt",
    prompt:
      "I have a study doubt. Explain it step by step with an example and practice question.",
  },
  {
    label: "Mock Test",
    prompt:
      "Create a short mock test with 5 questions, options, correct answers, and explanations.",
  },
  {
    label: "App Help",
    prompt:
      "How can I use Clarivo for doubts, mock tests, classes, sessions, and videos?",
  },
  {
    label: "Session Help",
    prompt:
      "How should I prepare before attending a live class or tutor session?",
  },
  {
    label: "Outside Question",
    prompt:
      "Answer this outside question clearly, then tell me how Clarivo can help me learn it better.",
  },
];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeText(value, fallback = "") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function limitText(value, max = 90) {
  const text = safeText(value, "");
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function getObjectValues(value) {
  if (!value || typeof value !== "object") return [];
  return Object.values(value).filter(Boolean);
}

export default function AIChatModal({ visible, onClose }) {
  const appContext = useAppContext();

  const {
    allDoubts = [],
    uploadedVideos = [],
    mockData = {},
    mockCategories = [],
    userProfile = {},
    currentUser = {},
    sessions = [],
    upcomingSessions = [],
    scheduledSessions = [],
    tuitionRequests = [],
  } = appContext || {};

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I am your ${APP_NAME} AI Tutor. You can ask me study doubts, mock tests, app help, live session help, explanation video help, and also outside/general questions. What do you want to ask today?`,
    },
  ]);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const flatListRef = useRef(null);
  const recordingRef = useRef(null);
  const recordingTimerRef = useRef(null);

  const blurActiveElement = useCallback(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    try {
      const active = document.activeElement;
      if (active && typeof active.blur === "function") {
        active.blur();
      }
    } catch (error) {
      // ignore
    }
  }, []);

  const currentUserId = useMemo(
    () =>
      safeText(
        currentUser?.id ||
          currentUser?.studentId ||
          currentUser?.teacherId ||
          currentUser?.userId,
        ""
      ),
    [currentUser]
  );

  const currentUserRole = useMemo(
    () => safeText(currentUser?.role, "student").toLowerCase(),
    [currentUser]
  );

  const defaultGreeting = useMemo(() => {
    if (currentUserRole === "teacher") {
      return {
        role: "assistant",
        content:
          "Hi! I am Clarivo AI for teachers. You can ask me about teaching doubts, classes, sessions, mock tests, uploaded videos, and platform help. What do you want to ask today?",
      };
    }

    return {
      role: "assistant",
      content:
        "Hi! I am your Clarivo AI Tutor. You can ask me study doubts, mock tests, app help, live session help, explanation video help, and also outside/general questions. What do you want to ask today?",
    };
  }, [currentUserRole]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    let isActive = true;

    const loadChatHistory = async () => {
      if (!currentUserId) {
        setInput("");
        setMessages([defaultGreeting]);
        setChatSessions([]);
        return;
      }

      setHistoryLoading(true);

      try {
        const sessions = await clarivoChatApi.getSessions({
          userId: currentUserId,
          userRole: currentUserRole,
        });

        setChatSessions(Array.isArray(sessions) ? sessions : []);

        let activeSession = Array.isArray(sessions) && sessions.length > 0 ? sessions[0] : null;

        if (!activeSession) {
          const created = await clarivoChatApi.createSession({
            userId: currentUserId,
            userRole: currentUserRole,
            title: "Clarivo AI Chat",
          });

          activeSession = created?.session || created;
          const createdMessages = Array.isArray(created?.messages) ? created.messages : [];

          if (!isActive) return;

          setChatSessionId(activeSession?.id || null);
          setInput("");
          setMessages(createdMessages.length > 0 ? createdMessages : [defaultGreeting]);
          return;
        }

        const history = await clarivoChatApi.getMessages(activeSession.id);

        if (!isActive) return;

        setChatSessionId(activeSession.id);
        setInput("");
        setMessages(Array.isArray(history) && history.length > 0 ? history : [defaultGreeting]);
      } catch (error) {
        if (!isActive) return;

        setInput("");
        setMessages([defaultGreeting]);
        setChatSessions([]);
        console.warn("Failed to load Clarivo chat history:", error?.message || error);
      } finally {
        if (isActive) {
          setHistoryLoading(false);
          scrollToBottom();
        }
      }
    };

    loadChatHistory();

    return () => {
      isActive = false;
    };
  }, [currentUserId, currentUserRole, defaultGreeting, visible]);

  const refreshChatSessions = useCallback(async () => {
    if (!currentUserId) {
      setChatSessions([]);
      return [];
    }

    try {
      const sessions = await clarivoChatApi.getSessions({
        userId: currentUserId,
        userRole: currentUserRole,
      });
      const safeSessions = Array.isArray(sessions) ? sessions : [];
      setChatSessions(safeSessions);
      return safeSessions;
    } catch (error) {
      console.warn("Failed to refresh Clarivo chat sessions:", error?.message || error);
      return [];
    }
  }, [currentUserId, currentUserRole]);

  const openSessionFromHistory = useCallback(
    async (sessionId) => {
      if (!sessionId) return;

      try {
        setHistoryLoading(true);
        const history = await clarivoChatApi.getMessages(sessionId);
        setChatSessionId(sessionId);
        setInput("");
        setMessages(Array.isArray(history) && history.length > 0 ? history : [defaultGreeting]);
        setShowHistory(false);
      } catch (error) {
        global.showAlert("History", error?.message || "Unable to load chat history.");
      } finally {
        setHistoryLoading(false);
      }
    },
    [defaultGreeting]
  );

  const appSummary = useMemo(() => {
    const doubts = safeArray(allDoubts);
    const videos = safeArray(uploadedVideos);
    const mockCategoryList =
      safeArray(mockCategories).length > 0
        ? safeArray(mockCategories)
        : getObjectValues(mockData);

    const sessionList = [
      ...safeArray(sessions),
      ...safeArray(upcomingSessions),
      ...safeArray(scheduledSessions),
      ...safeArray(tuitionRequests),
    ];

    const recentDoubts = doubts.slice(0, 5).map((item, index) => {
      return `${index + 1}. ${limitText(
        item?.question || item?.title || "Student doubt"
      )} | Subject: ${safeText(item?.subject, "General")} | Status: ${safeText(
        item?.status,
        item?.answered ? "Answered" : "Pending"
      )}`;
    });

    const recentVideos = videos.slice(0, 5).map((item, index) => {
      return `${index + 1}. ${limitText(
        item?.title || "Explanation video"
      )} | Subject: ${safeText(item?.subject, "General")} | Topic: ${safeText(
        item?.topic,
        "Topic"
      )}`;
    });

    const mockCategoriesText = mockCategoryList.slice(0, 8).map((item, index) => {
      return `${index + 1}. ${safeText(
        item?.title || item?.name,
        "Mock Category"
      )} - ${safeText(item?.subtitle || item?.description, "Mock Tests")}`;
    });

    const sessionText = sessionList.slice(0, 5).map((item, index) => {
      return `${index + 1}. ${safeText(
        item?.subject,
        "General"
      )} | Topic: ${safeText(item?.topic, "Class Topic")} | Tutor: ${safeText(
        item?.tutor || item?.teacherName || item?.teacher,
        "Tutor"
      )}`;
    });

    return `
Current ${APP_NAME} app context:
Student name: ${safeText(
      userProfile?.name || currentUser?.name,
      "Student"
    )}

Available app modules:
- Student dashboard
- Ask Doubt
- My Doubts
- Tutor/Teacher support
- Mock Tests
- Explanation Videos
- Video Player and Comments
- Join Session
- In Session live class
- Profile, Subscription, Wallet, Notifications, Settings
- Teacher dashboard
- Teacher can answer doubts by text, voice, or video
- Teacher can upload explanation videos
- Teacher can create/manage mock tests
- Teacher can manage live sessions

Current data:
Total doubts: ${doubts.length}
Total explanation videos: ${videos.length}
Total mock categories: ${mockCategoryList.length}
Total sessions/requests found: ${sessionList.length}

Recent doubts:
${recentDoubts.length > 0 ? recentDoubts.join("\n") : "No recent doubts found."}

Recent videos:
${recentVideos.length > 0 ? recentVideos.join("\n") : "No videos found."}

Mock categories:
${
  mockCategoriesText.length > 0
    ? mockCategoriesText.join("\n")
    : "No mock categories found."
}

Sessions:
${sessionText.length > 0 ? sessionText.join("\n") : "No sessions found."}
`;
  }, [
    allDoubts,
    uploadedVideos,
    mockData,
    mockCategories,
    userProfile,
    currentUser,
    sessions,
    upcomingSessions,
    scheduledSessions,
    tuitionRequests,
  ]);

  const appSystemPrompt = useMemo(() => {
    return `
You are ${APP_NAME} AI Tutor inside an education mobile app.

The app is for:
- Students asking doubts
- Teachers/tutors solving doubts
- Mock tests and practice tests
- Live classes and tutor sessions
- Explanation videos
- Learning plans and revision help
- Finding tutors and attending sessions
- Helping students understand subjects clearly

Very important answer rules:

1. If the user asks about ${APP_NAME} app:
Answer using app-related guidance.
Explain where they can go in the app and what they can do.
Example:
- Ask Doubt: submit text, image, document, audio, or video doubt.
- Mock Tests: select category, subject, test, attempt, submit, and see result.
- Explanation Videos: search videos by title, subject, topic, and watch related videos.
- Sessions/Classes: join session, use mic/camera/chat/whiteboard, and learn from tutor.
- Teacher: answer doubts, upload videos, create mock tests, manage sessions.

2. If the user asks a study doubt:
Solve the doubt clearly.
Use:
- Simple Explanation
- Example
- Practice Question
- Next Step in ${APP_NAME}

3. If the user asks for mock test:
Create proper questions.
Include options, correct answer, and short explanation.

4. If the user asks about explanation videos:
Suggest what to watch or how the video should explain the topic.
Mention that ${APP_NAME} has Explanation Videos.

5. If the user asks about class/session:
Guide them how to prepare, join, use mic/camera/chat, and ask teacher.

6. If the user asks outside/general questions:
Answer normally and helpfully.
Do not reject only because it is outside the app.
After answering, add one small line:
"To learn this better in ${APP_NAME}, you can ask it as a doubt, watch explanation videos, or take a mock test."

7. If the user asks "what can I ask":
Give this exact list:
- Study doubts
- Homework explanations
- Mock test questions
- Test preparation
- Explanation video suggestions
- Tutor/session help
- App navigation help
- Subject learning plans
- Coding/programming doubts
- General knowledge questions
- Outside questions like career, English, technology, science, interview, etc.

8. Use simple English.
9. Keep answers clear and not too long.
10. Do not mention that you are only a language model.
11. Do not invent app data if not available. Use the app context when helpful.
12. For unsafe, harmful, cheating, illegal, or abusive requests, refuse politely and offer a safe learning alternative.

${appSummary}
`;
  }, [appSummary]);

  useEffect(() => {
    return () => {
      clearRecordingTimer();
      Speech.stop();

      if (recordingRef.current) {
        recordingRef.current.stop().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!visible && recordingRef.current) {
      cancelRecording();
    }

    if (!visible) {
      Speech.stop();
      setSpeakingIndex(null);
    }
  }, [visible]);

  function clearRecordingTimer() {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }

  function startRecordingTimer() {
    clearRecordingTimer();
    setRecordingSeconds(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  }

  function formatRecordingTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }

  function scrollToBottom() {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  function speakAI(text, index) {
    if (!text) return;

    if (speakingIndex === index) {
      Speech.stop();
      setSpeakingIndex(null);
      return;
    }

    Speech.stop();
    setSpeakingIndex(index);

    Speech.speak(text, {
      language: "en-US",
      pitch: 1,
      rate: Platform.OS === "ios" ? 0.5 : 0.9,
      onDone: () => setSpeakingIndex(null),
      onStopped: () => setSpeakingIndex(null),
      onError: () => setSpeakingIndex(null),
    });
  }

  function addAssistantMessage(text, shouldSpeak = false) {
    setMessages((prev) => {
      const nextIndex = prev.length;
      const nextMessages = [
        ...prev,
        {
          role: "assistant",
          content: text,
        },
      ];

      if (shouldSpeak && AUTO_SPEAK_AI_REPLIES) {
        setTimeout(() => {
          speakAI(text, nextIndex);
        }, 350);
      }

      return nextMessages;
    });

    scrollToBottom();
  }

  function isApiKeyMissing() {
    return (
      !GROQ_API_KEY ||
      GROQ_API_KEY.trim() === "" ||
      GROQ_API_KEY.includes("PASTE_YOUR_GROQ_API_KEY")
    );
  }

  async function readApiError(response) {
    try {
      const data = await response.json();
      return (
        data?.error?.message ||
        data?.message ||
        `Request failed with status ${response.status}`
      );
    } catch (error) {
      return `Request failed with status ${response.status}`;
    }
  }

  function getAudioFileMeta(uri) {
    const cleanUri = uri.split("?")[0];
    const parts = cleanUri.split(".");
    const extension =
      parts.length > 1
        ? parts[parts.length - 1].toLowerCase()
        : Platform.OS === "web"
        ? "webm"
        : "m4a";

    const mimeMap = {
      m4a: "audio/m4a",
      mp4: "audio/mp4",
      webm: "audio/webm",
      wav: "audio/wav",
      mp3: "audio/mpeg",
      aac: "audio/aac",
      caf: "audio/x-caf",
      "3gp": "audio/3gpp",
    };

    return {
      fileName: `clarivo-voice-question-${Date.now()}.${extension}`,
      mimeType: mimeMap[extension] || "audio/m4a",
    };
  }

  function buildApiMessages(updatedMessages) {
    const trimmedMessages = updatedMessages.slice(-14);

    return [
      {
        role: "system",
        content: appSystemPrompt,
      },
      ...trimmedMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];
  }

  async function sendMessageText(text, options = {}) {
    const finalText = text?.trim();
    const allowWhileTranscribing = options?.allowWhileTranscribing || false;

    if (!finalText || loading || (!allowWhileTranscribing && transcribing)) {
      return;
    }

    Speech.stop();
    setSpeakingIndex(null);

    const userMessage = {
      role: "user",
      content: finalText,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      let activeSessionId = chatSessionId;

      if (!activeSessionId) {
        const createdSession = await clarivoChatApi.createSession({
          userId: currentUserId || "guest",
          userRole: currentUserRole,
          title: "Clarivo AI Chat",
        });

        activeSessionId =
          createdSession?.session?.id ||
          createdSession?.id ||
          null;
      }

      if (!activeSessionId) {
        addAssistantMessage("I could not start a chat thread. Please try again.");
        return;
      }

      if (!chatSessionId) {
        setChatSessionId(activeSessionId);
      }

      const result = await clarivoChatApi.sendMessage(activeSessionId, {
        userId: currentUserId || "guest",
        userRole: currentUserRole,
        content: finalText,
      });

      const replyText = (() => {
        if (result?.assistantMessage?.content) {
          return result.assistantMessage.content;
        }

        if (Array.isArray(result?.messages)) {
          for (let index = result.messages.length - 1; index >= 0; index -= 1) {
            const item = result.messages[index];
            if (item?.role === "assistant" && item?.content) {
              return item.content;
            }
          }
        }

        return "No response received. Please try again.";
      })();

      if (Array.isArray(result?.messages) && result.messages.length > 0) {
        setMessages(result.messages);
        if (AUTO_SPEAK_AI_REPLIES) {
          const assistantIndex = Math.max(result.messages.length - 1, 0);
          setTimeout(() => {
            speakAI(replyText, assistantIndex);
          }, 350);
        }
      } else {
        const assistantIndex = updatedMessages.length;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: replyText,
          },
        ]);

        if (AUTO_SPEAK_AI_REPLIES) {
          setTimeout(() => {
            speakAI(replyText, assistantIndex);
          }, 350);
        }
      }
    } catch (error) {
      addAssistantMessage(
        `Network error: ${
          error?.message || "Please check your internet connection."
        }`
      );
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading || transcribing || isRecording) return;
    await sendMessageText(input.trim());
  }

  async function handleQuickPrompt(prompt) {
    if (loading || transcribing || isRecording) return;
    await sendMessageText(prompt);
  }

  async function startRecording() {
    if (loading || transcribing || isRecording) return;

    if (isApiKeyMissing()) {
      global.showAlert(
        "Groq API key missing",
        "Please paste your Groq API key in GROQ_API_KEY for testing."
      );
      return;
    }

    try {
      Speech.stop();
      setSpeakingIndex(null);

      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        global.showAlert(
          "Microphone permission needed",
          "Please allow microphone permission to use voice input."
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
        interruptionMode: "duckOthers",
      });

      const recording = new AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await recording.prepareToRecordAsync();
      recording.record();

      recordingRef.current = recording;
      setIsRecording(true);
      startRecordingTimer();
    } catch (error) {
      console.log("START RECORDING ERROR:", error);
      global.showAlert("Recording error", error?.message || "Unable to start audio.");
      setIsRecording(false);
      clearRecordingTimer();
    }
  }

  async function stopRecordingAndSend() {
    if (!recordingRef.current) return;

    try {
      const recording = recordingRef.current;

      setIsRecording(false);
      clearRecordingTimer();

      await recording.stop();

      const uri = recording.uri;
      recordingRef.current = null;

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        interruptionMode: "duckOthers",
      });

      if (!uri) {
        addAssistantMessage("I could not get the recorded audio. Try again.");
        return;
      }

      await transcribeAudioAndSend(uri);
    } catch (error) {
      console.log("STOP RECORDING ERROR:", error);

      recordingRef.current = null;
      setIsRecording(false);
      clearRecordingTimer();

      addAssistantMessage(
        "I could not send the voice question. Please record again."
      );
    }
  }

  async function cancelRecording() {
    try {
      const recording = recordingRef.current;

      if (recording) {
        await recording.stop().catch(() => {});
      }
    } finally {
      recordingRef.current = null;
      setIsRecording(false);
      clearRecordingTimer();

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        interruptionMode: "duckOthers",
      }).catch(() => {});
    }
  }

  async function handleMicPress() {
    if (isRecording) {
      await stopRecordingAndSend();
    } else {
      await startRecording();
    }
  }

  async function transcribeAudioAndSend(uri) {
    setTranscribing(true);

    try {
      const { fileName, mimeType } = getAudioFileMeta(uri);

      const formData = new FormData();

      if (Platform.OS === "web") {
        const audioResponse = await fetch(uri);
        const audioBlob = await audioResponse.blob();
        formData.append("file", audioBlob, fileName);
      } else {
        formData.append("file", {
          uri,
          name: fileName,
          type: mimeType,
        });
      }

      formData.append("model", TRANSCRIPTION_MODEL);
      formData.append("response_format", "json");
      formData.append("temperature", "0");

      const response = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorMessage = await readApiError(response);
        addAssistantMessage(`Voice error: ${errorMessage}`);
        return;
      }

      const data = await response.json();
      const transcript = data?.text?.trim();

      if (!transcript) {
        addAssistantMessage(
          "I could not understand the voice clearly. Please try again."
        );
        return;
      }

      await sendMessageText(transcript, {
        allowWhileTranscribing: true,
      });
    } catch (error) {
      console.log("TRANSCRIPTION ERROR:", error);

      addAssistantMessage(
        `Voice transcription failed: ${
          error?.message || "Please try recording again."
        }`
      );
    } finally {
      setTranscribing(false);
      scrollToBottom();
    }
  }

  function clearChat() {
    if (loading || transcribing || isRecording) return;

    Speech.stop();
    setSpeakingIndex(null);

    (async () => {
      try {
        setHistoryLoading(true);
        if (!currentUserId) {
          setInput("");
          setMessages([defaultGreeting]);
          setChatSessionId(null);
          setHistoryLoading(false);
          return;
        }

        const created = await clarivoChatApi.createSession({
          userId: currentUserId,
          userRole: currentUserRole,
          title: "Clarivo AI Chat",
        });

        const nextSession = created?.session || created;
        const nextMessages = Array.isArray(created?.messages) ? created.messages : [];

        setChatSessionId(nextSession?.id || null);
        setInput("");
        setMessages(nextMessages.length > 0 ? nextMessages : [defaultGreeting]);
        await refreshChatSessions();
        setShowHistory(false);
      } catch (error) {
        setInput("");
        setMessages([defaultGreeting]);
        setChatSessionId(null);
        global.showAlert(
          "New chat",
          error?.message || "Unable to start a new chat right now."
        );
      } finally {
        setHistoryLoading(false);
      }
    })();
  }

  const sendDisabled =
    loading ||
    transcribing ||
    historyLoading ||
    isRecording ||
    !input ||
    !input.trim();

  const micDisabled = (loading || transcribing || historyLoading) && !isRecording;

  const quickDisabled = loading || transcribing || historyLoading || isRecording;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
          style={styles.container}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.aiAvatar}>
                <Feather name="book-open" size={18} color="#FFFFFF" />
              </View>

              <View style={styles.headerTextBox}>
                <Text style={styles.title}>{APP_NAME} AI Tutor</Text>
                <Text style={styles.subtitle}>
                  App Help • Study Doubts • Outside Questions
                </Text>
              </View>
            </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
                onPress={async () => {
                  setShowHistory(true);
                  await refreshChatSessions();
                }}
                style={styles.historyBtn}
                activeOpacity={0.8}
              >
                <Feather name="clock" size={14} color="#006D6A" />
                <Text style={styles.historyText}>History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={clearChat}
                style={[
                  styles.clearBtn,
                  (loading || transcribing || historyLoading || isRecording) && {
                    opacity: 0.5,
                  },
                ]}
                disabled={loading || transcribing || historyLoading || isRecording}
                activeOpacity={0.8}
              >
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  blurActiveElement();
                  Speech.stop();
                  setSpeakingIndex(null);
                  onClose();
                }}
                style={styles.closeBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ASK GUIDE */}
          <View style={styles.askGuideBox}>
            <Text style={styles.askGuideTitle}>You can ask about:</Text>
            <Text style={styles.askGuideText}>
              Doubts, homework, mock tests, videos, tutors, classes, app help,
              coding, science, English, career, and outside questions.
            </Text>
          </View>

          {/* QUICK PROMPTS */}
          <View style={styles.quickSection}>
            <Text style={styles.quickTitle}>Quick questions</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickList}
            >
              {QUICK_PROMPTS.map((item, index) => (
                <TouchableOpacity
                  key={`${item.label}-${index}`}
                  style={[
                    styles.quickChip,
                    quickDisabled && styles.quickChipDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={quickDisabled}
                  onPress={() => handleQuickPrompt(item.prompt)}
                >
                  <Text style={styles.quickChipText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* MESSAGES */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            style={styles.messageList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.messageContent}
            onContentSizeChange={scrollToBottom}
            renderItem={({ item, index }) => {
              const isUser = item.role === "user";
              const isThisSpeaking = speakingIndex === index;

              return (
                <View
                  style={[
                    styles.messageWrapper,
                    isUser ? styles.userWrapper : styles.aiWrapper,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.aiLabelRow}>
                      <Text style={styles.roleLabel}>{APP_NAME} AI</Text>

                      <TouchableOpacity
                        onPress={() => speakAI(item.content, index)}
                        style={[
                          styles.speakerBtn,
                          isThisSpeaking && styles.speakerBtnActive,
                        ]}
                        activeOpacity={0.8}
                      >
                        <Feather
                          name={isThisSpeaking ? "square" : "volume-2"}
                          size={12}
                          color={isThisSpeaking ? "#FFFFFF" : "#006D6A"}
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        isUser ? styles.userText : styles.aiText,
                      ]}
                    >
                      {item.content}
                    </Text>
                  </View>
                </View>
              );
            }}
          />

          {/* STATUS */}
          {isRecording && (
            <View style={styles.recordingBar}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Recording {formatRecordingTime(recordingSeconds)} • Tap stop to
                send
              </Text>
            </View>
          )}

          {transcribing && (
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color="#006D6A" />
              <Text style={styles.typingText}>Converting voice to text...</Text>
            </View>
          )}

          {loading && (
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color="#006D6A" />
              <Text style={styles.typingText}>
                {APP_NAME} AI is preparing your answer...
              </Text>
            </View>
          )}

          {/* INPUT ROW */}
          <View style={styles.inputContainer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={
                isRecording
                  ? "Recording your question..."
                  : "Ask app help, study doubt, or outside question..."
              }
              placeholderTextColor="#999"
              style={styles.input}
              multiline
              maxLength={1200}
              editable={!loading && !transcribing && !isRecording}
              textAlignVertical="center"
            />

            <TouchableOpacity
              onPress={handleMicPress}
              style={[
                styles.micBtn,
                isRecording && styles.micBtnRecording,
                micDisabled && { opacity: 0.5 },
              ]}
              disabled={micDisabled}
              activeOpacity={0.8}
            >
              {isRecording ? (
                <View style={styles.stopIcon} />
              ) : (
                <Feather name="mic" size={20} color="#374151" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendBtn,
                sendDisabled ? styles.sendBtnDisabled : styles.sendBtnActive,
              ]}
              disabled={sendDisabled}
              activeOpacity={0.8}
            >
              <Feather name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      <Modal
        visible={showHistory}
        transparent
        animationType="fade"
        onRequestClose={() => {
          blurActiveElement();
          setShowHistory(false);
        }}
      >
        <TouchableOpacity
          style={styles.historyOverlay}
          activeOpacity={1}
          onPress={() => {
            blurActiveElement();
            setShowHistory(false);
          }}
        >
          <View style={styles.historySheet}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Chat History</Text>
                <TouchableOpacity
                  onPress={() => {
                    blurActiveElement();
                    setShowHistory(false);
                    clearChat();
                  }}
                  style={styles.newChatBtn}
                  activeOpacity={0.85}
                >
                <Feather name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.newChatText}>New Chat</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={chatSessions}
              keyExtractor={(item) => String(item?.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.historyItem}
                  activeOpacity={0.88}
                  onPress={() => openSessionFromHistory(item?.id)}
                >
                  <View style={styles.historyItemTop}>
                    <Text style={styles.historyItemTitle} numberOfLines={1}>
                      {item?.title || "Clarivo Chat"}
                    </Text>
                    <Text style={styles.historyItemCount}>
                      {item?.messageCount || 0} msgs
                    </Text>
                  </View>
                  <Text style={styles.historyItemPreview} numberOfLines={2}>
                    {item?.lastMessagePreview || "No preview available"}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.historyEmpty}>
                  <Text style={styles.historyEmptyText}>No chat history yet.</Text>
                  <TouchableOpacity
                    onPress={() => {
                      blurActiveElement();
                      setShowHistory(false);
                      clearChat();
                    }}
                    style={styles.historyEmptyBtn}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.historyEmptyBtnText}>Start New Chat</Text>
                  </TouchableOpacity>
                </View>
              }
              contentContainerStyle={styles.historyList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: Platform.OS === "android" ? 40 : 52,
    backgroundColor: "#FFFFFF",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  headerTextBox: {
    flex: 1,
  },

  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#006D6A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#7A7A7A",
    fontWeight: "600",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#EAF8F6",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#C8F1EA",
  },

  historyText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "800",
    color: "#006D6A",
  },

  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F2F4F7",
    marginRight: 8,
  },

  clearText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#555",
  },

  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
  },

  closeText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#777",
  },

  askGuideBox: {
    marginTop: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: "#F0FAF8",
    borderWidth: 1,
    borderColor: "#C8F1EA",
  },

  askGuideTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#006D6A",
    marginBottom: 4,
  },

  askGuideText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: "#344054",
  },

  quickSection: {
    paddingTop: 12,
    paddingBottom: 6,
  },

  quickTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
  },

  quickList: {
    paddingRight: 10,
  },

  quickChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E6FFFB",
    borderWidth: 1,
    borderColor: "#B7F0EB",
    marginRight: 8,
  },

  quickChipDisabled: {
    opacity: 0.5,
  },

  quickChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#006D6A",
  },

  messageList: {
    flex: 1,
  },

  messageContent: {
    paddingTop: 10,
    paddingBottom: 10,
  },

  messageWrapper: {
    marginBottom: 12,
    maxWidth: "88%",
  },

  userWrapper: {
    alignSelf: "flex-end",
  },

  aiWrapper: {
    alignSelf: "flex-start",
  },

  aiLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
    marginBottom: 4,
  },

  roleLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#006D6A",
    marginRight: 6,
  },

  speakerBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E6FFFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#B7F0EB",
  },

  speakerBtnActive: {
    backgroundColor: "#006D6A",
    borderColor: "#006D6A",
  },

  bubble: {
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 18,
  },

  userBubble: {
    backgroundColor: "#006D6A",
    borderBottomRightRadius: 5,
  },

  aiBubble: {
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "#ECEFF3",
  },

  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },

  userText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },

  aiText: {
    color: "#1F2937",
    fontWeight: "500",
  },

  recordingBar: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FFE1E6",
    marginBottom: 8,
  },

  recordingDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#E11D48",
    marginRight: 8,
  },

  recordingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#BE123C",
  },

  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  typingText: {
    fontSize: 13,
    color: "#777",
    marginLeft: 8,
    fontWeight: "600",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    gap: 8,
  },

  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 11 : 8,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FAFAFA",
  },

  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  micBtnRecording: {
    backgroundColor: "#FFE4E6",
    borderColor: "#FDA4AF",
  },

  stopIcon: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: "#E11D48",
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  sendBtnActive: {
    backgroundColor: "#006D6A",
  },

  sendBtnDisabled: {
    backgroundColor: "#A3A3A3",
  },

  historyOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.36)",
    justifyContent: "flex-end",
  },

  historySheet: {
    maxHeight: "68%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
  },

  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  historyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#006D6A",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  newChatText: {
    marginLeft: 6,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  historyList: {
    paddingBottom: 8,
  },

  historyItem: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
  },

  historyItemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  historyItemTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginRight: 8,
  },

  historyItemCount: {
    fontSize: 11,
    fontWeight: "800",
    color: "#006D6A",
  },

  historyItemPreview: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6B7280",
  },

  historyEmpty: {
    paddingVertical: 18,
    alignItems: "center",
  },

  historyEmptyText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 10,
  },

  historyEmptyBtn: {
    borderRadius: 999,
    backgroundColor: "#006D6A",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  historyEmptyBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
