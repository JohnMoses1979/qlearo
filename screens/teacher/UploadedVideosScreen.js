

// // // // // screens/teacher/UploadedVideosScreen.js
// // // // // FULLY UPDATED
// // // // // PROFESSIONAL UI
// // // // // BACK BUTTON FIXED
// // // // // TeacherBottomNavigation ADDED

// // // // import React, { useState } from "react";
// // // // import {
// // // //   View, Text, StyleSheet, SafeAreaView,
// // // //   TouchableOpacity, ScrollView, StatusBar, Alert,
// // // // } from "react-native";
// // // // import { Ionicons } from "@expo/vector-icons";
// // // // import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

// // // // const COLORS = {
// // // //   primary: "#008F7A",
// // // //   white: "#FFFFFF",
// // // //   bg: "#F5F7FB",
// // // //   text: "#07123A",
// // // //   muted: "#7A879D",
// // // //   border: "#E8ECF4",
// // // //   green: "#16A34A",
// // // //   red: "#EF4444",
// // // //   blue: "#2563EB",
// // // //   purple: "#7C3AED",
// // // // };

// // // // const ALL_VIDEOS = [
// // // //   {
// // // //     id: "1",
// // // //     title: "Understanding Integers",
// // // //     subject: "Class 6",
// // // //     topic: "Maths",
// // // //     views: "245K",
// // // //     likes: "12.5K",
// // // //     comments: "1.2K",
// // // //     rating: "4.8",
// // // //     time: "2 days ago",
// // // //     duration: "18:45",
// // // //     color: "#006B4E",
// // // //     uploadedAgo: "2 days ago",
// // // //   },
// // // //   {
// // // //     id: "2",
// // // //     title: "Cell Structure & Function",
// // // //     subject: "Class 7",
// // // //     topic: "Science",
// // // //     views: "190K",
// // // //     likes: "9.8K",
// // // //     comments: "980",
// // // //     rating: "4.9",
// // // //     time: "5 days ago",
// // // //     duration: "22:10",
// // // //     color: "#1976F3",
// // // //     uploadedAgo: "5 days ago",
// // // //   },
// // // //   {
// // // //     id: "3",
// // // //     title: "Linear Equations",
// // // //     subject: "Class 8",
// // // //     topic: "Maths",
// // // //     views: "150K",
// // // //     likes: "7.7K",
// // // //     comments: "770",
// // // //     rating: "4.7",
// // // //     time: "1 week ago",
// // // //     duration: "15:30",
// // // //     color: "#6D42E0",
// // // //     uploadedAgo: "1 week ago",
// // // //   },
// // // //   {
// // // //     id: "4",
// // // //     title: "The Earth & Its Movements",
// // // //     subject: "Class 6",
// // // //     topic: "Science",
// // // //     views: "110K",
// // // //     likes: "6.2K",
// // // //     comments: "620",
// // // //     rating: "4.6",
// // // //     time: "1 week ago",
// // // //     duration: "20:15",
// // // //     color: "#001F54",
// // // //     uploadedAgo: "1 week ago",
// // // //   },
// // // //   {
// // // //     id: "5",
// // // //     title: "Chemical Reactions",
// // // //     subject: "Class 9",
// // // //     topic: "Science",
// // // //     views: "98K",
// // // //     likes: "5.1K",
// // // //     comments: "512",
// // // //     rating: "4.6",
// // // //     time: "2 weeks ago",
// // // //     duration: "16:40",
// // // //     color: "#021B33",
// // // //     uploadedAgo: "2 weeks ago",
// // // //   },
// // // //   {
// // // //     id: "6",
// // // //     title: "The Rise of Civilization",
// // // //     subject: "Class 10",
// // // //     topic: "History",
// // // //     views: "85K",
// // // //     likes: "4.3K",
// // // //     comments: "430",
// // // //     rating: "4.5",
// // // //     time: "2 weeks ago",
// // // //     duration: "19:05",
// // // //     color: "#7A3E00",
// // // //     uploadedAgo: "2 weeks ago",
// // // //   },
// // // // ];

// // // // export default function UploadedVideosScreen({ navigation }) {
// // // //   const [activeTab, setActiveTab] = useState("All");
// // // //   const [videos, setVideos] = useState(ALL_VIDEOS);

// // // //   const handleDelete = (id) => {
// // // //     global.showAlert(
// // // //       "Delete Video",
// // // //       "Are you sure you want to delete this video?",
// // // //       [
// // // //         { text: "Cancel", style: "cancel" },
// // // //         {
// // // //           text: "Delete", style: "destructive",
// // // //           onPress: () => setVideos(prev => prev.filter(v => v.id !== id)),
// // // //         },
// // // //       ]
// // // //     );
// // // //   };

// // // //   return (
// // // //     <SafeAreaView style={styles.container}>
// // // //       <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

// // // //       {/* HEADER */}
// // // //       <View style={styles.header}>
// // // //         <TouchableOpacity
// // // //           onPress={() => navigation.goBack()}
// // // //           style={styles.backBtn}
// // // //         >
// // // //           <Ionicons name="arrow-back" size={28} color={COLORS.text} />
// // // //         </TouchableOpacity>

// // // //         <View style={{ alignItems: "center" }}>
// // // //           <Text style={styles.heading}>Uploaded Videos</Text>
// // // //           <Text style={styles.subHeading}>Manage all your uploaded videos</Text>
// // // //         </View>

// // // //         <View style={styles.rightRow}>
// // // //           <TouchableOpacity>
// // // //             <Ionicons name="search-outline" size={26} color={COLORS.text} />
// // // //           </TouchableOpacity>
// // // //           <TouchableOpacity style={{ marginLeft: 18 }}>
// // // //             <Ionicons name="notifications-outline" size={26} color={COLORS.text} />
// // // //             <View style={styles.notificationDot} />
// // // //           </TouchableOpacity>
// // // //         </View>
// // // //       </View>

// // // //       {/* TABS */}
// // // //       <View style={styles.tabsRow}>
// // // //         {["All", "Published", "Unlisted", "Drafts"].map(tab => (
// // // //           <TouchableOpacity
// // // //             key={tab}
// // // //             style={[
// // // //               styles.tabBtn,
// // // //               activeTab === tab && { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
// // // //             ]}
// // // //             onPress={() => setActiveTab(tab)}
// // // //           >
// // // //             <Text style={[styles.tabText, activeTab === tab && { color: COLORS.primary }]}>
// // // //               {tab}
// // // //             </Text>
// // // //           </TouchableOpacity>
// // // //         ))}
// // // //       </View>

// // // //       <ScrollView
// // // //         showsVerticalScrollIndicator={false}
// // // //         contentContainerStyle={{ paddingBottom: 110 }}
// // // //       >
// // // //         {/* STATS */}
// // // //         <View style={styles.statsCard}>
// // // //           <View style={styles.statBox}>
// // // //             <View style={[styles.statIcon, { backgroundColor: "#E9FFF6" }]}>
// // // //               <Ionicons name="play" size={22} color={COLORS.primary} />
// // // //             </View>
// // // //             <Text style={styles.statNo}>128</Text>
// // // //             <Text style={styles.statLabel}>Total Videos</Text>
// // // //           </View>

// // // //           <View style={styles.divider} />

// // // //           <View style={styles.statBox}>
// // // //             <View style={[styles.statIcon, { backgroundColor: "#EEF4FF" }]}>
// // // //               <Ionicons name="eye" size={22} color={COLORS.blue} />
// // // //             </View>
// // // //             <Text style={styles.statNo}>1.2M</Text>
// // // //             <Text style={styles.statLabel}>Total Views</Text>
// // // //           </View>

// // // //           <View style={styles.divider} />

// // // //           <View style={styles.statBox}>
// // // //             <View style={[styles.statIcon, { backgroundColor: "#F3FFF0" }]}>
// // // //               <Ionicons name="thumbs-up" size={22} color={COLORS.green} />
// // // //             </View>
// // // //             <Text style={styles.statNo}>48.5K</Text>
// // // //             <Text style={styles.statLabel}>Total Likes</Text>
// // // //           </View>
// // // //         </View>

// // // //         {/* VIDEOS LIST */}
// // // //         {videos.map(video => (
// // // //           <TouchableOpacity
// // // //             key={video.id}
// // // //             style={styles.videoCard}
// // // //             activeOpacity={0.92}
// // // //             onPress={() => navigation.navigate("UploadVideoPlayerScreen", { video })}
// // // //           >
// // // //             {/* THUMB */}
// // // //             <View style={[styles.thumbnail, { backgroundColor: video.color }]}>
// // // //               <View style={styles.playBtn}>
// // // //                 <Ionicons name="play" size={26} color="#FFFFFF" />
// // // //               </View>
// // // //               <View style={styles.durationBadge}>
// // // //                 <Text style={styles.durationText}>{video.duration}</Text>
// // // //               </View>
// // // //             </View>

// // // //             {/* DETAILS */}
// // // //             <View style={{ flex: 1, marginLeft: 14 }}>
// // // //               <Text numberOfLines={2} style={styles.videoTitle}>{video.title}</Text>
// // // //               <Text style={styles.videoSub}>{video.subject} • {video.topic}</Text>
// // // //               <Text style={styles.publish}>Published • {video.time}</Text>

// // // //               <View style={styles.metaRow}>
// // // //                 <View style={styles.metaItem}>
// // // //                   <Ionicons name="eye-outline" size={16} color={COLORS.muted} />
// // // //                   <Text style={styles.metaText}>{video.views}</Text>
// // // //                 </View>
// // // //                 <View style={styles.metaItem}>
// // // //                   <Ionicons name="thumbs-up-outline" size={16} color={COLORS.muted} />
// // // //                   <Text style={styles.metaText}>{video.likes}</Text>
// // // //                 </View>
// // // //                 <View style={styles.metaItem}>
// // // //                   <Ionicons name="chatbubble-outline" size={16} color={COLORS.muted} />
// // // //                   <Text style={styles.metaText}>{video.comments}</Text>
// // // //                 </View>
// // // //                 <View style={styles.metaItem}>
// // // //                   <Ionicons name="star" size={16} color="#FFB800" />
// // // //                   <Text style={styles.metaText}>{video.rating}</Text>
// // // //                 </View>
// // // //               </View>
// // // //             </View>

// // // //             {/* ACTIONS */}
// // // //             <View style={{ alignItems: "center" }}>
// // // //               <TouchableOpacity>
// // // //                 <Ionicons name="ellipsis-vertical" size={18} color={COLORS.text} />
// // // //               </TouchableOpacity>
// // // //               <TouchableOpacity style={styles.editBtn}>
// // // //                 <Ionicons name="create-outline" size={20} color={COLORS.primary} />
// // // //               </TouchableOpacity>
// // // //               <TouchableOpacity
// // // //                 style={styles.deleteBtn}
// // // //                 onPress={() => handleDelete(video.id)}
// // // //               >
// // // //                 <Ionicons name="trash-outline" size={20} color={COLORS.red} />
// // // //               </TouchableOpacity>
// // // //             </View>
// // // //           </TouchableOpacity>
// // // //         ))}
// // // //       </ScrollView>

