package com.qlearo.backend.dto;

import java.time.Instant;

public class TeacherProfileResponse {

    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String qualification;
    private String subjectExpertise;
    private String experience;
    private String bio;
    private String withdrawalMethod;
    private String bankAccountHolderName;
    private String bankName;
    private String bankAccountNumber;
    private String bankIfscCode;
    private String bankBranchName;
    private String upiId;
    private String lastPayoutStatus;
    private Long lastPayoutAmount;
    private Long paidAmount;
    private Long withdrawnAmount;
    private Long lastWithdrawalAmount;
    private String lastWithdrawalMethod;
    private Instant lastWithdrawalAt;
    private String lastPayoutMethod;
    private String lastPayoutTransactionId;
    private String lastPayoutNote;
    private Instant lastPayoutAt;
    private String avatar;
    private String approvalStatus;
    private Long totalEarnings;
    private Long doubtsSolved;
    private Long sessionCount;
    private Long reviewCount;
    private Double averageRating;
    private Instant createdAt;
    private Instant updatedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getSubjectExpertise() {
        return subjectExpertise;
    }

    public void setSubjectExpertise(String subjectExpertise) {
        this.subjectExpertise = subjectExpertise;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getWithdrawalMethod() {
        return withdrawalMethod;
    }

    public void setWithdrawalMethod(String withdrawalMethod) {
        this.withdrawalMethod = withdrawalMethod;
    }

    public String getBankAccountHolderName() {
        return bankAccountHolderName;
    }

    public void setBankAccountHolderName(String bankAccountHolderName) {
        this.bankAccountHolderName = bankAccountHolderName;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getBankAccountNumber() {
        return bankAccountNumber;
    }

    public void setBankAccountNumber(String bankAccountNumber) {
        this.bankAccountNumber = bankAccountNumber;
    }

    public String getBankIfscCode() {
        return bankIfscCode;
    }

    public void setBankIfscCode(String bankIfscCode) {
        this.bankIfscCode = bankIfscCode;
    }

    public String getBankBranchName() {
        return bankBranchName;
    }

    public void setBankBranchName(String bankBranchName) {
        this.bankBranchName = bankBranchName;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getLastPayoutStatus() {
        return lastPayoutStatus;
    }

    public void setLastPayoutStatus(String lastPayoutStatus) {
        this.lastPayoutStatus = lastPayoutStatus;
    }

    public Long getLastPayoutAmount() {
        return lastPayoutAmount;
    }

    public void setLastPayoutAmount(Long lastPayoutAmount) {
        this.lastPayoutAmount = lastPayoutAmount;
    }

    public Long getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Long paidAmount) {
        this.paidAmount = paidAmount;
    }

    public Long getWithdrawnAmount() {
        return withdrawnAmount;
    }

    public void setWithdrawnAmount(Long withdrawnAmount) {
        this.withdrawnAmount = withdrawnAmount;
    }

    public Long getLastWithdrawalAmount() {
        return lastWithdrawalAmount;
    }

    public void setLastWithdrawalAmount(Long lastWithdrawalAmount) {
        this.lastWithdrawalAmount = lastWithdrawalAmount;
    }

    public String getLastWithdrawalMethod() {
        return lastWithdrawalMethod;
    }

    public void setLastWithdrawalMethod(String lastWithdrawalMethod) {
        this.lastWithdrawalMethod = lastWithdrawalMethod;
    }

    public Instant getLastWithdrawalAt() {
        return lastWithdrawalAt;
    }

    public void setLastWithdrawalAt(Instant lastWithdrawalAt) {
        this.lastWithdrawalAt = lastWithdrawalAt;
    }

    public String getLastPayoutMethod() {
        return lastPayoutMethod;
    }

    public void setLastPayoutMethod(String lastPayoutMethod) {
        this.lastPayoutMethod = lastPayoutMethod;
    }

    public String getLastPayoutTransactionId() {
        return lastPayoutTransactionId;
    }

    public void setLastPayoutTransactionId(String lastPayoutTransactionId) {
        this.lastPayoutTransactionId = lastPayoutTransactionId;
    }

    public String getLastPayoutNote() {
        return lastPayoutNote;
    }

    public void setLastPayoutNote(String lastPayoutNote) {
        this.lastPayoutNote = lastPayoutNote;
    }

    public Instant getLastPayoutAt() {
        return lastPayoutAt;
    }

    public void setLastPayoutAt(Instant lastPayoutAt) {
        this.lastPayoutAt = lastPayoutAt;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public Long getTotalEarnings() {
        return totalEarnings;
    }

    public void setTotalEarnings(Long totalEarnings) {
        this.totalEarnings = totalEarnings;
    }

    public Long getDoubtsSolved() {
        return doubtsSolved;
    }

    public void setDoubtsSolved(Long doubtsSolved) {
        this.doubtsSolved = doubtsSolved;
    }

    public Long getSessionCount() {
        return sessionCount;
    }

    public void setSessionCount(Long sessionCount) {
        this.sessionCount = sessionCount;
    }

    public Long getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Long reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
