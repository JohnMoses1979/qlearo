package com.qlearo.backend.service.impl;

import com.qlearo.backend.dto.video.ExplanationVideoCategoryResponse;
import com.qlearo.backend.dto.video.ExplanationVideoResponse;
import com.qlearo.backend.dto.video.ExplanationVideoSaveRequest;
import com.qlearo.backend.entity.ExplanationVideo;
import com.qlearo.backend.entity.ExplanationVideoCategory;
import com.qlearo.backend.entity.Student;
import com.qlearo.backend.entity.StudentNotification;
import com.qlearo.backend.repository.ExplanationVideoCategoryRepository;
import com.qlearo.backend.repository.ExplanationVideoRepository;
import com.qlearo.backend.repository.StudentNotificationRepository;
import com.qlearo.backend.repository.StudentRepository;
import com.qlearo.backend.service.ExplanationVideoService;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ExplanationVideoServiceImpl implements ExplanationVideoService {

    private static final String STUDENT_ROLE = "STUDENT";

    private final ExplanationVideoCategoryRepository categoryRepository;
    private final ExplanationVideoRepository videoRepository;
    private final StudentRepository studentRepository;
    private final StudentNotificationRepository notificationRepository;

    public ExplanationVideoServiceImpl(
        ExplanationVideoCategoryRepository categoryRepository,
        ExplanationVideoRepository videoRepository,
        StudentRepository studentRepository,
        StudentNotificationRepository notificationRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.videoRepository = videoRepository;
        this.studentRepository = studentRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public List<ExplanationVideoCategoryResponse> getCategories() {
        Map<String, Long> countsByCategoryId = videoRepository.findAll().stream()
            .filter(video -> video.getCategoryId() != null && !video.getCategoryId().isBlank())
            .collect(Collectors.groupingBy(ExplanationVideo::getCategoryId, Collectors.counting()));

        return categoryRepository.findAllByOrderBySortOrderAscTitleAsc().stream()
            .map(category -> toCategoryResponse(category, countsByCategoryId.getOrDefault(category.getId(), 0L)))
            .collect(Collectors.toList());
    }

    @Override
    public List<ExplanationVideoResponse> getVideos() {
        return videoRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::toVideoResponse)
            .collect(Collectors.toList());
    }

    @Override
    public ExplanationVideoResponse getVideo(String videoId) {
        return toVideoResponse(getVideoEntityOrThrow(videoId));
    }

    @Override
    public ExplanationVideoResponse saveVideo(String teacherId, ExplanationVideoSaveRequest request) {
        String resolvedTeacherId = requireText(teacherId, "Teacher id is required");
        String subject = requireText(request.getSubject(), "Subject is required");
        String topic = requireText(request.getTopic(), "Topic is required");
        String visibility = normalizeVisibility(request.getVisibility());

        ExplanationVideoCategory category = resolveCategory(request, subject, request.getClassName(), topic);
        String videoId = blankToDefault(request.getVideoId(), generateId("VIDEO"));

        ExplanationVideo entity = videoRepository.findByVideoId(videoId).orElseGet(ExplanationVideo::new);
        entity.setId(blankToDefault(entity.getId(), videoId));
        entity.setVideoId(videoId);
        entity.setTeacherId(resolvedTeacherId);
        entity.setTeacherName(blankToDefault(request.getTeacherName(), "Teacher"));
        entity.setTitle(requireText(request.getTitle(), "Video title is required"));
        entity.setCategoryId(category != null ? category.getId() : null);
        entity.setCategoryTitle(category != null ? category.getTitle() : blankToDefault(request.getCategoryTitle(), "General"));
        entity.setSubject(subject);
        entity.setTopic(topic);
        entity.setClassName(blankToDefault(request.getClassName(), ""));
        entity.setDescription(blankToDefault(request.getDescription(), ""));
        entity.setDuration(blankToDefault(request.getDuration(), "00:00"));
        entity.setViews(blankToDefault(request.getViews(), "0"));
        entity.setLikes(blankToDefault(request.getLikes(), "0"));
        entity.setComments(blankToDefault(request.getComments(), "0"));
        entity.setRating(blankToDefault(request.getRating(), "0"));
        entity.setVisibility(visibility);
        entity.setStatus(toStatus(visibility));
        entity.setThumbnail(blankToDefault(request.getThumbnail(), null));
        entity.setVideoUrl(blankToDefault(request.getVideoUrl(), request.getUrl()));
        entity.setUrl(blankToDefault(request.getUrl(), request.getVideoUrl()));
        entity.setColor(blankToDefault(request.getColor(), "#008F7A"));
        entity.setRecipientStudentId(blankToDefault(request.getRecipientStudentId(), null));
        entity.setRecipientStudentName(blankToDefault(request.getRecipientStudentName(), null));
        entity.setUploadedAgo(blankToDefault(request.getUploadedAgo(), "Just now"));
        entity.setTime(blankToDefault(request.getTime(), "Just now"));

        ExplanationVideo saved = videoRepository.save(entity);

        if (saved.getRecipientStudentId() != null && !saved.getRecipientStudentId().isBlank()) {
            createOrUpdateShareNotification(saved);
        }

        return toVideoResponse(saved);
    }

    @Override
    public void deleteVideo(String teacherId, String videoId) {
        ExplanationVideo entity = getVideoEntityOrThrow(videoId);
        if (!entity.getTeacherId().equalsIgnoreCase(teacherId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Video does not belong to this teacher");
        }
        videoRepository.delete(entity);
    }

    private ExplanationVideoCategoryResponse toCategoryResponse(
        ExplanationVideoCategory category,
        long videoCount
    ) {
        ExplanationVideoCategoryResponse response = new ExplanationVideoCategoryResponse();
        response.setId(category.getId());
        response.setTitle(category.getTitle());
        response.setSubtitle(category.getSubtitle());
        response.setDescription(category.getDescription());
        response.setEmoji(category.getEmoji());
        response.setColor(category.getColor());
        response.setSoft(category.getSoft());
        response.setSortOrder(category.getSortOrder());
        response.setVideoCount(videoCount);
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        return response;
    }

    private ExplanationVideoResponse toVideoResponse(ExplanationVideo video) {
        ExplanationVideoResponse response = new ExplanationVideoResponse();
        response.setId(video.getId());
        response.setVideoId(video.getVideoId());
        response.setTeacherId(video.getTeacherId());
        response.setTeacherName(video.getTeacherName());
        response.setTitle(video.getTitle());
        response.setCategoryId(video.getCategoryId());
        response.setCategoryTitle(video.getCategoryTitle());
        response.setSubject(video.getSubject());
        response.setTopic(video.getTopic());
        response.setClassName(video.getClassName());
        response.setDescription(video.getDescription());
        response.setDuration(video.getDuration());
        response.setViews(video.getViews());
        response.setLikes(video.getLikes());
        response.setComments(video.getComments());
        response.setRating(video.getRating());
        response.setVisibility(video.getVisibility());
        response.setStatus(video.getStatus());
        response.setThumbnail(video.getThumbnail());
        response.setVideoUrl(video.getVideoUrl());
        response.setUrl(video.getUrl());
        response.setColor(video.getColor());
        response.setRecipientStudentId(video.getRecipientStudentId());
        response.setRecipientStudentName(video.getRecipientStudentName());
        response.setUploadedAgo(video.getUploadedAgo());
        response.setTime(video.getTime());
        response.setCreatedAt(video.getCreatedAt());
        response.setUpdatedAt(video.getUpdatedAt());
        return response;
    }

    private ExplanationVideoCategory resolveCategory(
        ExplanationVideoSaveRequest request,
        String subject,
        String className,
        String topic
    ) {
        if (!isBlank(request.getCategoryId())) {
            return categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        }

        if (!isBlank(request.getCategoryTitle())) {
            return categoryRepository.findByTitleIgnoreCase(request.getCategoryTitle())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        }

        String searchableText = (
            blankToDefault(subject, "") + " " +
                blankToDefault(className, "") + " " +
                blankToDefault(topic, "")
        ).toLowerCase(Locale.ROOT);

        for (ExplanationVideoCategory category : categoryRepository.findAllByOrderBySortOrderAscTitleAsc()) {
            if (matchesCategory(category.getTitle(), searchableText)) {
                return category;
            }
        }

        return categoryRepository.findAllByOrderBySortOrderAscTitleAsc().stream().findFirst()
            .orElse(null);
    }

    private boolean matchesCategory(String title, String searchableText) {
        String normalizedTitle = title == null ? "" : title.toLowerCase(Locale.ROOT);
        if (searchableText.contains(normalizedTitle)) {
            return true;
        }

        return switch (normalizedTitle) {
            case "school" -> containsAny(searchableText, "school", "class", "grade", "cbse", "icse", "ssc", "10th", "9th", "8th", "7th", "6th", "5th");
            case "intermediate" -> containsAny(searchableText, "intermediate", "11th", "12th", "inter", "hsc");
            case "competitive" -> containsAny(searchableText, "competitive", "jee", "neet", "upsc", "bank", "ssc", "railway", "exam", "entrance");
            case "college" -> containsAny(searchableText, "college", "university", "degree", "b.tech", "btech", "bcom", "b.sc", "bsc", "engineering");
            case "coding" -> containsAny(searchableText, "coding", "programming", "python", "java", "javascript", "react", "web", "app", "software", "computer");
            case "languages" -> containsAny(searchableText, "language", "english", "hindi", "telugu", "tamil", "kannada", "french", "german", "spoken");
            case "commerce" -> containsAny(searchableText, "commerce", "accounts", "economics", "business", "finance", "ca", "cs");
            case "science" -> containsAny(searchableText, "science", "physics", "chemistry", "biology", "math", "maths", "mathematics", "botany", "zoology");
            default -> false;
        };
    }

    private boolean containsAny(String value, String... tokens) {
        for (String token : tokens) {
            if (value.contains(token)) {
                return true;
            }
        }
        return false;
    }

    private void createOrUpdateShareNotification(ExplanationVideo video) {
        List<Student> students = studentRepository.findAll();
        if (students.isEmpty()) {
            return;
        }

        Student targetStudent = students.stream()
            .filter(student -> student.getId() != null && student.getId().equalsIgnoreCase(video.getRecipientStudentId()))
            .findFirst()
            .orElse(null);

        if (targetStudent == null) {
            return;
        }

        StudentNotification notification = new StudentNotification();
        notification.setId("NOTIF_VIDEO_" + video.getVideoId() + "_" + targetStudent.getId());
        notification.setRecipientRole(STUDENT_ROLE);
        notification.setRecipientId(targetStudent.getId());
        notification.setTitle("Explanation Video Shared");
        notification.setMessage(
            blankToDefault(video.getTeacherName(), "Teacher")
                + " shared \""
                + blankToDefault(video.getTitle(), "Explanation Video")
                + "\" with you."
        );
        notification.setType("explanation_video");
        notification.setRelatedVideoId(video.getVideoId());
        notification.setRelatedTestId(null);
        notification.setCategoryTitle(video.getCategoryTitle());
        notification.setSubjectId(video.getSubject());
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    private ExplanationVideo getVideoEntityOrThrow(String videoId) {
        return videoRepository.findByVideoId(videoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));
    }

    private String normalizeVisibility(String visibility) {
        String value = blankToDefault(visibility, "Public").trim().toLowerCase(Locale.ROOT);
        if ("unlisted".equals(value)) {
            return "Unlisted";
        }
        if ("private".equals(value)) {
            return "Private";
        }
        return "Public";
    }

    private String toStatus(String visibility) {
        return switch (normalizeVisibility(visibility)) {
            case "Private" -> "Draft";
            case "Unlisted" -> "Unlisted";
            default -> "Published";
        };
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

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String generateId(String prefix) {
        return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
    }
}
