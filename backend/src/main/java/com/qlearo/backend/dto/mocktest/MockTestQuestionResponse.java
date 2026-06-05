package com.qlearo.backend.dto.mocktest;

import java.util.List;

public class MockTestQuestionResponse {

    private String id;
    private String question;
    private List<String> options;
    private MockTestOptionMapResponse optionMap;
    private String correctAnswer;
    private String answer;
    private String explanation;
    private int marks;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public MockTestOptionMapResponse getOptionMap() {
        return optionMap;
    }

    public void setOptionMap(MockTestOptionMapResponse optionMap) {
        this.optionMap = optionMap;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public int getMarks() {
        return marks;
    }

    public void setMarks(int marks) {
        this.marks = marks;
    }
}
