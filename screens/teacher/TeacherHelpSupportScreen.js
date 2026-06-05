

// screens/teacher/TeacherHelpSupportScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  Alert,
  Linking,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TeacherBottomNavigation from "../../components/TeacherBottomNavigation";

const COLORS = {
  bg: "#F6FAFF",
  white: "#FFFFFF",
  primary: "#006D6A",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E7EEF8",
  soft: "#F3F6FF",
  blue: "#1677FF",
  green: "#0E9F6E",
  orange: "#E27800",
  purple: "#7B61FF",
};

const OPTIONS = [
  { key: "faqs", title: "Teacher FAQs", icon: "help-circle-outline", color: COLORS.blue, bg: "#EAF2FF" },
  { key: "contact", title: "Contact Support", icon: "call-outline", color: COLORS.green, bg: "#E8F7EF" },
  { key: "report", title: "Report Issue", icon: "warning-outline", color: COLORS.orange, bg: "#FFF4E5" },
  { key: "payment", title: "Payment Help", icon: "wallet-outline", color: COLORS.purple, bg: "#F2EFFF" },
  { key: "terms", title: "Teacher Terms", icon: "document-text-outline", color: COLORS.primary, bg: "#EAF7F4" },
  { key: "privacy", title: "Privacy Policy", icon: "shield-checkmark-outline", color: COLORS.primary, bg: "#EAF7F4" },
];

const FAQS = [
  {
    q: "How can I receive student doubts?",
    a: "After your teacher profile is approved, student doubts related to your subject or category will appear in your teacher dashboard.",
  },
  {
    q: "How can I update my teacher profile?",
    a: "Open Teacher Profile, choose Edit Profile, update your details, and save the changes.",
  },
  {
    q: "How do I conduct live classes?",
    a: "Open Live Classes from your dashboard, create or join a session, and teach students online.",
  },
  {
    q: "When will I receive payment?",
    a: "Teacher earnings are calculated based on completed doubts, sessions, mock tests, or platform rules.",
  },
];

