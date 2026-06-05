// // ======================================================
// // TeacherCommentsScreen.js
// // FULLY UPDATED
// // EXACT UI LIKE IMAGE
// // PROFESSIONAL COMMENTS SCREEN
// // NO MISSING
// // ======================================================

// import React, { useState } from "react";

// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   TextInput,
// } from "react-native";

// import { Ionicons } from "@expo/vector-icons";

// const COLORS = {
//   primary: "#008F7A",
//   bg: "#F6F8FC",
//   white: "#FFFFFF",
//   text: "#07123A",
//   muted: "#7A879D",
//   border: "#E9EDF5",
//   green: "#16A34A",
// };

// export default function TeacherCommentsScreen({
//   navigation,
// }) {
//   const [activeTab, setActiveTab] =
//     useState("All");

//   const comments = [
//     {
//       id: "1",
//       name: "Ananya Verma",
//       time: "2 weeks ago",
//       comment:
//         "Thank you teacher! This explanation made it so easy to understand.",
//       likes: 120,
//       pinned: true,
//     },

//     {
//       id: "2",
//       name: "Rahul Kumar",
//       time: "2 weeks ago",
//       comment:
//         "Can you please make a video on fractions? I’m finding it difficult.",
//       likes: 55,
//       reply: true,
//     },

//     {
//       id: "3",
//       name: "Kavya Singh",
//       time: "2 weeks ago",
//       comment:
//         "Very helpful video 👍",
//       likes: 54,
//     },

//     {
//       id: "4",
//       name: "Arjun Patel",
//       time: "3 weeks ago",
//       comment:
//         "Awesome lecture sir 🔥",
//       likes: 49,
//     },

//     {
//       id: "5",
//       name: "Meera Joshi",
//       time: "3 weeks ago",
//       comment:
//         "Please explain negative numbers in detail.",
//       likes: 32,
//     },
//   ];

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar
//         barStyle="dark-content"
//       />

//       {/* HEADER */}

//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() =>
//             navigation.goBack()
//           }
//         >
//           <Ionicons
//             name="arrow-back"
//             size={28}
//             color={COLORS.text}
//           />
//         </TouchableOpacity>

//         <Text style={styles.heading}>
//           Video Comments
//         </Text>

//         <TouchableOpacity>
//           <Ionicons
//             name="options-outline"
//             size={26}
//             color={COLORS.text}
//           />
//         </TouchableOpacity>
//       </View>

//       {/* FILTERS */}

//       <View style={styles.tabsRow}>
//         {[
//           "All",
//           "Pinned",
//           "Newest",
//         ].map(tab => (
//           <TouchableOpacity
//             key={tab}
//             style={[
//               styles.tabBtn,

//               activeTab === tab && {
//                 backgroundColor:
//                   COLORS.primary,
//               },
//             ]}
//             onPress={() =>
//               setActiveTab(tab)
//             }
//           >
//             <Text
//               style={[
//                 styles.tabText,

//                 activeTab === tab && {
//                   color: "#FFFFFF",
//                 },
//               ]}
//             >
//               {tab}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* COMMENTS */}

//       <ScrollView
//         showsVerticalScrollIndicator={
//           false
//         }
//       >
//         {comments.map(item => (
//           <View
//             key={item.id}
//             style={styles.commentCard}
//           >
//             {/* TOP */}

//             <View style={styles.topRow}>
//               <View style={styles.userRow}>
//                 <View
//                   style={
//                     styles.avatar
//                   }
//                 >
//                   <Ionicons
//                     name="person"
//                     size={22}
//                     color="#FFFFFF"
//                   />
//                 </View>

//                 <View
//                   style={{
//                     marginLeft: 12,
//                   }}
//                 >
//                   <Text
//                     style={
//                       styles.userName
//                     }
//                   >
//                     {item.name}
//                   </Text>

//                   <Text
//                     style={
//                       styles.time
//                     }
//                   >
//                     {item.time}
//                   </Text>
//                 </View>
//               </View>

//               <TouchableOpacity>
//                 <Ionicons
//                   name="ellipsis-vertical"
//                   size={18}
//                   color={COLORS.text}
//                 />
//               </TouchableOpacity>
//             </View>

//             {/* COMMENT */}

//             <Text
//               style={
//                 styles.commentText
//               }
//             >
//               {item.comment}
//             </Text>

//             {/* ACTIONS */}

