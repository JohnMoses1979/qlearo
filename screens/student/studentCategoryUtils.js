const CATEGORY_VISUALS = {
  school: {
    emoji: "🏫",
    subtitle: "1st - 10th",
    description: "All subjects for school students",
    iconColor: "#1677FF",
    iconBg: "#EAF2FF",
  },
  competitive: {
    emoji: "🎯",
    subtitle: "JEE / NEET / UPSC",
    description: "Prepare for competitive exams",
    iconColor: "#F28C28",
    iconBg: "#FFF1E8",
  },
  college: {
    emoji: "🎓",
    subtitle: "Undergraduate",
    description: "All subjects for college students",
    iconColor: "#8E44AD",
    iconBg: "#F2ECFF",
  },
  coding: {
    emoji: "💻",
    subtitle: "Programming Help",
    description: "Get help with coding and projects",
    iconColor: "#00A7B5",
    iconBg: "#E8FCFF",
  },
  languages: {
    emoji: "🌐",
    subtitle: "English / Hindi / More",
    description: "Learn and improve languages",
    iconColor: "#18A05E",
    iconBg: "#EAF7F4",
  },
  commerce: {
    emoji: "📊",
    subtitle: "Accounts / Business / Economics",
    description: "Commerce and management subjects",
    iconColor: "#E65100",
    iconBg: "#FFF4E8",
  },
  science: {
    emoji: "🔬",
    subtitle: "Physics / Chemistry / Biology",
    description: "Explore the world of science",
    iconColor: "#3949AB",
    iconBg: "#EEF2FF",
  },
  arts: {
    emoji: "🎨",
    subtitle: "History / Geography / Political Science",
    description: "Humanities and social science subjects",
    iconColor: "#D81B60",
    iconBg: "#FFF0F8",
  },
};

const FALLBACK_VISUALS = [
  { emoji: "📘", iconColor: "#006D6A", iconBg: "#E6F5F4" },
  { emoji: "📝", iconColor: "#7C3AED", iconBg: "#EDE9FE" },
  { emoji: "🧠", iconColor: "#1D4ED8", iconBg: "#DBEAFE" },
  { emoji: "🚀", iconColor: "#0F766E", iconBg: "#CCFBF1" },
  { emoji: "🌟", iconColor: "#B45309", iconBg: "#FEF3C7" },
  { emoji: "📚", iconColor: "#C2410C", iconBg: "#FFEDD5" },
];

const DEFAULT_CATEGORY_DESCRIPTION =
  "Choose a teacher-backed category to find subjects and ask doubts.";

const safeArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") || "";

const slugify = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const titleCase = (value = "") =>
  String(value || "")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getVisualForCategory = (key, index = 0) => {
  if (key && CATEGORY_VISUALS[key]) {
    return CATEGORY_VISUALS[key];
  }

  return FALLBACK_VISUALS[index % FALLBACK_VISUALS.length];
};

const getTutorDisplayName = (tutor = {}) =>
  tutor.name || tutor.teacherName || tutor.fullName || "Teacher";

const getTutorPrimarySubject = (tutor = {}, fallback = "") =>
  tutor.subject || tutor.primarySubject || fallback || "General";

const getTutorTopics = (tutor = {}) => {
  const topics = safeArray(tutor.topics);
  if (topics.length > 0) {
    return topics;
  }

  const subject = getTutorPrimarySubject(tutor);
  return subject ? [subject] : [];
};

const normalizeCategoryEntries = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeCategoryEntries(item));
  }

  if (typeof value === "string") {
    const text = value.trim();
    return text ? [text] : [];
  }

  if (value && typeof value === "object") {
    const text = pickFirst(
      value.title,
      value.name,
      value.category,
      value.label,
      value.key,
      value.id
    );
    return text ? [String(text).trim()] : [];
  }

  return [];
};

const getCategoryNamesForTutor = (tutor = {}) => {
  const categories = normalizeCategoryEntries(tutor.category);
  if (categories.length > 0) {
    return categories;
  }

  return [getTutorPrimarySubject(tutor)];
};

