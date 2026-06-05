
// // components/TeacherBottomNavigation.js
// // FULLY UPDATED
// // ALL NAVIGATION FIXED
// // VIDEOS TAB ADDED

// import React from "react";
// import {
//   View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useAppContext } from "../context/AppContext";

// const { width } = Dimensions.get("window");

// const COLORS = {
//   white: "#FFFFFF",
//   primary: "#006D6A",
//   primaryLight: "#EAF8F6",
//   text: "#07123A",
//   muted: "#7A859F",
//   border: "#E6ECF5",
//   danger: "#FF4D4F",
// };

// export default function TeacherBottomNavigation({ navigation, active = "Home" }) {
//   const { allDoubts } = useAppContext();

//   const pendingCount = allDoubts.filter(
//     item => item.status === "Pending" && !item.accepted
//   ).length;

//   const inProgressCount = allDoubts.filter(
//     item => item.status === "In Progress"
//   ).length;

//   const totalBadge = pendingCount + inProgressCount;

//   const navItems = [
//     {
//       key: "Home",
//       label: "Home",
//       icon: "home-outline",
//       activeIcon: "home",
//       screen: "TeacherDashboard",
//     },
//     {
//       key: "Doubts",
//       label: "Doubts",
//       icon: "chatbubble-ellipses-outline",
//       activeIcon: "chatbubble-ellipses",
//       screen: "AvailableDoubts",
//       badge: totalBadge > 0 ? totalBadge : null,
//     },
//     {
//       key: "Videos",
//       label: "Videos",
//       icon: "videocam-outline",
//       activeIcon: "videocam",
//       screen: "UploadedVideosScreen",
//     },
//     {
//       key: "Earnings",
//       label: "Earnings",
//       icon: "wallet-outline",
//       activeIcon: "wallet",
//       screen: "EarningsOverview",
//     },
//     {
//       key: "Profile",
//       label: "Profile",
//       icon: "person-outline",
//       activeIcon: "person",
//       screen: "TeacherProfile",
//     },
//   ];

//   const handleNavigation = (screen, key) => {
//     if (!navigation || !screen) return;
//     if (active === key) return;
//     navigation.navigate(screen);
//   };

//   return (
//     <View pointerEvents="box-none" style={styles.wrapper}>
//       <View style={styles.bottomNav}>
//         {navItems.map(item => {
//           const isActive = active === item.key;
//           return (
//             <TouchableOpacity
//               key={item.key}
//               activeOpacity={0.88}
//               style={styles.navItem}
//               onPress={() => handleNavigation(item.screen, item.key)}
//             >
//               {/* ICON */}
//               <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
//                 <Ionicons
//                   name={isActive ? item.activeIcon : item.icon}
//                   size={width < 360 ? 20 : 22}
//                   color={isActive ? COLORS.primary : COLORS.muted}
//                 />
//                 {/* BADGE */}
//                 {item.badge && (
//                   <View style={styles.badge}>
//                     <Text style={styles.badgeText}>
//                       {item.badge > 99 ? "99+" : item.badge}
//                     </Text>
//                   </View>
//                 )}
//               </View>

//               {/* LABEL */}
//               <Text
//                 numberOfLines={1}
//                 style={[styles.label, isActive && styles.activeLabel]}
//               >
//                 {item.label}
//               </Text>

