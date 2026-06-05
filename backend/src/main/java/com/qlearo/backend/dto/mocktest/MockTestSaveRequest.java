package com.qlearo.backend.dto.mocktest;

public class MockTestSaveRequest {

    private String category;
    private String categoryTitle;
    private String subjectId;
    private String subjectName;
    private MockTestResponse createdTest;
    private MockTestResponse test;

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCategoryTitle() {
        return categoryTitle;
    }

    public void setCategoryTitle(String categoryTitle) {
        this.categoryTitle = categoryTitle;
    }

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public MockTestResponse getCreatedTest() {
        return createdTest;
    }

    public void setCreatedTest(MockTestResponse createdTest) {
        this.createdTest = createdTest;
    }

    public MockTestResponse getTest() {
        return test;
    }

    public void setTest(MockTestResponse test) {
        this.test = test;
    }
}
