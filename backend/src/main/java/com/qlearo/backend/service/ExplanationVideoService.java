package com.qlearo.backend.service;

import com.qlearo.backend.dto.video.ExplanationVideoCategoryResponse;
import com.qlearo.backend.dto.video.ExplanationVideoResponse;
import com.qlearo.backend.dto.video.ExplanationVideoSaveRequest;
import java.util.List;

public interface ExplanationVideoService {

    List<ExplanationVideoCategoryResponse> getCategories();

    List<ExplanationVideoResponse> getVideos();

    ExplanationVideoResponse getVideo(String videoId);

    ExplanationVideoResponse saveVideo(String teacherId, ExplanationVideoSaveRequest request);

    void deleteVideo(String teacherId, String videoId);
}
