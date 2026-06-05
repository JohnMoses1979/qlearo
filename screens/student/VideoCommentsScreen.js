


// // screens/student/VideoCommentsScreen.js
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   StatusBar,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppContext } from "../../context/AppContext";

// export default function VideoCommentsScreen({ navigation, route }) {
//   const { uploadedVideos } = useAppContext();
//   const video = route?.params?.video;
//   const [comment, setComment] = useState("");

//   // Placeholder for comments fetched per video
//   const videoComments = video?.comments || [];

//   const handleAddComment = () => {
//     if (!comment.trim()) return;
//     // You can integrate context update here for real-time add
//     setComment("");
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={28} color="#07123A" />
//         </TouchableOpacity>

//         <View style={styles.titleRow}>
//           <Text style={styles.title}>Comments</Text>
//           <Text style={styles.count}>{videoComments.length}</Text>
//         </View>

//         <TouchableOpacity>
//           <Ionicons name="options-outline" size={26} color="#07123A" />
//         </TouchableOpacity>
//       </View>

//       {/* TOP INPUT */}
//       <View style={styles.topInputRow}>
//         <View style={styles.avatar}>
//           <Text style={styles.avatarText}>ST</Text>
//         </View>

//         <View style={styles.inputBox}>
//           <TextInput
//             placeholder="Add a comment..."
//             placeholderTextColor="#7A879D"
//             value={comment}
//             onChangeText={setComment}
//             style={styles.input}
//           />
//           <TouchableOpacity onPress={handleAddComment}>
//             <Ionicons name="send-outline" size={26} color="#07123A" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* COMMENTS LIST */}
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {videoComments.map((item) => (
//           <View key={item.id} style={styles.commentCard}>
//             {/* TOP */}
//             <View style={styles.commentTop}>
//               <View style={styles.userRow}>
//                 <View style={styles.userAvatar}>
//                   <Ionicons name="person" size={22} color="#FFFFFF" />
//                 </View>

//                 <View style={{ marginLeft: 12 }}>
//                   <Text style={styles.userName}>{item.name}</Text>
//                   <Text style={styles.time}>{item.time}</Text>
//                 </View>
//               </View>

//               <TouchableOpacity>
//                 <Ionicons name="ellipsis-vertical" size={20} color="#07123A" />
//               </TouchableOpacity>
//             </View>

//             {/* COMMENT */}
//             <Text style={styles.commentText}>{item.comment}</Text>

//             {/* ACTIONS */}
//             <View style={styles.actionsRow}>
//               <TouchableOpacity style={styles.actionBtn}>
//                 <Ionicons name="thumbs-up-outline" size={24} color="#07123A" />
//                 <Text style={styles.actionCount}>{item.likes}</Text>
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.actionBtn}>
//                 <Ionicons name="thumbs-down-outline" size={24} color="#07123A" />
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.actionBtn}>
//                 <Ionicons name="chatbubble-outline" size={22} color="#07123A" />
//                 <Text style={styles.actionCount}>{item.replies}</Text>
//               </TouchableOpacity>
//             </View>

//             {/* REPLIES */}
//             <TouchableOpacity>
//               <Text style={styles.replyText}>
//                 {item.replies} {item.replies > 1 ? "replies" : "reply"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//         <View style={{ height: 120 }} />
//       </ScrollView>

//       {/* BOTTOM INPUT */}
//       <View style={styles.bottomBox}>
//         <TextInput
//           placeholder="Add a comment..."
//           placeholderTextColor="#7A879D"
//           style={styles.bottomInput}
//           value={comment}
//           onChangeText={setComment}
//         />
//         <TouchableOpacity onPress={handleAddComment}>
//           <Ionicons name="send-outline" size={28} color="#07123A" />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 16 },

//   header: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   titleRow: { flexDirection: "row", alignItems: "center" },
//   title: { fontSize: 34, fontWeight: "900", color: "#07123A" },
//   count: { marginLeft: 12, fontSize: 24, color: "#64748B", fontWeight: "700" },

//   topInputRow: { marginTop: 24, flexDirection: "row", alignItems: "center" },
//   avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#006D6A", justifyContent: "center", alignItems: "center" },
//   avatarText: { color: "#FFFFFF", fontWeight: "900", fontSize: 20 },
//   inputBox: { flex: 1, height: 64, backgroundColor: "#F8FAFC", borderRadius: 20, marginLeft: 14, flexDirection: "row", alignItems: "center", paddingHorizontal: 18 },
//   input: { flex: 1, fontSize: 18, color: "#07123A" },

//   commentCard: { paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: "#EDF2F7" },
//   commentTop: { flexDirection: "row", justifyContent: "space-between" },
//   userRow: { flexDirection: "row" },
//   userAvatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#CBD5E1", justifyContent: "center", alignItems: "center" },
//   userName: { fontSize: 22, fontWeight: "900", color: "#07123A" },
//   time: { marginTop: 6, color: "#64748B", fontSize: 16 },
//   commentText: { marginTop: 18, fontSize: 20, lineHeight: 34, color: "#07123A" },
//   actionsRow: { marginTop: 20, flexDirection: "row", alignItems: "center" },
//   actionBtn: { flexDirection: "row", alignItems: "center", marginRight: 36 },
//   actionCount: { marginLeft: 10, fontSize: 18, color: "#07123A", fontWeight: "600" },
//   replyText: { marginTop: 18, color: "#006D6A", fontWeight: "900", fontSize: 18 },

//   bottomBox: { position: "absolute", bottom: 20, left: 16, right: 16, height: 70, backgroundColor: "#F8FAFC", borderRadius: 22, flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
//   bottomInput: { flex: 1, fontSize: 18, color: "#07123A" },
// });



































// // screens/student/VideoCommentsScreen.js
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   StatusBar,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppContext } from "../../context/AppContext";

