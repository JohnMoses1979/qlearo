

// FULLY UPDATED + REALTIME + PREMIUM
// screens/teacher/AvailableDoubtsScreen.js
// NO MISSING CODE
// PRODUCTION READY
// EXPO SAFE
// ANDROID SAFE

import React,
{
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
  Platform,
  Dimensions,
  RefreshControl,
  TextInput,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";

import {
  useFocusEffect,
} from "@react-navigation/native";

import TeacherBottomNavigation
from "../../components/TeacherBottomNavigation";

import {
  useAppContext,
} from "../../context/AppContext";

const { width } =
  Dimensions.get("window");

const COLORS = {
  bg: "#F6F8FC",

  white: "#FFFFFF",

  primary: "#006D6A",

  primaryLight:
    "#EAF8F6",

  text: "#07123A",

  muted: "#7A859F",

  border: "#E6ECF5",

  green: "#00A86B",

  orange: "#F59E0B",

  red: "#EF4444",

  shadow:
    "rgba(0,0,0,0.08)",
};

export default function AvailableDoubtsScreen({
  navigation,
}) {
  const {
    teacherDoubts,
    teacherPendingDoubts,
    teacherAnsweredDoubts,
    currentUser,
    teacherMockCatalog,

    acceptDoubt,
    refreshDoubtsAndNotifications,
  } = useAppContext();

  const [selectedFilter, setSelectedFilter] =
    useState("all");

  const [refreshing, setRefreshing] =
    useState(false);

  const [acceptingId, setAcceptingId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  // ====================================
  // REALTIME REFRESH
  // ====================================

  useFocusEffect(
    useCallback(() => {
      void refreshDoubtsAndNotifications?.();
      return () => {};
    }, [refreshDoubtsAndNotifications])
  );

  // ====================================
  // REFRESH
  // ====================================

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // ====================================
  // FILTERS
  // ====================================

  const FILTERS = useMemo(() => {
    const items = [
      {
        id: "all",
        label: "All",
      },
    ];

    const seen = new Set(["all"]);

    const addFilter = (value, label) => {
      const raw = String(value || "").trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      items.push({
        id: raw,
        label: label || raw,
      });
    };

    (teacherDoubts || []).forEach((item) => {
      addFilter(item?.subject, item?.subject);
      addFilter(item?.categoryTitle, item?.categoryTitle);
      addFilter(item?.topic, item?.topic);
    });

    (teacherMockCatalog || []).forEach((category) => {
      addFilter(category?.title, category?.title);
      (Array.isArray(category?.subjects) ? category.subjects : []).forEach((subject) => {
        addFilter(subject?.name, subject?.name);
      });
    });

    return items;
  }, [teacherDoubts, teacherMockCatalog]);

  // ====================================
  // FILTERED DOUBTS
  // ====================================

  const filteredDoubts =
    useMemo(() => {
      let doubts = [...teacherPendingDoubts];

      if (selectedFilter !== "all") {
        const selected = String(selectedFilter).trim().toLowerCase();
        doubts = doubts.filter((item) => {
          const fields = [
            item?.subject,
            item?.categoryTitle,
            item?.topic,
          ]
            .filter(Boolean)
            .map((value) => String(value).trim().toLowerCase());

          return fields.includes(selected);
        });
      }

      if (
        search.trim()
      ) {
        doubts =
          doubts.filter(
            item =>
              `${item.question}
              ${item.subject}
              ${item.studentName}`
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
          );
      }

      return [...doubts].sort(
        (a, b) => {
          const aTime =
            new Date(
              a.updatedAt ||
                a.createdAt ||
                0
            ).getTime();

          const bTime =
            new Date(
              b.updatedAt ||
                b.createdAt ||
                0
            ).getTime();

          return bTime - aTime;
        }
      );
    }, [
      selectedFilter,
      teacherPendingDoubts,
      search,
    ]);

  const filteredAnsweredDoubts = useMemo(() => {
    let doubts = [...(teacherAnsweredDoubts || [])];

    if (selectedFilter !== "all") {
      const selected = String(selectedFilter).trim().toLowerCase();
      doubts = doubts.filter((item) => {
        const fields = [item?.subject, item?.categoryTitle, item?.topic]
          .filter(Boolean)
          .map((value) => String(value).trim().toLowerCase());

        return fields.includes(selected);
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      doubts = doubts.filter((item) =>
        `${item.question || ""} ${item.subject || ""} ${item.studentName || ""} ${
          item.answerText || item.answerPreview || item.answer || ""
        }`
          .toLowerCase()
          .includes(q)
      );
    }

    return [...doubts].sort((a, b) => {
      const aTime = new Date(a.answeredAt || a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.answeredAt || b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [selectedFilter, search, teacherAnsweredDoubts]);

  const totalVisibleDoubts = filteredDoubts.length + filteredAnsweredDoubts.length;

  // ====================================
  // TIME AGO
  // ====================================

  const getTimeAgo =
    date => {
      if (!date)
        return "Now";

      const diff =
        Date.now() -
        new Date(
          date
        ).getTime();

      const mins =
        Math.floor(
          diff / 60000
        );

      if (mins < 1)
        return "Now";

      if (mins < 60)
        return `${mins}m ago`;

      const hrs =
        Math.floor(
          mins / 60
        );

      if (hrs < 24)
        return `${hrs}h ago`;

      const days =
        Math.floor(
          hrs / 24
        );

      return `${days}d ago`;
    };

  // ====================================
  // SUBJECT ICON
  // ====================================

  const renderIcon =
    subject => {
      switch (
        subject
      ) {
        case "Physics":
          return (
            <MaterialCommunityIcons
              name="atom"
              size={28}
              color="#0E6172"
            />
          );

        case "Chemistry":
          return (
            <Ionicons
              name="flask-outline"
              size={28}
              color="#00A86B"
            />
          );

        case "Biology":
          return (
            <MaterialCommunityIcons
              name="dna"
              size={28}
              color="#6A35E2"
            />
          );

        default:
          return (
            <MaterialCommunityIcons
              name="calculator"
              size={28}
              color="#FF6B00"
            />
          );
      }
    };

  // ====================================
  // ACCEPT
  // ====================================

  const handleAccept =
    async item => {
      try {
        if (
          item.accepted ||
          acceptingId
        )
          return;

        setAcceptingId(
          item.id
        );

          const success =
            await acceptDoubt(
              item.id,
              {
                id: currentUser?.teacherId || currentUser?.id,
                teacherId: currentUser?.teacherId || currentUser?.id,
                name: currentUser?.fullName || currentUser?.name || "Teacher",
                teacherName: currentUser?.fullName || currentUser?.name || "Teacher",
              }
            );

        if (
          success
        ) {
          navigation.navigate(
            "TeacherDoubtDetail",
            {
              doubtId:
                item.id,

              doubt: {
                ...item,

                accepted: true,

                status:
                  "In Progress",

                  assignedTeacher:
                    currentUser?.fullName || currentUser?.name || "Teacher",
                },
              }
            );
        }
      } catch (
        error
      ) {
        console.log(
          error
        );
      } finally {
        setAcceptingId(
          null
        );
      }
    };

  // ====================================
  // CARD
  // ====================================

  const renderDoubtCard =
    ({
      item,
      index,
    }) => {
      const accepted =
        item.accepted;

      return (
        <TouchableOpacity
          activeOpacity={
            0.92
          }
          style={[
            styles.card,

            accepted && {
              borderColor:
                COLORS.orange +
                "30",

              backgroundColor:
                "#FFF9F1",
            },
          ]}
          onPress={() =>
            navigation.navigate(
              "TeacherDoubtDetail",
              {
                doubtId:
                  item.id,

                doubt:
                  item,
              }
            )
          }
        >
          {/* LEFT */}

          <View
            style={
              styles.iconBox
            }
          >
            {renderIcon(
              item.subject
            )}
          </View>

          {/* CENTER */}

          <View
            style={
              styles.content
            }
          >
            <Text
              numberOfLines={
                2
              }
              style={
                styles.title
              }
            >
              {
                item.question
              }
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              {
                item.subject
              }{" "}
              •{" "}
              {
                item.className
              }
            </Text>

            <Text
              style={
                styles.time
              }
            >
              {getTimeAgo(
                item.createdAt
              )}{" "}
              •{" "}
              {
                item.studentName
              }
            </Text>

            {/* TOPIC */}

            {item.topic ? (
              <View
                style={
                  styles.topicBadge
                }
              >
                <Text
                  style={
                    styles.topicText
                  }
                >
                  {
                    item.topic
                  }
                </Text>
              </View>
            ) : null}
          </View>

          {/* RIGHT */}

          <View
            style={
              styles.rightContent
            }
          >
            <Text
              style={
                styles.price
              }
            >
              ₹30
            </Text>

            <TouchableOpacity
              activeOpacity={
                0.88
              }
              disabled={
                accepted ||
                acceptingId ===
                  item.id
              }
              onPress={() =>
                handleAccept(
                  item
                )
              }
              style={[
                styles.acceptBtn,

                accepted &&
                  styles.acceptedBtn,
              ]}
            >
              <Text
                style={
                  styles.acceptText
                }
              >
                {acceptingId ===
                item.id
                  ? "Accepting..."
                  : accepted
                  ? "Accepted"
                  : "Accept"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    };

  const renderAnsweredDoubtCard = ({ item }) => {
    const answerPreview = String(
      item.answerText || item.answerPreview || item.answer || "Answer available"
    ).trim();

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        style={[styles.card, styles.answeredCard]}
        onPress={() =>
          navigation.navigate("TeacherDoubtDetail", {
            doubtId: item.id,
            doubt: item,
          })
        }
      >
        <View style={styles.iconBox}>{renderIcon(item.subject)}</View>

        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>
            {item.question}
          </Text>

          <Text style={styles.subtitle}>
            {item.subject} â€¢ {item.className}
          </Text>

          <Text style={styles.time}>
            {getTimeAgo(item.answeredAt || item.updatedAt || item.createdAt)} â€¢{" "}
            {item.studentName}
          </Text>

          <View style={styles.answerPreviewBox}>
            <Text numberOfLines={2} style={styles.answerPreviewText}>
              {answerPreview}
            </Text>
          </View>
        </View>

        <View style={styles.rightContent}>
          <Text style={styles.price}>â‚¹30</Text>
          <View style={[styles.acceptBtn, styles.answeredBtn]}>
            <Text style={styles.acceptText}>Answered</Text>
          </View>
        </View>
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

      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >
        <TouchableOpacity
          activeOpacity={
            0.8
          }
          onPress={() =>
            navigation.goBack()
          }
          style={
            styles.headerBtn
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
              styles.headerTitle
            }
          >
            Available
            Doubts
          </Text>

          <Text
            style={
              styles.headerSub
            }
          >
            Accept student
            doubts
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={
            0.8
          }
          style={
            styles.headerBtn
          }
        >
          <Feather
            name="bell"
            size={20}
            color={
              COLORS.text
            }
          />

          <View
            style={
              styles.dot
            }
          >
            <Text
              style={
                styles.dotText
              }
            >
              {totalVisibleDoubts >
              9
                ? "9+"
                : totalVisibleDoubts}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}

      <View
        style={
          styles.searchBox
        }
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={
            COLORS.muted
          }
        />

        <TextInput
          value={search}
          onChangeText={
            setSearch
          }
          placeholder="Search doubts..."
          placeholderTextColor={
            COLORS.muted
          }
          style={
            styles.searchInput
          }
        />
      </View>

      {/* FILTERS */}

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={item =>
          item.id
        }
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.filterContainer
        }
        renderItem={({
          item,
        }) => {
          const active =
            selectedFilter ===
            item.id;

          return (
            <TouchableOpacity
              activeOpacity={
                0.88
              }
              onPress={() =>
                setSelectedFilter(
                  item.id
                )
              }
              style={[
                styles.filterBtn,

                active &&
                  styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,

                  active &&
                    styles.activeFilterText,
                ]}
              >
                {
                  item.label
                }
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* LIST */}

      <FlatList
        data={
          filteredDoubts
        }
        extraData={
          filteredDoubts
        }
        keyExtractor={item =>
          item.id.toString()
        }
        renderItem={
          renderDoubtCard
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            tintColor={
              COLORS.primary
            }
            colors={[
              COLORS.primary,
            ]}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 150,
        }}
        ListEmptyComponent={
          filteredAnsweredDoubts.length === 0 ? (
            <View
              style={
                styles.emptyWrap
              }
            >
              <View
                style={
                  styles.emptyIconBox
                }
              >
                <Ionicons
                  name="document-text-outline"
                  size={70}
                  color="#C8D2E4"
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No Doubts
                Available
              </Text>

              <Text
                style={
                  styles.emptySub
                }
              >
                New student
                doubts will
                appear here
                automatically.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          filteredAnsweredDoubts.length > 0 ? (
            <View>
              <View style={styles.footerSpacer} />

              <View style={styles.solvedSection}>
                <Text style={styles.solvedHeader}>Solved Doubts</Text>
                <Text style={styles.solvedSub}>
                  Answered doubts appear here with a preview of the answer.
                </Text>

                {filteredAnsweredDoubts.map((item) => (
                  <View key={`answered-${item.id}`}>
                    {renderAnsweredDoubtCard({ item })}
                  </View>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      {/* BOTTOM */}

      <TeacherBottomNavigation
        navigation={
          navigation
        }
        active="Doubts"
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
      paddingHorizontal: 16,

      paddingTop:
        Platform.OS ===
        "android"
          ? 10
          : 8,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    headerBtn: {
      width: 44,
      height: 44,
      borderRadius: 15,

      backgroundColor:
        COLORS.white,

      justifyContent:
        "center",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        COLORS.border,

      position:
        "relative",

      shadowColor:
        "#000",

      shadowOpacity: 0.04,

      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 2,
    },

    dot: {
      minWidth: 18,
      height: 18,
      borderRadius: 10,

      backgroundColor:
        "#FF3B30",

      position:
        "absolute",

      top: 4,
      right: 4,

      justifyContent:
        "center",

      alignItems:
        "center",

      paddingHorizontal: 2,
    },

    dotText: {
      fontSize: 7,
      fontWeight:
        "900",
      color: "#FFFFFF",
    },

    headerTitle: {
      fontSize:
        width < 360
          ? 18
          : 20,

      fontWeight:
        "900",

      color:
        COLORS.text,
    },

    headerSub: {
      marginTop: 3,

      fontSize: 11,

      fontWeight:
        "700",

      color:
        COLORS.muted,
    },

    searchBox: {
      marginTop: 18,

      marginHorizontal: 16,

      height: 52,

      borderRadius: 16,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal: 16,
    },

    searchInput: {
      flex: 1,

      marginLeft: 10,

      fontSize: 14,

      fontWeight:
        "600",

      color:
        COLORS.text,

      paddingVertical: 0,
    },

    filterContainer: {
      paddingLeft: 14,

      paddingRight: 8,

      paddingVertical: 18,
    },

    filterBtn: {
      height: 40,

      paddingHorizontal: 16,

      backgroundColor:
        COLORS.white,

      borderRadius: 12,

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 10,

      borderWidth: 1,

      borderColor:
        COLORS.border,
    },

    activeFilter: {
      backgroundColor:
        COLORS.primary,

      borderColor:
        COLORS.primary,
    },

    filterText: {
      fontSize: 12,

      fontWeight:
        "800",

      color:
        COLORS.text,
    },

    activeFilterText: {
      color:
        COLORS.white,
    },

    card: {
      backgroundColor:
        COLORS.white,

      borderRadius: 22,

      padding: 12,

      marginBottom: 14,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        COLORS.border,

      shadowColor:
        "#000",

      shadowOpacity: 0.04,

      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 2,
    },

    iconBox: {
      width: 60,

      height: 60,

      borderRadius: 18,

      backgroundColor:
        "#F3FBF9",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    content: {
      flex: 1,

      marginLeft: 12,
    },

    title: {
      fontSize: 13,

      fontWeight:
        "900",

      color:
        COLORS.text,

      lineHeight: 20,
    },

    subtitle: {
      marginTop: 4,

      fontSize: 10.5,

      fontWeight:
        "700",

      color:
        COLORS.muted,
    },

    time: {
      marginTop: 6,

      fontSize: 9.5,

      fontWeight:
        "700",

      color:
        COLORS.muted,
    },

    topicBadge: {
      marginTop: 10,

      alignSelf:
        "flex-start",

      paddingHorizontal: 10,

      paddingVertical: 6,

      borderRadius: 30,

      backgroundColor:
        "#EEF8F6",
    },

    topicText: {
      fontSize: 10,

      fontWeight:
        "900",

      color:
        COLORS.primary,
    },

    rightContent: {
      alignItems:
        "flex-end",

      marginLeft: 6,
    },

    price: {
      fontSize: 18,

      fontWeight:
        "900",

      color:
        COLORS.green,

      marginBottom: 8,
    },

    acceptBtn: {
      minWidth: 84,

      height: 38,

      backgroundColor:
        COLORS.primary,

      borderRadius: 14,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    acceptedBtn: {
      backgroundColor:
        COLORS.orange,
    },

    answeredBtn: {
      backgroundColor:
        COLORS.green,
    },

    answeredCard: {
      marginTop: 6,
      paddingVertical: 9,
    },

    answerPreviewBox: {
      marginTop: 6,

      paddingHorizontal: 10,
      paddingVertical: 6,

      borderRadius: 14,

      backgroundColor: "#EEF9F7",

      borderWidth: 1,
      borderColor: "#D8F0EC",
    },

    answerPreviewText: {
      fontSize: 9.5,

      lineHeight: 15,

      color: COLORS.text,

      fontWeight: "700",
    },

    solvedSection: {
      marginTop: 30,
      marginBottom: 14,
      paddingTop: 0,
    },

    footerSpacer: {
      height: 18,
    },

    solvedHeader: {
      fontSize: 14,
      fontWeight: "900",
      color: COLORS.text,
      marginBottom: 4,
    },

    solvedSub: {
      fontSize: 10.5,
      color: COLORS.muted,
      marginBottom: 8,
      fontWeight: "600",
    },

    acceptText: {
      color:
        COLORS.white,

      fontSize: 11,

      fontWeight:
        "900",
    },

    emptyWrap: {
      marginTop: 90,

      alignItems:
        "center",
    },

    emptyIconBox: {
      width: 120,

      height: 120,

      borderRadius: 60,

      backgroundColor:
        "#F4F7FC",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginBottom: 10,
    },

    emptyTitle: {
      marginTop: 14,

      fontSize: 20,

      fontWeight:
        "900",

      color:
        COLORS.text,
    },

    emptySub: {
      marginTop: 8,

      fontSize: 14,

      color:
        COLORS.muted,

      textAlign:
        "center",

      lineHeight: 24,

      fontWeight:
        "600",
    },
  });
