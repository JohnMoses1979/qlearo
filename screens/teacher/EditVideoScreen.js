// screens/teacher/EditVideoScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

const COLORS = {
  primary: "#009688",
  white: "#FFFFFF",
  bg: "#F5F7FB",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E8ECF4",
};

export default function EditVideoScreen({ navigation, route }) {
  const { video } = route.params; // video object from UploadedVideosScreen
  const [videoFile, setVideoFile] = useState(video?.file || null);
  const [thumbnail, setThumbnail] = useState(video?.thumbnail || null);
  const [title, setTitle] = useState(video?.title || "");
  const [subject, setSubject] = useState(video?.subject || "");
  const [className, setClassName] = useState(video?.className || "");
  const [topic, setTopic] = useState(video?.topic || "");
  const [description, setDescription] = useState(video?.description || "");
  const [visibility, setVisibility] = useState(video?.visibility || "Public");
  const [allowComments, setAllowComments] = useState(video?.allowComments ?? true);
  const [showLikes, setShowLikes] = useState(video?.showLikes ?? true);
  const [madeForKids, setMadeForKids] = useState(video?.madeForKids ?? false);
  const [saving, setSaving] = useState(false);

  // pick thumbnail from gallery
  const pickThumbnail = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      global.showAlert("Permission Required", "Gallery permission is required");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      aspect: [16, 9],
    });
    if (!result.canceled) {
      setThumbnail(result.assets[0].uri);
    }
  };

  // replace video file
  const replaceVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "video/*", copyToCacheDirectory: true });
    if (!result.canceled) {
      setVideoFile(result.assets[0]);
    }
  };

  // validate fields
  const validate = () => {
    if (!videoFile) return global.showAlert("Validation", "Please select a video"), false;
    if (!title.trim()) return global.showAlert("Validation", "Title is required"), false;
    if (!subject.trim()) return global.showAlert("Validation", "Subject is required"), false;
    if (!className.trim()) return global.showAlert("Validation", "Class is required"), false;
    if (!topic.trim()) return global.showAlert("Validation", "Topic is required"), false;
    return true;
  };

  // save changes simulation
  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      global.showAlert("Success", "Video updated successfully", [
        { text: "OK", onPress: () => navigation.navigate("UploadedVideosScreen") },
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.heading}>Edit Video</Text>
        </View>

        {/* Video file section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎬 Video File</Text>
          {videoFile ? (
            <>
              <Text style={styles.videoFileName}>{videoFile.name || "Selected Video"}</Text>
              <TouchableOpacity style={styles.changeBtn} onPress={replaceVideo}>
                <Text style={styles.changeText}>Replace Video</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.uploadBox} onPress={replaceVideo}>
              <Ionicons name="cloud-upload-outline" size={48} color={COLORS.primary} />
              <Text style={styles.uploadText}>Select Video</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Thumbnail section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🖼 Thumbnail</Text>
          {thumbnail ? (
            <>
              <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
              <TouchableOpacity style={styles.changeBtn} onPress={pickThumbnail}>
                <Text style={styles.changeText}>Change Thumbnail</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.thumbnailPicker} onPress={pickThumbnail}>
              <Ionicons name="image-outline" size={42} color={COLORS.primary} />
              <Text style={styles.thumbnailPickText}>Add Custom Thumbnail</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Video details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📄 Video Details</Text>
          {["Title", "Subject", "Class", "Topic"].map((label, idx) => (
            <View style={styles.inputBox} key={label}>
              <Text style={styles.label}>{label} *</Text>
              <TextInput
                style={styles.input}
                placeholder={`Enter ${label.toLowerCase()}`}
                value={[title, subject, className, topic][idx]}
                onChangeText={[setTitle, setSubject, setClassName, setTopic][idx]}
              />
            </View>
          ))}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              multiline
              textAlignVertical="top"
              placeholder="Enter description"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Visibility */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌍 Visibility</Text>
          <View style={styles.visibilityRow}>
            {["Public", "Unlisted", "Private"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.visibilityBtn, visibility === item && { backgroundColor: COLORS.primary }]}
                onPress={() => setVisibility(item)}
              >
                <Text style={[styles.visibilityText, visibility === item && { color: COLORS.white }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Advanced settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Advanced Settings</Text>
          {[
            { label: "Allow Comments", value: allowComments, setter: setAllowComments },
            { label: "Show Likes", value: showLikes, setter: setShowLikes },
            { label: "Made for Kids", value: madeForKids, setter: setMadeForKids },
          ].map((setting) => (
            <TouchableOpacity
              key={setting.label}
              style={styles.toggleRow}
              onPress={() => setting.setter(!setting.value)}
            >
              <Text style={styles.toggleLabel}>{setting.label}</Text>
              <View style={[styles.toggleSwitch, setting.value && { backgroundColor: COLORS.primary }]}>
                <View style={[styles.toggleThumb, setting.value && { alignSelf: "flex-end" }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.uploadBtn} onPress={handleSave}>
          <Text style={styles.uploadBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
      </ScrollView>

      <TeacherBottomNavigation navigation={navigation} active="Videos" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 22 },
  iconBtn: { width: 46, height: 46, borderRadius: 16, backgroundColor: COLORS.white, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 28, fontWeight: "900", color: COLORS.text, marginLeft: 16 },
  card: { marginTop: 22, backgroundColor: COLORS.white, borderRadius: 24, padding: 18 },
  cardTitle: { fontSize: 20, fontWeight: "900", color: COLORS.text, marginBottom: 20 },
  inputBox: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "800", color: COLORS.text, marginBottom: 10 },
  input: { height: 56, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, color: COLORS.text, fontWeight: "700", backgroundColor: COLORS.white },
  textArea: { height: 120, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, paddingTop: 16, color: COLORS.text, fontWeight: "700", backgroundColor: COLORS.white },
  uploadBox: { borderWidth: 2, borderStyle: "dashed", borderColor: COLORS.primary, borderRadius: 28, padding: 30, alignItems: "center", backgroundColor: COLORS.white },
  uploadText: { marginTop: 10, fontWeight: "900", color: COLORS.primary, fontSize: 16 },
  changeBtn: { marginTop: 18, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: "center" },
  changeText: { color: COLORS.white, fontWeight: "800" },
  thumbnail: { width: "100%", height: 200, borderRadius: 20 },
  thumbnailPicker: { height: 180, borderRadius: 24, borderWidth: 2, borderStyle: "dashed", borderColor: COLORS.primary, justifyContent: "center", alignItems: "center" },
  thumbnailPickText: { marginTop: 14, fontWeight: "800", color: COLORS.primary, fontSize: 16 },
  visibilityRow: { flexDirection: "row", justifyContent: "space-between" },
  visibilityBtn: { flex: 1, height: 54, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, justifyContent: "center", alignItems: "center", marginHorizontal: 4, backgroundColor: COLORS.white },
  visibilityText: { fontWeight: "800", color: COLORS.text, fontSize: 13 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  toggleLabel: { fontWeight: "800", color: COLORS.text, fontSize: 15 },
  toggleSwitch: { width: 50, height: 26, borderRadius: 14, backgroundColor: "#E8ECF4", justifyContent: "center", padding: 2 },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#FFFFFF" },
  uploadBtn: { marginTop: 26, marginBottom: 30, height: 62, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center" },
  uploadBtnText: { color: COLORS.white, fontSize: 18, fontWeight: "900" },
  videoFileName: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
});