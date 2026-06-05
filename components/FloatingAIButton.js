import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FloatingAIButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.iconWrap}>
        <Ionicons name="sparkles" size={18} color="#FFFFFF" />
      </View>
      <Text style={styles.label}>AI</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    minWidth: 64,
    height: 60,
    paddingHorizontal: 12,
    borderRadius: 30,
    backgroundColor: "#006D6A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    boxShadow: "0px 8px 14px rgba(0, 0, 0, 0.20)",
    zIndex: 9999,
    elevation: 10,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "white",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4,
    marginLeft: 6,
  },
});
