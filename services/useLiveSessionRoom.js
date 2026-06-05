import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildLiveSessionWsUrl,
  fetchLiveSessionMessages,
  postLiveSessionMessage,
} from "./liveSessionApi";

const safeArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined && item !== null && item !== "");
  }

  return [];
};

const makeId = (prefix = "LIVE") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const getReadableTime = (dateValue) => {
  if (!dateValue) return "Now";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "Now";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMessageKey = (message = {}) =>
  String(message.clientId || message.id || `${message.senderId || "user"}-${message.createdAt || message.time || ""}`);

const sortMessages = (list = []) =>
  [...list].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.updatedAt || a.time || 0).getTime();
    const timeB = new Date(b.createdAt || b.updatedAt || b.time || 0).getTime();

    if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
    if (Number.isNaN(timeA)) return 1;
    if (Number.isNaN(timeB)) return -1;

    return timeA - timeB;
  });

const mergeMessages = (existing = [], incoming = []) => {
  const map = new Map();

  [...existing, ...incoming].forEach((item) => {
    map.set(getMessageKey(item), item);
  });

  return sortMessages(Array.from(map.values()));
};

const normalizeMessage = (raw = {}, currentUser = null, sessionId = "") => {
  const base = raw.message && typeof raw.message === "object" ? raw.message : raw;
  const payload = base.payload && typeof base.payload === "object" ? base.payload : {};
  const text = base.text || payload.text || payload.title || base.title || "";
  const senderId = base.senderId || raw.senderId || "";
  const senderName = base.senderName || base.sender || raw.senderName || raw.sender || "You";
  const senderRole = base.senderRole || raw.senderRole || "student";
  const createdAt = base.createdAt || raw.createdAt || new Date().toISOString();
  const timeValue = base.time || raw.time || "";
  const type = String(base.type || raw.type || payload.type || "chat").toLowerCase();
  const strokes = safeArray(base.strokes || raw.strokes || payload.strokes);
  const displayTime =
    typeof timeValue === "string" && /T\d{2}:\d{2}/.test(timeValue)
      ? getReadableTime(createdAt)
      : timeValue || getReadableTime(createdAt);

  return {
    id: base.id || raw.id || makeId("LIVE"),
    clientId: base.clientId || raw.clientId || payload.clientId || null,
    sessionId: base.sessionId || raw.sessionId || sessionId,
    senderId,
    senderName,
    sender: senderName,
    senderRole,
    type,
    text,
    strokes,
    whiteboard: base.whiteboard || raw.whiteboard || payload.whiteboard || null,
    imageUri: base.imageUri || raw.imageUri || payload.imageUri || null,
    createdAt,
    updatedAt: base.updatedAt || raw.updatedAt || createdAt,
    time: displayTime,
    isMe: Boolean(currentUser?.id && senderId && currentUser.id === senderId),
    payload: payload,
  };
};

const normalizeInitialMessages = (
  initialMessages = [],
  currentUser = null,
  sessionId = "",
  fallbackRole = "student"
) =>
  sortMessages(
    safeArray(initialMessages).map((message) =>
      normalizeMessage(
        {
          ...message,
          senderId: message.senderId || currentUser?.id || "",
          senderName: message.senderName || message.sender || currentUser?.name || "You",
          senderRole: message.senderRole || currentUser?.role || fallbackRole,
        },
        currentUser,
        sessionId
      )
    )
  );

