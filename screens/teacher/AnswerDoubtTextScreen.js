
// screens/teacher/AnswerDoubtTextScreen.js

import React, {
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
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Alert,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

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

export default function AnswerDoubtTextScreen({
  navigation,
  route,
  }) {
  const {
    currentUser,
    submitTextAnswer,
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

  // =====================================
  // STATES
  // =====================================

  const [answer, setAnswer] =
    useState("");

  const [
    attachments,
    setAttachments,
  ] = useState([]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isPreviewing, setIsPreviewing] =
    useState(false);

  // =====================================
  // HISTORY
  // =====================================

  const historyRef =
    useRef([""]);

  const historyIndexRef =
    useRef(0);

  const [
    historyState,
    setHistoryState,
  ] = useState({
    index: 0,
    length: 1,
  });

  // =====================================
  // WORD COUNT
  // =====================================

  const wordsCount =
    useMemo(() => {
      return answer
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;
    }, [answer]);

  // =====================================
  // HANDLE CHANGE
  // =====================================

  const handleAnswerChange =
    (text) => {
      setAnswer(text);

      const sliced =
        historyRef.current.slice(
          0,
          historyIndexRef.current +
            1
        );

      sliced.push(text);

      historyRef.current =
        sliced;

      historyIndexRef.current =
        sliced.length - 1;

      setHistoryState({
        index:
          historyIndexRef.current,
        length:
          sliced.length,
      });
    };

  // =====================================
  // UNDO
  // =====================================

  const handleUndo =
    () => {
      if (
        historyIndexRef.current >
        0
      ) {
        historyIndexRef.current -= 1;

        const prev =
          historyRef.current[
            historyIndexRef.current
          ];

        setAnswer(prev);

        setHistoryState({
          index:
            historyIndexRef.current,
          length:
            historyRef.current
              .length,
        });
      }
    };

  // =====================================
  // REDO
  // =====================================

  const handleRedo =
    () => {
      if (
        historyIndexRef.current <
        historyRef.current
          .length -
          1
      ) {
        historyIndexRef.current += 1;

        const next =
          historyRef.current[
            historyIndexRef.current
          ];

        setAnswer(next);

        setHistoryState({
          index:
            historyIndexRef.current,
          length:
            historyRef.current
              .length,
        });
      }
    };

  // =====================================
  // INSERT TEXT
  // =====================================

  const insertText =
    (snippet) => {
      handleAnswerChange(
        answer + snippet
      );
    };

  // =====================================
  // DELETE TEXT
  // =====================================

  const handleDeleteText =
    () => {
      setAnswer("");

      historyRef.current = [""];
      historyIndexRef.current = 0;

      setHistoryState({
        index: 0,
        length: 1,
      });
    };

  // =====================================
  // REMOVE FILE
  // =====================================

  const removeAttachment =
    (id) => {
      setAttachments(
        (prev) =>
          prev.filter(
            (item) =>
              item.id !== id
          )
      );
    };

  // =====================================
  // CLEAR FILES
  // =====================================

  const handleClearAttachments =
    () => {
      setAttachments([]);
    };

  // =====================================
  // PICK IMAGE
  // =====================================

  const pickImage =
    async () => {
      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          !permission.granted
        ) {
          global.showAlert(
            "Permission Required",
            "Gallery permission is needed."
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes:
                ImagePicker
                  .MediaTypeOptions
                  .Images,

              quality: 0.8,

              allowsEditing: true,
            }
          );

        if (
          !result.canceled
        ) {
          const asset =
            result.assets[0];

          setAttachments(
            (prev) => [
              ...prev,
              {
                id:
                  Date.now().toString(),

                name:
                  asset.fileName ||
                  `image_${Date.now()}.jpg`,

                size:
                  "Image",

                image:
                  asset.uri,

                type:
                  "image",

                uri:
                  asset.uri,
              },
            ]
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

  // =====================================
  // PICK DOC
  // =====================================

  const pickDocument =
    async () => {
      try {
        const result =
          await DocumentPicker.getDocumentAsync(
            {
              multiple: false,

              copyToCacheDirectory: true,

              type: "*/*",
            }
          );

        if (
          !result.canceled
        ) {
          const file =
            result.assets[0];

          setAttachments(
            (prev) => [
              ...prev,
              {
                id:
                  Date.now().toString(),

                name:
                  file.name,

                size:
                  "Document",

                image:
                  "https://cdn-icons-png.flaticon.com/512/337/337946.png",

                type:
                  "document",

                uri:
                  file.uri,
              },
            ]
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

  // =====================================
  // SUBMIT
  // =====================================

  const handleSubmit =
    async () => {
      if (
        !answer.trim()
      ) {
        global.showAlert(
          "Empty Answer",
          "Please type your answer."
        );

        return;
      }

      if (
        isSubmitting
      )
        return;

      try {
        setIsSubmitting(
          true
        );

        await submitTextAnswer(
          doubt.id,
          {
            answerText:
              answer,

            attachments,

              teacherId,
              teacherName,

            answerType:
              "Text",

            answered:
              true,

            status:
              "Answered",

            answeredAt:
              new Date().toISOString(),
          }
        );

        navigation.replace(
          "AnswerSuccessScreen",
          {
            answerType:
              "Text Answer",

            doubt: {
              ...doubt,

              answered: true,

              status:
                "Answered",

              answerText:
                answer,

              answerType:
                "Text",

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
          "Error",
          "Failed to submit answer."
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  // =====================================
  // PREVIEW
  // =====================================

  const handlePreview =
    () => {
      if (
        isPreviewing
      )
        return;

      setIsPreviewing(
        true
      );

      navigation.navigate(
        "StudentDoubtDetailScreen",
        {
          doubt: {
            ...doubt,

            answered: true,

            status:
              "Answered",

            answerText:
              answer,

            answerType:
              "Text",

              assignedTeacher:
                teacherName,
          },
        }
      );

      setTimeout(() => {
        setIsPreviewing(
          false
        );
      }, 600);
    };

  const canUndo =
    historyState.index >
    0;

  const canRedo =
    historyState.index <
    historyState.length -
      1;

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

      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >
        {/* HEADER */}

        <View
          style={
            styles.header
          }
        >
          <TouchableOpacity
            activeOpacity={
              0.85
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
            Text Answer
          </Text>

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            style={
              styles.draftBtn
            }
          >
            <Feather
              name="file-text"
              size={18}
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.draftText
              }
            >
              Draft
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingBottom: 160,
          }}
        >
          {/* TOP CARD */}

          <View
            style={
              styles.topCard
            }
          >
            <View
              style={
                styles.subjectIcon
              }
            >
              <Ionicons
                name="school-outline"
                size={28}
                color={
                  COLORS.primary
                }
              />
            </View>

            <View
              style={{
                flex: 1,
                marginLeft: 14,
              }}
            >
              <Text
                style={
                  styles.title
                }
              >
                {
                  doubt.question ||
                  "No Question"
                }
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                {
                  doubt.subject ||
                  "General"
                }{" "}
                •{" "}
                {
                  doubt.className ||
                  "Class"
                }
              </Text>

              <Text
                style={
                  styles.studentText
                }
              >
                {
                  doubt.studentName ||
                  "Student"
                }
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

          {/* QUESTION */}

          <View
            style={
              styles.questionCard
            }
          >
            <View
              style={{
                flexDirection:
                  "row",
              }}
            >
              <View
                style={
                  styles.qCircle
                }
              >
                <Text
                  style={
                    styles.qText
                  }
                >
                  Q
                </Text>
              </View>

              <Text
                style={
                  styles.question
                }
              >
                {
                  doubt.description ||
                  doubt.question
                }
              </Text>
            </View>
          </View>

          {/* ANSWER */}

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
              Type Your Answer
            </Text>

            {/* TOOLBAR */}

            <View
              style={
                styles.toolbar
              }
            >
              <TouchableOpacity
                style={
                  styles.toolBtn
                }
                onPress={() =>
                  insertText(
                    "**bold**"
                  )
                }
              >
                <Text
                  style={
                    styles.boldText
                  }
                >
                  B
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.toolBtn
                }
                onPress={() =>
                  insertText(
                    "_italic_"
                  )
                }
              >
                <Text
                  style={
                    styles.italicText
                  }
                >
                  I
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.toolBtn
                }
                onPress={() =>
                  insertText(
                    "\n• Point"
                  )
                }
              >
                <MaterialIcons
                  name="format-list-bulleted"
                  size={22}
                  color={
                    COLORS.text
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.toolBtn
                }
                onPress={
                  pickImage
                }
              >
                <Ionicons
                  name="image-outline"
                  size={22}
                  color={
                    COLORS.text
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.toolBtn
                }
                onPress={
                  pickDocument
                }
              >
                <Ionicons
                  name="attach-outline"
                  size={22}
                  color={
                    COLORS.text
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={
                  !canUndo
                }
                style={[
                  styles.toolBtn,
                  !canUndo && {
                    opacity: 0.4,
                  },
                ]}
                onPress={
                  handleUndo
                }
              >
                <Ionicons
                  name="arrow-undo-outline"
                  size={22}
                  color={
                    COLORS.text
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={
                  !canRedo
                }
                style={[
                  styles.toolBtn,
                  !canRedo && {
                    opacity: 0.4,
                  },
                ]}
                onPress={
                  handleRedo
                }
              >
                <Ionicons
                  name="arrow-redo-outline"
                  size={22}
                  color={
                    COLORS.text
                  }
                />
              </TouchableOpacity>
            </View>

            {/* INPUT */}

            <TextInput
              multiline
              value={answer}
              onChangeText={
                handleAnswerChange
              }
              placeholder="Type detailed answer..."
              placeholderTextColor="#AAB3C5"
              style={
                styles.input
              }
              textAlignVertical="top"
            />

            {/* COUNT */}

            <View
              style={
                styles.counterRow
              }
            >
              <Text
                style={
                  styles.counterText
                }
              >
                Words:{" "}
                {answer.trim()
                  ? wordsCount
                  : 0}
              </Text>

              <Text
                style={
                  styles.counterText
                }
              >
                Characters:{" "}
                {
                  answer.length
                }
              </Text>
            </View>
          </View>

          {/* ATTACHMENTS */}

          <View
            style={
              styles.attachmentsCard
            }
          >
            <View
              style={
                styles.attachmentsTop
              }
            >
              <View>
                <Text
                  style={
                    styles.attachmentsTitle
                  }
                >
                  Attachments
                </Text>

                <Text
                  style={
                    styles.attachmentsCount
                  }
                >
                  {
                    attachments.length
                  }{" "}
                  files
                </Text>
              </View>

              {attachments.length >
                0 && (
                <TouchableOpacity
                  onPress={
                    handleClearAttachments
                  }
                >
                  <Text
                    style={
                      styles.clearText
                    }
                  >
                    Clear
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {attachments.length ===
              0 && (
              <View
                style={
                  styles.emptyAttach
                }
              >
                <Ionicons
                  name="attach-outline"
                  size={38}
                  color={
                    COLORS.muted
                  }
                />

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  No Attachments
                </Text>
              </View>
            )}

            {attachments.map(
              (item) => (
                <View
                  key={
                    item.id
                  }
                  style={
                    styles.fileCard
                  }
                >
                  <View
                    style={
                      styles.fileLeft
                    }
                  >
                    <Image
                      source={{
                        uri:
                          item.image,
                      }}
                      style={
                        styles.fileImage
                      }
                    />

                    <View
                      style={{
                        flex: 1,
                        marginLeft: 12,
                      }}
                    >
                      <Text
                        numberOfLines={
                          1
                        }
                        style={
                          styles.fileName
                        }
                      >
                        {
                          item.name
                        }
                      </Text>

                      <Text
                        style={
                          styles.fileType
                        }
                      >
                        {
                          item.size
                        }
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      removeAttachment(
                        item.id
                      )
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
              )
            )}
          </View>
        </ScrollView>

        {/* BOTTOM */}

        <View
          style={
            styles.bottomBar
          }
        >
          <TouchableOpacity
            activeOpacity={
              0.9
            }
            style={
              styles.previewBtn
            }
            onPress={
              handlePreview
            }
          >
            <Ionicons
              name="eye-outline"
              size={22}
              color={
                COLORS.text
              }
            />

            <Text
              style={
                styles.previewBtnText
              }
            >
              Preview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={
              0.9
            }
            disabled={
              !answer.trim() ||
              isSubmitting
            }
            style={[
              styles.submitBtn,

              (!answer.trim() ||
                isSubmitting) && {
                opacity: 0.5,
              },
            ]}
            onPress={
              handleSubmit
            }
          >
            <Ionicons
              name="paper-plane-outline"
              size={22}
              color={
                COLORS.white
              }
            />

            <Text
              style={
                styles.submitBtnText
              }
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    },

    headerTitle: {
      fontSize: 21,
      fontWeight: "900",
      color:
        COLORS.text,
    },

    draftBtn: {
      height: 46,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor:
        COLORS.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    draftText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: "800",
      color:
        COLORS.primary,
    },

    topCard: {
      marginHorizontal: 18,
      marginTop: 22,
      backgroundColor:
        COLORS.white,
      borderRadius: 24,
      padding: 18,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        COLORS.border,
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

    title: {
      fontSize: 17,
      fontWeight: "900",
      color:
        COLORS.text,
    },

    subtitle: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "700",
      color:
        COLORS.muted,
    },

    studentText: {
      marginTop: 5,
      fontSize: 12,
      fontWeight: "700",
      color:
        COLORS.muted,
    },

    price: {
      fontSize: 28,
      fontWeight: "900",
      color:
        COLORS.green,
    },

    questionCard: {
      marginHorizontal: 18,
      marginTop: 18,
      backgroundColor:
        COLORS.white,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    qCircle: {
      width: 38,
      height: 38,
      borderRadius: 30,
      backgroundColor:
        COLORS.primary,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 14,
    },

    qText: {
      fontSize: 18,
      fontWeight: "900",
      color:
        COLORS.white,
    },

    question: {
      flex: 1,
      fontSize: 16,
      lineHeight: 30,
      fontWeight: "700",
      color:
        COLORS.text,
    },

    answerCard: {
      marginHorizontal: 18,
      marginTop: 18,
      backgroundColor:
        COLORS.white,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    answerTitle: {
      fontSize: 18,
      fontWeight: "900",
      color:
        COLORS.text,
      marginBottom: 18,
    },

    toolbar: {
      minHeight: 54,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      backgroundColor:
        "#FCFCFD",
      flexDirection:
        "row",
      alignItems:
        "center",
      flexWrap: "wrap",
      paddingHorizontal: 8,
      paddingVertical: 4,
    },

    toolBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 2,
    },

    boldText: {
      fontSize: 20,
      fontWeight: "900",
      color:
        COLORS.text,
    },

    italicText: {
      fontSize: 20,
      fontStyle:
        "italic",
      color:
        COLORS.text,
    },

    input: {
      minHeight: 300,
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor:
        COLORS.border,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      backgroundColor:
        COLORS.white,
      paddingHorizontal: 18,
      paddingVertical: 16,
      fontSize: 17,
      lineHeight: 30,
      color:
        COLORS.text,
      fontWeight: "500",
    },

    counterRow: {
      marginTop: 12,
      flexDirection:
        "row",
      justifyContent:
        "space-between",
    },

    counterText: {
      fontSize: 13,
      fontWeight: "600",
      color:
        COLORS.muted,
    },

    attachmentsCard: {
      marginHorizontal: 18,
      marginTop: 18,
      backgroundColor:
        COLORS.white,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    attachmentsTop: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom: 14,
    },

    attachmentsTitle: {
      fontSize: 18,
      fontWeight: "900",
      color:
        COLORS.text,
    },

    attachmentsCount: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "700",
      color:
        COLORS.muted,
    },

    clearText: {
      fontSize: 14,
      fontWeight: "800",
      color:
        COLORS.danger,
    },

    emptyAttach: {
      alignItems:
        "center",
      paddingVertical: 26,
    },

    emptyText: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: "600",
      color:
        COLORS.muted,
    },

    fileCard: {
      minHeight: 76,
      borderRadius: 18,
      backgroundColor:
        COLORS.card,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 12,
    },

    fileLeft: {
      flexDirection:
        "row",
      alignItems:
        "center",
      flex: 1,
    },

    fileImage: {
      width: 50,
      height: 50,
      borderRadius: 12,
    },

    fileName: {
      fontSize: 15,
      fontWeight: "800",
      color:
        COLORS.text,
    },

    fileType: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "600",
      color:
        COLORS.muted,
    },

    bottomBar: {
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

    previewBtn: {
      flex: 1,
      height: 58,
      borderRadius: 18,
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 10,
    },

    previewBtnText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: "800",
      color:
        COLORS.text,
    },

    submitBtn: {
      flex: 1.4,
      height: 58,
      borderRadius: 18,
      backgroundColor:
        COLORS.primary,
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginLeft: 10,
    },

    submitBtnText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: "900",
      color:
        COLORS.white,
    },
  });
