


import React, {
  useMemo,
  useCallback,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Platform,
  Dimensions,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useFocusEffect,
} from "@react-navigation/native";

import {
  useAppContext,
} from "../../context/AppContext";

const { width } =
  Dimensions.get("window");

const COLORS = {
  bg: "#F6FAFF",

  white: "#FFFFFF",

  blue: "#003B8E",

  primary: "#006D6A",

  text: "#07123A",

  muted: "#7A879D",

  border: "#E7EEF8",

  soft: "#F3F6FF",

  greenSoft:
    "#EAF7F4",

  orangeSoft:
    "#FFF4E5",

  red: "#FF4D4F",

  shadow:
    "rgba(0,0,0,0.08)",
};

export default function StudentNotificationScreen({
  navigation,
}) {
  const {
    notifications,

    markNotificationRead,
    markAllNotificationsRead,
  } = useAppContext();

  // ====================================
  // REALTIME SORTING
  // ====================================

  const sortedNotifications =
    useMemo(() => {
      return [
        ...notifications,
      ].sort(
        (a, b) =>
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
      );
    }, [notifications]);

  // ====================================
  // AUTO READ
  // ====================================

  useFocusEffect(
    useCallback(() => {
      const unreadItems = notifications.filter((item) => !item.read);

      if (unreadItems.length > 0) {
        markAllNotificationsRead?.();
      }

      return () => {};
    }, [markAllNotificationsRead, notifications])
  );

  // ====================================
  // FORMAT TIME
  // ====================================

  const formatTime =
    (date) => {
      if (!date)
        return "Now";

      const diff =
        Date.now() -
        new Date(
          date
        ).getTime();

      const mins =
        Math.floor(
          diff /
            60000
        );

      if (mins < 1)
        return "Now";

      if (mins < 60)
        return `${mins} min ago`;

      const hrs =
        Math.floor(
          mins / 60
        );

      if (hrs < 24)
        return `${hrs} hr ago`;

      const days =
        Math.floor(
          hrs / 24
        );

      if (days === 1)
        return "Yesterday";

      return `${days} days ago`;
    };

  // ====================================
  // ICON
  // ====================================

  const getIcon =
    (type) => {
      switch (
        type
      ) {
        case "student":
          return {
            icon:
              "school-outline",

            bg:
              COLORS.greenSoft,

            color:
              COLORS.primary,
          };

        case "payment":
          return {
            icon:
              "wallet-outline",

            bg:
              COLORS.orangeSoft,

            color:
              "#E27800",
          };

        case "chat":
          return {
            icon:
              "chatbubble-ellipses-outline",

            bg:
              COLORS.soft,

            color:
              COLORS.blue,
          };

        default:
          return {
            icon:
              "notifications-outline",

            bg:
              COLORS.soft,

            color:
              COLORS.blue,
          };
      }
    };

  // ====================================
  // MARK READ
  // ====================================

  const handleRead =
    (
      notification
    ) => {
      if (
        !notification.read
      ) {
        markNotificationRead(
          notification.id
        );
      }

      if (String(notification.type || "").toLowerCase() === "chat") {
        navigation?.navigate?.("PreClassChat", {
          sessionId:
            notification.relatedTestId ||
            notification.relatedId ||
            notification.sessionId ||
            notification.id,
          session: {
            sessionId:
              notification.relatedTestId ||
              notification.relatedId ||
              notification.sessionId ||
              notification.id,
            subject: notification.categoryTitle || "Pre-class chat",
            topic: notification.message || "New chat message",
            teacherName: notification.teacherName || "Teacher",
          },
        });
      }
    };

  // ====================================
  // MARK ALL
  // ====================================

  const handleMarkAll =
    () => {
      markAllNotificationsRead?.();
    };

  // ====================================
  // ITEM
  // ====================================

  const renderItem =
    ({ item }) => {
      const config =
        getIcon(
          item.type
        );

      return (
        <TouchableOpacity
          activeOpacity={
            0.88
          }
          style={[
            styles.notificationCard,

            !item.read &&
              styles.unreadCard,
          ]}
          onPress={() =>
            handleRead(
              item
            )
          }
        >
          {/* ICON */}

          <View
            style={[
              styles.iconBox,

              {
                backgroundColor:
                  config.bg,
              },
            ]}
          >
            <Ionicons
              name={
                config.icon
              }
              size={21}
              color={
                config.color
              }
            />
          </View>

          {/* CONTENT */}

          <View
            style={
              styles.content
            }
          >
            <View
              style={
                styles.titleRow
              }
            >
              <Text
                numberOfLines={
                  1
                }
                style={
                  styles.title
                }
              >
                {item.title}
              </Text>

              {!item.read && (
                <View
                  style={
                    styles.unreadDot
                  }
                />
              )}
            </View>

            <Text
              numberOfLines={
                2
              }
              style={
                styles.message
              }
            >
              {
                item.message
              }
            </Text>

            <Text
              style={
                styles.time
              }
            >
              {formatTime(
                item.createdAt
              )}
            </Text>
          </View>
        </TouchableOpacity>
      );
    };

  // ====================================
  // EMPTY
  // ====================================

  const EmptyComponent =
    () => (
      <View
        style={
          styles.emptyContainer
        }
      >
        <View
          style={
            styles.emptyIconBox
          }
        >
          <Ionicons
            name="notifications-off-outline"
            size={48}
            color={
              COLORS.primary
            }
          />
        </View>

        <Text
          style={
            styles.emptyTitle
          }
        >
          No Notifications
        </Text>

        <Text
          style={
            styles.emptySub
          }
        >
          New updates and
          answers will
          appear here.
        </Text>
      </View>
    );

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.bg
        }
      />

      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >
        <TouchableOpacity
          style={
            styles.headerBtn
          }
          onPress={() =>
            navigation?.goBack?.()
          }
          activeOpacity={
            0.8
          }
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={
              COLORS.text
            }
          />
        </TouchableOpacity>

        <View
          style={{
            alignItems:
              "center",
          }}
        >
          <Text
            style={
              styles.headerTitle
            }
          >
            Notifications
          </Text>

          <Text
            style={
              styles.headerSub
            }
          >
            {
              sortedNotifications.length
            }{" "}
            Updates
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={
            0.8
          }
          style={
            styles.headerBtn
          }
          onPress={
            handleMarkAll
          }
        >
          <Ionicons
            name="checkmark-done-outline"
            size={20}
            color={
              COLORS.blue
            }
          />
        </TouchableOpacity>
      </View>

      {/* LIST */}

      <FlatList
        data={
          sortedNotifications
        }
        keyExtractor={item =>
          item.id
        }
        renderItem={
          renderItem
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.listContent,

          sortedNotifications.length ===
            0 && {
            flex: 1,
          },
        ]}
        ListEmptyComponent={
          EmptyComponent
        }
        ListHeaderComponent={
          sortedNotifications.length >
          0 ? (
            <Text
              style={
                styles.sectionTitle
              }
            >
              Recent
              Notifications
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        COLORS.bg,
    },

    header: {
      height: 56,

      paddingHorizontal: 16,

      paddingTop:
        Platform.OS ===
        "android"
          ? 6
          : 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    headerBtn: {
      width: 40,

      height: 40,

      borderRadius: 14,

      backgroundColor:
        COLORS.white,

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        "#000",

      shadowOpacity: 0.05,

      shadowRadius: 10,

      elevation: 3,
    },

    headerTitle: {
      fontSize: 18,

      fontWeight:
        "900",

      color:
        COLORS.text,
    },

    headerSub: {
      marginTop: 2,

      fontSize: 11,

      fontWeight:
        "700",

      color:
        COLORS.muted,
    },

    listContent: {
      paddingHorizontal: 16,

      paddingBottom: 40,
    },

    sectionTitle: {
      marginTop: 16,

      marginBottom: 14,

      fontSize: 13,

      fontWeight:
        "900",

      color:
        COLORS.text,
    },

    notificationCard: {
      minHeight: 90,

      borderRadius: 22,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      paddingHorizontal: 14,

      paddingVertical: 14,

      marginBottom: 14,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      shadowColor:
        "#000",

      shadowOpacity: 0.04,

      shadowRadius: 8,

      elevation: 2,
    },

    unreadCard: {
      borderColor:
        "#D7F0EA",

      backgroundColor:
        "#FCFEFF",
    },

    iconBox: {
      width: 46,

      height: 46,

      borderRadius: 16,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight: 14,
    },

    content: {
      flex: 1,
    },

    titleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    title: {
      flex: 1,

      fontSize: 13,

      fontWeight:
        "900",

      color:
        COLORS.text,
    },

    unreadDot: {
      width: 9,

      height: 9,

      borderRadius: 9,

      backgroundColor:
        COLORS.red,

      marginLeft: 8,
    },

    message: {
      marginTop: 6,

      fontSize: 11.5,

      lineHeight: 18,

      fontWeight:
        "700",

      color:
        COLORS.muted,
    },

    time: {
      marginTop: 8,

      fontSize: 10,

      fontWeight:
        "800",

      color:
        COLORS.blue,
    },

    emptyContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal: 40,
    },

    emptyIconBox: {
      width: 90,

      height: 90,

      borderRadius: 45,

      backgroundColor:
        COLORS.greenSoft,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop: 20,

      fontSize: 18,

      fontWeight:
        "900",

      color:
        COLORS.text,
    },

    emptySub: {
      marginTop: 10,

      textAlign:
        "center",

      fontSize: 13,

      lineHeight: 22,

      fontWeight:
        "700",

      color:
        COLORS.muted,
    },
  });
