
// screens/teacher/AnswerDoubtVoiceScreen.js

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
  Alert,
} from "react-native";

import {
  Audio,
} from "expo-av";

import {
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

import {
  useAppContext,
} from "../../context/AppContext";

const { width } =
  Dimensions.get("window");

const COLORS = {
  bg: "#F4F6FB",
  white: "#FFFFFF",
  primary: "#006D6A",
  primaryLight: "#EAF8F6",
  text: "#07123A",
  muted: "#7A859F",
  border: "#E5EAF3",
  danger: "#FF4D4F",
  green: "#00A86B",
};

const blobUriToDataUrl = async (uri) => {
  if (!uri || Platform.OS !== "web" || !uri.startsWith("blob:")) {
    return uri;
  }

  const response = await fetch(uri);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("Failed to convert recorded audio"));
    reader.readAsDataURL(blob);
  });
};

export default function AnswerDoubtVoiceScreen({
  navigation,
  route,
}) {
  const {
    currentUser,
    submitAudioAnswer,
  } = useAppContext();

  const teacherId =
    currentUser?.teacherId ||
    currentUser?.id ||
    "TEACHER_001";
  const teacherName =
    currentUser?.fullName ||
    currentUser?.name ||
    "Teacher";

  const doubt =
    route?.params?.doubt ||
    {};

  // ====================================
  // STATES
  // ====================================

  const [recording, setRecording] =
    useState(null);

  const [
    recordingUri,
    setRecordingUri,
  ] = useState(null);

  const [
    isRecording,
    setIsRecording,
  ] = useState(false);

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);

  const [
    isPaused,
    setIsPaused,
  ] = useState(false);

  const [duration, setDuration] =
    useState(0);

  const [
    playbackPosition,
    setPlaybackPosition,
  ] = useState(0);

  const [
    playbackDuration,
    setPlaybackDuration,
  ] = useState(0);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isCleaning, setIsCleaning] =
    useState(false);

  // ====================================
  // REFS
  // ====================================

  const soundRef =
    useRef(null);

  const timerRef =
    useRef(null);

  const pulseAnim =
    useRef(
      new Animated.Value(1)
    ).current;

  // ====================================
  // PULSE
  // ====================================

  useEffect(() => {
    let animation;

    if (isRecording) {
      animation =
        Animated.loop(
          Animated.sequence([
            Animated.timing(
              pulseAnim,
              {
                toValue: 1.08,
                duration: 700,
                useNativeDriver: true,
              }
            ),

            Animated.timing(
              pulseAnim,
              {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
              }
            ),
          ])
        );

      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isRecording]);

  // ====================================
  // TIMER
  // ====================================

  useEffect(() => {
    if (isRecording) {
      timerRef.current =
        setInterval(() => {
          setDuration(
            (prev) =>
              prev + 1
          );
        }, 1000);
    } else {
      if (
        timerRef.current
      ) {
        clearInterval(
          timerRef.current
        );
      }
    }

    return () => {
      if (
        timerRef.current
      ) {
        clearInterval(
          timerRef.current
        );
      }
    };
  }, [isRecording]);

  // ====================================
  // CLEANUP
  // ====================================

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // ====================================
  // CLEANUP AUDIO
  // ====================================

  const cleanupAudio =
    async () => {
      try {
        if (
          soundRef.current
        ) {
          await soundRef.current.stopAsync();

          await soundRef.current.unloadAsync();

          soundRef.current =
            null;
        }
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  // ====================================
  // FORMAT TIME
  // ====================================

  const formatTime =
    (seconds) => {
      const mins =
        Math.floor(
          seconds / 60
        );

      const secs =
        seconds % 60;

      return `${mins
        .toString()
        .padStart(
          2,
          "0"
        )}:${secs
        .toString()
        .padStart(
          2,
          "0"
        )}`;
    };

  // ====================================
  // START RECORDING
  // ====================================

  const startRecording =
    async () => {
      try {
        const permission =
          await Audio.requestPermissionsAsync();

        if (
          !permission.granted
        ) {
          global.showAlert(
            "Permission Required",
            "Microphone permission is required."
          );

          return;
        }

        await cleanupAudio();

        await Audio.setAudioModeAsync(
          {
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
          }
        );

        const {
          recording:
            newRecording,
        } =
          await Audio.Recording.createAsync(
            Audio
              .RecordingOptionsPresets
              .HIGH_QUALITY
          );

        setRecording(
          newRecording
        );

        setRecordingUri(
          null
        );

        setDuration(0);

        setPlaybackPosition(
          0
        );

        setPlaybackDuration(
          0
        );

        setIsPaused(
          false
        );

        setIsPlaying(
          false
        );

        setIsRecording(
          true
        );
      } catch (
        error
      ) {
        console.log(
          error
        );

        global.showAlert(
          "Recording Error",
          "Failed to start recording."
        );
      }
    };

  // ====================================
  // STOP RECORDING
  // ====================================

  const stopRecording =
    async () => {
      try {
        if (!recording)
          return;

        setIsRecording(
          false
        );

          await recording.stopAndUnloadAsync();

          const uri =
            recording.getURI();

          const stableUri =
            await blobUriToDataUrl(uri);

          setRecordingUri(
            stableUri
          );

        setRecording(
          null
        );

        await Audio.setAudioModeAsync(
          {
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
          }
        );
      } catch (
        error
      ) {
        console.log(
          error
        );

        setIsRecording(
          false
        );
      }
    };

  // ====================================
  // PLAY RECORDING
  // ====================================

  const playRecording =
    async () => {
      try {
        if (
          !recordingUri
        )
          return;

        // resume
        if (
          soundRef.current &&
          isPaused
        ) {
          await soundRef.current.playAsync();

          setIsPlaying(
            true
          );

          setIsPaused(
            false
          );

          return;
        }

        await cleanupAudio();

        const {
          sound,
        } =
          await Audio.Sound.createAsync(
            {
              uri:
                recordingUri,
            },
            {
              shouldPlay: true,
            }
          );

        soundRef.current =
          sound;

        setIsPlaying(
          true
        );

        setIsPaused(
          false
        );

        sound.setOnPlaybackStatusUpdate(
          (
            status
          ) => {
            if (
              status.isLoaded
            ) {
              setPlaybackPosition(
                Math.floor(
                  (
                    status.positionMillis ||
                    0
                  ) / 1000
                )
              );

              setPlaybackDuration(
                Math.floor(
                  (
                    status.durationMillis ||
                    0
                  ) / 1000
                )
              );

              if (
                status.didJustFinish
              ) {
                setIsPlaying(
                  false
                );

                setIsPaused(
                  false
                );

                setPlaybackPosition(
                  0
                );
              }
            }
          }
        );
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  // ====================================
  // PAUSE PLAYBACK
  // ====================================

  const pausePlayback =
    async () => {
      try {
        if (
          soundRef.current
        ) {
          await soundRef.current.pauseAsync();

          setIsPlaying(
            false
          );

          setIsPaused(
            true
          );
        }
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  // ====================================
  // STOP PLAYBACK
  // ====================================

  const stopPlayback =
    async () => {
      try {
        if (
          soundRef.current
        ) {
          await soundRef.current.stopAsync();

          setIsPlaying(
            false
          );

          setIsPaused(
            false
          );

          setPlaybackPosition(
            0
          );
        }
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  // ====================================
  // REMOVE AUDIO
  // ====================================

  const removeAudio =
    async () => {
      if (isCleaning)
        return;

      try {
        setIsCleaning(true);

        await cleanupAudio();

        setRecording(
          null
        );

        setRecordingUri(
          null
        );

        setDuration(0);

        setPlaybackPosition(
          0
        );

        setPlaybackDuration(
          0
        );

        setIsPlaying(
          false
        );

        setIsPaused(
          false
        );

        setIsRecording(
          false
        );
      } catch (
        error
      ) {
        console.log(
          error
        );
      } finally {
        setTimeout(() => {
          setIsCleaning(
            false
          );
        }, 300);
      }
    };

  // ====================================
  // SUBMIT
  // ====================================

  const handleSubmit =
    async () => {
      try {
        if (
          !recordingUri
        ) {
          global.showAlert(
            "No Recording",
            "Please record audio first."
          );

          return;
        }

        if (
          isSubmitting
        )
          return;

        setIsSubmitting(
          true
        );

        await submitAudioAnswer(
          doubt.id,
          {
            answerAudio:
              recordingUri,

            answerType:
              "Audio",

            answered:
              true,

            status:
              "Answered",

            assignedTeacher:
              teacherName,

            answeredAt:
              new Date().toISOString(),
          }
        );

        navigation.replace(
          "AnswerSuccessScreen",
          {
            answerType:
              "Audio Answer",

            doubt: {
              ...doubt,

              answered: true,

              status:
                "Answered",

              answerType:
                "Audio",

              answerAudio:
                recordingUri,

              assignedTeacher:
                teacherName,
            },
          }
        );
      } catch (
        error
      ) {
        console.log(
          error
        );

        global.showAlert(
          "Submit Failed",
          "Failed to submit audio answer."
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
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
            0.9
          }
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

        <Text
          style={
            styles.headerTitle
          }
        >
          Audio Answer
        </Text>

        <View
          style={{
            width: 46,
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
        <View
          style={
            styles.mainCard
          }
        >
          {/* TITLE */}

          <Text
            style={
              styles.recordHeading
            }
          >
            Record Voice
            Answer
          </Text>

          <Text
            style={
              styles.recordSub
            }
          >
            Explain clearly
            using your
            voice.
          </Text>

          {/* WAVE */}

          <View
            style={
              styles.waveContainer
            }
          >
            {[
              ...Array(18),
            ].map(
              (
                _,
                index
              ) => (
                <View
                  key={
                    index
                  }
                  style={[
                    styles.waveBar,
                    {
                      height:
                        18 +
                        ((index %
                          5) +
                          1) *
                          10,

                      opacity:
                        isRecording
                          ? 1
                          : 0.4,
                    },
                  ]}
                />
              )
            )}
          </View>

          {/* TIMER */}

          <Text
            style={
              styles.timer
            }
          >
            {formatTime(
              duration
            )}
          </Text>

          {/* RECORDING BADGE */}

          {isRecording && (
            <View
              style={
                styles.recordingBadge
              }
            >
              <View
                style={
                  styles.recordingDot
                }
              />

              <Text
                style={
                  styles.recordingText
                }
              >
                Recording...
              </Text>
            </View>
          )}

          {/* RECORD BUTTON */}

          {!recordingUri && (
            <>
              <Animated.View
                style={{
                  transform:
                    [
                      {
                        scale:
                          pulseAnim,
                      },
                    ],
                }}
              >
                <TouchableOpacity
                  activeOpacity={
                    0.9
                  }
                  style={[
                    styles.recordBtn,

                    isRecording && {
                      backgroundColor:
                        COLORS.danger,
                    },
                  ]}
                  onPress={
                    isRecording
                      ? stopRecording
                      : startRecording
                  }
                >
                  <Ionicons
                    name={
                      isRecording
                        ? "stop"
                        : "mic"
                    }
                    size={40}
                    color={
                      COLORS.white
                    }
                  />
                </TouchableOpacity>
              </Animated.View>

              <Text
                style={
                  styles.tapText
                }
              >
                {isRecording
                  ? "Tap to stop recording"
                  : "Tap to start recording"}
              </Text>
            </>
          )}

          {/* AUDIO PLAYER */}

          {recordingUri && (
            <>
              <View
                style={
                  styles.audioCard
                }
              >
                <TouchableOpacity
                  activeOpacity={
                    0.9
                  }
                  style={
                    styles.playBtn
                  }
                  onPress={
                    isPlaying
                      ? pausePlayback
                      : playRecording
                  }
                >
                  <Ionicons
                    name={
                      isPlaying
                        ? "pause"
                        : "play"
                    }
                    size={24}
                    color={
                      COLORS.white
                    }
                  />
                </TouchableOpacity>

                <View
                  style={
                    styles.audioMiddle
                  }
                >
                  <View
                    style={
                      styles.previewWave
                    }
                  >
                    {[
                      ...Array(
                        22
                      ),
                    ].map(
                      (
                        _,
                        i
                      ) => (
                        <View
                          key={
                            i
                          }
                          style={[
                            styles.previewBar,
                            {
                              height:
                                8 +
                                ((i %
                                  6) +
                                  1) *
                                  6,

                              backgroundColor:
                                isPlaying
                                  ? COLORS.primary
                                  : COLORS.muted,
                            },
                          ]}
                        />
                      )
                    )}
                  </View>

                  <Text
                    style={
                      styles.audioTime
                    }
                  >
                    {isPlaying ||
                    isPaused
                      ? `${formatTime(
                          playbackPosition
                        )} / ${formatTime(
                          playbackDuration ||
                            duration
                        )}`
                      : formatTime(
                          duration
                        )}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={
                    0.85
                  }
                  disabled={
                    isCleaning
                  }
                  onPress={
                    removeAudio
                  }
                >
                  <Ionicons
                    name="close-circle"
                    size={28}
                    color={
                      COLORS.danger
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* STOP */}

              {isPlaying && (
                <TouchableOpacity
                  style={
                    styles.stopBtn
                  }
                  onPress={
                    stopPlayback
                  }
                >
                  <Ionicons
                    name="stop-circle-outline"
                    size={20}
                    color={
                      COLORS.muted
                    }
                  />

                  <Text
                    style={
                      styles.stopText
                    }
                  >
                    Stop Playback
                  </Text>
                </TouchableOpacity>
              )}

              {/* ACTIONS */}

              <View
                style={
                  styles.actionsRow
                }
              >
                <TouchableOpacity
                  activeOpacity={
                    0.9
                  }
                  style={
                    styles.reRecordBtn
                  }
                  onPress={
                    removeAudio
                  }
                >
                  <MaterialIcons
                    name="refresh"
                    size={20}
                    color={
                      COLORS.text
                    }
                  />

                  <Text
                    style={
                      styles.reRecordText
                    }
                  >
                    Re-record
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={
                    0.9
                  }
                  disabled={
                    isSubmitting
                  }
                  style={[
                    styles.submitBtn,

                    isSubmitting && {
                      opacity: 0.6,
                    },
                  ]}
                  onPress={
                    handleSubmit
                  }
                >
                  <Ionicons
                    name="paper-plane-outline"
                    size={20}
                    color={
                      COLORS.white
                    }
                  />

                  <Text
                    style={
                      styles.submitText
                    }
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : "Submit"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ====================================
// STYLES
// ====================================

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
      borderRadius: 14,
      backgroundColor:
        COLORS.white,
      justifyContent:
        "center",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: "900",
      color:
        COLORS.text,
    },

    mainCard: {
      marginHorizontal: 16,
      marginTop: 20,
      backgroundColor:
        COLORS.white,
      borderRadius: 28,
      padding: 20,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    recordHeading: {
      fontSize:
        width < 360
          ? 22
          : 24,

      fontWeight: "900",
      color:
        COLORS.text,
      textAlign:
        "center",
    },

    recordSub: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 22,
      color:
        COLORS.muted,
      textAlign:
        "center",
      fontWeight: "600",
    },

    waveContainer: {
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginTop: 36,
    },

    waveBar: {
      width: 5,
      borderRadius: 20,
      backgroundColor:
        COLORS.primary,
      marginHorizontal: 2,
    },

    timer: {
      marginTop: 24,
      fontSize: 42,
      fontWeight: "900",
      color:
        COLORS.text,
      textAlign:
        "center",
    },

    recordingBadge: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 10,
    },

    recordingDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor:
        COLORS.danger,
      marginRight: 8,
    },

    recordingText: {
      fontSize: 13,
      fontWeight: "700",
      color:
        COLORS.danger,
    },

    recordBtn: {
      width: 110,
      height: 110,
      borderRadius: 70,
      backgroundColor:
        COLORS.primary,
      justifyContent:
        "center",
      alignItems:
        "center",
      alignSelf:
        "center",
      marginTop: 30,
    },

    tapText: {
      marginTop: 18,
      textAlign:
        "center",
      fontSize: 15,
      fontWeight: "700",
      color:
        COLORS.muted,
    },

    audioCard: {
      marginTop: 26,
      width: "100%",
      backgroundColor:
        "#F8FAFD",
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      padding: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    playBtn: {
      width: 56,
      height: 56,
      borderRadius: 30,
      backgroundColor:
        COLORS.primary,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    audioMiddle: {
      flex: 1,
      marginLeft: 14,
    },

    previewWave: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    previewBar: {
      width: 4,
      borderRadius: 20,
      marginHorizontal: 1.5,
    },

    audioTime: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: "800",
      color:
        COLORS.text,
    },

    stopBtn: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 14,
    },

    stopText: {
      marginLeft: 6,
      fontSize: 13,
      fontWeight: "700",
      color:
        COLORS.muted,
    },

    actionsRow: {
      flexDirection:
        "row",
      marginTop: 24,
    },

    reRecordBtn: {
      flex: 1,
      height: 56,
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
      marginRight: 8,
    },

    reRecordText: {
      marginLeft: 8,
      fontSize: 15,
      fontWeight: "800",
      color:
        COLORS.text,
    },

    submitBtn: {
      flex: 1,
      height: 56,
      borderRadius: 18,
      backgroundColor:
        COLORS.primary,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginLeft: 8,
    },

    submitText: {
      marginLeft: 8,
      fontSize: 15,
      fontWeight: "900",
      color:
        COLORS.white,
    },
  });
