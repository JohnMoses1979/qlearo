



// TeacherMockTestCategoriesScreen.js

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

const { width } = Dimensions.get("window");

const C = {
  bg: "#F3F6FB",
  card: "#FFFFFF",
  text: "#07123D",
  muted: "#73829A",
  border: "#E4ECF5",
  primary: "#061755",
  green: "#05B986",
  greenSoft: "#E8FFF7",
  blue: "#236CFF",
  blueSoft: "#EAF2FF",
  purple: "#7C4DFF",
  purpleSoft: "#F2ECFF",
  pink: "#FF4FA3",
  pinkSoft: "#FFF0F8",
  orange: "#FF7A1A",
  orangeSoft: "#FFF1E8",
  cyan: "#10BFD4",
  cyanSoft: "#E8FCFF",
  yellow: "#FFB300",
  yellowSoft: "#FFF8E5",
  danger: "#FF3B7A",
};

const CATEGORY_EMOJIS = [
  { emoji: "🎓", color: C.green, soft: C.greenSoft },
  { emoji: "🎯", color: C.pink, soft: C.pinkSoft },
  { emoji: "🏛️", color: C.purple, soft: C.purpleSoft },
  { emoji: "🏢", color: C.orange, soft: C.orangeSoft },
  { emoji: "💻", color: C.cyan, soft: C.cyanSoft },
  { emoji: "🩺", color: C.pink, soft: C.pinkSoft },
  { emoji: "🛡️", color: C.yellow, soft: C.yellowSoft },
  { emoji: "🌍", color: C.cyan, soft: C.cyanSoft },
  { emoji: "🏦", color: C.blue, soft: C.blueSoft },
  { emoji: "🧠", color: C.purple, soft: C.purpleSoft },
];

const SUBJECT_EMOJIS = [
  { emoji: "🧮", color: C.blue, soft: C.blueSoft },
  { emoji: "🧪", color: C.green, soft: C.greenSoft },
  { emoji: "📚", color: C.purple, soft: C.purpleSoft },
  { emoji: "🌎", color: C.orange, soft: C.orangeSoft },
  { emoji: "🖥️", color: C.cyan, soft: C.cyanSoft },
  { emoji: "⚡", color: C.blue, soft: C.blueSoft },
  { emoji: "🌿", color: C.green, soft: C.greenSoft },
  { emoji: "📰", color: C.orange, soft: C.orangeSoft },
  { emoji: "🧬", color: C.pink, soft: C.pinkSoft },
  { emoji: "📐", color: C.yellow, soft: C.yellowSoft },
];

function makeId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function slugify(value = "") {
  return (
    String(value || "item")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "item"
  );
}

function getSubjectTestsCount(subject) {
  const list = safeArray(subject?.list);
  if (list.length > 0) return list.length;
  return Number(subject?.tests || 0);
}

function getSubjectQuestionsCount(subject) {
  const list = safeArray(subject?.list);

  if (list.length > 0) {
    return list.reduce((sum, test) => sum + Number(test?.questions || 0), 0);
  }

  return Number(subject?.questions || 0);
}

function getSubjectAttemptsCount(subject) {
  return safeArray(subject?.list).reduce(
    (sum, test) => sum + Number(test?.attempts || 0),
    0
  );
}

function getTotalTests(category) {
  return safeArray(category?.subjects).reduce(
    (sum, subject) => sum + getSubjectTestsCount(subject),
    0
  );
}

function getTotalQuestionsFromCategory(category) {
  return safeArray(category?.subjects).reduce(
    (sum, subject) => sum + getSubjectQuestionsCount(subject),
    0
  );
}

function getTotalAttemptsFromCategory(category) {
  return safeArray(category?.subjects).reduce(
    (sum, subject) => sum + getSubjectAttemptsCount(subject),
    0
  );
}

function getLevelColor(level) {
  if (level === "Easy") return C.green;
  if (level === "Medium") return C.orange;
  return C.danger;
}

function getLevelSoft(level) {
  if (level === "Easy") return C.greenSoft;
  if (level === "Medium") return C.orangeSoft;
  return C.pinkSoft;
}

function EmojiBox({ emoji, soft, size = 44, emojiSize = 24 }) {
  return (
    <View
      style={[
        styles.emojiBox,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size / 3),
          backgroundColor: soft || C.blueSoft,
        },
      ]}
    >
      <Text style={{ fontSize: emojiSize }}>{emoji || "🎓"}</Text>
    </View>
  );
}

function EmptyState({ title, sub }) {
  return (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
    </View>
  );
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#95A0B5"
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.formInput, multiline && styles.formInputMulti]}
      />
    </View>
  );
}