export default function TeacherHelpSupportScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [problemText, setProblemText] = useState("");

  const openModal = (key) => {
    setActiveKey(key);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setActiveKey(null);
    setExpandedFaq(null);
    setProblemText("");
  };

  const openPhone = () => {
    Linking.openURL("tel:+919876543210").catch(() =>
      global.showAlert("Error", "Unable to open phone dialer.")
    );
  };

  const openEmail = () => {
    Linking.openURL("mailto:support@qlearo.com?subject=Teacher Support").catch(() =>
      global.showAlert("Error", "Unable to open email app.")
    );
  };

  const openWhatsApp = () => {
    Linking.openURL(
      "https://wa.me/919876543210?text=Hello Qlearo Teacher Support"
    ).catch(() => global.showAlert("Error", "Unable to open WhatsApp."));
  };

  const submitProblem = () => {
    if (!problemText.trim()) {
      global.showAlert("Required", "Please enter your issue.");
      return;
    }

    global.showAlert("Submitted", "Your issue has been sent to support team.");
    closeModal();
  };

  const getModalTitle = () => {
    return OPTIONS.find((x) => x.key === activeKey)?.title || "Help";
  };

  const renderModalContent = () => {
    if (activeKey === "faqs") {
      return (
        <View>
          {FAQS.map((item, index) => {
            const isOpen = expandedFaq === index;

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.85}
                style={styles.faqBox}
                onPress={() => setExpandedFaq(isOpen ? null : index)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                {isOpen && <Text style={styles.faqAnswer}>{item.a}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (activeKey === "contact") {
      return (
        <View>
          <TouchableOpacity style={styles.contactRow} onPress={openPhone}>
            <View style={[styles.contactIcon, { backgroundColor: "#E8F7EF" }]}>
              <Ionicons name="call" size={22} color={COLORS.green} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Call Teacher Support</Text>
              <Text style={styles.contactSub}>+91 98765 43210</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactRow} onPress={openEmail}>
            <View style={[styles.contactIcon, { backgroundColor: "#EAF2FF" }]}>
              <Ionicons name="mail" size={22} color={COLORS.blue} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSub}>support@qlearo.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactRow} onPress={openWhatsApp}>
            <View style={[styles.contactIcon, { backgroundColor: "#E8F7EF" }]}>
              <Ionicons name="logo-whatsapp" size={22} color={COLORS.green} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>WhatsApp Support</Text>
              <Text style={styles.contactSub}>Chat with support team</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        </View>
      );
    }

    if (activeKey === "report") {
      return (
        <View>
          <Text style={styles.inputLabel}>Describe your issue</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Example: Doubt not opening, live class issue, payment not showing..."
            placeholderTextColor="#9AA3B8"
            multiline
            value={problemText}
            onChangeText={setProblemText}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={submitProblem}>
            <Text style={styles.primaryBtnText}>Submit Issue</Text>
            <Ionicons name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      );
    }

    if (activeKey === "payment") {
      return (
        <View>
          <Text style={styles.para}>
            Teacher payments are calculated based on completed classes, answered
            doubts, mock tests, and platform rules.
          </Text>
          <Text style={styles.para}>
            If your earning is not visible, check whether the activity is fully
            completed.
          </Text>
          <Text style={styles.para}>
            For payout delay or incorrect amount, contact support with your
            teacher details.
          </Text>
        </View>
      );
    }

    if (activeKey === "terms") {
      return (
        <View>
          <Text style={styles.para}>
            Teachers should provide respectful, clear, and useful educational
            support to students.
          </Text>
          <Text style={styles.para}>
            Fake answers, abusive messages, or misuse of the platform may lead
            to account restrictions.
          </Text>
        </View>
      );
    }

    if (activeKey === "privacy") {
      return (
        <View>
          <Text style={styles.para}>
            We collect required teacher details like name, phone, subjects,
            documents, classes, doubts, and support messages.
          </Text>
          <Text style={styles.para}>
            Your personal details are used only for verification, support, and
            app services.
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Teacher Help</Text>
        </View>

        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.8}
          onPress={() => openModal("contact")}
        >
          <Ionicons name="call-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIconBox}>
            <Ionicons name="school-outline" size={36} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>
            Get help for profile approval, doubts, live classes, payments, and
            teacher account issues.
          </Text>
        </View>

        <View style={styles.card}>
          {OPTIONS.map((item, index) => (
            <View key={item.key}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.optionRow}
                onPress={() => openModal(item.key)}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>

                  <Text style={styles.optionText}>{item.title}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
              </TouchableOpacity>

              {index !== OPTIONS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.quickCard}>
          <Text style={styles.quickTitle}>Quick Teacher Support</Text>

          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickBtn} onPress={openPhone}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <Text style={styles.quickText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickBtn} onPress={openEmail}>
              <Ionicons name="mail" size={20} color={COLORS.primary} />
              <Text style={styles.quickText}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickBtn} onPress={openWhatsApp}>
              <Ionicons name="logo-whatsapp" size={20} color={COLORS.primary} />
              <Text style={styles.quickText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      <TeacherBottomNavigation navigation={navigation} active="Profile" />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getModalTitle()}</Text>

              <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              {renderModalContent()}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    height: 56,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "android" ? 6 : 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleBox: { flex: 1, alignItems: "center" },

  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === "ios" ? 150 : 135,
  },

  heroCard: {
    marginTop: 12,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: "center",
  },

  heroIconBox: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: "#EAF7F4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
  },

  card: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  optionRow: {
    minHeight: 62,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  optionText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 66,
  },

  quickCard: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },

  quickTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 12,
  },

  quickRow: {
    flexDirection: "row",
    gap: 10,
  },

  quickBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EAF7F4",
    alignItems: "center",
    justifyContent: "center",
  },

  quickText: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.primary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7,18,58,0.35)",
    justifyContent: "flex-end",
  },

  modalBox: {
    maxHeight: "82%",
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
  },

  modalHeader: {
    minHeight: 62,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.soft,
    alignItems: "center",
    justifyContent: "center",
  },

  modalScroll: {
    padding: 14,
    paddingBottom: 24,
  },

  faqBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },

  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  faqQuestion: {
    flex: 1,
    paddingRight: 10,
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  faqAnswer: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    color: COLORS.muted,
  },

  contactRow: {
    minHeight: 70,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  contactInfo: { flex: 1 },

  contactTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  contactSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 10,
  },

  textArea: {
    minHeight: 135,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    textAlignVertical: "top",
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },

  primaryBtn: {
    marginTop: 14,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },

  para: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "700",
    color: COLORS.muted,
  },

});
