


// // screens/teacher/UploadVideoPlayerScreen.js
// import React, { useRef, useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   Dimensions,
//   Platform,
// } from "react-native";
// import { Video } from "expo-av";
// import { Ionicons } from "@expo/vector-icons";
// import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
// import { useAppContext } from "../../context/AppContext";

// const { width } = Dimensions.get("window");
// const COLORS = { primary: "#008F7A", bg: "#FFFFFF", text: "#07123A", muted: "#7A879D", border: "#E8ECF4" };

// export default function UploadVideoPlayerScreen({ navigation, route }) {
//   const { uploadedVideos, deleteUploadedVideo } = useAppContext();
//   const video = route?.params?.video || {};

//   const videoRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [liked, setLiked] = useState(video.liked || false);
//   const [saved, setSaved] = useState(video.saved || false);
//   const [likes, setLikes] = useState(video.likes || 0);
//   const [videoUri, setVideoUri] = useState(video.videoUrl || video.fileUri);

//   useEffect(() => {
//     if (!videoUri && video.fileUri) setVideoUri(video.fileUri);
//   }, [video]);

//   const togglePlay = async () => {
//     if (!videoRef.current) return;
//     isPlaying ? await videoRef.current.pauseAsync() : await videoRef.current.playAsync();
//     setIsPlaying(!isPlaying);
//   };

//   const toggleMute = async () => {
//     if (!videoRef.current) return;
//     await videoRef.current.setIsMutedAsync(!muted);
//     setMuted(!muted);
//   };

//   const handleLike = () => {
//     setLiked(!liked);
//     setLikes(prev => (liked ? prev - 1 : prev + 1));
//   };

//   const handleDelete = () => {
//     deleteUploadedVideo(video.id);
//     navigation.goBack();
//   };

//   const goToComments = () => navigation.navigate("VideoCommentsScreen", { video });
//   const goToAnalytics = () => navigation.navigate("TeacherAnalyticsScreen", { video });
//   const goToEdit = () => navigation.navigate("UploadVideoScreen", { editVideo: video });

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#000" />

//       <View style={styles.videoContainer}>
//         {videoUri ? (
//           <Video
//             ref={videoRef}
//             style={styles.video}
//             source={{ uri: videoUri }}
//             resizeMode="cover"
//             shouldPlay={false}
//             isLooping={false}
//             useNativeControls={true}
//           />
//         ) : (
//           <View style={[styles.video, { justifyContent: "center", alignItems: "center" }]}>
//             <Text style={{ color: COLORS.text }}>No video selected</Text>
//           </View>
//         )}

//         <View style={styles.topBar}>
//           <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
//             <Ionicons name="arrow-back" size={22} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.videoTopTitle}>{video.title || "Video Player"}</Text>
//           <View style={styles.topRight}>
//             <TouchableOpacity style={styles.topBtn} onPress={goToEdit}>
//               <Ionicons name="create-outline" size={20} color="#fff" />
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.topBtn, { marginLeft: 8 }]} onPress={handleDelete}>
//               <Ionicons name="trash-outline" size={20} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
//           <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.titleSection}>
//           <Text style={styles.title}>{video.title || "Video Title"}</Text>
//           <Text style={styles.subtitle}>
//             {video.subject || "Class 6"} • {video.topic || "Maths"}
//           </Text>
//           <Text style={styles.views}>{video.views || 0} views • {video.uploadedAgo || "Just now"}</Text>
//         </View>