// // ─── Placeholder comments for demo when no real comments exist ───────────────
// const PLACEHOLDER_COMMENTS = [
//   {
//     id: "demo_1",
//     name: "Riya Sharma",
//     time: "3 days ago",
//     comment: "This video really helped me understand the concept clearly. Thank you!",
//     likes: 84,
//     replies: 2,
//   },
//   {
//     id: "demo_2",
//     name: "Aman Gupta",
//     time: "5 days ago",
//     comment: "Can you explain the second part in more detail? I was a bit confused.",
//     likes: 41,
//     replies: 1,
//   },
//   {
//     id: "demo_3",
//     name: "Priya Nair",
//     time: "1 week ago",
//     comment: "Loved the explanation! Very easy to follow 👍",
//     likes: 37,
//     replies: 0,
//   },
// ];

// export default function VideoCommentsScreen({ navigation, route }) {
//   const { uploadedVideos } = useAppContext();
//   const video = route?.params?.video || {};

//   // ─── FIX: video.comments from context is a string count like "0" or "12"
//   // So we safely normalise it to an array here.
//   const getRealComments = () => {
//     const raw = video?.comments;
//     if (Array.isArray(raw) && raw.length > 0) return raw; // already an array with items
//     return []; // string count, null, undefined → no real comments
//   };

//   const realComments = getRealComments();

//   // Seed state: use real comments if present, else placeholders for demo
//   const [comments, setComments] = useState(
//     realComments.length > 0 ? realComments : PLACEHOLDER_COMMENTS
//   );
//   const [comment, setComment] = useState("");

//   const handleAddComment = () => {
//     if (!comment.trim()) return;
//     const newComment = {
//       id: `user_${Date.now()}`,
//       name: "You",
//       time: "Just now",
//       comment: comment.trim(),
//       likes: 0,
//       replies: 0,
//     };
//     setComments(prev => [newComment, ...prev]);
//     setComment("");
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* ── HEADER ──────────────────────────────────────────────────────── */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={28} color="#07123A" />
//         </TouchableOpacity>

//         <View style={styles.titleRow}>
//           <Text style={styles.title}>Comments</Text>
//           <Text style={styles.count}>{comments.length}</Text>
//         </View>

//         <TouchableOpacity>
//           <Ionicons name="options-outline" size={26} color="#07123A" />
//         </TouchableOpacity>
//       </View>

//       {/* Show which video we're commenting on */}
//       {!!video?.title && (
//         <Text style={styles.videoTitle} numberOfLines={1}>
//           {video.title}
//         </Text>
//       )}

//       {/* ── TOP INPUT ───────────────────────────────────────────────────── */}
//       <View style={styles.topInputRow}>
//         <View style={styles.avatar}>
//           <Text style={styles.avatarText}>ST</Text>
//         </View>

