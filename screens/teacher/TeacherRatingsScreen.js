// ======================================================
// TeacherRatingsScreen.js
// FULLY UPDATED
// PROFESSIONAL UI
// EXACT LIKE IMAGE
// NO MISSING
// ======================================================

import React from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#008F7A",
  bg: "#F5F7FB",
  white: "#FFFFFF",
  text: "#07123A",
  muted: "#7A879D",
  border: "#E8ECF4",
  star: "#FFB800",
  green: "#16A34A",
};

export default function TeacherRatingsScreen({
  navigation,
}) {
  const reviews = [
    {
      id: "1",
      name: "Ananya Verma",
      time: "2 weeks ago",
      rating: 5,
      review:
        "Excellent explanation! Very clear and helpful.",
    },

    {
      id: "2",
      name: "Rohit Kumar",
      time: "2 weeks ago",
      rating: 4,
      review:
        "Good video. Please make more videos like this.",
    },

    {
      id: "3",
      name: "Kavya Singh",
      time: "3 weeks ago",
      rating: 5,
      review:
        "This is the best lecture on integers I have ever seen!",
    },

    {
      id: "4",
      name: "Arjun Patel",
      time: "3 weeks ago",
      rating: 4,
      review:
        "Amazing teaching skills sir!",
    },
  ];

  const renderStars = rating => {
    return (
      <View
        style={{
          flexDirection: "row",
          marginTop: 10,
        }}
      >
        {[1, 2, 3, 4, 5].map(
          star => (
            <Ionicons
              key={star}
              name={
                star <= rating
                  ? "star"
                  : "star-outline"
              }
              size={22}
              color={COLORS.star}
              style={{
                marginRight: 4,
              }}
            />
          )
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
      />

      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <Text style={styles.heading}>
          Video Ratings
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* RATINGS OVERVIEW */}

        <View style={styles.ratingBox}>
          {/* LEFT */}

          <View
            style={
              styles.leftRating
            }
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={
                  styles.ratingNo
                }
              >
                4.8
              </Text>

              <Ionicons
                name="star"
                size={40}
                color={COLORS.star}
                style={{
                  marginLeft: 6,
                }}
              />
            </View>

            <Text
              style={
                styles.averageText
              }
            >
              Average Rating
            </Text>

            <Text
              style={
                styles.reviewCount
              }
            >
              Based on 1,245 reviews
            </Text>
          </View>

          {/* RIGHT */}

          <View
            style={
              styles.progressSection
            }
          >
            {[
              {
                star: 5,
                count: 912,
                width: "92%",
              },

              {
                star: 4,
                count: 231,
                width: "45%",
              },

              {
                star: 3,
                count: 68,
                width: "18%",
              },

              {
                star: 2,
                count: 21,
                width: "8%",
              },

              {
                star: 1,
                count: 13,
                width: "5%",
              },
            ].map(item => (
              <View
                key={item.star}
                style={
                  styles.progressRow
                }
              >
                <Text
                  style={
                    styles.starText
                  }
                >
                  {item.star} ★
                </Text>

                <View
                  style={
                    styles.progressBar
                  }
                >
                  <View
                    style={[
                      styles.progressFill,

                      {
                        width:
                          item.width,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={
                    styles.countText
                  }
                >
                  {item.count}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* STUDENT REVIEWS */}

        <Text
          style={styles.sectionTitle}
        >
          Student Reviews
        </Text>

        {reviews.map(item => (
          <View
            key={item.id}
            style={styles.reviewCard}
          >
            {/* TOP */}

            <View
              style={styles.topRow}
            >
              <View
                style={
                  styles.profileRow
                }
              >
                <View
                  style={
                    styles.avatar
                  }
                >
                  <Ionicons
                    name="person"
                    size={22}
                    color="#FFFFFF"
                  />
                </View>

                <View
                  style={{
                    marginLeft: 12,
                  }}
                >
                  <Text
                    style={
                      styles.userName
                    }
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.time
                    }
                  >
                    {item.time}
                  </Text>
                </View>
              </View>

              <TouchableOpacity>
                <Ionicons
                  name="ellipsis-vertical"
                  size={18}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </View>

            {/* STARS */}

            {renderStars(item.rating)}

            {/* REVIEW */}

            <Text
              style={
                styles.reviewText
              }
            >
              {item.review}
            </Text>
          </View>
        ))}

        {/* BUTTON */}

        <TouchableOpacity
          style={styles.reviewBtn}
        >
          <Text
            style={
              styles.reviewBtnText
            }
          >
            View All Reviews
          </Text>
        </TouchableOpacity>

        <View
          style={{ height: 50 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
  },

  header: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },

  ratingBox: {
    marginTop: 26,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 22,
  },

  leftRating: {
    alignItems: "flex-start",
  },

  ratingNo: {
    fontSize: 70,
    fontWeight: "900",
    color: COLORS.text,
  },

  averageText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  reviewCount: {
    marginTop: 10,
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 14,
  },

  progressSection: {
    marginTop: 26,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  starText: {
    width: 40,
    fontWeight: "800",
    color: COLORS.text,
  },

  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#EEF2F7",
    borderRadius: 20,
    marginHorizontal: 12,
  },

  progressFill: {
    height: 8,
    borderRadius: 20,
    backgroundColor:
      COLORS.green,
  },

  countText: {
    width: 36,
    textAlign: "right",
    color: COLORS.text,
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: 30,
    marginBottom: 18,
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },

  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },

  topRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
  },

  profileRow: {
    flexDirection: "row",
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor:
      COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  userName: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },

  time: {
    marginTop: 4,
    color: COLORS.muted,
    fontWeight: "600",
  },

  reviewText: {
    marginTop: 14,
    fontSize: 19,
    lineHeight: 30,
    color: COLORS.text,
  },

  reviewBtn: {
    height: 62,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#FFFFFF",
  },

  reviewBtnText: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 18,
  },
});