export const useLiveSessionRoom = ({
  sessionId,
  currentUser,
  initialMessages = [],
  fallbackRole = "student",
}) => {
  const socketRef = useRef(null);
  const seenKeysRef = useRef(new Set());
  const [connectionState, setConnectionState] = useState("connecting");
  const [messages, setMessages] = useState(() =>
    normalizeInitialMessages(initialMessages, currentUser, sessionId, fallbackRole)
  );

  const currentUserId = currentUser?.id || "";
  const currentUserName = currentUser?.name || "You";
  const currentUserRole = currentUser?.role || fallbackRole;

  const appendMessage = useCallback(
    (message = {}) => {
      const normalized = normalizeMessage(
        {
          ...message,
          sessionId,
          senderId: message.senderId || currentUserId,
          senderName: message.senderName || message.sender || currentUserName,
          senderRole: message.senderRole || currentUserRole,
        },
        currentUser,
        sessionId
      );

      const key = getMessageKey(normalized);
      seenKeysRef.current.add(key);

      setMessages((prev) => mergeMessages(prev, [normalized]));
      return normalized;
    },
    [currentUser, currentUserId, currentUserName, currentUserRole, sessionId]
  );

  useEffect(() => {
    if (!sessionId) {
      return undefined;
    }

    seenKeysRef.current = new Set();
    setMessages(
      normalizeInitialMessages(initialMessages, currentUser, sessionId, fallbackRole)
    );
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      return undefined;
    }

    let cancelled = false;

    const hydrateHistory = async () => {
      try {
        const history = await fetchLiveSessionMessages(sessionId);

        if (cancelled || !Array.isArray(history)) {
          return;
        }

        const normalizedHistory = history.map((item) =>
          normalizeMessage(item, currentUser, sessionId)
        );

        normalizedHistory.forEach((item) =>
          seenKeysRef.current.add(getMessageKey(item))
        );

        setMessages((prev) => mergeMessages(prev, normalizedHistory));
      } catch (error) {
        console.warn("Failed to hydrate live session history", error);
      }
    };

    hydrateHistory();

    return () => {
      cancelled = true;
    };
  }, [currentUser, sessionId]);

  const applyIncoming = useCallback(
    (payload = {}) => {
      if (payload.action === "history" && Array.isArray(payload.messages)) {
        const history = payload.messages.map((item) =>
          normalizeMessage(item, currentUser, sessionId)
        );

        history.forEach((item) => seenKeysRef.current.add(getMessageKey(item)));
        setMessages((prev) => mergeMessages(prev, history));
        return;
      }

      if (payload.action === "message") {
        const incoming = normalizeMessage(payload.message || payload, currentUser, sessionId);
        const key = getMessageKey(incoming);

        if (seenKeysRef.current.has(key)) {
          return;
        }

        seenKeysRef.current.add(key);
        setMessages((prev) => mergeMessages(prev, [incoming]));
      }
    },
    [currentUser, sessionId]
  );

  useEffect(() => {
    if (!sessionId) {
      return undefined;
    }

    const wsUrl = buildLiveSessionWsUrl(sessionId, {
      userId: currentUserId,
      userName: currentUserName,
      userRole: currentUserRole,
    });

    let cancelled = false;

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      setConnectionState("connecting");

      socket.onopen = () => {
        if (cancelled) return;

        setConnectionState("open");
        socket.send(
          JSON.stringify({
            action: "join",
            sessionId,
            senderId: currentUserId,
            senderName: currentUserName,
            senderRole: currentUserRole,
          })
        );
      };

      socket.onmessage = (event) => {
        if (cancelled) return;

        try {
          const payload = JSON.parse(event.data);
          if (payload?.action === "presence" || payload?.action === "typing") {
            return;
          }

          applyIncoming(payload);
        } catch (error) {
          console.warn("Failed to parse live session message", error);
        }
      };

      socket.onerror = () => {
        if (!cancelled) {
          setConnectionState("error");
        }
      };

      socket.onclose = () => {
        if (!cancelled) {
          setConnectionState("closed");
        }
      };
    } catch (error) {
      setConnectionState("error");
    }

    return () => {
      cancelled = true;

      try {
        const socket = socketRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              action: "leave",
              sessionId,
              senderId: currentUserId,
              senderName: currentUserName,
              senderRole: currentUserRole,
            })
          );
        }
        socket?.close?.();
      } catch (error) {
        // Ignore cleanup errors.
      }
    };
  }, [applyIncoming, currentUserId, currentUserName, currentUserRole, sessionId]);

  const sendEvent = useCallback(
    async (payload = {}) => {
      const nextPayload = {
        action: "message",
        sessionId,
        clientId: payload.clientId || makeId("LIVE"),
        senderId: payload.senderId || currentUserId,
        senderName: payload.senderName || payload.sender || currentUserName,
        senderRole: payload.senderRole || currentUserRole,
        type: payload.type || "chat",
        text: payload.text || "",
        strokes: safeArray(payload.strokes),
        imageUri: payload.imageUri || null,
        title: payload.title || "",
        createdAt: payload.createdAt || new Date().toISOString(),
      };

      const optimistic = appendMessage(nextPayload);

      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(JSON.stringify(nextPayload));
          return optimistic;
        } catch (error) {
          console.warn("WebSocket send failed, falling back to HTTP", error);
        }
      }

      try {
        const saved = await postLiveSessionMessage(sessionId, nextPayload);
        const incoming = normalizeMessage(saved, currentUser, sessionId);
        seenKeysRef.current.add(getMessageKey(incoming));
        setMessages((prev) => mergeMessages(prev, [incoming]));
        return incoming;
      } catch (error) {
        console.warn("Failed to send live session message", error);
        return optimistic;
      }
    },
    [appendMessage, currentUser, currentUserId, currentUserName, currentUserRole, sessionId]
  );

  const sendTypingState = useCallback(
    (isTyping) => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return;
      }

      socket.send(
        JSON.stringify({
          action: "typing",
          sessionId,
          isTyping: Boolean(isTyping),
          senderId: currentUserId,
          senderName: currentUserName,
          senderRole: currentUserRole,
        })
      );
    },
    [currentUserId, currentUserName, currentUserRole, sessionId]
  );

  const shareWhiteboard = useCallback(
    (payload = {}) =>
      sendEvent({
        ...payload,
        type: "whiteboard",
        text: payload.title || "Whiteboard shared",
      }),
    [sendEvent]
  );

  return useMemo(
    () => ({
      messages,
      setMessages,
      appendMessage,
      sendEvent,
      sendTypingState,
      shareWhiteboard,
      isConnected: connectionState === "open",
      connectionState,
    }),
    [appendMessage, connectionState, messages, sendEvent, sendTypingState, shareWhiteboard]
  );
};
