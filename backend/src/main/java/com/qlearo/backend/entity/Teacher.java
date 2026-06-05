package com.qlearo.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "teachers")
public class Teacher {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 32)
    private String id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone", nullable = false, unique = true, length = 20)
    private String phone;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "qualification")
    private String qualification;

    @Column(name = "subject_expertise")
    private String subjectExpertise;

    @Column(name = "experience_label")
    private String experience;

    @Column(name = "bio", length = 2000)
    private String bio;

    @Column(name = "withdrawal_method")
    private String withdrawalMethod;

    @Column(name = "bank_account_holder_name")
    private String bankAccountHolderName;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Column(name = "bank_ifsc_code")
    private String bankIfscCode;

    @Column(name = "bank_branch_name")
    private String bankBranchName;

    @Column(name = "upi_id")
    private String upiId;

    @Column(name = "last_payout_status")
    private String lastPayoutStatus;

    @Column(name = "last_payout_amount")
    private Long lastPayoutAmount;

    @Column(name = "paid_amount")
    private Long paidAmount;

    @Column(name = "withdrawn_amount")
    private Long withdrawnAmount;

    @Column(name = "last_withdrawal_amount")
    private Long lastWithdrawalAmount;

    @Column(name = "last_withdrawal_method")
    private String lastWithdrawalMethod;

    @Column(name = "last_withdrawal_at")
    private Instant lastWithdrawalAt;

    @Column(name = "last_payout_method")
    private String lastPayoutMethod;

    @Column(name = "last_payout_transaction_id")
    private String lastPayoutTransactionId;

    @Column(name = "last_payout_note", length = 2000)
    private String lastPayoutNote;

    @Column(name = "last_payout_at")
    private Instant lastPayoutAt;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "approval_status", nullable = false, length = 30)
    private String approvalStatus;

    @Column(name = "otp_verified", nullable = false)
    private boolean otpVerified;

    @Column(name = "reset_code", length = 12)
    private String resetCode;

    @Column(name = "reset_code_expires_at")
    private Instant resetCodeExpiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public boolean isOtpVerified() {
        return otpVerified;
    }

    public void setOtpVerified(boolean otpVerified) {
        this.otpVerified = otpVerified;
    }

    public String getResetCode() {
        return resetCode;
    }

    public void setResetCode(String resetCode) {
        this.resetCode = resetCode;
    }

    public Instant getResetCodeExpiresAt() {
        return resetCodeExpiresAt;
    }

    public void setResetCodeExpiresAt(Instant resetCodeExpiresAt) {
        this.resetCodeExpiresAt = resetCodeExpiresAt;
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

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (approvalStatus == null || approvalStatus.isBlank()) {
            approvalStatus = "PENDING_APPROVAL";
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = Instant.now();
    }
}