function AppModal({ visible, title, subtitle, onClose, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={styles.modalDim} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSub}>{subtitle}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.modalClose}
              onPress={onClose}
            >
              <Ionicons name="close" size={22} color={C.primary} />
            </TouchableOpacity>
          </View>

          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ErrorText({ text }) {
  if (!text) return null;
  return <Text style={styles.errorText}>{text}</Text>;
}

/* --------------------------------------------
   1. TEACHER CATEGORY SCREEN
--------------------------------------------- */
export function TeacherMockTestCategoriesScreen({ navigation }) {
  const {
    teacherMockCatalog,
    addMockCategory,
    refreshTeacherMockCatalog,
    currentUser,
  } = useAppContext();

  const [search, setSearch] = useState("");
  const [categoryModal, setCategoryModal] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);

  const [categoryForm, setCategoryForm] = useState({
    title: "",
    subtitle: "",
    description: "",
  });

  useFocusEffect(
    useCallback(() => {
      const teacherId = currentUser?.teacherId || currentUser?.id || "";
      void refreshTeacherMockCatalog?.(teacherId);
      return () => {};
    }, [currentUser?.id, currentUser?.teacherId, refreshTeacherMockCatalog])
  );

  const categoryList = useMemo(() => {
    const fromContext = safeArray(teacherMockCatalog);
    if (fromContext.length > 0) return fromContext;
    return [];
  }, [teacherMockCatalog]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categoryList;

    return categoryList.filter(
      (item) =>
        String(item?.title || "").toLowerCase().includes(q) ||
        String(item?.subtitle || "").toLowerCase().includes(q) ||
        String(item?.description || "").toLowerCase().includes(q)
    );
  }, [search, categoryList]);

  const resetCategoryForm = () => {
    setCategoryForm({
      title: "",
      subtitle: "",
      description: "",
    });
    setSelectedIconIndex(0);
    setCategoryError("");
  };

  const openCategoryModal = () => {
    resetCategoryForm();
    setCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setCategoryModal(false);
    resetCategoryForm();
  };

  const createCategory = async () => {
    const title = categoryForm.title.trim();
    const subtitle = categoryForm.subtitle.trim();
    const description = categoryForm.description.trim();

    if (!title) {
      setCategoryError("Please enter category name.");
      return;
    }

    const alreadyExists = categoryList.some(
      (item) => String(item?.title || "").toLowerCase() === title.toLowerCase()
    );

    if (alreadyExists) {
      setCategoryError("This category already exists.");
      return;
    }

    const iconData = CATEGORY_EMOJIS[selectedIconIndex] || CATEGORY_EMOJIS[0];

    try {
      await addMockCategory({
        title,
        subtitle: subtitle || "New Category",
        description: description || "Teacher created mock test category",
        emoji: iconData.emoji,
        color: iconData.color,
        soft: iconData.soft,
        subjects: [],
      });

      await refreshTeacherMockCatalog?.(currentUser?.teacherId || currentUser?.id || "");
      closeCategoryModal();
    } catch (error) {
      const errorMessage = String(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          ""
      );
      const isConflict =
        error?.response?.status === 409 ||
        error?.status === 409 ||
        errorMessage.toLowerCase().includes("already exists");

      if (isConflict) {
        await refreshTeacherMockCatalog?.(currentUser?.teacherId || currentUser?.id || "");
        closeCategoryModal();
        return;
      }

      setCategoryError(error?.message || "Unable to save category.");
    }
  };

  const goSubjectScreen = (item) => {
    navigation.navigate("TeacherMockTestSubjects", {
      category: item.title,
      categoryTitle: item.title,
    });
  };

  const openAnalysisScreen = () => {
    navigation.navigate("TeacherMockTestAnalysis", {
      mockData: teacherMockCatalog,
      from: "TeacherMockTestCategories",
    });
  };

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.75} style={styles.headerBtn} onPress={goBackSafe}>
            <Ionicons name="chevron-back" size={24} color={C.primary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>All Categories</Text>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.headerBtn}
            onPress={() => setSearch("")}
          >
            <Ionicons name="search-outline" size={22} color={C.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color={C.muted} />

          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.topCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.topTitle}>Mock Test Categories</Text>
              <Text style={styles.topSub}>Select category to create and manage tests</Text>
            </View>

            <View style={styles.typeBadge}>
              <Text style={styles.typeNo}>{categoryList.length}</Text>
              <Text style={styles.typeText}>Types</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.mainAnalysisCard}
            activeOpacity={0.86}
            onPress={openAnalysisScreen}
          >
            <View style={styles.mainAnalysisIcon}>
              <Ionicons name="bar-chart-outline" size={22} color={C.blue} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.mainAnalysisTitle}>Mock Test Analysis</Text>
              <Text style={styles.mainAnalysisSub}>
                View overall category, subject and test performance
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color={C.blue} />
          </TouchableOpacity>

          {filtered.length === 0 ? (
            <EmptyState
              title="No categories found"
              sub="Try another search or create a new category."
            />
          ) : (
            <View style={styles.grid}>
              {filtered.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  activeOpacity={0.85}
                  style={styles.categoryCard}
                  onPress={() => goSubjectScreen(item)}
                >
                  <EmojiBox emoji={item.emoji} soft={item.soft} size={46} emojiSize={23} />

                  <Text style={styles.categoryName} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <Text style={styles.categorySub} numberOfLines={1}>
                    {item.subtitle}
                  </Text>

                  <View
                    style={[
                      styles.testMini,
                      { backgroundColor: item.soft || C.greenSoft },
                    ]}
                  >
                    <Text
                      style={[
                        styles.testMiniText,
                        { color: item.color || C.green },
                      ]}
                    >
                      {getTotalTests(item)} Tests
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.createBigCard}
            activeOpacity={0.86}
            onPress={openCategoryModal}
          >
            <View style={styles.dashedCircle}>
              <Ionicons name="add" size={25} color={C.green} />
            </View>

            <Text style={styles.createBigText}>Create New Category</Text>
          </TouchableOpacity>
        </ScrollView>

        <TeacherBottomNavigation navigation={navigation} active="Home" />
      </View>

      <AppModal
        visible={categoryModal}
        title="Create Category"
        subtitle="Add a new mock test category"
        onClose={closeCategoryModal}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <FormInput
            label="Category Name"
            value={categoryForm.title}
            onChangeText={(v) => {
              setCategoryForm((p) => ({ ...p, title: v }));
              setCategoryError("");
            }}
            placeholder="Example: Banking"
          />

          <FormInput
            label="Subtitle"
            value={categoryForm.subtitle}
            onChangeText={(v) => setCategoryForm((p) => ({ ...p, subtitle: v }))}
            placeholder="Example: IBPS / SBI"
          />

          <FormInput
            label="Description"
            value={categoryForm.description}
            onChangeText={(v) => setCategoryForm((p) => ({ ...p, description: v }))}
            placeholder="Example: Banking exam mock tests"
            multiline
          />

          <Text style={styles.formLabel}>Choose Real Icon</Text>

          <View style={styles.iconPickerRow}>
            {CATEGORY_EMOJIS.map((item, index) => (
              <TouchableOpacity
                key={`${item.emoji}_${index}`}
                activeOpacity={0.8}
                style={[
                  styles.emojiPick,
                  { backgroundColor: item.soft },
                  selectedIconIndex === index && styles.iconPickActive,
                ]}
                onPress={() => setSelectedIconIndex(index)}
              >
                <Text style={styles.emojiPickText}>{item.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ErrorText text={categoryError} />

          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.cancelBtn}
              onPress={closeCategoryModal}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.86} style={styles.saveBtn} onPress={createCategory}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>Save Category</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </AppModal>
    </SafeAreaView>
  );
}

/* --------------------------------------------
   2. TEACHER SUBJECT SCREEN
--------------------------------------------- */
export function TeacherMockTestSubjectsScreen({ navigation, route }) {
  const { teacherMockCatalog, addMockSubject, refreshTeacherMockCatalog, currentUser } = useAppContext();

  const selectedCategory =
    route?.params?.category || route?.params?.categoryTitle || "";

  const [search, setSearch] = useState("");
  const [subjectModal, setSubjectModal] = useState(false);
  const [subjectError, setSubjectError] = useState("");
  const [selectedSubjectIcon, setSelectedSubjectIcon] = useState(0);

  const [subjectForm, setSubjectForm] = useState({
    name: "",
    desc: "",
    time: "30 min",
  });

  const category = useMemo(() => {
    return (
      teacherMockCatalog.find(
        (item) => String(item?.title || "").toLowerCase() === String(selectedCategory || "").toLowerCase()
      ) ||
      teacherMockCatalog[0] ||
      null
    );
  }, [teacherMockCatalog, selectedCategory]);

  const subjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = safeArray(category?.subjects);

    if (!q) return list;

    return list.filter(
      (item) =>
        String(item?.name || "").toLowerCase().includes(q) ||
        String(item?.desc || "").toLowerCase().includes(q)
    );
  }, [search, category]);

  const resetSubjectForm = () => {
    setSubjectForm({
      name: "",
      desc: "",
      time: "30 min",
    });
    setSelectedSubjectIcon(0);
    setSubjectError("");
  };

  const openSubjectModal = () => {
    resetSubjectForm();
    setSubjectModal(true);
  };

  const closeSubjectModal = () => {
    setSubjectModal(false);
    resetSubjectForm();
  };

  const createSubject = async () => {
    const name = subjectForm.name.trim();
    const desc = subjectForm.desc.trim();
    const time = subjectForm.time.trim();

    if (!name) {
      setSubjectError("Please enter subject name.");
      return;
    }

    const alreadyExists = safeArray(category?.subjects).some(
      (item) => String(item?.name || "").toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      setSubjectError("This subject already exists in this category.");
      return;
    }

    const iconData = SUBJECT_EMOJIS[selectedSubjectIcon] || SUBJECT_EMOJIS[0];

    const categoryTitle = category?.title || selectedCategory;

    try {
      await addMockSubject(categoryTitle, {
        id: slugify(`${categoryTitle}_${name}`) || makeId("subject"),
        name,
        desc: desc || "Teacher created subject",
        tests: 0,
        questions: 0,
        time: time || "30 min",
        emoji: iconData.emoji,
        color: iconData.color,
        soft: iconData.soft,
        list: [],
      });

      await refreshTeacherMockCatalog?.(currentUser?.teacherId || currentUser?.id || "");
      closeSubjectModal();
    } catch (error) {
      setSubjectError(error?.message || "Unable to save subject.");
    }
  };

  const goTests = (subject) => {
    navigation.navigate("TeacherMockTestList", {
      category: category.title,
      categoryTitle: category.title,
      subject,
      subjectId: subject.id,
    });
  };

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.75} style={styles.headerBtn} onPress={goBackSafe}>
            <Ionicons name="chevron-back" size={24} color={C.primary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Subjects</Text>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.headerBtn}
            onPress={() => setSearch("")}
          >
            <Ionicons name="search-outline" size={22} color={C.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color={C.muted} />

          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.subjectHero}>
            <View style={styles.heroTop}>
              <EmojiBox emoji={category.emoji} soft={category.soft} size={70} emojiSize={33} />

              <View style={styles.heroTextBox}>
                <Text style={styles.heroTitle}>{category.title}</Text>

                <Text style={[styles.heroSub, { color: category.color }]}>
                  {category.subtitle}
                </Text>

                <Text style={styles.heroDesc}>Select subject to view mock tests</Text>
              </View>

              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeNo}>{getTotalTests(category)}</Text>
                <Text style={styles.heroBadgeText}>Tests</Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.subjectStatsRow}>
              <View style={styles.subjectStatItem}>
                <EmojiBox emoji="📂" soft={C.greenSoft} size={42} emojiSize={19} />
                <View>
                  <Text style={styles.subjectStatNo}>
                    {safeArray(category.subjects).length}
                  </Text>
                  <Text style={styles.subjectStatText}>Subjects</Text>
                </View>
              </View>

              <View style={styles.verticalLine} />

              <View style={styles.subjectStatItem}>
                <EmojiBox emoji="📝" soft={C.purpleSoft} size={42} emojiSize={19} />
                <View>
                  <Text style={styles.subjectStatNo}>{getTotalTests(category)}</Text>
                  <Text style={styles.subjectStatText}>Mock Tests</Text>
                </View>
              </View>

              <View style={styles.verticalLine} />

              <View style={styles.subjectStatItem}>
                <EmojiBox emoji="❓" soft={C.orangeSoft} size={42} emojiSize={19} />
                <View>
                  <Text style={styles.subjectStatNo}>
                    {getTotalQuestionsFromCategory(category)}
                  </Text>
                  <Text style={styles.subjectStatText}>Questions</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Available Subjects</Text>
            <Text style={styles.sectionCount}>{subjects.length} Items</Text>
          </View>

          {subjects.length === 0 ? (
            <EmptyState title="No subjects found" sub="Create a subject under this category." />
          ) : (
            subjects.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.subjectCard}
                activeOpacity={0.85}
                onPress={() => goTests(item)}
              >
                <View style={styles.subjectLeft}>
                  <EmojiBox emoji={item.emoji} soft={item.soft} size={60} emojiSize={28} />

                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{item.name}</Text>
                    <Text style={styles.subjectDesc}>{item.desc}</Text>

                    <View style={styles.pillRow}>
                      <View style={styles.infoPill}>
                        <Text style={styles.pillEmoji}>📝</Text>
                        <Text style={styles.infoPillText}>
                          {getSubjectTestsCount(item)} Tests
                        </Text>
                      </View>

                      <View style={styles.infoPill}>
                        <Text style={styles.pillEmoji}>❓</Text>
                        <Text style={styles.infoPillText}>
                          {getSubjectQuestionsCount(item)} Qs
                        </Text>
                      </View>

                      <View style={styles.infoPill}>
                        <Text style={styles.pillEmoji}>⏱️</Text>
                        <Text style={styles.infoPillText}>
                          {item.time || "30 min"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.nextCircle}>
                  <Ionicons name="chevron-forward" size={22} color={C.primary} />
                </View>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            style={styles.createSubjectCard}
            activeOpacity={0.86}
            onPress={openSubjectModal}
          >
            <View style={styles.dashedCircle}>
              <Ionicons name="add" size={25} color={C.green} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.createSubjectTitle}>Create New Subject</Text>
              <Text style={styles.createSubjectSub}>
                Add subject and mock tests under {category.title}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        <TeacherBottomNavigation navigation={navigation} active="Home" />
      </View>

      <AppModal
        visible={subjectModal}
        title="Create Subject"
        subtitle={`Add subject under ${category.title}`}
        onClose={closeSubjectModal}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <FormInput
            label="Subject Name"
            value={subjectForm.name}
            onChangeText={(v) => {
              setSubjectForm((p) => ({ ...p, name: v }));
              setSubjectError("");
            }}
            placeholder="Example: Reasoning"
          />

          <FormInput
            label="Description"
            value={subjectForm.desc}
            onChangeText={(v) => setSubjectForm((p) => ({ ...p, desc: v }))}
            placeholder="Example: Verbal and Non-verbal"
            multiline
          />

          <FormInput
            label="Default Time"
            value={subjectForm.time}
            onChangeText={(v) => setSubjectForm((p) => ({ ...p, time: v }))}
            placeholder="Example: 30 min"
          />

          <Text style={styles.formLabel}>Choose Real Icon</Text>

          <View style={styles.iconPickerRow}>
            {SUBJECT_EMOJIS.map((item, index) => (
              <TouchableOpacity
                key={`${item.emoji}_${index}`}
                activeOpacity={0.8}
                style={[
                  styles.emojiPick,
                  { backgroundColor: item.soft },
                  selectedSubjectIcon === index && styles.iconPickActive,
                ]}
                onPress={() => setSelectedSubjectIcon(index)}
              >
                <Text style={styles.emojiPickText}>{item.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ErrorText text={subjectError} />

          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.cancelBtn}
              onPress={closeSubjectModal}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.86} style={styles.saveBtn} onPress={createSubject}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>Save Subject</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </AppModal>
    </SafeAreaView>
  );
}