//         <View style={styles.inputBox}>
//           <TextInput
//             placeholder="Add a comment..."
//             placeholderTextColor="#7A879D"
//             value={comment}
//             onChangeText={setComment}
//             style={styles.input}
//             onSubmitEditing={handleAddComment}
//             returnKeyType="send"
//           />
//           <TouchableOpacity onPress={handleAddComment}>
//             <Ionicons name="send-outline" size={26} color="#07123A" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* ── COMMENTS LIST ───────────────────────────────────────────────── */}
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {comments.length === 0 ? (
//           <View style={styles.emptyState}>
//             <Ionicons name="chatbubbles-outline" size={52} color="#CBD5E1" />
//             <Text style={styles.emptyText}>No comments yet</Text>
//             <Text style={styles.emptySubText}>Be the first to comment!</Text>
//           </View>
//         ) : (
//           comments.map(item => (
//             <View key={item.id} style={styles.commentCard}>
//               {/* TOP */}
//               <View style={styles.commentTop}>
//                 <View style={styles.userRow}>
//                   <View style={styles.userAvatar}>
//                     <Ionicons name="person" size={22} color="#FFFFFF" />
//                   </View>

//                   <View style={{ marginLeft: 12 }}>
//                     <Text style={styles.userName}>{item.name}</Text>
//                     <Text style={styles.time}>{item.time}</Text>
//                   </View>
//                 </View>

//                 <TouchableOpacity>
//                   <Ionicons name="ellipsis-vertical" size={20} color="#07123A" />
//                 </TouchableOpacity>
//               </View>

//               {/* COMMENT TEXT */}
//               <Text style={styles.commentText}>{item.comment}</Text>

//               {/* ACTIONS */}
//               <View style={styles.actionsRow}>
//                 <TouchableOpacity style={styles.actionBtn}>
//                   <Ionicons name="thumbs-up-outline" size={24} color="#07123A" />
//                   <Text style={styles.actionCount}>{item.likes || 0}</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.actionBtn}>
//                   <Ionicons name="thumbs-down-outline" size={24} color="#07123A" />
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.actionBtn}>
//                   <Ionicons name="chatbubble-outline" size={22} color="#07123A" />
//                   <Text style={styles.actionCount}>{item.replies || 0}</Text>
//                 </TouchableOpacity>
//               </View>

//               {/* REPLIES */}
//               {(item.replies || 0) > 0 && (
//                 <TouchableOpacity>
//                   <Text style={styles.replyText}>
//                     {item.replies} {item.replies > 1 ? "replies" : "reply"}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           ))
//         )}
//         <View style={{ height: 120 }} />
//       </ScrollView>

//       {/* ── BOTTOM INPUT ────────────────────────────────────────────────── */}
//       <View style={styles.bottomBox}>
//         <TextInput
//           placeholder="Add a comment..."
//           placeholderTextColor="#7A879D"
//           style={styles.bottomInput}
//           value={comment}
//           onChangeText={setComment}
//           onSubmitEditing={handleAddComment}
//           returnKeyType="send"
//         />
//         <TouchableOpacity onPress={handleAddComment}>
//           <Ionicons name="send-outline" size={28} color="#07123A" />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 16 },

//   header: {
//     marginTop: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   titleRow: { flexDirection: "row", alignItems: "center" },
//   title: { fontSize: 34, fontWeight: "900", color: "#07123A" },
//   count: { marginLeft: 12, fontSize: 24, color: "#64748B", fontWeight: "700" },

//   videoTitle: {
//     marginTop: 4,
//     marginBottom: 4,
//     fontSize: 13,
//     color: "#64748B",
//     fontWeight: "600",
//   },

//   topInputRow: { marginTop: 20, flexDirection: "row", alignItems: "center" },
//   avatar: {
//     width: 56, height: 56, borderRadius: 28,
//     backgroundColor: "#006D6A",
//     justifyContent: "center", alignItems: "center",
//   },
//   avatarText: { color: "#FFFFFF", fontWeight: "900", fontSize: 20 },
//   inputBox: {
//     flex: 1, height: 64, backgroundColor: "#F8FAFC",
//     borderRadius: 20, marginLeft: 14,
//     flexDirection: "row", alignItems: "center", paddingHorizontal: 18,
//   },
//   input: { flex: 1, fontSize: 18, color: "#07123A" },

//   emptyState: {
//     alignItems: "center", marginTop: 60, paddingHorizontal: 32,
//   },
//   emptyText: {
//     marginTop: 16, fontSize: 18,
//     fontWeight: "900", color: "#07123A",
//   },
//   emptySubText: {
//     marginTop: 8, fontSize: 14,
//     color: "#64748B", textAlign: "center",
//   },

//   commentCard: {
//     paddingVertical: 24,
//     borderBottomWidth: 1,
//     borderBottomColor: "#EDF2F7",
//   },
//   commentTop: { flexDirection: "row", justifyContent: "space-between" },
//   userRow: { flexDirection: "row" },
//   userAvatar: {
//     width: 54, height: 54, borderRadius: 27,
//     backgroundColor: "#CBD5E1",
//     justifyContent: "center", alignItems: "center",
//   },
//   userName: { fontSize: 22, fontWeight: "900", color: "#07123A" },
//   time: { marginTop: 6, color: "#64748B", fontSize: 16 },
//   commentText: { marginTop: 18, fontSize: 20, lineHeight: 34, color: "#07123A" },
//   actionsRow: { marginTop: 20, flexDirection: "row", alignItems: "center" },
//   actionBtn: { flexDirection: "row", alignItems: "center", marginRight: 36 },
//   actionCount: { marginLeft: 10, fontSize: 18, color: "#07123A", fontWeight: "600" },
//   replyText: { marginTop: 18, color: "#006D6A", fontWeight: "900", fontSize: 18 },

//   bottomBox: {
//     position: "absolute", bottom: 20, left: 16, right: 16,
//     height: 70, backgroundColor: "#F8FAFC",
//     borderRadius: 22,
//     flexDirection: "row", alignItems: "center", paddingHorizontal: 20,
//   },
//   bottomInput: { flex: 1, fontSize: 18, color: "#07123A" },
// });








































// screens/student/VideoCommentsScreen.js
import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        "#F4F6FB",
  card:      "#FFFFFF",
  primary:   "#006D6A",
  accent:    "#00B4AE",
  text:      "#07123A",
  sub:       "#64748B",
  border:    "#E8EDF5",
  inputBg:   "#EEF2F8",
  avatarBg:  "#006D6A",
  red:       "#EF4444",
  shadow:    "#07123A",
};

