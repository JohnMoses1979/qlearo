

// FULLY UPDATED + REALTIME + PROFESSIONAL
// screens/teacher/AnswerDoubtVideoScreen.js
// NO CRASHES
// EXPO CAMERA + VIDEO FIXED
// REALTIME READY

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
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";

import {
  useFocusEffect,
} from "@react-navigation/native";

import * as ScreenOrientation from "expo-screen-orientation";

import {
  Video,
  ResizeMode,
} from "expo-av";

import {
  Ionicons,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";

import {
  useAppContext,
} from "../../context/AppContext";

const { width } =
  Dimensions.get("window");

const COLORS = {
  bg: "#F5F7FB",
  white: "#FFFFFF",
  primary: "#006D6A",
  primaryLight: "#EAF8F6",
  text: "#07123A",
  muted: "#7A859F",
  border: "#E6ECF5",
  green: "#00A86B",
  card: "#FAFBFE",
  danger: "#FF4D4F",
};

export default function AnswerDoubtVideoScreen({
  navigation,
  route,
}) {
  const {
    currentUser,
    submitVideoAnswer,
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
  // REFS
  // ====================================

  const cameraRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const pulseAnim =
    useRef(
      new Animated.Value(1)
    ).current;

  const pulseRef =
    useRef(null);

  const timerRef =
    useRef(null);

  // ====================================
  // PERMISSIONS
  // ====================================

  const [
    cameraPermission,
    requestCameraPermission,
  ] =
    useCameraPermissions();

  const [
    micPermission,
    requestMicPermission,
  ] =
    useMicrophonePermissions();

  // ====================================
  // STATES
  // ====================================

  const [
    cameraFacing,
    setCameraFacing,
  ] = useState("front");

  const [
    isRecording,
    setIsRecording,
  ] = useState(false);

  const [
    recordedVideo,
    setRecordedVideo,
  ] = useState(null);

  const [timer, setTimer] =
    useState(0);

  const [
    isCameraReady,
    setIsCameraReady,
  ] = useState(false);

  const [
    cameraLoading,
    setCameraLoading,
  ] = useState(true);

  const [isSaved, setIsSaved] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isPreviewing, setIsPreviewing] =
    useState(false);

  // ====================================
  // ORIENTATION
  // ====================================

  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation
        .OrientationLock
        .PORTRAIT_UP
    );
  }, []);

  // ====================================
  // REFRESH
  // ====================================

  useFocusEffect(
    React.useCallback(() => {
      return () => {};
    }, [])
  );

  // ====================================
  // CLEANUP
  // ====================================

  useEffect(() => {
    return () => {
      if (
        timerRef.current
      ) {
        clearInterval(
          timerRef.current
        );
      }

      if (
        videoRef.current
      ) {
        try {
          videoRef.current.stopAsync();
        } catch {}

        try {
          videoRef.current.unloadAsync();
        } catch {}
      }
    };
  }, []);

  // ====================================
  // PULSE
  // ====================================

  useEffect(() => {
    if (isRecording) {
      pulseRef.current =
        Animated.loop(
          Animated.sequence([
            Animated.timing(
              pulseAnim,
              {
                toValue: 1.1,
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

      pulseRef.current.start();
    } else {
      if (
        pulseRef.current
      ) {
        pulseRef.current.stop();
      }

      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // ====================================
  // TIMER
  // ====================================

  useEffect(() => {
    if (isRecording) {
      timerRef.current =
        setInterval(() => {
          setTimer(
            (prev) => {
              if (
                prev >= 119
              ) {
                handleStopRecording();

                return prev;
              }

              return (
                prev + 1
              );
            }
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

  const handleStartRecording =
    async () => {
      try {
        if (
          !cameraRef.current
        )
          return;

        if (
          !isCameraReady
        )
          return;

        setRecordedVideo(
          null
        );

        setTimer(0);

        setIsRecording(
          true
        );

        const video =
          await cameraRef.current.recordAsync(
            {
              maxDuration: 120,

              quality:
                "480p",
            }
          );

        if (
          video?.uri
        ) {
          setRecordedVideo(
            video.uri
          );
        }
      } catch (
        error
      ) {
        console.log(
          error
        );
      } finally {
        setIsRecording(
          false
        );
      }
    };

  // ====================================
  // STOP RECORDING
  // ====================================

  const handleStopRecording =
    async () => {
      try {
        if (
          cameraRef.current &&
          isRecording
        ) {
          await cameraRef.current.stopRecording();
        }
      } catch (
        error
      ) {
        console.log(
          error
        );
      } finally {
        setIsRecording(
          false
        );
      }
    };

  // ====================================
  // FLIP CAMERA
  // ====================================

  const handleFlipCamera =
    () => {
      if (
        isRecording ||
        cameraLoading
      )
        return;

      setCameraFacing(
        (prev) =>
          prev ===
          "back"
            ? "front"
            : "back"
      );
    };

  // ====================================
  // REMOVE VIDEO
  // ====================================

  const handleRemoveVideo =
    async () => {
      try {
        if (
          videoRef.current
        ) {
          try {
            await videoRef.current.stopAsync();
          } catch {}

          try {
            await videoRef.current.unloadAsync();
          } catch {}
        }
      } catch {}

      setRecordedVideo(
        null
      );

      setTimer(0);

      setIsSaved(
        false
      );

      setIsRecording(
        false
      );

      setIsPreviewing(
        false
      );
    };

  // ====================================
  // SAVE
  // ====================================

  const handleSave =
    () => {
      if (
        !recordedVideo ||
        isRecording
      )
        return;

      setIsSaved(
        true
      );
    };

  // ====================================
  // PREVIEW
  // ====================================

  const handlePreview =
    () => {
      if (
        !recordedVideo
      )
        return;

      if (
        isPreviewing
      )
        return;

      setIsPreviewing(
        true
      );

      navigation.push(
        "StudentDoubtDetailScreen",
        {
          doubt: {
            ...doubt,

            answered: true,

            status:
              "Answered",

            answerType:
              "Video",

            answerVideo:
              recordedVideo,

            assignedTeacher:
              teacherName,
          },
        }
      );

      setTimeout(() => {
        setIsPreviewing(
          false
        );
      }, 500);
    };

  // ====================================
  // SUBMIT
  // ====================================

  const handleSubmit =
    async () => {
      try {
        if (
          !recordedVideo
        )
          return;

        if (
          isSubmitting
        )
          return;

        setIsSubmitting(
          true
        );

        await submitVideoAnswer(
          doubt.id,
          {
            answerVideo:
              recordedVideo,

            answerType:
              "Video",

            answered:
              true,

            teacherViewed:
              true,

            studentViewed:
              false,

            status:
              "Answered",

            assignedTeacher:
                teacherName,

            lastMessageAt:
              new Date().toISOString(),

            updatedAt:
              new Date().toISOString(),

            answeredAt:
              new Date().toISOString(),
          }
        );

        navigation.replace(
          "AnswerSuccessScreen",
          {
            answerType:
              "Video Answer",

            doubt: {
              ...doubt,

              answered: true,

              status:
                "Answered",

              answerType:
                "Video",

              answerVideo:
                recordedVideo,

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
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  // ====================================
  // PERMISSIONS
  // ====================================

  const allPermissionsGranted =
    cameraPermission?.granted &&
    micPermission?.granted;

  const requestAllPermissions =
    async () => {
      if (
        !cameraPermission?.granted
      ) {
        await requestCameraPermission();
      }

      if (
        !micPermission?.granted
      ) {
        await requestMicPermission();
      }
    };

  if (
    !cameraPermission ||
    !micPermission
  ) {
    return (
      <View
        style={
          styles.container
        }
      />
    );
  }

  // ====================================
  // PERMISSION SCREEN
  // ====================================

  if (
    !allPermissionsGranted
  ) {
    return (
      <SafeAreaView
        style={
          styles.permissionContainer
        }
      >
        <StatusBar
          backgroundColor={
            COLORS.bg
          }
          barStyle="dark-content"
        />

        <View
          style={
            styles.permissionIcon
          }
        >
          <Ionicons
            name="videocam-outline"
            size={56}
            color={
              COLORS.primary
            }
          />
        </View>

        <Text
          style={
            styles.permissionTitle
          }
        >
          Permission
          Required
        </Text>

        <Text
          style={
            styles.permissionSub
          }
        >
          Camera and
          microphone
          permissions are
          required to
          record video.
        </Text>

        <TouchableOpacity
          style={
            styles.permissionBtn
          }
          onPress={
            requestAllPermissions
          }
        >
          <Text
            style={
              styles.permissionBtnText
            }
          >
            Allow
            Permissions
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
          style={
            styles.headerBtn
          }
          onPress={() =>
            navigation.goBack()
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
          Video Answer
        </Text>

        <TouchableOpacity
          activeOpacity={
            0.85
          }
          style={[
            styles.saveBtn,

            isSaved &&
              styles.saveBtnActive,
          ]}
          onPress={
            handleSave
          }
        >
          <Feather
            name="file-text"
            size={18}
            color={
              isSaved
                ? COLORS.white
                : COLORS.primary
            }
          />

          <Text
            style={[
              styles.saveText,

              isSaved && {
                color:
                  COLORS.white,
              },
            ]}
          >
            {isSaved
              ? "Saved"
              : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 150,
        }}
      >
        <View
          style={
            styles.videoContainer
          }
        >
          {!recordedVideo ? (
            <>
              <CameraView
                ref={
                  cameraRef
                }
                style={
                  styles.camera
                }
                facing={
                  cameraFacing
                }
                mode="video"
                onCameraReady={() => {
                  setIsCameraReady(
                    true
                  );

                  setCameraLoading(
                    false
                  );
                }}
              >
                <View
                  style={
                    styles.cameraTop
                  }
                >
                  <View
                    style={[
                      styles.liveBadge,

                      isRecording && {
                        backgroundColor:
                          "rgba(255,0,0,0.8)",
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.liveText
                      }
                    >
                      {isRecording
                        ? "REC"
                        : "READY"}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.timerText
                    }
                  >
                    {formatTime(
                      timer
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.cameraControls
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.flipBtn
                    }
                    onPress={
                      handleFlipCamera
                    }
                  >
                    <Ionicons
                      name="camera-reverse-outline"
                      size={26}
                      color={
                        COLORS.white
                      }
                    />
                  </TouchableOpacity>

                  <Animated.View
                    style={{
                      transform:
                        [
                          {
                            scale:
                              isRecording
                                ? pulseAnim
                                : 1,
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
                          ? handleStopRecording
                          : handleStartRecording
                      }
                    >
                      <Ionicons
                        name={
                          isRecording
                            ? "stop"
                            : "videocam"
                        }
                        size={34}
                        color={
                          COLORS.white
                        }
                      />
                    </TouchableOpacity>
                  </Animated.View>

                  <View
                    style={{
                      width: 56,
                    }}
                  />
                </View>
              </CameraView>

              {cameraLoading && (
                <View
                  style={
                    styles.cameraLoadingRow
                  }
                >
                  <Ionicons
                    name="camera"
                    size={18}
                    color={
                      COLORS.muted
                    }
                  />

                  <Text
                    style={
                      styles.cameraLoadingText
                    }
                  >
                    Loading
                    Camera...
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <View
                style={
                  styles.completedBadge
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={
                    COLORS.white
                  }
                />

                <Text
                  style={
                    styles.completedText
                  }
                >
                  Video
                  Recorded
                </Text>
              </View>

              <Video
                ref={
                  videoRef
                }
                source={{
                  uri:
                    recordedVideo,
                }}
                style={
                  styles.previewVideo
                }
                useNativeControls
                resizeMode={
                  ResizeMode.CONTAIN
                }
                shouldPlay={
                  false
                }
                isLooping={
                  false
                }
              />
            </>
          )}

          {recordedVideo && (
            <View
              style={
                styles.actionBtns
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
                  handleRemoveVideo
                }
              >
                <MaterialIcons
                  name="refresh"
                  size={22}
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
                  styles.submitSmallBtn,

                  isSubmitting && {
                    opacity: 0.7,
                  },
                ]}
                onPress={
                  handleSubmit
                }
              >
                <Ionicons
                  name={
                    isSubmitting
                      ? "time-outline"
                      : "paper-plane-outline"
                  }
                  size={20}
                  color={
                    COLORS.white
                  }
                />

                <Text
                  style={
                    styles.submitSmallText
                  }
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
          disabled={
            !recordedVideo ||
            isPreviewing
          }
          style={[
            styles.previewBtn,

            (!recordedVideo ||
              isPreviewing) &&
              styles.previewBtnDisabled,
          ]}
          onPress={
            handlePreview
          }
        >
          <Ionicons
            name="play-outline"
            size={22}
            color={
              COLORS.text
            }
          />

          <Text
            style={
              styles.previewText
            }
          >
            {isPreviewing
              ? "Opening..."
              : "Preview"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={
            0.9
          }
          disabled={
            !recordedVideo ||
            isSubmitting
          }
          style={[
            styles.submitBtn,

            (!recordedVideo ||
              isSubmitting) &&
              styles.submitBtnDisabled,
          ]}
          onPress={
            handleSubmit
          }
        >
          <Ionicons
            name={
              isSubmitting
                ? "time-outline"
                : "paper-plane-outline"
            }
            size={22}
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
              : "Submit Answer"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// KEEP YOUR EXISTING STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },
  permissionSub: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 26,
    color: COLORS.muted,
    fontWeight: "600",
    textAlign: "center",
  },
  permissionBtn: {
    marginTop: 28,
    height: 58,
    paddingHorizontal: 30,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionBtnText: { fontSize: 16, fontWeight: "900", color: COLORS.white },
  permissionBackBtn: {
    marginTop: 16,
    height: 48,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionBackText: { fontSize: 15, fontWeight: "700", color: COLORS.muted },
  header: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 14 : 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: COLORS.text },
  saveBtn: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  saveText: { marginLeft: 8, fontSize: 14, fontWeight: "800", color: COLORS.primary },
  videoContainer: {
    marginHorizontal: 18,
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  videoHeading: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },
  videoSub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.muted,
    fontWeight: "600",
    textAlign: "center",
  },
  cameraWrapper: {
    marginTop: 26,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  camera: {
    width: "100%",
    height: width * 1.28,
    justifyContent: "space-between",
  },
  previewWrapper: { width: "100%", height: width * 1.28, backgroundColor: "#000" },
  previewVideo: { width: "100%", height: "100%" },
  cameraTop: {
    paddingHorizontal: 18,
    paddingTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveBadge: {
    minWidth: 80,
    height: 36,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.18)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: "#FF3B30",
    marginRight: 8,
  },
  liveText: { fontSize: 14, fontWeight: "900", color: COLORS.white },
  timerText: { fontSize: 18, fontWeight: "900", color: COLORS.white },
  cameraControls: {
    paddingHorizontal: 28,
    paddingBottom: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flipBtn: {
    width: 56,
    height: 56,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordBtn: {
    width: 92,
    height: 92,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  previewOverlay: { position: "absolute", top: 20, left: 20, right: 20 },
  previewTopRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  completedBadge: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 30,
    backgroundColor: "rgba(0, 109, 106, 0.85)",
    flexDirection: "row",
    alignItems: "center",
  },
  completedText: { marginLeft: 8, fontSize: 14, fontWeight: "800", color: COLORS.white },
  removeVideoBtn: { marginLeft: 12 },
  durationBadge: {
    marginTop: 10,
    alignSelf: "flex-start",
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: { marginLeft: 6, fontSize: 13, fontWeight: "800", color: COLORS.white },
  cameraLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  cameraLoadingText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
  },
  infoBox: {
    marginTop: 24,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.text,
    fontWeight: "600",
  },
  actionBtns: { flexDirection: "row", marginTop: 26 },
  reRecordBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  reRecordText: { marginLeft: 8, fontSize: 15, fontWeight: "800", color: COLORS.text },
  submitSmallBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  submitSmallText: { marginLeft: 8, fontSize: 15, fontWeight: "900", color: COLORS.white },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
    flexDirection: "row",
    alignItems: "center",
  },
  previewBtn: {
    flex: 1,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  previewBtnDisabled: { opacity: 0.45 },
  previewText: { marginLeft: 8, fontSize: 17, fontWeight: "800", color: COLORS.text },
  submitBtn: {
    flex: 1.4,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { marginLeft: 8, fontSize: 17, fontWeight: "900", color: COLORS.white },
});
