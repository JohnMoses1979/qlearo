
// ===============================
// FIXED NAVIGATION + REALTIME
// StudentMyDoubtsScreen.js
// FULLY UPDATED
// ===============================

import React, {
  useMemo,
  useState,
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
  ScrollView,
  Dimensions,
  Platform,
  RefreshControl,
  Image,
} from "react-native";

import {
  Ionicons,
  Feather,
} from "@expo/vector-icons";

import {
  useFocusEffect,
} from "@react-navigation/native";

import StudentBottomNavigation
from "../../components/StudentBottomNavigation";

import {
  useAppContext,
} from "../../context/AppContext";

const { width } =
  Dimensions.get("window");

const COLORS = {
  bg: "#F5F8FD",
  white: "#FFFFFF",
  primary: "#00897B",
  text: "#07123A",
  muted: "#74829D",
  border: "#E6EDF6",
  green: "#17B890",
  orange: "#F59E0B",
  red: "#EF4444",
  blue: "#2563EB",
};

const TABS = [
  "My Doubts",
  "Answered",
  "Pending",
];

export default function StudentMyDoubtsScreen({
  navigation,
}) {

  const {
    allDoubts,
  } = useAppContext();

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "My Doubts"
  );

  const [
    refreshing,
    setRefreshing,
  ] = useState(
    false
  );

  useFocusEffect(
    useCallback(() => {
      return () => {};
    }, [allDoubts])
  );

  const onRefresh =
    () => {
      setRefreshing(
        true
      );

      setTimeout(() => {
        setRefreshing(
          false
        );
      }, 800);
    };

  const filteredDoubts =
    useMemo(() => {

      let data = [];

      if (
        activeTab ===
        "Answered"
      ) {

        data =
          allDoubts.filter(
            item =>
              item.answered ===
              true
          );

      } else if (
        activeTab ===
        "Pending"
      ) {

        data =
          allDoubts.filter(
            item =>
              item.answered !==
              true
          );

      } else {

        data = allDoubts;

      }

      return [...data].sort(
        (a, b) => {

          const aTime =
            new Date(
              a.updatedAt ||
              a.createdAt
            ).getTime();

          const bTime =
            new Date(
              b.updatedAt ||
              b.createdAt
            ).getTime();

          return (
            bTime - aTime
          );
        }
      );

    }, [
      activeTab,
      allDoubts,
    ]);

  const getStatusColor =
    status => {

      if (
        status ===
        "Answered"
      ) {
        return COLORS.green;
      }

      if (
        status ===
        "In Progress"
      ) {
        return COLORS.orange;
      }

      return COLORS.red;
    };

  const renderItem =
    ({ item }) => {

      const statusColor =
        getStatusColor(
          item.status
        );

      return (
        <TouchableOpacity
          activeOpacity={0.92}
          style={
            styles.card
          }
          onPress={() =>
            navigation.navigate(
              "DoubtDetail",
              {
                doubtId:
                  item.id,
              }
            )
          }
        >

          {/* STATUS */}

          <View
            style={
              styles.topRow
            }
          >

            <View
              style={[
                styles.statusBox,
                {
                  backgroundColor:
                    statusColor +
                    "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      statusColor,
                  },
                ]}
              >
                {item.status ||
                  "Pending"}
              </Text>
            </View>

          </View>

          {/* QUESTION */}

          <Text
            style={
              styles.question
            }
            numberOfLines={3}
          >
            {item.question}
          </Text>

          {/* SUBJECT */}

          <View
            style={
              styles.subjectBox
            }
          >
            <Text
              style={
                styles.subjectText
              }
            >
              {item.subject}
            </Text>
          </View>

          {/* ANSWER */}

          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.answerBtn,
              {
                borderColor:
                  statusColor,
              },
            ]}
            onPress={() =>
              navigation.navigate(
                "StudentDoubtDetail",
                {
                  doubtId:
                    item.id,
                }
              )
            }
          >
            <Text
              style={[
                styles.answerBtnText,
                {
                  color:
                    statusColor,
                },
              ]}
            >
              {item.answered
                ? "View Answer"
                : "Open Doubt"}
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={
                statusColor
              }
            />
          </TouchableOpacity>

        </TouchableOpacity>
      );
    };

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >

      <StatusBar
        backgroundColor={
          COLORS.bg
        }
        barStyle="dark-content"
      />

      <FlatList
        data={
          filteredDoubts
        }
        keyExtractor={item =>
          String(item.id)
        }
        renderItem={
          renderItem
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
          />
        }
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 14,
        }}
        ListHeaderComponent={
          <>
            <View
              style={
                styles.header
              }
            >

              <TouchableOpacity
                style={
                  styles.backBtn
                }
                onPress={() =>
                  navigation.goBack()
                }
              >
                <Ionicons
                  name="arrow-back"
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
                    styles.title
                  }
                >
                  My Doubts
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Track your
                  questions
                </Text>
              </View>

              <View
                style={{
                  width: 42,
                }}
              />

            </View>

            {/* TABS */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              style={{
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              {TABS.map(
                tab => {

                  const active =
                    activeTab ===
                    tab;

                  return (
                    <TouchableOpacity
                      key={tab}
                      style={[
                        styles.tab,
                        active && {
                          backgroundColor:
                            COLORS.primary,
                        },
                      ]}
                      onPress={() =>
                        setActiveTab(
                          tab
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.tabText,
                          active && {
                            color:
                              "#fff",
                          },
                        ]}
                      >
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </ScrollView>
          </>
        }
      />

      <StudentBottomNavigation
        navigation={
          navigation
        }
        active="MyDoubts"
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
      marginTop:
        Platform.OS ===
        "android"
          ? 30
          : 6,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    backBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#fff",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    title: {
      fontSize: 22,
      fontWeight: "900",
      color:
        COLORS.text,
    },

    subtitle: {
      marginTop: 2,
      fontSize: 11,
      color:
        COLORS.muted,
      fontWeight: "700",
    },

    tab: {
      paddingHorizontal: 18,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#fff",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 10,
    },

    tabText: {
      fontWeight: "800",
      color:
        COLORS.text,
    },

    card: {
      backgroundColor:
        "#fff",
      borderRadius: 22,
      padding: 16,
      marginBottom: 14,
    },

    topRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
    },

    statusBox: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },

    statusText: {
      fontWeight: "800",
      fontSize: 12,
    },

    question: {
      marginTop: 14,
      fontSize: 17,
      lineHeight: 28,
      fontWeight: "900",
      color:
        COLORS.text,
    },

    subjectBox: {
      marginTop: 14,
      alignSelf:
        "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 12,
      backgroundColor:
        "#EEF8F6",
    },

    subjectText: {
      fontWeight: "800",
      color:
        COLORS.primary,
      fontSize: 12,
    },

    answerBtn: {
      marginTop: 18,
      height: 48,
      borderRadius: 14,
      borderWidth: 1.5,
      justifyContent:
        "center",
      alignItems:
        "center",
      flexDirection:
        "row",
    },

    answerBtnText: {
      fontWeight: "900",
      marginRight: 4,
      fontSize: 14,
    },

  });