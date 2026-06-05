package com.qlearo.backend.dto.doubt;

public class DoubtAnswerRequest {

    private String teacherName;
    private String answerType;
    private String answerText;
    private String answerAudio;
    private String answerVideo;

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getAnswerType() {
        return answerType;
    }

    public void setAnswerType(String answerType) {
        this.answerType = answerType;
    }

    public String getAnswerText() {
        return answerText;
    }

    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }

    public String getAnswerAudio() {
        return answerAudio;
    }

    public void setAnswerAudio(String answerAudio) {
        this.answerAudio = answerAudio;
    }

    public String getAnswerVideo() {
        return answerVideo;
    }

    public void setAnswerVideo(String answerVideo) {
        this.answerVideo = answerVideo;
    }
}