// // // //       {/* UPLOAD BUTTON */}
// // // //       <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.9}>
// // // //         <Ionicons name="add" size={28} color="#FFFFFF" />
// // // //         <Text style={styles.uploadText}>Upload New Video</Text>
// // // //       </TouchableOpacity>

// // // //       <TeacherBottomNavigation navigation={navigation} active="" />
// // // //     </SafeAreaView>
// // // //   );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //   container: { flex: 1, backgroundColor: COLORS.bg },
// // // //   header: {
// // // //     paddingHorizontal: 18, paddingTop: 12,
// // // //     flexDirection: "row", justifyContent: "space-between", alignItems: "center",
// // // //   },
// // // //   backBtn: {
// // // //     width: 42, height: 42, borderRadius: 14,
// // // //     backgroundColor: COLORS.white, justifyContent: "center",
// // // //     alignItems: "center", borderWidth: 1, borderColor: COLORS.border,
// // // //   },
// // // //   heading: { fontSize: 22, fontWeight: "900", color: COLORS.text },
// // // //   subHeading: { marginTop: 4, color: COLORS.muted, fontSize: 12, fontWeight: "600" },
// // // //   rightRow: { flexDirection: "row", alignItems: "center" },
// // // //   notificationDot: {
// // // //     width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF3B30",
// // // //     position: "absolute", top: 1, right: -2,
// // // //   },
// // // //   tabsRow: {
// // // //     flexDirection: "row", justifyContent: "space-around",
// // // //     marginTop: 20, backgroundColor: COLORS.white, paddingVertical: 12,
// // // //   },
// // // //   tabBtn: { paddingBottom: 12 },
// // // //   tabText: { color: COLORS.muted, fontWeight: "800", fontSize: 15 },
// // // //   statsCard: {
// // // //     backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 24,
// // // //     marginTop: 18, paddingVertical: 24,
// // // //     flexDirection: "row", justifyContent: "space-around", alignItems: "center",
// // // //   },
// // // //   statBox: { alignItems: "center" },
// // // //   statIcon: { width: 54, height: 54, borderRadius: 18, justifyContent: "center", alignItems: "center" },
// // // //   statNo: { marginTop: 12, fontSize: 26, fontWeight: "900", color: COLORS.text },
// // // //   statLabel: { marginTop: 4, color: COLORS.muted, fontWeight: "700", fontSize: 12 },
// // // //   divider: { width: 1, height: 80, backgroundColor: COLORS.border },
// // // //   videoCard: {
// // // //     backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 18,
// // // //     borderRadius: 24, padding: 14, flexDirection: "row",
// // // //   },
// // // //   thumbnail: { width: 130, height: 90, borderRadius: 18, justifyContent: "center", alignItems: "center" },
// // // //   playBtn: {
// // // //     width: 54, height: 54, borderRadius: 27,
// // // //     backgroundColor: "rgba(255,255,255,0.25)",
// // // //     justifyContent: "center", alignItems: "center",
// // // //   },
// // // //   durationBadge: {
// // // //     position: "absolute", bottom: 8, right: 8,
// // // //     backgroundColor: "rgba(0,0,0,0.85)",
// // // //     paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
// // // //   },
// // // //   durationText: { color: "#FFFFFF", fontWeight: "900", fontSize: 10 },
// // // //   videoTitle: { fontSize: 17, fontWeight: "900", color: COLORS.text },
// // // //   videoSub: { marginTop: 5, color: COLORS.primary, fontWeight: "800" },
// // // //   publish: { marginTop: 6, color: COLORS.muted, fontWeight: "600", fontSize: 12 },
// // // //   metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
// // // //   metaItem: { flexDirection: "row", alignItems: "center", marginRight: 14 },
// // // //   metaText: { marginLeft: 4, color: COLORS.muted, fontWeight: "700", fontSize: 12 },
// // // //   editBtn: {
// // // //     marginTop: 18, width: 40, height: 40, borderRadius: 12,
// // // //     backgroundColor: "#E9FFF6", justifyContent: "center", alignItems: "center",
// // // //   },
// // // //   deleteBtn: {
// // // //     marginTop: 10, width: 40, height: 40, borderRadius: 12,
// // // //     backgroundColor: "#FFF1F2", justifyContent: "center", alignItems: "center",
// // // //   },
// // // //   uploadBtn: {
// // // //     position: "absolute", bottom: 90, left: 22, right: 22,
// // // //     height: 64, borderRadius: 22, backgroundColor: COLORS.primary,
// // // //     flexDirection: "row", justifyContent: "center", alignItems: "center", elevation: 8,
// // // //   },
// // // //   uploadText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginLeft: 10 },
// // // // });


























































// // // // // screens/teacher/UploadedVideosScreen.js
// // // // // FULLY UPDATED
// // // // // "Upload New Video" button navigates to UploadVideoScreen
// // // // // BACK BUTTON FIXED
// // // // // TeacherBottomNavigation ADDED

// // // // import React, { useState } from "react";
// // // // import {
// // // //   View, Text, StyleSheet, SafeAreaView,
// // // //   TouchableOpacity, ScrollView, StatusBar, Alert,
// // // // } from "react-native";
// // // // import { Ionicons } from "@expo/vector-icons";
// // // // import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

// // // // const COLORS = {
// // // //   primary: "#008F7A",
// // // //   white: "#FFFFFF",
// // // //   bg: "#F5F7FB",
// // // //   text: "#07123A",
// // // //   muted: "#7A879D",
// // // //   border: "#E8ECF4",
// // // //   green: "#16A34A",
// // // //   red: "#EF4444",
// // // //   blue: "#2563EB",
// // // //   purple: "#7C3AED",
// // // // };

// // // // const ALL_VIDEOS = [
// // // //   {
// // // //     id: "1",
// // // //     title: "Understanding Integers",
// // // //     subject: "Class 6",
// // // //     topic: "Maths",
// // // //     views: "245K",
// // // //     likes: "12.5K",
// // // //     comments: "1.2K",
// // // //     rating: "4.8",
// // // //     time: "2 days ago",
// // // //     duration: "18:45",
// // // //     color: "#006B4E",
// // // //   },
// // // //   {
// // // //     id: "2",
// // // //     title: "Cell Structure & Function",
// // // //     subject: "Class 7",
// // // //     topic: "Science",
// // // //     views: "190K",
// // // //     likes: "9.8K",
// // // //     comments: "980",
// // // //     rating: "4.9",
// // // //     time: "5 days ago",
// // // //     duration: "22:10",
// // // //     color: "#1976F3",
// // // //   },
// // // //   // add other videos here...
// // // // ];

// // // // export default function UploadedVideosScreen({ navigation }) {
// // // //   const [activeTab, setActiveTab] = useState("All");
// // // //   const [videos, setVideos] = useState(ALL_VIDEOS);

// // // //   const handleDelete = (id) => {
// // // //     global.showAlert(
// // // //       "Delete Video",
// // // //       "Are you sure you want to delete this video?",
// // // //       [
// // // //         { text: "Cancel", style: "cancel" },
// // // //         {
// // // //           text: "Delete",
// // // //           style: "destructive",
// // // //           onPress: () => setVideos(prev => prev.filter(v => v.id !== id)),
// // // //         },
// // // //       ]
// // // //     );
// // // //   };

// // // //   return (
// // // //     <SafeAreaView style={styles.container}>
// // // //       <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

// // // //       {/* HEADER */}
// // // //       <View style={styles.header}>
// // // //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
// // // //           <Ionicons name="arrow-back" size={28} color={COLORS.text} />
// // // //         </TouchableOpacity>

// // // //         <View style={{ alignItems: "center" }}>
// // // //           <Text style={styles.heading}>Uploaded Videos</Text>
// // // //           <Text style={styles.subHeading}>Manage all your uploaded videos</Text>
// // // //         </View>

// // // //         <View style={styles.rightRow}>
// // // //           <TouchableOpacity>
// // // //             <Ionicons name="search-outline" size={26} color={COLORS.text} />
// // // //           </TouchableOpacity>
// // // //           <TouchableOpacity style={{ marginLeft: 18 }}>
// // // //             <Ionicons name="notifications-outline" size={26} color={COLORS.text} />
// // // //             <View style={styles.notificationDot} />
// // // //           </TouchableOpacity>
// // // //         </View>
// // // //       </View>

// // // //       {/* TABS */}
// // // //       <View style={styles.tabsRow}>
// // // //         {["All", "Published", "Unlisted", "Drafts"].map(tab => (
// // // //           <TouchableOpacity
// // // //             key={tab}
// // // //             style={[
// // // //               styles.tabBtn,
// // // //               activeTab === tab && { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
// // // //             ]}
// // // //             onPress={() => setActiveTab(tab)}
// // // //           >
// // // //             <Text style={[styles.tabText, activeTab === tab && { color: COLORS.primary }]}>
// // // //               {tab}
// // // //             </Text>
// // // //           </TouchableOpacity>
// // // //         ))}
// // // //       </View>

// // // //       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
// // // //         {/* VIDEOS LIST */}
// // // //         {videos.map(video => (
// // // //           <TouchableOpacity
// // // //             key={video.id}
// // // //             style={styles.videoCard}
// // // //             activeOpacity={0.92}
// // // //             onPress={() => navigation.navigate("UploadVideoPlayerScreen", { video })}
// // // //           >
// // // //             <View style={[styles.thumbnail, { backgroundColor: video.color }]}>
// // // //               <View style={styles.playBtn}>
// // // //                 <Ionicons name="play" size={26} color="#FFFFFF" />
// // // //               </View>
// // // //               <View style={styles.durationBadge}>
// // // //                 <Text style={styles.durationText}>{video.duration}</Text>
// // // //               </View>
// // // //             </View>

// // // //             <View style={{ flex: 1, marginLeft: 14 }}>
// // // //               <Text numberOfLines={2} style={styles.videoTitle}>{video.title}</Text>
// // // //               <Text style={styles.videoSub}>{video.subject} • {video.topic}</Text>
// // // //               <Text style={styles.publish}>Published • {video.time}</Text>
// // // //             </View>

// // // //             <View style={{ alignItems: "center" }}>
// // // //               <TouchableOpacity style={styles.editBtn}>
// // // //                 <Ionicons name="create-outline" size={20} color={COLORS.primary} />
// // // //               </TouchableOpacity>
// // // //               <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(video.id)}>
// // // //                 <Ionicons name="trash-outline" size={20} color={COLORS.red} />
// // // //               </TouchableOpacity>
// // // //             </View>
// // // //           </TouchableOpacity>
// // // //         ))}
// // // //       </ScrollView>

