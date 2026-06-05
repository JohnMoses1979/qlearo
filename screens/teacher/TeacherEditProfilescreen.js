
// screens/teacher/TeacherEditProfileScreen.js
// FULLY UPDATED — Fixed typing + camera/gallery + Save & Publish opens TeacherProfile with saved data

import React, { memo, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAppContext } from "../../context/AppContext";

const C = {
  bg: "#F4F7FB",
  white: "#FFFFFF",
  primary: "#00897B",
  primaryDark: "#006D62",
  primaryLight: "#EAF8F6",
  text: "#07123A",
  muted: "#7A859F",
  border: "#E8EDF5",
  danger: "#EF4444",
  green: "#16A34A",
  warning: "#F59E0B",
};

const DEFAULT_IMAGE =
  "https://ui-avatars.com/api/?name=Teacher&background=00897B&color=fff&size=200";

const safeText = (value, fallback = "") => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
};

const splitCommaText = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const joinArray = (value, fallback = "") => {
  if (Array.isArray(value)) return value.join(", ");
  return safeText(value, fallback);
};

const getInitialTeacher = (currentUser, routeTeacher) => {
  const source = {
    ...(routeTeacher || {}),
    ...(currentUser || {}),
  };

  const id = source.teacherId || source.id || "TEACHER_001";
  const name = source.name || source.fullName || source.teacherName || "Teacher";

  return {
    id,
    teacherId: id,
    name,
    fullName: name,
    teacherName: name,
    role: "teacher",
    roleLabel: source.roleLabel || "Teacher",
    subject: source.subject || source.primarySubject || "Science",
    primarySubject: source.primarySubject || source.subject || "Science",
    experience: String(source.experience || "1"),
    rating: String(source.rating || "4.8"),
    reviews: String(source.reviews || "0"),
    sessions: String(source.sessions || "0"),
    fee: source.fee || "₹399/session",
    qualification: source.qualification || "",
    city: source.city || "",
    phone: source.phone || "",
    email: source.email || "",
    image: source.image || source.avatar || source.photo || DEFAULT_IMAGE,
    avatar: source.avatar || source.image || source.photo || DEFAULT_IMAGE,
    bio:
      source.bio ||
      source.about ||
      "Experienced tutor helping students learn concepts clearly with live sessions, notes, examples, and practice.",
    withdrawalMethod: source.withdrawalMethod || "upi",
    bankAccountHolderName: source.bankAccountHolderName || "",
    bankName: source.bankName || "",
    bankAccountNumber: source.bankAccountNumber || "",
    bankIfscCode: source.bankIfscCode || "",
    bankBranchName: source.bankBranchName || "",
    upiId: source.upiId || "",
    topics: joinArray(source.topics, source.subject || "Science"),
    languages: joinArray(source.languages, "English, Hindi"),
    category: joinArray(source.category, "school, science"),
    available: source.available !== false,
    verified: source.verified !== false,
  };
};

const ProfileField = memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    icon,
    multiline = false,
    keyboardType = "default",
    autoCapitalize = "sentences",
  }) => {
    return (
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>{label}</Text>

        <View style={[styles.inputBox, multiline && styles.textAreaBox]}>
          <Ionicons
            name={icon}
            size={18}
            color={C.primary}
            style={styles.inputIcon}
          />

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#A0AEC0"
            style={[styles.input, multiline && styles.textArea]}
            multiline={multiline}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            textAlignVertical={multiline ? "top" : "center"}
            blurOnSubmit={!multiline}
            returnKeyType={multiline ? "default" : "next"}
            autoCorrect={false}
          />
        </View>
      </View>
    );
  }
);