//         <View style={styles.actionRow}>
//           <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
//             <Ionicons name={liked ? "thumbs-up" : "thumbs-up-outline"} size={22} color={liked ? COLORS.primary : COLORS.text} />
//             <Text style={styles.actionText}>{likes}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionBtn} onPress={goToComments}>
//             <Ionicons name="chatbubble-outline" size={22} color={COLORS.text} />
//             <Text style={styles.actionText}>Comments</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionBtn} onPress={() => setSaved(!saved)}>
//             <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={22} color={saved ? COLORS.primary : COLORS.text} />
//             <Text style={styles.actionText}>Save</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionBtn} onPress={goToAnalytics}>
//             <Ionicons name="analytics-outline" size={22} color={COLORS.text} />
//             <Text style={styles.actionText}>Analytics</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       <TeacherBottomNavigation navigation={navigation} active="Videos" />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.bg },
//   videoContainer: { width: "100%", height: width * 0.56, backgroundColor: "#000" },
//   video: { width: "100%", height: "100%", position: "absolute" },
//   topBar: { position: "absolute", top: Platform.OS === "android" ? 12 : 10, left: 14, right: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   topBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
//   videoTopTitle: { flex: 1, color: "#FFFFFF", fontWeight: "800", fontSize: 13, marginHorizontal: 10, textAlign: "center" },
//   topRight: { flexDirection: "row" },
//   playBtn: { position: "absolute", alignSelf: "center", top: "50%", marginTop: -36, width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", left: "50%", marginLeft: -36 },
//   scrollContent: { paddingBottom: 120 },
//   titleSection: { padding: 16, paddingBottom: 0 },
//   title: { fontSize: 20, fontWeight: "900", color: COLORS.text },
//   subtitle: { marginTop: 5, color: COLORS.primary, fontWeight: "700", fontSize: 14 },
//   views: { marginTop: 5, color: COLORS.muted, fontWeight: "600", fontSize: 13 },
//   actionRow: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 18, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginHorizontal: 16, marginTop: 10, backgroundColor: COLORS.bg, borderRadius: 16 },
//   actionBtn: { alignItems: "center", paddingHorizontal: 8 },
//   actionText: { marginTop: 5, color: COLORS.text, fontWeight: "700", fontSize: 11 },
// });





































// screens/teacher/UploadVideoPlayerScreen.js
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const { width } = Dimensions.get("window");
const COLORS = {
  primary: "#008F7A",
  bg: "#FFFFFF",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E8ECF4",
};

