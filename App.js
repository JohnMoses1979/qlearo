

// App.js
// FULLY UPDATED
// ALL NAVIGATION FIXED
// ALL SCREEN NAMES MATCHED
// NO MISSING IMPORTS
// EXPO SDK 54 READY

import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AppProvider } from "./context/AppContext";
import { AppAlertProvider } from "./components/AppAlert";
import AIChatModal from "./components/AIChatModal";
import FloatingAIButton from "./components/FloatingAIButton";

// ─────────────────────────────────────────────
// COMMON
// ─────────────────────────────────────────────

import SplashScreen from "./screens/SplashScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import RoleSelectionScreen from "./screens/RoleSelectionScreen";

// ─────────────────────────────────────────────
// STUDENT AUTH
// ─────────────────────────────────────────────

import StudentLoginScreen from "./screens/student/StudentLoginScreen";
import StudentRegisterScreen from "./screens/student/StudentRegisterScreen";
import StudentOtpScreen from "./screens/student/StudentOtpScreen";

// ─────────────────────────────────────────────
// STUDENT MAIN
// ─────────────────────────────────────────────

import StudentDashboardScreen from "./screens/student/StudentDashboardScreen";
import AskDoubtScreen from "./screens/student/AskDoubtScreen";
import StudentMyDoubtsScreen from "./screens/student/StudentMyDoubtsScreen";
import StudentChatScreen from "./screens/student/StudentChatScreen";
import StudentProfileScreen from "./screens/student/StudentProfileScreen";

import StudentCategoriesScreen from "./screens/student/StudentCategoriesScreen";
import StudentCategoryDetailsScreen from "./screens/student/StudentCategoryDetailsScreen";

import DoubtDetailScreen from "./screens/student/DoubtDetailScreen";
import DoubtStatusScreen from "./screens/student/DoubtStatusScreen";
import RateReviewScreen from "./screens/student/RateReviewScreen";

import FreeDoubtsLeftScreen from "./screens/student/FreeDoubtsLeftScreen";
import SubscriptionPlansScreen from "./screens/student/SubscriptionPlansScreen";
import PaymentMethodScreen from "./screens/student/PaymentMethodScreen";
import PaymentSuccessScreen from "./screens/student/PaymentSuccessScreen";

import MySubscriptionScreen from "./screens/student/MySubscriptionScreen";
import StudentWalletScreen from "./screens/student/StudentWalletScreen";
import StudentHelpSupportScreen from "./screens/student/StudentHelpSupportScreen";
import StudentNotificationScreen from "./screens/student/StudentNotificationScreen";
import StudentSettingsScreen from "./screens/student/StudentSettingsScreen";
import EditProfileScreen from "./screens/student/EditProfileScreen";
import StudentTutorsScreen from "./screens/student/StudentTutorsScreen";

import ExplanationVideosScreen from "./screens/student/ExplanationVideosScreen";
import VideoPlayerScreen from "./screens/student/VideoPlayerScreen";
import VideoCommentsScreen from "./screens/student/VideoCommentsScreen";

import SessionDetailsScreen from "./screens/student/SessionDetailsScreen";
import PreClassChatScreen from "./screens/shared/PreClassChatScreen";
import JoinSessionScreen from "./screens/student/JoinSessionScreen";
import InSessionScreen from "./screens/student/InSessionScreen";
import SessionEndedScreen from "./screens/student/SessionEndedScreen";

import MockTestCategoriesScreen from "./screens/student/MockTestCategoriesScreen";
import MockTestListScreen from "./screens/student/MockTestListScreen";
import MockTestInstructionsScreen from "./screens/student/MockTestInstructionsScreen";
import MockTestAttemptScreen from "./screens/student/MockTestAttemptScreen";
import { MockTestSubmittedScreen } from "./screens/student/MockTestResultFlowScreen";
import { MockTestResultScreen } from "./screens/student/MockTestResultFlowScreen";
import MockTestAnswersScreen from "./screens/student/MockTestAnswersScreen";

// ─────────────────────────────────────────────
// TEACHER AUTH
// ─────────────────────────────────────────────

import TeacherLoginScreen from "./screens/teacher/TeacherLoginScreen";
import TeacherRegisterScreen from "./screens/teacher/TeacherRegisterScreen";
import TeacherOtpScreen from "./screens/teacher/TeacherOtpScreen";
import TeacherForgotPasswordScreen from "./screens/teacher/TeacherForgotPasswordScreen";
import SubjectExpertiseScreen from "./screens/teacher/SubjectExpertiseScreen";
import CompleteProfileScreen from "./screens/teacher/CompleteProfileScreen";

