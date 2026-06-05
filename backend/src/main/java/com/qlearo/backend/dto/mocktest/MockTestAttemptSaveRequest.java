package com.qlearo.backend.dto.mocktest;

import java.util.List;
import java.util.Map;

public class MockTestAttemptSaveRequest {

    private String testId;
    private String studentName;
    private Map<String, String> selectedAnswers;
    private List<MockTestQuestionSaveRequest> questions;
    private long timeTaken;

    public String getTestId() {
        return testId;
    }

    public void setTestId(String testId) {
        this.testId = testId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public Map<String, String> getSelectedAnswers() {
        return selectedAnswers;
    }

    public void setSelectedAnswers(Map<String, String> selectedAnswers) {
        this.selectedAnswers = selectedAnswers;
    }

    public List<MockTestQuestionSaveRequest> getQuestions() {
        return questions;
    }

    public void setQuestions(List<MockTestQuestionSaveRequest> questions) {
        this.questions = questions;
    }

    public long getTimeTaken() {
        return timeTaken;
    }

    public void setTimeTaken(long timeTaken) {
        this.timeTaken = timeTaken;
    }
}
