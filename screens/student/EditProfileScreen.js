// screens/student/EditProfileScreen.js

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import ShowAlert from "../../components/ShowAlert";
const COLORS = {
  bg: "#F2F7FF",
  white: "#FFFFFF",
  primary: "#006D6A",
  primaryLight: "#E6F5F4",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E2EBF6",
  focusBorder: "#006D6A",
  red: "#FF4757",
};

const CLASS_OPTIONS = ["6th", "7th", "8th", "9th", "10th", "11th", "12th", "UG", "PG"];

const SUBJECT_OPTIONS = ["Mathematics", "Science", "English", "Hindi", "Social Science", "Physics", "Chemistry", "Biology"];

export default function EditProfileScreen({ navigation }) {
  const { currentUser, updateStudentProfile, uploadStudentAvatar } = useAppContext();
  const defaultSubjects = useMemo(
    () =>
      Array.isArray(currentUser?.favoriteSubjects) &&
      currentUser.favoriteSubjects.length > 0
        ? currentUser.favoriteSubjects
        : ["Mathematics", "Science"],
    [currentUser?.favoriteSubjects]
  );

  const [name, setName] = useState(currentUser?.fullName || currentUser?.name || "Student");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [school, setSchool] = useState(currentUser?.school || "");
  const [selectedClass, setClass] = useState(currentUser?.className || "10th");
  const [selectedSubjects, setSubjects] = useState(defaultSubjects);
  const [focusedField, setFocused] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState(
    currentUser?.avatar || currentUser?.image || null
  );
  const [selectedAvatarAsset, setSelectedAvatarAsset] = useState(null);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onClose: null,
  });

  const openAlert = (title, message, onClose = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      onClose,
    });
  };

  const closeAlert = () => {
    const callback = alertConfig.onClose;

    setAlertConfig({
      visible: false,
      title: "",
      message: "",
      onClose: null,
    });

    if (typeof callback === "function") {
      callback();
    }
  };

  const toggleSubject = (sub) => {
    setSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      openAlert("Required", "Please enter your name.");
      return;
    }

    try {
      setSaving(true);
      await updateStudentProfile({
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        school: school.trim(),
        className: selectedClass,
        favoriteSubjects: selectedSubjects,
      });

      if (selectedAvatarAsset?.uri) {
        const uploadedProfile = await uploadStudentAvatar(selectedAvatarAsset);
        if (uploadedProfile?.avatar) {
          setAvatarUri(uploadedProfile.avatar);
        }
      }

      setSaving(false);
      openAlert(
        "Profile Updated",
        "Your profile changes were saved successfully.",
        () => navigation.goBack()
      );
    } catch (error) {
      setSaving(false);
      openAlert("Update Failed", error.message || "Unable to update profile.");
    }
  };

  const handlePickAvatar = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          openAlert("Permission Required", "Please allow photo access to upload your profile image.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        openAlert("Image Error", "Unable to read selected image.");
        return;
      }

      setSelectedAvatarAsset(asset);
      setAvatarUri(asset.uri);
    } catch (error) {
      openAlert("Image Error", "Unable to select image. Please try again.");
    }
  };

  const inputStyle = (field) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];
  const avatarInitials = useMemo(
    () =>
      String(name || currentUser?.fullName || currentUser?.name || "Student")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "S",
    [currentUser?.fullName, currentUser?.name, name]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave}>
          <Text style={styles.saveHeaderText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image
                key={avatarUri}
                source={{ uri: avatarUri }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitials}>{avatarInitials}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraBtn} onPress={handlePickAvatar}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* ── Personal Info ── */}
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <View style={styles.card}>

          {/* Full Name */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <View style={inputStyle("name")}>
              <Ionicons name="person-outline" size={16} color={COLORS.muted} />
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.fieldInput}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.muted}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          <View style={styles.fieldDivider} />

          {/* Email */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={inputStyle("email")}>
              <Ionicons name="mail-outline" size={16} color={COLORS.muted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.fieldInput}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          <View style={styles.fieldDivider} />

          {/* Phone */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={inputStyle("phone")}>
              <Ionicons name="call-outline" size={16} color={COLORS.muted} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.fieldInput}
                placeholder="Enter your phone number"
                placeholderTextColor={COLORS.muted}
                keyboardType="phone-pad"
                onFocus={() => setFocused("phone")}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>
        </View>

        {/* ── Academic Info ── */}
        <Text style={styles.sectionTitle}>Academic Info</Text>
        <View style={styles.card}>

          {/* School/Institute */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>School / Institute</Text>
            <View style={inputStyle("school")}>
              <Ionicons name="school-outline" size={16} color={COLORS.muted} />
              <TextInput
                value={school}
                onChangeText={setSchool}
                style={styles.fieldInput}
                placeholder="Enter school or institute name"
                placeholderTextColor={COLORS.muted}
                onFocus={() => setFocused("school")}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          <View style={styles.fieldDivider} />

          {/* Class */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Class / Year</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {CLASS_OPTIONS.map((cls) => (
                <TouchableOpacity
                  key={cls}
                  style={[styles.chip, selectedClass === cls && styles.chipActive]}
                  onPress={() => setClass(cls)}
                >
                  <Text style={[styles.chipText, selectedClass === cls && styles.chipTextActive]}>
                    {cls}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ── Favourite Subjects ── */}
        <Text style={styles.sectionTitle}>Favourite Subjects</Text>
        <View style={styles.card}>
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldSubLabel}>Select subjects you want help with</Text>
            <View style={styles.subjectGrid}>
              {SUBJECT_OPTIONS.map((sub) => {
                const active = selectedSubjects.includes(sub);
                return (
                  <TouchableOpacity
                    key={sub}
                    style={[styles.subjectChip, active && styles.subjectChipActive]}
                    onPress={() => toggleSubject(sub)}
                  >
                    {active && (
                      <Ionicons name="checkmark-circle" size={13} color={COLORS.primary} />
                    )}
                    <Text style={[styles.subjectChipText, active && styles.subjectChipTextActive]}>
                      {sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Save Button ── */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── Delete Account ── */}
        <TouchableOpacity style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={COLORS.red} />
          <Text style={styles.deleteBtnText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>

      <ShowAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={closeAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  /* Header */
  header: {
    height: 56,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  backBtn: {
    width: 38,
    height: 38,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 15, fontWeight: "900", color: COLORS.text },
  saveHeaderBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  saveHeaderText: { fontSize: 12, fontWeight: "900", color: COLORS.primary },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* Avatar */
  avatarSection: { alignItems: "center", marginBottom: 28 },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.8,
  },
  cameraBtn: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHint: { marginTop: 10, fontSize: 11.5, fontWeight: "700", color: COLORS.muted },

  /* Section */
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.muted,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  fieldWrapper: { paddingHorizontal: 14, paddingVertical: 13 },
  fieldDivider: { height: 0.5, backgroundColor: COLORS.border, marginLeft: 14 },
  fieldLabel: { fontSize: 10.5, fontWeight: "800", color: COLORS.muted, marginBottom: 8 },
  fieldSubLabel: { fontSize: 11, fontWeight: "700", color: COLORS.muted, marginBottom: 12 },

  /* Input */
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
  },
  inputFocused: {
    borderColor: COLORS.focusBorder,
    backgroundColor: COLORS.primaryLight,
  },
  fieldInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    paddingVertical: 0,
  },

  /* Chips */
  chipRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: "800", color: COLORS.muted },
  chipTextActive: { color: COLORS.white },

  /* Subject Grid */
  subjectGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  subjectChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subjectChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  subjectChipText: { fontSize: 12, fontWeight: "700", color: COLORS.muted },
  subjectChipTextActive: { color: COLORS.primary, fontWeight: "800" },

  /* Save */
  saveBtn: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  saveBtnText: { fontSize: 15, fontWeight: "900", color: COLORS.white },

  /* Delete */
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 18,
    paddingVertical: 10,
  },
  deleteBtnText: { fontSize: 12.5, fontWeight: "800", color: COLORS.red },
});