export const buildStudentCategoriesFromTutors = (tutors = []) => {
  const source = safeArray(tutors);
  const grouped = new Map();

  source.forEach((tutor, tutorIndex) => {
    const tutorId = String(tutor?.id || tutor?.teacherId || `tutor_${tutorIndex}`);
    const tutorName = getTutorDisplayName(tutor);
    const topics = getTutorTopics(tutor);
    const categoryNames = getCategoryNamesForTutor(tutor);

    categoryNames.forEach((categoryName, categoryIndex) => {
      const categoryKey = slugify(categoryName || "general") || `category_${grouped.size}`;
      const existing = grouped.get(categoryKey);
      const visual = getVisualForCategory(categoryKey, grouped.size + categoryIndex);
      const title = titleCase(categoryName || "General");

      const entry = existing || {
        id: categoryKey,
        key: categoryKey,
        title,
        subtitle: visual.subtitle || "Teacher backed category",
        description: visual.description || DEFAULT_CATEGORY_DESCRIPTION,
        emoji: visual.emoji || "📚",
        iconColor: visual.iconColor || "#006D6A",
        iconBg: visual.iconBg || "#E6F5F4",
        subjects: [],
        tutors: [],
      };

      if (!existing) {
        grouped.set(categoryKey, entry);
      }

      const hasTutor = entry.tutors.some(
        (item) => String(item?.id || item?.teacherId || "") === tutorId
      );
      if (!hasTutor) {
        entry.tutors.push(tutor);
      }

      topics.forEach((topic, topicIndex) => {
        const subjectTitle = String(topic || "").trim();
        if (!subjectTitle) {
          return;
        }

        const subjectKey = `${categoryKey}::${tutorId}::${subjectTitle.toLowerCase()}`;
        const alreadyAdded = entry.subjects.some(
          (item) => item.key === subjectKey
        );

        if (alreadyAdded) {
          return;
        }

        entry.subjects.push({
          key: subjectKey,
          title: subjectTitle,
          cls: tutor.className || tutor.experience || tutor.subject || "Teacher",
          desc:
            tutorName === "Teacher"
              ? `Ask doubts on ${subjectTitle}`
              : `Ask doubts with ${tutorName}`,
          tutor,
          tutorId,
          tutorName,
          category: entry.title,
          categoryId: entry.id,
          order: topicIndex,
        });
      });
    });
  });

  return Array.from(grouped.values())
    .map((category, index) => {
      const tutorCount = category.tutors.length;
      const subjectCount = category.subjects.length;

      return {
        ...category,
        subtitle:
          category.subtitle && CATEGORY_VISUALS[category.id]
            ? category.subtitle
            : tutorCount > 0
            ? `${tutorCount} teacher${tutorCount > 1 ? "s" : ""} available`
            : "Teacher backed category",
        description:
          category.description && CATEGORY_VISUALS[category.id]
            ? category.description
            : subjectCount > 0
            ? `${subjectCount} subject${subjectCount > 1 ? "s" : ""} available`
            : DEFAULT_CATEGORY_DESCRIPTION,
        index,
      };
    })
    .sort((a, b) => {
      const scoreA = (b.tutors?.length || 0) - (a.tutors?.length || 0);
      if (scoreA !== 0) return scoreA;
      return a.title.localeCompare(b.title);
    });
};

export const buildStudentCategoryDetail = (category = {}) => {
  const tutorCount = safeArray(category.tutors).length;
  const subjectCount = safeArray(category.subjects).length;
  const visual = getVisualForCategory(slugify(category.title), 0);
  const title = titleCase(category.title || "Category");

  const subjects = subjectCount > 0
    ? safeArray(category.subjects)
    : safeArray(category.tutors).flatMap((tutor, index) => {
        const tutorName = getTutorDisplayName(tutor);
        return getTutorTopics(tutor).map((topic, topicIndex) => ({
          key: `${slugify(title)}::${index}::${topicIndex}`,
          title: topic,
          cls: tutor.className || tutor.experience || tutor.subject || "Teacher",
          desc: `Ask doubts with ${tutorName}`,
          tutor,
          tutorId: tutor.id || tutor.teacherId || "",
          tutorName,
          category: title,
          categoryId: slugify(title),
        }));
      });

  const detailSubjects = subjects.length > 0
    ? subjects
    : [
        {
          key: `${slugify(title)}::default`,
          title: "General Doubts",
          cls: category.subtitle || "All Levels",
          desc: "Ask doubts in this category",
          category: title,
          categoryId: slugify(title),
        },
      ];

  return {
    id: slugify(title) || "category",
    title,
    subtitle:
      category.subtitle ||
      (tutorCount > 0 ? `${tutorCount} teacher${tutorCount > 1 ? "s" : ""}` : "Teacher backed"),
    description:
      category.description ||
      `Explore ${title} subjects from available teachers.`,
    emoji: category.emoji || visual.emoji || "📚",
    gradient: category.iconColor || visual.iconColor || "#006D6A",
    stats: [
      { icon: "people-outline", label: "Teachers", value: `${tutorCount}` },
      { icon: "book-outline", label: "Subjects", value: `${detailSubjects.length}` },
      { icon: "help-circle-outline", label: "Doubts", value: "Live" },
      { icon: "checkmark-done-outline", label: "Support", value: "Available" },
    ],
    about:
      category.description ||
      `Choose a subject to ask a doubt from teachers in ${title}.`,
    subjects: detailSubjects,
  };
};
