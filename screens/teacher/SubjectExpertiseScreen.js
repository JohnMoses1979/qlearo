

// screens/teacher/SubjectExperienceScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const isCompactScreen = width < 420;

const COLORS = {
  white: "#FFFFFF",
  bg: "#FFFFFF",
  primary: "#006D6A",
  text: "#07123A",
  muted: "#5E687C",
  border: "#E4EAF3",
  chipBg: "#F8FAFC",
  lightGreen: "#F0FAF9",
};

const DEFAULT_SUBJECTS = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "English",
  "History",
  "Geography",
  "Economics",
  "Computer Science",
];

export default function SubjectExperienceScreen({ navigation, route }) {
  const initialSubjects =
    route?.params?.selectedSubjects?.length > 0
      ? route.params.selectedSubjects
      : ["Chemistry", "Mathematics", "Biology"];

  const [subjects, setSubjects] = useState(() => {
    const merged = [...DEFAULT_SUBJECTS];

    initialSubjects.forEach((subject) => {
      if (!merged.includes(subject)) {
        merged.push(subject);
      }
    });

    return merged;
  });

  const [selectedSubjects, setSelectedSubjects] = useState(initialSubjects);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState("");

  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((item) => item !== subject)
        : [...prev, subject]
    );
  };

  const handleAddCustomSubject = () => {
    const trimmed = customSubjectInput.trim();

    if (!trimmed) {
      global.showAlert("Required", "Please enter a subject name.");
      return;
    }

    if (subjects.includes(trimmed)) {
      global.showAlert("Duplicate", "This subject already exists.");
      return;
    }

    setSubjects((prev) => [...prev, trimmed]);
    setSelectedSubjects((prev) => [...prev, trimmed]);
    setCustomSubjectInput("");
    setCustomModalVisible(false);
  };

  const handleNext = () => {
    if (selectedSubjects.length === 0) {
      global.showAlert("Required", "Please select at least one subject.");
      return;
    }

    navigation.navigate("CompleteProfile", {
      fullName: route?.params?.fullName || "",
      email: route?.params?.email || "",
      phone: route?.params?.phone || "",
      password: route?.params?.password || "",
      qualification: route?.params?.qualification || "",
      subjectExpertise: selectedSubjects.join(", "),
      experience: route?.params?.experience || "",
      bio: route?.params?.bio || "",
      subjects: selectedSubjects,
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <Modal
        visible={customModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Custom Subject</Text>
            <Text style={styles.modalSubtitle}>
              Enter the subject name you want to add
            </Text>

            <View style={styles.modalInputBox}>
              <Ionicons
                name="book-outline"
                size={18}
                color={COLORS.muted}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={customSubjectInput}
                onChangeText={setCustomSubjectInput}
                placeholder="e.g. Sanskrit, Accountancy"
                placeholderTextColor={COLORS.muted}
                style={styles.modalInput}
                autoFocus
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                activeOpacity={0.8}
                onPress={() => {
                  setCustomSubjectInput("");
                  setCustomModalVisible(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalAddBtn}
                activeOpacity={0.9}
                onPress={handleAddCustomSubject}
              >
                <Text style={styles.modalAddText}>Add Subject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.stepRow}>
          <View style={styles.stepDotActive} />
          <View style={styles.stepLine} />
          <View style={styles.stepDotActive} />
          <View style={styles.stepLine} />
          <View style={styles.stepDotInactive} />
        </View>

        <Text style={styles.stepLabel}>Step 2 of 3</Text>

        <Text style={styles.title}>Subject Expertise</Text>
        <Text style={styles.subtitle}>
          Select subjects you are expert in{"\n"}(Multiple selection allowed)
        </Text>

        {selectedSubjects.length > 0 && (
          <View style={styles.selectedPill}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
            <Text style={styles.selectedPillText}>
              {selectedSubjects.length} subject
              {selectedSubjects.length > 1 ? "s" : ""} selected
            </Text>
          </View>
        )}

        <View style={styles.subjectGrid}>
          {subjects.map((subject) => {
            const isSelected = selectedSubjects.includes(subject);
            const isCustom = !DEFAULT_SUBJECTS.includes(subject);

            return (
              <TouchableOpacity
                key={subject}
                activeOpacity={0.85}
                style={[
                  styles.subjectChip,
                  isSelected && styles.subjectChipActive,
                ]}
                onPress={() => toggleSubject(subject)}
              >
                {isCustom && (
                  <Ionicons
                    name="star"
                    size={10}
                    color={isSelected ? "rgba(255,255,255,0.7)" : COLORS.primary}
                    style={{ marginRight: 4 }}
                  />
                )}

                <Text
                  style={[
                    styles.subjectText,
                    isSelected && styles.subjectTextActive,
                  ]}
                  numberOfLines={isCompactScreen ? 2 : 1}
                >
                  {subject}
                </Text>

                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={13}
                    color={COLORS.white}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.addSubjectBtn}
          onPress={() => setCustomModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
          <Text style={styles.addSubjectText}>Add Custom Subject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.nextBtn,
            selectedSubjects.length === 0 && styles.nextBtnDisabled,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>Next</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const chipWidth = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 22 : 14,
    paddingBottom: 34,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  stepDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  stepDotInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
  },

  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.primary,
    marginHorizontal: 6,
  },

  stepLabel: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    marginBottom: 18,
  },

  title: {
    fontSize: width < 380 ? 22 : 25,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.muted,
    textAlign: "center",
  },

  selectedPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: COLORS.lightGreen,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 5,
    marginBottom: 16,
  },

  selectedPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },

  subjectGrid: {
    flexDirection: isCompactScreen ? "column" : "row",
    flexWrap: isCompactScreen ? "nowrap" : "wrap",
    gap: 12,
    marginBottom: 16,
  },

  subjectChip: {
    width: isCompactScreen ? "100%" : chipWidth,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.chipBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  subjectChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  subjectText: {
    fontSize: isCompactScreen ? 14 : 13,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    flexShrink: 1,
  },

  subjectTextActive: {
    color: COLORS.white,
  },

  checkIcon: {
    marginLeft: 5,
  },

  addSubjectBtn: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightGreen,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
    marginTop: 4,
  },

  addSubjectText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
  },

  nextBtn: {
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
  },

  nextBtnDisabled: {
    opacity: 0.5,
  },

  nextText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.white,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7,18,58,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  modalCard: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 6,
  },

  modalSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
    marginBottom: 20,
  },

  modalInputBox: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  modalInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    paddingVertical: 0,
  },

  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
  },

  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  modalCancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.muted,
  },

  modalAddBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  modalAddText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },
});