/* --------------------------------------------
   3. TEACHER TEST LIST SCREEN
--------------------------------------------- */
export function TeacherMockTestListScreen({ navigation, route }) {
  const { teacherMockCatalog } = useAppContext();

  const categoryTitle = route?.params?.category || route?.params?.categoryTitle || "";

  const category = useMemo(() => {
    return (
      teacherMockCatalog.find(
        (item) => String(item?.title || "").toLowerCase() === String(categoryTitle || "").toLowerCase()
      ) ||
      teacherMockCatalog[0] ||
      null
    );
  }, [teacherMockCatalog, categoryTitle]);

  const routeSubject = route?.params?.subject;
  const routeSubjectId = route?.params?.subjectId || routeSubject?.id;

  const [subjectId, setSubjectId] = useState(
    routeSubjectId || safeArray(category?.subjects)[0]?.id
  );

  useEffect(() => {
    if (routeSubjectId) {
      setSubjectId(routeSubjectId);
      return;
    }

    const firstSubject = safeArray(category?.subjects)[0];

    if (!subjectId && firstSubject?.id) {
      setSubjectId(firstSubject.id);
    }
  }, [routeSubjectId, category, subjectId]);

  const subject = useMemo(() => {
    const subjects = safeArray(category?.subjects);

    return (
      subjects.find((item) => item.id === subjectId) ||
      subjects.find((item) => item.id === routeSubjectId) ||
      routeSubject ||
      subjects[0] || {
        id: "subject",
        name: "Mock Tests",
        desc: "Create mock tests",
        emoji: "📝",
        color: C.blue,
        soft: C.blueSoft,
        list: [],
      }
    );
  }, [category, subjectId, routeSubjectId, routeSubject]);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Tests");

  const tabs = ["All Tests", "Chapter Wise", "Topic Wise", "My Tests", "Attempted"];

  const tests = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = safeArray(subject?.list);

    let baseList = list;

    if (activeTab === "Attempted") {
      baseList = list.filter((item) => Number(item.attempts || 0) > 0);
    }

    if (!q) return baseList;

    return baseList.filter(
      (item) =>
        String(item?.title || "").toLowerCase().includes(q) ||
        String(item?.sub || "").toLowerCase().includes(q) ||
        String(item?.level || "").toLowerCase().includes(q)
    );
  }, [search, subject, activeTab]);

  const openAddTestScreen = () => {
    navigation.navigate("TeacherMockTestAdd", {
      category: category.title,
      categoryTitle: category.title,
      subject,
      subjectId: subject?.id,
      nextNo: String((safeArray(subject?.list).length || 0) + 1).padStart(2, "0"),
    });
  };

  const editTest = (test) => {
    navigation.navigate("TeacherMockTestAdd", {
      mode: "view",
      category: category.title,
      categoryTitle: category.title,
      subject,
      subjectId: subject?.id,
      test,
      nextNo: test.no,
    });
  };

  const goBackSafe = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  };

  const totalTests = getSubjectTestsCount(subject);
  const totalQuestions = getSubjectQuestionsCount(subject);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.container}>
        <View style={styles.testHeader}>
          <TouchableOpacity activeOpacity={0.75} style={styles.headerBtn} onPress={goBackSafe}>
            <Ionicons name="chevron-back" size={24} color={C.primary} />
          </TouchableOpacity>

          <View style={styles.testHeaderCenter}>
            <EmojiBox emoji={subject?.emoji} soft={subject?.soft} size={50} emojiSize={24} />

            <View style={{ flex: 1 }}>
              <Text style={styles.testHeaderTitle} numberOfLines={1}>
                {subject?.name || "Mock Tests"}
              </Text>

              <Text style={styles.testHeaderSub} numberOfLines={1}>
                {category.title} ({category.subtitle})
              </Text>
            </View>
          </View>

          <View style={styles.testHeaderActions}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.headerBtn}
              onPress={() => setSearch("")}
            >
              <Ionicons name="search-outline" size={22} color={C.primary} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.75} style={styles.headerBtn}>
              <Ionicons name="filter-outline" size={22} color={C.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.testHero}>
            <View style={styles.heroTop}>
              <EmojiBox emoji={subject?.emoji} soft={subject?.soft} size={70} emojiSize={33} />

              <View style={styles.heroTextBox}>
                <Text style={styles.heroTitle}>{subject?.name}</Text>
                <Text style={styles.heroDesc}>{subject?.desc}</Text>
                <Text style={styles.heroDescSmall}>
                  Create tests and add questions for {subject?.name}
                </Text>
              </View>

              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeNo}>{totalTests}</Text>
                <Text style={styles.heroBadgeText}>Tests</Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.testStatsRow}>
              <View style={styles.testStatItem}>
                <EmojiBox emoji="📝" soft={C.greenSoft} size={42} emojiSize={19} />
                <View>
                  <Text style={styles.subjectStatNo}>{totalTests}</Text>
                  <Text style={styles.subjectStatText}>Total Tests</Text>
                </View>
              </View>

              <View style={styles.testStatItem}>
                <EmojiBox emoji="❓" soft={C.purpleSoft} size={42} emojiSize={19} />
                <View>
                  <Text style={styles.subjectStatNo}>{totalQuestions}</Text>
                  <Text style={styles.subjectStatText}>Questions</Text>
                </View>
              </View>

              <View style={styles.testStatItem}>
                <EmojiBox emoji="⏱️" soft={C.orangeSoft} size={42} emojiSize={19} />
                <View>
                  <Text style={styles.subjectStatNo}>{subject?.time || "30 min"}</Text>
                  <Text style={styles.subjectStatText}>Avg. Time</Text>
                </View>
              </View>

              <View style={styles.testStatItem}>
                <EmojiBox emoji="👥" soft={C.yellowSoft} size={42} emojiSize={18} />
                <View>
                  <Text style={styles.subjectStatNo}>
                    {getSubjectAttemptsCount(subject)}
                  </Text>
                  <Text style={styles.subjectStatText}>Attempts</Text>
                </View>
              </View>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.testSearchRow}>
            <View style={styles.testSearchBox}>
              <Ionicons name="search-outline" size={18} color={C.muted} />

              <TextInput
                style={styles.searchInput}
                placeholder="Search tests..."
                placeholderTextColor={C.muted}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <TouchableOpacity style={styles.sortBtn} activeOpacity={0.82}>
              <Text style={styles.sortText}>Newest First</Text>
              <Ionicons name="chevron-down" size={18} color={C.primary} />
            </TouchableOpacity>
          </View>

          {tests.length === 0 ? (
            <EmptyState title="No tests found" sub="Create a mock test and add questions." />
          ) : (
            tests.map((item, index) => (
              <TouchableOpacity
                key={item.id || item.testId || `${item.title}_${index}`}
                style={styles.testCard}
                activeOpacity={0.87}
                onPress={() => editTest(item)}
              >
                <View
                  style={[
                    styles.testNoBox,
                    {
                      backgroundColor:
                        index % 5 === 0
                          ? C.blueSoft
                          : index % 5 === 1
                          ? C.greenSoft
                          : index % 5 === 2
                          ? C.purpleSoft
                          : index % 5 === 3
                          ? C.orangeSoft
                          : C.pinkSoft,
                    },
                  ]}
                >
                  <Text style={styles.testNoEmoji}>📝</Text>

                  <Text
                    style={[
                      styles.testNo,
                      {
                        color:
                          index % 5 === 0
                            ? C.blue
                            : index % 5 === 1
                            ? C.green
                            : index % 5 === 2
                            ? C.purple
                            : index % 5 === 3
                            ? C.orange
                            : C.pink,
                      },
                    ]}
                  >
                    {item.no || String(index + 1).padStart(2, "0")}
                  </Text>
                </View>

                <View style={styles.testMiddle}>
                  <Text style={styles.testTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <Text style={styles.testSub} numberOfLines={1}>
                    {item.sub}
                  </Text>

                  <View style={styles.pillRow}>
                    <View style={styles.infoPill}>
                      <Text style={styles.pillEmoji}>❓</Text>
                      <Text style={styles.infoPillText}>
                        {item.questions || safeArray(item.questionList).length} Questions
                      </Text>
                    </View>

                    <View style={styles.infoPill}>
                      <Text style={styles.pillEmoji}>⏱️</Text>
                      <Text style={styles.infoPillText}>
                        {item.time || item.duration || "30 min"}
                      </Text>
                    </View>

                    <View style={[styles.levelPill, { backgroundColor: getLevelSoft(item.level) }]}>
                      <Text style={[styles.levelText, { color: getLevelColor(item.level) }]}>
                        {item.level || "Easy"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.testRight}>
                  <TouchableOpacity
                    style={styles.bookmarkBtn}
                    activeOpacity={0.75}
                    onPress={() => editTest(item)}
                  >
                    <Ionicons name="create-outline" size={23} color="#40547B" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.startBtn}
                    activeOpacity={0.86}
                    onPress={() => editTest(item)}
                  >
                    <Text style={styles.startBtnText}>Edit</Text>
                  </TouchableOpacity>

                  <Text style={styles.attemptText}>{item.attempts || 0} Attempts</Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            style={styles.createTestCard}
            activeOpacity={0.86}
            onPress={openAddTestScreen}
          >
            <View style={styles.dashedCircle}>
              <Ionicons name="add" size={25} color={C.green} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.createSubjectTitle}>Create New Test</Text>
              <Text style={styles.createSubjectSub}>
                Add test details and questions for {subject?.name}
              </Text>
            </View>

            <View style={styles.createArrow}>
              <Ionicons name="chevron-forward" size={24} color={C.green} />
            </View>
          </TouchableOpacity>
        </ScrollView>

        <TeacherBottomNavigation navigation={navigation} active="Home" />
      </View>
    </SafeAreaView>
  );
}

/* --------------------------------------------
   STYLES
--------------------------------------------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 14,
  },

  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 155 : 140,
  },

  header: {
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: C.text,
  },

  emojiBox: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  searchBox: {
    height: 48,
    backgroundColor: C.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 13,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: C.text,
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 0,
  },

  topCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },

  topTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
  },

  topSub: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
  },

  typeBadge: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: C.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  typeNo: {
    fontSize: 18,
    fontWeight: "900",
    color: C.green,
  },

  typeText: {
    fontSize: 9,
    fontWeight: "900",
    color: C.primary,
  },

  mainAnalysisCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DCE8FF",
    padding: 14,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  mainAnalysisIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  mainAnalysisTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: C.text,
  },

  mainAnalysisSub: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  categoryCard: {
    width: (width - 46) / 3,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: "center",
    marginBottom: 12,
  },

  categoryName: {
    fontSize: 12,
    fontWeight: "900",
    color: C.text,
    textAlign: "center",
  },

  categorySub: {
    marginTop: 5,
    fontSize: 9,
    fontWeight: "800",
    color: "#536584",
    textAlign: "center",
  },

  testMini: {
    marginTop: 8,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  testMiniText: {
    fontSize: 8,
    fontWeight: "900",
  },

  createBigCard: {
    marginTop: 3,
    minHeight: 70,
    borderRadius: 18,
    backgroundColor: "#F3FFFB",
    borderWidth: 1,
    borderColor: "#BFF5E7",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },

  dashedCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: C.green,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.card,
  },

  createBigText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "900",
    color: C.green,
  },

  subjectHero: {
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
    overflow: "hidden",
  },

  heroTop: {
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  heroTextBox: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: C.text,
  },

  heroSub: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "900",
  },

  heroDesc: {
    marginTop: 7,
    fontSize: 13,
    fontWeight: "600",
    color: "#405074",
  },

  heroDescSmall: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },

  heroBadge: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: C.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  heroBadgeNo: {
    fontSize: 23,
    fontWeight: "900",
    color: C.green,
  },

  heroBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.green,
  },

  heroDivider: {
    height: 1,
    backgroundColor: C.border,
  },

  subjectStatsRow: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  subjectStatItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  subjectStatNo: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
  },

  subjectStatText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: "#4C5A7D",
  },

  verticalLine: {
    width: 1,
    height: 45,
    backgroundColor: C.border,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
    paddingHorizontal: 4,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: C.text,
  },

  sectionCount: {
    fontSize: 12,
    fontWeight: "900",
    color: C.green,
  },

  subjectCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  subjectLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  subjectInfo: {
    flex: 1,
  },

  subjectName: {
    fontSize: 16,
    fontWeight: "900",
    color: C.text,
  },

  subjectDesc: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#4E5D80",
  },

  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },

  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFCFF",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.border,
  },

  pillEmoji: {
    fontSize: 11,
  },

  infoPillText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "900",
    color: "#405174",
  },

  nextCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F2F6FC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  createSubjectCard: {
    marginTop: 6,
    backgroundColor: "#F3FFFB",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#BFF5E7",
    borderStyle: "dashed",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  createSubjectTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: C.green,
  },

  createSubjectSub: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#4E5D80",
  },

  testHeader: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  testHeaderCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },

  testHeaderTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
  },

  testHeaderSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "#52617F",
  },

  testHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  testHero: {
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
    overflow: "hidden",
  },

  testStatsRow: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  testStatItem: {
    flex: 1,
    alignItems: "center",
  },

  tabsContent: {
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 14,
  },

  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },

  tabBtnActive: {
    borderBottomColor: C.blue,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#64718D",
  },

  tabTextActive: {
    color: C.blue,
  },

  testSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  testSearchBox: {
    flex: 1,
    height: 47,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  sortBtn: {
    height: 47,
    minWidth: 128,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sortText: {
    fontSize: 12,
    fontWeight: "900",
    color: C.text,
  },

  testCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  testNoBox: {
    width: 66,
    height: 78,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  testNoEmoji: {
    fontSize: 24,
  },

  testNo: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "900",
  },

  testMiddle: {
    flex: 1,
  },

  testTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
  },

  testSub: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "700",
    color: "#4E5D80",
  },

  levelPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  levelText: {
    fontSize: 10,
    fontWeight: "900",
  },

  testRight: {
    width: 96,
    alignItems: "center",
  },

  bookmarkBtn: {
    width: 35,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  startBtn: {
    minWidth: 88,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DCE8FF",
    backgroundColor: "#F3F8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  startBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: C.blue,
  },

  attemptText: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: "700",
    color: "#52617F",
  },

  createTestCard: {
    marginTop: 6,
    backgroundColor: "#F3FFFB",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#BFF5E7",
    borderStyle: "dashed",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  createArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyBox: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 35,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  emptyEmoji: {
    fontSize: 36,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "900",
    color: C.text,
  },

  emptySub: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 15, 40, 0.42)",
  },

  modalCard: {
    backgroundColor: C.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: Platform.OS === "ios" ? 34 : 22,
    maxHeight: "86%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.text,
  },

  modalSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
  },

  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F6FC",
    alignItems: "center",
    justifyContent: "center",
  },

  formGroup: {
    marginBottom: 13,
  },

  formLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: C.primary,
    marginBottom: 7,
  },

  formInput: {
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "#F9FBFF",
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
  },

  formInputMulti: {
    minHeight: 82,
    textAlignVertical: "top",
    paddingTop: 13,
  },

  iconPickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },

  emojiPick: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },

  emojiPickText: {
    fontSize: 23,
  },

  iconPickActive: {
    borderColor: C.primary,
  },

  errorText: {
    color: C.danger,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 10,
  },

  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 5,
  },

  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F2F6FC",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: C.primary,
  },

  saveBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  saveBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#fff",
  },
});

export default TeacherMockTestCategoriesScreen;
