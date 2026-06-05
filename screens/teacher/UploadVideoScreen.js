

// screens/teacher/UploadVideoScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const COLORS = {
  primary: "#008F7A",
  bg: "#F5F7FB",
  white: "#FFFFFF",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E8ECF4",
};

const VISIBILITIES = ["Public", "Unlisted", "Private"];

export default function UploadVideoScreen({ navigation, route }) {
  const { addUploadedVideo, updateUploadedVideo } = useAppContext();
  const editVideo = route?.params?.editVideo || null;
  const isEditMode = !!editVideo;

  const [videoFile, setVideoFile] = useState(
    isEditMode ? editVideo.videoUrl || "existing" : null
  );
  const [videoFileName, setVideoFileName] = useState(
    isEditMode ? "Existing video" : ""
  );
  const [title, setTitle] = useState(editVideo?.title || "");
  const [subject, setSubject] = useState(editVideo?.subject || "");
  const [className, setClassName] = useState(editVideo?.className || "");
  const [topic, setTopic] = useState(editVideo?.topic || "");
  const [description, setDescription] = useState(editVideo?.description || "");
  const [visibility, setVisibility] = useState(editVideo?.visibility || "Public");
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const pickVideo = async () => {
    try {
      setErrorMsg("");
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });

      // Expo SDK 49+ returns { canceled, assets } instead of { type, uri }
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setVideoFile(asset.uri);
        setVideoFileName(asset.name || "Video selected");
      } else if (result.type === "success") {
        // Older Expo SDK fallback
        setVideoFile(result.uri);
        setVideoFileName(result.name || "Video selected");
      }
      // If canceled, do nothing — no error
    } catch (e) {
      setErrorMsg("Could not pick video. Please try again.");
    }
  };

  const validate = () => {
    if (!isEditMode && !videoFile) {
      setErrorMsg("Please select a video file.");
      return false;
    }
    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return false;
    }
    if (!subject.trim()) {
      setErrorMsg("Subject is required.");
      return false;
    }
    if (!className.trim()) {
      setErrorMsg("Class is required.");
      return false;
    }
    if (!topic.trim()) {
      setErrorMsg("Topic is required.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const handleUpload = async () => {
    if (!validate()) return;
    setUploading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (isEditMode) {
        await updateUploadedVideo(editVideo.id, {
          title: title.trim(),
          subject: subject.trim(),
          className: className.trim(),
          topic: topic.trim(),
          description: description.trim(),
          visibility,
          videoUrl: videoFile,
        });
      } else {
        await addUploadedVideo({
          title: title.trim(),
          subject: subject.trim(),
          className: className.trim(),
          topic: topic.trim(),
          description: description.trim(),
          visibility,
          videoUrl: videoFile,
        });
      }

      setUploading(false);
      navigation.navigate("UploadedVideosScreen");
    } catch (e) {
      setUploading(false);
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.bg} barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.heading}>
            {isEditMode ? "Edit Video" : "Upload Video"}
          </Text>
          <Text style={styles.subHeading}>
            {isEditMode ? "Update video details" : "Share your knowledge"}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Video Picker Box */}
        {!isEditMode && (
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={pickVideo}
            activeOpacity={0.85}
          >
            {videoFile ? (
              <>
                <View style={styles.successCircle}>
                  <Ionicons name="videocam" size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.uploadTitle} numberOfLines={1}>
                  Video Selected ✓
                </Text>
                <Text style={styles.uploadSub} numberOfLines={1}>
                  {videoFileName || "Tap to change video"}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.cloudCircle}>
                  <Ionicons name="cloud-upload-outline" size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.uploadTitle}>Tap to Select Video</Text>
                <Text style={styles.uploadSub}>MP4, MOV, AVI up to 2GB</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Error Message */}
        {errorMsg !== "" && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Video Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📄 Video Details</Text>

          <Text style={styles.label}>Title *</Text>
          <TextInput
            placeholder="e.g. Introduction to Algebra"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            value={title}
            onChangeText={(t) => { setTitle(t); setErrorMsg(""); }}
          />

          <Text style={styles.label}>Subject *</Text>
          <TextInput
            placeholder="e.g. Mathematics"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            value={subject}
            onChangeText={(t) => { setSubject(t); setErrorMsg(""); }}
          />

          <Text style={styles.label}>Class *</Text>
          <TextInput
            placeholder="e.g. Class 10"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            value={className}
            onChangeText={(t) => { setClassName(t); setErrorMsg(""); }}
          />

          <Text style={styles.label}>Topic *</Text>
          <TextInput
            placeholder="e.g. Quadratic Equations"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            value={topic}
            onChangeText={(t) => { setTopic(t); setErrorMsg(""); }}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            placeholder="Optional description..."
            placeholderTextColor={COLORS.muted}
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Visibility */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌍 Visibility</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            {VISIBILITIES.map(item => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.visibilityBtn,
                  visibility === item && styles.visibilityBtnActive,
                ]}
                onPress={() => setVisibility(item)}
              >
                <Text
                  style={[
                    styles.visibilityText,
                    visibility === item && { color: "#FFF" },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.visibilityHint}>
            {visibility === "Public"
              ? "Everyone can see this video"
              : visibility === "Unlisted"
              ? "Only people with the link can see"
              : "Only you can see this video"}
          </Text>
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && { opacity: 0.75 }]}
          onPress={handleUpload}
          disabled={uploading}
          activeOpacity={0.85}
        >
          {uploading ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.uploadBtnText}>
                {isEditMode ? "Saving..." : "Uploading..."}
              </Text>
            </View>
          ) : (
            <Text style={styles.uploadBtnText}>
              {isEditMode ? "Save Changes" : "Upload Video"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <TeacherBottomNavigation navigation={navigation} active="Videos" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 16 : 12,
    paddingBottom: 12,
    backgroundColor: COLORS.bg,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerText: { flex: 1, marginHorizontal: 12 },
  heading: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  subHeading: { marginTop: 2, color: COLORS.muted, fontWeight: "600", fontSize: 12 },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginTop: 6,
  },
  cloudCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E8FFFA",
    justifyContent: "center",
    alignItems: "center",
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E8FFFA",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    maxWidth: "90%",
  },
  uploadSub: {
    marginTop: 6,
    color: COLORS.muted,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 13,
    maxWidth: "90%",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    gap: 8,
  },
  errorText: { color: "#EF4444", fontWeight: "700", fontSize: 13, flex: 1 },
  card: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text, marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    marginBottom: 6,
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: 52,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 14,
    backgroundColor: "#FAFBFD",
  },
  textArea: {
    height: 110,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingTop: 14,
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 14,
    backgroundColor: "#FAFBFD",
  },
  visibilityBtn: {
    flex: 1,
    height: 52,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFBFD",
  },
  visibilityBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  visibilityText: { fontWeight: "800", color: COLORS.muted, fontSize: 12 },
  visibilityHint: {
    marginTop: 10,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  uploadBtn: {
    marginTop: 22,
    marginBottom: 10,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  uploadBtnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
});
