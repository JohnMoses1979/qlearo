


// screens/teacher/CompleteProfileScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  FlatList,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAppContext } from "../../context/AppContext";
import ShowAlert from "../../components/ShowAlert";

const { width, height } = Dimensions.get("window");

const COLORS = {
  white: "#FFFFFF",
  bg: "#FFFFFF",
  primary: "#006D6A",
  text: "#07123A",
  muted: "#5E687C",
  border: "#E3E9F3",
  inputText: "#2D3B52",
  avatarBg: "#EEF4F7",
};

const QUALIFICATIONS = [
  "B.Ed",
  "M.Ed",
  "B.Sc",
  "M.Sc",
  "B.Tech",
  "M.Tech",
  "Ph.D",
  "MBA",
  "BA",
  "MA",
  "Other",
];

const EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
  "6-10 years",
  "10+ years",
];

function PickerModal({ visible, title, options, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHandle} />
          <Text style={styles.pickerTitle}>{title}</Text>

          <FlatList
            data={options}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                activeOpacity={0.85}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.pickerItemText}>{item}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function CompleteProfileScreen({ navigation, route }) {
  const { completeTeacherRegistration } = useAppContext();
  // const [registrationPayload] = useState(() => ({

  //   fullName: route?.params?.fullName || "",
  //   email: route?.params?.email || "",
  //   phone: route?.params?.phone || "",
  //   password: route?.params?.password || "",
  // }));

  const registrationPayload = {
  fullName: route?.params?.fullName || "",
  email: route?.params?.email || "",
  phone: route?.params?.phone || "",
  password: route?.params?.password || "",
};
  const routeFormDefaults = {
    qualification: route?.params?.qualification || "",
    subjectExpertise: route?.params?.subjectExpertise || "",
    experience: route?.params?.experience || "",
    bio: route?.params?.bio || "",
  };
  const [profileImageAsset, setProfileImageAsset] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onClose: null,
  });

  const [form, setForm] = useState({
    ...routeFormDefaults,
  });

  const [qualPickerVisible, setQualPickerVisible] = useState(false);
  const [expPickerVisible, setExpPickerVisible] = useState(false);

  const openAlert = (title, message, onClose = null) => {
    setAlertConfig({ visible: true, title, message, onClose });
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

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ...routeFormDefaults,
    }));

    if (route?.params?.subjects?.length) {
      setForm((prev) => ({
        ...prev,
        subjectExpertise: route.params.subjects.join(", "),
      }));
    }
  }, [route?.params?.subjects, routeFormDefaults.qualification, routeFormDefaults.subjectExpertise, routeFormDefaults.experience, routeFormDefaults.bio]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const showPermissionAlert = (message) => {
    openAlert("Permission Required", message, () => {
      Linking.openSettings();
    });
  };

  const openImageOptions = () => {
    if (Platform.OS === "web") {
      openGallery();
      return;
    }

    openGallery();
  };

  const openCamera = async () => {
    try {
      if (Platform.OS === "web") {
        openAlert(
          "Not Supported",
          "Camera works on Android/iOS device or emulator, not web browser."
        );
        return;
      }

      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (permission.status !== "granted") {
        showPermissionAlert("Please allow camera permission to take a profile photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setProfileImage(result.assets[0].uri);
        setProfileImageAsset(result.assets[0]);
      }
    } catch (error) {
      openAlert("Camera Error", "Unable to open camera. Please try again.");
    }
  };

  const openGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        showPermissionAlert("Please allow gallery permission to upload a profile photo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setProfileImage(result.assets[0].uri);
        setProfileImageAsset(result.assets[0]);
      }
    } catch (error) {
      openAlert("Gallery Error", "Unable to open gallery. Please try again.");
    }
  };

  const goToSubjectExperience = () => {
    const selectedSubjects = form.subjectExpertise
      ? form.subjectExpertise
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    navigation.navigate("SubjectExperience", {
      ...registrationPayload,
      qualification: form.qualification,
      subjectExpertise: form.subjectExpertise,
      experience: form.experience,
      bio: form.bio,
      selectedSubjects,
    });
  };

  const handleSave = async () => {
    if (!form.qualification.trim()) {
      openAlert("Required", "Please select your qualification.");
      return;
    }

    if (!form.subjectExpertise.trim()) {
      openAlert("Required", "Please select subject expertise.");
      return;
    }

    if (!form.experience.trim()) {
      openAlert("Required", "Please select your experience.");
      return;
    }

    try {
      setSaving(true);
      await completeTeacherRegistration(
        {
          fullName: registrationPayload.fullName,
          email: registrationPayload.email,
          phone: registrationPayload.phone,
          password: registrationPayload.password,
          qualification: form.qualification.trim(),
          subjectExpertise: form.subjectExpertise.trim(),
          experience: form.experience.trim(),
          bio: form.bio.trim(),
        },
        profileImageAsset
      );
      setSaving(false);
      openAlert(
        "Registration Submitted",
        "Your teacher profile is waiting for admin approval. You can login after approval.",
        () => navigation.reset({
          index: 0,
          routes: [{
            name: "TeacherLogin",
            params: { emailOrPhone: registrationPayload.email || registrationPayload.phone || "" },
          }],
        })
      );
    } catch (error) {
      setSaving(false);
      openAlert("Save Failed", error.message || "Unable to complete registration.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <PickerModal
        visible={qualPickerVisible}
        title="Select Qualification"
        options={QUALIFICATIONS}
        onSelect={(value) => updateField("qualification", value)}
        onClose={() => setQualPickerVisible(false)}
      />

      <PickerModal
        visible={expPickerVisible}
        title="Select Experience"
        options={EXPERIENCE_OPTIONS}
        onSelect={(value) => updateField("experience", value)}
        onClose={() => setExpPickerVisible(false)}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Tell us more about yourself</Text>
          </View>

          <View style={styles.avatarSection}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.avatarCircle}
              onPress={openImageOptions}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person-outline" size={44} color={COLORS.muted} />
              )}

              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={13} color={COLORS.white} />
              </View>
            </TouchableOpacity>

            <Text style={styles.avatarHint}>Tap to upload photo</Text>
          </View>

          <View style={styles.formBox}>
            <TouchableOpacity
              style={styles.selectBox}
              activeOpacity={0.85}
              onPress={() => setQualPickerVisible(true)}
            >
              <Text
                style={[
                  styles.selectText,
                  !form.qualification && styles.placeholderText,
                ]}
              >
                {form.qualification || "Qualification"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectBox}
              activeOpacity={0.85}
              onPress={goToSubjectExperience}
            >
              <Text
                style={[
                  styles.selectText,
                  !form.subjectExpertise && styles.placeholderText,
                ]}
                numberOfLines={1}
              >
                {form.subjectExpertise || "Subject Expertise"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectBox}
              activeOpacity={0.85}
              onPress={() => setExpPickerVisible(true)}
            >
              <Text
                style={[
                  styles.selectText,
                  !form.experience && styles.placeholderText,
                ]}
              >
                {form.experience || "Experience (Years)"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
            </TouchableOpacity>

            <View style={styles.bioBox}>
              <TextInput
                value={form.bio}
                onChangeText={(text) => updateField("bio", text)}
                placeholder="Bio (Optional)"
                placeholderTextColor={COLORS.muted}
                style={styles.bioInput}
                multiline
                textAlignVertical="top"
                maxLength={300}
              />
            </View>

            <TouchableOpacity activeOpacity={0.9} style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.saveText}>Submit For Approval</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ShowAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={closeAlert}
      />
    </SafeAreaView>
  );
}

