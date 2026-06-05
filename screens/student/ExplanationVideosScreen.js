// screens/student/ExplanationVideosScreen.js
import React, { useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StudentBottomNavigation from "../../components/StudentBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const slugify = (value = "") =>
  String(value || "item")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "item";

export default function ExplanationVideosScreen({ navigation }) {
  const { uploadedVideos, videoCategories, currentUser } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchText, setSearchText] = useState("");

  const categories = useMemo(
    () => [
      { id: "all", title: "All", emoji: "🎥" },
      ...(Array.isArray(videoCategories) ? videoCategories : []).map((category) => ({
        id: category.id || slugify(category.title),
        title: category.title,
        emoji: category.emoji || "🎥",
      })),
    ],
    [videoCategories]
  );

  const visibleVideos = useMemo(() => {
    const role = String(currentUser?.role || "").toLowerCase();
    const studentId = currentUser?.studentId || currentUser?.id || "";

    return (Array.isArray(uploadedVideos) ? uploadedVideos : []).filter((video) => {
      if (role === "teacher") {
        return true;
      }

      const visibility = String(video.visibility || "Public");

      if (visibility === "Public") {
        return true;
      }

      if (visibility === "Private") {
        return String(video.recipientStudentId || "") === String(studentId);
      }

      return false;
    });
  }, [currentUser, uploadedVideos]);

  const filteredVideos = useMemo(() => {
    return visibleVideos.filter((video) => {
      const categoryId = String(selectedCategory || "").toLowerCase();
      const matchCategory =
        categoryId === "all" ||
        String(video.categoryId || "").toLowerCase() === categoryId ||
        slugify(video.categoryTitle || "") === categoryId;

      const searchValue = searchText.trim().toLowerCase();
      const matchSearch =
        !searchValue ||
        (video.title || "").toLowerCase().includes(searchValue) ||
        (video.subject || "").toLowerCase().includes(searchValue) ||
        (video.topic || "").toLowerCase().includes(searchValue);

      return matchCategory && matchSearch;
    });
  }, [searchText, selectedCategory, visibleVideos]);

  const handleVideoPress = (clickedVideo) => {
    const relatedVideos = visibleVideos.filter((item) => item.id !== clickedVideo.id);
    navigation.navigate("VideoPlayerScreen", { video: clickedVideo, relatedVideos });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#07123A" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Explanation Videos</Text>
          <Text style={styles.subHeading}>Learn visually with expert teachers</Text>
        </View>

        <TouchableOpacity style={styles.notifyBtn}>
          <Ionicons name="notifications-outline" size={24} color="#07123A" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#7A879D" />
        <TextInput
          placeholder="Search videos by title, subject, topic..."
          placeholderTextColor="#7A879D"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color="#7A879D" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>📚 Categories</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 10, paddingLeft: 16 }}
      >
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.categoryCard,
              selectedCategory === item.id && styles.categoryCardActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={styles.categoryEmoji}>{item.emoji}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item.id && { color: "#FFFFFF" },
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>🎥 Videos</Text>
        <Text style={styles.videoCount}>
          {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
      >
        {filteredVideos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-outline" size={64} color="#7A879D" />
            <Text style={styles.emptyTitle}>No videos found</Text>
            <Text style={styles.emptySubtitle}>
              {searchText
                ? `No results for "${searchText}"`
                : selectedCategory !== "all"
                ? "No videos in this category yet"
                : "No videos uploaded yet. Check back soon!"}
            </Text>
          </View>
        ) : (
          filteredVideos.map((video) => (
            <TouchableOpacity
              key={video.id}
              activeOpacity={0.9}
              style={styles.videoCard}
              onPress={() => handleVideoPress(video)}
            >
              <View style={styles.thumbnailBox}>
                {video.thumbnail ? (
                  <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
                ) : (
                  <View
                    style={[
                      styles.thumbnail,
                      {
                        backgroundColor: video.color || "#E5E7EB",
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Ionicons name="videocam-outline" size={32} color="#FFFFFF" />
                  </View>
                )}
                <View style={styles.playCircle}>
                  <Ionicons name="play" size={26} color="#FFFFFF" />
                </View>
                <View style={styles.duration}>
                  <Text style={styles.durationText}>{video.duration || "00:00"}</Text>
                </View>
              </View>

              <View style={styles.info}>
                <Text numberOfLines={2} style={styles.videoTitle}>
                  {video.title}
                </Text>
                {video.subject ? (
                  <Text style={styles.subject} numberOfLines={1}>
                    {video.subject}
                    {video.topic ? ` • ${video.topic}` : ""}
                  </Text>
                ) : null}
                {video.className ? <Text style={styles.className}>{video.className}</Text> : null}
                <View style={styles.statsRow}>
                  <Text style={styles.views}>👁 {video.views || 0}</Text>
                  <Text style={styles.rating}>⭐ {video.rating || 0}</Text>
                </View>
                <Text style={styles.uploadTime}>{video.uploadedAgo || "Recently"}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <StudentBottomNavigation navigation={navigation} active="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  header: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  heading: { fontSize: 26, fontWeight: "900", color: "#07123A" },
  subHeading: { marginTop: 4, color: "#7A879D", fontWeight: "600", fontSize: 13 },
  notifyBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBox: {
    height: 58,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
    marginHorizontal: 16,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: "#07123A" },
  sectionRow: {
    marginTop: 24,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: "#07123A" },
  videoCount: { color: "#006D6A", fontWeight: "800", fontSize: 13 },
  categoryCard: {
    width: 96,
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryCardActive: { backgroundColor: "#006D6A" },
  categoryEmoji: { fontSize: 30 },
  categoryText: {
    marginTop: 10,
    fontWeight: "800",
    color: "#07123A",
    fontSize: 12,
    textAlign: "center",
  },
  videoCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  thumbnailBox: {
    width: 130,
    height: 96,
    borderRadius: 18,
    overflow: "hidden",
    flexShrink: 0,
  },
  thumbnail: { width: "100%", height: "100%" },
  playCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -22,
    marginLeft: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  duration: {
    position: "absolute",
    bottom: 7,
    right: 7,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  durationText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  info: { flex: 1, marginLeft: 14 },
  videoTitle: { fontSize: 15, fontWeight: "900", color: "#07123A", lineHeight: 22 },
  subject: { marginTop: 5, color: "#006D6A", fontWeight: "700", fontSize: 12 },
  className: { marginTop: 3, color: "#7A879D", fontWeight: "600", fontSize: 11 },
  statsRow: { flexDirection: "row", marginTop: 8, gap: 10 },
  views: { color: "#7A879D", fontWeight: "600", fontSize: 12 },
  rating: { color: "#F59E0B", fontWeight: "900", fontSize: 12 },
  uploadTime: { marginTop: 5, color: "#7A879D", fontWeight: "600", fontSize: 11 },
  emptyState: { alignItems: "center", paddingTop: 60, paddingBottom: 20 },
  emptyTitle: { marginTop: 16, color: "#07123A", fontSize: 18, fontWeight: "800" },
  emptySubtitle: {
    marginTop: 6,
    color: "#7A879D",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