export default function UploadVideoPlayerScreen({ navigation, route }) {
  const { uploadedVideos, deleteUploadedVideo, currentUser } = useAppContext();

  // ─── Always get the freshest version of this video from context ──────────
  const routeVideo = route?.params?.video || {};
  const ownedVideo = uploadedVideos.find(
    (v) =>
      v.id === routeVideo.id &&
      String(v?.teacherId || "").toLowerCase() ===
        String(currentUser?.teacherId || currentUser?.id || "").toLowerCase()
  );
  const routeBelongsToTeacher =
    String(routeVideo?.teacherId || "").toLowerCase() ===
    String(currentUser?.teacherId || currentUser?.id || "").toLowerCase();
  const video = ownedVideo || (routeBelongsToTeacher ? routeVideo : {});

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(video.liked || false);
  const [saved, setSaved] = useState(video.saved || false);
  const [likes, setLikes] = useState(Number(video.likes) || 0);
  const [videoUri, setVideoUri] = useState(video.videoUrl || video.fileUri || null);

  useEffect(() => {
    if (!videoUri && video.fileUri) setVideoUri(video.fileUri);
  }, [video]);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    isPlaying ? await videoRef.current.pauseAsync() : await videoRef.current.playAsync();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;
    await videoRef.current.setIsMutedAsync(!muted);
    setMuted(!muted);
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => (liked ? prev - 1 : prev + 1));
  };

  const handleDelete = async () => {
    try {
      await deleteUploadedVideo(video.id);
      navigation.goBack();
    } catch (error) {
      console.warn("Failed to delete uploaded video", error);
    }
  };

  // ─── FIX: Navigate to TeacherCommentsScreen (teacher comments screen) ────
  const goToComments = () => {
    navigation.navigate("TeacherCommentsScreen", { video });
  };

  const goToAnalytics = () => {
    navigation.navigate("TeacherAnalyticsScreen", { video });
  };

  // ─── FIX: Navigate to EditVideoScreen for editing ────────────────────────
  const goToEdit = () => {
    navigation.navigate("EditVideoScreen", { video });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── Video player ───────────────────────────────────────────────── */}
      <View style={styles.videoContainer}>
        {videoUri ? (
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: videoUri }}
            resizeMode="cover"
            shouldPlay={false}
            isLooping={false}
            useNativeControls={true}
          />
        ) : (
          <View style={[styles.video, { justifyContent: "center", alignItems: "center" }]}>
            <Ionicons name="videocam-off-outline" size={48} color={COLORS.muted} />
            <Text style={{ color: COLORS.muted, marginTop: 8, fontWeight: "600" }}>
              No video available
            </Text>
          </View>
        )}

        {/* Top overlay bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.videoTopTitle} numberOfLines={1}>
            {video.title || "Video Player"}
          </Text>

          <View style={styles.topRight}>
            <TouchableOpacity style={styles.topBtn} onPress={goToEdit}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.topBtn, { marginLeft: 8 }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Centre play/pause overlay (only when native controls hidden) */}
        <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable content ─────────────────────────────────────────── */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{video.title || "Video Title"}</Text>
          <Text style={styles.subtitle}>
            {video.subject || "Subject"} • {video.topic || "Topic"}
          </Text>
          <Text style={styles.views}>
            {video.views || 0} views • {video.uploadedAgo || "Just now"}
          </Text>

          {/* Visibility badge */}
          {video.visibility ? (
            <View style={styles.visibilityBadge}>
              <Ionicons
                name={
                  video.visibility === "Public"
                    ? "earth-outline"
                    : video.visibility === "Unlisted"
                    ? "link-outline"
                    : "lock-closed-outline"
                }
                size={13}
                color={COLORS.primary}
              />
              <Text style={styles.visibilityText}>{video.visibility}</Text>
            </View>
          ) : null}
        </View>

        {/* Action row */}
        <View style={styles.actionRow}>
          {/* Like */}
          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Ionicons
              name={liked ? "thumbs-up" : "thumbs-up-outline"}
              size={22}
              color={liked ? COLORS.primary : COLORS.text}
            />
            <Text style={styles.actionText}>{likes}</Text>
          </TouchableOpacity>

          {/* ─── FIX: Comments now navigates to TeacherCommentsScreen ──── */}
          <TouchableOpacity style={styles.actionBtn} onPress={goToComments}>
            <Ionicons name="chatbubble-outline" size={22} color={COLORS.text} />
            <Text style={styles.actionText}>Comments</Text>
          </TouchableOpacity>

          {/* Save */}
          <TouchableOpacity style={styles.actionBtn} onPress={() => setSaved(!saved)}>
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={22}
              color={saved ? COLORS.primary : COLORS.text}
            />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>

          {/* Analytics */}
          <TouchableOpacity style={styles.actionBtn} onPress={goToAnalytics}>
            <Ionicons name="analytics-outline" size={22} color={COLORS.text} />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Description (if any) */}
        {!!video.description && (
          <View style={styles.descSection}>
            <Text style={styles.descHeading}>Description</Text>
            <Text style={styles.descText}>{video.description}</Text>
          </View>
        )}
      </ScrollView>

      <TeacherBottomNavigation navigation={navigation} active="Videos" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  videoContainer: { width: "100%", height: width * 0.56, backgroundColor: "#000" },
  video: { width: "100%", height: "100%", position: "absolute" },
  topBar: {
    position: "absolute",
    top: Platform.OS === "android" ? 12 : 10,
    left: 14, right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
  },
  videoTopTitle: {
    flex: 1, color: "#FFFFFF",
    fontWeight: "800", fontSize: 13,
    marginHorizontal: 10, textAlign: "center",
  },
  topRight: { flexDirection: "row" },
  playBtn: {
    position: "absolute",
    alignSelf: "center",
    top: "50%", marginTop: -36,
    left: "50%", marginLeft: -36,
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
  },
  scrollContent: { paddingBottom: 120 },
  titleSection: { padding: 16, paddingBottom: 0 },
  title: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  subtitle: { marginTop: 5, color: COLORS.primary, fontWeight: "700", fontSize: 14 },
  views: { marginTop: 5, color: COLORS.muted, fontWeight: "600", fontSize: 13 },
  visibilityBadge: {
    flexDirection: "row", alignItems: "center",
    marginTop: 8, alignSelf: "flex-start",
    backgroundColor: "#E6F7F5",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  visibilityText: {
    marginLeft: 4, color: COLORS.primary,
    fontWeight: "700", fontSize: 12,
  },
  actionRow: {
    flexDirection: "row", justifyContent: "space-around",
    paddingVertical: 18, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    marginHorizontal: 16, marginTop: 14,
    backgroundColor: COLORS.bg, borderRadius: 16,
  },
  actionBtn: { alignItems: "center", paddingHorizontal: 8 },
  actionText: { marginTop: 5, color: COLORS.text, fontWeight: "700", fontSize: 11 },
  descSection: { padding: 16, paddingTop: 20 },
  descHeading: { fontSize: 16, fontWeight: "900", color: COLORS.text, marginBottom: 8 },
  descText: { color: COLORS.muted, fontSize: 14, lineHeight: 22 },
});