// // // //       {/* UPLOAD BUTTON FIXED NAVIGATION */}
// // // //       <TouchableOpacity
// // // //         style={styles.uploadBtn}
// // // //         activeOpacity={0.9}
// // // //         onPress={() => navigation.navigate("UploadVideoScreen")}
// // // //       >
// // // //         <Ionicons name="add" size={28} color="#FFFFFF" />
// // // //         <Text style={styles.uploadText}>Upload New Video</Text>
// // // //       </TouchableOpacity>

// // // //       <TeacherBottomNavigation navigation={navigation} active="Videos" />
// // // //     </SafeAreaView>
// // // //   );
// // // // }

// // // // // STYLES (unchanged)
// // // // const styles = StyleSheet.create({
// // // //   container: { flex: 1, backgroundColor: COLORS.bg },
// // // //   header: { paddingHorizontal: 18, paddingTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
// // // //   backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.white, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
// // // //   heading: { fontSize: 22, fontWeight: "900", color: COLORS.text },
// // // //   subHeading: { marginTop: 4, color: COLORS.muted, fontSize: 12, fontWeight: "600" },
// // // //   rightRow: { flexDirection: "row", alignItems: "center" },
// // // //   notificationDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF3B30", position: "absolute", top: 1, right: -2 },
// // // //   tabsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 20, backgroundColor: COLORS.white, paddingVertical: 12 },
// // // //   tabBtn: { paddingBottom: 12 },
// // // //   tabText: { color: COLORS.muted, fontWeight: "800", fontSize: 15 },
// // // //   videoCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 18, borderRadius: 24, padding: 14, flexDirection: "row" },
// // // //   thumbnail: { width: 130, height: 90, borderRadius: 18, justifyContent: "center", alignItems: "center" },
// // // //   playBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
// // // //   durationBadge: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.85)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
// // // //   durationText: { color: "#FFFFFF", fontWeight: "900", fontSize: 10 },
// // // //   videoTitle: { fontSize: 17, fontWeight: "900", color: COLORS.text },
// // // //   videoSub: { marginTop: 5, color: COLORS.primary, fontWeight: "800" },
// // // //   publish: { marginTop: 6, color: COLORS.muted, fontWeight: "600", fontSize: 12 },
// // // //   metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
// // // //   metaItem: { flexDirection: "row", alignItems: "center", marginRight: 14 },
// // // //   metaText: { marginLeft: 4, color: COLORS.muted, fontWeight: "700", fontSize: 12 },
// // // //   editBtn: { marginTop: 18, width: 40, height: 40, borderRadius: 12, backgroundColor: "#E9FFF6", justifyContent: "center", alignItems: "center" },
// // // //   deleteBtn: { marginTop: 10, width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFF1F2", justifyContent: "center", alignItems: "center" },
// // // //   uploadBtn: { position: "absolute", bottom: 90, left: 22, right: 22, height: 64, borderRadius: 22, backgroundColor: COLORS.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", elevation: 8 },
// // // //   uploadText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginLeft: 10 },
// // // // });














































// // // // // screens/teacher/UploadedVideosScreen.js
// // // // import React, { useState } from "react";
// // // // import {
// // // //   View, Text, StyleSheet, SafeAreaView,
// // // //   TouchableOpacity, ScrollView, StatusBar, Alert,
// // // // } from "react-native";
// // // // import { Ionicons } from "@expo/vector-icons";
// // // // import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

// // // // const COLORS = {
// // // //   primary: "#008F7A",
// // // //   white: "#FFFFFF",
// // // //   bg: "#F5F7FB",
// // // //   text: "#07123A",
// // // //   muted: "#7A879D",
// // // //   border: "#E8ECF4",
// // // //   green: "#16A34A",
// // // //   red: "#EF4444",
// // // // };

// // // // const ALL_VIDEOS = [
// // // //   {
// // // //     id: "1",
// // // //     title: "Understanding Integers",
// // // //     subject: "Class 6",
// // // //     topic: "Maths",
// // // //     views: "245K",
// // // //     likes: "12.5K",
// // // //     comments: "1.2K",
// // // //     rating: "4.8",
// // // //     time: "2 days ago",
// // // //     duration: "18:45",
// // // //     color: "#006B4E",
// // // //   },
// // // //   {
// // // //     id: "2",
// // // //     title: "Cell Structure & Function",
// // // //     subject: "Class 7",
// // // //     topic: "Science",
// // // //     views: "190K",
// // // //     likes: "9.8K",
// // // //     comments: "980",
// // // //     rating: "4.9",
// // // //     time: "5 days ago",
// // // //     duration: "22:10",
// // // //     color: "#1976F3",
// // // //   },
// // // // ];

// // // // export default function UploadedVideosScreen({ navigation }) {
// // // //   const [activeTab, setActiveTab] = useState("All");
// // // //   const [videos, setVideos] = useState(ALL_VIDEOS);

// // // //   const handleDelete = (id) => {
// // // //     global.showAlert(
// // // //       "Delete Video",
// // // //       "Are you sure you want to delete this video?",
// // // //       [
// // // //         { text: "Cancel", style: "cancel" },
// // // //         { text: "Delete", style: "destructive", onPress: () => setVideos(prev => prev.filter(v => v.id !== id)) },
// // // //       ]
// // // //     );
// // // //   };

// // // //   return (
// // // //     <SafeAreaView style={styles.container}>
// // // //       <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

// // // //       {/* HEADER */}
// // // //       <View style={styles.header}>
// // // //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
// // // //           <Ionicons name="arrow-back" size={28} color={COLORS.text} />
// // // //         </TouchableOpacity>

// // // //         <View style={{ alignItems: "center" }}>
// // // //           <Text style={styles.heading}>Uploaded Videos</Text>
// // // //           <Text style={styles.subHeading}>Manage all your uploaded videos</Text>
// // // //         </View>

// // // //         <View style={styles.rightRow}>
// // // //           <TouchableOpacity>
// // // //             <Ionicons name="search-outline" size={26} color={COLORS.text} />
// // // //           </TouchableOpacity>
// // // //           <TouchableOpacity style={{ marginLeft: 18 }}>
// // // //             <Ionicons name="notifications-outline" size={26} color={COLORS.text} />
// // // //             <View style={styles.notificationDot} />
// // // //           </TouchableOpacity>
// // // //         </View>
// // // //       </View>

// // // //       {/* TABS */}
// // // //       <View style={styles.tabsRow}>
// // // //         {["All", "Published", "Unlisted", "Drafts"].map(tab => (
// // // //           <TouchableOpacity
// // // //             key={tab}
// // // //             style={[styles.tabBtn, activeTab === tab && { borderBottomWidth: 3, borderBottomColor: COLORS.primary }]}
// // // //             onPress={() => setActiveTab(tab)}
// // // //           >
// // // //             <Text style={[styles.tabText, activeTab === tab && { color: COLORS.primary }]}>{tab}</Text>
// // // //           </TouchableOpacity>
// // // //         ))}
// // // //       </View>

// // // //       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
// // // //         {/* VIDEOS LIST */}
// // // //         {videos.map(video => (
// // // //           <TouchableOpacity
// // // //             key={video.id}
// // // //             style={styles.videoCard}
// // // //             activeOpacity={0.92}
// // // //             onPress={() => navigation.navigate("UploadVideoPlayerScreen", { video })}
// // // //           >
// // // //             <View style={[styles.thumbnail, { backgroundColor: video.color }]}>
// // // //               <View style={styles.playBtn}>
// // // //                 <Ionicons name="play" size={26} color="#FFFFFF" />
// // // //               </View>
// // // //               <View style={styles.durationBadge}>
// // // //                 <Text style={styles.durationText}>{video.duration}</Text>
// // // //               </View>
// // // //             </View>

// // // //             <View style={{ flex: 1, marginLeft: 14 }}>
// // // //               <Text numberOfLines={2} style={styles.videoTitle}>{video.title}</Text>
// // // //               <Text style={styles.videoSub}>{video.subject} • {video.topic}</Text>
// // // //               <Text style={styles.publish}>Published • {video.time}</Text>
// // // //             </View>

// // // //             <View style={{ alignItems: "center" }}>
// // // //               {/* EDIT BUTTON FIXED */}
// // // //               <TouchableOpacity
// // // //                 style={styles.editBtn}
// // // //                 onPress={() => navigation.navigate("EditVideoScreen", { video })}
// // // //               >
// // // //                 <Ionicons name="create-outline" size={20} color={COLORS.primary} />
// // // //               </TouchableOpacity>
// // // //               <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(video.id)}>
// // // //                 <Ionicons name="trash-outline" size={20} color={COLORS.red} />
// // // //               </TouchableOpacity>
// // // //             </View>
// // // //           </TouchableOpacity>
// // // //         ))}
// // // //       </ScrollView>

// // // //       {/* UPLOAD NEW VIDEO */}
// // // //       <TouchableOpacity
// // // //         style={styles.uploadBtn}
// // // //         activeOpacity={0.9}
// // // //         onPress={() => navigation.navigate("UploadVideoScreen")}
// // // //       >
// // // //         <Ionicons name="add" size={28} color="#FFFFFF" />
// // // //         <Text style={styles.uploadText}>Upload New Video</Text>
// // // //       </TouchableOpacity>

// // // //       <TeacherBottomNavigation navigation={navigation} active="Videos" />
// // // //     </SafeAreaView>
// // // //   );
// // // // }

// // // // // STYLES (unchanged)
// // // // const styles = StyleSheet.create({
// // // //   container: { flex: 1, backgroundColor: COLORS.bg },
// // // //   header: { paddingHorizontal: 18, paddingTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
// // // //   backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.white, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
// // // //   heading: { fontSize: 22, fontWeight: "900", color: COLORS.text },
// // // //   subHeading: { marginTop: 4, color: COLORS.muted, fontSize: 12, fontWeight: "600" },
// // // //   rightRow: { flexDirection: "row", alignItems: "center" },
// // // //   notificationDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF3B30", position: "absolute", top: 1, right: -2 },
// // // //   tabsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 20, backgroundColor: COLORS.white, paddingVertical: 12 },
// // // //   tabBtn: { paddingBottom: 12 },
// // // //   tabText: { color: COLORS.muted, fontWeight: "800", fontSize: 15 },
// // // //   videoCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 18, borderRadius: 24, padding: 14, flexDirection: "row" },
// // // //   thumbnail: { width: 130, height: 90, borderRadius: 18, justifyContent: "center", alignItems: "center" },
// // // //   playBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
// // // //   durationBadge: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.85)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
// // // //   durationText: { color: "#FFFFFF", fontWeight: "900", fontSize: 10 },
// // // //   videoTitle: { fontSize: 17, fontWeight: "900", color: COLORS.text },
// // // //   videoSub: { marginTop: 5, color: COLORS.primary, fontWeight: "800" },
// // // //   publish: { marginTop: 6, color: COLORS.muted, fontWeight: "600", fontSize: 12 },
// // // //   editBtn: { marginTop: 18, width: 40, height: 40, borderRadius: 12, backgroundColor: "#E9FFF6", justifyContent: "center", alignItems: "center" },
// // // //   deleteBtn: { marginTop: 10, width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFF1F2", justifyContent: "center", alignItems: "center" },
// // // //   uploadBtn: { position: "absolute", bottom: 90, left: 22, right: 22, height: 64, borderRadius: 22, backgroundColor: COLORS.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", elevation: 8 },
// // // //   uploadText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginLeft: 10 },
// // // // });











































