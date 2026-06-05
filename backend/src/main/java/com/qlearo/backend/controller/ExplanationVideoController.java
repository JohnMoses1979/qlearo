package com.qlearo.backend.controller;

import com.qlearo.backend.dto.video.ExplanationVideoCategoryResponse;
import com.qlearo.backend.dto.video.ExplanationVideoResponse;
import com.qlearo.backend.dto.video.ExplanationVideoSaveRequest;
import com.qlearo.backend.service.ExplanationVideoService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ExplanationVideoController {

    private final ExplanationVideoService explanationVideoService;

    public ExplanationVideoController(ExplanationVideoService explanationVideoService) {
        this.explanationVideoService = explanationVideoService;
    }

    @GetMapping("/videos/categories")
    public List<ExplanationVideoCategoryResponse> getCategories() {
        return explanationVideoService.getCategories();
    }

    @GetMapping("/videos")
    public List<ExplanationVideoResponse> getVideos() {
        return explanationVideoService.getVideos();
    }

    @GetMapping("/videos/{videoId}")
    public ExplanationVideoResponse getVideo(@PathVariable String videoId) {
        return explanationVideoService.getVideo(videoId);
    }

    @PostMapping("/teachers/{teacherId}/videos")
    @ResponseStatus(HttpStatus.CREATED)
    public ExplanationVideoResponse saveVideo(
        @PathVariable String teacherId,
        @RequestBody ExplanationVideoSaveRequest request
    ) {
        return explanationVideoService.saveVideo(teacherId, request);
    }

    @PutMapping("/teachers/{teacherId}/videos/{videoId}")
    public ExplanationVideoResponse saveVideo(
        @PathVariable String teacherId,
        @PathVariable String videoId,
        @RequestBody ExplanationVideoSaveRequest request
    ) {
        request.setVideoId(videoId);
        return explanationVideoService.saveVideo(teacherId, request);
    }

    @DeleteMapping("/teachers/{teacherId}/videos/{videoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVideo(@PathVariable String teacherId, @PathVariable String videoId) {
        explanationVideoService.deleteVideo(teacherId, videoId);
    }
}
