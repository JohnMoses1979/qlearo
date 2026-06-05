import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

let alertQueueHandler = null;
let queuedAlerts = [];

const AppAlertContext = createContext({
  showAlert: () => {},
});

const normalizeButtons = (buttons = []) => {
  const list = Array.isArray(buttons) ? buttons.filter(Boolean) : [];

  if (list.length > 0) {
    return list.map((button, index) => ({
      text: String(button?.text || (index === 0 ? "OK" : "Cancel")),
      style: button?.style || (index === 0 ? "default" : "cancel"),
      onPress: typeof button?.onPress === "function" ? button.onPress : undefined,
      keepOpen: Boolean(button?.keepOpen),
    }));
  }

  return [{ text: "OK", style: "default" }];
};

const normalizeAlert = (title, message, buttons, options) => ({
  title: String(title || "Notice"),
  message: String(message || ""),
  buttons: normalizeButtons(buttons),
  options: options || {},
});

export const showAlert = (title, message, buttons, options) => {
  const payload = normalizeAlert(title, message, buttons, options);

  if (typeof alertQueueHandler === "function") {
    alertQueueHandler(payload);
    return;
  }

  queuedAlerts.push(payload);
};

if (typeof globalThis !== "undefined") {
  globalThis.showAlert = showAlert;
}

export function useAppAlert() {
  return useContext(AppAlertContext);
}

export function AppAlertProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);

  const enqueueAlert = useCallback((payload) => {
    setQueue((prev) => [...prev, payload]);
  }, []);

  useEffect(() => {
    alertQueueHandler = enqueueAlert;

    if (queuedAlerts.length > 0) {
      setQueue((prev) => [...prev, ...queuedAlerts]);
      queuedAlerts = [];
    }

    return () => {
      if (alertQueueHandler === enqueueAlert) {
        alertQueueHandler = null;
      }
    };
  }, [enqueueAlert]);

  useEffect(() => {
    if (!currentAlert && queue.length > 0) {
      setCurrentAlert(queue[0]);
      setQueue((prev) => prev.slice(1));
    }
  }, [currentAlert, queue]);

  const closeAlert = useCallback(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      try {
        const active = document.activeElement;
        if (active && typeof active.blur === "function") {
          active.blur();
        }
      } catch (error) {
        // no-op
      }
    }
    setCurrentAlert(null);
  }, []);

  const handleButtonPress = useCallback(
    (button) => {
      try {
        button?.onPress?.();
      } finally {
        if (button?.keepOpen !== true) {
          closeAlert();
        }
      }
    },
    [closeAlert]
  );

  const cancelable = currentAlert?.options?.cancelable !== false;

  const theme = useMemo(
    () => ({
      backdrop: "rgba(6, 16, 33, 0.55)",
      card: "#FFFFFF",
      primary: "#00897B",
      primarySoft: "#E6F5F3",
      text: "#081225",
      muted: "#6E7891",
      border: "#E4EBF2",
      danger: "#EF4444",
      shadow: "rgba(0,0,0,0.18)",
    }),
    []
  );

  return (
    <AppAlertContext.Provider value={{ showAlert }}>
      {children}

      <Modal
        visible={Boolean(currentAlert)}
        transparent
        animationType="fade"
        onRequestClose={closeAlert}
        statusBarTranslucent
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: theme.backdrop }]}
          onPress={cancelable ? closeAlert : undefined}
        >
        <Pressable
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={() => {}}
        >
            <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="information-circle" size={28} color={theme.primary} />
            </View>

            <Text style={[styles.title, { color: theme.text }]}>{currentAlert?.title}</Text>
            {!!currentAlert?.message && (
              <Text style={[styles.message, { color: theme.muted }]}>{currentAlert.message}</Text>
            )}

            <View style={styles.actions}>
              {currentAlert?.buttons?.map((button, index) => {
                const isCancel = button?.style === "cancel";
                const isDestructive = button?.style === "destructive";

                return (
                  <TouchableOpacity
                    key={`${button?.text || "button"}-${index}`}
                    activeOpacity={0.9}
                    style={[
                      styles.button,
                      currentAlert.buttons.length === 1 && styles.buttonFull,
                      isCancel && [styles.buttonCancel, { borderColor: theme.border }],
                      isDestructive && [styles.buttonDestructive, { backgroundColor: theme.danger }],
                      !isCancel && !isDestructive && [styles.buttonPrimary, { backgroundColor: theme.primary }],
                    ]}
                    onPress={() => handleButtonPress(button)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        isCancel && { color: theme.text },
                        isDestructive && styles.buttonTextLight,
                        !isCancel && !isDestructive && styles.buttonTextLight,
                      ]}
                    >
                      {button?.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AppAlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderWidth: Platform.OS === "web" ? 1 : 0,
    borderColor: "rgba(228,235,242,0.9)",
    ...Platform.select({
      web: {
        boxShadow: "0px 14px 24px rgba(0, 0, 0, 0.18)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-end",
  },
  button: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonFull: {
    width: "100%",
  },
  buttonPrimary: {},
  buttonCancel: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
  },
  buttonDestructive: {},
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  buttonTextLight: {
    color: "#FFFFFF",
  },
});