// // // // UploadedVideosScreen.js
// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View, Text, StyleSheet, SafeAreaView,
// // //   TouchableOpacity, ScrollView, StatusBar, Alert,
// // // } from "react-native";
// // // import { Ionicons } from "@expo/vector-icons";
// // // import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
// // // import { useAppContext } from "../../context/AppContext";

// // // const COLORS = {
// // //   primary: "#008F7A",
// // //   white: "#FFFFFF",
// // //   bg: "#F5F7FB",
// // //   text: "#07123A",
// // //   muted: "#7A879D",
// // //   border: "#E8ECF4",
// // //   green: "#16A34A",
// // //   red: "#EF4444",
// // // };

// // // export default function UploadedVideosScreen({ navigation }) {
// // //   const { uploadedVideos, addUploadedVideo } = useAppContext(); // Real-time videos
// // //   const [activeTab, setActiveTab] = useState("All");
// // //   const [videos, setVideos] = useState([]);

// // //   // Sync local state with context
// // //   useEffect(() => {
// // //     setVideos(uploadedVideos);
// // //   }, [uploadedVideos]);

// // //   // DELETE VIDEO
// // //   const handleDelete = (id) => {
// // //     global.showAlert(
// // //       "Delete Video",
// // //       "Are you sure you want to delete this video?",
// // //       [
// // //         { text: "Cancel", style: "cancel" },
// // //         {
// // //           text: "Delete",
// // //           style: "destructive",
// // //           onPress: () => {
// // //             setVideos(prev => prev.filter(v => v.id !== id));
// // //             // Optional: remove from context if needed
// // //             // addUploadedVideo(prev => prev.filter(v => v.id !== id));
// // //           }
// // //         },
// // //       ]
// // //     );
// // //   };

// // //   return (
// // //     <SafeAreaView style={styles.container}>
// // //       <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

// // //       {/* HEADER */}
// // //       <View style={styles.header}>
// // //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
// // //           <Ionicons name="arrow-back" size={28} color={COLORS.text} />
// // //         </TouchableOpacity>

// // //         <View style={{ alignItems: "center" }}>
// // //           <Text style={styles.heading}>Uploaded Videos</Text>
// // //           <Text style={styles.subHeading}>Manage all your uploaded videos</Text>
// // //         </View>

// // //         <View style={styles.rightRow}>
// // //           <TouchableOpacity>
// // //             <Ionicons name="search-outline" size={26} color={COLORS.text} />
// // //           </TouchableOpacity>
// // //           <TouchableOpacity style={{ marginLeft: 18 }}>
// // //             <Ionicons name="notifications-outline" size={26} color={COLORS.text} />
// // //             <View style={styles.notificationDot} />
// // //           </TouchableOpacity>
// // //         </View>
// // //       </View>

// // //       {/* TABS */}
// // //       <View style={styles.tabsRow}>
// // //         {["All", "Published", "Unlisted", "Drafts"].map(tab => (
// // //           <TouchableOpacity
// // //             key={tab}
// // //             style={[styles.tabBtn, activeTab === tab && { borderBottomWidth: 3, borderBottomColor: COLORS.primary }]}
// // //             onPress={() => setActiveTab(tab)}
// // //           >
// // //             <Text style={[styles.tabText, activeTab === tab && { color: COLORS.primary }]}>{tab}</Text>
// // //           </TouchableOpacity>
// // //         ))}
// // //       </View>

// // //       {/* VIDEO LIST */}
// // //       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
// // //         {videos.map(video => (
// // //           <TouchableOpacity
// // //             key={video.id}
// // //             style={styles.videoCard}
// // //             activeOpacity={0.92}
// // //             onPress={() => navigation.navigate("UploadVideoPlayerScreen", { video })}
// // //           >
// // //             <View style={[styles.thumbnail, { backgroundColor: video.color || COLORS.primary }]}>
// // //               <View style={styles.playBtn}>
// // //                 <Ionicons name="play" size={26} color="#FFFFFF" />
// // //               </View>
// // //               <View style={styles.durationBadge}>
// // //                 <Text style={styles.durationText}>{video.duration}</Text>
// // //               </View>
// // //             </View>

// // //             <View style={{ flex: 1, marginLeft: 14 }}>
// // //               <Text numberOfLines={2} style={styles.videoTitle}>{video.title}</Text>
// // //               <Text style={styles.videoSub}>{video.subject} • {video.topic}</Text>
// // //               <Text style={styles.publish}>Published • {video.time}</Text>
// // //             </View>

// // //             <View style={{ alignItems: "center" }}>
// // //               {/* EDIT BUTTON */}
// // //               <TouchableOpacity
// // //                 style={styles.editBtn}
// // //                 onPress={() => navigation.navigate("EditVideoScreen", { video })}
// // //               >
// // //                 <Ionicons name="create-outline" size={20} color={COLORS.primary} />
// // //               </TouchableOpacity>
// // //               {/* DELETE BUTTON */}
// // //               <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(video.id)}>
// // //                 <Ionicons name="trash-outline" size={20} color={COLORS.red} />
// // //               </TouchableOpacity>
// // //             </View>
// // //           </TouchableOpacity>
// // //         ))}
// // //       </ScrollView>

// // //       {/* UPLOAD NEW VIDEO */}
// // //       <TouchableOpacity
// // //         style={styles.uploadBtn}
// // //         activeOpacity={0.9}
// // //         onPress={() => navigation.navigate("UploadVideoScreen")}
// // //       >
// // //         <Ionicons name="add" size={28} color="#FFFFFF" />
// // //         <Text style={styles.uploadText}>Upload New Video</Text>
// // //       </TouchableOpacity>

// // //       {/* BOTTOM NAV */}
// // //       <TeacherBottomNavigation navigation={navigation} active="Videos" />
// // //     </SafeAreaView>
// // //   );
// // // }

// // // // ==========================================
// // // // STYLES
// // // // ==========================================
// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, backgroundColor: COLORS.bg },
// // //   header: { paddingHorizontal: 18, paddingTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
// // //   backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.white, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
// // //   heading: { fontSize: 22, fontWeight: "900", color: COLORS.text },
// // //   subHeading: { marginTop: 4, color: COLORS.muted, fontSize: 12, fontWeight: "600" },
// // //   rightRow: { flexDirection: "row", alignItems: "center" },
// // //   notificationDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF3B30", position: "absolute", top: 1, right: -2 },
// // //   tabsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 20, backgroundColor: COLORS.white, paddingVertical: 12 },
// // //   tabBtn: { paddingBottom: 12 },
// // //   tabText: { color: COLORS.muted, fontWeight: "800", fontSize: 15 },
// // //   videoCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 18, borderRadius: 24, padding: 14, flexDirection: "row" },
// // //   thumbnail: { width: 130, height: 90, borderRadius: 18, justifyContent: "center", alignItems: "center" },
// // //   playBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
// // //   durationBadge: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.85)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
// // //   durationText: { color: "#FFFFFF", fontWeight: "900", fontSize: 10 },
// // //   videoTitle: { fontSize: 17, fontWeight: "900", color: COLORS.text },
// // //   videoSub: { marginTop: 5, color: COLORS.primary, fontWeight: "800" },
// // //   publish: { marginTop: 6, color: COLORS.muted, fontWeight: "600", fontSize: 12 },
// // //   editBtn: { marginTop: 18, width: 40, height: 40, borderRadius: 12, backgroundColor: "#E9FFF6", justifyContent: "center", alignItems: "center" },
// // //   deleteBtn: { marginTop: 10, width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFF1F2", justifyContent: "center", alignItems: "center" },
// // //   uploadBtn: { position: "absolute", bottom: 90, left: 22, right: 22, height: 64, borderRadius: 22, backgroundColor: COLORS.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", elevation: 8 },
// // //   uploadText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginLeft: 10 },
// // // });



































// // // // screens/teacher/UploadedVideosScreen.js
// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   Text,
// // //   StyleSheet,
// // //   SafeAreaView,
// // //   TouchableOpacity,
// // //   ScrollView,
// // //   StatusBar,
// // //   Alert,
// // //   Platform,
// // // } from "react-native";
// // // import { Ionicons } from "@expo/vector-icons";
// // // import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
// // // import { useAppContext } from "../../context/AppContext";

// // // const COLORS = {
// // //   primary: "#008F7A",
// // //   white: "#FFFFFF",
// // //   bg: "#F5F7FB",
// // //   text: "#07123A",
// // //   muted: "#7A879D",
// // //   border: "#E8ECF4",
// // //   green: "#16A34A",
// // //   red: "#EF4444",
// // //   blue: "#2563EB",
// // //   purple: "#7C3AED",
// // // };

// // // const TABS = ["All", "Published", "Unlisted", "Drafts"];

// // // export default function UploadedVideosScreen({ navigation }) {
// // //   const { uploadedVideos, deleteUploadedVideo } = useAppContext();
// // //   const [activeTab, setActiveTab] = useState("All");
// // //   const [videos, setVideos] = useState([]);

// // //   useEffect(() => {
// // //     setVideos(uploadedVideos);
// // //   }, [uploadedVideos]);

// // //   const filteredVideos = () => {
// // //     if (activeTab === "All") return videos;
// // //     if (activeTab === "Published") return videos.filter((_, i) => i % 2 === 0);
// // //     if (activeTab === "Unlisted") return videos.filter((_, i) => i % 3 === 0);
// // //     if (activeTab === "Drafts") return [];
// // //     return videos;
// // //   };

// // //   const handleDelete = (id) => {
// // //     global.showAlert(
// // //       "Delete Video",
// // //       "Are you sure you want to delete this video?",
// // //       [
// // //         { text: "Cancel", style: "cancel" },
// // //         {
// // //           text: "Delete",
// // //           style: "destructive",
// // //           onPress: () => deleteUploadedVideo(id),
// // //         },
// // //       ]
// // //     );
// // //   };

// // //   const handleVideoPress = (video) => {
// // //     navigation.navigate("UploadVideoPlayerScreen", { video });
// // //   };