export default function TeacherEditProfileScreen({ navigation, route }) {
  const {
    currentUser,
    setLoggedInUser,
    updateTutorProfile,
    updateTeacherProfileRemote,
    uploadTeacherAvatar,
  } = useAppContext();

  const routeTeacher = route?.params?.teacher || route?.params?.tutor || null;

  const initialTeacher = useMemo(
    () => getInitialTeacher(currentUser, routeTeacher),
    [currentUser, routeTeacher]
  );

  const [name, setName] = useState(initialTeacher.name);
  const [subject, setSubject] = useState(initialTeacher.subject);
  const [experience, setExperience] = useState(initialTeacher.experience);
  const [qualification, setQualification] = useState(
    initialTeacher.qualification
  );
  const [fee, setFee] = useState(initialTeacher.fee);
  const [city, setCity] = useState(initialTeacher.city);
  const [phone, setPhone] = useState(initialTeacher.phone);
  const [email, setEmail] = useState(initialTeacher.email);
  const [image, setImage] = useState(initialTeacher.image);
  const [selectedImageAsset, setSelectedImageAsset] = useState(null);
  const [bio, setBio] = useState(initialTeacher.bio);
  const [withdrawalMethod, setWithdrawalMethod] = useState(
    initialTeacher.withdrawalMethod
  );
  const [bankAccountHolderName, setBankAccountHolderName] = useState(
    initialTeacher.bankAccountHolderName
  );
  const [bankName, setBankName] = useState(initialTeacher.bankName);
  const [bankAccountNumber, setBankAccountNumber] = useState(
    initialTeacher.bankAccountNumber
  );
  const [bankIfscCode, setBankIfscCode] = useState(initialTeacher.bankIfscCode);
  const [bankBranchName, setBankBranchName] = useState(
    initialTeacher.bankBranchName
  );
  const [upiId, setUpiId] = useState(initialTeacher.upiId);
  const [topics, setTopics] = useState(initialTeacher.topics);
  const [languages, setLanguages] = useState(initialTeacher.languages);
  const [category, setCategory] = useState(initialTeacher.category);
  const [available, setAvailable] = useState(initialTeacher.available);
  const [saving, setSaving] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const teacherId = initialTeacher.teacherId || initialTeacher.id;

  const buildPayload = () => {
    const cleanName = name.trim();
    const cleanSubject = subject.trim();
    const cleanImage = image.trim() || DEFAULT_IMAGE;

    return {
      id: teacherId,
      teacherId,
      name: cleanName,
      teacherName: cleanName,
      fullName: cleanName,
      role: "teacher",
      roleLabel: "Teacher",
      subject: cleanSubject,
      primarySubject: cleanSubject,
      experience: experience.trim(),
      rating: Number(initialTeacher.rating || 4.8),
      reviews: Number(initialTeacher.reviews || 0),
      sessions: Number(initialTeacher.sessions || 0),
      fee: fee.trim(),
      qualification: qualification.trim(),
      city: city.trim(),
      phone: phone.trim(),
      email: email.trim(),
      image: cleanImage,
      avatar: cleanImage,
      photo: cleanImage,
      bio: bio.trim(),
      withdrawalMethod: withdrawalMethod.trim() || "upi",
      bankAccountHolderName: bankAccountHolderName.trim(),
      bankName: bankName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      bankIfscCode: bankIfscCode.trim(),
      bankBranchName: bankBranchName.trim(),
      upiId: upiId.trim(),
      topics: splitCommaText(topics),
      languages: splitCommaText(languages),
      category: splitCommaText(category),
      available,
      verified: true,
      status: "active",
      updatedAt: new Date().toISOString(),
    };
  };

  const validateForm = () => {
    if (!name.trim()) {
      global.showAlert("Name Required", "Please enter teacher name.");
      return false;
    }

    if (!subject.trim()) {
      global.showAlert("Subject Required", "Please enter teaching subject.");
      return false;
    }

    if (!experience.trim()) {
      global.showAlert("Experience Required", "Please enter experience.");
      return false;
    }

    if (!bio.trim()) {
      global.showAlert("Bio Required", "Please enter tutor bio.");
      return false;
    }

    if (splitCommaText(topics).length === 0) {
      global.showAlert("Topics Required", "Please enter at least one topic.");
      return false;
    }

    if (splitCommaText(category).length === 0) {
      global.showAlert(
        "Category Required",
        "Please enter category like school, science."
      );
      return false;
    }

    return true;
  };

  const savePayloadToContext = (payload) => {
    const preservedStats = {
      totalEarnings: currentUser?.totalEarnings ?? currentUser?.earnings ?? 0,
      earnings: currentUser?.earnings ?? currentUser?.totalEarnings ?? 0,
      doubtsSolved: currentUser?.doubtsSolved ?? currentUser?.solved ?? 0,
      solved: currentUser?.solved ?? currentUser?.doubtsSolved ?? 0,
      sessionCount: currentUser?.sessionCount ?? currentUser?.sessions ?? 0,
      sessions: currentUser?.sessions ?? currentUser?.sessionCount ?? 0,
      reviewCount: currentUser?.reviewCount ?? currentUser?.reviews ?? 0,
      reviews: currentUser?.reviews ?? currentUser?.reviewCount ?? 0,
      averageRating: currentUser?.averageRating ?? currentUser?.rating ?? 0,
      rating: currentUser?.rating ?? currentUser?.averageRating ?? 0,
      withdrawalHistory: currentUser?.withdrawalHistory ?? [],
    };

    const finalPayload = {
      ...payload,
      ...preservedStats,
      id: payload.teacherId || payload.id || teacherId,
      teacherId: payload.teacherId || payload.id || teacherId,
      role: "teacher",
      roleLabel: "Teacher",
      updatedAt: new Date().toISOString(),
    };

    if (typeof setLoggedInUser === "function") {
      setLoggedInUser(finalPayload);
    }

    if (typeof updateTutorProfile === "function") {
      updateTutorProfile(finalPayload.teacherId, finalPayload);
    }

    return finalPayload;
  };

  const navigateBackToProfile = (savedPayload) => {
    const params = {
      updatedTeacher: savedPayload,
      teacher: savedPayload,
      tutor: savedPayload,
      savedAt: Date.now(),
    };

    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    if (typeof navigation?.replace === "function") {
      navigation.replace("TeacherProfile", params);
      return;
    }

    if (typeof navigation?.navigate === "function") {
      navigation.navigate("TeacherProfile", params);
    }
  };

  const syncRemoteProfileInBackground = async (payload, localSavedPayload) => {
    if (
      currentUser?.role !== "teacher" ||
      typeof updateTeacherProfileRemote !== "function"
    ) {
      return localSavedPayload;
    }

    try {
      const remoteProfile = await updateTeacherProfileRemote({
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        qualification: payload.qualification,
        subjectExpertise: payload.subject,
        experience: String(payload.experience),
        bio: payload.bio,
        withdrawalMethod: payload.withdrawalMethod,
        bankAccountHolderName: payload.bankAccountHolderName,
        bankName: payload.bankName,
        bankAccountNumber: payload.bankAccountNumber,
        bankIfscCode: payload.bankIfscCode,
        bankBranchName: payload.bankBranchName,
        upiId: payload.upiId,
      });

      let mergedPayload = {
        ...localSavedPayload,
        ...remoteProfile,
      };

      const shouldUploadAvatar =
        typeof uploadTeacherAvatar === "function" &&
        Boolean(
          selectedImageAsset?.uri ||
            (image && !/^https?:\/\//i.test(String(image)))
        );

      if (shouldUploadAvatar) {
        const avatarAsset =
          selectedImageAsset ||
          {
            uri: image,
            name: `teacher-avatar-${Date.now()}.jpg`,
            type: "image/jpeg",
          };

        void (async () => {
          try {
            const uploadedAvatar = await uploadTeacherAvatar(avatarAsset);
            const avatarPayload = {
              ...mergedPayload,
              ...uploadedAvatar,
              avatar: uploadedAvatar?.avatar || uploadedAvatar?.image || image,
              image: uploadedAvatar?.avatar || uploadedAvatar?.image || image,
              photo: uploadedAvatar?.avatar || uploadedAvatar?.image || image,
            };
            setImage(avatarPayload?.avatar || avatarPayload?.image || image);
            savePayloadToContext(avatarPayload);
          } catch (avatarError) {
            console.warn("Teacher avatar upload failed", avatarError);
          }
        })();
      }

      savePayloadToContext(mergedPayload);
      return mergedPayload;
    } catch (remoteError) {
      console.warn("Teacher profile update failed after local save", remoteError);
      return localSavedPayload;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const payload = buildPayload();
      const localSavedPayload = savePayloadToContext(payload);
      const syncedPayload = await syncRemoteProfileInBackground(payload, localSavedPayload);
      setSaving(false);
      navigateBackToProfile(syncedPayload || localSavedPayload);
    } catch (error) {
      setSaving(false);
      global.showAlert("Update Failed", "Something went wrong. Please try again.");
    }
  };

  const handlePreviewStudentTutor = () => {
    if (!validateForm()) return;

    const payload = buildPayload();
    const savedPayload = savePayloadToContext(payload);

    navigation?.navigate?.("StudentTutorsScreen", {
      tutor: savedPayload,
    });
  };

  const pickFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        global.showAlert(
          "Permission Required",
          "Please allow gallery access to select profile image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.35,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
        setSelectedImageAsset(result.assets[0]);
      }
    } catch (error) {
      global.showAlert("Image Error", "Unable to select image. Please try again.");
    }
  };

  const openCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        global.showAlert(
          "Permission Required",
          "Please allow camera access to take profile photo."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.35,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
        setSelectedImageAsset(result.assets[0]);
      }
    } catch (error) {
      global.showAlert("Camera Error", "Unable to open camera. Please try again.");
    }
  };

  const handleEditImage = () => {
    setShowPhotoOptions(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation?.goBack?.()}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Edit Teacher Profile</Text>
            <Text style={styles.headerSub}>Update student-visible details</Text>
          </View>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handlePreviewStudentTutor}
            activeOpacity={0.85}
          >
            <Ionicons name="eye-outline" size={21} color={C.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        >
          <View style={styles.profileTopCard}>
            <TouchableOpacity
              style={styles.avatarWrap}
              activeOpacity={0.85}
              onPress={handleEditImage}
            >
              <Image
                source={{ uri: image || DEFAULT_IMAGE }}
                style={styles.avatar}
              />

              <View style={styles.cameraBadge}>
                <Ionicons name="camera-outline" size={16} color={C.white} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changePhotoBtn}
              activeOpacity={0.85}
              onPress={handleEditImage}
            >
              <Ionicons name="create-outline" size={14} color={C.primary} />
              <Text style={styles.changePhotoText}>Edit Photo</Text>
            </TouchableOpacity>

            <Text style={styles.profileName}>{name || "Teacher"}</Text>
            <Text style={styles.profileSub}>{subject || "Subject"}</Text>

            <TouchableOpacity
              style={[
                styles.availabilityPill,
                available ? styles.availablePill : styles.unavailablePill,
              ]}
              onPress={() => setAvailable((prev) => !prev)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: available ? C.green : C.danger },
                ]}
              />

              <Text
                style={[
                  styles.availabilityText,
                  { color: available ? C.green : C.danger },
                ]}
              >
                {available ? "Available for Students" : "Unavailable"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="person-outline" size={20} color={C.primary} />
              </View>

              <View style={styles.sectionTextBox}>
                <Text style={styles.sectionTitle}>Basic Details</Text>
                <Text style={styles.sectionSub}>Teacher identity and contact</Text>
              </View>
            </View>

            <ProfileField
              label="Teacher Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter teacher name"
              icon="person-outline"
              autoCapitalize="words"
            />

            <ProfileField
              label="Profile Image URL"
              value={image}
              onChangeText={setImage}
              placeholder="Paste image URL or use camera"
              icon="image-outline"
              autoCapitalize="none"
            />

            <View style={styles.imageButtonsRow}>
              <TouchableOpacity
                style={styles.imageMiniBtn}
                activeOpacity={0.85}
                onPress={openCamera}
              >
                <Ionicons name="camera-outline" size={17} color={C.primary} />
                <Text style={styles.imageMiniText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imageMiniBtn}
                activeOpacity={0.85}
                onPress={pickFromGallery}
              >
                <Ionicons name="images-outline" size={17} color={C.primary} />
                <Text style={styles.imageMiniText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            <ProfileField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ProfileField
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              icon="call-outline"
              keyboardType="phone-pad"
            />

            <ProfileField
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="Enter city"
              icon="location-outline"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="school-outline" size={20} color={C.primary} />
              </View>

              <View style={styles.sectionTextBox}>
                <Text style={styles.sectionTitle}>Teacher Listing</Text>
                <Text style={styles.sectionSub}>
                  These fields show in StudentTutorsScreen
                </Text>
              </View>
            </View>

            <ProfileField
              label="Main Subject"
              value={subject}
              onChangeText={setSubject}
              placeholder="Example: Science"
              icon="book-outline"
              autoCapitalize="words"
            />

            <ProfileField
              label="Experience"
              value={experience}
              onChangeText={setExperience}
              placeholder="Example: 5 years"
              icon="briefcase-outline"
            />

            <ProfileField
              label="Qualification"
              value={qualification}
              onChangeText={setQualification}
              placeholder="Example: M.Sc, B.Ed"
              icon="ribbon-outline"
              autoCapitalize="words"
            />

            <ProfileField
              label="Fee"
              value={fee}
              onChangeText={setFee}
              placeholder="Example: ₹399/session"
              icon="cash-outline"
            />

            <ProfileField
              label="Topics / Answers"
              value={topics}
              onChangeText={setTopics}
              placeholder="Example: Physics, Chemistry, Biology"
              icon="list-outline"
              multiline
            />

            <ProfileField
              label="Categories"
              value={category}
              onChangeText={setCategory}
              placeholder="Example: school, science"
              icon="apps-outline"
            />

            <ProfileField
              label="Languages"
              value={languages}
              onChangeText={setLanguages}
              placeholder="Example: English, Hindi, Telugu"
              icon="language-outline"
            />

            <ProfileField
              label="Teacher Bio / Answer Description"
              value={bio}
              onChangeText={setBio}
              placeholder="Write about your teaching style..."
              icon="document-text-outline"
              multiline
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="cash-outline" size={20} color={C.primary} />
              </View>

              <View style={styles.sectionTextBox}>
                <Text style={styles.sectionTitle}>Withdrawal Details</Text>
                <Text style={styles.sectionSub}>
                  Saved payout details for teacher withdrawals
                </Text>
              </View>
            </View>

            <ProfileField
              label="Withdrawal Method"
              value={withdrawalMethod}
              onChangeText={setWithdrawalMethod}
              placeholder="upi or bank"
              icon="swap-horizontal-outline"
              autoCapitalize="none"
            />

            <ProfileField
              label="Account Holder Name"
              value={bankAccountHolderName}
              onChangeText={setBankAccountHolderName}
              placeholder="Account holder name"
              icon="person-outline"
              autoCapitalize="words"
            />

            <ProfileField
              label="Bank Name"
              value={bankName}
              onChangeText={setBankName}
              placeholder="Bank name"
              icon="business-outline"
              autoCapitalize="words"
            />

            <ProfileField
              label="Account Number"
              value={bankAccountNumber}
              onChangeText={setBankAccountNumber}
              placeholder="Account number"
              icon="card-outline"
              keyboardType="number-pad"
              autoCapitalize="none"
            />

            <ProfileField
              label="IFSC Code"
              value={bankIfscCode}
              onChangeText={setBankIfscCode}
              placeholder="IFSC code"
              icon="barcode-outline"
              autoCapitalize="characters"
            />

            <ProfileField
              label="Branch Name"
              value={bankBranchName}
              onChangeText={setBankBranchName}
              placeholder="Branch name"
              icon="location-outline"
              autoCapitalize="words"
            />

            <ProfileField
              label="UPI ID"
              value={upiId}
              onChangeText={setUpiId}
              placeholder="yourname@upi"
              icon="phone-portrait-outline"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.infoCard}>
            <MaterialCommunityIcons
              name="account-school-outline"
              size={26}
              color={C.primary}
            />

            <View style={styles.infoTextBox}>
              <Text style={styles.infoTitle}>Student Teacher Visibility</Text>
              <Text style={styles.infoText}>
                After saving, this teacher profile is added to AppContext tutors.
                Students can find this teacher by category, subject, name, and topics.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        <Modal
          visible={showPhotoOptions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPhotoOptions(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.photoModalBackdrop}
            onPress={() => setShowPhotoOptions(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.photoModalCard}
              onPress={() => {}}
            >
              <Text style={styles.photoModalTitle}>Update Profile Photo</Text>
              <Text style={styles.photoModalSub}>Choose image source</Text>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.photoActionBtn}
                onPress={async () => {
                  setShowPhotoOptions(false);
                  await openCamera();
                }}
              >
                <Ionicons name="camera-outline" size={18} color={C.primary} />
                <Text style={styles.photoActionText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.photoActionBtn}
                onPress={async () => {
                  setShowPhotoOptions(false);
                  await pickFromGallery();
                }}
              >
                <Ionicons name="images-outline" size={18} color={C.primary} />
                <Text style={styles.photoActionText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.photoActionBtn, styles.photoRemoveBtn]}
                onPress={() => {
                  setImage(DEFAULT_IMAGE);
                  setSelectedImageAsset(null);
                  setShowPhotoOptions(false);
                }}
              >
                <Ionicons name="trash-outline" size={18} color={C.danger} />
                <Text style={[styles.photoActionText, styles.photoRemoveText]}>
                  Remove Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.photoCancelBtn}
                onPress={() => setShowPhotoOptions(false)}
              >
                <Text style={styles.photoCancelText}>Cancel</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation?.goBack?.()}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.disabledBtn]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.9}
          >
            <Ionicons name="save-outline" size={19} color={C.white} />
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : "Save & Publish"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  android: {
    elevation: 3,
  },
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 12 : 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "center",
  },

  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
  },

  headerSub: {
    marginTop: 2,
    fontSize: 11,
    color: C.muted,
    fontWeight: "600",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 130,
  },

  profileTopCard: {
    backgroundColor: C.white,
    borderRadius: 26,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    ...shadow,
  },

  avatarWrap: {
    position: "relative",
  },

  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: C.primaryLight,
    borderWidth: 3,
    borderColor: C.white,
  },

  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.white,
  },

  changePhotoBtn: {
    marginTop: 10,
    backgroundColor: C.primaryLight,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#BEEBE6",
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  changePhotoText: {
    marginLeft: 5,
    color: C.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  profileName: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "900",
    color: C.text,
    textAlign: "center",
  },

  profileSub: {
    marginTop: 4,
    fontSize: 14,
    color: C.primary,
    fontWeight: "800",
    textAlign: "center",
  },

  availabilityPill: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },

  availablePill: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },

  unavailablePill: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FECACA",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  availabilityText: {
    fontSize: 12,
    fontWeight: "900",
  },

  sectionCard: {
    marginTop: 16,
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    ...shadow,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  sectionTextBox: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: C.text,
  },

  sectionSub: {
    marginTop: 3,
    fontSize: 12,
    color: C.muted,
    fontWeight: "600",
  },

  fieldWrap: {
    marginBottom: 14,
  },

  label: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "900",
    marginBottom: 7,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  inputBox: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  textAreaBox: {
    minHeight: 116,
    alignItems: "flex-start",
    paddingTop: 12,
  },

  inputIcon: {
    marginRight: 9,
    marginTop: 1,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: C.text,
    fontWeight: "700",
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },

  textArea: {
    minHeight: 92,
    lineHeight: 20,
  },

  imageButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  imageMiniBtn: {
    flex: 1,
    height: 44,
    borderRadius: 15,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: "#BEEBE6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  imageMiniText: {
    marginLeft: 6,
    color: C.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  infoCard: {
    marginTop: 16,
    backgroundColor: C.primaryLight,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BEEBE6",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoTextBox: {
    flex: 1,
    marginLeft: 12,
  },

  infoTitle: {
    fontSize: 14,
    color: C.primaryDark,
    fontWeight: "900",
  },

  infoText: {
    marginTop: 5,
    fontSize: 12,
    color: C.primaryDark,
    fontWeight: "600",
    lineHeight: 18,
  },

  bottomSpace: {
    height: 20,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
  },

  cancelBtn: {
    width: 105,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cancelBtnText: {
    color: C.muted,
    fontSize: 14,
    fontWeight: "900",
  },

  saveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  disabledBtn: {
    opacity: 0.7,
  },

  saveBtnText: {
    marginLeft: 8,
    color: C.white,
    fontSize: 15,
    fontWeight: "900",
  },

  photoModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
    padding: 16,
  },

  photoModalCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },

  photoModalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
  },

  photoModalSub: {
    marginTop: 4,
    fontSize: 12,
    color: C.muted,
    fontWeight: "600",
    marginBottom: 14,
  },

  photoActionBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: "#BEEBE6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  photoActionText: {
    marginLeft: 8,
    color: C.primary,
    fontWeight: "900",
    fontSize: 14,
  },

  photoRemoveBtn: {
    backgroundColor: "#FFF1F1",
    borderColor: "#FECACA",
  },

  photoRemoveText: {
    color: C.danger,
  },

  photoCancelBtn: {
    marginTop: 4,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  photoCancelText: {
    color: C.muted,
    fontSize: 14,
    fontWeight: "900",
  },
});