// ─── Placeholder comments ─────────────────────────────────────────────────────
const PLACEHOLDERS = [
  {
    id: "p1",
    name: "Riya Sharma",
    initials: "RS",
    avatarColor: "#7C3AED",
    time: "3 days ago",
    text: "This video really helped me understand the concept clearly. Thank you so much! 🙌",
    likes: 84,
    dislikes: 2,
    replies: 2,
    liked: false,
    disliked: false,
  },
  {
    id: "p2",
    name: "Aman Gupta",
    initials: "AG",
    avatarColor: "#0369A1",
    time: "5 days ago",
    text: "Can you explain the second part in more detail? I was a bit confused about the formula.",
    likes: 41,
    dislikes: 0,
    replies: 1,
    liked: false,
    disliked: false,
  },
  {
    id: "p3",
    name: "Priya Nair",
    initials: "PN",
    avatarColor: "#B45309",
    time: "1 week ago",
    text: "Loved the explanation! Very easy to follow 👍 Please make more videos on this topic.",
    likes: 37,
    dislikes: 1,
    replies: 0,
    liked: false,
    disliked: false,
  },
  {
    id: "p4",
    name: "Karan Mehta",
    initials: "KM",
    avatarColor: "#0F766E",
    time: "2 weeks ago",
    text: "Best explanation I've seen on this topic. Subscribed immediately!",
    likes: 112,
    dislikes: 3,
    replies: 5,
    liked: false,
    disliked: false,
  },
];