// // //   const handleUploadNew = () => {
// // //     navigation.navigate("UploadVideoScreen");
// // //   };

// // //   const handleEdit = (video) => {
// // //     navigation.navigate("UploadVideoScreen", { editVideo: video });
// // //   };

// // //   return (
// // //     <SafeAreaView style={styles.container}>
// // //       <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

// // //       {/* HEADER */}
// // //       <View style={styles.header}>
// // //         <TouchableOpacity
// // //           onPress={() => navigation.goBack()}
// // //           style={styles.backBtn}
// // //           activeOpacity={0.7}
// // //         >
// // //           <Ionicons name="arrow-back" size={24} color={COLORS.text} />
// // //         </TouchableOpacity>

// // //         <View style={styles.headerCenter}>
// // //           <Text style={styles.heading}>Uploaded Videos</Text>
// // //           <Text style={styles.subHeading}>Manage all your uploaded videos</Text>
// // //         </View>

// // //         <View style={styles.rightRow}>
// // //           <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
// // //             <Ionicons name="search-outline" size={22} color={COLORS.text} />
// // //           </TouchableOpacity>
// // //           <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} activeOpacity={0.7}>
// // //             <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
// // //           </TouchableOpacity>
// // //         </View>
// // //       </View>

// // //       {/* TABS */}
// // //       <View style={styles.tabsRow}>
// // //         {TABS.map((tab) => (
// // //           <TouchableOpacity
// // //             key={tab}
// // //             style={[
// // //               styles.tabBtn,
// // //               activeTab === tab && styles.activeTabBtn,
// // //             ]}
// // //             onPress={() => setActiveTab(tab)}
// // //             activeOpacity={0.7}
// // //           >
// // //             <Text
// // //               style={[
// // //                 styles.tabText,
// // //                 activeTab === tab && styles.activeTabText,
// // //               ]}
// // //             >
// // //               {tab}
// // //             </Text>
// // //           </TouchableOpacity>
// // //         ))}
// // //       </View>

// // //       <ScrollView
// // //         showsVerticalScrollIndicator={false}
// // //         contentContainerStyle={styles.scrollContent}
// // //       >
// // //         {filteredVideos().length === 0 ? (
// // //           <View style={styles.emptyState}>
// // //             <Ionicons name="videocam-outline" size={64} color={COLORS.muted} />
// // //             <Text style={styles.emptyText}>No videos in this category</Text>
// // //           </View>
// // //         ) : (
// // //           filteredVideos().map((video) => (
// // //             <TouchableOpacity
// // //               key={video.id}
// // //               style={styles.videoCard}
// // //               activeOpacity={0.88}
// // //               onPress={() => handleVideoPress(video)}
// // //             >
// // //               <View style={[styles.thumbnail, { backgroundColor: video.color || COLORS.primary }]}>
// // //                 <View style={styles.playBtnOverlay}>
// // //                   <Ionicons name="play" size={22} color="#FFFFFF" />
// // //                 </View>
// // //                 <View style={styles.durationBadge}>
// // //                   <Text style={styles.durationText}>{video.duration}</Text>
// // //                 </View>
// // //               </View>

// // //               <View style={styles.videoDetails}>
// // //                 <Text numberOfLines={2} style={styles.videoTitle}>
// // //                   {video.title}
// // //                 </Text>
// // //                 <Text style={styles.videoSub}>
// // //                   {video.subject} • {video.topic}
// // //                 </Text>
// // //                 <Text style={styles.publishTime}>
// // //                   Published • {video.uploadedAgo || "Just now"}
// // //                 </Text>

// // //                 <View style={styles.metaRow}>
// // //                   <View style={styles.metaItem}>
// // //                     <Ionicons name="eye-outline" size={14} color={COLORS.muted} />
// // //                     <Text style={styles.metaText}>{video.views}</Text>
// // //                   </View>
// // //                   <View style={styles.metaItem}>
// // //                     <Ionicons name="thumbs-up-outline" size={14} color={COLORS.muted} />
// // //                     <Text style={styles.metaText}>{video.likes}</Text>
// // //                   </View>
// // //                   <View style={styles.metaItem}>
// // //                     <Ionicons name="chatbubble-outline" size={14} color={COLORS.muted} />
// // //                     <Text style={styles.metaText}>{video.comments}</Text>
// // //                   </View>
// // //                   <View style={styles.metaItem}>
// // //                     <Ionicons name="star" size={14} color="#FFB800" />
// // //                     <Text style={styles.metaText}>{video.rating}</Text>
// // //                   </View>
// // //                 </View>
// // //               </View>

// // //               <View style={styles.videoActions}>
// // //                 <TouchableOpacity
// // //                   style={styles.editBtn}
// // //                   onPress={() => handleEdit(video)}
// // //                   activeOpacity={0.7}
// // //                 >
// // //                   <Ionicons name="create-outline" size={18} color={COLORS.primary} />
// // //                 </TouchableOpacity>
// // //                 <TouchableOpacity
// // //                   style={styles.deleteBtn}
// // //                   onPress={() => handleDelete(video.id)}
// // //                   activeOpacity={0.7}
// // //                 >
// // //                   <Ionicons name="trash-outline" size={18} color={COLORS.red} />
// // //                 </TouchableOpacity>
// // //                 <TouchableOpacity
// // //                   style={styles.analyticsBtn}
// // //                   onPress={() =>
// // //                     navigation.navigate("TeacherAnalyticsScreen", { video })
// // //                   }
// // //                   activeOpacity={0.7}
// // //                 >
// // //                   <Ionicons name="analytics-outline" size={18} color={COLORS.blue} />
// // //                 </TouchableOpacity>
// // //               </View>
// // //             </TouchableOpacity>
// // //           ))
// // //         )}
// // //       </ScrollView>

// // //       <TouchableOpacity
// // //         style={styles.uploadBtn}
// // //         activeOpacity={0.88}
// // //         onPress={handleUploadNew}
// // //       >
// // //         <Ionicons name="add" size={24} color="#FFFFFF" />
// // //         <Text style={styles.uploadText}>Upload New Video</Text>
// // //       </TouchableOpacity>

// // //       <TeacherBottomNavigation navigation={navigation} active="Videos" />
// // //     </SafeAreaView>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, backgroundColor: COLORS.bg },
// // //   header: {
// // //     paddingHorizontal: 16,
// // //     paddingTop: Platform.OS === "android" ? 16 : 12,
// // //     paddingBottom: 8,
// // //     flexDirection: "row",
// // //     justifyContent: "space-between",
// // //     alignItems: "center",
// // //     backgroundColor: COLORS.bg,
// // //   },
// // //   backBtn: {
// // //     width: 40,
// // //     height: 40,
// // //     borderRadius: 12,
// // //     backgroundColor: COLORS.white,
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //     borderWidth: 1,
// // //     borderColor: COLORS.border,
// // //   },
// // //   headerCenter: { flex: 1, alignItems: "center", marginHorizontal: 8 },
// // //   heading: { fontSize: 18, fontWeight: "900", color: COLORS.text },
// // //   subHeading: { marginTop: 2, color: COLORS.muted, fontSize: 11, fontWeight: "600" },
// // //   rightRow: { flexDirection: "row", alignItems: "center" },
// // //   iconBtn: {
// // //     width: 38,
// // //     height: 38,
// // //     borderRadius: 10,
// // //     backgroundColor: COLORS.white,
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //     borderWidth: 1,
// // //     borderColor: COLORS.border,
// // //   },
// // //   tabsRow: { flexDirection: "row", backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
// // //   tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
// // //   activeTabBtn: { backgroundColor: "#E9FFF6" },
// // //   tabText: { color: COLORS.muted, fontWeight: "700", fontSize: 13 },
// // //   activeTabText: { color: COLORS.primary },
// // //   scrollContent: { paddingBottom: 160, paddingTop: 4 },
// // //   videoCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 12, flexDirection: "row", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
// // //   thumbnail: { width: 110, height: 80, borderRadius: 14, justifyContent: "center", alignItems: "center", flexShrink: 0 },
// // //   playBtnOverlay: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
// // //   durationBadge: { position: "absolute", bottom: 6, right: 6, backgroundColor: "rgba(0,0,0,0.85)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
// // //   durationText: { color: "#FFFFFF", fontWeight: "900", fontSize: 9 },
// // //   videoDetails: { flex: 1, marginLeft: 12 },
// // //   videoTitle: { fontSize: 14, fontWeight: "900", color: COLORS.text, lineHeight: 20 },
// // //   videoSub: { marginTop: 3, color: COLORS.primary, fontWeight: "700", fontSize: 12 },
// // //   publishTime: { marginTop: 3, color: COLORS.muted, fontWeight: "600", fontSize: 11 },
// // //   metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
// // //   metaItem: { flexDirection: "row", alignItems: "center" },
// // //   metaText: { marginLeft: 3, color: COLORS.muted, fontWeight: "700", fontSize: 11 },
// // //   videoActions: { alignItems: "center", justifyContent: "space-between", paddingLeft: 6 },
// // //   editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#E9FFF6", justifyContent: "center", alignItems: "center", marginBottom: 4 },
// // //   deleteBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#FFF1F2", justifyContent: "center", alignItems: "center", marginBottom: 4 },
// // //   analyticsBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#EEF4FF", justifyContent: "center", alignItems: "center" },
// // //   emptyState: { alignItems: "center", paddingTop: 60, paddingBottom: 20 },
// // //   emptyText: { marginTop: 16, color: COLORS.muted, fontSize: 16, fontWeight: "700" },
// // //   uploadBtn: { position: "absolute", bottom: 90, left: 16, right: 16, height: 58, borderRadius: 18, backgroundColor: COLORS.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
// // //   uploadText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", marginLeft: 8 },
// // // });






































// // // screens/teacher/UploadedVideosScreen.js
// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   TouchableOpacity,
// //   ScrollView,
// //   StatusBar,
// //   Alert,
// //   Platform,
// // } from "react-native";
// // import { Ionicons } from "@expo/vector-icons";
// // import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
// // import { useAppContext } from "../../context/AppContext";

// // const COLORS = {
// //   primary: "#008F7A",
// //   white: "#FFFFFF",
// //   bg: "#F5F7FB",
// //   text: "#07123A",
// //   muted: "#7A879D",
// //   border: "#E8ECF4",
// //   green: "#16A34A",
// //   red: "#EF4444",
// //   blue: "#2563EB",
// // };

// // const TABS = ["All", "Published", "Unlisted", "Drafts"];

// // export default function UploadedVideosScreen({ navigation }) {
// //   const { uploadedVideos, deleteUploadedVideo } = useAppContext();
// //   const [activeTab, setActiveTab] = useState("All");
// //   const [videos, setVideos] = useState([]);

