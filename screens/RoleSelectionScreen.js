




// screens/RoleSelectionScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#006D6A",
  primaryDark: "#00514F",
  white: "#FFFFFF",
  text: "#07123A",
  muted: "#6B7890",
  border: "#E6ECEC",
  light: "#F7FFFF",
  selected: "#E8FFFD",
};

export default function RoleSelectionScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState("Teacher");

  const roles = [
    {
      id: "Student",
      title: "Student",
      subtitle: "Learn & grow",
      icon: <Ionicons name="school" size={22} color="#F4A300" />,
    },
    {
      id: "Teacher",
      title: "Teacher",
      subtitle: "Teach & earn",
      icon: (
        <FontAwesome5
          name="chalkboard-teacher"
          size={19}
          color="#F4A300"
        />
      ),
    },
    {
      id: "Admin",
      title: "Admin",
      subtitle: "Manage & monitor",
      icon: (
        <MaterialIcons
          name="admin-panel-settings"
          size={22}
          color="#F4A300"
        />
      ),
    },
  ];

  const handleContinue = () => {
    if (selectedRole === "Student") {
      navigation.navigate("StudentLogin");
    } else if (selectedRole === "Teacher") {
      navigation.navigate("TeacherLogin");
    } else {
      navigation.navigate("AdminLogin");
    }
  };

  const handleRolePress = (roleId) => {
    setSelectedRole(roleId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.content}>
        <Text style={styles.heading}>Choose Your Role</Text>

        <Text style={styles.subHeading}>
          Select how you'd like to use the app
        </Text>

        <View style={styles.rolesContainer}>
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;

            return (
              <TouchableOpacity
                key={role.id}
                activeOpacity={0.85}
                onPress={() => handleRolePress(role.id)}
                style={[styles.roleCard, isSelected && styles.selectedCard]}
              >
                <View style={styles.leftSection}>
                  <View
                    style={[
                      styles.iconContainer,
                      isSelected && styles.selectedIconContainer,
                    ]}
                  >
                    {role.icon}
                  </View>

                  <View>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                  </View>
                </View>

                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={15} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 30 : 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    marginTop: 20,
  },

  subHeading: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 22,
  },

  rolesContainer: {
    marginTop: 40,
    gap: 18,
  },

  roleCard: {
    width: "100%",
    minHeight: 90,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.selected,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FFF7E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  selectedIconContainer: {
    backgroundColor: "#FFF2CC",
  },

  roleTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },

  roleSubtitle: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
  },

  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  continueButton: {
    marginTop: 42,
    width: "100%",
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  continueText: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});