// ─── Single comment card ──────────────────────────────────────────────────────
function CommentCard({ item, onLike, onDislike }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleLike = () => { bounce(); onLike(item.id); };
  const handleDislike = () => { bounce(); onDislike(item.id); };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      {/* Avatar + name */}
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor || C.avatarBg }]}>
          <Text style={styles.avatarText}>{item.initials || item.name?.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.nameCol}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <TouchableOpacity style={styles.menuBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="ellipsis-horizontal" size={18} color={C.sub} />
        </TouchableOpacity>
      </View>

      {/* Comment body */}
      <Text style={styles.commentBody}>{item.text}</Text>

      {/* Actions */}
      <View style={styles.cardActions}>
        {/* Like */}
        <TouchableOpacity style={styles.reactionBtn} onPress={handleLike} activeOpacity={0.7}>
          <View style={[styles.reactionIcon, item.liked && styles.reactionIconActive]}>
            <Ionicons
              name={item.liked ? "thumbs-up" : "thumbs-up-outline"}
              size={16}
              color={item.liked ? "#FFF" : C.sub}
            />
          </View>
          <Text style={[styles.reactionCount, item.liked && { color: C.primary }]}>
            {item.likes}
          </Text>
        </TouchableOpacity>

        {/* Dislike */}
        <TouchableOpacity style={styles.reactionBtn} onPress={handleDislike} activeOpacity={0.7}>
          <View style={[styles.reactionIcon, item.disliked && styles.reactionIconRed]}>
            <Ionicons
              name={item.disliked ? "thumbs-down" : "thumbs-down-outline"}
              size={16}
              color={item.disliked ? "#FFF" : C.sub}
            />
          </View>
          {item.dislikes > 0 && (
            <Text style={[styles.reactionCount, item.disliked && { color: C.red }]}>
              {item.dislikes}
            </Text>
          )}
        </TouchableOpacity>

        {/* Reply */}
        <TouchableOpacity style={styles.replyChip} activeOpacity={0.7}>
          <Ionicons name="return-down-forward-outline" size={14} color={C.primary} />
          <Text style={styles.replyChipText}>Reply</Text>
        </TouchableOpacity>

        {/* View replies */}
        {(item.replies || 0) > 0 && (
          <TouchableOpacity style={styles.viewReplies} activeOpacity={0.7}>
            <Ionicons name="chatbubbles-outline" size={13} color={C.accent} />
            <Text style={styles.viewRepliesText}>
              {item.replies} {item.replies === 1 ? "reply" : "replies"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function VideoCommentsScreen({ navigation, route }) {
  const { width: W } = useWindowDimensions();
  const video = route?.params?.video || {};

  // Normalise comments — context stores a string count, not an array
  const seed = (() => {
    const raw = video?.comments;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((c, i) => ({
        id: c.id || `real_${i}`,
        name: c.name || "Student",
        initials: (c.name || "ST").slice(0, 2).toUpperCase(),
        avatarColor: ["#7C3AED","#0369A1","#B45309","#0F766E","#BE185D"][i % 5],
        time: c.time || "Recently",
        text: c.comment || c.text || "",
        likes: Number(c.likes) || 0,
        dislikes: 0,
        replies: Number(c.replies) || 0,
        liked: false,
        disliked: false,
      }));
    }
    return PLACEHOLDERS;
  })();

  const [comments, setComments] = useState(seed);
  const [text, setText] = useState("");
  const [activeFilter, setActiveFilter] = useState("Top");
  const inputRef = useRef(null);

  const handleLike = useCallback(id => {
    setComments(prev => prev.map(c =>
      c.id !== id ? c : {
        ...c,
        liked: !c.liked,
        likes: c.liked ? c.likes - 1 : c.likes + 1,
        disliked: false,
        dislikes: c.disliked ? c.dislikes - 1 : c.dislikes,
      }
    ));
  }, []);

  const handleDislike = useCallback(id => {
    setComments(prev => prev.map(c =>
      c.id !== id ? c : {
        ...c,
        disliked: !c.disliked,
        dislikes: c.disliked ? c.dislikes - 1 : c.dislikes + 1,
        liked: false,
        likes: c.liked ? c.likes - 1 : c.likes,
      }
    ));
  }, []);

  const postComment = () => {
    if (!text.trim()) return;
    const newC = {
      id: `u_${Date.now()}`,
      name: "You",
      initials: "ME",
      avatarColor: C.primary,
      time: "Just now",
      text: text.trim(),
      likes: 0,
      dislikes: 0,
      replies: 0,
      liked: false,
      disliked: false,
    };
    setComments(prev => [newC, ...prev]);
    setText("");
    inputRef.current?.blur();
  };

  const filtered = (() => {
    if (activeFilter === "Newest") return [...comments].reverse();
    if (activeFilter === "Top") return [...comments].sort((a, b) => b.likes - a.likes);
    return comments;
  })();

  const FILTERS = ["Top", "Newest", "All"];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Comments</Text>
            {!!video?.title && (
              <Text style={styles.headerSub} numberOfLines={1}>{video.title}</Text>
            )}
          </View>

          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{comments.length}</Text>
          </View>
        </View>

        {/* ── FILTER TABS ─────────────────────────────────────────────── */}
        <View style={styles.filtersRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── COMMENTS LIST ────────────────────────────────────────────── */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="chatbubbles-outline" size={40} color={C.primary} />
              </View>
              <Text style={styles.emptyTitle}>No comments yet</Text>
              <Text style={styles.emptySub}>Be the first to share your thoughts!</Text>
            </View>
          ) : (
            filtered.map(item => (
              <CommentCard
                key={item.id}
                item={item}
                onLike={handleLike}
                onDislike={handleDislike}
              />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── COMPOSE BOX ──────────────────────────────────────────────── */}
        <View style={styles.compose}>
          {/* My avatar */}
          <View style={[styles.avatar, { backgroundColor: C.primary, width: 38, height: 38, borderRadius: 19 }]}>
            <Text style={[styles.avatarText, { fontSize: 13 }]}>ME</Text>
          </View>

          {/* Input */}
          <View style={styles.composeInput}>
            <TextInput
              ref={inputRef}
              placeholder="Write a comment…"
              placeholderTextColor={C.sub}
              value={text}
              onChangeText={setText}
              style={styles.inputText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={postComment}
            />
          </View>

          {/* Send */}
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={postComment}
            disabled={!text.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: C.bg,
    gap: 10,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 14,
    backgroundColor: C.card,
    justifyContent: "center", alignItems: "center",
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 3, elevation: 2,
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: C.text, letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: C.sub, fontWeight: "500", marginTop: 1 },
  countPill: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    minWidth: 34, alignItems: "center",
  },
  countPillText: { color: "#FFF", fontWeight: "800", fontSize: 13 },

  // Filters
  filtersRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: C.card,
    borderWidth: 1.5, borderColor: C.border,
  },
  filterChipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterText: { fontSize: 13, fontWeight: "700", color: C.sub },
  filterTextActive: { color: "#FFF" },

  // List
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 4 },

  // Empty
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#E6F4F4",
    justifyContent: "center", alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: "900", color: C.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: C.sub, textAlign: "center", lineHeight: 20 },

  // Card
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
  nameCol: { flex: 1, marginLeft: 10 },
  userName: { fontSize: 14, fontWeight: "800", color: C.text },
  timeText: { fontSize: 11, color: C.sub, fontWeight: "500", marginTop: 1 },
  menuBtn: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
    backgroundColor: C.bg,
  },

  // Comment body
  commentBody: {
    fontSize: 14, color: C.text, lineHeight: 22,
    marginBottom: 12,
  },

  // Actions
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  reactionBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
  },
  reactionIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.bg,
    justifyContent: "center", alignItems: "center",
  },
  reactionIconActive: { backgroundColor: C.primary },
  reactionIconRed: { backgroundColor: C.red },
  reactionCount: {
    fontSize: 13, fontWeight: "700", color: C.sub,
  },
  replyChip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#E6F4F4",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
    gap: 4, marginLeft: 4,
  },
  replyChipText: { fontSize: 12, fontWeight: "700", color: C.primary },
  viewReplies: {
    flexDirection: "row", alignItems: "center",
    gap: 4, marginLeft: 4,
  },
  viewRepliesText: { fontSize: 12, fontWeight: "700", color: C.accent },

  // Compose
  compose: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 16 : 14,
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 10,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  composeInput: {
    flex: 1,
    backgroundColor: C.inputBg,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    minHeight: 42, maxHeight: 110,
  },
  inputText: {
    fontSize: 14, color: C.text,
    fontWeight: "500", lineHeight: 20,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: C.primary,
    justifyContent: "center", alignItems: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 6,
    elevation: 4,
  },
  sendBtnDisabled: { backgroundColor: "#B0C4C4", shadowOpacity: 0 },
});