// //   useEffect(() => {
// //     setVideos(uploadedVideos);
// //   }, [uploadedVideos]);

// //   const filteredVideos = () => {
// //     if (activeTab === "All") return videos;
// //     if (activeTab === "Published") return videos.filter(v => v.status === "Published");
// //     if (activeTab === "Unlisted") return videos.filter(v => v.status === "Unlisted");
// //     if (activeTab === "Drafts") return videos.filter(v => v.status === "Draft");
// //     return videos;
// //   };

// //   const handleDelete = (id) => {
// //     global.showAlert(
// //       "Delete Video",
// //       "Are you sure you want to delete this video?",
// //       [
// //         { text: "Cancel", style: "cancel" },
// //         {
// //           text: "Delete",
// //           style: "destructive",
// //           onPress: () => deleteUploadedVideo(id),
// //         },
// //       ]
// //     );
// //   };

// //   const handleVideoPress = (video) => {
// //     navigation.navigate("UploadVideoPlayerScreen", { video });
// //   };

// //   const handleUploadNew = () => {
// //     navigation.navigate("UploadVideoScreen");
// //   };

// //   const handleEdit = (video) => {
// //     navigation.navigate("UploadVideoScreen", { editVideo: video });
// //   };

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

// //       {/* HEADER */}
// //       <View style={styles.header}>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.backBtn}
// //           activeOpacity={0.7}
// //         >
// //           <Ionicons name="arrow-back" size={24} color={COLORS.text} />
// //         </TouchableOpacity>

// //         <View style={styles.headerCenter}>
// //           <Text style={styles.heading}>Uploaded Videos</Text>
// //           <Text style={styles.subHeading}>Manage all your uploaded videos</Text>
// //         </View>

// //         <View style={styles.rightRow}>
// //           <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
// //             <Ionicons name="search-outline" size={22} color={COLORS.text} />
// //           </TouchableOpacity>
// //           <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} activeOpacity={0.7}>
// //             <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
// //           </TouchableOpacity>
// //         </View>
// //       </View>

// //       {/* TABS */}
// //       <View style={styles.tabsRow}>
// //         {TABS.map((tab) => (
// //           <TouchableOpacity
// //             key={tab}
// //             style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
// //             onPress={() => setActiveTab(tab)}
// //             activeOpacity={0.7}
// //           >
// //             <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
// //               {tab}
// //             </Text>
// //           </TouchableOpacity>
// //         ))}
// //       </View>

// //       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
// //         {filteredVideos().length === 0 ? (
// //           <View style={styles.emptyState}>
// //             <Ionicons name="videocam-outline" size={64} color={COLORS.muted} />
// //             <Text style={styles.emptyText}>No videos in this category</Text>
// //           </View>
// //         ) : (
// //           filteredVideos().map((video) => (
// //             <TouchableOpacity
// //               key={video.id}
// //               style={styles.videoCard}
// //               activeOpacity={0.88}
// //               onPress={() => handleVideoPress(video)}
// //             >
// //               <View
// //                 style={[
// //                   styles.thumbnail,
// //                   { backgroundColor: video.color || COLORS.primary },
// //                 ]}
// //               >
// //                 <View style={styles.playBtnOverlay}>
// //                   <Ionicons name="play" size={22} color="#FFFFFF" />
// //                 </View>
// //               </View>

// //               <View style={styles.videoDetails}>
// //                 <Text numberOfLines={2} style={styles.videoTitle}>{video.title}</Text>
// //                 <Text style={styles.videoSub}>{video.subject || ""} • {video.topic || ""}</Text>
// //                 <Text style={styles.publishTime}>
// //                   Published • {video.uploadedAgo || "Just now"}
// //                 </Text>

// //                 <View style={styles.metaRow}>
// //                   <View style={styles.metaItem}>
// //                     <Ionicons name="eye-outline" size={14} color={COLORS.muted} />
// //                     <Text style={styles.metaText}>{video.views || 0}</Text>
// //                   </View>
// //                   <View style={styles.metaItem}>
// //                     <Ionicons name="thumbs-up-outline" size={14} color={COLORS.muted} />
// //                     <Text style={styles.metaText}>{video.likes || 0}</Text>
// //                   </View>
// //                   <View style={styles.metaItem}>
// //                     <Ionicons name="chatbubble-outline" size={14} color={COLORS.muted} />
// //                     <Text style={styles.metaText}>{video.comments || 0}</Text>
// //                   </View>
// //                   <View style={styles.metaItem}>
// //                     <Ionicons name="star" size={14} color="#FFB800" />
// //                     <Text style={styles.metaText}>{video.rating || 0}</Text>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={styles.videoActions}>
// //                 <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(video)} activeOpacity={0.7}>
// //                   <Ionicons name="create-outline" size={18} color={COLORS.primary} />
// //                 </TouchableOpacity>
// //                 <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(video.id)} activeOpacity={0.7}>
// //                   <Ionicons name="trash-outline" size={18} color={COLORS.red} />
// //                 </TouchableOpacity>
// //                 <TouchableOpacity style={styles.analyticsBtn} onPress={() => navigation.navigate("TeacherAnalyticsScreen", { video })} activeOpacity={0.7}>
// //                   <Ionicons name="analytics-outline" size={18} color={COLORS.blue} />
// //                 </TouchableOpacity>
// //               </View>
// //             </TouchableOpacity>
// //           ))
// //         )}
// //       </ScrollView>

// //       <TouchableOpacity
// //         style={styles.uploadBtn}
// //         activeOpacity={0.88}
// //         onPress={handleUploadNew}
// //       >
// //         <Ionicons name="add" size={24} color="#FFFFFF" />
// //         <Text style={styles.uploadText}>Upload New Video</Text>
// //       </TouchableOpacity>

// //       <TeacherBottomNavigation navigation={navigation} active="Videos" />
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: COLORS.bg },
// //   header: { paddingHorizontal: 16, paddingTop: Platform.OS === "android" ? 16 : 12, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.bg },
// //   backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.white, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
// //   headerCenter: { flex: 1, alignItems: "center", marginHorizontal: 8 },
// //   heading: { fontSize: 18, fontWeight: "900", color: COLORS.text },
// //   subHeading: { marginTop: 2, color: COLORS.muted, fontSize: 11, fontWeight: "600" },
// //   rightRow: { flexDirection: "row", alignItems: "center" },
// //   iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.white, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
// //   tabsRow: { flexDirection: "row", backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
// //   tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
// //   activeTabBtn: { backgroundColor: "#E9FFF6" },
// //   tabText: { color: COLORS.muted, fontWeight: "700", fontSize: 13 },
// //   activeTabText: { color: COLORS.primary },
// //   scrollContent: { paddingBottom: 160, paddingTop: 4 },
// //   videoCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 12, flexDirection: "row", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
// //   thumbnail: { width: 110, height: 80, borderRadius: 14, justifyContent: "center", alignItems: "center", flexShrink: 0 },
// //   playBtnOverlay: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
// //   durationBadge: { position: "absolute", bottom: 6, right: 6, backgroundColor: "rgba(0,0,0,0.85)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
// //   durationText: { color: "#FFFFFF", fontWeight: "900", fontSize: 9 },
// //   videoDetails: { flex: 1, marginLeft: 12 },
// //   videoTitle: { fontSize: 14, fontWeight: "900", color: COLORS.text, lineHeight: 20 },
// //   videoSub: { marginTop: 3, color: COLORS.primary, fontWeight: "700", fontSize: 12 },
// //   publishTime: { marginTop: 3, color: COLORS.muted, fontWeight: "600", fontSize: 11 },
// //   metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
// //   metaItem: { flexDirection: "row", alignItems: "center" },
// //   metaText: { marginLeft: 3, color: COLORS.muted, fontWeight: "700", fontSize: 11 },
// //   videoActions: { alignItems: "center", justifyContent: "space-between", paddingLeft: 6 },
// //   editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#E9FFF6", justifyContent: "center", alignItems: "center", marginBottom: 4 },
// //   deleteBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#FFF1F2", justifyContent: "center", alignItems: "center", marginBottom: 4 },
// //   analyticsBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#EEF4FF", justifyContent: "center", alignItems: "center" },
// //   emptyState: { alignItems: "center", paddingTop: 60, paddingBottom: 20 },
// //   emptyText: { marginTop: 16, color: COLORS.muted, fontSize: 16, fontWeight: "700" },
// //   uploadBtn: { position: "absolute", bottom: 90, left: 16, right: 16, height: 58, borderRadius: 18, backgroundColor: COLORS.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
// //   uploadText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", marginLeft: 8 },
// // });










































// // // screens/teacher/UploadedVideosScreen.js
// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   TouchableOpacity,
// //   ScrollView,
// //   StatusBar,
// //   Alert,
// //   Platform,
// // } from "react-native";
// // import { Ionicons } from "@expo/vector-icons";
// // import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
// // import { useAppContext } from "../../context/AppContext";

// // const COLORS = {
// //   primary: "#008F7A",
// //   white: "#FFFFFF",
// //   bg: "#F5F7FB",
// //   text: "#07123A",
// //   muted: "#7A879D",
// //   border: "#E8ECF4",
// //   green: "#16A34A",
// //   red: "#EF4444",
// //   blue: "#2563EB",
// // };

// // const TABS = ["All", "Published", "Unlisted", "Drafts"];

// // export default function UploadedVideosScreen({ navigation }) {
// //   const { uploadedVideos, deleteUploadedVideo } = useAppContext();
// //   const [activeTab, setActiveTab] = useState("All");
// //   const [videos, setVideos] = useState([]);

// //   useEffect(() => {
// //     setVideos(uploadedVideos);
// //   }, [uploadedVideos]);

// //   const filteredVideos = () => {
// //     if (activeTab === "All") return videos;
// //     if (activeTab === "Published") return videos.filter(v => v.status === "Published");
// //     if (activeTab === "Unlisted") return videos.filter(v => v.status === "Unlisted");
// //     if (activeTab === "Drafts") return videos.filter(v => v.status === "Draft");
// //     return videos;
// //   };

// //   const handleDelete = (id) => {
// //     global.showAlert(
// //       "Delete Video",
// //       "Are you sure you want to delete this video?",
// //       [
// //         { text: "Cancel", style: "cancel" },
// //         {
// //           text: "Delete",
// //           style: "destructive",
// //           onPress: () => deleteUploadedVideo(id),
// //         },
// //       ]
// //     );
// //   };

// //   const handleVideoPress = (video) => {
// //     navigation.navigate("UploadVideoPlayerScreen", { video });
// //   };

// //   const handleUploadNew = () => {
// //     navigation.navigate("UploadVideoScreen");
// //   };

// //   const handleEdit = (video) => {
// //     navigation.navigate("UploadVideoScreen", { editVideo: video });
// //   };

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

