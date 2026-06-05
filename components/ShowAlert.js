import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  overlay: "rgba(7,18,58,0.42)",
  white: "#FFFFFF",
  title: "#07123A",
  text: "#5F6C86",
  primary: "#006D6A",
  primaryDark: "#00514F",
  border: "#E4EBF3",
};

export default function ShowAlert({
  visible,
  title,
  message,
  buttonText = "OK",
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.card}>
          <View style={styles.badge}>
            <View style={styles.badgeInner} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  badge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#E7F7F5",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14,
  },

  badgeInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },

  title: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.title,
    textAlign: "center",
  },

  message: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },

  button: {
    marginTop: 20,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});
