package com.qlearo.backend.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qlearo.backend.dto.mocktest.MockTestAttemptResponse;
import com.qlearo.backend.dto.mocktest.MockTestAttemptSaveRequest;
import com.qlearo.backend.dto.mocktest.MockTestCategoryResponse;
import com.qlearo.backend.dto.mocktest.MockTestCategorySaveRequest;
import com.qlearo.backend.dto.mocktest.MockTestOptionMapResponse;
import com.qlearo.backend.dto.mocktest.MockTestQuestionResponse;
import com.qlearo.backend.dto.mocktest.MockTestQuestionSaveRequest;
import com.qlearo.backend.dto.mocktest.MockTestResponse;
import com.qlearo.backend.dto.mocktest.MockTestSaveRequest;
import com.qlearo.backend.dto.mocktest.MockTestSubjectResponse;
import com.qlearo.backend.dto.mocktest.MockTestSubjectSaveRequest;
import com.qlearo.backend.dto.mocktest.StudentNotificationResponse;
import com.qlearo.backend.dto.mocktest.TeacherMockTestAttemptResponse;
import com.qlearo.backend.entity.MockTest;
import com.qlearo.backend.entity.MockTestAttempt;
import com.qlearo.backend.entity.MockTestCategory;
import com.qlearo.backend.entity.MockTestSubject;
import com.qlearo.backend.entity.Student;
import com.qlearo.backend.entity.StudentNotification;
import com.qlearo.backend.repository.MockTestAttemptRepository;
import com.qlearo.backend.repository.MockTestCategoryRepository;
import com.qlearo.backend.repository.MockTestRepository;
import com.qlearo.backend.repository.MockTestSubjectRepository;
import com.qlearo.backend.repository.StudentRepository;
import com.qlearo.backend.repository.StudentNotificationRepository;
import com.qlearo.backend.service.MockTestService;
import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MockTestServiceImpl implements MockTestService {

    private static final String STUDENT_ROLE = "STUDENT";

    private final MockTestCategoryRepository categoryRepository;
    private final MockTestSubjectRepository subjectRepository;
    private final MockTestRepository testRepository;
    private final MockTestAttemptRepository attemptRepository;
    private final StudentRepository studentRepository;
    private final StudentNotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    public MockTestServiceImpl(
        MockTestCategoryRepository categoryRepository,
        MockTestSubjectRepository subjectRepository,
        MockTestRepository testRepository,
        MockTestAttemptRepository attemptRepository,
        StudentRepository studentRepository,
        StudentNotificationRepository notificationRepository,
        ObjectMapper objectMapper
    ) {
        this.categoryRepository = categoryRepository;
        this.subjectRepository = subjectRepository;
        this.testRepository = testRepository;
        this.attemptRepository = attemptRepository;
        this.studentRepository = studentRepository;
        this.notificationRepository = notificationRepository;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void seedDefaults() {
        if (categoryRepository.count() == 0) {
            seedCategory("School", "1st - 10th", "School level mock tests", "🎓", "#05B986", "#E8FFF7");
            seedCategory("Competitive", "JEE / NEET", "Competitive exam practice", "🎯", "#FF4FA3", "#FFF0F8");
            seedCategory("College", "Higher Ed", "College entrance and semester tests", "🏛️", "#7C4DFF", "#F2ECFF");
            seedCategory("Civils", "UPSC / PSC", "Civil services mock tests", "🏢", "#FF7A1A", "#FFF1E8");
            seedCategory("Coding", "DSA / Web", "Programming and web mock tests", "💻", "#10BFD4", "#E8FCFF");
            seedCategory("Medical", "NEET / AIIMS", "Medical entrance practice", "🩺", "#FF4FA3", "#FFF0F8");
        }

        if (subjectRepository.count() == 0) {
            seedSubject("School", "maths", "Mathematics", "Numbers, Algebra, Geometry", "🧮", "#236CFF", "#EAF2FF", "30 min");
            seedSubject("School", "science", "Science", "Physics, Chemistry, Biology", "🧪", "#05B986", "#E8FFF7", "30 min");
            seedSubject("School", "english", "English", "Grammar, Reading, Writing", "📚", "#7C4DFF", "#F2ECFF", "30 min");
            seedSubject("School", "social", "Social Studies", "History, Civics, Geography", "🌎", "#FF7A1A", "#FFF1E8", "30 min");
            seedSubject("School", "computer", "Computer Basics", "Fundamentals, MS Office", "🖥️", "#10BFD4", "#E8FCFF", "30 min");

            seedSubject("Competitive", "physics", "Physics", "Mechanics, Waves, Electricity", "⚡", "#236CFF", "#EAF2FF", "45 min");
            seedSubject("Competitive", "chemistry", "Chemistry", "Organic, Inorganic, Physical", "🧪", "#05B986", "#E8FFF7", "45 min");
            seedSubject("Competitive", "biology", "Biology", "Botany, Zoology, Human Body", "🌿", "#05B986", "#E8FFF7", "45 min");

            seedSubject("College", "btech", "B.Tech Aptitude", "Engineering basics", "📐", "#236CFF", "#EAF2FF", "45 min");
            seedSubject("College", "bcom", "B.Com Aptitude", "Commerce, Accounts, Business", "🏦", "#FF7A1A", "#FFF1E8", "45 min");
            seedSubject("College", "bsc", "B.Sc Entrance", "Science foundation", "🧬", "#05B986", "#E8FFF7", "45 min");

            seedSubject("Civils", "polity", "Indian Polity", "Constitution, Parliament, Rights", "📰", "#236CFF", "#EAF2FF", "60 min");
            seedSubject("Civils", "history", "History", "Ancient, Medieval, Modern", "📜", "#FF7A1A", "#FFF1E8", "60 min");
            seedSubject("Civils", "geography", "Geography", "India, World, Physical Geography", "🌍", "#10BFD4", "#E8FCFF", "60 min");
            seedSubject("Civils", "economy", "Economy", "Indian economy and basics", "🏦", "#05B986", "#E8FFF7", "60 min");

            seedSubject("Coding", "js", "JavaScript", "ES6, DOM, Async", "🟨", "#FFB300", "#FFF8E5", "30 min");
            seedSubject("Coding", "react", "React / React Native", "Components, Hooks, Navigation", "⚛️", "#10BFD4", "#E8FCFF", "30 min");
            seedSubject("Coding", "dsa", "DSA", "Arrays, Stack, Queue, Trees", "🧠", "#7C4DFF", "#F2ECFF", "30 min");

            seedSubject("Medical", "anatomy", "Anatomy", "Human body structure", "🫀", "#FF4FA3", "#FFF0F8", "45 min");
            seedSubject("Medical", "physiology", "Physiology", "Human body functions", "🧬", "#05B986", "#E8FFF7", "45 min");
        }
    }

    @Override
    public List<MockTestCategoryResponse> getCatalog() {
        List<MockTestCategory> categories = categoryRepository.findAll();
        return categories.stream()
            .map(category -> toCategoryResponse(category, null))
            .collect(Collectors.toList());
    }

    @Override
    public List<MockTestCategoryResponse> getTeacherCatalog(String teacherId) {
        String resolvedTeacherId = requireText(teacherId, "Teacher id is required");
        List<MockTestCategory> categories = categoryRepository.findAll();
        return categories.stream()
            .map(category -> toCategoryResponse(category, resolvedTeacherId))
            .filter(category -> {
                if (resolvedTeacherId.equalsIgnoreCase(blankToDefault(category.getTeacherId(), ""))) {
                    return true;
                }

                return category.getSubjects() != null && !category.getSubjects().isEmpty();
            })
            .collect(Collectors.toList());
    }

    @Override
    public MockTestCategoryResponse createCategory(String teacherId, MockTestCategorySaveRequest request) {
        String title = requireText(request.getTitle(), "Category title is required");
        String resolvedTeacherId = requireText(teacherId, "Teacher id is required");

        if (categoryRepository.existsByTitleIgnoreCase(title)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        }

        if (categoryRepository.existsByTeacherIdAndTitleIgnoreCase(resolvedTeacherId, title)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        }

        MockTestCategory category = new MockTestCategory();
        category.setId(generateId("CAT"));
        category.setTitle(title);
        category.setTeacherId(resolvedTeacherId);
        category.setSubtitle(blankToDefault(request.getSubtitle(), "Mock Tests"));
        category.setDescription(blankToDefault(request.getDescription(), title + " mock tests"));
        category.setEmoji(blankToDefault(request.getEmoji(), "🎓"));
        category.setColor(blankToDefault(request.getColor(), "#05B986"));
        category.setSoft(blankToDefault(request.getSoft(), "#E8FFF7"));
        try {
            categoryRepository.save(category);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists", exception);
        }
        return toCategoryResponse(category, resolvedTeacherId);
    }

    @Override
    public MockTestSubjectResponse createSubject(
        String teacherId,
        String categoryTitle,
        MockTestSubjectSaveRequest request
    ) {
        String resolvedTeacherId = requireText(teacherId, "Teacher id is required");
        MockTestCategory category = getCategoryOrThrow(resolvedTeacherId, categoryTitle);
        String name = requireText(request.getName(), "Subject name is required");
        String subjectId = blankToDefault(
            request.getId(),
            slugify(category.getTitle() + "_" + name)
        );

        if (subjectRepository.existsByTeacherIdAndCategoryTitleIgnoreCaseAndNameIgnoreCase(resolvedTeacherId, category.getTitle(), name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Subject already exists");
        }

        MockTestSubject subject = new MockTestSubject();
        subject.setId(subjectId);
        subject.setCategoryTitle(category.getTitle());
        subject.setTeacherId(resolvedTeacherId);
        subject.setName(name);
        subject.setDescription(blankToDefault(request.getDesc(), "Teacher created subject"));
        subject.setEmoji(blankToDefault(request.getEmoji(), "📝"));
        subject.setColor(blankToDefault(request.getColor(), "#236CFF"));
        subject.setSoft(blankToDefault(request.getSoft(), "#EAF2FF"));
        subject.setTime(blankToDefault(request.getTime(), "30 min"));
        subjectRepository.save(subject);
        return toSubjectResponse(subject, resolvedTeacherId);
    }

    @Override
    public MockTestResponse saveTest(String teacherId, MockTestSaveRequest request) {
        String categoryTitle = requireText(request.getCategoryTitle(), "Category is required");
        String subjectId = requireText(request.getSubjectId(), "Subject is required");
        String subjectName = requireText(request.getSubjectName(), "Subject name is required");
        MockTestSubject subject = resolveOrCreateSubject(teacherId, categoryTitle, subjectId, subjectName);

        MockTest test = request.getTest() != null ? mapRequestToEntity(request.getTest()) : null;
        MockTest createdTest = request.getCreatedTest() != null ? mapRequestToEntity(request.getCreatedTest()) : null;
        MockTest source = test != null ? test : createdTest;

        if (source == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Test payload is required");
        }

        String testId = blankToDefault(source.getTestId(), source.getId());
        if (isBlank(testId)) {
            testId = generateId("TEST");
        }

        MockTest entity = testRepository.findByTestId(testId).orElseGet(MockTest::new);
        entity.setId(blankToDefault(entity.getId(), testId));
        entity.setTestId(testId);
        entity.setCategoryTitle(categoryTitle);
        entity.setSubjectId(subject.getId());
        entity.setSubjectName(subject.getName());
        entity.setNo(blankToDefault(source.getNo(), nextTestNo(subject)));
        entity.setTitle(requireText(source.getTitle(), "Test title is required"));
        entity.setSub(blankToDefault(source.getSub(), categoryTitle + " • " + subject.getName()));
        entity.setTime(blankToDefault(source.getTime(), "30 min"));
        entity.setDuration(blankToDefault(source.getDuration(), entity.getTime()));
        entity.setLevel(blankToDefault(source.getLevel(), "Easy"));
        entity.setAttempts(Math.max(0, entity.getAttempts()));
        entity.setCreatedBy(blankToDefault(source.getCreatedBy(), teacherId));
        entity.setTeacherId(blankToDefault(source.getTeacherId(), teacherId));
        entity.setTeacherName(blankToDefault(source.getTeacherName(), "Teacher"));
        entity.setPublished(source.isPublished());
            entity.setQuestionListJson(blankToDefault(source.getQuestionListJson(), "[]"));
        MockTest saved = testRepository.save(entity);

        subject.setTime(blankToDefault(subject.getTime(), entity.getTime()));
        subjectRepository.save(subject);

        try {
            createPublishedNotificationForStudents(saved);
        } catch (Exception exception) {
            System.err.println("Failed to create publish notifications: " + exception.getMessage());
        }

        return toTestResponse(saved);
    }

    @Override
    public void deleteTest(String teacherId, String testId) {
        MockTest test = testRepository.findByTestId(testId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        testRepository.delete(test);
    }

    @Override
    public MockTestResponse getTest(String testId) {
        return toTestResponse(
            testRepository.findByTestId(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"))
        );
    }

    @Override
    public List<MockTestAttemptResponse> getStudentResults(String studentId) {
        return attemptRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
            .stream()
            .map(this::toAttemptResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<TeacherMockTestAttemptResponse> getTeacherAttempts(
        String teacherId,
        String categoryTitle,
        String subjectId,
        String testId
    ) {
        Map<String, MockTest> testsById = testRepository.findAll().stream()
            .filter(test -> !isBlank(test.getTestId()))
            .filter(test -> isBlank(teacherId) || teacherId.equalsIgnoreCase(test.getTeacherId()))
            .collect(Collectors.toMap(MockTest::getTestId, test -> test, (left, right) -> left));

        Map<String, Student> studentsById = studentRepository.findAll().stream()
            .collect(Collectors.toMap(Student::getId, student -> student, (left, right) -> left));

        return attemptRepository.findAll().stream()
            .map(attempt -> {
                MockTest test = testsById.get(attempt.getTestId());
                if (test == null) {
                    return null;
                }

                if (!isBlank(categoryTitle) && !categoryTitle.equalsIgnoreCase(test.getCategoryTitle())) {
                    return null;
                }

                if (!isBlank(subjectId) && !subjectId.equalsIgnoreCase(test.getSubjectId())) {
                    return null;
                }

                if (!isBlank(testId) && !testId.equalsIgnoreCase(test.getTestId())) {
                    return null;
                }

                Student student = studentsById.get(attempt.getStudentId());
                return toTeacherAttemptResponse(attempt, test, student);
            })
            .filter(item -> item != null)
            .sorted((left, right) -> {
                Instant leftAt = left.getCreatedAt();
                Instant rightAt = right.getCreatedAt();
                if (leftAt == null && rightAt == null) {
                    return 0;
                }
                if (leftAt == null) {
                    return 1;
                }
                if (rightAt == null) {
                    return -1;
                }
                return rightAt.compareTo(leftAt);
            })
            .collect(Collectors.toList());
    }

    @Override
    public MockTestAttemptResponse saveStudentAttempt(String studentId, MockTestAttemptSaveRequest request) {
        String testId = requireText(request.getTestId(), "Test id is required");
        MockTest test = testRepository.findByTestId(testId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));

        List<MockTestQuestionSaveRequest> questions = safeQuestions(request.getQuestions());
        Map<String, String> selectedAnswers = request.getSelectedAnswers() == null
            ? Map.of()
            : request.getSelectedAnswers();

        int correct = 0;
        int wrong = 0;

        for (MockTestQuestionSaveRequest question : questions) {
            String selected = selectedAnswers.get(question.getId());
            if (isBlank(selected)) {
                continue;
            }

            String answer = resolveAnswer(question);
            if (selected.equals(answer) || selected.equals(question.getCorrectAnswer())) {
                correct += 1;
            } else {
                wrong += 1;
            }
        }

        int attempted = selectedAnswers.size();
        int unattempted = questions.size() - attempted;
        int totalMarks = questions.size() * 4;
        int score = correct * 4 - wrong;
        double accuracy = attempted == 0 ? 0 : Math.round(((double) correct / attempted) * 1000.0) / 10.0;

        MockTestAttempt attempt = new MockTestAttempt();
        attempt.setId(generateId("ATT"));
        attempt.setTestId(test.getTestId());
        attempt.setStudentId(studentId);
        attempt.setStudentName(blankToDefault(request.getStudentName(), "Student"));
        attempt.setSelectedAnswersJson(writeValue(selectedAnswers));
        attempt.setTotalQuestions(questions.size());
        attempt.setAttempted(attempted);
        attempt.setCorrect(correct);
        attempt.setWrong(wrong);
        attempt.setUnattempted(unattempted);
        attempt.setScore(score);
        attempt.setTotalMarks(totalMarks);
        attempt.setAccuracy(accuracy);
        attempt.setTimeTaken(request.getTimeTaken());
        MockTestAttempt savedAttempt = attemptRepository.save(attempt);

        test.setAttempts(test.getAttempts() + 1);
        testRepository.save(test);

        try {
            createAttemptNotification(savedAttempt, test);
        } catch (Exception exception) {
            System.err.println("Failed to create attempt notification: " + exception.getMessage());
        }

        return toAttemptResponse(savedAttempt);
    }

    @Override
    public List<StudentNotificationResponse> getStudentNotifications(String studentId) {
        return notificationRepository.findByRecipientRoleAndRecipientIdOrderByCreatedAtDesc(STUDENT_ROLE, studentId)
            .stream()
            .map(this::toNotificationResponse)
            .collect(Collectors.toList());
    }

    @Override
    public StudentNotificationResponse markStudentNotificationRead(String studentId, String notificationId) {
        StudentNotification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!STUDENT_ROLE.equalsIgnoreCase(notification.getRecipientRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Notification does not belong to student scope");
        }

        if (notification.getRecipientId() != null && !notification.getRecipientId().equals(studentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Notification does not belong to this student");
        }

        notification.setRead(true);
        return toNotificationResponse(notificationRepository.save(notification));
    }

    @Override
    public long getUnreadNotificationCount(String studentId) {
        return notificationRepository.countByRecipientRoleAndRecipientIdAndReadFalse(STUDENT_ROLE, studentId);
    }

    private void seedCategory(String title, String subtitle, String description, String emoji, String color, String soft) {
        MockTestCategory category = new MockTestCategory();
        category.setId(generateId("CAT"));
        category.setTitle(title);
        category.setTeacherId(null);
        category.setSubtitle(subtitle);
        category.setDescription(description);
        category.setEmoji(emoji);
        category.setColor(color);
        category.setSoft(soft);
        categoryRepository.save(category);
    }

    private void seedSubject(
        String categoryTitle,
        String id,
        String name,
        String description,
        String emoji,
        String color,
        String soft,
        String time
    ) {
        MockTestSubject subject = new MockTestSubject();
        subject.setId(id);
        subject.setCategoryTitle(categoryTitle);
        subject.setTeacherId(null);
        subject.setName(name);
        subject.setDescription(description);
        subject.setEmoji(emoji);
        subject.setColor(color);
        subject.setSoft(soft);
        subject.setTime(time);
        subjectRepository.save(subject);
    }

    private MockTestCategory getCategoryOrThrow(String teacherId, String categoryTitle) {
        return categoryRepository.findByTeacherIdAndTitleIgnoreCase(teacherId, categoryTitle)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    private MockTestSubject getSubjectOrThrow(String teacherId, String categoryTitle, String subjectId, String subjectName) {
        return subjectRepository.findByTeacherIdAndCategoryTitleIgnoreCaseOrderByCreatedAtAsc(teacherId, categoryTitle)
            .stream()
            .filter(item -> item.getId().equalsIgnoreCase(subjectId) || item.getName().equalsIgnoreCase(subjectName))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found"));
    }

    private MockTestSubject resolveOrCreateSubject(String teacherId, String categoryTitle, String subjectId, String subjectName) {
        try {
            return getSubjectOrThrow(teacherId, categoryTitle, subjectId, subjectName);
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode() != HttpStatus.NOT_FOUND) {
                throw exception;
            }

            MockTestCategory category = getCategoryOrThrow(teacherId, categoryTitle);
            MockTestSubject subject = new MockTestSubject();
            subject.setId(blankToDefault(subjectId, slugify(category.getTitle() + "_" + subjectName)));
            subject.setCategoryTitle(category.getTitle());
            subject.setTeacherId(teacherId);
            subject.setName(subjectName);
            subject.setDescription(blankToDefault(subjectName, "Teacher created subject"));
            subject.setEmoji("📝");
            subject.setColor("#236CFF");
            subject.setSoft("#EAF2FF");
            subject.setTime("30 min");
            return subjectRepository.save(subject);
        }
    }

    private MockTestCategoryResponse toCategoryResponse(MockTestCategory category, String teacherId) {
        MockTestCategoryResponse response = new MockTestCategoryResponse();
        response.setTitle(category.getTitle());
        response.setTeacherId(category.getTeacherId());
        response.setSubtitle(category.getSubtitle());
        response.setDescription(category.getDescription());
        response.setEmoji(category.getEmoji());
        response.setColor(category.getColor());
        response.setSoft(category.getSoft());

        List<MockTestSubjectResponse> subjects = subjectRepository
            .findByCategoryTitleIgnoreCaseOrderByCreatedAtAsc(category.getTitle())
            .stream()
            .map(subject -> toSubjectResponse(subject, teacherId))
            .filter(subject -> {
                if (teacherId == null) {
                    return true;
                }

                if (teacherId.equalsIgnoreCase(blankToDefault(subject.getTeacherId(), ""))) {
                    return true;
                }

                return subject.getList() != null && !subject.getList().isEmpty();
            })
            .collect(Collectors.toList());
        response.setSubjects(subjects);
        return response;
    }

    private MockTestSubjectResponse toSubjectResponse(MockTestSubject subject, String teacherId) {
        MockTestSubjectResponse response = new MockTestSubjectResponse();
        response.setId(subject.getId());
        response.setTeacherId(subject.getTeacherId());
        response.setName(subject.getName());
        response.setDesc(subject.getDescription());
        response.setEmoji(subject.getEmoji());
        response.setColor(subject.getColor());
        response.setSoft(subject.getSoft());
        response.setTime(subject.getTime());

        List<MockTest> tests = testRepository.findBySubjectIdOrderByCreatedAtDesc(subject.getId());
        List<MockTestResponse> testResponses = tests.stream()
            .filter(test -> teacherId == null || teacherId.equalsIgnoreCase(test.getTeacherId()))
            .filter(MockTest::isPublished)
            .map(this::toTestResponse)
            .collect(Collectors.toList());

        response.setTests(testResponses.size());
        response.setQuestions(testResponses.stream().mapToInt(MockTestResponse::getQuestions).sum());
        response.setList(testResponses);
        return response;
    }

    private MockTestResponse toTestResponse(MockTest test) {
        MockTestResponse response = new MockTestResponse();
        response.setId(test.getId());
        response.setTestId(test.getTestId());
        response.setNo(test.getNo());
        response.setTitle(test.getTitle());
        response.setSub(test.getSub());
        List<MockTestQuestionResponse> questions = readQuestions(test.getQuestionListJson());
        response.setQuestionList(questions);
        response.setQuestions(questions.size());
        response.setTime(test.getTime());
        response.setDuration(test.getDuration());
        response.setLevel(test.getLevel());
        response.setAttempts(test.getAttempts());
        response.setCreatedBy(test.getCreatedBy());
        response.setTeacherId(test.getTeacherId());
        response.setTeacherName(test.getTeacherName());
        response.setCategory(test.getCategoryTitle());
        response.setCategoryTitle(test.getCategoryTitle());
        response.setCategoryId(slugify(test.getCategoryTitle()));
        response.setSubjectId(test.getSubjectId());
        response.setSubjectName(test.getSubjectName());
        response.setPublished(test.isPublished());
        response.setCreatedAt(test.getCreatedAt());
        response.setUpdatedAt(test.getUpdatedAt());
        return response;
    }

    private MockTestAttemptResponse toAttemptResponse(MockTestAttempt attempt) {
        MockTestAttemptResponse response = new MockTestAttemptResponse();
        response.setId(attempt.getId());
        response.setTestId(attempt.getTestId());
        response.setStudentId(attempt.getStudentId());
        response.setStudentName(attempt.getStudentName());
        response.setSelectedAnswers(readMap(attempt.getSelectedAnswersJson()));
        response.setTotalQuestions(attempt.getTotalQuestions());
        response.setAttempted(attempt.getAttempted());
        response.setCorrect(attempt.getCorrect());
        response.setWrong(attempt.getWrong());
        response.setUnattempted(attempt.getUnattempted());
        response.setScore(attempt.getScore());
        response.setTotalMarks(attempt.getTotalMarks());
        response.setAccuracy(attempt.getAccuracy());
        response.setTimeTaken(attempt.getTimeTaken());
        response.setCreatedAt(attempt.getCreatedAt());
        return response;
    }

    private TeacherMockTestAttemptResponse toTeacherAttemptResponse(
        MockTestAttempt attempt,
        MockTest test,
        Student student
    ) {
        TeacherMockTestAttemptResponse response = new TeacherMockTestAttemptResponse();
        response.setId(attempt.getId());
        response.setTestId(test.getTestId());
        response.setTestTitle(test.getTitle());
        response.setCategoryTitle(test.getCategoryTitle());
        response.setSubjectId(test.getSubjectId());
        response.setSubjectName(test.getSubjectName());
        response.setTestNo(test.getNo());
        response.setStudentId(attempt.getStudentId());
        response.setStudentName(blankToDefault(
            attempt.getStudentName(),
            student != null ? student.getFullName() : "Student"
        ));
        response.setStudentAvatar(student != null ? student.getAvatar() : null);
        response.setStudentClassName(student != null ? student.getClassName() : null);
        response.setStudentSchool(student != null ? student.getSchool() : null);
        response.setSelectedAnswers(readMap(attempt.getSelectedAnswersJson()));
        response.setTotalQuestions(attempt.getTotalQuestions());
        response.setAttempted(attempt.getAttempted());
        response.setCorrect(attempt.getCorrect());
        response.setWrong(attempt.getWrong());
        response.setUnattempted(attempt.getUnattempted());
        response.setScore(attempt.getScore());
        response.setTotalMarks(attempt.getTotalMarks());
        response.setAccuracy(attempt.getAccuracy());
        response.setTimeTaken(attempt.getTimeTaken());
        response.setCreatedAt(attempt.getCreatedAt());
        return response;
    }

    private StudentNotificationResponse toNotificationResponse(StudentNotification notification) {
        StudentNotificationResponse response = new StudentNotificationResponse();
        response.setId(notification.getId());
        response.setRecipientRole(notification.getRecipientRole());
        response.setRecipientId(notification.getRecipientId());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setRelatedTestId(notification.getRelatedTestId());
        response.setRelatedVideoId(notification.getRelatedVideoId());
        response.setCategoryTitle(notification.getCategoryTitle());
        response.setSubjectId(notification.getSubjectId());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }

    private void createPublishedNotificationForStudents(MockTest test) {
        List<Student> students = studentRepository.findAll();

        if (students.isEmpty()) {
            return;
        }

        List<StudentNotification> notifications = students.stream()
            .map(student -> {
                StudentNotification notification = new StudentNotification();
                notification.setId("NOTIF_PUBLISH_" + test.getTestId() + "_" + student.getId());
                notification.setRecipientRole(STUDENT_ROLE);
                notification.setRecipientId(student.getId());
                notification.setTitle("Mock Test Published");
                notification.setMessage(test.getTitle() + " is now available in " + test.getCategoryTitle() + ".");
                notification.setType("mock_test");
                notification.setRelatedTestId(test.getTestId());
                notification.setRelatedVideoId(null);
                notification.setCategoryTitle(test.getCategoryTitle());
                notification.setSubjectId(test.getSubjectId());
                notification.setRead(false);
                return notification;
            })
            .collect(Collectors.toList());

        notificationRepository.saveAll(notifications);
    }

    private void createAttemptNotification(MockTestAttempt attempt, MockTest test) {
        StudentNotification notification = new StudentNotification();
        notification.setId("NOTIF_RESULT_" + test.getTestId() + "_" + attempt.getStudentId());
        notification.setRecipientRole(STUDENT_ROLE);
        notification.setRecipientId(attempt.getStudentId());
        notification.setTitle("Mock Test Submitted");
        notification.setMessage(
            "You scored " + attempt.getCorrect() + "/" + attempt.getTotalQuestions() + " in " + test.getTitle() + "."
        );
        notification.setType("mock_result");
        notification.setRelatedTestId(test.getTestId());
        notification.setRelatedVideoId(null);
        notification.setCategoryTitle(test.getCategoryTitle());
        notification.setSubjectId(test.getSubjectId());
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    private MockTest mapRequestToEntity(MockTestResponse request) {
        MockTest test = new MockTest();
        test.setId(blankToDefault(request.getId(), request.getTestId()));
        test.setTestId(blankToDefault(request.getTestId(), request.getId()));
        test.setNo(request.getNo());
        test.setTitle(request.getTitle());
        test.setSub(request.getSub());
        test.setTime(request.getTime());
        test.setDuration(request.getDuration());
        test.setLevel(request.getLevel());
        test.setAttempts(request.getAttempts());
        test.setCreatedBy(request.getCreatedBy());
        test.setTeacherId(request.getTeacherId());
        test.setTeacherName(request.getTeacherName());
        test.setPublished(request.isPublished());
        test.setQuestionListJson(writeQuestionsJson(request.getQuestionList()));
        return test;
    }

    private List<MockTestQuestionResponse> readQuestions(String json) {
        if (isBlank(json)) {
            return List.of();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<List<MockTestQuestionResponse>>() {});
        } catch (Exception exception) {
            return List.of();
        }
    }

    private Map<String, String> readMap(String json) {
        if (isBlank(json)) {
            return Map.of();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<LinkedHashMap<String, String>>() {});
        } catch (Exception exception) {
            return Map.of();
        }
    }

    private String writeQuestionsJson(List<? extends Object> questions) {
        return writeValue(questions == null ? List.of() : questions);
    }

    private String writeValue(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            return "[]";
        }
    }

    private List<MockTestQuestionSaveRequest> safeQuestions(List<MockTestQuestionSaveRequest> questions) {
        return questions == null ? List.of() : questions;
    }

    private String resolveAnswer(MockTestQuestionSaveRequest question) {
        List<String> options = question.getOptions() == null ? List.of() : question.getOptions();
        String correct = blankToDefault(question.getCorrectAnswer(), "A");

        if ("A".equalsIgnoreCase(correct)) {
            return options.size() > 0 ? options.get(0) : blankToDefault(question.getAnswer(), "");
        }
        if ("B".equalsIgnoreCase(correct)) {
            return options.size() > 1 ? options.get(1) : blankToDefault(question.getAnswer(), "");
        }
        if ("C".equalsIgnoreCase(correct)) {
            return options.size() > 2 ? options.get(2) : blankToDefault(question.getAnswer(), "");
        }
        if ("D".equalsIgnoreCase(correct)) {
            return options.size() > 3 ? options.get(3) : blankToDefault(question.getAnswer(), "");
        }

        return blankToDefault(question.getAnswer(), correct);
    }

    private String nextTestNo(MockTestSubject subject) {
        List<MockTest> tests = testRepository.findBySubjectIdOrderByCreatedAtDesc(subject.getId());
        return String.format(Locale.ROOT, "%02d", tests.size() + 1);
    }

    private String requireText(String value, String message) {
        if (isBlank(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String blankToDefault(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private String generateId(String prefix) {
        return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private String slugify(String value) {
        return value == null
            ? "item"
            : value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "_").replaceAll("^_+|_+$", "");
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