// //       {/* HEADER */}
// //       <View style={styles.header}>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.backBtn}
// //           activeOpacity={0.7}
// //         >
// //           <Ionicons name="arrow-back" size={24} color={COLORS.text} />
// //         </TouchableOpacity>

// //         <View style={styles.headerCenter}>
// //           <Text style={styles.heading}>Uploaded Videos</Text>
// //           <Text style={styles.subHeading}>Manage all your uploaded videos</Text>
// //         </View>

// //         <View style={styles.rightRow}>
// //           <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
// //             <Ionicons name="search-outline" size={22} color={COLORS.text} />
// //           </TouchableOpacity>
// //           <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} activeOpacity={0.7}>
// //             <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
// //           </TouchableOpacity>
// //         </View>
// //       </View>

// //       {/* TABS */}
// //       <View style={styles.tabsRow}>
// //         {TABS.map((tab) => (
// //           <TouchableOpacity
// //             key={tab}
// //             style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
// //             onPress={() => setActiveTab(tab)}
// //             activeOpacity={0.7}
// //           >
// //             <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
// //               {tab}
// //             </Text>
// //           </TouchableOpacity>
// //         ))}
// //       </View>

// //       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
// //         {filteredVideos().length === 0 ? (
// //           <View style={styles.emptyState}>
// //             <Ionicons name="videocam-outline" size={64} color={COLORS.muted} />
// //             <Text style={styles.emptyText}>No videos in this category</Text>
// //           </View>
// //         ) : (
// //           filteredVideos().map((video) => (
// //             <TouchableOpacity
// //               key={video.id}
// //               style={styles.videoCard}
// //               activeOpacity={0.88}
// //               onPress={() => handleVideoPress(video)}
// //             >
// //               <View
// //                 style={[
// //                   styles.thumbnail,
// //                   { backgroundColor: video.color || COLORS.primary },
// //                 ]}
// //               >
// //                 <View style={styles.playBtnOverlay}>
// //                   <Ionicons name="play" size={22} color="#FFFFFF" />
// //                 </View>
// //               </View>

// //               <View style={styles.videoDetails}>
// //                 <Text numberOfLines={2} style={styles.videoTitle}>{video.title}</Text>
// //                 <Text style={styles.videoSub}>{video.subject || ""} • {video.topic || ""}</Text>
// //                 <Text style={styles.publishTime}>
// //                   Published • {video.uploadedAgo || "Just now"}
// //                 </Text>

// //                 <View style={styles.metaRow}>
// //                   <View style={styles.metaItem}>
// //                     <Ionicons name="eye-outline" size={14} color={COLORS.muted} />
// //                     <Text style={styles.metaText}>{video.views || 0}</Text>
// //                   </View>
// //                   <View style={styles.metaItem}>
// //                     <Ionicons name="thumbs-up-outline" size={14} color={COLORS.muted} />
// //                     <Text style={styles.metaText}>{video.likes || 0}</Text>
// //                   </View>
// //                   <View style={styles.metaItem}>
// //                     <Ionicons name="chatbubble-outline" size={14} color={COLORS.muted} />
// //                     <Text style={styles.metaText}>{video.comments || 0}</Text>
// //                   </View>
// //                   <View style={styles.metaItem}>
// //                     <Ionicons name="star" size={14} color="#FFB800" />
// //                     <Text style={styles.metaText}>{video.rating || 0}</Text>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={styles.videoActions}>
// //                 <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(video)} activeOpacity={0.7}>
// //                   <Ionicons name="create-outline" size={18} color={COLORS.primary} />
// //                 </TouchableOpacity>
// //                 <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(video.id)} activeOpacity={0.7}>
// //                   <Ionicons name="trash-outline" size={18} color={COLORS.red} />
// //                 </TouchableOpacity>
// //                 <TouchableOpacity style={styles.analyticsBtn} onPress={() => navigation.navigate("TeacherAnalyticsScreen", { video })} activeOpacity={0.7}>
// //                   <Ionicons name="analytics-outline" size={18} color={COLORS.blue} />
// //                 </TouchableOpacity>
// //               </View>
// //             </TouchableOpacity>
// //           ))
// //         )}
// //       </ScrollView>

// //       <TouchableOpacity
// //         style={styles.uploadBtn}
// //         activeOpacity={0.88}
// //         onPress={handleUploadNew}
// //       >
// //         <Ionicons name="add" size={24} color="#FFFFFF" />
// //         <Text style={styles.uploadText}>Upload New Video</Text>
// //       </TouchableOpacity>

// //       <TeacherBottomNavigation navigation={navigation} active="Videos" />
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: COLORS.bg },
// //   header: { paddingHorizontal: 16, paddingTop: Platform.OS === "android" ? 16 : 12, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.bg },
// //   backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.white, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
// //   headerCenter: { flex: 1, alignItems: "center", marginHorizontal: 8 },
// //   heading: { fontSize: 18, fontWeight: "900", color: COLORS.text },
// //   subHeading: { marginTop: 2, color: COLORS.muted, fontSize: 11, fontWeight: "600" },
// //   rightRow: { flexDirection: "row", alignItems: "center" },
// //   iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.white, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
// //   tabsRow: { flexDirection: "row", backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
// //   tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
// //   activeTabBtn: { backgroundColor: "#E9FFF6" },
// //   tabText: { color: COLORS.muted, fontWeight: "700", fontSize: 13 },
// //   activeTabText: { color: COLORS.primary },
// //   scrollContent: { paddingBottom: 160, paddingTop: 4 },
// //   videoCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 12, flexDirection: "row", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
// //   thumbnail: { width: 110, height: 80, borderRadius: 14, justifyContent: "center", alignItems: "center", flexShrink: 0 },
// //   playBtnOverlay: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
// //   durationBadge: { position: "absolute", bottom: 6, right: 6, backgroundColor: "rgba(0,0,0,0.85)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
// //   durationText: { color: "#FFFFFF", fontWeight: "900", fontSize: 9 },
// //   videoDetails: { flex: 1, marginLeft: 12 },
// //   videoTitle: { fontSize: 14, fontWeight: "900", color: COLORS.text, lineHeight: 20 },
// //   videoSub: { marginTop: 3, color: COLORS.primary, fontWeight: "700", fontSize: 12 },
// //   publishTime: { marginTop: 3, color: COLORS.muted, fontWeight: "600", fontSize: 11 },
// //   metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
// //   metaItem: { flexDirection: "row", alignItems: "center" },
// //   metaText: { marginLeft: 3, color: COLORS.muted, fontWeight: "700", fontSize: 11 },
// //   videoActions: { alignItems: "center", justifyContent: "space-between", paddingLeft: 6 },
// //   editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#E9FFF6", justifyContent: "center", alignItems: "center", marginBottom: 4 },
// //   deleteBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#FFF1F2", justifyContent: "center", alignItems: "center", marginBottom: 4 },
// //   analyticsBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#EEF4FF", justifyContent: "center", alignItems: "center" },
// //   emptyState: { alignItems: "center", paddingTop: 60, paddingBottom: 20 },
// //   emptyText: { marginTop: 16, color: COLORS.muted, fontSize: 16, fontWeight: "700" },
// //   uploadBtn: { position: "absolute", bottom: 90, left: 16, right: 16, height: 58, borderRadius: 18, backgroundColor: COLORS.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
// //   uploadText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", marginLeft: 8 },
// // });




















































// // screens/teacher/UploadedVideosScreen.js
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   Platform,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
// import { useAppContext } from "../../context/AppContext";

// const COLORS = {
//   primary: "#008F7A",
//   white: "#FFFFFF",
//   bg: "#F5F7FB",
//   text: "#07123A",
//   muted: "#7A879D",
//   border: "#E8ECF4",
//   green: "#16A34A",
//   red: "#EF4444",
//   blue: "#2563EB",
// };

// const TABS = ["All", "Published", "Unlisted", "Drafts"];

// export default function UploadedVideosScreen({ navigation }) {
//   const { uploadedVideos, deleteUploadedVideo } = useAppContext();
//   const [activeTab, setActiveTab] = useState("All");
//   const [videos, setVideos] = useState([]);

//   useEffect(() => setVideos(uploadedVideos), [uploadedVideos]);

//   const filteredVideos = () => {
//     if (activeTab === "All") return videos;
//     if (activeTab === "Published") return videos.filter(v => v.status === "Published");
//     if (activeTab === "Unlisted") return videos.filter(v => v.status === "Unlisted");
//     if (activeTab === "Drafts") return videos.filter(v => v.status === "Draft");
//     return videos;
//   };

//   const handleDelete = (id) => {
//     // Delete directly without alert
//     deleteUploadedVideo(id);
//   };

//   const handleVideoPress = (video) => navigation.navigate("UploadVideoPlayerScreen", { video });
//   const handleUploadNew = () => navigation.navigate("UploadVideoScreen");
//   const handleEdit = (video) => navigation.navigate("UploadVideoScreen", { editVideo: video });

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
//           <Ionicons name="arrow-back" size={24} color={COLORS.text} />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Text style={styles.heading}>Uploaded Videos</Text>
//           <Text style={styles.subHeading}>Manage all your uploaded videos</Text>
//         </View>

//         <View style={styles.rightRow}>
//           <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
//             <Ionicons name="search-outline" size={22} color={COLORS.text} />
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} activeOpacity={0.7}>
//             <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <View style={styles.tabsRow}>
//         {TABS.map(tab => (
//           <TouchableOpacity key={tab} style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]} onPress={() => setActiveTab(tab)} activeOpacity={0.7}>
//             <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
//         {filteredVideos().length === 0 ? (
//           <View style={styles.emptyState}>
//             <Ionicons name="videocam-outline" size={64} color={COLORS.muted} />
//             <Text style={styles.emptyText}>No videos in this category</Text>
//           </View>
//         ) : (
//           filteredVideos().map(video => (
//             <TouchableOpacity key={video.id} style={styles.videoCard} activeOpacity={0.88} onPress={() => handleVideoPress(video)}>
//               <View style={[styles.thumbnail, { backgroundColor: video.color || COLORS.primary }]}>
//                 <View style={styles.playBtnOverlay}>
//                   <Ionicons name="play" size={22} color="#FFFFFF" />
//                 </View>
//               </View>

//               <View style={styles.videoDetails}>
//                 <Text numberOfLines={2} style={styles.videoTitle}>{video.title}</Text>
//                 <Text style={styles.videoSub}>{video.subject || ""} • {video.topic || ""}</Text>
//                 <Text style={styles.publishTime}>Published • {video.uploadedAgo || "Just now"}</Text>

