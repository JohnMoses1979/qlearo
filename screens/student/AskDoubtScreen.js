

// FULLY UPDATED + FIXED + COMPLETE
// screens/student/AskDoubtScreen.js

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  useFocusEffect,
} from "@react-navigation/native";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import {
  Audio,
  Video,
  ResizeMode,
} from "expo-av";

import StudentBottomNavigation from "../../components/StudentBottomNavigation";

import {
  useAppContext,
} from "../../context/AppContext";

const { width } =
  Dimensions.get("window");

const COLORS = {
  bg: "#F7FBFF",
  white: "#FFFFFF",
  primary: "#078C80",
  primaryLight: "#EAF8F6",
  text: "#080D24",
  muted: "#59607A",
  border: "#E6ECF5",
  green: "#20B15A",
  red: "#FF3B3F",
  yellow: "#FFC107",
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

const ALL_TYPES = [
  {
    key: "Mathematics",
    icon: "square-root",
    library:
      "MaterialCommunityIcons",
  },

  {
    key: "Physics",
    icon: "atom",
    library:
      "MaterialCommunityIcons",
  },

  {
    key: "Chemistry",
    icon: "flask-outline",
    library:
      "MaterialCommunityIcons",
  },

  {
    key: "Biology",
    icon: "dna",
    library:
      "MaterialCommunityIcons",
  },

  {
    key: "Science",
    icon: "telescope",
    library:
      "MaterialCommunityIcons",
  },

  {
    key: "English",
    icon:
      "book-open-page-variant",
    library:
      "MaterialCommunityIcons",
  },

  {
    key: "History",
    icon: "book-clock",
    library:
      "MaterialCommunityIcons",
  },

  {
    key: "Geography",
    icon: "earth",
    library:
      "MaterialCommunityIcons",
  },

  {
    key: "Other",
    icon:
      "ellipsis-horizontal",
    library: "Ionicons",
  },
];

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");

const listify = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => listify(item));
  }

  if (value && typeof value === "object") {
    const text =
      value.title ||
      value.name ||
      value.category ||
      value.label ||
      value.key ||
      value.id ||
      "";

    return String(text || "").trim() ? [String(text).trim()] : [];
  }

  const text = String(value || "").trim();
  return text ? [text] : [];
};

function getDefaultType(subject) {
  if (!subject)
    return "Mathematics";

  const s =
    subject.toLowerCase();

  for (const t of ALL_TYPES) {
    if (
      s.includes(
        t.key.toLowerCase()
      )
    ) {
      return t.key;
    }
  }

  return "Other";
}

function findMatchingTutor(tutors = [], subject = "", category = "") {
  const subjectText = normalizeText(subject);
  const categoryText = normalizeText(category);
  const list = Array.isArray(tutors) ? tutors : [];

  const match = list.find((tutor) => {
    const tutorText = normalizeText(
      [
        tutor?.name,
        tutor?.teacherName,
        tutor?.subject,
        tutor?.primarySubject,
        tutor?.subjectExpertise,
        ...listify(tutor?.category),
        ...listify(tutor?.topics),
      ]
        .filter(Boolean)
        .join(" ")
    );

    return (
      (subjectText && tutorText.includes(subjectText)) ||
      (categoryText && tutorText.includes(categoryText))
    );
  });

  return match || list[0] || null;
}