const AVATAR_SIZE = width < 380 ? 92 : 104;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width < 380 ? 18 : 24,
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

  header: {
    alignItems: "center",
    marginBottom: height < 700 ? 22 : 28,
  },

  title: {
    fontSize: width < 380 ? 22 : 25,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
    textAlign: "center",
  },

  avatarSection: {
    alignItems: "center",
    marginBottom: height < 700 ? 26 : 32,
  },

  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.avatarBg,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },

  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },

  cameraBadge: {
    position: "absolute",
    right: 4,
    bottom: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarHint: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  formBox: {
    width: "100%",
  },

  selectBox: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    flex: 1,
    fontSize: width < 380 ? 13 : 14,
    fontWeight: "700",
    color: COLORS.inputText,
    paddingRight: 8,
  },

  placeholderText: {
    color: COLORS.muted,
    fontWeight: "600",
  },

  bioBox: {
    minHeight: 88,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    marginBottom: height < 700 ? 26 : 36,
  },

  bioInput: {
    flex: 1,
    fontSize: width < 380 ? 13 : 14,
    fontWeight: "600",
    color: COLORS.inputText,
    paddingVertical: 0,
    minHeight: 60,
  },

  saveBtn: {
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
  },

  saveText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.white,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7,18,58,0.45)",
    justifyContent: "flex-end",
  },

  pickerSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    maxHeight: height * 0.55,
  },

  pickerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 16,
  },

  pickerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 12,
  },

  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  pickerItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.inputText,
  },
});