//             <View
//               style={
//                 styles.actionsRow
//               }
//             >
//               <TouchableOpacity
//                 style={
//                   styles.actionBtn
//                 }
//               >
//                 <Ionicons
//                   name="thumbs-up-outline"
//                   size={22}
//                   color={
//                     COLORS.primary
//                   }
//                 />

//                 <Text
//                   style={
//                     styles.actionText
//                   }
//                 >
//                   {item.likes}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={
//                   styles.actionBtn
//                 }
//               >
//                 <Ionicons
//                   name="chatbubble-outline"
//                   size={22}
//                   color={
//                     COLORS.muted
//                   }
//                 />

//                 <Text
//                   style={
//                     styles.replyText
//                   }
//                 >
//                   Reply
//                 </Text>
//               </TouchableOpacity>

//               {item.pinned && (
//                 <View
//                   style={
//                     styles.pinBadge
//                   }
//                 >
//                   <Ionicons
//                     name="attach"
//                     size={14}
//                     color={
//                       COLORS.green
//                     }
//                   />

//                   <Text
//                     style={
//                       styles.pinText
//                     }
//                   >
//                     Pinned
//                   </Text>
//                 </View>
//               )}

//               {item.reply && (
//                 <TouchableOpacity>
//                   <Text
//                     style={
//                       styles.viewReply
//                     }
//                   >
//                     View reply →
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         ))}

//         <View
//           style={{ height: 120 }}
//         />
//       </ScrollView>

//       {/* COMMENT INPUT */}

//       <View style={styles.bottomBox}>
//         <TextInput
//           placeholder="Add a comment..."
//           placeholderTextColor={
//             COLORS.muted
//           }
//           style={styles.input}
//         />

//         <TouchableOpacity
//           style={styles.sendBtn}
//         >
//           <Ionicons
//             name="send"
//             size={22}
//             color="#FFFFFF"
//           />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.bg,
//     paddingHorizontal: 16,
//   },

//   header: {
//     marginTop: 12,
//     flexDirection: "row",
//     justifyContent:
//       "space-between",
//     alignItems: "center",
//   },

//   heading: {
//     fontSize: 28,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   tabsRow: {
//     flexDirection: "row",
//     marginTop: 24,
//     marginBottom: 20,
//   },

//   tabBtn: {
//     paddingHorizontal: 22,
//     paddingVertical: 12,
//     borderRadius: 30,
//     backgroundColor: "#FFFFFF",
//     marginRight: 12,
//   },

//   tabText: {
//     color: COLORS.text,
//     fontWeight: "800",
//     fontSize: 15,
//   },

//   commentCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 24,
//     padding: 18,
//     marginBottom: 18,
//   },

//   topRow: {
//     flexDirection: "row",
//     justifyContent:
//       "space-between",
//   },

//   userRow: {
//     flexDirection: "row",
//   },

//   avatar: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     backgroundColor:
//       COLORS.primary,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   userName: {
//     fontSize: 18,
//     fontWeight: "900",
//     color: COLORS.text,
//   },

//   time: {
//     marginTop: 4,
//     color: COLORS.muted,
//     fontWeight: "600",
//   },

//   commentText: {
//     marginTop: 18,
//     color: COLORS.text,
//     fontSize: 20,
//     lineHeight: 32,
//   },

//   actionsRow: {
//     marginTop: 22,
//     flexDirection: "row",
//     alignItems: "center",
//     flexWrap: "wrap",
//   },

//   actionBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 24,
//   },

//   actionText: {
//     marginLeft: 6,
//     color: COLORS.primary,
//     fontWeight: "800",
//     fontSize: 15,
//   },

//   replyText: {
//     marginLeft: 6,
//     color: COLORS.muted,
//     fontWeight: "700",
//     fontSize: 15,
//   },

//   pinBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor:
//       "#EAFBF6",
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },

//   pinText: {
//     marginLeft: 5,
//     color: COLORS.green,
//     fontWeight: "800",
//   },

//   viewReply: {
//     color: COLORS.green,
//     fontWeight: "900",
//     marginLeft: 12,
//   },

//   bottomBox: {
//     position: "absolute",
//     left: 16,
//     right: 16,
//     bottom: 24,
//     height: 68,
//     borderRadius: 34,
//     backgroundColor: "#FFFFFF",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },

//   input: {
//     flex: 1,
//     fontSize: 17,
//     color: COLORS.text,
//   },

//   sendBtn: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     backgroundColor:
//       COLORS.primary,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });













































