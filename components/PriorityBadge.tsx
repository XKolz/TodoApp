import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Define the valid priority values
export type Priority = "low" | "medium" | "high";

// Define the colors object with proper typing
export const priorityColors: Record<Priority, string> = {
  low: "#4CAF50",
  medium: "#FFC107",
  high: "#F44336",
};

// Define the props interface for the component
interface PriorityBadgeProps {
  priority: Priority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => (
  <View style={[styles.badge, { backgroundColor: priorityColors[priority] }]}>
    <Text style={styles.badgeText}>{priority.toUpperCase()}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