export default function AskDoubtScreen({
  route,
  navigation,
}) {
  const { addDoubt, tutors = [] } =
    useAppContext();

  const tutor =
    route?.params?.tutor ||
    null;

  const paramCategory =
    route?.params?.category ||
    null;

  const paramSubject =
    route?.params?.subject ||
    null;

  const [doubtText, setDoubtText] =
    useState(
      paramSubject
        ? `I have a doubt in ${paramSubject}: `
        : ""
    );

  const [selectedType, setSelectedType] =
    useState(() => {
      if (paramSubject) {
        return getDefaultType(
          paramSubject
        );
      }

      return "Mathematics";
    });

  const [cameraImages, setCameraImages] =
    useState([]);

  const [
    galleryImages,
    setGalleryImages,
  ] = useState([]);

  const [documents, setDocuments] =
    useState([]);

  const [recording, setRecording] =
    useState(null);

  const [recordingUri, setRecordingUri] =
    useState(null);

  const [isRecording, setIsRecording] =
    useState(false);

  const [videoUri, setVideoUri] =
    useState(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    selectedAnswerType,
    setSelectedAnswerType,
  ] = useState("Text");

  const audioPlayer =
    useRef(null);

  const matchedTutor = findMatchingTutor(
    tutors,
    paramSubject || selectedType,
    paramCategory
  );

  const selectedTutor = {
    name:
      tutor?.name ||
      matchedTutor?.name ||
      "Priya Sharma",

    role:
      tutor?.role ||
      matchedTutor?.subject ||
      (paramCategory
        ? `${paramCategory} Tutor`
        : "Mathematics Tutor"),

    avatar:
      tutor?.avatar ||
      matchedTutor?.avatar ||
      matchedTutor?.image ||
      "https://i.pravatar.cc/150?img=47",

    rating: "4.8",

    reviews: "128 reviews",

    online: true,
  };

  useEffect(() => {
    requestPermissions();

    return () => {
      stopAudioPlayback();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        stopAudioPlayback();
      };
    }, [])
  );

  const requestPermissions =
    async () => {
      try {
        await ImagePicker.requestCameraPermissionsAsync();

        await ImagePicker.requestMediaLibraryPermissionsAsync();

        await Audio.requestPermissionsAsync();

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.log(e);
      }
    };

  // CAMERA

  const openCamera =
    async () => {
      try {
        const result =
          await ImagePicker.launchCameraAsync(
            {
              mediaTypes:
                ImagePicker
                  .MediaTypeOptions
                  .Images,

              quality: 0.8,
            }
          );

        if (!result.canceled) {
          setCameraImages(
            (prev) => [
              ...prev,
              result.assets[0],
            ]
          );
        }
      } catch (e) {
        console.log(e);
      }
    };

  // GALLERY

  const openGallery =
    async () => {
      try {
        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes:
                ImagePicker
                  .MediaTypeOptions
                  .Images,

              allowsMultipleSelection: true,

              quality: 0.8,
            }
          );

        if (!result.canceled) {
          setGalleryImages(
            (prev) => [
              ...prev,
              ...result.assets,
            ]
          );
        }
      } catch (e) {
        console.log(e);
      }
    };

  // DOCUMENTS

  const pickDocument =
    async () => {
      try {
        const result =
          await DocumentPicker.getDocumentAsync(
            {
              multiple: true,
              copyToCacheDirectory: true,
            }
          );

        if (!result.canceled) {
          setDocuments(
            (prev) => [
              ...prev,
              ...result.assets,
            ]
          );
        }
      } catch (e) {
        console.log(e);
      }
    };

  // VIDEO

  const recordVideo =
    async () => {
      try {
        const result =
          await ImagePicker.launchCameraAsync(
            {
              mediaTypes:
                ImagePicker
                  .MediaTypeOptions
                  .Videos,

              videoMaxDuration: 120,
            }
          );

        if (!result.canceled) {
          const asset =
            result.assets?.[0];

          if (asset?.uri) {
            setVideoUri(
              asset.uri
            );
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

  // AUDIO

  const startRecording =
    async () => {
      try {
        const { recording } =
          await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
          );

        setRecording(
          recording
        );

        setIsRecording(
          true
        );
      } catch (err) {
        console.log(err);
      }
    };

  const stopRecording =
    async () => {
      try {
        if (!recording)
          return;

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

        setIsRecording(
          false
        );
      } catch (err) {
        console.log(err);
      }
    };

  const playAudio =
    async () => {
      try {
        if (!recordingUri)
          return;

        await stopAudioPlayback();

        const { sound } =
          await Audio.Sound.createAsync(
            {
              uri: recordingUri,
            },
            {
              shouldPlay: true,
            }
          );

        audioPlayer.current =
          sound;

        sound.setOnPlaybackStatusUpdate(
          (
            status
          ) => {
            if (
              status.didJustFinish
            ) {
              stopAudioPlayback();
            }
          }
        );
      } catch (e) {
        console.log(e);
      }
    };

  const stopAudioPlayback =
    async () => {
      try {
        if (
          audioPlayer.current
        ) {
          await audioPlayer.current.stopAsync();

          await audioPlayer.current.unloadAsync();

          audioPlayer.current =
            null;
        }
      } catch (e) {
        console.log(e);
      }
    };

  // REMOVE

  const removeImage = (
    type,
    uri
  ) => {
    if (type === "camera") {
      setCameraImages((prev) =>
        prev.filter(
          (item) =>
            item.uri !== uri
        )
      );
    } else {
      setGalleryImages((prev) =>
        prev.filter(
          (item) =>
            item.uri !== uri
        )
      );
    }
  };

  const removeDocument =
    (index) => {
      setDocuments((prev) =>
        prev.filter(
          (_, i) =>
            i !== index
        )
      );
    };

  const removeAudio =
    () => {
      setRecordingUri(null);
    };

  const removeVideo =
    () => {
      setVideoUri(null);
    };

  // SUBMIT

  const handleSubmit =
    async () => {
      if (
        !doubtText.trim() &&
        !recordingUri &&
        !videoUri &&
        cameraImages.length === 0 &&
        galleryImages.length === 0
      ) {
        return;
      }

      try {
        setIsSubmitting(
          true
        );

        const newDoubt = {
          subject:
            selectedType,

          categoryTitle:
            paramCategory || selectedType,

          teacherId:
            tutor?.teacherId ||
            tutor?.id ||
            matchedTutor?.teacherId ||
            matchedTutor?.id ||
            null,

          teacherName:
            tutor?.name ||
            tutor?.teacherName ||
            matchedTutor?.name ||
            matchedTutor?.teacherName ||
            null,

          assignedTeacherId:
            tutor?.teacherId ||
            tutor?.id ||
            matchedTutor?.teacherId ||
            matchedTutor?.id ||
            null,

          assignedTeacher:
            tutor?.name ||
            tutor?.teacherName ||
            matchedTutor?.name ||
            matchedTutor?.teacherName ||
            null,

          tutor:
            tutor ||
            matchedTutor ||
            null,

          question:
            doubtText,

          description:
            doubtText,

          cameraImages,

          galleryImages,

          documents,

          audioUri:
            recordingUri,

          videoUri,

          createdAt:
            new Date().toISOString(),
        };

        await addDoubt(
          newDoubt
        );

        setDoubtText("");

        setCameraImages([]);

        setGalleryImages([]);

        setDocuments([]);

        setRecordingUri(
          null
        );

        setVideoUri(
          null
        );

        navigation.navigate(
          "StudentMyDoubts"
        );
      } catch (e) {
        const isPremiumRequired =
          e?.code === "PREMIUM_REQUIRED" ||
          String(e?.message || "").toLowerCase().includes("free limit completed");

        if (isPremiumRequired) {
          Alert.alert(
            "Free doubts completed",
            "You have used 3 free doubts. Please choose a subscription plan to continue asking doubts.",
            [
              {
                text: "Choose Plan",
                onPress: () => navigation.navigate("SubscriptionPlans"),
              },
              {
                text: "Cancel",
                style: "cancel",
              },
            ]
          );
          return;
        }

        console.log(e);
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  const renderTypeIcon = (
    item,
    active
  ) => {
    const color = active
      ? COLORS.primary
      : "#4D536E";

    if (
      item.library ===
      "Ionicons"
    ) {
      return (
        <Ionicons
          name={item.icon}
          size={28}
          color={color}
        />
      );
    }

    return (
      <MaterialCommunityIcons
        name={item.icon}
        size={30}
        color={color}
      />
    );
  };

  const allImages = [
    ...cameraImages.map(
      (item) => ({
        ...item,
        sourceType:
          "camera",
      })
    ),

    ...galleryImages.map(
      (item) => ({
        ...item,
        sourceType:
          "gallery",
      })
    ),
  ];

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar
        backgroundColor={
          COLORS.bg
        }
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <View
          style={styles.headerRow}
        >
          <TouchableOpacity
            style={styles.backBtn}
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

          <View
            style={
              styles.headerCenter
            }
          >
            <Text
              style={
                styles.headerTitle
              }
            >
              Ask Doubt
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              Ask with Audio,
              Video & Images
            </Text>
          </View>

          <View
            style={{
              width: 40,
            }}
          />
        </View>

        {/* SUBJECTS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={{
            marginBottom: 18,
          }}
        >
          {ALL_TYPES.map(
            (item) => {
              const active =
                selectedType ===
                item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.typeCard,
                    active &&
                      styles.typeCardActive,
                  ]}
                  onPress={() =>
                    setSelectedType(
                      item.key
                    )
                  }
                >
                  {renderTypeIcon(
                    item,
                    active
                  )}

                  <Text
                    style={[
                      styles.typeText,
                      active &&
                        styles.typeTextActive,
                    ]}
                  >
                    {item.key}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </ScrollView>

        {/* INPUT */}

        <View
          style={
            styles.inputCard
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Ask Your Question
          </Text>

          <TextInput
            placeholder="Type your doubt here..."
            placeholderTextColor="#98A2B3"
            multiline
            value={doubtText}
            onChangeText={
              setDoubtText
            }
            style={styles.input}
          />
        </View>

        {/* ACTIONS */}

        <View
          style={
            styles.actionsRow
          }
        >
          <TouchableOpacity
            style={
              styles.actionBtn
            }
            onPress={
              openCamera
            }
          >
            <Ionicons
              name="camera"
              size={24}
              color={
                COLORS.primary
              }
            />
            <Text
              style={
                styles.actionText
              }
            >
              Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.actionBtn
            }
            onPress={
              openGallery
            }
          >
            <Ionicons
              name="images"
              size={24}
              color={
                COLORS.primary
              }
            />
            <Text
              style={
                styles.actionText
              }
            >
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.actionBtn
            }
            onPress={
              pickDocument
            }
          >
            <Ionicons
              name="document-text"
              size={24}
              color={
                COLORS.primary
              }
            />
            <Text
              style={
                styles.actionText
              }
            >
              Docs
            </Text>
          </TouchableOpacity>
        </View>

        {/* AUDIO */}

        <View
          style={
            styles.audioCard
          }
        >
          <View style={styles.audioHeaderRow}>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Audio Doubt
            </Text>

            <View
              style={[
                styles.audioStatePill,
                isRecording
                  ? styles.audioStatePillLive
                  : recordingUri
                  ? styles.audioStatePillReady
                  : styles.audioStatePillIdle,
              ]}
            >
              <View
                style={[
                  styles.audioStateDot,
                  isRecording
                    ? styles.audioStateDotLive
                    : recordingUri
                    ? styles.audioStateDotReady
                    : styles.audioStateDotIdle,
                ]}
              />
              <Text
                style={[
                  styles.audioStateText,
                  isRecording
                    ? styles.audioStateTextLive
                    : recordingUri
                    ? styles.audioStateTextReady
                    : styles.audioStateTextIdle,
                ]}
              >
                {isRecording
                  ? "Recording"
                  : recordingUri
                  ? "Ready to play"
                  : "Idle"}
              </Text>
            </View>
          </View>

          {!isRecording ? (
            <TouchableOpacity
              style={
                [styles.recordBtn, recordingUri && styles.recordBtnSecondary]
              }
              onPress={
                startRecording
              }
            >
              <Ionicons
                name="mic"
                size={24}
                color="#fff"
              />

              <Text
                style={
                  styles.recordText
                }
              >
                {recordingUri
                  ? "Record Again"
                  : "Start Recording"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.recordBtn,
                {
                  backgroundColor:
                    COLORS.red,
                },
              ]}
              onPress={
                stopRecording
              }
            >
              <Ionicons
                name="stop"
                size={24}
                color="#fff"
              />

              <Text
                style={
                  styles.recordText
                }
              >
                Stop Recording
              </Text>
            </TouchableOpacity>
          )}

          {recordingUri && (
            <View
              style={
                styles.audioPreview
              }
            >
              <View style={styles.audioPreviewTopRow}>
                <View style={styles.audioPreviewInfo}>
                  <View style={styles.audioPreviewIcon}>
                    <Ionicons name="musical-notes" size={16} color={COLORS.primary} />
                  </View>
                  <View style={styles.audioPreviewTextWrap}>
                    <Text style={styles.audioPreviewTitle}>Voice note saved</Text>
                    <Text style={styles.audioPreviewSub}>Tap play to listen or remove to record again</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.audioRemoveBtn}
                  onPress={
                    removeAudio
                  }
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={COLORS.red}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.audioPlayBtn}
                onPress={
                  playAudio
                }
              >
                <Ionicons
                  name="play"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.audioPlayText}>Play</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* VIDEO */}

        <View
          style={
            styles.videoCard
          }
        >
          <TouchableOpacity
            style={
              styles.videoBtn
            }
            onPress={
              recordVideo
            }
          >
            <Ionicons
              name="videocam"
              size={24}
              color="#fff"
            />

            <Text
              style={
                styles.recordText
              }
            >
              Record Video
            </Text>
          </TouchableOpacity>

          {videoUri && (
            <View>
              <Video
                source={{
                  uri: videoUri,
                }}
                style={
                  styles.video
                }
                useNativeControls
                resizeMode={
                  ResizeMode.CONTAIN
                }
              />

              <TouchableOpacity
                style={{
                  marginTop: 10,
                  alignSelf:
                    "flex-end",
                }}
                onPress={
                  removeVideo
                }
              >
                <Ionicons
                  name="close-circle"
                  size={30}
                  color={
                    COLORS.red
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* IMAGE PREVIEW */}

        {allImages.length >
          0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            style={{
              marginBottom: 20,
            }}
          >
            {allImages.map(
              (
                item,
                index
              ) => (
                <View
                  key={index}
                  style={
                    styles.previewImageWrap
                  }
                >
                  <Image
                    source={{
                      uri: item.uri,
                    }}
                    style={
                      styles.previewImage
                    }
                  />

                  <TouchableOpacity
                    style={
                      styles.removeBtn
                    }
                    onPress={() =>
                      removeImage(
                        item.sourceType,
                        item.uri
                      )
                    }
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              )
            )}
          </ScrollView>
        )}

        {/* DOCS */}

        {documents.length >
          0 && (
          <View
            style={{
              marginBottom: 20,
            }}
          >
            {documents.map(
              (
                item,
                index
              ) => (
                <View
                  key={index}
                  style={
                    styles.docCard
                  }
                >
                  <View
                    style={{
                      flexDirection:
                        "row",
                      alignItems:
                        "center",
                    }}
                  >
                    <Ionicons
                      name="document"
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
                      {
                        item.name
                      }
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      removeDocument(
                        index
                      )
                    }
                  >
                    <Ionicons
                      name="close-circle"
                      size={26}
                      color={
                        COLORS.red
                      }
                    />
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        )}

        {/* SUBMIT */}

        <TouchableOpacity
          style={
            styles.submitBtn
          }
          onPress={
            handleSubmit
          }
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name="send"
                size={22}
                color="#fff"
              />

              <Text
                style={
                  styles.submitText
                }
              >
                Submit Doubt
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <StudentBottomNavigation
        navigation={
          navigation
        }
        active="AskDoubt"
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

    scrollContent: {
      paddingHorizontal: 16,
      paddingTop:
        Platform.OS ===
        "android"
          ? 14
          : 8,
      paddingBottom: 120,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 18,
    },

    backBtn: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      justifyContent:
        "center",
      alignItems: "center",
    },

    headerCenter: {
      flex: 1,
      alignItems: "center",
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: COLORS.text,
    },

    headerSubtitle: {
      marginTop: 4,
      fontSize: 12,
      color: COLORS.muted,
      fontWeight: "600",
    },

    typeCard: {
      backgroundColor:
        "#fff",
      padding: 14,
      borderRadius: 18,
      marginRight: 12,
      alignItems: "center",
      width: 90,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    typeCardActive: {
      backgroundColor:
        COLORS.primaryLight,
      borderColor:
        COLORS.primary,
    },

    typeText: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: "700",
      color: COLORS.muted,
      textAlign: "center",
    },

    typeTextActive: {
      color:
        COLORS.primary,
    },

    inputCard: {
      backgroundColor:
        "#fff",
      borderRadius: 20,
      padding: 16,
      marginBottom: 18,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: COLORS.text,
      marginBottom: 12,
    },

    input: {
      minHeight: 130,
      textAlignVertical:
        "top",
      fontSize: 15,
      color: COLORS.text,
    },

    actionsRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginBottom: 20,
    },

    actionBtn: {
      flex: 1,
      backgroundColor:
        "#fff",
      padding: 16,
      borderRadius: 18,
      alignItems: "center",
      marginHorizontal: 4,
    },

    actionText: {
      marginTop: 8,
      fontWeight: "700",
      color: COLORS.text,
    },

    audioCard: {
      backgroundColor:
        "#fff",
      borderRadius: 22,
      padding: 18,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#EAF0F6",
    },

    audioHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },

    audioStatePill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },

    audioStatePillIdle: {
      backgroundColor: "#F4F7FB",
      borderColor: "#E2E8F0",
    },

    audioStatePillLive: {
      backgroundColor: "#FFF1F1",
      borderColor: "#FFD7D7",
    },

    audioStatePillReady: {
      backgroundColor: "#EAF8F6",
      borderColor: "#C8EEE7",
    },

    audioStateDot: {
      width: 8,
      height: 8,
      borderRadius: 99,
      marginRight: 8,
    },

    audioStateDotIdle: {
      backgroundColor: "#94A3B8",
    },

    audioStateDotLive: {
      backgroundColor: COLORS.red,
    },

    audioStateDotReady: {
      backgroundColor: COLORS.primary,
    },

    audioStateText: {
      fontSize: 11,
      fontWeight: "800",
    },

    audioStateTextIdle: {
      color: "#64748B",
    },

    audioStateTextLive: {
      color: COLORS.red,
    },

    audioStateTextReady: {
      color: COLORS.primary,
    },

    recordBtn: {
      backgroundColor:
        COLORS.primary,
      padding: 16,
      borderRadius: 18,
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems: "center",
    },

    recordBtnSecondary: {
      marginTop: 2,
    },

    recordText: {
      color: "#fff",
      fontWeight: "800",
      marginLeft: 10,
    },

    audioPreview: {
      marginTop: 16,
      borderTopWidth: 1,
      borderTopColor: "#EEF2F7",
      paddingTop: 14,
    },

    audioPreviewTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 12,
    },

    audioPreviewInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      paddingRight: 12,
    },

    audioPreviewIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: "#EAF8F6",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },

    audioPreviewTextWrap: {
      flex: 1,
    },

    audioPreviewTitle: {
      fontSize: 13,
      fontWeight: "800",
      color: COLORS.text,
    },

    audioPreviewSub: {
      fontSize: 11,
      color: COLORS.muted,
      marginTop: 2,
    },

    audioPreviewActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    audioPlayBtn: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: COLORS.primary,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
      minWidth: 92,
      justifyContent: "center",
    },

    audioPlayText: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 13,
    },

    audioRemoveBtn: {
      width: 40,
      height: 40,
      borderRadius: 16,
      backgroundColor: "#FFF1F1",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#FFD7D7",
    },

    videoCard: {
      marginBottom: 20,
    },

    videoBtn: {
      backgroundColor:
        "#111827",
      padding: 16,
      borderRadius: 18,
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems: "center",
    },

    video: {
      width: "100%",
      height: 220,
      borderRadius: 20,
      marginTop: 16,
      backgroundColor:
        "#000",
    },

    previewImageWrap: {
      marginRight: 14,
      position: "relative",
    },

    previewImage: {
      width: 120,
      height: 120,
      borderRadius: 18,
    },

    removeBtn: {
      position: "absolute",
      top: 6,
      right: 6,
      backgroundColor:
        COLORS.red,
      width: 26,
      height: 26,
      borderRadius: 13,
      justifyContent:
        "center",
      alignItems: "center",
    },

    docCard: {
      backgroundColor:
        "#fff",
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    docName: {
      marginLeft: 10,
      fontWeight: "700",
      color: COLORS.text,
      maxWidth: width * 0.55,
    },

    submitBtn: {
      backgroundColor:
        COLORS.primary,
      height: 58,
      borderRadius: 18,
      justifyContent:
        "center",
      alignItems: "center",
      flexDirection: "row",
      marginTop: 10,
      marginBottom: 40,
    },

    submitText: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 16,
      marginLeft: 10,
    },
  });

