// // screens/teacher/TeacherCommentsScreen.js
// // FULLY UPDATED
// // PROFESSIONAL COMMENTS SCREEN
// // BACK BUTTON FIXED
// // TeacherBottomNavigation ADDED

// import React, { useState } from "react";
// import {
//   View, Text, StyleSheet, SafeAreaView,
//   TouchableOpacity, ScrollView, StatusBar, TextInput,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

// const COLORS = {
//   primary: "#008F7A",
//   bg: "#F6F8FC",
//   white: "#FFFFFF",
//   text: "#07123A",
//   muted: "#7A879D",
//   border: "#E9EDF5",
//   green: "#16A34A",
// };

// const INITIAL_COMMENTS = [
//   {
//     id: "1",
//     name: "Ananya Verma",
//     time: "2 weeks ago",
//     comment: "Thank you teacher! This explanation made it so easy to understand.",
//     likes: 120,
//     liked: false,
//     pinned: true,
//   },
//   {
//     id: "2",
//     name: "Rahul Kumar",
//     time: "2 weeks ago",
//     comment: "Can you please make a video on fractions? I'm finding it difficult.",
//     likes: 55,
//     liked: false,
//     reply: true,
//   },
//   {
//     id: "3",
//     name: "Kavya Singh",
//     time: "2 weeks ago",
//     comment: "Very helpful video 👍",
//     likes: 54,
//     liked: false,
//   },
//   {
//     id: "4",
//     name: "Arjun Patel",
//     time: "3 weeks ago",
//     comment: "Awesome lecture sir 🔥",
//     likes: 49,
//     liked: false,
//   },
//   {
//     id: "5",
//     name: "Meera Joshi",
//     time: "3 weeks ago",
//     comment: "Please explain negative numbers in detail.",
//     likes: 32,
//     liked: false,
//   },
// ];

// export default function TeacherCommentsScreen({ navigation }) {
//   const [activeTab, setActiveTab] = useState("All");
//   const [comments, setComments] = useState(INITIAL_COMMENTS);
//   const [newComment, setNewComment] = useState("");

//   const toggleLike = (id) => {
//     setComments(prev =>
//       prev.map(c =>
//         c.id === id
//           ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
//           : c
//       )
//     );
//   };

//   const sendComment = () => {
//     if (!newComment.trim()) return;
//     const comment = {
//       id: Date.now().toString(),
//       name: "Teacher",
//       time: "Just now",
//       comment: newComment.trim(),
//       likes: 0,
//       liked: false,
//     };
//     setComments(prev => [comment, ...prev]);
//     setNewComment("");
//   };

//   const filteredComments = comments.filter(c => {
//     if (activeTab === "Pinned") return c.pinned;
//     if (activeTab === "Newest") return true;
//     return true;
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backBtn}
//         >
//           <Ionicons name="arrow-back" size={28} color={COLORS.text} />
//         </TouchableOpacity>
//         <Text style={styles.heading}>Video Comments</Text>
//         <TouchableOpacity>
//           <Ionicons name="options-outline" size={26} color={COLORS.text} />
//         </TouchableOpacity>
//       </View>

//       {/* FILTERS */}
//       <View style={styles.tabsRow}>
//         {["All", "Pinned", "Newest"].map(tab => (
//           <TouchableOpacity
//             key={tab}
//             style={[
//               styles.tabBtn,
//               activeTab === tab && { backgroundColor: COLORS.primary },
//             ]}
//             onPress={() => setActiveTab(tab)}
//           >
//             <Text style={[styles.tabText, activeTab === tab && { color: "#FFFFFF" }]}>
//               {tab}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* COMMENTS */}
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: 16 }}
//       >
//         {filteredComments.map(item => (
//           <View key={item.id} style={styles.commentCard}>
//             {/* TOP */}
//             <View style={styles.topRow}>
//               <View style={styles.userRow}>
//                 <View style={styles.avatar}>
//                   <Ionicons name="person" size={22} color="#FFFFFF" />
//                 </View>
//                 <View style={{ marginLeft: 12 }}>
//                   <Text style={styles.userName}>{item.name}</Text>
//                   <Text style={styles.time}>{item.time}</Text>
//                 </View>
//               </View>
//               <TouchableOpacity>
//                 <Ionicons name="ellipsis-vertical" size={18} color={COLORS.text} />
//               </TouchableOpacity>
//             </View>

//             {/* COMMENT TEXT */}
//             <Text style={styles.commentText}>{item.comment}</Text>