import TeacherMockTestCategoriesScreen from "./screens/teacher/TeacherMockTestCategoriesScreen";
import { TeacherMockTestSubjectsScreen } from "./screens/teacher/TeacherMockTestCategoriesScreen";
import { TeacherMockTestListScreen } from "./screens/teacher/TeacherMockTestCategoriesScreen";
import TeacherMockTestAddScreen from "./screens/teacher/TeacherMockTestAddScreen";
import TeacherMockTestAnalysisScreen from "./screens/teacher/TeacherMockTestAnalysisScreen";
import TeacherMockTestAttemptsScreen from "./screens/teacher/TeacherMockTestAttemptsScreen";
// ─────────────────────────────────────────────
// TEACHER MAIN
// ─────────────────────────────────────────────

import TeacherDashboardScreen from "./screens/teacher/TeacherDashboardScreen";
import AvailableDoubtsScreen from "./screens/teacher/AvailableDoubtsScreen";
import TeacherDoubtDetailScreen from "./screens/teacher/TeacherDoubtDetailScreen";
import TeacherProfileScreen from "./screens/teacher/TeacherProfileScreen";
import TeacherEditProfileScreen from "./screens/teacher/TeacherEditProfilescreen";
// ─────────────────────────────────────────────
// TEACHER ANSWER FLOW
// ─────────────────────────────────────────────

import AnswerDoubtTextScreen from "./screens/teacher/AnswerDoubtTextScreen";
import AnswerDoubtVoiceScreen from "./screens/teacher/AnswerDoubtVoiceScreen";
import AnswerDoubtVideoScreen from "./screens/teacher/AnswerDoubtVideoScreen";
import AnswerSuccessScreen from "./screens/teacher/AnswerSuccessScreen";

// ─────────────────────────────────────────────
// TEACHER EARNINGS
// ─────────────────────────────────────────────

import EarningsOverviewScreen from "./screens/teacher/EarningsOverviewScreen";
import WithdrawEarningsScreen from "./screens/teacher/WithdrawEarningsScreen";
import WithdrawSuccessScreen from "./screens/teacher/WithdrawSuccessScreen";

// ─────────────────────────────────────────────
// TEACHER VIDEO MODULE
// ─────────────────────────────────────────────

import UploadedVideosScreen from "./screens/teacher/UploadedVideosScreen";
import UploadVideoScreen from "./screens/teacher/UploadVideoScreen";
import TeacherCommentsScreen from "./screens/teacher/TeacherCommentsScreen";
import TeacherAnalyticsScreen from "./screens/teacher/TeacherAnalyticsScreen";
import UploadVideoPlayerScreen from "./screens/teacher/UploadVideoPlayerScreen";
import EditVideoScreen from "./screens/teacher/EditVideoScreen";
// ─────────────────────────────────────────────
import TeacherTuitionRequestsCombined from "./screens/teacher/TeacherTuitionRequestScreen";
import TeacherScheduleScreen from "./screens/teacher/TeacherScheduleScreen";
import SessionMeetScreen from "./screens/teacher/SessionMeetScreen";
import LiveSessionScreen from "./screens/teacher/LiveSessionScreen";

import TeacherHelpSupportScreen from "./screens/teacher/TeacherHelpSupportScreen";
import TeacherSettingsScreen from "./screens/teacher/TeacherSettingsScreen";
import TeacherNotificationScreen from "./screens/teacher/TeacherNotificationScreen";

// ------------------Admin Screens--------------

import AdminLoginScreen from "./screens/admin/AdminLoginScreen";
import AdminDashboardScreen from "./screens/admin/AdminDashboardScreen";
import AdminSubscriptionPaymentsScreen from "./screens/admin/AdminSubscriptionPaymentsScreen";
import AdminTeacherEarningsScreen from "./screens/admin/AdminTeacherEarningsScreen";
import AdminTeacherPayoutsScreen from "./screens/admin/AdminTeacherPayoutsScreen";
import { AdminTeacherPaymentScreen } from "./screens/admin/AdminTeacherPayoutsScreen";
import AdminMoreScreen from "./screens/admin/AdminMoreScreen";
import AdminNotificationsScreen from "./screens/admin/AdminNotificationsScreen";
import TeacherRequestScreen from "./screens/admin/TeacherRequestScreen";
import { TeacherDetailsScreen } from "./screens/admin/TeacherRequestScreen";
import AcceptedTeachersScreen from "./screens/admin/AcceptedTeachersScreen";
import { AcceptedTeacherManageScreen } from "./screens/admin/AcceptedTeachersScreen";
const Stack = createNativeStackNavigator();

