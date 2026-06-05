
// ==========================================
// FULLY UPDATED + FIXED + COMPLETE
// StudentDoubtDetailScreen.js
// NO MISSING CODE
// REALTIME READY
// ==========================================

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  Linking,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  Audio,
  Video,
  ResizeMode,
} from "expo-av";

import {
  useAppContext,
} from "../../context/AppContext";

const { width } =
  Dimensions.get("window");

const COLORS = {
  bg: "#F5F8FD",
  white: "#FFFFFF",
  primary: "#00897B",
  primaryLight: "#EAF8F5",
  text: "#07123A",
  muted: "#7A859F",
  border: "#E8EDF5",
  success: "#17B890",
  orange: "#F59E0B",
  red: "#EF4444",
};

const resolvePlayableAudioUri = async (uri) => {
  if (!uri) return null;

  if (
    Platform.OS !== "web" ||
    !String(uri).startsWith("blob:")
  ) {
    return uri;
  }

  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Invalid audio blob"));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export default function StudentDoubtDetailScreen({
  navigation,
  route,
}) {

  const {
    allDoubts,
  } = useAppContext();

  const doubtId =
    route?.params?.doubtId;

  const studentSound =
    useRef(null);

  const teacherSound =
    useRef(null);

  const [
    playingStudentAudio,
    setPlayingStudentAudio,
  ] = useState(false);

  const [
    playingTeacherAudio,
    setPlayingTeacherAudio,
  ] = useState(false);

  // ===================================
  // REALTIME DOUBT
  // ===================================

  const latestDoubt =
    useMemo(() => {

      return (
        allDoubts?.find(
          item =>
            String(item.id) ===
            String(doubtId)
        ) || {}
      );

    }, [
      allDoubts,
      doubtId,
    ]);

  // ===================================
  // STATUS COLOR
  // ===================================

  const statusColor =
    latestDoubt?.status ===
    "Answered"
      ? COLORS.success
      : latestDoubt?.status ===
        "In Progress"
      ? COLORS.orange
      : COLORS.red;

  // ===================================
  // AUDIO CLEANUP
  // ===================================

  const stopStudentAudio =
    async () => {

      try {

        if (
          studentSound.current
        ) {

          await studentSound.current.stopAsync();

          await studentSound.current.unloadAsync();

          studentSound.current =
            null;
        }

        setPlayingStudentAudio(
          false
        );

      } catch (e) {

        console.log(e);

      }
    };

  const stopTeacherAudio =
    async () => {

      try {

        if (
          teacherSound.current
        ) {

          await teacherSound.current.stopAsync();

          await teacherSound.current.unloadAsync();

          teacherSound.current =
            null;
        }

        setPlayingTeacherAudio(
          false
        );

      } catch (e) {

        console.log(e);

      }
    };

  useEffect(() => {

    return () => {

      stopStudentAudio();

      stopTeacherAudio();

    };

  }, []);

  // ===================================
  // PLAY STUDENT AUDIO
  // ===================================

  const playStudentAudio =
      async () => {

        try {

        if (
          !latestDoubt.audioUri
        ) {
          return;
        }

          if (
            playingStudentAudio
          ) {

            await stopStudentAudio();

            return;
          }

          const playableUri =
            await resolvePlayableAudioUri(
              latestDoubt.audioUri
            );

          if (!playableUri) {
            setPlayingStudentAudio(false);
            return;
          }

          const { sound } =
            await Audio.Sound.createAsync(
              {
                uri:
                  playableUri,
              }
            );

        studentSound.current =
          sound;

        setPlayingStudentAudio(
          true
        );

        sound.setOnPlaybackStatusUpdate(
          status => {

            if (
              status.didJustFinish
            ) {

              stopStudentAudio();

            }
          }
        );

        await sound.playAsync();

      } catch (e) {

        console.log(e);

      }
    };

  // ===================================
  // PLAY TEACHER AUDIO
  // ===================================

  const playTeacherAudio =
      async () => {

      try {

        if (
          !latestDoubt.answerAudio
        ) {
          return;
        }

          if (
            playingTeacherAudio
          ) {

            await stopTeacherAudio();

            return;
          }

          const playableUri =
            await resolvePlayableAudioUri(
              latestDoubt.answerAudio
            );

          if (!playableUri) {
            setPlayingTeacherAudio(false);
            return;
          }

          const { sound } =
            await Audio.Sound.createAsync(
              {
                uri:
                  playableUri,
              }
            );

        teacherSound.current =
          sound;

        setPlayingTeacherAudio(
          true
        );

        sound.setOnPlaybackStatusUpdate(
          status => {

            if (
              status.didJustFinish
            ) {

              stopTeacherAudio();

            }
          }
        );

        await sound.playAsync();

      } catch (e) {

        console.log(e);

      }
    };

  // ===================================
  // OPEN DOCUMENT
  // ===================================

  const openDocument =
    async uri => {

      try {

        await Linking.openURL(
          uri
        );

      } catch (e) {

        console.log(e);

      }
    };

  // ===================================
  // OPEN ANSWER
  // ===================================

  const handleViewAnswer =
    () => {

      if (
        !latestDoubt?.answered
      ) {
        return;
      }

      if (
        latestDoubt.answerType ===
        "Text"
      ) {

        navigation.navigate(
          "AnswerTextScreen",
          {
            doubtId:
              latestDoubt.id,
          }
        );

      }

      else if (
        latestDoubt.answerType ===
        "Audio"
      ) {

        navigation.navigate(
          "AnswerVoiceScreen",
          {
            doubtId:
              latestDoubt.id,
          }
        );

      }

      else if (
        latestDoubt.answerType ===
        "Video"
      ) {

        navigation.navigate(
          "AnswerVideoScreen",
          {
            doubtId:
              latestDoubt.id,
          }
        );

      }
    };

  const allImages = [

    ...(latestDoubt.cameraImages ||
      []),

    ...(latestDoubt.galleryImages ||
      []),

  ];

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
          style={
            styles.headerBtn
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
              styles.headerTitle
            }
          >
            Doubt Details
          </Text>

          <Text
            style={
              styles.headerSub
            }
          >
            Student Question
          </Text>

        </View>

        <View
          style={{
            width: 44,
          }}
        />

      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >

        {/* STATUS */}

        <View
          style={[
            styles.statusCard,
            {
              backgroundColor:
                statusColor +
                "15",
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
            {latestDoubt.status ||
              "Pending"}
          </Text>

        </View>

        {/* QUESTION */}

        <View
          style={
            styles.card
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Question
          </Text>

          <Text
            style={
              styles.question
            }
          >
            {
              latestDoubt.question
            }
          </Text>

        </View>

        {/* SUBJECT */}

        <View
          style={
            styles.card
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Subject
          </Text>

          <View
            style={
              styles.subjectBadge
            }
          >

            <Text
              style={
                styles.subjectText
              }
            >
              {
                latestDoubt.subject
              }
            </Text>

          </View>

        </View>

        {/* STUDENT AUDIO */}

        {latestDoubt.audioUri && (

          <View
            style={
              styles.card
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              Student Audio
            </Text>

            <TouchableOpacity
              style={
                styles.audioBtn
              }
              onPress={
                playStudentAudio
              }
            >

              <Ionicons
                name={
                  playingStudentAudio
                    ? "pause"
                    : "play"
                }
                size={22}
                color="#fff"
              />

              <Text
                style={
                  styles.audioBtnText
                }
              >
                {playingStudentAudio
                  ? "Pause Audio"
                  : "Play Audio"}
              </Text>

            </TouchableOpacity>

          </View>

        )}

        {/* STUDENT VIDEO */}

        {latestDoubt.videoUri && (

          <View
            style={
              styles.card
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              Student Video
            </Text>

            <Video
              source={{
                uri:
                  latestDoubt.videoUri,
              }}
              style={
                styles.video
              }
              useNativeControls
              resizeMode={
                ResizeMode.CONTAIN
              }
            />

          </View>

        )}

        {/* IMAGES */}

        {allImages.length >
          0 && (

          <View
            style={
              styles.card
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              Uploaded Images
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
            >

              {allImages.map(
                (
                  item,
                  index
                ) => (

                  <Image
                    key={index}
                    source={{
                      uri:
                        item.uri,
                    }}
                    style={
                      styles.image
                    }
                  />

                )
              )}

            </ScrollView>

          </View>

        )}

        {/* DOCUMENTS */}

        {latestDoubt.documents
          ?.length >
          0 && (

          <View
            style={
              styles.card
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              Documents
            </Text>

            {latestDoubt.documents.map(
              (
                item,
                index
              ) => (

                <TouchableOpacity
                  key={index}
                  style={
                    styles.docRow
                  }
                  onPress={() =>
                    openDocument(
                      item.uri
                    )
                  }
                >

                  <Ionicons
                    name="document-text"
                    size={22}
                    color={
                      COLORS.primary
                    }
                  />

                  <Text
                    numberOfLines={
                      1
                    }
                    style={
                      styles.docName
                    }
                  >
                    {item.name}
                  </Text>

                </TouchableOpacity>

              )
            )}

          </View>

        )}

        {/* TEACHER ANSWER */}

        {latestDoubt.answered && (

          <View
            style={
              styles.answerCard
            }
          >

            <Text
              style={
                styles.answerTitle
              }
            >
              Teacher Answer
            </Text>

            {/* TEXT ANSWER */}

            {latestDoubt.answerType ===
              "Text" && (

              <Text
                style={
                  styles.answerText
                }
              >
                {
                  latestDoubt.answerText
                }
              </Text>

            )}

            {/* AUDIO ANSWER */}

            {latestDoubt.answerType ===
              "Audio" && (

              <TouchableOpacity
                style={
                  styles.audioBtn
                }
                onPress={
                  playTeacherAudio
                }
              >

                <Ionicons
                  name={
                    playingTeacherAudio
                      ? "pause"
                      : "play"
                  }
                  size={22}
                  color="#fff"
                />

                <Text
                  style={
                    styles.audioBtnText
                  }
                >
                  {playingTeacherAudio
                    ? "Pause Answer"
                    : "Play Answer"}
                </Text>

              </TouchableOpacity>

            )}

            {/* VIDEO ANSWER */}

            {latestDoubt.answerType ===
              "Video" &&
              latestDoubt.answerVideo && (

              <Video
                source={{
                  uri:
                    latestDoubt.answerVideo,
                }}
                style={
                  styles.video
                }
                useNativeControls
                resizeMode={
                  ResizeMode.CONTAIN
                }
              />

            )}

            {/* OPEN ANSWER */}

            <TouchableOpacity
              style={
                styles.viewAnswerBtn
              }
              onPress={
                handleViewAnswer
              }
            >

              <Ionicons
                name="chatbubble"
                size={22}
                color="#fff"
              />

              <Text
                style={
                  styles.viewAnswerText
                }
              >
                Open Full Answer
              </Text>

            </TouchableOpacity>

          </View>

        )}

      </ScrollView>

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
      marginTop:30,
      paddingHorizontal: 14,
      paddingTop:
        Platform.OS ===
        "android"
          ? 10
          : 8,
      paddingBottom: 14,
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
    },

    headerBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        COLORS.white,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: "900",
      color:
        COLORS.text,
    },

    headerSub: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: "700",
      color:
        COLORS.muted,
    },

    statusCard: {
      alignSelf:
        "flex-start",
      marginHorizontal: 16,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 14,
      marginBottom: 14,
    },

    statusText: {
      fontWeight: "900",
      fontSize: 13,
    },

    card: {
      backgroundColor:
        "#fff",
      borderRadius: 22,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: "900",
      color:
        COLORS.text,
      marginBottom: 14,
    },

    question: {
      fontSize: 17,
      lineHeight: 30,
      fontWeight: "700",
      color:
        COLORS.text,
    },

    subjectBadge: {
      alignSelf:
        "flex-start",
      backgroundColor:
        "#EEF8F6",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
    },

    subjectText: {
      color:
        COLORS.primary,
      fontWeight: "800",
    },

    audioBtn: {
      height: 54,
      borderRadius: 16,
      backgroundColor:
        COLORS.primary,
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    audioBtnText: {
      color: "#fff",
      fontWeight: "900",
      fontSize: 15,
      marginLeft: 10,
    },

    video: {
      width: "100%",
      height: 240,
      borderRadius: 18,
      backgroundColor:
        "#000",
    },

    image: {
      width: 140,
      height: 140,
      borderRadius: 18,
      marginRight: 12,
    },

    docRow: {
      height: 58,
      borderRadius: 14,
      backgroundColor:
        "#F7FAFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 14,
      marginBottom: 12,
    },

    docName: {
      flex: 1,
      marginLeft: 10,
      fontWeight: "700",
      color:
        COLORS.text,
    },

    answerCard: {
      backgroundColor:
        "#EAF8F5",
      borderRadius: 22,
      padding: 18,
      marginHorizontal: 16,
      marginTop: 10,
    },

    answerTitle: {
      fontSize: 18,
      fontWeight: "900",
      color:
        COLORS.success,
      marginBottom: 14,
    },

    answerText: {
      fontSize: 16,
      lineHeight: 28,
      color:
        COLORS.text,
      fontWeight: "700",
    },

    viewAnswerBtn: {
      height: 56,
      borderRadius: 18,
      backgroundColor:
        COLORS.primary,
      marginTop: 20,
      justifyContent:
        "center",
      alignItems:
        "center",
      flexDirection:
        "row",
    },

    viewAnswerText: {
      color: "#fff",
      fontWeight: "900",
      fontSize: 16,
      marginLeft: 10,
    },

  });