//             {/* ACTIONS */}
//             <View style={styles.actionsRow}>
//               <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
//                 <Ionicons
//                   name={item.liked ? "thumbs-up" : "thumbs-up-outline"}
//                   size={22}
//                   color={item.liked ? COLORS.primary : COLORS.primary}
//                 />
//                 <Text style={styles.actionText}>{item.likes}</Text>
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.actionBtn}>
//                 <Ionicons name="chatbubble-outline" size={22} color={COLORS.muted} />
//                 <Text style={styles.replyText}>Reply</Text>
//               </TouchableOpacity>

//               {item.pinned && (
//                 <View style={styles.pinBadge}>
//                   <Ionicons name="attach" size={14} color={COLORS.green} />
//                   <Text style={styles.pinText}>Pinned</Text>
//                 </View>
//               )}

//               {item.reply && (
//                 <TouchableOpacity>
//                   <Text style={styles.viewReply}>View reply →</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         ))}
//       </ScrollView>

//       {/* COMMENT INPUT */}
//       <View style={styles.bottomBox}>
//         <TextInput
//           placeholder="Add a comment..."
//           placeholderTextColor={COLORS.muted}
//           style={styles.input}
//           value={newComment}
//           onChangeText={setNewComment}
//           onSubmitEditing={sendComment}
//           returnKeyType="send"
//         />
//         <TouchableOpacity style={styles.sendBtn} onPress={sendComment}>
//           <Ionicons name="send" size={22} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>

//       <TeacherBottomNavigation navigation={navigation} active="" />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.bg },
//   header: {
//     marginTop: 12, paddingHorizontal: 16,
//     flexDirection: "row", justifyContent: "space-between", alignItems: "center",
//   },
//   backBtn: {
//     width: 42, height: 42, borderRadius: 14,
//     backgroundColor: COLORS.white, justifyContent: "center",
//     alignItems: "center", borderWidth: 1, borderColor: COLORS.border,
//   },
//   heading: { fontSize: 24, fontWeight: "900", color: COLORS.text },
//   tabsRow: { flexDirection: "row", marginTop: 20, marginBottom: 16, paddingHorizontal: 16 },
//   tabBtn: {
//     paddingHorizontal: 22, paddingVertical: 12, borderRadius: 30,
//     backgroundColor: "#FFFFFF", marginRight: 12,
//   },
//   tabText: { color: COLORS.text, fontWeight: "800", fontSize: 14 },
//   commentCard: {
//     backgroundColor: "#FFFFFF", borderRadius: 24,
//     padding: 18, marginBottom: 16,
//   },
//   topRow: { flexDirection: "row", justifyContent: "space-between" },
//   userRow: { flexDirection: "row" },
//   avatar: {
//     width: 52, height: 52, borderRadius: 26,
//     backgroundColor: COLORS.primary,
//     justifyContent: "center", alignItems: "center",
//   },
//   userName: { fontSize: 16, fontWeight: "900", color: COLORS.text },
//   time: { marginTop: 4, color: COLORS.muted, fontWeight: "600" },
//   commentText: { marginTop: 14, color: COLORS.text, fontSize: 16, lineHeight: 26 },
//   actionsRow: { marginTop: 18, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
//   actionBtn: { flexDirection: "row", alignItems: "center", marginRight: 24 },
//   actionText: { marginLeft: 6, color: COLORS.primary, fontWeight: "800", fontSize: 14 },
//   replyText: { marginLeft: 6, color: COLORS.muted, fontWeight: "700", fontSize: 14 },
//   pinBadge: {
//     flexDirection: "row", alignItems: "center",
//     backgroundColor: "#EAFBF6", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
//   },
//   pinText: { marginLeft: 5, color: COLORS.green, fontWeight: "800" },
//   viewReply: { color: COLORS.green, fontWeight: "900", marginLeft: 12 },
//   bottomBox: {
//     position: "absolute", left: 16, right: 16, bottom: 88,
//     height: 62, borderRadius: 31, backgroundColor: "#FFFFFF",
//     flexDirection: "row", alignItems: "center", paddingHorizontal: 20,
//     elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1, shadowRadius: 8,
//   },
//   input: { flex: 1, fontSize: 16, color: COLORS.text },
//   sendBtn: {
//     width: 46, height: 46, borderRadius: 23,
//     backgroundColor: COLORS.primary,
//     justifyContent: "center", alignItems: "center",
//   },
// });


