// ─────────────────────────────────────────────

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [currentRoute, setCurrentRoute] = useState("Splash");
  const [aiChatVisible, setAiChatVisible] = useState(false);

  const isAIChatEnabled =
    currentRoute === "StudentDashboard" || currentRoute === "TeacherDashboard";

  useEffect(() => {
    if (!isAIChatEnabled) {
      setAiChatVisible(false);
    }
  }, [isAIChatEnabled]);

  return (
    <AppProvider>
      <AppAlertProvider>
        <View style={{ flex: 1 }}>
          <NavigationContainer
            ref={navigationRef}
            onReady={() => {
              const route = navigationRef.getCurrentRoute();
              setCurrentRoute(route?.name || "Splash");
            }}
            onStateChange={() => {
              const route = navigationRef.getCurrentRoute();
              setCurrentRoute(route?.name || "Splash");
            }}
          >
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >

          {/* ───────────────────────────────── */}
          {/* SPLASH + ONBOARDING */}
          {/* ───────────────────────────────── */}

          <Stack.Screen
            name="Splash"
            component={SplashScreen}
          />

          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
          />

          <Stack.Screen
            name="RoleSelectionScreen"
            component={RoleSelectionScreen}
          />

          {/* ───────────────────────────────── */}
          {/* STUDENT AUTH */}
          {/* ───────────────────────────────── */}

          <Stack.Screen
            name="StudentLogin"
            component={StudentLoginScreen}
          />

          <Stack.Screen
            name="StudentRegister"
            component={StudentRegisterScreen}
          />

          <Stack.Screen
            name="StudentOtp"
            component={StudentOtpScreen}
          />

          {/* ───────────────────────────────── */}
          {/* STUDENT MAIN */}
          {/* ───────────────────────────────── */}

          <Stack.Screen
            name="StudentDashboard"
            component={StudentDashboardScreen}
          />

          <Stack.Screen
            name="StudentHome"
            component={StudentDashboardScreen}
          />

          <Stack.Screen
            name="AskDoubt"
            component={AskDoubtScreen}
          />

          <Stack.Screen
            name="StudentMyDoubts"
            component={StudentMyDoubtsScreen}
          />

          <Stack.Screen
            name="StudentChat"
            component={StudentChatScreen}
          />

          <Stack.Screen
            name="StudentProfile"
            component={StudentProfileScreen}
          />

          <Stack.Screen
            name="StudentCategories"
            component={StudentCategoriesScreen}
          />

          <Stack.Screen
            name="StudentCategoryDetails"
            component={StudentCategoryDetailsScreen}
          />

          {/* ───────────────────────────────── */}
          {/* STUDENT DOUBTS */}
          {/* ───────────────────────────────── */}

            <Stack.Screen
              name="DoubtDetail"
              component={DoubtDetailScreen}
            />

            <Stack.Screen
              name="StudentDoubtDetail"
              component={DoubtDetailScreen}
            />

            <Stack.Screen
              name="StudentDoubtDetailScreen"
              component={DoubtDetailScreen}
            />

          <Stack.Screen
            name="DoubtStatus"
            component={DoubtStatusScreen}
          />

          <Stack.Screen
            name="RateReview"
            component={RateReviewScreen}
          />

          {/* ───────────────────────────────── */}
          {/* STUDENT SUBSCRIPTIONS */}
          {/* ───────────────────────────────── */}

          <Stack.Screen
            name="FreeDoubtsLeft"
            component={FreeDoubtsLeftScreen}
          />

          <Stack.Screen
            name="SubscriptionPlans"
            component={SubscriptionPlansScreen}
          />

          <Stack.Screen
            name="PaymentMethod"
            component={PaymentMethodScreen}
          />

          <Stack.Screen
            name="PaymentSuccess"
            component={PaymentSuccessScreen}
          />

          <Stack.Screen
            name="MySubscription"
            component={MySubscriptionScreen}
          />

          <Stack.Screen
            name="StudentWallet"
            component={StudentWalletScreen}
          />

          <Stack.Screen
            name="StudentHelpSupport"
            component={StudentHelpSupportScreen}
          />

          <Stack.Screen
            name="StudentNotification"
            component={StudentNotificationScreen}
          />

          <Stack.Screen
            name="StudentSettings"
            component={StudentSettingsScreen}
          />

          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
          />

          {/* ───────────────────────────────── */}
          {/* STUDENT VIDEOS */}
          {/* ───────────────────────────────── */}

          <Stack.Screen
            name="ExplanationVideos"
            component={ExplanationVideosScreen}
          />

          <Stack.Screen
            name="VideoPlayerScreen"
            component={VideoPlayerScreen}
          />

          <Stack.Screen
            name="VideoCommentsScreen"
            component={VideoCommentsScreen}
          />


          <Stack.Screen
            name="MockTestCategories"
            component={MockTestCategoriesScreen}
          />

          <Stack.Screen
            name="MockTestList"
            component={MockTestListScreen}
          />

          <Stack.Screen
          name="MockTestInstructions"
          component={MockTestInstructionsScreen}
        />

        <Stack.Screen
          name="MockTestAttempt"
          component={MockTestAttemptScreen}
        />

        <Stack.Screen name="MockTestSubmitted" component={MockTestSubmittedScreen} />
        <Stack.Screen name="MockTestResult" component={MockTestResultScreen} />

        <Stack.Screen
          name="MockTestAnswers"
          component={MockTestAnswersScreen}
        />

       <Stack.Screen
          name="TeacherMockTestCategories"
          component={TeacherMockTestCategoriesScreen}
        />

        <Stack.Screen
          name="TeacherMockTestSubjects"
          component={TeacherMockTestSubjectsScreen}
        />

        <Stack.Screen
          name="TeacherMockTestList"
          component={TeacherMockTestListScreen}
        />

        <Stack.Screen
          name="TeacherMockTestAdd"
          component={TeacherMockTestAddScreen}
        />

          <Stack.Screen
            name="TeacherMockTestAnalysis"
            component={TeacherMockTestAnalysisScreen}
          />

          <Stack.Screen
            name="TeacherMockTestAttempts"
            component={TeacherMockTestAttemptsScreen}
          />

                  {/* ───────────────────────────────── */}
          {/* STUDENT SESSION FLOW  ← NEW      */}
          {/* ───────────────────────────────── */}
 
          <Stack.Screen name="SessionDetailsScreen" component={SessionDetailsScreen} />
          <Stack.Screen name="PreClassChat" component={PreClassChatScreen} />
          <Stack.Screen name="JoinSessionScreen" component={JoinSessionScreen} />
          <Stack.Screen
            name="InSessionScreen"
            component={InSessionScreen}
            options={{ animation: "fade" }}
          />
          <Stack.Screen name="SessionEndedScreen" component={SessionEndedScreen} /> 
          {/* ───────────────────────────────── */}
          {/* TEACHER AUTH */}
          {/* ───────────────────────────────── */}

          <Stack.Screen
            name="TeacherLogin"
            component={TeacherLoginScreen}
          />

          <Stack.Screen
            name="TeacherForgotPassword"
            component={TeacherForgotPasswordScreen}
          />

          <Stack.Screen
            name="TeacherRegister"
            component={TeacherRegisterScreen}
          />

          <Stack.Screen
            name="TeacherOtpVerification"
            component={TeacherOtpScreen}
          />

          <Stack.Screen
            name="SubjectExperience"
            component={SubjectExpertiseScreen}
          />

          <Stack.Screen
            name="CompleteProfile"
            component={CompleteProfileScreen}
          />

          <Stack.Screen
            name="TeacherEditProfile"
            component={TeacherEditProfileScreen}
          />

          {/* ───────────────────────────────── */}
          {/* TEACHER MAIN */}
          {/* ───────────────────────────────── */}

          <Stack.Screen
            name="TeacherDashboard"
            component={TeacherDashboardScreen}
          />

          <Stack.Screen
            name="AvailableDoubts"
            component={AvailableDoubtsScreen}
          />

          <Stack.Screen
            name="TeacherDoubtDetail"
            component={TeacherDoubtDetailScreen}
          />

          <Stack.Screen
            name="TeacherProfile"
            component={TeacherProfileScreen}
          />

          {/* ───────────────────────────────── */}
          {/* TEACHER ANSWER FLOW */}
          {/* ───────────────────────────────── */}

          <Stack.Screen
            name="AnswerDoubtTextScreen"
            component={AnswerDoubtTextScreen}
          />

          <Stack.Screen
            name="AnswerDoubtVoiceScreen"
            component={AnswerDoubtVoiceScreen}
          />

          <Stack.Screen
            name="AnswerDoubtVideoScreen"
            component={AnswerDoubtVideoScreen}
          />

          <Stack.Screen
            name="AnswerSuccessScreen"
            component={AnswerSuccessScreen}
          />

          {/* ───────────────────────────────── */}
          {/* TEACHER EARNINGS */}
          {/* ───────────────────────────────── */}

          <Stack.Screen
            name="EarningsOverview"
            component={EarningsOverviewScreen}
          />

          <Stack.Screen
            name="WithdrawScreen"
            component={WithdrawEarningsScreen}
          />

          <Stack.Screen
            name="WithdrawSuccessScreen"
            component={WithdrawSuccessScreen}
          />

          {/* ───────────────────────────────── */}
          {/* TEACHER VIDEO MODULE */}
          {/* ───────────────────────────────── */}

          <Stack.Screen
            name="UploadedVideosScreen"
            component={UploadedVideosScreen}
          />

          <Stack.Screen
            name="UploadVideoScreen"
            component={UploadVideoScreen}
          />

          <Stack.Screen
            name="UploadVideoPlayerScreen"
            component={UploadVideoPlayerScreen}
          />

          <Stack.Screen
            name="TeacherCommentsScreen"
            component={TeacherCommentsScreen}
          />

          <Stack.Screen
            name="TeacherAnalyticsScreen"
            component={TeacherAnalyticsScreen}
          />

          <Stack.Screen
            name="EditVideoScreen"
            component={EditVideoScreen}
          />

         <Stack.Screen
        name="StudentTutorsScreen"
        component={StudentTutorsScreen}
        options={{ headerShown: false }}
         />

        <Stack.Screen
        name="TeacherTuitionRequests"
        component={TeacherTuitionRequestsCombined}
      />

      
        <Stack.Screen
        name="TeacherSchedule"
        component={TeacherScheduleScreen}
      />

       <Stack.Screen
        name="SessionMeet"
        component={SessionMeetScreen}
      />

       <Stack.Screen
        name="LiveSession"
        component={LiveSessionScreen}
      />

      <Stack.Screen
        name="TeacherHelpSupport"
        component={TeacherHelpSupportScreen}
      />

      <Stack.Screen
          name="TeacherSettings"
          component={TeacherSettingsScreen}
        />

        <Stack.Screen
        name="TeacherNotifications"
        component={TeacherNotificationScreen}
      />

      <Stack.Screen
        name="AdminLogin"
        component={AdminLoginScreen}
      />

      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
      />

      <Stack.Screen
        name="AdminSubscriptionPayments"
        component={AdminSubscriptionPaymentsScreen}
      />

      <Stack.Screen
        name="AdminTeacherEarnings"
        component={AdminTeacherEarningsScreen}
      />

     <Stack.Screen
        name="AdminTeacherPayouts"
        component={AdminTeacherPayoutsScreen}
      />

      <Stack.Screen
        name="AdminTeacherPayment"
        component={AdminTeacherPaymentScreen}
      />

      <Stack.Screen
        name="AdminMore"
        component={AdminMoreScreen}
      />

      <Stack.Screen
        name="AdminNotifications"
        component={AdminNotificationsScreen}
      />

      <Stack.Screen
        name="TeacherRequestScreen"
        component={TeacherRequestScreen}
      />

      <Stack.Screen
        name="TeacherDetailsScreen"
        component={TeacherDetailsScreen}
      />

      <Stack.Screen
        name="AcceptedTeachersScreen"
        component={AcceptedTeachersScreen}
      />

      <Stack.Screen
        name="AcceptedTeacherManageScreen"
        component={AcceptedTeacherManageScreen}
      />

            </Stack.Navigator>
          </NavigationContainer>

          {isAIChatEnabled ? (
            <FloatingAIButton onPress={() => setAiChatVisible(true)} />
          ) : null}

          <AIChatModal
            visible={aiChatVisible}
            onClose={() => setAiChatVisible(false)}
          />
        </View>
      </AppAlertProvider>
    </AppProvider>
  );
}


































