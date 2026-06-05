
// FULLY UPDATED + COMPLETE STYLES
// screens/teacher/AnswerSuccessScreen.js
// PREMIUM UI + REALTIME + AUTO REDIRECT
// NO MISSING CODE

import React, {
  useMemo,
  useEffect,
  useRef,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScrollView,
  Animated,
} from "react-native";

import {
  Ionicons,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";

import {
  LinearGradient,
} from "expo-linear-gradient";

import {
  useAppContext,
} from "../../context/AppContext";

const { width } =
  Dimensions.get("window");

const COLORS = {
  bg: "#F5F7FB",

  white: "#FFFFFF",

  primary: "#006D6A",

  primaryDark:
    "#004D4A",

  primaryLight:
    "#EAF8F6",

  text: "#07123A",

  muted: "#7A859F",

  border: "#E6ECF5",

  green: "#00A86B",

  card: "#FAFBFE",

  orange: "#FF9800",

  successLight:
    "#E9FFF5",
};

export default function AnswerSuccessScreen({
  navigation,

  route,
}) {
  const {
    answeredDoubts,
  } = useAppContext();

  const answerType =
    route?.params
      ?.answerType ||
    "Text Answer";

  const doubt =
    route?.params
      ?.doubt || {};

  // ====================================
  // ANIMATION
  // ====================================

  const scaleAnim =
    useRef(
      new Animated.Value(
        0.7
      )
    ).current;

  const opacityAnim =
    useRef(
      new Animated.Value(
        0
      )
    ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(
        scaleAnim,
        {
          toValue: 1,

          friction: 5,

          tension: 80,

          useNativeDriver: true,
        }
      ),

      Animated.timing(
        opacityAnim,
        {
          toValue: 1,

          duration: 700,

          useNativeDriver: true,
        }
      ),
    ]).start();

    const timer =
      setTimeout(() => {
        navigation.reset(
          {
            index: 0,

            routes: [
              {
                name:
                  "TeacherDashboard",
              },
            ],
          }
        );
      }, 7000);

    return () =>
      clearTimeout(
        timer
      );
  }, []);

  // ====================================
  // ICON
  // ====================================

  const renderAnswerIcon =
    () => {
      if (
        answerType ===
        "Text Answer"
      ) {
        return (
          <Feather
            name="file-text"
            size={18}
            color={
              COLORS.primary
            }
          />
        );
      }

      if (
        answerType ===
        "Video Answer"
      ) {
        return (
          <Ionicons
            name="videocam-outline"
            size={18}
            color={
              COLORS.primary
            }
          />
        );
      }

      return (
        <Ionicons
          name="mic-outline"
          size={18}
          color={
            COLORS.primary
          }
        />
      );
    };

  // ====================================
  // SUBJECT ICON
  // ====================================

  const renderSubjectIcon =
    () => {
      switch (
        doubt.subject
      ) {
        case "Physics":
          return (
            <Ionicons
              name="planet-outline"
              size={30}
              color="#0E6172"
            />
          );

        case "Chemistry":
          return (
            <Ionicons
              name="flask-outline"
              size={30}
              color="#00A86B"
            />
          );

        case "Biology":
          return (
            <Ionicons
              name="leaf-outline"
              size={30}
              color="#4CAF50"
            />
          );

        default:
          return (
            <Ionicons
              name="calculator-outline"
              size={30}
              color="#FF9800"
            />
          );
      }
    };

  // ====================================
  // TIME
  // ====================================

  const submittedTime =
    useMemo(() => {
      return "Submitted just now";
    }, []);

  // ====================================
  // TOTAL ANSWERS
  // ====================================

  const totalAnswers =
    answeredDoubts.length;

  // ====================================
  // HOME
  // ====================================

  const goHome =
    () => {
      navigation.reset({
        index: 0,

        routes: [
          {
            name:
              "TeacherDashboard",
          },
        ],
      });
    };

  // ====================================
  // MORE DOUBTS
  // ====================================

  const goToDoubts =
    () => {
      navigation.reset({
        index: 0,

        routes: [
          {
            name:
              "AvailableDoubts",
          },
        ],
      });
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

      <Animated.View
        style={[
          styles.header,

          {
            opacity:
              opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={
            0.8
          }
          style={
            styles.headerBtn
          }
          onPress={
            goToDoubts
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={
              COLORS.text
            }
          />
        </TouchableOpacity>

        <Text
          style={
            styles.headerTitle
          }
        >
          Success
        </Text>

        <View
          style={{
            width: 46,
          }}
        />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* SUCCESS */}

        <Animated.View
          style={{
            transform:
              [
                {
                  scale:
                    scaleAnim,
                },
              ],

            opacity:
              opacityAnim,
          }}
        >
          <LinearGradient
            colors={[
              "#DFFEF2",
              "#ECFFF7",
            ]}
            style={
              styles.successCircle
            }
          >
            <View
              style={
                styles.successGlow
              }
            />

            <View
              style={
                styles.innerCircle
              }
            >
              <Ionicons
                name="checkmark"
                size={72}
                color={
                  COLORS.white
                }
              />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* TITLE */}

        <Text
          style={
            styles.title
          }
        >
          Answer Sent
          Successfully!
        </Text>

        <Text
          style={
            styles.subTitle
          }
        >
          Your answer
          has been
          delivered to
          the student in
          realtime.
        </Text>

        {/* CARD */}

        <Animated.View
          style={[
            styles.doubtCard,

            {
              opacity:
                opacityAnim,
            },
          ]}
        >
          {/* TOP */}

          <View
            style={
              styles.subjectRow
            }
          >
            <View
              style={
                styles.subjectIcon
              }
            >
              {renderSubjectIcon()}
            </View>

            <View
              style={
                styles.subjectMiddle
              }
            >
              <Text
                numberOfLines={
                  2
                }
                style={
                  styles.subjectTitle
                }
              >
                {doubt.question ||
                  "Student Doubt"}
              </Text>

              <Text
                style={
                  styles.subjectSub
                }
              >
                {doubt.subject ||
                  "Subject"}{" "}
                •{" "}
                {doubt.className ||
                  "Class"}
              </Text>
            </View>

            <Text
              style={
                styles.price
              }
            >
              ₹30
            </Text>
          </View>

          {/* ANSWER TYPE */}

          <View
            style={
              styles.answerTypeRow
            }
          >
            <View
              style={
                styles.answerTypeBox
              }
            >
              {renderAnswerIcon()}

              <Text
                style={
                  styles.answerTypeText
                }
              >
                {
                  answerType
                }
              </Text>
            </View>

            <View
              style={
                styles.statusBadge
              }
            >
              <Text
                style={
                  styles.statusText
                }
              >
                Delivered
              </Text>
            </View>
          </View>

          {/* PREVIEW */}

          {doubt.answerText ? (
            <View
              style={
                styles.previewCard
              }
            >
              <Text
                style={
                  styles.previewLabel
                }
              >
                Answer
                Preview
              </Text>

              <Text
                numberOfLines={
                  4
                }
                style={
                  styles.previewText
                }
              >
                {
                  doubt.answerText
                }
              </Text>
            </View>
          ) : null}

          {/* INFO */}

          <View
            style={
              styles.infoContainer
            }
          >
            <View
              style={
                styles.infoRow
              }
            >
              <MaterialIcons
                name="access-time"
                size={20}
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.infoText
                }
              >
                {
                  submittedTime
                }
              </Text>
            </View>

            <View
              style={
                styles.infoRow
              }
            >
              <Ionicons
                name="wallet-outline"
                size={20}
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.infoText
                }
              >
                Reward will
                be credited
                after
                student
                review
              </Text>
            </View>

            <View
              style={
                styles.infoRow
              }
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.infoText
                }
              >
                Student has
                been
                notified
                instantly
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* STATS */}

        <View
          style={
            styles.statsContainer
          }
        >
          <LinearGradient
            colors={[
              "#FFFFFF",
              "#F5FFFB",
            ]}
            style={
              styles.statsCard
            }
          >
            <Text
              style={
                styles.statsNumber
              }
            >
              {
                totalAnswers
              }
            </Text>

            <Text
              style={
                styles.statsLabel
              }
            >
              Total
              Answers
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={[
              "#FFFFFF",
              "#F5FFFB",
            ]}
            style={
              styles.statsCard
            }
          >
            <Text
              style={
                styles.statsNumber
              }
            >
              4.9★
            </Text>

            <Text
              style={
                styles.statsLabel
              }
            >
              Teacher
              Rating
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* BOTTOM */}

      <View
        style={
          styles.bottomContainer
        }
      >
        <TouchableOpacity
          activeOpacity={
            0.9
          }
          style={
            styles.secondaryBtn
          }
          onPress={
            goToDoubts
          }
        >
          <Ionicons
            name="grid-outline"
            size={22}
            color={
              COLORS.text
            }
          />

          <Text
            style={
              styles.secondaryText
            }
          >
            More
            Doubts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={
            0.9
          }
          style={
            styles.primaryBtn
          }
          onPress={
            goHome
          }
        >
          <LinearGradient
            colors={[
              COLORS.primary,
              COLORS.primaryDark,
            ]}
            style={
              styles.gradientBtn
            }
          >
            <Ionicons
              name="home-outline"
              size={22}
              color={
                COLORS.white
              }
            />

            <Text
              style={
                styles.primaryText
              }
            >
              Go Home
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
      paddingHorizontal: 18,
      paddingTop:
        Platform.OS ===
        "android"
          ? 14
          : 8,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    headerBtn: {
      width: 46,
      height: 46,
      borderRadius: 16,
      backgroundColor:
        COLORS.white,
      justifyContent:
        "center",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        COLORS.border,
      elevation: 3,
    },

    headerTitle: {
      fontSize:
        width < 360
          ? 20
          : 23,
      fontWeight:
        "900",
      color:
        COLORS.text,
    },

    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 130,
    },

    successCircle: {
      width: 190,
      height: 190,
      borderRadius: 120,
      justifyContent:
        "center",
      alignItems:
        "center",
      alignSelf:
        "center",
      marginTop: 20,
      position:
        "relative",
    },

    successGlow: {
      position:
        "absolute",
      width: 180,
      height: 180,
      borderRadius: 100,
      backgroundColor:
        "rgba(0,168,107,0.08)",
    },

    innerCircle: {
      width: 125,
      height: 125,
      borderRadius: 100,
      backgroundColor:
        COLORS.green,
      justifyContent:
        "center",
      alignItems:
        "center",
      elevation: 5,
    },

    title: {
      marginTop: 30,
      fontSize:
        width < 360
          ? 25
          : 30,
      fontWeight:
        "900",
      color:
        COLORS.text,
      textAlign:
        "center",
      lineHeight: 40,
    },

    subTitle: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 28,
      color:
        COLORS.muted,
      fontWeight:
        "600",
      textAlign:
        "center",
      paddingHorizontal: 10,
    },

    doubtCard: {
      marginTop: 32,
      backgroundColor:
        COLORS.white,
      borderRadius: 28,
      padding: 20,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    subjectRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    subjectIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor:
        "#F1FBF9",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    subjectMiddle: {
      flex: 1,
      marginLeft: 14,
      paddingRight: 8,
    },

    subjectTitle: {
      fontSize: 16,
      fontWeight:
        "900",
      color:
        COLORS.text,
    },

    subjectSub: {
      marginTop: 4,
      fontSize: 13,
      fontWeight:
        "700",
      color:
        COLORS.muted,
    },

    price: {
      fontSize: 28,
      fontWeight:
        "900",
      color:
        COLORS.green,
    },

    answerTypeRow: {
      marginTop: 22,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    answerTypeBox: {
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 30,
      backgroundColor:
        COLORS.primaryLight,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    answerTypeText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight:
        "800",
      color:
        COLORS.primary,
    },

    statusBadge: {
      minHeight: 40,
      paddingHorizontal: 16,
      borderRadius: 30,
      backgroundColor:
        COLORS.successLight,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    statusText: {
      fontSize: 13,
      fontWeight:
        "900",
      color:
        COLORS.green,
    },

    previewCard: {
      marginTop: 22,
      backgroundColor:
        "#FAFCFF",
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    previewLabel: {
      fontSize: 14,
      fontWeight:
        "900",
      color:
        COLORS.primary,
      marginBottom: 10,
    },

    previewText: {
      fontSize: 14,
      lineHeight: 26,
      color:
        COLORS.text,
      fontWeight:
        "600",
    },

    infoContainer: {
      marginTop: 24,
    },

    infoRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 16,
    },

    infoText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 14,
      lineHeight: 24,
      color:
        COLORS.text,
      fontWeight:
        "600",
    },

    statsContainer: {
      flexDirection:
        "row",
      marginTop: 24,
    },

    statsCard: {
      flex: 1,
      minHeight: 125,
      borderRadius: 24,
      justifyContent:
        "center",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        COLORS.border,
      marginHorizontal: 6,
    },

    statsNumber: {
      fontSize: 32,
      fontWeight:
        "900",
      color:
        COLORS.primary,
    },

    statsLabel: {
      marginTop: 10,
      fontSize: 14,
      fontWeight:
        "700",
      color:
        COLORS.muted,
    },

    bottomContainer: {
      position:
        "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor:
        COLORS.white,
      borderTopWidth: 1,
      borderTopColor:
        COLORS.border,
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom:
        Platform.OS ===
        "ios"
          ? 28
          : 18,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    secondaryBtn: {
      flex: 1,
      height: 60,
      borderRadius: 18,
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 10,
    },

    secondaryText: {
      marginLeft: 8,
      fontSize: 15,
      fontWeight:
        "800",
      color:
        COLORS.text,
    },

    primaryBtn: {
      flex: 1.2,
      height: 60,
      borderRadius: 18,
      overflow:
        "hidden",
      marginLeft: 10,
    },

    gradientBtn: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 18,
    },

    primaryText: {
      marginLeft: 8,
      fontSize: 15,
      fontWeight:
        "900",
      color:
        COLORS.white,
    },
  });