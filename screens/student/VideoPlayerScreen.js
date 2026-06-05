




// screens/student/VideoPlayerScreen.js
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
  BackHandler,
  InteractionManager,
  Platform,
  Share,
  Alert,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import * as ScreenOrientation from "expo-screen-orientation";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import StudentBottomNavigation from "../../components/StudentBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const VIDEO_HEIGHT = (SCREEN_W * 9) / 16;

export default function VideoPlayerScreen({ route, navigation }) {
  const {
    uploadedVideos,
    requireStudyAccess,
    consumeStudyAccess,
  } = useAppContext();
  const controlsTimer = useRef(null);
  const sliderDragging = useRef(false);
  const lastGatedVideoId = useRef(null);

  const { video: routeVideo } = route.params || {};
  const video = uploadedVideos.find(v => v.id === routeVideo?.id) || routeVideo;
  const relatedVideos = uploadedVideos.filter(v => v.id !== video?.id);

  useEffect(() => {
    if (!video?.id || lastGatedVideoId.current === video.id) return;

    lastGatedVideoId.current = video.id;

    try {
      const access = requireStudyAccess?.("Video");

      if (!access?.allowed) {
        global.showAlert(
          "Premium Required",
          "You have used your 3 free study actions. Please choose a subscription plan to continue."
        );
        navigation?.navigate?.("SubscriptionPlans");
        return;
      }

      if (!access?.premium) {
        consumeStudyAccess?.("Video");
      }
    } catch (error) {
      global.showAlert(
        "Premium Required",
        error?.message || "Please choose a subscription plan to continue."
      );
      navigation?.navigate?.("SubscriptionPlans");
    }
  }, [consumeStudyAccess, navigation, requireStudyAccess, video?.id]);

  const player = useVideoPlayer(
    video?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
    (p) => {
      p.loop = false;
      p.muted = false;
    }
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [liked, setLiked] = useState(false);
  const [miniPlayer, setMiniPlayer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      StatusBar.setHidden(false);
      try {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } catch (_) {}
    };
  }, []);

  // ─── Hardware back button ─────────────────────────────────────────────────
  useEffect(() => {
    const backAction = () => {
      if (isFullscreen) { exitFullscreen(); return true; }
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [isFullscreen]);

  // ─── Player event listeners + polling ────────────────────────────────────
  useEffect(() => {
    const playingSub = player.addListener("playingChange", e => setIsPlaying(e.isPlaying));
    const statusSub = player.addListener("statusChange", e => {
      if (player.duration) setDuration(player.duration);
      if (e.status === "idle") {
        setIsPlaying(false);
        player.currentTime = 0;
        setPosition(0);
      }
    });
    const interval = setInterval(() => {
      if (player && !sliderDragging.current) {
        setPosition(player.currentTime || 0);
        if (player.duration) setDuration(player.duration);
      }
    }, 400);
    return () => {
      playingSub?.remove();
      statusSub?.remove();
      clearInterval(interval);
    };
  }, [player]);

  // ─── Controls auto-hide ───────────────────────────────────────────────────
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3500);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, []);

  // ─── Playback controls ────────────────────────────────────────────────────
  const togglePlay = () => {
    isPlaying ? player.pause() : player.play();
    resetControlsTimer();
  };

  const toggleMute = () => {
    player.muted = !isMuted;
    setIsMuted(!isMuted);
    resetControlsTimer();
  };

  const handleSeekComplete = value => {
    sliderDragging.current = false;
    player.currentTime = value;
    setPosition(value);
    resetControlsTimer();
  };

  const skip = seconds => {
    const newPos = Math.max(0, Math.min(position + seconds, duration));
    player.currentTime = newPos;
    setPosition(newPos);
    resetControlsTimer();
  };

  const enterFullscreen = async () => {
    setMiniPlayer(false);
    setShowControls(true);
    setIsFullscreen(true);
    try { await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE); } catch (_) {}
    StatusBar.setHidden(true);
  };

  const exitFullscreen = async () => {
    setShowControls(true);
    setIsFullscreen(false);
    InteractionManager.runAfterInteractions(async () => {
      try { await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP); } catch (_) {}
      StatusBar.setHidden(false);
    });
  };

  const formatTime = secs => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleShare = async () => {
    try { await Share.share({ message: `Watch "${video?.title}"` }); } catch (_) {}
  };

  const goToComments = () => navigation.navigate("VideoCommentsScreen", { video });

  const openRelatedVideo = item => {
    navigation.replace("VideoPlayerScreen", {
      video: item,
      relatedVideos: relatedVideos.filter(v => v.id !== item.id),
    });
  };

  const handleScroll = e => {
    if (isFullscreen) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    setMiniPlayer(offsetY > 260);
  };

  // ─── Dynamic video box size ───────────────────────────────────────────────
  const videoBoxStyle = isFullscreen
    ? { width: SCREEN_H, height: SCREEN_W, backgroundColor: "#000" }
    : styles.videoBox;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={isFullscreen} barStyle="light-content" backgroundColor="#000" />

      {/* ── Mini player ───────────────────────────────────────────────── */}
      {miniPlayer && !isFullscreen && (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.miniPlayer}
          onPress={() => setMiniPlayer(false)}
        >
          <View style={styles.miniVideoWrap}>
            <VideoView
              player={player}
              style={styles.miniVideo}
              contentFit="contain"
              nativeControls={false}
            />
          </View>
          <View style={{ flex: 1, paddingHorizontal: 8 }}>
            <Text numberOfLines={1} style={styles.miniTitle}>{video?.title}</Text>
            <Text style={styles.miniSub}>{isPlaying ? "▶ Playing" : "⏸ Paused"}</Text>
          </View>
          <TouchableOpacity onPress={togglePlay}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="#07123A" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isFullscreen ? 0 : 120 }}
      >
        {/* ── Video player box ─────────────────────────────────────────── */}
        {/*
          KEY FIX for web:
          - The outer View is the strict bounding box (overflow: hidden clips VideoView)
          - VideoView is sized to 100% width + exact height (NOT absoluteFill on web)
          - A transparent TouchableOpacity sits on top via absolute positioning for tap-to-toggle
          - Controls are positioned absolute inside the same outer View
        */}
        <View style={videoBoxStyle}>

          {/* VideoView — explicit width/height so web doesn't overflow */}
          <VideoView
            player={player}
            style={styles.videoViewStyle}
            contentFit="contain"
            nativeControls={false}
            allowsPictureInPicture={Platform.OS !== "web"}
          />

          {/* Transparent tap layer on top of video */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => { setShowControls(prev => !prev); resetControlsTimer(); }}
          />

          {/* Overlay controls */}
          {showControls && (
            <>
              {/* Top bar */}
              <View style={styles.topBar}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => isFullscreen ? exitFullscreen() : navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={22} color="#FFF" />
                </TouchableOpacity>
                <Text numberOfLines={1} style={styles.overlayTitle}>{video?.title}</Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity style={styles.iconBtn} onPress={toggleMute}>
                    <Ionicons
                      name={isMuted ? "volume-mute" : "volume-high"}
                      size={20} color="#FFF"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iconBtn, { marginLeft: 10 }]}
                    onPress={isFullscreen ? exitFullscreen : enterFullscreen}
                  >
                    <Ionicons
                      name={isFullscreen ? "contract" : "expand"}
                      size={20} color="#FFF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Center controls */}
              <View style={styles.centerControls} pointerEvents="box-none">
                <TouchableOpacity style={styles.skipBtn} onPress={() => skip(-10)}>
                  <Ionicons name="play-back" size={28} color="#FFF" />
                  <Text style={styles.skipLabel}>10</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={42} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipBtn} onPress={() => skip(10)}>
                  <Ionicons name="play-forward" size={28} color="#FFF" />
                  <Text style={styles.skipLabel}>10</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom seek bar */}
              <View style={styles.bottomControls}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Slider
                  style={{ flex: 1, marginHorizontal: 8 }}
                  minimumValue={0}
                  maximumValue={duration || 1}
                  value={position}
                  minimumTrackTintColor="#FF0000"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#FF0000"
                  onSlidingStart={() => (sliderDragging.current = true)}
                  onValueChange={v => setPosition(v)}
                  onSlidingComplete={handleSeekComplete}
                />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </>
          )}
        </View>

        {/* ── Below-video content ───────────────────────────────────────── */}
        {!isFullscreen && (
          <View style={styles.content}>
            <Text style={styles.title}>{video?.title}</Text>
            <Text style={styles.views}>👁 {video?.views}</Text>

            {/* Action row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 18 }}
            >
              <TouchableOpacity
                style={[styles.actionBtn, liked && styles.actionBtnActive]}
                onPress={() => setLiked(!liked)}
              >
                <Ionicons
                  name={liked ? "thumbs-up" : "thumbs-up-outline"}
                  size={20}
                  color={liked ? "#FFF" : "#07123A"}
                />
                <Text style={[styles.actionText, liked && { color: "#FFF" }]}>Like</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={goToComments}>
                <Ionicons name="chatbubble-outline" size={20} color="#07123A" />
                <Text style={styles.actionText}>Comments</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={20} color="#07123A" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Related videos */}
            <Text style={styles.relatedHeading}>🎥 Related Videos</Text>

            {relatedVideos.length === 0 ? (
              <Text style={styles.noRelated}>No related videos yet.</Text>
            ) : (
              relatedVideos.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.relatedCard}
                  onPress={() => openRelatedVideo(item)}
                >
                  <View style={styles.relatedThumbWrap}>
                    {item.thumbnail ? (
                      <Image
                        source={{ uri: item.thumbnail }}
                        style={styles.relatedThumb}
                      />
                    ) : (
                      <View style={[styles.relatedThumb, styles.relatedThumbPlaceholder]}>
                        <Ionicons name="play-circle-outline" size={32} color="#94A3B8" />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text numberOfLines={2} style={styles.relatedTitle}>{item.title}</Text>
                    <Text style={styles.relatedSub}>{item.subject}</Text>
                    <Text style={styles.relatedSub}>{item.views} views</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {!isFullscreen && <StudentBottomNavigation navigation={navigation} active="Home" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  // ── KEY FIX: videoBox clips children on ALL platforms ──────────────────────
  videoBox: {
    width: "100%",
    height: VIDEO_HEIGHT,
    backgroundColor: "#000",
    overflow: "hidden",   // ← prevents VideoView bleeding outside on web
    position: "relative", // ← gives absolute children a reference frame
  },

  // VideoView fills the box exactly — no absoluteFill on web (causes overflow)
  videoViewStyle: {
    width: "100%",
    height: "100%",
  },

  // Overlay controls
  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 45 : 16,
    left: 0, right: 0,
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, zIndex: 10,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
  },
  overlayTitle: {
    flex: 1, color: "#FFF", fontWeight: "800",
    marginHorizontal: 12, fontSize: 13,
  },
  centerControls: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: 28, zIndex: 10,
  },
  skipBtn: { alignItems: "center" },
  skipLabel: { color: "#FFF", fontSize: 10, fontWeight: "800" },
  playBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center", alignItems: "center",
  },
  bottomControls: {
    position: "absolute", bottom: 10, left: 10, right: 10,
    flexDirection: "row", alignItems: "center", zIndex: 10,
  },
  timeText: { color: "#FFF", fontWeight: "700", fontSize: 11 },

  // Below-video
  content: { padding: 18, paddingBottom: 140 },
  title: { fontSize: 22, fontWeight: "900", color: "#07123A", lineHeight: 32 },
  views: { marginTop: 8, color: "#64748B", fontWeight: "600" },
  actionBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F8FAFC", borderRadius: 28,
    paddingHorizontal: 18, paddingVertical: 12, marginRight: 12,
  },
  actionBtnActive: { backgroundColor: "#006D6A" },
  actionText: { marginLeft: 8, fontWeight: "800", color: "#07123A" },
  relatedHeading: { marginTop: 28, fontSize: 20, fontWeight: "900", color: "#07123A" },
  noRelated: { marginTop: 16, color: "#94A3B8", fontWeight: "600", fontSize: 14 },
  relatedCard: { flexDirection: "row", marginTop: 18 },
  relatedThumbWrap: { width: 140, height: 88 },
  relatedThumb: { width: 140, height: 88, borderRadius: 16 },
  relatedThumbPlaceholder: {
    backgroundColor: "#E2E8F0",
    justifyContent: "center", alignItems: "center",
  },
  relatedTitle: { fontSize: 15, fontWeight: "900", color: "#07123A", lineHeight: 22 },
  relatedSub: { marginTop: 4, color: "#64748B", fontWeight: "600", fontSize: 12 },

  // Mini player
  miniPlayer: {
    position: "absolute", bottom: 100, right: 12,
    width: 230, height: 74, backgroundColor: "#FFF",
    zIndex: 999, borderRadius: 16, elevation: 14,
    flexDirection: "row", alignItems: "center", padding: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  miniVideoWrap: {
    width: 86, height: 56, borderRadius: 10,
    backgroundColor: "#000", overflow: "hidden",
  },
  miniVideo: { width: 86, height: 56 },
  miniTitle: { fontWeight: "800", color: "#07123A", fontSize: 12 },
  miniSub: { marginTop: 3, color: "#64748B", fontSize: 11 },
});