//               {/* ACTIVE LINE */}
//               {isActive && <View style={styles.activeLine} />}
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     position: "absolute",
//     left: 0, right: 0, bottom: 0,
//     backgroundColor: "transparent",
//     paddingHorizontal: 10,
//     paddingBottom: Platform.OS === "ios" ? 10 : 6,
//   },
//   bottomNav: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-around",
//     backgroundColor: COLORS.white,
//     borderRadius: 24,
//     paddingTop: 12,
//     paddingBottom: Platform.OS === "ios" ? 22 : 12,
//     paddingHorizontal: 6,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.08,
//     shadowRadius: 16,
//     elevation: 18,
//   },
//   navItem: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     position: "relative",
//   },
//   iconContainer: {
//     width: 44,
//     height: 40,
//     borderRadius: 14,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "relative",
//   },
//   activeIconContainer: {
//     backgroundColor: COLORS.primaryLight,
//   },
//   badge: {
//     position: "absolute",
//     top: -2, right: -1,
//     minWidth: 18, height: 18,
//     borderRadius: 20,
//     backgroundColor: COLORS.danger,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 4,
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },
//   badgeText: { color: COLORS.white, fontSize: 8, fontWeight: "900" },
//   label: {
//     marginTop: 4,
//     fontSize: width < 360 ? 9 : 10,
//     fontWeight: "800",
//     color: COLORS.muted,
//   },
//   activeLabel: { color: COLORS.primary },
//   activeLine: {
//     marginTop: 4,
//     width: 20, height: 3,
//     borderRadius: 10,
//     backgroundColor: COLORS.primary,
//   },
// });









































// components/TeacherBottomNavigation.js
// FULLY UPDATED — MySchedule replaces Earnings

import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";

const { width } = Dimensions.get("window");

const COLORS = {
  white: "#FFFFFF",
  primary: "#006D6A",
  primaryLight: "#EAF8F6",
  text: "#07123A",
  muted: "#7A859F",
  border: "#E6ECF5",
  danger: "#FF4D4F",
};

export default function TeacherBottomNavigation({ navigation, active = "Home" }) {
  const { allDoubts } = useAppContext();

  const pendingCount = allDoubts.filter(
    item => item.status === "Pending" && !item.accepted
  ).length;

  const inProgressCount = allDoubts.filter(
    item => item.status === "In Progress"
  ).length;

  const totalBadge = pendingCount + inProgressCount;

  const navItems = [
    {
      key: "Home",
      label: "Home",
      icon: "home-outline",
      activeIcon: "home",
      screen: "TeacherDashboard",
    },
    {
      key: "Doubts",
      label: "Doubts",
      icon: "chatbubble-ellipses-outline",
      activeIcon: "chatbubble-ellipses",
      screen: "AvailableDoubts",
      badge: totalBadge > 0 ? totalBadge : null,
    },
    {
      key: "Videos",
      label: "Videos",
      icon: "videocam-outline",
      activeIcon: "videocam",
      screen: "UploadedVideosScreen",
    },
    {
      key: "MySchedule",
      label: "Schedule",
      icon: "calendar-outline",
      activeIcon: "calendar",
      screen: "TeacherSchedule",
    },
    {
      key: "Profile",
      label: "Profile",
      icon: "person-outline",
      activeIcon: "person",
      screen: "TeacherProfile",
    },
  ];

  const handleNavigation = (screen, key) => {
    if (!navigation || !screen) return;
    if (active === key) return;
    navigation.navigate(screen);
  };

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.bottomNav}>
        {navItems.map(item => {
          const isActive = active === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.88}
              style={styles.navItem}
              onPress={() => handleNavigation(item.screen, item.key)}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={width < 360 ? 20 : 22}
                  color={isActive ? COLORS.primary : COLORS.muted}
                />
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                numberOfLines={1}
                style={[styles.label, isActive && styles.activeLabel]}
              >
                {item.label}
              </Text>

              {isActive && <View style={styles.activeLine} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === "ios" ? 10 : 6,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 22 : 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 18,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconContainer: {
    width: 44,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  activeIconContainer: {
    backgroundColor: COLORS.primaryLight,
  },
  badge: {
    position: "absolute",
    top: -2, right: -1,
    minWidth: 18, height: 18,
    borderRadius: 20,
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: { color: COLORS.white, fontSize: 8, fontWeight: "900" },
  label: {
    marginTop: 4,
    fontSize: width < 360 ? 9 : 10,
    fontWeight: "800",
    color: COLORS.muted,
  },
  activeLabel: { color: COLORS.primary },
  activeLine: {
    marginTop: 4,
    width: 20, height: 3,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
});