// screens/teacher/TeacherCommentsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const COLORS = {
  primary: "#008F7A",
  bg: "#F6F8FC",
  white: "#FFFFFF",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E9EDF5",
  green: "#16A34A",
};

// ─── Placeholder comments shown when the video has no real comments yet ──────
const PLACEHOLDER_COMMENTS = [
  {
    id: "1",
    name: "Ananya Verma",
    time: "2 weeks ago",
    comment: "Thank you teacher! This explanation made it so easy to understand.",
    likes: 120,
    liked: false,
    pinned: true,
  },
  {
    id: "2",
    name: "Rahul Kumar",
    time: "2 weeks ago",
    comment: "Can you please make a video on fractions? I'm finding it difficult.",
    likes: 55,
    liked: false,
    reply: true,
  },
  {
    id: "3",
    name: "Kavya Singh",
    time: "2 weeks ago",
    comment: "Very helpful video 👍",
    likes: 54,
    liked: false,
  },
  {
    id: "4",
    name: "Arjun Patel",
    time: "3 weeks ago",
    comment: "Awesome lecture sir 🔥",
    likes: 49,
    liked: false,
  },
  {
    id: "5",
    name: "Meera Joshi",
    time: "3 weeks ago",
    comment: "Please explain negative numbers in detail.",
    likes: 32,
    liked: false,
  },
];