//                 <View style={styles.metaRow}>
//                   <View style={styles.metaItem}><Ionicons name="eye-outline" size={14} color={COLORS.muted} /><Text style={styles.metaText}>{video.views || 0}</Text></View>
//                   <View style={styles.metaItem}><Ionicons name="thumbs-up-outline" size={14} color={COLORS.muted} /><Text style={styles.metaText}>{video.likes || 0}</Text></View>
//                   <View style={styles.metaItem}><Ionicons name="chatbubble-outline" size={14} color={COLORS.muted} /><Text style={styles.metaText}>{video.comments || 0}</Text></View>
//                   <View style={styles.metaItem}><Ionicons name="star" size={14} color="#FFB800" /><Text style={styles.metaText}>{video.rating || 0}</Text></View>
//                 </View>
//               </View>

//               <View style={styles.videoActions}>
//                 <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(video)} activeOpacity={0.7}><Ionicons name="create-outline" size={18} color={COLORS.primary} /></TouchableOpacity>
//                 <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(video.id)} activeOpacity={0.7}><Ionicons name="trash-outline" size={18} color={COLORS.red} /></TouchableOpacity>
//                 <TouchableOpacity style={styles.analyticsBtn} onPress={() => navigation.navigate("TeacherAnalyticsScreen", { video })} activeOpacity={0.7}><Ionicons name="analytics-outline" size={18} color={COLORS.blue} /></TouchableOpacity>
//               </View>
//             </TouchableOpacity>
//           ))
//         )}
//       </ScrollView>

//       <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.88} onPress={handleUploadNew}>
//         <Ionicons name="add" size={24} color="#FFFFFF" />
//         <Text style={styles.uploadText}>Upload New Video</Text>
//       </TouchableOpacity>

//       <TeacherBottomNavigation navigation={navigation} active="Videos" />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.bg },
//   header: { paddingHorizontal: 16, paddingTop: Platform.OS === "android" ? 16 : 12, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.bg },
//   backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.white, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
//   headerCenter: { flex: 1, alignItems: "center", marginHorizontal: 8 },
//   heading: { fontSize: 18, fontWeight: "900", color: COLORS.text },
//   subHeading: { marginTop: 2, color: COLORS.muted, fontSize: 11, fontWeight: "600" },
//   rightRow: { flexDirection: "row", alignItems: "center" },
//   iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.white, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
//   tabsRow: { flexDirection: "row", backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
//   tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
//   activeTabBtn: { backgroundColor: "#E9FFF6" },
//   tabText: { color: COLORS.muted, fontWeight: "700", fontSize: 13 },
//   activeTabText: { color: COLORS.primary },
//   scrollContent: { paddingBottom: 160, paddingTop: 4 },
//   videoCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 12, flexDirection: "row", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
//   thumbnail: { width: 110, height: 80, borderRadius: 14, justifyContent: "center", alignItems: "center", flexShrink: 0 },
//   playBtnOverlay: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
//   videoDetails: { flex: 1, marginLeft: 12 },
//   videoTitle: { fontSize: 14, fontWeight: "900", color: COLORS.text, lineHeight: 20 },
//   videoSub: { marginTop: 3, color: COLORS.primary, fontWeight: "700", fontSize: 12 },
//   publishTime: { marginTop: 3, color: COLORS.muted, fontWeight: "600", fontSize: 11 },
//   metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
//   metaItem: { flexDirection: "row", alignItems: "center" },
//   metaText: { marginLeft: 3, color: COLORS.muted, fontWeight: "700", fontSize: 11 },
//   videoActions: { alignItems: "center", justifyContent: "space-between", paddingLeft: 6 },
//   editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#E9FFF6", justifyContent: "center", alignItems: "center", marginBottom: 4 },
//   deleteBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#FFF1F2", justifyContent: "center", alignItems: "center", marginBottom: 4 },
//   analyticsBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#EEF4FF", justifyContent: "center", alignItems: "center" },
//   emptyState: { alignItems: "center", paddingTop: 60, paddingBottom: 20 },
//   emptyText: { marginTop: 16, color: COLORS.muted, fontSize: 16, fontWeight: "700" },
//   uploadBtn: { position: "absolute", bottom: 90, left: 16, right: 16, height: 58, borderRadius: 18, backgroundColor: COLORS.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
//   uploadText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", marginLeft: 8 },
// });



































// screens/teacher/UploadedVideosScreen.js
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";
import { useAppContext } from "../../context/AppContext";

const COLORS = {
  primary: "#008F7A",
  white: "#FFFFFF",
  bg: "#F5F7FB",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E8ECF4",
  green: "#16A34A",
  red: "#EF4444",
  blue: "#2563EB",
};

const TABS = ["All", "Published", "Unlisted", "Drafts"];

export default function UploadedVideosScreen({ navigation }) {
  const { uploadedVideos, deleteUploadedVideo, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState("All");

  const teacherVideos = useMemo(
    () =>
      uploadedVideos.filter(
        (video) =>
          String(video?.teacherId || "").toLowerCase() ===
          String(currentUser?.teacherId || currentUser?.id || "").toLowerCase()
      ),
    [currentUser?.id, currentUser?.teacherId, uploadedVideos]
  );

  // Re-render whenever uploadedVideos changes — no separate local state needed
  const filteredVideos = () => {
    if (activeTab === "All") return teacherVideos;
    if (activeTab === "Published") return teacherVideos.filter(v => v.status === "Published" || v.visibility === "Public");
    if (activeTab === "Unlisted") return teacherVideos.filter(v => v.status === "Unlisted" || v.visibility === "Unlisted");
    if (activeTab === "Drafts") return teacherVideos.filter(v => v.status === "Draft" || v.visibility === "Private");
    return teacherVideos;
  };

  const handleDelete = async (id) => {
    try {
      await deleteUploadedVideo(id);
    } catch (error) {
      console.warn("Failed to delete uploaded video", error);
    }
  };

  const handleVideoPress = (video) => {
    navigation.navigate("UploadVideoPlayerScreen", { video });
  };

  const handleUploadNew = () => {
    navigation.navigate("UploadVideoScreen");
  };

  const handleEdit = (video) => {
    navigation.navigate("UploadVideoScreen", { editVideo: video });
  };

  const getVisibilityBadgeColor = (video) => {
    const v = video.visibility || video.status;
    if (v === "Public" || v === "Published") return { bg: "#DCFCE7", text: "#16A34A" };
    if (v === "Unlisted") return { bg: "#FEF9C3", text: "#CA8A04" };
    return { bg: "#F3F4F6", text: "#6B7280" };
  };

  const getVisibilityLabel = (video) => {
    if (video.visibility) return video.visibility;
    if (video.status === "Published") return "Public";
    if (video.status === "Draft") return "Private";
    return video.status || "Public";
  };

  const displayed = filteredVideos();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.heading}>Uploaded Videos</Text>
          <Text style={styles.subHeading}>
            {teacherVideos.length} video{teacherVideos.length !== 1 ? "s" : ""} uploaded
          </Text>
        </View>

        <View style={styles.rightRow}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* VIDEO LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayed.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-outline" size={64} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No videos here</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === "All"
                ? "Upload your first video to get started"
                : `No ${activeTab.toLowerCase()} videos yet`}
            </Text>
          </View>
        ) : (
          displayed.map(video => {
            const badge = getVisibilityBadgeColor(video);
            return (
              <TouchableOpacity
                key={video.id}
                style={styles.videoCard}
                activeOpacity={0.88}
                onPress={() => handleVideoPress(video)}
              >
                {/* Thumbnail */}
                <View style={[styles.thumbnail, { backgroundColor: video.color || COLORS.primary }]}>
                  <View style={styles.playBtnOverlay}>
                    <Ionicons name="play" size={22} color="#FFFFFF" />
                  </View>
                  {/* Visibility Badge */}
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>
                      {getVisibilityLabel(video)}
                    </Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.videoDetails}>
                  <Text numberOfLines={2} style={styles.videoTitle}>
                    {video.title}
                  </Text>
                  <Text style={styles.videoSub} numberOfLines={1}>
                    {[video.subject, video.topic].filter(Boolean).join(" • ")}
                  </Text>
                  {video.className ? (
                    <Text style={styles.videoClass}>{video.className}</Text>
                  ) : null}
                  <Text style={styles.publishTime}>
                    {video.uploadedAgo || "Just now"}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="eye-outline" size={13} color={COLORS.muted} />
                      <Text style={styles.metaText}>{video.views || 0}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="thumbs-up-outline" size={13} color={COLORS.muted} />
                      <Text style={styles.metaText}>{video.likes || 0}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="chatbubble-outline" size={13} color={COLORS.muted} />
                      <Text style={styles.metaText}>{video.comments || 0}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="star" size={13} color="#FFB800" />
                      <Text style={styles.metaText}>{video.rating || 0}</Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.videoActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleEdit(video)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(video.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.red} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.analyticsBtn}
                    onPress={() => navigation.navigate("TeacherAnalyticsScreen", { video })}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="analytics-outline" size={18} color={COLORS.blue} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Upload FAB */}
      <TouchableOpacity
        style={styles.uploadBtn}
        activeOpacity={0.88}
        onPress={handleUploadNew}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.uploadText}>Upload New Video</Text>
      </TouchableOpacity>

      <TeacherBottomNavigation navigation={navigation} active="Videos" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 16 : 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerCenter: { flex: 1, alignItems: "center", marginHorizontal: 8 },
  heading: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  subHeading: { marginTop: 2, color: COLORS.muted, fontSize: 11, fontWeight: "600" },
  rightRow: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  activeTabBtn: { backgroundColor: "#E9FFF6" },
  tabText: { color: COLORS.muted, fontWeight: "700", fontSize: 13 },
  activeTabText: { color: COLORS.primary },
  scrollContent: { paddingBottom: 160, paddingTop: 4 },
  videoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 110,
    height: 84,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  playBtnOverlay: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 9, fontWeight: "800" },
  videoDetails: { flex: 1, marginLeft: 12 },
  videoTitle: { fontSize: 14, fontWeight: "900", color: COLORS.text, lineHeight: 20 },
  videoSub: { marginTop: 3, color: COLORS.primary, fontWeight: "700", fontSize: 12 },
  videoClass: { marginTop: 2, color: COLORS.muted, fontWeight: "600", fontSize: 11 },
  publishTime: { marginTop: 3, color: COLORS.muted, fontWeight: "600", fontSize: 11 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaText: { marginLeft: 3, color: COLORS.muted, fontWeight: "700", fontSize: 11 },
  videoActions: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 6,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E9FFF6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFF1F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  analyticsBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: { alignItems: "center", paddingTop: 60, paddingBottom: 20 },
  emptyTitle: { marginTop: 16, color: COLORS.text, fontSize: 18, fontWeight: "800" },
  emptySubtitle: { marginTop: 6, color: COLORS.muted, fontSize: 13, fontWeight: "600", textAlign: "center", paddingHorizontal: 40 },
  uploadBtn: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  uploadText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", marginLeft: 8 },
});