export default function TeacherCommentsScreen({ navigation, route }) {
  // ─── Receive video passed from UploadVideoPlayerScreen ───────────────────
  const video = route?.params?.video || {};
  const { uploadedVideos, currentUser } = useAppContext();

  // Get the freshest copy of this video from context (for live comment count etc.)
  const liveVideoCandidate = uploadedVideos.find(
    (v) =>
      v.id === video.id &&
      String(v?.teacherId || "").toLowerCase() ===
        String(currentUser?.teacherId || currentUser?.id || "").toLowerCase()
  );
  const routeBelongsToTeacher =
    String(video?.teacherId || "").toLowerCase() ===
    String(currentUser?.teacherId || currentUser?.id || "").toLowerCase();
  const liveVideo = liveVideoCandidate || (routeBelongsToTeacher ? video : {});

  // Seed with real comments if video has them, else use placeholders for demo
  const seedComments = Array.isArray(liveVideo.comments) && liveVideo.comments.length > 0
    ? liveVideo.comments.map((c, i) => ({
        id: c.id || `seed_${i}`,
        name: c.name || "Student",
        time: c.time || "Recently",
        comment: c.comment || c.text || "",
        likes: Number(c.likes) || 0,
        liked: false,
        pinned: c.pinned || false,
        reply: c.reply || false,
      }))
    : PLACEHOLDER_COMMENTS;

  const [activeTab, setActiveTab] = useState("All");
  const [comments, setComments] = useState(seedComments);
  const [newComment, setNewComment] = useState("");

  // ─── Toggle like on a comment ─────────────────────────────────────────────
  const toggleLike = id => {
    setComments(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  };

  // ─── Teacher adds a reply / comment ──────────────────────────────────────
  const sendComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: `teacher_${Date.now()}`,
      name: "You (Teacher)",
      time: "Just now",
      comment: newComment.trim(),
      likes: 0,
      liked: false,
      isTeacher: true,
    };
    setComments(prev => [comment, ...prev]);
    setNewComment("");
  };

  // ─── Tab filtering ────────────────────────────────────────────────────────
  const filteredComments = comments.filter(c => {
    if (activeTab === "Pinned") return c.pinned;
    if (activeTab === "Newest") return true; // sorted by insertion (newest first via state prepend)
    return true; // "All"
  });

  const totalCount = comments.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.heading}>Comments</Text>
          {/* Show which video these comments belong to */}
          {!!liveVideo.title && (
            <Text style={styles.videoSubtitle} numberOfLines={1}>
              {liveVideo.title}
            </Text>
          )}
        </View>

        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{totalCount}</Text>
          </View>
          <TouchableOpacity style={{ marginLeft: 8 }}>
            <Ionicons name="options-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Filter tabs ─────────────────────────────────────────────────── */}
      <View style={styles.tabsRow}>
        {["All", "Pinned", "Newest"].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabBtn,
              activeTab === tab && { backgroundColor: COLORS.primary },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && { color: "#FFFFFF" }]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Comments list ───────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: 16 }}
      >
        {filteredComments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={52} color={COLORS.muted} />
            <Text style={styles.emptyText}>No comments yet</Text>
            <Text style={styles.emptySubText}>
              Comments from students will appear here.
            </Text>
          </View>
        ) : (
          filteredComments.map(item => (
            <View
              key={item.id}
              style={[styles.commentCard, item.isTeacher && styles.teacherCard]}
            >
              {/* Top row: avatar + name + menu */}
              <View style={styles.topRow}>
                <View style={styles.userRow}>
                  <View style={[styles.avatar, item.isTeacher && { backgroundColor: "#07123A" }]}>
                    <Ionicons name="person" size={20} color="#FFFFFF" />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-vertical" size={18} color={COLORS.muted} />
                </TouchableOpacity>
              </View>

              {/* Comment text */}
              <Text style={styles.commentText}>{item.comment}</Text>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
                  <Ionicons
                    name={item.liked ? "thumbs-up" : "thumbs-up-outline"}
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.actionText}>{item.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="chatbubble-outline" size={20} color={COLORS.muted} />
                  <Text style={styles.replyText}>Reply</Text>
                </TouchableOpacity>

                {item.pinned && (
                  <View style={styles.pinBadge}>
                    <Ionicons name="attach" size={13} color={COLORS.green} />
                    <Text style={styles.pinText}>Pinned</Text>
                  </View>
                )}

                {item.reply && !item.isTeacher && (
                  <TouchableOpacity>
                    <Text style={styles.viewReply}>View reply →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Comment input ───────────────────────────────────────────────── */}
      <View style={styles.bottomBox}>
        <TextInput
          placeholder="Reply as teacher..."
          placeholderTextColor={COLORS.muted}
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          onSubmitEditing={sendComment}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendComment}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <TeacherBottomNavigation navigation={navigation} active="" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    marginTop: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: COLORS.border,
  },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  heading: { fontSize: 22, fontWeight: "900", color: COLORS.text },
  videoSubtitle: {
    fontSize: 12, color: COLORS.muted,
    fontWeight: "600", marginTop: 2,
  },
  headerRight: { flexDirection: "row", alignItems: "center" },
  countBadge: {
    minWidth: 32, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center",
    paddingHorizontal: 8,
  },
  countText: { color: "#FFF", fontWeight: "800", fontSize: 13 },

  // Tabs
  tabsRow: {
    flexDirection: "row",
    marginTop: 18, marginBottom: 14,
    paddingHorizontal: 16,
  },
  tabBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 30, backgroundColor: COLORS.white,
    marginRight: 10,
  },
  tabText: { color: COLORS.text, fontWeight: "800", fontSize: 13 },

  // Comment card
  commentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20, padding: 16, marginBottom: 14,
  },
  teacherCard: {
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  userRow: { flexDirection: "row", flex: 1 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center",
  },
  userName: { fontSize: 15, fontWeight: "900", color: COLORS.text },
  time: { marginTop: 3, color: COLORS.muted, fontWeight: "600", fontSize: 12 },
  commentText: {
    marginTop: 12, color: COLORS.text,
    fontSize: 15, lineHeight: 24,
  },
  actionsRow: {
    marginTop: 14, flexDirection: "row",
    alignItems: "center", flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row", alignItems: "center", marginRight: 20,
  },
  actionText: {
    marginLeft: 5, color: COLORS.primary,
    fontWeight: "800", fontSize: 13,
  },
  replyText: {
    marginLeft: 5, color: COLORS.muted,
    fontWeight: "700", fontSize: 13,
  },
  pinBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#EAFBF6",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  pinText: { marginLeft: 4, color: COLORS.green, fontWeight: "800", fontSize: 12 },
  viewReply: {
    color: COLORS.green, fontWeight: "900",
    marginLeft: 10, fontSize: 13,
  },

  // Empty state
  emptyState: {
    alignItems: "center", marginTop: 60, paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16, fontSize: 18,
    fontWeight: "900", color: COLORS.text,
  },
  emptySubText: {
    marginTop: 8, fontSize: 14,
    color: COLORS.muted, textAlign: "center", lineHeight: 22,
  },

  // Bottom input
  bottomBox: {
    position: "absolute", left: 16, right: 16, bottom: 88,
    height: 62, borderRadius: 31, backgroundColor: COLORS.white,
    flexDirection: "row", alignItems: "center", paddingHorizontal: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  input: { flex: 1, fontSize: 15, color: COLORS.text },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center",
  },
});
